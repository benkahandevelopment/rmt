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
    "name" : "rMT 2018","author" : "benkahandevelopment","version" : "1.0.0","description" : "Default theme for rMT","template_version" : 1,"macros" : ["sprite-tournament","meta-venue","meta-kickoff","meta-referee","meta-home","meta-away","lineups-full","stats-full","stats-full-reverse","rstream","footer"],"template" : "#{{SPRITE_TOURNAMENT}} {{META_HOMETEAM}} vs {{META_AWAYTEAM}}\n\n*Venue:* {{META_VENUE}}  \n*Kickoff:* {{META_KICKOFF}}  \n*Referee:* {{META_REFEREE}}  \n\n###[](#icon-notes) Teams\n\n[](#icon-spacer)[](#icon-spacer)[](#icon-spacer)|{{META_HOMETEAM}}|{{META_AWAYTEAM}}|[](#icon-spacer)[](#icon-spacer)[](#icon-spacer)\n:-:|-:|:-|:-:  \n{{LINEUPS_FULL}}\n\n###[](#icon-info) Match Stats\n\n{{META_HOMETEAM}}||{{META_AWAYTEAM}}\n-:|:-:|:-\n{{STATS_FULL}}\n\n###[](#icon-ball) Live Updates\n\n[](#icon-clock)|||\n-:|:-:|:-\n\n{{FULL_COMMENTARY}}\n\n{{FOOTER}}"};
var defaultThemeHash = ""+(defaultTheme.name+defaultTheme.author).hashCode();

$(function(){
    chrome.storage.sync.get({"templates":[defaultTheme]}, function(o){
        var templates = o.templates;
        templates.forEach(function(v,i){
            //Default Template
            //$('[data-input-settings="gen_template_default"]').append(`<option value="${i}">${v.name}</option>`);

            //Optimise macro display output
            var macro_display;
            if(!v.macros||v.macros.length<1) macro_display = "None available";
            else {
                macro_display = "<em>"+v.macros.sort().join("</em>, <em>")+"</em>";
            }

            //Template list
            $("[data-output-settings='gen_templates']").prepend("<div class='card'>"+
                    //`<img class='card-img-top' src='${img}' alt='${name}'`+
                    "<div class='card-header text-center'>"+v.name+"</div>"+
                    "<div class='list-group list-group-flush mb-2'>"+
                        "<li class='list-group-item card-text'><span class='text-muted'>Description</span>: "+v.description+"</li>"+
                        "<li class='list-group-item card-text'><span class='text-muted'>Author</span>: "+v.author+
                        "<li class='list-group-item card-text'><span class='text-muted'>Macros</span>: "+macro_display+
                    "</div>"+
                    "<div class='card-footer text-center'>"+
                        "<small class='text-muted d-block'>v"+v.version+" - \#"+v.uid+(v.uid === defaultThemeHash ? "" : " - <a href='#' data-template-delete='"+v.uid+"'><i class='far fa-fw fa-trash-alt'></i></a></small>")+
                    "</div>"+
                "</div>");
        });
    });
})

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
        response.errors.forEach(function(v,i){ debug(v,1); });
        return false; }

    //Output warnings
    if(response.warnings.length>0){
        response.warnings.forEach(function(v,i){ debug(v,3); }); }

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
            debug(templateArray,4);
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
}
