var tree,
    name='name';
    
function getSelected(){
    return  {
        arr:tree.tree.getSelectedNodes(),
        name:name
    }
}
$(function () {
    tree = app.ui.tree.init({
        cfg:{
            data: {
                simpleData: {
                    enable: true,
                    idKey: "id",
                    pIdKey: "pId",
                    rootPId: 0
                },
                key: {
                    name: name
                }
            },
            callback: {
                // onClick: zTreeOnClick
            },
            
        },
        open:true,
        type:'get',
        url:'treeJson.js'
    });
    function zTreeOnClick(event, treeId, treeNode) {
        alert(treeNode.tId + ", " + treeNode.name);
    };
});
