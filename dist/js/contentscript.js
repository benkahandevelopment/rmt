/**
 * reddit Match Threader
 * by /u/magicwings
 *
 **/


var $log = {};
var $settings;
var def_settings = {
    adv_debug : true,
	adv_debug_verbose : false,
	gen_submit : true
};

$(function(){
	chrome.storage.sync.get({"settings":def_settings}, function(o){
		$settings = o.settings;
	});

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
			c = doMacros(c, "replaceMeta", {
                meta_name : [
                    "META_HOMETEAM",
                    "META_AWAYTEAM",
                    "META_VENUE",
                    "META_KICKOFF",
                    "META_REFEREE",
                    "META_TOURNAMENT",
                    "SPRITE_TOURNAMENT"],
                sprite_name : [
                    "meta-home",
    				"meta-away",
    				"meta-venue",
    				"meta-kickoff",
    				"meta-referee",
    				"meta-tournament",
    				"sprite-tournament"
                ],
                requestData : d
            });

			//Teams
			c = doMacros(c, "lineups_full", { requestData : d } );
            c = doMacros(c, "lineups_full_home", { requestData : d } );
            c = doMacros(c, "lineups_full_away", { requestData : d } );

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

			var len = c.length; var lenNice = numberWithCommas(len);
			if(len>39999) {
				debug("Length of post too long to submit (40k character limit, this post is "+lenNice+" chars)",1);
			} else {
				if(len>34999) debug("Length of post approaching 40k limit ("+lenNice+")",3);
					else debug("Length of post: "+lenNice+" chars");
				if($settings.gen_submit) $("#siteTable div.usertext-buttons button.save")[0].click();
			}

		}
	});
});
