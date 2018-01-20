$(function(){
    $("a").each(function(){
        var $t = $(this);
        $t.attr("href","options.html"+$t.attr("href"));
        $t.attr("target","_parent");
    });
});
