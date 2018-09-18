//定义地图必须实现的方法,addPoint描点
var IYcyaMap = new Interface('IYcyaMap', ['addPoint', 'getZoom', 'setZoom', 'trace', 'route', 'openWin', 'center', 'clear',
	'clearById', 'draw', 'createPoint', 'createOverlay', 'openZoomendEvent', 'openMoveendEvent', 'addRoutePoint',
	'getBoundary', 'setViewport', 'getMapZoom', 'setMapZoom', 'getBounds', 'setCity','openSearchWin','getLocation','setMapStyle',
	'zoomIn','zoomOut'
]);

(function (ycya) {
	var YcyaMap = function (mapId) {
		this.implementsInterfaces = ['IYcyaMap'];
		this._YcyaMapData = {
			"support": ["baidu"],
			"loaded": "0",
			"markered": "0",
			"markers": {},
			"bTrace": "0"
		};
		this._flow = new Jas();
		this._jsLoader = new YcyaLoader();
		this._MapClient = null;
		this._cfg = null;
		this.mapType = '';

		var currObj = this;
		this._jsLoader.loadFile(getJsPath('YcyaMap.js') + 'YcyaMapCfg.js', function () {
			currObj._cfg = YcyaMapCfg;
			currObj.mapType = currObj._cfg['_mapType'];
			if (!currObj.mapType || currObj._YcyaMapData['support'].indexOf(currObj.mapType) == -1) {
				throw new Error('地图类型不正确');
			}
			currObj._flow.trigger('cfgLoaded');
		});

		this._flow.waitFor(['cfgLoaded'], function () {
			if (currObj.mapType == 'baidu') {
				currObj._loadJs(currObj._cfg);
				currObj._flow.waitFor(['loaded'], function () {
					currObj._loadJsLib(currObj._cfg);
				});

				var libUrls = currObj._cfg['_baiduCfg']['_urlLib'];
				var libUrlEvtNames = [];
				for (var i = 0; i < libUrls.length; i++) {
					libUrlEvtNames.push('libLoaded' + i);
				}
				currObj._flow.waitFor(libUrlEvtNames, function () {
					currObj._MapClient = new _BaiduMap(mapId, currObj._cfg, currObj._YcyaMapData);
					currObj._YcyaMapData['loaded'] = 1;
					currObj._flow.trigger('mapReady');
				});
			}
		});
	};
	YcyaMap.prototype = {
		center: function (id, zoom) {
			var marker = this.getMarker(id);
			this._MapClient.center(marker.getPosition(), zoom);
		},
		toSetCenter: function (point) {
			return this._MapClient.toSetCenter(point);
		},
		/**
		 * 添加点
		 * @param data 支持四种数据结构：
		 * (1)多点数据：type=1，数据格式:{type:1,data:[{"lng":130,"lat":30,"id":"川A12345"}],"icon":'key',"evt":doit},
		 * 使用同一个图标，图标值可选;使用统一的事件处理,如没有回调函数,可以省略evt
		 * (2)多点数据：type=2，数据格式:{type:2,data:[{"lng":130,"lat":30,"icon":'key',"id":"川A12345","evt":doit},{}]},
		 * 每个点单独使用图标，图标值可选;使用不同的事件处理,如没有回调函数,可以省略evt
		 * (3)多点数据：type=3，数据格式:{type:3,data:["川A12345",130,30,'icon1',"川A12346",131,31,'icon1',...],"evt":doit},
		 * 每个点单独使用图标，图标值可选；使用极简数据结构,数组以4个为一组，分别表示id、经度、纬度、图标,如果使用默认图标，则图标值指定空字符串("");
		 * 使用统一的回调函数,如没有回调函数,可以省略evt
		 * (4)多点数据：type=4，数据格式:{type:4,data:["川A12345",130,30,'icon1',doit,"川A12346",131,31,'icon1',doit,...]},
		 * 每个点单独使用图标，图标值可选；使用极简数据结构,数组以5个为一组，分别表示id、经度、纬度、图标、回调函数,
		 * 如果使用默认图标，则图标值指定空字符串("")
		 * @param cfg
		 * @returns {YcyaMap}
		 */
		addPoint: function (data, cfg) {
			this._MapClient.addPoint(data, this._cfg, this);
			if (this._YcyaMapData['markered'] == '0') { //仅在第一次描点的时候自动缩放
				this.setZoom();
				this._YcyaMapData['markered'] = '1';
			}
			return this;
		},
		/**
		 * 追踪
		 * @param data,数据格式： {type:1,data:[130,30,130,30,...],"id":"川A12345","icon":'key',"line":"line1","evt":doit}
		 * 数组以2个为一组，分别表示经度、纬度
		 * @param cfg
		 * @returns {YcyaMap}
		 */
		trace: function (data, cfg) {
			this._MapClient.trace(data, this._cfg, this);
			this.setZoom();
			return this;
		},
		/**
		 * 轨迹
		 * @param data,支持数据结构:
		 * {type:1,data:[130,30,130,30,...],"id":"川A12345","icon":'key',"start":,"startIcon","end":,"startIcon","line":"line1","evt":doit}
		 * 其中:start和end表示开始点和结束点的图标，必须；
		 * id表示数据的id，必须；icon表示其他点的图标，可选；evt表示时间处理函数，可选；
		 * 数组以2个为一组，分别表示经度、纬度
		 * @param cfg
		 * @returns {YcyaMap}
		 */
		route: function (data, cfg) {
			this._MapClient.route(data, this._cfg, this);
			this.setZoom();
			return this;
		},
		openZoomendEvent: function () {
			this._MapClient.openZoomendEvent(this);
		},
		openMoveendEvent: function () {
			this._MapClient.openMoveendEvent(this);
		},
		/**
		 * 添加轨迹点 需要打开 openZoomendEvent openMoveendEvent事件
		 * 调用参数跟addPoint一样
		 */
		addRoutePoint: function (data, cfg) {
			this._MapClient.addRoutePoint(data, this._cfg, this);
		},
		openSearchWin:function(content,para,pointId){
			var marker = this.getMarker(pointId);
			this._YcyaMapData['searchWin'] = {};
			if(null!=marker){
				this._MapClient.openSearchWin(content,para,marker,this._YcyaMapData['searchWin']);
			}
		},
		openWin: function (content, source, title) {
			this._YcyaMapData['win'] = {};
			this._MapClient.openWin(content, source, this._YcyaMapData['win'], title);
		},
		openWinById: function (content, id, title) {
			this.openWin(content, this.getMarker(id), title);
		},
		getZoom: function (maxLng, minLng, maxLat, minLat) {
			return this._MapClient.getZoom(maxLng, minLng, maxLat, minLat);
		},
		setZoom: function () {
			var maxLng = this._YcyaMapData['maxLng'],
				minLng = this._YcyaMapData['minLng'],
				maxLat = this._YcyaMapData['maxLat'],
				minLat = this._YcyaMapData['minLat']

			var zoom = this.getZoom(maxLng, minLng, maxLat, minLat);
			var cenLng = (parseFloat(maxLng) + parseFloat(minLng)) / 2;
			var cenLat = (parseFloat(maxLat) + parseFloat(minLat)) / 2;
			this._MapClient.setZoom(cenLng, cenLat, zoom);
		},
		getData: function () {
			return this._YcyaMapData;
		},
		getMarker: function (id) {
			return this.getData()['markers'][id];
		},
		setMarker: function (id, marker) {
			return this.getData()['markers'][id] = marker;
		},
		clear: function () {
			return this._MapClient.clear(this);
		},
		clearById: function (id) {
			var marker = this.getData()['markers'][id];
			var winO = this._YcyaMapData['win'] == null ? null : this._YcyaMapData['win'][id];
			return this._MapClient.clearById(marker, winO, this);
		},
		clearSearchById: function (id) {
			var marker = this.getData()['markers'][id];
			var searchWinO = this._YcyaMapData['searchWin'] == null ? null : this._YcyaMapData['searchWin'][id];
			return this._MapClient.clearSearchById(marker, searchWinO, this);
		},
		getCfg: function () {
			return this._Cfg;
		},
		ready: function (fn) {
			this._flow.waitFor(['mapReady'], fn);
		},
		_loadJs: function (cfg) {
			var jsLoader = this._jsLoader;
			if (cfg['_mapType'] == 'baidu') {
				var flow = this._flow;
				window.BMap_loadScriptTime = (new Date).getTime();
				jsLoader.loadFile(cfg['_baiduCfg']['_url'], function () {
					flow.trigger('loaded');
				});
			}
			return this;
		},
		_loadJsLib: function (cfg) {
			var jsLoader = this._jsLoader;
			if (cfg['_mapType'] == 'baidu') {
				var flow = this._flow;
				var libUrls = cfg['_baiduCfg']['_urlLib'];
				var jsPath = getJsPath('YcyaMap.js');
				libUrls.forEach(function (libUrlItem, idx) {
					var realUrl = libUrlItem.indexOf('http')==0?libUrlItem:jsPath+libUrlItem;
					jsLoader.loadFile(realUrl, function () {
						flow.trigger('libLoaded' + idx);
					});
				});
			}
			return this;
		},
		_loadCfg: function () {
			var jsLoader = this._jsLoader;
			jsLoader.loadFile('./YcyaMapCfg.js', function () {
				flow.trigger('loaded');
			});
			return this;
		},
		draw: function (data, callback) {
			return this._MapClient.draw(data, this._cfg, callback);
		},
		createPoint: function (lng, lat) {
			return this._MapClient.createPoint(lng, lat);
		},
		createOverlay:function(pointArr,style,id){
			this._MapClient.createOverlay(pointArr,style,this._cfg,this,id);
		},
		getBoundary: function (name, callback) {
			this._MapClient.getBoundary(name, callback);
		},
		setViewport: function (pointArr) {
			this._MapClient.setViewport(pointArr);
		},
		getMapZoom: function () {
			return this._MapClient.getMapZoom();
		},
		setMapZoom: function (zoom) {
			return this._MapClient.setMapZoom(zoom);
		},
		getBounds: function () {
			return this._MapClient.getBounds();
		},
		setCity: function (city) {
			this._MapClient.setCity(city);
		},
		localSearch: function (callBack, mapObj) {
			return this._MapClient.localSearch(callBack, mapObj);
		},
		createAutoComplete: function (inputId, resultId, callBack) {
			return this._MapClient.createAutoComplete(inputId, resultId, callBack);
		},
		getLngAndLat: function (inputId, resultId) {
			return this._MapClient.getLngAndLat(inputId, resultId);
		},
		getLocation:function(point,callback,dom){
			return this._MapClient.getLocation(point, callback,dom);
		},
		setMapStyle:function(style){
			return this._MapClient.setMapStyle(style);
		},
		zoomIn:function(){
			return this._MapClient.zoomIn();
		},
		zoomOut:function(){
			return this._MapClient.zoomOut();
		}
	};
	ycya.YcyaMap = YcyaMap;
})(window);

