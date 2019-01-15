
/* Main Template Manager Object  */

function BootManager(){

	var self = this;
	this.netinstall=undefined;
	this.unattended_netinstall=false;
	this.lts_conf=undefined;
	this.count_func=0;
	this.nbd_swap_size=128;
	this.basic_options=true; // if they are shown or not
	this.extra_options=true; // if they are shown or not
	this.netinstall_section=true;  // if they are shown or not
	this.menu_timeout=50;
	this.shutdown_time=true; // Time to shutdown clients


	/* CreateFormInput auxiliar functions */
	this.createSectionName=function createSectionName(text){
		var eye=$(document.createElement('i')).addClass('icon-slideronefull');
		var label = $(document.createElement('div')).addClass('SectionName').html("  "+text);
		$(label).prepend(eye);
		return label;
	}

	this.createUnattendedNetinstall=function createUnattendedNetinstall(value){
		//var div=$(document.createElement('div')).addClass('FormItem').attr("id","unattended_div").attr("style", "float: left; clear:both; display: block; width: auto;");
		var div=$(document.createElement('div')).addClass('FormItem').attr("id","unattended_div");
		var div_input=$(document.createElement('input')).attr("type","checkbox").attr("id","unattended_install");
		if (value) $(div_input).attr("checked", "checked");
		var div_label=$(document.createElement('label')).addClass("FormElement").attr("for", "unattended_install").html(i18n.gettext("bootmanager.enableunetinst"));

		// Div USERNAME
		var div_username=$(document.createElement('div')).addClass('FormItem').addClass("campo");
		var label_user=$(document.createElement('div')).addClass('FormElement').html(i18n.gettext("bootmanager.username"));
		var content_user=$(document.createElement('input')).addClass('FormLabel').attr("type", "text").attr("name","username").attr("value", "");
		div_username.append(label_user);
		div_username.append(content_user);

		// DIV PASSWORD
		var div_password=$(document.createElement('div')).addClass('FormItem').addClass("campo");
		var label_pass=$(document.createElement('div')).addClass('FormElement').html(i18n.gettext("bootmanager.password"));
		var content_pass=$(document.createElement('input')).addClass('FormLabel').attr("type", "password").attr("name","password").attr("value", "");
		div_password.append(label_pass);
		div_password.append(content_pass);

		// DIV ROOT PASSWORD
		var div_rootpassword=$(document.createElement('div')).addClass('FormItem').addClass("campo");
		var label_root_pass=$(document.createElement('div')).addClass('FormElement').html(i18n.gettext("bootmanager.rootpassword"));
		var content_root_pass=$(document.createElement('input')).addClass('FormLabel').attr("type", "password").attr("name","rootpassword").attr("value", "");
		div_rootpassword.append(label_root_pass);
		div_rootpassword.append(content_root_pass);

		// Button
		var save_button = $(document.createElement('button')).html(i18n.gettext('bootmanager.savePass')).attr("id","saveUnattendedButton");
		save_button.addClass("SaveConfigButton");

		var user_config = $(document.createElement('div')).addClass('FormItem').addClass("campo_coloreados");


		user_config.append(div_username);
		user_config.append(div_password);
		user_config.append(div_rootpassword);
		user_config.append(save_button);





		div.append(div_label);
		div.append(div_input);
		div.append(user_config);
		/*div.append(div_username);
		div.append(div_password);
		div.append(div_rootpassword);
		div.append(save_button);
		*/
		return div;
	}

	this.createTimeoutBoot=function createTimeoutBoot(){

		var row=$(document.createElement('div')).css("clear","both");

		var label=$(document.createElement('div')).addClass('FormElement').html(i18n.gettext("bootmanager.timeoutlabel")).attr("custom_title",i18n.gettext("bootmanager.timeouthelp"));
		var select=$(document.createElement('select')).attr("id","menu_timeout");

		var option1=$(document.createElement('option')).html("0").attr("value", 0);
		if (self.menu_timeout==0) option1.attr("selected", "selected");
		var option2=$(document.createElement('option')).html("5").attr("value", 50);
		if (self.menu_timeout==50) option2.attr("selected", "selected");
		var option3=$(document.createElement('option')).html("10").attr("value", 100);
		if (self.menu_timeout==100) option3.attr("selected", "selected");
		var option4=$(document.createElement('option')).html("30").attr("value", 300);
		if (self.menu_timeout==300) option4.attr("selected", "selected");
		var option5=$(document.createElement('option')).html("60").attr("value", 600);
		if (self.menu_timeout==600) option5.attr("selected", "selected");

		//var ApplyBt=$(document.createElement('button')).html(i18n.gettext("bootmanager.apply")).addClass("Blue template_button ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only");
		var ApplyBt=$(document.createElement('button')).html(i18n.gettext("bootmanager.apply")).addClass("ApplyBt");

		$(select).append(option1);
		$(select).append(option2);
		$(select).append(option3);
		$(select).append(option4);
		$(select).append(option5);

		row.append(label);
		row.append(select);
		row.append(ApplyBt);

		// Bind Click Events
		$(ApplyBt).bind("click", function(){
				//alert($("#menu_timeout").val());
				timeout=$("#menu_timeout").val();
				$.xmlrpc({
					url: 'https://'+sessionStorage.server+':9779',
					methodName: 'setMenuTimeout',
					params: [[sessionStorage.username, sessionStorage.password], "LmdBootManager", timeout],
					success: function(response,status,jqXHR){
						title="LMD";
						content=i18n.gettext("bootmanager.timeout_established");
						CustomNofity(title, content);

					},
					error: function(jqXHR, status, error) {
						alert("Status: "+status+"\nError: N4D server is down "+error);
						//alert("Status: "+status+"\nError: "+error);
					}
				})

			//self.SaveNBDSwapConfig($("#nbd_swap_size").val());
			})

		return row;


	}


	this.SaveNBDSwapConfig = function SaveNBDSwapConfig(nbd_swap_size){
		$.xmlrpc({
			url: 'https://'+sessionStorage.server+':9779',
			methodName: 'SaveNBDSwapSize',
			params: [[sessionStorage.username, sessionStorage.password], "LmdBootManager", nbd_swap_size],
			success: function(response,status,jqXHR){
				var title="LMD";
				var content = "";
				if (response[0]['status']==true) content=i18n.gettext("bootmanager.successconfignbd");
				else content=i18n.gettext("bootmanager.exceptionconfignbd");

				CustomNofity(title, content);

			},
			error: function(jqXHR, status, error) {
				alert("Status: "+status+"\nError: N4D server is down "+error);
			}
		})


	}
	/* END CreateFormInput auxiliar functions */

	this.createFormInput=function createFormInput(parameter, value){
		var container_div=$(document.createElement('div')).addClass('FormItem');

		info=LtsConfInfo.getInfo(parameter);

		switch (parameter){
			case "netinstall":
				var div=$(document.createElement('div')).addClass('FormElement').attr("style", "float: left; clear:both; display: block; ");
				var button=$(document.createElement('input')).attr("type","checkbox").attr("id", parameter);
				//Angel
				//DESHABILITAR EL MENU DE LA NETINSTALL
				//button.attr("disabled", "disabled");

				// Create Unattended install checkbox

				var unattended_div=self.createUnattendedNetinstall(value[1]); // value[1] contains netinstall unattended
				if (value[0]) { // value[0] contains netinstall
					button.attr("checked", "checked");
					$(unattended_div).attr("style", "float: left; clear:both; display: block; width: auto;");
				} else $(unattended_div).attr("style", "float: left; clear:both; display: none; width: auto;");

				var label=$(document.createElement('label')).attr("for", parameter).html(i18n.gettext("bootmanager.enablenetinstall"));
				div.append(label);
				div.append(button);

				// MENU DE NETINSTALL
				container_div.append(div);
				// MENU DE INSTALACION DESATENDIDA
				container_div.append(unattended_div);

				break;

			case "NBD_SWAP":
				var top_file=$(document.createElement('div'));
				var bottom_file=$(document.createElement('div')).addClass('SecondaryOption');

				var label=$(document.createElement('div')).addClass('FormElement FirstLine').html(parameter+"<br\>("+info["description"]+")");
				var content=$(document.createElement('input')).addClass('FormLabel FirstLine').attr("type", "text").attr("name",parameter).attr("value", value);
				var delete_file=$(document.createElement('i')).addClass('icon-remove delete_row_param').attr("target","file_"+parameter);
				top_file.append(label);
				top_file.append(content);
				top_file.append(delete_file);

				// Extra opts
				var label2=$(document.createElement('div')).addClass('FormElement').html(i18n.gettext("bootmanager.swapsize"));

				var select=$(document.createElement('select')).attr("id","nbd_swap_size");

				var option1=$(document.createElement('option')).html("128").attr("value", 128);
				if (self.nbd_swap_size==128) option1.attr("selected", "selected");
				var option2=$(document.createElement('option')).html("256").attr("value", 256);
				if (self.nbd_swap_size==256) option2.attr("selected", "selected");
				var option3=$(document.createElement('option')).html("512").attr("value", 512);
				if (self.nbd_swap_size==512) option3.attr("selected", "selected");
				var option4=$(document.createElement('option')).html("1024").attr("value", 1024);
				if (self.nbd_swap_size==1024) option4.attr("selected", "selected");

				//var ApplyBt=$(document.createElement('button')).html(i18n.gettext("bootmanager.apply")).addClass("Blue template_button ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only");
				var ApplyBt=$(document.createElement('button')).html(i18n.gettext("bootmanager.apply")).addClass("ApplyBt");


				$(select).append(option1);
				$(select).append(option2);
				$(select).append(option3);
				$(select).append(option4);

				bottom_file.append(label2);
				bottom_file.append(select);
				bottom_file.append(ApplyBt);

				container_div.attr("id", "file_"+parameter);
				container_div.append(top_file);
				container_div.append(bottom_file);

				// Bind Click Events
				$(ApplyBt).bind("click", function(){
					self.SaveNBDSwapConfig($("#nbd_swap_size").val());
					})

				break;


			default:
				//var label=$(document.createElement('div')).addClass('FormElement FirstLine').html(parameter);

				LtsConfInfo.parseParameter(parameter, value, info["description"], info["type"], container_div);
		}

		// Put on properly section

		if (info["class"]==="basic") {
			$(container_div).addClass("boot_basic");
		} else if (info["class"]==="netinstall") {
			$(container_div).addClass("netinstall");
		} else $(container_div).addClass("boot_extra");

		return container_div;


	}

	this.saveLtsConf=function saveLtsConf(config){

		global_config=JSON.parse(self.lts_conf);
		delete (global_config['Default']);

		aux=JSON.stringify(global_config);
		// compare if there are more than one item...
		if (aux=="{}") {
			aux=aux.substring(1, aux.length-1);
			new_config='{"Default":'+JSON.stringify(config)+'}';
		}
		else {
			aux=aux.substring(1, aux.length-1);
			new_config='{"Default":'+JSON.stringify(config)+','+aux+'}';
		}


		// set global config
		$.xmlrpc({
			url: 'https://'+sessionStorage.server+':9779',
			methodName: 'setLtsConf',
			params: [[sessionStorage.username, sessionStorage.password], "LmdBootManager", new_config],
			success: function(response,status,jqXHR){
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

	this.setNetinstall=function setNetinstall(component, msgtrue, msgfalse){
			checked=$("#netinstall").prop('checked');
			checked_unattended=$("#unattended_install").prop('checked');
			// Set visible or not unattended install
			if (checked) $("#unattended_div").fadeIn();
			else $("#unattended_div").fadeOut();

			$.xmlrpc({
					url: 'https://'+sessionStorage.server+':9779',
					methodName: 'setNetinstall',
					params: [[sessionStorage.username, sessionStorage.password], "LmdBootManager", String(checked), String(checked_unattended)],
					success: function(response,status,jqXHR){
						st=response[0]['status'];
						msg=response[0]['msg'];
						if (st=="true") {
							title="LMD";
							if ($(component).prop('checked')) content=msgtrue;
							  else  content=msgfalse;
						}else {
							title="LMD Exception";
							content=i18n.gettext("bootmanager.exceptionsetnetinstall",msg);
						}

						if (checked_unattended) $(".campo_coloreados").fadeIn();
						else $(".campo_coloreados").fadeOut();
						CustomNofity(title, content);
						/*self.showMe();*/


					},
					error: function(jqXHR, status, error) {
						alert("Status: "+status+"\nError: N4D server is down "+error);
					}
				})

	}

	this.bind_ui=function bind_ui(){
		// Setting dialogs names
		$("#dialog-add-parameter").attr("title", i18n.gettext("bootmanager.newparameter"));

		// Setting Events
		$("#unattended_install").unbind("click");
		$("#unattended_install").bind("click", function(){
			 var msgtrue=i18n.gettext("bootmanager.availableunattended");
			 var msgfalse=i18n.gettext("bootmanager.disableunattended");
		     self.setNetinstall('#unattended_install',msgtrue, msgfalse);
		});

		$("#netinstall").unbind("click");
		$("#netinstall").bind("click", function(){
			 var msgtrue=i18n.gettext("bootmanager.availablenetinstall");
			 var msgfalse=i18n.gettext("bootmanager.disablenetinstall");
			self.setNetinstall("#netinstall",msgtrue, msgfalse);
		});


		$("#saveUnattendedButton").unbind("click");
		$("#saveUnattendedButton").bind("click", function(){
			var username=$('input[name=username]').val();
			var password=$('input[name=password]').val();
			var rootpassword=$('input[name=rootpassword]').val();
			var unattended=$('#unattended_install').prop('checked');

			if (username.length===0) myalert(i18n.gettext("ltsparameters.netinstall"), i18n.gettext("ltsparameters.namelengtherror"), "warning");
			else if (password.length===0)  myalert(i18n.gettext("ltsparameters.netinstall"),i18n.gettext("ltsparameters.userpasslengtherror"), "warning");
			else if (rootpassword.length===0)  myalert(i18n.gettext("ltsparameters.netinstall"),i18n.gettext("ltsparameters.rootpasslengtherror"), "warning");
		    else {

				$.xmlrpc({
					url: 'https://'+sessionStorage.server+':9779',
					methodName: 'setNetinstallUnattended',
					params: [[sessionStorage.username, sessionStorage.password], "LmdBootManager", unattended, username, password,rootpassword],
					success: function(response,status,jqXHR){
						var title = "LDM";
						var content = i18n.gettext("bootmanager.save.password");
						CustomNofity(title, content);
					},
					error: function(jqXHR, status, error) {
						alert("Status: "+status+"\nError: N4D server is down "+error);
					}
				})
				}
		});

		$("#saveButton").unbind("click");
		$("#saveButton").bind("click", function(event){
			event.preventDefault();
			basic_elements=$("#div_for_lts div.FormItem");
			extra_elements=$("#div_for_extra_lts div.FormItem");


			var elements=$.merge(basic_elements, extra_elements);

			var new_default_config={"__name__": "Default"}

			for (i=0; i<elements.length;i++) {
				complete_item=($(elements[i]).find("div.FirstLine").html());
				item=complete_item.split("<br\>")[0];
				value=($(elements[i]).find("input.FirstLine").val());
				type=($(elements[i]).find("input.FirstLine").attr('type'));
				if (type === "checkbox" ){
					checked=($(elements[i]).find("input.FirstLine").prop('checked'));
					if (typeof(checked)!="undefined") {
						if (checked) {
							//alert(checked);
							value=true;
							}
						else value=false;
						}
				}
				var newelement='{"'+item+'":"'+value+'"}';
				$.extend(new_default_config, JSON.parse(newelement));


				/*// check item type
				if (value.toLowerCase()=="true"||value.toLowerCase()=="false") item_class="bool";
				else if (!isNaN(parseInt(value))) item_class="int";
				else item_class="str";

				alert(item+"="+value+" is "+item_class);*/
			}

			// Adding shutdown time
			var disabled=$("#shutdown_time").attr("disabled");
			var shutdown_time=($("#shutdown_time").val());

			if (!( disabled || shutdown_time==="" )){
					var newelement='{"SHUTDOWN_TIME":"'+shutdown_time+':00"}';
					$.extend(new_default_config, JSON.parse(newelement));
			}



			// And finally save the new config
			//console.log(new_default_config);
			self.saveLtsConf(new_default_config);

			})

		$("#new_param_bt").unbind("click");
		$("#new_param_bt").bind("click", function(){
			label_name=$(document.createElement('div')).addClass("FormElement").html(i18n.gettext("bootmanager.ltsparamid"));
			input_name=$(document.createElement('input')).addClass("FormElement").attr("type", "text").attr("id", "param_id");
			label_value=$(document.createElement('div')).addClass("FormElement").html(i18n.gettext("bootmanager.ltsparamval"));
			input_value=$(document.createElement('input')).addClass("FormElement").attr("type", "text").attr("id", "param_val");

			$("#dialog-add-parameter").empty();
			$("#dialog-add-parameter").append(input_name);
			$("#dialog-add-parameter").append(label_name);
			$("#dialog-add-parameter").append(input_value);
			$("#dialog-add-parameter").append(label_value);
			$("#dialog-add-parameter").dialog("open");


		})
		$(".delete_row_param").unbind("click");
		$(".delete_row_param").bind("click", function(event){
			target=$(event.target).attr("target");
			$("#"+target).fadeOut(400, function(){
					$("#"+target).remove();
				});
		})

		$(".delete_row_param").unbind("mouseover");
		$(".delete_row_param").bind("mouseover", function(event){
			target=$(event.target).attr("target");
			$("#"+target).css("background", "#fff0aa");
		})

		$(".delete_row_param").unbind("mouseout");
		$(".delete_row_param").bind("mouseout", function(event){
			target=$(event.target).attr("target");
			$("#"+target).css("background", "#ffffff");
		})

		// Expand or contract Boot Menu
		$("#boot_menu_section").unbind("click");
		$("#boot_menu_section").bind("click",function(){
			if (self.basic_options) {
				//var eye=$(document.createElement('i')).addClass('icon-eye-close');
				//$("#boot_menu_section i").removeClass('icon-circleright').addClass('icon-circledown');
				//$(".boot_basic").fadeOut().slideUp();
				$(".netinstall").animate({ height: 'toggle', opacity: 'toggle' }, 'fast');
				self.netinstall_section=false;
			}
			else {
				//$("#boot_menu_section i").removeClass('icon-circledown').addClass('icon-circleright');
				$(".netinstall").animate({ height: 'toggle', opacity: 'toggle' }, 'fast');
				//$(".boot_basic").fadeIn().slideDown();
				self.netinstall_section=true;
			}

		});


		// Expand or contract Basic Options
		$("#basic_section").unbind("click");
		$("#basic_section").bind("click",function(){
			if (self.basic_options) {
				//$(".boot_basic").fadeOut().slideUp();
				$(".boot_basic").animate({ height: 'toggle', opacity: 'toggle' }, 'fast');
				self.basic_options=false;
			}
			else {
				$(".boot_basic").animate({ height: 'toggle', opacity: 'toggle' }, 'fast');
				//$(".boot_basic").fadeIn().slideDown();
				self.basic_options=true;
			}

		});

		// Expand or contract Extra Options
		$("#extra_section").unbind("click");
		$("#extra_section").bind("click",function(){
			if (self.extra_options) {
				//$(".boot_basic").fadeOut().slideUp();
				$(".boot_extra").animate({ height: 'toggle', opacity: 'toggle' }, 'fast');
				self.extra_options=false;
			}
			else {

				$(".boot_extra").animate({ height: 'toggle', opacity: 'toggle' }, 'fast');
				//$(".boot_basic").fadeIn().slideDown();
				self.extra_options=true;
			}
		});

		// Preparing Dialogs
		$("#dialog-add-parameter").dialog({
			autoOpen: false,
			height: 275,
			width: 330,
			modal: true,
			buttons: [

				{
					text: i18n.gettext("dialog.add"),
					click: function() {
					// Add new file to Form
					param_name=$("#param_id").val();
					param_val=$("#param_val").val();
					//$("#div_for_lts").append((self.createFormInput(param_name, param_val )));
					new_file=self.createFormInput(param_name, param_val);


					// Adding onclick event to new file
					$(new_file).find(".delete_row_param").bind("click", function(event){
						target=$(event.target).attr("target");
						$("#"+target).fadeOut(400, function(){
							$("#"+target).remove();
						});
					})

					$("#new_param_bt").before(new_file);
					$(new_file).attr("style", "display:none");
					$(new_file).fadeIn();

					$( this ).empty();
					$( this ).dialog( "close" );

					}
				},
				{
					text:i18n.gettext("dialog.cancel"),
					click: function() {
						$( this ).empty();
						$( this ).dialog( "close" );
					}
				}
			]
			});

		}


	this.createAutoshutdownSection=function createAutoshutdownSection(){
		  var self=this;
			var sectiondiv=$(document.createElement("div")).css({"margin-left":"50"});

			var div=$(document.createElement("div")).css({"float":"left", "display":"block"});
			var div_cb=$(document.createElement("div")).addClass("checkbox checkbox-primary");
			var label=$(document.createElement("label"));
			//var text=$(document.createElement("div")).addClass("text").html(.css("display","inline-block");
			var text=$(document.createElement("span")).addClass("text").html(i18n.gettext("Set.shutdown.time.at")).css("margin-left", "50px");
			var label=$(document.createElement("label"));
			var input=$(document.createElement("input")).attr("type", "checkbox").attr("id", "shutdown_checkbox");

			$(label).append(input);
			$(label).append(text);
			$(div_cb).append(label);
			$(div).append(div_cb);

			// Time
			var timediv=$(document.createElement("div")).css({"float":"left",  "display":"block", "width":"200px","margin":"5px 10px 5px 10px"});

			var input_time=$(document.createElement("input")).attr("type", "text").attr("id", "shutdown_time").css({"border":"0px"});
			$(input_time).addClass("form-control floating-label").attr("placeholder", "").css({"width":"100px", "float":"left","display":"block", "vertical-align": "middle", "height":"30px"});
			$(input_time).timepicker();

			$(timediv).append(input_time);

			// Ok Button
			var btsavetimer=$(document.createElement("button"));


			$(btsavetimer).addClass("ui-button-primary ui-button ui-widget ui-state-default ui-corner-all").html(i18n.gettext("Set.Timeout.Ok")).attr("id", "saveTimeoutButton");

			//$(btsavetimer).addClass("btn btn-default").html(i18n.gettext("Set.Timeout.Ok")).attr("id", "saveTimeoutButton");


			// Construct all div
			$(sectiondiv).append(div);
			$(sectiondiv).append(timediv);
			$(sectiondiv).append(btsavetimer);

			/*events*/
			input.bind("click", function(){
				target=$(event.target);
				checked=$(target).attr("checked");
				console.log("Disabled is "+$("#shutdown_time").attr("disabled"));
				if (checked=="checked"){
					$(target).removeAttr("checked");
					$("#shutdown_time").attr("disabled", "disabled");
					console.log("Disabled now is "+$("#shutdown_time").attr("disabled"));
				}
				else{
					$(target).attr("checked", "checked");
					$("#shutdown_time").removeAttr("disabled");
				}
			})

			$(btsavetimer).unbind("click");

			$(btsavetimer).bind("click", function(){
				$("#saveButton").click();
				/*var disabled=$("#shutdown_time").attr("disabled");
				var shutdown_time=($("#shutdown_time").val());

				if ( disabled ) alert("removing timer");
				else if (shutdown_time==="" ) alert("nothing to do");
				else alert("setting to time: "+$("#shutdown_time").val());*/
			});


			$(sectiondiv).css("display", "none");
			return sectiondiv;
		}


	this.drawForm=function drawForm(){
		// Wait until both xmlrpc calls has been finished
		self.count_func++;
		if (self.count_func==1 || self.count_func==2 || self.count_func==3 ) return false;

		// Clean GUIshowMe
		$("#tab_boot").empty;

		// Automatic shutdown
		$("#tab_boot").append(self.createSectionName(i18n.gettext("bootmanager.headerAutoshutdown")).attr("id", "autoshutdown_section").css("display", "none"));
		$("#tab_boot").append(self.createAutoshutdownSection());


		/* draw netinstall gui */
		$("#tab_boot").append(self.createSectionName(i18n.gettext("bootmanager.headernetinstall")).attr("id", "boot_menu_section"));
		netinstall_opts=new Array();
		netinstall_opts[0]=self.netinstall;
		netinstall_opts[1]=self.unattended_netinstall;

		$("#tab_boot").append((self.createFormInput("netinstall", netinstall_opts )));

		/* draw LTS.conf GUI: Basic and Extra options  */
		$("#tab_boot").append(self.createSectionName(i18n.gettext("bootmanager.headerbootoptions")).attr("id", "basic_section"));
		$("#tab_boot").append(self.createSectionName(i18n.gettext("bootmanager.headeradvanced")).attr("id", "extra_section"));

		div_for_lts=$(document.createElement('div')).attr("id", "div_for_lts");

		div_for_lts.append(this.createTimeoutBoot(50));

		div_for_extra_lts=$(document.createElement('div')).attr("id", "div_for_extra_lts");

		json_lts_conf=JSON.parse(self.lts_conf);
		for (section in json_lts_conf){
			if (section.toLowerCase()=="default") {
				for (item in json_lts_conf[section]) {
					if (item.toLocaleLowerCase()!="__name__"){
						//alert(section + " "+item+ " "+json_lts_conf[section][item]);

						// workaround to detect shutdown time

						if (item==="SHUTDOWN_TIME"){
							/*$(("#shutdown_checkbox")[0]).attr("checked", true);
							document.getElementById("shutdown_checkbox").setAttribute("checked", true);*/
							$("#shutdown_checkbox").attr("checked", "checked");
							//alert("1");
							console.log($("#shutdown_checkbox"));
							//$("#shutdown_checkbox").attr("checked", "true");
							console.log($("#shutdown_checkbox"));
							//alert("2");
							time=json_lts_conf[section][item];
							$("#shutdown_time").val(time.substring(0,time.length-3));
							console.log(time.substring(0,time.length-3));
							//console.log(json_lts_conf[section][item]);
						}
						else{
							// Parse item to form
							div_item=self.createFormInput(item, json_lts_conf[section][item]);
							if ($(div_item).hasClass('boot_basic'))
								div_for_lts.append(div_item);
								else
						    	div_for_extra_lts.append(div_item);
							}// END ELSE IF WORKAROUND

					}
				}
			}
		}



		$(div_for_lts).insertAfter($("#basic_section"));
		$(div_for_extra_lts).insertAfter($("#extra_section"));
		//$(tab_boot).append(div_for_lts);
		// Add button-div to include a new parameter

		var bt_div = $(document.createElement('div')).attr("id", "new_param_bt").html(i18n.gettext("bootmanager.addconfigparam"));
		//div_for_lts.append(bt_div);
		$("#div_for_extra_lts").append(bt_div);

		var done_button = $(document.createElement('button')).html(i18n.gettext('bootmanager.saveOptions')).attr("id","saveButton");
		done_button.addClass("SaveConfigButton");
		$(tab_boot).append(done_button);

		// Hide password and username if unattended_netinstall is false
		if (!self.unattended_netinstall) {
				//alert("");
				$(".campo_coloreados").hide();
				}

		self.bind_ui();
		return true;
	}

	this.showMe=function showMe(){

		// get netinstall status...
		$.xmlrpc({
				url: 'https://'+sessionStorage.server+':9779',
				methodName: 'getNetinstall',
				params: ['', "LmdBootManager"],
				success: function(response,status,jqXHR){
					self.netinstall=response[0]['netinstall'];
					self.unattended_netinstall=response[0]['unattended'];

					self.drawForm();
				},
				error: function(jqXHR, status, error) {
					alert("Status: "+status+"\nError: N4D server is down "+error);
				}
			})

		// get global config
		$.xmlrpc({
				url: 'https://'+sessionStorage.server+':9779',
				methodName: 'getLtsConf',
				params: ['', "LmdBootManager"],
				success: function(response,status,jqXHR){
					self.lts_conf=response[0];
					self.drawForm();
				},
				error: function(jqXHR, status, error) {
					alert("Status: "+status+"\nError: N4D server is down "+error);
				}
			})

		// get Menu Timeout
		$.xmlrpc({
				url: 'https://'+sessionStorage.server+':9779',
				methodName: 'getMenuTimeout',
				params: ['', "LmdBootManager"],
				success: function(response,status,jqXHR){
					self.menu_timeout=response[0]["timeout"];
					self.drawForm();
				},
				error: function(jqXHR, status, error) {
					alert("Status: "+status+"\nError: N4D server is down "+error);
				}
			})


		// get NDB_SWAP value
		$.xmlrpc({
				url: 'https://'+sessionStorage.server+':9779',
				methodName: 'ReadNBDSwapSize',
				params: ['', "LmdBootManager"],
				success: function(response,status,jqXHR){
					self.nbd_swap_size=response[0];
					self.drawForm();
				},
				error: function(jqXHR, status, error) {
					alert("Status: "+status+"\nError: N4D server is down "+error);
				}
			})


   }

}
