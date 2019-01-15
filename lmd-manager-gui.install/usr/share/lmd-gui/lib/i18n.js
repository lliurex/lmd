var fs = require('fs');
var path = require('path');
function I18n(language,appname,aux_path){

	this.language = language;
	this.appname = appname;
	this.fullpath = "";
	if(typeof aux_path === 'undefined'){
		this.fullpath = path.join('/usr/share/locale',language,'LC_MESSAGES',this.appname+'.json');	
		if(!(fs.existsSync(this.fullpath))){
			this.fullpath = path.join('/usr/share/locale','en','LC_MESSAGES',this.appname+'.json');
		}
	}
	else{
		this.fullpath = path.join(aux_path,language,appname+'.json');
	}
	this.content = {};
	
}

I18n.prototype.loadfile = function(){
	if(fs.existsSync(this.fullpath)){
		var output = fs.readFileSync(this.fullpath);
		this.content = JSON.parse(output);
	}
}

I18n.prototype.gettext = function(key,substitution){
	substitution = typeof substitution !== 'undefined' ? substitution : null;
	if (! (key in this.content)){
		return "<span style='text-decoration:line-through;color:red; font-weight:bolder;'>"+key+"</span>";
	}
	if (substitution === null){
		return this.content[key]['message'];
	}
	if( Object.prototype.toString.call( substitution ) === '[object Array]' ) {
		return this.content[key]['message'].replace(/(\$[a-zA-Z]+\$)/g, function(v){
			var result = substitution.shift();
			return typeof result !== 'undefined' ? result : "<span style='text-decoration:line-through;color:pink; font-weight:bolder;'>"+v+"</span>"; ;
		});
	}
	return this.content[key]['message'].replace(/(\$[a-zA-Z]+\$)/g,function(v){
		var result = substitution[v.substr(1,v.length -2)];
		return typeof result !== 'undefined' ? result : "<span style='text-decoration:line-through;color:pink; font-weight:bolder;'>"+v+"</span>"; ;
	});
}
//TODO REMOVE
function gettext(x){
	return x;
}