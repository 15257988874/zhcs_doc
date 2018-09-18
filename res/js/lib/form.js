function setData(data){
    if(data.optType=='new'){//初始化表单
        alert('init');
    }else if(data.optType=='btn1'){
        return '你好';
    }else if(data.optType=='btn2'){
        alert(data.ext);

        return {userName:123};
    }else if(data.optType=='btn3'){
        alert(data.ext);
    }
}

$(function(){
    // $('#test123').bind('click',function(){
    //     alert(parent.layer);
    // })
});

