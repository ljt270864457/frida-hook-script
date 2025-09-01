function myHook() {
    Java.perform(function () {
        let searchingKey = "v1/search";
        const cronetUrlRequestCls = Java.use("org.chromium.net.impl.CronetUrlRequest");
        // cronetUrlRequestCls.start.implementation = function () {
        //     let url = this.n.value ? this.n.value.toString() : "";
        //     if (url.includes(searchingKey)) {
        //         console.log("\n[Hook] CronetUrlRequest.start() → URL matched:", url);
        //
        //         console.log("[StackTrace]");
        //         // showStacks();
        //
        //         dumpAllFields(this); // 输出所有字段
        //
        //
        //     }
        //     return this.start();
        // };

        // let CronetUploadDataStream = Java.use("org.chromium.net.impl.CronetUploadDataStream");
        // CronetUploadDataStream["onReadSucceeded"].implementation = function (z) {
        //     console.log(`CronetUploadDataStream.onReadSucceeded is called: z=${z}`);
        //     this["onReadSucceeded"](z);
        //     dumpAllFields(this);
        // };


        // let C0592N = Java.use("internal.J.N");
        // C0592N["MuOIsMvf"].implementation = function (obj, j, obj2, i, z, z2, z3, i2, z4, i3, i4, obj3, obj4, i5, i6, obj5, j2) {
        //
        //     let result = this["MuOIsMvf"](obj, j, obj2, i, z, z2, z3, i2, z4, i3, i4, obj3, obj4, i5, i6, obj5, j2);
        //     let url = obj2.toString();
        //     if(url.includes(searchingKey)) {
        //         // console.log(`C0592N.MuOIsMvf is called: obj=${obj}, j=${j}, obj2=${obj2}, i=${i}, z=${z}, z2=${z2}, z3=${z3}, i2=${i2}, z4=${z4}, i3=${i3}, i4=${i4}, obj3=${obj3}, obj4=${obj4}, i5=${i5}, i6=${i6}, obj5=${obj5}, j2=${j2}`);
        //         let bArr = obj3;
        //         let byteBuffer = obj4;
        //         console.log("bArr", bArr);
        //         console.log("byteBuffer", obj4);
        //         // dumpAllFields(obj);
        //         console.log('=============');
        //     }
        //
        //     // console.log(`C0592N.MuOIsMvf result=${result}`);
        //     return result;
        // };

        // let CronetUrlRequest = Java.use("org.chromium.net.impl.CronetUrlRequest");
        // CronetUrlRequest["$init"].implementation = function (cronetUrlRequestContext, str, i, callback, executor, collection, z, z2, z3, z4, i2, z5, i3, listener, i4, j, str2, arrayList, uploadDataProvider, executor2, bArr, byteBuffer, str3) {
        //     console.log(`CronetUrlRequest.$init is called: cronetUrlRequestContext=${cronetUrlRequestContext}, str=${str}, i=${i}, callback=${callback}, executor=${executor}, collection=${collection}, z=${z}, z2=${z2}, z3=${z3}, z4=${z4}, i2=${i2}, z5=${z5}, i3=${i3}, listener=${listener}, i4=${i4}, j=${j}, str2=${str2}, arrayList=${arrayList}, uploadDataProvider=${uploadDataProvider}, executor2=${executor2}, bArr=${bArr}, byteBuffer=${byteBuffer}, str3=${str3}`);
        //     this["$init"](cronetUrlRequestContext, str, i, callback, executor, collection, z, z2, z3, z4, i2, z5, i3, listener, i4, j, str2, arrayList, uploadDataProvider, executor2, bArr, byteBuffer, str3);
        // };


    });
}

