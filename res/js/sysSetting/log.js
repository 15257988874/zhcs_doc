$(function(){
    var page = app.ui.page.list.init({
        title:"日志管理123",
        search:{
            title:'日志管理',
            items:[
                {label:'用户名',dt:'text',qt:'like',name:"userName"},
                {label:'用户类型',dt:'sel',qt:'eq',name:"userType",keyName:'id',valName:'typeName',option:[{"id": 111,"typeName": "系统"},
                {"id": 222,"typeName": "测试"}],len:60,cfg:{url:'dicJson.js',type:'get',where:{},format:'data.data.data',allVal:-1}},
                {label:'操作时间',dt:'date',qt:'btw',name:"optTime",len:140,cfg:{type: 'datetime',format:'yyyy-MM-dd HH:mm:ss'}},
                {label:'定位时间',dt:'date',qt:'eq',name:"gpsTime",len:140,cfg:{type: 'datetime',format:'yyyy-MM-dd HH:mm:ss'}}
            ],
            btns:[
                {title:'<i class="layui-icon">&#xe615;</i>查找',handle:function(){
                    var jsonQry = page.getSearch().getValueQry(/*['carNo']*/);
                    alert(JSON.stringify(page.getSearch().getValueQry(/*['userName']*/)));
                    alert(JSON.stringify(page.getSearch().getValue(/*['userName']*/)));
                    page.getGrid().qry(jsonQry);
                }},
                {title:'<i class="layui-icon">&#xe65f;</i>',handle:function(){
                    if(aqpopup){
                        aqpopup.reset();
                        $('#'+aqpopup._cfg.id).toggle(400);
                    }
                },name:'yuiSearchAdd'}
            ]
        },
        grid:{
            // url: app.url + 'sys/logList' //数据接口
            url: 'backJson.js',
            method:'get'
            ,cols: [[ //表头
                {type:'checkbox',fixed: 'left'}
                ,{type:'numbers',align:'center',fixed: 'left'}
                ,{field: 'userName', title: '用户名', width:100, align:'center',fixed: 'left',event:'evtUser'}
                ,{field: 'optTime', title: '操作时间', width:180, align:'center'}
                ,{field: 'optTime', title: '操作时间1', width:180, align:'center'}
                ,{field: 'optTime', title: '操作时间2', width:180, align:'center'}
                ,{field: 'optTime', title: '操作时间3', width:180, align:'center'}
                ,{field: 'optTime', title: '操作时间4', width:180, align:'center'}
                ,{field: 'optType', title: '日志类型', width:120, align:'center',templet:function(d){
                    return app.getDictName('logType',d.logType);
                }}
                ,{field: 'opt', width:400,title: '详细信息'}
                ,{fixed: 'right', width: 400, align: 'center',templet:function(d){
                    return app.ui.grid.rowBtn({title:'修改',event:'modOne'})
                        + app.ui.grid.rowBtn({title:'删除',css:['layui-btn-danger'],event:'del'})+app.ui.grid.rowBtn({
                            title:'绑定围栏',css:['layui-btn-danger'],event:'rail'
                        })+app.ui.grid.rowBtn({
                            title:'绑定设备',css:['layui-btn-danger'],event:'dev'
                        })+app.ui.grid.rowBtn({
                            title:'路线回显',css:['layui-btn-danger'],event:'road'
                        })+app.ui.grid.rowBtn({
                            title:'查看',css:['layui-btn-danger'],event:'check'
                        })
                }}
            ]],
            btns:[
                {title:'添加',handle:addEvt,name:'yui-table-add'},
                {title:'查看',handle:function(){console.log(1)},css:['layui-btn-danger'],name:'yui-table-add2'},
                {title:'删除',handle:function(){
                //    console.log( page.getGrid().getRows());
                    page.getGrid().delRows(function(ids,index){
                        console.log(arguments);
                        layer.close(arguments[1]);
                    })
                },css:['layui-btn-danger'],name:'yui-table-add3'},
                {title:'路线',handle:function(){
                    routepop.reset();
                    routepop.popup({
                        title:'区域',
                        width:850  //最小宽度  必填
                        // ,maxmin:true
                        // ,full:'map'
                    });
                },css:['layui-btn-danger'],name:'yui-table-add4'}
            ]
        }
    });
    var table = layui.table;
    table.on('tool(yui-grid-filter)', function(obj){
        var data = obj.data;
        if(obj.event === 'evtUser'){
            alert(JSON.stringify(data));
        }
        if(obj.event=== 'modOne'){
            modEvt(obj.data);
        }
        if(obj.event=== 'del'){
            alert('del:'+data.id);
        }
        if(obj.event=== 'rail'){
            app.ui.bindRail.open({
                url:getContentPath()+'/page/default/tpl/listpop.html?p=bindRail',
                data:{id:data.id},
                selected:{id:data.id}
            });
        }
        if(obj.event=== 'dev'){
            app.ui.bindFalt.open({
                url:getContentPath()+'/page/default/tpl/listpop.html?p=bindFalt',
                data:{
                    id:data.id
                },
                selected:{
                    id:data.id
                },
                yes:function(ind,s){//ind 当前layer的index  s选中的列表
                    
                    console.log(data.id);
                    console.log(s);
                    // layer.close(ind);
                }
            });
        }
        if(obj.event=== 'road'){
            routepop.popup({
                title:'修改区域',
                width:850,  //最小宽度  必填
                success:function(){
                    var extraObj={
                        'points':'pList',
                        'cirRadius':'circleRadius',
                        'cirCenter':'circleCenter',
                    };
                    if(data.areaType==3){extraObj.admin=true}
                    routepop.set(data,['deptId'],'','',extraObj);
                    routepop.aliasSet(data,{'deptId':'deptName'});
                }
            })
        }
        if(obj.event=== 'check'){
            yuiCheck(data);
        }
    });
    var optFlag=1, // 1新增 2修改
        selectedId, //选中的数据ID
        optUrl={
            1:'',
            2:''
        };
    //添加/修改
    var commonObj={
        id: 'yui-add',
        filter: 'yui-add',
        submitFn: function (data) {
            console.log(data);
            if(optFlag===2){//追加数据ID
                
            }
            //发送请求
            console.log(selectedId)   
        },
        callback:function(obj){
            obj.selLinkage({
                clickSel:'yui-add_userSex',
                linkSel:'yui-add_food',
                cfg:{
                    data:{
                        name:'111'
                    },
                    type:"get",
                    searchName: 'foodName',         //自定义搜索内容的key值
                    keyName: 'foodName',            //自定义返回数据中name的key, 默认 name
                    keyVal: 'id',                   //自定义返回数据中value的key, 默认 value
                    beforeSuccess:function(id, url, searchVal, result){
                        return result.data.data.data;
                    }
                },
                type:'',
                url:'select.js',
                keyName:'ids'
            });
        },
        pcfg:{
            // btns:true,    //是否需要按钮组
            auto:false ,   //自动上传
            multiple:true, //多选
            url:app.url+ 'file/up',
            max:3,         //图片张数
            required:true, //是否必传
            picName:'pic1' //接口图片字段
            /*size:5*1024,
            number:1 */
        },
        verType:'tips', //提示方式 支持 msg tips alert
        item: [
            {label:'开始时间',name: "startTime",verify:'required', qt: 'gt',dt: 'date',
                cfg:{type: 'datetime',format:'yyyy-MM-dd HH:mm:ss'}
            },
            {label:'结束时间',name: "endTime"/* ,verify:'required' */,qt: 'lt',dt: 'date',
                cfg:{type: 'datetime',format:'yyyy-MM-dd HH:mm:ss'}
            },
            {label:'操作',name:'opt',qt:'eq',dt: 'switch',cfg:{values:'1|2',text:'男|女'}},
            {label:'是否加密',name:'pas',qt:'eq',dt: 'switch',cfg:{values:'1|2',text:'是|否'}},
           
            {label:'部门',name:"deptId"/* ,verify:'required' */,qt:'eq',eventName:'tree',treeCfg:{
                url:'/page/default/tpl/tree.html?p=tree',
                title:'请选择部门',
                name:'name'
            }},
            {label:'性别',elmType:'select',name: "userSex",qt: 'eq',isBlock:true,verify:'required',cfg:{
                data:{'1':'男','2':'女','3':'保密','4':'你好'},count:0,values:'1',search:true
            }},
            {label:'食物',elmType:'select',name: "food",qt: 'eq',isBlock:true,verify:'required',cfg:{
               count:4,search:true,url:'select.js',cfg:{
                    data:{
                        name:'111'
                    },
                    type:"get",
                    searchName: 'foodName',         //自定义搜索内容的key值
                    keyName: 'foodName',            //自定义返回数据中name的key, 默认 name
                    keyVal: 'id',                   //自定义返回数据中value的key, 默认 value
                    beforeSuccess:function(id, url, searchVal, result){
                        return result.data.data.data;
                    }
                }
            }},
            {label:'地点',name:"address"/* ,verify:'required' */,qt:'eq',isBlock:true,eventName:'address',treeCfg:{
                url:'/page/default/tpl/address.html?p=address'
            }},
            {label: '描述',elmType: 'textarea',verify:'required',name: "remark",isBlock:true,qt:'like'}
        ]
    },popup ;
    checkPopup=app.ui.autoform(app.createCheck(commonObj,'yui-check')),
    aqpopup=app.ui.autoform(app.createSearchObj(commonObj,'yui-qry-advance',['开始时间','结束时间','描述','性别','部门','食物'],
    {
        'submitFn':function(data){ 
                        page.getGrid().qry(data);
                        $('#'+aqpopup._cfg.id).hide(400);
        },           
        callback:function(){}              
    }));
    popup = app.ui.autoform(commonObj);

    //todo 创建带地图的表单
    var routeObj={
        id: 'yui-route',
        filter: 'yui-route',
        colWidth:'one',
        submitFn: function (data) {
            console.log(data);
        },
        item: [
            {label:'区域名称',name: "areaName",verify:'required'
            },
            {label:'区域类型',elmType:'select',name: "areaType",'filter':'areaType',
            qt: 'eq',verify:'required',cfg:{data:{ 0:'圆形',1:'矩形',2:'自定义围栏',3:'行政区域围栏'},count:1,values:'1',search:true}
            },
            {label:'结束时间',name: "endTime",verify:'required',
            qt: 'lt',dt: 'date',
            cfg:{type: 'datetime',format:'yyyy-MM-dd HH:mm:ss'}
            },
            
            {label:'部门',name:"deptId",verify:'required',eventName:'tree',treeCfg:{
                url:'/page/default/tpl/tree.html?p=tree',
                title:'请选择部门',
                name:'name'
            }},
            {label: '描述',elmType: 'textarea',name: "remark",isBlock:true}
        ],
        map:{
            btns:true,    //按钮组 绘制 重汇
            btnToElm:'areaType',  //btn 关联select name
            btnToFilter:'areaType',  //btn 关联select filter
            btnToVal:'3',
            btnElmJson:{
                0:'circle',
                1:'rectangle',
                2:'polygon'
            },
            admin:{
                'pointList':'pList',    //传给后台的经纬度key（经纬度逗号相隔）
                'circleRadius':'circleRadius', //若绘制圆，传给后台的圆心半径
                'circleCenter':'circleCenter'  //若绘制圆，传给后台的圆心坐标
            },  //是否需要行政区域
            lf:300,     //左侧表单宽度    
            rt:550,     //右侧地图宽度
            height:400   //内容整体高度
        }
    };
    routepop = app.ui.autoform(routeObj);
    function addEvt(){
        optFlag=1;
        var layerCfg={
            title:'添加用户' /* ,
            btns:[
                {'title':'确定','yes':true},
                {'title':'继续添加'},
                {'title':'取消'}
            ] */
        };
        popup.reset();
        popup.popup(layerCfg);
        
    }
    function modEvt(jsonData){
        optFlag=2;
        selectedId=jsonData.id;
        var layerCfg={
            title:'修改用户',
            success:function(){
                popup.set(jsonData,['deptId'],['lng','lat'],'pic1');
                popup.aliasSet(jsonData,{'deptId':'deptName'});
            }
        };
        popup.popup(layerCfg);
    }

    function yuiCheck(jsonData){
        checkPopup.set(jsonData);
        checkPopup.aliasSet(jsonData,{'deptId':'deptName'});
        checkPopup.popup({title:'查看',btns:[
            {'title':'确定'}]});
    }
});



