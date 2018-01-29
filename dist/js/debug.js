//Debug messages
function debug(message,mode){
	if($settings.adv_debug){

        /* Modes
		0 		default		rMT > {message}
		1		error		rMT > ERROR: {message}
        2       updating    rMT > Updating: {message}
        3       warning     rMT > WARNING: {message}
		4		noformat	{message}
		*/

		var mode = mode || 0;
		var css = {
			br: "color:#9954BB;font-weight:900;text-shadow:0 1px 0 rgba(255,255,255,0.4),0 -1px 0 rgba(0,0,0,0.3)",
			standard: "color:inherit;font-weight:normal",
			error: "color:red;font-weight:bold",
			errormsg: "color:red;font-weight:normal",
			warning: "color:#ff5722;font-weight:bold",
			warningmsg: "color:#ff5722;font-weight:normal",
			process: "color:#2780e3;font-weight:bold",
			processmsg: "color:#2780e3;font-weight:normal",
			caller: "color:#777;font-style:italic"
		}

		var Message = message;
		Message += (($settings.adv_debug_verbose)&&(debug.caller.name!="")) ? `\n\t\t%cCalled by function "${debug.caller.name}"\n\t\ton `+getTimestamp() : "";
		var prefix = "%crMT > "
		if(mode==0){
			if($settings.adv_debug_verbose && debug.caller.name!="") console.log(prefix+"%c"+Message,css.br,css.standard,css.caller);
			else console.log(prefix+"%c"+Message,css.br,css.standard);
		} else if(mode==1){
			if($settings.adv_debug_verbose && debug.caller.name!="") console.log(prefix+"%cERROR: %c"+Message,css.br,css.error,css.errormsg,css.caller);
			else console.log(prefix+"%cERROR: %c"+Message,css.br,css.error,css.errormsg);
		} else if(mode==2){
			if($settings.adv_debug_verbose && debug.caller.name!="") console.log(prefix+"%cUpdating: %c"+Message,css.br,css.process,css.processmsg,css.caller);
			else console.log(prefix+"%cUpdating: %c"+Message,css.br,css.process,css.processmsg);
		} else if(mode==3){
			if($settings.adv_debug_verbose && debug.caller.name!="") console.log(prefix+"%cWARNING: %c"+Message,css.br,css.warning,css.warningmsg,css.caller);
			else console.log(prefix+"%cWARNING: %c"+Message,css.br,css.warning,css.warningmsg);
		} else if(mode==4){
			console.log(message);
		}
	}
}
