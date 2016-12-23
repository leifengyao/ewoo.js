ewoo.doIf = function (key) {
    $('[e-if]').each(function (index, el) {
        var name = el.getAttribute('e-if');
        if ($is(key) && name.indexOf(key) == -1) {
            return true;
        }
        code = 'vm.' + name;
        var isShow = false;
        try {
            isShow = eval(code);
        } catch (e) {
            try {
                isShow = eval(name);
            } catch (e) {
            }
            ;
        }
        //隐藏所有的子对象
        (isShow) ? $(el).show() : $(el).hide();
    });

}