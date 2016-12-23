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