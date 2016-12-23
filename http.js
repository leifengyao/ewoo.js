/*!
*******************************************************************************
 [ewoo.http] [http参数和cookie功能]  
*******************************************************************************
  */
///////获取get，cookic等参数
var ewoo = ewoo || {};
ewoo.http = {};
ewoo.http.para = {};
ewoo.http.get = function(key, def) {
    def = ($is(def)) ? def : '';
    //
    var url = window.document.location.href.toString();
    var u = url.split("?");
    if (typeof (u[1]) == "string") {
        u = u[1].split("&");
        for (var i in u) {
            var j = u[i].split("=");
            ewoo.http.para[j[0]] = decodeURIComponent(j[1]);
        }
    }
    ///
    return $is(ewoo.http.para[key]) ? ewoo.http.para[key] : def;

}


//cookice操作处理
// ewoo.cookice = function(name, value, opt) {
//     var name = escape(name);
//     if (value === undefined) {
//         var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
//         return  (arr = document.cookie.match(reg)) ? unescape(arr[2]) : null;
//     } else {
//         if (time === undefined)
//             time = 24 * 3600;
//         var exp = new Date();
//         exp.setTime(exp.getTime() + time * 1000);
//         document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
//     }
// };
// if(typeof $.cookie != 'function'){
//     ewoo.loadJs('/common/jquery.cookie.js');
// }
ewoo.cookice = function(name, value, opt) {
    var name = escape(name);
    if (value === undefined) {
        return $.cookie(name);
    } else {
        $.cookie(name, value, opt)
    }
};
ewoo.login = {};
ewoo.login.sesskey = function(val) {
    return  ewoo.cookice('tjid_user_sesskey', val, {expires: 7});
}