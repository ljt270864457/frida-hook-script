// protobuf工具类
function jbytesToJsArray(jbytes) {
    var jsArray = [];
    for (var i = 0; i < jbytes.length; i++) {
        var b = jbytes[i];
        if (b < 0) b += 256; // 转成无符号
        jsArray.push(b);
    }
    return jsArray;
}

function decodeVarint(bytes, pos) {
    var result = 0;
    var shift = 0;
    while (true) {
        var b = bytes[pos++];
        result |= (b & 0x7f) << shift;
        if ((b & 0x80) === 0) break;
        shift += 7;
    }
    return [result, pos];
}

function decodeField(bytes, pos) {
    var [key, p] = decodeVarint(bytes, pos);
    var fieldNum = key >>> 3;
    var wireType = key & 0x07;

    var val, newPos = p;
    switch (wireType) {
        case 0: // varint
            [val, newPos] = decodeVarint(bytes, p);
            break;
        case 1: // 64-bit
            val = 0;
            for (var i = 0; i < 8; i++) {
                val |= (bytes[p + i] & 0xff) << (8 * i);
            }
            newPos = p + 8;
            break;
        case 2: // length-delimited
            var [len, p2] = decodeVarint(bytes, p);
            var subBytes = bytes.slice(p2, p2 + len);
            try {
                // 尝试作为嵌套 message decode
                val = decodeMessage(subBytes);
            } catch (e) {
                // 如果不是嵌套 message → 尝试解码为字符串
                var rawStr = String.fromCharCode.apply(null, subBytes);
                // 判断是否可打印
                var printable = /^[\x20-\x7E]*$/.test(rawStr);
                if (printable) {
                    val = rawStr; // 直接保留原始字符串，不再转义
                } else {
                    // 输出 hex
                    val = Array.from(subBytes)
                        .map(x => ("0" + (x & 0xff).toString(16)).slice(-2))
                        .join("");
                }
            }
            newPos = p2 + len;
            break;
        case 5: // 32-bit
            val = 0;
            for (var i = 0; i < 4; i++) {
                val |= (bytes[p + i] & 0xff) << (8 * i);
            }
            newPos = p + 4;
            break;
        default:
            throw "Unsupported wireType " + wireType;
    }

    return [fieldNum, val, newPos];
}

function decodeMessage(jbytes) {
    let bytes = jbytesToJsArray(jbytes);
    var obj = {};
    var pos = 0;
    while (pos < bytes.length) {
        var [fieldNum, val, newPos] = decodeField(bytes, pos);
        if (obj[fieldNum]) {
            if (!Array.isArray(obj[fieldNum])) obj[fieldNum] = [obj[fieldNum]];
            obj[fieldNum].push(val);
        } else {
            obj[fieldNum] = val;
        }
        pos = newPos;
    }
    return obj;
}


