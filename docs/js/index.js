/* Settings variables */
var $o = $("#mainoutput");

/* On pageload */
$(function(){

	//Check to see if page already specified
	if(window.location.hash){
    	setTimeout(function(){
			$("a[data-output="+window.location.hash.slice(1)+"]").click();
		}, 100);
	} else {
		setTimeout(function(){
			$("a[data-output=getting_started]").click();
		}, 100);
	}

	//On navmenu click
	$("a[data-output]:not(.disabled)").click(function(e){
		var d = $(this).attr("data-output");
		s = d.substr(0,8)=="settings" ? true : false;
		$("main[role=main]").attr("id",d);
		loadPage(d,$(this),s);
	});

	//On a.disabled link click
	$("a[data-output].disabled").click(function(e){
		e.preventDefault();
		return false;
	});

    //Other
    $("[data-toggle='popover']").popover({
        html : true,
        template : '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-header"></h3><div class="popover-body p-0"></div></div>'
    });
});

//Load page function
function loadPage(pageName, $this, isSettings){
	loader(1);
	$("a[data-output]").removeClass("active");
	$("a[data-output="+pageName+"]").addClass("active"); //$t.addClass("active");
	$("[data-output-cont=settings]").hide();
	$("[data-output-cont=documentation]").load("docs/"+pageName+".html").show();
	loader(0);

}

//Show/hide loader
function loader(o){
	if(o==1) $("#loader").fadeIn(50);
		else $("#loader").fadeOut(150);
}
