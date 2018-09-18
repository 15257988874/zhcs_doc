window.ycya = window.ycya || {};
window.ycya.page = {};

function checkNull(fields) {
    for(var fIdex in fields){
        if(null==fields[fIdex] || fields[fIdex]==''){
            return false;
        }
    }
    return true;
}

function GetQueryString(name){
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if(r!=null)return  unescape(r[2]); return null;
}

function getContentPath(){
    var pathName = document.location.pathname;
    var index = pathName.substr(1).indexOf("/");
    var result = pathName.substr(0,index+1);
    return result;
}

function getJsPath(jsFileName){
    var js=document.scripts;
    for(var i=js.length;i>0;i--){
        if(js[i-1].src.indexOf(jsFileName)>-1){
            return js[i-1].src.substring(0,js[i-1].src.lastIndexOf("/")+1);
        }
    }
}

//为IE等不支持forEach的浏览器扩展
if(!Array.prototype.forEach){
    Array.prototype.forEach = function(fun /*, thisp*/) {
        var len = this.length;
        if (typeof fun != "function")
            throw new TypeError();

        var thisp = arguments[1];
        for (var i = 0; i < len; i++){
            if (i in this)
                fun.call(thisp, this[i], i, this);
        }
    };
}
//添加数组IndexOf方法
if (!Array.prototype.indexOf){
	Array.prototype.indexOf = function(elt /*, from*/){
	  	var len = this.length >>> 0;
  
	  	var from = Number(arguments[1]) || 0;
	  		from = (from < 0)? Math.ceil(from):Math.floor(from);
	  	if (from < 0)from += len;
  
	  	for (; from < len; from++){
			if (from in this && this[from] === elt)return from;
	  	}
	  	return -1;
	};
}

