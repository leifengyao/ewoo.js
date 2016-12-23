/*!
 *******************************************************************************
 [ewoo.base] [框架全局函数和基础函数]  
 *******************************************************************************
 */
/*
 * api接口封装 对外函数
 * 
 */
function getWindowDocument(frame) {
    var doc = null;
    try {
        doc = (frame.contentWindow) ? frame.contentWindow.document : null;
    } catch (err) {
    }
    if (doc) {
        return doc;
    }
    try {
        doc = frame.contentDocument ? frame.contentDocument : frame.document;
    } catch (err) {
        doc = frame.document;
    }
    return doc;
}


function ajaxPost2Iframe(url, form, callback) {

    //创建一个框架,然后将form数据提交到框架页面
    var iframeId = 'unique' + (new Date().getTime());
    var iframe = $('<iframe style="position: absolute; width: 100px; height: 100px; border: 5px solid #f00; left: 40px; top: 16px;"  src="javascript:false;" name="' + iframeId + '"  id="' + iframeId + '"></iframe>');
    iframe.hide();

    form.before(iframe);
    iframe.load(function(e) {

        var doc = getWindowDocument(iframe[0]);
        var docRoot = doc.body ? doc.body : doc.documentElement;
        var data = docRoot.innerHTML;
        if ('false' !== data) {
            try {
                eval('var json=' + data + ';');
                callback(json);
            } catch (e) {
                callback(data);
            }
        }
        //  $(iframe).remove(); //先不要移除  IE7下面有问题 load会调用两次
    });

    setTimeout(function() {
        $(form).attr('method', 'post');
        $(form).attr('action', url);
        $(form).attr('target', iframeId);
        $(form).removeAttr("onsubmit");
        $(form).submit();
    }, 200);
}


/*
 * 
 * 常用的基本函数
 */
function $selector(finder, el) {
    if (!$is(el))
        el = document.body;
    var els = $(el).find(finder);
    if (els.length == 0)
        return new Array();
    var objs = new Array();
    for (var i = 0; i < els.length; i++) {
        objs.push(els[i]);
    }
    return objs;
}
function $is(val) {
    return (typeof (val) == 'undefined' || val == null) ? false : true;
}
;
function $def(v, def) {
    return ($is(v)) ? v : def;
}
;
function $in(v, val) {
    for (var n in v) {
        if (val == v[n])
            return true;
    }
    return false;
}
function $log(v) {
    if (typeof (window.console) !== 'undefined' && window.console.log !== undefined) {
        window.console.log(v);
    }
}

function $format(str) {
    var args = arguments, re = new RegExp("%([1-9])", "g");
    return String(str).replace(re, function($m, $i) {
        return args[$i];
    });
}


var ewoo = ewoo || {};
ewoo.loadJs = function(file) {
    $.ajax({url: file, async: false});
}
ewoo.loadCss = function(file) {
    var head = document.getElementsByTagName('head').item(0);
    css = document.createElement('link');
    css.href = file;
    css.rel = 'stylesheet';
    css.type = 'text/css';
    head.appendChild(css);
}



ewoo.log = function(o) {
    console.log(o);
};

ewoo.callApi = function(method, para, callfunc) {
    //1.选择服务器 本操作可以缓存
    var ip = '';
    //2.执行ajax获取参数
    var url = method;
    $.ajax({type: 'POST', url: url, data: para, timeout: 30000, success: callfunc, error: callfunc});
};
ewoo.tts=function(str){
    var m = new Audio();
    m.src = 'http://tts.baidu.com/text2audio?lan=zh&ie=UTF-8&spd=10&text=' + txt;
    m.play();
};