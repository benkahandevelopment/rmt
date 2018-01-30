/*
 * Template structure...
 *
 * JSON object
 * {
 *      "name" : "rMT 2018",
 *      "author" : "benkahandevelopment",
 *      "version" : "1.0.0",
 *      "description" : "Default theme for rMT",
 *      "template_version" : 1
 *      "macros" : [
 *          "sprite-tournament",
 *          "meta-home",
 *          "meta-away",
 *          "meta-venue",
 *          "meta-kickoff",
 *          "meta-referee",
 *          "lineups-full",
 *          "stats-full",
 *          "stats-full-reverse",
 *          "rstream",
 *          "footer"
 *      ],
 *      "template" : "#{{SPRITE_TOURNAMENT}} {{META_HOMETEAM}} vs {{META_AWAYTEAM}}\n\n*Venue:* {{META_VENUE}}  \n*Kickoff:* {{META_KICKOFF}}  \n*Referee:* {{META_REFEREE}}  \n\n###[](#icon-notes) Teams\n\n[](#icon-spacer)[](#icon-spacer)[](#icon-spacer)|{{META_HOMETEAM}}|{{META_AWAYTEAM}}|[](#icon-spacer)[](#icon-spacer)[](#icon-spacer)\n:-:|-:|:-|:-:  \n{{LINEUPS_FULL}}\n\n###[](#icon-info) Match Stats\n\n{{META_HOMETEAM}}||{{META_AWAYTEAM}}\n-:|:-:|:-\n{{STATS_FULL}}\n\n###[](#icon-ball) Live Updates\n\n[](#icon-clock)|||\n-:|:-:|:-\n\n{{FULL_COMMENTARY}}\n\n{{FOOTER}}"
 * }
 *
 * STEPS
 *
 * 1. Upload file to page
 * 2. Read JSON from file
 * 3. Save entire JSON file to localstorage array of templates
 *
 * FUNCTIONS
 * 1. processTemplate       Process JSON input
 *
 */

var uploadedData;

 /*
  * Function to create hash
  *
  * Source: https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery
  */
 String.prototype.hashCode = function() {
     var hash = 0, i, chr;
     if (this.length === 0) return hash;
     for (i = 0; i < this.length; i++) {
         chr   = this.charCodeAt(i);
         hash  = ((hash << 5) - hash) + chr;
         hash |= 0; // Convert to 32bit integer
     }
     return hash;
 };


/*
 * Default Theme 2018
 */
const defaultTheme = {
    "name" : "rMT 2018",
    "author" : "benkahandevelopment",
    "version" : "1.0.0",
    "description" : "Default theme for rMT. Contains several default macros and includes sprites for tournament, full meta, redditStream link, full lineups and statistics.",
    "template_version" : 1,
    "macros" : [
        "sprite-tournament",
        "meta-home",
        "meta-away",
        "meta-venue",
        "meta-kickoff",
        "meta-referee",
        "lineups-full",
        "stats-full",
        "rstream",
        "footer"
    ],
    "image" : "https://i.imgur.com/eZ18mlZ.jpg",
    "template" : "#{{SPRITE_TOURNAMENT}} {{META_HOMETEAM}} vs {{META_AWAYTEAM}}\n\n*Venue:* {{META_VENUE}}  \n*Kickoff:* {{META_KICKOFF}}  \n*Referee:* {{META_REFEREE}}  \n\n###[](#icon-notes) Teams\n\n[](#icon-spacer)[](#icon-spacer)[](#icon-spacer)|{{META_HOMETEAM}}|{{META_AWAYTEAM}}|[](#icon-spacer)[](#icon-spacer)[](#icon-spacer)\n:-:|-:|:-|:-:  \n{{LINEUPS_FULL}}\n\n###[](#icon-info) Match Stats\n\n{{META_HOMETEAM}}||{{META_AWAYTEAM}}\n-:|:-:|:-\n{{STATS_FULL}}\n\n###[](#icon-ball) Live Updates\n\n[](#icon-clock)|||\n-:|:-:|:-\n\n{{FULL_COMMENTARY}}\n\n{{FOOTER}}"
};