function myHook2() {
    Java.perform(function () {
        let searchingKey = "v1/search";

        const base64Class = Java.use("android.util.Base64");
        const stringClass = Java.use("java.lang.String");
        const CronetUrlRequest = Java.use("org.chromium.net.impl.CronetUrlRequest");

        var ByteBuffer = Java.use("java.nio.ByteBuffer");

        //假设你已经有一个 ByteBuffer 实例 byteBuffer
        function toByteArray(byteBuffer) {
            var length = byteBuffer.remaining();
            var byteArray = Java.array('byte', Array(length).fill(0));

            // 复制数据
            var duplicate = byteBuffer.duplicate(); // 避免影响原 position
            duplicate.get(byteArray);
            return byteArray;
        }


        // 处理request
        // let bghc = Java.use("bghc");
        // bghc["read"].implementation = function (uploadDataSink, byteBuffer) {
        //     console.log(`bghc.read is called: uploadDataSink=${uploadDataSink}, byteBuffer=${byteBuffer}`);
        //
        //     this["read"](uploadDataSink, byteBuffer);
        //
        //     let bytesArray = toByteArray(byteBuffer);
        //     // let utf8String = byteArrayToUtf8(bytesArray);
        //     let hexString = byteArrayToHexString(bytesArray);
        //     // console.log("utf8String:", utf8String);
        //     console.log("hexString:", hexString);
        //     showStacks();
        // };

        let CronetUploadDataStream = Java.use("org.chromium.net.impl.CronetUploadDataStream");
        CronetUploadDataStream["readData"].implementation = function (byteBuffer) {
            console.log(`CronetUploadDataStream.readData is called: byteBuffer=${byteBuffer}`);
            this["readData"](byteBuffer);
            let bytesArray = toByteArray(byteBuffer);
            // let utf8String = byteArrayToUtf8(bytesArray);
            let hexString = byteArrayToHexString(bytesArray);
            // console.log("utf8String:", utf8String);
            console.log("hexString:", hexString);
            showStacks();
        };


        // //处理response
        // CronetUrlRequest["onReadCompleted"].implementation = function (byteBuffer, i, i2, i3, j) {
        //     this["onReadCompleted"](byteBuffer, i, i2, i3, j);
        //     let requestUrl = this.n.value ? this.n.value.toString() : "";
        //
        //     if (requestUrl.includes(searchingKey)) {
        //         console.log("requestUrl:", requestUrl);
        //         let bytesArray = toByteArray(byteBuffer);
        //         let utf8String = byteArrayToUtf8(bytesArray);
        //         console.log("utf8String:", utf8String);
        //
        //     }
        // };


    })
}

