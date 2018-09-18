function returnData(){
    var res=$('#searchResultPanel');
    return {
        name:res.attr('data-value') || $('#suggestId').val(),
        lng:res.attr('data-lng'),
        lat:res.attr('data-lat')
    }
}
$(function(){
    var map = new YcyaMap('betaMap');
    var _autoComplete;
    map.ready(function () {
        _autoComplete = map.createAutoComplete('suggestId', 'searchResultPanel', setPlace);
        map.getLngAndLat('suggestId', 'searchResultPanel', 'sanitationPlace');
        $('#suggestId').keyup(function () {
            $('.tangram-suggestion-main').css({'z-index': 99999999})
        });
    });
    function setPlace() {
        map.clear();    //清除地图上所有覆盖物
        function myFun() {
            var pp = local.getResults().getPoi(0).point;    //获取第一个智能搜索的结果
            $('#searchResultPanel').attr('data-lng', pp.lng).attr('data-lat', pp.lat);
            map.addPoint({type: 1, data: [{"lng": pp.lng, "lat": pp.lat, "id": 1}]});
            map.toSetCenter(pp);
        }
        var local = map.localSearch(myFun, map);
        local.search($('#searchResultPanel').attr('data-value'));
    }
})