const defaultThemeAlt = {
    "name" : "rMT 2018 Alternate",
    "author" : "benkahandevelopment",
    "version" : "1.0.0",
    "description" : "Alternate default theme for rMT. Uses Reverse stats display. Contains several default macros and includes sprites for tournament, full meta, redditStream link, full lineups.",
    "template_version" : 1,
    "macros" : [
        "sprite-tournament",
        "meta-home",
        "meta-away",
        "meta-venue",
        "meta-kickoff",
        "meta-referee",
        "lineups-full",
        "stats-full-reverse",
        "rstream",
        "footer"
    ],
    "image" : "https://i.imgur.com/9VHNMhk.jpg",
    "template" : "#{{SPRITE_TOURNAMENT}} {{META_HOMETEAM}} vs {{META_AWAYTEAM}}\n\n*Venue:* {{META_VENUE}}  \n*Kickoff:* {{META_KICKOFF}}  \n*Referee:* {{META_REFEREE}}  \n\n###[](#icon-notes) Teams\n\n[](#icon-spacer)[](#icon-spacer)[](#icon-spacer)|{{META_HOMETEAM}}|{{META_AWAYTEAM}}|[](#icon-spacer)[](#icon-spacer)[](#icon-spacer)\n:-:|-:|:-|:-:  \n{{LINEUPS_FULL}}\n\n###[](#icon-info) Match Stats\n\n{{META_HOMETEAM}}||{{META_AWAYTEAM}}\n-:|:-:|:-\n{{STATS_FULL_REVERSE}}\n\n###[](#icon-ball) Live Updates\n\n[](#icon-clock)|||\n-:|:-:|:-\n\n{{FULL_COMMENTARY}}\n\n{{FOOTER}}"
};

var defaultThemeHash = ""+(defaultTheme.name+defaultTheme.author).hashCode();
    defaultTheme.uid = defaultThemeHash.replace(/[^\d]/g,"");
var defaultThemeAltHash = ""+(defaultThemeAlt.name+defaultThemeAlt.author).hashCode();
    defaultThemeAlt.uid = defaultThemeAltHash.replace(/[^\d]/g,"");

$(function(){
    loadTemplates();

     $('input[data-input="gen_template_upload"]').change(function(e){
         var reader = new FileReader();
         reader.onload = function(event){
             uploadedData = event.target.result;
             var obj = JSON.parse(event.target.result);
         }
         reader.readAsText(event.target.files[0]);

         //var $t = $('button[data-button="gen_template_upload"]');
         //var $u = $('input[data-input="gen_template_upload"]');
     });

     $('button[data-button="gen_template_upload"]').click(function(e){
         $(this).html("Processing...").attr("disabled","disabled");
         if(uploadedData!==""){
             processTemplate(JSON.parse(uploadedData));
         }
     });
});

/*
 * Function to load templates
 */
function loadTemplates(){
    chrome.storage.sync.get({"templates":[defaultTheme, defaultThemeAlt]}, function(o){
        var templates = o.templates;
        $("[data-output-settings='gen_templates']").html("");
        var $s = $('select[data-input-settings="gen_template_default"]');
        $s.html("");

        var settingDefault;
        chrome.storage.sync.get("settings",function(s){
            s = s.settings;
            try {
                if(!s.gen_template_default){
                    s.gen_template_default = defaultThemeHash;
                    settingDefault = defaultThemeHash;
                } else settingDefault = s.gen_template_default;
            } catch(e) {
                debug("Please select a default template!",3);
            }

            templates.forEach(function(v,i){
                var macro_display;
                if(!v.macros||v.macros.length<1) macro_display = "None provided in template file";
                else macro_display = "<span class='badge badge-secondary'>"+v.macros.sort().join("</span>&nbsp;<span class='badge badge-secondary'>")+"</span>";

                //Theme Defaults
                $s.append("<option value='"+v.uid+"'"+(v.uid==settingDefault ? " selected=selected" : "")+">"+v.name+"</option>");

                //Template list
                $("[data-output-settings='gen_templates']").append("<div class='card'>"+
                        "<div class='card-header text-center'>"+v.name+"</div>"+
                        (v.image && v.image!="" ? "<div class='card-screenshot' style='background-image:url("+v.image+");'></div><a href='"+v.image+"' target='_blank' class='btn btn-sm btn-link text-muted mb-0'>Open Screenshot</a>" : "")+
                        "<div class='card-body px-0'>"+
                            "<ul class='list-group list-group-flush mb-2'>"+
                                "<li class='list-group-item card-text'><span class='text-muted'>Description</span><br>"+v.description+"</li>"+
                                "<li class='list-group-item card-text'><span class='text-muted'>Macros</span><br>"+macro_display+
                            "</ul>"+
                        "</div>"+
                        "<button type='button' class='btn btn-warning btn-block' data-btn-default-template='"+v.uid+"'>Set as Default</button>"+
                        "<div class='card-footer text-center'>"+
                            "<small class='text-muted d-block'>by <strong>"+v.author+"</strong><br>v"+v.version+" - \#"+v.uid+((v.uid === defaultTheme.uid) || (v.uid === defaultThemeAlt.uid) ? "" : " - <a href='#' data-template-delete='"+v.uid+"'><i class='far fa-fw fa-trash-alt'></i></a></small>")+
                        "</div>"+
                    "</div>");
            });
        });

    });
}


