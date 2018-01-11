//var match = {};
//var settings = {};

/* On document load -----------------------------------------------------------0*/
(function(){

    /* Event Listeners --------------------------------------------------------1*/

    // Close window
    $("#close").click(function(){ window.close(); });

    //Submit
    $("#confirmOutput button[data-action=submit]").click(submit);

    //Navigation
    $("#navigation li").click(function(){
        $("#navigation li").removeClass("selected");
        $(this).addClass("selected");
        $("#navoutput .page").hide();
        $("#navoutput .page[data-page='"+$(this).attr("data-nav")+"']").show();
    });

    //Check and load saved input data
    chrome.storage.sync.get({"savedInputs":[]}, function(o){
        o.savedInputs.forEach(function(i,v){ $("[data-input="+i[0]+"]").val(i[1]); });
        refreshSprites();
    });

    //Return key goes to next visible input
    $("input").keyup(function(e){
        if(e.keyCode==13) $(this).closest(".page").find(":input").eq($(this).closest(".page").find(":input").index(this)+1).focus();
    });

    //Modals
    $(".modal .modal-close").click(function(){
        $(".modal-cont").fadeOut();
        $(this).closest(".modal").fadeOut();
    });


    //Player Event Modal - Launch
    $(document).on('click',".removeSprite", function(){ $(this).parent().remove(); });
    $(".team-list li a").click(function(e){
        var playerid = $(this).parent().parent().find("input:eq(0)").attr("data-input");
        $(".modal[data-modal=playerevent] input[name=player-name]").val($(this).parent().parent().find("input:eq(0)").val()).attr("data-playerid", playerid);

        //Add existing player sprites (if any) with checkboxes to delete
        var sprites = $("input[data-input="+playerid+"-sprites]").val().split(",");
        $(".modal[data-modal=playerevent] ul.existing").html("");
        if(sprites.length>0){
            sprites.forEach(function(v,i){
                if($.trim(v).length>0) $(".modal[data-modal=playerevent] ul.existing").append("<li><a href='#"+v+"' data-sprite='"+v+"'></a>&nbsp;<a href='#' class='removeSprite'>[REMOVE]</a></li>");
            })
        }

        $(".modal-cont").fadeIn();
        $(".modal[data-modal=playerevent]").fadeIn();
    });

    //Player Event Modal - Confirm
    $(".modal-confirm").click(function(e){
        var m = $(this).closest(".modal").attr("data-modal");
        if(m=="playerevent"){
            var id = $(".modal[data-modal=playerevent] input[name=player-name]").attr("data-playerid");
            var sprite = $(".modal[data-modal=playerevent] select[name=player-sprite] option:selected").val();

            //Add to hidden input
            var existing = [];
            $("ul.existing li").each(function(e){ existing.push($(this).find("a[data-sprite]:eq(0)").attr("data-sprite")); });
            if(sprite!="") existing.push(sprite);
            var newval = existing.toString();
            $("input[data-input="+id+"-sprites]").val(newval);

            //Add sprites to span
            refreshSprites();

            //Close modal
            $(".modal-cont").fadeOut();
            $(this).closest(".modal").fadeOut();
            saveInputs();
        }
    });

    //Auto-save on unfocus/keyup
    //$("input, textarea").keyup(saveInputs);
    $("input, textarea, select").focusout(saveInputs);

})();

/* Functions ------------------------------------------------------------------0*/
function saveInputs(){
    $("select").each(function(){
        var $t = $(this);
        if($t.attr("data-input").slice(0,7)=="sprite-"){
            var n = $t.attr("data-input").slice(7);
            $("[data-input=meta-"+n+"]").val($t.find("option:selected").text());
        }
    });

    var savedInputs = [];
    $("input, textarea, select").each(function(){
        savedInputs.push([$(this).attr("data-input"), $(this).val()]);
    });

    chrome.storage.sync.set({"savedInputs":savedInputs});
    return savedInputs;
}

function submit(){
    var data = saveInputs();

    chrome.tabs.getSelected(null, function(tab){
        chrome.tabs.sendRequest(tab.id, { data : data }, function(response){
            //console.log(response);
        });
    });
}

function isJson(str) {
    try { JSON.parse(str); }
    catch (e) { return false; }
    return true;
}

function refreshSprites(){
    saveInputs();
    $("input.playersp").each(function(e){
        var val = $(this).val();
        if(val.length>0){
            s = val.split(",");
            var playerid = $(this).attr("data-input").slice(0,-8);
            $("input[data-input="+playerid+"]").parent().parent().find("span:eq(0)").html("");
            s.forEach(function (v,i){
                $("input[data-input="+playerid+"]").parent().parent().find("span:eq(0)").append("<a href='#"+v+"'></a>");
            });
        } else {
            var playerid = $(this).attr("data-input").slice(0,-8);
            $("input[data-input="+playerid+"]").parent().parent().find("span:eq(0)").html("");
        }
    });
}