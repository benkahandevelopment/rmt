var output = [];
var n = 0;
var interval = null;
var iframeid = document.getElementById("mainoutput");
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
		$("main[role=main]").attr("id",$(this).attr("data-output"));
		loadPage($(this).attr("data-output"),$(this));
	});

	$("a[data-output].disabled").click(function(e){
		e.preventDefault();
		return false;
	});

	$o.on('load', adjustSize);
});

function loadPage(a, $t){
	loader(1);
	$("a[data-output]").removeClass("active");
	$("a[data-output="+a+"]").addClass("active"); //$t.addClass("active");
	$o.attr("src", "/rmt/"+a+".html");
	n = 0;
	setTimeout(adjustSize,100);
}

function adjustSize(){
	var iframeid = document.getElementById("mainoutput");
	var iframedoc = iframeid.contentDocument || iframe.contentWindow.document;
	n = n + 100;
	if(iframedoc.readyState =='complete'){
		//iframeid.contentWindow.onload = function(){
			iframeid.height = "";
			iframeid.height = iframeid.contentWindow.document.body.scrollHeight+"px";
			loader(0);
		//}
	} else {
		window.setTimeout(adjustSize,100);
	}
}

function loader(o){
	if(o==1) $("#loader").show();
		else $("#loader").hide();

}
