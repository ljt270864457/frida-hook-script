// ========== 方法1：Java层Hook（推荐，最简单可靠） ==========
// Java.perform(function () {
//     try {
//         var HNASignature = Java.use("com.rytong.hnair.HNASignature");
//         HNASignature.getHNASignature.implementation = function (headJson, queryJson, bodyJson, salt, appSignature) {
//             console.log("\n[*] ========== HNASignature.getHNASignature called ==========");
//             console.log("[*] headJson:", headJson);
//             console.log("[*] queryJson:", queryJson);
//             console.log("[*] bodyJson:", bodyJson);
//             console.log("[*] salt:", salt);
//             console.log("[*] appSignature:", appSignature);
//
//             var result = this.getHNASignature(headJson, queryJson, bodyJson, salt, appSignature);
//
//             console.log("[*] result:", result);
//             console.log("[*] =========================================================");
//             return result;
//         };
//         console.log("[+] Java层Hook已安装: HNASignature.getHNASignature");
//     } catch (e) {
//         console.log("[!] Java层Hook失败:", e);
//     }
// });

// ========== 方法2：Native层Hook（备选方案） ==========
// 注意：Native层Hook需要正确获取JNI函数表，比较复杂
// 如果Java层Hook可用，建议优先使用Java层Hook


// var libsignature = Module.findExportByName("libsignature.so", "Java_com_rytong_hnair_HNASignature_getHNASignature");
// if (libsignature) {
//     console.log("[+] 找到native函数:", libsignature);
//     this.env = null;

//     Interceptor.attach(libsignature, {
//         onEnter: function (args) {
//             // JNI函数参数说明：
//             // args[0] = JNIEnv* env
//             // args[1] = jclass object
//             // args[2] = jstring headJson
//             // args[3] = jstring queryJson
//             // args[4] = jstring bodyJson
//             // args[5] = jstring salt
//             // args[6] = jstring appSignature
//             this.env = Java.vm.getEnv();


//             console.log("\n[*] ========== Native getHNASignature called ==========");
//             // console.log("[*] JNIEnv:", args[0].readCString());
//             // console.log("[*] jclass:", args[1]);
//             console.log("[*] headJson (jstring):", this.env.getStringUtfChars(args[2]).readCString());
//             console.log("[*] queryJson (jstring):", this.env.getStringUtfChars(args[3]).readCString());
//             console.log("[*] bodyJson (jstring):", this.env.getStringUtfChars(args[4]).readCString());
//             console.log("[*] salt (jstring):", this.env.getStringUtfChars(args[5]).readCString());
//             console.log("[*] appSignature (jstring):", this.env.getStringUtfChars(args[6]).readCString());

//             // 注意：在native层直接读取jstring内容比较复杂
//             // 需要调用JNI函数GetStringUTFChars，但需要知道函数表偏移
//             // 这里只打印指针值，实际内容建议使用Java层Hook获取
//         },
//         onLeave: function (retval) {
//             console.log("[*] Native getHNASignature return (jstring):", this.env.getStringUtfChars(retval).readCString());
//             console.log("[*] =========================================================");
//         }
//     });
//     console.log("[+] Native层Hook已安装");
// } else {
//     console.log("[!] 未找到native函数: Java_com_rytong_hnair_HNASignature_getHNASignature");
//     console.log("[!] 可能原因：SO文件未加载或函数未导出");
// }
// Java.perform(function (){
//     var StringsKt__StringsKt = Java.use("kotlin.text.StringsKt__StringsKt");
//     StringsKt__StringsKt["A0"].implementation = function (charSequence, strArr, z2, i2, i3, obj) {
//         // console.log(`StringsKt__StringsKt.m67875A0 is called: charSequence=${charSequence}, strArr=${strArr}, z2=${z2}, i2=${i2}, i3=${i3}, obj=${obj}`);
//         let result = this["A0"](charSequence, strArr, z2, i2, i3, obj);
//         if(typeof(charSequence.toString())==='string' &&  charSequence.toString().includes(">")){
//             console.log(`StringsKt__StringsKt.m67875A0 charSequence=${charSequence}`);
//             console.log(`StringsKt__StringsKt.m67875A0 result=${InspectJavaUtils.prettyPrintValue(result)}`);
//         }

//         return result;
//     };
function readStdString(strPtr) {
    if (strPtr.isNull()) {
        return "[null]";
    }

    try {
        // 根据IDA反编译，std::string的布局：
        // __r_.__value_.__l.gap0[0] = flag/capacity (offset 0)
        // __r_.__value_.__l.__size_ = size (offset 8, 仅堆模式)
        // __r_.__value_.__r.__words[2] = data pointer (offset 16, 仅堆模式)
        // __r_.__value_.__s.__data_ = SSO data (offset 1, 仅SSO模式)

        const flag = strPtr.readU64();

        // 先读取所有可能用到的字段
        const sizeField = strPtr.add(8).readU64();
        const ptrField = strPtr.add(Process.pointerSize * 2).readPointer();

        // 判断模式：最低位为1表示堆模式，为0表示SSO模式
        // 但如果SSO判断异常（capacity过大），也尝试堆模式
        const isHeapMode = (flag & 1) !== 0;
        const ssoCapacity = (flag & 1) === 0 ? (flag >> 1) : 0;
        const shouldTryHeap = isHeapMode || (ssoCapacity > 23);

        if (shouldTryHeap) {
            // 尝试堆模式
            if (sizeField > 0 && sizeField < 0x100000 && !ptrField.isNull()) {
                try {
                    return ptrField.readUtf8String(sizeField);
                } catch (e) {
                    // 堆模式读取失败，继续尝试SSO
                }
            }
        }

        // 尝试SSO模式（只有在不是强制堆模式且capacity合理时）
        if (!isHeapMode && ssoCapacity <= 23) {
            if (ssoCapacity === 0) {
                return "[empty]";
            }

            // SSO数据在strPtr+1位置
            const dataPtr = strPtr.add(1);
            try {
                return dataPtr.readUtf8String(ssoCapacity);
            } catch (e) {
                // SSO读取失败，返回错误
                return "[SSO read error: " + e.message + ", capacity: " + ssoCapacity + "]";
            }
        }

        // 如果都失败了，返回详细信息用于调试
        return "[parse failed - flag:0x" + flag.toString(16) +
            " size:" + sizeField +
            " ptr:" + ptrField +
            " ssoCap:" + ssoCapacity + "]";
    } catch (e) {
        return "[error: " + e.message + "]";
    }
}

