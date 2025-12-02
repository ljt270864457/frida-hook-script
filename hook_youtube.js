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
    const aclg = Java.use("aclg");
    let acmg = Java.use("acmg");
    let acni = Java.use("acni");

    // aclg["e"].implementation = function () {
    //
    //     let result = this["e"]();
    //
    //     let build = result.build();
    //     let clazz = build.getClass().getSimpleName();
    //     // if(clazz.includes('ClientInfo')){
    //     if(clazz==='InnertubeContext$ClientInfo'){
    //         InspectJavaUtils.dumpGsonObj(build);
    //         CommonUtils.showStacks();
    //     }
    //     return result;
    // };

    // aclg["a"].implementation = function () {
    //     let request_id = CommonUtils.generateRandomHex(8);
    //
    //     let before_data = this.e().instance.value;
    //
    //     let result = this["a"]();
    //
    //     let stacks_string = CommonUtils.showStacks(false);
    //
    //     if (stacks_string && stacks_string.includes('acmf.ag')) {
    //         console.log(`=========process_started,uuid:${request_id}========`);
    //         InspectJavaUtils.dumpGsonObj(before_data, request_id);
    //         console.log(`=========process_finished,uuid:${request_id}========`)
    //         InspectJavaUtils.dumpGsonObj(result, request_id);
    //         console.log(stacks_string);
    //     }
    //     return result;
    // };

    // let acli = Java.use("acli");
    // acli["d"].implementation = function (aplmVar) {
    //
    //     let stacks_string = CommonUtils.showStacks(false);
    //     if (stacks_string && stacks_string.includes('acmf.ag')){
    //         CommonUtils.logWithTimestamp('====inspect aplmVar(before)====');
    //         InspectJavaUtils.dumpGsonObj(aplmVar.instance.value);
    //         // CommonUtils.logWithTimestamp("=====watch this.b=====");
    //         // InspectJavaUtils.dumpGsonObj(Java.cast(this._b.value.a(),aplu));
    //         this["d"](aplmVar);
    //         // CommonUtils.logWithTimestamp('====inspect aplmVar(after)====');
    //         // InspectJavaUtils.dumpGsonObj(aplmVar.instance.value);
    //         // console.log(stacks_string);
    //     }
    //     this["d"](aplmVar);
    //
    // };


    // let abzb = Java.use("abzb");
    // abzb["a"].implementation = function () {
    //     let i = this.b.value;
    //     let result = this["a"]();
    //     // CommonUtils.logWithTimestamp(i);
    //     if(i===15){
    //         InspectJavaUtils.dumpGsonObj(result);
    //         CommonUtils.showStacks();
    //     }
    //     return result;
    // };

    // let acli = Java.use("acli");
    // acli["d"].implementation = function (aplmVar) {
    //     console.log(`acli.mo4697d is called`);
    //     this["d"](aplmVar);
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

    let lna = Java.use("lna");
    /*
    * auenVar=null
    * akmcVar={"a":false,"b":false}
    * akmaVar = {"a":false,"b":""}
    * */
    // lna["a"].implementation = function (auenVar, akmcVar, akmaVar) {
    //     console.log(`lna.m20542a is called,auenVar:${auenVar},akmcVar:${akmcVar},akmaVar:${akmaVar}`);
    //
    //     if (auenVar != null) {
    //         InspectJavaUtils.dumpGsonObj(auenVar);
    //     }
    //     if (akmcVar != null) {
    //         InspectJavaUtils.dumpGsonObj(akmcVar);
    //     }
    //     if (akmaVar != null) {
    //         InspectJavaUtils.dumpGsonObj(akmaVar);
    //     }
    //     let lnbVar2 = this.b.value;
    //     console.log(`lnbVar:${lnbVar2}`);
    //     let acwdVar = lnbVar2._g.value;
    //     console.log(`acwdVar:${acwdVar}`);
    //     let m70908d = acwdVar.d();
    //
    //     // console.log(`m70908d ${m70908d}`);
    //     // InspectJavaUtils.dumpAny(m70908d);
    //
    //     this["a"](auenVar, akmcVar, akmaVar);
    // };


    acmf["ag"].implementation = function (apngVar) {

        let hook = false;
        // inspect apngVar
        let obj = Java.cast(apngVar, aplm);
        let dump_result = InspectJavaUtils.dumpGsonObj(obj, false);
        if (dump_result && dump_result.includes('gamer')) {
            console.log('=====call ag=====');
            // console.log('=====apngVar=====');
            // {"A":"","D":2,"b":1016076514,"c":0,"e":"gamer robot live now","f":0,"g":"","h":"","i":0,"j":{"memoizedSerializedSize":0,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":0},"k":{"b":[],"memoizedSerializedSize":0,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":0},"l":{"b":6039383,"c":4,"d":1,"e":"youtube-android-pb","f":1,"g":[],"i":"","j":{"b":11,"c":0,"d":0,"e":[],"f":0,"memoizedSerializedSize":2147483647,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":0},"k":[{"b":11,"c":0,"d":0,"e":[],"f":0,"memoizedSerializedSize":2147483647,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":0},{"b":11,"c":1,"d":0,"e":[],"f":0,"memoizedSerializedSize":2147483647,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":0},{"b":11,"c":2,"d":0,"e":[],"f":0,"memoizedSerializedSize":2147483647,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":0},{"b":11,"c":3,"d":0,"e":[],"f":0,"memoizedSerializedSize":2147483647,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":0},{"b":11,"c":4,"d":0,"e":[],"f":0,"memoizedSerializedSize":2147483647,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":0},{"b":11,"c":5,"d":0,"e":[],"f":0,"memoizedSerializedSize":2147483647,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":0},{"b":11,"c":6,"d":0,"e":[],"f":0,"memoizedSerializedSize":2147483647,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":0},{"b":11,"c":7,"d":0,"e":[],"f":0,"memoizedSerializedSize":2147483647,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":0},{"b":11,"c":8,"d":0,"e":[],"f":0,"memoizedSerializedSize":2147483647,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":0},{"b":11,"c":9,"d":0,"e":[],"f":0,"memoizedSerializedSize":2147483647,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":0}],"l":false,"m":0,"n":2600,"o":0,"p":0,"q":0,"r":0,"s":"","t":"0000+01","memoizedSerializedSize":2147483647,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":0},"m":{"b":[],"c":[],"memoizedSerializedSize":2147483647,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":0},"n":"","o":false,"p":"","q":false,"r":"","s":[],"t":5,"u":{"b":7,"c":"com.android.chrome","d":463807433,"e":false,"f":"","memoizedSerializedSize":2147483647,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":0},"v":{"b":10,"c":false,"d":true,"memoizedSerializedSize":2147483647,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":0},"w":{"b":3,"c":false,"d":"","memoizedSerializedSize":2147483647,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":0},"x":"","memoizedSerializedSize":-1,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":0}
            // apngVar就是搜索相关的参数
            let dump_obj = JSON.parse(dump_result);
            console.log(JSON.stringify(dump_obj.instance));

            // 主动调用this.f7076a.m4208B()
            console.log('主动调用了this.f7076a.m4208B()');
            InspectJavaUtils.dumpGsonObj(this._a.value.B().instance.value);// 这里就是设备请求参数信息
            //{"b":293,"c":{"A":"Qualcomm;SM8150","B":3,"C":{"b":0,"c":"","d":"","e":"","memoizedSerializedSize":2147483647,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":0},"D":0,"E":411,"F":853,"G":411,"H":853,"I":2.677167,"J":5.5262127,"K":4,"L":3.5,"M":1,"N":{"b":12,"c":"","d":0,"e":"46009","f":false,"memoizedSerializedSize":2147483647,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":0},"O":253133029,"P":4,"Q":480,"R":"Asia/Shanghai","S":1,"T":{"a":[32,-29,-6,-99,-89,-58,-45,-23,-29,125,32,-53,-78,-85,-120,-99,-39,-114,-52,-106,1,32,-36,-48,-119,-121,-58,-30,-2,-34,119,32,-7,-18,-18,-13,-69,-2,-53,-54,35,32,-111,-33,-113,-99,-120,-8,-23,-39,124,32,-21,-14,-58,-27,-12,-38,-66,-23,60,32,-41,-42,-45,-101,-28,-77,-37,-95,-19,1,32,-72,-103,-103,-70,-70,-85,-71,-8,-44,1,32,-89,-122,-109,-96,-103,-53,-60,-60,25,32,-19,-22,-6,-18,-28,-10,-45,-104,-29,1,32,-90,-82,-99,-56,-25,-51,-99,-20,-40,1,32,-54,-75,-30,-80,-70,-6,-114,-40,-25,1,32,-123,-8,-84,-21,-26,-11,-116,-14,-55,1,32,-36,-125,-79,-52,-120,-5,-102,-74,82,32,-45,-118,-61,-6,-26,-63,-82,-97,81,32,-88,-73,-20,-10,-40,-60,-116,-50,49,32,-16,-42,-51,-19,-61,-64,-3,-101,-70,1,32,-127,-59,-25,-39,-9,-108,-41,-35,101,32,-64,-30,-47,-69,-118,-47,-107,-8,43,32,-44,-92,-5,-92,-18,-60,-104,-14,77,32,-83,-61,-96,-7,-98,-103,-49,-90,-82,1,32,-65,-73,-118,-103,-119,-27,-107,-8,50,32,-61,-3,-127,-63,-77,-26,-44,-103,-95,1,32,-116,-59,-126,-62,-6,-108,-117,-30,-53,1,32,-102,-40,-93,-49,-103,-68,-121,-119,80,32,-12,-45,-61,-8,-116,-88,-101,-65,-92,1,32,-53,-23,-48,-34,-117,-95,-113,-4,-53,1,32,-55,-119,-79,-72,-49,-124,-31,-60,-34,1,32,-112,-116,-112,-11,-80,-35,-81,-94,88,32,-23,-96,-84,-126,-118,-70,-47,-74,-29,1,32,-38,-101,-111,-95,-127,-35,-14,-86,-44,1,32,-7,-128,-42,-9,-54,-44,-82,-57,3,32,-39,-60,-120,-11,-111,-115,-62,-90,96,32,-34,-93,-26,-29,-76,-85,-5,-127,53,32,-94,-113,-12,-64,-110,-66,-13,-70,109,32,-43,-67,-76,-12,-62,-84,-40,-51,54,32,-109,-53,-127,-87,-89,-77,-120,-70,-19,1,32,-24,-101,-16,-100,-101,-51,-31,-113,69,32,-122,-33,-88,-15,-82,-62,-86,-47,-126,1,32,-40,-3,-2,-68,-86,-38,-94,-102,12,32,-70,-64,-39,-38,-59,-75,-92,-108,43,32,-86,-44,-73,-100,-96,-114,-107,-112,40,32,-16,-127,-106,-47,-28,-35,-43,-42,95,32,-6,-35,-46,-83,-41,-94,-95,-7,17],"c":793508933},"U":"","V":4,"W":5596788,"X":{"b":3,"c":1,"d":1900747,"memoizedSerializedSize":2147483647,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":0},"Y":[{"b":1,"c":{"b":5,"c":1942,"d":1,"memoizedSerializedSize":5,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":5962122},"memoizedSerializedSize":7,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":316499457}],"Z":[],"aa":false,"b":-956301294,"c":-403159757,"d":4663348,"e":77,"f":1.0,"g":"","h":"zh-CN","i":false,"j":"","k":"CN","m":"","n":"","o":"","p":[],"q":[{"b":5,"c":{"a":[24,-40,-43,-115,7],"c":164073738},"d":[{"a":[8,3,18,0],"c":3935853},{"a":[8,3,18,7,21,2,-82,-11,-74,16,16],"c":1918828295},{"a":[8,3,18,11,21,14,-108,-30,-74,16,-83,1,-19,1,16],"c":1804401060},{"a":[8,3,18,13,21,12,-108,-30,-74,16,-83,1,-74,4,-65,4,16],"c":-156611005}],"e":false,"memoizedSerializedSize":64,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":1568547988}],"r":3,"s":32,"t":"20.09.39","u":"Google","v":"google","w":"Pixel 4 XL","x":{"b":6,"c":"","d":3,"e":2,"memoizedSerializedSize":4,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":515524},"y":"Android","z":"12","memoizedSerializedSize":2147483647,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":0},"e":{"b":260,"c":"","d":false,"e":false,"f":"","memoizedSerializedSize":2147483647,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":0},"g":{"b":1,"c":{"a":[],"c":0},"memoizedSerializedSize":2147483647,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":0},"h":"","i":{"b":112,"c":[{"b":1,"c":2,"d":"CpYFmsA_ATEaQAHInBRcfdPe_fIf-nFTWH3XAZM2BbDaBTSS8yyEU_3sjkbclhkNWRvcvDlKhyHMUv-5mWP5V3KqXjA_nelEL_ESzAR_0fwbAdQvg86IqtrTjUAzZUvn03JeOBDlYzbdjffotNs_GPBoCiLbaUYMGI7B2m7bGeqdypnr3RWFcIpyeqwR2QGcnmfN7e70VHk1G5wSV4-EkDR1qBB782NecIMoR9eVcAuP5QZPoRSkZ_JYM031zKdHM33QSA-6cnjXiOG029xBI6pV53-da4IFDNiU-ksj6w6EmHPS5V1ihysMqSCTDfu_IqM25H2_TJd19Ld6CkWNg6tey2KaDyrOxh5R8HZsTGbWA5irIufmIMVrpr-uPpCYuEmkThZN6lgPrbVb4VUcYvPSZAOmwDVoxsoVTQ0ggZ-zvURYRRZhb1BFMMFmG4Nb8deszG2jP8A0NLmHHLdIT_HmXJpeLF0K6Hd90JAJgEwDFvTHhTSVMoR6v-BPcFXuvalxkafG5tfmv_yHkLnDx-Nvc965QdblPRaCGM_Udp4WYsd0AgGDaU6JFkQD4Qxb2YzLYDzF3iL-OBG5cio7PwjOHEGNwT91Junsy8ePck-GyiFl2DRYHHyZn7W6VnpONI2uBQlNFIdu-lyqPtVrdTDFtVyH1raEVPLh1hNo-r3AlMyE6bRQTFZPMeai_uCI50JP5cdHirXgYs7-NrYiEHvpcDwdPX2gTRSwXF-RhOpsmOj8WlaK5YOy20k_UaTnZ2KLgvDzd0WE4sZckn8E8IOIdZZ2KsBAt4g7WribojyUlbcEZtVg4GDplD2t1AtFCTV1xAhtgfDyOKJMPS3VYuze74T8mQOqyI5NCu0d1ImBs8uJj9xnjSsgBA","e":"ms","g":1,"memoizedSerializedSize":2147483647,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":0}],"d":"90b5608d-3ff6-4092-b3f8-15d104bcdab5","e":5,"f":false,"g":"","i":1,"memoizedSerializedSize":2147483647,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":0},"j":[],"l":2,"memoizedSerializedSize":-1,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":0}
            hook = true;
        }


        var result = this["ag"](apngVar);
        var byteArray = result.toByteArray();
        // console.log("apng 字节数据: " + CommonUtils.byteArrayToHexString(byteArray).slice(0, 16));
        if (hook) {
            // console.log(CommonUtils.byteArrayToHexdump(byteArray));
        }

        // CommonUtils.showStacks();
        return result;
    }

    // var aclb = Java.use("aclb");
    // aclb["B"].implementation = function () {
    //     console.log(`aclb.m4208B is called`);
    //     let result = this["B"]();
    //     console.log(`aclb.m4208B result=${result}`);
    //     InspectJavaUtils.dumpGsonObj(result.instance.value);
    //     return result;
    // };
    // var aclb = Java.use("aclb");
    // aclb["f"].implementation = function () {
    //     console.log(`aclb.m4212f is called`);
    //     let result = this["f"]();
    //     console.log(`agplVar:${this._o.value},f6846u:${this._u.value}，result=${result}`);
    //
    //     // InspectJavaUtils.dumpAny(this);
    //     return result;
    // };


    // var aclb = Java.use("aclb");
    // aclb["$init"].implementation = function (str, tblVar, agplVar, i, z, optional, str2, bool, z2, z3) {
    //     console.log(`aclb.$init is called: agplVar=${agplVar}`);
    //     this["$init"](str, tblVar, agplVar, i, z, optional, str2, bool, z2, z3);
    // };

    // var acmi = Java.use("acmi");
    //
    // acmi["$init"].overload('java.lang.String', 'tbl', 'agpl', 'int', 'boolean', 'j$.util.Optional', 'boolean').implementation = function (str, tblVar, agplVar, i, z, optional, z2) {
    //     console.log(`333acmi.$init is called: str=${str}, tblVar=${tblVar}, agplVar=${agplVar}, i=${i}, z=${z}, optional=${optional}, z2=${z2}`);
    //     this["$init"](str, tblVar, agplVar, i, z, optional, z2);
    //
    // };
    //

    // acwb["$init"].implementation = function (tblVar, agplVar, z, optional, z2) {
    //     console.log(`111acwb.$init is called: tblVar=${tblVar}, agplVar=${agplVar}, z=${z}, optional=${optional}, z2=${z2}`);
    //     this["$init"](tblVar, agplVar, z, optional, z2);
    //     // CommonUtils.showStacks();
    // };

    // var acwd = Java.use("acwd");
    // acwd["d"].implementation = function () {
    //     console.log(`acwd.m4646d is called`);
    //     let result = this["d"]();
    //     console.log(`acwd.m4646d result=${result}`);
    //     console.log(`this.this.f7830d =${this._d.value.h()}`);
    //     // InspectJavaUtils.dumpGsonObj(result);
    //     // InspectJavaUtils.dumpAny(result);
    //     return result;
    // };


    // var acwd = Java.use("acwd");
    // acwd["$init"].implementation = function (tblVar, agpmVar, yqoVar, acagVar, set, acwaVar, ynkVar, acanVar, aobhVar, acakVar) {
    //     console.log(`acwd.$init is called: tblVar=${tblVar}, agpmVar=${agpmVar}, yqoVar=${yqoVar}, acagVar=${acagVar}, set=${set}, acwaVar=${acwaVar}, ynkVar=${ynkVar}, acanVar=${acanVar}, aobhVar=${aobhVar}, acakVar=${acakVar}`);
    //     this["$init"](tblVar, agpmVar, yqoVar, acagVar, set, acwaVar, ynkVar, acanVar, aobhVar, acakVar);
    // };

    // var acwd = Java.use("acwd");
    // acwd["a"].implementation = function (ajboVar) {
    //     console.log(`acwd.mo4374a is called: ajboVar=${ajboVar}`);
    //     let result = this["a"](ajboVar);
    //     console.log(`acwd.mo4374a result=${result}`);
    //     return result;
    // };
    // var acwd = Java.use("acwd");
    // acwd["$init"].implementation = function (tblVar, agpmVar, yqoVar, acagVar, set, acwaVar, ynkVar, acanVar, aobhVar, acakVar) {
    //     console.log(`acwd.$init is called:  agpmVar=${agpmVar}`);
    //     this["$init"](tblVar, agpmVar, yqoVar, acagVar, set, acwaVar, ynkVar, acanVar, aobhVar, acakVar);
    // };

    var gcb = Java.use("gcb");
    gcb["j"].implementation = function () {

        let result = this["j"]();
        let bValue = this._b.value;
        if (bValue === 803) {
            // console.log(`gcb.m48175j is called`);
            console.log(`gcb.m48175j result=${result}，int i = ${this._b.value},a = ${this._a.value}`);
            // console.log("bValue:", bValue);
        }
        return result;
    };

    // var gcb = Java.use("gcb");
    // gcb["$init"].implementation = function (gbxVar, i) {
    //     console.log(`gcb.$init is called: gbxVar=${gbxVar}, i=${i}`);
    //     if (i === 803) {
    //     }
    //     this["$init"](gbxVar, i);
    //
    // };

    // var bdcv = Java.use("bdcv");
    // bdcv["b"].implementation = function (bdcvVar, bddaVar) {
    //     console.log(`bdcv.m31394b is called: bdcvVar=${bdcvVar}, bddaVar=${bddaVar}`);
    //     this["b"](bdcvVar, bddaVar);
    //     CommonUtils.showStacks();
    // };
    //
    // var gap = Java.use("gap");
    // gap["$init"].implementation = function (gbxVar, gehVar, fzpVar, gedVar, i) {
    //     console.log(`gap.$init is called: gbxVar=${gbxVar}, gehVar=${gehVar}, fzpVar=${fzpVar}, gedVar=${gedVar}, i=${i}`);
    //     this["$init"](gbxVar, gehVar, fzpVar, gedVar, i);
    // };


    aclg["e"].implementation = function () {


        let result = this["e"]();
        let stacks = CommonUtils.showStacks(false);
        if (stacks.includes('acmf.ag')) {
            console.log(`aclg.m4236e is called`);
            // CommonUtils.showStacks();
            InspectJavaUtils.dumpGsonObj(result.instance.value);
        }
        return result;
    };

    aclg["a"].implementation = function () {
        let result = this["a"]();
        let stacks = CommonUtils.showStacks(false);
        if (stacks.includes('acmf.ag')) {
            console.log(`aclg.m4232a is called`);
            // console.log(`aclg.m4232a result=${result}`);
            InspectJavaUtils.dumpGsonObj(result);
            // CommonUtils.showStacks();
        }
        return result;
    };

    var abzb = Java.use("abzb");
    abzb["a"].implementation = function () {
        let stacks = CommonUtils.showStacks(false);
        let result = this["a"]();
        let bValue = this.b.value;
        if (bValue === 15 && stacks.includes('acmf.ag')) {
            console.log(`abzb.mo3473a is called`);
            InspectJavaUtils.dumpGsonObj(result);
            console.log(`this.b:${this.b.value}`);
        }
        return result;
    };
    var acli = Java.use("acli");
    acli["d"].implementation = function (aplmVar) {
        let stacks = CommonUtils.showStacks(false);
        if (stacks.includes('acmf.ag')) {
            console.log(`acli.mo3458d is called`);
            console.log('111111111111111');
            InspectJavaUtils.dumpGsonObj(aplmVar.instance.value);
        }
        this["d"](aplmVar);
        if (stacks.includes('acmf.ag')) {
            console.log('222222222222222');
            InspectJavaUtils.dumpGsonObj(aplmVar.instance.value);
        }
    };


    // acmf["$init"].implementation = function (acmiVar, messageLite, agscVar, agpyVar, set, set2, set3, acaqVar, str, str2, ywiVar, z, z2, z3, qveVar, bivVar, acanVar, yyvVar, bivVar2, bfgzVar, yhfVar, yheVar, set4, agskVar, acmhVar, z4, bfgzVar2, bfgzVar3, bdlyVar, acakVar, acakVar2, becbVar, bebgVar, bebgVar2, acljVar, pcnVar, acagVar, bfgzVar4, apqvVar) {
    //
    //     this["$init"](acmiVar, messageLite, agscVar, agpyVar, set, set2, set3, acaqVar, str, str2, ywiVar, z, z2, z3, qveVar, bivVar, acanVar, yyvVar, bivVar2, bfgzVar, yhfVar, yheVar, set4, agskVar, acmhVar, z4, bfgzVar2, bfgzVar3, bdlyVar, acakVar, acakVar2, becbVar, bebgVar, bebgVar2, acljVar, pcnVar, acagVar, bfgzVar4, apqvVar);
    //     let className = acmiVar.getClass().getName();
    //     if (className==='acwb'){
    //         console.log(`acmf.$init is called: acmiVar=${acmiVar}`);
    //         // 关键点在B方法中
    //         let device_info = acmiVar.B().instance.value;
    //         console.log(device_info);
    //
    //         InspectJavaUtils.dumpGsonObj(device_info);
    //         // InspectJavaUtils.dumpAny(acmiVar);
    //     }
    //
    //
    //     try {
    //         // InspectJavaUtils.dumpAny(acmiVar);
    //         // let keyword = 'gamer';
    //         // let instance = Java.cast(acmiVar,acwb);
    //         // console.log(` =======acmiVar.F =======`);
    //         // InspectJavaUtils.dumpGsonObj(instance.F.value);
    //         // console.log(` =======acmiVar.R =======`);
    //         // InspectJavaUtils.dumpGsonObj(instance.R.value);
    //         // console.log(` =======acmiVar.c =======`);
    //         // InspectJavaUtils.dumpGsonObj(instance._c.value);
    //         // console.log(` =======acmiVar.d =======`);
    //         // InspectJavaUtils.dumpGsonObj(instance.d.value);
    //         // console.log(` =======acmiVar.e =======`);
    //         // InspectJavaUtils.dumpGsonObj(instance.e.value);
    //         // CommonUtils.showStacks();
    //     }
    //     catch (e) {
    //
    //     }
    //
    // };

    // var printTrace = true;
    // var aclb = Java.use("aclb");
    // aclb["C"].implementation = function (aplmVar) {
    //     if (printTrace) {
    //         console.log(`aclb.m4209C is called start: aplmVar=${aplmVar}`);
    //         InspectJavaUtils.dumpGsonObj(aplmVar.instance.value);
    //         CommonUtils.showStacks();
    //         printTrace = false;
    //     }
    //     this["C"](aplmVar);
    //     // if(printTrace ) {
    //     //     console.log(`aclb.m4209C is called finish: aplmVar=${aplmVar}`);
    //     //     InspectJavaUtils.dumpGsonObj(aplmVar.instance.value);
    //     //     CommonUtils.showStacks();
    //     //     printTrace = false;
    //     // }
    // };


    // acmg["c"].implementation = function (acmiVar, messageLite, agscVar, yhfVar, yheVar, set, acmhVar, z, apqvVar) {
    //     console.log(`acmg.m71146c is called: acmiVar=${acmiVar}`);
    //     let result = this["c"](acmiVar, messageLite, agscVar, yhfVar, yheVar, set, acmhVar, z, apqvVar);
    //     return result;
    // };
    //
    // acmg["a"].implementation = function (acmiVar, messageLite, agscVar, yhfVar, yheVar) {
    //     console.log(`acmg.m71148a is called: acmiVar=${acmiVar}`);
    //     let result = this["a"](acmiVar, messageLite, agscVar, yhfVar, yheVar);
    //     // console.log(`acmg.m71148a result=${result}`);
    //     return result;
    // };
    //
    // let acnf = Java.use("acnf");
    //
    //
    // acnf["g"].implementation = function (acmiVar, agscVar, acmhVar) {
    //     console.log(`acnf.m71118g is called: acmiVar=${acmiVar}`);
    //     this["g"](acmiVar, agscVar, acmhVar);
    // };
    //

    // acni["m"].implementation = function (acmiVar, acngVar, agscVar, acmhVar) {
    //     console.log(`acni.m71111m is called: acmiVar=${acmiVar}`);
    //     this["m"](acmiVar, acngVar, agscVar, acmhVar);
    // };
    // acni["l"].implementation = function (acmiVar, acngVar, agscVar) {
    //     console.log(`acni.m71112l is called: acmiVar=${acmiVar}`);
    //     this["l"](acmiVar, acngVar, agscVar);
    // };

    // acni["k"].implementation = function (acmiVar, agscVar) {
    //     console.log(`acni.m71113k is called: acmiVar=${acmiVar}`);
    //     // 分析k函数的第一个参数
    //     // 直接序列化为Gson会报错。所以改用dumpAny处理
    //     InspectJavaUtils.dumpAny(acmiVar);
    //
    //     let acmi_instance = Java.cast(acmiVar, acwb);
    //     console.log(` =======acmiVar.F =======`);
    //     InspectJavaUtils.dumpGsonObj(acmi_instance.F.value);
    //     console.log(` =======acmiVar.R =======`);
    //     InspectJavaUtils.dumpGsonObj(acmi_instance.R.value.instance.value);
    //     console.log(` =======acmiVar.c =======`);
    //     InspectJavaUtils.dumpGsonObj(acmi_instance._c.value);
    //     console.log(` =======acmiVar.d =======`);
    //     InspectJavaUtils.dumpGsonObj(acmi_instance.d.value);
    //     console.log(` =======acmiVar.e =======`);
    //     InspectJavaUtils.dumpGsonObj(acmi_instance.e.value);
    //
    //     // 分析k函数的第二个参数
    //     console.log(` =======agscVar =======`);
    //     // InspectJavaUtils.dumpAny(agscVar);
    //     console.log(`agscVar=${agscVar}`);
    //     this["k"](acmiVar, agscVar);
    // };

    // 这个是发起请求最开始的地方
    // var lnb = Java.use("lnb");
    // lnb["z"].implementation = function (str, z, akmcVar, akmaVar) {
    //     console.log(`lnb.m56945z is called: str=${str}, z=${z}, akmcVar=${akmcVar}, akmaVar=${akmaVar}`);
    //     InspectJavaUtils.dumpGsonObj(akmcVar);
    //     InspectJavaUtils.dumpGsonObj(akmaVar);
    //
    //
    //     this["z"](str, z, akmcVar, akmaVar);
    //     CommonUtils.showStacks();
    // };


    // 这个是hook acut类枚举值16的方法
    // acut["a"].implementation = function (obj, obj2) {
    //     // 这里的obj1 对应的是apngVar，第二个参数对应的是baseProto
    //     console.log(`acut.mo2544a is called: obj=${obj}, obj2=${obj2},this.f7726a=${this._a.value}`);
    //     console.log('=====watch obj=======');
    //     // InspectJavaUtils.dumpGsonObj(obj.instance);
    //     let obj_instance = Java.cast(obj, aplm);
    //     InspectJavaUtils.dumpGsonObj(obj_instance.instance.value);
    //
    //     console.log('=====watch obj2=======');
    //     // InspectJavaUtils.dumpGsonObj(obj.instance);
    //     let obj2_instance = Java.cast(obj2, aplm);
    //     InspectJavaUtils.dumpGsonObj(obj2_instance.instance.value);
    //
    //     let result = this["a"](obj, obj2);
    //     // let byteArray = Java.cast(result, apng).build().toByteArray();
    //     // console.log(CommonUtils.byteArrayToHexdump(byteArray));
    //
    //     // let byteArrayJson = ProtobufUtils.decodeMessage(byteArray);
    //     // console.log(JSON.stringify(byteArrayJson, null, 2));
    //
    //     CommonUtils.showStacks();
    //     return result;
    // };


}

