var language = process.env.LANG;
var i18n = new I18n(language,'lmd-manager');
try{
	i18n.loadfile();
}
catch(err){
	var i18n = new I18n('en','lmd-manager');
	i18n.loadfile();
}