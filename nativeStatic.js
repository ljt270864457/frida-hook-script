function hook_so_static_register() {
    // === Hook dlsym（静态绑定情况）===
    Interceptor.attach(Module.findExportByName(null, "dlsym"), {
        onEnter: function (args) {
            this.symbol = Memory.readCString(args[1]);
            console.log("[dlsym] Looking for: " + this.symbol);
            if (this.symbol.includes("getobjresult")) {
                console.log("[dlsym] Looking for: " + this.symbol);
                this.shouldLog = true;
            }
        },
        onLeave: function (retval) {
            if (this.shouldLog && !retval.isNull()) {
                var module = Process.findModuleByAddress(retval);
                console.log("✅ Found native symbol in: " + (module ? module.name : "unknown"));
                console.log("    Address: " + retval);
            }
        }
    });
}

hook_so_static_register();