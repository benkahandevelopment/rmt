var output = [];
var $o = $("#mainoutput");
var css = [
		"bootstrap.min.css",
		"superhero.theme.min.css",
		"options.css",
		"fa.css",
		"sprites.css",
	];


$(function(){
	//Check to see if page already specified
	if(window.location.hash){
		setTimeout(function(){
			$("a[data-output="+window.location.hash.slice(1)+"]").click();
		}, 100);
	} else loader(0);

	$("a[data-output]:not(.disabled)").click(function(e){
		var d = $(this).attr("data-output");
		s = d.substr(0,8)=="settings" ? true : false;
		$("main[role=main]").attr("id",d);
		loadPage(d,$(this),s);
		//e.preventDefault();
	});

	$("a[data-output].disabled").click(function(e){
		e.preventDefault();
		return false;
	});
});

function loadPage(pageName, $this, isSettings){
	loader(1);
	$("a[data-output]").removeClass("active");
	$("a[data-output="+pageName+"]").addClass("active"); //$t.addClass("active");
	if(s){
		$("[data-output-cont=settings]").show();
		$("[data-output-cont=documentation]").hide();
		loader(0);
	} else {
		$("[data-output-cont=settings]").hide();
		$("[data-output-cont=documentation]").show().find("iframe:eq(0)").attr("src","docs/"+pageName+".html");
		setTimeout(adjustSize,100);
	}
}

function adjustSize(){
	var iframeid = document.getElementById("mainoutput");
	if(iframeid){
		iframeid.height = "";
		iframeid.height = iframeid.contentWindow.document.body.scrollHeight+"px";
		loader(0);
	} else { loader(0); }
}

function loader(o){
	if(o==1) $("#loader").show();
		else $("#loader").hide();
}
