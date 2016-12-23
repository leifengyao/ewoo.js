/*!
 *******************************************************************************
 [ewoo.core] [双向绑定，渲染页面等框架核心功能]  
	ewoo类viewModel类
 ********************************************************************************/
var ewoo = ewoo || {};
ewoo.gNumber = 1;//全局计数器
ewoo.exec = function (vm) {

    //为vm增加一些常用的方法

    vm.set = function (key, val) {
        try {
            // if($.isFunction(vm[key])){
            //     val=vm[key](val);
            // }
												
            eval('if(val!==vm.' + key + '){ vm.' + key + '=val;ewoo.update(key);}');
            
        } catch (e) {
            // alert(key);
            //console.log('error: vm.set(key, val) key= ' + key);
        }
    };
    vm.add = function (key, val) {
        eval('vm.' + key + '.push(val);');
        ewoo.update(key);
    };
    vm.append = function (key, val) {
        eval('vm.' + key + '.unshift(val);');
        ewoo.update(key);
    };



    /*
     构造所有的estore
     */
    var isUpdate = false;
    for (var k in vm) {
        if ($is(vm[k]) && $is(vm[k].url)) {

            //构造一个model类
            var old = vm[k];
            //var isload = old.autoLoad;
            var store = new eStore();
            for (var key in old) {
                store[key] = old[key];
            }
            store.className = k;//设置类的名称
            vm[k] = store;

            store.init();
            if (store.autoLoad) {
                ewoo.showCounter('+');
                vm[k].query();
                isUpdate = true;
            }
        }
    }
    //先隐藏界面，知道ajax读取完成之后显示界面，如果出错，15秒后也必须显示界面
    $(document.body).hide();
    setTimeout(function () {
        $(document.body).show();
        $(document.body).css('visibility','visible');
    }, 15000);
    ewoo.showCounter('');
    //yview.init(document.body);
    //if (isUpdate == false)
    ewoo.update();

}

//增加一种计数器机制，等待数据加载完成之后，显示界面
ewoo.isShowCounter = 0;
ewoo.showCounter = function (act) {
    if (act == '+')
        ewoo.isShowCounter++;
    if (act == '-')
        ewoo.isShowCounter--;
    //  alert(ewoo.isShowCounter);
    if (ewoo.isShowCounter <= 0) {
        $(document.body).show();
        $(document.body).css('visibility','visible');
        $log(ewoo.isShowCounter);
        //调用ready函数
        if($is(vm.onLoadReady)){
            vm.onLoadReady();
        }
    }
}


ewoo.doEnable = function (key) {
    $('[e-enable]').each(function (index, el) {
        var name = el.getAttribute('e-enable');
        if ($is(key) && name.indexOf(key) == -1) {
            return true;
        }
        code = 'vm.' + name;
        var is = eval(code);
        (is) ? $(el).removeAttr('disabled') : $(el).attr('disabled', 'disabled');
    });

}

//只更新相关的视图
ewoo.update = function (key, isbind) {

    if ($is(vm.onBeforeChange)) {
        vm.onBeforeChange(key);
    }
				//优化性能，可以根据参数的属性做一个大致的筛选
    ewoo.doEach(key);
    ewoo.doHtml(key);
    ewoo.doEnable(key);
    ewoo.doAttr(key);
    ewoo.doFunction(key);
    ewoo.doIf();//计算所有的2016-10-21 可能存在 e-if="1>2" 常量的这种方式

    //防止e-bind 重复调用
    if (isbind !== false){
        ewoo.doBind(key);
	}

    if ($is(vm.onAfterChange)) {
        vm.onAfterChange(key);
    }
}

