//最终需要处理的文件，注意相关顺序，本文件在生成ewoo.js的时候 在最后引入
var yEditors = {};
$(function() {
	
    // e-editor="1"
    $(function(){
							ewoo.popWin.init(window);
                            $('[e-coder]').each(function(index, el) {
            if (index == 0) {
                ewoo.loadCss('/common/coder.css');
                ewoo.loadJs('/common/coder.js');
            }
             var editor = CodeMirror.fromTextArea(el, {
                lineNumbers: true,
                viewportMargin: Infinity,
                smartIndent: true, // 是否智能缩进
                tabSize: 4, // Tab缩进，默认4
                readOnly: false, // 是否只读，默认false
                showCursorWhenSelecting: true,
                matchBrackets: true,
                mode: "application/x-httpd-php",
                indentUnit: 4,
                indentWithTabs: true
            });
        });
							
        $('[e-editor]').each(function(index, el) {
            if (index == 0) {
                ewoo.loadCss('/common/kindeditor/themes/default/default.css');
                ewoo.loadJs('/common/kindeditor/kindeditor-all-min.js');
                ewoo.loadJs('/common/kindeditor/Kindeditor-config.js');
                ewoo.loadJs('/common/kindeditor/lang/zh_CN.js');
            }
            var idx = parseInt($(el).attr('e-editor'));
            if (isNaN(idx) || idx < 0)
                idx = 1;
            if (idx >= 4)
                idx = 4;
            var id = $(el).attr('e-bind');
            $(el).attr('id', id);
            yEditors[id] = KindEditor.create('#' + id, KindeditorConfig[idx]);
            yEditors[id].html(vm[id]);

            if (index == 0) {
                //启动一个定时器  将编辑框的值绑定到vm的变量上
                setInterval(function() {
                    $('[e-editor]').each(function(idx2, el2) {
                        var id = $(el2).attr('e-bind');
                        var newVal = $(el2).val();
                        if (newVal != vm[id]) {
                            vm[id] = newVal;
                        }
                    });
                }, 1000);
            }


        });
        //树控件的处理
        $('[e-treeview]').each(function(index, el) {
            $(el).treeview({
                control: "#treecontrol",
                persist: "cookie",
                cookieId: "treeview-black"
            });
        });



        //页面加载完成之后， 绑定mvvm的操作///////////////////////////
        if ("undefined" != typeof vm) {
            //分解get参数
            var url = window.document.location.href.toString();
            var u = url.split("?");
            if (typeof(u[1]) == "string") {
                u = u[1].split("&");
                for (var i in u) {
                    var j = u[i].split("=");
                    vm[j[0]] = decodeURIComponent(j[1]);
                }
            }
            //处理vm渲染
            ewoo.exec(vm);

        }
    });
    
});