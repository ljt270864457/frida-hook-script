// frida -Uf com.android.thememanager -l hook_uc.js
// frida -Uf com.android.browser -l hook_uc.js
// frida -Uf com.miui.video -l hook_uc.js
// frida -Uf com.UCMobile -l hook_uc.js
// frida -Uf com.youku.phone -l hook_uc.js
function showStacks() {
    console.log(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new()));
}

function printObjectFields(obj, obj_name) {
    try {
        const objClass = obj.getClass();
        const className = objClass.toString();
        console.log(`\n[*] 对象名称：${obj_name}. 对象类型: ${className}`);

        // 获取所有字段（包括私有字段）
        const fields = objClass.getDeclaredFields();


        // 遍历并打印每个字段的值
        console.log(`=====开始通过反射获取${obj_name}对象的所有属性======`);
        fields.forEach(function (field) {

            console.log(`[+] 对象名称：${obj_name}.字段名称: ${field.getName()}`);
            try {
                // 设置可访问私有字段
                field.setAccessible(true);

                // 获取字段名称和类型
                const fieldName = field.getName();
                const fieldType = field.getType().toString();

                // 获取字段值
                let fieldValue;
                if (fieldType.includes("java.lang.String")) {
                    fieldValue = field.get(obj);
                } else if (fieldType.includes("int") || fieldType.includes("Integer")) {
                    fieldValue = field.getInt(obj);
                } else if (fieldType.includes("long") || fieldType.includes("Long")) {
                    fieldValue = field.getLong(obj);
                } else if (fieldType.includes("boolean") || fieldType.includes("Boolean")) {
                    fieldValue = field.getBoolean(obj);
                } else if (isObject(fieldValue)) {
                    console.log(`${indent}  [+] ${fieldName} (${fieldType}):`);
                    printObjectFields(fieldValue, indent + "    ");
                } else {
                    // 其他类型尝试转换为字符串
                    fieldValue = field.get(obj) + "";
                }

                console.log(`  [+] ${fieldName} (${fieldType}): ${fieldValue}`);
            } catch (e) {
                console.error(`[-] 对象名称：${obj_name}.获取字段 ${field.getName()} 失败: ${e}`);
            }
        });

    } catch (e) {
        console.error(`[-] 对象名称：${obj_name}.打印对象字段失败: ${e}`);
    }
}



function myHook() {
    Java.perform(function () {

        let searchingKey = "iflow/api/v2/channel";
        let URLClz = Java.use('java.net.URL');
        let urlConstruct = URLClz.$init.overload("java.lang.String");
        urlConstruct.implementation = function (url) {
            let result = urlConstruct.call(this, url);
            if (url.includes(searchingKey)) {
                console.log("URL Hooking. url: " + url);
                showStacks();
            }
            return result;
        };


        let WebView = Java.use("android.webkit.WebView");

        WebView.loadUrl.overload('java.lang.String').implementation = function (url) {
            if (url.includes(searchingKey)) {
                console.log("WebView loading URL -> " + url);
            }
            this.loadUrl(url);
        }


        // let searchingKey = "100020358";

        // Hooking JsonObject put method
        // Java.use("org.json.JSONObject").put.overload("java.lang.String", "java.lang.Object").implementation = function (key, value) {
        //     try {
        //         if (value.toString().toLowerCase().includes(searchingKey)) {
        //             console.log("JSONObject.put Hooking. key: " + key + ", value: " + value);
        //             showStacks();
        //         }
        //     }
        //     catch (e) {
        //         // console.log("JSONObject.put Hooking. key: " + key + ", value: " + value);
        //         // showStacks();
        //     }
        //
        //     return this.put(key, value);
        // }


        function byteArrayToHexString(byteArray) {
            // byte数组转16进制字符串
            const codeMap = {
                0: '0',
                1: '1',
                2: '2',
                3: '3',
                4: '4',
                5: '5',
                6: '6',
                7: '7',
                8: '8',
                9: '9',
                10: 'a',
                11: 'b',
                12: 'c',
                13: 'd',
                14: 'e',
                15: 'f'
            };
            let hexString = '';
            for (let i = 0; i < byteArray.length; i++) {
                let code = byteArray[i] & 0xff;
                let hexCode = codeMap[code >> 4] + codeMap[code & 0xf];
                hexString += hexCode;
            }
            return hexString;
        }

        // 本例子代表生成100000-999999的随机数
        function GetRandomNum(Min, Max) {
            let Range = Max - Min;
            let Rand = Math.random();
            return (Min + Math.round(Rand * Range));
        }


    })

}

function antiSSL() {
    Java.perform(function () {
        var StringCls = Java.use("java.lang.String")
        var base64Cls = Java.use("android.util.Base64");
        // base64Cls.encode.overload('[B', 'int', 'int', 'int').implementation = function(bArr, i, i2, i3) {
        //     var ret = base64Cls.encode(bArr, i, i2, i3);
        //     var str = StringCls.$new(ret);
        //     if (str.indexOf("ABP") >= 0) {
        //         console.log("base64: " + str);
        //         showStacks();
        //     }
        //     return ret;
        // }

        // let zzcci = Java.use("com.google.android.gms.internal.ads.zzcci");
        // zzcci["zzc"].implementation = function (str, str2, bundle) {
        //     console.log('zzc is called' + ', ' + 'str: ' + str + ', ' + 'str2: ' + str2 + ', ' + 'bundle: ' + bundle);
        //     this.zzc(str, str2, bundle);
        // 	showStacks();
        // };

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
    });
}


setImmediate(antiSSL);
// // 必须等一会再进行hook，否则有些类还没有加载
setTimeout(myHook, 5 * 1000);