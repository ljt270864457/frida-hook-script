## Hook脚本导览

### [常用快速定位](common_hook.js)

- Hook ArrayList类型的add,addAll方法
- Hook HashMap类型的put,putAll方法
- Hook StringBuilder类的append方法
- Hook String类的getBytes方法
- Hook Collections类的sort方法
- Hook Toast类的makeText方法
- Hook Base64的encodeToString方法
- Hook java.io.OutputStream的write方法

#### [Json相关Hook脚本](hook_json.js)
- Hook JsonObject类的put,toString方法
- Hook Gson类的toJson方法
- Hook fastjson2的JSON类的toJSONString方法

#### [Hook ok3](hook_request.js)
- Hook java.net.URL的openConnection方法，用于捕获url连接
- Hook java.net.urlConnection的connect方法，用于捕获连接
- Hook ok3的url方法，用于搜索指定url的请求
- Hook ok3的header和addHeader方法，用于捕获添加header
- Hook ok3post form的add方法用于捕获添加form参数
- Hook ok3post json的create方法用于捕获发包json中包含某个关键参数

#### [Hook Java层常用加密算法](hook_enc.js)

1. 编码方式

- Base64

2. 摘要算法

- MD5
- SHA-1
- SHA-256
- SHA-512
- HMAC-MD5
- HMAC-SHA-1
- HMAC-SHA-256
- HMAC-SHA-512
- ...

3. 对称加密算法

- AES
- DES
- 3DES
- RC4
- ...

4. 非对称加密算法

- RSA

#### [绕过反抓包](HookSSL.js)


