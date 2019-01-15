
/* Main LliurexBerry Manager Object  */ 

function BerryManager(){
	
	var self = this;
	this.first_device_list=new Array();
	this.second_device_list=new Array();
	this.searchInterval="";
	this.selecteddevice = "";
	this.package_available = false;

	this.setFirstDeviceList=function setFirstDeviceList(data){
		self.first_device_list=data;
	}
	
	this.setSecondDeviceList=function setSecondDeviceList(data){
		self.second_device_list=data;
	}
	
	this.getDeviceList=function getDeviceList(setfunc, callback){
		$.xmlrpc({
				url: 'https://localhost:9779',
				methodName: 'get_devices',
				params: ['', "LliurexBerry"],
				success: function(response,status,jqXHR){
					//alert(response[0]['status']);
					//alert(response[0]['msg'].length);
					
					if ( response[0]['status']===true){
						setfunc(response[0]['msg']);
						callback();
					}
					else alert("Error: "+response[0]['msg']);
					
				},
				error: function(jqXHR, status, error) {
					alert("Status: "+status+"\nError: N4D server is down "+error);
				}
			})
		
	}
	
	this.check_for_data_package = function check_for_data_package(callback_true,callback_false){
		$.xmlrpc({
				url: 'https://localhost:9779',
				methodName: 'check_for_data_package',
				params: ['', "LliurexBerry"],
				success: function(response,status,jqXHR){
					//alert(response[0]['status']);
					//alert(response[0]['msg'].length);
					
					if ( response[0]['status']===true){
						self.package_available=true;
						callback_true();
					}
					else {
						self.package_available=false;
						callback_false();
					}
					
					
				},
				error: function(jqXHR, status, error) {
					alert("Status: "+status+"\nError: N4D "+error);
				}
			})
		return false;
	}
	this.download_package_data=function download_package_data(callback_true,callback_false){
		$.xmlrpc({
				url: 'https://localhost:9779',
				methodName: 'download_package_data',
				params: [[sessionStorage.username, sessionStorage.password], "LliurexBerry"],
				success: function(response,status,jqXHR){
					//alert(response[0]['status']);
					//alert(response[0]['msg'].length);
					
					if ( response[0]['status']===true){
						callback_true();
					}
					else{
						callback_false(response[0]['msg']);
					}
					
				},
				error: function(jqXHR, status, error) {
					alert("Status: "+status+"\nError: N4D server is down "+error);
				}
			})
	}
	
	this.showIntro=function showIntro(){
		text=i18n.gettext("berrymanager.intro1");
		var text1=$(document.createElement("div")).html(text).addClass("BerryParagraph");
		text=i18n.gettext("berrymanager.intro2");
		var text2=$(document.createElement("div")).html(text).addClass("BerryParagraph");
		$("#tab_pi").append(text1);
		$("#tab_pi").append(text2);
	}
	
	this.showStage1=function showStage1(){
		$("#divWizard").empty();
		var title=$(document.createElement("h3")).html(i18n.gettext("berrymanager.stage1.tittle"));
		$("#divWizard").append(title);
		var text=$(document.createElement("div")).html(i18n.gettext("berrymanager.stage1.description")).addClass("BerryParagraph");
		$("#divWizard").append(text);
		var icon=$(document.createElement("i")).addClass("icon-sd");
		var btWizard_1=$(document.createElement("button")).attr("id", "btwiz1");
		btWizard_1.addClass("btWizard green firstbutton").html(i18n.gettext("berrymanager.stage1.button")).prepend(icon);
		$("#divWizard").append(btWizard_1);
	}
	
	
	this.showStage2=function showStage2(){
		$("#divWizard").empty();
		var title=$(document.createElement("h3")).html(i18n.gettext("berrymanager.stage2.tittle"));
		$("#divWizard").append(title);
		var text=$(document.createElement("div")).html(i18n.gettext("berrymanager.stage2.description")).addClass("BerryParagraph");
		$("#divWizard").append(text);
		
		var wait=$(document.createElement("div")).addClass("Waiting").attr("id", "waiting_div");
		$("#divWizard").append(wait);
		
		var CloseBt=$(document.createElement("button")).addClass("red btWizard firstbutton").attr("id", "cancel_button").html(i18n.gettext("berrymanager.cancel"));
		$("#divWizard").append(CloseBt);
		$(CloseBt).bind("click", function(){
			self.showMe();
		});
		
		
		self.searchInterval=setInterval(function(){
			self.getDeviceList(self.setSecondDeviceList, self.check_for_sd_ready);
		}, 3000);
		
		// Wait for SD insertion...
		
	}
	
	this.showStage3=function showStage3(diff){
		$("#divWizard").empty();
		var title=$(document.createElement("h3")).html(i18n.gettext("berrymanager.stage3.tittle"));
		$("#divWizard").append(title);
		var text=$(document.createElement("div")).html(i18n.gettext("berrymanager.stage3.description")).addClass("BerryParagraph");
		$("#divWizard").append(text);
		
		var device_table=$(document.createElement("table"));
		var t_header=$(document.createElement("tr"));
		var thcol1=$(document.createElement("th")).html(i18n.gettext("berrymanager.stage3.tablecol1"));
		var thcol2=$(document.createElement("th")).html(i18n.gettext("berrymanager.stage3.tablecol2"));
		var thcol3=$(document.createElement("th")).html(i18n.gettext("berrymanager.stage3.tablecol3"));
		$(t_header).append(thcol1);
		$(t_header).append(thcol2);
		$(t_header).append(thcol3);
		$(device_table).append(t_header);
				
		for (i in diff) {
			model=diff[i]['model'];
			device=diff[i]['name'];
			size=diff[i]['size'];
			
			var t_row=$(document.createElement("tr")).attr("id", device);
			var trcol1=$(document.createElement("td")).html(device);
			var trcol2=$(document.createElement("td")).html(model);
			var trcol3=$(document.createElement("td")).html(size);
			$(t_row).append(trcol1);
			$(t_row).append(trcol2);
			$(t_row).append(trcol3);
			$(t_row).bind("click",function(){
				$("#"+self.selecteddevice).removeClass("selected");
				self.selecteddevice = $(this).attr("id");
				$("#"+self.selecteddevice).addClass("selected");
				$("#btwiz3").removeClass("btWizardHidden").addClass("btWizard green firstbutton");
				});
			$(device_table).append(t_row);
			
		}
		var table_container = $(document.createElement("div")).attr("id","table_container");
		table_container.append(device_table);
		$("#divWizard").append(table_container);
		
		var btWizard_3=$(document.createElement("button")).attr("id", "btwiz3");
		var icon=$(document.createElement("i")).addClass("icon-sd").attr("style", "font-size:0.7em;");
		btWizard_3.addClass("btWizardHidden").html(i18n.gettext("berrymanager.stage3.media")).prepend(icon);
		$("#divWizard").append(btWizard_3);
		
		var CloseBt=$(document.createElement("button")).addClass("red btWizard lastbutton").attr("id", "cancel_button").html(i18n.gettext("berrymanager.cancel"));

		$("#divWizard").append(CloseBt);
		$(CloseBt).bind("click", function(){
			self.showMe();
		});
		
		
		$(btWizard_3).bind("click", function(){
			var wait=$(document.createElement("div")).addClass("Waiting").attr("id", "waiting_div");
			$("#table_container").append(wait);
			
			$.xmlrpc({
				url: 'https://localhost:9779',
				methodName: 'burn_llxberry',
				params: [[sessionStorage.localusername, sessionStorage.localpassword], "LliurexBerry", self.selecteddevice],
				success: function(response,status,jqXHR){
					if ( response[0]['status']===true){
						myalert(i18n.gettext("berrymanager.finished_burn.tittle","berrymanager.finished_burn"));
						$("#waiting_div").remove();
					} else alert("Error: "+response[0]['msg']);
				},
				error: function(jqXHR, status, error) {
					alert("Status: "+status+"\nError: N4D server is down "+error);
				}
			})
			
			});
		
		
	}
		
	this.check_for_sd_ready=function check_for_sd_ready(){
		// Cal detectar que siguen iguals...
		//alert(typeof(self.second_device_list));
		if ( JSON.stringify(self.second_device_list)!=JSON.stringify(self.first_device_list)) {
			clearInterval(self.searchInterval);
			diff=self.deviceDiff(self.second_device_list,self.first_device_list);
			
			self.showStage3(diff);
			

			//alert(JSON.stringify(diff));
			
		}
	}
	
	this.deviceDiff=function deviceDiv(second, first)	{
		var listaux=new Array();
		var list_dif=new Array();
		for (var item in first){
			listaux.push(JSON.stringify(first[item]));
		}
		
		for (var item in second){
			if (listaux.indexOf(JSON.stringify(second[item])) === -1)
				list_dif.push(second[item]);
		}
		return list_dif;
	}
	
	this.showMe=function showMe(){
		$("#tab_pi").empty();
	
		if (self.package_available){
			self.showIntro();
			
			var div_wizard=$(document.createElement("div")).attr("id", "divWizard");
			$("#tab_pi").append(div_wizard);
			
			
			if ( ! sessionStorage.hasOwnProperty("localusername") || ! sessionStorage.hasOwnProperty("localpassword")){
				self.showLogin();
			}else{
				self.showStage1();
				self.bind_ui();
			}
		}else{
			text=i18n.gettext("berrymanager.checking_package");
			var div_download_package=$(document.createElement("div")).html(text).addClass("BerryParagraph");
			$("#tab_pi").append(div_download_package);
			self.check_for_data_package(self.showMe,self.show_download_package_data);
		}
	}

	this.show_download_package_data = function show_download_data_package(){
		
		$("#tab_pi").empty();
		text=i18n.gettext("berrymanager.download_package");
		var div_download_package=$(document.createElement("div")).html(text).addClass("BerryParagraph");
		
		$("#tab_pi").append(div_download_package);
		
		var div_wizard=$(document.createElement("div")).attr("id", "divWizard");
		$("#tab_pi").append(div_wizard);
		
		
		$("#divWizard").empty();
		var title=$(document.createElement("h3")).html(i18n.gettext("berrymanager.download_package_title"));
		$("#divWizard").append(title);
		var text=$(document.createElement("div")).html(i18n.gettext("berrymanager.download_package_text")).addClass("BerryParagraph");
		$("#divWizard").append(text);
		var btdown=$(document.createElement("button")).attr("id", "btdown");
		btdown.addClass("btWizard green firstbutton").html(i18n.gettext("berrymanager.download_package_button"));
		$("#divWizard").append(btdown);
		self.bind_ui();
		
	}
	
	this.showLogin = function showLogin(){
		$("#divWizard").empty();
		var title=$(document.createElement("h3")).html(i18n.gettext("berrymanager.loginlocal.tittle"));
		$("#divWizard").append(title);

		var list_gui = [];

		list_gui.push($(document.createElement("label")).addClass("logintab").attr("for", "localusername").html(i18n.gettext("login.username")));
		list_gui.push($(document.createElement("input")).attr("id","localusername").attr("type","text").addClass("logintab"));
		
		list_gui.push($(document.createElement("label")).addClass("logintab").attr("for", "localpassword").html(i18n.gettext("login.password")));
		list_gui.push($(document.createElement("input")).attr("id","localpassword").attr("type","password").addClass("logintab"));

		list_gui.push($(document.createElement("button")).addClass("loginBt lmdblue").append("Login").bind('click',self.check_local_user));

		list_gui.forEach(function(element){$("#divWizard").append(element)});
		
	}
	
	this.check_local_user = function check_local_user(){

		$("#tab_pi").addClass("Waiting").addClass("CursorWaiting");
		username = $("#localusername").val();
		password = $("#localpassword").val();
		$.xmlrpc({
				url: 'https://localhost:9779',
				methodName: 'validate_user',
				params: [username, password],
				success: function(response,status,jqXHR){
					groups=response[0][1];
					if ( response[0][0]===true || (groups.indexOf('adm')!=-1)||(groups.indexOf('admins')!=-1)){
						$("#tab_pi").removeClass("Waiting").removeClass("CursorWaiting");
						sessionStorage.localusername = username;
						sessionStorage.localpassword = password;
						self.showStage1();
						self.bind_ui();
					} else {
						$("#tab_pi").removeClass("Waiting").removeClass("CursorWaiting");
						$("#localpassword").css("background-color","rgba(255,0,0,0.5)");
					}
				},
				error: function(jqXHR, status, error) {
					alert("Status: "+status+"\nError: N4D server is down "+error);
				}
			})

	}
	this.fail_download = function fail_download(msg){
			$('#tab_pi').empty();
			//var text='<h2>Error: '+msg+'<br /><br />'+i18n.gettext("berrymanager.loginlocal.tittle")+'</h2>';
			var text='<br /><br /><h2>'+i18n.gettext("berrymanager.msg.error_download")+'</h2>';
			var div_download_package=$(document.createElement("div")).html(text).addClass("BerryParagraph").attr("id", "divWizard");
			$("#tab_pi").append(div_download_package);
			var retry=$("<button id='retry_button'>"+i18n.gettext("berrymanager.retry_button")+"</button>");
			retry.addClass("btWizard green firstbutton");
			$("#tab_pi").append(retry);
			self.bind_ui();
	}
	
	this.bind_ui=function bind_ui(){
		$("#btwiz1").bind("click",function(){
			self.getDeviceList(self.setFirstDeviceList, self.showStage2);
			})
		
		
		$("#btdown").bind("click",function(){
			var icon=$(document.createElement("i")).addClass("download-gif");
			var btdown=$("#btdown");
			
			btdown.parent().append(icon);
			btdown.remove();
			
			self.download_package_data(self.showMe,self.fail_download);
			})
			
		$("#retry_button").bind("click",function(){
			self.showMe();
			})
		
		}
	
		
}
