// com.example.app2
// frida -U -F  com.example.app2 -l hook_json.js  --runtime=v8
// frida -U -f  com.example.app2 -l hook_json.js
function showStacks() {
    console.log(
        Java.use("android.util.Log")
            .getStackTraceString(
                Java.use("java.lang.Throwable").$new()
            )
    );
}

Java.perform(function () {
    let searchingKey = "张三";

    // Hooking JsonObject put method
    Java.use("org.json.JSONObject").put.overload("java.lang.String", "java.lang.Object").implementation = function (key, value) {
        if (value.toString().toLowerCase().includes(searchingKey)) {
            console.log("JSONObject.put Hooking. key: " + key + ", value: " + value);
            // showStacks();
        }
        return this.put(key, value);
    }
    // Hooking JsonObject toString method
    Java.use("org.json.JSONObject").toString.overload().implementation = function () {
        let result = this.toString();
        if (result.toLowerCase().includes(searchingKey)) {
            console.log("JSONObject.toString Hooking. result: " + result);
            // showStacks();
        }
        return result;
    }

    // Hooking Gson toJson method
    Java.use("com.google.gson.Gson").toJson.overload("java.lang.Object").implementation = function (value) {
        let jsonResult = this.toJson(value);
        if (jsonResult.toLowerCase().includes(searchingKey)) {
            console.log("Gson.toJson Hooking. value: " + jsonResult);
            // showStacks();
        }
        return jsonResult;
    }

    // Hooking fastjson toJsonString method
    Java.use("com.alibaba.fastjson2.JSON").toJSONString.overload("java.lang.Object").implementation = function (value) {
        let jsonResult = this.toJSONString(value);
        if (jsonResult.toLowerCase().includes(searchingKey)) {
            console.log("fastjson2.JSON.toJSONString Hooking. value: " + jsonResult);
            // showStacks();
        }
        return jsonResult;
    }

})