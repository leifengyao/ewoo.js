/*!
 *******************************************************************************
 [ewoo.view] [对界面的操作，弹出层处理]  
 *******************************************************************************
 */
/////////////////////////////////////////////视图相关的接口函数/////////////////////////////////////////////////////////////////////////////
var ewoo = ewoo || {};
ewoo.popWin = {};
ewoo.layeropen = function(title, url, width, height, callfunc) {
    if (title == null || title == '') {
        title = false;
    }
    ;
    if (url == null || url == '') {
        url = "404.html";
    }
    ;
    if (width == null || width == '') {
        width = 800;
    }
    ;
    if (height == null || height == '') {
        height = ($(window).height() - 50);
    }
    ;
    return layer.open({
        type: 2,
        area: [width + 'px', height + 'px'],
        fix: false, //不固定
        maxmin: true,
        shade: 0.4,
        title: title,
        content: url,
        end: callfunc
    });
}
ewoo.layerclose = function() {
    var index = parent.layer.getFrameIndex(window.name);
    //parent.$('.btn-refresh').click();
    parent.layer.close(index);
}
ewoo.popWin.callfunc = function() {
    //alert(2);
};
ewoo.popWin.times = 0;

//初始化
ewoo.popWin.init = function(win) {
    return false;
    if (ewoo.popWin.times == 0) {
        win.$(win.document.body).append("<style>\n\
button::-moz-focus-inner{ border:0; padding:0; margin:0; }\n\
#easyDialogBox .easyDialog_wrapper{display:inline-block !important; color:#444; border:3px solid rgba(0,0,0,0); -webkit-border-radius:5px; -moz-border-radius:5px; border-radius:5px; -webkit-box-shadow:0 0 10px rgba(0,0,0,0.4); -moz-box-shadow:0 0 10px rgba(0,0,0,0.4); box-shadow:0 0 10px rgba(0,0,0,0.4); display:none; font-family:\"Microsoft yahei\", Arial; }\n\
.easyDialog_wrapper .easyDialog_content{ -webkit-border-radius:4px; -moz-border-radius:4px; border-radius:4px; background:#fff; border:1px solid #e5e5e5; }\n\
.easyDialog_wrapper .easyDialog_title{margin: 0px; height:30px; line-height:30px; overflow:hidden; color:#666; padding-left:10px;  font-size:14px; border-bottom:1px solid #e5e5e5; background:#f7f7f7; border-radius:4px 4px 0 0; }\
.easyDialog_wrapper .close_btn{text-align:center;width:20px; font-family:arial; font-size:18px; _font-size:12px; font-weight:700; color:#999; text-decoration:none; float:right; }\n\
.easyDialog_wrapper .close_btn:hover{ color:#fff; background-color:#D44027; }\n\
.easyDialog_wrapper .easyDialog_text{padding:0px; font-size:13px; line-height:22px; }\n\
.easyDialog_wrapper .easyDialog_footer{ padding:0px; *zoom:1; }\n\
.easyDialog_wrapper .easyDialog_footer:after{ content:''; display:block; height:0; overflow:hidden; visibility:hidden; clear:both; }\n\
.easyDialog_wrapper .btn_highlight,.easyDialog_wrapper .btn_normal{ border:1px solid; border-radius:2px; cursor:pointer; font-family:\"Microsoft yahei\", Arial; float:right; font-size:12px; padding:0 12px; height:24px; line-height:24px; margin-bottom:10px; }\n\
.easyDialog_wrapper .btn_highlight{ background:#4787ed; background:-webkit-gradient(linear,center bottom,center top,from(#4787ed),to(#4d90fe)); background:-moz-linear-gradient(90deg, #4787ed, #4d90fe); border-color:#3079ed; color:#fff; }.easyDialog_wrapper .btn_normal{ margin-left:10px; border-color:#c3c3c3; background:#ececec; color:#333; background:-webkit-gradient(linear,center bottom,center top,from(#ececec),to(#f4f4f4)); background:-moz-linear-gradient(90deg,#ececec,#f4f4f4); }\n\
</style>");
    }
    ewoo.popWin.times++;
}


//
ewoo.popWin.open = function(title, url, width, height, callfunc) {
    //判断是否可以跨域访问
    var topWindow = $is(window.top.$) ? window.top : window;
    ewoo.popWin.init(topWindow);
    topWindow.$(topWindow.document.body).append("<style>\n			#easyDialogBox .easyDialog_wrapper{*width:" + width + "px;}");
    //兼容以前的情况，没有传递标题的
    topWindow.easyDialog.open({
        container: {
            header: title,
            content: '<iframe src="' + url + '"  width="' + width + '"  frameborder="0" height="' + height + '"  style="width:' + width + 'px;height:' + height + 'px;"></iframe>'
        },
        callback: callfunc
                //autoClose : 2000
    });
    return;

}
ewoo.popWin.close = function(iscall) {
    var topWindow = $is(window.top.$) ? window.top : window;
    topWindow.easyDialog.close();
};

//
ewoo.tips = {};
ewoo.tips.open = function(msg, time) {
    //var topWindow = $is(window.top.$) ? window.top : window;

    //ewoo.popWin.init(topWindow);
    if (time === undefined || time <= 1000)
        time = 3000;
    window.easyDialog.open({
        container: {
            content: '<div style="padding:10px; font-size:14px;">' + msg + '</div>'
        },
        overlay: false,
        drag: false,
        autoClose: time
    });

    /*
     //如果没有对象创建一个
     if (topWindow.$("#tipsWin").length == 0) {
     topWindow.$(topWindow.document.body).append('<div id="tipsWin" class="tipsWin"><span style="float:left; text-align:center; padding-left:5px; font-size:14px; "> </span><a style="float:right; margin-right:10px;" href="javascript:ewoo.tips.close()">[ X ]</a></div>');
     }
     topWindow.$("#tipsWin span").html("<span style='color:red'>" + msg + "</span>");
     topWindow.$("#tipsWin").width($(topWindow).width()).height(50);
     topWindow.$("#tipsWin").css('left', 0).css('top', 0).slideDown();
     if (!$is(time))
     time = 6000;
     setTimeout(function() {
     ewoo.tips.close();
     }, time);
     */
}
ewoo.tips.close = function() {
    var topWindow = $is(window.top.$) ? window.top : window;
    topWindow.$("#tipsWin").slideUp();
}
ewoo.easyDialog = {};
ewoo.easyDialog.open = function(opt) {
    ewoo.popWin.init(window);
    easyDialog.open(opt);
}


/*
 window.alert=function(msg){
 ewoo.tips.open(msg);
 }
 */