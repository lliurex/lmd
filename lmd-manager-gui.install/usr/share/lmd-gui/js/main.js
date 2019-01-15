// Global lib for socket management
var sock=new lmd_sockets();



// Capture close event to prevent floating zombies notifications
var gui = require('nw.gui');
var win = gui.Window.get();
win.on('close', function() {
  this.hide(); // Pretend to be closed already
  var child_win = window.LOCAL_NW.desktopNotifications;
  child_win.closeAnyOpenNotificationWindows();
  this.close(true);
});


$(document).ready(function() {

	var listTabs = {};
	LtsConfInfo=new LtsTranslator();
	//LtsTranslator.LoadParameters();
	listTabs['template_manager'] = new TemplateManager();
	listTabs['image_manager'] = new ImageManager();
	listTabs['boot_manager'] = new BootManager();
	listTabs['llx_boot_manager'] = new LlxBootManager(); //////// ////////////
	listTabs['client_manager'] = new ClientManager();
	listTabs['berry_manager'] = new BerryManager();

	// Global Notification System
	lmdNotifier=new LmdNotifier;

  // Global Boot List
  globalBootList=new Array();
  $.xmlrpc({
    url: 'https://'+sessionStorage.server+':9779',
    methodName: 'getBootList',
    params: ["", "LlxBootManager"],
    success: function(response,status,jqXHR){
      console.log(response);
      if (status=="success") {
        for (i=0;i<response[0].length;i++){
          var opt=new Array();
          opt["id"]=response[0][i]["id"];
          opt["label"]=response[0][i]["label"];
          if (opt["id"].substring(0, 10)==="ltsp_label")
              opt["id"]=opt["id"].substring(10, opt["id"].length);
          globalBootList.push(opt);
          }
        }
    },
    error: function(jqXHR, status, error) {
      alert("Status: "+status+"\nError: N4D server is down "+error);
    }
  })

  /*globalBootList[1]="clientPDI";
  globalBootList[2]="Infantil";*/


	for (x in listTabs){
		listTabs[x].bind_ui();
		listTabs[x].showMe();
	}

   	$("#bottom").append(i18n.gettext("info.connectedto",[sessionStorage.server,sessionStorage.username]));

	// var quit_button = $(document.createElement('button')).html(i18n.gettext('info.logout')).attr("id","logout_button");

	var quit_button=$(document.createElement('div')).attr("id","logout_bt");

	var notification_bt_text=$(document.createElement('div')).attr("id","notification_bt_text");
	var notification_bt=$(document.createElement('div')).attr("id","notification_bt");
	notification_bt.append(notification_bt_text);

	$("#bottom").append(quit_button);
	$("#bottom").append(notification_bt);

	$(quit_button).bind("click", function(){
			window.location="login.html";
			if (sessionStorage.hasOwnProperty("localusername")) delete sessionStorage.localusername;
			if (sessionStorage.hasOwnProperty("localpassword")) delete sessionStorage.localpassword;
			});

	$(notification_bt).bind("click", function(){
	    lmdNotifier.show();
	});

	listTabs['image_manager'].CheckUpdateImages();

  if(sessionStorage.current_section!=null){
    current_tab=$('div[target="'+sessionStorage.current_section+'"]');
    if($(current_tab).hasClass("adv")) $("#lmd_tab_changer").click();
    //console.log(current_tab);
    $(current_tab).click();
    //alert(sessionStorage.current_section);
  }

	/*$(quit_button).bind("click", function(){
		lmdNotifier.addNotification("info", "title1", "tralari");
		      });*/

})
