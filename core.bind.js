ewoo.doBind = function (key) {

    $('[e-bind]').each(function (index, el) {
        var name = $(this).attr('e-bind');
        var val = '';
        //防止更新全部区域
        if ($is(key) && name.indexOf(key) == -1) {
            return true;
        }
        try {
            val = eval('vm.' + name);
        } catch (e) {
            //alert('bind erroe: name='+name);
            //return;
            val = '';
        }

        if (val === undefined)
            val = '';
        //赋值

        //radio的处理
        if ($(el).attr('type') == 'radio') {
            if ($(el).val() == val) {
                //$(el).click();
                $(el).attr("checked", "checked");
            }
        }
        else if ($(el).attr('type') == 'checkbox') {
            for (var o  in val) {
                if ($(el).val() == val[o]) {
                    $(el).attr("checked", "checked");
                }
            }
        } else if (el.tagName === 'SPAN' || el.tagName === 'DIV' || el.tagName === 'LI') {
            var value = $(el).attr('value');
            var isGroup = (value !== undefined) ? false : true;//是否是组按钮
            if (!isGroup) {
                (val != '') ? $(el).addClass('_click') : $(el).removeClass('_click');
            } else {
                //	console.log(vm);
                var arr = val.split(',');
                $(el).children('[value]').each(function (index, child) {
                    var myval = $(child).attr('value');
                    $in(arr, myval) ? $(child).addClass('_click') : $(child).removeClass('_click');
                });

            }
        } else {
            $(el).val(val);
            $(el).trigger('click');//触发控件的点击事件
            //如果是editor 需要对富文本框设置值
            if ($(el).attr('e-editor')) {
                yEditors[name].html(val);
            }
        }


        //事件的捆绑
        $(el).attr('name', name);//都设置一个name的属性 用于form的提交处理
        if ($(el).attr('_isbind') != '1' && el.tagName !== 'SPAN' && el.tagName !== 'DIV' && el.tagName !== 'LI') {
            $(el).attr('_isbind', 1);


            var bindHand = function () {
                var name = $(this).attr('e-bind');
                var val = this.value;
                if ($(el).attr('type') == 'checkbox') {
                    //找出所有checkbox
                    eval('vm.' + name + '="";');
                    $("[e-bind='" + name + "']:checked").each(function (index2, el2) {
                        //防止更新循环中的模版框
                        if ($(el2).val().indexOf('{el.') != -1) {
                            return true;
                        }
                        if (index2 == 0) {
                            eval('vm.' + name + '=[];');
                        }
                        eval('vm.' + name + ".push('" + $(el2).val() + "');");
                    });
                }
                else {
                    eval('vm.' + name + '=val;');

                }
                ewoo.update(name, false);
            };
            //如果是textarea 绑定
            if (el.tagName === 'TEXTAREA') {
                $(el).bind('keyup', bindHand);
            } else {
                $(el).bind('change', bindHand);
            }

        }

    });
}

/////////////////////////////////////////////////////
//div,span,li被点击的处理:单选和多选模式
ewoo.bindDivClick = function (src) {
	
	
    var vname = $(src).attr('e-bind');
    var isGroup = (vname !== undefined) ? false : true;//是否是组按钮

    //单元素控件，直接处理,点击设置值，取消为空值
    if (!isGroup) {
        if ($(src).hasClass('_click')) {
            $(src).removeClass('_click');
            vm.set(vname, '');
        } else {
            $(src).addClass('_click');
            vm.set(vname, $(src).attr('value'));
        }
        return;
    }
    //判断是单选还是多选  e-size默认为1，0表示多选，N表示只能选几个
    var warpObj=$(src).parents('[e-bind]');
    if($(src).attr('value')!==undefined){
        var optionObj=$(src);
    }
    else{
        var optionObj=$(src).parents('[value]');
    }
    
    vname = warpObj.attr('e-bind');
    if (vname === undefined) {
        alert('需要在对象或父对象上设置e-bind属性！');
        return;
    }
    //最多能选多少个
    var size = warpObj.attr('e-size');
    if (size === undefined)
        size = 1;
    size = 1 * size;

    if (size == 1) {//单选按钮
        warpObj.children('._click').removeClass('_click');
        //optionObj.siblings().removeClass('_click');
        //$(src).addClass('_click');
        optionObj.addClass('_click');
    } else if (size == 0) {//不限制选项
        optionObj.hasClass('_click') ? $(src).removeClass('_click') : $(src).addClass('_click');
    } else { //限制了选项的
        if (optionObj.hasClass('_click')) {
            optionObj.removeClass('_click');
        } else {
            if (warpObj.children('._click').length == size) {
                alert('只能选择【' + size + '】项!');
                return; //已经满足了选项
            }
            optionObj.addClass('_click');
        }
    }
    //遍历所有子对象的值，逗号分开
    var vals = new Array();
    warpObj.children('._click').each(function (index, child) {
        if ($(child).attr('value') != '') {
            vals.push($(child).attr('value'));
        }
    });
    //vm.set(vname,vals.join(','));
				if(vm[vname] !==vals.join(',')){
					vm[vname] = vals.join(',');
					ewoo.update(vname, false);
				}
}









