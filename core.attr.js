//e-attr="width,mwidth|" 支持css jquery 属性等操作
ewoo.doAttr = function(key) {
    $('[e-attr]').each(function(index, el) {
        var para = el.getAttribute('e-attr');

        if ($is(key) && para.indexOf(key) == -1) {
            return true;
        }
        //以竖线分组
        var items = para.split('|');
        for (var i = 0; i < items.length; i++) {

            var arr = items[i].split(',');
            if (arr.length != 2) {
                alert('e-attr="' + para + '" 格式有误！e-attr="属性名,数据变量" ');
                return true;
            }
            var attr = arr[0];
            var name = arr[1];
            try {
                var val = eval('vm.' + name);
            } catch (e) {
                var val = name.replace(/\\?\{([^{}]+)\}/g, function(match, key) {
                    try {
                        val = eval(key);
                    } catch (e) {
                        val = '{' + key + '}';
                    }
                    return $is(val) ? val : '';
                });
            }

            $log(attr + ',' + val);
            //修正如果是url，src，href 增加随机数的处理 强制刷新
            if(attr=='src'||attr=='href'){
                 val+=(val.indexOf('?')==-1)?'?_rand='+Math.random():'&_rand='+Math.random();
            }
            try {
                $(el).attr(attr, val);
                $(el).css(attr, val);
                //判断含有该属性才处理
                (attr in $(el)) && eval('$(el).' + attr + '(val);');
            } catch (e) {
            }
        }
    });
}
