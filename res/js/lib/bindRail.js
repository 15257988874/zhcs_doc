var bind;
function returnGrid(){
    return bind.getGrid();
}
$(function(){
    bind = app.ui.page.bindpopup.init({
        search:{
            items:[
                {label:'数据类型',dt:'sel',qt:'eq',name:"userType",keyName:'id',valName:'typeName',option:[{"id": 111,"typeName": "系统"},
                {"id": 222,"typeName": "测试"}],len:60,/* cfg:{url:'dicJson.js',type:'get',where:{},format:'data.data.data'} */}
            ],
            btns:[
                {title:'<i class="layui-icon">&#xe615;</i>查找',handle:function(){
                    var jsonQry = bind.getSearch().getValueQry(/*['carNo']*/);
                    alert(JSON.stringify(bind.getSearch().getValueQry(/*['userName']*/)));
                    alert(JSON.stringify(bind.getSearch().getValue(/*['userName']*/)));
                    bind.getGrid().qry(jsonQry);
                }}
            ],
        },
        grid:{
            // url: app.url + 'sys/logList' //数据接口
            url: 'backJson.js',
            method:'get',
            cols: [[ //表头
                {field: 'userName', title: '用户名', width:100, align:'center',fixed: 'left',event:'evtUser'}
                ,{field: 'optTime', title: '操作时间', width:180, align:'center'}
                ,{field: 'optTime', title: '操作时间1', width:180, align:'center'}
                ,{field: 'optType', title: '日志类型', width:120, align:'center',templet:function(d){
                    return app.getDictName('logType',d.optType);
                }}
                ,{field: 'opt', width:400,title: '详细信息'}
                ,{fixed: 'right', width: 80, title: '操作',align: 'center',templet:function(d){
                    return app.ui.grid.rowBtn({title:'绑定',event:'bind'})
                }}
            ]]
        }
    });
    var table=layui.table;
    table.on('tool(pop-grid-filter)',function(obj){
        var data = obj.data;
        if(obj.event === 'bind'){
           console.log( $('#dataId').val() )
        }
    });  
});