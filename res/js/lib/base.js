var app = ycya.page;
app.url = 'http://192.168.0.160:8080/iot/service/';
// app.url = 'http://127.0.0.1:8080/iot/service/';
app.pageSize = 20;
app.pageNo = 1;
app.mainIfmId = 'mainIfm';
app.router = {
    "logList": "/res/js/sysSetting/log.js",
    "test": "/res/js/lib/test.js",
    "form": "/res/js/lib/form.js",
    "fclt": "/res/js/fclt/fclt.js",
    "term": "/res/js/term/term.js",
    "fcltOper": "/res/js/fclt/fcltOper.js",
    "fcltAlert":"/res/js/fclt/fcltAlert.js",
    "fcltType":"/res/js/fclt/fcltType.js",
    "dtType":"/res/js/term/dtType.js",
    'tree':"/res/js/lib/tree.js",
    'reportform':"/res/js/lib/reportform.js",
    'address':"/res/js/lib/address.js",
    'monitoring':"/res/js/lib/monitoring.js",
    'bindRail':"/res/js/lib/bindRail.js",
    'bindFalt':"/res/js/lib/bindFalt.js"
};
app.dict = {
    'logType': {1: '登陆日志'}
    ,'fcltStatus': {1: '闲置',2:'使用',3:'禁用或废弃'}//设施状态
    ,'isOper': {0: '未作业',1:'作业中'}//设施作业状态
    ,'isDeal':{0: '未处理',1:'已处理'}//设施报警处理状态
    ,'isUse':{0:'未使用',1:'使用'}//围栏是否使用
    ,'fenType':{0:'圆形',1:'矩形',2:'自定义围栏',3:'行政区域围栏'}//围栏类型
    ,'dtType':{1:'整数',2:'开关量',3:'字符串'}//设备数据类型
    
};


app.getDictName = function (dictType, value) {
    return app.dict[dictType][value] ? app.dict[dictType][value] : '未定义';
};
app.validateRule = {
    simNo: function (value, item) { //value：表单的值、item：表单的DOM对象
        if (!new RegExp(/^[\S]{11,16}$/).test(value)) return '卡号必须11到16位';
    },
    simContent: [/^[\S]{4+}$/, '短信内容长度最小为4']
};
app.openLayer = function (opt) {
    var defaultOpt = {
        type: 1, //页面层
        title: false, //弹出层title  
        content: opt.content, //内容
        offset: 'auto', //垂直水平居中
        area: null, //宽高    
        btn: null, //按钮
        closeBtn: 1, //关闭按钮样式
        shade: 0.3, //弹层外区域透明度
        shadeClose: false, //点击遮罩不关闭
        anim: 4, //弹出动画效果
        resize: false, //不允许拉伸
        zIndex: 19891014, //默认层叠顺序
        success: function () { //层弹出后的成功回调方法
        },
        cancel: function () { //右上角关闭按钮触发的回调
        }
    }
    var newOpt = $.extend({}, defaultOpt, opt);
    var index = layer.open(newOpt);
    return index;
};
/**
 * 用于快速生成查看对象
 * @param {*} obj 继承对象 必传
 * @param {*} dom 放置html的ID 必传
 * @returns
 */
app.createCheck = function (obj,dom) {
    if (!obj || $.type(obj) !== 'object' || !dom) {
        throw new Error('参数错误');
        return;
    }
    var checkObj = $.extend(true, {}, obj, {
        'isAdvacend':'',
        'filter': '',
        'id': dom,
        'callback': function () {}
    });
    if(checkObj.pcfg ){checkObj.pcfg.btns=false}
    for (var i = 0, l = checkObj.item.length; i < l; i++) {
        var ce = checkObj.item[i];
        ce.elmType = 'p';
        ce.isRequired = false;
        ce.selectOption = '';
        ce.verify = '';
        ce.isReadonly = false;
    }
    return checkObj;
};
/**
 *
 * 用于快速生成高级查询对象
 * @param {*} obj 继承对象 必传
 * @param {*} dom 放置html的ID 必传
 * @param {*} callback  回调函数   必传
 * @param {*} filterArr
 * @returns
 */
app.createSearchObj=function (obj, dom, filterArr,cfg) {
    if (!obj || $.type(obj) !== 'object' || !dom) {
      throw new Error('参数错误');
      return;
    }
    var arr=[];
    searchObj = $.extend(true, {}, obj, {
      'filter': 'advancedSearch',
      'id': dom,
      'isAdvanced': true
    });
    delete searchObj.pcfg;
    if(cfg){
      $.extend(true, searchObj, cfg);
    }
    for (var i = 0, l = searchObj.item.length; i < l; i++) {
      var ce = searchObj.item[i];
      if ($.inArray(ce.label, filterArr) != -1) {
        arr.push(ce);
      }
    }
    for (var i = 0, l = arr.length; i < l; i++) {
      var ce = arr[i];
      ce.isRequired = false;
      ce.isReadonly = false;
      ce.verify = '';
    }
    searchObj.item = arr;
    return searchObj;
};
 /**
 * @param {any} opt 
 * 
 * {
 *    url:'',   //接口地址
 *    data:{},  //发送给后台的数据
 *    success:fn //成功的回调--默认code=0
 *    error:fn   //请求失败 
 * }
 */
app.ycyaAjax=function (opt) {
    ycya.http.ajax(this.url + opt.url, {
      data: opt.data,
      success: function (data, textStatus, jqXHR) {
        if (data) {
          if (data.code == 0) {
            opt.success && opt.success(data, textStatus, jqXHR);
          } else {
            if (layer) {
              if (data.code == 25) {
                window.top.location.href = getContentPath() + "/index.html";
              } else {
                layer.msg(data.msg, {
                  time: 1000
                });
              }
            }
          }
        } else {
          layer.msg('数据异常', {
            time: 1000
          });
        }
      },
      error: function (e) {
        layer.closeAll();
        layer.msg('服务器链接异常，请稍后再试', {
          time: 1000
        });
      }
    })
  }