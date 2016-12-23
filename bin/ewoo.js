/*!
 *******************************************************************************
 [ewoo.base] [框架全局函数和基础函数]  
 *******************************************************************************
 */
/*
 * api接口封装 对外函数
 * 
 */
function getWindowDocument(frame) {
    var doc = null;
    try {
        doc = (frame.contentWindow) ? frame.contentWindow.document : null;
    } catch (err) {
    }
    if (doc) {
        return doc;
    }
    try {
        doc = frame.contentDocument ? frame.contentDocument : frame.document;
    } catch (err) {
        doc = frame.document;
    }
    return doc;
}


function ajaxPost2Iframe(url, form, callback) {

    //创建一个框架,然后将form数据提交到框架页面
    var iframeId = 'unique' + (new Date().getTime());
    var iframe = $('<iframe style="position: absolute; width: 100px; height: 100px; border: 5px solid #f00; left: 40px; top: 16px;"  src="javascript:false;" name="' + iframeId + '"  id="' + iframeId + '"></iframe>');
    iframe.hide();

    form.before(iframe);
    iframe.load(function(e) {

        var doc = getWindowDocument(iframe[0]);
        var docRoot = doc.body ? doc.body : doc.documentElement;
        var data = docRoot.innerHTML;
        if ('false' !== data) {
            try {
                eval('var json=' + data + ';');
                callback(json);
            } catch (e) {
                callback(data);
            }
        }
        //  $(iframe).remove(); //先不要移除  IE7下面有问题 load会调用两次
    });

    setTimeout(function() {
        $(form).attr('method', 'post');
        $(form).attr('action', url);
        $(form).attr('target', iframeId);
        $(form).removeAttr("onsubmit");
        $(form).submit();
    }, 200);
}


/*
 * 
 * 常用的基本函数
 */
function $selector(finder, el) {
    if (!$is(el))
        el = document.body;
    var els = $(el).find(finder);
    if (els.length == 0)
        return new Array();
    var objs = new Array();
    for (var i = 0; i < els.length; i++) {
        objs.push(els[i]);
    }
    return objs;
}
function $is(val) {
    return (typeof (val) == 'undefined' || val == null) ? false : true;
}
;
function $def(v, def) {
    return ($is(v)) ? v : def;
}
;
function $in(v, val) {
    for (var n in v) {
        if (val == v[n])
            return true;
    }
    return false;
}
function $log(v) {
    if (typeof (window.console) !== 'undefined' && window.console.log !== undefined) {
        window.console.log(v);
    }
}

function $format(str) {
    var args = arguments, re = new RegExp("%([1-9])", "g");
    return String(str).replace(re, function($m, $i) {
        return args[$i];
    });
}


var ewoo = ewoo || {};
ewoo.loadJs = function(file) {
    $.ajax({url: file, async: false});
}
ewoo.loadCss = function(file) {
    var head = document.getElementsByTagName('head').item(0);
    css = document.createElement('link');
    css.href = file;
    css.rel = 'stylesheet';
    css.type = 'text/css';
    head.appendChild(css);
}



ewoo.log = function(o) {
    console.log(o);
};

ewoo.callApi = function(method, para, callfunc) {
    //1.选择服务器 本操作可以缓存
    var ip = '';
    //2.执行ajax获取参数
    var url = method;
    $.ajax({type: 'POST', url: url, data: para, timeout: 30000, success: callfunc, error: callfunc});
};
ewoo.tts=function(str){
    var m = new Audio();
    m.src = 'http://tts.baidu.com/text2audio?lan=zh&ie=UTF-8&spd=10&text=' + txt;
    m.play();
};

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


