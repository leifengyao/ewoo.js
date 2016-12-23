/*!
*******************************************************************************
 [ewoo.extend] [自定义扩展，扩展一个组件的行为或者样式]  
*******************************************************************************
  */
var ewoo = ewoo || {};
ewoo.doExtend = function(el) {
    extend=el.getAttribute('e-extend');
    if (!$is(extend) || extend == '') {
        return true;
    }
    var arr = extend.split('|');
    var extendFunc = ewoo.extend[arr[0]];
    if (!$is(extendFunc)) {
        alert('e-extend="' + extend + '" 组件未定义" ');
        return false;
    }
    var paraArr=[];
    if(arr.length>1){
        paraArr = arr[1].split(',');
    }
    paraArr.unshift(el);
    return extendFunc.apply(this,paraArr);
}

ewoo.extend={};
ewoo.extend.group=function(el,selclass){
    $(el).children().bind('click', function () {
        var parent = $(this).parent();
        parent.children().each(function (idx, el) {
            $(el).removeClass(selclass);
        });
        $(this).addClass(selclass);
    });
}
ewoo.extend.mouseover=function(el,selclass){
    $(el).children().bind('mouseover', function () {
        var parent = $(this).parent();
        parent.children().each(function(idx, el) {
            $(el).removeClass(selclass);
        });
        $(this).addClass(selclass);
    });

    $(el).children().bind('mouseout', function() {
        var parent = $(this).parent();
        parent.children().each(function(idx, el) {
            $(el).removeClass(selclass);
        });
    });
};

ewoo.extend.fit=function(el){
    var h = $(window).height();
    var sumh = $(el).attr('y-fit') * 1;
    $(el).siblings().each(function(i, el2) {
        sumh += $(el2).height();
        //alert(el2.outerHTML);
        //alert($(el2).height());
    });
    //alert(sumh);
    $(el).height(h - sumh);
}

$(function(){
    //类似live方式
    $('[e-extend]').each(function(index, el) {
        ewoo.doExtend(el);
    });
});