(function () {
    // === 全局缓存，用于对象引用 ===
    var savedObjects = {};
    var savedCounter = 1;

    function saveObject(obj) {
        let id = savedCounter++;
        savedObjects[id] = obj;
        return id;
    }

    function prettyPrintValue(value) {
        if (value === null) return "null";

        try {
            let clazzName = value.$className || value.getClass().getName();

            // byte[]
            if (clazzName.startsWith('[B')) {
                return `${byteArrayToUtf8(value)}`;
            }

            // 数组
            if (clazzName.startsWith("[")) {
                let javaArray = Java.array('java.lang.Object', value);
                let arrVals = [];
                for (let i = 0; i < javaArray.length; i++) {
                    arrVals.push(prettyPrintValue(javaArray[i]));
                }
                return "[" + arrVals.join(", ") + "]";
            }

            // List
            if (Java.use("java.util.List").class.isInstance(value)) {
                let listSize = value.size();
                let listVals = [];
                for (let i = 0; i < listSize; i++) {
                    listVals.push(prettyPrintValue(value.get(i)));
                }
                return "List(size=" + listSize + "): " + listVals.join(", ");
            }

            // Map
            if (Java.use("java.util.Map").class.isInstance(value)) {
                let entrySet = value.entrySet().toArray();
                let mapVals = [];
                for (let i in entrySet) {
                    let k = prettyPrintValue(entrySet[i].getKey());
                    let v = prettyPrintValue(entrySet[i].getValue());
                    mapVals.push(k + " => " + v);
                }
                return "Map(size=" + mapVals.length + "): {" + mapVals.join(", ") + "}";
            }

            // 普通 Java 对象
            let id = saveObject(value);
            return `${clazzName}@${id}(${value.toString()})`;

        } catch (e) {
            return "[Error prettyPrintValue: " + e + "]";
        }
    }

    function dumpClass(clazz) {
        try {
            console.log(`class ${clazz.getSimpleName()} {\n`);

            // 静态字段
            console.log("    /* static fields */");
            let fields = clazz.getDeclaredFields();
            fields = Array.from(fields).sort((a, b) => a.getName().localeCompare(b.getName()));
            for (let f of fields) {
                if ((f.getModifiers() & 8) !== 0) { // static
                    f.setAccessible(true);
                    let val = null;
                    try {
                        val = f.get(null);
                    } catch (e) {
                        val = "[unreadable]";
                    }
                    console.log(`    static ${f.getType().getName()} ${f.getName()}; => ${prettyPrintValue(val)}`);
                }
            }
            console.log("");

            // 实例字段
            console.log("    /* instance fields */");
            for (let f of fields) {
                if ((f.getModifiers() & 8) === 0) {
                    console.log(`    ${f.getType().getName()} ${f.getName()};`);
                }
            }
            console.log("");

            // 构造函数
            console.log("    /* constructor methods */");
            let ctors = clazz.getDeclaredConstructors();
            ctors = Array.from(ctors).sort((a, b) => a.toString().localeCompare(b.toString()));
            for (let c of ctors) {
                console.log(`    ${clazz.getSimpleName()}(${c.getParameterTypes().map(p => p.getName()).join(", ")})`);
            }
            console.log("");

            // 静态方法
            console.log("    /* static methods */");
            let methods = clazz.getDeclaredMethods();
            methods = Array.from(methods).sort((a, b) => a.getName().localeCompare(b.getName()));
            for (let m of methods) {
                if ((m.getModifiers() & 8) !== 0) {
                    console.log(`    static ${m.getReturnType().getName()} ${m.getName()}(${m.getParameterTypes().map(p => p.getName()).join(", ")})`);
                }
            }
            console.log("");

            // 实例方法
            console.log("    /* instance methods */");
            for (let m of methods) {
                if ((m.getModifiers() & 8) === 0) {
                    console.log(`    ${m.getReturnType().getName()} ${m.getName()}(${m.getParameterTypes().map(p => p.getName()).join(", ")})`);
                }
            }

            console.log("\n}");
        } catch (e) {
            console.log("dumpClass error:", e);
        }
    }

    function dumpObject(obj) {
        try {
            let clazz = obj.getClass();
            console.log(`class ${clazz.getSimpleName()} (instance dump) {\n`);

            // 静态字段
            console.log("    /* static fields */");
            let fields = clazz.getDeclaredFields();
            fields = Array.from(fields).sort((a, b) => a.getName().localeCompare(b.getName()));
            for (let f of fields) {
                if ((f.getModifiers() & 8) !== 0) { // static
                    f.setAccessible(true);
                    let val = null;
                    try {
                        val = f.get(null);
                    } catch (e) {
                        val = "[unreadable]";
                    }
                    console.log(`    static ${f.getType().getName()} ${f.getName()}; => ${prettyPrintValue(val)}`);
                }
            }
            console.log("");

            // 实例字段
            console.log("    /* instance fields */");
            for (let f of fields) {
                if ((f.getModifiers() & 8) === 0) {
                    f.setAccessible(true);
                    let val = null;
                    try {
                        val = f.get(obj);
                    } catch (e) {
                        val = "[unreadable]";
                    }
                    console.log(`    ${f.getType().getName()} ${f.getName()} => ${prettyPrintValue(val)}`);
                }
            }
            console.log("");

            // 构造函数
            console.log("    /* constructor methods */");
            let ctors = clazz.getDeclaredConstructors();
            ctors = Array.from(ctors).sort((a, b) => a.toString().localeCompare(b.toString()));
            for (let c of ctors) {
                console.log(`    ${clazz.getSimpleName()}(${c.getParameterTypes().map(p => p.getName()).join(", ")})`);
            }
            console.log("");

            // 静态方法
            console.log("    /* static methods */");
            let methods = clazz.getDeclaredMethods();
            methods = Array.from(methods).sort((a, b) => a.getName().localeCompare(b.getName()));
            for (let m of methods) {
                if ((m.getModifiers() & 8) !== 0) {
                    console.log(`    static ${m.getReturnType().getName()} ${m.getName()}(${m.getParameterTypes().map(p => p.getName()).join(", ")})`);
                }
            }
            console.log("");

            // 实例方法
            console.log("    /* instance methods */");
            for (let m of methods) {
                if ((m.getModifiers() & 8) === 0) {
                    console.log(`    ${m.getReturnType().getName()} ${m.getName()}(${m.getParameterTypes().map(p => p.getName()).join(", ")})`);
                }
            }

            console.log("\n}");
        } catch (e) {
            console.log("dumpObject error:", e);
        }
    }

    function dumpAny(target) {
        try {
            if (typeof target === "string") {
                // 类名
                let clazz = Java.use(target).class;
                dumpClass(clazz);
            } else if (target.$className || (target.getClass && target.getClass())) {
                // 实例
                dumpObject(target);
            } else {
                console.log("Unsupported target:", target);
            }
        } catch (e) {
            console.log("dumpAny error:", e);
        }
    }

    // 通过反射拿到字段的值
    function getFieldValueByReflection(obj, fieldName) {
        let cls = obj.getClass();
        let field = cls.getDeclaredField(fieldName);
        field.setAccessible(true);
        return field.get(obj);
    }

    //假设你已经有一个 ByteBuffer 实例 byteBuffer
    function bufferToByteArray(byteBuffer) {
        var length = byteBuffer.remaining();
        var byteArray = Java.array('byte', Array(length).fill(0));

        // 复制数据
        var duplicate = byteBuffer.duplicate(); // 避免影响原 position
        duplicate.get(byteArray);
        return byteArray;
    }

    // 导出到全局
    global.InspectJavaUtils = {
        dumpAny: dumpAny,
        // dumpClass: dumpClass,
        // dumpObject: dumpObject,
        prettyPrintValue: prettyPrintValue,
        getFieldValueByReflection: getFieldValueByReflection,
        bufferToByteArray: bufferToByteArray,
        savedObjects: savedObjects
    };

    global.CommonUtils = {
        /**
         * 打印当前调用栈
         */
        showStacks: function () {
            console.log(
                Java.use("android.util.Log")
                    .getStackTraceString(
                        Java.use("java.lang.Throwable").$new()
                    )
            );
        },

        /**
         * 字节数组转Base64字符串
         * @param {byte[]} byteArray - 字节数组
         * @returns {string} - Base64编码字符串
         */
        byteArrayToBase64: function (byteArray) {
            return Java.use("android.util.Base64").encodeToString(byteArray, 0);
        },

        /**
         * 字节数组转UTF-8字符串
         * @param {byte[]} byteArray - 字节数组
         * @returns {string} - UTF-8字符串
         */
        byteArrayToUtf8: function (byteArray) {
            try {
                return Java.use("java.lang.String").$new(byteArray).toString();
            } catch (e) {
                return "[无法转换为UTF-8字符串]";
            }
        },

        /**
         * 字节数组转16进制字符串
         * @param {byte[]} byteArray - 字节数组
         * @returns {string} - 16进制字符串
         */
        byteArrayToHexString: function (byteArray) {
            const HEX_CHARS = '0123456789abcdef';
            let hexString = '';

            for (let i = 0; i < byteArray.length; i++) {
                const code = byteArray[i] & 0xff;
                hexString += HEX_CHARS.charAt(code >> 4) + HEX_CHARS.charAt(code & 0xf);
            }

            return hexString;
        },

        /**
         * 字节数组转16进制字符串
         * @param {byte[]} byteArray - 字节数组
         * @returns {string} - hexdump
         */
        byteArrayToHexdump: function (byteArray) {
            if (!byteArray) return "";

            var out = "";
            var length = byteArray.length;
            for (var i = 0; i < length; i += 16) {
                // 偏移量
                var offset = ("00000000" + i.toString(16)).slice(-8);
                out += offset + "  ";

                // hex 部分
                var hexPart = "";
                var asciiPart = "";
                for (var j = 0; j < 16; j++) {
                    if (i + j < length) {
                        var b = byteArray[i + j];
                        if (b < 0) b += 256; // Java byte 转无符号
                        var hex = ("0" + b.toString(16)).slice(-2);
                        hexPart += hex + " ";
                        // ASCII
                        if (b >= 0x20 && b <= 0x7e) {
                            asciiPart += String.fromCharCode(b);
                        } else {
                            asciiPart += ".";
                        }
                    } else {
                        hexPart += "   "; // 补齐对齐
                        asciiPart += " ";
                    }
                    if (j === 7) hexPart += " "; // 中间再空一格
                }
                out += hexPart + " |" + asciiPart + "|\n";
            }
            return out;
        }

    };

    global.ProtobufUtils = {
        decodeMessage: decodeMessage
    }
})();

