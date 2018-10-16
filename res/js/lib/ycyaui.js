"use strict";
var ycya=ycya || {};
var app = ycya.page || {};
app.ui = {
    version:'0.8.6',
    anim:4,
    formSelectsCfg:{
        type:'get',
        data: {},                   //自定义除搜索内容外的其他数据
        searchUrl: '',    //搜索地址, 默认使用xm-select-search的值, 此参数优先级高
        searchName: '',      //自定义搜索内容的key值
        keyName: 'name',            //自定义返回数据中name的key, 默认 name
        keyVal: 'value',            //自定义返回数据中value的key, 默认 value
        keySel: 'selected',         //自定义返回数据中selected的key, 默认 selected
        keyDis: 'disabled',         //自定义返回数据中disabled的key, 默认 disabled
        delay: 500,                 //搜索延迟时间, 默认停止输入500ms后开始搜索
        direction: 'down',          //多选下拉方向, auto|up|down
        success: function(id, url, searchVal, result){}, //组件ID xm-select  URL 搜索的value 返回的结果     
        error: function(id, url, searchVal, err){//使用远程方式的error回调
            layer.msg(err);   //err对象
        },
        beforeSuccess: function(id, url, searchVal, result){return result;},
        beforeSearch: function(id, url, searchVal){        
            // if(!searchVal){//如果搜索内容为空,就不触发搜索
            //     return false;
            // }
            return true;
        },
        clearInput: true//当有搜索内容时, 点击选项是否清空搜索内容, 默认不清空
    }
};
app.ui.page={};
//表单元素
(function (win) {           
    var YInput = function (pdom,cfg) {
        this.pdom = pdom;
        this.cfg = cfg;
        this.dom = [];
        
        if(cfg.qt=='btw'){//范围查询
            this.id = ['qry_'+this.cfg.name+'_gt','qry_'+this.cfg.name+'_lt'];
        }else{
            this.id = ['qry_'+this.cfg.name+'_'+cfg.qt];
        }

        this._init();
    }
    YInput.prototype = {
        _init:function(){
            var lenCss = this.cfg.len?"style='width:"+this.cfg.len+"px'":"";
            var html = '<div class="yy-m-search-item"><label>'+this.cfg.label+'&nbsp;</label><div>';
            for(var i=0;i<this.id.length;i++){
                if(i>0)html += '至';
                html += '<input type="text" id="'+this.id[i]
                    +'" autocomplete="off" class="layui-input" '+lenCss+' name='+this.cfg.name+'>';
            }
            html += '</div></div>';
            $('.yy-m-search',this.pdom).prepend(html);
            if(this.cfg.dt=='date'){
                var laydate = layui.laydate;
                for(var i=0;i<this.id.length;i++){
                    var dateCfg = {elem: '#'+this.id[i]};//指定元素
                    $.extend(dateCfg,this.cfg.cfg);
                    laydate.render(dateCfg);
                }
            }else{
                var _this=this;
                if(this.cfg.click){
                    if(_this.cfg.treeCfg){
                        $('#'+this.id[0]).click(function(){
                            _this.cfg.click($.extend(_this.cfg.treeCfg,{elm:$(this)}));
                        });
                    }else{
                        $('#'+this.id[0]).click(function(){
                            var res={};
                            $(this).attr('keyid') && (res.keyid=$(this).attr('keyid'));
                            _this.cfg.click($.extend(_this.cfg.cfg,{elm:$(this)}),res);
                        });
                    }
                }
            }
            return this;
        },
        get:function(split){
            return this.getArray().join(split?split:',');
        },
        getArray:function(){
            var result = [];
            for(var i=0;i<this.id.length;i++){
                result.push($('#'+this.id[i]).val());
            }
            return result;
        },
        getJson:function(){
            var result = {};
            for(var i=0;i<this.id.length;i++){
                result[this.id[i]] = $('#'+this.id[i]).val();
            }
            return result;
        },
        set:function(values){
            var isArr = values instanceof Array;
            for(var i=0;i<this.id.length;i++){
                $('#'+this.id[i]).val(isArr?values[i]:values);
            }
        },
        reset:function(){
            for(var i=0;i<this.id.length;i++){
                $('#'+this.id[i]).val('');
            }
        }
    }
    win.YInput = YInput;
    var AQInput = function (cfg,vType) {
        this.cfg = cfg;
        // this.dom = [];
        this.date=[];
        this.dateCfg=[];
        if(!cfg.qt){
            this.id = [ this.cfg.name ];
        }else{
            // if (cfg.qt == 'btw') { //范围查询
            //     this.id = ['qry_' + this.cfg.name + '_gt', 'qry_' + this.cfg.name + '_lt'];
            // } else {
            this.id = ['qry_' + this.cfg.name + '_' + cfg.qt];
            // }
        }
        if(cfg.handle){
            this.handle=cfg.handle;
        }
        this.eventName=cfg.eventName? cfg.eventName: 'click';
        if(cfg.treeCfg){
            this.cfgFn=cfg.treeCfg;
        }else if(cfg.cfg){
            this.cfgFn=cfg.cfg ;
        }else{
            this.cfgFn={};
        }
        this._init(!vType ?'msg':vType);
    }
    AQInput.prototype = {
        _init: function (vType) {
            var lenCss = this.cfg.len?"style='width:"+this.cfg.len+"px'":"",
                html = '',
                iClass=this.id.length>1?"input-btw" :'',
                _this=this;
            var dt= this.cfg.dt?this.cfg.dt:'text',
                shortc=this.cfg.cfg;
            if(dt=='text' || dt=='date'){
                var iType=this.cfg.inputType || 'text',
                    iVerity=this.cfg.verify ? 'lay-verify="'+this.cfg.verify+'"':'',
                    placeholder=this.cfg.placeholder? 'placeholder="'+this.cfg.placeholder+'"':'',
                    readonly=this.cfg.isReadonly?'readonly':'';
                html += '<input type="'+iType+'"  name="'+this.id[0]+'" autocomplete="off"  '+lenCss+'  '+readonly+' '+iVerity+ ' class="'+iClass+'" lay-verType="'+vType+'" '+placeholder+'>';
            }else if(dt=='switch'){
                if(shortc.values.length!=3 || shortc.text.length!=3){
                    return new TypeError();
                }
                var arr = shortc.values.split('|'), 
                    chk = shortc.checked !==undefined &&  shortc.checked==arr[0]?'checked=""':'',
                    value = shortc.checked !==undefined &&  shortc.checked==arr[0]?arr[0]:arr[1];
                html+= '<input type="checkbox" '+chk+'  value="'+value+'" name="'+this.cfg.name
                +'"  lay-skin="switch" lay-text="'+shortc.text+'" data-value="'+shortc.values+'">';
                this.switch=this.cfg.name;
            }else if(dt=='checkbox'){
                var skin=shortc.skin?'lay-skin="primary"':'';
                if(shortc.data && ! shortc.url){//本地加载
                    var _checked=shortc.checked ? (shortc.checked.indexOf('|')==-1)?[shortc.checked]:shortc.checked.split('|'):[];
                    $.each(shortc.data,function(i,item){
                        var isCheck= $.inArray(i,_checked)!=-1?'checked=""':'';
                        html+='<input type="checkbox" name="'+_this.cfg.name+'" title="'+item+'" '+skin+' '+isCheck+' value="'+i+'">';
                    });
                    _checked.length>0 && (this.checkInitVal={
                        name:_this.cfg.name,
                        checked:_checked
                    });
                }
                if(shortc.url){//服务器加载
                    _this.checkInitVal={
                        name:_this.cfg.name
                    };
                }
            }else{//radio
                var arr=shortc.values.split('|'),
                    text=shortc.text.split('|');
                if(arr.length!=text.length){
                    return new TypeError();
                }
                $.each(arr,function(i,item){
                    var chk=item==_this.cfg.cfg.checked ?'checked=""':'';
                    html+= '<input type="radio" name="'+_this.cfg.name+'"  value="'+item+'" title="'+text[i]+'" '+chk+'>'
                });    
                this.radioInitVal={
                    name:_this.cfg.name,
                    checked:_this.cfg.cfg.checked
                };
            }
            this.html=html;
            if (this.cfg.dt == 'date') {
                for (var i = 0; i < this.id.length; i++) {
                    this.date.push(/* '#' + */ this.id[i]/* +'_' */);
                    if(this.cfg.cfg){this.dateCfg.push(this.cfg.cfg)}
                }
            }
            return this;
        }
    }
    win.AQInput = AQInput;
    var Yselect=function(cfg,pdom){
        pdom && (this.pdom=pdom);
        cfg && (this.cfg=cfg);
        this.id = ['qry_'+this.cfg.name+'_'+cfg.qt];
        this.init();
    };
    Yselect.prototype={
        init:function(){
            var _this=this;
            if(!this.cfg.cfg){//本地加载
                this.createSel(this.cfg.option);
            }else{
                //数据字典加载
                ycya.http.ajax(this.cfg.cfg.url,{
                    data:this.cfg.cfg.where || {},
                    type:this.cfg.cfg.type || 'post',
                    success:function(data){
                        var d;
                        if(_this.cfg.cfg.format.indexOf('.')===-1){
                            d=data[_this.cfg.cfg.format];
                        }else{
                            d=data;
                            for(var i=0;i<_this.cfg.cfg.format.split('.').length;i++){
                                d=d[_this.cfg.cfg.format.split('.')[i]];
                            }
                        }
                        _this.createSel(d,_this.cfg.cfg.allVal);
                    }
                });
            }
            return this;
        },
        getJson:function(){
            var result = {};
            for(var i=0;i<this.id.length;i++){
                result[this.id[i]] = $('#'+this.id[i]).val();
            }
            return result;
        },
        createSel:function(obj,requireAll){
            var _option=requireAll!==undefined?['<option value='+requireAll+'>全部</option>']:[],_this=this;
            $.each(obj,function(i,item){
                _option.push( $('<option value='+item[_this.cfg["keyName"]]+'>'+item[_this.cfg["valName"]]+'</option>')[0].outerHTML);
            });
            var _divItem=$("<div/>",{class:'yy-m-search-item'}),
                _lab=$('<label/>',{text:this.cfg.label}),
                _div=$('<div/>'),
                _sel=$('<select/>',{
                    id:this.id[0],   
                    // name:this.cfg.name, 
                    html:_option.join(''),
                    width:this.cfg.len?this.cfg.len:'auto'
                });
            _div.append(_sel);
            _divItem.append(_lab).append(_div);   
            $('.yy-m-search',this.pdom).prepend(_divItem);
        }
    };
    win.Yselect = Yselect;
    /**
     *
     *
     * @param {*} cfg
     * { elem: string/object,指向容器选择器，如：elem: '#id'。也可以是DOM对象
     *   url:string 服务端上传接口
     *   method: string 上传接口的 HTTP 类型,默认 post
     *   data:object    请求上传接口的额外参数
     *   headers:  接口的请求头。如：headers: {token: 'sasasas'}
     *   accept:string 	指定允许上传时校验的文件类型，可选值有：images（图片）、file（所有文件）、video （视频）、audio（音频） 默认 images
     *   acceptMime:string 规定打开文件选择框时，筛选出的文件类型，值为用逗号隔开的 MIME 类型列表。如： acceptMime: 'image/*'（只显示图片文件） acceptMime:                                 'image/jpg, image/png'（只显示 jpg 和 png 文件）  默认 images
     *   exts: string  允许上传的文件后缀。一般结合 accept 参数类设定。假设 accept 为 file 类型时，那么你设置 exts: 'zip|rar|7z' 即代表只允许上传压缩格式的文件。如果                       accept 未设定，那么限制的就是图片的文件格式 默认 jpg|png|gif|bmp|jpeg
     *   auto:boolean, 是否选完文件后自动上传。如果设定 false，那么需要设置 bindAction 参数来指向一个其它按钮提交上传 默认true
     *   bindAction:string/object 指向一个按钮触发上传，一般配合 auto: false 来使用。值为选择器或DOM对象，如：bindAction: '#btn'
     *   field:string  	设定文件域的字段名 默认file
    *    size:number    设置文件最大可允许上传的大小，单位 KB。不支持ie8/9     默认0（即不限制）
    *    multiple:boolean      是否允许多文件上传。设置 true即可开启。不支持ie8/9  默认false
    *    number:number      设置同时可上传的文件数量，一般配合 multiple 参数出现。  默认0（即不限制）
    *    drag:boolean       是否接受拖拽的文件上传，设置 false 可禁用。不支持ie8/9  默认true
    *    choose:function  选择文件后的回调函数。返回一个object参数
    *    before:function  选择文件后的回调函数。返回一个object参数
    *    done:function    执行上传请求后的回调。返回三个参数，分别为：res（服务端响应信息）、index（当前文件的索引）、upload（重新上传的方法，一般在文件上传失败后使用）
    *    error:function   执行上传请求出现异常的回调（一般为网络异常、URL 404等）。返回两个参数，分别为：index（当前文件的索引）、upload（重新上传的方法
    * }
    */
    var Yupload=function(cfg){ //多图上图不支持IE8/9
        this.cfg=$.extend(true,{
            method:'post',
            accept:'images',
            acceptMime:'images',
            auto:true,
            multiple:true
        },cfg);
        this.init();
    };
    Yupload.prototype={
        init:function(){
            var upload=layui.upload,
                _upload=upload.render(this.cfg);
            this._upload=_upload;
            return this;
        }
    };
    win.Yupload=Yupload;
})(window);
(function(yy){
    var Autoform = function (cfg) {
        this.dateList=[];   //date数组
        this.dateCfgList=[];//date 格式数组
        this.bindElm=[];   //绑定特殊事件的元素
        this.eventName=[]; //待绑定特殊事件名称
        this.eventFn=[];   //待绑定特殊事件
        this.cfgFn=[];     //配置
        this.pwd=[]; //密码框 
        this.id=[]; //存储例如部门ID元素 name
        this.address=[]; //存储地点信息
        this.switchList=[]; //存放switch列表
        this.selectList=[]; //存放select列表
        this.radioList=[]; //存放radio列表
        this.checkList=[]; //存放radio列表
        this.selectMap={};
        this._cfg = {
            isAdvanced:false,  //高级查询
            id: '',            //容器ID 
            filter: '',        //layer 表单验证 
            allowEmpty: false, //返回值是否允许为空
            colWidth: 'two',   //一行2列或一行1列
            callBack: function () {}, //回调函数 
            submitFn:function(){},    //提交函数 
            verType:'tips', //用于定义异常提示层模式。 tips（吸附层,默认）alert（对话框） msg     
            item: [] //表单元素列表
            /* 渲染选项{label:'姓名',elmType:'input',name:"userName",'isBlock':true}
            elmType:            input、textarea、select
            inputType:''        input元素的预留 password
            isReadonly:booloean 
            dt:text、date、checkbox、radio、switch
            qt:eq(等于)、ne(不等于)、gt(大于)、lt(小于),like(包含),in(多值),btw(范围)  
            cfg:'' ,            配置
            verify:''           layui--验证 
            handle:function     表单元素事件函数 默认click
            eventName:''        表单元素事件    默认click
            treeCfg:{
                url:'',
                title:''
            }                    树配置
            */
        }
        $.extend(this._cfg, cfg);
        this.loaded = false;
        var jsLoader = new YcyaLoader();
        jsLoader.loadFileList([/* getContentPath()+ */'/res/js/component/advancedQuery/ycyaAq.css'],function(){});
        this.init(this._cfg);
    }
    Autoform.prototype = {
        init: function (cfg) {
            var _this=this;
            //参数验证
            if( $.type(cfg) !== 'object' || cfg.id==='' || !cfg.item || $.type(cfg.item) !== 'array'){
                throw new Error('参数错误');
                return ; 
            }
            //生成容器元素
            var boxClass='m-none layui-form' + ( cfg.isAdvanced? ' yy-m-aq-advanced-popup' :'');
            var _box=$('<div class="'+boxClass+'" id='+this._cfg.id+'></div>');
            $('body').append( _box );
            //列宽
            var _ulDefaultStyle = ['yy-m-aq-popup','yy-m-aq-'+cfg.colWidth+'-item'].join(' ');
            var _ul = $('<ul class="' + _ulDefaultStyle + '"></ul>'),
                _map;
            if(cfg.map){
                _ul.css({
                    float:'left',
                    width:cfg.map.lf || 300,
                    paddingRight:0,
                    height:cfg.map.height || 300
                });
                var mid='ycyaPopupMap',
                    _mid='ycyaFormMap';
                _map=$('<div/>',{id:mid,class:'yy-m-form-mapbox'});
                _map.css({
                    boxSizing:'border-box',
                    display:'inline-block',
                    padding:'5px',
                    width:cfg.map.rt -20,
                    height:cfg.map.height || 300
                });
                var _ycyaFormMap=$('<div/>',{id:_mid});
                _ycyaFormMap.css({
                    boxSizing:'border-box',
                    height:'100%',
                    width:'100%',
                    border: '1px solid #eee'
                });
                //判断是否加载ycyaMap.js
                var mapflag=false;
                $('script').each(function(){
                    if( $(this)[0].outerHTML.indexOf('ycyaMap.js')!==-1 ){
                        mapflag=true;
                        return false; 
                    }
                });
                if(!mapflag){
                    var _jsLoader=new YcyaLoader();
                    _jsLoader.loadFileList([/* getContentPath()+ */'/res/dep/ycyaMap/YcyaMap.js'],function(){
                        var _mapTimer=setInterval(function(){
                            if( $('#'+_this.mapId).length>0 ){
                                _this.map=app.ui.map.init({id:_this.mapId});
                                clearInterval(_mapTimer);
                                _mapTimer=null;
                            }
                        },100);
                    });
                }
                _map.append( _ycyaFormMap );
                this.mapBoxId=mid;
                this.mapId=_mid;
            }
            for (var i = 0; i < cfg.item.length; i++) {
                var con = cfg.item[i];
                if(!cfg.isAdvanced && con.qt){delete con.qt}
                var req = ( con.verify && con.verify.indexOf('required')!==-1 )? '<span class="yy-m-aq-require-option">*</span>':'',
                    verify = con.verify?con.verify:'',
                    itemBlcok=con.isBlock?'block-item layui-form-item':'layui-form-item',
                    _li=$('<li class="'+itemBlcok+'"><label>' + req + con.label + ': </label></li>'),
                    divStyle = 'm-inline-block w-all',
                    inputType = con.inputType ? con.inputType : 'text',
                    elmType=con.elmType || 'input',
                    verType=cfg.verType?cfg.verType:'tips';
                switch (elmType) {
                case 'input':
                    if(inputType=='text'){
                        var formItem = new AQInput(con,cfg.verType); 
                        if(formItem.date.length>0){
                            this.dateList.push(formItem.date);
                            this.dateCfgList.push(formItem.dateCfg);
                        }
                        if(formItem.handle  || con.eventName){
                            this.bindElm.push(formItem.id[0]);
                            this.eventName.push(formItem.eventName);
                            this.eventFn.push(formItem.handle || function(){});
                            this.cfgFn.push(formItem.cfgFn);
                        }
                        formItem.switch && this.switchList.push(formItem.switch);
                        formItem.radioInitVal && this.radioList.push(formItem.radioInitVal);
                        formItem.checkInitVal && this.checkList.push(formItem.checkInitVal);
                        if(formItem.html){
                            _li.append($('<div class="' + divStyle + '">'+formItem.html+'</div>'));
                        }else{
                            (function(con,_li){
                                var rersult='',
                                    skin=con.cfg.skin?'lay-skin="primary"':'',
                                    aliasCon=con.cfg.cfg;
                                ycya.http.ajax(con.cfg.url,{
                                    data:aliasCon.data,
                                    type:aliasCon.type || 'post',
                                    success:function(data){
                                        var _name=aliasCon.keyName || 'name',
                                            _val=aliasCon.keyVal || 'id';
                                        var d=aliasCon.beforeSuccess?aliasCon.beforeSuccess(data):(data.data || []);
                                        $.each(d,function(i,item){
                                            rersult+='<input type="checkbox" name="'+con.name+'" title="'+item[_name]+'" '+skin+'  value="'+item[_val]+'">';
                                        });
                                        _li.append($('<div class="' + divStyle + '">'+rersult+'</div>'));
                                    },
                                    error:function(){
                                        layer.msg('checkbox server load fail');
                                    }
                                });
                            })(con,_li);
                        }
                    }else if(inputType=='password'){
                        //判断是否加载md5.js
                        var md5flag=false;
                        $('script').each(function(){
                            if( $(this)[0].outerHTML.indexOf('md5.js')!==-1 ){
                                md5flag=true;
                                return false; 
                            }
                        });
                        if(!md5flag){
                            var _jsLoader=new YcyaLoader();
                            _jsLoader.loadFileList([/* getContentPath()+ */'/res/dep/md5/md5.js'],function(){
                            });
                        }
                        _li.append($('<div class="' + divStyle + '"><input type="password" name="'+con.name+'" lay-vertype="'+verType+' " lay-verify="' + verify + '" id="'+con.name+'_"></div>'));
                        this.pwd.push(con.name);
                    }
                    break;
                    case 'select':
                    var optionStr = '',
                        countX=con.cfg.count ?con.cfg.count:0,
                        countStr=countX>0? (countX==1?'xm-select-radio=""':'xm-select-max="'+countX+'"') :'',
                        // value=con.cfg.values? con.cfg.values.split(','):[],
                        value=con.cfg.values? (con.cfg.values.indexOf(',')===-1?[con.cfg.values]:con.cfg.values.split(',')):[],
                        dlSearch=con.cfg.search ?'xm-select-search=""  xm-select-search-type="dl"':'',
                        // dlUrl=con.cfg.url ? 'xm-select-search="'+con.cfg.url+'"':'xm-select-search=""',
                        elmId=cfg.id+'_'+con.name,
                        selRequire=con.verify && (con.verify.indexOf('required')!==-1? 'lay-verify="required" lay-vertype="tips"':'');
                        value=con.cfg.data && (value.length<=con.cfg.data.length ?value :value.slice(0,con.cfg.data.length)) ,//value个数超过，只初始化前面的
                        aliasName=!con.qt? con.name:'qry_'+con.name+'_'+con.qt;
                        if (con.cfg.data && $.type(con.cfg.data) == 'object') {
                            for(var k in con.cfg.data){
                                var _selected= $.inArray(k,value)!==-1?'selected="selected"':'';
                                optionStr += '<option value=' + k + ' '+_selected+'>' + con.cfg.data[k] + '</option>';
                            }
                        }
                        _li.append('<div  class="' + divStyle + '"><select   name="' + aliasName + '" id="'+elmId+'" '+countStr+'  xm-select="'+elmId+'"  xm-select-skin="ycya" xm-select-height="26px"  xm-select-direction="down"   '+dlSearch+' '+selRequire+'>' + optionStr + '</select></div>');
                        this.selectList.push({
                            id:elmId,
                            cfg:con.cfg
                        });
                        this.selectMap[elmId]=con.cfg.url?con.cfg:con.cfg.data;
                    break;
                    case 'textarea':
                        var aliasVer=!con.qt?'lay-verType="'+verType+'"':'',
                            aliasName=!con.qt? con.name:'qry_'+con.name+'_'+con.qt;
                        _li.append($('<div class="' + divStyle + '"><textarea name="' +aliasName + '" '+aliasVer+' lay-verify="' + verify + '"></textarea></div>'));
                    break;
                    case 'p':
                        _li.append($('<div class="' + divStyle + '"><p data-name=' + con.name + '></p></div>'));
                    break;
                }  
                _ul.append(_li);
            }
            //图片按钮
            if(!cfg.isAdvanced && cfg.pcfg){
                this.pic={};
                var btnShow=cfg.pcfg.btns !==undefined?cfg.pcfg.btns:true,
                    picbtn=$('<li/>',{class:'block-item layui-form-item'}),
                    lab=$('<label/>',{text:'图片信息:'}),
                    picview=$('<li/>',{class:'block-item layui-form-item'}),
                    picwrap=$('<div/>',{class:"yy-m-form-picview-wrap"}),
                    picbox=$('<div/>',{class:"yy-m-form-picview"}),
                    btn1=$('<a/>',{class:cfg.pcfg.auto?'layui-btn  layui-btn-sm':'layui-btn layui-btn-normal  layui-btn-sm',id:'ycya-up-btn1',text:cfg.pcfg.auto?'图片上传':'选择图片'});
                    picwrap.css({'marginTop':'-32px'}).append(picbox);
                    btnShow &&  picbtn.append(btn1);
                    picview.append(lab).append(picwrap)/* .css({paddingLeft:25,paddingRight:0}) */;   
                if($.type(cfg.pcfg.auto)==="boolean" && !cfg.pcfg.auto){//不自动上传
                    var btn2=$('<a/>',{class:'layui-btn  layui-btn-sm',id:'ycya-up-btn2',text:'开始上传'});
                    btn2.css({marginLeft:5});
                    btnShow && picbtn.append(btn2);
                }
                btnShow && _ul.append(picbtn);
                _ul.append(picview);
            }
            //添加按钮
            if (cfg.filter || cfg.isAdvanced) {
                var _btnul=$('<ul/>',{class:'yy-m-aq-btns'});
                if(cfg.isAdvanced){_btnul.css({'display':'block'})}
                _btnul.append('<li class="block-item layui-form-item btn-group" ><a lay-filter="' + cfg.filter + '" lay-submit id="ycyaAqYes" class="ycyaAqYes">确定</a><a class="white" id="ycyaAqNo">取消</a></li>');
            }
            //加载的待带地图模块的表单，追加 绘制，重汇按钮
            if(cfg.map && cfg.map.btns){
                this.popupPara={
                    btnToAdmin:'_ycyaMapDraw'  
                };
                var mapLi=$('<li/>',{class:'block-item'}),
                    mapDiv=$('<div/>',{class:'m-inline-block w-all',id:this.popupPara.btnToAdmin}),
                    mapBtn1=$('<button/>',{class:'layui-btn layui-btn-sm layui-btn-normal',text:'绘制',click:function(){
                        var sv=$('[name='+cfg.map.btnToElm+']','#'+cfg.id).val(),
                            t=cfg.map.btnElmJson[sv];
                        if(!_this.points){
                            if(t){
                                _this.drawRail(t);
                            }
                        }else{
                            layer.msg('已绘制，请选择重汇');
                        }
                    }}),
                    mapBtn2=$('<button/>',{class:'layui-btn layui-btn-sm layui-btn-warm',text:'重汇',click:function(){
                        var sv=$('[name='+cfg.map.btnToElm+']','#'+cfg.id).val(),
                            t=cfg.map.btnElmJson[sv] || 'circle';
                        if(_this.points){
                            _this.points='';
                            _this.map && _this.map.clear();
                            if(t){
                                _this.drawRail(t);
                            }
                        }else{
                            layer.msg('未绘制，请先绘制');
                        }
                    }});
                mapBtn1.css('padding','0 15px');
                mapBtn2.css('padding','0 15px');
                mapDiv.append(mapBtn1).append(mapBtn2);
                mapLi.append(mapDiv);
                _ul.append(mapLi);
            }
            $('#'+cfg.id).append(_ul).append(_btnul);
            if(_map){$('#'+cfg.id).append(_map)};
            if(!cfg.isAdvanced && cfg.pcfg){ this.preview= $('.yy-m-form-picview','#'+cfg.id)};
            //图片按钮事件
            if(!cfg.isAdvanced && cfg.pcfg){
                //图片按钮绑定事件
                var extendPara={
                    elem: $('#ycya-up-btn1','#'+cfg.id),
                    choose:function(obj){
                        if(!cfg.pcfg.multiple){cfg.pcfg.multiple=true;}
                        if(!cfg.pcfg.multiple){
                            obj.preview(function(index, file, result){
                                $('.yy-m-form-picview','#'+cfg.id).html('<span><img src="'+ result +'" alt="'+ file.name +'" class="layui-upload-img"><i class="layui-icon">&#x1006;</i></span>'); 
                            });
                        }else{
                            _this.files = obj.pushFile();
                            var len = (function(){
                                var jsonLength = 0;
                                for(var item in _this.files){
                                    jsonLength++;
                                }
                                return jsonLength /* + _this.preview.find('img').length */;
                            })();
                            // if(len>2){
                            //     //判断是否上传相同图片
                            //     var newFiles={},
                            //     initnames=[];
                            //     for(var k in _this.files){
                            //         newFiles[k]=_this.files[k].name;
                            //         initnames.push(_this.files[k].name);
                            //     }
                            //     var newnames = [initnames[0]];
                            //     for(var i=1; i<initnames.length; i++){
                            //         if(initnames[i] !== newnames[newnames.length-1]){
                            //             newnames.push(initnames[i]);
                            //         }
                            //     } 
                            //     for(var k in _this.files){
                            //        for(var i=0;i<newnames.length;i++){
                            //             if(_this.files[k].name==newnames[i]){

                            //             }
                            //        }
                            //     }
                            // }
                            if( cfg.pcfg.max && len>cfg.pcfg.max){
                                layer.alert('不能超过'+cfg.pcfg.max+'张图片', {icon: 5});
                                delete _this.files[Object.keys(_this.files)[Object.keys(_this.files).length-1]]
                                return false;
                            }else{

                                //预读本地文件示例，不支持ie8
                                obj.preview(function(index, file, result){
                                    $('.yy-m-form-picview','#'+cfg.id).append('<span><img src="'+ result +'" alt="'+ file.name +'" class="layui-upload-img"><i class="layui-icon">&#x1006;</i></span>');
                                    //删除图片
                                    $('.yy-m-form-picview i','#'+cfg.id).off('click');
                                    $('.yy-m-form-picview i','#'+cfg.id).click(function(){
                                        var imgname=$(this).siblings('img').attr('alt');
                                        for(var k in _this.files){
                                            if(_this.files[k].name===imgname){
                                                delete _this.files[k];
                                            }
                                        }
                                        for(var k in _this.pic){
                                            if(k===imgname){
                                                delete _this.pic[k];
                                            }
                                        }
                                        $(this).parent().remove();
                                    });
                                });
                                 
                            }
                        }
                    },
                    done:function(res){
                        //如果上传失败
                        if(res.code > 0){
                            return layer.msg('上传失败,请重新上传');
                        }
                        //上传成功
                        _this.pic[res["data"][0].oldName]=res["data"][0].uuid;
                    }
                };
                if( cfg.pcfg.multiple && !cfg.pcfg.auto){
                    extendPara.bindAction= $('#ycya-up-btn2','#'+cfg.id);
                }
                $.extend(true,cfg.pcfg,extendPara);
                this.upload=new Yupload(cfg.pcfg); 
            }
            layui.form.render();
            if(this.selectList.length>0){ //初始化select
                var formSelects = layui.formSelects;
                $.each(this.selectList,function(i,item){
                    if(item.cfg && item.cfg.url){
                        var cloneCfg=$.extend(true,{},app.ui.formSelectsCfg,{type:item.cfg.type || 'post',searchUrl:item.cfg.url});
                        var formCfg=$.extend(true,cloneCfg,item.cfg.cfg);
                        formSelects.data(item.id,'server',formCfg);
                    }else{
                        formSelects.render(item.id);
                    }
                });
            }
            //行政
            if(cfg.map && cfg.map.admin){
                this.createAdmin();  
                layui.formSelects.on(cfg.id+'_'+cfg.map.btnToElm,function(id, vals, val, isAdd, isDisabled){
                    if(val.val==cfg.map.btnToVal){
                        $('button','#'+_this.popupPara.btnToAdmin).each(function(){
                            $(this).hide();
                        });
                        _this.openAdmin();
                        
                    }else{
                        $('button','#'+_this.popupPara.btnToAdmin).each(function(){
                            $(this).show();
                        });
                    }
                },false);
            }
            this.bindEvent(); //绑定事件
            this.btnEvent(); //按钮事件监听
            //执行回调函数
            if (cfg.callback && $.type(cfg.callback) == 'function') {
                cfg.callback(this);
            }
        },
        addPicBtn:function(elm){

        },
        btnEvent:function(){//按钮事件监听
            var _this=this,
                cfg=this._cfg;
            if(cfg.filter){//监听提交按钮
                layui.form.on('submit(' + cfg.filter + ')', function (data) {
                    if(cfg.pcfg){//删除 file
                        var fileName=!(_this.upload.cfg.file) ?'file':_this.upload.cfg.file;
                        delete data.field[fileName];
                    }
                    if(cfg.pcfg ){//验证图片
                        if(cfg.pcfg.required){
                            if( Object.keys(_this.pic).length==0/* !==cfg.pcfg.max */){
                                return layer.msg('请上传图片');
                            }
                        }
                        var piclist=[];
                        for(var k in _this.pic){
                        piclist.push(_this.pic[k])
                        }
                        data.field[cfg.pcfg.picName || 'pic']=piclist.join(',');
                    }
                    if(cfg.map && cfg.map.admin){//验证经纬度
                        if(!_this.points){
                            return layer.msg('请绘制区域',{time:2000});
                        }
                        data.field[ cfg.map.admin.pointList || 'pointList']=_this.points;
                    }
                    if( _this.cirCenter && _this.cirRadius){
                        data.field[ cfg.map.admin.circleRadius || 'circleRadius']=_this.cirRadius;
                        data.field[ cfg.map.admin.cirCenter || 'cirCenter']=_this.cirCenter;
                    }
                    if( _this.switchList.length>0){
                        var parent=$(data.elem).parent().parent().siblings('ul');
                        $.each(_this.switchList,function(k,name){
                            var _input=parent.find('[name='+name+']'),
                                _text=_input.siblings('div').find('em').text();
                            data.field[name]=_input.attr('data-value')   [_input.attr('lay-text').indexOf(_text)];
                        });
                    }
                    if( _this.checkList.length>0){
                        $.each(_this.checkList,function(i,item){
                            var name=item.name,
                                divs=$('[name='+name+'] + .layui-form-checkbox','#'+_this._cfg.id),
                                checkboxs=$('[name='+name+']','#'+_this._cfg.id),
                                val=[];
                                for(var k=0,l=divs.length;k<l;k++){
                                    if( $(divs[k]).hasClass('layui-form-checked') ){
                                        val.push($( checkboxs[k]).attr('value')); 
                                    }
                                }
                            data.field[name]=val.toString();
                        });
                    }
                    if($.type(cfg.submitFn) == 'function'){
                        if(_this.id.length>0){//特殊字段存储 id
                            for(var p=0;p<_this.id.length;p++){
                                var item=_this.id[p];
                                data.field[item]=$('#'+cfg.id+' [name="'+_this.id[p]+'"]').attr('keyid');
                            }
                        }
                        var items=$('#'+_this._cfg.id).find('input,select,textarea');
                        $.each(items,function(i,val){
                            var keyid=$(this).attr('keyid');
                            if( keyid){
                                data.field[ $(this).attr('name') ]=keyid;
                            }
                        });

                        if(_this.address.length>0){//地点处理
                            for(var p=0;p<_this.address.length;p++){
                                var item=_this.address[p];
                                data.field["lng"]=$('#'+cfg.id+' [name="'+item+'"]').attr('data-lng');
                                data.field["lat"]=$('#'+cfg.id+' [name="'+item+'"]').attr('data-lat');
                            }
                        }
                        if(_this.pwd.length>0){//密码框MD5传输
                            for(var p=0;p<_this.pwd.length;p++){
                                var item=_this.pwd[p];
                                if($.trim($('#'+cfg.id+' [name="'+item+'"]').val())==''){
                                    continue ;
                                }else{
                                    data.field[item]=hex_md5($('#'+cfg.id+' [name="'+item+'"]').val());
                                }
                            }
                        }
                        if(!cfg.allowEmpty){
                            $.each(data.field,function(i,item){
                                if(!item){
                                    delete data.field[i]
                                }
                            });
                        }
                        cfg.submitFn(data.field);
                    }

                });
            }
            //取消按钮
            $('#ycyaAqNo','#'+cfg.id).click(function(){
                 if(!cfg.isAdvanced){
                    cfg.index!==undefined && _this.close();
                 }else{
                      $('#'+cfg.id).hide(400);
                 }
            });
        },
        bindEvent:function(){
            var _this=this, 
                cfg=this._cfg;
            //绑定元素事件
            if(this.eventName.length>0 && (this.eventName.length===this.eventFn.length) ){
                for(var k=0;k<this.bindElm.length;k++){
                    (function(k){
                        if(_this.eventName[k]==="tree"){
                            _this.id.push(_this.bindElm[k]);
                            $('#'+cfg.id).on('click','[name="'+_this.bindElm[k]+'"]',function(){
                                _this.tree($.extend(_this.cfgFn[k],{elm:$(this)}));
                            }); 
                        }else if(_this.eventName[k]==="address"){
                            _this.address.push(_this.bindElm[k]);
                            $('#'+cfg.id).on('click','[name="'+_this.bindElm[k]+'"]',function(){
                                _this.getPlace($.extend(_this.cfgFn[k],{elm:$(this)}));
                            }); 
                        }else{
                            $('#'+cfg.id).on(_this.eventName[k],'[name="'+_this.bindElm[k]+'"]',function(){
                                _this.eventFn[k] && _this.eventFn[k]();
                            });
                        }
                    })(k); //保存k
                }
            }
            //绑定date事件
            if(this.dateList.length>0){
                var laydate = layui.laydate;
                for (var i = 0; i < this.dateList.length; i++) {
                    if($.type(this.dateList[i])=='array'){
                        for(var j=0;j<this.dateList[i].length;j++){
                            var dateCfg={
                                elem:'#'+_this._cfg.id+' [name="'+this.dateList[i][j]+'"]'
                            };
                            $.extend(dateCfg,this.dateCfgList[i][j]);
                            laydate.render(dateCfg);
                        }
                    }else{
                        var dateCfg = {
                            elem: '#'+_this._cfg.id+' [name="'+this.dateList[i]+'"]'
                        }; //指定元素
                        $.extend(dateCfg,this.dateCfgList[i]);
                        laydate.render(dateCfg);
                    }
                }
            }
        },
        reset:function(){
            var _this=this;
            //input reset
            $('input','#'+this._cfg.id).each(function(){
                var type=$(this).attr('type');
                if(type=='text' || type=='password'){
                    $(this).val('').removeAttr('keyid').removeAttr('data-lng').removeAttr('data-lat');
                }
            });
            //select
            if(this.selectList.length>0){
               $.each(this.selectList,function(i,item){
                    var arr=[]; 
                    if(item.cfg.values){
                        arr=item.cfg.values.indexOf(',')!==-1?item.cfg.values.split(','):[item.cfg.values-0]
                    }
                    layui.formSelects.value(item.id,arr);
                    $('input','[fs_id='+item.id+']').removeClass('layui-form-danger');
               })
            }
            //switch  暂不初始化
            //radio
            if(this.radioList.length>0){
                $.each(this.radioList,function(i,item){
                    var _radios=$('[name='+item.name+']','#'+_this._cfg.id);
                    for(var k=0,l=_radios.length;k<l;k++){
                        var elm=$(_radios[k]);
                        elm.prop('checked',elm.attr('value')==item.checked?true:false);
                    }
                });
                layui.form.render('radio');
            }
            if(this.checkList.length>0){
                $.each(this.checkList,function(i,item){
                    var checkboxs=$('[name='+item.name+']','#'+_this._cfg.id);
                    if( !item.checked){
                        for(var k=0,l=checkboxs.length;k<l;k++){
                            $( checkboxs[k] ).prop('checked',false);
                        }
                    }
                    for(var k=0,l=checkboxs.length;k<l;k++){
                        $( checkboxs[k] ).prop('checked',  $.inArray($( checkboxs[k] ).attr('value'),item.checked)!=-1?true:false);
                    }
                });
                layui.form.render('checkbox');
            }
            //textarea
            $('textarea','#'+this._cfg.id).each(function(){
                $(this).val('');
            });
            //pic
            if(this._cfg.pcfg && this.preview){
                this.preview.html('');
                if(this.files){
                    for(var key in this.files){
                        delete this.files[key]
                    }
                }
                if(this.pic){
                    for(var key in this.pic){
                        delete this.pic[key]
                    }
                }
            }
            //map
            if(this.map){
                this.map.clear();
            }
            if(this.points){
                this.points='';
                this.cirRadius='';
                this.cirCenter='';
            }
            if(this.adminName){
                this.adminName='';
            }
            if(this.popupPara){
                if( $('#'+this.popupPara.btnToAdmin).length>0 ){
                    $('button','#'+this.popupPara.btnToAdmin).each(function(){
                        $(this).show();
                    }) ;  
                }
            }
        },
        set:function(valueJson,ids,addrNames,picName,extra){
            //后台JSON数据,需要添加keyid的字段数组,地点字段数组,图片字段字符串
            //额外的参数(例如{points:'','cirRadius':'','cirCenter':''})
            var _this=this;
            if( $.type(valueJson)!=='object' || $.isEmptyObject(valueJson) ){
                return ;
            }
            if($('ul.yy-m-aq-btns','#'+this._cfg.id).length==0){//查看,填充p元素
                $('p','#'+this._cfg.id).each(function(){
                    var filedName=$(this).attr('data-name');
                    $(this).text( valueJson[filedName]!==undefined ?valueJson[filedName]:'--' );
                });
                return ;
            }
            //input fill
            $('input','#'+this._cfg.id).each(function(){
                var type=$(this).attr('type'),
                    sign=$(this).attr('name');
                if(type=='text' || type=='password'){
                    $(this).val(valueJson[sign]?valueJson[sign]:'');
                }else{
                    // $(this).prop('checked',false);
                }
            });
            if($.type(extra)==='object'){ //
                $.each(extra,function(i,item){
                    if(i=='selLinkage'){//联动select数据回显
                        for(var j=0;j<item.length;j++){
                            var _j=item[j].name,
                                elmId=_this._cfg.id+'_'+_j,
                                testCfg=_this.selectMap[elmId]  || {};
                            var cloneCfg=$.extend(true,{},app.ui.formSelectsCfg,{type:'post',searchUrl:!$.isEmptyObject(testCfg) && testCfg.url});
                            formCfg=$.extend(true,cloneCfg,!$.isEmptyObject(testCfg) && testCfg.cfg);
                            $.each(item[j].data,function(k,val){
                                formCfg.data[k]=val;
                            });
                            layui.formSelects.data(elmId,'server',formCfg);
                        }
                    }
                    if( $('#'+_this.mapId).length>0 && _this._cfg.map.admin){
                        if(i=='admin' && item){
                            $('button','#'+_this.popupPara.btnToAdmin).each(function(){
                                $(this).hide();
                            });
                        }else{
                            _this.map=app.ui.map.init({id:_this.mapId});
                            _this.map.ready(function () {
                               if(i=='points' || i=='cirRadius' || i=='cirCenter'){
                                    _this[i]=valueJson[item];
                                    if(i=='points' && _this[i]){
                                        if(_this[i][_this[i].length-1]==','){
                                            var newStr=_this[i].slice(0,_this[i].length-2);
                                        }
                                        var pointList=newStr?newStr.split(','):_this[i].split(','),
                                            newList=[];
                                        for(var j=0;j<pointList.length;j+=2){
                                            newList.push(_this.map.createPoint(pointList[j],pointList[j+1])); 
                                        }
                                       setTimeout(function(){
                                            _this.map.createOverlay(newList,'line2');
                                       },500)
                                    }
                                }
                            });
                        }
                       
                    }
                });

            }
            //select 
            if(this.selectList.length>0){
                // layui.formSelects.render();
                $.each(this.selectList,function(i,item){
                    var selName=item.id.split('_')[1],
                        selVal=valueJson[selName],
                        selArr=[];
                    if(selVal!==undefined){
                        selVal=$.type(selVal)==='string'?selVal:selVal+'';
                        if(selVal.indexOf(',')===-1){
                            selArr.push(selVal);
                        }else{
                            var selArr=[];
                            $.each(selVal.split(','),function(i,value){
                                selArr.push(value)
                            });
                        }
                        layui.formSelects.value(item.id,selArr);
                        $('input','[fs_id='+item.id+']').removeClass('layui-form-danger');
                    }  
                });
            }
            //switch
            if(this.switchList.length>0){
                $.each(this.switchList,function(i,item){
                    var _checked=valueJson[item] == 1?true:false;
                    $('[name='+item+']','#'+_this._cfg.id).prop('checked',_checked);
                })
            }
            //radio
            if(this.radioList.length>0){
                $.each(this.radioList,function(i,item){
                    var _radios=$('[name='+item.name+']','#'+_this._cfg.id);
                    for(var k=0,l=_radios.length;k<l;k++){
                        var elm=$(_radios[k]);
                        elm.prop('checked',elm.attr('value')==valueJson[item.name]?true:false);
                    }
                });
            }
            if(this.checkList.length>0){
                $.each(this.checkList,function(i,item){
                    var checkboxs=$('[name='+item.name+']','#'+_this._cfg.id);
                    for(var k=0,l=checkboxs.length;k<l;k++){
                        var elm=$(checkboxs[k]),
                            vi=valueJson[item.name],
                            rs=vi!==undefined &&(vi.indexOf(',')!=-1 ? vi.split(','):[vi]);
                        elm.prop('checked', $.inArray( elm.attr("value"), rs)!=-1?true:false );
                    }
                });
            }
            //textarea
            $('textarea','#'+this._cfg.id).each(function(){
                var sign=$(this).attr('name');
                $(this).val(valueJson[sign]?valueJson[sign]:'');
            });
            //特殊处理ids
            if(ids && $.type(ids)==='array' && ids.length>0){
                for(var i=0;i<ids.length;i++){
                    $('#'+this._cfg.id +' [name='+ids[i]+']').attr('keyid',valueJson[ids[i]])
                }
            }
            //特殊处理地点
            if(addrNames && $.type(addrNames)==='array' && addrNames.length==2){
                for(var i=0;i<this.address.length;i++){
                    $('#'+this._cfg.id +' [name='+this.address[i]+']').attr('data-lng',valueJson[addrNames[0]]).attr('data-lat',valueJson[addrNames[1]]);
                }
            }
            //图片
            if(picName){
                var pimg=[],_this=this;
                // this.pic={};
                // this.files={};
                if(this._cfg.pcfg){
                    if(this.files){
                        for(var key in this.files){
                            delete this.files[key]
                        }
                    }
                    if(this.pic){
                        for(var key in this.pic){
                            delete this.pic[key]
                        }
                    }
                }
                if(this.pic  && this.preview && (valueJson[picName]!='' && valueJson[picName]!='0')){
                    if(valueJson[picName].indexOf(',')===-1){
                        pimg.push('<span><img src="'+ app.url+'file/view?id='+valueJson[picName] +'" class="layui-upload-img"><i class="layui-icon mod-img" data-id='+valueJson[picName]+'>&#x1006;</i></span>');
                        this.pic={0:valueJson[picName]};
                        this.files={0:valueJson[picName]};
                    }else{
                        var plist=valueJson[picName].split(','),
                            pimg=[];
                            this.files ={};
                        for(var i=0,l=plist.length;i<l;i++){
                            pimg.push('<span><img src="'+ app.url+'file/view?id='+plist[i] +'" class="layui-upload-img"><i class="layui-icon mod-img" data-id='+plist[i]+'>&#x1006;</i></span>');
                            this.pic[i]=plist[i];
                            this.files[i]=plist[i];
                        }
                    }
                    this.preview.html(pimg.join(''));
                     //删除图片
                     $('.yy-m-form-picview i.mod-img','#'+this._cfg.id).off('click');
                     $('.yy-m-form-picview i.mod-img','#'+this._cfg.id).click(function(){
                         var imgid=$(this).attr('data-id');
                         for(var k in _this.files){
                            if(_this.files[k]===imgid){
                                delete _this.files[k];
                            }
                         }
                         for(var k in _this.pic){
                             if(_this.pic[k]===imgid){
                                 delete _this.pic[k];
                             }
                         }
                         $(this).parent().remove();
                     });
                }
                
            }
            layui.form.render();
        },
        aliasSet:function(valueJson,aliasJson){
            //后台JSON数据,需要显示名称的对象 {'待回显的元素name/待回显的元素data-name':'显示的后台key'},
            if( $.type(valueJson)!=='object') {
                return layer.msg('aliasSet para error');
            }
            var _this=this;
            if($('ul.yy-m-aq-btns','#'+this._cfg.id).length==0){//查看,填充p元素
                $.each(aliasJson,function(i,item){
                    if(i!=='direct'){
                        var elm=$('[data-name='+i+']','#'+_this._cfg.id);
                        if( elm.length>0){
                            elm.text(valueJson[item]);
                        }
                    }else{
                        $.each(item,function(k,val){
                            var elm=$('[data-name='+k+']','#'+_this._cfg.id);
                            if( elm.length>0){
                                elm.text(val);
                            }
                        })
                    }
                    
                });
                return ;
            }else{
                $.each(aliasJson,function(i,item){
                    var elm=$('[name='+i+']','#'+_this._cfg.id);
                    if( elm.length>0){
                        elm.val(valueJson[item]);
                    }
                });
            }
            
        },
        disabled:function(disArr,bool){
            var bool=bool!==undefined?bool:false,
                _this=this;
            $.each(disArr,function(i,item){
                var elm=$('[name='+item+']','#'+_this._cfg.id);
                if( elm.length>0 ){
                    elm.prop('disabled',bool?true:false);
                }
            });
        },
        selDisabled:function(names){
            var _this=this;
            $.each(names,function(i,item){
                var bool=item?true:false;
                bool ? layui.formSelects.disabled(_this._cfg.id+'_'+i):layui.formSelects.undisabled(_this._cfg.id+'_'+i);
            });
        },
        close:function(){
            if(this._cfg.index){
                layer.close(this._cfg.index);
                $('#'+this._cfg.id).hide();
            }
        },
        popup:function(cfg){
            var btns = [],btnEvt = {},_this=this;
            layui.form.render();
            if(cfg &&  cfg.btns){}else{
                var cfg=cfg ? cfg:{};
                cfg.btns =[{'title':'确定',handle:'','yes':true},{'title':'取消',handle:''}];
            }
            if(cfg.btns.length==1){
                btns.push(cfg.btns[0].title);
                if(!cfg.btns[0].handle){
                    btnEvt['yes'] =function(){
                        _this.close();
                    }
                }else{
                    btnEvt['yes']=cfg.btns[0].handle;
                }
            }else if(cfg.btns.length>1){
                for(var idx=0;idx<cfg.btns.length;idx++){
                    btns.push(cfg.btns[idx].title);
                    if(cfg.btns[idx].yes){//确定按钮
                        continue;
                    }else{
                        if(!cfg.btns[idx].handle){
                            btnEvt['btn'+(idx+1)] =function(){
                                _this.close();
                            }
                        }else{
                            btnEvt['btn'+(idx+1)]=cfg.btns[idx].handle;
                        }
                    }
                }
            }
            var w=cfg.width || 500;
                w=w<300 ?300:w;
            var initCfg={
                type: 1, 
                area: w+'px',
                maxmin:cfg.maxmin || false,
                title:cfg.title || '表单信息',
                content: $('#'+this._cfg.id ),
                btn:btns,
                anim:app.ui.anim,
                success: function(layero, index){  
                    if(cfg.height){
                        $('.yy-m-aq-popup','#'+_this._cfg.id ).height(cfg.height-87-16); 
                    }
                    cfg.success && cfg.success();
                },
                yes:function(index, layero){
                    layero.find('#'+_this._cfg.id+' .ycyaAqYes').click();
                },
                end:function(){
                    $('#'+_this._cfg.id).hide();
                    cfg.end && cfg.end();
                }
            };
            var h = cfg.height || ($('#'+this._cfg.id).height()+40+43+2), //加上layer title以及btns高度，减去默认按钮组的高度，预留2像素
                wh = $(window).height();
            if(h<170){
                h=170;
            }
            if( h>wh){
                h=wh-60;
                initCfg.area=[w+'px',h+'px'];
            }
            if(cfg.height){
                initCfg.area=[w+'px',cfg.height+'px'];
            }
            this._cfg.index=layer.open($.extend(initCfg,btnEvt));
        },
        tree:function(cfg){
            if(!cfg ||!cfg.url ){
                return layer.msg('para error');
            }
            this.treeIndex=layer.open({
                type: 2, 
                area: ['500px', '300px'],
                title:cfg.title || '请选择部门',
                content: /* getContentPath()+ */cfg.url,
                btn:['确定'],
                yes:function(index, layero){
                    var iframeWin = $(layero).find('iframe')[0].contentWindow;
                    var backJson=iframeWin.getSelected();
                    if(backJson.arr.length>0){
                        if(backJson.arr.length==1){
                            cfg.elm.val(backJson.arr[0][cfg.name]).attr('keyid',backJson.arr[0].id);
                        }else{
                            var names=[],ids=[];
                            for(var l=0;l<backJson.arr.length;l++){
                                names.push(backJson.arr[l][cfg.name]);
                                ids.push(backJson.arr[l].id);
                            }
                            cfg.elm.val(names.join(',')).attr('keyid',ids.join(','));
                        }
                    }
                    layer.close(index);
                },
                end:function(){
                    cfg.end && cfg.end();
                }
            });
        },
        getPlace:function(cfg){
            if(!cfg ||!cfg.url ){
                return layer.msg('para error');
            }
            this.treeIndex=layer.open({
                type: 2, 
                area: ['500px', '415px'],
                title:cfg.title || '地点',
                content: /* getContentPath()+ */cfg.url,
                btn:['确定'],
                yes:function(index, layero){
                    var iframeWin = $(layero).find('iframe')[0].contentWindow;
                    var backJson=iframeWin.returnData();
                    cfg.elm.val(backJson.name).attr('data-lng',backJson.lng).attr('data-lat',backJson.lat);
                    layer.close(index);
                }
            });
        },
        createAdmin:function(){
            var aid='ycyaMapAdmin';
            this.adminBoxId=aid;
            this.adminTreeId='ycyaMapAdminTree';
            if( $('#'+aid).length==0){
                $('body').append( '<div id="'+aid+'" class="m-none"><div style="overflow-y: auto;height:300px"><ul id="'+this.adminTreeId+'" class="ztree"></ul></div></div>');
            }
            var ztreeflag=false;
            $('script').each(function(){
                if( $(this)[0].outerHTML.indexOf('ztree.all.js')!==-1 ){
                    ztreeflag=true;
                    return false; 
                }
            });
            if(!ztreeflag){
                var _jsLoader=new YcyaLoader();
                _jsLoader.loadFileList([/* getContentPath()+ */'/res/dep/zTree/css/zTreeStyle/zTreeStyle.css',
                    /* getContentPath()+ */'/res/dep/zTree/js/jquery.ztree.all.js'],function(){});
            }
        },
        openAdmin:function(){
            var _this=this;
            var adminLay=layer.open({
                type:1,
                content:$('#'+this.adminBoxId),
                anim:app.ui.anim,
                shade:0,
                title: '选择行政区域',
                area: ['400px', '400px'],
                btn: ['确定', '取消'],
                yes: function () {
                    if (_this.adminTree.getSelectedNodes().length==0){
                        return layer.msg('请选择行政区域', {
                            time: 1000
                        });
                    }
                    var node = _this.adminTree.getSelectedNodes()[0],
                        pNode = node.getParentNode(),
                        areaName;
                    if (!node ) {return ;}
                    if (!pNode) {
                        areaName = node.name;
                    } else {
                        if (pNode.name.indexOf('城区') >= 0 || pNode.name.indexOf('郊县') >= 0) {
                            var ppNode = pNode.getParentNode();
                            areaName = ppNode.name + node.name;
                        } else {
                            areaName = pNode.name + node.name;
                        }
                    }
                    _this.adminName=areaName;
                    _this.map.getBoundary(areaName, function (rs) {
                        _this.map.clear(); //清除地图覆盖物
                        var count = rs.boundaries.length; //行政区域的点有多少个
                        if (count === 0) {
                            return layer.msg('未能获取当前输入行政区域');
                        }
                        var pointArray = [];
                        for (var i = 0; i < count; i++) {
                            var ply = new BMap.Polygon(rs.boundaries[i], {
                                strokeWeight: 2,
                                strokeColor: "#ff0000"
                            }); //建立多边形覆盖物
                            //添加覆盖物
                            pointArray = pointArray.concat(ply.getPath());
                            _this.points='';
                            $.each(ply.getPath(),function(i,val){
                                _this.points+=val.lng+','+val.lat+','
                            });
                        }
                        _this.map.createOverlay(pointArray, 'line2');
                        layer.close(adminLay);
                    })
                },
                success: function () {
                    var _c={
                        data: {
                            key: {
                                name: 'name'
                            },
                            simpleData: {
                                enable: true,
                                pIdKey: 'pid'
                            }
                        },
                        view: {
                            showIcon: true
                        },
                        callback: {
                            onClick: function (event, treeId, NowtreeNode) {
                                var d=_this.adminTreeData;
                                if (NowtreeNode.check_Child_State >= 0) {return ;}
                                if (d== undefined) { return ;}
                                if (NowtreeNode.level == 0) {
                                    for (var i in d) {
                                        if (d[i].adcode == NowtreeNode.adcode) {
                                            var treeNodes = d[i].districts;
                                            _this.adminTree.addNodes(NowtreeNode, treeNodes);
                                            cityRows = treeNodes;
                                        }
                                    }
                                }
                                if (NowtreeNode.level == 1) {
                                    var pNode = NowtreeNode.getParentNode(),
                                        newNode, sNode;
                                    for (var i in d) {
                                        if (d[i].adcode == pNode.adcode) {
                                            newNode = d[i].districts;
                                            for (var j in newNode) {
                                                if (NowtreeNode.adcode == newNode[j].adcode) {
                                                    sNode = newNode[j].districts;
                                                    _this.adminTree.addNodes(NowtreeNode, sNode);
                                                    cityRows = treeNodes;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    };
                    $.ajax({
                        url: 'http://restapi.amap.com/v3/config/district?key=a1c3be6735ea724d2de25e3b3a0fbd15&subdistrict=3&extensions=base',
                        type: 'GET',
                        success: function (data) {
                            if (data.status == 1) {
                                _this.adminTreeData=data.districts[0].districts;
                                 _this.adminTree=$.fn.zTree.init($('#'+_this.adminTreeId), _c,  _this.adminTreeData);
                            }
                        }
                    });
                },end:function(){
                    $('#'+_this.adminBoxId).hide();
                }
            });
        },
        drawRail:function(type){
            var _this=this;
            _this.map.draw({
                "line": "line2",
                "flag": type
            }, function(e, overlay){
                var arr = e.overlay.getPath();
                _this.points = "";
                for (var i = 0; i < arr.length; i++) {
                    var p = arr[i];
                    _this.points += p.lng + "," + p.lat + ",";
                }
                if(type=='circle'){
                    _this.cirCenter=e.overlay.getCenter().lng+','+e.overlay.getCenter().lat;
                    _this.cirRadius=Math.floor(e.overlay.getRadius());
                }else{
                    _this.cirCenter='';
                    _this.cirRadius='';
                }
            });
        },
        selLinkage:function(opt){
            layui.formSelects.on(opt.clickSel, function(id, vals, val, isAdd, isDisabled){
            //id:点击select的id,vals:当前select已选中的值,val:当前select点击的值,isAdd:当前操作选中or取消,isDisabled当前选项是否是disabled
                var all,allStr=[],
                    _count=opt.count!==undefined ?opt.count:0,
                    testCfg=opt.cfg,
                    _alias=opt.keyName ?opt.keyName:'id';
                if(_count===1){
                    testCfg.data[_alias]=val.value;
                }else{
                    // if(isAdd){
                    //     all=vals.concat(val);
                    // }else{
                    //     $.each(vals,function(i,item){
                    //         if(item.val===val.val){
                    //             vals.splice(i,1);
                    //             return false;
                    //         }
                    //     });
                    //     all=vals;
                    // }
                    $.each(vals,function(i,item){
                        allStr.push(item.value);
                    });
                    testCfg.data[_alias]=allStr.join(',');
                }
                var cloneCfg=$.extend(true,{},app.ui.formSelectsCfg,{type:opt.type || "post",searchUrl:opt.url});
                var formCfg=$.extend(true,cloneCfg,testCfg);
                layui.formSelects.data(opt.linkSel,'server',formCfg);
            },true);
        },
        selectRender:function(cfg){//formSelects render
            var cloneCfg=$.extend(true,{},app.ui.formSelectsCfg,{type:cfg.type||'post',searchUrl:cfg.url});
            var formCfg=$.extend(true,cloneCfg,cfg);
            layui.formSelects.data(cfg.id,'server',formCfg);
        }
    };
    yy.autoform = function(cfg){
        return new Autoform(cfg);
    }
})(app.ui);
app.ui.util={
    cssMerge:function(cssCfg,defaultCss){//css合并
        if(cssCfg.css){
            var delArr = [];
            for(var idx in cssCfg.css){
                if($.inArray(cssCfg.css[idx],defaultCss)>=0){
                    delArr.push(idx);
                }
            }
            for(var idx=delArr.length-1;idx>=0;idx--){
                cssCfg.css.splice(idx,1);
            }
            return defaultCss.concat(cssCfg.css);
        }else{
            return defaultCss;
        }
    },
    btnRender:function(btnCfg,dom,defaultCss,prefix){//css合并
        for(var btnKey=0;btnKey<btnCfg.length;btnKey++){
            var btnCss = app.ui.util.cssMerge(btnCfg[btnKey],defaultCss);
            var btnId = prefix + btnCfg[btnKey]['name'];

            var btnHtml = '<button class="'+btnCss.join(' ')+'" id="'+btnId+'">'
                +btnCfg[btnKey]['title']+'</button>';
            $('.layui-btn-group',dom).append(btnHtml);
            if(btnCfg[btnKey]['handle']){
                var handle = btnCfg[btnKey]['handle'];
                $('#'+btnId,dom).bind('click',handle);
            }
        }
    }
};
app.ui.form={
    _cfg:{win:null},
    init:function(cfg){
        var btns = [],btnEvt = {};
        if(cfg.btns){
            for(var idx=0;idx<cfg.btns.length && cfg.btns[idx].handle;idx++){
                btns.push(cfg.btns[idx].title);
                if(idx==0){
                    btnEvt['yes'] = cfg.btns[idx].handle;
                }else{
                    btnEvt['btn'+(idx+2)] = cfg.btns[idx].handle;
                }
            }
        }
        var h = cfg.data.items.length*38+100,wh = $(window).height()-40;
        h = h>wh?wh:h;
        var _this = this;
        layer.open($.extend({
            type: 2, 
            area: ['500px', h+'px'],
            title:cfg.title || '表单信息',
            content: /* getContentPath()+ */cfg.url,
            btn:btns,
            anim:app.ui.anim,
            success: function(layero, index){
                var iframeWin = window[layero.find('iframe')[0]['name']];
                _this._cfg.win = iframeWin;
                if(!iframeWin.setData){
                    var _chkIfmTimer = setInterval(function(){
                        if(iframeWin.setData){
                            clearInterval(_chkIfmTimer);
                            iframeWin.setData(cfg.data);
                        }
                    }, 1000);
                }else{
                    iframeWin.setData(cfg.data);
                }
            }
        },btnEvt)); 
        return this;
    },
    initForm:function(){

    },
    setData:function(data){
        return this._cfg.win.setData(data);
    }
};
app.ui.search = {
    _cfg:{
        id:'',              //容器ID
        listStyle:'list',   //or 'select'
        allowEmpty:false,   //返回值是否允许空值
        items:[]    //渲染选项{label:'姓名',type:'input',name="userName"}
                    //dt:text、date
                    //qt:eq(等于)、ne(不等于)、gt(大于)、lt(小于),like(包含),in(多值),btw(范围)
    },
    /**
     * @param {object} cfg
     * @param {object} extraPra  存储额外的参数
     */
    init:function(cfg,extraPra){
        $.extend(this._cfg,cfg);
        var dom = extraPra ? extraPra.dom: $('#yui-search');
        $('.yy-m-search-title',dom).html(this._cfg.title);
        var items = this._cfg.items;
        var yfields = {};
        for(var i=items.length-1;i>=0;i--){
            var item = items[i],
                searchItem;
            if(item.dt=="sel"){//select
                searchItem= new Yselect(item,dom);
            }else{
                searchItem = new YInput(dom,item);
            }
            yfields[item.name] = searchItem;
        }
        this.fields = yfields;
        var btns = this._cfg.btns;
        app.ui.util.btnRender(btns,dom,['layui-btn','layui-btn-sm','layui-btn-primary'],'btnSearch_');
        return this;
    },
    getValue:function(fs){
        var result = {};
        if(fs){
            for(var idx in fs){
                result[fs[idx]] = this.fields[fs[idx]].getJson();
            }
        }else{
            for(var fieldName in this.fields){
                result[fieldName] = this.fields[fieldName].getJson();
            }
        }
        return result;
    },
    getValueQry:function(fs){
        var result = {},fvs=this.getValue(fs);
        for(var fieldName in fvs){
            $.extend(result,fvs[fieldName]);
        }
        if(!this._cfg.allowEmpty){
            for(var fieldName in result){
                if(null==result[fieldName] || result[fieldName]=='')delete result[fieldName];
            }
        }
        return result;
    },
    filterEmpty:function(result){
        for(var fieldName in result){

        }
    }
};
app.ui.tree = {
    _cfg:{
        data:{
            simpleData: {enable: true,idKey: "id",pIdKey: "pId",rootPId: 0},
            key:{name:'name'}
        },callback:{}//,check:{}
    },
    init:function(cfg){
        if(cfg.cfg)$.extend(true,this._cfg,cfg.cfg);
        var treeCfg = this._cfg,_this=this,loadFlag=0;
        this.loaded = false;
        var jsLoader = new YcyaLoader();
        jsLoader.loadFileList([/* getContentPath()+ */'/res/dep/zTree/css/zTreeStyle/zTreeStyle.css',
            /* getContentPath()+ */'/res/dep/zTree/js/jquery.ztree.all.js'],function(){
            if(!$("#yui-tree").hasClass("ztree"))$("#yui-tree").addClass("ztree");
            if(cfg.url && cfg.url!=''){
                ycya.http.ajax(cfg.url,{
                    data: cfg.where,
                    type: cfg.type || 'post',
                    success:function(data, textStatus, jqXHR){
                        if(data && data.code==0){
                            if(cfg.open){
                                for(var i=0;i< data.data.length;i++){
                                    data.data[i].open=true;
                                }
                            }
                            var zTreeObj = $.fn.zTree.init($("#yui-tree"), treeCfg, data.data);
                            _this.tree = zTreeObj;
                            _this.loaded = true;
                        }
                    },
                    error:function(jqXHR, textStatus, errorThrown){
                        layer.msg('tree data load err:'+textStatus);
                    }
                 });
            }else{
                var zTreeObj = $.fn.zTree.init($("#yui-tree"), treeCfg, cfg.data);
                _this.tree = zTreeObj;
                _this.loaded = true;
            }
        });
        return this;
    },
    getTree:function(){
        return this.tree;
    }
};
app.ui.left = {
    _cfg:{
        id:'',              //容器ID
        listStyle:'list',   //or 'select'
        allowEmpty:false,   //返回值是否允许空值
        items:[]    //渲染选项{label:'姓名',type:'input',name="userName"}
                    //dt:text、date
                    //qt:eq(等于)、ne(不等于)、gt(大于)、lt(小于),like(包含),in(多值),btw(范围)
    },
    init:function(cfg){
        $.extend(this._cfg,cfg);
        var dom = $('#yui-left');
        $('.yy-m-search-title',dom).html(this._cfg.title);
        var items = this._cfg.items;
        var yfields = {};
        for(var i=items.length-1;i>=0;i--){
            var item = items[i];
            var searchItem = new YInput(dom,item);
            yfields[item.name] = searchItem;
        }
        this.fields = yfields;
        var btns = this._cfg.btns;
        btns &&  app.ui.util.btnRender(btns,dom,['layui-btn','layui-btn-sm'],'btnLeft_');
        var leftHeight = $(window).height() - 84;
        $('#yui-left-nav').css('height',leftHeight+'px');
        $(window).resize(function(){
            var leftHeight = $(window).height() - 84;
            $('#yui-left-nav').css('height',leftHeight+'px');
        });
        var _this = this,
            leftType=this._cfg.body.view,
            c=this._cfg.body.cfg;
        if(leftType=='tree'){
            var treeCfg  = {_ref:_this};
            $.extend(treeCfg,c);
            var tree = app.ui.tree.init(treeCfg);
            this.tree = tree;
        }else if(leftType=='list'){
            if( c.url ){//服务器获取数据加载 ,url 与 option 共存时，加载url
                if(!c.name){layer.msg('list para error')}  
                ycya.http.ajax(c.url,{
                    data:c.data || {},
                    type:c.type || 'post',
                    success:function(data){
                        _this.list(data.data,c);                               
                    }
                })
            }else{
                _this.list(c.option,c); 
            }
        }
        return this;
    },
    getValue:function(fs){
        var result = {};
        if(fs){
            for(var idx in fs){
                result[fs[idx]] = this.fields[fs[idx]].getJson();
            }
        }else{
            for(var fieldName in this.fields){
                result[fieldName] = this.fields[fieldName].getJson();
            }
        }
        return result;
    },
    getValueQry:function(fs){
        var result = {},fvs=this.getValue(fs);
        for(var fieldName in fvs){
            $.extend(result,fvs[fieldName]);
        }
        if(!this._cfg.allowEmpty){
            for(var fieldName in result){
                if(null==result[fieldName] || result[fieldName]=='')delete result[fieldName];
            }
        }
        return result;
    },
    filterEmpty:function(result){
        for(var fieldName in result){}
    },
    list:function(result,c){
        var _list=[]; 
        $.each(result,function(i,item){
            var _liData={};
            for(var k=0;k<c.dataAttr.length;k++){
                _liData['data-'+c.dataAttr[k]]=item[c.dataAttr[k]];
            }
            if(!c.isCheck){
                _liData.html=item[c.name];
            }else{
                _liData.html='<i class="layui-icon icon-ok">&#xe605;</i>'+item[c.name];
            }
            _list.push($('<li/>',_liData)[0].outerHTML);
        });
        $('#yui-tree').attr('class','yui-left-list').html(_list.join(''));
        //绑定事件
        if(c.handle){
            $('#yui-tree').on('click','li',function(){  
                $(this).toggleClass('active').siblings('.active').removeClass('active');
                c.handle( $(this).attr('data-'+c.qry));
            }) ; 
        } 
    }
};
(function(au){
    var Grid=function(cfg){
        this._cfg={
            id:'ycyaGrid',   
            page:true,
            height:'full-104',
            request: {
                pageName: 'pageNo', //页码的参数名称，默认：page
                limitName: 'pageSize' //每页数据量的参数名，默认：limit
            },
            text: {none: '暂无相关数据'},
            limit: 20, //每页显示的条数
            limits: [10, 20, 50],
            method: 'post',
            where:{}
        };
    }
    Grid.prototype={
        init:function(cfg){
            var that=this;
            $.extend(this._cfg,cfg);
            var table = layui.table;
            if(cfg.btns){
                //捕获done事件
                this._cfg.done=function(res){
                    ycyaTableBtn(res,cfg.btns,cfg.parent);
                    cfg.hover && that.hoverOpenImg();
                }
            }
            this.tableIns =table.render(this._cfg);
            return this;
        },
        qry:function(qryCfg,extraPara){
            this._cfg.where = {};
            $.extend(this._cfg.where || {},qryCfg);
            var table = layui.table,
                aliasCfg=$.extend(true,{},this._cfg,extraPara);
            // table.render(aliasCfg);
            this.tableIns .reload(aliasCfg);
        },
        rowBtn:function(rowBtnCfg){
            var cssArr = app.ui.util.cssMerge(rowBtnCfg,['layui-btn','layui-btn-xs']);
            return '<a class="'+cssArr.join(' ')+'" lay-event="'+rowBtnCfg.event+'">'+rowBtnCfg.title+'</a>';
        },
        getRows:function(flag){//flag boolean ,true返回数据id集合
            if(!flag){
                return layui.table.checkStatus(this._cfg.id);
            }
            var ids=[];
            $.each(layui.table.checkStatus(this._cfg.id).data,function(i,item){
                item.id && ids.push(item.id);
            });
            return ids.join(',');
        },
        delRows:function(callback){
            var rows=layui.table.checkStatus(this._cfg.id);
            if(rows.data.length==0){
                return layer.msg('请勾选要删除的数据',{time:2000});
            }else{
                var ids=[];
                $.each(rows.data,function(i,item){
                    item.id && ids.push(item.id);
                });
                layer.confirm('确定删除?',function(index){
                    callback && callback(ids.join(','),index);
                });
            }
        },
        hoverOpenImg:function(){
            var img_show = null; // tips提示
            $('td img').hover(function(){
                var img = "<img class='img_msg' src='"+$(this).attr('src')+"' style='width:130px;' />";
                img_show = layer.tips(img, this,{
                    tips:[2, 'rgba(41,41,41,.5)']
                    ,area: ['160px']
                    ,time:80000
                });
            },function(){
                layer.close(img_show);
            });
            // $('td img').attr('style','max-width:70px');
        }
    };
    au.grid= {
        init:function(cfg){
            return new Grid().init(cfg);
        }
    };
    au.grid.qry= Grid.prototype.qry;
    au.grid.rowBtn= Grid.prototype.rowBtn;
    au.grid.getRows= Grid.prototype.getRows;
    au.grid.delRows= Grid.prototype.delRows;
    au.grid.hoverOpenImg= Grid.prototype.hoverOpenImg;
})(app.ui);

app.ui.page.list={
    init:function(cfg){
        if(cfg.title)document.title = cfg.title;//初始化title
        if(cfg.left)this.left = app.ui.left.init($.extend(cfg.left,{id:'yui-left'}));
        if(cfg.search)this.search = app.ui.search.init($.extend(cfg.search,{id:'yui-search'}));
        if(cfg.grid)this.grid = app.ui.grid.init($.extend(cfg.grid,{elem:'#yui-grid'}));
        return this;
    },
    getSearch:function(){return this.search;},
    getGrid:function(){return this.grid;},
    getLeft:function(){return this.left;},
    getTree:function(){return this.left.tree.getTree();}
}
//bind popup
app.ui.selected={
    init:function(cfg){
        this.choosed=[];
        var _title=$("<p/>",{height:22,text:cfg.title}),
            _box=$("<div/>",{height:98}),
            _div=$("<div/>",{id:'selectedRow',class:'yui-selected'});
            _box.append(_title.css({lineHeight:'22px'})).append(_div.css({height:76}));
        $('#yyGrid').prepend(_box);
        this._box=$('#selectedRow');
        this.name=cfg.item;
        return this;
    }
};
app.ui.selectedItem={
    init:function(cfg){
        if(!cfg || !cfg.sel || !cfg.row ){
            return layer.msg('selectedItem para error');
        }
        //判断传入的数据是否添加
        var sFlag=false;
        $.each(cfg.sel.choosed,function(i,item){
            if(item.id==cfg.row.id){
                sFlag=true;
                return false;
            }
        });
        if(!sFlag){//添加元素
            cfg.sel._box.append(this.create(cfg.sel,cfg.row,cfg.sel.name))
        }
    },
    create:function(s,row,names){
        var _i=$('<i/>',{'data-id':row.id,click:function(){
            var _this=this;
                $.each(s.choosed,function(i,item){
                    if(item.id==$(_this).attr('data-id')){
                        s.choosed.splice(i,1);
                        return false;
                    }
                });
                $(this).parent().remove();
            }}),
            _span=$('<span/>',{class:'item',html:row[names[0]]+'&nbsp;&nbsp;&nbsp;【'+row[names[1]]+'】'});
            s.choosed.push({
                id:row.id
            })
        return _span.append(_i);
    }
};
app.ui.bindRail={//一对一绑定,无显示选中部分
    open:function(cfg){
        if(!cfg.url){
            return layer.msg('url error or id error');
        }
        var _this=this;
        layer.open({
            type:2,
            title:cfg.title || '绑定围栏',
            area: ['500px','406px'],
            content:cfg.url,
            anim:app.ui.anim,
            success:function(layero,index){
                var body = layer.getChildFrame('body', index); 
                // $(body).find(".yy-m-search-item label").each(function(){
                //     $(this).hide();
                // });
                var iframeWin = $(layero).find('iframe')[0].contentWindow;
                iframeWin.returnGrid().qry(cfg.data,{url:cfg.gridUrl});
                _this.grid=iframeWin.returnGrid();
                cfg.selected && cfg.selected.id !==undefined &&  ($(body).find("input.dataId").val(cfg.selected.id));
                cfg.success && cfg.success();
            }
        });
        return this;
    }
};
app.ui.bindFalt={//一对多绑定,显示选中部分
    open:function(cfg){
        if(!cfg.url || !cfg.selected){
            return layer.msg('url error or id error');
        }
        layer.open({
            type:2,
            title:cfg.title || '绑定设备',
            area: ['500px','479px'],
            content:cfg.url,
            btn:['确定','取消'],
            anim:app.ui.anim,
            success:function(layero,index){
                var body = layer.getChildFrame('body', index); 
                // $(body).find(".yy-m-search-item label").each(function(){
                //     $(this).hide();
                // });
                var iframeWin = $(layero).find('iframe')[0].contentWindow;
                iframeWin.returnGrid().qry(cfg.data,{url:cfg.gridUrl});
                $(body).find("input.dataId").val(cfg.selected.id);
            },
            yes:function(index,layero){
                var s= $(layero).find('iframe')[0].contentWindow.returnSelected();
                var sarr=[];
                $.each(s.choosed,function(i,item){
                    sarr.push(item.id);
                });
                cfg.yes && cfg.yes(index,sarr);
            }
        })
    }
};
app.ui.page.bindpopup={
    init:function(cfg){
        this.cfg=cfg;
        if(cfg.search){this.search=app.ui.search.init(cfg.search,{dom:$('#pop-search')})}
        if(cfg.selected){this.selected=app.ui.selected.init(cfg.selected)}
        if(cfg.grid){this.tableGrid=app.ui.grid.init($.extend(cfg.grid,{height:cfg.selected?225:288,elem:'#pop-grid'}))}
        return this;
    },
    getGrid:function(){return this.tableGrid},
    getSearch:function(){return this.search},
    getSelected:function(){return this.selected},
};
//report
app.ui.reportTitle={
    _cfg:{
        bgClass:'yy-m-report-bg-gray',    //标题背景色 
        fClass:'yy-m-report-c-gray',  //标题字颜色 
        vClass:'', //值字体颜色
        item:[]  
        /* 
            name:''  ,    标题名称  *
            value:'' ,    值       
            unit:''  ,    值单位
            valueClass:'' 值颜色class  支持yy-m-report-c-gray blue red
        */
    },
    elmId:[],
    init:function(cfg){
        var c= $.extend({},this._cfg,cfg);
        if( $.type(c.item)!=='array' ||  c.item.length===0 ){
            return layer.msg('report para error');
        }
        var l=c.item.length,
            pw=1/l*100+'%',    
            titleArr=[];
        for(var i=0;i<l;i++){
           var  elm=c.item[i],
                v=elm.value!==undefined ?elm.value:0,    //值
                u=elm.unit? elm.unit:'',                   //单位
                vc=elm.vClass ?elm.vClass:'yy-m-report-c-blue',
                thisId='yui-report',
                str='<p class="yy-inline-block" style="width:'+pw+'">';
           str+='<span>'+elm.name+'</span><em class='+vc+' id='+thisId+i+'>'+v+'</em><i class='+vc+'>'+u+'</i></p>';
           this.elmId.push(thisId+i);
           titleArr.push(str);
        }
        $('#yui-report-title').attr('class',this._cfg.bgClass+' '+this._cfg.fClass+'  yy-m-report-title').html(titleArr.join(''));
        return this;
    },
    set:function(cfg){
        //注意 cfg数组顺序即为item数组顺序
        if(!cfg || $.type(cfg)!=='array'){
             return layer.msg('report set para error');
        }
        $.each(this.elmId,function(i,item){
            $('#'+item).text(cfg[i]);
        });
    }
};
app.ui.echarts={
    barlineCfg:{
        id:'yui-report-echart',              //容器ID
        type:'line',        //图标类型 line bar
        maxBarWidth:40,
        minBarWidth:12,
        colorList:['#ff2600', '#ffc000', '#00ad4e', '#0073c2', '#165868', '#e76f00', '#316194', '#723761', '#00b2f1', '#4d6022', '#4b83bf', '#f9c813', '#0176c0'], //统计图颜色
        stbackgrond:['#fff'], //统计图背景色
        datalName:[],  //数据题目
        valueJson:{},  //显示数值 {'接入率':[1,,2,3]}
        YMlegend:{
            lshow: true,//是否显示
            lalign: "center",//注解位置 center：居中  left：左 right：右
            lcolor: '#444', //字体颜色
            lorient: 'horizontal',//注解显示格式 horizontal,水平分布 vertical，垂直分布
            licon: 'circle',//注解前面图形 circle：园，triangle：三角形，diamond：菱形，rect：矩形,roundRect:圆角矩形
        },
        YMtitle:{      //标题
            tshow: true,      // 是否显示
            ttext: '',        //一级标题
            ttcolor: '#000',  //一级标题颜色
            ttfontsize: 16,   //一级标题大小
            tsubtext: '',     //二级标题
            tstcolor: '#333', //二级标题颜色
            tstfontsize: 14,  //二级标题字号
            txalign: 'left'   //位置 center 居中 left 局左 right 局右
        }, 
        dataxName:[],         //x轴name
        YMTtooltip:"",        //鼠标提示,加在头部
        YMBtooltip:"",        //鼠标提示,加在尾部
        xaxisClocr:['#333', '#666', '#444', '#f6f6f6', '#f6f6f6', '#fff'], //x轴线颜色 顺序为: 坐标轴、坐标轴小标记、具体数值、分割区域线 、间隔颜色
        yaxisClocr:['#333', '#666', '#444', '#f6f6f6', '#f6f6f6', '#fff'], //y轴线颜色 顺序为: 具体数值、坐标轴小标记、坐标轴、分割区域线 、间隔颜色
        YMxaxis : {  //X轴设置
            xrotate: 30,//字体倾斜角度
            xaxisLine: true,//坐标轴线
            xaxisTick: false,//坐标轴小标记
            xsplitLine: false,//分割区域线
            xaxisLabel: true, //y轴具体数值
            xmargin: 10,//标题与轴线距离
            xsplitArea: false,//间隔区域
        },
        YMyaxis :{ //Y轴设置
            yminInterval: 20, //最小刻度值
            yrotate: 60,//字体倾斜角度
            yaxisLine: true,//坐标轴线
            yaxisTick: false,//坐标轴小标记
            ysplitLine: false,//分割区域线
            yaxisLabel: true, //y轴具体数值
            ytextStyle: '#666',//y轴数值颜色
            yvalue: 'value',//y轴值
            ysplitArea: false,//间隔区域
            ymargin: 10,//标题与轴线距离
            yname:'',//y轴提示
        },
        // 多个y轴情况下（最多3个）第二根y轴
        YMsyaxis :{
            syshow:false,//是否显示
            syminInterval: 40, //最小刻度值
            syrotate: 60,//字体倾斜角度
            syaxisLine: true,//坐标轴线
            syaxisTick: true,//坐标轴小标记
            sysplitLine: false,//分割区域线
            syaxisLabel: true, //y轴具体数值
            sytextStyle: '#444',//y轴数值颜色
            syvalue: 'value',//y轴值
            sysplitArea: false,//间隔区域
            symargin: 10,//标题与轴线距离
            syname:'',//y轴提示
        },
        // 多个y轴情况下（最多3个）第三根y轴
        YMtyaxis : {
            tyshow:false,//是否显示
            tyminInterval: 20, //最小刻度值
            tyrotate: 60,//字体倾斜角度
            tyaxisLine: true,//坐标轴线
            tyaxisTick: false,//坐标轴小标记
            tysplitLine: false,//分割区域线
            tyaxisLabel: true, //y轴具体数值
            tytextStyle: '#444',//y轴数值颜色
            tyvalue: 'value',//y轴值
            tysplitArea: false,//间隔区域
            tymargin: 10,//标题与轴线距离
            tyname:'',//y轴提示
        } ,
        YMgrid:{   //统计图位置
            // 左、右、下、上 值可取0~100% 也可直接取数字
            gleft: '4%',
            gright: '4%',
            gbottom: 0,
            gtop:'10%',
        },
        YMtoolbar:{  // 工具栏
            itemSize: 14,   // 工具栏图标大小
            toorshow: true, //工具栏是否显示 true  false
            magicType: true, //统计类型切换是否显示 true false
            restore: true,    //刷新是否显示  true false
            saveAsImage: true, //保存是否显示 true false
            dataView: true, //是否显示数据视图
            type: ['line', 'bar', 'stack', 'tiled']  //统计图切换类型 line：折线  bar 柱状图 stack：堆砌显示 tited：分类显示 必须在magicType为true时使用
        },
        YMdataZoom:{
            dzshow:false, //是否出现
            dzend:90,//滑块开始位置
            dzheight:26,//高度
            dzfillerColor:'rgba(167,183,204,0.4)',//选中区域颜色
            dzbackgroundColor:'rgba(47,69,84,0)',//整体的背景色 
        }
    },
    barlineInit:function(cfg){
        $.extend(true,this.barlineCfg,cfg);
        var bl=this.barlineCfg,
            _this=this;
        this.blChart = echarts.init( document.getElementById( bl.id) );
            option = {
            // 各统计注解
                legend: {
                    show: bl.YMlegend.lshow,
                    type: 'scroll',
                    orient: bl.YMlegend.lorient,
                    icon:  bl.YMlegend.licon,
                    data: bl.datalName,
                    align: 'left',
                    x:bl.YMlegend.lalign,
                    textStyle: {
                    color: bl.YMlegend.lcolor,
                    fontSize: 14,
                    },
                    itemWidth: 20,
                    itemHeight: 10
            },
            // 统计图背景色
            backgroundColor: bl.stbackgrond,
            //统计图名称
            title: {
                x: bl.YMtitle.txalign,
                show: bl.YMtitle.tshow,
                text: bl.YMtitle.ttext,
                textStyle: {
                    fontSize: bl.YMtitle.ttfontsize,
                    color: bl.YMtitle.ttcolor
                },
                subtext: bl.YMtitle.tsubtext,
                subtextStyle: {
                    fontSize: bl.YMtitle.tstfontsize,
                    color: bl.YMtitle.tstcolor
                }
            },
            // 各统计颜色
            color: bl.colorList,
            // 鼠标移入显示
            tooltip: {
                trigger: 'axis',
                backgroundColor: '#fff',
                borderWidth: 1,
                borderColor: '#ccc',
                padding: 10,
                textStyle: {
                    color: '#000'
                },
                axisPointer: {
                    type: 'shadow'
                },
                formatter: function (params) {
                    {
                        var relVal = bl.YMTtooltip + params[0].name + "<br/>";
                        for (j = 0; j < params.length; j++) {
                            relVal += params[j].seriesName + ' : ' + params[j].value + "<br/>";
                        }
                        return relVal+bl.YMBtooltip;
                    }
                }
            },
            // 工具栏视图
            toolbox: {
                itemSize: bl.YMtoolbar.itemSize,
                feature: {
                    dataView: { show: bl. YMtoolbar.dataView },
                    magicType: {
                        show: bl.YMtoolbar.magicType,
                        type: bl.YMtoolbar.type //折线图与柱状图转化 堆砌与分散
                    },
                    restore: {
                        show: bl.YMtoolbar.restore  //刷新
                    },
                    saveAsImage: {
                        show: bl.YMtoolbar.saveAsImage //保存
                    }
                }
            },
            // 控制显示个数
            dataZoom: [
                {
                    height:bl.YMdataZoom.dzheight,
                    type: 'slider',
                    show:bl.YMdataZoom .dzshow,
                    fillerColor:bl.YMdataZoom.dzfillerColor,
                    start: 0,
                    end: bl.YMdataZoom.dzend,
                    handleSize: 0,
                    backgroundColor:bl.YMdataZoom.dzbackgroundColor//背景色
                }
            ],
            //统计图位置
            grid: {
                left: bl.YMgrid.gleft,
                right: bl.YMgrid.gright,
                bottom: bl.YMgrid.gbottom,
                top: bl.YMgrid.gtop,
                containLabel: true
            },
            xAxis:[{
                show:true,
                type: 'category',
                data: [], //bl.dataxName
                axisLine: {
                    show: bl.YMxaxis.xaxisLine,
                    lineStyle: {
                        color: bl.xaxisClocr[0],
                        width: 1,
                        type: "solid"
                    }
                },
                axisTick: {
                    show: bl.YMxaxis.xaxisTick,
                    lineStyle: {
                        color: bl.xaxisClocr[1]
                    }
                },
                axisLabel: {
                    show: bl.YMxaxis.xaxisLabel,
                    margin: bl.YMxaxis.xmargin,
                    rotate: bl.YMxaxis.xrotate,
                    textStyle: {
                        color: bl.xaxisClocr[2]
                    }
                },
                splitLine: {
                    show: bl.YMxaxis.xsplitLine,
                    textStyle: {
                        color: bl.xaxisClocr[3]
                    }
                },
                splitArea: {
                    show: bl.YMxaxis.xsplitArea,
                    areaStyle: {
                        color: [bl.xaxisClocr[4],bl.xaxisClocr[5]]
                    }
                }
            }],
            yAxis: [
                {
                min: 0,
                minInterval: bl.YMyaxis.yminInterval,
                    type:bl.YMyaxis.yvalue,
                name:bl.YMyaxis.yname,
                axisLabel: {
                    margin: bl.YMyaxis.ymargin,
                    rotate: bl.YMyaxis.yrotate,
                    textStyle: {
                        color: bl.yaxisClocr[0]
                    }
                },
                axisTick: {
                    show: bl.YMyaxis.yaxisTick,
                    lineStyle: {
                        color: bl.yaxisClocr[1]
                    }
                },
                axisLine: {
                    show: bl.YMyaxis.yaxisLine,
                    lineStyle: {
                        color: bl.yaxisClocr[2]
                    }
                },
                splitLine: {
                    show: bl.YMyaxis.ysplitLine,
                    lineStyle: {
                        color: bl.yaxisClocr[3]
                    }
                },
                splitArea: {
                        show: bl.YMyaxis.ysplitArea,
                        areaStyle: {
                            color:[ bl.yaxisClocr[4], bl.yaxisClocr[5]]
                        }
                    }  
            },
            // 第二根坐标轴
            {
                show:bl.YMsyaxis.syshow,
                name:bl.YMsyaxis.syname,
                min: 0,
                minInterval: bl. YMsyaxis.syminInterval,
                type: bl.YMsyaxis.syvalue,
                position:'right',
                axisLabel: {
                    margin: bl.YMsyaxis.symargin,
                    rotate: bl.YMsyaxis.syrotate,
                    textStyle: {
                        color: bl.yaxisClocr[0]
                    }
                },
                axisTick: {
                    show: bl.YMsyaxis.syaxisTick,
                    lineStyle: {
                        color: bl.yaxisClocr[1]
                    }
                },
                axisLine: {
                    show: bl.YMsyaxis.syaxisLine,
                    lineStyle: {
                        color: bl.yaxisClocr[2]
                    },
                },
                splitLine: {
                    show: bl.YMsyaxis.sysplitLine,
                    lineStyle: {
                        color: bl.yaxisClocr[3]
                    },
                },
                splitArea: {
                        show: bl.YMsyaxis.sysplitArea,
                        areaStyle: {
                            color: [bl.yaxisClocr[4], bl.yaxisClocr[5]]
                        }
                    }              
            }
                // 第三根坐标轴
            //      {
            //        show:bl.YMtyaxis.tyshow,
            //        minInterval: bl.YMsyaxis.syminInterval,
            //        type: bl.YMtyaxis.tyminInterval,
            //        position:'right',
            //        name:bl.YMtyaxis.tyname,
            //        offset: 80,
            //        axisLabel: {
            //            margin: bl.YMtyaxis.tymargin,
            //            rotate: bl.YMtyaxis.tyrotate,
            //            textStyle: {
            //                color: bl.yaxisClocr[0]
            //            }
    
            //        },
            //        axisTick: {
            //            show: bl.YMtyaxis.tyaxisTick,
            //            lineStyle: {
            //                color: bl.yaxisClocr[1]
            //            }
            //        },
            //        axisLine: {
            //            show: bl.YMtyaxis.tyaxisLine,
            //            lineStyle: {
            //                color: bl.yaxisClocr[2]
            //            },
            //        },
            //        splitLine: {
            //            show: bl.YMtyaxis.tysplitLine,
            //            lineStyle: {
            //                color: bl.yaxisClocr[3]
            //            },
            //        },
            //        splitArea: {
            //             show: bl.YMtyaxis.tysplitArea,
            //             areaStyle: {
            //                 color: [bl.yaxisClocr[4],bl.yaxisClocr[5]]
            //             }
            //         } 
            //    }
            ],
            // 具体数值
            series:[] //seriesList
            };
        this.blChart .setOption(option);
        this.blChart .showLoading();
        $(window).resize(function(){
            _this.blChart .resize();
        }).resize();
        return this;
    },
    barlineSet:function(dName,valJson){
        var bl=this.barlineCfg;
         //处理数据，展示题目
         valJson && ( bl.datalName.length=0);
         for(var key in valJson){
            bl.datalName.push(key);
        }
        //处理数据成echart格式
        var seriesList=[];
        //处理barWidth
        var viewWh=$('#'+bl.id).width()*(1-parseInt( bl.YMgrid.gleft)/100- parseInt(bl.YMgrid.gright)/100 )/* -160 */,//160为默认间距
            oneWh=viewWh/ dName.length,
            // oneBarWh=(oneWh-40)/bl.datalName.length; 
            oneBarWh=(oneWh/bl.datalName.length-0.9)/2.9; 
            // var bwh=Math.ceil(bl.minBarWidth*1.3)*bl.datalName.length,
            var bwh=Math.ceil(bl.minBarWidth*1.3*bl.datalName.length+bl.minBarWidth*0.3),
                bbnumber=parseInt(viewWh/bwh),
                dataZoom_end,
                bwh_max=Math.ceil(bl.maxBarWidth*1.3*bl.datalName.length+bl.minBarWidth*0.3);
            if (dName.length > bbnumber) {
                dataZoom_end = 100 - ((dName.length -bbnumber+1) / dName.length) * 100;
            } else {
                dataZoom_end = 90;
            }
            var flag;
        for(var i=0;i< bl.datalName.length;i++){
            var oneItem={
                name: bl.datalName[i],
                type:bl.type,
                data:valJson[bl.datalName[i]]
            };
            if(bl.type=="line"){
                oneItem.symbol='circle';//拐点样式
                oneItem.symbolSize= 6;//拐点大小
                oneItem.smooth=true;  //设置平滑
            }
            if(oneBarWh<bl.minBarWidth){
                oneItem.barWidth=bl.minBarWidth;
                flag=true;
            }else if(oneBarWh>bl.maxBarWidth){
                oneItem.barWidth=bl.maxBarWidth;
            }else{
                oneItem.barWidth=Math.ceil(oneBarWh);
            }
            seriesList.push(oneItem);
        }
        var op={
            xAxis:[{
                data:dName
            }],
            dataZoom:[{
                show:bl.YMdataZoom .dzshow,
                end:100
            }],
            series:seriesList
        };
        if(bwh>oneWh){
            op.dataZoom[0].show=true;
            op.dataZoom[0].end=dataZoom_end;
        }
        // if(bwh>oneWh){
        //     op.dataZoom[0].show=true;
        //     op.dataZoom[0].end=dataZoom_end;
        // }
        this.blChart.setOption(op);
        this.blChart.hideLoading();
    },
    pieCfg:{
        id:'yui-report-echart', 
        valueJson:[],
        //统计图颜色
        YMPcolorList :['#ffc000', '#00ad4e', '#0073c2', '#165868', '#e76f00', '#316194', '#723761', '#00b2f1', '#4d6022', '#4b83bf', '#f9c813', '#0176c0'],
        //统计图背景色
        YMPstbackgrond : ['#fff'],
        // 各统计注解
        YMPlegend :{
            lshow: true,//是否显示
            lalign: 'center',//注解位置 center：居中  left：左 right：右
            lcolor: '#444', //字体颜色
            lorient: 'vertical',//注解显示格式 horizontal,水平分布 vertical，垂直分布
            licon: 'circle',//注解前面图形 circle：园，triangle：三角形，diamond：菱形，rect：矩形,roundRect:圆角矩形
            ldata:[],
            lyalign: 'center'//垂直位置
        },
        //题目
        YMPtitle : {
            tshow: true,// 是否显示
            ttext: '',//一级标题
            ttcolor: '#444',//一级标题颜色
            ttfontsize: 16,//一级标题大小
            tsubtext: '',//二级标题
            tstcolor: '#666',//二级标题颜色
            tstfontsize: 14,//二级标题字号
            txalign: 'left'//位置 center 居中 left 局左 right 局右
        },

        // 需要居中显示具体数据与题目 环形图可以使用 饼状图不建议使用
        YMPtotaltitle :{
            totalshow: false,
            totalnshow: false,
            totaltext: '',  //题目
            totaltextsize: 14, //题目大小
            totalnumber: '', //总数值
            totalnumbersize: 26, //数值大小
            totalColor: ["#999", '#333'] //居中值颜色设置 前为标题 后为数值
        },
        //鼠标提示
        YMPtooltip :{
            YMPTtooltip: "",//加在头部
            YMPBtooltip: "",//加在尾部
            YMPcontent: '{b}:{c}({d}%)'
        },
        //控制图形
        YMPseries : {
            sname: '',
            sradius: ["0%", "70%"], //控制图形类型 取值0~100%（控制0~80%） 当前值为0%时 为饼状图 其他为环形图（推荐取值在前后差20）页可为具体数值
            slabelshow: false, //是否需要外部显示
            sastyle: ['', '16'], //百分比数值的颜色与字号行高 颜色传空时 字体颜色对应每部分颜色
            sbstyle: ['', '14'], //数值标题的颜色与字号行高 颜色传空时 字体颜色对应每部分颜色
            scstyle: ['', '18'], //具体数值标题的颜色与字号行高 颜色传空时 字体颜色对应每部分颜色
            scontent: '{a}{c}{a|{d}%}\n{b|{b}}' //外围显示值'{c}{a|{d}%}\n{b|{b}}' c 选项具体数值 d 百分比 b 选项 a 为标题(sname)
        },
        // 工具栏
        YMPtoolbar : {
            itemSize: 14,   // 工具栏图标大小
            toorshow: true, //工具栏是否显示 true  false
            restore: true,    //刷新是否显示  true false
            saveAsImage: true, //保存是否显示 true false
            dataView: true //是否显示数据视图
        }
    },
    pieInit:function(cfg){
        var _this=this;
        $.extend(true,this.pieCfg,cfg);
        var pie=this.pieCfg;
        this.pieChart = echarts.init( document.getElementById( pie.id) );
        var option = {
            color: pie.YMPcolorList, // 各统计颜色
            legend: {// 各统计注解
                show: pie.YMPlegend.lshow,
                type: 'scroll',
                orient: pie.YMPlegend.lorient,
                icon: pie.YMPlegend.licon,
                data: pie.YMPlegend.ldata,
                align: 'left',
                x: pie.YMPlegend.lalign,
                y: pie.YMPlegend.lyalign,
                textStyle: {
                    color: pie.YMPlegend.lcolor,
                    fontSize: 14
                },
                itemWidth: 20,
                itemHeight: 10
            },
            backgroundColor: pie.YMPstbackgrond, // 统计图背景色
            title: [  //统计图名称
                {
                    show: pie.YMPtitle.tshow,
                    x: pie.YMPtitle.txalign,
                    text: pie.YMPtitle.ttext,
                    textStyle: {
                        fontSize: pie.YMPtitle.ttfontsize,
                        color: pie.YMPtitle.ttcolor
                    },
                    subtext: pie.YMPtitle.tsubtext,
                    subtextStyle: {
                        fontSize: pie.YMPtitle.tstfontsize,
                        color: pie.YMPtitle.tstcolor
                    }
                },
                // 需要中间出现值
                {
                    show: pie.YMPtotaltitle.totalshow,
                    text: pie.YMPtotaltitle.totaltext,
                    left: '49%',
                    top: '46%',
                    textAlign: 'center',
                    textBaseline: 'middle',
                    textStyle: {
                        color: pie.YMPtotaltitle.totalColor[0],
                        fontWeight: 'normal',
                        fontSize: pie.YMPtotaltitle.totaltextsize
                    }
                },
                {
                    show: pie.YMPtotaltitle.totalnshow,
                    text: pie.YMPtotaltitle.totalnumber,
                    left: '49%',
                    top: '51%',
                    textAlign: 'center',
                    textBaseline: 'middle',
                    textStyle: {
                        color: pie.YMPtotaltitle.totalColor[1],
                        fontWeight: 'normal',
                        fontSize: pie.YMPtotaltitle.totalnumbersize
                    }
                }
            ],
            // 鼠标移入显示
            tooltip: {
                trigger: 'axis',
                backgroundColor: '#fff',
                borderWidth: 1,
                borderColor: '#ccc',
                padding: 10,
                textStyle: {
                    color: '#000'
                },
                axisPointer: {
                    type: 'shadow'
                },
                trigger: 'item',
                formatter: pie.YMPtooltip.YMPTtooltip + pie.YMPtooltip.YMPcontent + pie.YMPtooltip.YMPBtooltip
            },
            // 工具栏视图
            toolbox: {
                itemSize: pie.YMPtoolbar.itemSize,
                feature: {
                    dataView: { show: pie.YMPtoolbar.dataView },
                    restore: {
                        show: pie.YMPtoolbar.restore  //刷新
                    },
                    saveAsImage: {
                        show: pie.YMPtoolbar.saveAsImage //保存
                    }
                }
            },
            series:[
                {
                name: pie.YMPseries.sname,
                type: 'pie',
                radius: pie.YMPseries.sradius,
                labelLine: {
                    normal: {
                        length: 20,
                        length2: 80,
                        lineStyle: {
                            color: '#333'
                        }
                    }
                },
                label: {
                    normal: {
                        show: pie.YMPseries.slabelshow,
                        formatter: pie.YMPseries.scontent,
                        borderWidth: 0,
                        borderRadius: 4,
                        padding: [0, 12],
                        textStyle: {
                            color: pie.YMPseries.scstyle[0],
                            fontSize: pie.YMPseries.scstyle[1]
                        },
                        rich: {
                            a: {
                                color: pie.YMPseries.sastyle[0],
                                fontSize: pie.YMPseries.sastyle[1],
                                padding: [0, 0, 0, 6]
                            },
                            b: {
                                fontSize: pie.YMPseries.sbstyle[1],
                                padding: 4,
                                color: pie.YMPseries.sbstyle[0]
                            }
                        }
                    }
                },
                data:[]//pie.valueJson 
            }
            ] 
        };
        this.pieChart.setOption(option);
        this.pieChart.showLoading();
        $(window).resize(function(){
            _this.pieChart.resize();
        }).resize();
        return this;
    },
    pieSet:function(vJson){
        var pie=this.pieCfg,
            dataNumberkey=[];
        for(var key in vJson){
            dataNumberkey.push(vJson[key].name);
        } 
        this.pieChart.setOption({
            legend:{
                data:dataNumberkey
            },
            series:[
                {
                name: pie.YMPseries.sname,
                type: 'pie',
                radius: pie.YMPseries.sradius,
                labelLine: {
                    normal: {
                        length: 20,
                        length2: 80,
                        lineStyle: {
                            color: '#333'
                        }
                    }
                },
                label: {
                    normal: {
                        show: pie.YMPseries.slabelshow,
                        formatter: pie.YMPseries.scontent,
                        borderWidth: 0,
                        borderRadius: 4,
                        padding: [0, 12],
                        textStyle: {
                            color: pie.YMPseries.scstyle[0],
                            fontSize: pie.YMPseries.scstyle[1],
                        },
                        rich: {
                            a: {
                                color: pie.YMPseries.sastyle[0],
                                fontSize: pie.YMPseries.sastyle[1],
                                padding: [0, 0, 0, 6]
                            },
                            b: {
                                fontSize: pie.YMPseries.sbstyle[1],
                                padding: 4,
                                color: pie.YMPseries.sbstyle[0]
                            }
                        }
                    }
                },
                data:vJson
            }
            ] 
        });
        this.pieChart.hideLoading();
    }
};
app.ui.reportSearch={
    _cfg:{
        yearNum:2,          //显示的年的个数
        quickQuery:[
            {name:'月统计数据',handle:function(){}},
            {name:'年统计数据',handle:function(){}}
        ],                //快捷查询
        allowEmpty:false, //查询条件中是否允许空值
        item:[],
        /* 
            { type:'input',         默认input ,支持input select
              name:'',
              label:'',
              click:function(){},         input点击函数
              change:function(){},        select change事件
              option:{'value':'name' },   select本地加载选项,value即为option的value, name即为option的name 
              dt:text、date ,               
              qt:eq(等于)、ne(不等于)、gt(大于)、lt(小于),like(包含),in(多值),btw(范围)
            }
        */
        ready:function(){},         //查询元素加载完成
        conditionQuery:{
            show:true, //是否显示条件查询
            iconClass:''
        },
        isQry:true,             
        yearQuery:true,
        yearQueryBack:true,     //今年往前
        monthQuery:true,
        start:'00:00:00',
        end:'23:59:59',
        refreshFn:function(arg){}  //请求函数
    },
    init:function(cfg){
        if(cfg){ $.extend(/* true, */this._cfg,cfg);}
        var c=this._cfg,
            _box=$('<div class="yy-m-report-search"></div>'),
            _quickQuery=$('<ul class="yy-m-report-quickQuery yy-lf"></ul>'),  //快捷查询
            _customQuery=$('<ul class="yy-m-report-customQuery yy-lf"></ul>');//自定义查询   
        for(var i=0;i<c.quickQuery.length;i++){
            _quickQuery.append( $('<li class="yy-lf">'+c.quickQuery[i].name+'</li><li class="line"></li>'));
        }
        _customQuery.append( $('<li class="yy-lf">自定义查询</li><li class="line yy-lf"></li>') ); 
        _box.append(_quickQuery).append(_customQuery);
        if(c.yearQuery){//年查询
            var  _yearQuery=$('<ul class="yy-m-report-yearQuery yy-lf"></ul>'),    
                _nowYear=new Date().getFullYear();
                this.activeY=_nowYear;
            if( c.yearQueryBack){
                for(var i=c.yearNum-1;i>=0;i--){
                    var _class=i===0?['yy-lf', 'active']:['yy-lf'];
                    _yearQuery.append($('<li class="'+_class.join(' ')+'">'+(_nowYear-i)+'</li>'));
                }
            }else{
                for(var i=0;i<c.yearNum;i++){
                    var _class=i===0?['yy-lf', 'active']:['yy-lf'];
                    _yearQuery.append($('<li class="'+_class.join(' ')+'">'+(_nowYear+i)+'</li>'));
                }
            }    
            _box.append(_yearQuery);
        } 
        if(c.monthQuery){//月查询
            var _monthQuery=$('<ul class="yy-m-report-monthQuery yy-lf"></ul>'),
                _nowMonth=new Date().getMonth()+1;
                this.activeM=_nowMonth<10?'0'+_nowMonth:_nowMonth;
            for(var i=1;i<13;i++){
                var _class= i===_nowMonth?['yy-lf','active']:['yy-lf'];
                _monthQuery.append($('<li class="'+_class.join(' ')+'">'+i+'</li>'));
            }
            _box.append(_monthQuery);
        } 
        if(c.conditionQuery.show){//条件查询
            var _conditionQuery=$('<ul class="yy-m-report-conditionQuery yy-rt"></ul>'),
                _li=$('<li>条件查询</li>');
            if(c.conditionQuery.iconClass){
                _li.append( $('<span class='+iconClass+'></span>'));
            }
            _conditionQuery.append(_li); 
            _box.append(_conditionQuery);
        } 
        $('#yui-report-search').append(_box);
        this.condition=$('.yy-m-report-conditionQuery>li');
        this.quick=$('.yy-m-report-quickQuery>li');
        this.custom=$('.yy-m-report-customQuery>li');
        if(c.yearQuery){
            this.year=$('.yy-m-report-yearQuery>li');
            this.yearHandler();
        }
        if(c.monthQuery){ 
            this.month=$('.yy-m-report-monthQuery>li');
            this.monthHandler();
        }
        // if(!cfg.quickQuery){ //快捷查询
        this.quickHandler();
        // }else{}
        this.customHandler();     //自定义查询
        this.conditionHandler();  //条件查询
        this.formInit();
        return this;
    },
    formInit:function(){
        this.searchItem=$('#yui-report-search-list');
        this.selectRender=[];
        this.selectRenderCfg=[];
        var _this=this,
            elm=this._cfg.item,
            _dom=this.searchItem,
            fields={}; 
        for(var i=elm.length-1;i>=0;i--){
           var  e=elm[i],
                _type=e.type || 'input';
           if(_type==='input'){
                fields[e.name] =new YInput(_dom,e);
                if(e.qt=='btw'){
                    _this.timeArr=['qry_'+e.name+'_gt','qry_'+e.name+'_lt'];
                }
           }else{
                var _div=$("<div/>",{class:'yy-m-search-item'}),
                    _label=$('<label>'+e.label+'</label>'),
                    _select=$("<select/>",{id:'qry_'+e.name+'_in',class:'layui-select',name:e.name});
                    _div.append(_label);
                if(e.render){
                    this.selectRender.push(e.name);
                    this.selectRenderCfg.push( e.cfg || {});
                }
                if(e.cfg){
                   (function(e){//保存e
                        ycya.http.ajax(e.cfg.url,{
                            type:e.cfg.type || 'post',
                            data:e.cfg.where,
                            success:function(data){
                                var d=e.cfg.beforeSuccess?e.cfg.beforeSuccess(data):data.data,
                                    keyName=e.cfg.keyName ?e.cfg.keyName :'name',
                                    valName=e.cfg.valName ?e.cfg.valName :'id';
                                for(var key in d){
                                    _select.append( $('<option value='+d[key][valName]+'>'+d[key][keyName]+'</option>') );
                                }
                            }
                        });
                   })(e);
                }    
                if(e.option && !e.cfg){
                    for(var key in e.option){
                        _select.append( $('<option value='+key+'>'+e.option[key]+'</option>') );
                    }
                }
                _div.append(_select);
                fields[e.name] =_select;
                $('.yy-m-search',_dom).append(_div);
           }
        }
        this.fields=fields;
        $('.yy-m-search',_dom).append( $('<button/>',{class:'layui-btn layui-btn-sm layui-btn-normal',text:'确定',click:function(){
            //时间判断
            var flag=false;
            if(_this.timeArr && $('#'+_this.timeArr[0]).parent().parent().css('display')!='none'){
                if( $.trim( $('#'+_this.timeArr[0]).val() )=='' ||  $.trim( $('#'+_this.timeArr[1]).val() )=='' ){
                    flag=true;
                    layer.msg('请选择时间段',{time:2000});
                }
            }
            if(flag){return ;}
            var r=_this.getValue( );
            _this.request( _this._cfg.refreshFn, r);
        }}));
        this._cfg.ready();
    },
    formReset:function(){
        this.ids=this.ids || [];
        if(this.ids.length==0){
            for(var key in this.fields){
                if(this.fields[key].id){
                    this.ids.push(this.fields[key].id[0]);
                    if(this.fields[key].id.length>1){
                        this.ids.push(this.fields[key].id[1]) ;
                        this.timeArr=[this.fields[key].id[0],this.fields[key].id[1]];
                    }
                }else{
                    this.ids.push(this.fields[key][0].id);
                }
            }
        }
        for(var i=0;i<this.ids.length;i++){
            $('#'+this.ids[i]).val('').removeAttr('keyid');
        }
    },
    getValue:function(){
        var result={};
            this.ids=this.ids || [];
        if(this.ids.length==0){
            for(var key in this.fields){
                if(this.fields[key].id){
                    this.ids.push(this.fields[key].id[0]);
                    if(this.fields[key].id.length>1){
                        this.ids.push(this.fields[key].id[1]) ;
                    }
                }else{
                    this.ids.push(this.fields[key][0].id);
                }
            }
        }    
        for(var i=0;i<this.ids.length;i++){
            var v=$('#'+this.ids[i]).attr('keyid') || $('#'+this.ids[i]).val();
            if(this._cfg.isQry){
                result[this.ids[i]]=v;
            }else{
                result[valueId[i]]=v;
            }
        }
        if(!this._cfg.allowEmpty){
            for(var key in result){
                if(result[key]==''){
                    delete result[key];
                }
            }
        }
        return  result;
    },
    yearHandler:function(){
        if(this.year){
            var _this=this;
            this.year.click(function(){
                _this.clickFlag='year';
                $(this).addClass('active').siblings('.active').removeClass('active');
                _this.activeY=$(this).text();
                _this.request( _this._cfg.refreshFn );
            });
        }
    },
    monthHandler:function(){
        if(this.month){
            var _this=this;
            this.month.click(function(){
                _this.clickFlag='month';
                $(this).addClass('active').siblings('.active').removeClass('active');
                _this.activeM=$(this).text()-0<10? '0'+$(this).text():$(this).text();
                _this.request( _this._cfg.refreshFn );
            });
        }
    },
    quickHandler:function(){
        var _this=this;
        this.quick.click(function(){
            var _m=$('.yy-m-report-monthQuery'),
                ind=$(this).index();
                $(_this.year[0]).parent().fadeIn(100);
            if( ind===2){//年
                _this.clickFlag='year';
                if(_m.length>0){
                    _m.fadeOut(100,function(){
                        _this.request( _this._cfg.refreshFn );
                    });
                }
            }else if(ind===0){  //月
                _this.clickFlag='month';
                if(_m.length>0){
                    _m.fadeIn(100,function(){
                        _this.request( _this._cfg.refreshFn );
                    });
                }
            }
            _this.searchItem.hide(400);
            _this.condition.each(function(){
                if( $(this).hasClass('active')){$(this).removeClass('active')}
            });
            $(this).addClass('active').siblings('.active').removeClass('active');
            $.each(_this.custom,function(){
                if($(this).hasClass('active')){
                    $(this).removeClass('active');
                    return false;
                }
            });
            _this.formReset();
        });
    },
    conditionHandler:function(){
        var _this=this;
        this.condition.click(function(){
            $(this).toggleClass('active');
            _this.searchItem.find('.yy-m-search-item>div').each(function(){
                if($(this).find('input').length>1){
                    $(this).parent().hide(); 
                }
            });
            //搜索条件显示/隐藏
            if( $(this).hasClass('active')){
                _this.searchItem.show();
            }else{
                _this.searchItem.hide();
            }
            //年月显示/隐藏
            var flag;// 0月 1年 2自定义
            $.each(_this.custom,function(){
                if( $(this).hasClass('active')){
                    flag=3;
                    return false;
                }
            });
            if(flag==3){
                $('.yy-m-report-yearQuery').fadeIn(100);
                $('.yy-m-report-monthQuery').fadeIn(100);
            }else{
                if(_this.clickFlag=='year'){
                    $('.yy-m-report-yearQuery').fadeIn(100);
                }else{
                    $('.yy-m-report-monthQuery').fadeIn(100);
                }
            }
        });
    },
    customHandler:function(){
        var _this=this;
        this.custom.click(function(){
            $(this).addClass('active').siblings('.active').removeClass('active');
            $.each(_this.quick,function(){
                if($(this).hasClass('active')){
                    $(this).removeClass('active');
                    return false;
                }
            });
            _this.searchItem.find('.yy-m-search-item>div').each(function(){
                if($(this).find('input').length>1){
                    $(this).parent().show(); 
                }
            });
             //搜索条件显示/隐藏
             if( $(this).hasClass('active')){
                _this.searchItem.show();
            }else{
                _this.searchItem.hide();
            }
            if(_this.year){
                $(_this.year[0]).parent().fadeOut(100);
            }
            if(_this.month){
                $(_this.month[0]).parent().fadeOut(100);
            }
        });
    },
    request:function(callback,extraPra){
            var stime,etime;
            if(this.clickFlag==='year'){
                stime=this.activeY+'-01-01 '+this._cfg.start;
                etime=this.activeY+'-12-31 '+this._cfg.end;
            }else{
                stime=this.activeY+'-'+this.activeM+'-01 '+this._cfg.start;
                etime=this.activeY+'-'+this.activeM+'-'+this.getMonthDays(this.activeY,this.activeM)+' '+ this._cfg.end  ;
            }
            //获取事件字段名
            var s=(this.timeArr && this.timeArr[0]) || 'stime',
                e=(this.timeArr && this.timeArr[1]) || 'etime',
                defauleOpt={};
                defauleOpt[s]=stime;
                defauleOpt[e]=etime;
            var pra=$.extend(defauleOpt,extraPra);
        callback && $.type(callback)==='function' && callback(pra);
    },
    treePopup:function(cfg,para){
        var _this=this;
        if(!cfg ||!cfg.url ){
           return layer.msg('para error');
        }
        this.treeIndex=layer.open({
            type: 2, 
            area: ['500px', '300px'],
            title:cfg.title || '请选择部门',
            content: /* getContentPath()+ */cfg.url,
            btn:['确定'],
            yes:function(index, layero){
                var iframeWin = $(layero).find('iframe')[0].contentWindow;
                var backJson=iframeWin.getSelected();
                if(backJson.arr.length>0){
                    cfg.elm.val(backJson.arr[0][cfg.name || 'name']).attr('keyid',backJson.arr[0].id);
                    _this.deptId=backJson.arr[0].id;
                    if(para){
                        $.each(para,function(i,item){
                            var ind=$.inArray(item.name,_this.selectRender);
                            if(ind!=-1){
                                var _data={
                                    name:item.name,
                                    data:{}
                                };
                                $.extend(_data.data,item.data)
                                _data.data[item.aliasName || cfg.elm.attr('name')]=backJson.arr[0].id;
                                _this.selectRenderFn(_data);
                            }
                        })
                    }
                }
                layer.close(index);

            },
            end:function(){
                cfg.end && cfg.end();
            }
        });
    },
    getMonthDays:function(year, month){
        var d = new Date(year, month, 0);
        return d.getDate();
    },
    /**
     * @param {object} opt 
     * {'y':0,'M':0,'d':0,'H':0,'m':0,'s':0,'S':0} 分别表示 年-月-日 时:分:秒 
     */
    getTime:function(cfg,diffDate){
        var dCfg=$.extend({'y':0,'M':0,'d':0,'H':0,'m':0,'s':0,'S':0},cfg),
            diffDate=diffDate || new Date();
        return new Date((diffDate.getFullYear() + cfg['y']), (diffDate.getMonth()+ cfg['M']), (diffDate.getDate()+ cfg['d']), 
				(diffDate.getHours()+ diffDate['H']), (diffDate.getMinutes()+ cfg['m']), (vDate.getSeconds()+ diffDate['s']),
				(diffDate.getMilliseconds()+ diffDate['S'])
			);
    },
    getStatus:function(){ // 0月 1年 2自定义
        var _v,flag;
        $.each(this.custom,function(){
            if( $(this).hasClass('active') ){
                flag=true;
                return false;
            }
        });
        if(flag){ return 3;}
        if(this.clickFlag=="month"){
            _v='0';
        }else if(this.clickFlag=="year"){
            _v='1';
        }
        return _v;
    },
    selectRenderFn:function(para){//name:'下拉框name名称',data:{} 额外的数据
        if(!para || !para.name){
            throw new Error('参数错误');
            return ;
        }
        var ind=$.inArray(para.name,this.selectRender),
            selectCfg;
        if( ind!==-1 ){//name字段验证
            selectCfg=this.selectRenderCfg[ind];
            var _data=$.extend(selectCfg.where,para.data);
            ycya.http.ajax(selectCfg.url,{
                type:selectCfg.type || 'post',
                data:_data,
                success:function(data){
                    var html='',
                        d=selectCfg.beforeSuccess?selectCfg.beforeSuccess(data):data.data,
                        keyName=selectCfg.keyName ?selectCfg.keyName :'name',
                        valName=selectCfg.valName ?selectCfg.valName :'id';
                        if(d.length==0){
                            html+='<option value="-2">无</option>';
                        }else{
                            for(var key in d){
                                html+='<option value='+d[key][valName]+'>'+d[key][keyName]+'</option>' ;
                            }
                        }
                    
                    $('[name='+para.name+']','.yy-m-search').html(html);
                }
            });
        }
    }
};
app.ui.report={
    init:function(cfg){
        if(cfg.title){this.title=app.ui.reportTitle.init(cfg.title)}
        if(cfg.search){this.search=app.ui.reportSearch.init(cfg.search)}
        if(cfg.echart){
            if(!cfg.echart.type){cfg.echart.type='bar'}
            if(cfg.echart.type!=='pie'){
                 this.echart=app.ui.echarts.barlineInit(cfg.echart);
            }else{
                delete cfg.echart.type
                this.echart=app.ui.echarts.pieInit(cfg.echart);
            }
           
        }
        if(cfg.grid)this.grid = app.ui.grid.init($.extend(cfg.grid,{elem:'#yui-grid'}));
        if(cfg.gridHandle){
            var boxid=cfg.gridHandle.id || 'yui-grid-popup',
            w=cfg.gridHandle.width || 400;
            $('body').append( $('<div/>',{id:boxid,class:'yy-hide',/* height:cfg.gridHandle.height || 300, */width: w || 400,html:'<table style="width:'+w+'px;" id="yui-grid-popup-table"><table>'}));
            $.extend(cfg.gridHandle,{elem:'#yui-grid-popup-table',parent:$('#'+boxid) });
            this.popupGridCfg=cfg.gridHandle;
        }
        return this;
    },
    getSearch:function(){
        return this.search;
    },
    getTitle:function(){
        return this.title;
    },
    getEchart:function(){
        return this.echart;
    },
    getGrid:function(){
        return this.grid;
    }
};
//monitor
app.ui.data={//此函数用于根据后台多变的数据结构，返回最终list
    get:function(da,format){//da 后台返回的一级数据 format 除一级结构以外至最终list的数据结构,例如 data.data.data
        var d;
        if(format.indexOf('.')===-1){
            d=da[format];
        }else{
            d=da;
            for(var i=0;i<format.split('.').length;i++){
                d=d[format.split('.')[i]];
            }
        }
        return d;
    }

};
app.ui.monitorPopup={
    open:function(cfg){
        var ind=layer.open({
            type:1,
            title:cfg.title,
            offset:cfg.offset,
            btn:cfg.btn || ['确定','取消'],
            shade:cfg.btn ||0,
            area:cfg.area,
            anim: app.ui.anim ||4, //弹出动画效果
            yes:cfg.yes,
            content:cfg.content,
            success:cfg.success,
            end:cfg.end
        });
        return ind;
    }
};
app.ui.status={
    _cfg:{
        title:'平台运行情况',
        /* {title:,text:,status:,num:,class:''}  */
        item:[], //状态列表
        check:'查看运行情况'
    },
    init:function(cfg){
        $.extend(true,this._cfg,cfg);
        var _this=this,
            _c=this._cfg,
            boxId='ycyaStatus',
            checkId='ycyaCheckStatus',
            _sbox=$("<div/>",{class:'run-status-box',id:boxId}),
            _stitle=$('<p/>',{class:'title',text:_c.title}),
            _slist=$('<ul/>',{class:'run-status-list'}),
            _scheck=$('<p/>',{class:'t-align cursor-point',id:checkId,text:_c.check});
        //添加状态
        if(_c.item.length==0){
            return layer.msg('status para error');
        }
        $.each(_c.item,function(i,item){
            var cl=['status-num'/* ,'t-left' */,'icon-'+item.class].join(' ');
            _slist.append($('<li/>',{'data-status':item.status,'data-title':item.title,width:1/_c.item.length*100+'%',html:'<p class="'+cl+'" data-status='+item.status+'>'+item.num+'</p><p>'+item.text+'</p>'})[0].outerHTML)
        });
        _sbox.append(_stitle).append(_slist).append(_scheck);
        $('#mapWrap').length>0?$('#mapWrap').append(_sbox):layer.msg('box  id is not exist');
        this.list=$('#mapWrap .run-status-list');
        this.checkElm=$('#'+checkId);
        if(_c.toggle){
            $('#mapWrap').append($('<div/>',{class:'run-status-box-toggle cursor-point',text:'运行情况>>',click:function(){
                $('#'+boxId).toggle(400);
                if($(this).css('left')=='23px'){
                    var _left=_c.toggle=="parking"? 444:330;
                    $(this).animate({'left':_left},400);
                }else{
                    $(this).animate({'left':23},400);
                }
            }}));
        }
        if(_c.itemClick){
            this.list.on('click','li',function(){
                _c.itemClick({
                    status:$(this).attr('data-status'),
                    title:$(this).attr('data-title')
                })
            });
        }
        if(_c.checkClick){
            this.statusList=app.ui.statusList.init(_c.checkClick);
            this.checkElm.click(function(){
                layer.open({
                    type: 1, 
                    area: '530px',
                    title:(cfg.checkClick.header &&  cfg.checkClick.header.title)|| '运行情况',
                    content: _this.statusList.boxElm,
                    anim:app.ui.anim,
                    end:function(){
                        _this.statusList.boxElm.hide();
                    }
                })
            });
        }
        return this;
    },
    set:function(valJson){
        if( $.type(valJson)!=='object'){
            return layer.msg('status para error');
        }
        this.list.find('.status-num').each(function(i,item){
            var v= valJson[ $(this).attr('data-status')];
            if( v !==undefined){
                $(this).text(v)
            }
        });
    }
};
app.ui.tool={
    /**
     * @param {*} cfg
     * {
     *   event:string,自定义事件 ,目前只包括deptTree search
     *   cfg:object,  自定义事件的配置参数
     *   up:前面显示的icon class
     *   class:后面显示的icon class
     * }
     * @returns tool obj
     */
    init:function(cfg){
        var _this=this;
        this.ids=[ ];   //存放tool item id
        this.list=[];   //存放包含ul列表的item id
        this.events=[]; //待绑定自定义事件的对象集合
        var _box=$('<div/>',{class:'function-list',id:'toolList'});
        $.each(cfg,function(i,item){
            var cl=['iconfont','m-right-4',item.class].join(' '),
                cl2=['iconfont','m-left-4','font-small',item.up].join(' '),
                _li=$('<li/>',{/* click:item.handle, */id:item.id,html:'<i class="'+cl+'"></i><span>'+item.name+'</span><i class="'+cl2+'"></i>',class:item.cursor?'cursor-point':''});
            if(item.event){
                var iobj={
                    id:item.id,
                    event:item.event
                };
                if(item.event=='search' || item.event=='deptTree') {
                    iobj.cfg=item.cfg; 
                }
                _this.events.push(iobj);
            }
            if(item.item){
                var _content=$('<ul/>',{class:'master-list tool-list'});
                $.each(item.item,function(i,elm){
                    var cl=['iconfont','m-right-4',elm.class].join(' '),
                    _cli=$('<li/>',{click:function(){
                        elm.handle && elm.handle(_this);
                    },id:elm.id,html:'<i class="'+cl+'"></i>'+elm.name});
                    _content.append(_cli);
                });
                _li.append(_content).append('<div class="up-triangle master-list-triangle tool-list-triangle ycya-hide" ></div>');
                _this.list.push(item.id);
            }    
            _box.append( _li ) ;
            _this.ids.push(item.id);
        });
        $('#mapWrap').length>0?$('#mapWrap').append(_box):layer.msg('box  id is not exist');
        //插入退出全屏
        this.exit='#yyExit';
        $('#mapWrap').length>0?$('#mapWrap').append( $('<div/>',{id:'yyExit',class:'yy-hide yy-exit',text:'退出全屏',click:function(){
            if(app.ui.screen.isFull()){//已全屏,则执行退出全屏操作
                app.ui.screen.exitFullScreen();
                $(this).hide();
            }
           
        }}) ):layer.msg('box  id is not exist');
        this.elms=[];
        $.each(this.ids,function(i,item){
            _this.elms.push( $('#'+item))
        });
        this.ulshow();
        this.customEvent();
        return this;
    },
    ulshow:function(){
        var _this=this;
        $.each(this.list,function(i,item){
            $('#'+item).on('click.toggle',function(){
                $(this).find('ul,.up-triangle').toggle(500);
                $(this).siblings().find('ul,.up-triangle').each(function(){
                    $(this).hide();
                });
                if(_this.ycyaMapSearch){
                    _this.ycyaMapSearch.boxElm.hide();
                }
            });
        });
    },
    customEvent:function(){//deptTree  search
        var _this=this;
        $.each(this.events,function(i,item){
            if(item.event=="deptTree"){
                //追加deptTree box
                _this.ycyaMapDeptTree=app.ui.deptTree.init(item.cfg);
                //绑定事件
                var deptLiLeft=$('.map-wrap').width()-70-355-32;
                $('#'+item.id).on('click.custom',function(){
                    app.ui.monitorPopup.open({
                        title:'选择部门',
                        offset:['82px',deptLiLeft],
                        area:$('#toolList').innerWidth()+'px'/* '392px' */,
                        yes:function(index,layero){
                            var deptElm;
                            $.each(_this.events,function(i,item){
                                if(item.event=='deptTree'){
                                    deptElm=$('#'+item.id).find('span');
                                }
                            });
                            item.cfg.yes && item.cfg.yes(index,deptElm,_this.ycyaMapDeptTree.tree.getSelectedNodes());
                        },
                        content:_this.ycyaMapDeptTree.boxElm,
                        success:function(){
                            _this.ycyaMapDeptTree.tree.cancelSelectedNode();
                        },
                        end:function(){
                            _this.ycyaMapDeptTree.boxElm.hide();
                        }
                    })
                });
            }else if(item.event=="search"){
                //追加search box
                _this.ycyaMapSearch=app.ui.searchBar.init(item.cfg);
                //绑定事件
                $('#'+item.id).on('click.custom',function(){
                    _this.ycyaMapSearch.boxElm.toggle(500);
                    $(this).siblings('li').find('ul,.up-triangle').each(function(){
                        $(this).hide();
                    });
                });
                $('.'+item.cfg["primary-icon"],'#mapSearch').click(function(){
                    var c=item.cfg.base;
                    c.keyName && ( c.data[c.keyName]=$('input','#mapSearch').val() );
                    c.search && c.search(item.cfg.base);
                })
            }else{}
        });
    }
};
app.ui.deptTree={
    _cfg:{
        //view: {dblClickExpand: false,showLine: true,selectedMulti: false},
        data:{
            simpleData: {enable: true,idKey: "id",pIdKey: "pId",rootPId: 0},
            key:{name:'name'}
        },callback:{}//,check:{}
    },
    init:function(cfg){
        var treeElm='ycyaDeptTree',
            treeCfg=$.extend(true,this._cfg,cfg.cfg),_this=this;
        var _box=$("<div/>",{class:'ycya-hide',id:'ycyaDeptBox'});
            _box.append('<div class="dept-box popup-panel"><div class="ztree" id="'+treeElm+'"></div></div>');
            $('#mapWrap').length>0?$('#mapWrap').append(_box):layer.msg('box  id is not exist');
        this.boxElm=$('#ycyaDeptBox');
        if(cfg.url){
            ycya.http.ajax(cfg.url,{
                data: cfg.data,
                type: cfg.type || 'post',
                success:function(data, textStatus, jqXHR){
                    if(data && data.code==0){
                        var _list=cfg.beforeSuccess?cfg.beforeSuccess(data):data.data;
                        if(cfg.open){
                            for(var i=0;i< _list.length;i++){
                                _list[i].open=true;
                            }
                        }
                        var zTreeObj = $.fn.zTree.init($("#"+treeElm), treeCfg,_list);
                        _this.tree = zTreeObj;
                        _this.loaded = true;
                    }
                },
                error:function(jqXHR, textStatus, errorThrown){
                    layer.msg('monitor tree data load err:'+textStatus);
                }
                });
        }else{
            var zTreeObj = $.fn.zTree.init($("#"+treeElm), treeCfg, cfg.data);
            _this.tree = zTreeObj;
            _this.loaded = true;
        }
        return this;
    }
};
app.ui.searchBar={
    init:function(cfg){
        var boxId='mapSearch',
            highCl=['iconfont',cfg["advanced-icon"]].join(' '),
            lowCl=['iconfont',cfg["primary-icon"],'cursor-point'].join(' '),
            _box=$("<div/>",{class:'map-search',id:boxId}),
            _high=$('<span>',{class:'cursor-point',id:'seniorSearchBtn',html:'<i class="'+highCl+'"></i>'}),
            _low=$('<span>',{html:'<i class="'+lowCl+'"></i><strong><input placeholder="'+cfg["placeholder"]+'"></strong>'});
            _box.append(_high).append(_low);
            $('#mapWrap').length>0?$('#mapWrap').append(_box):layer.msg('box  id is not exist');
        this.boxElm=$('#'+boxId);
        return this;
    }
};
app.ui.mapHighSearch={};
app.ui.master={
    init:function(cfg){
        var _this=this;
        this.events=[]; //待绑定自定义事件的对象集合
        if($.type(cfg.item)!=='array' || cfg.item.length==0){
            return layer.msg('monitor master para error');
        }
        var _box=$('<div/>',{class:'master-btn cursor-point',click:function(){
            $(this).find('ul,.up-triangle').toggle(500);
        }}),
            _boxi=$('<i/>',{class:"iconfont "+cfg.class}),
            _up=$('<div/>',{class:'up-triangle master-list-triangle ycya-hide'});
        var _content=$('<ul/>',{class:'master-list'});
        $.each(cfg.item,function(i,elm){
            var cl=['iconfont','m-right-4','positon-adjust-middle',elm.class].join(' '),
            _cli=$('<li/>',{id:elm.id,html:'<i class="'+cl+'"></i>'+elm.name});
            _content.append(_cli);
            if(elm.event){
                var iobj={
                    id:elm.id,
                    event:elm.event
                };
                if(elm.event=='mapShow') {
                    iobj.cfg=elm.cfg; 
                }
                _this.events.push(iobj);
            }
        });
        _box.append(_boxi).append(_content).append(_up);
        $('#mapWrap').length>0?$('#mapWrap').append(_box):layer.msg('box  id is not exist');
        this.customEvent();
        return this;
    },
    customEvent:function(){//deptTree  search
        var _this=this;
        $.each(this.events,function(i,item){
            if(item.event=="mapShow"){
                _this.ycyaMapShow=app.ui.mapShow.init(item.cfg);
                var deptLiLeft=$('.map-wrap').width()-70-355-32;
                $('#'+item.id).on('click.custom',function(){
                    app.ui.monitorPopup.open({
                        title:'地图显示设置',
                        offset:['82px',deptLiLeft],
                        area:$('#toolList').innerWidth()+'px'/* '384px' */,
                        content:_this.ycyaMapShow.boxElm,
                        success:function(){},
                        yes:function(index,layero){
                            var slist=[];
                            $('.choosed-type-item',_this.ycyaMapShow.choosed).each(function(){
                                slist.push({
                                    id:$(this).attr('data-id'),
                                    type:$(this).attr('data-type'),
                                    name:$(this).text()
                                })
                            });
                            item.cfg.yes && item.cfg.yes(index,slist);
                        },
                        end:function(){
                            _this.ycyaMapShow.boxElm.hide();
                        }
                    });
                });
            }

        });
    }
};
app.ui.mapShow={
    init:function(cfg){
        var _this=this;
        if(!cfg.names){return layer.msg('monitor mapShow popup para error')};
        this.aliasNames=cfg.names;
        //生成元素
        var mapShowId='ycyaMapShow',
            _box=$('<div/>',{class:'ycya-hide',id:mapShowId}),
            _content=$('<div/>',{class:'popup-panel show-box',html:'<div class="sub-title p-left-16">当前选择</div><div class="choosed-type"></div> <div class="choose-all p-left-16"><p class="to-choose-type-all">全部<i class="item-choosed"></i></p></div><ul class="to-choose-type clear p-left-16"></ul>'});
            _box.append(_content);
             $('#mapWrap').length>0?$('#mapWrap').append(_box):layer.msg('box  id is not exist');
        this.boxElm=$('#'+mapShowId);
        this.toChoose=$('.to-choose-type' ,this.boxElm) ;   
        this.choosed=$('.choosed-type' ,this.boxElm) ;   
        this.all=$('.choose-all' ,this.boxElm) ;   
        if(!cfg.cfg && cfg.local){//本地加载
            this.create(cfg.local.all ,cfg.local.selected)
        }else{
            ycya.http.ajax(cfg.cfg.url,{
                data:cfg.cfg.where ,
                type:cfg.cfg.type || 'post',
                success:function(data){
                    var aliasData=app.ui.data.get(data,cfg.cfg.format);
                    _this.create(aliasData ,aliasData)
                }
            })
        }
        return this;
    },
    create:function(all,selected){//所有 已选中
        if(!all || !selected || $.type(all)!=='array' || $.type(selected)!=='array'){
            return layer.msg('monitor mapShow popup para error');
        }
        this.allList=all;
        this.selectedList=selected;
        var la=[],
            sa=[],
            aliasId= this.aliasNames.id,
            aliasName= this.aliasNames.name,
            aliasType= this.aliasNames.type;
        for(var i=0;i<all.length;i++){
            var cur=all[i];
            la.push('<li class="to-choose-type-item" data-type='+cur[aliasType]+' data-id='+cur[aliasId]+'>'+cur[aliasName]+'<i class="item-choosed"></i></li>');
        }
        this.toChoose.html(la.join(''));
        if(selected.length>0){
            if(selected.length==all.length){
                $('.to-choose-type li').each(function(){
                    $(this).addClass('active');
                    sa.push('<span class="choosed-type-item" data-type='+$(this).attr('data-type')+' data-id='+$(this).attr('data-id')+'>'+$(this).text()+'<i class="choosed-type-item-close"></i></span>');
                });
            }else{
                $('.to-choose-type li').each(function(){
                    for(var i=0;i<selected.length;i++){
                    if( selected[i].name==$(this).text()){
                        $(this).addClass('active');
                        sa.push('<span class="choosed-type-item" data-type='+$(this).attr('data-type')+' data-id='+$(this).attr('data-id')+'>'+selected[i].name+'<i class="choosed-type-item-close"></i></span>');
                    }
                    } 
                });
            }
            this.choosed.html(sa.join(''));
            this.bindEvent();
        }
    },
    bindEvent:function(){
        var _this=this;
        //地图显示-当前选择-取消
        if( $('#mapWrap').length==0){
           return  layer.msg('box id is not exist');
        }
        $('#mapWrap').on('click','.choosed-type-item-close',function(){
            var text= $(this).parent().text();
            $(this).parent().remove();
            $('li', _this.toChoose).each(function(){
                if( $(this).text()==text){
                    $(this).removeClass('active');
                    return false;
                }
            });
            if(_this.all.hasClass('active')){
                _this.all.removeClass('active');
            }
            if( _this.choosed.find('.choosed-type-item').length==0){
                _this.choosed.hide(500);
            }
        });
        //地图显示-全部
        $('.to-choose-type-all').click(function(){
            if($(this).hasClass('active')){
                $(this).removeClass('active');
                $('.to-choose-type li').each(function(){
                    $(this).removeClass('active');
                });
                _this.choosed.hide(500).html('');
            }else{
                $(this).addClass('active');
                $('li',_this.toChoose).each(function(){
                    $(this).addClass('active');
                });
                var arr=[];
                $('li',_this.toChoose).each(function(){
                    $(this).addClass('active');
                    arr.push('<span class="choosed-type-item" data-type='+$(this).attr('data-type')+' data-id='+$(this).attr('data-id')+'>'+$(this).text()+'<i class="choosed-type-item-close"></i></span>');
                });
                _this.choosed.show().html(arr.join(''));
            }
        });
        //地图显示-选择
        $('#mapWrap').on('click','.to-choose-type-item',function(){ 
            if( $(this).hasClass('active') ){
                var text= $(this).text();
                $(this).removeClass('active');
                $('.choosed-type-item',_this.choosed).each(function(){
                   if( $(this).text()==text){
                        $(this).remove();
                        return false;
                   }
                });
                if( $('.choosed-type-item',_this.choosed).length==0){
                    _this.choosed.hide(500);                
                }
                var a=$('.to-choose-type-all',_this.all);
                if(a.hasClass('active')){
                    a.removeClass('active');
                }   
            }else{
                _this.choosed.show();
                $(this).addClass('active');
                if( $('.active',_this.toChoose).length== _this.allList.length){
                    $('.to-choose-type-all',_this.all).addClass('active');
                }
                $('.choosed-type').append('<span class="choosed-type-item" data-type='+$(this).attr('data-type')+' data-id='+$(this).attr('data-id')+'>'+$(this).text()+'<i class="choosed-type-item-close"></i></span>')
            }
        });
    }
};
app.ui.zoom={
    _cfg:{
        id:'ycyaZoom'
     },
    init:function(map,cfg){
        $.extend(this._cfg,cfg);
        var zwrap=$("<div/>",{class:'zomm-wrap',id:this._cfg.id}),
            zin=$("<p/>",{class:'zoom-in',id:"zoomIn",title:"放大一级",text:"+",click:function(){
                map.zoomIn();
            }}),
            zout=$("<p/>",{class:'zoom-out',id:"zoomOut",title:"缩小一级",text:"-",click:function(){
                map.zoomOut();
            }});
            zwrap.append(zin).append(zout);
            $('#mapWrap').length>0 ?$('#mapWrap').append(zwrap) : layer.msg('box id is not exist');
        return this;
    }
};
app.ui.map={
    _cfg:{
        id:'ycyaMap' 
     },
    init:function(cfg){
        $.extend(this._cfg,cfg);
        return new YcyaMap(this._cfg.id);
    }
};
app.ui.statusList={
    init:function(cfg){
        var  _this=this,
             wrapId='ycyaRunStatus', 
            _swrap=$('<div/>',{id:wrapId,class:'ycya-hide layui-layer-wrap'}),
            _sbox=$('<div/>',{class:'well-box clear'}),
            _slefttop=$('<div/>',{class:'well-box-left-top'}),
            _sleftbottom=$('<div/>',{class:'well-box-left-bottom',html:'<p>报警:</p><p class="alarm">'+cfg.left.alarmNum || 0+'</p>'}),
            _sleft=$('<div/>',{class:'well-box-left'}),
            _sright=$('<div/>',{class:'well-box-right'}),
            _lefttitle=$('<p/>',{class:'title',text:cfg.left.title}),
            _leftnum=$('<p/>',{class:'num'}),
            _sleftprogress1=this.createDivItem({
                name:'维护',
                num:cfg.left.repairNum,
                percent:cfg.left.repairNum/cfg.left.allNum*100,
                bg:'layui-bg-orange',
                class:'repair-bg'
            }),
            _sleftprogress2=this.createDivItem({
                name:'离线',
                num:cfg.left.offNum,
                percent:cfg.left.offNum/cfg.left.allNum*100,
                bg:'layui-bg-gray',
                class:'off-bg'
            }),
            _srightul=$('<ul/>',{class:'well-box-list'});
            _leftnum.append('<span><i class="iconfont '+cfg.left.allIcon+'"></i><font>'+cfg.left.allNum || 0+'</font></span>').append('<span class="rt"><i class="iconfont '+cfg.left.typeIcon+'"></i><font>'+cfg.left.typeNum || 0+'</font></span>');
            _slefttop.append(_lefttitle).append(_leftnum).append(_sleftprogress1).append(_sleftprogress2);
            _sleft.append(_slefttop).append(_sleftbottom);
            _sright.append(_srightul);
            _sbox.append(_sleft).append(_sright);
            _swrap.append(_sbox); 
            $('#mapWrap').length>0 ?$('#mapWrap').append(_swrap) : layer.msg('box id is not exist');
            
            this.boxElm=$('#'+wrapId);
            this.ul=$('.well-box-list','#'+wrapId);
            this.leftElm={
                allNum:$('.num>span:eq(0)','#'+wrapId),
                typeNum:$('.num>span.rt','#'+wrapId),
                repairNum:$('.well-box-item[data-class="repair-bg"] strong','#'+wrapId),
                repairBar:$('.well-box-item[data-class="repair-bg"] .layui-progress-bar','#'+wrapId),
                offBar:$('.well-box-item[data-class="off-bg"] .layui-progress-bar','#'+wrapId),
                offNum:$('.well-box-item[data-class="off-bg"] strong','#'+wrapId),
                alarmNum:$('.well-box-left-bottom .alarm','#'+wrapId)
            };
            if(cfg.right.item && !cfg.right.cfg){
                this.createList(cfg.right,cfg.item);
            }else{
                ycya.http.ajax(cfg.right.cfg.url,{
                    data:cfg.where,
                    type:cfg.right.cfg.type || 'post',
                    success:function(data){
                        _this.createList(cfg.right,app.ui.data.get(data,cfg.right.cfg.format));
                    }
                })
            }
            return this;
    },
    createDivItem:function(obj){
        return $('<div/>',{class:'well-box-item','data-class':obj.class,html:'<span>'+obj.name+'</span><strong class="rt">'+obj.num+'</strong><div class="layui-progress"><div class="layui-progress-bar '+obj.bg+'" style="width:'+obj.percent+'%;"></div></div>'})
    },
    createList:function(cfg,itemList){
        var listArr=[],
            on=cfg.onKey,
            off=cfg.offKey,
            alarm=cfg.alarmKey,
            repair=cfg.repairKey,
            aliasName=cfg.nameKey;
            this.listCfg={
                on:on,
                off:off,
                alarm:alarm,
                repair:repair,
                aliasName:aliasName
            };
            this.listIcon=cfg.icon;
        $.each(itemList,function(i,cur){
            listArr.push( $('<li/>',{html:'<span>'+cur[aliasName]+'：</span><span><i class="iconfont icon-blue  '+cfg.icon+'"></i>'+cur[on]+'</span><span><i class="iconfont icon-red  '+cfg.icon+'"></i>'+cur[alarm]+'</span><span><i class="iconfont icon-yellow  '+cfg.icon+'"></i>'+cur[repair]+'</span><span><i class="iconfont icon-gray  '+cfg.icon+'"></i>'+cur[off]+'</span>'})[0].outerHTML);
        });
        this.ul.html(listArr.join(''));
    },
    listRender:function(itemList){
        var _this=this,
            listArr=[];
        $.each(itemList,function(i,cur){
            listArr.push( $('<li/>',{html:'<span>'+cur[_this.listCfg.aliasName]+'：</span><span><i class="iconfont icon-blue  '+_this.listIcon+'"></i>'+cur[_this.listCfg.on]+'</span><span><i class="iconfont icon-red  '+_this.listIcon+'"></i>'+cur[_this.listCfg.alarm]+'</span><span><i class="iconfont icon-yellow  '+_this.listIcon+'"></i>'+cur[_this.listCfg.repair]+'</span><span><i class="iconfont icon-gray  '+_this.listIcon+'"></i>'+cur[_this.listCfg.off]+'</span>'})[0].outerHTML);
        });
        this.ul.html(listArr.join(''));
    },
    set:function(jsonData){
        $.each(this.leftElm,function(k,elm){
            if(k=='repairBar'){
                elm.css({width:jsonData['repairNum']/jsonData.allNum*100+'%'});
            }
            if( k=='offBar' ){
                elm.css({width:jsonData['offNum']/jsonData.allNum*100+'%'});
            }
            if(jsonData[k] !==undefined){
                if(k=='allNum' || k=='typeNum'){
                    elm.find('font').text(jsonData[k])
                }else{
                     elm.text(jsonData[k]);
                }
            }
        });
    }
};
app.ui.page.monitor={
    init:function(cfg){
        var _this=this;
        this.map=app.ui.map.init(cfg.map);
        _this.status=app.ui.status.init(cfg.status);//提前执行
        _this.tool=app.ui.tool.init(cfg.tool);//提前执行
        this.map.ready(function(){//地图加载完进行的操作
            _this.zoom=app.ui.zoom.init(_this.map,cfg.zoom);
            _this.master=app.ui.master.init(cfg.master);
            cfg.ready && cfg.ready(_this);
        });
        return this;
    },
    getMap:function(){return this.map},
    getStatus:function(){return this.status}
};
//screen
app.ui.screen={
    fullScreen:function(el){
        var rfs = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullScreen,
        wscript;
        if(typeof rfs != "undefined" && rfs) {
            rfs.call(el);
            return;
        }
        if(typeof window.ActiveXObject != "undefined") {
            wscript = new ActiveXObject("WScript.Shell");
            if(wscript) {
                wscript.SendKeys("{F11}");
            }
        }
    },
    exitFullScreen:function(){
        var el= document,
    	cfs = el.cancelFullScreen || el.webkitCancelFullScreen || el.mozCancelFullScreen || el.exitFullScreen,
        wscript;
        if (typeof cfs != "undefined" && cfs) {
            cfs.call(el);
            return;
        }
        if (typeof window.ActiveXObject != "undefined") {
            wscript = new ActiveXObject("WScript.Shell");
            if (wscript != null) {
                wscript.SendKeys("{F11}");
            }
        }
    },
    fullele: function () {
        return(
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.msFullscreenElement ||
            document.mozFullScreenElement ||
        null);
    },
    isFull: function () {
        return !!(document.webkitIsFullScreen || this.fullele());
    }
};
//parking
app.ui.title={
    _cfg:{
        item:[],
        parent:'#bodyHeader'
        /* text 标题,bgClass:背景class,num 数量,unit 单位,icon 图标class */
    },
    init:function(cfg){
        $.extend(true,this._cfg,cfg);
        var c=this._cfg,_this=this;
        if($.type(c.item)!=='array'){return new TypeError()}
        var html='',
            width=1/c.item.length*100+'%';
        $.each(c.item,function(i,val){
           var _class= val.bgClass ?'yy-title-bg-gradient-'+val.bgClass:'yy-title-bg-gradient-blue',
                num=$.type(val.num - 0)=='number' && _this.fmoney(val.num - 0),
                noPadding= (i==  c.item.length-1) && 'padding-right:0' ;  
           html+='<div style="width:'+width+';'+noPadding+'" class="yy-height-all" ><div class="yy-height-all '+_class+'"><p class="yy-titles-item-text">'+val.text+'</p><p><strong class="yy-titles-num yy-titles-bigfont" id="yyTitlesNum'+i+'">'+num+'</strong>/<span class="yy-titles-item-unit">'+val.unit+'</span><i class="yy-rt iconfont yy-titles-bigfont '+val.icon+'"></i></p></div></div> '; 
        });
        $(this._cfg.parent).html(html);
        this.numList=$('.yy-titles-num',this._cfg.parent);
        return this;
    },
    set:function(para){
        //数组 顺序与item顺序一致
        //对象 可指定设置
        var _this=this;
        if( $.type(para)=='array' || $.type(para)=='object'){
            $.each(para,function(i,val){
                $(_this.numList[i]).text($.type(val - 0)=='number' && _this.fmoney(val - 0));
            });
        }else{
            return new TypeError();
        }
    },
    fmoney:function (s, n) {
        n = n >=0 && n <= 20 ? n : 2;
        s = parseFloat((s + "").replace(/[^\d\.-]/g, "")).toFixed(n) + "";
        var l = s.split(".")[0].split("").reverse(), r = s.split(".")[1];
        t = "";
        for (i = 0; i < l.length; i++) {
        t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? "," : "");
        }
        return t.split("").reverse().join("");
    }
};
app.ui.devRun={
    _cfg:{
        // parent:'#bodyDevRun'
    },
    init:function(cfg){
        if(!cfg.name || !cfg.cfg){
            return layer.msg('parking devRun para error');
        }
        $.extend(true,this._cfg,cfg);
        var _parent=cfg.parent ? $(cfg.parent) :  $('#bodyDevRun'),
            c=this._cfg,
            _this=this;
        $('.layui-card-header',_parent).text(c.title || '');
        var thead=$('<thead/>'),
            tbody=$('<tbody/>'),
            theadtr=$('<tr/>'),
            fields=[],
            cla=[];    
        $.each(c.name,function(i,item){
            theadtr.append( $('<th>'+item.title+'</th>'));
            fields.push(item.field);
            cla.push(item.class);
        });
        this.fields=fields;
        thead.append(theadtr);
        $('.thead',_parent).html(thead[0].outerHTML);
        ycya.http.ajax(cfg.cfg.url,{
            data:cfg.cfg.data,
            type:cfg.cfg.type || 'post',
            success:function(data){
                var d=cfg.cfg.beforeSuccess ?cfg.cfg.beforeSuccess(data):(data.data || []);
                $.each(d,function(i,item){
                    var _tr=$('<tr/>');
                    for(var j=0;j<_this.fields.length;j++){
                        var cur=_this.fields[j];   
                         _tr.append( $('<td/>',{text:item[cur],class:'yy-color-'+cla[j]}) );
                    }
                    tbody.append(_tr);
                });
                $('.tbody',_parent).html(tbody[0].outerHTML);
            }
        });
    }
};
app.ui.parkRank={
    _cfg:{
        // parent:'#bodyParkRank'
    },
    init:function(cfg){
        if(!cfg.name || !cfg.cfg){
            return layer.msg('parking parkRank para error');
        }
        $.extend(true,this._cfg,cfg);
        this.numberKey=cfg.numberKey;
        var _parent= cfg.parent ? $(cfg.parent) :  $('#bodyParkRank'),
            c=this._cfg,
            _this=this;
        $('.layui-card-header',_parent).prepend( $('<span/>',{text:c.title||''}) );
        var thead=$('<thead/>'),
            theadtr=$('<tr/>'),
            fields=[];   
        $.each(c.name,function(i,item){
            theadtr.append( $('<th>'+item.title+'</th>'));
            fields.push(item.field);
        });
        this.fields=fields;
        thead.append(theadtr);
        $('.thead',_parent).html('<colgroup><col width="150"><col></colgroup>'+thead[0].outerHTML);
        _this.render(c.cfg[0],_parent);
        //yy-parking-rank-ul bind event
        $('.yy-parking-rank-ul').on('click','li',function(){
            $(this).addClass('active').siblings().removeClass('active');
            _this.render(c.cfg[ $(this).index() ],_parent)
        });
    },
    render:function(cfg,par){
        var _this=this,
        tbody=$('<tbody/>');
        ycya.http.ajax(cfg.url,{
            data:cfg.data,
            type:cfg.type || 'post',
            success:function(data){
                var d=cfg.beforeSuccess ?cfg.beforeSuccess(data):(data.data || []);
                $.each(d,function(i,item){
                    if(i<7){
                        var cla=i<3?'yy-parking-tr'+(1+i):'',
                            _tr=$('<tr/>',{class:cla});
                        for(var j=0;j<_this.fields.length;j++){
                            var cur=_this.fields[j];
                            if(cur==_this.numberKey){
                                    var _no;
                                    if(i<3){
                                    _no='<i class="yy-parking-no-position yy-no yy-no'+i+'"></i>';
                                    }else{
                                    _no='<i class= "yy-no" style="margin-right:6px">'+(1+i)+'</i>';
                                    }
                                _tr.append( $('<td/>',{html:_no+item[cur]}))
                            }else{
                                _tr.append( $('<td/>',{text:item[cur]}) )
                            }
                        }
                        tbody.append(_tr);
                    }
                });
                $('.tbody',par).html('').html('<colgroup><col width="150"><col></colgroup>'+tbody[0].outerHTML);
            }
        });
    }
}
app.ui.page.parking={
    init:function(cfg){
        var _this=this;
        if(cfg.header){
            this.header=app.ui.title.init(cfg.header);
        }
        if(cfg.map){
            this.map=app.ui.map.init(cfg.map);
            this.map.ready(function(){//地图加载完进行的操作
               cfg.ready && cfg.ready(_this);
            });
        }
        if(cfg.devRun){
            this.devRun=app.ui.devRun.init(cfg.devRun);
        }
        if(cfg.parkRank){
            this.parkRank=app.ui.parkRank.init(cfg.parkRank);
        }
        if(cfg.parkSort && cfg.parkSort.type=="pie"){
            var pieId='parksort';
            $('.layui-card-body','#bodyParkSort').append($('<div/>',{height:200,id:pieId}));
            $('.layui-card-header','#bodyParkSort').append($('<span/>',{text:cfg.parkSort.title|| ''}))
            $.extend(cfg.parkSort,{id:pieId});
            this.parkSort=app.ui.echarts.pieInit(cfg.parkSort);
        }
        if(cfg.parkCurve && (cfg.parkCurve.type=="bar" ||  cfg.parkCurve.type=="line")){
            var curseId='parkcurse';
            $('.layui-card-body','#bodyParkCurve').append($('<div/>',{height:300,id:curseId}));
            $('.layui-card-header','#bodyParkCurve').append($('<span/>',{text:cfg.parkCurve.title|| ''}))
            $.extend(cfg.parkCurve,{id:curseId});
            this.parkCurve=app.ui.echarts.barlineInit(cfg.parkCurve);
        }
        return this;
    },
    getHeader:function(){return this.header},
    getMap:function(){return this.map},
    getDevRun:function(){return this.devRun},
    getParkRank:function(){return this.parkRank},
    getParkSort:function(){return this.parkSort},
    getParkCurve:function(){return this.parkCurve}
};
$(function(){
    var page = GetQueryString('p');
    if(page){
        var js = app.router[page];
        if(js){
            var jsLoader = new YcyaLoader();
            jsLoader.loadFile(/* getContentPath()+ */js,function(){});
        }else{
            alert('cfg error');
        }
    }else{
        alert('para error');
    }
})
