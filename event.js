/*!
 *******************************************************************************
 [ewoo.event] [自定义点击事件组件]  
 *******************************************************************************
 */
/////////////////////////////////////////////可以响应的点击事件/////////////////////////////////////////////////////////////////////////////
var ewoo = ewoo || {};
ewoo.doEvent = function(el) {
    cEvent = el.getAttribute('e-event');
    if (!$is(cEvent) || cEvent == '') {
        return true;
    }
    var arr = cEvent.split('|');
    var eventFunc = ewoo.event[arr[0]];
    if (!$is(eventFunc)) {
        alert('e-event="' + cEvent + '" 组件未定义" ');
        return false;
    }
    var paraArr = [];
    if (arr.length > 1) {
        paraArr = arr[1].split(',');
    }
    return eventFunc.apply(this, paraArr);
}
ewoo.event = {};
ewoo.event.extwindow = function(url, name, opt) {
    return window.open(url, name, opt);
}
//
ewoo.event.show = function(id) {
    tm.ui.show(id);
}


//上传文件
ewoo.event.upload = function(postUrl, fileType, callfunc) {

    fileType = $is(fileType) && fileType != '' ? fileType : 'gif,jpg,jpeg,pen,mp3,mp4,doc,docx,xls,xlsx,ppt,pptx,zip,txt';
    callfunc = $is(callfunc) ? eval(callfunc) : function(ret) {
        //console.log(ret);
    };


    //没有对象需要创建
    if ($('#fileMd5Form').length == 0) {
        //var fileObj = $('<form style="position: absolute; width: 800px; height: 100px; border: 5px solid #f00; left: 40px; top: 260px;" id=fileMd5Form enctype="multipart/form-data"><input type="file" name="fileMd5" id="fileMd5"  multiple  style="width:450px;display:block;" /><input type=submit value="提交" /></form>');

        var fileObj = $('<form  id=fileMd5Form enctype="multipart/form-data"><input type="file" name="fileMd5" id="fileMd5"  multiple  style="display:none;" /></form>');

        $(document.body).append(fileObj);

        $('#fileMd5').bind('change', function() {
            //1.验证文件格式
            var name = $(this).val();
            if (name == '')
                return false;
            var listname = name.split(".");
            var ext = listname[listname.length - 1];
            fileType = fileType.toLowerCase();
            ext = ext.toLowerCase();

            if (fileType.indexOf(ext) < 0) {
                alert("文件格式[" + ext + "]不符，只能传【 " + fileType + " 】格式的文件！");
                $(this).val('');
                return false;
            }
            //2.ajax提交数据
            //SysFileAccount/update?busGuid=
            ajaxPost2Iframe(postUrl, $('#fileMd5Form'), function(json) {
                callfunc(json);
            });
        });
    }
    $('#fileMd5').click();

}

ewoo.event.fullObj = function(objid) {
    console.log(objid);
    //alert($(toBox).height());
    $(objid).attr('_old_width', $(objid).width());
    $(objid).attr('_old_height', $(objid).height());
    //alert($(toBox).height());
    $(objid).css({"position": "absolute", "top": "50px", "left": "50px", "filter": "Alpha(opacity=90)"})
            .height($(window).height() - 100)
            .width($(window).width() - 100).show()
            .bind('dblclick', function() {
                //alert($(this).attr('_old_height'));
                var h = $(this).attr('_old_height');
                var w = $(this).attr('_old_width');
                $(this).width(w).height(h).css({"position": "relative", "top": "0px", "left": "0px"}).hide();
                //alert($(toBox).height());
            });

}


$(function() {
    //类似live方式
    $(document.body).bind('click', function(evt) {
        var src = evt.srcElement ? evt.srcElement : evt.target;
       // if (src !== this)
							//点击的是图标 就用父对象
							//alert(src.tagName);
							 if(src.tagName=="I"){
							 	src=$(src).parent()[0];
							 }
							
         //   return;
        //点击的捆绑
        var clickClass = $(this).attr('e-click-class');
        if ($is(clickClass)) {
            $('[e-click-class=' + clickClass + ']').removeClass(clickClass);
            $(src).addClass(clickClass);
        }

        //如果父对象有e-group属性 就做选定处理
        var topObj = $(src).parents('[e-group]');
        //alert(selClass);
        if (topObj.length == 1) {
            var selClass = $(topObj).attr('e-group');
            topObj.children().removeClass(selClass);
            var tempTop = $(src);
            while (tempTop.length > 0) {

                if (tempTop.parent()[0] == topObj[0]) {
                    tempTop.addClass(selClass);
                    break;
                }
                tempTop = tempTop.parent();
            }
        }
        //div span li 等元素，都可以设置value属性和e-bind属性
        //点击之后都会对vm值做修改
        //如果是按钮组，只需要在父对象上设置e-bind
       // if (src !== this){
									var tagName = src.tagName;
									var value = $(src).attr('value');
									var pvalue= $(src).parents('[value]').attr('value');
									if (((tagName === 'DIV' || tagName === 'SPAN' || tagName === 'I') && (value !== undefined || pvalue!=undefined)) ||
																	(tagName == 'LI' && value !== 0)
																	) {
													ewoo.bindDivClick(src);
									}
								//}

        //对_pop类别的对象进行影藏
        var _pop = null;
        if ($(src).hasClass('_pop')) {
            //  alert('me');
            // _pop = src;
            $(src).attr('_popclose', 0);

        } else if ($(src).parent('._pop').length > 0) {
            // alert('parent');
            //_pop = $(src).parent('._pop')[0];
            $(src).attr('_popclose', 0);
        } else {
            //  alert('null');
            $('[_popclose=1]').hide();
        }
        //刚弹出来的窗口 不能关闭，只关闭属性_popclose=1的
        //if (_pop == null) {
        //  alert('hide');
        //  $('[_popclose=1]').attr('_popclose', 0).hide();
        //$(_pop).attr('_popclose',1);


        //} else {
        //     $(_pop).attr('_popclose', 1);
        // }


        ewoo.doEvent(src);

    });
});
