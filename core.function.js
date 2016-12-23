//e-function="func,数据|"  执行一个函数，来处理数据
ewoo.doFunction = function (key) {
    $('[e-function]').each(function (index, el) {
        var para = el.getAttribute('e-function');


        var arr = para.split(',');
        if (arr.length != 2) {
            alert('e-function="' + para + '" 格式有误！e-function="处理函数名,数据变量" ');
            return true;
        }


        if ($is(key) && arr[1].indexOf(key) == -1) {
            return true;
        }
        //调用函数直接处理
        eval('ewoo.uifunc.' + arr[0] + '(el,vm.' + arr[1] + ')');
    });
}

ewoo.uifunc = {};
ewoo.uifunc.createTree = function (el, data) {
    //alert(el);
    var html = "";
    $(el).html("<li><span>湖南</span><ul><li>长沙</li><li>湘潭</li></ul></li><li>广西</li><li>广东</li><li>江西</li>");
    $(el).treeview({control: "#treecontrol", persist: "cookie", cookieId: "treeview-black"});
}