$(function(){



/** 
 * easyDialog v2.2
 * Url : http://stylechen.com/easydialog-v2.0.html
 * Author : chenmnkken@gmail.com
 * Date : 2012-04-22
 */
(function( win, undefined ){

var	doc = win.document,
	docElem = doc.documentElement;

var easyDialog = function(){

var	body = doc.body,
	isIE = !-[1],	// 判断IE6/7/8 不能判断IE9
	isIE6 = isIE && /msie 6/.test( navigator.userAgent.toLowerCase() ), // 判断IE6
	uuid = 1,
	expando = 'cache' + ( +new Date() + "" ).slice( -8 ),  // 生成随机数
	cacheData = {
	/**
	 *	1 : {
	 *		eclick : [ handler1, handler2, handler3 ]; 
	 *		clickHandler : function(){ //... }; 
	 *	} 
	 */	
	};

var	Dialog = function(){};

Dialog.prototype = {
	// 参数设置
	getOptions : function( arg ){
		var i,
			options = {},
			// 默认参数
			defaults = {
				container:   null,			// string / object   弹处层内容的id或内容模板
				overlay:     true,			// boolean  		 是否添加遮罩层
				drag:	     true,			// boolean  		 是否绑定拖拽事件
				fixed: 	     true,			// boolean  		 是否静止定位
				follow:      null,			// string / object   是否跟随自定义元素来定位
				followX:     0,				// number   		 相对于自定义元素的X坐标的偏移
				followY:     0,				// number  		     相对于自定义元素的Y坐标的偏移
				autoClose:   0,				// number            自动关闭弹出层的时间
				lock:        false,			// boolean           是否允许ESC键来关闭弹出层
				callback:    null			// function          关闭弹出层后执行的回调函数
				/** 
				 *  container为object时的参数格式
				 *	container : {
				 *		header : '弹出层标题',
				 *		content : '弹出层内容',
				 *		yesFn : function(){},	    // 确定按钮的回调函数
				 *		noFn : function(){} / true,	// 取消按钮的回调函数
				 *		yesText : '确定',		    // 确定按钮的文本，默认为‘确定’
				 *		noText : '取消' 		    // 取消按钮的文本，默认为‘取消’		
				 *	}		
				 */
			};
		
		for( i in defaults ){
			options[i] = arg[i] !== undefined ? arg[i] : defaults[i];
		}
		Dialog.data( 'options', options );
		return options;
	},
		
	// 防止IE6模拟fixed时出现抖动
	setBodyBg : function(){
		if( body.currentStyle.backgroundAttachment !== 'fixed' ){
			body.style.backgroundImage = 'url(about:blank)';
			body.style.backgroundAttachment = 'fixed';
		}
	},
	
	// 防止IE6的select穿透
	appendIframe : function(elem){
		elem.innerHTML = '<iframe style="position:absolute;left:0;top:0;width:100%;height:100%;z-index:-1;border:0 none;filter:alpha(opacity=0)"></iframe>';
	},
	
	/**
	 * 设置元素跟随定位
	 * @param { Object } 跟随的DOM元素
	 * @param { String / Object } 被跟随的DOM元素
	 * @param { Number } 相对于被跟随元素的X轴的偏移
	 * @param { Number } 相对于被跟随元素的Y轴的偏移
	 */
	setFollow : function( elem, follow, x, y ){
		follow = typeof follow === 'string' ? doc.getElementById( follow ) : follow;
		var style = elem.style;
		style.position = 'absolute';			
		style.left = Dialog.getOffset( follow, 'left') + x + 'px';
		style.top = Dialog.getOffset( follow, 'top' ) + y + 'px';
	},
	
	/**
	 * 设置元素固定(fixed) / 绝对(absolute)定位
	 * @param { Object } DOM元素
	 * @param { Boolean } true : fixed, fasle : absolute
	 */
	setPosition : function( elem, fixed ){
		var style = elem.style;
		style.position = isIE6 ? 'absolute' : fixed ? 'fixed' : 'absolute';
		if( fixed ){
			if( isIE6 ){
				style.setExpression( 'top','fuckIE6=document.documentElement.scrollTop+document.documentElement.clientHeight/2+"px"' );
			}
			else{
				style.top = '50%';
			}
			style.left = '50%';
		}
		else{
			if( isIE6 ){
				style.removeExpression( 'top' );
			}
			style.top = docElem.clientHeight/2 + Dialog.getScroll( 'top' ) + 'px';
			style.left = docElem.clientWidth/2 + Dialog.getScroll( 'left' ) + 'px';
		}
	},
	
	/**
	 * 创建遮罩层
	 * @return { Object } 遮罩层 
	 */
	createOverlay : function(){
		var overlay = doc.createElement('div'),
			style = overlay.style;
			
		style.cssText = 'margin:0;padding:0;border:none;width:100%;height:100%;background:#333;opacity:0.6;filter:alpha(opacity=60);z-index:9999;position:fixed;top:0;left:0;';
		
		// IE6模拟fixed
		if(isIE6){
			body.style.height = '100%';
			style.position = 'absolute';
			style.setExpression('top','fuckIE6=document.documentElement.scrollTop+"px"');
		}
		
		overlay.id = 'overlay';
		return overlay;
	},
	
	/**
	 * 创建弹出层
	 * @return { Object } 弹出层 
	 */
	createDialogBox : function(){
		var dialogBox = doc.createElement('span');		
		dialogBox.style.cssText = 'margin:0;padding:0;border:none;z-index:10000;';
		dialogBox.id = 'easyDialogBox';		
		//alert($(dialogBox).html());
		return dialogBox;
	},

	/**
	 * 创建默认的弹出层内容模板
	 * @param { Object } 模板参数
	 * @return { Object } 弹出层内容模板
	 */
	createDialogWrap : function( tmpl ){
		// 弹出层标题
		var header = tmpl.header ? 
			'<h4 class="easyDialog_title" id="easyDialogTitle"><a href="javascript:void(0)" title="关闭窗口" class="close_btn" id="closeBtn">&times;</a>' + tmpl.header + '</h4>' :
			'',
			// 确定按钮
			yesBtn = typeof tmpl.yesFn === 'function' ? 
				'<div type="button" class="btn_highlight" id="easyDialogYesBtn" >' + ( typeof tmpl.yesText === 'string' ? tmpl.yesText : '确定' ) + '</div>' :
				'',
			// 取消按钮	
			noBtn = typeof tmpl.noFn === 'function' || tmpl.noFn === true ? 
				'<div class="btn_normal" id="easyDialogNoBtn">' + ( typeof tmpl.noText === 'string' ? tmpl.noText : '取消' ) + '</div>' :
				'',			
			// footer
			footer = yesBtn === '' && noBtn === '' ? '' :
				'<div class="easyDialog_footer">' + noBtn + yesBtn + '</div>',
			
			dialogTmpl = [
			'<div class="easyDialog_content">',
				header,
				'<div class="easyDialog_text">' + tmpl.content + '</div>',
				footer,
			'</div>'
			].join(''),

			dialogWrap = doc.getElementById( 'easyDialogWrapper' ),
			rScript = /<[\/]*script[\s\S]*?>/ig;
			
		if( !dialogWrap ){
			dialogWrap = doc.createElement( 'div' );
			dialogWrap.id = 'easyDialogWrapper';
			dialogWrap.className = 'easyDialog_wrapper';
		}
		dialogWrap.innerHTML = dialogTmpl.replace( rScript, '' );		
		return dialogWrap;
	}		
};
	
/**
 * 设置并返回缓存的数据 关于缓存系统详见：http://stylechen.com/cachedata.html
 * @param { String / Object } 任意字符串或DOM元素
 * @param { String } 缓存属性名
 * @param { Anything } 缓存属性值
 * @return { Object } 
 */
Dialog.data = function( elem, val, data ){
    if( typeof elem === 'string' ){
        if( val !== undefined ){
			cacheData[elem] = val;
	    }
		return cacheData[elem];
	}
	else if( typeof elem === 'object' ){
		// 如果是window、document将不添加自定义属性
		// window的索引是0 document索引为1
		var index = elem === win ? 0 : 
				elem.nodeType === 9 ? 1 : 
				elem[expando] ? elem[expando] : 
				(elem[expando] = ++uuid),
			
			thisCache = cacheData[index] ? cacheData[index] : ( cacheData[index] = {} );
				
		if( data !== undefined ){
			// 将数据存入缓存中
			thisCache[val] = data;
		}
		// 返回DOM元素存储的数据
		return thisCache[val];
	}
};

/**
 * 删除缓存
 * @param { String / Object } 任意字符串或DOM元素
 * @param { String } 要删除的缓存属性名
 */
Dialog.removeData = function( elem, val ){
	if( typeof elem === 'string' ){
		delete cacheData[elem];
	}
	else if( typeof elem === 'object' ){
		var index = elem === win ? 0 :
				elem.nodeType === 9 ? 1 :
				elem[expando];
			
		if( index === undefined ) return;		
		// 检测对象是否为空
		var isEmptyObject = function( obj ) {
				var name;
				for ( name in obj ) {
					return false;
				}
				return true;
			},
			// 删除DOM元素所有的缓存数据
			delteProp = function(){
				delete cacheData[index];
				if( index <= 1 ) return;
				try{
					// IE8及标准浏览器可以直接使用delete来删除属性
					delete elem[expando];
				}
				catch ( e ) {
					// IE6/IE7使用removeAttribute方法来删除属性(document会报错)
					elem.removeAttribute( expando );
				}
			};

		if( val ){
			// 只删除指定的数据
			delete cacheData[index][val];
			if( isEmptyObject( cacheData[index] ) ){
				delteProp();
			}
		}
		else{
			delteProp();
		}
	}
};

// 事件处理系统
Dialog.event = {
	
	bind : function( elem, type, handler ){
		var events = Dialog.data( elem, 'e' + type ) || Dialog.data( elem, 'e' + type, [] );
		// 将事件函数添加到缓存中
		events.push( handler );
		// 同一事件类型只注册一次事件，防止重复注册
		if( events.length === 1 ){
			var eventHandler = this.eventHandler( elem );
			Dialog.data( elem, type + 'Handler', eventHandler );
			if( elem.addEventListener ){
				elem.addEventListener( type, eventHandler, false );
			}
			else if( elem.attachEvent ){
				elem.attachEvent( 'on' + type, eventHandler );
			}
		}
	},
		
	unbind : function( elem, type, handler ){
		var events = Dialog.data( elem, 'e' + type );
		if( !events ) return;
			
		// 如果没有传入要删除的事件处理函数则删除该事件类型的缓存
		if( !handler ){
			events = undefined;		
		}
		// 如果有具体的事件处理函数则只删除一个
		else{
			for( var i = events.length - 1, fn = events[i]; i >= 0; i-- ){
				if( fn === handler ){
					events.splice( i, 1 );
				}				
			}
		}		
		// 删除事件和缓存
		if( !events || !events.length ){
			var eventHandler = Dialog.data( elem, type + 'Handler' );			
			if( elem.addEventListener ){
				elem.removeEventListener( type, eventHandler, false );
			}
			else if( elem.attachEvent ){
				elem.detachEvent( 'on' + type, eventHandler );
			}		
			Dialog.removeData( elem, type + 'Handler' );
			Dialog.removeData( elem, 'e' + type );
		}
	},
		
	// 依次执行事件绑定的函数
	eventHandler : function( elem ){
		return function( event ){
			event = Dialog.event.fixEvent( event || win.event );
			var type = event.type,
				events = Dialog.data( elem, 'e' + type );
				
			for( var i = 0, handler; handler = events[i++]; ){
				if( handler.call(elem, event) === false ){
					event.preventDefault();
					event.stopPropagation();
				}
			}
		}
	},
	
	// 修复IE浏览器支持常见的标准事件的API
	fixEvent : function( e ){
		// 支持DOM 2级标准事件的浏览器无需做修复
		if ( e.target ) return e; 
		var event = {}, name;
		event.target = e.srcElement || document;
		event.preventDefault = function(){
			e.returnValue = false;
		};		
		event.stopPropagation = function(){
			e.cancelBubble = true;
		};
		// IE6/7/8在原生的window.event中直接写入自定义属性
		// 会导致内存泄漏，所以采用复制的方式
		for( name in e ){
			event[name] = e[name];
		}				
		return event;
	}
};

/**
 * 首字母大写转换
 * @param { String } 要转换的字符串
 * @return { String } 转换后的字符串 top => Top
 */
Dialog.capitalize = function( str ){
	var firstStr = str.charAt(0);
	return firstStr.toUpperCase() + str.replace( firstStr, '' );
};

/**
 * 获取滚动条的位置
 * @param { String } 'top' & 'left'
 * @return { Number } 
 */	
Dialog.getScroll = function( type ){
	var upType = this.capitalize( type );		
	return docElem['scroll' + upType] || body['scroll' + upType];	
};

/**
 * 获取元素在页面中的位置
 * @param { Object } DOM元素
 * @param { String } 'top' & 'left'
 * @return { Number } 
 */		
Dialog.getOffset = function( elem, type ){
	var upType = this.capitalize( type ),
		client  = docElem['client' + upType]  || body['client' + upType]  || 0,
		scroll  = this.getScroll( type ),
		box = elem.getBoundingClientRect();
		
	return Math.round( box[type] ) + scroll - client;
};

/**
 * 拖拽效果
 * @param { Object } 触发拖拽的DOM元素
 * @param { Object } 要进行拖拽的DOM元素
 */
Dialog.drag = function( target, moveElem ){
	// 清除文本选择
	var	clearSelect = 'getSelection' in win ? function(){
		win.getSelection().removeAllRanges();
		} : function(){
			try{
				doc.selection.empty();
			}
			catch( e ){};
		},
		
		self = this,
		event = self.event,
		isDown = false,
		newElem = isIE ? target : doc,
		fixed = moveElem.style.position === 'fixed',
		_fixed = Dialog.data( 'options' ).fixed;
	
	// mousedown
	var down = function( e ){
		isDown = true;
		var scrollTop = self.getScroll( 'top' ),
			scrollLeft = self.getScroll( 'left' ),
			edgeLeft = fixed ? 0 : scrollLeft,
			edgeTop = fixed ? 0 : scrollTop;
		
		Dialog.data( 'dragData', {
			x : e.clientX - self.getOffset( moveElem, 'left' ) + ( fixed ? scrollLeft : 0 ),	
			y : e.clientY - self.getOffset( moveElem, 'top' ) + ( fixed ? scrollTop : 0 ),			
			// 设置上下左右4个临界点的位置
			// 固定定位的临界点 = 当前屏的宽、高(下、右要减去元素本身的宽度或高度)
			// 绝对定位的临界点 = 当前屏的宽、高 + 滚动条卷起部分(下、右要减去元素本身的宽度或高度)
			el : edgeLeft,	// 左临界点
			et : edgeTop,  // 上临界点
			er : edgeLeft + docElem.clientWidth - moveElem.offsetWidth,  // 右临界点
			eb : edgeTop + docElem.clientHeight - moveElem.offsetHeight  // 下临界点
		});
		
		if( isIE ){
			// IE6如果是模拟fixed在mousedown的时候先删除模拟，节省性能
			if( isIE6 && _fixed ){
				moveElem.style.removeExpression( 'top' );
			}
			target.setCapture();
		}
		
		event.bind( newElem, 'mousemove', move );
		event.bind( newElem, 'mouseup', up );
		
		if( isIE ){
			event.bind( target, 'losecapture', up );
		}
		
		e.stopPropagation();
		e.preventDefault();
		
	};
	
	event.bind( target, 'mousedown', down );
	
	// mousemove
	var move = function( e ){
		if( !isDown ) return;
		clearSelect();
		var dragData = Dialog.data( 'dragData' ),
			left = e.clientX - dragData.x,
			top = e.clientY - dragData.y,
			et = dragData.et,
			er = dragData.er,
			eb = dragData.eb,
			el = dragData.el,
			style = moveElem.style;
		
		// 设置上下左右的临界点以防止元素溢出当前屏
		style.marginLeft = style.marginTop = '0px';
		style.left = ( left <= el ? el : (left >= er ? er : left) ) + 'px';
		style.top = ( top <= et ? et : (top >= eb ? eb : top) ) + 'px';
		e.stopPropagation();
	};
	
	// mouseup
	var up = function( e ){
		isDown = false;
		if( isIE ){
			event.unbind( target, 'losecapture', arguments.callee );
		}
		event.unbind( newElem, 'mousemove', move );
		event.unbind( newElem, 'mouseup', arguments.callee );		
		if( isIE ){
			target.releaseCapture();
			// IE6如果是模拟fixed在mouseup的时候要重新设置模拟
			if( isIE6 && _fixed ){
				var top = parseInt( moveElem.style.top ) - self.getScroll( 'top' );
				moveElem.style.setExpression('top',"fuckIE6=document.documentElement.scrollTop+" + top + '+"px"');
			}
		}
		e.stopPropagation();
	};
};

var	timer,	// 定时器
	// ESC键关闭弹出层
	escClose = function( e ){
		if( e.keyCode === 27 ){
			extend.close();
		}
	},	
	// 清除定时器
	clearTimer = function(){
		if( timer ){
			clearTimeout( timer );
			timer = undefined;
		}
	};
	
var extend = {
	open : function(){
		var $ = new Dialog(),
			options = $.getOptions( arguments[0] || {} ),	// 获取参数
			event = Dialog.event,
			docWidth = docElem.clientWidth,
			docHeight = docElem.clientHeight,
			self = this,
			overlay,
			dialogBox,
			dialogWrap,
			boxChild;
			
		clearTimer();
		
		// ------------------------------------------------------
		// ---------------------插入遮罩层-----------------------
		// ------------------------------------------------------
		
		// 如果页面中已经缓存遮罩层，直接显示
		if( options.overlay ){
			overlay = doc.getElementById( 'overlay' );			
			if( !overlay ){
				overlay = $.createOverlay();
				body.appendChild( overlay );
				if( isIE6 ){
					$.appendIframe( overlay );
				}
			}
			overlay.style.display = 'block';
		}
		
		if(isIE6){
			$.setBodyBg();
		}
		
		// ------------------------------------------------------
		// ---------------------插入弹出层-----------------------
		// ------------------------------------------------------
		
		// 如果页面中已经缓存弹出层，直接显示
		dialogBox = doc.getElementById( 'easyDialogBox' );
		if( !dialogBox ){
			dialogBox = $.createDialogBox();
			body.appendChild( dialogBox );
		}
		
		if( options.follow ){
			var follow = function(){
				$.setFollow( dialogBox, options.follow, options.followX, options.followY );
			};
			
			follow();
			event.bind( win, 'resize', follow );
			Dialog.data( 'follow', follow );
			if( overlay ){
				overlay.style.display = 'none';
			}
			options.fixed = false;
		}
		else{
			$.setPosition( dialogBox, options.fixed );
		}
		dialogBox.style.display = 'block';
				
		// ------------------------------------------------------
		// -------------------插入弹出层内容---------------------
		// ------------------------------------------------------
		
		// 判断弹出层内容是否已经缓存过
		dialogWrap = typeof options.container === 'string' ? 
			doc.getElementById( options.container ) : 
			$.createDialogWrap( options.container );
		
		boxChild = dialogBox.getElementsByTagName('*')[0];
		
		if( !boxChild ){
			dialogBox.appendChild( dialogWrap );
		}
		else if( boxChild && dialogWrap !== boxChild ){
			boxChild.style.display = 'none';
			body.appendChild( boxChild );
			dialogBox.appendChild( dialogWrap );
		}
		
		dialogWrap.style.display = 'block';
		
		var eWidth = dialogWrap.offsetWidth,
			eHeight = dialogWrap.offsetHeight,
			widthOverflow = eWidth > docWidth,
			heigthOverflow = eHeight > docHeight;
			
		// 强制去掉自定义弹出层内容的margin	
		dialogWrap.style.marginTop = dialogWrap.style.marginRight = dialogWrap.style.marginBottom = dialogWrap.style.marginLeft = '0px';	
		
		// 居中定位
		if( !options.follow ){			
			dialogBox.style.marginLeft = '-' + (widthOverflow ? docWidth/2 : eWidth/2) + 'px';
			dialogBox.style.marginTop = '-' + (heigthOverflow ? docHeight/2 : eHeight/2) + 'px';			
		}
		else{
			dialogBox.style.marginLeft = dialogBox.style.marginTop = '0px';
		}
				
		// 防止select穿透固定宽度和高度
		if( isIE6 && !options.overlay ){
			dialogBox.style.width = eWidth + 'px';
			dialogBox.style.height = eHeight + 'px';
		}
		
		// ------------------------------------------------------
		// --------------------绑定相关事件----------------------
		// ------------------------------------------------------
		var closeBtn = doc.getElementById( 'closeBtn' ),
			dialogTitle = doc.getElementById( 'easyDialogTitle' ),
			dialogYesBtn = doc.getElementById('easyDialogYesBtn'),
			dialogNoBtn = doc.getElementById('easyDialogNoBtn');		

		// 绑定确定按钮的回调函数
		if( dialogYesBtn ){
			event.bind( dialogYesBtn, 'click', function( event ){
				if( options.container.yesFn.call(self, event) !== false ){
					self.close();
				}
			});
		}
		
		// 绑定取消按钮的回调函数
		if( dialogNoBtn ){
			var noCallback = function( event ){
				if( options.container.noFn === true || options.container.noFn.call(self, event) !== false ){
					self.close();
				}
			};
			event.bind( dialogNoBtn, 'click', noCallback );
			// 如果取消按钮有回调函数 关闭按钮也绑定同样的回调函数
			if( closeBtn ){
				event.bind( closeBtn, 'click', noCallback );
			}
		}			
		// 关闭按钮绑定事件	
		else if( closeBtn ){
			event.bind( closeBtn, 'click', self.close );
		}
		
		// ESC键关闭弹出层
		if( !options.lock ){
			event.bind( doc, 'keyup', escClose );
		}
		// 自动关闭弹出层
		if( options.autoClose && typeof options.autoClose === 'number' ){
			timer = setTimeout( self.close, options.autoClose );
		}		
		// 绑定拖拽(如果弹出层内容的宽度或高度溢出将不绑定拖拽)
		if( options.drag && dialogTitle && !widthOverflow && !heigthOverflow ){
			dialogTitle.style.cursor = 'move';
			Dialog.drag( dialogTitle, dialogBox );
		}
		
		// 确保弹出层绝对定位时放大缩小窗口也可以垂直居中显示
		
		if( !options.follow && !options.fixed ){
			var resize = function(){
				$.setPosition( dialogBox, false );
			};
			// 如果弹出层内容的宽度或高度溢出将不绑定resize事件
			if( !widthOverflow && !heigthOverflow ){
				event.bind( win, 'resize', resize );
			}
			Dialog.data( 'resize', resize );
		}
		
		// 缓存相关元素以便关闭弹出层的时候进行操作
		Dialog.data( 'dialogElements', {
			overlay : overlay,
			dialogBox : dialogBox,
			closeBtn : closeBtn,
			dialogTitle : dialogTitle,
			dialogYesBtn : dialogYesBtn,
			dialogNoBtn : dialogNoBtn			
		});
	},
	
	close : function(){
		var options = Dialog.data( 'options' ),
			elements = Dialog.data( 'dialogElements' ),
			event = Dialog.event;
			
		clearTimer();
		//	隐藏遮罩层
		if( options.overlay && elements.overlay ){
			elements.overlay.style.display = 'none';
		}
		// 隐藏弹出层
		elements.dialogBox.style.display = 'none';
		// IE6清除CSS表达式
		if( isIE6 ){
			elements.dialogBox.style.removeExpression( 'top' );
		}
		
		// ------------------------------------------------------
		// --------------------删除相关事件----------------------
		// ------------------------------------------------------
		if( elements.closeBtn ){
			event.unbind( elements.closeBtn, 'click' );
		}

		if( elements.dialogTitle ){
			event.unbind( elements.dialogTitle, 'mousedown' );
		}
		
		if( elements.dialogYesBtn ){
			event.unbind( elements.dialogYesBtn, 'click' );
		}
		
		if( elements.dialogNoBtn ){
			event.unbind( elements.dialogNoBtn, 'click' );
		}
		
		if( !options.follow && !options.fixed ){
			event.unbind( win, 'resize', Dialog.data('resize') );
			Dialog.removeData( 'resize' );
		}
		
		if( options.follow ){
			event.unbind( win, 'resize', Dialog.data('follow') );
			Dialog.removeData( 'follow' );
		}
		
		if( !options.lock ){
			event.unbind( doc, 'keyup', escClose );
		}
		// 执行callback
		if(typeof options.callback === 'function'){
			options.callback.call( extend );
		}
		// 清除缓存
		Dialog.removeData( 'options' );
		Dialog.removeData( 'dialogElements' );
	}
};

return extend;

};

// ------------------------------------------------------
// ---------------------DOM加载模块----------------------
// ------------------------------------------------------
var loaded = function(){
		win.easyDialog = easyDialog();
	},
	
	doScrollCheck = function(){
		if ( doc.body ) return;

		try {
			docElem.doScroll("left");
		} catch(e) {
			setTimeout( doScrollCheck, 1 );
			return;
		}
		loaded();
	};

(function(){
	if( doc.body ){
		loaded();
	}
	else{
		if( doc.addEventListener ){
			doc.addEventListener( 'DOMContentLoaded', function(){
				doc.removeEventListener( 'DOMContentLoaded', arguments.callee, false );
				loaded();
			}, false );
			win.addEventListener( 'load', loaded, false );
		}
		else if( doc.attachEvent ){
			doc.attachEvent( 'onreadystatechange', function(){
				if( doc.readyState === 'complete' ){
					doc.detachEvent( 'onreadystatechange', arguments.callee );
					loaded();
				}
			});
			win.attachEvent( 'onload', loaded );			
			var toplevel = false;
			try {
				toplevel = win.frameElement == null;
			} catch(e) {}

			if ( docElem.doScroll && toplevel ) {
				doScrollCheck();
			}
		}
	}
})();

})( window, undefined );

// 2012-04-12 修复跟随定位缩放浏览器时无法继续跟随的BUG
// 2012-04-22 修复弹出层内容的尺寸大于浏览器当前屏尺寸的BUG


});