function gptHook3() {
    const acmf = Java.use("acmf");
    const aplm = Java.use("aplm");
    const aclg = Java.use("aclg");

    // acmf["ag"].implementation = function (apngVar) {
    //
    //     let hook = false;
    //     // inspect apngVar
    //     let obj = Java.cast(apngVar, aplm);
    //     let dump_result = InspectJavaUtils.dumpGsonObj(obj, false);
    //     if (dump_result && dump_result.includes('gamer')) {
    //         console.log('=====call ag=====');
    //         // console.log('=====apngVar=====');
    //         // {"A":"","D":2,"b":1016076514,"c":0,"e":"gamer robot live now","f":0,"g":"","h":"","i":0,"j":{"memoizedSerializedSize":0,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":0},"k":{"b":[],"memoizedSerializedSize":0,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":0},"l":{"b":6039383,"c":4,"d":1,"e":"youtube-android-pb","f":1,"g":[],"i":"","j":{"b":11,"c":0,"d":0,"e":[],"f":0,"memoizedSerializedSize":2147483647,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":0},"k":[{"b":11,"c":0,"d":0,"e":[],"f":0,"memoizedSerializedSize":2147483647,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":0},{"b":11,"c":1,"d":0,"e":[],"f":0,"memoizedSerializedSize":2147483647,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":0},{"b":11,"c":2,"d":0,"e":[],"f":0,"memoizedSerializedSize":2147483647,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":0},{"b":11,"c":3,"d":0,"e":[],"f":0,"memoizedSerializedSize":2147483647,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":0},{"b":11,"c":4,"d":0,"e":[],"f":0,"memoizedSerializedSize":2147483647,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":0},{"b":11,"c":5,"d":0,"e":[],"f":0,"memoizedSerializedSize":2147483647,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":0},{"b":11,"c":6,"d":0,"e":[],"f":0,"memoizedSerializedSize":2147483647,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":0},{"b":11,"c":7,"d":0,"e":[],"f":0,"memoizedSerializedSize":2147483647,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":0},{"b":11,"c":8,"d":0,"e":[],"f":0,"memoizedSerializedSize":2147483647,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":0},{"b":11,"c":9,"d":0,"e":[],"f":0,"memoizedSerializedSize":2147483647,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":0}],"l":false,"m":0,"n":2600,"o":0,"p":0,"q":0,"r":0,"s":"","t":"0000+01","memoizedSerializedSize":2147483647,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":0},"m":{"b":[],"c":[],"memoizedSerializedSize":2147483647,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":0},"n":"","o":false,"p":"","q":false,"r":"","s":[],"t":5,"u":{"b":7,"c":"com.android.chrome","d":463807433,"e":false,"f":"","memoizedSerializedSize":2147483647,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":0},"v":{"b":10,"c":false,"d":true,"memoizedSerializedSize":2147483647,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":0},"w":{"b":3,"c":false,"d":"","memoizedSerializedSize":2147483647,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":0},"x":"","memoizedSerializedSize":-1,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":0}
    //         // apngVar就是搜索相关的参数
    //         let dump_obj = JSON.parse(dump_result);
    //         console.log(JSON.stringify(dump_obj.instance));
    //
    //         // 主动调用this.f7076a.m4208B()
    //         console.log('主动调用了this.f7076a.m4208B()');
    //         InspectJavaUtils.dumpGsonObj(this._a.value.B().instance.value);// 这里就是设备请求参数信息
    //         //{"b":293,"c":{"A":"Qualcomm;SM8150","B":3,"C":{"b":0,"c":"","d":"","e":"","memoizedSerializedSize":2147483647,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":0},"D":0,"E":411,"F":853,"G":411,"H":853,"I":2.677167,"J":5.5262127,"K":4,"L":3.5,"M":1,"N":{"b":12,"c":"","d":0,"e":"46009","f":false,"memoizedSerializedSize":2147483647,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":0},"O":253133029,"P":4,"Q":480,"R":"Asia/Shanghai","S":1,"T":{"a":[32,-29,-6,-99,-89,-58,-45,-23,-29,125,32,-53,-78,-85,-120,-99,-39,-114,-52,-106,1,32,-36,-48,-119,-121,-58,-30,-2,-34,119,32,-7,-18,-18,-13,-69,-2,-53,-54,35,32,-111,-33,-113,-99,-120,-8,-23,-39,124,32,-21,-14,-58,-27,-12,-38,-66,-23,60,32,-41,-42,-45,-101,-28,-77,-37,-95,-19,1,32,-72,-103,-103,-70,-70,-85,-71,-8,-44,1,32,-89,-122,-109,-96,-103,-53,-60,-60,25,32,-19,-22,-6,-18,-28,-10,-45,-104,-29,1,32,-90,-82,-99,-56,-25,-51,-99,-20,-40,1,32,-54,-75,-30,-80,-70,-6,-114,-40,-25,1,32,-123,-8,-84,-21,-26,-11,-116,-14,-55,1,32,-36,-125,-79,-52,-120,-5,-102,-74,82,32,-45,-118,-61,-6,-26,-63,-82,-97,81,32,-88,-73,-20,-10,-40,-60,-116,-50,49,32,-16,-42,-51,-19,-61,-64,-3,-101,-70,1,32,-127,-59,-25,-39,-9,-108,-41,-35,101,32,-64,-30,-47,-69,-118,-47,-107,-8,43,32,-44,-92,-5,-92,-18,-60,-104,-14,77,32,-83,-61,-96,-7,-98,-103,-49,-90,-82,1,32,-65,-73,-118,-103,-119,-27,-107,-8,50,32,-61,-3,-127,-63,-77,-26,-44,-103,-95,1,32,-116,-59,-126,-62,-6,-108,-117,-30,-53,1,32,-102,-40,-93,-49,-103,-68,-121,-119,80,32,-12,-45,-61,-8,-116,-88,-101,-65,-92,1,32,-53,-23,-48,-34,-117,-95,-113,-4,-53,1,32,-55,-119,-79,-72,-49,-124,-31,-60,-34,1,32,-112,-116,-112,-11,-80,-35,-81,-94,88,32,-23,-96,-84,-126,-118,-70,-47,-74,-29,1,32,-38,-101,-111,-95,-127,-35,-14,-86,-44,1,32,-7,-128,-42,-9,-54,-44,-82,-57,3,32,-39,-60,-120,-11,-111,-115,-62,-90,96,32,-34,-93,-26,-29,-76,-85,-5,-127,53,32,-94,-113,-12,-64,-110,-66,-13,-70,109,32,-43,-67,-76,-12,-62,-84,-40,-51,54,32,-109,-53,-127,-87,-89,-77,-120,-70,-19,1,32,-24,-101,-16,-100,-101,-51,-31,-113,69,32,-122,-33,-88,-15,-82,-62,-86,-47,-126,1,32,-40,-3,-2,-68,-86,-38,-94,-102,12,32,-70,-64,-39,-38,-59,-75,-92,-108,43,32,-86,-44,-73,-100,-96,-114,-107,-112,40,32,-16,-127,-106,-47,-28,-35,-43,-42,95,32,-6,-35,-46,-83,-41,-94,-95,-7,17],"c":793508933},"U":"","V":4,"W":5596788,"X":{"b":3,"c":1,"d":1900747,"memoizedSerializedSize":2147483647,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":0},"Y":[{"b":1,"c":{"b":5,"c":1942,"d":1,"memoizedSerializedSize":5,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":5962122},"memoizedSerializedSize":7,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":316499457}],"Z":[],"aa":false,"b":-956301294,"c":-403159757,"d":4663348,"e":77,"f":1.0,"g":"","h":"zh-CN","i":false,"j":"","k":"CN","m":"","n":"","o":"","p":[],"q":[{"b":5,"c":{"a":[24,-40,-43,-115,7],"c":164073738},"d":[{"a":[8,3,18,0],"c":3935853},{"a":[8,3,18,7,21,2,-82,-11,-74,16,16],"c":1918828295},{"a":[8,3,18,11,21,14,-108,-30,-74,16,-83,1,-19,1,16],"c":1804401060},{"a":[8,3,18,13,21,12,-108,-30,-74,16,-83,1,-74,4,-65,4,16],"c":-156611005}],"e":false,"memoizedSerializedSize":64,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":1568547988}],"r":3,"s":32,"t":"20.09.39","u":"Google","v":"google","w":"Pixel 4 XL","x":{"b":6,"c":"","d":3,"e":2,"memoizedSerializedSize":4,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":515524},"y":"Android","z":"12","memoizedSerializedSize":2147483647,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":0},"e":{"b":260,"c":"","d":false,"e":false,"f":"","memoizedSerializedSize":2147483647,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":0},"g":{"b":1,"c":{"a":[],"c":0},"memoizedSerializedSize":2147483647,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":0},"h":"","i":{"b":112,"c":[{"b":1,"c":2,"d":"CpYFmsA_ATEaQAHInBRcfdPe_fIf-nFTWH3XAZM2BbDaBTSS8yyEU_3sjkbclhkNWRvcvDlKhyHMUv-5mWP5V3KqXjA_nelEL_ESzAR_0fwbAdQvg86IqtrTjUAzZUvn03JeOBDlYzbdjffotNs_GPBoCiLbaUYMGI7B2m7bGeqdypnr3RWFcIpyeqwR2QGcnmfN7e70VHk1G5wSV4-EkDR1qBB782NecIMoR9eVcAuP5QZPoRSkZ_JYM031zKdHM33QSA-6cnjXiOG029xBI6pV53-da4IFDNiU-ksj6w6EmHPS5V1ihysMqSCTDfu_IqM25H2_TJd19Ld6CkWNg6tey2KaDyrOxh5R8HZsTGbWA5irIufmIMVrpr-uPpCYuEmkThZN6lgPrbVb4VUcYvPSZAOmwDVoxsoVTQ0ggZ-zvURYRRZhb1BFMMFmG4Nb8deszG2jP8A0NLmHHLdIT_HmXJpeLF0K6Hd90JAJgEwDFvTHhTSVMoR6v-BPcFXuvalxkafG5tfmv_yHkLnDx-Nvc965QdblPRaCGM_Udp4WYsd0AgGDaU6JFkQD4Qxb2YzLYDzF3iL-OBG5cio7PwjOHEGNwT91Junsy8ePck-GyiFl2DRYHHyZn7W6VnpONI2uBQlNFIdu-lyqPtVrdTDFtVyH1raEVPLh1hNo-r3AlMyE6bRQTFZPMeai_uCI50JP5cdHirXgYs7-NrYiEHvpcDwdPX2gTRSwXF-RhOpsmOj8WlaK5YOy20k_UaTnZ2KLgvDzd0WE4sZckn8E8IOIdZZ2KsBAt4g7WribojyUlbcEZtVg4GDplD2t1AtFCTV1xAhtgfDyOKJMPS3VYuze74T8mQOqyI5NCu0d1ImBs8uJj9xnjSsgBA","e":"ms","g":1,"memoizedSerializedSize":2147483647,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":0}],"d":"90b5608d-3ff6-4092-b3f8-15d104bcdab5","e":5,"f":false,"g":"","i":1,"memoizedSerializedSize":2147483647,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":0},"j":[],"l":2,"memoizedSerializedSize":-1,"unknownFields":{"b":0,"c":[],"d":[],"e":0,"f":false},"memoizedHashCode":0}
    //
    //         console.log(`this.E=${this.E.value}`);
    //         hook = true;
    //     }
    //
    //
    //     var result = this["ag"](apngVar);
    //     var byteArray = result.toByteArray();
    //     // console.log("apng 字节数据: " + CommonUtils.byteArrayToHexString(byteArray).slice(0, 16));
    //     if (hook) {
    //         // console.log(CommonUtils.byteArrayToHexdump(byteArray));
    //         console.log('protobuf->json');
    //         console.log(JSON.stringify(ProtobufUtils.decodeMessage(byteArray)));
    //     }
    //
    //     // CommonUtils.showStacks();
    //     return result;
    // }

    // var gcb = Java.use("gcb");
    // gcb["j"].implementation = function () {
    //
    //     let result = this["j"]();
    //     let bValue = this._b.value;
    //     if (bValue === 803) {
    //         // console.log(`gcb.m48175j is called`);
    //         console.log(`gcb.m48175j result=${result}，int i = ${this._b.value},a = ${this._a.value}`);
    //         // console.log("bValue:", bValue);
    //     }
    //     return result;
    // };
    //
    //
    // aclg["e"].implementation = function () {
    //
    //
    //     let result = this["e"]();
    //     let stacks = CommonUtils.showStacks(false);
    //     if (stacks.includes('acmf.ag')) {
    //         console.log(`aclg.m4236e is called`);
    //         // CommonUtils.showStacks();
    //         InspectJavaUtils.dumpGsonObj(result.instance.value);
    //     }

    //     return result;
    // };
    //
    // aclg["a"].implementation = function () {
    //     let result = this["a"]();
    //     let stacks = CommonUtils.showStacks(false);
    //     if (stacks.includes('acmf.ag')) {
    //         console.log(`aclg.m4232a is called`);
    //         // console.log(`aclg.m4232a result=${result}`);
    //         InspectJavaUtils.dumpGsonObj(result);
    //         // CommonUtils.showStacks();
    //     }
    //     return result;
    // };
    //
    // var abzb = Java.use("abzb");
    // abzb["a"].implementation = function () {
    //     let stacks = CommonUtils.showStacks(false);
    //     let result = this["a"]();
    //     let bValue = this.b.value;
    //     if (bValue === 15 && stacks.includes('acmf.ag')) {
    //         console.log(`abzb.mo3473a is called`);
    //         InspectJavaUtils.dumpGsonObj(result);
    //         console.log(`this.b:${this.b.value}`);
    //     }
    //     return result;
    // };
    // var acli = Java.use("acli");
    // acli["d"].implementation = function (aplmVar) {
    //     let stacks = CommonUtils.showStacks(false);
    //     if (stacks.includes('acmf.ag')) {
    //         console.log(`acli.mo3458d is called`);
    //         console.log('111111111111111');
    //         InspectJavaUtils.dumpGsonObj(aplmVar.instance.value);
    //     }
    //     this["d"](aplmVar);
    //     if (stacks.includes('acmf.ag')) {
    //         // console.log('222222222222222');
    //         // InspectJavaUtils.dumpGsonObj(aplmVar.instance.value);
    //     }
    // };

    // var acli = Java.use("acli");
    // acli["e"].implementation = function (aplmVar, agplVar) {
    //     console.log(`acli.mo3459e is called: aplmVar=${aplmVar}, agplVar=${agplVar}`);
    //     InspectJavaUtils.dumpGsonObj(aplmVar.instance.value);
    //     this["e"](aplmVar, agplVar);
    // };

    // 这里是循环构造请求信息的核心
    // var tbl = Java.use("tbl");
    // tbl["s"].implementation = function (agplVar) {
    //
    //     var Jset = Java.use("java.util.Set");
    //     var bfgz = Java.use("bfgz");
    //     var acmo = Java.use("acmo");
    //     console.log(`tbl.m66849s is called: agplVar=${agplVar}`);
    //     var atpr = Java.use("atpr");
    //     let builder = atpr._a.value.createBuilder();
    //     // console.log('========builder========');
    //     // InspectJavaUtils.dumpGsonObj(builder);
    //     let f189340a = Java.cast(this._a.value, bfgz);
    //     console.log('f189340a:', f189340a);
    //     let jsArray = Java.cast(f189340a.a(), Jset).toArray()
    //     console.log(jsArray);
    //     let index=0;
    //     jsArray.forEach(function (item) {
    //         console.log(item);
    //         let acmo_instance = Java.cast(item, acmo);
    //         acmo_instance.e(builder, agplVar);
    //         InspectJavaUtils.dumpGsonObj(builder.instance.value);
    //     })
    //
    //     let result = this["s"](agplVar);
    //     return result;
    // };

    var aclz = Java.use("aclz");
    aclz["d"].implementation = function (aplmVar) {
        var abos = Java.use("abos");
        var bfgz = Java.use("bfgz");
        // console.log(`1111aclz.mo3458d is called: aplmVar=${aplmVar}`);
        // InspectJavaUtils.dumpGsonObj(aplmVar.instance.value);
        this["d"](aplmVar);

        try {
            console.log(`2222aclz.mo3458d is called: aplmVar=${aplmVar}`);
            let bValue = Java.cast(this._b.value, bfgz);
            var abosA = Java.cast(bValue.a(), abos);
            console.log(abosA.b());
            CommonUtils.showStacks();
        } catch (e) {

        }
        // InspectJavaUtils.dumpGsonObj(aplmVar.instance.value);
        // String strMo2763b = ((abos) this.f7017b.mo910a()).mo2763b();
        // console.log(Java.cast(this._b.value, abos));


    };


    // var gbw = Java.use("gbw");
    // gbw["a"].implementation = function () {
    //     console.log(`gbw.mo910a is called,this.b=${this._b.value}`);
    //     let result = this["a"]();
    //     // console.log(`gbw.mo910a result=${result}`);
    //     return result;
    // };
    var gbw = Java.use("gbw");

    // gbw["j"].implementation = function () {
    //     let bValue = this._b.value;
    //     let result = this["j"]();
    //     var Jset = Java.use("java.util.Set");
    //     var acmo = Java.use("acmo");
    //     if (bValue === 384) {
    //         var atpr = Java.use("atpr");
    //         let builder = atpr._a.value.createBuilder();
    //         console.log(`gbw.m47686j is called,this.b=${bValue},result=${result},result class =${result.$className}`);
    //         let setResult = Java.cast(result, Jset).toArray(); // Java的Set类型转JsArray
    //         console.log(`setResult=${setResult},class =${setResult.$className}`);
    //         setResult.forEach(function (item) {
    //             console.log(item);
    //             // InspectJavaUtils.dumpAny(item);
    //             console.log(Java.cast(item,acmo).e(builder,));
    //         });
    //         // let jsArr = result.toArray();
    //     }
    //     return result;
    // };

}


function gptHook4() {
    Java.perform(() => {
        var acbq = Java.use("acbq");
        acbq["d"].implementation = function (aplmVar) {
            console.log(`acbq.mo3458d is called: aplmVar=${aplmVar}`);
            // InspectJavaUtils.dumpGsonObj(this._a.value.values().toArray()[0]);
            // InspectJavaUtils.dumpAny(this._a.value.values().toArray()[0])

            var axtf = Java.use("axtf");
            let axtfInstance = Java.cast(this._a.value.values().toArray()[0], axtf);
            // InspectJavaUtils.dumpGsonObj(axtfInstance.c.value);

            // CommonUtils.showStacks();
            this["d"](aplmVar);
        };

    });
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

// setTimeout(gptHook4, 3 * 1000);
setTimeout(gptHook4, 3 * 1000);