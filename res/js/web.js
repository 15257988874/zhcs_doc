$(function () {
    layui.code({
        about:false,
        title:'目录',
        encode:true,
        skin:'notepad',
        height:300
   });
   //滚动监听
   var scrollElm=$('#scrollTop');
   $(window).scroll(function() {
        var topp = $(document).scrollTop();
        if(topp > 90){
            scrollElm.show()
        }else{ 
            scrollElm.hide();
        }
   });
   scrollElm.click(function(){
        $("html,body").animate({scrollTop:0},500);
   }); 
});
 //dir 目录
 function openDir(para){
    var offset_left=$('body').width()-para.width +'px',
        offset_Top=$(window).height()/2-para.height/2 +'px';
    layer.open({
        type:1,
        title:'目录',
        area:[para.width+'px',para.height+'px'],
        content:para.html,
        offset:[offset_Top,offset_left],
        shade:0
    });
}