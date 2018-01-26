/* Settings variables */
var gen_template_default = "#{{SPRITE_TOURNAMENT}} {{META_HOMETEAM}} vs {{META_AWAYTEAM}}  \n*Venue:* {{META_VENUE}}  \n*Kickoff:* {{META_KICKOFF}}  \n*Referee:* {{META_REFEREE}}  \n\n###[](#icon-notes) Teams  \n\n[](#icon-spacer)[](#icon-spacer)[](#icon-spacer)|{{META_HOMETEAM}}|{{META_AWAYTEAM}}|[](#icon-spacer)[](#icon-spacer)[](#icon-spacer)  \n:-:|-:|:-|:-:  \n{{LINEUPS_FULL}}  \n\n###[](#icon-info) Match Stats  \n{{META_HOMETEAM}}||{{META_AWAYTEAM}}  \n-:|:-:|:-  \n{{STATS_FULL}}  \n\n###[](#icon-ball) Live Updates  \n\n[](#icon-clock)|||  \n-:|:-:|:-  \n\n{{FULL_COMMENTARY}}  \n\n{{FOOTER}}";

var manifest = JSON.parse(manifest);

var def_settings = {
    adv_debug : false,
	gen_submit : true,
    gen_template_default : gen_template_default,
    manifest : manifest
};
