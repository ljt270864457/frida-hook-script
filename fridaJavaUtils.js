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

function showStacks(print = true) {

    let result = Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Throwable").$new())
    if (print) {
        console.log(result);
    }
    return result;
}

function logWithTimestamp(message, ...optionalParams) {
    const now = new Date();
    const formattedTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    console.log(`[${formattedTime}] ${message}`, ...optionalParams);
}

function generateRandomHex(length) {
    let result = '';
    const characters = '0123456789abcdef';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}


(function () {
    // === 全局缓存，用于对象引用 ===
    var savedObjects = {};
    var savedCounter = 1;
    var gson;
    var gsonUtils;


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
                logWithTimestamp("Unsupported target:", target);
            }
        } catch (e) {
            logWithTimestamp("dumpAny error:", e);
        }
    }

    /**
     * 打印gson对象
     * @param obj
     */
    function dumpGsonObj(obj, print = true, request_id = "") {
        try {
            if (!gson) {
                // 自己写的dex
                Java.openClassFile("/data/local/tmp/com-ljt-gson.dex").load();
                gson = Java.use('com.ljt.gson.Gson');
            }
            let clazz = obj.getClass();
            let result = gson.$new().toJson(obj);
            logWithTimestamp(`=======class ${clazz.getSimpleName()} (instance dump),uuid:${request_id} =======\n`);
            if (print) {
                logWithTimestamp(gson.$new().toJson(obj));
            }
            return result;
        } catch (e) {
            logWithTimestamp(`dumpGsonObj error:${e},uuid:${request_id}`);
            return '';
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
        dumpGsonObj: dumpGsonObj,
        prettyPrintValue: prettyPrintValue,
        getFieldValueByReflection: getFieldValueByReflection,
        bufferToByteArray: bufferToByteArray,
        savedObjects: savedObjects
    };

    global.CommonUtils = {

        logWithTimestamp: logWithTimestamp,

        generateRandomHex: generateRandomHex,

        /**
         * 打印当前调用栈
         */
        showStacks: showStacks,
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