// frida -UF com.example.nativedemo -l nativeHook.js

class NativeHook {
    constructor(libName) {
        this.libName = libName;
    }

    echoConfig(config, tag) {
        console.log(`=======echo ${tag}==========`);
        Object.entries(config).forEach(([funcName, address]) => {
            console.log(`${funcName}: 0x${address.toString(16)}`);
        });
    }

    get baseAddress() {
        return Module.findBaseAddress(this.libName);
    }

    get exportsConfig() {
        return this.#enumerateExportsFunc();
    }

    get importConfig() {
        return this.#enumerateImportsFunc();
    }

    #enumerateExportsFunc() {
        let exports = Module.enumerateExportsSync(this.libName);
        let exportConfig = {}
        exports.forEach(exp => {
            exportConfig[exp.name] = exp.address.sub(this.baseAddress); // 改为存储偏移量
        });
        return exportConfig; // 返回配置对象而不是原始数组
    }

    #enumerateImportsFunc() {
        let imports = Module.enumerateImportsSync(this.libName);
        let importConfig = {}
        imports.forEach(imp => {
            importConfig[imp.name] = imp.address.sub(this.baseAddress); // 改为存储偏移量
        });
        return importConfig; // 添加返回值
    }

    searchFunc(funcName) {
        let exports = this.exportsConfig;
        let searchResults = {};
        let lowerFuncName = funcName.toLowerCase();
        Object.entries(exports).forEach(([name, offset]) => {
            if (name.toLowerCase().includes(lowerFuncName)) {
                searchResults[name] = offset;
            }
        });
        console.log(`=======search ${funcName}==========`);
        console.log(JSON.stringify(searchResults));

    }


    hookFunc(offset) {
        let hookAddress = this.baseAddress.add(offset);
        console.log(`hook address: 0x${hookAddress.toString(16)};offset: 0x${offset.toString(16)}`);
        if (hookAddress != null) {
            Interceptor.attach(hookAddress, {
                onEnter: function (args) {
                    this.args0 = args[2].toInt32();
                    this.args1 = args[3].toInt32();
                    console.log("add: " + this.args0 + " + " + this.args1 + " = " + (this.args0 + this.args1));
                }, onLeave: function (retval) {
                    // 修改参数
                    retval.replace(9999);
                    console.log("add result: " + this.args0 + " + " + this.args1 + " = " + retval.toInt32());

                }
            })
        } else {
            console.log("hook address is null");
        }

    }
}

function hookDlOpen(addr, soName, callback) {
    Interceptor.attach(addr, {
        onEnter: function (args) {
            this.soName = Memory.readCString(args[0]);
            console.log(`dlopen: ${this.soName}`);
        },
        onLeave: function (retval) {
            if (this.soName.includes(soName)) {
                callback();
            }
        }
    })
}


function main() {
    // Hook dlopen函数
    const soName = "libnativedemo.so";
    const offset = 0x2664;

    let dlopen = Module.findExportByName(null, "dlopen");
    let android_dlopen_ext = Module.findExportByName(null, "android_dlopen_ext");

    // 主要是写这个里面的逻辑
    function hookCallBack() {
        console.log(`===========start hook ${soName}=============`);
        let hc = new NativeHook(soName);
        hc.hookFunc(offset);
        let exports = hc.exportsConfig;
        hc.echoConfig(exports,"export");
    }

    hookDlOpen(dlopen, soName, hookCallBack);
    hookDlOpen(android_dlopen_ext, soName, hookCallBack);
}

// main()
let hc = new NativeHook("libnativedemo.so");
let exports = hc.exportsConfig;
hc.echoConfig(exports,"export");




