ewoo.doHtml = function (key) {
    $('[e-html]').each(function (index, el) {
        var name = el.getAttribute('e-html');
        if ($is(key) && name.indexOf(key) == -1) {
            return true;
        }
        try {
            var html = eval('vm.' + name);
        } catch (e) {
            //val = 'error: vm.' + name;
            html = name.replace(/\\?\{([^{}]+)\}/g, function (match, key) {

                try {
                    val = eval(key);
                } catch (e) {
                    val = '{' + key + '}';
                }
                return $is(val) ? val : '';
            });

        }

        $(el).html(html);
    });
}