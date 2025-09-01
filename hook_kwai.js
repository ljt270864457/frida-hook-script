function showStacks() {
    console.log(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new()));
}

function myHook() {
    // function Uint8ArrayToString(fileData) {    //Uint8Array转字符串
    //     var dataString = "";
    //     for (var i = 0; i < fileData.length; i++) {
    //         dataString += String.fromCharCode(fileData[i]);
    //         // console.log(dataString)
    //     }
    //     return dataString
    // }
    //
    // function byteToHexString(uint8arr) {  //byte数组转16进制字符串
    //     if (!uint8arr) {
    //         return '';
    //     }
    //     var hexStr = '';
    //     for (var i = 0; i < uint8arr.length; i++) {
    //         var hex = (uint8arr[i] & 0xff).toString(16);
    //         hex = (hex.length === 1) ? '0' + hex : hex;
    //         hexStr += hex;
    //     }
    //
    //     return hexStr.toUpperCase();
    // }

    Java.perform(function () {
        let JSONObject = Java.use("org.json.JSONObject");
        //
        // Hook put(String key, boolean value)
        JSONObject.put.overload('java.lang.String', 'boolean').implementation = function (key, value) {
            if (key === "enable_quic") {
                console.log("[Hook] JSONObject.put(key=enable_quic, boolean) -> force false");
                value = false;
                showStacks();
            }
            return this.put(key, value); // 调用原方法
        };

        // Hook put(String key, Object value)
        JSONObject.put.overload('java.lang.String', 'java.lang.Object').implementation = function (key, value) {
            if (key === "enable_quic") {
                console.log("[Hook] JSONObject.put(key=enable_quic, Object) -> force false");
                value = Java.use("java.lang.Boolean").valueOf(false); // 强制 Boolean false
                showStacks();
            }
            return this.put(key, value);
        };
        var aegon = Java.use('com.kuaishou.aegon.Aegon');
        aegon.nativeUpdateConfig.overload("java.lang.String", "java.lang.String").implementation = function (a1, a2) {
            console.log(a1);
            console.log('============');
            console.log(a2);
            // a1 = '{"enable_quic": false, "preconect_num_streams": 2, "quic_idle_timeout_sec": 180, "quic_use_bbr": true, "altsvc_broken_time_max": 600, "altsvc_broken_time_base": 60, "proxy_host_blacklist": []}'
            // a1 = '{"mtrequest_bare_ip_url_retry_times":2,"altsvc_broken_time_max":300,"enable_nqe_report":true,"preconnect_num_streams":0,"quic_idle_timeout_sec":180,"connection_stats_interval":0,"enable_http3":true,"enable_quic":true,"quic_prefer_plaintext":true,"altsvc_broken_time_base":60,"nqe_params":{"HalfLifeSeconds":"20"},"quic_hints":[["api.kwai-pro.com",80,443,"Q046"],["ulog.kwai-pro.com",80,443,"Q046"],["tx-pro-origin-pull.kwai.net",80,443,"Q046"],["ws-pro-origin-pull.kwai.net",80,443,"Q046"],["ws-pro-e2-pull.kwai.net",80,443,"Q046"],["tx-pro-pull.kwai.net",80,443,"Q046"],["ws-pro-pull.kwai.net",80,443,"Q046"]],"preconnect_urls":[],"unused_idle_socket_timeout_sec":180,"preconnect_non_altsvc":true}'
            a1 = '{"mtrequest_bare_ip_url_retry_times":2,"altsvc_broken_time_max":300,"enable_nqe_report":true,"preconnect_num_streams":0,"quic_idle_timeout_sec":180,"connection_stats_interval":0,"enable_http3":false,"enable_quic":false,"quic_prefer_plaintext":true,"altsvc_broken_time_base":60,"nqe_params":{"HalfLifeSeconds":"20"},"quic_hints":[["api.kwai-pro.com",80,443,"Q046"],["ulog.kwai-pro.com",80,443,"Q046"],["tx-pro-origin-pull.kwai.net",80,443,"Q046"],["ws-pro-origin-pull.kwai.net",80,443,"Q046"],["ws-pro-e2-pull.kwai.net",80,443,"Q046"],["tx-pro-pull.kwai.net",80,443,"Q046"],["ws-pro-pull.kwai.net",80,443,"Q046"]],"preconnect_urls":[],"unused_idle_socket_timeout_sec":180,"preconnect_non_altsvc":true}'
            // a1 = '{"mtrequest_bare_ip_url_retry_times":2,"altsvc_broken_time_max":300,"enable_nqe_report":true,"preconnect_num_streams":0,"quic_idle_timeout_sec":180,"connection_stats_interval":0,"enable_http3":false,"enable_quic":false,"quic_prefer_plaintext":true,"altsvc_broken_time_base":60,"nqe_params":{"HalfLifeSeconds":"20"},"quic_hints":[],"preconnect_urls":[],"unused_idle_socket_timeout_sec":180,"preconnect_non_altsvc":true}'


            showStacks();
            this.nativeUpdateConfig(a1, a2);
        }

    })
}

function test() {
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

// frida -Uf com.bikcfei.checar -l HookSSL.js
// frida -Uf com.kwai.video  -l HookSSL.js
// frida -Uf com.google.android.youtube  -l HookSSL.js
//frida -Uf com.american.truck.simulator.euro.americantruck.eurotruck -l HookSSL.js
//objection -g com.lookman.carkifelek explore -s "android sslpinning disable" // 1AVxqtP5_Gl1QPJoS1qPKKa5k8wlOet2SOXO8XQpgMU0NERTBDgFtwcJ4eeMr_klH6I1EtLVKdiamaUd8GyZEJ
//objection -g com.paint.arstudio.sketch.ardraw explore -s "android sslpinning disable" // szyUmwGA0KXmgPKVL0LcrqGVCNJUXwL6FOdJtte_WI9GRLkuJRUAxA0NXFC2gxegRxaCJk2gX1CIfIbfQBQ9wW
//objection -g com.vitastudio.mahjong explore -s "android sslpinning disable" // 崩溃
//objection -g com.oakever.tiletrip explore -s "android sslpinning disable" // 崩溃
//objection -g com.block.juggle explore -s "android sslpinning disable" // CzXnh9Lt4083uWpsmEICTtlxgkVMvNP6w3N69nouIT3zCXoIJkiVnQ8nIlwin4H2ErCdWcmPbk9LKQS5iO9JGo
//objection -g com.bikcfei.checar explore -s "android sslpinning disable" // CzXnh9Lt4083uWpsmEICTtlxgkVMvNP6w3N69nouIT3zCXoIJkiVnQ8nIlwin4H2ErCdWcmPbk9LKQS5iO9JGo
//objection -g com.kwai.video explore -s "android sslpinning disable"
function main() {
    // myHook();
    test();
}

setImmediate(main);