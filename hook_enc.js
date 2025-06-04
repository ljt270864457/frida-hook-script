/**
 * Android加密算法Hook脚本
 * 用法:
 * frida -U -F com.example.app2 -l hook_enc.js --runtime=v8
 * 或
 * frida -U -f com.example.app2 -l hook_enc.js
 */


    // 工具函数
const Utils = {
        /**
         * 打印当前调用栈
         */
        showStacks: function () {
            console.log(
                Java.use("android.util.Log")
                    .getStackTraceString(
                        Java.use("java.lang.Throwable").$new()
                    )
            );
        },

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
         * 格式化输出数据
         * @param {string} title - 标题
         * @param {byte[]} data - 数据
         */
        logData: function (title, data) {
            try {
                console.log(`${title}-文本: ${this.byteArrayToUtf8(data)}`);
                console.log(`${title}-hex: ${this.byteArrayToHexString(data)}`);
                console.log(`${title}-base64: ${this.byteArrayToBase64(data)}`);
            } catch (e) {
                console.log(`[错误] 输出${title}数据时发生异常: ${e}`);
            }
        },

        /**
         * 输出算法信息头
         * @param {string} algorithm - 算法名称
         */
        logAlgorithmHeader: function (algorithm) {
            console.log('===========Hook到算法: ' + algorithm + '===============');
        }
    };


/**
 * Hook消息摘要算法
 * @param {Object} MessageDigest - MessageDigest类
 */
function hookMessageDigest(MessageDigest) {
    // Hook update方法
    MessageDigest.update.overload('[B').implementation = function (byteArray) {
        const algorithm = this.getAlgorithm();
        Utils.logAlgorithmHeader(algorithm);
        Utils.logData("明文", byteArray);
        return this.update(byteArray);
    };

    // Hook digest方法 (重载1)
    MessageDigest.digest.overload('[B').implementation = function (byteArray) {
        const algorithm = this.getAlgorithm();
        Utils.logAlgorithmHeader(algorithm);
        Utils.logData("加密结果", byteArray);
        return this.digest(byteArray);
    };

    // Hook digest方法 (重载2)
    MessageDigest.digest.overload('[B', 'int', 'int').implementation = function (byteArray, offset, length) {
        const algorithm = this.getAlgorithm();
        Utils.logAlgorithmHeader(algorithm);
        Utils.logData("加密结果", byteArray);
        return this.digest(byteArray, offset, length);
    };
}

/**
 * Hook密钥
 * @param {Object} secretKey - SecretKeySpec类
 */
function hookSecretKey(secretKey) {
    secretKey.$init.overload('[B', 'java.lang.String').implementation = function (key, algorithm) {
        const result = this.$init(key, algorithm);
        Utils.logAlgorithmHeader(algorithm);
        Utils.logData("secretKey", key);
        return result;
    };
}

/**
 * Hook HMAC算法
 * @param {Object} mac - Mac类
 */
function hookMac(mac) {
    // Hook update方法
    mac.update.overload('[B').implementation = function (byteArray) {
        const algorithm = this.getAlgorithm();
        Utils.logAlgorithmHeader(algorithm);
        Utils.logData("明文", byteArray);
        return this.update(byteArray);
    };

    // Hook doFinal方法 (重载1)
    mac.doFinal.overload('[B').implementation = function (byteArray) {
        const result = this.doFinal(byteArray);
        const algorithm = this.getAlgorithm();
        Utils.logAlgorithmHeader(algorithm);
        Utils.logData("加密结果", result);
        return result;
    };

    // Hook doFinal方法 (重载2)
    mac.doFinal.overload().implementation = function () {
        const result = this.doFinal();
        const algorithm = this.getAlgorithm();
        Utils.logAlgorithmHeader(algorithm);
        Utils.logData("加密结果", result);
        return result;
    };
}

/**
 * Hook加密算法
 * @param {Object} cipher - Cipher类
 * @param {Object} ivParameterSpec - IvParameterSpec类
 */
