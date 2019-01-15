
/* Main Client Manager Object  */

function ClientManager(){
	var self = this;
	this.client_list = new Array();
}

ClientManager.prototype.CreateItem=function CreateItem(filename, name){
		/*  name_div="<div class='TemplateIconText'>"+name+"</div>";
		 desc_div="<div class='TemplateDesc'>"+desc+"</div>";

		 button_edit="<button id='edit_"+name+"' class='template_button blue' value='edit'><i class='icon-edit'/>"+i18n.gettext('buttonsuite.edit')+"</button>";
		 button_clone="<button id='clone_"+name+"' class='template_button blue' value='copy'><i class='icon-copy'/>"+i18n.gettext("templatemanager.clone")+"</button>";
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
         return ret;*/
    }

ClientManager.prototype.LoadClients=function LoadClients(){
		var self = this;
		//console.log("self from clients");
		//console.log(self);

		// Empty templates tab...
		$("#tab_clients").empty();

		// Icon for new Client
		var newitem=$(document.createElement("div")).addClass("ClientItemNew").attr("id", "NewClientBt");
		$("#tab_clients").append(newitem);
		$("#NewClientBt").bind("click", function(){
			// Initial Values
			mac="";
			username="";
			passwd="";

			var dialog_new_client=$(document.createElement("div")).attr("id", "dialog_new_client");
			$(dialog_new_client).attr("title", i18n.gettext("clientmanager.dialogtitleNew"));

			// Text field for MAC
			var macdiv=$(document.createElement("div")).attr("id", "mac_div");
			var mac_label=$(document.createElement("div")).html(i18n.gettext("mac.address"));
			var mac_input=$(document.createElement("input")).attr("type", "text").attr("id", "mac_input").attr("style","width: 200px;").val(mac);
			macdiv.append(mac_label);
			macdiv.append(mac_input);
			$(dialog_new_client).append(macdiv);

			// Text field for username
			var usernamediv=$(document.createElement("div")).attr("id", "autologin_username_div");
			var username_label=$(document.createElement("div")).html(i18n.gettext("autologin.username"));
			var username_input=$(document.createElement("input")).attr("type", "text").attr("id", "username_input").attr("style","width: 200px;").val(username);
			usernamediv.append(username_label);
			usernamediv.append(username_input);
			$(dialog_new_client).append(usernamediv);

			// Text field for password
			var passdiv=$(document.createElement("div")).attr("id", "autologin_passwd_div");
			var pass_label=$(document.createElement("div")).html(i18n.gettext("autologin.password"));
			var pass_input=$(document.createElement("input")).attr("type", "text").attr("id", "pass_input").attr("style","width: 200px;").val(passwd);
			passdiv.append(pass_label);
			passdiv.append(pass_input);
			$(dialog_new_client).append(passdiv);

			$(dialog_new_client).dialog({
				autoOpen: false,
				height: 300,
				width: 400,
				modal: true,
				buttons: [{
						// SAVE BUTTON
						text:i18n.gettext('dialog.save'),
						click:function() {
							var passwd=$(pass_input).val();
							var username=$(username_input).val();
							var mac=$(mac_input).val();

							var client={};
							client["mac"]=mac;
							client["user"]=username;
							client["pass"]=passwd;
							console.log(client);
							var json_client=JSON.stringify(client);
							//alert(json_client);

							var regex = /^([0-9A-F]{2}[:-]){5}([0-9A-F]{2})$/;
							if (regex.test(mac.toUpperCase())){
								$.xmlrpc({
								url: 'https://'+sessionStorage.server+':9779',
								methodName: 'setClient',
								params: [[sessionStorage.username, sessionStorage.password], "LmdClientManager",mac, json_client],
								success: function(response,status,jqXHR){
									$(dialog_new_client).empty();
									$(dialog_new_client).dialog( "close" );
									$(dialog_new_client).remove();

									//** ERROR: Si acabem de crear un client no el deixa fora de la llista de client..**///

									// Force to regenerate lts.conf after create or modify new client
									self.regenerateLtsConf();

									self.showMe();
									},
								error: function(jqXHR, status, error) { alert("Status: "+status+"\nError: N4D server is down "+error);}
								});
							}
							else myalert(i18n.gettext("clientmanager.wrongmac"), i18n.gettext("clientmanager.wrongmac.description"), "warning");

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

			$(dialog_new_client).dialog("open");

		});

		// Show waiting indicator:
		$("#tab_clients").append("<img src='css/img/ajax-loader.gif' id='loading-indicator-clients' style='display:block' />");
		// Load Clients via n4d

		$.xmlrpc({
			url: 'https://'+sessionStorage.server+':9779',
			methodName: 'getClientList',
			params: ['', "LmdClientManager"],
			success: function(response,status,jqXHR){
				$('#loading-indicator-clients').hide();
				if (response[0]['status']==false) {
					return 0;
				};

				client_names=JSON.parse(response);
				for (i=0; i<client_names.length;i++) {
					$.xmlrpc({
						url: 'https://'+sessionStorage.server+':9779',
						methodName: 'getClient',
						params: ['', "LmdClientManager", client_names[i]],
						success: function(response, status, jqXHR){
							console.log(response);
							self.RenderClients(response, status, jqXHR);
						},
						error: function(jqXHR, status, error) { alert("Status: "+status+"\nError: N4D server is down "+error);}
				});

				}
			},
			error: function(jqXHR, status, error) { alert("Status: "+status+"\nError: N4D server is down "+error);}
		});


} // End Function LoadClients

ClientManager.prototype.regenerateLtsConf=function regenerateLtsConf(){
	var self = this;
	//console.log("self from regenerateLtsConf");
	//console.log(self);

	$.xmlrpc({
		url: 'https://'+sessionStorage.server+':9779',
		methodName: 'setLtsClientsConf',
		params: [[sessionStorage.username, sessionStorage.password], "LmdBootManager"],
		success: function(response,status,jqXHR){
			//console.log(response[0]);
			if (status=="success") {
				title="LMD";
				content=i18n.gettext("bootmanager.successsaveconfig");	}
			else{
				title="LMD Exception";
				content=i18n.gettext("bootmanager.successsaveconfigstatus",[status,response[0]]);
			}

			CustomNofity(title, content);
		},
		error: function(jqXHR, status, error) {
			alert("Status: "+status+"\nError: N4D server is down "+error);
		}
	})
	}

ClientManager.prototype.showDialogAlterClient=function showDialogAlterClient(response, item, mac, username, passwd){
		var self=this;

		var bootdefault=response;

		var dialog_alter_client=$(document.createElement("div")).attr("id", "dialog_alter_client");
		$(dialog_alter_client).attr("title", i18n.gettext("clientmanager.dialogtitle"));

		// Text field for username
		var usernamediv=$(document.createElement("div")).attr("id", "autologin_username_div").attr("macid", mac);
		var username_label=$(document.createElement("div")).html(i18n.gettext("autologin.username"));
		var username_input=$(document.createElement("input")).attr("type", "text").attr("id", "username_input").attr("style","width: 200px;").val(username);
		usernamediv.append(username_label);
		usernamediv.append(username_input);
		$(dialog_alter_client).append(usernamediv);

		// Text field for password
		var passdiv=$(document.createElement("div")).attr("id", "autologin_passwd_div");
		var pass_label=$(document.createElement("div")).html(i18n.gettext("autologin.password"));
		var pass_input=$(document.createElement("input")).attr("type", "text").attr("id", "pass_input").attr("style","width: 200px;").val(passwd);
		passdiv.append(pass_label);
		passdiv.append(pass_input);
		$(dialog_alter_client).append(passdiv);

		// Select for boot image
		var bootdiv=$(document.createElement("div")).attr("id", "boot_div");
		var boot_label=$(document.createElement("div")).html(i18n.gettext("autoboot.label"));
		var boot_select=$(document.createElement("select")).attr("id", "boot_select").attr("style","width: 200px;");

		for (i=0;i<globalBootList.length;i++){
			var opt=$(document.createElement("option")).val(globalBootList[i]["id"]).html(globalBootList[i]["label"]);
			if(bootdefault==globalBootList[i]["id"]) $(opt).attr("selected", "selected");
			$(boot_select).append(opt);
		}
		var opt=$(document.createElement("option")).val(globalBootList[i]).html(i18n.gettext("default.boot"));
		if(bootdefault=="false") $(opt).attr("selected", "selected");
		$(boot_select).append(opt);

		// Append Select to dialog
		bootdiv.append(boot_label);
		bootdiv.append(boot_select);
		$(dialog_alter_client).append(bootdiv);


		$(dialog_alter_client).dialog({
			autoOpen: false,
			height: 300,
			width: 400,
			modal: true,
			buttons: [{
				// SAVE BUTTON
				text:i18n.gettext('dialog.save'),
				click:function() {
					var passwd=$(pass_input).val();
					var username=$(username_input).val();
					var mac=$(usernamediv).attr("macid");

					var client={};
					client["mac"]=mac;
					client["user"]=username;
					client["pass"]=passwd;
					console.log(client);
					var json_client=JSON.stringify(client);


					$.xmlrpc({
						url: 'https://'+sessionStorage.server+':9779',
						methodName: 'setClient',
						params: [[sessionStorage.username, sessionStorage.password], "LmdClientManager",mac, json_client],
						success: function(response,status,jqXHR){

							// Getting client default boot
							var bootSelected=$("#boot_select").val();
							//alert(bootSelected);

							if (bootSelected==="")  // we should remove boot for this client
								parameters=[[sessionStorage.username, sessionStorage.password], "LlxBootManager",mac];
							else
								parameters=[[sessionStorage.username, sessionStorage.password], "LlxBootManager",mac, bootSelected];

						// addig bootSelected to client boot configuration via n4d
						 $.xmlrpc({
							 url: 'https://'+sessionStorage.server+':9779',
							 methodName: 'setClientConfig',
							 params: parameters,
							 success: function(response,status,jqXHR){
								 $(dialog_alter_client).empty();
								 $(dialog_alter_client).dialog( "close" );
								 $(dialog_alter_client).remove();

								 // Force to regenerate lts.conf after create or modify new client
								 self.regenerateLtsConf();

								 self.showMe();
							 }}) // end inner xmlrpc call

					},
					error: function(jqXHR, status, error) { alert("Status: "+status+"\nError: N4D server is down "+error);}
				});


				// TO DO : Crida N4D per afegir client


			}
		},{
			text:i18n.gettext('dialog.cancel'),
			click:function() {
				$( this ).empty();
				$( this ).dialog( "close" );
				$("#tab_templates").empty();
				self.showMe();
			}
		},{
			text:i18n.gettext('dialog.delete'),
			class: 'bt_red',
			click:function() {

				var mac=$(usernamediv).attr("macid");

				$.xmlrpc({
					url: 'https://'+sessionStorage.server+':9779',
					methodName: 'deleteClient',
					params: [[sessionStorage.username, sessionStorage.password], "LmdClientManager",mac],
					success: function(response,status,jqXHR){
						$(dialog_alter_client).empty();
						$(dialog_alter_client).dialog( "close" );
						$(dialog_alter_client).remove();
						self.showMe();
					},
					error: function(jqXHR, status, error) { alert("Status: "+status+"\nError: N4D server is down "+error);}
				});




			}
		}

	]
});

$(dialog_alter_client).dialog("open");

}

ClientManager.prototype.RenderClients=function RenderClients(response,status,jqXHR){
	var self = this;
	//console.log("self from RenderClients");
	//console.log(self);

	var mac=JSON.parse(response)['mac'];
	var username=JSON.parse(response)['user'];
	var passwd=JSON.parse(response)['pass'];

	var item=$(document.createElement("div")).addClass("ClientItem").html(mac).attr("id", "bt_client_"+mac);
	// Get Boot Image for this client (if exists)

		$.xmlrpc({
			url: 'https://'+sessionStorage.server+':9779',
			methodName: 'getClientConfig',
			params: ['', "LlxBootManager", mac],
			success:function(response,status,jqXHR){
				$("#tab_clients").append(item);
					$(item).bind("click", function(){
					self.showDialogAlterClient(response, item, mac, username, passwd);
				});
			},
			error: function(jqXHR, status, error) { alert("Status: "+status+"\nError reading client boot config. "+error);}
	});

}

ClientManager.prototype.bind_ui=function bind_ui(){
	var self = this;
	console.log("from bind self is:");
	console.log(self);
	// Set dialog titles
	$("#dialog-form-edit").attr("title", i18n.gettext("buttonsuite.edit"));
	//$("#dialog-form-clone").attr("title", i18n.gettext("templatemanager.clone"));
	$("#dialog-form-delete").attr("title", i18n.gettext("buttonsuite.edit"));
	$("#dialog-confirm").attr("title", i18n.gettext("templatemanager.warning"));


	// Setting dialog for edit template
	$("#dialog-form-edit").dialog({
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
					$("#dialog-form-edit").empty();
					$("#dialog-form-edit").dialog( "close" );
					//$("#dialog-form-edit").remove();
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

ClientManager.prototype.showMe=function showMe(){
	var self=this;
	//console.log("self from showme");
	//console.log(self);

	self.LoadClients();
}
