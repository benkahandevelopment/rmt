/* Settings variables */
var $settings;
chrome.storage.sync.get("settings", function(o){
	$settings = o.settings;
});
var $o = $("#mainoutput");

/* On pageload */
$(function(){
	//Check to see if page already specified
	if(window.location.hash){
		setTimeout(function(){
			$("a[data-output="+window.location.hash.slice(1)+"]").click();
		}, 100);
	} else loader(0);

	//On save button click (settings)
	$("#saveBtn").click(saveAll);

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
});

//Load page function
function loadPage(pageName, $this, isSettings){
	loader(1);
	$("a[data-output]").removeClass("active");
	$("a[data-output="+pageName+"]").addClass("active"); //$t.addClass("active");
	if(s){
		retrieveAll();
		$("[data-output-cont=settings]").show();
		$("[data-output-cont=documentation]").hide();
		loader(0);
	} else {
		$("[data-output-cont=settings]").hide();
		$("[data-output-cont=documentation]").show().find("iframe:eq(0)").attr("src","docs/"+pageName+".html");

		//Adjust iframe size
		var iframeid = document.getElementById("mainoutput");
		if(iframeid){
			iframeid.height = "";
			iframeid.height = iframeid.contentWindow.document.body.scrollHeight+"px";
			loader(0);
		} else { loader(0); }
	}
}

//Show/hide loader
function loader(o){
	if(o==1) $("#loader").fadeIn(50);
		else $("#loader").fadeOut(150);
}

//Retrieve all settings saved data
function retrieveAll(){
	chrome.storage.sync.get("settings", function(o){
		var s = o.settings;
		var a = $.map(s, function(n,i){
			return [[i,n]]
		});
		a.forEach(function(v,i){
			var $f = $("[data-input-settings='"+v[0]+"']");
			if($f.attr("type")=="checkbox") $f.prop("checked",v[1]?"checked":false);
				else $f.val(v[1]);
		});
	});
	loader(0);
}

//Save all settings data to local storage
function saveAll(){
	loader(1);
	var settings = {};
	$("[data-input-settings]:not(.ignore)").each(function(e){
		var $t = $(this);
		var n = $t.attr("data-input-settings");
		settings[n] = getVal(n);
	});
	chrome.storage.sync.set({"settings":settings});
	retrieveAll();
	return settings;
}

//Get field value
function getVal(field){
	var $f = $("[data-input-settings='"+field+"']");
	return $f.attr("type")=="checkbox" ? $f.prop("checked") : $f.val();
}
