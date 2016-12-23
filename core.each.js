ewoo.doEach = function (key) {
    //alert(key);

    $('[e-each]').each(function (index, e) {
        var codeStr = $(e).attr('e-each');

        if ($is(key) && codeStr.indexOf(key) == -1) {
            return true;
        }

        //如果没有编号就设置编号
        var idx = $(e).attr('_eachIdx');
        if (idx > 0) {
            //清空
            //  $('[_byEachIdx]='+idx).remove();
            //  $('[_byEachIdx]=' + idx).remove();
        } else {
            ewoo.gNumber++;
            idx = ewoo.gNumber;
            $(e).attr('_eachIdx', idx);

        }
        try {
            var items = eval('vm.' + codeStr);
        } catch (e) {
            return true;
        }


        //alert(codeStr);
        //解析模板继续新增
        var html = '', allHtml = '';
        //处理html0

        //先隐藏自己
        var html0 = $(e).attr('_eachHtml');

        if (!$is(html0)) {
            html0 = e.outerHTML;
            html0 = html0.replace('e-each="' + $(e).attr('e-each') + '"', '_byEachIdx=' + idx);
            $(e).hide();
            $(e).attr('_eachHtml', html0);
        }

        if (items == null)
            return true;


        for (var i = 0, len = items.length; i < len; i++) {


            var el = items[i];
            if (!$is(el))
                continue;
            //先扫描子循环 
            html = html0;
            $(e).find('[e-each-et]').each(function (index, child) {
                html = ewoo.doEachChild(child, html, el);
                // alert(html0);
            });

            el.index = i;
												$index=i;
            html = html.replace(/\\?\{([^{}]+)\}/g, function (match, name) {

                try {
                    val = eval(name);
                } catch (e) {
                    val = '{' + name + '}';
                }
                return $is(val) ? val : '';
            });



            //html=yview.repeatChild(objs[k],vm,el,html);

            allHtml += html;
        }
        //alert(allHtml);
        //alert(idx);
        var oldEls = $('[_byEachIdx=' + idx + ']');
        if (oldEls.length > 0)
            oldEls.remove();

        $(allHtml).insertAfter($(e));
    });

}

ewoo.doEachChild = function (child, html, el) {
    var html0 = child.outerHTML;
    var nhtml = '';

    var items = eval($(child).attr('e-each-et'));

    if (items == null) {
        return html.replace(html0, '');
    }

    for (var i = 0; i < items.length; i++) {
        var et = items[i];
        if (!$is(et))
            continue;
        et.index = i;
        nhtml += html0.replace(/\\?\{([^{}]+)\}/g, function (match, name) {
            try {
                return eval(name);
            } catch (e) {
                return '{' + name + '}';
            }
            ;
        });
    }
    //alert(html);
    return html.replace(html0, nhtml);
}
