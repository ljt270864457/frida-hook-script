function hook_md5_transform() {
    const base = Module.findBaseAddress("libyaqpro.3e364a2a.so");
    if (!base) return console.error("❌ base not found");

    const addr = base.add(0x540E0); // md5_transform 的偏移地址
    console.log("[*] Hooking sub_540E0 @", addr);

    Interceptor.attach(addr, {
        onEnter(args) {
            this.statePtr = args[0];   // A,B,C,D
            this.blockPtr = args[1];   // 64-byte input

            console.log("\n🚀 sub_540E0");
            console.log("📦 input block:");
            console.log(hexdump(this.blockPtr, {length: 64}));
        },

        onLeave() {
            /* ---- 正确读取 16 字节摘要 ---- */
            const digestBytes = Memory.readByteArray(this.statePtr, 16);
            const md5 = Array.from(new Uint8Array(digestBytes))
                .map(b => ("0" + b.toString(16)).slice(-2))
                .join("")
                .toUpperCase();
            console.log("✅ MD5 =", md5);
            if (md5 === "812EDD5567C5D1DADDACB9D0522567C1") {
                console.log("🔥 MATCH FOUND 🔥");
            }
        }
    });
}

setImmediate(hook_md5_transform);

