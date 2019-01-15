// var requiredServerVersion="1.5.2"; NOT USED FROM VERSION 2

function loginManager(){
    this.BindLoginEventHandlers = function BindLoginEventHandlers(){
		// Click on Login Button
		
		$("#LoginButton").bind('click', function( event ){
			// Even managing click on login button
			// gets username, password and server, checks it
			// and stores in session.
			
			username=$("#input_username").val();
			password=$("#input_password").val();
			server=$("#input_server").val();
			
			sessionStorage.username = username;
			sessionStorage.password = password;
			sessionStorage.server = server;
			
			// Going to main window
			login();
		});
	}	
}


function checkServerVersion() {
	$.xmlrpc({
		url: 'https://'+sessionStorage.server+':9779',
		methodName: 'LmdServerVersion',
		params: ['', "LmdServer"],
		success: function(response,status,jqXHR){
			//$("body").removeClass("CursorWaiting");
			var serverversion=response[0];
			if(serverversion=="FUNCTION NOT SUPPORTED"){
				$("body").removeClass("CursorWaiting");
				$("#msg_err").html(i18n.gettext("login.n4d.error",[sessionStorage.server]));
				} else {
					// Check Version now!
					$.xmlrpc({
						url: 'https://127.0.0.1:9779',
						methodName: 'compareVersions',
						params: ['', "LmdManagerClass", serverversion],
						success: function(response,status,jqXHR){
							$("body").removeClass("CursorWaiting");
							
							if(response[0]==="false\n")
								// All ok, let's go to the app
								window.location="main.html";
							else
							{
								/* Uncomment to Hack ignore version check 
								 
								window.location="main.html";
								 */
								
								// /* Uncomment to not hack version check
								requiredServerVersion=response[0];
							    $("#msg_err").html(i18n.gettext("login.n4d.version",[sessionStorage.server, requiredServerVersion]));
							    //  End remove hack*/
							}
							
							/*if ((groups.indexOf('adm')!=-1)||(groups.indexOf('admins')!=-1)||(groups.indexOf('teachers')!=-1)) {
								// Check if it is a LMD Server
								
								//window.location="main.html";
							} else{
								$("#input_password").addClass("wrong_pass");
								$("#input_username").addClass("wrong_pass");
								//alert("Username or password error!");
							}*/
							
						},
						error: function(jqXHR, status, error) {
							alert("Status: "+status+"\nError: N4d server is down"+error);
						}						
					
				})
			}
			
			/*if ((groups.indexOf('adm')!=-1)||(groups.indexOf('admins')!=-1)||(groups.indexOf('teachers')!=-1)) {
				// Check if it is a LMD Server
				
				//window.location="main.html";
			} else{
				$("#input_password").addClass("wrong_pass");
				$("#input_username").addClass("wrong_pass");
				//alert("Username or password error!");
			}*/
			
		},
		error: function(jqXHR, status, error) {
			alert("Status: "+status+"\nError: N4d server is down"+error);
		}
	})
}

function login() {
	
	$("body").addClass("CursorWaiting");
	
	$.xmlrpc({
			url: 'https://'+sessionStorage.server+':9779',
			methodName: 'validate_user',
			params: [sessionStorage.username , sessionStorage.password],
			success: function(response,status,jqXHR){
				//$("body").removeClass("CursorWaiting");
				groups=response[0][1];				
				//if ((groups.indexOf('adm')!=-1)||(groups.indexOf('admins')!=-1)||(groups.indexOf('teachers')!=-1)) {
				if ((groups.indexOf('adm')!=-1)||(groups.indexOf('admins')!=-1)) {
					// Check if it is a LMD Server
					checkServerVersion();
					//window.location="main.html";
				} else{
					$("#input_password").addClass("wrong_pass");
					$("#input_username").addClass("wrong_pass");
					//alert("Username or password error!");
				}
			},
			error: function(jqXHR, status, error) {
				alert("Status: "+status+"\nError: N4d server is down"+error);
			}
		})
	
	
}

$(document).ready(function() {
	var lm = new loginManager();
	var fs = require('fs');
	var path = require('path');
	
	lm.BindLoginEventHandlers();
	
	// Setting content and aspect of GUI elements
	var home = process.env.HOME;
	$("#LoginButton").append(i18n.gettext("login.login"));
	$("button").button();
	if(fs.existsSync(path.join(home,".lmd-manager.config"))) {
		var output = fs.readFileSync(path.join(home,".lmd-manager.config"));
		var content = JSON.parse(output);
		$("#input_username").val(content['user']);
		$("#input_password").val(content['pass']);
		$("#input_server").val(content['server']);
		$("#input_password").focus();	
		}
	else{
		
		$("#input_username").val(process.env.USER);
		$("#input_password").focus();
	}
	 $("body").bind('keydown',function (e) {
		
		if (e.which==13) {
			e.preventDefault();
			username=$("#input_username").val();
			password=$("#input_password").val();
			server=$("#input_server").val();
			sessionStorage.username = username;
			sessionStorage.password = password;
			sessionStorage.server = server;
			
			//alert(username+" "+password);
			login();
		}
        
    });


	
	
})