/*!
 *******************************************************************************
 [ewoo.event] [自定义点击事件组件]  
 *******************************************************************************
 */
/////////////////////////////////////////////可以响应的点击事件/////////////////////////////////////////////////////////////////////////////
var ewoo = ewoo || {};
ewoo.doEvent = function(el) {
    cEvent = el.getAttribute('e-event');
    if (!$is(cEvent) || cEvent == '') {
        return true;
    }
    var arr = cEvent.split('|');
    var eventFunc = ewoo.event[arr[0]];
    if (!$is(eventFunc)) {
        alert('e-event="' + cEvent + '" 组件未定义" ');
        return false;
    }
    var paraArr = [];
    if (arr.length > 1) {
        paraArr = arr[1].split(',');
    }
    return eventFunc.apply(this, paraArr);
}
ewoo.event = {};
ewoo.event.extwindow = function(url, name, opt) {
    return window.open(url, name, opt);
}
//
ewoo.event.show = function(id) {
    tm.ui.show(id);
}


//上传文件
ewoo.event.upload = function(postUrl, fileType, callfunc) {

    fileType = $is(fileType) && fileType != '' ? fileType : 'gif,jpg,jpeg,pen,mp3,mp4,doc,docx,xls,xlsx,ppt,pptx,zip,txt';
    callfunc = $is(callfunc) ? eval(callfunc) : function(ret) {
        //console.log(ret);
    };


    //没有对象需要创建
    if ($('#fileMd5Form').length == 0) {
        //var fileObj = $('<form style="position: absolute; width: 800px; height: 100px; border: 5px solid #f00; left: 40px; top: 260px;" id=fileMd5Form enctype="multipart/form-data"><input type="file" name="fileMd5" id="fileMd5"  multiple  style="width:450px;display:block;" /><input type=submit value="提交" /></form>');

        var fileObj = $('<form  id=fileMd5Form enctype="multipart/form-data"><input type="file" name="fileMd5" id="fileMd5"  multiple  style="display:none;" /></form>');

        $(document.body).append(fileObj);

        $('#fileMd5').bind('change', function() {
            //1.验证文件格式
            var name = $(this).val();
            if (name == '')
                return false;
            var listname = name.split(".");
            var ext = listname[listname.length - 1];
            fileType = fileType.toLowerCase();
            ext = ext.toLowerCase();

            if (fileType.indexOf(ext) < 0) {
                alert("文件格式[" + ext + "]不符，只能传【 " + fileType + " 】格式的文件！");
                $(this).val('');
                return false;
            }
            //2.ajax提交数据
            //SysFileAccount/update?busGuid=
            ajaxPost2Iframe(postUrl, $('#fileMd5Form'), function(json) {
                callfunc(json);
            });
        });
    }
    $('#fileMd5').click();

}