// var base = Module.findBaseAddress("libsignature.so");
// var target = base.add(0x63AE0);

// Interceptor.attach(target, {
//     onEnter: function (args) {
//         this.arg0 = args[0];  // this指针
//         this.arg1 = args[1];  // headersParamString
//         this.arg2 = args[2];  // queriesParamString
//         this.arg3 = args[3];  // bodyParamString
//         this.arg4 = args[4];  // saltString
//         this.arg5 = args[5];  // appSignatureString

//         console.log("\n[*] ========== HNASignature::HNASignature called ==========");
//         console.log("[*] this:", this.arg0);

//         // 调试：如果遇到解析错误，打印内存布局
//         const enableDebug = true;  // 临时启用调试

//         // 安全读取每个参数
//         try {
//             const result1 = readStdString(this.arg1);
//             console.log("[*] headersParamString:", result1);
//             if (enableDebug && (result1.includes("invalid") || result1.includes("error"))) {
//                 console.log("\n[DEBUG] arg1 memory dump:");
//                 console.log(hexdump(this.arg1, { length: 32, header: true }));
//                 const flag = this.arg1.readU64();
//                 const size = this.arg1.add(8).readU64();
//                 const ptr = this.arg1.add(16).readPointer();
//                 console.log("[DEBUG] flag:", "0x" + flag.toString(16), "bit0:", flag & 1);
//                 console.log("[DEBUG] size field:", "0x" + size.toString(16));
//                 console.log("[DEBUG] ptr field:", ptr);
//             }
//         } catch (e) {
//             console.log("[!] arg1 error:", e.message);
//         }

//         try {
//             console.log("[*] queriesParamString:", readStdString(this.arg2));
//         } catch (e) {
//             console.log("[!] arg2 error:", e.message);
//         }

//         try {
//             console.log("[*] bodyParamString:", readStdString(this.arg3));
//         } catch (e) {
//             console.log("[!] arg3 error:", e.message);
//         }

//         try {
//             console.log("[*] saltString:", readStdString(this.arg4));
//         } catch (e) {
//             console.log("[!] arg4 error:", e.message);
//         }

//         try {
//             console.log("[*] appSignatureString:", readStdString(this.arg5));
//         } catch (e) {
//             console.log("[!] arg5 error:", e.message);
//         }
//     },
//     onLeave: function (retval) {
//         console.log("[*] =========================================================");
//         console.log("[*] retval:", readStdString(this.arg0));
//     }
// });


// 直接通过导出符号查找地址，再反查 Module
var funcName = "Java_com_rytong_hnair_HNASignature_getHNASignature";

function findTargetFunction() {
    var address = Module.findExportByName(null, funcName);
    if (address) {
        var module = Process.findModuleByAddress(address);
        console.log("✅ Found function in SO:", module.name);
        console.log("   Address:", address);
        return true;
    }
    return false;
}

// 1. 立即尝试查找
if (!findTargetFunction()) {
    console.log("⏳ Function not found yet. It might be in a library that hasn't loaded.");
    console.log("   Monitoring dlopen for library loading...");

    // 2. 监听 dlopen/android_dlopen_ext 等待库加载
    // Android 7+ 主要使用 android_dlopen_ext
    var android_dlopen_ext = Module.findExportByName(null, "android_dlopen_ext");
    if (android_dlopen_ext) {
        Interceptor.attach(android_dlopen_ext, {
            onEnter: function(args) {
                this.path = args[0].readCString();
            },
            onLeave: function(retval) {
                if (this.path && this.path.indexOf("libsignature.so") >= 0) {
                    console.log("📦 libsignature.so loaded! Checking exports again...");
                    findTargetFunction();
                }
            }
        });
    }
    
    // 兼容旧版或直接 dlopen
    var dlopen = Module.findExportByName(null, "dlopen");
    if (dlopen) {
        Interceptor.attach(dlopen, {
            onEnter: function(args) {
                this.path = args[0].readCString();
            },
            onLeave: function(retval) {
                if (this.path && this.path.indexOf("libsignature.so") >= 0) {
                    console.log("📦 libsignature.so loaded (dlopen)! Checking exports again...");
                    findTargetFunction();
                }
            }
        });
    }
}



// frida -UF com.rytong.hnair  -l fridaJavaUtils.js  -l hook_hnhk.js
// frida -Uf com.rytong.hnair -l fridaJavaUtils.js  -l hook_hnhk.js
// frida -Uf com.rytong.hnair -l hookSSL.js  -l hook_hnhk.js
