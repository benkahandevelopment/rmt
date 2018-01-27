/* Settings variables */
var $settings;
chrome.storage.sync.get({"settings" : def_settings}, function(o){ $settings = o.settings; });
var $o = $("#mainoutput");
var $l = $("#logoutput");

/* On pageload */
$(function(){
	//For debugging
    var exLog = console.log;
    console.log = function(msg) {
        exLog.apply(this, arguments);
		$l.append(`<li>`+new Date().format("HH:MM:ss.l")+` > `+msg.replace(/\%c/g,"").replace(/rMT\s+\>+/g,"")+`</li>`);
		$l.scrollTop($l[0].scrollHeight);
    }

	//Execute settings...
	executeSettings();

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

    //Settings manouvering
    $("[data-input-settings='adv_debug']:checkbox").change(function(){
        $("[data-input-settings='adv_debug_verbose']:checkbox").prop("disabled",($(this).prop("checked") ? false : "disabled"));
        $(this).parent().parent().next("div.form-group").addClass($(this).prop("checked") ? "" : "text-muted").removeClass($(this).prop("checked") ? "text-muted" : "");
    })

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

    //Other
    $("[data-toggle='popover']").popover({html:true});
});

//Load page function
function loadPage(pageName, $this, isSettings){
	loader(1);
	$("a[data-output]").removeClass("active");
	$("a[data-output="+pageName+"]").addClass("active"); //$t.addClass("active");
	if(s){
		debug("Loading 'settings' page");
		retrieveAll();
		$("[data-output-cont=settings]").show();
		$("[data-output-cont=documentation]").hide();
		loader(0);
	} else {
		debug("Loading '"+pageName+"' page");
		$("[data-output-cont=settings]").hide();
		$("[data-output-cont=documentation]").show().find("iframe:eq(0)").attr("src","docs/"+pageName+".html");

		//Adjust iframe size
		var iframeid = document.getElementById("mainoutput");
		if(iframeid){
			setTimeout(function(){
				iframeid.height = "";
				iframeid.height = iframeid.contentWindow.document.body.scrollHeight+"px";
				loader(0);
			},150);
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
	debug("Retrieving settings and saved data");
	chrome.storage.sync.get("settings", function(o){
		var s = o.settings;
		var a = $.map(s, function(n,i){
			return [[i,n]]
		});
		a.forEach(function(v,i){
            debug(`Retrieved setting "${v[0]}": "`+(v[1].length>32?v[1].slice(0,15)+"...\" {truncated}":v[1]+"\""));
			var $f = $("[data-input-settings='"+v[0]+"']");
			if($f.attr("type")=="checkbox") $f.prop("checked",v[1]?"checked":false);
				else $f.val(v[1]);
		});

        //Setting specific values
            //Debugging Mode
            $("[data-input-settings='adv_debug_verbose']:checkbox").prop("disabled",($("[data-input-settings='adv_debug']:checkbox").prop("checked") ? false : "disabled"));
            $("[data-input-settings='adv_debug']:checkbox").parent().parent().next("div.form-group").addClass($("[data-input-settings='adv_debug']:checkbox").prop("checked") ? "" : "text-muted").removeClass($("[data-input-settings='adv_debug']:checkbox").prop("checked") ? "text-muted" : "");

        $(this).parent().parent().next("div.form-group").addClass($(this).prop("checked") ? "" : "text-muted").removeClass($(this).prop("checked") ? "text-muted" : "");
	});
	loader(0);
}

//Save all settings data to local storage
function saveAll(){
	loader(1);
	debug("Saving all settings data");
	var settings = {};
	$("[data-input-settings]:not(.ignore)").each(function(e){
		var $t = $(this);
		var n = $t.attr("data-input-settings");
		settings[n] = getVal(n);
	});
	chrome.storage.sync.set({"settings":settings});
	retrieveAll();
	$settings = settings;
	executeSettings();
	return settings;
}

//Get field value
function getVal(field){
	var $f = $("[data-input-settings='"+field+"']");
	return $f.attr("type")=="checkbox" ? $f.prop("checked") : $f.val();
}

//Debug messages
function debug(message,mode){
	if($settings.adv_debug){
		var mode = mode || 0;
		var css = {
			br: "color:#9954BB;font-weight:900;text-shadow:0 1px 0 rgba(255,255,255,0.4),0 -1px 0 rgba(0,0,0,0.3);",
			standard: "color:inherit;font-weight:normal;",
			error: "color:red;font-weight:bold;",
			errormsg: "color:red;font-weight:normal",
            caller: "color:#777;font-style:italic"
		}

		/* Modes
		0 		default		rMT > {message}
		1		error		rMT > ERROR: {message}
		*/
        message += (($settings.adv_debug_verbose)&&(debug.caller.name!="")) ? `\n\t\t\t%cCalled by function "${debug.caller.name}"` : "";
		var prefix = "%crMT > "
		if(mode==0){
            if($settings.adv_debug_verbose&&debug.caller.name!="") console.log(prefix+"%c"+message,css.br,css.standard,css.caller);
			else console.log(prefix+"%c"+message,css.br,css.standard);
		} else if(mode==1){
            if($settings.adv_debug_verbose&&debug.caller.name!="") console.log(prefix+"%cERROR: %c"+message,css.br,css.error,css.errormsg,css.caller);
			else console.log(prefix+"%cERROR: %c"+message,css.br,css.error,css.errormsg);
		}
	}
}

function executeSettings(){
	if($settings.adv_debug) $("#logoutput-cont").show();
		else $("#logoutput-cont").hide();

    $("[data-manifest-meta]").each(function(){
        var $t = $(this);
        if($t.html()==""){
            try { $t.html($settings.manifest[$t.data("manifest-meta")]); } catch(e) { debug("Error reading manifest\n\t\t\t"+e,1);}
        }
    });
}

/*
 * Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 */

	var dateFormat = function () {
		var	token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
			timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
			timezoneClip = /[^-+\dA-Z]/g,
			pad = function (val, len) {
				val = String(val);
				len = len || 2;
				while (val.length < len) val = "0" + val;
				return val;
			};

		// Regexes and supporting functions are cached through closure
		return function (date, mask, utc) {
			var dF = dateFormat;

			// You can't provide utc if you skip other args (use the "UTC:" mask prefix)
			if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
				mask = date;
				date = undefined;
			}

			// Passing date through Date applies Date.parse, if necessary
			date = date ? new Date(date) : new Date;
			if (isNaN(date)) throw SyntaxError("invalid date");

			mask = String(dF.masks[mask] || mask || dF.masks["default"]);

			// Allow setting the utc argument via the mask
			if (mask.slice(0, 4) == "UTC:") {
				mask = mask.slice(4);
				utc = true;
			}

			var	_ = utc ? "getUTC" : "get",
				d = date[_ + "Date"](),
				D = date[_ + "Day"](),
				m = date[_ + "Month"](),
				y = date[_ + "FullYear"](),
				H = date[_ + "Hours"](),
				M = date[_ + "Minutes"](),
				s = date[_ + "Seconds"](),
				L = date[_ + "Milliseconds"](),
				o = utc ? 0 : date.getTimezoneOffset(),
				flags = {
					d:    d,
					dd:   pad(d),
					ddd:  dF.i18n.dayNames[D],
					dddd: dF.i18n.dayNames[D + 7],
					m:    m + 1,
					mm:   pad(m + 1),
					mmm:  dF.i18n.monthNames[m],
					mmmm: dF.i18n.monthNames[m + 12],
					yy:   String(y).slice(2),
					yyyy: y,
					h:    H % 12 || 12,
					hh:   pad(H % 12 || 12),
					H:    H,
					HH:   pad(H),
					M:    M,
					MM:   pad(M),
					s:    s,
					ss:   pad(s),
					l:    pad(L, 3),
					L:    pad(L > 99 ? Math.round(L / 10) : L),
					t:    H < 12 ? "a"  : "p",
					tt:   H < 12 ? "am" : "pm",
					T:    H < 12 ? "A"  : "P",
					TT:   H < 12 ? "AM" : "PM",
					Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
					o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
					S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
				};

			return mask.replace(token, function ($0) {
				return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
			});
		};
	}();

	// Some common format strings
	dateFormat.masks = {
		"default":      "ddd mmm dd yyyy HH:MM:ss",
		shortDate:      "m/d/yy",
		mediumDate:     "mmm d, yyyy",
		longDate:       "mmmm d, yyyy",
		fullDate:       "dddd, mmmm d, yyyy",
		shortTime:      "h:MM TT",
		mediumTime:     "h:MM:ss TT",
		longTime:       "h:MM:ss TT Z",
		isoDate:        "yyyy-mm-dd",
		isoTime:        "HH:MM:ss",
		isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
		isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
	};

	// Internationalization strings
	dateFormat.i18n = {
		dayNames: [
			"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
			"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
		],
		monthNames: [
			"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
			"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
		]
	};

	// For convenience...
	Date.prototype.format = function (mask, utc) {
		return dateFormat(this, mask, utc);
	};