ewoo.event.fullObj = function(objid) {
    console.log(objid);
    //alert($(toBox).height());
    $(objid).attr('_old_width', $(objid).width());
    $(objid).attr('_old_height', $(objid).height());
    //alert($(toBox).height());
    $(objid).css({"position": "absolute", "top": "50px", "left": "50px", "filter": "Alpha(opacity=90)"})
            .height($(window).height() - 100)
            .width($(window).width() - 100).show()
            .bind('dblclick', function() {
                //alert($(this).attr('_old_height'));
                var h = $(this).attr('_old_height');
                var w = $(this).attr('_old_width');
                $(this).width(w).height(h).css({"position": "relative", "top": "0px", "left": "0px"}).hide();
                //alert($(toBox).height());
            });

}


$(function() {
    //类似live方式
    $(document.body).bind('click', function(evt) {
        var src = evt.srcElement ? evt.srcElement : evt.target;
       // if (src !== this)
							//点击的是图标 就用父对象
							//alert(src.tagName);
							 if(src.tagName=="I"){
							 	src=$(src).parent()[0];
							 }
							
         //   return;
        //点击的捆绑
        var clickClass = $(this).attr('e-click-class');
        if ($is(clickClass)) {
            $('[e-click-class=' + clickClass + ']').removeClass(clickClass);
            $(src).addClass(clickClass);
        }

        //如果父对象有e-group属性 就做选定处理
        var topObj = $(src).parents('[e-group]');
        //alert(selClass);
        if (topObj.length == 1) {
            var selClass = $(topObj).attr('e-group');
            topObj.children().removeClass(selClass);
            var tempTop = $(src);
            while (tempTop.length > 0) {

                if (tempTop.parent()[0] == topObj[0]) {
                    tempTop.addClass(selClass);
                    break;
                }
                tempTop = tempTop.parent();
            }
        }
        //div span li 等元素，都可以设置value属性和e-bind属性
        //点击之后都会对vm值做修改
        //如果是按钮组，只需要在父对象上设置e-bind
       // if (src !== this){
									var tagName = src.tagName;
									var value = $(src).attr('value');
									var pvalue= $(src).parents('[value]').attr('value');
									if (((tagName === 'DIV' || tagName === 'SPAN' || tagName === 'I') && (value !== undefined || pvalue!=undefined)) ||
																	(tagName == 'LI' && value !== 0)
																	) {
													ewoo.bindDivClick(src);
									}
								//}

        //对_pop类别的对象进行影藏
        var _pop = null;
        if ($(src).hasClass('_pop')) {
            //  alert('me');
            // _pop = src;
            $(src).attr('_popclose', 0);

        } else if ($(src).parent('._pop').length > 0) {
            // alert('parent');
            //_pop = $(src).parent('._pop')[0];
            $(src).attr('_popclose', 0);
        } else {
            //  alert('null');
            $('[_popclose=1]').hide();
        }
        //刚弹出来的窗口 不能关闭，只关闭属性_popclose=1的
        //if (_pop == null) {
        //  alert('hide');
        //  $('[_popclose=1]').attr('_popclose', 0).hide();
        //$(_pop).attr('_popclose',1);


        //} else {
        //     $(_pop).attr('_popclose', 1);
        // }


        ewoo.doEvent(src);

    });
});


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


