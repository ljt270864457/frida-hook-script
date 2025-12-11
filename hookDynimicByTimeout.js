/**
 * 通用的动态类加载 Hook 工具
 * 将类查找机制与 Hook 业务逻辑解耦
 */

// ========================================
// 工具层：动态类查找器
// ========================================

/**
 * 在动态加载的 ClassLoader 中查找并 hook 目标类
 * @param {Object} options - 配置选项
 * @param {string} options.className - 目标类名
 * @param {function} options.onClassFound - 找到类后的回调，接收 (targetClass, loader, factory) 参数
 * @param {number} [options.retryInterval=300] - 重试间隔（毫秒）
 * @param {number} [options.maxRetries=100] - 最大重试次数，-1 表示无限重试
 * @param {boolean} [options.verbose=true] - 是否打印详细日志
 */
function hookDynamicClass(options) {
    var className = options.className;
    var onClassFound = options.onClassFound;
    var retryInterval = options.retryInterval || 300;
    var maxRetries = options.maxRetries !== undefined ? options.maxRetries : 100;
    var verbose = options.verbose !== undefined ? options.verbose : true;

    var hooked = false;
    var retryCount = 0;

    function log(msg) {
        if (verbose) {
            console.log(msg);
        }
    }

    function tryHookClass() {
        Java.enumerateClassLoaders({
            onMatch: function (loader) {
                if (hooked) return;

                try {
                    var factory = Java.ClassFactory.get(loader);
                    var targetClass = factory.use(className);

                    if (targetClass) {
                        hooked = true;
                        log("[✓] 找到 " + className + " in ClassLoader: " + loader.toString());

                        // 调用业务回调，传递找到的类、loader 和 factory
                        try {
                            onClassFound(targetClass, loader, factory);
                            log("[✓] Hook 回调执行成功!");
                        } catch (hookError) {
                            console.log("[✗] Hook 回调执行失败: " + hookError);
                        }
                    }
                } catch (e) {
                    // 这个 ClassLoader 没有这个类，继续尝试下一个
                }
            },
            onComplete: function () {
                if (!hooked) {
                    retryCount++;
                    log("[!] 第 " + retryCount + " 次尝试，未找到类 " + className);
                }
            }
        });
    }

    // 首次尝试
    log("[*] 开始搜索动态类: " + className);
    tryHookClass();

    // 如果没找到，定时轮询重试
    if (!hooked) {
        var timer = setInterval(function () {
            if (hooked) {
                clearInterval(timer);
                return;
            }

            if (maxRetries !== -1 && retryCount >= maxRetries) {
                clearInterval(timer);
                log("[✗] 达到最大重试次数 " + maxRetries + "，停止搜索 " + className);
                return;
            }

            tryHookClass();
        }, retryInterval);
    }

    // 返回控制句柄，允许外部检查状态或取消
    return {
        isHooked: function () { return hooked; },
        getRetryCount: function () { return retryCount; }
    };
}

// ========================================
// 辅助工具函数
// ========================================

function printStack(maxDepth) {
    maxDepth = maxDepth || 10;
    console.log("  --- 调用堆栈 ---");
    var Thread = Java.use("java.lang.Thread");
    var stack = Thread.currentThread().getStackTrace();
    for (var i = 2; i < Math.min(stack.length, maxDepth + 2); i++) {
        console.log("    " + stack[i].toString());
    }
    console.log("  ------------------");
}

// ========================================
// 业务层：Hook 逻辑定义
// ========================================

/**
 * 业务 Hook 回调：hook m84.bgq 类的方法
 */
function hookBgqClass(targetClass, loader, factory) {
    // Hook 'i' 方法
    targetClass["i"].implementation = function () {
        console.log("[*] m84.bgq.i() called");
        console.log("  args: " + JSON.stringify(arguments));

        var result = this["i"].apply(this, arguments);
        console.log("  result: " + result);
        return result;
    };

    // 可以继续 hook 其他方法...
    // targetClass["f"].implementation = function () { ... };
}



// ========================================
// 主入口
// ========================================

Java.perform(function () {
    console.log("[*] Frida Hook 脚本启动\n");

    // 示例1：Hook 动态加载的 m84.bgq 类
    hookDynamicClass({
        className: "m84.bgq",
        onClassFound: hookBgqClass,
        retryInterval: 300,
        maxRetries: 100,
        verbose: true
    });
});

// 运行命令:
// frida -Uf com.bhgame.app.poolclash -l hookDynimicByTimeout.js