function Base64() {
    _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";//private property
    
    this.encode = function (input) {// public method for encoding
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;
        input = _utf8_encode(input);
        while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;
            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
            output = output +
            _keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
            _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
        }
        return output;
    }
    
    this.decode = function (input) {// public method for decoding
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        while (i < input.length) {
            enc1 = _keyStr.indexOf(input.charAt(i++));
            enc2 = _keyStr.indexOf(input.charAt(i++));
            enc3 = _keyStr.indexOf(input.charAt(i++));
            enc4 = _keyStr.indexOf(input.charAt(i++));
            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
            output = output + String.fromCharCode(chr1);
            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }
        }
        output = _utf8_decode(output);
        return output;
    }
    
	_utf8_encode = function (string) {// private method for UTF-8 encoding
		string = string.replace(/\r\n/g,"\n");
        var utftext = "";
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            } else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            } else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
 
        }
        return utftext;
    }
    
    _utf8_decode = function (utftext) {// private method for UTF-8 decoding
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;
        while ( i < utftext.length ) {
            c = utftext.charCodeAt(i);
            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            } else if((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i+1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            } else {
                c2 = utftext.charCodeAt(i+1);
                c3 = utftext.charCodeAt(i+2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
		}
		var pos = string.length-1;//去除最后的char(0)
		for(var i=string.length-1;i>=0;i--){
			if(string.charCodeAt(i)!=0){
				pos = i;
				break;
			}
		}
		if(pos!=string.length-1)string = string.substring(0,pos+1);
        return string;
    }
}

(function(ycya){
	var Interface = function(name,methods){
		if(arguments.length!=2){
	        throw new Error("Interface constructor called with "+arguments.length+"arguments,but expected exactly 2");
	    }
	    this.name = name;
	    this.methods = [];
	    for(var i=0;i<methods.length;i++){
	        if(typeof methods[i] !== 'string'){
	            throw new Error('Interface constructor expects mothed names to be'+'passes in as a string');
	        }
	        this.methods.push(methods[i]);
	    }
	};
	Interface.prototype = {
		ensureImplements: function(objs){
			if(agruments.length != 1){
		        throw new Error("Interface constructor called with "+arguments.length+"arguments,but expected exactly 1")
		    }
		    for(var i=0;i<objs.length;i++){
		         var obj = objs[i];
		         for(var j=0;j<this.motheds.length;j++){
		               var mothed = this.methods[j];
		               if(!obj[mothed] || !typeof obj[mothed] !== 'function'){
		                    throw new Error('Function Interface.ensureImplements:implements interface'+this.name+',obj.mothed'+mothed+'was not found');
		               }
		         }
		    }
		}
	};
	ycya.Interface = Interface;
})(window);

(function(ycya){
	var uid = 1;
	var Jas = function(){
		this.map = {};
		this.rmap = {};
	};
	var indexOf = Array.prototype.indexOf || function(obj){
		for (var i=0, len=this.length; i<len; ++i){
			if (this[i] === obj) return i;
		}
		return -1;
	};
	var fire = function(callback, thisObj){
		setTimeout(function(){
			callback.call(thisObj);
		}, 0);
	};
	Jas.prototype = {
		waitFor: function(resources, callback, thisObj){
			var map = this.map, rmap = this.rmap;
			if (typeof resources === 'string') resources = [resources];
			var id = (uid++).toString(16); // using hex
			map[id] = {
				waiting: resources.slice(0), // clone Array
				callback: callback,
				thisObj: thisObj
			};

			for (var i=0, len=resources.length; i<len; ++i){
				var res = resources[i],
					list = rmap[res] || (rmap[res] = []);
				list.push(id);
			}
			return this;
		},
		trigger: function(resources){
			if (!resources) return this;
			var map = this.map, rmap = this.rmap;
			if (typeof resources === 'string') resources = [resources];
			for (var i=0, len=resources.length; i<len; ++i){
				var res = resources[i];
				if (typeof rmap[res] === 'undefined') continue;
				this._release(res, rmap[res]); // notify each callback waiting for this resource
				delete rmap[res]; // release this resource
			}
			return this;
		},
		_release: function(res, list){
			var map = this.map, rmap = this.rmap;
			for (var i=0, len=list.length; i<len; ++i){
				var uid = list[i], mapItem = map[uid], waiting = mapItem.waiting,
					pos = indexOf.call(waiting, res);
				waiting.splice(pos, 1); // remove
				if (waiting.length === 0){ // no more depends
					fire(mapItem.callback, mapItem.thisObj); // fire the callback asynchronously
					delete map[uid];
				}
			}
		}
	};
	ycya.Jas = Jas; // Jas is JavaScript Asynchronous (callings) Synchronizer
})(window);

(function(ycya){
	var YcyaLoader = function(){
		this.classcodes = [];
	};
	YcyaLoader.prototype = {
		loadFileList:function(_files,succes){
	        var FileArray=[];
	        if(typeof _files==="object"){
	            FileArray=_files;
	        }else{/*如果文件列表是字符串，则用,切分成数组*/
	            if(typeof _files==="string"){
	                FileArray=_files.split(",");
	            }
	        }
	        if(FileArray!=null && FileArray.length>0){
	            var LoadedCount=0;
	            for(var i=0;i< FileArray.length;i++){
	            	this.loadFile(FileArray[i],function(){
	                    LoadedCount++;
	                    if(LoadedCount==FileArray.length){
	                        succes();
	                    }
	                })
	            }
	        }
		},
		loadFile: function(url, success) {
			var classcodes = this.classcodes;
	        if (!this._fileExist(classcodes,url)) {
	            var ThisType=this._getFileType(url);
	            var fileObj=null;
	            if(ThisType==".css"){
	            	fileObj=document.createElement('link');
	            	fileObj.href = url;
	            	fileObj.type = "text/css";
	            	fileObj.rel="stylesheet";
	            }else if(ThisType==".less"){
		            fileObj=document.createElement('link');
		            fileObj.href = url;
		            fileObj.type = "text/css";
		            fileObj.rel="stylesheet/less";
	            }else{
	            	fileObj=document.createElement('script');

					fileObj.src = url;

	            }
	            success = success || function(){};
	            fileObj.onload = fileObj.onreadystatechange = function() {
	                if (!this.readyState || 'loaded' === this.readyState || 'complete' === this.readyState) {
	                    success();
	                    classcodes.push(url)
	                }
	            };
				document.getElementsByTagName("head")[0].appendChild(fileObj);
	        }else{
	            success();
	        }
	    },
	    _getFileType: function(url){
	        if(url!=null && url.length>0){
	            return url.substr(url.lastIndexOf(".")).toLowerCase();
	        }
	        return "";
	    },
	    _fileExist: function(FileArray,_url){//判断文件是否已经加载
	    	return FileArray.indexOf(_url)!=-1;
	    }
	};
	ycya.YcyaLoader = YcyaLoader;
})(window);

(function(window, undefined){
	//如果已经支持了，则不再处理
	if( window.localStorage )return;
	
	//IE系列
	var userData = {
		//存储文件名（单文件小于128k，足够普通情况下使用了）
   		file : window.location.hostname || "localStorage",
   		//key'cache
		keyCache : "localStorageKeyCache",
		//keySplit
		keySplit : ",",
		// 定义userdata对象
 		o : null,
 		//初始化
		init : function(){
			if(!this.o){
				try{
					var box = document.body || document.getElementsByTagName("head")[0] || document.documentElement, o = document.createElement('input');
					o.type = "hidden";
					o.addBehavior ("#default#userData");
					box.appendChild(o);
					//设置过期时间
					var d = new Date();
					d.setDate(d.getDate()+365);
					o.expires = d.toUTCString();
					//保存操作对象
					this.o = o;
					//同步length属性
					window.localStorage.length = this.cacheKey(0,4);
				}catch(e){
 					return false;
				}
			};
			return true;
		},
		//缓存key，不区分大小写（与标准不同）
		//action  1插入key 2删除key 3取key数组 4取key数组长度
		cacheKey : function( key, action ){
			if( !this.init() )return;
			var o = this.o;
			//加载keyCache
			o.load(this.keyCache);
			var str = o.getAttribute("keys") || "",
				list = str ? str.split(this.keySplit) : [],
				n = list.length, i=0, isExist = false;
			//处理要求
			if( action === 3 )return list;
			if( action === 4 )return n;
			//将key转化为小写进行查找和存储
			key = key.toLowerCase();
			for(; i<n; i++){
				if( list[i] === key ){
					isExist = true;
					if( action === 2 ){
						list.splice(i,1);
						n--; i--;
 					}
				}
			}
			if( action === 1 && !isExist )list.push(key);
 			//存储
			o.setAttribute("keys", list.join(this.keySplit));
			o.save(this.keyCache);
		},
		//核心读写函数
		item : function(key, value){
			if( this.init() ){
				var o = this.o;
				if(value !== undefined){ //写或者删
					//保存key以便遍历和清除
					this.cacheKey(key, value === null ? 2 : 1);
					//load
					o.load(this.file);
					//保存数据
					value === null ? o.removeAttribute(key) : o.setAttribute(key, value+"");
					// 存储
					o.save(this.file);
				}else{ //读
					o.load(this.file);
					return o.getAttribute(key) || null;
				}
				return value;
			}else{
				return null;
			}
			return value;
		},
		clear : function(){
			if( this.init() ){
				var list = this.cacheKey(0,3), n = list.length, i=0;
				for(; i<n; i++)
					this.item(list[i], null);
			}
		}
	};
	//扩展window对象，模拟原生localStorage输入输出
	window.localStorage = {
		setItem : function(key, value){userData.item(key, value); this.length = userData.cacheKey(0,4)},
		getItem : function(key){return userData.item(key)},
		removeItem : function(key){userData.item(key, null); this.length = userData.cacheKey(0,4)},
		clear : function(){userData.clear(); this.length = userData.cacheKey(0,4)},
		length : 0,
		key : function(i){return userData.cacheKey(0,3)[i];},
		isVirtualObject : true
 	};
})(window);

(function(window,localStorage,undefined){
	var wls = {
		set : function(key, value){
			//在iPhone/iPad上有时设置setItem()时会出现诡异的QUOTA_EXCEEDED_ERR错误
			//这时一般在setItem之前，先removeItem()就ok了
			if( this.get(key) !== null )this.remove(key);
			localStorage.setItem(key, value);
		},
		//查询不存在的key时，有的浏览器返回undefined，这里统一返回null
		get : function(key){
			var v = localStorage.getItem(key);
 			return v === undefined ? null : v;
		},
 		remove : function(key){ localStorage.removeItem(key); },
		clear : function(){ localStorage.clear(); },
		each : function(fn){
			var n = localStorage.length, i = 0, fn = fn || function(){}, key;
			for(; i<n; i++){
				key = localStorage.key(i);
				if( fn.call(this, key, this.get(key)) === false )break;
 				//如果内容被删除，则总长度和索引都同步减少
				if( localStorage.length < n ){
					n --;
					i --;
				}
			}
		}
	};
	//扩展到相应的对象上
	window.ycya.wls = window.ycya.wls || wls;
})(window,window.localStorage);

(function(window,undefined){
	var ycyaUtil={
		isJson:function(obj){
			return typeof(obj) == "object" && Object.prototype.toString.call(obj).toLowerCase() == "[object object]" && !obj.length;
		},
		isJsonStr:function(str) {
			var result = {isJson:false};
			if (typeof str == 'string') {
				try {
					var obj=JSON.parse(str);
					if(typeof obj == 'object' && obj ){
						result.isJson = true;
						result.data = obj;
					}
				} catch(e) {
					console.log('isJsonStr(error)：'+str+'!!!'+e);
				}
			}else{
				console.log('isJsonStr(error):para is not a string!');
			}
			return result;
		},
		htmlEncode:function(html){
			var temp = document.createElement("div");
    		(temp.textContent != null) ? (temp.textContent = html) : (temp.innerText = html);
    		var output = temp.innerHTML;
    		temp = null;
    		return output;
		},
		htmlDecode:function(text){
			var temp = document.createElement("div"); 
    		temp.innerHTML = text; 
    		var output = temp.innerText || temp.textContent; 
    		temp = null; 
    		return output;
		},
		checkPrivilegeM:function(privilege,code){//A1_A2,B1_B2
			var orArray = code.split(",");
			if(orArray==null || orArray.length==0)return false;
			for(var i=0;i<orArray.length;i++){
				var andArray = orArray[i].split("_"),count = 0;
				for(var j=0;j<andArray.length;j++){
					if(this.checkPrivilege(privilege,andArray[j]))count++;
				}
				if(count==andArray.length)return true;
			}
			return false;
		},
		checkPrivilege:function(privilege,code){
			if(code<0 || code>privilege.length*6)return false;
			var seed = [
				"A","B","C","D","E","F","G","H","I","J","K","L","M",
				"N","O","P","Q","R","S","T","U","V","W","X","Y","Z",
				"a","b","c","d","e","f","g","h","i","j","k","l","m",
				"n","o","p","q","r","s","t","u","v","w","x","y","z",
				"0","1","2","3","4","5","6","7","8","9","-","_"];
			var idx = Math.floor(code/6);
			var curr = privilege.charAt(idx);
			var seekIdx = 0;
			for(var j=0;j<seed.length;j++){
				if(seed[j]==curr){
					seekIdx=j;
					break;
				}
			}
			return this.getBit(seekIdx,(code-idx*6))==1;
		},
		getBit:function(value,index){
			if(this._isInt(value)){
				return (value & (1 << index)) >> index;
			}
			return false;
		},
		getBitRange:function(value,begin,end){
			if(this._isInt(value)){
				var result = 0;
				for(var i=begin;i<=end;i++){
					result += this.getBit(value,i) << (i-begin);
				}
				return result;
			}
			return false;
		},
		_isInt:function(value){
			return typeof value==='number';
		}
	}
	window.ycya.util = window.ycya.util || ycyaUtil;//扩展到相应的对象上

	//日期时间扩展
	var ycyaDate={
		cfg:{'y':0,'M':0,'d':0,'H':0,'m':0,'s':0,'S':0},//y-M-d H:m:s S分别表示 年-月-日 时:分:秒 毫秒
		isLeapYear:function(vDate){//是否是闰年
			vDate = vDate || new Date();
			return (0==vDate.getYear()%4&&((vDate.getYear()%100!=0)||(vDate.getYear()%400==0)));  
		},
		diff:function(cfg,vDate){
			vDate = vDate || new Date();
			cfg = $.extend(this.cfg,cfg);
			return new Date((vDate.getFullYear() + cfg['y']), (vDate.getMonth()+ cfg['M']), (vDate.getDate()+ cfg['d']), 
				(vDate.getHours()+ cfg['H']), (vDate.getMinutes()+ cfg['m']), (vDate.getSeconds()+ cfg['s']),
				(vDate.getMilliseconds()+ cfg['S'])
			);
		},
		daysOfMonth:function(vDate){//获取当月多少天
			vDate = vDate || new Date();
			var dtTmp = new Date(vDate.getFullYear(),vDate.getMonth()+1,0);
        	return dtTmp.getDate();
		},
		format:function(fmt,vDate){
			vDate = vDate || new Date();
			var o = {
				"M+": vDate.getMonth() + 1, //月份 
				"d+": vDate.getDate(), //日 
				"h+": vDate.getHours(), //小时 
				"m+": vDate.getMinutes(), //分 
				"s+": vDate.getSeconds(), //秒
				"S": vDate.getMilliseconds() //毫秒 
			};
			if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (vDate.getFullYear() + "").substr(4 - RegExp.$1.length));
			for (var k in o)
				if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
			return fmt;
		}
	}
	window.ycya.date = window.ycya.date || ycyaDate;//扩展到相应的对象上

	var  ycyaBrowser = {
		browType:function(){
			return this.browInfo().brow;
		},
		isIE:function(){
			return this.browInfo().brow=='ie';
		},
		isIE11:function(){
			return this.ieVer==11;
		},
		ieVer:function(){
			var bInfo = this.browInfo();
			if(bInfo.brow=='ie'){//IE//if(isIE11)return "11";
				return bInfo.ver.substring(0,bInfo.ver.indexOf('.'));
			}
			return "0";
		},
		browInfo:function(){
			var Sys = {};
			var ua = navigator.userAgent.toLowerCase();
			var s;
			(s = ua.match(/edge\/([\d.]+)/)) ? Sys.edge = s[1] :
			(s = ua.match(/rv:([\d.]+)\) like gecko/)) ? Sys.ie = s[1] :
			(s = ua.match(/msie ([\d.]+)/)) ? Sys.ie = s[1] :
			(s = ua.match(/firefox\/([\d.]+)/)) ? Sys.firefox = s[1] :
			(s = ua.match(/chrome\/([\d.]+)/)) ? Sys.chrome = s[1] :
			(s = ua.match(/opera.([\d.]+)/)) ? Sys.opera = s[1] :
			(s = ua.match(/version\/([\d.]+).*safari/)) ? Sys.safari = s[1] : 0;

			if (Sys.edge) return { brow : "edge", ver : Sys.edge };
			if (Sys.ie) return { brow : "ie", ver : Sys.ie };
			if (Sys.firefox) return { brow : "Firefox", ver : Sys.firefox };
			if (Sys.chrome) return { brow : "Chrome", ver : Sys.chrome };
			if (Sys.opera) return { brow : "Opera", ver : Sys.opera };
			if (Sys.safari) return { brow : "Safari", ver : Sys.safari };
			
			return { brow : "unknown", ver : "0" };
		}
	};
	window.ycya.browser = window.ycya.browser || ycyaBrowser;

	var ycyaHttp = {
		_cfg:{//非标准参数，以_开头
			type:"post",//get,post
			dataType:"json",//json,jsonp,xml,html,text,script
			timeout:15000,//默认15秒超时
			headers : {'X-Requested-With' : 'XMLHttpRequest'},
			_preProcess:true,//是否前置处理
			token:1//是否在请求中带着token
		},
		ajax : function(url, cfg){
			var ajaxCfg =$.extend({},this._cfg,cfg);

			if(ajaxCfg.token && ajaxCfg.token==1){//需要携带token
				var tokenInfo = this._getTokenInfo();
				if(tokenInfo){//token是否存在
					$.extend(ajaxCfg.headers,{'Authorization': 'Bearer ' + tokenInfo.token});
				}
			}

			if(this._isCors(document.location,url)){//跨域
				if(this._supportCors()){//支持跨域
					$.extend(ajaxCfg,{crossDomain: true, xhrFields: {withCredentials: true}});
					$.ajax(url,ajaxCfg);
				}else{//兼容跨域方案
					var crosData = {"url":url,"data":ajaxCfg.data||{},"head":ajaxCfg.headers||{}};
					if(!ycya.page._cros){
						var jsLoader = new YcyaLoader();
						var urlSeg = this.parseURL(getJsPath('ycya.js'),{parseAll:true});
						var _this=this,_thisCfg = ajaxCfg;
						jsLoader.loadFile('/'+urlSeg.segments[0]+'/res/dep/easyXDM/easyXDM.min.js', function() {
							var crosDiv=$('<div id="_crosDiv" style="display:none;"></div>');
							$(document.body).append(crosDiv);
							var uSeg = _this.parseURL(url,{parseAll:true})

							var rpc = new easyXDM.Rpc({
								isHost: true,
								remote: uSeg.protocol+"://"+uSeg.host+":"+uSeg.port+"/"+uSeg.segments[0]+'/rpc.html',
								hash: true,
								protocol: '1',
								container: document.getElementById('_crosDiv'),
								props: {
									frameBorder: 0,
									scrolling: 'no',
									style: {width: '100%', height: '100px'}
								}
							},{
								local: {
									echo: function (message) {
										if(!ycya.util.isJson(message)){
											message = JSON.parse(message);
										}
										_thisCfg.success(message,null,null);
										//showMsg(message);
									}
								},
								remote: {
									cmd:{}
								}
							});
							ycya.page._cros = rpc;
							ycya.page._cros.cmd(crosData);
						});
					}else{
						ycya.page._cros.cmd(crosData);
					}
					//alert("do something");
				}
			}else{
				$.ajax(url,ajaxCfg);
			}
		},
		setToken:function(token,url,data){//保存token数据
			var b64 = new Base64(),
				payload = eval('('+b64.decode(token.split(".")[1])+')'),
				curr = parseInt(new Date().getTime()/1000),
				prefix = this._getPrefix(),
				wlsData = {
					"_jwt":token,
					"_jwtExp":(curr+(payload.exp-payload.iat))*1000,
					"_jwtUrl":url,
					"_data":data
				}
			ycya.wls.set(prefix,JSON.stringify(wlsData));
			this.tokenTimer();
		},
		getLoginData:function(){
			var wlsData = ycya.wls.get(this._getPrefix());
			if(wlsData){
				return JSON.parse(wlsData)._data;
			}
			return null;
		},
		loginOut:function(){
			this._clearToken();
			window.top.location.href = getContentPath()+"/index.html";
		},
		tokenTimer:function(){//token处理函数
			var tokenInfo = this._getTokenInfo();
			if(null==tokenInfo){
				window.top.location.href = getContentPath()+"/index.html";
			}else{
				var curr = new Date().getTime();
				if(tokenInfo.exp-curr<1000*60*2){
					this._getToken(tokenInfo.url);
				}
			}

			var _this = this;
			var tTimer = setInterval(function(){
				var tokenInfo = _this._getTokenInfo(),
					curr = new Date().getTime();
				if(!tokenInfo.token){//token不存在,清除token数据
					window.top.location.href = getContentPath()+"/index.html";
				}
				//alert(token.exp);
				if(tokenInfo.exp-curr<=1000*60*2){//提前2分钟
					_this._getToken(tokenInfo.url);
				}
			},60000);//1分钟检查一次
			ycya.page._tokenTimer = tTimer;//保存到页面元素
		},
		parseURL:function(url,cfg){//解析URL路径中的参数
			var a =  document.createElement('a');  
			a.href = url;
			var result = { 
				protocol: a.protocol.replace(':',''),  
				host: a.hostname,  
				port: a.port
			};
			if(cfg && cfg.parseAll && cfg.parseAll==true){
				$.extend(result,{
					query: a.search,  
					params: (function(){  
						var ret = {},  
							seg = a.search.replace(/^\?/,'').split('&'),  
							len = seg.length, i = 0, s;  
						for (;i<len;i++) {  
							if (!seg[i]) { continue; }  
							s = seg[i].split('=');  
							ret[s[0]] = s[1];  
						}  
						return ret;  
					})(),  
					file: (a.pathname.match(/\/([^\/?#]+)$/i) || [,''])[1],  
					hash: a.hash.replace('#',''),  
					path: a.pathname.replace(/^([^\/])/,'/$1'),  
					relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [,''])[1],  
					segments: a.pathname.replace(/^\//,'').split('/') 
				});
			}
			return result;  
		},
		_getTokenInfo:function(){
			var wlsData = ycya.wls.get(this._getPrefix());
			if(!wlsData)return null;
			var jsonWls = JSON.parse(wlsData);
			var token = jsonWls._jwt;
			return	token?{"token":token,"exp":jsonWls._jwtExp,"url":jsonWls._jwtUrl}:null;		
		},
		_getToken:function(url){
			var _this = this;
			this.ajax(url,{//暂时没有做强校验，后续增加,by lif @2017-12-25
				success:function(data, textStatus, jqXHR){
					if(null!=data && null!=data.code && data.code==0){
						if(ycya.page._tokenTimer){
							clearInterval(ycya.page._tokenTimer);
							ycya.page._tokenTimer = null;
						}
						_this.setToken(data.data.token,url,data.data);
						return;
					}
					_this._clearToken();
					alert("系统错误：错误代码"+data.code+","+data.msg);
					window.top.location.href = getContentPath()+"/index.html";
				},
				error:function(jqXHR, textStatus, errorThrown){//错误，跳转到登录页面
					_this._clearToken();
					alert("系统错误："+textStatus);
					window.top.location.href = getContentPath()+"/index.html";
				}
			});
		},
		_clearToken:function(){
			ycya.wls.remove(this._getPrefix());
		},
		_supportCors:function(){//是否支持Cors,chrome、firefox、IE10+支持
			if(ycya.browser.isIE()){
				return parseFloat(ycya.browser.ieVer())>9;	
			}
			return true;
		},
		_isCors:function(url,urlRemote){//是否是CORS调用
			var r1 = this.parseURL(url),r2=this.parseURL(urlRemote);
			return r1.host!=r2.host || r1.port!=r2.port || r1.protocol!=r2.protocol;
		},
		_getPrefix:function(){
			return window.location.hostname+'_'+window.location.port+'_'+getContentPath();
		}
	};
	window.ycya.http = window.ycya.http || ycyaHttp;//扩展到相应的对象上

	var ycyaPush = {
		_cfg:{//非标准参数，以_开头
			debug:0,
			token:1//是否在请求中带着token
		},
		connect:function(cfg){
			if(ycya.page._ws)return;//已经打开连接

			var pushCfg = $.extend({},this._cfg,cfg);
			if (!('WebSocket' in window))pushCfg.transport = 'long-polling';
			var socket = atmosphere;
			var request = { 
				url: pushCfg.url,
				contentType : "application/json",
				logLevel : pushCfg.debug==0?'info':'debug',
				//polling, long-polling, streaming, jsonp, sse, websocket
				transport : ('WebSocket' in window)?'websocket':'long-polling' ,
				//trackMessageLength : true,
				enableXDR:true,
				reconnectInterval : 5000
			};
			request.onOpen = pushCfg.onOpen || function(response) {
				if(pushCfg.debug==1){
					console.log('PushOpen(%s):status=%d,transport=%s,state=%s,uuid=%s',ycya.date.format('yyyy-MM-dd hh:mm:ss'),
					response.status,response.transport,response.state,response.request.uuid);
				}
				if(pushCfg.token && pushCfg.token==1){//需要携带token
					var tokenInfo = ycya.http._getTokenInfo();
					if(tokenInfo){//token是否存在
						ycya.page._ws.push({'msgType':1,'data':{'token':tokenInfo.token}});
					}
				}
			};
			request.onError = pushCfg.onError || function(response) {
				if(pushCfg.debug==1)
					console.log('PushError('+ycya.date.format('yyyy-MM-dd hh:mm:ss')+"):"+JSON.stringify(response));
				if(ycya.page._wsTimer){
					clearInterval(ycya.page._wsTimer);
					ycya.page._wsTimer = null;
				}
				if(ycya.page._ws)ycya.page._ws = null;
			};
			request.onReconnect = pushCfg.onReconnect || function (request, response) {
				if(pushCfg.debug==1)
					console.log('PushReconnect('+ycya.date.format('yyyy-MM-dd hh:mm:ss')+")"+pushCfg.url);
			};
			request.onMessage = pushCfg.onMessage || function (response) {
				if(pushCfg.debug==1)
					console.log('PushMessage('+ycya.date.format('yyyy-MM-dd hh:mm:ss')+"):"+JSON.stringify(response));
				if(pushCfg.onMsg){
					var message = response.responseBody;
					var result = ycya.util.isJsonStr(message);
					var msg = {
						isJson:result.isJson,
						data:result.isJson?result.data:{},
						status:response.status,
						uuid:response.request.uuid,
						transport:response.transport,
						state:response.state
					};
					pushCfg.onMsg(msg);
				}
			};
			
			ycya.page._ws = socket.subscribe(request);
			if(request.transport != 'websocket'){
				var tokenInfo = this._getTokenInfo();
				if(tokenInfo){
					var wsTimer = setInterval(function(){
						ycya.page._ws.push({'msgType':0});
					},40000);//40秒发一次心跳包
					ycya.page._wsTimer = wsTimer;//保存到页面元素
				}else{
					console.log('Push[HB_Error]('+ycya.date.format('yyyy-MM-dd hh:mm:ss')+"):token is not exist");
				}
			}
		},
		push:function(data){//msgType，必须参数:0心跳包，1为认证消息，2～9预留，大于10的为应用数据，应用自行定义
			if(ycya.page._ws){
				if(ycya.util.isJson(data)){
					ycya.page._ws.push(atmosphere.util.stringifyJSON(data));
				}else{
					console.log('Push[NotJson_Error]('+ycya.date.format('yyyy-MM-dd hh:mm:ss')+"):data is not json fmt");
				}
			}else{
				console.log('Push[_WS]('+ycya.date.format('yyyy-MM-dd hh:mm:ss')+"):not connect");
			}
		}
	}
	window.ycya.push = window.ycya.push || ycyaPush;//扩展到相应的对象上
})(window);
