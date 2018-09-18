// var ctx = "ycyaUI";
var ctx = "../../../res/img/monitor";

var YcyaMapCfg = { 	
	_mapType:'baidu',//地图类型，'gaode'
	_autoZoom:false,//是否自动缩放，默认为false，不自动缩放
    _autoScroll:true,
	_baiduCfg:{
		_url:"http://api.map.baidu.com/getscript?v=2.0&ak=D8hZnXeO6NRjj0zQk9G905PmWVgiWuCf&services=&t=20170517145936",
		//_urlLib:["/CarMonWeb/WebContent/"+ctx+"/map/js/TextIconOverlay.js","/CarMonWeb/WebContent/"+ctx+"/map/js/MarkerClusterer.js",
		_urlLib:["TextIconOverlay.js","MarkerClusterer.js",
            "http://api.map.baidu.com/library/DrawingManager/1.4/src/DrawingManager_min.js",
			"http://api.map.baidu.com/library/DrawingManager/1.4/src/DrawingManager_min.css",
			"minfo.js","info.css","distanceTool.js"],
		_lng:104.078659,
		_lat:30.652591
	},
	_measure:$('#measure'),
	_gaodeCfg:{
		
	},
	icons:{
		'car_blue':{"url":ctx+"/car_blue.png",size:[24,24]},
		'car_green':{"url":ctx+"/car_green.png",size:[24,24]},
		'car_red':{"url":ctx+"/car_red.png",size:[24,24]},
		'car_gray':{"url":ctx+"/car_gray.png",size:[24,24]},
		'che':{"url":ctx+"/default_car.png",size:[48,32]},
		'start':{"url":ctx+"/start_point.png",size:[24,32]},
		'end':{"url":ctx+"/end_point.png",size:[24,32]},
		'stop':{"url":ctx+"/stop_point.png",size:[24,32]},
		'speed':{"url":ctx+"/speed_point.png",size:[24,32]},
		'test1':{"url":ctx+"/test.png",size:[26,26],'offset':[0,0]},
		'test2':{"url":ctx+"/test.png",size:[26,26],'offset':[-31,0]}
	},
	lines:{
		"line1":{"color":"#ff6600","width":8,"opacity":0.8,"style":"solid"/*实线，或虚线dashed*/},
		"line2":{"color":"#ff6600","scolor":"red","width":2,"opacity":0.8,sopacity:08,"style":"solid"/*实线，或虚线dashed*/}
	}
};