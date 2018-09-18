//var requestUrl='http://192.168.0.151:8089/iot/service/sys/',
var requestUrl='http://192.168.0.94:8080/iot/service/sys/',
    userInfo=JSON.parse( ycya.wls.get('_data') );

//展开树的所有节点
function openNodes(arr) {
    var arrNode = arr;
    //展开所有节点
    for (var i = 0; i < arrNode.length; i++) {
        arrNode[i].open = true;
    }
    return arrNode;
}
//解析车辆信息状态
function parseCarInfo(num){
	var carDetil={
		acc:ycya.util.getBit(num,0),              //acc状态  0关 1开
		position:ycya.util.getBit(num,1),         //定位     0未定位 1定位
		northAndsouth:ycya.util.getBit(num,2),    //南北纬   0北纬   1南纬
		eastAndWest:ycya.util.getBit(num,3),      //东西经   0东经   1西经
		stopPoint:ycya.util.getBit(num,4),        //停车点   1停车点
		stopUnit:ycya.util.getBitRange(num,5,6),       //停车单位 0分 1时 2天 3月
		stopTime:ycya.util.getBitRange(num,7,12),      //停车时间
		gsm:ycya.util.getBitRange(num,13,15),          //GSM信号强度  0(零) 1~2(一) 3~4(二) 5~6(三) 7(四)
		positionStyle:ycya.util.getBit(num,16),   //定位类型 0GPS 1基站WIFI
		sateNum:ycya.util.getBitRange(num,17,19),      //卫星数量 0~5表示具体数量 6表示>=6 7表示不可检测
		power: ycya.util.getBitRange(num,20,26)        //电池电量 0~100电量 0,大于100表示不可检测 
	 };
	 return carDetil;
}
//解析报警状态
function parseAlert(num){
	return  ycya.util.getBit(num,1);
}
//jquery 类扩展
$.fn.extend({
    /*初始化form表单元素
    * param {$Dom} jquery元素
    * */
    initFormElm:function($Dom){
        var _this=this;
        $(_this).find('input,textarea').not('[type=button],[type=reset],[type=submit]').each(function(){
            if($(this).attr('keyid')){
                $(this).removeAttr('keyid');
            }
            $(this).val('');
        });
        $(_this).find('select').each(function(){
            $(this).find('option:first').prop("selected", 'selected');
        });
    },
    /*填充form表单元素
    * param {$Dom} jquery元素
    * param {jsonData} 填充的json数据
    * param {pElm} true 填充P 元素 , 反之填充 input, textarea
    * */
    paddingFormElm:function(jsonData,pElm){
        var _this=this;
        if(!pElm){
            $(_this).find('input,textarea').not('[type=button],[type=reset],[type=submit],[type=file]').each(function(){
                if(jsonData[$(this).attr('name')]!=undefined && jsonData[$(this).attr('name')]!==null && jsonData[$(this).attr('name')]!='null'){
                    $(this).val( jsonData[$(this).attr('name')] );
                }else{
                    $(this).val('- -');
                }
            });
        }else{
            $(_this).find('p').each(function(){
                if(jsonData[$(this).attr('class')]!==undefined && jsonData[$(this).attr('class')]!==null && jsonData[$(this).attr('class')]!='null'){
                    if($(this).attr('class')=='onState'){
                        if(jsonData['onState']==1){
                            $(this).text( '在线' );
                        }else if(jsonData['onState']==2){
                            $(this).text( '离线' );
                        }else{
                            $(this).text( '' );
                        }
                    }else if( $(this).attr('class')=='equipmentNum'){
                        if(jsonData['equipmentNum']==''){
                            $(this).text( '暂未绑定设备' );
                        }else{
                            $(this).text( jsonData['equipmentNum'] );
                        }
                    }else{
                        $(this).text( jsonData[$(this).attr('class')] );
                    }
                }else{
                    $(this).text('- -');
                }
            });
        }
    },
    timePlugin:function(timeOpt){
        var timeFormat= (timeOpt && timeOpt.format) ? timeOpt.format :'yyyy-MM-dd';
        var timeConfig=$.extend({
            el: this.attr('id'),
            dateFmt: timeFormat
        },timeOpt);
        this.click(function(){
            WdatePicker(timeConfig); 
        });
    },
    /** 
     * @param {any} initList 初始化时要选中的checkbox jquery数组
     */
    initCheckBox:function(initList){
        this.find('[type="checkbox"]').each(function(){
            $(this).prop('checked',false);
        })
        if(initList){
            $.each(initList,function(i,item){
                item.prop('checked',true);
            });
        }
    },
    noDataPrompt:function(){
        if (carGrid.datagrid('getRows').length == 0) {
            layer.msg('暂无车辆数据', {
                time: 1000
            });
        }
    }
});
//jquery 方法扩展
$.extend({
    getPointDirection:function (dir) {
        if (dir == 0) {
            return "正北";
        } else if (dir > 0 && dir < 90) {
            return "东北";
        } else if (dir == 90) {
            return "东";
        } else if (dir > 90 && dir < 180) {
            return "东南";
        } else if (dir == 180) {
            return "南";
        } else if (dir > 180 && dir < 270) {
            return "西南";
        } else if (dir == 270) {
            return "西";
        } else if (dir > 270 && dir < 360) {
            return "西北";
        }
    },
    /**
     * 
     * 
     * @param {any} opt {idName:id,url:''} 必传
     * @param {any} callback  请求成功的回调函数
     */
    searchRowById:function(opt,callback){
        var option={};
        $.each(opt,function(k,item){
            if(k!='url'){
                option[k]=item;
            }
        });
        var config={
            uiType:uiType,
            uiClass:uiClass,
            pageSize:20,
            pageNo:1
        };
        var newOpt=$.extend({},config,option);
        $.ycyaAjax({
            url:opt.url,
            data:newOpt,
            success:function(data){
                console.log(data);
                callback && callback(data);
            }
        })
    },
    judgePrivilege:function(){
        var arrUrl=location.href.split('/'),
            pageName=arrUrl[arrUrl.length-1];
        if(! pageCode[pageName]){
            window.top.location.herf=getContentPath()+'/index.html';
        }    
    }
});
//扩展对象
/* Object.prototype.vequal = function(obj){  
    var props1 = Object.getOwnPropertyNames(this);  
    var props2 = Object.getOwnPropertyNames(obj);  
    if (props1.length != props2.length) {  
        return false;  
    }  
    for (var i = 0,max = props1.length; i < max; i++) {  
        var propName = props1[i];  
        if (this[propName] !== obj[propName]) {  
            return false;  
        }  
    }  
    return true;  
} */
var dicMap={
    'userType':'用户类型',
    'deviceType':'设备类型',
    'facilityType':'设施类型',
    'alarmType':'告警类型',
    'logType':'日志类型',
    'province':'省份',
    'carType':'车辆类型',
    'carSeat':'车辆座位',
    'carBrand':'车辆品牌',
    'carColor':'车辆颜色'
},
infoList={
    1:'新增',
    2:'修改'
},
queryParam={
    pageNo: 1,
    pageSize: 20
}    