function gptHook() {
    // let MessageLite = Java.use("com.google.protobuf.MessageLite");
    // MessageLite["toByteArray"].implementation = function () {
    //     console.log(`MessageLite.toByteArray is called`);
    //     let result = this["toByteArray"]();
    //     console.log(`MessageLite.toByteArray hexString=${byteArrayToHexString(result)}`);
    //
    //     showStacks();
    //     return result;
    // };

    // let apjw = Java.use("apjw");
    // apjw["toByteArray"].implementation = function () {
    //     console.log(`apjw.toByteArray is called`);
    //     let result = this["toByteArray"]();
    //     console.log(`MessageLite.toByteArray hexString=${byteArrayToHexString(result)}`);
    //     showStacks();
    //     return result;
    // };


    // Java.openClassFile("/data/local/tmp/com-ljt-gson.dex").load();
    // const gson = Java.use('com.ljt.gson.Gson');
    const acmf = Java.use("acmf");
    const tbl = Java.use("tbl");
    const atpr = Java.use("atpr");
    const atpp = Java.use("atpp");
    const acwb = Java.use("acwb");
    const aplm = Java.use("aplm");
    const atps = Java.use("atps");
    const augv = Java.use("augv");
    const qyz = Java.use("qyz");
    const acut = Java.use("acut");
    const apng = Java.use("apng");
    const qay = Java.use("qay");
    const aplu = Java.use("aplu");
    const auem = Java.use("auem");

    // let aclg = Java.use("aclg");
    // aclg["e"].implementation = function () {
    //
    //     let result = this["e"]();
    //
    //     let build = result.build();
    //     let clazz = build.getClass().getSimpleName();
    //     // if(clazz.includes('ClientInfo')){
    //     if(clazz==='InnertubeContext$ClientInfo'){
    //         InspectJavaUtils.dumpAny(build);
    //         CommonUtils.showStacks();
    //
    //     }
    //
    //     return result;
    // };


    // let acmg = Java.use("acmg");
    // acmg["c"].implementation = function (acmiVar, messageLite, agscVar, yhfVar, yheVar, set, acmhVar, z, apqvVar) {
    //     let result = this["c"](acmiVar, messageLite, agscVar, yhfVar, yheVar, set, acmhVar, z, apqvVar);
    //     console.log(`acmiVar:${acmiVar}`);
    //     InspectJavaUtils.dumpAny(acmiVar);
    //
    //     return result;
    // };


    // acmf["ar"].implementation = function () {
    //     // console.log(`acmf.m71150ar is called`);
    //     let result = this["ar"]();
    //     console.log(`acmf.m71150ar hexString=${byteArrayToHexString(result).slice(0,16)}`);
    //     // showStacks();
    //     return result;
    // };
    //


    // acmf["ar"].implementation = function () {
    //     console.log(`acmf.m71151ar is called`);
    //     let f7076a = this._a.value;
    //     console.log(`f7076a: ${InspectJavaUtils.prettyPrintValue(f7076a)}\n`);
    //     InspectJavaUtils.dumpAny(f7076a.);
    //     let result = this["ar"]();
    //
    //     return result;
    // };


    acmf['ag'].implementation = function (apngVar) {
        // inspect apngVar
        let obj = Java.cast(apngVar, aplm);
        let build = obj.build();
        let classzz = build.getClass().getName();
        // 这是搜索接口的实现类
        if (classzz !== 'auem') {
            return this["ag"](apngVar);
        }
        let result = this["ag"](apngVar);

        console.log('==========');
        InspectJavaUtils.dumpGsonObj(build);
        console.log('==========');
        // console.log(`============apngVar: ${InspectJavaUtils.prettyPrintValue(build)}============`)
        InspectJavaUtils.dumpAny(build);

        return result;

    }

    // acmf["ag"].implementation = function (apngVar) {
    //     // inspect apngVar
    //     let obj = Java.cast(apngVar, aplm);
    //     let build = obj.build();
    //     let classzz = build.getClass().getName();
    //     // 这是搜索接口的实现类
    //     if (classzz !== 'auem') {
    //         return this["ag"](apngVar);
    //     }
    //     console.log(`============apngVar: ${InspectJavaUtils.prettyPrintValue(build)}============`)
    //     InspectJavaUtils.dumpAny(build);
    //
    //     // inspect baseInfo
    //     console.log('============inspect baseInfo(before call)============')
    //     let baseProto = this._a.value.B();
    //     console.log(`baseProto: ${InspectJavaUtils.prettyPrintValue(baseProto)}`);
    //     let instance = Java.cast(baseProto.instance.value, atpr);
    //     InspectJavaUtils.dumpAny(instance);
    //
    //     // // inspect baseInfo.innertubeContext$ClientInfo2
    //     let f65627c = instance.c.value;
    //     console.log(`============baseInfo.f65627c: ${f65627c}============\n`);
    //     InspectJavaUtils.dumpAny(f65627c);
    //     //
    //     // // 查看是否走第一个代码段 if (!this.f7078ab) 这个代码段不走
    //     // console.log(`==================inspect code block 【if (!this.f7078ab)】==================\n`);
    //     // let f7078ab = this._ab.value;
    //     // console.log(`f7078ab: ${f7078ab}\n`);
    //     // // 查看是否走第二个代码段 if (!tblVar.f189241a.isEmpty() && m71260B != null)  这个代码段也不走
    //     // console.log(`==================inspect code block 【if (!tblVar.f189241a.isEmpty() && m71260B != null)】==================\n`);
    //     // let tblVar = Java.cast(this.C.value.a(), tbl);
    //     // console.log(`tblVar: ${tblVar}\n`);
    //     // console.log(`tblVar.f189241a:${tblVar._a.value}\n`);
    //     //
    //     // // 查看第三个代码段
    //     // let tblVar2 = Java.cast(this.H.value.a(), tbl);
    //     // console.log(`tblVar2: ${tblVar2}\n`);
    //     //
    //     // // let atpsVar4 = Java.cast(baseProto.instance.value, atpr).f.value; // 这个值为空，实际走的是下面的
    //     // let atpsVar4 = atps.a.value;
    //     // console.log(`atpsVar4: ${atpsVar4}\n`);
    //     //
    //     // // let augvVar = atpsVar4.f.value; // 这里为null，实际也是走下面的
    //     // // 转为builder4
    //     // let augvVar = augv.a.value;
    //     // console.log(`============augvVar: ${augvVar}============\n`);
    //     // InspectJavaUtils.dumpAny(augvVar);
    //     //
    //     // let f189242b = tblVar2._b.value;
    //     // let f189241a = tblVar2._a.value
    //     // let m12300bk = qyz.bk(f189242b, f189241a);
    //     // console.log(`============f189242b: ${InspectJavaUtils.prettyPrintValue(f189242b)}============\n`);
    //     // // InspectJavaUtils.dumpAny(f189242b);
    //     // console.log(`============f189241a: ${f189241a}============\n`);
    //     // console.log(`============m12300bk: ${InspectJavaUtils.prettyPrintValue(m12300bk)}============\n`);
    //
    //
    //     let result = this["ag"](apngVar);
    //     // var byteArray = result.toByteArray();
    //     //         // console.log("apng 字节数据: " + commonUtils.byteArrayToHexString(byteArray).slice(0, 16));
    //     //         // commonUtils.showStacks();
    //     return result;
    // }

    // 这个是hook acut类枚举值16的方法
    // acut["a"].implementation = function (obj, obj2) {
    //     // 这里的obj1 对应的是apngVar，第二个参数对应的是baseProto
    //     console.log(`acut.mo2544a is called: obj=${obj}, obj2=${obj2}`);
    //     let result = this["a"](obj, obj2);
    //     let obj_build = Java.cast(obj, aplm).build();
    //     let obj2_build = Java.cast(obj2, aplm).build();
    //     let result_build = Java.cast(result, aplm).build();
    //     console.log(`=========obj_build:${obj_build}=========`);
    //     InspectJavaUtils.dumpAny(obj_build);
    //     console.log(`=========obj2_build:${obj2_build}=========`);
    //     InspectJavaUtils.dumpAny(obj2_build);
    //     console.log(`=========result_build:${result_build}=========`);
    //     InspectJavaUtils.dumpAny(result_build);
    //     console.log(`enum value:${this._a.value}`);
    //
    //     // 开始分析result_build中的字段
    //     let result_instance = Java.cast(result_build, auem);
    //     let watch_fields_level1 = ['d', 'j', 'k', 'l', 'm', 'u', 'v', 'w'];
    //     console.log(`============result_instance实例第1级字段:【result_instance】============\n`);
    //     watch_fields_level1.forEach(field => {
    //         let tmp_instance = result_instance[field].value;
    //         let classZZ = tmp_instance.getClass().getName();
    //         console.log(`=======inspect field:result_build.${field}, classzz:${classZZ}==========`);
    //         InspectJavaUtils.dumpAny(tmp_instance);
    //     });
    //     console.log(`============result_instance实例第2级字段:【result_instance.d】============\n`);
    //
    //     let resultInstance_d = Java.cast(result_instance['d'].value,atpr);
    //     let resultInstance_d_watch_fields = ['c','e','f','g','i'];
    //     resultInstance_d_watch_fields.forEach(field => {
    //         let tmp_instance = resultInstance_d[field].value;
    //         let classZZ = tmp_instance.getClass().getName();
    //         console.log(`=======inspect field:result_build.d.${field}, classzz:${classZZ}==========`);
    //         InspectJavaUtils.dumpAny(tmp_instance);
    //     });
    //
    //     let byteArray = Java.cast(result, apng).build().toByteArray();
    //     console.log(CommonUtils.byteArrayToHexdump(byteArray));
    //
    //     let byteArrayJson = ProtobufUtils.decodeMessage(byteArray);
    //     console.log(JSON.stringify(byteArrayJson, null, 2));
    //     return result;
    // };


    // let acuc = Java.use("acuc");
    // acuc["a"].implementation = function (obj, obj2) {
    //     console.log(`acuc.mo2544a is called: obj=${InspectJavaUtils.prettyPrintValue(obj)}, obj2=${InspectJavaUtils.prettyPrintValue(obj2)}`);
    //     let result = this["a"](obj, obj2);
    //     console.log('============after execute============');
    //     InspectJavaUtils.dumpAny(obj2);
    //     // console.log(`acuc.mo2544a result=${result}`);
    //     return result;
    // };


    // let aclb = Java.use("aclb");
    // aclb["B"].implementation = function () {
    //     console.log(`aclb.m71261B is called`);
    //     let result = this["B"]();
    //     // console.log(`aclb.m71261B result=${result}`);
    //     // dumpAllFields(result.buildPartial());
    //     let instance = result.buildPartial();
    //     console.log("instance toString:", instance.toString());
    //
    //     return result;
    // };

    // acmf["$init"].implementation = function (acmiVar, messageLite, agscVar, agpyVar, set, set2, set3, acaqVar, str, str2, ywiVar, z, z2, z3, qveVar, bivVar, acanVar, yyvVar, bivVar2, bfgzVar, yhfVar, yheVar, set4, agskVar, acmhVar, z4, bfgzVar2, bfgzVar3, bdlyVar, acakVar, acakVar2, becbVar, bebgVar, bebgVar2, acljVar, pcnVar, acagVar, bfgzVar4, apqvVar) {
    //     this["$init"](acmiVar, messageLite, agscVar, agpyVar, set, set2, set3, acaqVar, str, str2, ywiVar, z, z2, z3, qveVar, bivVar, acanVar, yyvVar, bivVar2, bfgzVar, yhfVar, yheVar, set4, agskVar, acmhVar, z4, bfgzVar2, bfgzVar3, bdlyVar, acakVar, acakVar2, becbVar, bebgVar, bebgVar2, acljVar, pcnVar, acagVar, bfgzVar4, apqvVar);
    // };

}

// frida -Uf com.kwai.video -l fridaJavaUtils.js -l hook_youtube.js
// frida -Uf com.google.android.youtube -l fridaJavaUtils.js -l hook_youtube.js
//objection -g com.kwai.video explore -s "android sslpinning disable"
//objection -g com.google.android.youtube explore -s "android sslpinning disable" -P ~/.objection/plugins
// function main() {
//     test();
//     // myHook2();
//     gptHook();
// }

setTimeout(gptHook, 3 * 1000);