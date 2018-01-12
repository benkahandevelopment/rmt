//var match = {};
//var settings = {};

/* On document load -----------------------------------------------------------0*/
(function(){

    /* Event Listeners --------------------------------------------------------1*/

    // Close window
    $("#close").click(function(){ window.close(); });

    //Submit
    $("#confirmOutput button[data-action=submit]").click(submit);
    $("#saveCommentary").click(addCommentary);

    //Commentary
    $("select[data-input=comm-prepend]").change(function(e){
        var $t = $("input[data-input=comm-text]");
        var p = $(this).find(":selected").attr("data-prepend");
        if($.trim($t.val()).length<1&&p!=""){ $t.val("**"+p+"**: "); }
    });

    //Navigation
    $("#navigation li").click(function(){
        $("#navigation li").removeClass("selected");
        $(this).addClass("selected");
        $("#navoutput .page").hide();
        $("#navoutput .page[data-page='"+$(this).attr("data-nav")+"']").show();
        chrome.storage.sync.set({"lastPage":$(this).attr("data-nav")});
    });

    //Open last tab
    chrome.storage.sync.get({"lastPage":"meta"}, function(o){
        l = o.lastPage || "meta";
        $("#navigation li[data-nav="+l+"]").click();
    });

    //Check and load saved input data
    chrome.storage.sync.get({"savedInputs":[]}, function(o){
        o.savedInputs.forEach(function(i,v){ $("[data-input="+i[0]+"]").val(i[1]); });
        refreshSprites();
    });

    //Check and load saved commentary
    chrome.storage.sync.get({"savedCommentary":[]}, function(o){
        o.savedCommentary.forEach(function(v,i){
            var min = v[1]+"'";
            var ico = v[2];
            var com = $.trim((typeof unescape(v[0]).split("|")[2]!="undefined" ? unescape(v[0]).split("|")[2] : unescape(v[0])));
            var dataOutput = " "+min+"|"+ico+"|"+com;
            $("ul[data-output=commentary]").append("<li data-text='"+escape(dataOutput)+"' data-min=\""+v[1]+"'\" data-ico='"+v[2]+"'><a href='#' class='edit-commentary'>[Edit]</a>&nbsp;<span>"+v[1]+"' - "+com.replace(/\*\*([^\*]*)\*\*/g,"<b>$1</b>")+"</span></li>");
        });
    })

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
                if($.trim(v).length>0) $(".modal[data-modal=playerevent] ul.existing").append("<li><a href='#"+v+"' data-sprite='"+v+"'></a>&nbsp;<a href='#' class='removeSprite'>[×]</a></li>");
            })
        }

        $(".modal-cont").fadeIn();
        $(".modal[data-modal=playerevent]").fadeIn();
    });

    //Commentary Modification - Launch
    $(document).on('click',".edit-commentary", function(){
        var $t = $(this).parent();
        var n = $t.prevAll().length;

        $(".modal[data-modal=editcommentary] select").val(unescape($t.attr("data-ico"))).change();
        $(".modal[data-modal=editcommentary] input[type=hidden]").val(n);
        $(".modal[data-modal=editcommentary] input[type=number]").val($t.attr("data-min").slice(0,-1));
        $(".modal[data-modal=editcommentary] input[type=text]").val($.trim(unescape($t.attr("data-text")).split("|")[2]));

        $(".modal-cont").fadeIn();
        $(".modal[data-modal=editcommentary]").fadeIn();
    });

    //Commentary Modification - select change (for sprite icon display)
    $(".modal[data-modal=editcommentary] select").change(function(e){
        var n = $(this).find("option:selected:eq(0)").val();
        $(".modal .icon-preview").html("<a href='#"+n.replace(/\[\]\(\#([^\)]*)\)/g,"$1")+"'></a>");
    });

    //Modal Confirm
    $(".modal-confirm").click(function(e){
        var m = $(this).closest(".modal").attr("data-modal");
        if(m=="playerevent"){
            var id = $(".modal[data-modal=playerevent] input[name=player-name]").attr("data-playerid");
            var sprite = $(".modal[data-modal=playerevent] select[name=player-sprite] option:selected").val();
            var existing = [];
            $("ul.existing li").each(function(e){ existing.push($(this).find("a[data-sprite]:eq(0)").attr("data-sprite")); });
            if(sprite!="") existing.push(sprite);
            var newval = existing.toString();
            $("input[data-input="+id+"-sprites]").val(newval);
            refreshSprites();
            saveInputs();
        } else if(m=="editcommentary"){
            var $c = $(".modal[data-modal=editcommentary]");
            var l = parseInt($.trim($c.find("input[type=hidden]").val()));
            console.log(escape($c.find("select option:selected").val()));
            console.log($.trim($c.find("input[type=number]").val())+"'");
            console.log(escape($.trim($c.find("input[type=text]").val())));
            $p = $(".edit-commentary:eq("+l+")").parent();
            $p.attr("data-ico", escape($c.find("select option:selected").val()));
            $p.attr("data-min", $.trim($c.find("input[type=number]").val())+"'");
            $p.attr("data-text", escape($.trim($c.find("input[type=text]").val())));
            $p.find("span").html($.trim($c.find("input[type=number]").val())+"' - "+$.trim($c.find("input[type=text]").val().replace(/\*\*([^\*]*)\*\*/g,"<b>$1</b>")));
            saveCommentary();
        }

        //Close modal
        $(".modal-cont").fadeOut();
        $(this).closest(".modal").fadeOut();
    });

    //Modal Delete
    $(".modal-delete").click(function(e){
        var m = $(this).closest(".modal").attr("data-modal");
        if(m=="editcommentary"){
            if(confirm("Are you sure you wish to delete this entry?")){
                var n = $(this).closest(".modal").find("input[type=hidden]").val();
                $("ul[data-output=commentary] li:eq("+n+")").remove();
            }
        }
        saveCommentary();
        $(".modal-cont").fadeOut();
        $(this).closest(".modal").fadeOut();
    });


    //Auto-save on unfocus
    $("input, textarea, select").focusout(saveInputs);

})();

/* Functions ------------------------------------------------------------------0*/

//Save all input data
function saveInputs(){
    $("select[data-input]").each(function(){
        var $t = $(this);
        if($t.attr("data-input").slice(0,7)=="sprite-"){
            var n = $t.attr("data-input").slice(7);
            $("[data-input=meta-"+n+"]").val($t.find("option:selected").text());
        }
    });
    var savedInputs = [];
    $("input, textarea, select").not(".ignore").each(function(){ savedInputs.push([$(this).attr("data-input"), $(this).val()]); });
    chrome.storage.sync.set({"savedInputs":savedInputs});
    return savedInputs;
}

//Save commentary data to local storage
function saveCommentary(){
    var savedCommentary = [];
    $("ul[data-output=commentary] li").each(function(e){ savedCommentary.push([$.trim($(this).attr("data-text")),$(this).attr("data-min").slice(0,-1),$(this).attr("data-ico")]); });
    chrome.storage.sync.set({"savedCommentary":savedCommentary});
    return savedCommentary;
}

//On submit button press
function submit(){
    var data = saveInputs();
    saveCommentary();
    var commentary = getCommentary();
    chrome.tabs.getSelected(null, function(tab){
        chrome.tabs.sendRequest(tab.id, { data : data, commentary : commentary }, function(response){
            //console.log(response);
        });
    });
}

//Check if string is valid JSON
function isJson(str) {
    try { JSON.parse(str); }
    catch (e) { return false; }
    return true;
}

//Refresh all the sprites on Team page
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

//Submit commentary and save to local storage
function addCommentary(){
    var min = $("input[data-input=comm-minute]").val()+"'";
    var ico = $("select[data-input=comm-prepend]").find(":selected").val()=="" ? "" : "[](#"+$("select[data-input=comm-prepend]").find(":selected").val()+")";
    var com = $("input[data-input=comm-text]").val();

    if(min.length<2) { $("input[data-input=comm-minute]").focus(); return false; }

    var dataOutput = " "+min+"|"+ico+"|"+com;
    var actualOutput = "<li data-text='"+escape(dataOutput)+"' data-min="+min+" data-ico="+ico+"><a href='#' class='edit-commentary'>[Edit]</a>&nbsp;<span>"+min+" - "+com+"</span></li>";

    $("ul[data-output=commentary]").prepend(actualOutput);
    saveCommentary();
}

//Retrieve commentary data in display string format
function getCommentary(){
    var ret = "";
    $("ul[data-output=commentary] li").each(function(e){
        ret = $.trim(unescape($(this).attr("data-text")))+"  \n" + ret;
    });
    return ret;
}