ewoo.extend.upload = function (el, postUrl, fileType, callfunc) {

    fileType = $is(fileType) && fileType != '' ? fileType : 'png,gif,jpg,jpeg,pen,mp3,mp4,doc,docx,xls,xlsx,ppt,pptx,zip,txt';
    var callfunc = $is(callfunc) ? eval(callfunc) : function (ret) {
    };

    //1.动态生成一个文件域，绝对定位覆盖到原来的图片或按钮
    var iframeId = 'unique' + (new Date().getTime());
    var html = $('<form method=post    enctype="multipart/form-data">\
																									<input type="file" name="fileMd5" id="fileMd5' + iframeId + '"  class=  multiple  style="display:block; position: absolute; font-size: 20px;opacity: 0;filter:alpha(opacity=0);\
																																	width: ' + $(el).width() + 'px;\
																																	height: ' + $(el).height() + 'px;\
																																	top:' + $(el).offset().top + 'px;\
																																	left:' + $(el).offset().left + 'px;" />\
																									</form>');
    $(el).after(html);

    //2.捆绑文件选择之后，直接上传事件
    $('#fileMd5' + iframeId).bind('change', function () {
        //1.验证文件格式
        var name = $(this).val();
        if (name == '')
            return false;
        var listname = name.split(".");
        var ext = listname[listname.length - 1];
        fileType = fileType.toLowerCase();
        ext = ext.toLowerCase();

        if (fileType.indexOf(ext) < 0) {
            alert("文件格式[" + ext + "]不符，只能传【 " + fileType + " 】格式的文件！");
            $(this).val('');
            return false;
        }
        //2.ajax提交数据
        ajaxPost2Iframe(postUrl, $(this).parent('form'), function (json) {
            callfunc(json);
        });
    });


}

