

$(function(){
   //设置iframe高度
   function setIframeHeight(){
        $('#mainIfm').height( $(window).outerHeight()-60-5); //预留5像素
   }
   setIframeHeight();
   $(window).resize(function(){
        setIframeHeight()
   });
});