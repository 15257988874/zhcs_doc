(function (ycya) {
    var AQInput = function (cfg) {
        this.cfg = cfg;
        this.dom = [];
        this.date=[];
        this.dateCfg=[];
        if(!cfg.qt){
            this.id = [ this.cfg.name ];
        }else{
            if (cfg.qt == 'btw') { //范围查询
                this.id = ['qry_' + this.cfg.name + '_gt', 'qry_' + this.cfg.name + '_lt'];
            } else {
                this.id = ['qry_' + this.cfg.name + '_' + cfg.qt];
            }
        }
       
        this._init();
    }
    AQInput.prototype = {
        _init: function () {
            var lenCss = this.cfg.len?"style='width:"+this.cfg.len+"px'":"",
                html = '',
                iClass=this.id.length>1?"input-btw" :'';
            for (var i = 0; i < this.id.length; i++) {
                if (i > 0) html += '至';
                var iType=this.cfg.inputType || 'text',
                    iVerity=this.cfg.verify || '';
                if(this.cfg.isReadonly){
                    html += '<input type='+iType+' id='+this.id[i]
                    +'_  name='+this.id[i]+' autocomplete="off"  '+lenCss+'  readonly lay-verify=' + iVerity + ' class='+iClass+' data-flag="ycya-form">';
                }else{
                    html += '<input type='+iType+' id='+this.id[i]
                    +'_  name='+this.id[i]+' autocomplete="off"  '+lenCss+'   lay-verify=' + iVerity + ' class='+iClass+' data-flag="ycya-form">';
                }    
               
            }
            this.html=html;
            if (this.cfg.dt == 'date') {
                for (var i = 0; i < this.id.length; i++) {
                    this.date.push('#' + this.id[i]+'_');
                    if(this.cfg.cfg){this.dateCfg.push(this.cfg.cfg)}
                }
                
            }
            return this;
        }
    }
    ycya.AQInput = AQInput;
})(window);
!function (ycya) {
    var ycyaAq = function (cfg) {
        this.dateList=[];
        this.dateCfgList=[];
        this.ready=false;
        this._cfg = {
            isAdvanced:false,  //高级查询
            id: '',            //容器ID 
            filter: '',        //layer 表单验证 
            allowEmpty: false, //返回值是否允许为空
            colWidth: 'two',   //一行2列或一行1列
            callBack: function () {}, //回调函数 
            submitFn:function(){},    //提交函数
            btns:[],                  //按钮,包含确定按钮  
            item: [] //表单元素列表
    /* 渲染选项{label:'姓名',elmType:'input',name:"userName",'isBlock':true}
            elmType:            input、textarea、select
            inputType:''        input元素的预留  text、password、checkbox、radio
            isReadonly:booloean 
            dt:text、date
            qt:eq(等于)、ne(不等于)、gt(大于)、lt(小于),like(包含),in(多值),btw(范围),  
            isRequired          是否必填 ,用于产生 * 号
            selectOption:''     本地加载select使用字段
            verify:''           layui--验证 */
        }
        $.extend(this._cfg, cfg);
        this.init(this._cfg);
    }
    ycyaAq.prototype = {
        init: function (cfg) {
            //参数验证
            if( $.type(cfg) !== 'object' || cfg.id==='' || !cfg.item || $.type(cfg.item) !== 'array'){
                throw new Error('参数错误');
                return ; 
            }
            //列宽
            var _ulDefaultStyle = ['yy-m-aq-popup', 'layui-form','yy-m-aq-'+cfg.colWidth+'-item'];
            if (cfg.isAdvanced) {
                _ulDefaultStyle.push('yy-m-aq-advanced-popup');
            }
            _ulDefaultStyle=_ulDefaultStyle.join(' ');
            var _ul = $('<ul class="' + _ulDefaultStyle + '"></ul>');
            for (var i = 0; i < cfg.item.length; i++) {
                var con = cfg.item[i],_li;
                var req = '',verify = '';
                if (con.isRequired) {req = '<span class="yy-m-aq-require-option">*</span>'; }//是否必填
                if (con.verify) { verify = con.verify;}//验证规则
                if (con.isBlock) {
                    _li = $('<li class="block-item layui-form-item"><label >' + req + con.label+ ': </label></li>')
                } else {
                    _li = $('<li class="layui-form-item"><label>' + req + con.label + ': </label></li>')
                }
                var divStyle = 'm-inline-block w-all',
                    inputType = con.inputType ? con.inputType : 'text';
                    elmType=con.elmType || 'input';
                switch (elmType) {
                    case 'input':
                        if(inputType=='text'){
                            var formItem = new AQInput(con); 
                            if(formItem.date.length>0){
                                this.dateList.push(formItem.date);
                                this.dateCfgList.push(formItem.dateCfg);
                            }
                            _li.append($('<div class="' + divStyle + '">'+formItem.html+'</div>'));
                        }
                    break;
                    case 'select':
                    var optionStr = '';
                        if (con.selectOption && $.type(con.selectOption) == 'array') {
                            $.each(con.selectOption, function (i, item) {
                                optionStr += '<option value=' + i + '>' + item + '</option>'
                            });
                        }
                        _li.append($('<div class="' + divStyle + '"><select name=' + con.name + ' data-flag="ycya-form">' + optionStr + '</select></div>'));
                    break;
                    case 'textarea':
                        _li.append($('<div class="' + divStyle + '"><textarea name=' + con.name + ' lay-verify=' + verify + ' data-flag="ycya-form"></textarea></div>'));
                    break;
                    case 'p':
                        _li.append($('<div class="' + divStyle + '"><p data-name=' + con.name + ' data-flag="ycya-form"></p></div>'));
                    break;
                }  
                _ul.append(_li);
            }
            //添加按钮
            if (cfg.filter || cfg.isAdvanced) {
                _ul.append('<li class="block-item layui-form-item btn-group" style="display:none"><a lay-filter=' + cfg.filter + ' lay-submit>确定</a><a class="white" id="ycyaAqNo">取消</a></li>');
            }
            $('#'+cfg.id).html(_ul);
            this.ready=true;
            //绑定date事件
            if(this.dateList.length>0){
                var laydate = layui.laydate;
                for (var i = 0; i < this.dateList.length; i++) {
                    if($.type(this.dateList[i])=='array'){
                        for(var j=0;j<this.dateList[i].length;j++){
                            var dateCfg={
                                elem:this.dateList[i][j]
                            };
                            $.extend(dateCfg,this.dateCfgList[i][j]);
                            laydate.render(dateCfg);
                        }
                    }else{
                        var dateCfg = {
                            elem:this.dateList[i]
                        }; //指定元素
                        $.extend(dateCfg,this.dateCfgList[i]);
                        laydate.render({
                            elem:this.dateList[i]
                        });
                    }
                }
            }
            //监听提交按钮
            if(cfg.filter){
                var form=layui.form;
                form.on('submit(' + cfg.filter + ')', function (data) {
                    if(!cfg.allowEmpty){
                        $.each(data.field,function(i,item){
                            if(item==''){
                                delete data.field[i]
                            }
                        });
                    }
                    $.type(cfg.submitFn) == 'function' && cfg.submitFn(data.field);
                    // return false; //阻止表单跳转。如果需要表单跳转，去掉这段即可。
                });
            }
            //取消按钮
            $('#ycyaAqNo').click(function(){
                if( cfg.index){
                    layer.close(cfg.index)
                }
            });
            //执行回调函数
            if (cfg.callback && $.type(cfg.callback) == 'function') {
                cfg.callback();
            }
        },
        get:function(){},
        reset:function(){
            //input reset
            $('input[data-flag="ycya-form"]','#'+this._cfg.id).each(function(){
                var type=$(this).attr('type');
                if(type=='text' || type=='password'){
                    $(this).val('').removeAttr('keyid');
                }else{
                    $(this).prop('checked',false);
                }
            });
            //select
            $('select[data-flag="ycya-form"]','#'+this._cfg.id).each(function(){
                $(this).prop('selectedIndex', 0);
            });
            //textarea
            $('textarea[data-flag="ycya-form"]','#'+this._cfg.id).each(function(){
                $(this).val('');
            });
        },
        set:function(valueJson){
            if( $.type(valueJson)!=='object' || $.isEmptyObject(valueJson) ){
                return ;
            }
            //input fill
            $('input[data-flag="ycya-form"]','#'+this._cfg.id).each(function(){
                var type=$(this).attr('type'),
                    sign=$(this).attr('id');
                if(type=='text' || type=='password'){
                    $(this).val(valueJson[sign]?valueJson[sign]:'--');
                }else{
                    $(this).prop('checked',false);
                }
            });
            //select 
            $('select[data-flag="ycya-form"]','#'+this._cfg.id).each(function(){
                var sign=$(this).attr('name');
                if(valueJson[sign]){$(this).val(valueJson[sign])};
            });
            //textarea
            $('textarea[data-flag="ycya-form"]','#'+this._cfg.id).each(function(){
                var sign=$(this).attr('name');
                $(this).val(valueJson[sign]?valueJson[sign]:'--');
            });
        },
        close:function(index){
            layer.close(index);
        }
    };
    ycya.ycyaAq = ycyaAq;
}(window);