/*!
*******************************************************************************
 [ewoo.http] [http参数和cookie功能]  
*******************************************************************************
  */
///////获取get，cookic等参数
var ewoo = ewoo || {};
ewoo.http = {};
ewoo.http.para = {};
ewoo.http.get = function(key, def) {
    def = ($is(def)) ? def : '';
    //
    var url = window.document.location.href.toString();
    var u = url.split("?");
    if (typeof (u[1]) == "string") {
        u = u[1].split("&");
        for (var i in u) {
            var j = u[i].split("=");
            ewoo.http.para[j[0]] = decodeURIComponent(j[1]);
        }
    }
    ///
    return $is(ewoo.http.para[key]) ? ewoo.http.para[key] : def;

}


//cookice操作处理
// ewoo.cookice = function(name, value, opt) {
//     var name = escape(name);
//     if (value === undefined) {
//         var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
//         return  (arr = document.cookie.match(reg)) ? unescape(arr[2]) : null;
//     } else {
//         if (time === undefined)
//             time = 24 * 3600;
//         var exp = new Date();
//         exp.setTime(exp.getTime() + time * 1000);
//         document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
//     }
// };
// if(typeof $.cookie != 'function'){
//     ewoo.loadJs('/common/jquery.cookie.js');
// }
ewoo.cookice = function(name, value, opt) {
    var name = escape(name);
    if (value === undefined) {
        return $.cookie(name);
    } else {
        $.cookie(name, value, opt)
    }
};
ewoo.login = {};
ewoo.login.sesskey = function(val) {
    return  ewoo.cookice('tjid_user_sesskey', val, {expires: 7});
}

