// com.example.app2
// frida -U -F  com.example.app2 -l common_hook.js  --runtime=v8
// frida -U -f  com.example.app2 -l common_hook.js
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
    // Hook ArrayList的add和addAll方法
    const arrayClasses = ["java.util.ArrayList", "java.util.LinkedList", "java.util.Vector", "java.util.Stack"];
    arrayClasses.forEach(className => {
        Java.use(className).add.overload('java.lang.Object').implementation = function (value) {
            try {
                let value_tmp = Java.cast(value, Java.use("java.lang.String"));
                if (value_tmp.equals(searchingKey)) {
                    showStacks();
                }
                return this.add(value);
            } catch (e) {
                return this.add(value);
            }
        };

        Java.use(className).addAll.overload("java.util.Collection").implementation = function (collection) {
            try {
                if (collection.contains(searchingKey)) {
                    showStacks();
                }
                return this.addAll(collection);
            } catch (e) {
                return this.addAll(collection);
            }

        };
    });

    // Hooking HashMap put method
    const mapClasses = ["java.util.HashMap", "java.util.LinkedHashMap", "java.util.TreeMap", "java.util.TreeMap"];
    mapClasses.forEach(className => {
        // hook put method

        Java.use(className).put.implementation = function (key, value) {
            try {
                if (value.equals(searchingKey)) {
                    showStacks();
                    console.log("Key: " + key + " ,Value: " + value);
                }
                return this.put(key, value);
            } catch (e) {
                return this.put(key, value);
            }

        };

        // hook putAll method
        Java.use(className).putAll.implementation = function (map) {
            try {
                if (map.containsValue(searchingKey)) {
                    showStacks();
                    let convertedMap = Java.cast(map, Java.use("java.util.HashMap"));
                    console.log("Map: " + convertedMap.toString());
                }
                return this.putAll(map);
            } catch (e) {
                return this.putAll(map);
            }

        };
    });


    // Hooking sort method
    let collections = Java.use("java.util.Collections");
    collections.sort.overload('java.util.List').implementation = function (list) {
        // console.log("Hook collections.sort");
        let result = Java.cast(list, Java.use("java.util.ArrayList"));
        console.log("collections.sort List: ", result.toString());
        showStacks();
        return this.sort(list);
    }

    collections.sort.overload('java.util.List', 'java.util.Comparator').implementation = function (list, comparator) {
        // console.log("Hook collections.sort");
        let result = Java.cast(list, Java.use("java.util.ArrayList"));
        console.log("collections.sort List: ", result.toString());
        showStacks();
        return this.sort(list, comparator);
    }

    // Hooking String.getBytes method
    Java.use("java.lang.String").getBytes.overload().implementation = function () {
        showStacks();

        // Convert byte array to string
        let oriString = Java.use("java.lang.String").$new(this);

        let result = this.getBytes();
        console.log("String.getBytes Hooking. oriString: " + oriString);
        console.log("String.getBytes Hooking. result: " + result);
        return result;
    }

    // Hooking Toast.makeText method
    Java.use("android.widget.Toast").makeText.overload("android.content.Context", "java.lang.CharSequence", "int").implementation = function (context, text, duration) {
        if (text.toString().toLowerCase().includes(searchingKey)) {
            showStacks();
            console.log("Toast.makeText Hooking. text: " + text);
        }
        return this.makeText(context, text, duration);
    }

    // Hooking StringBuilder toString method
    Java.use("java.lang.StringBuilder").toString.overload().implementation = function () {
        let result = this.toString();
        if (result.toLowerCase().includes(searchingKey)) {
            console.log("StringBuilder.toString Hooking. result: " + result);
            showStacks();
        }
        return result;
    }

    // Hooking java.io.OutputStream write method
    Java.use("java.io.OutputStream").write.overload('[B').implementation = function (bArr) {
        console.log("hooking java.io.OutputStream.write.overload('[B')");
        let oriString = Java.use("java.lang.String").$new(bArr);
        let hexString = byteArrayToHexString(bArr);
        console.log("原始文本：" + oriString);    // 输出原始文本
        console.log("压缩后hexString:" + hexString); // 输出压缩后的hexString
        showStacks();

        return this.write(bArr);
    }

})