/*
 * Function to process template
 *
 * input    JSON string
 */
function processTemplate(input){
    //var theme = JSON.parse(input);
    var theme = input;
    var response = {
        "errors"    : [],
        "warnings"  : []
    }

    //Error check
    if(!theme.name)             response.errors.push(["Invalid/incomplete 'name' value in JSON file"]);
    if(!theme.author)           response.errors.push(["Invalid/incomplete 'author' value in JSON file"]);
    if(!theme.description)      response.errors.push(["Invalid/incomplete 'description' value in JSON file"]);
    if(!theme.template_version) response.errors.push(["Invalid/incomplete 'template_version' value in JSON file"]);
    if(!theme.template)         response.errors.push(["Invalid/incomplete 'template' value in JSON file"]);

    //Warnings check
    if(!theme.macros)           response.warnings.push(["Couldn't find macro data in JSON file"]);

    //Output errors and break
    if(response.errors.length>0){
        var errorMsg = "The tool encountered the following errors and exited:\n";
        response.errors.forEach(function(v,i){
            errorMsg += "- "+v+"\n";
            debug(v,1);
        });
    }

    //Output warnings
    if(response.warnings.length>0){
        var warnMsg = (errorMsg=="" ? "" : "\n---\n")+"The tool "+(errorMsg=="" ? "" : "also ")+"encountered the following warnings:\n";
        response.warnings.forEach(function(v,i){
            warnMsg += "- "+v+"\n";
            debug(v,3);
        }); }

    //Alert warning messages
    if(errorMsg||warnMsg){
        alert(errorMsg+warnMsg);
        if(response.errors.length>0) return false;
    }

    //Get existing templates
    var templateArray = [];
    chrome.storage.sync.get({"templates":[defaultTheme]}, function(o){
        templateArray = o.templates;
        theme.uid = ""+(theme.name+theme.author).hashCode();
        theme.uid = theme.uid.replace(/[^\d]/g,"");
        templateArray.push(theme); //Add new template to array
        templateArray = removeDuplicates(templateArray,"name"); //Clean up array

        //Save template
        chrome.storage.sync.set({"templates":templateArray},function(){
            $('input[data-input="gen_template_upload"]').val("");
            $('button[data-button="gen_template_upload"]').html("Successful!");
            setTimeout(function(){ $('button[data-button="gen_template_upload"]').html("Upload").attr("disabled",false);},2000);
        });
    });
}


/*
 * Function to remove duplicates from an array of objects
 *
 * Source: https://www.tjcafferkey.me/remove-duplicates-from-array-of-objects/
 */
function removeDuplicates(arr, key){
    if(!(arr instanceof Array) || key && typeof key !== "string"){
        return false;
    }

    if(key && typeof key === "string"){
        return arr.filter((obj, index, arr) => {
            return arr.map(mapObj => mapObj[key]).indexOf(obj[key]) === index;
        });
    } else {
        return arr.filter(function(item,index,arr){
            return arr.indexOf(item) == index;
        });
    }
}


/*
 * Function to remove all templates
 */
function removeTemplates(){
    chrome.storage.sync.set({"templates":[]});
    processTemplate(defaultTheme);
    setTimeout(function(){
        processTemplate(defaultThemeAlt);
    },100);
}
