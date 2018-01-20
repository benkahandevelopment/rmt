/*$(function(){
    $("a").each(function(){
        var $t = $(this);
        $t.attr("href","/"+parent.document.location.href.split("/").pop().split("#")[0]+$t.attr("href"));
        $t.attr("target","_parent");
    });
});*/

$(function(){
    /*$("a").each(function(){
        var $t = $(this);
        $t.attr("href","/options.html"+$t.attr("href"));
        $t.attr("target","_parent");
    });*/

    $("a").click(function(){
        var $t = $(this);
        console.log("about to reload...");
        parent.window.location.href="/"+parent.document.location.href.split("/").pop().split("#")[0]+$t.attr("href");
        parent.location.reload();
        e.preventDefault();
    });
});
