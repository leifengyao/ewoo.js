/*!
*******************************************************************************
 [ewoo.compat] [兼容其他外部组件的一些处理]  
*******************************************************************************
  */
///////////和HUI兼容的一些操作///////////////////////////
$(function() {

    //对于一些扩展属性的处理
    //y-fit
    $('[y-fit]').each(function(index, el) {
        var h = $(window).height();
        var sumh = $(el).attr('y-fit') * 1;
        $(el).siblings().each(function(i, el2) {
            sumh += $(el2).height();
            //alert(el2.outerHTML);
            //alert($(el2).height());
        });
        //alert(sumh);
        $(el).height(h - sumh);
    });
//全屏属性
    $('[y-full]').each(function(index, el) {
        $(el).bind('click', function(evt) {
            var toBox = $(this).attr('y-full');
            //alert($(toBox).height());
            $(toBox).attr('_old_width', $(toBox).width());
            $(toBox).attr('_old_height', $(toBox).height());
            //alert($(toBox).height());
            $(toBox).css({"position": "absolute", "top": "50px", "left": "50px", "filter": "Alpha(opacity=90)"})
                    .height($(window).height() - 100)
                    .width($(window).width() - 100).show()
                    .bind('dblclick', function() {
                        //alert($(this).attr('_old_height'));
                        var h = $(this).attr('_old_height');
                        var w = $(this).attr('_old_width');
                        $(this).width(w).height(h).css({"position": "relative", "top": "0px", "left": "0px"}).hide();
                        //alert($(toBox).height());
                    });


        });

    });



    //表格复选框处理
    $('table.table th :checkbox').unbind();
    $('table.table th :checkbox').click(function(event) {
        var that = $(this);
        var bindName = '';
        $('table.table tbody tr').each(function(index, el) {
            var objChk = $(this).find('td:first :checkbox');
            if (objChk.val() == '{el.id}' || !$is(objChk.val())) {
                return;
            }
            bindName = objChk.attr('e-bind');
            if (that.is(':checked')) {
                if (!objChk.attr('checked'))
                    objChk.click();
            }
            else {
                if (objChk.attr('checked')) {
                    objChk.click();
                }
            }

        });
        if (!that.is(':checked')) {
            //清空数组
            eval('vm.' + bindName + '=[];');
            //vm[bindName]=[];
        }
    });






});