const targetClassName = "m84.bgq";
const soDescriptor = "L" + targetClassName.replace(".", "/") + ";";
// 方式1：通过hook loadClass 能解决90%的问题
// Java.perform(function () {
//     const classLoaderList = ['dalvik.system.DexClassLoader', 'dalvik.system.PathClassLoader', 'dalvik.system.DelegateLastClassLoader', 'dalvik.system.DexFile'];

//     classLoaderList.forEach(loaderName => {
//         // 遍历所有构造函数
//         Java.use(loaderName).loadClass.overloads.forEach(function (overload) {
//             overload.implementation = function () {
//                 var loader = this;
//                 var className = arguments[0];
//                 console.log("[+] New " + loaderName + " created:", loader + " loadClass " + className);
//                 if (className.indexOf(targetClassName) !== -1) {
//                     console.log("[+] New " + loaderName + " created:", loader + " loadClass " + className);
//                     Java.classFactory.loader = loader;
//                     // 这里添加自己的业务代码

//                 }

//                 // 调用原始构造函数
//                 return overload.apply(this, arguments);
//             };
//         });
//     })
// })

// 方式2：通过hook DefineClass(核武器)
/**
 * Hook Native Art DefineClass
 * 
 * 原理：
 * Java 类的加载最终都会汇聚到 ART 虚拟机的 Native 层。
 * 核心函数通常是 art::ClassLinker::DefineClass
 * 
 * 只要 Hook 住这个函数，无论是 Java 层的 ClassLoader.loadClass，
 * 还是 DexFile.loadClass，甚至是 Native 层直接构建类，都能抓到。
 */



function hookNativeDefineClass() {
    var libart = Process.findModuleByName("libart.so");
    if (!libart) {
        console.log("[-] 找不到 libart.so");
        return;
    }

    var symbols = libart.enumerateExports();
    var defineClassSymbol = null;

    // 搜索 DefineClass 符号
    // 符号名通常类似：_ZN3art11ClassLinker11DefineClassEPNS_6ThreadEPKcx...
    for (var i = 0; i < symbols.length; i++) {
        var symbol = symbols[i];
        if (symbol.name.indexOf("ClassLinker") !== -1 &&
            symbol.name.indexOf("DefineClass") !== -1) {
            console.log("[*] 找到 DefineClass 符号: " + symbol.name);
            defineClassSymbol = symbol;
            // 找到一个就退出（通常只有一个主要的重载被导出，或者我们需要特定那个）
            // 注意：不同安卓版本符号可能略有不同，这里做一个模糊匹配尝试
            break;
        }
    }

    if (!defineClassSymbol) {
        console.log("[-] 未在 libart.so 中找到 ClassLinker::DefineClass 符号。可能被 strip 了或者版本不匹配。");
        return;
    }
    Interceptor.attach(defineClassSymbol.address, {
        onEnter: function (args) {
            var str = "";
            try { str = args[2].readCString(); } catch (e) { }
            if (str && str == soDescriptor) {
                this.found = true;
            }
        },
        onLeave: function (retval) {
            if (this.found) {
                // 类刚定义完，还没有被完全跑起来，正是 Hook 的好时机
                // 此时再发起一次 Java 层的搜索，肯定能找到
                console.log("[!] 类定义完成，立即触发 Hook...");

                Java.perform(function () {
                    Java.enumerateClassLoaders({
                        onMatch: function (loader) {
                            try {
                                if (loader.findClass(targetClassName)) {
                                    console.log("[+] 在回调中找到了类，Loader: " + loader);
                                    Java.classFactory.loader = loader; // 切换 Loader
                                    //在这里添加自己的业务逻辑
                                    Java.use(targetClassName);
                                    console.log("Java.use bgq 成功")
                                    // 找到就停止，防止重复
                                    return;
                                }
                            } catch (e) { }
                        },
                        onComplete: function () { }
                    });
                });
            }
        }
    });
    console.log("[*] 已 Hook libart.so 中的 DefineClass，等待触发...");
}

setImmediate(hookNativeDefineClass);
