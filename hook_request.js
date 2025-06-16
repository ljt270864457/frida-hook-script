// com.example.app2
// frida -U -F  com.example.app2 -l hook_okhttp.js  --runtime=v8
// frida -U -f  com.example.app2 -l hook_okhttp.js
function showStacks() {
    console.log(
        Java.use("android.util.Log")
            .getStackTraceString(
                Java.use("java.lang.Throwable").$new()
            )
    );
}

Java.perform(function () {
    let searchingKey = "sign";

    let javaNetURL = Java.use("java.net.URL");
    let javaNetURI = Java.use("java.net.URI");
    let ok3RequestBuilder = Java.use("okhttp3.Request$Builder");
    let ok3FormBodyBuilder = Java.use("okhttp3.FormBody$Builder");
    let ok3RequestBody = Java.use("okhttp3.RequestBody");

    javaNetURL.$init.overload("java.lang.String").implementation = function (url) {
        if (url.toLowerCase().includes(searchingKey)) {
            console.log("java.net.URL Hooking. url: " + url);
            showStacks();
        }
        return this.$init(url);
    }

    javaNetURI.$init.overload("java.lang.String").implementation = function (url) {
        if (url.toLowerCase().includes(searchingKey)) {
            console.log("java.net.URI Hooking. url: " + url);
            showStacks();
        }
        return this.$init(url);
    }

    // Hooking OkHttp3 Request.Builder url method
    ok3RequestBuilder.url.overload("java.lang.String").implementation = function (url) {
        if (url.toLowerCase().includes(searchingKey)) {
            console.log("OkHttp3.Request.Builder.url Hooking. url: " + url);
            showStacks();
        }
        return this.url(url);
    }

    // hooking okhttp3 header method
    ok3RequestBuilder.header.overload("java.lang.String", "java.lang.String").implementation = function (name, value) {
        if (name.toLowerCase().includes(searchingKey)) {
            console.log("OkHttp3.Request.Builder.header Hooking. name: " + name + ", value: " + value);
            showStacks();
        }
        return this.header(name, value);
    }
    // Hooking okhttp3 addHeader method
    ok3RequestBuilder.addHeader.overload("java.lang.String", "java.lang.String").implementation = function (name, value) {
        if (name.toLowerCase().includes(searchingKey)) {
            console.log("OkHttp3.Request.Builder.addHeader Hooking. name: " + name + ", value: " + value);
            showStacks();
        }
        return this.addHeader(name, value);
    }

    // Hooking okhttp3 formBody.add method
    ok3FormBodyBuilder.add.overload("java.lang.String", "java.lang.String").implementation = function (name, value) {
        if (name.toLowerCase().includes(searchingKey)) {
            console.log("OkHttp3.FormBody.Builder.add Hooking. name: " + name + ", value: " + value);
            showStacks();
        }
        return this.add(name, value);
    }

    // Hooking okhttp3.RequestBody.create method
    ok3RequestBody.create.overload('java.lang.String', 'okhttp3.MediaType').implementation = function (content, mediaType) {
        if (content.toLowerCase().includes(searchingKey)) {
            console.log("OkHttp3.RequestBody.create Hooking. mediaType: " + mediaType + ", content: " + content);
            showStacks();
        }
        return this.create(content, mediaType);
    }
    
})