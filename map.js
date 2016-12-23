/*
 * ewoo.map.show(x,y,level,opt)展示一个地图，传一个经纬度数据，并设定其中心位置；
 * ewoo.map.showCity(str,level,opt) 展示一个地图，传一个地址名称，并设定其中心位置
 * ewoo.map.getXY(addr,function(x,y){  });传一个地址名称，返回值经纬度;
 * ewoo.map.getAddr(x,y,function(addr){  });传一个经纬度，返回值地址名称;
 * ewoo.map.markXY(x,y,function(){}) 标识一个点或者批量的点；
 * 地图上点击一个点，返回经纬度及地址名称；
 * 标注两个地址的线路；
 * 标注运动轨迹；
 */






$(function () {
    /*
     * 设置默认地图
     */
    var map = new BMap.Map("allmap");    // 创建Map实例
    map.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放
    // 创建地址解析器实例
    var myGeo = new BMap.Geocoder();
    // 将地址解析结果显示在地图上,并调整地图视野
    myGeo.getPoint("长沙县湘龙街道湘绣城FA栋", function (point) {
        if (point) {
            map.centerAndZoom(point, 16);
            map.addOverlay(new BMap.Marker(point));
        } else {
            alert("您选择地址没有解析到结果!");
        }
    }, "长沙");

})


var ewoo = ewoo || {};
ewoo.map = {};
ewoo.mapObj = null;

ewoo.showMap = function (top, left, width, height) {
    console.log($("#ewoo_map").length)
    if (!$("#ewoo_map").length) {
        $('body').append("<div id='ewoo_map_wrap' style='postion:absolute;display:none;'><button type='button' value='关闭' onclick='ewoo.map.close();' style='float:right;'>关闭</button><div id='ewoo_map'></div></div>");
    }
    console.log($("#ewoo_map").length)
    $("#ewoo_map_wrap").css("top", top);
    $("#ewoo_map_wrap").css("left", left);
    $("#ewoo_map_wrap").css("width", width);
    $("#ewoo_map_wrap").css("height", height);
    $("#ewoo_map").css("width", width);
    $("#ewoo_map").css("height", height);
    $("#ewoo_map_wrap").show();
}

ewoo.mapInit = function () {
    // ewoo.showMap('100px',"0",'100%','500px');
    if (ewoo.mapObj == null)
        ewoo.mapObj = new BMap.Map("allmap");
}

ewoo.map.close = function () {
    $("#ewoo_map_wrap").hide();
}
/*
 * 展示一个地图，传一个经纬度数据，并设定其中心位置；
 * @para x 纬度
 * @para y 经度
 * @para zoom  缩放级别
 */
ewoo.map.show = function (x, y) {
    ewoo.mapInit();
    console.log(ewoo.mapObj);
    ewoo.mapObj.centerAndZoom(new BMap.Point(116.331398, 39.897445), 11);
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

/*
 * meno: 展示一个地图，传一个地址名称，并设定其中心位置
 * para str 传入的地址
 * 时间：2016-12-22
 * dick
 */
ewoo.map.showCity = function (str) {
    ewoo.mapInit();
    if (str !== "") {
        ewoo.mapObj.centerAndZoom(str, 11);      // 用城市名设置地图中心点
    }
};
/*
 *百度地图API 传一个地址名称，返回值经纬度；
 * @para addr 地址
 * return x , y;
 */
/*
ewoo.map.getXY(addr, function (x, y) { 
    var myGeo = new BMap.Geocoder();
    myGeo.getPoint(addr, function (point) {
        if (point) {
            alert(point.lng, point.lat);
            return point.lng, point.lat;
        } else {
            alert("您选择地址没有解析到结果!");
        }
    });
})
*/