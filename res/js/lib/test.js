$(function(){
    var page = app.ui.page.list.init({
        title:"日志管理123",
        left:{
            title:'部门信息',
            items:[
                //{label:'部门',dt:'text',qt:'like',name:"deptId",len:50}
            ],
            btns:[
                {title:'<i class="layui-icon">&#xe615;</i>查找',handle:deptQryEvt,css:['layui-btn-primary'],name:'yuiLeftQry'}
                //,{title:'<i class="layui-icon">&#xe615;</i>新增',handle:deptQryEvt1,css:['layui-btn-primary'],name:'yuiLeftAdd'}
            ],
            body:{view:'tree',cfg:{
                evtCode:'leftTreeLoad',//事件代码，应用自定义，在一个页面必须唯一
                url:'',where:{},
                data:[
                    {id:1, pId:0, name: "父节点1"},
                    {id:11, pId:1, name: "子节点1"},
                    {id:12, pId:1, name: "子节点2"}
                ],
                cfg:{
                    callback:{'onClick':treeClick}
                    ,data:{key:{name:'name'}}
                    ,check:{enable: true}
                }
            }}
            // body:{
            //     view:'list',cfg:{
            //         evtCode:'leftTreeLoad',//事件代码，应用自定义，在一个页面必须唯一
            //         // url:'list.js',    //服务器获取地址
            //         data:{},   //额外数据
            //         type:'get',
            //         option:[
            //             {
            //                 "id": 1
            //                 ,"dicName": "数据1"
            //                 ,"dicType": "11"
            //                 ,"dicTest":"111"
            //             },
            //             {
            //                 "id":2
            //                 ,"dicName": "数据2"
            //                 ,"dicType": "22"
            //                 ,"dicTest":"222"
            //             },
            //             {
            //                 "id":3
            //                 ,"dicName": "数据3"
            //                 ,"dicType": "33"
            //                 ,"dicTest":"333"
            //             }

            //         ], //本地加载时使用
            //         isCheck:true,
            //         qry:'dicType', //查询字段
            //         handle:function(arg){ //点击事件
            //             console.log(arg);
            //             //console.log( page.getGrid().qry( {'dicType':arg}) );
            //         },
            //         name:'dicName', 
            //         dataAttr:['id','dicType','dicTest']  
            //     }
            // }
        },
        search:{
            title:'日志管理',
            items:[
                {label:'用户名',dt:'text',qt:'like',name:"userName"},
                {label:'操作时间',dt:'date',qt:'btw',name:"optTime",len:140,cfg:{type: 'datetime',format:'yyyy-MM-dd HH:mm:ss'}}
            ],
            btns:[
                {title:'<i class="layui-icon">&#xe615;</i>查找',handle:searchBntEvt,name:'yuiSearchQry'}
                ,{title:'<i class="layui-icon">&#xe65f;</i>',handle:deptQryEvt1,name:'yuiSearchAdd'}
            ]
        },
        grid:{
            url: app.url + 'sys/logList' //数据接口
            ,cols: [[ //表头
                {type:'numbers',align:'center',fixed: 'left'}
                ,{field: 'userName', title: '用户名', width:100, align:'center',fixed: 'left',event:'evtUser'}
                ,{field: 'optTime', title: '操作时间', width:180, align:'center'}
                ,{field: 'optTime', title: '操作时间1', width:180, align:'center'}
                ,{field: 'optTime', title: '操作时间2', width:180, align:'center'}
                ,{field: 'optTime', title: '操作时间3', width:180, align:'center'}
                ,{field: 'optTime', title: '操作时间4', width:180, align:'center'}
                ,{field: 'optType', title: '日志类型', width:120, align:'center',templet:function(d){
                    return app.getDictName('logType',d.optType);
                }}
                ,{field: 'opt', width:400,title: '详细信息'}
                ,{fixed: 'right', width: 130, align: 'center',templet:function(d){
                    return app.ui.grid.rowBtn({title:'修改',event:'modOne'})
                        + app.ui.grid.rowBtn({title:'删除',css:['layui-btn-danger'],event:'del'});
                }}
            ]],
            btns:[
                {title:'添加',handle:addEvt,name:'yui-table-add'},
                {title:'查看',handle:yuiCheck,css:['layui-btn-danger'],name:'yui-table-add2'},
                {title:'删除',handle:function(){console.log(2)},css:['layui-btn-danger'],name:'yui-table-add3'},
                {title:'设备绑定',handle:function(){console.log(2)},css:['layui-btn-danger'],name:'yui-table-add4'}
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
            alert('modOne:'+data.id);
        }
        if(obj.event=== 'del'){
            alert('del:'+data.id);
        }
    });

    function addEvt(){
    }
    function yuiCheck(){
        var result = app.ui.form.setData({optType:'btn2',ext:'otherData'});
        alert(result);
        return false;
    }
    function yuiCheck1(){
        var result = app.ui.form.setData({optType:'btn1',ext:'otherData'});
        alert(result);
        return false;
    }
    function yuiAdvance(){
        app.ui.form.setData({optType:'btn3',ext:'成都你好'});
        return false;
    }

    function deptQryEvt(){
        var tree = page.getTree();
        alert(tree);
    }
    function treeClick(event, treeId, treeNode){
        alert(treeId+','+treeNode.tId + ", " + treeNode.name);
    }
    function deptQryEvt1(){
        alert('left2');
    }
    function searchBntEvt(){
        var jsonQry = page.getSearch().getValueQry(/*['carNo']*/);
        alert(JSON.stringify(page.getSearch().getValueQry(/*['userName']*/)));
        alert(JSON.stringify(page.getSearch().getValue(/*['userName']*/)));
        page.getGrid().qry(jsonQry);
    }
})