/*
 * ewoo.map.show(x,y,level,opt)展示一个地图，传一个经纬度数据，并设定其中心位置；
 * ewoo.map.show(str,level,opt) 展示一个地图，传一个地址名称，并设定其中心位置
 * ewoo.map.getXY(addr,function(x,y){  });传一个地址名称，返回值经纬度;
 * ewoo.map.getAddr(x,y,function(addr){  });传一个经纬度，返回值地址名称;
 * ewoo.map.markXY(x,y,function(){}) 标识一个点或者批量的点；
 * 地图上点击一个点，返回经纬度及地址名称；
 * 标注两个地址的线路；
 * 标注运动轨迹；
 */




    /*
     * 默认参数设置
     */
    /*
     * 展示一个地图，传一个经纬度数据，并设定其中心位置；
     * @para x 纬度
     * @para y 经度
     * @para zoom  缩放级别
     */
    var ewoo = ewoo || {};
    ewoo.map={};
    ewoo.mapObj=null;
    ewoo.showMap=function(top,left,width,height){
        console.log($("#ewoo_map").length)
        if(!$("#ewoo_map").length){
            $('body').append("<div id='ewoo_map_wrap' style='postion:absolute;display:none;'><button type='button' value='关闭' onclick='ewoo.map.close();' style='float:right;'>关闭</button><div id='ewoo_map'></div></div>");
        }
        console.log($("#ewoo_map").length)
        $("#ewoo_map_wrap").css("top",top);
        $("#ewoo_map_wrap").css("left",left);
        $("#ewoo_map_wrap").css("width",width);
        $("#ewoo_map_wrap").css("height",height);
        $("#ewoo_map").css("width",width);
        $("#ewoo_map").css("height",height);
        $("#ewoo_map_wrap").show();
    }
    ewoo.mapInit=function(){
        ewoo.showMap('100px',"0",'100%','500px');
        if(ewoo.mapObj==null)
            ewoo.mapObj=new BMap.Map("ewoo_map");
    }
    
    ewoo.map.close=function(){
        $("#ewoo_map_wrap").hide();
    }

    ewoo.map.show = function (x, y, zoom) {
        ewoo.mapInit();
        console.log(ewoo.mapObj);
        ewoo.mapObj.centerAndZoom(new BMap.Point(116.331398,39.897445),11);
        console.log(ewoo.mapObj);
        ewoo.mapObj.enableScrollWheelZoom(true);
        ewoo.mapObj.clearOverlays();
        if (parseInt(x) === 0) {
            return;
        }
        console.log(x);
        console.log(y);
        var new_point = new BMap.Point(x, y);
        var marker = new BMap.Marker(new_point);  // 创建标注
        ewoo.mapObj.addOverlay(marker);              // 将标注添加到地图中
        ewoo.mapObj.panTo(new_point);
    };
    
    
  

//最终需要处理的文件，注意相关顺序，本文件在生成ewoo.js的时候 在最后引入
var yEditors = {};
$(function() {
	
    // e-editor="1"
    $(function(){
							ewoo.popWin.init(window);
                            $('[e-coder]').each(function(index, el) {
            if (index == 0) {
                ewoo.loadCss('/common/coder.css');
                ewoo.loadJs('/common/coder.js');
            }
             var editor = CodeMirror.fromTextArea(el, {
                lineNumbers: true,
                viewportMargin: Infinity,
                smartIndent: true, // 是否智能缩进
                tabSize: 4, // Tab缩进，默认4
                readOnly: false, // 是否只读，默认false
                showCursorWhenSelecting: true,
                matchBrackets: true,
                mode: "application/x-httpd-php",
                indentUnit: 4,
                indentWithTabs: true
            });
        });
							
        $('[e-editor]').each(function(index, el) {
            if (index == 0) {
                ewoo.loadCss('/common/kindeditor/themes/default/default.css');
                ewoo.loadJs('/common/kindeditor/kindeditor-all-min.js');
                ewoo.loadJs('/common/kindeditor/Kindeditor-config.js');
                ewoo.loadJs('/common/kindeditor/lang/zh_CN.js');
            }
            var idx = parseInt($(el).attr('e-editor'));
            if (isNaN(idx) || idx < 0)
                idx = 1;
            if (idx >= 4)
                idx = 4;
            var id = $(el).attr('e-bind');
            $(el).attr('id', id);
            yEditors[id] = KindEditor.create('#' + id, KindeditorConfig[idx]);
            yEditors[id].html(vm[id]);

            if (index == 0) {
                //启动一个定时器  将编辑框的值绑定到vm的变量上
                setInterval(function() {
                    $('[e-editor]').each(function(idx2, el2) {
                        var id = $(el2).attr('e-bind');
                        var newVal = $(el2).val();
                        if (newVal != vm[id]) {
                            vm[id] = newVal;
                        }
                    });
                }, 1000);
            }


        });
        //树控件的处理
        $('[e-treeview]').each(function(index, el) {
            $(el).treeview({
                control: "#treecontrol",
                persist: "cookie",
                cookieId: "treeview-black"
            });
        });



        //页面加载完成之后， 绑定mvvm的操作///////////////////////////
        if ("undefined" != typeof vm) {
            //分解get参数
            var url = window.document.location.href.toString();
            var u = url.split("?");
            if (typeof(u[1]) == "string") {
                u = u[1].split("&");
                for (var i in u) {
                    var j = u[i].split("=");
                    vm[j[0]] = decodeURIComponent(j[1]);
                }
            }
            //处理vm渲染
            ewoo.exec(vm);

        }
    });
    
});

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

// JavaScript Document

$(function(){ $(function(){

$('.form select').each(function(index, el) {
				if($(this).attr('size')>1){
					return true;
				}
				var txt=$(el).find("option:selected").text();
				var wid=$(el).outerWidth();
			 if(wid<30){
					  var maxlen=0;
						$.each(el.options,function(idx,opt){
							 if(opt.text.length>maxlen) maxlen=opt.text.length;
						});
					 wid=maxlen*14+10;
				}
				var div=$("<span class='selectBox' style='width:"+wid+"px;'><span class='txt'>"+txt+"</span><span class='flag'>▼</span></span>");
				$(el).before(div);
				$(el).hide();
				$(el).css('position','absolute');
				
				//select 点击选择值，然后影藏自己
				$(el).bind('click blur change',function(){
							$(this).hide();
							var txt=$(this).find("option:selected").text();
							$(this).prev().children('.txt').html(txt);
							$(this).prev().removeClass('_click');
				});
				//div点击显示或隐藏列表
				$(div).bind('click',function(){
										$(this).addClass('_click');
									var sel=$(this).next();
									if($(sel).is(':hidden')){
										var len=$(sel).children('option').length;
										if(len>10) len=10;
										$(sel).attr('size',len);
										$(sel).css({'width': $(this).outerWidth()});
										$(sel).css({'top': $(this).offset().top + $(this).outerHeight()});
										$(sel).css({'left': $(this).offset().left});
										$(sel).show();
									 $(sel)[0].focus();
									}else{
										$(sel).hide();
									}
				});

  });

});
});

/*!
 *******************************************************************************
 [ewoo.view] [对界面的操作，弹出层处理]  
 *******************************************************************************
 */
/////////////////////////////////////////////视图相关的接口函数/////////////////////////////////////////////////////////////////////////////
var ewoo = ewoo || {};
ewoo.popWin = {};
ewoo.layeropen = function(title, url, width, height, callfunc) {
    if (title == null || title == '') {
        title = false;
    }
    ;
    if (url == null || url == '') {
        url = "404.html";
    }
    ;
    if (width == null || width == '') {
        width = 800;
    }
    ;
    if (height == null || height == '') {
        height = ($(window).height() - 50);
    }
    ;
    return layer.open({
        type: 2,
        area: [width + 'px', height + 'px'],
        fix: false, //不固定
        maxmin: true,
        shade: 0.4,
        title: title,
        content: url,
        end: callfunc
    });
}
ewoo.layerclose = function() {
    var index = parent.layer.getFrameIndex(window.name);
    //parent.$('.btn-refresh').click();
    parent.layer.close(index);
}
ewoo.popWin.callfunc = function() {
    //alert(2);
};
ewoo.popWin.times = 0;

