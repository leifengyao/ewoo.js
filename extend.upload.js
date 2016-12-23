ewoo.extend.upload = function (el, postUrl, fileType, callfunc) {

    fileType = $is(fileType) && fileType != '' ? fileType : 'png,gif,jpg,jpeg,pen,mp3,mp4,doc,docx,xls,xlsx,ppt,pptx,zip,txt';
    var callfunc = $is(callfunc) ? eval(callfunc) : function (ret) {
    };

    //1.动态生成一个文件域，绝对定位覆盖到原来的图片或按钮
    var iframeId = 'unique' + (new Date().getTime());
    var html = $('<form method=post    enctype="multipart/form-data">\
																									<input type="file" name="fileMd5" id="fileMd5' + iframeId + '"  class=  multiple  style="display:block; position: absolute; font-size: 20px;opacity: 0;filter:alpha(opacity=0);\
																																	width: ' + $(el).width() + 'px;\
																																	height: ' + $(el).height() + 'px;\
																																	top:' + $(el).offset().top + 'px;\
																																	left:' + $(el).offset().left + 'px;" />\
																									</form>');
    $(el).after(html);

    //2.捆绑文件选择之后，直接上传事件
    $('#fileMd5' + iframeId).bind('change', function () {
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
        ajaxPost2Iframe(postUrl, $(this).parent('form'), function (json) {
            callfunc(json);
        });
    });


}