/**
 * reddit Match Threader
 * by /u/magicwings
 *
 **/


var $log = {};
var $settings;


(function(){
	//On page load
	chrome.storage.sync.get({"settings" : def_settings}, function(o){ $settings = o.settings; });
})();

//On receiving data
chrome.extension.onRequest.addListener(function(request, sender, sendResponse){
	debug("Received data from popup on "+dateTime()+"...");
	$log.time_start = new Date().getTime();

	//Update current post - received "data"
	if(request.data){
		//Get access
		var $editBtn = $("#siteTable a.edit-usertext");
		if($editBtn.length<1) {
			debug("Invalid editing permissions for this post",1);
			return false;
		}
		$("#siteTable a.edit-usertext")[0].click();
		debug("Post edit process started");

		//Start data handling
		var d = request.data;
		var u = request.commentary;
		var $textarea = $(".md-container .md textarea:eq(0)");
		var c = $textarea.val();

		//Meta
		c = replaceMeta(c, [
				"META_HOMETEAM",
				"META_AWAYTEAM",
				"META_VENUE",
				"META_KICKOFF",
				"META_REFEREE",
				"META_TOURNAMENT",
				"SPRITE_TOURNAMENT",
			], [
				"meta-home",
				"meta-away",
				"meta-venue",
				"meta-kickoff",
				"meta-referee",
				"meta-tournament",
				"sprite-tournament"
			], d);

		//Teams
		c = replaceTeams(c, d);

		//Stats
		c = replaceStats(c, d);

		//Commentary
		c = replaceCommentary(c, u);

		//Other
		debug("Generating 'footer'",2);
		c = c.replace(/\{\{FOOTER\}\}/g, "[](#rmt-start-footer)"+output("footer")+"[](#rmt-end-footer)");
			c = c.replace(/\[\]\(\#rmt\-start\-footer\)[\s\S]*\[\]\(\#rmt\-end\-footer\)/g, "[](#rmt-start-footer)"+output("footer")+"[](#rmt-end-footer)");

		debug("Generating 'timestamp'",2);
		c = c.replace(/\{\{TIMESTAMP\}\}/g, "[](#rmt-start-timestamp)"+output("timestamp")+"[](#rmt-end-timestamp)");
			c = c.replace(/\[\]\(\#rmt\-start\-timestamp\).*\[\]\(\#rmt\-end\-timestamp\)/g, "[](#rmt-start-timestamp)"+output("timestamp")+"[](#rmt-end-timestamp)");

		debug("Generating 'reddit stream link'",2);
		c = c.replace(/\{\{RSTREAM\}\}/g, "[](#rmt-start-rstream)"+output("rstream")+"[](#rmt-end-rstream)");
			c = c.replace(/\[\]\(\#rmt\-start\-rstream\).*\[\]\(\#rmt\-end\-rstream\)/g, "[](#rmt-start-rstream)"+output("rstream")+"[](#rmt-end-rstream)");

		//Add to textarea and save post
		$textarea.val(c);
		$log.time_end = new Date().getTime();
		debug("Process completed in "+($log.time_end-$log.time_start)+"ms");
		if($settings.gen_submit) $("#siteTable div.usertext-buttons button.save")[0].click();
	}
});


/* Functions ------------------------------------------------------------------*/

//Value finder
function findVal(a,s){
    //a is array, s is key for value
    var ret = "";
    a.forEach(function(i,v){
        if(i[0]==s) ret = i[1];
    });
	return ret;
}

//Sprites generator
function findSprites(a,s){
	var ret = "";
	var val = findVal(a,s);
	var arr = val.split(",");

	arr.forEach(function(v,i){
		if(v.length>0) ret += "[](#"+v+")";
	});

	return ret;
}

//Meta generator
function replaceMeta(startVal, metaName, spriteName, requestData){
	var ret = startVal;
	metaName.forEach(function(v,i){
		var val = findVal(requestData,spriteName[i]);
		var withMeta = ret.replace(new RegExp(sanitise("{{"+v+"}}"),"g"), "[](#rmt-start-"+spriteName[i]+")[](#rmt-end-"+spriteName[i]+")");
		ret = withMeta.replace(new RegExp(sanitise("[](#rmt-start-"+spriteName[i]+")")+".*"+sanitise("[](#rmt-end-"+spriteName[i]+")"),"g"), "[](#rmt-start-"+spriteName[i]+")"+val+"[](#rmt-end-"+spriteName[i]+")");
	});
	debug("Meta",2);
	return ret;
}

//Commentary generator
function replaceCommentary(startVal, requestData){
	var r = startVal.replace("{{FULL_COMMENTARY}}", "[](#rmt-start-full-commentary)[](#rmt-end-full-commentary)");
	//console.log(sanitise("[](#rmt-start-full-commentary)")+".*"+sanitise("[](#rmt-end-full-commentary)"));
	r = r.replace(/\[\]\(\#rmt\-start\-full\-commentary\)[\s\S]*\[\]\(\#rmt\-end\-full\-commentary\)/g, "[](#rmt-start-full-commentary)"+requestData+"[](#rmt-end-full-commentary)");
	debug("Commentary",2);
	return r;
}

//Lineups generator
function replaceTeams(startVal, requestData){
	var lineups_full =
	" "+findSprites(requestData,"home-xi-0-sprites")+"|"+findVal(requestData,"home-xi-0")+"|"+findVal(requestData,"away-xi-0")+"|"+findSprites(requestData,"away-xi-0-sprites")+"  \n" +
	" "+findSprites(requestData,"home-xi-1-sprites")+"|"+findVal(requestData,"home-xi-1")+"|"+findVal(requestData,"away-xi-1")+"|"+findSprites(requestData,"away-xi-1-sprites")+"  \n" +
	" "+findSprites(requestData,"home-xi-2-sprites")+"|"+findVal(requestData,"home-xi-2")+"|"+findVal(requestData,"away-xi-2")+"|"+findSprites(requestData,"away-xi-2-sprites")+"  \n" +
	" "+findSprites(requestData,"home-xi-3-sprites")+"|"+findVal(requestData,"home-xi-3")+"|"+findVal(requestData,"away-xi-3")+"|"+findSprites(requestData,"away-xi-3-sprites")+"  \n" +
	" "+findSprites(requestData,"home-xi-4-sprites")+"|"+findVal(requestData,"home-xi-4")+"|"+findVal(requestData,"away-xi-4")+"|"+findSprites(requestData,"away-xi-4-sprites")+"  \n" +
	" "+findSprites(requestData,"home-xi-5-sprites")+"|"+findVal(requestData,"home-xi-5")+"|"+findVal(requestData,"away-xi-5")+"|"+findSprites(requestData,"away-xi-5-sprites")+"  \n" +
	" "+findSprites(requestData,"home-xi-6-sprites")+"|"+findVal(requestData,"home-xi-6")+"|"+findVal(requestData,"away-xi-6")+"|"+findSprites(requestData,"away-xi-6-sprites")+"  \n" +
	" "+findSprites(requestData,"home-xi-7-sprites")+"|"+findVal(requestData,"home-xi-7")+"|"+findVal(requestData,"away-xi-7")+"|"+findSprites(requestData,"away-xi-7-sprites")+"  \n" +
	" "+findSprites(requestData,"home-xi-8-sprites")+"|"+findVal(requestData,"home-xi-8")+"|"+findVal(requestData,"away-xi-8")+"|"+findSprites(requestData,"away-xi-8-sprites")+"  \n" +
	" "+findSprites(requestData,"home-xi-9-sprites")+"|"+findVal(requestData,"home-xi-9")+"|"+findVal(requestData,"away-xi-9")+"|"+findSprites(requestData,"away-xi-9-sprites")+"  \n" +
	" "+findSprites(requestData,"home-xi-10-sprites")+"|"+findVal(requestData,"home-xi-10")+"|"+findVal(requestData,"away-xi-10")+"|"+findSprites(requestData,"away-xi-10-sprites")+"  \n" +
	" |*Subs*|*Subs*|  \n" +
	" "+findSprites(requestData,"home-bench-0-sprites")+"|"+findVal(requestData,"home-bench-0")+"|"+findVal(requestData,"away-bench-0")+"|"+findSprites(requestData,"away-bench-0-sprites")+"  \n" +
	" "+findSprites(requestData,"home-bench-1-sprites")+"|"+findVal(requestData,"home-bench-1")+"|"+findVal(requestData,"away-bench-1")+"|"+findSprites(requestData,"away-bench-1-sprites")+"  \n" +
	" "+findSprites(requestData,"home-bench-2-sprites")+"|"+findVal(requestData,"home-bench-2")+"|"+findVal(requestData,"away-bench-2")+"|"+findSprites(requestData,"away-bench-2-sprites")+"  \n" +
	" "+findSprites(requestData,"home-bench-3-sprites")+"|"+findVal(requestData,"home-bench-3")+"|"+findVal(requestData,"away-bench-3")+"|"+findSprites(requestData,"away-bench-3-sprites")+"  \n" +
	" "+findSprites(requestData,"home-bench-4-sprites")+"|"+findVal(requestData,"home-bench-4")+"|"+findVal(requestData,"away-bench-4")+"|"+findSprites(requestData,"away-bench-4-sprites")+"  \n" +
	" "+findSprites(requestData,"home-bench-5-sprites")+"|"+findVal(requestData,"home-bench-5")+"|"+findVal(requestData,"away-bench-5")+"|"+findSprites(requestData,"away-bench-5-sprites")+"  \n" +
	" "+findSprites(requestData,"home-bench-6-sprites")+"|"+findVal(requestData,"home-bench-6")+"|"+findVal(requestData,"away-bench-6")+"|"+findSprites(requestData,"away-bench-6-sprites")+"  \n";


	var ret = startVal.replace(/\{\{LINEUPS_FULL\}\}/g, "[](#rmt-start-lineups-full)"+lineups_full+"[](#rmt-end-lineups-full)");
	ret = ret.replace(/\[\]\(\#rmt\-start\-lineups\-full\)[\s\S]*\[\]\(\#rmt\-end\-lineups\-full\)/g, "[](#rmt-start-lineups-full)"+lineups_full+"[](#rmt-end-lineups-full)");

	debug("Teams",2);
	return ret;
}

//Statistics generator
function replaceStats(startVal, requestData){
	var h = "";
	var a = "";
	var hl = "";
	var al = "";

	var hc = findVal(requestData, "meta-home-colour");
	var ac = findVal(requestData, "meta-away-colour");

	var stats_full = "";
			h = parseInt(findVal(requestData, "stat-home-shotson"));
			a = parseInt(findVal(requestData, "stat-away-shotson"));
			hl = isNaN(h) ? 0 : (h>16||a>16 ? Math.round(h/(h+a)*10)*2 : h);
			al = isNaN(a) ? 0 : (h>16||a>16 ? 16-hl : a);
		stats_full += " "+"["+h+"](#bar-"+hl+"-"+hc+")|Shots (on target)|["+a+"](#bar-"+al+"-"+ac+")  \n";
			h = parseInt(findVal(requestData, "stat-home-shotsoff"));
			a = parseInt(findVal(requestData, "stat-away-shotsoff"));
			hl = isNaN(h) ? 0 : (h>16||a>16 ? Math.round(h/(h+a)*10)*2 : h);
			al = isNaN(a) ? 0 : (h>16||a>16 ? 16-hl : a);
		stats_full += " "+"["+h+"](#bar-"+hl+"-"+hc+")| Shots (off target) |["+a+"](#bar-"+al+"-"+ac+")  \n";
			h = parseInt(findVal(requestData, "stat-home-possession"));
			a = parseInt(findVal(requestData, "stat-away-possession"));
			hl = isNaN(h) ? 0 : (h>16||a>16 ? Math.round(h/(h+a)*10)*2 : h);
			al = isNaN(a) ? 0 : (h>16||a>16 ? 16-hl : a);
		stats_full += " "+"["+h+"%](#bar-"+hl+"-"+hc+")| Possession |["+a+"%](#bar-"+al+"-"+ac+")  \n";
			h = parseInt(findVal(requestData, "stat-home-corners"));
			a = parseInt(findVal(requestData, "stat-away-corners"));
			hl = isNaN(h) ? 0 : (h>16||a>16 ? Math.round(h/(h+a)*10)*2 : h);
			al = isNaN(a) ? 0 : (h>16||a>16 ? 16-hl : a);
		stats_full += " "+"["+h+"](#bar-"+hl+"-"+hc+")| Corners |["+a+"](#bar-"+al+"-"+ac+")  \n";
			h = parseInt(findVal(requestData, "stat-home-fouls"));
			a = parseInt(findVal(requestData, "stat-away-fouls"));
			hl = isNaN(h) ? 0 : (h>16||a>16 ? Math.round(h/(h+a)*10)*2 : h);
			al = isNaN(a) ? 0 : (h>16||a>16 ? 16-hl : a);
		stats_full += " "+"["+h+"](#bar-"+hl+"-"+hc+")| Fouls |["+a+"](#bar-"+al+"-"+ac+")  \n";
			h = parseInt(findVal(requestData, "stat-home-offsides"));
			a = parseInt(findVal(requestData, "stat-away-offsides"));
			hl = isNaN(h) ? 0 : (h>16||a>16 ? Math.round(h/(h+a)*10)*2 : h);
			al = isNaN(a) ? 0 : (h>16||a>16 ? 16-hl : a);
		stats_full += " "+"["+h+"](#bar-"+hl+"-"+hc+")| Offsides |["+a+"](#bar-"+al+"-"+ac+")  \n";
			h = parseInt(findVal(requestData, "stat-home-yellows"));
			a = parseInt(findVal(requestData, "stat-away-yellows"));
			hl = isNaN(h) ? 0 : (h>16||a>16 ? Math.round(h/(h+a)*10)*2 : h);
			al = isNaN(a) ? 0 : (h>16||a>16 ? 16-hl : a);
		stats_full += " "+"["+h+"](#bar-"+hl+"-"+hc+")| Bookings |["+a+"](#bar-"+al+"-"+ac+")  \n";
			h = parseInt(findVal(requestData, "stat-home-reds"));
			a = parseInt(findVal(requestData, "stat-away-reds"));
			hl = isNaN(h) ? 0 : (h>16||a>16 ? Math.round(h/(h+a)*10)*2 : h);
			al = isNaN(a) ? 0 : (h>16||a>16 ? 16-hl : a);
		stats_full += " "+"["+h+"](#bar-"+hl+"-"+hc+")| Sending Offs |["+a+"](#bar-"+al+"-"+ac+")  \n";

	var stats_full_reverse = "";
			h = parseInt(findVal(requestData, "stat-home-shotson"));
			a = parseInt(findVal(requestData, "stat-away-shotson"));
			hl = isNaN(h) ? 0 : Math.round(h/(h+a)*16);
			al = isNaN(a) ? 0 : 16-hl;
			if(a==0&&h==0) { al=8; hl=8; }
		stats_full_reverse += " Shots (on target)|"+(hl>0?"["+h+"](#bar-"+hl+"-"+hc+")":"")+(al>0?"["+a+"](#bar-"+al+"-"+ac+")":"")+"  \n";
			h = parseInt(findVal(requestData, "stat-home-shotsoff"));
			a = parseInt(findVal(requestData, "stat-away-shotsoff"));
			hl = isNaN(h) ? 0 : Math.round(h/(h+a)*16);
			al = isNaN(a) ? 0 : 16-hl;
			if(a==0&&h==0) { al=8; hl=8; }
		stats_full_reverse += " Shots (off target) |"+(hl>0?"["+h+"](#bar-"+hl+"-"+hc+")":"")+(al>0?"["+a+"](#bar-"+al+"-"+ac+")":"")+"  \n";
			h = parseInt(findVal(requestData, "stat-home-possession"));
			a = parseInt(findVal(requestData, "stat-away-possession"));
			hl = isNaN(h) ? 0 : Math.round(h/(h+a)*16);
			al = isNaN(a) ? 0 : 16-hl;
			if(a==0&&h==0) { al=8; hl=8; }
		stats_full_reverse += " Possession |"+(hl>0?"["+h+"%](#bar-"+hl+"-"+hc+")":"")+(al>0?"["+a+"%](#bar-"+al+"-"+ac+")":"")+"  \n";
			h = parseInt(findVal(requestData, "stat-home-corners"));
			a = parseInt(findVal(requestData, "stat-away-corners"));
			hl = isNaN(h) ? 0 : Math.round(h/(h+a)*16);
			al = isNaN(a) ? 0 : 16-hl;
			if(a==0&&h==0) { al=8; hl=8; }
		stats_full_reverse += " Corners |"+(hl>0?"["+h+"](#bar-"+hl+"-"+hc+")":"")+(al>0?"["+a+"](#bar-"+al+"-"+ac+")":"")+"  \n";
			h = parseInt(findVal(requestData, "stat-home-fouls"));
			a = parseInt(findVal(requestData, "stat-away-fouls"));
			hl = isNaN(h) ? 0 : Math.round(h/(h+a)*16);
			al = isNaN(a) ? 0 : 16-hl;
			if(a==0&&h==0) { al=8; hl=8; }
		stats_full_reverse += " Fouls |"+(hl>0?"["+h+"](#bar-"+hl+"-"+hc+")":"")+(al>0?"["+a+"](#bar-"+al+"-"+ac+")":"")+"  \n";
			h = parseInt(findVal(requestData, "stat-home-offsides"));
			a = parseInt(findVal(requestData, "stat-away-offsides"));
			hl = isNaN(h) ? 0 : Math.round(h/(h+a)*16);
			al = isNaN(a) ? 0 : 16-hl;
			if(a==0&&h==0) { al=8; hl=8; }
		stats_full_reverse += " Offsides |"+(hl>0?"["+h+"](#bar-"+hl+"-"+hc+")":"")+(al>0?"["+a+"](#bar-"+al+"-"+ac+")":"")+"  \n";
			h = parseInt(findVal(requestData, "stat-home-yellows"));
			a = parseInt(findVal(requestData, "stat-away-yellows"));
			hl = isNaN(h) ? 0 : Math.round(h/(h+a)*16);
			al = isNaN(a) ? 0 : 16-hl;
			if(a==0&&h==0) { al=8; hl=8; }
		stats_full_reverse += " Bookings |"+(hl>0?"["+h+"](#bar-"+hl+"-"+hc+")":"")+(al>0?"["+a+"](#bar-"+al+"-"+ac+")":"")+"  \n";
			h = parseInt(findVal(requestData, "stat-home-reds"));
			a = parseInt(findVal(requestData, "stat-away-reds"));
			hl = isNaN(h) ? 0 : Math.round(h/(h+a)*16);
			al = isNaN(a) ? 0 : 16-hl;
			if(a==0&&h==0) { al=8; hl=8; }
		stats_full_reverse += " Sending Offs |"+(hl>0?"["+h+"](#bar-"+hl+"-"+hc+")":"")+(al>0?"["+a+"](#bar-"+al+"-"+ac+")":"")+"  \n";

	var ret = startVal.replace(/\{\{STATS_FULL\}\}/g, "[](#rmt-start-stats-full)"+stats_full+"[](#rmt-end-stats-full)");
	ret = ret.replace(/\{\{STATS_FULL_REVERSE\}\}/g, "[](#rmt-start-stats-full-reverse)"+stats_full_reverse+"[](#rmt-end-stats-full-reverse)");
	ret = ret.replace(/\[\]\(\#rmt\-start\-stats\-full\)[\s\S]*\[\]\(\#rmt\-end\-stats\-full\)/g, "[](#rmt-start-stats-full)"+stats_full+"[](#rmt-end-stats-full)");
	ret = ret.replace(/\[\]\(\#rmt\-start\-stats\-full\-reverse\)[\s\S]*\[\]\(\#rmt\-end\-stats\-full\-reverse\)/g, "[](#rmt-start-stats-full-reverse)"+stats_full_reverse+"[](#rmt-end-stats-full-reverse)");

	debug("Statistics",2);
	return ret;
}

//Sanitise string
function sanitise(i){
	return i.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

//Create new datetime string
function dateTime(){
	var now = new Date();
	return now.getUTCDate() + " " +
			monthString((now.getUTCMonth() + 1)) + " " +
			now.getUTCFullYear().toString() + " at " +
			("0"+now.getUTCHours()).slice(-2) + ":" +
			("0"+now.getUTCMinutes()).slice(-2) + ":" +
			("0"+now.getUTCSeconds()).slice(-2) + " UTC";
}


//Convert month int to 3-letter month string
function monthString(n){
	var r;
	switch(n){
		case 1:
			r = "Jan";
			break;
		case 2:
			r = "Feb";
			break;
		case 3:
			r = "Mar";
			break;
		case 4:
			r = "Apr";
			break;
		case 5:
			r = "May";
			break;
		case 6:
			r = "Jun";
			break;
		case 7:
			r = "Jul";
			break;
		case 8:
			r = "Aug";
			break;
		case 9:
			r = "Sep";
			break;
		case 10:
			r = "Oct";
			break;
		case 11:
			r = "Nov";
			break;
		case 12:
			r = "Dec";
			break;
		default:
			r = "?";
			break;
	}
	return r;
}

//Return specific outputs
function output(n){
	if(n=="footer"){
		return "  \n\n---\n\n^(Managed by the **reddit Match Threader** by /u/magicwings. Last updated on "+dateTime()+")";
	} else if(n=="timestamp"){
		var currentdate = new Date();
		return currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/"
                + currentdate.getFullYear() + " @ "
                + currentdate.getHours() + ":"
                + currentdate.getMinutes() + ":"
                + currentdate.getSeconds();
	} else if(n=="rstream"){
		var l = "https://reddit-stream.com"+window.location.href.split("reddit.com")[1];
		return "[reddit Stream]("+l+")";
	}
}

//Debug messages
function debug(message,mode){
	if($settings.adv_debug){
		var mode = mode || 0;
		var css = {
			br: "color:#9954BB;font-weight:900;text-shadow:0 1px 0 rgba(255,255,255,0.4),0 -1px 0 rgba(0,0,0,0.3)",
			standard: "color:inherit;font-weight:normal",
			error: "color:red;font-weight:bold",
			errormsg: "color:red;font-weight:normal",
			process: "color:#9954BB;font-weight:bold",
			processmsg: "color:#9954BB;font-weight:normal",
			caller: "color:#777;font-style:italic"
		}

		message += (($settings.adv_debug_verbose)&&(debug.caller.name!="")) ? `\n\t\t%cCalled by function "${debug.caller.name}"` : "";
		var prefix = "%crMT > "
		if(mode==0){
			if($settings.adv_debug_verbose && debug.caller.name!="") console.log(prefix+"%c"+message,css.br,css.standard,css.caller);
			else console.log(prefix+"%c"+message,css.br,css.standard);
		} else if(mode==1){
			if($settings.adv_debug_verbose && debug.caller.name!="") console.log(prefix+"%cERROR: %c"+message,css.br,css.error,css.errormsg,css.caller);
			else console.log(prefix+"%cERROR: %c"+message,css.br,css.error,css.errormsg);
		} else if(mode==2){
			if($settings.adv_debug_verbose && debug.caller.name!="") console.log(prefix+"%cUpdating: %c"+message,css.br,css.process,css.processmsg,css.caller);
			else console.log(prefix+"%cUpdating: %c"+message,css.br,css.process,css.processmsg);
		}
	}
}