(function (ycya) {
	var _BaiduMap = function (mapId, cfg, data) {
		this.implementsInterfaces = ['IYcyaMap'];
		this.map = new BMap.Map(mapId);
		//this.map.addControl(new BMap.ScaleControl());
		//this.map.addControl(new BMap.NavigationControl());
		var point = new BMap.Point(cfg['_baiduCfg']['_lng'], cfg['_baiduCfg']['_lat']);
		this.map.centerAndZoom(point, 14);
		if (cfg['_autoScroll'])
			this.map.enableScrollWheelZoom();
		else
			this.map.disableScrollWheelZoom();

		this.map.addControl(new BMap.MapTypeControl({type: BMAP_MAPTYPE_CONTROL_MAP,anchor:BMAP_ANCHOR_BOTTOM_RIGHT}));
		var myDis = new BMapLib.DistanceTool(this.map);
		cfg['_measure'].on('click',function(){
			myDis.open();  //开启鼠标测距
		});
	};
	_BaiduMap.prototype = {
		center: function (point, zoom) {
			if (zoom == null)
				zoom = this.map.getZoom();
			this.map.centerAndZoom(point, zoom);
		},
		toSetCenter: function (point) {
			return this.map.setCenter(point,18);
		},
		addPoint: function (data, cfg, loader) {
			var mapData = loader.getData();
			var point = null;
			if (data['type'] == 1) {
				var picon = this._getIcon(data['icon'], cfg);
				var markers = [];
				//				,markersOld = [];;
				for (var idx in data['data']) {
					point = new BMap.Point(data['data'][idx]['lng'], data['data'][idx]['lat']);
					this._doMaxMin(mapData, point); //处理坐标最大最小值
					var marker = loader.getMarker(data['data'][idx]['id']);
					if (marker) {
						if (picon != null) {
							marker.setIcon(picon);
						}
						marker.setPosition(point);
					} else {
						marker = null == picon ? new BMap.Marker(point) : new BMap.Marker(point, {
							icon: picon
						});
					}
					marker.__id = data['data'][idx]['id'];
					if (data.evt) {
						marker.addEventListener("click", data['evt']);
					}

					if (data['data'][idx]['direction']) {
						marker.setRotation(parseInt(data['data'][idx]['direction']))
					}

					/* var label = new BMap.Label(data['data'][idx]['id'], {
						offset: new BMap.Size(20, -10)
					});
					marker.setLabel(label); */
					markers.push(marker);
					loader.setMarker(data['data'][idx]['id'], marker)
				}
				var markerClusterer = null;
				if (loader.getData()._cluster) { //已经存在聚合
					markerClusterer = loader.getData()._cluster;
					//					if(markersOld.length>0)markerClusterer.removeMarkers(markersOld);//清除重复的marker
					markerClusterer.addMarkers(markers); //添加新的marker
				} else { //还没有聚合
					markerClusterer = new BMapLib.MarkerClusterer(this.map, {
						markers: markers
					});
					loader.getData()._cluster = markerClusterer;
				}
				//var markerClusterer = new BMapLib.MarkerClusterer(this.map, {markers:markers});
			} else if (data['type'] == 2) {
				for (var idx in data['data']) {
					var dataItem = data['data'][idx];
					var picon = this._getIcon(dataItem['icon'], cfg);
					//					var point = new BMap.Point(dataItem['lng'], dataItem['lat']);
					point = new BMap.Point(dataItem['lng'], dataItem['lat']);
					this._doMaxMin(mapData, point); //处理坐标最大最小值

					var marker = null == picon ? new BMap.Marker(point) : new BMap.Marker(point, {
						icon: picon
					});
					if (dataItem['evt']) {
						marker.addEventListener("click", dataItem['evt']);
					}

					var oldMarker = loader.getMarker(dataItem['id']);
					if (oldMarker) {
						this.map.removeOverlay(oldMarker);
						//oldMarker.dispose(); // 1.1+版本不需要这样调用
					}

					var label = new BMap.Label(data['data'][idx]['id'], {
						offset: new BMap.Size(20, -10)
					});
					marker.setLabel(label);
					this.map.addOverlay(marker);
					loader.setMarker(dataItem['id'], marker)
				}
			} else if (data['type'] == 3) {
				if (data['data'].length % 4 != 0) {
					throw new Error('数据不正确');
				}
				var evt = data['evt'],
					idx = 0;
				while (idx + 4 < data['data'].length) {
					var picon = this._getIcon(data['data'][idx + 3], cfg);
					//					var point = new BMap.Point(data['data'][idx+1], data['data'][idx+2]);
					point = new BMap.Point(data['data'][idx + 1], data['data'][idx + 2]);
					this._doMaxMin(mapData, point); //处理坐标最大最小值

					var marker = null == picon ? new BMap.Marker(point) : new BMap.Marker(point, {
						icon: picon
					});
					if (evt) {
						marker.addEventListener("click", evt);
					}

					var oldMarker = loader.getMarker(data['data'][idx]);
					if (oldMarker) {
						this.map.removeOverlay(oldMarker);
						//oldMarker.dispose(); // 1.1+版本不需要这样调用
					}
					this.map.addOverlay(marker);
					loader.setMarker(dataItem['id'], marker)

					idx += 4;
				}
			} else if (data['type'] == 4) {
				if (data['data'].length % 5 != 0) {
					throw new Error('数据不正确');
				}
				var idx = 0;
				while (idx + 5 < data['data'].length) {
					var picon = this._getIcon(data['data'][idx + 3], cfg);
					//					var point = new BMap.Point(data['data'][idx+1], data['data'][idx+2]);
					point = new BMap.Point(data['data'][idx + 1], data['data'][idx + 2]);
					this._doMaxMin(mapData, point); //处理坐标最大最小值

					var marker = null == picon ? new BMap.Marker(point) : new BMap.Marker(point, {
						icon: picon
					});
					if (data['data'][idx + 4]) {
						marker.addEventListener("click", data['data'][idx + 4]);
					}

					var oldMarker = loader.getMarker(data['data'][idx]);
					if (oldMarker) {
						this.map.removeOverlay(oldMarker);
						//oldMarker.dispose(); // 1.1+版本不需要这样调用
					}
					this.map.addOverlay(marker);
					loader.setMarker(dataItem['id'], marker)

					idx += 5;
				}
			}
			//如果添加的点超出 屏幕 需要对其居中
			//			var bounds=this.map.getBounds();
			//			if(!bounds.containsPoint(point)){
			//				this.map.panTo(point);
			//			}
		},
		trace: function (data, cfg, loader) {
			if (data['data'].length % 2 != 0) {
				throw new Error('数据不正确');
			}

			var picon = this._getIcon(data.icon, cfg);
			var points = [],
				id = data.id,
				mapData = loader.getData(),
				lineCfg = cfg.lines[data.line],
				marker = null,
				currMarker = null;
			var polyline = null;
			if (mapData['traceData']) {
				currMarker = mapData['traceData']['_currPoint'];
				points.push(currMarker.getPosition());
				for (var i = 0; i < data['data'].length; i += 2) {
					var point = new BMap.Point(data['data'][i + 0], data['data'][i + 1]);
					points.push(point);

					marker = null == picon ? new BMap.Marker(point) : new BMap.Marker(point, {
						icon: picon
					});
					if (data.evt) {
						marker.addEventListener("click", data.evt);
					}
					this._doMaxMin(mapData, point);
					this.map.addOverlay(marker);

					mapData['traceData']['_currPoint'] = marker;
				}
				var polyline = null;
				if (lineCfg) {
					polyline = new BMap.Polyline(points, this._getLineCfg(lineCfg));
				} else {
					polyline = new BMap.Polyline(points);
				}
				this.map.addOverlay(polyline);
			} else {
				this.map.clearOverlays();
				for (var i = 0; i < data['data'].length; i += 2) {
					var point = new BMap.Point(data['data'][i + 0], data['data'][i + 1]);
					points.push(point);

					marker = null == picon ? new BMap.Marker(point) : new BMap.Marker(point, {
						icon: picon
					});
					if (data.evt) {
						marker.addEventListener("click", data.evt);
					}
					this._doMaxMin(mapData, point);
					this.map.addOverlay(marker);

					var traceData = {
						'_currPoint': marker
					};
					mapData['traceData'] = traceData;
				}
				if (points.length > 1) {
					var polyline = null;
					if (lineCfg) {
						polyline = new BMap.Polyline(points, this._getLineCfg(lineCfg));
					} else {
						polyline = new BMap.Polyline(points);
					}
					this.map.addOverlay(polyline);
				}
			}
		},
		route: function (data, cfg, loader) {
			this._drawLine(data, cfg, loader)
		},
		addRoutePoint: function (data, cfg, loader) {
			var mapData = loader.getData();
			var point = null;
			if (data['type'] == 1) {
				var picon = this._getIcon(data['icon'], cfg);
				for (var idx in data['data']) {
					point = new BMap.Point(data['data'][idx]['lng'], data['data'][idx]['lat']);
					var marker = loader.getMarker(data['data'][idx]['id']);
					if (marker) {
						if (picon != null) {
							marker.setIcon(picon);
						}
						marker.setPosition(point)
					} else {
						marker = null == picon ? new BMap.Marker(point) : new BMap.Marker(point, {
							icon: picon
						});
					}
					if (data['data'][idx]['direction']) {
						marker.setRotation(parseInt(data['data'][idx]['direction']))
					}
					this.map.addOverlay(marker);
					loader.setMarker(data['data'][idx]['id'], marker);
				}
			}

			//如果添加的点超出 屏幕 需要对其居中
			if (point) {
				var sg = mapData.swLng;
				var ng = mapData.neLng;
				var st = mapData.swLat;
				var nt = mapData.neLat;

				var pg = point.lng;
				var pt = point.lat;
				if (pt < st || pt > nt || pg < sg || pg > ng) {
					this.map.setCenter(point);
				}
			}


			var mapData = loader.getData();
			var point=null;
			if(data['type']==1){
				var picon = this._getIcon(data['icon'],cfg);
				for(var idx in data['data']){
					point = new BMap.Point(data['data'][idx]['lng'], data['data'][idx]['lat']);
					var marker = loader.getMarker(data['data'][idx]['id']);
					if(marker){
						if(picon!=null){
							marker.setIcon(picon);
						}
						marker.setPosition(point)
					}else{
						marker = null==picon?new BMap.Marker(point):new BMap.Marker(point, {icon: picon});
					}
					if(data['data'][idx]['direction']){
						marker.setRotation(parseInt(data['data'][idx]['direction']))
					}
					this.map.addOverlay(marker);
					loader.setMarker(data['data'][idx]['id'],marker);
				}
			}

			//如果添加的点超出 屏幕 需要对其居中
			if(point){
				var sg=mapData.swLng;
				var ng=mapData.neLng;
				var st=mapData.swLat;
				var nt=mapData.neLat;

				var pg=point.lng;
				var pt=point.lat;
				if(pt<st||pt>nt||pg<sg||pg>ng){
					this.map.setCenter(point);
				}
			}
		},
		openSearchWin:function(content,para,markerl,winObj){
			if(!BMapLib)return;
			var win = new BMapLib.SearchInfoWindow(this.map, content,para);
			win.open(markerl.getPosition());
			winObj[markerl.__id] = win;
		},
		openWin: function (content, source, winObj, title) {
			var infoWindow = new BMap.InfoWindow(content, {
				enableCloseOnClick: false
			});
			if (title) {
				infoWindow.setTitle(title);
			}
			this.map.openInfoWindow(infoWindow, source.getPosition());
			winObj[source.__id] = infoWindow;
			//source.openInfoWindow(infoWindow);
		},
		getZoom: function (maxLng, minLng, maxLat, minLat) {
			if (!(maxLng && minLng && maxLat && minLat)) {
				return 12;
			}
			var zoom = ["50", "100", "200", "500", "1000", "2000", "5000", "10000", "20000", "25000", "50000", "100000", "200000", "500000", "1000000", "2000000"] //级别18到3。  
			var pointA = new BMap.Point(maxLng, maxLat); // 创建点坐标A  
			var pointB = new BMap.Point(minLng, minLat); // 创建点坐标B  
			var distance = this.map.getDistance(pointA, pointB).toFixed(1); //获取两点距离,保留小数点后两位  
			for (var i = 0, zoomLen = zoom.length; i < zoomLen; i++) {
				if (zoom[i] - distance > 0) {
					return 18 - i + 3; //之所以会多3，是因为地图范围常常是比例尺距离的10倍以上。所以级别会增加3。  
				}
			};
			return 12;
		},
		setZoom: function (cenLng, cenLat, zoom) {
			return this.map.centerAndZoom(new BMap.Point(cenLng, cenLat), zoom);
		},
		clear: function (loader) {
			this.map.clearOverlays();
			if (loader.getData()._cluster) {
				loader.getData()._cluster.clearMarkers();
			}

		},
		clearById: function (marker, win, loader) {
			if (win != null)
				this.map.closeInfoWindow();
			this.map.removeOverlay(marker);
			if (loader.getData()._cluster) {
				loader.getData()._cluster.removeMarker(marker);
			}
		},
		clearSearchById:function (marker, win, loader) {
			if (win != null)win.close();
			this.map.removeOverlay(marker);
			if (loader.getData()._cluster) {
				loader.getData()._cluster.removeMarker(marker);
			}

		},
		_drawLine: function (data, cfg, loader) {
			if (data['data'].length % 2 != 0) {
				throw new Error('数据不正确');
			}

			var picon = this._getIcon(data.icon, cfg);
			var startIcon = data.start ? this._getIcon(data.start, cfg) : null;
			var endIcon = data.end ? this._getIcon(data.end, cfg) : null;
			var points = [],
				id = data.id,
				mapData = loader.getData(),
				lineCfg = cfg.lines[data.line],
				startMarker = null,
				endMarker = null;
			for (var i = 0; i < data['data'].length; i += 2) {
				var point = new BMap.Point(data['data'][i + 0], data['data'][i + 1]);
				this._doMaxMin(mapData, point);
				if (i == 0) {
					startMarker = null == startIcon ? new BMap.Marker(point) : new BMap.Marker(point, {
						icon: startIcon
					});
					if (data.evt) {
						startMarker.addEventListener("click", data.evt);
					}
				} else if (i == data['data'].length - 2) {
					endMarker = null == endIcon ? new BMap.Marker(point) : new BMap.Marker(point, {
						icon: endIcon
					});
					if (data.evt) {
						endMarker.addEventListener("click", data.evt);
					}
				} else {
					//marker = null==picon?new BMap.Marker(point):new BMap.Marker(point, {icon: picon});
				}
				points.push(point);
			}
			var polyline = new BMap.Polyline(points, this._getLineCfg(lineCfg));
			if (data.evt) polyline.addEventListener("click", data.evt);
			this.map.addOverlay(startMarker);
			this.map.addOverlay(endMarker);
			this.map.addOverlay(polyline);
		},
		_getLineCfg: function (lineCfg) {
			var plCfg = {};
			if (lineCfg.color) plCfg.strokeColor = lineCfg.color;
			if (lineCfg.width) plCfg.strokeWeight = lineCfg.width;
			if (lineCfg.opacity) plCfg.strokeOpacity = lineCfg.opacity;
			if (lineCfg.style) plCfg.strokeStyle = lineCfg.style;
			return plCfg;
		},
		_doMaxMin: function (mapData, point) {
			if (mapData['maxLng'] && mapData['minLng'] && mapData['maxLat'] && mapData['minLat']) {
				if (point.lng > mapData['maxLng']) mapData['maxLng'] = point.lng;
				if (point.lng < mapData['minLng']) mapData['minLng'] = point.lng;
				if (point.lat > mapData['maxLat']) mapData['maxLat'] = point.lat;
				if (point.lat < mapData['minLat']) mapData['minLat'] = point.lat;
			} else {
				mapData['maxLng'] = point.lng;
				mapData['minLng'] = point.lng;
				mapData['maxLat'] = point.lat;
				mapData['minLat'] = point.lat;
			}
		},
		_getIcon: function (key, cfg) {
			if (null == key) return null;
			var iconCfg = cfg['icons'][key];
			if (null == iconCfg) {
				throw new Error("YcyaMap:icon配置不正确");
			}
			if (iconCfg['offset']) {
				return new BMap.Icon(iconCfg['url'], new BMap.Size(iconCfg['size'][0], iconCfg['size'][1]), {
					imageOffset: new BMap.Size(iconCfg['offset'][0], iconCfg['offset'][1])
				});
			} else {
				return new BMap.Icon(iconCfg['url'], new BMap.Size(iconCfg['size'][0], iconCfg['size'][1]));
			}
		},
		draw: function (data, cfg, callback) {
			//实例化鼠标绘制工具
			var styleOptions = this._getLineCfg(cfg.lines[data.line]);
			var drawingManager = new BMapLib.DrawingManager(this.map, {
				isOpen: false,
				drawingToolOptions: {
					anchor: BMAP_ANCHOR_TOP_RIGHT,
					offset: new BMap.Size(5, 5),
					scale: 0.8
				},
				circleOptions: styleOptions,
				polylineOptions: styleOptions,
				polygonOptions: styleOptions,
				rectangleOptions: styleOptions
			});
			drawingManager.addEventListener('overlaycomplete', overlaycomplete);

			function overlaycomplete(e, overlay) {
				drawingManager.close();
				if (typeof callback == "function") {
					callback(e, overlay);
				}
			}
			drawingManager.setDrawingMode(this._getDrawActionFlag(data.flag));
			drawingManager.open();
		},
		_getDrawActionFlag: function (flag) { //画线-polyline、面-polygon；框选-rectangle、圈选-circle；标点 -marker
			var actionFlag = "";
			if (flag == "marker")
				return BMAP_DRAWING_MARKER;
			else if (flag == "polyline")
				return BMAP_DRAWING_POLYLINE;
			else if (flag == "polygon")
				return BMAP_DRAWING_POLYGON;
			else if (flag == "rectangle")
				return BMAP_DRAWING_RECTANGLE;
			else if (flag == "circle")
				return BMAP_DRAWING_CIRCLE;
		},
		createPoint: function (lng, lat) {
			return new BMap.Point(lng, lat);
		},
		createOverlay:function(pointArr,style,cfg,loader,id){
			var styleOptions =this._getLineCfg(cfg.lines[style]);
			var polygon = new BMap.Polygon(pointArr, styleOptions);
			/* this.map.panTo(pointArr[0]); */
			
			this.map.addOverlay(polygon);
			loader.setMarker(id,polygon);
			this.map.setViewport(pointArr);
			// this.center(pointArr[0],12);
		},
		openZoomendEvent: function (loader) {
			var cmap = this.map;
			this.map.addEventListener("zoomend", function () {
				//                this._setBounds(loader.getData());
				var bound = cmap.getBounds();
				var sw = bound.getSouthWest();
				var ne = bound.getNorthEast();
				var mapData = loader.getData();
				var mapData = loader.getData();
				mapData['swLng'] = sw.lng; //西南角
				mapData['neLng'] = ne.lng; //东北角  
				mapData['swLat'] = sw.lat; //西南角  
				mapData['neLat'] = ne.lat; //东北角
			});
		},
		openMoveendEvent: function (loader) {
			var cmap = this.map;
			this.map.addEventListener("moveend", function () {
				//                this._setBounds(loader.getData());
				var bound = cmap.getBounds();
				var sw = bound.getSouthWest();
				var ne = bound.getNorthEast();
				var mapData = loader.getData();
				mapData['swLng'] = sw.lng; //西南角
				mapData['neLng'] = ne.lng; //东北角  
				mapData['swLat'] = sw.lat; //西南角  
				mapData['neLat'] = ne.lat; //东北角
			});
		},
		_setBounds: function (mapData) {
			var bound = this.map.getBounds();
			var sw = bound.getSouthWest();
			var ne = bound.getNorthEast();
			mapData['swLng'] = sw.lng; //西南角
			mapData['neLng'] = ne.lng; //东北角  
			mapData['swLat'] = sw.lat; //西南角  
			mapData['neLat'] = ne.lat; //东北角

		},
		getBoundary: function (name, callback) {
			var Boundary = new BMap.Boundary();
			Boundary.get(name, callback);
		},
		setViewport: function (pointArr) {
			this.map.setViewport(pointArr);
		},
		getMapZoom: function () {
			return this.map.getZoom();
		},
		setMapZoom: function (zoom) {
			return this.map.setZoom(zoom);
		},
		getBounds: function () {
			return this.map.getBounds();
		},
		setCity: function (city) {
			this.map.centerAndZoom(city, 12);
		},
		localSearch: function (callBack) {
			return new BMap.LocalSearch(this.map, { //智能搜索
				onSearchComplete: callBack
			});
		},
		createAutoComplete: function (inputId, resultId, callBack) {
			var ac = new BMap.Autocomplete( //建立一个自动完成的对象
				{
					"input": inputId,
					"location": this.map
				}
			);
			var _this = this;
			ac.addEventListener("onhighlight", function (e) { //鼠标放在下拉列表上的事件
				var str = "";
				var _value = e.fromitem.value;
				var value = "";
				if (e.fromitem.index > -1) {
					value = _value.province + _value.city + _value.district + _value.street + _value.business;
				}
				str = "FromItem<br />index = " + e.fromitem.index + "<br />value = " + value;

				value = "";
				if (e.toitem.index > -1) {
					_value = e.toitem.value;
					value = _value.province + _value.city + _value.district + _value.street + _value.business;
				}
				str += "<br />ToItem<br />index = " + e.toitem.index + "<br />value = " + value;
				document.getElementById(resultId).innerHTML = str;
			});

			var myValue;
			ac.addEventListener("onconfirm", function (e) { //鼠标点击下拉列表后的事件
				var _value = e.item.value;
				myValue = _value.province + _value.city + _value.district + _value.street + _value.business;
				document.getElementById(resultId).innerHTML = "onconfirm<br />index = " + e.item.index + "<br />myValue = " + myValue;
				document.getElementById(resultId).setAttribute('data-value', myValue);
				callBack();
			});
			return ac;
		},
		getLngAndLat: function (inputId, resultId) {
			/*
			 * param {inputId} 地图上选择地点的input Id
			 * param {resultId} 地图上存放地点以及经纬度的容器 Id
			 * */
			var geoc = new BMap.Geocoder();
			this.map.addEventListener("click", function (e) {
				var pt = e.point;
				geoc.getLocation(pt, function (rs) {
					var addComp = rs.addressComponents;
					var elm = document.getElementById(resultId),
						inputElm = document.getElementById(inputId);
					elm.setAttribute('data-lng', e.point.lng);
					elm.setAttribute('data-lat', e.point.lat);
					inputElm.value = (addComp.province + ", " + addComp.city + ", " + addComp.district + ", " + addComp.street + ", " + addComp.streetNumber);
				});
			});
		},
		getLocation:function(point,callback,dom){
			if(point instanceof Array){
				var p=new BMap.Point(point[0],point[1]);
				var geoc = new BMap.Geocoder(); 
				geoc.getLocation(p, function(rs){
					var addComp = rs.address;
					if(dom.length==0){
						$('.BMapLib_bubble_content #ar').html(addComp);
					}else{
						dom .html(addComp);
					}
					
				});  
			}else{
				throw new Error('参数错误');
			}
			
		},
		setMapStyle:function(s){
			this.map.setMapStyle({style:s});
		},
		zoomIn:function(){
			this.map.zoomIn();
		},
		zoomOut:function(){
			this.map.zoomOut();
		}
	};
	ycya._BaiduMap = _BaiduMap;
})(window);