function hookCipher(cipher, ivParameterSpec) {
    // Hook init方法 (带IV参数)
    cipher.init.overload('int', 'java.security.Key', 'java.security.spec.AlgorithmParameterSpec').implementation = function (mode, key, iv) {
        const result = this.init(mode, key, iv);

        // 只关注加密模式 (mode=1)
        if (mode !== 1) {
            return result;
        }

        const algorithm = this.getAlgorithm();
        const secretKeyArray = key.getEncoded();
        const ivArray = Java.cast(iv, ivParameterSpec).getIV();

        Utils.logAlgorithmHeader(algorithm);
        Utils.logData("secretKey", secretKeyArray);
        Utils.logData("iv", ivArray);

        return result;
    };

    // Hook init方法 (不带IV参数)
    cipher.init.overload('int', 'java.security.Key').implementation = function (mode, key) {
        const result = this.init(mode, key);

        // 只关注加密模式 (mode=1)
        if (mode !== 1) {
            return result;
        }

        const algorithm = this.getAlgorithm();
        const secretKeyArray = key.getEncoded();

        Utils.logAlgorithmHeader(algorithm);
        Utils.logData("secretKey", secretKeyArray);

        return result;
    };

    // Hook update方法
    cipher.update.overload('[B').implementation = function (byteArray) {
        const result = this.update(byteArray);
        const algorithm = this.getAlgorithm();

        Utils.logAlgorithmHeader(algorithm);
        Utils.logData("明文", byteArray);

        return result;
    };

    // Hook doFinal方法
    cipher.doFinal.overload('[B').implementation = function (byteArray) {
        const result = this.doFinal(byteArray);
        const algorithm = this.getAlgorithm();

        Utils.logAlgorithmHeader(algorithm);
        Utils.logData("明文", byteArray);
        Utils.logData("加密结果", result);

        return result;
    };
}

/**
 * Hook Base64编码
 * @param {Object} base64Class - Base64类
 */
function hookBase64(base64Class) {
    base64Class.encodeToString.overload("[B", "int").implementation = function (value, flag) {
        const result = this.encodeToString(value, flag);
        const oriString = Utils.byteArrayToUtf8(value);

        console.log("Base64 Hooking. 原始文本: " + oriString);
        console.log("Base64 Hooking. base64之后的文本: " + result);

        return result;
    };
}

/**
 * Hook URL编码
 * @param {Object} urlEncoder - URLEncoder类
 */
function hookUrlEncoder(urlEncoder) {
    // 重载1
    urlEncoder.encode.overload("java.lang.String", "java.lang.String").implementation = function (value, encoding) {
        const result = this.encode(value, encoding);

        console.log("urlEncode. 原始文本: " + value);
        console.log("urlEncode. 编码后的文本: " + result);

        return result;
    };

    // 重载2
    urlEncoder.encode.overload("java.lang.String").implementation = function (value) {
        const result = this.encode(value);

        console.log("urlEncode. 原始文本: " + value);
        console.log("urlEncode. 编码后的文本: " + result);

        return result;
    };
}

// 主Hook函数
function main() {
    Java.perform(function () {
        // 加载Java类
        const JavaClasses = {
            base64: Java.use("android.util.Base64"),
            urlEncoder: Java.use("java.net.URLEncoder"),
            stringClass: Java.use("java.lang.String"),
            messageDigest: Java.use("java.security.MessageDigest"),
            secretKey: Java.use("javax.crypto.spec.SecretKeySpec"),
            mac: Java.use("javax.crypto.Mac"),
            cipher: Java.use("javax.crypto.Cipher"),
            ivParameterSpec: Java.use('javax.crypto.spec.IvParameterSpec')
        };

        // Hook消息摘要算法 (MD5, SHA1, SHA256等)
        hookMessageDigest(JavaClasses.messageDigest);

        // Hook密钥
        hookSecretKey(JavaClasses.secretKey);

        // Hook HMAC算法
        hookMac(JavaClasses.mac);

        // Hook加密算法 (AES, DES, RC4, RSA等)
        hookCipher(JavaClasses.cipher, JavaClasses.ivParameterSpec);

        // Hook Base64编码
        hookBase64(JavaClasses.base64);

        // Hook URL编码
        hookUrlEncoder(JavaClasses.urlEncoder);
    });
}


main();

