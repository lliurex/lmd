/* Main Template Manager Object  */ 

var fs = require('fs');

 /*
fs.readFile(file, 'utf8', function (err, data) {
if (err) {
console.log('Error: ' + err);
return;
}
 
data = JSON.parse(data);
 
console.dir(data);
});
*/

function LtsTranslator(){
	
	var self = this;
	var file = 'js/ltsconfdata/ltsparameters.json';	
	data=fs.readFileSync (file, 'utf8');
	this.parameters = JSON.parse(data);
		
	this.getInfo=function getInfo(parameter){
		
		if (parameter in self.parameters) {
			
			return self.parameters[parameter];
		}
		else return {"description":parameter, "type":"input" , "class":"extra", "default":""};
	}
	
	this.parseParameter=function parseParameter(parameter, value, description, type, div_to_append){
		var label=$(document.createElement('div')).addClass('FormElement FirstLine').html(parameter).attr("custom_title",i18n.gettext(description));
		var delete_file=$(document.createElement('i')).addClass('icon-remove delete_row_param').attr("target","file_"+parameter);
		var content;
		
		// Check boolean
		if (type==="boolean") {
			if (value.toLowerCase()==="true"){
				//alert(parameter +" is true");
				content=$(document.createElement('div')).attr("style", "width:280px; float: left;");
				inner_content=$(document.createElement('input')).addClass('FirstLine').attr("type", "checkbox").attr("name",parameter).attr("value", value).attr("style", "width: 15px; height: 15px;").prop('checked', true);
				content.append(inner_content);
				
				}
				else {
					//alert(parameter +" is false");
					content=$(document.createElement('div')).attr("style", "width:280px; float: left;");
					inner_content=$(document.createElement('input')).addClass('FirstLine').attr("type", "checkbox").attr("name",parameter).attr("value", value).attr("style", "width: 15px; height: 15px;").prop('checked', false);
					content.append(inner_content);
					
					}
					
		} else content=$(document.createElement('input')).addClass('FormLabel FirstLine').attr("type", "text").attr("name",parameter).attr("value", value);	
				
		div_to_append.attr("id", "file_"+parameter);
		div_to_append.append(label);
		div_to_append.append(content);
		div_to_append.append(delete_file);
		
	}

}
