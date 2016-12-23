/*!
*******************************************************************************
 [ewoo.store] [store部件和相关操作]  
*******************************************************************************
  */
function eStore() {
    //执行ajax
    var mObj = this;

    //配置参数
    this.url = '';
    this.deleteId = '';
    this.deleteIds = null;
    this.form = '';
    this.para = {};
    this.autoLoad = false;
    this.loadTip = true;
    this.page = 1;
    this.limit = 10;
    this.working = true;
    this.alertMsg = true; //底层弹出错误信息

    //运行参数
    this.className = ''; //初始化的时候会创建变量名
    this.data = {};
    this.total = 0;
    this.items = null;
    this.timer = 0; //是否启动定时器，定期的刷新最新的信息 填写是一个毫秒数
    this._isCanGetNew = false;
    this._maxId = '';
    this._minId = '';


    //根据id获取对应的记录数组
    this.getItem = function(id,field) {
        field=$is(field)?field:'id';
        for (var n in this.items) {
            if (id == this.items[n][field]) {
                return this.items[n];
            }
        }
        return null;
    }

    this.setForm = function(formid, data) {
        if (!$is(data)) {
            data = this.items;
        }
        if (!$is(data) || data.length <= 0) {
            return false;
        }
        var form = $is(formid) ? $("#" + formid) : $('form')[0];
        if (!$is(form)) {
            return false;
        }

        vm.set('id', data['id']);
        $(form).find('[e-bind]').each(function(index, el) {
            var name = $(el).attr('e-bind');
            var val = data[name];
            //直接给vm赋值
            //如果name是一个数组形式，对应的值是需要json的
            if (name.indexOf('[') != -1) {
                var arr = name.split('[');
                var key = arr[1].substr(0, arr[1].length - 1);
                var code = ' var json=' + (data[arr[0]]) + ';';
                try {
                    eval(code);
                    $(el).val(json[key]);
                } catch (e) {}
                return true;
            }

            //
            //	alert(name+'>>'+val);
            //alert(typeof(val));
            if ($is(val)) {
                vm.set(name, val);
            }
            /*
             //radio的处理
             if ($(el).attr('type') == 'radio') {
             if ($(el).val() == val) {
             //$(el).click();
             $(el).attr("checked", "checked");
             }
             }
             else if ($(el).attr('type') == 'checkbox') {
             for (var o in val) {
             if ($(el).val() == val[o]) {
             $(el).attr("checked", "checked");
             }
             }
             }
             else {
             $(el).val(val);
             }
             */
        });
    }

    this.isWorking = function() {
        return this.working;
    }

    this.clear = function() {
        this.items = [];
        ewoo.update(mObj.className);
    }
    this.more = function() {
        this.page++;
        this._queryBase('add');
    }
    this.getMaxId = function() {
        if (!$is(this.items) || !$is(this.items[this.items.length - 1]) || this.items.length == 0) return '';
        var v1 = 1 * this.items[this.items.length - 1]['id'];
        var v2 = 1 * this.items[0]['id'];
        return (v2 > v1) ? v2 : v1;
    }
    this.getMinId = function() {
        if (!$is(this.items) || !$is(this.items[this.items.length - 1]) || this.items.length == 0) return '';
        var v1 = 1 * this.items[this.items.length - 1]['id'];
        var v2 = 1 * this.items[0]['id'];
        return (v2 > v1) ? v1 : v2;
    }

    this.queryNew = function() {
        this.page = 0;
        this._minId = '';
        this._maxId = this.getMaxId();
        this._queryBase('new');
        //maxid=
    }
    this.queryOld = function() {
        this._minId = this.getMinId();
        this._maxId = '';
        this.page = 0;
        this._queryBase('old');
        //minid
    }
    this.query = function(context) {
        this._minId = '';
        this._maxId = '';
        this._queryBase(context);
        //minid
    }
    this._queryBase = function(context) {
        this._isCanGetNew = false;
        this.working = true;
        //判断传入类型，实现不同的功能
        if (typeof context == 'string') {
            var type = context;
        }
        mObj.beforeQuery(type);
        var data = ewoo.getPara(this.para);
        if (data === false) {
            return false;
        }
        if (typeof context == 'object') {
            data = $.extend({}, data, context);
        }

        var callfunc = function(ret) {
            if (mObj.loadTip) {
                mObj.toggleTip();
            }
            mObj.data = ret;

            if (mObj.alertMsg && $is(ret.res) && ret.res == 0 && $is(ret.msg) && ret.msg != '') {
                alert(ret.msg);
                //top.ui.tips.open(ret.msg);
            }
            if ($is(ret.items)) {
                if (type === 'add') {
                    var len = ret.items.length;
                    for (var n = 0; n < len; n++) {
                        mObj.items.push(ret.items[n]);
                    }
                } else if (type == 'new') {
                    if (ret.items.length == 0) {
                        mObj.working = false;
                        mObj._isCanGetNew = true;
                        return;
                    }
                    var len = ret.items.length;
                    var isAsc = (mObj.items.length>0 && mObj.items[0]['id'] == mObj.getMinId()) ? true : false;
                    for (var n = 0; n < len; n++) {
                        //智能判断如何增加哦
                        isAsc ? mObj.items.push(ret.items[n]) : mObj.items.unshift(ret.items[n]);
                    }
                    // console.log(mObj.items);
                } else if (type == 'old') {
                    var len = ret.items.length;
                    var isAsc = (mObj.items.length>0 && mObj.items[0]['id'] == mObj.getMinId()) ? true : false;
                    for (var n = 0; n < len; n++) {
                        isAsc ? mObj.items.unshift(ret.items[n]) : mObj.items.push(ret.items[n]);
                    }
                } else {
                    mObj.items = ret.items;
                }


                // alert(mObj.className+'.items');
                //不足整数，用空行补齐
                //for(var n=mObj.items .length;n<mObj.limit;n++){
                //  mObj.items.push({a:'a'});
                // }   
                //ewoo.update(mObj.className+'.items');
            }
            //alert(mObj.data);
            if ($is(ret.total)) {
                mObj.total = ret.total;
                //alert(mObj.className+'.total');
                //ewoo.update(mObj.className+'.total');
            }
            ewoo.update(mObj.className);
            mObj.afterQuery(ret, type);
            $.isFunction(context) ? context(ret) : '';
            ewoo.showCounter('-');
            mObj.working = false;
            mObj._isCanGetNew = true;
        }

        if (this.loadTip) {
            this.toggleTip();
        }
        //支持表单的提交
        if (this.form != '') {
            if ($('#' + this.form).find('[type=file]').length > 0) {
                ajaxPost2Iframe(mObj.url, $('#' + this.form)[0], callfunc);
            } else {
                data = $('#' + this.form).serialize();
                //处理所有的自定义控件value
                $('#'+this.form).find('div,span,li [e-bind]').each(function(index, el) {
                    //$log(this);
                    var bindName=$(this).attr('e-bind');
                    if(!$is(bindName) || !$is(vm[bindName])){
                        return true;
                    }
                    data += '&'+bindName+'=' + vm[bindName];
                });
                data += '&limit=' + this.limit;
                data += '&page=' + this.page;
                data += '&basesort=' + this.basesort;
                if (this.deleteId != '')
                    data += '&_deleteId=' + this.deleteId;
                if ($is(this.deleteIds) && this.deleteIds.length > 0 && this.isDelAll == true) {
                    for (var i = 0; i < this.deleteIds.length; i++) {
                        data += '&_deleteId[]=' + this.deleteIds[i];
                    }
                }
                data += '&_sesskey=' + ewoo.login.sesskey();
                if (mObj._maxId > 0) data += '&_maxId=' + mObj._maxId;
                if (mObj._minId > 0) data += '&_minId=' + mObj._minId;


                $.ajax({
                    type: 'POST',
                    url: mObj.url,
                    data: data,
                    timeout: 30000,
                    dataType: "json",
                    success: callfunc,
                    error: function(error) {
                        if (mObj.loadTip) {
                            mObj.toggleTip();
                        }
                        //ewoo.showCounter('-');
                        mObj.working = false;
                    }
                });
            }
        } else {
            //var data = ewoo.getPara(this.para);
            //if (data === false)
            //return false;

            data['limit'] = this.limit;
            data['page'] = this.page;
            data['basesort'] = this.basesort;
            if (this.deleteId != '')
                data['_deleteId'] = this.deleteId;
            if ($is(this.deleteIds) && this.deleteIds.length > 0 && this.isDelAll == true)
                data['_deleteId'] = this.deleteIds;
            data['_sesskey'] = ewoo.login.sesskey();
            if (mObj._maxId > 0) data['_maxId'] = mObj._maxId;
            if (mObj._maxId > 0) data['_minId'] = mObj._minId;

            $.ajax({
                type: 'POST',
                url: mObj.url,
                data: data,
                timeout: 30000,
                dataType: "json",
                success: callfunc,
                error: function(error) {
                    // alert(error.response);\\
                    var str = "[执行ajax失败]:\n";
                    str += "[接口地址]：\n" + mObj.url + "\r\n";
                    str += "[POST参数]：\n" + $.param(data) + "\r\n";
                    if ($is(error.response)) {
                        str += "[返回结果]：\n" + error.response + "\r\n";
                    }
                    if (mObj.loadTip) {
                        mObj.toggleTip();
                    }
                    // alert(str);
																			//	ewoo.showCounter('-');
                    mObj.working = false;
                    //console.error(error);

                }
            });
        }



    };
    //删除信息
    this.del = function(id) {
        if (!$is(id) || id == '') {
            alert('请选定要删除的记录');
            return;
        }
        if (confirm('请确定需要删除选定记录吗？')) {
            this.deleteId = id;
            this.query();
            this.deleteId = '';
        }
    }
    this.delAll = function(storeName) {
        if (!$is(this.deleteIds) || this.deleteIds.length <= 0) {
            alert('请选定要删除的记录');
            return;
        }
        if (confirm('请确定需要删除选定记录吗？')) {
            this.isDelAll = true;
            this.query();
            this.isDelAll = false;
            this.deleteIds = null;
        }
    }

    //可以重写的虚函数
    this.afterQuery = function(json, type) {}

    this.beforeQuery = function(json) {}


    //
    this.setPage = function(val) {
        var maxPage = Math.ceil(this.total / this.limit);
        if (val == '+') {
            this.page++;
        } else if (val == '-') {
            this.page--;
        } else if (val == 'end') {
            this.page = maxPage;
        } else {
            this.page = val;
        }
        //判断页码有效性
        if (this.page <= 1)
            this.page = 1;
        if (this.page >= maxPage)
            this.page = maxPage;
        vm.page = this.page;
        this.query();
    };

    this.toggleTip = function() {
            if ($("#queryTip").length <= 0) {
                $(document.body).append('<div id="queryTip" style="position:fixed;display:none;z-index:99;top:20%;left:45%;"><img src="/ui/man/image/wait.jpg"></div>');
            }
            if ($("#queryTip").css('display') == 'none') {
                $("#queryTip").css('display', 'block');
            } else {
                $("#queryTip").css('display', 'none');
            }
        }
        //定时刷新最新信息的处理

    this.init = function() {
            if (this.timer > 0) {
                setInterval(function() {
                    if (mObj._isCanGetNew) {
                        mObj.queryNew();
                    }
                }, this.timer);
            }

        }
        //end class 
    return this;
}

