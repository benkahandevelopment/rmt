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
		$("main[role=main]").attr("id",$(this).attr("data-output"));
		loadPage($(this).attr("data-output"),$(this));
	});

	$("a[data-output].disabled").click(function(e){
		e.preventDefault();
		return false;
	});
});

function loadPage(a, $t){
	loader(1);
	$("a[data-output]").removeClass("active");
	$("a[data-output="+a+"]").addClass("active"); //$t.addClass("active");
	$o.attr("src",a+".html");
	setTimeout(adjustSize,100);
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
