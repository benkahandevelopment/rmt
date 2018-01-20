$(function(){
    $("a").each(function(){
        var $t = $(this);
        $t.attr("href","/"+parent.document.location.href.split("/").pop().split("#")[0]+$t.attr("href"));
        $t.attr("target","_parent");
    });
});