//根据传递参数，加载store所在的js文件
//method=tjid.user.login
ewoo.store = function(method, opt) {
    var para = method.split('.');
    if (para.length !== 3) {
        alert("接口方法的格式为：app.class.func格式！");
        return;
    }
    //动态加载对应的js文件：ui/store/user.js 
    var storeName = para[1] + 'Store';
    if (!$is(window[storeName])) {
        var jsFile = '/ui/store/' + para[0] + '/' + para[1] + '.js';
        ewoo.loadJs(jsFile);
    }
    //window[userStore][login] 这个对象
    var ret = window[storeName][para[2]];
    //将opt的属性覆盖原来的  
    if ($is(opt)) {
        for (var key in opt) {
            ret[key] = opt[key];
        }
    }
    return ret;
}

//参数检验
//参数有效性检查的函数,并且返回提交的参数
ewoo.getPara = function(para) {
    var data = {};
    if (typeof(para) == 'undefined') {
        return data;
    }
    //字符串形式 ''
    if (typeof para == 'string') {
        var newPara = [];
        var arr1 = para.split(',');
        for (var i = 0; i < arr1.length; i++) {
            if (arr1 == '') {
                continue;
            }
            arr2 = arr1[i].split('|');
            newPara.push({
                name: arr2[0],
                check: arr2[1],
                msg: arr2[2]
            });
        }
        para = newPara;
    }
    var chkType = {
        require: /.+/,
        email: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
        phone: /^((\(\d{2,3}\))|(\d{3}\-))?(\(0\d{2,3}\)|0\d{2,3}-)?[1-9]\d{6,7}(\-\d{1,4})?$/,
        mobile: /^((\(\d{3}\))|(\d{3}\-))?13\d{9}|1[0-9]\d{9}$/,
        url: /(^http:\/\/[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\':+!]*([^<>\"\"])*$)|(^[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\':+!]*([^<>\"\"])*$)/,
        currency: /^\d+(\.\d+)?$/,
        number: /^\d+(\.\d+)?$/,
        zip: /^[1-9]\d{5}$/,
        qq: /^[1-9]\d{4,12}$/,
        integer: /^[-\+]?\d+$/,
        double: /^[-\+]?\d+(\.\d+)?$/,
        english: /^[A-Za-z]+$/,
        chinese: /^[\u0391-\uFFE5]+$/,
        username: /^[a-z]\w{3,}$/i,
        unsafe: /^(([A-Z]*|[a-z]*|\d*|[-_\~!@#\$%\^&\*\.\(\)\[\]\{\}<>\?\\\/\'\"]*)|.{0,5})$|\s/
    };
    //实施验证
    for (var i = 0; i < para.length; i++) {

        var row = para[i];
        if (!$is(row))
            continue;
        var val = vm[row.name];
        var field = ($is(row.field) && row.field != '') ? row.field : row.name;
        data[field] = val;
        //检查有效性 并且弹出msg信息
        if (typeof(row.check) != 'undefined' && typeof(chkType[row.check]) != 'undefined') {
            if (!chkType[row.check].test(val) || !$is(val)) {
                (typeof(row.msg) == 'undefined') ?
                alert('格式验证失败:' + row.name): alert(row.msg);
                //得到焦点
                $("[e-bind='" + row.name + "']").focus();
                return false;
            }
        }
    }
    return data;
}