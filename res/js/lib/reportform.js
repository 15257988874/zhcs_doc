$(function(){
    var report=app.ui.report.init({
        title:{
            item:[
                {name:'本月漏油',unit:'升'},
                {name:'上月漏油',unit:'升'},
                {name:'环比增长率',unit:'%',vClass:'yy-m-report-c-red'}
            ]  
        },
        search:{
            yearNum:3 ,
            item:[
                {'label':'选择部门','name':'deptId','type':'input','qt':'eq','click':function(opt){
                    app.ui.reportSearch.treePopup(opt);
                },treeCfg:{'url':'/page/default/tpl/tree.html?p=tree','title':'请选择部门'}},
                {'label':'选择车型','name':'type','type':'select','option':{
                    '1':'扫地车',
                    '2':'装甲车'
                }},
                {'label':'时间段','name':'time','len':140,'dt':'date','qt':'btw','cfg':{type: 'datetime',format:'yyyy-MM-dd HH:mm:ss'}}
            ],
            ready:function(){console.log(2)},
            refreshFn:updateFn
        },
        echart:{
            type:'bar',
            YMyaxis:{
                yname:'单位(元)'
            },
            YMtitle:{
                ttext:'一级标题',
                tsubtext:'二级标题'
            } 
        },
        // echart:{
        //     YMPseries:{
        //         sradius:["40%", "60%"]
        //     }
        // },
        grid:{
            // url: app.url + 'sys/logList' //数据接口
            height:400,
            url: 'backJson.js',
            method:'get'
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
            ]]
        }
    });
    report.getTitle().set([3,4,5]);

    report.getEchart().barlineSet([
        '喀什市', '疏附县', '疏勒县', '英吉沙县' , '泽普县', '岳普湖县'/* , '巴楚县', '伽师县' , '叶城县', '莎车县 ','3333','3333','3333','3333','3333','3333' */
    ],{ 
        '接入率':[20, 50, 80, 58, 83, 68, 57, 80, 42, 66,12,25,36,45,25,65],
        '在线率':[50, 51, 53, 61, 75, 87, 60, 62, 86, 46,12,25,36,45,25,65],
        '完好率':[70, 48, 73, 68, 53, 47, 50, 72, 96, 86,12,25,36,45,25,65] ,
        'jing' :[44, 70, 60, 61, 75, 87, 60, 62, 86, 46,12,25,36,45,25,65],
        'light':[44, 70, 60, 61, 75, 87, 60, 62, 86, 46,12,25,36,45,25,65],
        'test':[32, 70, 60, 61, 75, 87, 60, 62, 86, 46,12,25,36,45,25,65],
        'one':[66, 70, 60, 61, 75, 87, 60, 62, 86, 46,12,25,36,45,25,65],
        'two':[75, 70, 60, 61, 75, 87, 60, 62, 86, 46,12,25,36,45,25,65]
    });

    //      report.getEchart().pieSet( [
    //     {'value':2005,"name":"视频广告1",},
    //     {'value':135,"name":"视频广告2",},
    //     {'value':135,"name":"视频广告3",},
    //     {'value':135,"name":"视频广告4",}
    // ] );
    function updateFn(){
        console.log(arguments)
    }
   
});