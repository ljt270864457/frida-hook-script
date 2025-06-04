// frida -Uf com.android.browser -l hook_class_loader.js > classes.txt

Java.perform(function () {
    console.log("========== 开始列出所有已加载的类 ==========");

    // 获取所有ClassLoader
    const ClassLoader = Java.use("java.lang.ClassLoader");
    const DexFile = Java.use("dalvik.system.DexFile");

    // 获取当前线程的ClassLoader
    const currentThread = Java.use("java.lang.Thread").currentThread();
    const contextClassLoader = currentThread.getContextClassLoader();

    // 获取所有已加载的类
    const classes = Java.enumerateLoadedClassesSync();

    // 按包名分组输出
    const classMap = {};
    classes.forEach(className => {
        const packageName = className.split('.').slice(0, -1).join('.');
        if (!classMap[packageName]) {
            classMap[packageName] = [];
        }
        classMap[packageName].push(className);
    });

    // 打印结果
    Object.keys(classMap).sort().forEach(pkg => {
        console.log(`\n[${pkg}]`);
        classMap[pkg].sort().forEach(cls => {
            console.log(`  ${cls}`);
        });
    });

    console.log("========== 共加载 " + classes.length + " 个类 ==========");
});

