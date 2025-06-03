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

    // Hooking OkHttp3 Request.Builder url method
    Java.use("okhttp3.Request$Builder").url.overload("java.lang.String").implementation = function (url) {
        if (url.toLowerCase().includes(searchingKey)) {
            console.log("OkHttp3.Request.Builder.url Hooking. url: " + url);
            showStacks();
        }
        return this.url(url);
    }

    // hooking okhttp3 header method
    Java.use("okhttp3.Request$Builder").header.overload("java.lang.String", "java.lang.String").implementation = function (name, value) {
        if(name.toLowerCase().includes(searchingKey)){
            console.log("OkHttp3.Request.Builder.header Hooking. name: " + name + ", value: " + value);
            showStacks();
        }
        return this.header(name, value);
    }
    // Hooking okhttp3 addHeader method
    Java.use("okhttp3.Request$Builder").addHeader.overload("java.lang.String", "java.lang.String").implementation = function (name, value) {
        if(name.toLowerCase().includes(searchingKey)){
            console.log("OkHttp3.Request.Builder.addHeader Hooking. name: " + name + ", value: " + value);
            showStacks();
        }
        return this.addHeader(name, value);
    }

    // Hooking okhttp3 formBody.add method
    Java.use("okhttp3.FormBody$Builder").add.overload("java.lang.String", "java.lang.String").implementation = function (name, value) {
        if(name.toLowerCase().includes(searchingKey)){
            console.log("OkHttp3.FormBody.Builder.add Hooking. name: " + name + ", value: " + value);
            showStacks();
        }
        return this.add(name, value);
    }

    // Hooking okhttp3.RequestBody.create method
    Java.use("okhttp3.RequestBody").create.overload('java.lang.String', 'okhttp3.MediaType').implementation = function (content,mediaType) {
        if(content.toLowerCase().includes(searchingKey)){
            console.log("OkHttp3.RequestBody.create Hooking. mediaType: " + mediaType + ", content: " + content);
            showStacks();
        }
        return this.create(content,mediaType);
    }
})