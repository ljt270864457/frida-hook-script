function listLoadedModules() {
    console.log("\n[*] ========== Loaded Modules ==========");
    var modules = Process.enumerateModules();
    
    // 过滤只显示 .so 文件，可以去掉 filter 来看所有模块
    var soModules = modules.filter(function(m) {
        return m.name.endsWith(".so") && m.name.startsWith("lib") && m.path.startsWith('/data');
    });
    var count = 1;

    soModules.forEach(function(m) {
        console.log(`[${count}] -> [name]:${m.name},[Base]:${m.base},[Size]:${m.size},[Path]:${m.path}`)
        count++;
    });
    
    console.log("[*] Total .so modules: " + soModules.length);
    console.log("[*] ====================================\n");
}

function listExports(moduleName) {
    console.log("\n[*] ========== Exports of " + moduleName + " ==========");
    var targetModule = Process.findModuleByName(moduleName);
    if (!targetModule) {
        console.log("❌ Module not found: " + moduleName);
        return;
    }

    var exports = targetModule.enumerateExports();
    var staticExports = exports.filter(function(exp) {
        return exp.name.startsWith("Java_") && exp.type==='function';
    });
    var count = 1;
    staticExports.forEach(function(exp) {
        console.log(`[${count}] -> [Name]: ${exp.name},[Address]: ${exp.address}`);
    });
    
    console.log("[*] Total exports: " + staticExports.length);
    console.log("[*] ==============================================\n");
}

function hookDlopen() {
    var dlopen = Module.findExportByName(null, "android_dlopen_ext");
    if (dlopen) {
        Interceptor.attach(dlopen, {
            onEnter: function(args) {
                var path = args[0].readCString();
                if (path && path.startsWith('/data') && path.endsWith(".so")) {
                    console.log("[📦 SO加载] " + path);
                }
            }
        });
    }
}

function hookRegisterNatives() {
    // 方法1: 通过 libart.so 符号表查找
    var libart = Process.findModuleByName("libart.so");
    if (!libart) {
        console.log("[-] libart.so not found!");
        return;
    }
    
    var symbols = libart.enumerateSymbols();
    var hookedCount = 0;
    
    // Hook 所有 RegisterNatives 相关符号（不只是第一个）
    for (var i = 0; i < symbols.length; i++) {
        var symbol = symbols[i];
        if (symbol.name.indexOf("RegisterNatives") >= 0 && 
            symbol.name.indexOf("CheckJNI") < 0) {
            
            console.log("[*] Hooking RegisterNatives:", symbol.name);
            console.log("    Address:", symbol.address);
            
            try {
                Interceptor.attach(symbol.address, {
                    onEnter: function(args) {
                        parseRegisterNatives(args);
                    }
                });
                hookedCount++;
            } catch (e) {
                console.log("    [-] Failed to hook:", e.message);
            }
        }
    }
    
    // 方法2: 备用 - 直接通过 JNIEnv 函数表 Hook
    // JNIEnv->RegisterNatives 是函数表中的第 215 个函数（索引 214）
    // 这是更底层的方式，确保能捕获到
    
    if (hookedCount === 0) {
        console.log("[-] No RegisterNatives symbols found, trying JNIEnv vtable method...");
    } else {
        console.log("[+] Hooked " + hookedCount + " RegisterNatives entries!");
    }
}

function parseRegisterNatives(args) {
    console.log('\n========== RegisterNatives Called ==========');
    
    var env = args[0];
    var jclass = args[1];
    var methods = args[2];      // JNINativeMethod* 数组指针
    var nMethods = args[3].toInt32();
    
    // 获取类名 - 使用更可靠的方式
    var className = "[unknown]";
    try {
        // 方式1: 通过 Frida 的 Java API
        var jniEnv = Java.vm.tryGetEnv();
        if (jniEnv) {
            className = jniEnv.getClassName(jclass);
        }
    } catch (e) {
        // 方式2: 如果上面失败，尝试通过 JNI 函数表调用 GetObjectClass
        try {
            // JNIEnv 函数表偏移：GetObjectClass = 31, GetClassName 需要更多步骤
            // 这里简化处理，直接显示 jclass 地址
            className = "[jclass@" + jclass + "]";
        } catch (e2) {
            className = "[error: " + e.message + "]";
        }
    }
    
    console.log("[RegisterNatives] Class:", className, "| Methods:", nMethods);
    
    // 解析 JNINativeMethod 结构体数组
    // struct JNINativeMethod {
    //     const char* name;       // 方法名
    //     const char* signature;  // 方法签名
    //     void* fnPtr;            // Native 函数指针
    // };
    
    var structSize = Process.pointerSize * 3;
    
    for (var i = 0; i < nMethods; i++) {
        var methodPtr = methods.add(i * structSize);
        
        try {
            var namePtr = methodPtr.readPointer();
            var sigPtr = methodPtr.add(Process.pointerSize).readPointer();
            var fnPtr = methodPtr.add(Process.pointerSize * 2).readPointer();
            
            var name = namePtr.readCString();
            var sig = sigPtr.readCString();
            
            // 找到函数所在的模块
            var module = Process.findModuleByAddress(fnPtr);
            var moduleName = module ? module.name : "unknown";
            var offset = module ? "0x" + fnPtr.sub(module.base).toString(16) : "?";
            
            console.log("  [" + i + "] " + name + sig);
            console.log("      -> Address:", fnPtr, "| Module:", moduleName, "| Offset:", offset);
        } catch (e) {
            console.log("  [" + i + "] Error parsing method:", e.message);
        }
    }
    
    console.log('=============================================\n');
}

//动态注册的函数分析
hookRegisterNatives();
hookDlopen();
global.soAnalyzer = {
    // 静态注册的函数分析
    list_loaded_modules: listLoadedModules,
    list_exports: listExports,
}

// RPC导出 - 可以从Python调用
// 注意：Frida会将驼峰命名转换为全小写，所以这里直接用小写
rpc.exports = {
    // 列出所有加载的SO模块
    listmodules: listLoadedModules,
    
    // 列出指定模块的导出函数
    listexports: listExports,  
};



// listExports("libsignature.so");

// frida -Uf com.rytong.hnair -l hookSSL.js  -l so_analyzer.js
// frida -Uf com.example.nativedemo  -l so_analyzer.js