/* Main Image Manager Object  */


function ImageManager(){

	this.image_filenames = new Array();
	this.ImageListButtons=new Array();
	this.currenttasks = new Array();
	this.synctask = 0;
	this.imageCounter = 0;
	var self = this;
	self.server = null;
	this.timer=null;
	this.micontadoretemporal = 1;
	this.TimerList = {};
	this.ImageMinimalInstalled=true; // By default not ask for deploy minimal install
	this.ImageListLliureX13={}; // List of images LliureX 13 to update
	this.default_boot_image="";
	this.inform_list = {};
	this.HDBOOT = "boot-from-hd";

	this.DisplayTopImageButtons=function DisplayTopImageButtons(){
		//Add button to create new image
		item="<div class='topImageManagerButtons'>"
		//item+="<div class='NewImageItem' id='NewImageButton'>"+i18n.gettext("imagemanager.newimage")+"</div>";
		item+="<div class='NewImageItem ui-button-primary ui-button ui-widget ui-state-default ui-corner-all' id='NewImageButton'>"+i18n.gettext("imagemanager.newimage")+"</div>";
		//item+="<div class='NewImageItem' id='ImportImageBt'>"+i18n.gettext("imagemanager.importimage")+"</div>";
		item+="<div class='NewImageItem ui-button-primary ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only' id='ImportImageBt'>"+i18n.gettext("imagemanager.importimage")+"</div>";
		item+="<input id='ImportImageFile' type='file'/></div>"

		$("#tab_images").append(item);

		/* Bind Import Button */
		$("#ImportImageBt").bind("click", function(){
			$("#ImportImageFile").click();
		})

		$("#ImportImageFile").change(function () {
			if ($("#ImportImageFile").val() == "") {
				return;
			} else
				{
					path=$("#ImportImageFile").val();
					path_split=path.split("/");
					filename=(path_split[path_split.length-1]);
					filename=filename.substring(0,filename.length-7);
					self.importImage(path, filename);
				}
			});

		/*
		 *
		 *Create form to make image
		 *
		*/
		$("#NewImageButton").bind("click", function(){
			for (job in self.currenttasks)
			{
				if(self.currenttasks[job]['status']==="running"){
					myalert(i18n.gettext("imagemanager.build.image"));
					return ;
				}
			}
			// Prepare Dialog Image
			$("#dialog-create-new-image").empty();
			// Set image to null
			sessionStorage.template_for_image="";

			// Minimal Image, check first if minimal client is installed
			if (self.image_filenames.indexOf('mini-light-client.json')<0) {
				var div_for_minimal_image=$(document.createElement('div')).addClass('div_for_minimal_image');
				var caution_icon=$(document.createElement('i')).addClass("icon-info-sign");
				var div_minimal_installer_header=$(document.createElement('div')).addClass('minimal_header');
				$(div_minimal_installer_header).append(caution_icon).append(i18n.gettext("imagemanager.minimalavailable"));

				var div_minimal_installer_text=$(document.createElement('div')).addClass('minimal_text');
				$(div_minimal_installer_text).append(i18n.gettext("imagemanager.infocreateimage"));

				var confirm_button_div=$(document.createElement('div'));
				//var confirm_button=$(document.createElement('button')).html(i18n.gettext('Yes! It seems cool!')).attr("id","BuildMinimalImageButton").addClass("green");
				confirm_button_div.html(i18n.gettext('imagemanager.confirmcool')).attr("id","BuildMinimalImageButton").addClass("green");

				div_for_minimal_image.append(div_minimal_installer_header);
				div_for_minimal_image.append(div_minimal_installer_text);
				div_for_minimal_image.append(confirm_button_div);
				$("#dialog-create-new-image").append(div_for_minimal_image);

				$(div_for_minimal_image).bind("mouseover", function(){
							$(div_for_minimal_image).stop().animate({height:'130'}, 400);
							//$(div_for_minimal_image).attr("style", "height:200px;");
					});
				$(div_for_minimal_image).bind("mouseout", function(){
							(div_for_minimal_image).stop().animate({height:'30px'}, 400);
							//$(div_for_minimal_image).attr("style", "height:30px;");
					});

				$(confirm_button_div).bind("click", function(){
                    $("#dialog-create-new-image").empty();
                    $("#dialog-create-new-image").dialog('close');
					$(div_for_minimal_image).hide();
					self.deployMimimalClient();
					// Mirar si es poguera tancar... -> Ja es tanca dos linies mes amunt :D

				});
			} // END OF MINIMAL CLIENT

			// Dialog for New Image

			var name_item="<div id='image_name'>"+
			"<div id='label_image_name'>"+i18n.gettext("imagemanager.imagename")+"</div>"+
			"<input type='text' id='input_image_name'></input>"+
			"<div id='label_image_Description'>"+i18n.gettext("imagemanager.imagedescription")+"</div>"+
			"<textarea id='input_image_description'></textarea></div>";

			var item="<div id='TemplateSelector'></div>";
			$("#dialog-create-new-image").append(name_item);
			$("#dialog-create-new-image").append(item);

			self.LoadTemplates($("#TemplateSelector"));

			$("#dialog-create-new-image").dialog("open");

			})
		}

	this.deployMimimalClient=function deployMinimalClient(){

			// Prepare Log Dialog
			server=self.PrepareLogDialog();
			//var myTimer;

			// Binding Socket
			server.bind('', '', function(){
				try{
					port=server.address().port;
					addr=server.address().address;
					$("#output_log").append("<div class='tty'><b>Local socket:"+addr+":"+port+"</b></div>");

					$("#output_log").on('appendedToLog',function(e, msg){
					//clearInterval(myTimer);
					//myTimer=setInterval(function(){
					//	var content=$("#output_log div.tty:last span.progress").html();
					//	$("#output_log div.tty:last span.progress").html(content+".");// append("<span class=tty'>.&nbsp;.&nbsp;</span>");
					//	},1000)
					})

					$.xmlrpc({
						url: 'https://'+sessionStorage.server+':9779',
						methodName: 'deploy_minimal_client',
						params: [[sessionStorage.username, sessionStorage.password], "LmdServer","", port, sessionStorage.server],
						success: function(response,status,jqXHR){
							st=response[0]['status'];
							msg=response[0]['msg'];
							if (st==true) {
								title="LMD";
								content=i18n.gettext("imagemanager.finishminilightclient");
								//CustomNofity(title, content);
								myalert(title, content);
								//clearInterval(myTimer);
								$('#tab_bootmanager').attr('src',function(i,val){return val;});
							} else alert(response[0]['msg']);

						},
						error: function(jqXHR, status, error) {
							response="Unknown error. Server disconnected?"
							//$("#output").append("<div style='color:#ff0000' class='tty'><b>Error! Status:"+status+" Response: "+response+" <div></b>");
							$("#output_log").append("<div style='color:#ff0000' class='tty'><b>Error! Status:"+status+" Response: "+response+" <div></b>");
							server.close();
							//alert("Status: "+status+"\nError: "+error);
						}
					})
				}
				catch (error){
					alert(error);
				}
			});

		}

	this.importImage=function importImage(path, filename){
			server=self.PrepareLogDialog();
			var myTimer;

			server.bind('', '', function(){
			try{
				port=server.address().port;
				addr=server.address().address;
				$("#output_log").append("<div class='tty'><b>Local socket:"+addr+":"+port+"</b></div>");
				$("#output_log").on('appendedToLog',function(e, msg){
					/*clearInterval(myTimer);
					myTimer=setInterval(function(){
						var content=$("#output_log div.tty:last span.progress").html();
						$("#output_log div.tty:last span.progress").html(content+".");// append("<span class=tty'>.&nbsp;.&nbsp;</span>");
						},1000)*/
				})

				$.xmlrpc({
					url: 'https://'+sessionStorage.server+':9779',
					methodName: 'import_image',
					params: [[sessionStorage.username, sessionStorage.password], "LmdServer","", port, filename, path, sessionStorage.server],
					success: function(response,status,jqXHR){
						st=response[0]['status'];
						msg=response[0]['msg'];
						if (st==true&&msg=='0') {
							title="LMD";
							content=i18n.gettext("imagemanager.finishimage",[filename]);
							clearInterval(myTimer);
							myalert(title, content);
							//CustomNofity(title, content);
							$('#tab_bootmanager').attr('src',function(i,val){return val;});

						} else alert("Exception in Export: "+msg);
						self.showMe();

					},
					error: function(jqXHR, status, error) {
						response="Unknown error. Server disconnected?"
						//$("#output").append("<div style='color:#ff0000' class='tty'><b>Error! Status:"+status+" Response: "+response+" <div></b>");
						$("#output_log").append("<div style='color:#ff0000' class='tty'><b>Error! Status:"+status+" Response: "+response+" <div></b>");
						server.close();
						//alert("Status: "+status+"\nError: "+error);
					}
				})
			}
			catch (error){
				alert(error);
			}
		});
		}

	this.RenderTemplateCallback=function RenderTemplateCallback(response,file){

		try{

			var resp=JSON.parse(response);
			var filename=resp['meta_inf']['name'];
			var default_section=resp['default'];
			var available;

			if (typeof(resp['meta_inf']['available']) !="undefined"){
				available=resp['meta_inf']['available'];
			}
			else
				available=false;


			var name = typeof(default_section["llx_name"]) !== 'undefined' ? default_section["llx_name"] : 'unknown';
			var desc = typeof(default_section["llx_desc"]) !== 'undefined' ? default_section["llx_desc"] : 'no description';
			var icon = typeof(default_section["llx_img"]) !== 'undefined' ? default_section["llx_img"] : 'icon_unknown.png';


			// Remove "
			name=(name.replace("\"", "")).replace("\"", "");
			item=$(document.createElement("div")).addClass("TemplateSelectorImage").attr("id", filename).attr("bgimg", icon).attr("style", "background-image: url(css/icons/"+icon+")").html(name);

			$("#TemplateSelector").append(item);

			if (available) {
				$(item).unbind("click");
				$(item).bind("click",function(){
							$(".TemplateSelectorImageSelected").removeClass("TemplateSelectorImageSelected");
							var target=$(this).attr("id");
							//$(".ImageSelectable").attr("style", "background: #ffffff");
							$(this).addClass("TemplateSelectorImageSelected");
							$("#"+sessionStorage.template_for_image).removeClass("TemplateSelectorImageSelected");
							sessionStorage.template_for_image=target;
							sessionStorage.bgimg_for_image=$(this).attr("bgimg"); // Copy image from template
						});
			} else {
				//$(item).addClass("TemplateUnavailable");


				unavailable_div=$(document.createElement("div")).addClass("TemplateUnavailable");
				unavailable_text=$(document.createElement("div")).html(i18n.gettext("imagemanager.mirror_unavailable_br")).addClass("textUnavailable");

				$(item).append(unavailable_div);
				$(item).append(unavailable_text);

				$(item).unbind("click");
				text=i18n.gettext("imagemanager.mirror_unavailable_desc");
				$(item).bind("click",function(){myalert(i18n.gettext("imagemanager.mirror_unavailable"), text);});
				};

		} catch (e){
			//Smoking exception
			}
	};

	this.LoadTemplates=function LoadTemplates(ts){
		/*****************************
		 Loads template list via n4d and
		 renders it.
		 ****************************/

		// Empty templates tab...
		ts.empty();

		// Show waiting indicator:
		ts.append("<img src='css/img/ajax-loader.gif' id='loading-indicator-image' style='display:block' />");

		// Load Templates via n4d

		$.xmlrpc({
			url: 'https://'+sessionStorage.server+':9779',
			methodName: 'getTemplateList',
			params: ['', "LmdTemplateManager"],
			success: function(response,status,jqXHR){
				$('#loading-indicator-image').hide();


				// NEW
				template_names=JSON.parse(response);
				for (i=0; i<template_names.length;i++) {
					//self.ReadTemplate(template_names[i]);

					// for each template, let's get its content
					$.xmlrpc({
						url: 'https://'+sessionStorage.server+':9779',
						methodName: 'getTemplate',
						params: ['', "LmdTemplateManager", template_names[i]],
						//success: self.RenderTemplateCallback,
						success: function(response,status,jqXHR){
							self.RenderTemplateCallback(response,template_names[i]);
						},
						error: function(jqXHR, status, error) { alert("Status: "+status+"\nError: N4D server is down "+error);}
				});

				}

				/*template_names=JSON.parse(response);
				sessionStorage.template_for_image="";
				for (i=0; i<template_names.length;i++) {
					//item="<div class='ImageSelectable' id='"+template_names[i]+"'>"+template_names[i]+"</div>";

					item=$(document.createElement("div")).addClass("TemplateSelectorImage").attr("style", "background-image: url(css/icons/"+icon);


					ts.append(item);


					//self.ReadTemplate(template_names[i]);

					// for each template, let's get its content
					/*$.xmlrpc({
						url: 'https://'+sessionStorage.server+':9779',
						methodName: 'getTemplate',
						params: ['', "LmdTemplateManager", template_names[i]],
						success: self.RenderTemplateCallback,
						error: function(jqXHR, status, error) { alert("Error: "+error[0])}
				});* /

				}
				$(".ImageSelectable").bind("click",function(){
						target=$(this).attr("id");
						$(".ImageSelectable").attr("style", "background: #ffffff");
						$(this).attr("style", "background: #8888ff");
						sessionStorage.template_for_image=target;
						//alert(target);
				});*/
			},
			error: function(jqXHR, status, error) { alert("Status: "+status+"\nError: N4D server is down "+error);}
		});

	}

	this.PrepareLogDialog=function PrepareLogDialog(){
		// Prepare Log
		//header="<div>Listening...</div>";
		tty="<div class='tty_container' id='output_log'>This is log!</div>";
		//item=header+tty;
		item=tty;
		$("#dialog-for-log").empty();
		$("#dialog-for-log").append(item);

		// Prepare Socket
		server=sock.CreateSocket($("#output_log"));
		self.server = server;
		// Setting socket port into dialog

		$("#dialog-for-log").dialog("open");

		return server;

	}

	this.remove_listener=function remove_listener(port){
		$.xmlrpc({
			url: 'https://'+sessionStorage.server+':9779',
			methodName: 'remove_listener',
			//(self, ip, port, job_id):

			params: [[], "LmdServer","", port,sessionStorage.template_for_image, sessionStorage.server],
			success: function(response,status,jqXHR){
				if (response) {
					//$("#output").append("<div class='tty'><b>Finished with status:"+status+" and Response: "+response+" <div></b>");
					//$("#output_"+divs_id).append("<div class='tty'><b>Finished with status:"+status+" and Response: "+response+" </b><div>");
					// Wait for last datagrams
					window.setTimeout(function(){
							server.close();
						},1000);
				}
				//server.close();
			},
			error: function(jqXHR, status, error) {
				response="Unknown error. Server disconnected?"
				//$("#output").append("<div style='color:#ff0000' class='tty'><b>Error! Status:"+status+" Response: "+response+" <div></b>");
				$("#output_log").append("<div style='color:#ff0000' class='tty'><b>Error! Status:"+status+" Response: "+response+" <div></b>");
				server.close();
				//alert("Status: "+status+"\nError: "+error);
			}
			})
	}

	this.getImageList=function getImageList(callback_){
		$.xmlrpc({
			url: 'https://'+sessionStorage.server+':9779',
			methodName: 'getImageList',
			params: ['', "LmdImageManager"],
			success: function(response,status,jqXHR){
				self.image_filenames = JSON.parse(response[0]);
				self.synctask--;
				callback_();
			},
			error: function(jqXHR, status, error) {
				alert("Status: "+status+"\nError: N4D server is down "+error);
				token=false;

			}
		});
	}

	this.getTaskList=function getTaskList(callback_){
		$.xmlrpc({
			url: 'https://'+sessionStorage.server+':9779',
			methodName: 'getJobList',
			params: ['', "LmdServer"],
			success: function(response,status,jqXHR){
				self.currenttasks = JSON.parse(response[0]);
				self.synctask--;
				callback_();
			},
			error: function(jqXHR, status, error) { alert("Status: "+status+"\nError: N4D server is down "+error);}
		});

	}

	this.buttonWait = function buttonWait(id, jobid){
		// Ask n4d if id is working
		//alert("waiting for "+jobid);
		$.xmlrpc({
					url: 'https://'+sessionStorage.server+':9779',
					methodName: 'getJobStatus',
					params: ['', "LmdServer", jobid],
					success: function(response,status,jqXHR){
						if (response[0]['msg']==='running') {
							self.TimerList[jobid] = setTimeout(function(){self.buttonWait(id,jobid)}, 5000);
						} else { // response!=running
							self.normalizeButton($("#btimg_"+id));
						}

					},
					error: function(jqXHR, status, error) { alert("Status: "+status+"\nError: N4D server is down "+error);}
				});

	}

	this.normalizeButton = function normalizeButton(button){
			// button is a jquery object
			button.removeClass("working");
	}

	this.renderButtons = function renderButtons(){
		// Set Jobs
		var listargs = {};
		for (job in this.currenttasks)
		{
			if(this.currenttasks[job]['status']==="running"){
				var target=this.currenttasks[job]['target'];
				var job_id = this.currenttasks[job]['job_id'];
				for(button in self.ImageListButtons){
					if (self.ImageListButtons[button].id===target) {
						self.ImageListButtons[button].setStatus("running");
						if (self.inform_list[job_id] !== true){
							self.inform_list[job_id] = true;
							$.xmlrpc({
										url: 'https://'+sessionStorage.server+':9779',
										methodName: 'inform_me',
										params: ['', "LmdServer", job_id],
										success: function(response,status,jqXHR){
											myalert("Fin","Ha finalizado la imagen " + target);
											self.inform_list[job_id] = false;
											self.showMe();
										},
										error: function(jqXHR, status, error) {
											alert("Status: "+status+"\nError: N4D server is down "+error);
										}
									});
						}
						listargs[self.ImageListButtons[button].id] = {'job_id':job_id};
					} else if (self.ImageListButtons[button].status==="enabled") {
						self.ImageListButtons[button].setStatus("disabled");
					}

				};
			}
		}
		// render All
		for (bt in self.ImageListButtons) {
			(function(){

				var a1 = self.ImageListButtons[bt].id;
				var aux_args = listargs[self.ImageListButtons[bt].id];

				var auxiliar = {'listen':{'function':self.showLogDialog,'args':aux_args},
							   /*'edit':{'function':function(){alert("estas editando " + a1)}},*/
							   'edit':{'function':
							       function(){
										self.editImages(a1);
									}
								},
							   /*'edit':{'function':function(){myalert("Alerta", "estas editando " + a1); self.showMe()}},*/
							   'delete':{'function':
									function(){
										// Ask confirmation
										confirmDelete=$(document.createElement("div")).attr("id", "CustomConfirm");
										 //$("#CustomConfirm").html("pajarito");
										 $("body").append(confirmDelete);
										 $("#CustomConfirm").html(i18n.gettext("dialog.confirm.delete"));
										 
										 $("#CustomConfirm").dialog({
												resizable: false,
												modal: true,
												title: i18n.gettext("dialog.confirm.delete.title"),
												height: 250,
												width: 400,
												buttons: {
													"Si": function () {
														$(this).dialog('close');
														$("#CustomConfirm").remove();
														self.deleteImage(a1);
														self.showMe();
													},
													"No": function () {
														$(this).dialog('close');
														$("#CustomConfirm").remove();
														self.showMe();
												
													}
												}
											});
										 

											
										//if(confirm(i18n.gettext("ask.sure.delete")))
										//	self.deleteImage(a1);

									}},
								'refresh':{'function':
									function(){
										self.refreshImage(a1);
										}
								  },
								  'unmark_refresh':{'function':
									function(){
										self.unmarkAsEditable(a1);
										}

								  },
								  'edit_meta_info':{'function':
									function(){
										image_file=a1+".json";
										// Get info for image
										$.xmlrpc({
											url: 'https://'+sessionStorage.server+':9779',
											methodName: 'getImage',
											params: ['', "LmdImageManager", image_file],
											success: function(response,status,jqXHR){
												self.editInfoForImage(JSON.parse(response[0]));

											},
											error: function(jqXHR, status, error) {
												alert("Status: "+status+"\nError: N4D server is down "+error);
												//alert("Status: "+status+"\nError: "+error);
											}
										})

										}
								  },
								  'set_default_boot':{'function':
									function(){
										var default_image = a1;
										// Check if you click on star button to disable this image as default boot
										if (self.default_boot_image === a1){
											// Disable default boot
											self.default_boot_image = null;
											self.render_default_boot();
											default_image = self.HDBOOT;
										}
										// Call n4d method to set default boot
										$.xmlrpc({
											url: 'https://'+sessionStorage.server+':9779',
											methodName: 'setDefaultBootImage',
											params: [[sessionStorage.username, sessionStorage.password], "LmdBootManager", default_image],
											success: function(response,status,jqXHR){
												self.default_boot_image = default_image;
												self.render_default_boot();
												self.showBootLabel();
												// Add notification for event
												lmdNotifier.addNotification("info", "boot_changed", "_boot.changed+"+default_image);
											},
											error: function(jqXHR, status, error) {
												alert("Status: "+status+"\nError: N4D server is down "+error);
												//alert("Status: "+status+"\nError: "+error);
											}
										});
									}
								  },
								  'edit_boot_options':{'function':
									function(){
										image_file=a1+".json";
										// Get info for image
										$.xmlrpc({
											url: 'https://'+sessionStorage.server+':9779',
											methodName: 'getImage',
											params: ['', "LmdImageManager", image_file],
											success: function(response,status,jqXHR){
												self.editBootOptions(JSON.parse(response[0]));

											},
											error: function(jqXHR, status, error) {
												alert("Status: "+status+"\nError: N4D server is down "+error);
												//alert("Status: "+status+"\nError: "+error);
											}
										})

										}
								  },

								  'export':{'function':
									function(){

										server=self.PrepareLogDialog();
										var myTimer;
										// Binding Socket
										imgid=a1;
										server.bind('', '', function(){
											try{
												port=server.address().port;
												addr=server.address().address;
												$("#output_log").append("<div class='tty'><b>Local socket:"+addr+":"+port+"</b></div>");

												$("#output_log").on('appendedToLog',function(e, msg){
													/*clearInterval(myTimer);
													myTimer=setInterval(function(){
														var content=$("#output_log div.tty:last span.progress").html();
														$("#output_log div.tty:last span.progress").html(content+".");// append("<span class=tty'>.&nbsp;.&nbsp;</span>");
														},1000)*/
													})

												$.xmlrpc({
													url: 'https://'+sessionStorage.server+':9779',
													methodName: 'export_image',
													params: [[sessionStorage.username, sessionStorage.password], "LmdServer","", port, imgid, sessionStorage.server],
													success: function(response,status,jqXHR){
														st=response[0]['status'];
														msg=response[0]['msg'];
														if (st==true&&msg=='0') {
															title="LMD";
															clearInterval(myTimer);
															content=i18n.gettext("imagemanager.finishcompress",[sessionStorage.server,imgid]);
															myalert(title, content);
															//CustomNofity(title, content);


														} else alert("Exception in Export: "+msg);
														self.showMe();

													},
													error: function(jqXHR, status, error) {
														response="Unknown error. Server disconnected?"
														//$("#output").append("<div style='color:#ff0000' class='tty'><b>Error! Status:"+status+" Response: "+response+" <div></b>");
														$("#output_log").append("<div style='color:#ff0000' class='tty'><b>Error! Status:"+status+" Response: "+response+" <div></b>");
														server.close();
														//alert("Status: "+status+"\nError: "+error);
													}
												})
											}
											catch (error){
												alert(error);
											}
										})
									} // Export Function
								  }




								} // auxiliar;
				self.ImageListButtons[bt].renderMe("#tab_images",auxiliar);
				})();

		}
	}

	this.editInfoForImage=function editInfoForImage(image){
			var desc=image['desc'];
			var id=image['id'];
			var bgimg=image['img'];
			var template=image['template'];
			var name=image['name'];
			var ltsp_fatclient=image['ltsp_fatclient'];
			var ldm_session=image['ldm_session'];
			var ldm_language = typeof image['ldm_language'] !== 'undefined' ? image['ldm_language'] : process.env.LANG;
			var fat_ram_threshold=image['fat_ram_threshold'];
			var use_local_apps=image['use_local_apps'];
			var local_apps_text=image['local_apps_text'];
			var lmd_extra_params=image['lmd_extra_params'];

			// Check defaults
			if (typeof(ldm_session)==="undefined") ldm_session="default";
			if (typeof(ltsp_fatclient)==="undefined") ltsp_fatclient="undefined";
			if (typeof(fat_ram_threshold)==="undefined") fat_ram_threshold="default";
			if (typeof(lmd_extra_params)==="undefined") lmd_extra_params="";


			// Prepare Dialog
			$("#dialog-edit-image-info").empty();

			// Form for Name
			name_item=$(document.createElement("div")).attr("id", "image_name").attr("img_id", id).attr("bgimg", bgimg).attr("img_template", template);
			label_image_item=$(document.createElement("div")).html(i18n.gettext("imagemanager.imagename"));
			input_image_name=$(document.createElement("input")).attr("type", "text").attr("id", "input_image_name").attr("style","width: 300px;").val(name);
			name_item.append(label_image_item);
			name_item.append(input_image_name);
			$("#dialog-edit-image-info").append(name_item);

			// Form for Description
			desc_item=$(document.createElement("div")).attr("id", "desc_item");
			label_desc_item=$(document.createElement("div")).html(i18n.gettext("imagemanager.imagedescription")).attr("id", "label_image_Description");
			input_desc_item=$(document.createElement("textarea")).attr("style","width: 500px; height: 100px;").attr("id","input_image_description").val(desc);
			desc_item.append(label_desc_item);
			desc_item.append(input_desc_item);
			$("#dialog-edit-image-info").append(desc_item);

			// FAT CLIENT OR THIN CLIENT BY IMAGE
			fat_div=$(document.createElement("div")).attr("style","margin-left: 50px;");
			fat_label=$(document.createElement("span")).html(i18n.gettext("Use this client as: ")).addClass("fat_client_for_image").attr("style", "float: left; width:200px;");
			fat_select=$(document.createElement("select")).attr("id", "fat_client_for_image_select").addClass("fat_client_for_image");
			fat_option1=$(document.createElement("option")).attr("value","false").html(i18n.gettext("imagemanager.thinclient"));
			fat_option2=$(document.createElement("option")).attr("value","true").html(i18n.gettext("imagemanager.fatclient"));
			fat_option3=$(document.createElement("option")).attr("value","undefined").html(i18n.gettext("imagemanager.defaultvalue"));
			fat_select.append(fat_option1);
			fat_select.append(fat_option2);
			fat_select.append(fat_option3);
			$(fat_select).val(ltsp_fatclient);

			fat_div.append(fat_label);
			fat_div.append(fat_select);
			fat_div.css('display','none');
			$("#dialog-edit-image-info").append(fat_div);


			// DEFAULT SESSION
			session_div=$(document.createElement("div")).attr("style","margin-left: 50px;");
			session_label=$(document.createElement("span")).html(i18n.gettext("imagemanager.defaultsession")).addClass("session_for_image").attr("style", "float: left; width:200px;");
			session_select=$(document.createElement("select")).attr("id", "session_for_image_select").addClass("session_for_image");
			session_option1=$(document.createElement("option")).attr("value","gnome-fallback").html(i18n.gettext("imagemanager.gnomesession"));
			session_option2=$(document.createElement("option")).attr("value","/usr/bin/mate-session").html(i18n.gettext("imagemanager.alternativesession"));
			session_option3=$(document.createElement("option")).attr("value","default").html(i18n.gettext("imagemanager.defaultsession"));
			session_select.append(session_option1);
			session_select.append(session_option2);
			session_select.append(session_option3);
			$(session_select).val(ldm_session);
			session_div.css("display",'none');
			session_div.append(session_label);
			session_div.append(session_select);

			$("#dialog-edit-image-info").append(session_div);

			// DEFAULT LANGUAGE LDM
			ldm_language_div=$(document.createElement("div")).attr("style","margin-left: 50px;");
			ldm_language_label=$(document.createElement("span")).html(i18n.gettext("imagemanager.defaultldmlanguage")).addClass("ldm_language").attr("style", "float: left; width:200px;");
			ldm_language_select=$(document.createElement("select")).attr("id", "default_language_for_ldm").addClass("ldm_language");
			ldm_language_option1=$(document.createElement("option")).attr("value","ca_ES.UTF-8@valencia").html(i18n.gettext("imagemanager.valencian"));
			ldm_language_option2=$(document.createElement("option")).attr("value","es_ES.UTF-8").html(i18n.gettext("imagemanager.spanish"));
			ldm_language_option3=$(document.createElement("option")).attr("value","en_GB").html(i18n.gettext("imagemanager.english"));
			ldm_language_option4=$(document.createElement("option")).attr("value","default").html(i18n.gettext("imagemanager.defaultvalue"));
			ldm_language_select.append(ldm_language_option1);
			ldm_language_select.append(ldm_language_option2);
			ldm_language_select.append(ldm_language_option3);
			ldm_language_select.append(ldm_language_option4);
			$(ldm_language_select).val(ldm_language);

			ldm_language_div.append(ldm_language_label);
			ldm_language_div.append(ldm_language_select);

			$("#dialog-edit-boot-options").append(ldm_language_div);

			// RAM Threshold
			ram_div=$(document.createElement("div")).attr("style","margin-left: 50px;");
			ram_label=$(document.createElement("span")).html(i18n.gettext("imagemanager.launchimageisless")).addClass("ram_for_image").attr("style", "float: left; width:200px;");
			ram_select=$(document.createElement("select")).attr("id", "ram_for_image_select").addClass("ram_for_image");
			ram_option1=$(document.createElement("option")).attr("value","128").html(i18n.gettext("mb128"));
			ram_option2=$(document.createElement("option")).attr("value","256").html(i18n.gettext("mb256"));
			ram_option3=$(document.createElement("option")).attr("value","512").html(i18n.gettext("mb512"));
			ram_option4=$(document.createElement("option")).attr("value","default").html(i18n.gettext("imagemanager.dontuse"));

			ram_select.append(ram_option1);
			ram_select.append(ram_option2);
			ram_select.append(ram_option3);
			ram_select.append(ram_option4);
			ram_select.val(fat_ram_threshold);

			ram_div.append(ram_label);
			ram_div.append(ram_select);
			ram_div.css("display",'none');
			$("#dialog-edit-image-info").append(ram_div);

			self.localAppsForm($("#dialog-edit-image-info"),use_local_apps,local_apps_text);
			$(".local_apps_div").css("display", "none");


			// Additional Parameters
				// DEFAULT SESSION
			extra_div=$(document.createElement("div")).attr("style","margin-left: 50px;float: left;");
			extra_label=$(document.createElement("span")).html(i18n.gettext("imagemanager.aditionalparam")).attr("style", "float: left; width:200px; margin-top: 8px;");
			extra_input=$(document.createElement("input")).attr("type", "text").attr("id", "extra_input").attr("style", "width: 250px;").val(lmd_extra_params);
			extra_div.append(extra_label);
			extra_div.append(extra_input);
			extra_div.css("display",'none');
			//$("#dialog-edit-image-info").append(extra_div).val(lmd_extra_params);
			$("#dialog-edit-image-info").append(extra_div);

			$("#dialog-edit-image-info").dialog("open");

		}

	this.substringMatcher =function substringMatcher(strs){
		// Aux Function for typeahead.js
		return function findMatches(q, cb) {
		  var matches, substrRegex;
		   // an array that will be populated with substring matches
		   matches = [];

		   // regex used to determine if a string contains the substring `q`
		   substrRegex = new RegExp(q, 'i');

		   // iterate through the pool of strings and for any string that
		   // contains the substring `q`, add it to the `matches` array
		   $.each(strs, function(i, str) {
			 if (substrRegex.test(str)) {
			   // the typeahead jQuery plugin expects suggestions to a
			   // JavaScript object, refer to typeahead docs for more info
			   matches.push({ value: str });
			 }
		   });

		   cb(matches);
		 };
	   };

	this.editBootOptions=function editBootOptions(image){

			var desc=image['desc'];
			var id=image['id'];
			var template=image['template'];
			var name=image['name'];
			var bgimg=image['img'];
			var ltsp_fatclient=image['ltsp_fatclient'];
			var ldm_session=image['ldm_session'];
			var ldm_language = typeof image['ldm_language'] !== 'undefined' ? image['ldm_language'] : process.env.LANG;
			var fat_ram_threshold=image['fat_ram_threshold'];
			var use_local_apps=image['use_local_apps'];
			var local_apps_text=image['local_apps_text'];
			var lmd_extra_params=image['lmd_extra_params'].replace(/<br\s*[\/]?>/gi, "\n");;

			// Check defaults
			if (typeof(ldm_session)==="undefined") {ldm_session="default"; alert("ldm_session undefined");}
			if (typeof(ltsp_fatclient)==="undefined") ltsp_fatclient="undefined";
			if (typeof(fat_ram_threshold)==="undefined") fat_ram_threshold="default";
			if (typeof(lmd_extra_params)==="undefined") lmd_extra_params="";

			// Prepare Dialog
			$("#dialog-edit-boot-options").empty();
			//$("#dialog-edit-boot-options").css("font-family", "Roboto");

			// Form for Name: NOT SHOWN
			name_item=$(document.createElement("div")).attr("id", "image_name").attr("bgimg", bgimg).attr("img_id", id).attr("img_template", template).attr("style","display: none;");
			label_image_item=$(document.createElement("div")).html(i18n.gettext("imagemanager.imagename")).attr("style","display: none;");
			input_image_name=$(document.createElement("input")).attr("type", "text").attr("id", "input_image_name").attr("style","width: 300px;").val(name).attr("style","display: none;");
			name_item.append(label_image_item);
			name_item.append(input_image_name);
			$("#dialog-edit-boot-options").append(name_item);

			// Form for Description
			desc_item=$(document.createElement("div")).attr("id", "desc_item").attr("style","display: none;");
			label_desc_item=$(document.createElement("div")).html(i18n.gettext("imagemanager.imagedescription")).attr("id", "label_image_Description").attr("style","display: none;");
			input_desc_item=$(document.createElement("textarea")).attr("style","width: 500px; height: 100px;").attr("id","input_image_description").val(desc).attr("style","display: none;");
			desc_item.append(label_desc_item);
			desc_item.append(input_desc_item);
			$("#dialog-edit-boot-options").append(desc_item);

			// Title for special settings
			//specific_title=$(document.createElement("h3")).html(i18n.gettext("imagemanager.specbootoptions"));
			//$("#dialog-edit-boot-options").append(specific_title);

			// FAT CLIENT OR THIN CLIENT BY IMAGE
			fat_div=$(document.createElement("div")).attr("style","margin-left: 50px;");
			fat_label=$(document.createElement("span")).html(i18n.gettext("imagemanager.use.client.as")).addClass("fat_client_for_image").attr("style", "float: left; width:200px;");
			fat_select=$(document.createElement("select")).attr("id", "fat_client_for_image_select").addClass("fat_client_for_image");
			fat_option1=$(document.createElement("option")).attr("value","false").html(i18n.gettext("imagemanager.thinclient"));
			fat_option2=$(document.createElement("option")).attr("value","true").html(i18n.gettext("imagemanager.fatclient"));
			fat_option3=$(document.createElement("option")).attr("value","undefined").html(i18n.gettext("imagemanager.defaultvalue"));
			fat_select.append(fat_option1);
			fat_select.append(fat_option2);
			fat_select.append(fat_option3);
			$(fat_select).val(ltsp_fatclient);

			fat_div.append(fat_label);
			fat_div.append(fat_select);
			$("#dialog-edit-boot-options").append(fat_div);


			// DEFAULT SESSION
			session_div=$(document.createElement("div")).attr("style","margin-left: 50px;");
			session_label=$(document.createElement("span")).html(i18n.gettext("imagemanager.defaultsession")).addClass("session_for_image").attr("style", "float: left; width:200px;");
			session_select=$(document.createElement("select")).attr("id", "session_for_image_select").addClass("session_for_image");
			session_option1=$(document.createElement("option")).attr("value","gnome-fallback").html(i18n.gettext("imagemanager.gnomesession"));
			session_option2=$(document.createElement("option")).attr("value","/usr/bin/mate-session").html(i18n.gettext("imagemanager.alternativesession"));
			session_option3=$(document.createElement("option")).attr("value","default").html(i18n.gettext("imagemanager.defaultvalue"));
			session_select.append(session_option1);
			session_select.append(session_option2);
			session_select.append(session_option3);
			$(session_select).val(ldm_session);

			session_div.append(session_label);
			session_div.append(session_select);

			$("#dialog-edit-boot-options").append(session_div);


			// DEFAULT LANGUAGE LDM
			ldm_language_div=$(document.createElement("div")).attr("style","margin-left: 50px;");
			ldm_language_label=$(document.createElement("span")).html(i18n.gettext("imagemanager.defaultldmlanguage")).addClass("ldm_language").attr("style", "float: left; width:200px;");
			ldm_language_select=$(document.createElement("select")).attr("id", "default_language_for_ldm").addClass("ldm_language");
			ldm_language_option1=$(document.createElement("option")).attr("value","ca_ES.UTF-8@valencia").html(i18n.gettext("imagemanager.valencian"));
			ldm_language_option2=$(document.createElement("option")).attr("value","es_ES.UTF-8").html(i18n.gettext("imagemanager.spanish"));
			ldm_language_option3=$(document.createElement("option")).attr("value","en_GB").html(i18n.gettext("imagemanager.english"));
			ldm_language_option4=$(document.createElement("option")).attr("value","default").html(i18n.gettext("imagemanager.defaultvalue"));
			ldm_language_select.append(ldm_language_option1);
			ldm_language_select.append(ldm_language_option2);
			ldm_language_select.append(ldm_language_option3);
			ldm_language_select.append(ldm_language_option4);
			$(ldm_language_select).val(ldm_language);

			ldm_language_div.append(ldm_language_label);
			ldm_language_div.append(ldm_language_select);

			$("#dialog-edit-boot-options").append(ldm_language_div);

			// RAM Threshold
			ram_div=$(document.createElement("div")).attr("style","margin-left: 50px;");
			ram_label=$(document.createElement("span")).html(i18n.gettext("imagemanager.launchimageisless")).addClass("ram_for_image").attr("style", "float: left; width:200px;");
			ram_select=$(document.createElement("select")).attr("id", "ram_for_image_select").addClass("ram_for_image");
			ram_option1=$(document.createElement("option")).attr("value","128").html(i18n.gettext("mb128"));
			ram_option2=$(document.createElement("option")).attr("value","256").html(i18n.gettext("mb256"));
			ram_option3=$(document.createElement("option")).attr("value","512").html(i18n.gettext("mb512"));
			ram_option4=$(document.createElement("option")).attr("value","default").html(i18n.gettext("imagemanager.dontuse"));

			ram_select.append(ram_option1);
			ram_select.append(ram_option2);
			ram_select.append(ram_option3);
			ram_select.append(ram_option4);
			ram_select.val(fat_ram_threshold);

			ram_div.append(ram_label);
			ram_div.append(ram_select);
			$("#dialog-edit-boot-options").append(ram_div);

			// Adding Local Apps subform (too big to insert here)
			self.localAppsForm($("#dialog-edit-boot-options"),use_local_apps,local_apps_text);

			// Additional Parameters
			// DEFAULT SESSION
			extra_div=$(document.createElement("div")).attr("style","margin-left: 50px;float: left;");
			extra_label=$(document.createElement("span")).html(i18n.gettext("imagemanager.aditionalparam")).attr("style", "float: left; width:200px; margin-top: 8px;");
			//extra_input=$(document.createElement("input")).attr("type", "text").attr("id", "extra_input").attr("style", "width: 250px;");
			extra_input=$(document.createElement("textarea")).attr("id", "extra_input").attr("style", "width: 470px; clear: both; height: 100px;");
			$(extra_input).val(lmd_extra_params);

			extra_div.append(extra_label);
			extra_div.append(extra_input);
			$("#dialog-edit-boot-options").append(extra_div);


			$("#dialog-edit-boot-options").dialog("open");

		}

	this.localAppsForm = function localAppsForm (divToAppend,use_local_apps_content,local_apps_text_content){
		var self=this;

		var local_apps_div=$(document.createElement("div")).addClass("local_apps_div");

		//local_apps_label=$(document.createElement("div")).html(i18n.gettext("Enable Local Apps"));
		var local_apps_title=$(document.createElement("div")).addClass("local_apps_title").html(("Local Apps"));
		var local_apps_desc=$(document.createElement("div")).addClass("local_apps_desc").html((i18n.gettext("Local.Apps.Desc")));
		var local_apps_enable=$(document.createElement("label")).addClass("local_apps_enable").html((i18n.gettext("Enable.Local.Apps"))).attr("for", "use_local_apps").addClass("left");

		var local_apps_switch=$(document.createElement("input")).attr("type", "checkbox").attr("id", "use_local_apps");
		$(local_apps_switch).attr("name", "local_apps-checkbox");

		var local_apps_switch_status=false;
		if (use_local_apps_content=="true") local_apps_switch_status=true;

		var local_apps_text=$(document.createElement("input"));
		$(local_apps_text).attr("type", "text");
		$(local_apps_text).attr("name", "local_apps");
		$(local_apps_text).attr("id", "local_apps");
		$(local_apps_text).val(local_apps_text_content);
		$(local_apps_text).attr("data-role", "tagsinput");
		$(local_apps_text).attr("placeholder", i18n.gettext("Add.Applications"));
		var local_apps_available=$(document.createElement("div")).attr("id", "commonapps");
		var local_apps_available_title=$(document.createElement("div")).addClass("local_apps_available_title").html(i18n.gettext("Some.util.apps"));
		$(local_apps_available).addClass("commonapps").append(local_apps_available_title);


		var availableapps=[
			{"command":"firefox",
			"name":"Mozilla Firefox",
			"icon": "css/appicons/firefox.png"},
			{"command":"chromium-browser",
			"name":"Navegador Chromium",
			"icon": "css/appicons/chromium-browser.png"},
			{"command":"google-chrome",
			"name":"Navegador Chrome",
			"icon": "css/appicons/google-chrome.png"}
		];


		for (i in availableapps){
			// Create App Icon
			var appicon=$(document.createElement("div")).addClass("local_apps_icon");
			$(appicon).css("background-image", "url("+availableapps[i]["icon"]+")");
			$(appicon).attr("icon_appname", availableapps[i]["command"]);
			$(local_apps_available).append(appicon);
			$(appicon).bind("click", function(event){
				appname=$(event.target).attr("icon_appname");

				$(local_apps_text).tagsinput('add', appname);

				});
			};
		var local_apps_text_div=$(document.createElement("div")).addClass("localAppsTextDiv");
		$(local_apps_text_div).append(local_apps_text);
		$(local_apps_text_div).append(local_apps_available);


		$(local_apps_div).append(local_apps_title);
		$(local_apps_div).append(local_apps_desc);
		$(local_apps_div).append(local_apps_enable);
		$(local_apps_div).append(local_apps_switch);
		$(local_apps_div).append(local_apps_text_div);

		//local_apps_label=gettext("Enable Local Apps");

		$(divToAppend).append(local_apps_div);


/*			if (use_local_apps_content)
			$(local_apps_switch).bootstrapSwitch('setState', true);
		else
			$(local_apps_switch).bootstrapSwitch('setState', false);*/


		$("[name='local_apps-checkbox']").bootstrapSwitch({
			size: "mini",
			state: local_apps_switch_status
		});

		var local_apps = ['firefox', 'google-chrome', "libreoffice", "gedit", "gimp", "inkscape", "3Dc", "blender",
						  'brutalchess', 'uxterm', 'xterm', 'dreamchess', 'eog', 'evnice', 'evince-preview',
						  'gnome-calculator', 'gigolo', 'gmusicbrowser', 'gnome-sudoku', 'gnome-mines', 'google-chrome-stable',
						  'mousepad', 'pdfpclauncher', 'pdfshuffler', 'pidgin', 'pychess', 'SciTE',
						  'shutter', 'simple-scan', 'thunderbird',  'transmission-gtk'];

		$(local_apps_text).tagsinput( {
			 tagClass: 'label label-info lmd-app-tag',
			 confirmKeys: [13, 44, 32],
			 typeaheadjs:({
				hint: true,
			    highlight: true,
				minLength: 1
				},
				{
					name: 'local_apps',
				  displayKey: 'value',
				source: self.substringMatcher(local_apps)
				})
			});

		// console.log($(".bootstrap-tagsinput").find("input"));
		$(".bootstrap-tagsinput").find("input").css("border", "0px").css("margin", "0px").css("overflow-y", "auto");



			/*

			http://timschlechter.github.io/bootstrap-tagsinput/examples/

			*/

			/*LOCAL_APPS_EXTRAMOUNTS=/home
			LOCAL_APPS = true
			LOCAL_APPS_MENU = true
			LOCAL_APPS_MENU_ITEMS = firefox,chromium-browser,synfig*/
			/* END LOCAL APPS*/


	}

	this.deleteImage = function deleteImage (img){
		// Blocking Gui
		var waitclock=$(document.createElement('div')).addClass('waitClock');
		var blockDiv = $(document.createElement('div')).addClass('blockDiv');
		blockDiv.append(waitclock);
		blockDiv.attr('id','blockDiv');
		$("body").append(blockDiv);
		//content.append(slide);
		//var blockDiv = $(document.createElement('div')).addClass('blockDiv').html(this.description);
		$.xmlrpc({
			url: 'https://'+sessionStorage.server+':9779',
			methodName: 'deleteImage',
			params: [[sessionStorage.username, sessionStorage.password], "LmdImageManager",img],
			success: function(response,status,jqXHR){
				title="LMD";
				content=i18n.gettext("imagemanager.images.deleted");
				//CustomNofity(title, content);
				myalert(title, content);
				$("#blockDiv").remove();
				$("#btimg_"+img).remove();
				var i = self.image_filenames.indexOf(img+".json");
				if (i !== -1) {
					self.image_filenames.splice(i,1);
				}
				delete self.ImageListButtons[img];
				$('#tab_bootmanager').attr('src',function(i,val){return val;});
				//self.showMe();
			},

			error: function(jqXHR, status, error) { alert("Status: "+status+"\nError: N4D server is down "+error);}
		});


	}

	this.refreshImage=function refreshImage(img){

			// Prepare Log Dialog
			server=self.PrepareLogDialog();
			var myTimer;

			// Binding Socket
			server.bind('', '', function(){
				try{
					port=server.address().port;
					addr=server.address().address;
					$("#output_log").append("<div class='tty'><b>Local socket:"+addr+":"+port+"</b></div>");

					$("#output_log").on('appendedToLog',function(e, msg){
						/*clearInterval(myTimer);
						myTimer=setInterval(function(){
							var content=$("#output_log div.tty:last span.progress").html();
							$("#output_log div.tty:last span.progress").html(content+".");// append("<span class=tty'>.&nbsp;.&nbsp;</span>");
							},1000)*/
					})

					$.xmlrpc({
						url: 'https://'+sessionStorage.server+':9779',
						methodName: 'refresh_image',
						params: [[sessionStorage.username, sessionStorage.password], "LmdServer","",sessionStorage.username, sessionStorage.password, port, img, sessionStorage.server],
						success: function(response,status,jqXHR){
							st=response[0]['status'];
							msg=response[0]['msg'];
							if (st==true) {
								self.unmarkAsEditable(img);
								title="LMD";
								content=i18n.gettext("imagemanager.finishupdate");
								//CustomNofity(title, content);
								myalert(title, content);
								clearInterval(myTimer);

							} else alert("Exception updating image: "+response[0]['msg']);


						},
						error: function(jqXHR, status, error) {
							response="Unknown error. Server disconnected?"
							//$("#output").append("<div style='color:#ff0000' class='tty'><b>Error! Status:"+status+" Response: "+response+" <div></b>");

							$("#output_log").append("<div style='color:#ff0000' class='tty'><b>Error! Status:"+status+" Response: "+response+" <div></b>");
							clearInterval(myTimer);

							server.close();
							//alert("Status: "+status+"\nError: "+error);
						}
					})
				}
				catch (error){
					alert(error);
				}
			});


	}

	this.unmarkAsEditable=function unmarkAsEditable(img){
		// Mark image as editable...
		$.xmlrpc({
			url: 'https://'+sessionStorage.server+':9779',
			methodName: 'setStatusImage',
			params: [[sessionStorage.username, sessionStorage.password], "LmdImageManager", img, "enabled"],
				success: function(response,status,jqXHR){
						self.showMe();
				},
				error: function(jqXHR, status, error) { alert("Status: "+status+"\nError: N4D server is down "+error);}
				});
		}

	this.editImages= function editImages(img){

		$.xmlrpc({
			url: 'https://'+sessionStorage.server+':9779',
			methodName: 'check_lmd_status',
			params: ['', "LmdServer"],
			success: function(response,status,jqXHR){
				if (response[0]['lmd_status']=='lmd-chroot-available') {
					local_user=process.env['USER'];
					cmd="/usr/share/lmd-scripts/awesome-desktop.sh "+img;
					remote_ip=sessionStorage.server;
					remote_user=sessionStorage.username;
					remote_password=sessionStorage.password;

					// Mark image as editable...
					$.xmlrpc({
						url: 'https://'+sessionStorage.server+':9779',
						methodName: 'setStatusImage',
						params: [[sessionStorage.username, sessionStorage.password], "LmdImageManager", img, "edited"],
							success: function(response,status,jqXHR){

							// When set image as edited, run remote execute
							$.xmlrpc({
								url: 'https://localhost:9779',
								methodName: 'remote_execute',
								params: ['', "RemoteGuiManager",local_user,cmd,remote_ip,remote_user,remote_password,true, "-listen tcp -dpi 96 -screen 900x675x24 -wr -title '"+img+"' "],
									success: function(response,status,jqXHR){
									self.showMe();
							},
							error: function(jqXHR, status, error) { alert("Status: "+status+"\nError: N4D server is down "+error);}
							});
							self.showMe();



					},
					error: function(jqXHR, status, error) { alert("Status: "+status+"\nError: N4D server is down "+error);}
					});



			}
			else myalert(i18n.gettext("imagemanager.alert"), i18n.gettext("imagemanager.operationslmd"));

			},
			error: function(jqXHR, status, error) { alert("Status: "+status+"\nError: N4D server is down "+error);}
		});




	}

	this.render_default_boot = function (){

		if (self.default_boot_image !== "" ){
			$(".image_boot_star").css("background-image","url(css/icons/icon_default_boot_unselected.png)");
			$(".image_boot_star#"+self.default_boot_image).css("background-image","url(css/icons/icon_default_boot.png)");
			$("#default_boot_div").remove();
			div_bootable=$(document.createElement("div")).addClass("Bootable").attr("id", "default_boot_div");
			div_bootable_text=$(document.createElement("div")).addClass("BootableText").html(i18n.gettext("imagemanager.default_boot"));
			div_bootable.append(div_bootable_text);
			$("#btimg_"+self.default_boot_image).append(div_bootable);
		}
	}

	this.loadImages = function loadImages(){
		if (self.synctask === 0) {
			// Set counter for number of images to load
			self.imageCounter=self.image_filenames.length;
			// load images
			for (i in self.image_filenames) {
				$.xmlrpc({
					url: 'https://'+sessionStorage.server+':9779',
					methodName: 'getImage',
					params: ['', "LmdImageManager", self.image_filenames[i]],
					success: function(response,status,jqXHR){
						var newButton=new BannerButton();
						json_button = JSON.parse(response[0]);
						status=json_button['status'];
						if (status===undefined) status='enabled';
						newButton.createButton(json_button['id'], json_button["name"], json_button["desc"], json_button["img"], status);
						self.ImageListButtons[json_button['id']]=newButton;

						self.imageCounter--;

						if (self.imageCounter==0) {
							// Set Jobs
							self.renderButtons();
						}

						self.render_default_boot();


						//$("#btimg_"+self.default_boot_image).addClass("Bootable");
						//if (self.default_boot_image==json_button['id']) alert ("found "+self.default_boot_image);



						/*json_button = JSON.parse(response[0]);
						json_button["working"] = false;
						json_button["job_id"] = null;
						for (i in self.currenttasks){
							id = json_button['id'];
							if ( id === self.currenttasks[i]['target'] && self.currenttasks[i]['status'] === "running") {
								json_button["working"] = true;
								json_button["job_id"] = self.currenttasks[i]["job_id"];
								var x = id;
								var job=self.currenttasks[i]['job_id'];
								if (!(json_button["job_id"] in self.TimerList)) {
									setTimeout(function(){self.buttonWait(x,job)}, 5000);
								}
							}
						}
						self.add_button(json_button);
						*/
					},
					error: function(jqXHR, status, error) { alert("Status: "+status+"\nError: N4D server is down "+error);}
				});
			}

		}


	}

	this.showImages = function showImages(){
		this.synctask = 3;
		this.getImageList(this.loadImages);
		this.getTaskList(this.loadImages);
		this.getDefaultBootImage(this.loadImages);
	}

	this.getDefaultBootImage = function getDefaultBootImage(callback_){
		$.xmlrpc({
				url: 'https://'+sessionStorage.server+':9779',
				methodName: 'getDefaultBootImage',
				params: ['', "LmdBootManager"],
				success: function(response,status,jqXHR){
					self.default_boot_image=response[0]["default_boot"];
					self.synctask--;
					self.showBootLabel();
					callback_();
				},
				error: function(jqXHR, status, error) {
					alert("Status: "+status+"\nError: N4D server is down "+error);
				}
			})


	}

	this.add_button = function add_button(image){
		/*buttonclass = "ImageItem";
		if (image["working"]) {
			buttonclass += ' working';
		}*/
		//item="<div class='"+buttonclass+"' id='btimg_"+image["id"]+"'>"+image["name"]+"</div>";


		listenbutton="<button id='"+image["id"]+"_listen'>Listen</button>";

		var button = new BannerButton();
		button.createButton(image["id"], image["name"], null, image["working"], listenbutton);
		if (image["working"]) {
			button.addState("running");
			BannerButton.addState(image["id"],"running");
		}

		//item = button.renderButton();



		button.renderMe("#tab_images",{'listen':self.showLogDialog});
		//$("#tab_images").append(item);
		/*
		$("#"+image["id"]+"_listen").bind("click",function showLogDialog(){



			server=self.PrepareLogDialog();

			// Binding Socket
			server.bind('', '', function(){
				port=server.address().port;
				addr=server.address().address;
				$("#output_log").append("<div class='tty'><b>Local socket:"+addr+":"+port+"</b></div>");
				$.xmlrpc({
					url: 'https://'+sessionStorage.server+':9779',
					methodName: 'add_listener',
					params: ['', "LmdServer","", port, image["job_id"]],
					success: function(response,status,jqXHR){
					},
					error: function(jqXHR, status, error) { alert("Error: "+error[0])}
				});


			});

		});
		*/
	}

	this.showLogDialog = function showLogDialog(event){

			var data = event.data;

			server=self.PrepareLogDialog();
			var myTimer;

			// Binding Socket
			server.bind('', '', function(){
				port=server.address().port;
				addr=server.address().address;
				$("#output_log").append("<div class='tty'><b>Local socket:"+addr+":"+port+"</b></div>");

				$("#output_log").on('appendedToLog',function(e, msg){
					/*clearInterval(myTimer);
					myTimer=setInterval(function(){
						var content=$("#output_log div.tty:last span.progress").html();
						$("#output_log div.tty:last span.progress").html(content+".");// append("<span class=tty'>.&nbsp;.&nbsp;</span>");
						},1000)*/
				})

				$.xmlrpc({
					url: 'https://'+sessionStorage.server+':9779',
					methodName: 'add_listener',
					params: ['', "LmdServer","", port, data.job_id],
					success: function(response,status,jqXHR){

						// Not used...
						// title="LMD";
						//content=i18n.gettext("imagemanager.finishtask");
						//CustomNofity(title, content);
						clearInterval(myTimer);
					},
					error: function(jqXHR, status, error) { alert("Status: "+status+"\nError: N4D server is down "+error);}
				});


			});
		};

	this.bind_ui=function bind_ui(){


		// Setting titles

		$("#dialog-create-new-image").attr("title", i18n.gettext("imagemanager.createnewimage"));
		$("#dialog-edit-boot-options").attr("title", i18n.gettext("imagemanager.bootparameters"));
		$("#dialog-edit-image-info").attr("title", i18n.gettext("imagemanager.editimageinfo"));
		$("#dialog-for-log").attr("title", i18n.gettext("imagemanager.workonserver"));


		// Prepare Callbacks
		function create_image_on_server(id, name, template, description, bgimg){

			var myTimer;

			$("#output_log").on('appendedToLog',function(e, msg){
				/*clearInterval(myTimer);
				myTimer=setInterval(function(){
					var content=$("#output_log div.tty:last span.progress").html();
					$("#output_log div.tty:last span.progress").html(content+".");// append("<span class=tty'>.&nbsp;.&nbsp;</span>");
				},1000)*/
			})

			$.xmlrpc({
				url: 'https://'+sessionStorage.server+':9779',
				methodName: 'create_image',
				params: [[sessionStorage.username, sessionStorage.password], "LmdServer","", port, id, name, template, description, bgimg, sessionStorage.server],
				success: function(response,status,jqXHR){
					// Potser açò millor amb una notificacio del sistema
					clearInterval(myTimer);
					title="LMD";
					content=i18n.gettext("imagemanager.finishwithstatus",[response]);
					//CustomNofity(title, content);
					myalert(title, content);


					// Redresh Window
					self.showMe();
					// Close Dialog
					$("#dialog-create-new-image").empty();
					$("#dialog-create-new-image").dialog( "close" );
					$('#tab_bootmanager').attr('src',function(i,val){return val;});

				},
				error: function(jqXHR, status, error) {
					response=i18n.gettext("imagemanager.errorunknown");
					//$("#output").append("<div style='color:#ff0000' class='tty'><b>Error! Status:"+status+" Response: "+response+" <div></b>");
					$("#output_log").append("<div style='color:#ff0000' class='tty'><b>Error! Status:"+status+" Response: "+response+" <div></b>");
					server.close();
					//alert("Status: "+status+"\nError: "+error);
				}
			})
		}

		function create_image_on_server_with_check(id, name, template, description, bgimg){

			$.xmlrpc({
				url: 'https://'+sessionStorage.server+':9779',
				methodName: 'check_chroot_exists',
				params: ['', "LmdServer", name],
				success: function(response,status,jqXHR){
					if (! response[0]['status']){
						create_image_on_server(id, name, template, description, bgimg);
					}
					else{
						alert("Image exists");
					}
				},
				error: function(jqXHR, status, error) {

					response=i18n.gettext("imagemanager.errorunknown");
					//$("#output").append("<div style='color:#ff0000' class='tty'><b>Error! Status:"+status+" Response: "+response+" <div></b>");
					$("#output_log").append("<div style='color:#ff0000' class='tty'><b>Error! Status:"+status+" Response: "+response+" <div></b>");
					server.close();
					//alert("Status: "+status+"\nError: "+error);
				}
			})

		}


		// Setting Dialogs

		$("#dialog-create-new-image").dialog({
		autoOpen: false,
		height: 500,
		width: 600,
		modal: true,
		buttons: [{
			text:i18n.gettext("dialog.create"),
			click: function() {
					var name=$("#input_image_name").val();
					//id=name; // TODO : add new text field filtered
					var id = sanitize(name);
					// TO_DO: avoid scripts in description...
					var description=$("#input_image_description").val();
					var list_id_images = new Array();
					for (x in self.ImageListButtons) {
						list_id_images.push(self.ImageListButtons[x].id);
					}
					if (name==="") {
						myalert(i18n.gettext("imagemanager.name.is.null"), i18n.gettext("imagemanager.specify.a.name"));
					}else if (list_id_images.indexOf(id)>=0) {
						myalert(i18n.gettext("imagemanager.name.is.duplicated.title"), i18n.gettext("imagemanager.name.is.duplicated.name"));
					}else if (sessionStorage.template_for_image != "") {
						$( this ).empty();
						$( this ).dialog( "close" );

						server=self.PrepareLogDialog();

						// Binding Socket
						server.bind('', '', function(){
							try{
								port=server.address().port;
								addr=server.address().address;
								$("#output_log").append("<div class='tty'><b>Local socket:"+addr+":"+port+"</b></div>");

								template = sessionStorage.template_for_image;
								bgimg=sessionStorage.bgimg_for_image;
								create_image_on_server_with_check(id, name, template, description, bgimg);

							}
							catch (error){
								alert(error);
							}
						});

					} else {
						myalert(i18n.gettext("imagemanager.imagenotselected"), i18n.gettext("imagemanager.select.image.please"));
					}

				}
			},
			{
				text:i18n.gettext("dialog.close"),
				click: function() {
					$( this ).empty();
					$( this ).dialog( "close" );
					self.showMe();
				}
			}
		]
		});

		$("#dialog-edit-image-info").dialog({
		autoOpen: false,
		height: 300,
		width: 550,
		modal: true,
		buttons: [
			{
				text:i18n.gettext("dialog.save"),
				click: function() {
					var name=$("#input_image_name").val();
					//var id=$("#image_name").attr("img_id");
					var id=$("#dialog-edit-image-info").find("#image_name").attr("img_id");
					var imgbg=$("#dialog-edit-image-info").find("#image_name").attr("bgimg");
					var template=$("#image_name").attr("img_template");
					var desc=$("#input_image_description").val();
					var ltsp_fatclient=$("#fat_client_for_image_select").val();
					var ldm_session=$("#session_for_image_select").val();
					var ldm_language=$("#default_language_for_ldm").val();
					var use_local_apps=$("#use_local_apps").bootstrapSwitch('state');
					var local_apps_text=$("#local_apps").val();
					var fat_ram_threshold=$("#ram_for_image_select").val();
					var lmd_extra_params=$("#extra_input").val();


					var data='{"desc": "'+desc+'",\n';
					data=data+'"id": "'+id+'",\n';
					data=data+'"template": "'+template+'",\n';
					data=data+'"name": "'+name+'",\n';
					data=data+'"img": "'+imgbg+'",\n';
					data=data+'"ltsp_fatclient": "'+ltsp_fatclient+'",\n';
					data=data+'"ldm_session": "'+ldm_session+'",\n';
					data=data+'"ldm_language": "'+ldm_language+'",\n';
					data=data+'"fat_ram_threshold": "'+fat_ram_threshold+'",\n';
					data=data+'"use_local_apps": "'+use_local_apps+'",\n';
					data=data+'"local_apps_text": "'+local_apps_text+'",\n';
					data=data+'"lmd_extra_params": "'+lmd_extra_params.replace(/"/g, '\\\"').replace(/\n/g, '<br/>')+'"\n}';



					$.xmlrpc({
						url: 'https://'+sessionStorage.server+':9779',
						methodName: 'setImage',
						params: [[sessionStorage.username, sessionStorage.password], "LmdImageManager", id, data],
						success: function(response,status,jqXHR){
							self.showMe();
							title="LMD";
							content=i18n.gettext("imagemanager.image.info.saved");
							CustomNofity(title, content);

							$("#dialog-edit-image-info").empty();
							$("#dialog-edit-image-info").dialog( "close" );

						},
						error: function(jqXHR, status, error) {
							alert("Status: "+status+"\nError: N4D server is down "+error);
						}
					})
				}
			},
			{
				text:i18n.gettext("dialog.cancel"),
				click: function() {
					$( this ).empty();
					$( this ).dialog( "close" );
					self.showMe();
				}
			}
		]
		});

		$("#dialog-edit-boot-options").dialog({
		autoOpen: false,
		height: 570,
		width: 570,
		modal: true,
		buttons: [
			{
				text:i18n.gettext("dialog.save"),
				click: function() {
					var name=$("#input_image_name").val();

					var id=$("#dialog-edit-boot-options").find("#image_name").attr("img_id");

					var imgbg=$("#dialog-edit-boot-options").find("#image_name").attr("bgimg");
					var template=$("#image_name").attr("img_template");
					var desc=$("#input_image_description").val();
					var ltsp_fatclient=$("#fat_client_for_image_select").val();
					var ldm_session=$("#session_for_image_select").val();
					var ldm_language=$("#default_language_for_ldm").val();
					var fat_ram_threshold=$("#ram_for_image_select").val();
					var lmd_extra_params=$("#extra_input").val();
					var use_local_apps=$("#use_local_apps").bootstrapSwitch('state');
					var local_apps_text=$("#local_apps").val();

					var data='{"desc": "'+desc+'",\n';
					data=data+'"id": "'+id+'",\n';
					data=data+'"template": "'+template+'",\n';
					data=data+'"name": "'+name+'",\n';
					data=data+'"img": "'+imgbg+'",\n';
					data=data+'"ltsp_fatclient": "'+ltsp_fatclient+'",\n';
					data=data+'"ldm_session": "'+ldm_session+'",\n';
					data=data+'"ldm_language": "'+ldm_language+'",\n';
					data=data+'"fat_ram_threshold": "'+fat_ram_threshold+'",\n';
					data=data+'"use_local_apps": "'+use_local_apps+'",\n';
					data=data+'"local_apps_text": "'+local_apps_text+'",\n';
					data=data+'"lmd_extra_params": "'+lmd_extra_params.replace(/"/g, '\\\"').replace(/\n/g, '<br/>')+'"\n}';

					$.xmlrpc({
						url: 'https://'+sessionStorage.server+':9779',
						methodName: 'setImage',
						params: [[sessionStorage.username, sessionStorage.password], "LmdImageManager", id, data],
						success: function(response,status,jqXHR){
							i18n.gettext("dialog.saved");
							self.showMe();
							title="LMD";
							content=i18n.gettext("imagemanager.image.info.saved");
							CustomNofity(title, content);
							$("#dialog-edit-boot-options").empty();
							$("#dialog-edit-boot-options").dialog( "close" );

						},
						error: function(jqXHR, status, error) {
							alert("Status: "+status+"\nError: N4D server is down "+error);						}
					})
				}
			},
			{
				text: i18n.gettext("dialog.cancel"),
				click: function() {
					$( this ).empty();
					$( this ).dialog( "close" );
					self.showMe();
				}
			}
		]
		});



		$("#dialog-for-log").dialog({
			autoOpen: false,
			height: 550,
			width: 700,
			modal: true,
			buttons: [
				{
					text:i18n.gettext("dialog.close"),
					click: function() {
						$.xmlrpc({
								url: 'https://'+sessionStorage.server+':9779',
								methodName: 'remove_listener',
								params: ["", "LmdServer","", self.server.address().port.toString(), null],
								success: function(response,status,jqXHR){
								},
								error: function(jqXHR, status, error) {
									response=i18n.gettext("imagemanager.errorunknown");
									//$("#output").append("<div style='color:#ff0000' class='tty'><b>Error! Status:"+status+" Response: "+response+" <div></b>");
									$("#output_log").append("<div style='color:#ff0000' class='tty'><b>Error! Status:"+status+" Response: "+response+" <div></b>");
									server.close();
									//alert("Status: "+status+"\nError: "+error);
								}
						})


						self.server.close();
						delete self.server;
						$( this ).empty();
						$( this ).dialog( "close" );
						self.showMe();
						//$("#tab_images").show();
					}
				},
				{
					text: i18n.gettext("dialog.cancel"),
					click: function() {
						$.xmlrpc({
									url: 'https://'+sessionStorage.server+':9779',
									methodName: 'cancel_job',
									params: [[sessionStorage.username, sessionStorage.password], "LmdServer","", self.server.address().port.toString(), null],
									success: function(response,status,jqXHR){
									},
									error: function(jqXHR, status, error) {
										response=i18n.gettext("imagemanager.errorunknown");
										//$("#output").append("<div style='color:#ff0000' class='tty'><b>Error! Status:"+status+" Response: "+response+" <div></b>");
										$("#output_log").append("<div style='color:#ff0000' class='tty'><b>Error! Status:"+status+" Response: "+response+" <div></b>");
										server.close();
										//alert("Status: "+status+"\nError: "+error);
									}
						})

						self.server.close();
						delete self.server;
						$( this ).empty();
						$( this ).dialog( "close" );
						//$("#tab_images").showMe();
						self.showMe();
					}
				}
			]
		});



	}

	this.showBootLabel = function showBootLabel(){
		if (self.default_boot_image === self.HDBOOT ){
			$("#bootdefaultlabel").html(i18n.gettext("imagemanager.boot.from.hd"));
			$("#bootdefaultlabel").css("visibility","visible");
		}
		else{
			$("#bootdefaultlabel").html("");
			$("#bootdefaultlabel").css("visibility","hidden");
		}

	}

	this.showMe=function showMe(){

		self.SetMinimalInstalled();

		//this.ImageMinimalInstalled=true;

		$("#tab_images").empty();

		self.CheckUpdateClients();

		self.showImages();

		// Add new buttons (with status)
		self.DisplayTopImageButtons();

	}

	this.CheckUpdateImages = function CheckUpdateImages(){
		$.xmlrpc({
			url: 'https://'+sessionStorage.server+':9779',
			methodName: 'check_update_images',
			params: ['', "LmdServer"],
			success: function(response,status,jqXHR){
				var result =response[0];
				if (result[0]){
					result[1].forEach(function(notification){
						lmdNotifier.addNotification('warning', '_updateimage.title', '_updateimage.description+ ' + notification);
					});
				}
			},
			error: function(jqXHR, status, error) {
				alert("Status: "+status+"\nError: N4D server is down "+error);
			}
		});
	}

	this.prepare_dialog_for_migration=function prepare_dialog_for_migration(){
		var dlg_migrate=$(document.createElement("div")).attr("id", "dialog-migrate-images");
		$("body").append(dlg_migrate);
		var text_intro=$(document.createElement("div")).html(i18n.gettext("imagemanager.found.lliurex13.description"));
		$(dlg_migrate).append(text_intro);
		var image_list = $(document.createElement("div")).attr("id","image_list").addClass("table_form_export");

		var container_div = $(document.createElement("div")).attr('id',image_name).addClass("row_form_export");

		var image_label = $(document.createElement("span")).html("&nbsp;").addClass("label_form_export");
		var image_radio_update = $(document.createElement("span")).html(i18n.gettext("imagemanager.found.lliurex13.update")).addClass("radio_form_export");
		var image_radio_delete = $(document.createElement("span")).html(i18n.gettext("imagemanager.found.lliurex13.delete")).addClass("radio_form_export");
		var image_radio_keep = $(document.createElement("span")).html(i18n.gettext("imagemanager.found.lliurex13.keep")).addClass("radio_form_export");
		container_div.append(image_label);
		container_div.append(image_radio_update);
		container_div.append(image_radio_delete);
		container_div.append(image_radio_keep);
		image_list.append(container_div);

		for (x in self.ImageListLliureX13) {
			var image_name = self.ImageListLliureX13[x];
			container_div = $(document.createElement("div")).attr('id',image_name).addClass("row_form_export");
			image_label = $(document.createElement("div")).html(image_name).addClass("label_form_export");
			image_radio_update = $(document.createElement("input")).attr("type","radio").attr("name",image_name).attr("value","update").addClass("radio_form_export").addClass("radio_bueno");
			image_radio_delete = $(document.createElement("input")).attr("type","radio").attr("name",image_name).attr("value","delete").addClass("radio_form_export").addClass("radio_bueno");
			image_radio_keep = $(document.createElement("input")).attr("type","radio").attr("name",image_name).attr("value","keep").addClass("radio_form_export").addClass("radio_bueno");
			container_div.append(image_label);
			container_div.append(image_radio_update);
			container_div.append(image_radio_delete);
			container_div.append(image_radio_keep);
			image_list.append(container_div);
		}

		$(dlg_migrate).append(image_list);

		$(dlg_migrate).attr("title", i18n.gettext("imagemanager.found.lliurex13.tittle"));

		// Prepare Dialog

		$(dlg_migrate).dialog({
		autoOpen: false,
		height: 500,
		width: 600,
		modal: true,
		buttons: [{
			text:i18n.gettext("dialog.apply"),
			click: function() {
				//var radio_items= $("#image_list input[type='radio']:checked");
				var radio_items= $(".radio_bueno:checked");
				var list_to_delete=new Array();
				var list_to_update=new Array();

				for (x=0; x<radio_items.length;x++) {
					var item=$(radio_items[x]).attr("name");
					var action=$(radio_items[x]).val();
					if (action==="update") {
						list_to_update.push(item);
					}

					if (action==="delete") {
						list_to_delete.push(item);
					}
				}

				if (list_to_delete.length>0) {
					$.xmlrpc({
						url: 'https://'+sessionStorage.server+':9779',
						methodName: 'delete_images',
						params: [[sessionStorage.username, sessionStorage.password], "LmdServer", list_to_delete],
						success: function(response,status,jqXHR){
							st=response[0]['status'];
							if (st==true) {
								title="LMD";
								content=i18n.gettext("imagemanager.images.deleted");
								clearInterval(myTimer);
								CustomNofity(title, content);
								$('#tab_bootmanager').attr('src',function(i,val){return val;});

							} else alert("Exception in Export: "+msg);
							self.showMe();

						},
						error: function(jqXHR, status, error) {
							response="Unknown error. Server disconnected?"
							//$("#output").append("<div style='color:#ff0000' class='tty'><b>Error! Status:"+status+" Response: "+response+" <div></b>");
							$("#output_log").append("<div style='color:#ff0000' class='tty'><b>Error! Status:"+status+" Response: "+response+" <div></b>");
							server.close();
							//alert("Status: "+status+"\nError: "+error);
						}
					})

				}

				if (list_to_update.length>0) {
					// Preparing log dialog
					server=self.PrepareLogDialog();
					var myTimer;

					server.bind('', '', function(){
					try{
						port=server.address().port;
						addr=server.address().address;
						$("#output_log").append("<div class='tty'><b>Local socket:"+addr+":"+port+"</b></div>");
						$("#output_log").on('appendedToLog',function(e, msg){
							/*clearInterval(myTimer);
							myTimer=setInterval(function(){
								var content=$("#output_log div.tty:last span.progress").html();
								$("#output_log div.tty:last span.progress").html(content+".");// append("<span class=tty'>.&nbsp;.&nbsp;</span>");
							},1000)*/
						})

						$.xmlrpc({
							url: 'https://'+sessionStorage.server+':9779',
							methodName: 'update_images',
							params: [[sessionStorage.username, sessionStorage.password], "LmdServer","", port,  list_to_update, sessionStorage.server],
							success: function(response,status,jqXHR){
								st=response[0]['status'];
								if (st==true) {
									title="LMD";
									content=i18n.gettext("imagemanager.images.exported");
									clearInterval(myTimer);
									CustomNofity(title, content);
									$('#tab_bootmanager').attr('src',function(i,val){return val;});

								} else alert("Export returns: "+response[0]['msg']);
								self.showMe();

							},
							error: function(jqXHR, status, error) {
								response="Unknown error. Server disconnected?"
								//$("#output").append("<div style='color:#ff0000' class='tty'><b>Error! Status:"+status+" Response: "+response+" <div></b>");
								$("#output_log").append("<div style='color:#ff0000' class='tty'><b>Error! Status:"+status+" Response: "+response+" <div></b>");
								server.close();
								//alert("Status: "+status+"\nError: "+error);
							}
						})
					}
					catch (error){
						alert(error);
					}
				});


				}




				$( this ).dialog( "close" );
				}
			},
			{
				text:i18n.gettext("dialog.cancel"),
				click: function() {
					$( this ).dialog( "close" );
					self.showMe();
				}
			}

		]
		});
		$(dlg_migrate).unbind('dialogclose');
		$(dlg_migrate).bind('dialogclose', function(event) {
			$(dlg_migrate).remove();
		});


	$(dlg_migrate).dialog("open");

	}

	this.CheckUpdateClients=function CheckUpdateClients(){

		$.xmlrpc({
			url: 'https://'+sessionStorage.server+':9779',
			methodName: 'get_versions_13',
			params: ['', "LmdServer"],
			success: function(response,status,jqXHR){
				self.ImageListLliureX13=response[0];
				if (self.ImageListLliureX13.length>0) {
					var div_imgs_13=$(document.createElement("div")).addClass("div_imgs_13").html(i18n.gettext("imagemanager.found.lliurex13"));
					// Remove first
					$(".div_imgs_13").remove();
					// And add div to view
					$("#tab_images").prepend(div_imgs_13);
					$(div_imgs_13).bind("click", self.prepare_dialog_for_migration);

				}
			},
			error: function(jqXHR, status, error) {
				alert("Status: "+status+"\nError: N4D server is down "+error);
				self.ImageMinimalInstalled=false;
			}
		})

	}

	this.SetMinimalInstalled=function SetMinimalInstalled(){
		// If minimal image is installed,it will set
		// class variable ImageMinimalInstalled to true or else


		$.xmlrpc({
			url: 'https://'+sessionStorage.server+':9779',
			methodName: 'chek_minimal_client',
			params: ['', "LmdServer"],
			success: function(response,status,jqXHR){
				st=response[0]['status'];
				self.ImageMinimalInstalled=st;
			},
			error: function(jqXHR, status, error) {
				alert("Status: "+status+"\nError: N4D server is down "+error);
				self.ImageMinimalInstalled=false;
			}
		})

	}

}