// hookSSL 自动启用反抓包
(function () {
    Java.perform(function () {
        /*
        hook list:
        1.SSLcontext
        2.okhttp
        3.webview
        4.XUtils
        5.httpclientandroidlib
        6.JSSE
        7.network\_security\_config (android 7.0+)
        8.Apache Http client (support partly)
        9.OpenSSLSocketImpl
        10.TrustKit
        11.Cronet
        */

        // Attempts to bypass SSL pinning implementations in a number of
        // ways. These include implementing a new TrustManager that will
        // accept any SSL certificate, overriding OkHTTP v3 check()
        // method etc.
        var X509TrustManager = Java.use('javax.net.ssl.X509TrustManager');
        var HostnameVerifier = Java.use('javax.net.ssl.HostnameVerifier');
        var SSLContext = Java.use('javax.net.ssl.SSLContext');
        var quiet_output = false;

        // // Helper method to honor the quiet flag.

        function quiet_send(data) {

            if (quiet_output) {

                return;
            }

            send(data)
        }

        var X509Certificate = Java.use("java.security.cert.X509Certificate");
        var TrustManager;
        try {
            TrustManager = Java.registerClass({
                name: 'org.wooyun.TrustManager',
                implements: [X509TrustManager],
                methods: {
                    checkClientTrusted: function (chain, authType) {
                    },
                    checkServerTrusted: function (chain, authType) {
                    },
                    getAcceptedIssuers: function () {
                        // var certs = [X509Certificate.$new()];
                        // return certs;
                        return [];
                    }
                }
            });
        } catch (e) {
            quiet_send("registerClass from X509TrustManager >>>>>>>> " + e.message);
        }

        // Prepare the TrustManagers array to pass to SSLContext.init()

        var TrustManagers = [TrustManager.$new()];
        try {
            // Prepare a Empty SSLFactory
            var TLS_SSLContext = SSLContext.getInstance("TLS");
            TLS_SSLContext.init(null, TrustManagers, null);
            var EmptySSLFactory = TLS_SSLContext.getSocketFactory();
        } catch (e) {
            quiet_send(e.message);
        }

        // send('Custom, Empty TrustManager ready');

        // Get a handle on the init() on the SSLContext class
        var SSLContext_init = SSLContext.init.overload(
            '[Ljavax.net.ssl.KeyManager;', '[Ljavax.net.ssl.TrustManager;', 'java.security.SecureRandom');

        // Override the init method, specifying our new TrustManager
        SSLContext_init.implementation = function (keyManager, trustManager, secureRandom) {

            quiet_send('Overriding SSLContext.init() with the custom TrustManager');

            SSLContext_init.call(this, null, TrustManagers, null);
        };

        /*** okhttp3.x unpinning ***/


        // Wrap the logic in a try/catch as not all applications will have
        // okhttp as part of the app.
        try {

            var CertificatePinner = Java.use('okhttp3.CertificatePinner');

            quiet_send('OkHTTP 3.x Found');

            CertificatePinner.check.overload('java.lang.String', 'java.util.List').implementation = function () {

                quiet_send('OkHTTP 3.x check() called. Not throwing an exception.');
            }

        } catch (err) {

            // If we dont have a ClassNotFoundException exception, raise the
            // problem encountered.
            if (err.message.indexOf('ClassNotFoundException') === 0) {

                throw new Error(err);
            }
        }

        // Appcelerator Titanium PinningTrustManager

        // Wrap the logic in a try/catch as not all applications will have
        // appcelerator as part of the app.
        try {

            var PinningTrustManager = Java.use('appcelerator.https.PinningTrustManager');

            send('Appcelerator Titanium Found');

            PinningTrustManager.checkServerTrusted.implementation = function () {

                quiet_send('Appcelerator checkServerTrusted() called. Not throwing an exception.');
            }

        } catch (err) {

            // If we dont have a ClassNotFoundException exception, raise the
            // problem encountered.
            if (err.message.indexOf('ClassNotFoundException') === 0) {

                throw new Error(err);
            }
        }

        /*** okhttp unpinning ***/
        try {
            var OkHttpClient = Java.use("com.squareup.okhttp.OkHttpClient");
            OkHttpClient.setCertificatePinner.implementation = function (certificatePinner) {
                // do nothing
                quiet_send("OkHttpClient.setCertificatePinner Called!");
                return this;
            };

            // Invalidate the certificate pinnet checks (if "setCertificatePinner" was called before the previous invalidation)
            var CertificatePinner = Java.use("com.squareup.okhttp.CertificatePinner");
            CertificatePinner.check.overload('java.lang.String', '[Ljava.security.cert.Certificate;').implementation = function (p0, p1) {
                // do nothing
                quiet_send("okhttp Called! [Certificate]");
                return;
            };
            CertificatePinner.check.overload('java.lang.String', 'java.util.List').implementation = function (p0, p1) {
                // do nothing
                quiet_send("okhttp Called! [List]");
                return;
            };
        } catch (e) {
            // quiet_send("com.squareup.okhttp not found");
        }

        /*** WebView Hooks ***/

        /* frameworks/base/core/java/android/webkit/WebViewClient.java */
        /* public void onReceivedSslError(Webview, SslErrorHandler, SslError) */
        var WebViewClient = Java.use("android.webkit.WebViewClient");

        WebViewClient.onReceivedSslError.implementation = function (webView, sslErrorHandler, sslError) {
            quiet_send("WebViewClient onReceivedSslError invoke");
            //执行proceed方法
            sslErrorHandler.proceed();
            return;
        };

        WebViewClient.onReceivedError.overload('android.webkit.WebView', 'int', 'java.lang.String', 'java.lang.String').implementation = function (a, b, c, d) {
            quiet_send("WebViewClient onReceivedError invoked");
            return;
        };

        WebViewClient.onReceivedError.overload('android.webkit.WebView', 'android.webkit.WebResourceRequest', 'android.webkit.WebResourceError').implementation = function () {
            quiet_send("WebViewClient onReceivedError invoked");
            return;
        };

        // 	/*** JSSE Hooks ***/

        // 	/* libcore/luni/src/main/java/javax/net/ssl/TrustManagerFactory.java */
        // 	/* public final TrustManager[] getTrustManager() */
        // 	/* TrustManagerFactory.getTrustManagers maybe cause X509TrustManagerExtensions error  */
        var TrustManagerFactory = Java.use("javax.net.ssl.TrustManagerFactory");
        TrustManagerFactory.getTrustManagers.implementation = function () {
            quiet_send("TrustManagerFactory getTrustManagers invoked");
            // todo: 信任证书
            var ret = this.getTrustManagers()
            quiet_send(ret)
            return ret;
            // return TrustManagers;
        }

        var HttpsURLConnection = Java.use("javax.net.ssl.HttpsURLConnection");
        /* libcore/luni/src/main/java/javax/net/ssl/HttpsURLConnection.java */
        /* public void setDefaultHostnameVerifier(HostnameVerifier) */
        HttpsURLConnection.setDefaultHostnameVerifier.implementation = function (hostnameVerifier) {
            quiet_send("HttpsURLConnection.setDefaultHostnameVerifier invoked");
            return null;
        };
        // /* libcore/luni/src/main/java/javax/net/ssl/HttpsURLConnection.java */
        // /* public void setSSLSocketFactory(SSLSocketFactory) */
        HttpsURLConnection.setSSLSocketFactory.implementation = function (SSLSocketFactory) {
            quiet_send("HttpsURLConnection.setSSLSocketFactory invoked");
            return null;
        };
        // /* libcore/luni/src/main/java/javax/net/ssl/HttpsURLConnection.java */
        // /* public void setHostnameVerifier(HostnameVerifier) */
        HttpsURLConnection.setHostnameVerifier.implementation = function (hostnameVerifier) {
            quiet_send("HttpsURLConnection.setHostnameVerifier invoked");
            return null;
        };

        // 	/*** Xutils3.x hooks ***/
        // 	//Implement a new HostnameVerifier
        var TrustHostnameVerifier;
        try {
            TrustHostnameVerifier = Java.registerClass({
                name: 'org.wooyun.TrustHostnameVerifier',
                implements: [HostnameVerifier],
                method: {
                    verify: function (hostname, session) {
                        return true;
                    }
                }
            });

        } catch (e) {
            //java.lang.ClassNotFoundException: Didn't find class "org.wooyun.TrustHostnameVerifier"
            quiet_send("registerClass from hostnameVerifier >>>>>>>> " + e.message);
        }

        try {
            var RequestParams = Java.use('org.xutils.http.RequestParams');
            RequestParams.setSslSocketFactory.implementation = function (sslSocketFactory) {
                sslSocketFactory = EmptySSLFactory;
                return null;
            }

            RequestParams.setHostnameVerifier.implementation = function (hostnameVerifier) {
                hostnameVerifier = TrustHostnameVerifier.$new();
                return null;
            }

        } catch (e) {
            // quiet_send("Xutils hooks not Found");
        }

        // 	/*** httpclientandroidlib Hooks ***/
        try {
            var AbstractVerifier = Java.use("ch.boye.httpclientandroidlib.conn.ssl.AbstractVerifier");
            AbstractVerifier.verify.overload('java.lang.String', '[Ljava.lang.String', '[Ljava.lang.String', 'boolean').implementation = function () {
                quiet_send("httpclientandroidlib Hooks");
                return null;
            }
        } catch (e) {
            // quiet_send("httpclientandroidlib Hooks not found");
        }

        // 	/***
        // android 7.0+ network_security_config TrustManagerImpl hook
        // apache httpclient partly
        // ***/
        var TrustManagerImpl = Java.use("com.android.org.conscrypt.TrustManagerImpl");
        try {
            var Arrays = Java.use("java.util.Arrays");
            //apache http client pinning maybe baypass
            //https://github.com/google/conscrypt/blob/c88f9f55a523f128f0e4dace76a34724bfa1e88c/platform/src/main/java/org/conscrypt/TrustManagerImpl.java#471
            // TrustManagerImpl.checkTrusted.implementation = function (chain, authType, session, parameters, authType) {
            //     quiet_send("TrustManagerImpl checkTrusted called");
            //     //Generics currently result in java.lang.Object
            //     return Arrays.asList(chain);
            // }

        } catch (e) {
            quiet_send("TrustManagerImpl checkTrusted nout found");
        }

        try {
            // Android 7+ TrustManagerImpl
            TrustManagerImpl.verifyChain.implementation = function (untrustedChain, trustAnchorChain, host, clientAuth, ocspData, tlsSctData) {
                quiet_send("TrustManagerImpl verifyChain called");
                // Skip all the logic and just return the chain again :P
                //https://www.nccgroup.trust/uk/about-us/newsroom-and-events/blogs/2017/november/bypassing-androids-network-security-configuration/
                // https://github.com/google/conscrypt/blob/c88f9f55a523f128f0e4dace76a34724bfa1e88c/platform/src/main/java/org/conscrypt/TrustManagerImpl.java#L650
                return untrustedChain;
            }
        } catch (e) {
            quiet_send("TrustManagerImpl verifyChain nout found below 7.0");
        }
        // OpenSSLSocketImpl
        try {
            var OpenSSLSocketImpl = Java.use('com.android.org.conscrypt.OpenSSLSocketImpl');
            OpenSSLSocketImpl.verifyCertificateChain.implementation = function (certRefs, authMethod) {
                quiet_send('OpenSSLSocketImpl.verifyCertificateChain');
            }

            quiet_send('OpenSSLSocketImpl pinning')
        } catch (err) {
            // quiet_send('OpenSSLSocketImpl pinner not found');
        }
        // Trustkit
        try {
            var Activity = Java.use("com.datatheorem.android.trustkit.pinning.OkHostnameVerifier");
            Activity.verify.overload('java.lang.String', 'javax.net.ssl.SSLSession').implementation = function (str) {
                quiet_send('Trustkit.verify1: ' + str);
                return true;
            };
            Activity.verify.overload('java.lang.String', 'java.security.cert.X509Certificate').implementation = function (str) {
                quiet_send('Trustkit.verify2: ' + str);
                return true;
            };

            quiet_send('Trustkit pinning')
        } catch (err) {
            // quiet_send('Trustkit pinner not found')
        }

        try {
            //cronet pinner hook
            //weibo don't invoke

            var netBuilder = Java.use("org.chromium.net.CronetEngine$Builder");
            netBuilder.enablePublicKeyPinningBypassForLocalTrustAnchors.implementation = function (arg) {

                //weibo not invoke
                console.log("Enables or disables public key pinning bypass for local trust anchors = " + arg);

                //true to enable the bypass, false to disable.
                var ret = netBuilder.enablePublicKeyPinningBypassForLocalTrustAnchors.call(this, true);
                return ret;
            };

            netBuilder.addPublicKeyPins.implementation = function (hostName, pinsSha256, includeSubdomains, expirationDate) {
                console.log("cronet addPublicKeyPins hostName = " + hostName);

                //var ret = netBuilder.addPublicKeyPins.call(this,hostName, pinsSha256,includeSubdomains, expirationDate);
                //this 是调用 addPublicKeyPins 前的对象吗? Yes,CronetEngine.Builder
                return this;
            };

        } catch (err) {
            // console.log('[-] Cronet pinner not found')
        }
    })
})()