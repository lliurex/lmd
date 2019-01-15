
/* Main Template Manager Object  */ 

function TemplateManager(){
	
	this.template_list = new Array();
	var self = this;
	
    this.CreateItem=function CreateItem(filename, name, desc, icon){
		  name_div="<div class='TemplateIconText'>"+name+"</div>";
		 desc_div="<div class='TemplateDesc'>"+desc+"</div>";

		 button_edit="<button id='edit_"+name+"' class='template_button lmdblue' value='edit'><i class='icon-edit'/>"+i18n.gettext('buttonsuite.edit')+"</button>";
		 button_clone="<button id='clone_"+name+"' class='template_button lmdblue' value='copy'><i class='icon-copy'/>"+i18n.gettext("templatemanager.clone")+"</button>";
		 button_delete="<button id='delete_"+name+"' class='template_button red' value='delete'><i class='icon-remove-circle'/>"+i18n.gettext('buttonsuite.delete')+"</button>";
		 
		 button_list="<div class='TemplateButtonList'>"+
			button_edit+
			button_clone+
			button_delete+
			"</div>";
		 
		 extra_info="<div class='TemplateIconSlide'>"+
					desc_div+
					button_list+"</div>";
		 
		 element="<div class='TemplateItem' \
				 style='background-image: url(css/icons/"+icon+")' \
				 onmouseover='TemplateManager.slide_txt(this)' \
				 onmouseout='TemplateManager.unslide_txt(this)'\
				 filename='"+filename+"'>";
		 		 
		 ret=element+name_div+extra_info+"</div>"
         return ret;
    }

   	this.OnClickEdit=function OnClickEdit(filename, name, self){

		table_edit="<table class='template_editor' id='template_table_edit' templateid='"+name+"' filename='"+filename+"'>";
			for (i in self.template_list[name]){
				if (i=="__name__") {
					continue;
				}
				table_edit=table_edit+"<tr><td class='left'><input type='edit' class='table_edit' value='"+i+"' filename='"+filename+"'/></td>";
				table_edit=table_edit+"<td class=\"right\"><input type=\"edit\" class=\"table_edit\" value=\""+self.template_list[name][i]+"\"/></td>";
				table_edit=table_edit+"<td class='delete'><i class='icon-remove-circle'/></td></tr>";
			}
			/*table_edit=table_edit+"<tr><td class='left'><input type='edit' class='table_edit' value=''/></td>";
			table_edit=table_edit+"<td class='right'><input type='edit' class='table_edit' value=''/></td></tr>";*/
			table_edit=table_edit+"<table>";
			table_edit=table_edit+"<button id='add_row' class='template_button green'>"+i18n.gettext("templatemanager.newrow")+"</button>";
			
			$("#dialog-form-edit-template").empty();
			$("#dialog-form-edit-template").append(table_edit);
			
			// Add events to dialog
			$("#add_row").bind("click", function(){
				new_item="<tr><td class='left'><input type='edit' class='table_edit' value=''/></td>";
				new_item=new_item+"<td class='right'><input type='edit' class='table_edit' value=''/></td>";
				new_item=new_item+"<td class='delete'><i class='icon-remove-circle'/></td></tr>";
				
				$("#template_table_edit").append(new_item);
				
				// Unbind and rebind (to all) click event on delete
				$(".delete").unbind( "click" );
				$(".delete").bind("click", function(){
					$(this).parent().remove();
				});
	
			});
			$(".delete").bind("click", function(){
				$(this).parent().remove();
			});
			$("#dialog-form-edit-template").dialog("open");
	}
		
	this.setDialogFormClone=function setDialogFormClone(){	
		// Dialog for Clone Template
		$("#dialog-form-clone").dialog({
			autoOpen: false,
			height: 200,
			width: 300,
			modal: true,
			buttons: [
				{
					text:i18n.gettext("dialog.clone"),
					click: function() {					
					// Saving #new_filename
					original_filename=$('#new_filename').attr("original_filename");
					new_filename=$('#new_filename').val();
					new_label=$("#new_label").val();
									
					if (new_filename=="") $('#new_filename').css("background-color", "#ffcdd7");
					else $('#new_filename').css("background-color", "#ffffff");
						
					if (new_label=="") $('#new_label').css("background-color", "#ffcdd7");
					else $('#new_label').css("background-color", "#fffffff");
						
						
					if (new_label=="" || new_filename=="") {
						return -1;
					}
					
					$.xmlrpc({
						url: 'https://'+sessionStorage.server+':9779',
						methodName: 'checkTemplateExists',
						params: ['', "LmdTemplateManager", new_filename],
						success: function(response,status,jqXHR){
							if (response=="True") {
								icon = $(document.createElement("i")).addClass('icon-warning-sign');
								question = $(document.createElement("span")).html(i18n.gettext("templatemanager.answerreplacetemplate",[new_filename]));
								item = $(document.createElement("div")).attr('id','questionCloneReplace');
								item.append(icon);
								item.append(question);
								item.attr('ofilename',original_filename);
								item.attr('nfilename',new_filename);
								item.attr('nlabel',new_label);
																
								$("#dialog-confirm").empty();
								$("#dialog-confirm").append(item);
								a=$("#dialog-confirm").dialog("open");
								
							} else{
								self.write_template(original_filename,new_filename,new_label);
							}
							   
							
						},
						error: function(jqXHR, status, error) { alert("Status: "+status+"\nError: N4D server is down "+error);}
					}); 
					
					
					},
				},
				{
					text:i18n.gettext('dialog.cancel'),
					click:function() {
					$( this ).empty();
					$( this ).dialog( "close" );					
					$( this ).remove();					
					$("#tab_templates").empty();
					self.showMe();
					
					}
				}
			]
			});
	}
	
	this.write_template = function write_template(original_filename,new_filename,new_label){
		// Read Original Template
		$.xmlrpc({
			url: 'https://'+sessionStorage.server+':9779',
			methodName: 'getTemplate',
			params: ['', "LmdTemplateManager", original_filename],
			success: function(response,status,jqXHR){
				//var template_content_string=response[0];
				
				var template_content_JSON=JSON.parse(response[0]);
				template_content_JSON['meta_inf']['name']=new_filename;
				template_content_JSON['default']['llx_name']=new_label;
				var template_content=JSON.stringify(template_content_JSON);


				$.xmlrpc({
					url: 'https://'+sessionStorage.server+':9779',
					methodName: 'setTemplate',
					params: [[sessionStorage.username, sessionStorage.password], "LmdTemplateManager", new_filename, template_content],
					success: function(response,status,jqXHR){
						$("#dialog-form-clone").empty();
						$("#dialog-form-clone").dialog( "close" );					
						$("#dialog-form-clone").remove();				
						$("#tab_templates").empty();
						self.showMe();								
						},
					error: function(jqXHR, status, error) { alert("Status: "+status+"\nError: N4D server is down "+error);}
				});								
				},
			error: function(jqXHR, status, error) { alert("Status: "+status+"\nError: N4D server is down "+error);}
		});							
		// Write Cloned Template
	}
	
	
	
	this.OnClickClone=function OnClickClone(original_filename, name, self){
	
		var item="<label style='width:250px;margin-right: 20px;'>"+i18n.gettext('templatemanager.newlabel')+"</label>";
		item=item+"<input type='text' id='new_label' value=''></input>";
		item=item+"<br/><label style='width:250px;margin-right: 20px;'>"+i18n.gettext('templatemanager.filename')+"</label>&nbsp;&nbsp;";
		item=item+"<input type='text' disabled='disabled' id='new_filename' value=''></input>";	
		
		var dialog_form_clone=$(document.createElement("div")).attr("id", "dialog-form-clone");
		$("body").append(dialog_form_clone);
	
		$("#dialog-form-clone").attr("title", i18n.gettext("templatemanager.clone"));
		self.setDialogFormClone();
		
		//$("#dialog-form-clone").empty();
		$("#dialog-form-clone").append(item);
		
		// Event management
		$("#new_filename").attr("original_filename", original_filename);
		
		$("#new_label").bind("keyup", function(event){
			// Refresh label
			var filename="lliurex-ltsp-"+($("#new_label").val().toLowerCase()).replace(/([^a-z0-9]+)/gi, '')+".conf";
			$("#new_filename").attr("value", filename);
		});
		
		$("#dialog-form-clone").dialog("open");
	}
	
	this.OnClickDelete=function OnClickDelete(filename, name, self){
		var text_item=i18n.gettext("templatemanager.answerdeletetemplate",[name,filename]);
		var item=$(document.createElement("span")).html(text_item).attr("filename", filename).attr("id", "filename_to_delete");
	
		$("#dialog-form-delete").empty();
		$("#dialog-form-delete").append(item);
		
		$("#dialog-form-delete").dialog("open");
	}
	
	
	this.RenderTemplateCallback=function RenderTemplateCallback(response,status,jqXHR){
		//console.log(response);
		try{
		var filename=JSON.parse(response)['meta_inf']['name'];
		
		var default_section=JSON.parse(response)['default'];
		
		var name = typeof(default_section["llx_name"]) !== 'undefined' ? default_section["llx_name"] : 'unknown';
		var desc = typeof(default_section["llx_desc"]) !== 'undefined' ? default_section["llx_desc"] : 'no description';
		var icon = typeof(default_section["llx_img"]) !== 'undefined' ? default_section["llx_img"] : 'icon_unknown.png';
		
		// Remove "
		name=(name.replace("\"", "")).replace("\"", "");
		
		item=self.CreateItem(filename, name, desc,icon);
		
		$("#tab_templates").append(item);
		
		self.template_list[name]=default_section;
		
		// Binding click events
		
		$("#edit_"+name).bind("click", function(){
			self.OnClickEdit(filename, name, self);
		});
		
		$("#clone_"+name).bind("click", function(){
			self.OnClickClone(filename, name, self);
		});
		
		$("#delete_"+name).bind("click", function(){			
			self.OnClickDelete(filename, name, self);
		});
		
		
		/*for (i in default_section) {
			alert(i+" = "+default_section[i]);
		}* /
		
		//alert((JSON.parse(response))['default']['llx-name']);
		//item=JSON.parse(response);
		//alert(item+" is "+typeof(item));
		//alert(item);
		
		//alert(item);
		//content=self.CreateItem(item['llx_name'], "accessories-text-editor.png");
		//$("#tab_templates").append(content);
		
		//this.template_list[template_names[i]]=JSON.parse(resp);
						//alert(this.template_list[template_names[i]]);
						
						//this.template_list[i]=JSON.parse(response);
						//alert(i);
						//this.render_template(template_list[template_names[i]]);*/
		}
		catch(err){
			//alert("");
		}
	};
	
	this.LoadTemplates=function LoadTemplates(){
		/*****************************
		 Loads template list via n4d and
		 renders it.
		 ****************************/
		
		// Empty templates tab...
		$("#tab_templates").empty();
		
		// Show waiting indicator:
		$("#tab_templates").append("<img src='css/img/ajax-loader.gif' id='loading-indicator' style='display:block' />");

		// Load Templates via n4d
	
		$.xmlrpc({
			url: 'https://'+sessionStorage.server+':9779',
			methodName: 'getTemplateList',
			params: ['', "LmdTemplateManager"],
			success: function(response,status,jqXHR){
				$('#loading-indicator').hide();
				if (response[0]['status']==false) {
					//alert("There are no templates to launch!");
					return 0;
					};
					
				template_names=JSON.parse(response);
				for (i=0; i<template_names.length;i++) {
					//self.ReadTemplate(template_names[i]);
										
					// for each template, let's get its content					
					$.xmlrpc({
						url: 'https://'+sessionStorage.server+':9779',
						methodName: 'getTemplate',
						params: ['', "LmdTemplateManager", template_names[i]],
						success: self.RenderTemplateCallback,
						error: function(jqXHR, status, error) { alert("Status: "+status+"\nError: N4D server is down "+error);}
				});
			
				}
			},
			error: function(jqXHR, status, error) { alert("Status: "+status+"\nError: N4D server is down "+error);}
		}); 
			
		/*
		$.xmlrpc({
			url: 'https://'+sessionStorage.server+':9779',
			methodName: 'getTemplateList',
			params: ['', "LmdTemplateManager"],
			success: this.ReadTemplateCallback,/*   function(response,status,jqXHR){
				console.log(jqXHR);
				this.ReadTemplate("tralara");
				
				// when we have an answer, let's read the templates info
				$('#loading-indicator').hide();
				template_names=JSON.parse(response);
				for (i=0; i<template_names.length;i++) {
					//alert(template_names[i]);
					this.ReadTemplate("hola");
					//this.ReadTemplate(template_names[i]);
					
					 // for each template, let's get its content					
					/*$.xmlrpc({
					url: 'https://'+sessionStorage.server+':9779',
					methodName: 'getTemplate',
					params: ['', "LmdTemplateManager"],
					success: function(resp,status,jqXHR){						
						//this.template_list[template_names[i]]=JSON.parse(response);
						//this.template_list[i]=JSON.parse(response);
						alert(i);
						/*this.render_template(template_list[template_names[i]]);* /
					},
					error: function(jqXHR, status, error) { alert("Error: "+error[0])}
				}); 	* /
				}
				
            },* /
			error: function(jqXHR, status, error) { alert("Error: "+error[0])}
		}); 
		*/
	} // End Function LoadTemplates


 this.bind_ui=function bind_ui(){
	// Set dialog titles
	$("#dialog-form-edit-template").attr("title", i18n.gettext("buttonsuite.edit"));
	//$("#dialog-form-clone").attr("title", i18n.gettext("templatemanager.clone"));
	$("#dialog-form-delete").attr("title", i18n.gettext("buttonsuite.edit"));
	$("#dialog-confirm").attr("title", i18n.gettext("templatemanager.warning"));
	
	
	// Setting dialog for edit template
	$("#dialog-form-edit-template").dialog({
	autoOpen: false,
	height: 500,
	width: 600,
	modal: true,
	buttons: [{
			// SAVE BUTTON
			text:i18n.gettext('dialog.save'),
			click:function() {
			var template={"meta_inf":{}, "default":{}}
			filename=$("#template_table_edit").attr("filename");
			template['meta_inf']['name']=filename;
			//template_content_JSON['meta_inf']['name']=new_filename;
			//template_content_JSON['default']['llx_name']=new_label;
			//alert($('#template_table_edit').attr("templateid"));			
			rows=$("#template_table_edit").find("tr");
			var whitelist_fields = ["llx_desc","custom_packages","late_packages"];
			for (var i=0;i<rows.length;i++) {
				var atr=($(rows[i]).find(".left input").val()).replace(" ", "");
				var val=$(rows[i]).find(".right input").val();
				if (whitelist_fields.indexOf(atr) < 0) {
					val = val.replace(" ","");
				}
				template['default'][atr]=val;
			}
			template_str=JSON.stringify(template);
			
			// Save Template
			
			$.xmlrpc({
				url: 'https://'+sessionStorage.server+':9779',
				methodName: 'setTemplate',
				params: [[sessionStorage.username, sessionStorage.password], "LmdTemplateManager", filename, template_str],
				success: function(response,status,jqXHR){
					$("#dialog-form-edit-template").empty();
					$("#dialog-form-edit-template").dialog( "close" );
					//$("#dialog-form-edit-template").remove();
					$("#tab_templates").empty();
					self.bind_ui();
					self.showMe();
					
					// WIP!
					//alert(new_filename);
					//alert(JSON.stringify(response[0]));										
					},
				error: function(jqXHR, status, error) { alert("Status: "+status+"\nError: N4D server is down "+error);}
				});
			
			
				//$( this ).empty();
				//$( this ).dialog( "close" );
			}
		},{
			text:i18n.gettext('dialog.cancel'),
			click:function() {
				$( this ).empty();
				$( this ).dialog( "close" );
				$("#tab_templates").empty();
				self.showMe();
			}
		}
			
	  ]
	});

	
	// Dialog for Remove Template
	$("#dialog-form-delete").dialog({
		autoOpen: false,
		height: 200,
		width: 300,
		modal: true,
		buttons: [
			{
				text:i18n.gettext("dialog.delete"),
				click: function() {
				//var item=$(document.createElement("span")).html(text_item).attr("filename", filename).attr("id", "filename_to_delete");
				var filename=$($(this).find("#filename_to_delete")).attr("filename");
				
				$.xmlrpc({
					url: 'https://'+sessionStorage.server+':9779',
					methodName: 'deleteTemplate',
					params: [[sessionStorage.username, sessionStorage.password], "LmdTemplateManager", filename],
					success: function(response,status,jqXHR){
						if (response[0]) {
							
							$(".templateitem[filename='"+filename+"']").remove();
							$("#dialog-form-delete").empty();
							$("#dialog-form-delete").dialog( "close" );
							
							
							
						}
						
						},
					error: function(jqXHR, status, error) { alert("Status: "+status+"\nError: N4D server is down "+error);}
				});
				
				
					//$( this ).dialog( "close" );
				}},
				{
					text:i18n.gettext('dialog.cancel'),
					click: function() {
					$( this ).empty();
					$( this ).dialog( "close" );
				}}
		]
		});
	
	// Confirm Dialog
	$("#dialog-confirm").dialog({
		autoOpen: false,
		height: 200,
		width: 300,
		modal: true,
		buttons: [
		{
			text:i18n.gettext('dialog.yes.replace.it'),
			click:function() {
				var original_filename = $("#questionCloneReplace").attr('ofilename');
				var new_filename = $("#questionCloneReplace").attr('nfilename');
				var new_label = $("#questionCloneReplace").attr('nlabel');
				self.write_template(original_filename,new_filename,new_label);
				$( this ).empty();
				$( this ).dialog( "close" );
				return true;
				},
		},{
			text:i18n.gettext('dialog.no.cancel.it'),
			click: function() {
					$( this ).empty();
					$( this ).dialog( "close" );
					return false;
				}
		}
		]
		});
	
	// Buttons
	$("button").button();
   }
   
   this.showMe=function showMe(){
	this.LoadTemplates();	
   }

}

// Static Methods
TemplateManager.slide_txt= function (icon){
		$(icon).children().stop().animate({height:'100px', 'margin-top':'20px'}, 400);
}

TemplateManager.unslide_txt=function (icon){
	$(icon).children().stop().animate({height:'0px', 'margin-top':'110px'},400);
}
	
/*$(document).ready(function() {
	// binding interface
	
    // Create a new template manager
	var tm = new TemplateManager();
	tm.bind_ui();
	
		
    // Bind on show event for display elements
    $("#tab_templates").on('show',function(){	
		tm.LoadTemplates();	
    });
	
})*/