//初始化
ewoo.popWin.init = function(win) {
    return false;
    if (ewoo.popWin.times == 0) {
        win.$(win.document.body).append("<style>\n\
button::-moz-focus-inner{ border:0; padding:0; margin:0; }\n\
#easyDialogBox .easyDialog_wrapper{display:inline-block !important; color:#444; border:3px solid rgba(0,0,0,0); -webkit-border-radius:5px; -moz-border-radius:5px; border-radius:5px; -webkit-box-shadow:0 0 10px rgba(0,0,0,0.4); -moz-box-shadow:0 0 10px rgba(0,0,0,0.4); box-shadow:0 0 10px rgba(0,0,0,0.4); display:none; font-family:\"Microsoft yahei\", Arial; }\n\
.easyDialog_wrapper .easyDialog_content{ -webkit-border-radius:4px; -moz-border-radius:4px; border-radius:4px; background:#fff; border:1px solid #e5e5e5; }\n\
.easyDialog_wrapper .easyDialog_title{margin: 0px; height:30px; line-height:30px; overflow:hidden; color:#666; padding-left:10px;  font-size:14px; border-bottom:1px solid #e5e5e5; background:#f7f7f7; border-radius:4px 4px 0 0; }\
.easyDialog_wrapper .close_btn{text-align:center;width:20px; font-family:arial; font-size:18px; _font-size:12px; font-weight:700; color:#999; text-decoration:none; float:right; }\n\
.easyDialog_wrapper .close_btn:hover{ color:#fff; background-color:#D44027; }\n\
.easyDialog_wrapper .easyDialog_text{padding:0px; font-size:13px; line-height:22px; }\n\
.easyDialog_wrapper .easyDialog_footer{ padding:0px; *zoom:1; }\n\
.easyDialog_wrapper .easyDialog_footer:after{ content:''; display:block; height:0; overflow:hidden; visibility:hidden; clear:both; }\n\
.easyDialog_wrapper .btn_highlight,.easyDialog_wrapper .btn_normal{ border:1px solid; border-radius:2px; cursor:pointer; font-family:\"Microsoft yahei\", Arial; float:right; font-size:12px; padding:0 12px; height:24px; line-height:24px; margin-bottom:10px; }\n\
.easyDialog_wrapper .btn_highlight{ background:#4787ed; background:-webkit-gradient(linear,center bottom,center top,from(#4787ed),to(#4d90fe)); background:-moz-linear-gradient(90deg, #4787ed, #4d90fe); border-color:#3079ed; color:#fff; }.easyDialog_wrapper .btn_normal{ margin-left:10px; border-color:#c3c3c3; background:#ececec; color:#333; background:-webkit-gradient(linear,center bottom,center top,from(#ececec),to(#f4f4f4)); background:-moz-linear-gradient(90deg,#ececec,#f4f4f4); }\n\
</style>");
    }
    ewoo.popWin.times++;
}


//
ewoo.popWin.open = function(title, url, width, height, callfunc) {
    //判断是否可以跨域访问
    var topWindow = $is(window.top.$) ? window.top : window;
    ewoo.popWin.init(topWindow);
    topWindow.$(topWindow.document.body).append("<style>\n			#easyDialogBox .easyDialog_wrapper{*width:" + width + "px;}");
    //兼容以前的情况，没有传递标题的
    topWindow.easyDialog.open({
        container: {
            header: title,
            content: '<iframe src="' + url + '"  width="' + width + '"  frameborder="0" height="' + height + '"  style="width:' + width + 'px;height:' + height + 'px;"></iframe>'
        },
        callback: callfunc
                //autoClose : 2000
    });
    return;

}
ewoo.popWin.close = function(iscall) {
    var topWindow = $is(window.top.$) ? window.top : window;
    topWindow.easyDialog.close();
};

//
ewoo.tips = {};
ewoo.tips.open = function(msg, time) {
    //var topWindow = $is(window.top.$) ? window.top : window;

    //ewoo.popWin.init(topWindow);
    if (time === undefined || time <= 1000)
        time = 3000;
    window.easyDialog.open({
        container: {
            content: '<div style="padding:10px; font-size:14px;">' + msg + '</div>'
        },
        overlay: false,
        drag: false,
        autoClose: time
    });

    /*
     //如果没有对象创建一个
     if (topWindow.$("#tipsWin").length == 0) {
     topWindow.$(topWindow.document.body).append('<div id="tipsWin" class="tipsWin"><span style="float:left; text-align:center; padding-left:5px; font-size:14px; "> </span><a style="float:right; margin-right:10px;" href="javascript:ewoo.tips.close()">[ X ]</a></div>');
     }
     topWindow.$("#tipsWin span").html("<span style='color:red'>" + msg + "</span>");
     topWindow.$("#tipsWin").width($(topWindow).width()).height(50);
     topWindow.$("#tipsWin").css('left', 0).css('top', 0).slideDown();
     if (!$is(time))
     time = 6000;
     setTimeout(function() {
     ewoo.tips.close();
     }, time);
     */
}
ewoo.tips.close = function() {
    var topWindow = $is(window.top.$) ? window.top : window;
    topWindow.$("#tipsWin").slideUp();
}
ewoo.easyDialog = {};
ewoo.easyDialog.open = function(opt) {
    ewoo.popWin.init(window);
    easyDialog.open(opt);
}


/*
 window.alert=function(msg){
 ewoo.tips.open(msg);
 }
 */

/*!
*******************************************************************************
 [ewoo.widget] [自定义组件]  
*******************************************************************************
  */
/////////////////////////////////对组件e-widgetd的处理///////////////////////////////////////////////////////////////
//根据组件类型及绑定参数，生成html的模版
// ewoo.widget = function(para) {
//     var arr = para.split(',');
//     var type = arr[0];
//     var storeName = arr[1];
//     var html = '';
//     switch (type) {
//         case 'grid':
//             html = ' <table border=1>\n\
// <tr e-each="@store.header" align="center\n\
// <td>{el.key}</td>        \n\
// </tr>\n\
//      <tr e-each="@store.items" align="center">';
//             html += ' <td>{el.index+1}</td>';
//             html += ' <td>{el.code}</td>';
//             html += ' <td>{el.name}</td>';
//             html += ' <td>{el.createTime}</td>';
//             html += ' <td>{el.updateTime}</td>';
//             html += ' <td>{el.memo}</td>';
//             html += ' <td></td>';
//             html += ' </tr></table>';

//             break;
//         default:
//             html = '无效的html';
//     }
//     html = html.replace(/@store/g, storeName);
//     return html;
// }
///////////////老式的组件/////////////////



