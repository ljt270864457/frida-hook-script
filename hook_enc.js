// com.example.app2
// frida -U -F  com.example.app2 -l hook_enc.js  --runtime=v8
// frida -U -f  com.example.app2 -l hook_enc.js

function showStacks() {
    console.log(
        Java.use("android.util.Log")
            .getStackTraceString(
                Java.use("java.lang.Throwable").$new()
            )
    );
}


Java.perform(function () {
    const base64Class = Java.use("android.util.Base64");
    const urlEncoder = Java.use("java.net.URLEncoder");
    const stringClass = Java.use("java.lang.String");
    const MessageDigest = Java.use("java.security.MessageDigest");
    const secretKey = Java.use("javax.crypto.spec.SecretKeySpec");
    const mac = Java.use("javax.crypto.Mac");
    const cipher = Java.use("javax.crypto.Cipher");

    function byteArrayToBase64(byteArray) {
        // byte数组转Base64
        return base64Class.encodeToString(byteArray, 0);
    }

    function byteArrayToUtf8(byteArray) {
        // byte数组转UTF-8字符串
        return stringClass.$new(byteArray).toString();
    }

    function byteArrayToHexString(byteArray) {
        // byte数组转16进制字符串
        const codeMap = {
            0: '0',
            1: '1',
            2: '2',
            3: '3',
            4: '4',
            5: '5',
            6: '6',
            7: '7',
            8: '8',
            9: '9',
            10: 'a',
            11: 'b',
            12: 'c',
            13: 'd',
            14: 'e',
            15: 'f'
        };
        let hexString = '';
        for (let i = 0; i < byteArray.length; i++) {
            let code = byteArray[i] & 0xff;
            let hexCode = codeMap[code >> 4] + codeMap[code & 0xf];
            hexString += hexCode;
        }
        return hexString;
    }

    // // Hooking Java 摘要算法 MD5 SHA1 SHA256 ...
    MessageDigest.update.overload('[B').implementation = function (byteArray) {
        // showStacks();
        let algorithm = this.getAlgorithm();
        let oriString = byteArrayToUtf8(byteArray);
        let hexString = byteArrayToHexString(byteArray);
        let base64String = byteArrayToBase64(byteArray);
        console.log('===========Hook到算法: ' + algorithm + '===============')
        console.log("明文-文本：" + oriString);
        console.log("明文-hex：" + hexString);
        console.log("明文-base64：" + base64String);
        return this.update(byteArray);
    }
    MessageDigest.digest.overload('[B').implementation = function (byteArray) {
        // showStacks();
        console.log('===========Hook到算法:' + this.getAlgorithm() + '===============')
        let algorithm = this.getAlgorithm();
        let oriString = byteArrayToUtf8(byteArray);
        let hexString = byteArrayToHexString(byteArray);
        let base64String = byteArrayToBase64(byteArray);
        console.log('===========Hook到算法: ' + algorithm + '===============')
        console.log('===========Hook到算法: ' + algorithm + '===============')
        console.log("加密结果-文本：" + oriString);
        console.log("加密结果-hex：" + hexString);
        console.log("加密结果-base64：" + base64String);
        return this.digest(byteArray);
    }
    MessageDigest.digest.overload('[B', 'int', 'int').implementation = function (byteArray, offset, length) {
        // showStacks();
        console.log('===========Hook到算法:' + this.getAlgorithm() + '===============')
        let algorithm = this.getAlgorithm();
        let oriString = byteArrayToUtf8(byteArray);
        let hexString = byteArrayToHexString(byteArray);
        let base64String = byteArrayToBase64(byteArray);
        console.log('===========Hook到算法: ' + algorithm + '===============')
        console.log("加密结果-文本：" + oriString);
        console.log("加密结果-hex：" + hexString);
        console.log("加密结果-base64：" + base64String);
        return this.digest(byteArray, offset, length);
    }

    // Hook 密钥
    secretKey.$init.overload('[B', 'java.lang.String').implementation = function (key, algorithm) {
        // showStacks();
        let result = this.$init(key, algorithm);
        console.log("=======Hook到密钥算法: " + algorithm + "=======");
        let keyString = byteArrayToUtf8(key);
        let keyHex = byteArrayToHexString(key);
        let keyBase64 = byteArrayToBase64(key);
        console.log("secretKey-明文:  " + keyString);
        console.log("secretKey-hex:  " + keyHex);
        console.log("secretKey-base64:  " + keyBase64);
        return result;
    };

    // Hooking HMac算法
    mac.update.overload('[B').implementation = function (byteArray) {
        // showStacks();
        let algorithm = this.getAlgorithm();
        let oriString = byteArrayToUtf8(byteArray);
        let hexString = byteArrayToHexString(byteArray);
        let base64String = byteArrayToBase64(byteArray);
        console.log('===========Hook到算法:' + algorithm + '===============')
        console.log("明文-文本：" + oriString);
        console.log("明文-hex：" + hexString);
        console.log("明文-base64：" + base64String);
        return this.update(byteArray);
    }
    mac.doFinal.overload('[B').implementation = function (byteArray) {
        // showStacks();
        let result = this.doFinal(byteArray)
        let algorithm = this.getAlgorithm();
        let oriString = byteArrayToUtf8(result);
        let hexString = byteArrayToHexString(result);
        let base64String = byteArrayToBase64(result);
        console.log('===========Hook到算法:' + algorithm + '===============')
        console.log("加密结果-文本：" + oriString);
        console.log("加密结果-hex：" + hexString);
        console.log("加密结果-base64：" + base64String);
        return result;
    }
    mac.doFinal.overload().implementation = function () {
        // showStacks();
        let result = this.doFinal()
        let algorithm = this.getAlgorithm();
        let oriString = byteArrayToUtf8(result);
        let hexString = byteArrayToHexString(result);
        let base64String = byteArrayToBase64(result);
        console.log('===========Hook到算法:' + algorithm + '===============')
        console.log("加密结果-文本：" + oriString);
        console.log("加密结果-hex：" + hexString);
        console.log("加密结果-base64：" + base64String);
        return result;
    }

    // Hooking AES、DES、RC4、RSA等算法
    cipher.init.overload('int', 'java.security.Key', 'java.security.spec.AlgorithmParameterSpec').implementation = function (mode, key, iv) {
        // showStacks();
        let result = this.init(mode, key, iv);
        if (mode !== 1) {
            return result;
        }
        let algorithm = this.getAlgorithm();

        let secretKeyArray = key.getEncoded();
        // let ivArray = iv.getIV();

        let ivArray = Java.cast(iv, Java.use('javax.crypto.spec.IvParameterSpec')).getIV();

        let keyString = byteArrayToUtf8(secretKeyArray);
        let keyHex = byteArrayToHexString(secretKeyArray);
        let keyBase64 = byteArrayToBase64(secretKeyArray);

        let ivString = byteArrayToUtf8(ivArray);
        let ivHex = byteArrayToHexString(ivArray);
        let ivBase64 = byteArrayToBase64(ivArray);
        console.log('===========Hook到算法:' + algorithm + '===============')
        console.log("secretKey-明文:  " + keyString);
        console.log("secretKey-hex:  " + keyHex);
        console.log("secretKey-base64:  " + keyBase64);
        console.log("iv-明文：" + ivString);
        console.log("iv-hex：" + ivHex);
        console.log("iv-base64：" + ivBase64);
        return result;
    }
    cipher.init.overload('int', 'java.security.Key').implementation = function (mode, key) {
        // showStacks();
        let result = this.init(mode, key);
        if (mode !== 1) {
            return result;
        }
        let algorithm = this.getAlgorithm();
        let secretKeyArray = key.getEncoded();

        let keyString = byteArrayToUtf8(secretKeyArray);
        let keyHex = byteArrayToHexString(secretKeyArray);
        let keyBase64 = byteArrayToBase64(secretKeyArray);

        console.log('===========Hook到算法:' + algorithm + '===============')
        console.log("secretKey-明文:  " + keyString);
        console.log("secretKey-hex:  " + keyHex);
        console.log("secretKey-base64:  " + keyBase64);
        return result;
    }
    cipher.update.overload('[B').implementation = function (byteArray) {
        // showStacks();
        let result = this.update(byteArray);
        let algorithm = this.getAlgorithm();
        let oriString = byteArrayToUtf8(byteArray);
        let hexString = byteArrayToHexString(byteArray);
        let base64String = byteArrayToBase64(byteArray);
        console.log('===========Hook到算法:' + algorithm + '===============')
        console.log("明文-文本：" + oriString);
        console.log("明文-hex：" + hexString);
        console.log("明文-base64：" + base64String);
        return result;
    }
    cipher.doFinal.overload('[B').implementation = function (byteArray) {
        // showStacks();
        let result = this.doFinal(byteArray);
        let algorithm = this.getAlgorithm();

        let oriString = byteArrayToUtf8(byteArray);
        let hexString = byteArrayToHexString(byteArray);
        let base64String = byteArrayToBase64(byteArray);

        let resultString = byteArrayToUtf8(result);
        let resultHex = byteArrayToHexString(result);
        let resultBase64 = byteArrayToBase64(result);
        console.log('===========Hook到算法:' + algorithm + '===============')
        console.log("明文-文本：" + oriString);
        console.log("明文-hex：" + hexString);
        console.log("明文-base64：" + base64String);
        console.log("加密结果-文本：" + resultString);
        console.log("加密结果-hex：" + resultHex);
        console.log("加密结果-base64：" + resultBase64);
        return result;
    }


    // Hooking Base64 encodeToString method
    base64Class.encodeToString.overload("[B", "int").implementation = function (value, flag) {
        // showStacks();

        let result = this.encodeToString(value, flag);

        // Convert byte array to string
        let oriString = Java.use("java.lang.String").$new(value).toString();
        console.log("Base64 Hooking. 原始文本: " + oriString);
        console.log("Base64 Hooking. base64之后的文本: " + result);
        return result;
    }
    // Hooking URLEncoder encode method
    urlEncoder.encode.overload("java.lang.String", "java.lang.String").implementation = function (value, encoding) {
        // showStacks();
        let result = this.encode(value, encoding);
        console.log("urlEncode. 原始文本: " + value);
        console.log("urlEncode. 编码后的文本: " + result);
        return result;
    }
    urlEncoder.encode.overload("java.lang.String").implementation = function (value) {
        // showStacks();
        let result = this.encode(value);
        console.log("urlEncode. 原始文本: " + value);
        console.log("urlEncode. 编码后的文本: " + result);
        return result;
    }

});
