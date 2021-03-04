
function ImageManager(){
    // Class attributes
    this.imageList=[];   // Filenames for client images
    //this.currenttasks=new Array();
    this.imageMinimalInstalled=null;
    this.timer=null;
    this.mirrorReady=false;
    this.mirror32bit=false;
    this.mirror64bit=false;
    this.renderedimages=0;
}

/*ImageManager.prototype.getTaskList=function getTaskList(callback_){
    var self=this;
    
    var credentials="";
    var n4dclass="LmdServer";
    var n4dmethod="getJobList";
    var arglist=[];
  
   Utils.n4d(credentials, n4dclass, n4dmethod, arglist, function(response){
        self.currenttasks = JSON.parse(response);
        //self.synctask--;
        callback_();
        })
}*/


ImageManager.prototype.deleteImage=function deleteImage(targetid){
    var self=this;
    $(".llx-ltsp-image-file[target_id="+targetid+"]").css("background","#ffe0b2");
    Utils.waitwin.ShowModalInfo("Removing image", "Removing image client", WAITWIN_WAITING);
    
    // Perform n4d call to delete image
    var self=this;
    
    var credentials=[sessionStorage.username , sessionStorage.password];
    var n4dclass="LmdImageManager";
    var n4dmethod="deleteImage";
    var arglist=[targetid];
        
     try {
        Utils.n4d(credentials, n4dclass, n4dmethod, arglist, function(response){
            //console.log(response);
            $(".llx-ltsp-image-file[target_id="+targetid+"]").fadeOut(100, function(){
                $(".llx-ltsp-image-file[target_id="+targetid+"]").remove();
            });
            Utils.waitwin.RemoveModalInfo();
            message="Image removed sucessful";
            // set minimal not installed
            self.imageMinimalInstalled=false;
            // remove image from imagelist
            //console.log("REMOVE;;;;;;;;;;;;;;;");
            console.log(self.imageList);
            self.imageList.splice(self.imageList.indexOf(targetid+".json"), 1);
            console.log(self.imageList);
            $("#llx_ltsp_lliurex_minimal_image").show();
            Utils.msg(message, MSG_SUCCESS);
            }, 0);
        }
        catch (error){
            Utils.msg(message+" "+error, MSG_ERROR);
        }
}

/*ImageManager.prototype.checkStatusForImage=function checkStatusForImage(id){
    // Check if any job is running in this id
    
    var self=this;
    var retvalue={"status":"finished", "job_id":"None"};
    for (var i in self.currenttasks) {
        if ((self.currenttasks[i]).target==id) {
            if (self.currenttasks[i].status=="running" || self.currenttasks[i].status=="broken")
                return {"status":self.currenttasks[i].status, "job_id":self.currenttasks[i].job_id};
        }
    }
    return retvalue;
}*/


ImageManager.prototype.editImageWithCheck=function editImageWithCheck(id, editCommand="/usr/sbin/mate-ltsp-desktop.sh", arch="amd64"){
    var self=this;
        
    var credentials="";
    var n4dclass="LmdImageManager";
    var n4dmethod="check_image_editing";
    var arglist=[];

    
    console.log(editCommand);
    console.log(id);
    //alert("pajaritos tralari");

    
    Utils.n4d(credentials, n4dclass, n4dmethod, arglist, function(response){
        console.log(response.status+" "+response.response);
        if ((response.status)&&(response.response)){
            
            var text=self._("lmd.imagemanager.image.edit.is.blocked.confirm");			
			bootbox.confirm(text, function(res){
            if (res) {
                var credentials=[sessionStorage.username , sessionStorage.password];
                var n4dclass="LmdImageManager";
                var n4dmethod="clean_image_editing";
                var arglist=[];
                
                Utils.n4d(credentials, n4dclass, n4dmethod, arglist, function(){
                    self.editImage(id);
                    },0);
                
                
            }else {
                return -1;
                }
            });
	          
            
        } else self.editImage(id, editCommand);
        
        },0);
};
                
                
// ImageManager.prototype.editImage=function editImage(id, editCommand="/usr/sbin/mate-ltsp-desktop.sh", arch="amd64"){
    
//   var self=this;
//   // Stage 1: Prepare Connection
//   var screenWidth=1043;
//   var screenHeight=787;
//   var credentials=[sessionStorage.username , sessionStorage.password];
//   var n4dclass="RemoteWebGui";
//   var n4dmethod="create_connection";
//   //var arglist=[sessionStorage.username,  "-ac -terminate -screen "+screenWidth+"x"+screenHeight+" -dpi 96 "];
//   var arglist=[sessionStorage.username,  "-ac -screen "+screenWidth+"x"+screenHeight+" -dpi 96 "];

//   var port;
//   var display;
  
  
//   Utils.waitwin.ShowModalInfo(self._("ltsp_loading_image"), self._("ltsp_loading_image_description"), WAITWIN_LOADING);
//   Utils.n4d(credentials, n4dclass, n4dmethod, arglist, function(response){
//     // Connection is prepared
//     port=response.msg.port;
//     display=response.msg.display;

//   console.log("::::"+port+" "+display);
    
//     //console.log("Port: "+port+" Display: "+display);
//     Utils.waitwin.SetStatus(self._("ltsp_connection_stablished"), self._("ltsp_connection_stablished_description")+sessionStorage.server+":"+port, WAITWIN_WAITING);
    
//     // Clearing intervar for refresh
//     clearInterval(self.timer);
//     self.timer=null;
    
//     // Stage 2: Launch app into Window (wait 5 seconds)
//     //console.log("launching app");
//     var credentials=[sessionStorage.username , sessionStorage.password];
//     var n4dclass="RemoteWebGui";
//     var n4dmethod="run_into_connection";

//     var arglist=[];
//     //arglist.push("/usr/share/lmd-scripts/awesome-desktop.sh "+id);
//     //arglist.push("/usr/share/lmd-scripts/mate-ltsp-desktop.sh "+id);
//     //arglist.push("ltsp-chroot -p -m -a "+id+" "+editCommand);
//     arglist.push("/usr/share/lmd-scripts/lliurex-ltsp-chroot.sh "+id+" "+editCommand+" "+arch);
//     //arglist.push(editCommand+" "+id);
//     arglist.push(display);


//     Utils.n4d(credentials, n4dclass, n4dmethod, arglist, function(response){
//         console.log("Received response from run into connection:");
//         console.log(response);
        
//         self.prepareXephyrWindow(screenWidth, screenHeight, port, id);
        
//     });  // 0 is timeout for curl; 0 means sync call...

//   },0);
    
    

// }

ImageManager.prototype.editImage=function editImage(id, editCommand="/usr/sbin/mate-ltsp-desktop.sh", arch="amd64"){
    
    var self=this;
    // Stage 1: Prepare Connection
    var screenWidth=1043;
    var screenHeight=787;
    var credentials=[sessionStorage.username , sessionStorage.password];
    var n4dclass="RemoteWebGui";
    var n4dmethod="create_connection_vnc";
    var arglist=[id,editCommand]
    var port;
    var process;
    
    Utils.waitwin.ShowModalInfo(self._("ltsp_loading_image"), self._("ltsp_loading_image_description"), WAITWIN_LOADING);
    Utils.n4d(credentials, n4dclass, n4dmethod, arglist, function(response){
      // Connection is prepared
      port=response.msg.port;
      process=response.msg.process;
  
      console.log("::::"+port+" "+process);
      
      //console.log("Port: "+port+" Display: "+display);
      Utils.waitwin.SetStatus(self._("ltsp_connection_stablished"), self._("ltsp_connection_stablished_description")+sessionStorage.server+":"+port, WAITWIN_WAITING);
      
      // Clearing intervar for refresh
      clearInterval(self.timer);
      self.timer=null;
      
      // Stage 2: Launch app into Window (wait 5 seconds)
      //console.log("launching app");
      var credentials=[sessionStorage.username , sessionStorage.password];
      var n4dclass="RemoteWebGui";
      var n4dmethod="run_into_connection_vnc";
  
      var arglist=[];
      //arglist.push("/usr/share/lmd-scripts/awesome-desktop.sh "+id);
      //arglist.push("/usr/share/lmd-scripts/mate-ltsp-desktop.sh "+id);
      //arglist.push("ltsp-chroot -p -m -a "+id+" "+editCommand);
      //arglist.push("/usr/share/lmd-scripts/lliurex-ltsp-chroot.sh "+id+" "+editCommand+" "+arch);
      //arglist.push(editCommand+" "+id);
      //arglist.push(display);
      arglist.push('cmd')
      arglist.push(port)

  
      Utils.n4d(credentials, n4dclass, n4dmethod, arglist, function(response){
          console.log("Received response from run into connection:");
          console.log(response);
          
          self.prepareVncWindow(screenWidth, screenHeight, port, id);
          
      });  // 0 is timeout for curl; 0 means sync call...
  
    },0);
      
      
  
  }
  ImageManager.prototype.prepareVncWindow=function prepareXephyrWindow2(screenWidth, screenHeight, port, id=null, imagefile=null){
    // Prepare Xephyr Window
    // imagefile only used if we want to refresh image status before...
    var self=this;
    var margin_left=0-(screenWidth/2);
    var margin_top=0-(screenHeight/2);
    var divXPRA=$(document.createElement("div")).attr("id", "divXPRA").css("width",screenWidth).css("height", screenHeight).css("margin-left", margin_left).css("margin-top", margin_top);
    var divXPRAHdr=$(document.createElement("div")).attr("id", "divXPRAHdr").css("margin-top", "-30");
    var divXPRAContent=$(document.createElement("div")).attr("id", "divXPRAContent");
    var divXPRAContentInner=$(document.createElement("div")).attr("id", "divXPRAContentInner");
    $(divXPRAContentInner).css("overflow-y", "hidden").css("position", "absolute");

    var divXPRAContentCloseBt=$(document.createElement("div")).attr("id", "divXPRAContentObjCloseBt");
    // Adding close buton to header
    $(divXPRAHdr).append(divXPRAContentCloseBt);
    
    var obj=$(document.createElement("object")).addClass("emb");
    $(obj).css("width", screenWidth).css("height", screenHeight);
    //$(obj).attr("id", "divXPRAContentObj").attr("data", "http://"+sessionStorage.server+":"+port);
    //$(obj).attr("id", "divXPRAContentObj").attr("type","text/html").attr("data", "http://"+sessionStorage.server+":"+port+'/vnc.html?resize=scale&autoconnect=1&compression=0&quality=9');
    $(obj).attr("id", "divXPRAContentObj").attr("type","text/html").attr("data", '/novnc/vnc.html?host='+sessionStorage.server+'&port='+port+'&reconnect=1&resize=scale&autoconnect=1&compression=0&quality=9');
    $(divXPRAContentInner).html(obj);
    $(divXPRAContent).append(divXPRAContentInner);
        
    $(divXPRA).append(divXPRAHdr, divXPRAContent);
                      
    $(divXPRAContentCloseBt).on("click", function(){
        console.log("Detected window close");
        //Utils.waitwin.RemoveModalInfo();
        Utils.waitwin.SetStatus(self._("ltsp_closing_connection"),self._("ltsp_closing_connection_description"), WAITWIN_LOADING);
        
        // New window is closed... cleaning connection
        var credentials=[sessionStorage.username , sessionStorage.password];
        var n4dclass="RemoteWebGui";
        var n4dmethod="close_connection_vnc";
        var arglist=[port];
        //arglist.push(port);
        console.log("Calling close_connection "+port);
        try{
        Utils.n4d(credentials, n4dclass, n4dmethod, arglist, function(response){
          console.log("Response for close_connection:" + response);
          if (response!=-1) {
            console.log("Closing window...");
            
            // Close div
            $("#divXPRA").remove();
            
            console.log(imagefile+"****");
            
            // Refresh image status now
            if (imagefile){
                console.log(imagefile);
                self.imageList=[];
                $("#llx-ltsp-imagelist").empty();
                self.timer=setTimeout(function(){
                    self.getImageList();
                }, 1000); // Timer
                
            }
            
            
                
            
            
            // Reset interval for refresh imagelist
            if (self.timer===null) {
                self.timer=setInterval(function(){
                    self.getImageList();
                }, 20000); // Timer
            }
            
            // Remove Modal Wait Window
                            
            Utils.waitwin.RemoveModalInfo();
            message="Connection closed sucessful!";
            Utils.msg(message, MSG_INFO);
            //var text=self._("lmd.ask.for.regenerate.after.update");
            var text=self._("lmd.ask.for.regenerate.after.update");
            self.dialogRegenerateImage(text,id);
        } else {
            console.log("Closing window with error");
            message="Closing window with error";
            Utils.msg(message, MSG_ERROR);
          }
        });
    } catch (e){console.log("EXCEPTION");console.log(e);}
    
    });
    $("body").append(divXPRA);
    $(function(){
        $("#divXPRAContentObj").on("load",function(){
                var content=$(this).contents()
                setTimeout(function(){
                    content.find("#noVNC-control-bar").remove()
                    content.find("#noVNC_screen_pad").remove()
                },3000)
                
        })
    })
};

ImageManager.prototype.prepareXephyrWindow=function prepareXephyrWindow(screenWidth, screenHeight, port, id=null, imagefile=null){
        // Prepare Xephyr Window
        // imagefile only used if we want to refresh image status before...
        var self=this;
        var margin_left=0-(screenWidth/2);
        var margin_top=0-(screenHeight/2);
        var divXPRA=$(document.createElement("div")).attr("id", "divXPRA").css("width",screenWidth).css("height", screenHeight).css("margin-left", margin_left).css("margin-top", margin_top);
        var divXPRAHdr=$(document.createElement("div")).attr("id", "divXPRAHdr").css("margin-top", "-30");
        var divXPRAContent=$(document.createElement("div")).attr("id", "divXPRAContent");
        var divXPRAContentInner=$(document.createElement("div")).attr("id", "divXPRAContentInner");
        $(divXPRAContentInner).css("overflow-y", "hidden").css("position", "absolute");

        var divXPRAContentCloseBt=$(document.createElement("div")).attr("id", "divXPRAContentObjCloseBt");
        // Adding close buton to header
        $(divXPRAHdr).append(divXPRAContentCloseBt);
        
        var obj=$(document.createElement("object")).addClass("emb");
        $(obj).css("margin-top", -30).css("width", screenWidth).css("height", screenHeight+30);  
        //$(obj).attr("id", "divXPRAContentObj").attr("data", "http://"+sessionStorage.server+":"+port);
	$(obj).attr("id", "divXPRAContentObj").attr("data", "http://"+sessionStorage.server+":"+port+'/?keyboard_layout=es');
        $(divXPRAContentInner).html(obj);
        $(divXPRAContent).append(divXPRAContentInner);
            
        $(divXPRA).append(divXPRAHdr, divXPRAContent);
                          
        $(divXPRAContentCloseBt).on("click", function(){
            console.log("Detected window close");
            //Utils.waitwin.RemoveModalInfo();
            Utils.waitwin.SetStatus(self._("ltsp_closing_connection"),self._("ltsp_closing_connection_description"), WAITWIN_LOADING);
            
            // New window is closed... cleaning connection
            var credentials=[sessionStorage.username , sessionStorage.password];
            var n4dclass="RemoteWebGui";
            var n4dmethod="close_connection";
            var arglist=[port];
            //arglist.push(port);
            console.log("Calling close_connection "+port);
            try{
            Utils.n4d(credentials, n4dclass, n4dmethod, arglist, function(response){
              console.log("Response for close_connection:" + response);
              if (response!=-1) {
                console.log("Closing window...");
                
                // Close div
                $("#divXPRA").remove();
                
                console.log(imagefile+"****");
                
                // Refresh image status now
                if (imagefile){
                    console.log(imagefile);
                    self.imageList=[];
                    $("#llx-ltsp-imagelist").empty();
                    self.timer=setTimeout(function(){
                        self.getImageList();
                    }, 1000); // Timer
                    
                }
                
                
                    
                
                
                // Reset interval for refresh imagelist
                if (self.timer===null) {
                    self.timer=setInterval(function(){
                        self.getImageList();
                    }, 20000); // Timer
                }
                
                // Remove Modal Wait Window
                                
                Utils.waitwin.RemoveModalInfo();
                message="Connection closed sucessful!";
                Utils.msg(message, MSG_INFO);
                //var text=self._("lmd.ask.for.regenerate.after.update");
                var text=self._("lmd.ask.for.regenerate.after.update");
                self.dialogRegenerateImage(text,id);
            } else {
                console.log("Closing window with error");
                message="Closing window with error";
                Utils.msg(message, MSG_ERROR);
              }
            });
        } catch (e){console.log("EXCEPTION");console.log(e);}
        
        });
        $("body").append(divXPRA);
        
};






ImageManager.prototype.editImage_=function editImage_(id){
    var self=this;
  // Stage 1: Prepare Connection
  var credentials=[sessionStorage.username , sessionStorage.password];
  var n4dclass="RemoteWebGui";
  var n4dmethod="create_connection";
  var arglist=[sessionStorage.username];
  var port;
  var display;
  
  
  Utils.waitwin.ShowModalInfo("Loading Client", "Client session will be shown on a new window. Wait a moment, please.", WAITWIN_LOADING);
  
  Utils.n4d(credentials, n4dclass, n4dmethod, arglist, function(response){
    // Connection is prepared
    //if (!(response.status)) alert(response);
    console.log(response);
    //console.log("4444444444444444444");
    port=response.msg.port;
    display=response.msg.display;

    
    console.log("Port: "+port+" Display: "+display);
    
    Utils.waitwin.SetStatus("Connection stablished", "If connection does not appear on new window, check browser or access directly to "+sessionStorage.server+":"+port, WAITWIN_WAITING);
    
      //  console.log("55555555555555");

    // Showing new Window before

    /*console.log("Creating new window");
    var win=window.open('http://'+sessionStorage.server+':'+port,'','width=1024,height=798,left=20,top=20,toolbar=0,location=0,scrollbars=0,status=0,resizable=0,fullscreen=0,menubar=0');
    */
    
    // Stage 2: Launch app into Window (wait 5 seconds)
      //console.log("launching app");
      var credentials=[sessionStorage.username , sessionStorage.password];
      var n4dclass="RemoteWebGui";
      var n4dmethod="run_into_connection";


      //var arglist=[["xterm",display]]; // Xterm by command!!
      var arglist=[];
      //arglist.push("/usr/share/lmd-scripts/awesome-desktop.sh "+id);
      arglist.push("/usr/share/lmd-scripts/mate-ltsp-desktop.sh "+id);
      arglist.push(display);

      Utils.n4d(credentials, n4dclass, n4dmethod, arglist, function(response){
        console.log("Received response from run into connection:");
        console.log(response);
      

        console.log("Creating new window");
        //var win=window.open('http://'+sessionStorage.server+':'+port,'','width=1024,height=798,left=20,top=20,toolbar=0,location=0,scrollbars=0,status=0,resizable=0,fullscreen=0,menubar=0');
        
        var win=window.open('http://'+sessionStorage.server+':'+port,'','width=1137,height=885,left=20,top=20,toolbar=0,location=0,scrollbars=0,status=0,resizable=0,fullscreen=0,menubar=0');
              
    
        // Stage 3: Prepare for closing window
        var pollTimer = window.setInterval(function() {
          if (win.closed !== false) { // !== is required for compatibility with Opera
            console.log("Detected window close");
              //Utils.waitwin.RemoveModalInfo();
              Utils.waitwin.SetStatus("Closing Connection", "Session Connection will be closed shortly...", WAITWIN_LOADING);
              window.clearInterval(pollTimer);
              // New window is closed... cleaning connection
              var credentials=[sessionStorage.username , sessionStorage.password];
              var n4dclass="RemoteWebGui";
              var n4dmethod="close_connection";
              var arglist=[port];
              //arglist.push(port);
              console.log("Calling close_connection "+port);
              try{
              Utils.n4d(credentials, n4dclass, n4dmethod, arglist, function(response){
                console.log("Response for close_connection:" + response);
                if (response!=-1) {
                  console.log("Closing window...");
                  Utils.waitwin.RemoveModalInfo();
                  message="Connection closed sucessful!";
                  Utils.msg(message, MSG_INFO);
                  //var text=self._("lmd.ask.for.regenerate.after.update");
                  var text=self._("lmd.ask.for.regenerate.after.update");
                  self.dialogRegenerateImage(text,id);
                } 
                else {
                  console.log("Closing window with error");
                  message="Closing window with error";
                  Utils.msg(message, MSG_ERROR);
                }
    
              });
    
    
    
        } catch (e){console.log("EXCEPTION");console.log(e);}
      }
      }, 200);
      
              
      });



  
  
  
  }, 0);  // 0 is timeout for curl; 0 means sync call...


};


//ImageManager.prototype.renderImage=function renderImage(imagefile, callback=null){

ImageManager.prototype.exportDialog=function exportDialog(targetid, is_export){
    var self=this;
    // is_export=true -> Export operation
    // is_export=false -> Clone operation
    
    var clone_export_button=self._("lmd.clone");
    if (is_export) clone_export_button=self._("lmd.export");
    
    var text=self._("lmd.info.modal.clone.image");
    var form="<label for='ltsp_clone_new_name'>"+self._("lmd.image.assistant.Name")+"</label><input type='text' name='ltsp_clone_new_name' class='form-control is-empty' id='ltsp_clone_new_name' value='"+targetid+"'>";
    form+='<label for="llx_ltsp_clone_new_desc">'+self._("lmd.image.assistant.Description")+'</label><textarea class="form-control" id="llx_ltsp_clone_new_desc" type="text"></textarea>';
    
    var dialog=bootbox.dialog({
        message: form,
        title: text,
        buttons:{
            "Ok":{
                label:clone_export_button,
                className: "btn-success btn-raised",
                callback: function (){
                var newLabel=$('#ltsp_clone_new_name').val();
                var newDesc=$('#llx_ltsp_clone_new_desc').val();
                if (newLabel==targetid && !is_export ) {
                    bootbox.alert(self._("llx_clone_img_names_equal"));
                    return false;
                    } else {
                        //alert("Export: "+is_export+" for "+targetid+" as "+newLabel+ "with desc: " + newDesc);
                        var credentials=[sessionStorage.username , sessionStorage.password];
                        var n4dclass="LmdServer";
                        var n4dmethod="CloneOrExportWS";
                        
                        var newid=newLabel.replace(/([^a-z0-9]+)/gi, '');
                        var arglist=[targetid, newid, newLabel, newDesc, is_export];
                        //arglist.push(id);
                        Utils.n4dWithLog(credentials, n4dclass, n4dmethod, arglist, function(){}); // no callback is needed
                        
                        
                    
                       }
                    }
                },
            cancel:{
                label:self._("lmd.cancel"),
                className: "btn-cancel btn-raised"
                }
                }
            });
            
            
            $.material.init();
            dialog.modal("show");
    
};

/*ImageManager.prototype.createSelect=function createSelect(item){
    var sel='<div class="form-group" title="'+item.help+'"  style="margin-top:30;">';
    sel+='<label for="'+item.id+'" class="col-md-2 control-label">'+item.label+'</label>';
    sel+='<div class="col-md-10">';
    sel+='<select id="'+item.id+'" class="form-control">';
    for (var i in item.options){
        sel+="<option value="+item.options[i].value+">"+item.options[i].label+"</option>";
    }
    
    sel+="</select></div></div>";
    
    return sel; 
}*/

ImageManager.prototype.EditImageOptions=function EditImageOptions(image){
    var self=this;
    var imagejson=JSON.parse(image);
    /*alert(imagejson.fat_ram_threshold);
    alert(imagejson.ldm_session);
    alert(imagejson.ldm_language);
    alert(imagejson.lmd_extra_params);*/
    
    // Setting up if is fat client
    var fatclient="default";
    if(imagejson.ltsp_fatclient=="false") fatclient="thin";
    else if (imagejson.ltsp_fatclient=="true") fatclient="fat";
    
    // Setting Up Language
    var imglang="default";
    if(imagejson.ldm_language=="ca_ES.UTF-8@valencia") imglang="ca";
    else if(imagejson.ldm_language=="es_ES.UTF-8") imglang="es";
    
    // Setting up local apps
    var use_local_apps="";
    if(imagejson.use_local_apps=="true") use_local_apps="checked";
    
    
    
    var content="";
    /*
    {"status": "edited", "fat_ram_threshold": "default", "name": "Client", "img": "llx-client16.png", "ldm_session": "default", "taskid": "14751445423", "template": "lliurex-ltsp-client.conf", "ltsp_fatclient": "undefined", "task_status": "DONE", "id": "Client", "lmd_extra_params": "", "desc": "Client de model d'aula LliureX (32 bits)."}

    {"fat_ram_threshold": "256", "name": "Client", "img": "llx-client16.png", "ldm_session": "default", "ldm_language": "ca_ES.UTF-8@valencia", "use_local_apps": "true", "template": "lliurex-ltsp-client.conf", "local_apps_text": "firefox", "ltsp_fatclient": "false", "task_status": "DONE", "id": "Client", "lmd_extra_params": "Param1=\"Hola\"<br/>Param3=\"kkk\"", "desc": "Client de model d'aula LliureX (32 bits)."}
    */
    
    content+=Utils.formFactory.createText({"id":"ltsp_image_options_client_name",
                                        "label": self._("lmd_options_image_name_label"),
                                        "help":self._("lmd_options_image_name_help"),
                                        "value":imagejson.name});
    
    content+=Utils.formFactory.createTextArea({"id":"ltsp_image_options_client_desc",
                                        "label": self._("lmd_options_image_desc_label"),
                                        "help": self._("lmd_options_image_desc_help"),
                                        "value":imagejson.desc});
    
    content+=Utils.formFactory.createSelect({"id":"ltsp_image_options_client_type",
                               "label":self._("lmd.image.options.client.type"),
                               "help":self._("lmd.image.options.client.type.help"),
                               "default":fatclient,
                               "options":[
                                {"value":"default", "label":self._("lmd.image.options.client.type.label.default")},
                                {"value":"thin", "label":self._("lmd.image.options.client.type.label.thin")},
                                {"value":"fat", "label":self._("lmd.image.options.client.type.label.fat")}  ]});
    
    content+=Utils.formFactory.createSelect({"id":"ltsp_image_options_client_lang",
                               "help":self._("lmd.image.options.client.language.help"),
                               "label":self._("lmd.image.options.client.language"),
                               "default":imglang,
                               "options":[
                                {"value":"default", "label":self._("lmd.image.options.client.language.default")},
                                {"value":"ca", "label":self._("lmd.image.options.client.language.ca")},
                                {"value":"es", "label":self._("lmd.image.options.client.language.es")},
                                {"value":"en", "label":self._("lmd.image.options.client.language.en")} ]});
                        
    content+=Utils.formFactory.createSelect({"id":"ltsp_image_options_client_run_as_thin",
                               "help":self._("lmd.image.options.client.ram.threshold.help"),
                               "label":self._("lmd.image.options.client.ram.threshold"),
                               "default":imagejson.fat_ram_threshold,
                               "options":[
                                {"value":"default", "label":self._("lmd.image.options.client.ram.threshold.not.apply")},
                                {"value":"128", "label":"128 Mb"},
                                {"value":"256", "label":"256 Mb"},
                                {"value":"512", "label":"512 Mb"} ]});
                                                
    content+=Utils.formFactory.createCheckbox({"id":"ltsp_image_options_localapps",
                                                "label":"Use Local Apps",
                                                "default":use_local_apps,
                                                "help":"Run some apps like Firefox or Chrome as local apps."});
    
    content+=Utils.formFactory.createTextArea({"id":"lmd_options_image_advanced",
                                        "label": self._("lmd_options_image_adv_label"),
                                        "help": self._("lmd_options_image_adv_help"),
                                        "value":imagejson.lmd_extra_params.replace("<br/>","\n")});
    
    
    var dialog=bootbox.dialog({
        message: content,
        title: self._("lmd_client_options_dialog_title"),
        buttons:{
            "Apply":{
            label:self._("lmd_client_options_dialog.apply"),
            className: "btn-success btn-raised",
                            callback: function (){
                                
                                var name=$("#ltsp_image_options_client_name").val();
                                var id=imagejson.id;
                                var imgbg=imagejson.img;
                                var template=imagejson.template;
                                var desc=$("#ltsp_image_options_client_desc").val();
                                var ltsp_fatclient="undefined";
                                if ($("#ltsp_image_options_client_type").val()=="fat") ltsp_fatclient="true";
                                else if ($("#ltsp_image_options_client_type").val()=="thin") ltsp_fatclient="false";
                                var ldm_session="default";
                                
                                var ldm_language="default";
                                if ($("#ltsp_image_options_client_lang").val()=="ca") ldm_language="ca_ES.UTF-8@valencia";
                                else if ($("#ltsp_image_options_client_lang").val()=="es") ldm_language="es_ES.UTF-8";
                                else if ($("#ltsp_image_options_client_lang").val()=="en") ldm_language="en_US.UTF-8";
                                
                                var use_local_apps="false"; // Check if ltsp_fatclient is false to avoid localapps in fat clients
                                if ($("#ltsp_image_options_localapps").val()=="on" && ltsp_fatclient=="false")  use_local_apps="true";
                                
                                var local_apps_text="firefox, google-chrome-stable, chromium-browser";
                                
                                var fat_ram_threshold=$("#ltsp_image_options_client_run_as_thin").val();
                                var lmd_extra_params=$("#lmd_options_image_advanced").val();
                                
                     
                                        
                                /*var data="{'desc': '"+desc+"',\n";
                                        data=data+"'id': '"+id+"',\n";
                                        data=data+"'template': '"+template+"',\n";
                                        data=data+"'name': '"+name+"',\n";
                                        data=data+"'img': '"+imgbg+"',\n";
                                        data=data+"'ltsp_fatclient': '"+ltsp_fatclient+"',\n";
                                        data=data+"'ldm_session': '"+ldm_session+"',\n";
                                        data=data+"'ldm_language': '"+ldm_language+"',\n";
                                        data=data+"'fat_ram_threshold': '"+fat_ram_threshold+"',\n";
                                        data=data+"'use_local_apps': '"+use_local_apps+"',\n";
                                        data=data+"'local_apps_text': '"+local_apps_text+"',\n";
                                        data=data+"'lmd_extra_params': '"+lmd_extra_params.replace(/"/g, '\\\"').replace(/\n/g, "<br/>")+"'\n}";
                                  */
                                
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
                                        
                                // PERFORM N4d CALL
    
                                var credentials=[sessionStorage.username , sessionStorage.password];
                                var n4dclass="LmdImageManager";
                                var n4dmethod="setImage";
                                var arglist=[];
                                arglist.push(id);
                                arglist.push(data);
                                try {
                                    Utils.n4d(credentials, n4dclass, n4dmethod, arglist, function(response){
                                        console.log(response);
                                        message=self._("lmd_client_options_dialog.success");
                                        Utils.msg(message, MSG_SUCCESS);
                                        console.log("Removing .llx-ltsp-image-file[target_id='"+id+"']");
                                        $.when($(".llx-ltsp-image-file[target_id='"+id+"']").remove()).then(function(){
                                            self.getImageList();
                                            });
                                        
                                        
                                    },0);
                                   }
                                   catch (error){
                                     Utils.msg(message+" "+error, MSG_ERROR);
                                }
                                
                                
                                /* PERFORM N4d CALL

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

                                */
                                
                                
                                
                            }
                        },
            cancel:{
                    label:self._("lmd.cancel"),
                    className: "btn-cancel btn-raised" }
                }
            });
                
             
        $.material.init();
        dialog.modal("show");
    
    
};

ImageManager.prototype.renderImage=function renderImage(imagefile){
    // Creates a container for thin client image, with buttons and status    
    try{
        
        var self=this;
        var credentials="";
        var n4dclass="LmdImageManager";
        var n4dmethod="getImage";
        var arglist=[imagefile];
        
        Utils.n4d(credentials, n4dclass, n4dmethod, arglist, function(response){
            var imageContent=JSON.parse(response);
            
            
            /* Check if is yet rendered... */
            
            //var checker=$("#llx-ltsp-imagelist").children().find("[target_id='"+imageContent.id+"']");
            var checker=$(".llx-ltsp-image-file[target_id='"+imageContent.id+"']");
            
            console.log(checker);
            if (checker.length>0){
                if($(checker).attr("status")==imageContent.task_status)
                {
                    return 0;
                } else {
                    // Image is rendered, but status has changed
                    // Changing status
                    console.log("rendered but changed");
                    $(checker).remove(); // Remove for redraw
         
                    $(checker).attr("status", imageContent.task_status); // Adding status
                    // return 0;                
                } // else
            }
            
            /***************************************************************************/
            /*     End checking rendered images, if we are here, we need to render     */
            /***************************************************************************/


            var picColumn=$(document.createElement("div")).addClass("col-md-1").css("padding","0");
            //var picItem=$(document.createElement("div")).addClass("llx-ltsp-image-picture");
            var picItem=$(document.createElement("img")).attr("src", "modules/lliurex-ltsp/src/css/img/llx-client16.svg").addClass("col-md-12").css("padding", "0");
            picColumn.append(picItem);
            var imgName=$(document.createElement("div")).html(imageContent.name).addClass("ltsp-image-name");
            var imgDesc=$(document.createElement("div")).html(imageContent.desc).addClass("ltsp-image-desc");
            var descColumn=$(document.createElement("div")).addClass("llx-ltsp-image-desc-div col-md-3");
            $(descColumn).append(imgName, imgDesc);
          
            var ImageButtonsColumn=$(document.createElement("div")).addClass("llx-ltsp-image-buttons col-md-8");
            
            /*var editImgBt=$(document.createElement("button")).attr("type", "button").addClass("btn btn-xs btn-info ltsp-img-bt btn-raised").attr("title", self._("lmd.Edit"));
            $(editImgBt).html("<i class='material-icons' style='vertical-align:middle;'>cast</i>&nbsp;Edit");*/
            
            
            var editImgBt=$(document.createElement("div")).addClass("btn-group").css("padding", "0").css("margin", "0").css("float","right");
            var editImgBtButton=$(document.createElement("button")).addClass("btn btn-info ltsp-img-bt btn-raised dropdown-toggle").attr("data-toggle", "dropdown");
            //$(editImgBtButton).css("background", "#ff0000");
            $(editImgBtButton).html(self._("ltsp_Edit")+"<span class='caret'></span>");
            var editOptions=$(document.createElement("ul")).addClass("dropdown-menu");
            
            var editOptionUpdate=$(document.createElement("li")).addClass("edit_submenu").html(self._("ltsp_edit_update_image"));
            var editOptionInstall=$(document.createElement("li")).addClass("edit_submenu").html(self._("ltsp_edit_run_synaptic"));
            var editOptionTerminal=$(document.createElement("li")).addClass("edit_submenu").html(self._("ltsp_edit_terminal"));
            var editOptionMATE=$(document.createElement("li")).addClass("edit_submenu").html(self._("ltsp_edit_launch_mate"));
            var editOptionAwesome=$(document.createElement("li")).addClass("edit_submenu").html(self._("ltsp_edit_launch_awesome"));
            // MOVED AFTER IF: $(editOptions).append(editOptionUpdate, editOptionInstall, editOptionTerminal, editOptionMATE, editOptionAwesome);
            
            
            // Checking if there are XPRA active connections
            if(imageContent.xpraConnections.length>0)
                { // If there are connections, add options for reconnect them or remove these connections
                    console.log(imageContent.xpraConnections);
                    $(editImgBtButton).css("background-color", "#ff9800");
                    for (i in imageContent.xpraConnections){
                        var xpraOption=$(document.createElement("li")).addClass("edit_submenu").html(self._("ltsp_edit_connection")+imageContent.xpraConnections[i][0]);
                        $(xpraOption).attr("port", imageContent.xpraConnections[i][0]).addClass("xpraConnectionsActive");
                        $(xpraOption).attr("imagefile", imagefile);
                        $(xpraOption).attr("target_id", imageContent.id);
                        $(editOptions).append(xpraOption);
                    }
                    // Add option to clean connections
                    var xpraOptionClean=$(document.createElement("li")).addClass("edit_submenu").html(self._("ltsp_clean_connections")).attr("id", "ltsp_edit_clean_xpra_connections");
                    $(editOptions).append(xpraOptionClean);
                        
                    // Otherwhise, lets add common options
                } else $(editOptions).append(editOptionUpdate, editOptionInstall, editOptionTerminal, editOptionMATE, editOptionAwesome);

            // And add properly options for edit Image Button
            $(editImgBt).append(editImgBtButton, editOptions);
            
            
            var regenerateImgBt=$(document.createElement("button")).attr("type", "button").addClass("btn btn-info btn-xs ltsp-img-bt btn-raised").attr("title", self._("lmd.regenerate_help"));
            $(regenerateImgBt).html("<i class='material-icons' style='vertical-align:middle;'>refresh</i>&nbsp;"+self._("lmd.regenerate"));
            var imgOptsBt=$(document.createElement("button")).attr("type", "button").addClass("btn btn-xs btn-info ltsp-img-bt btn-raised").attr("title", self._("lmd.options_help"));
            $(imgOptsBt).html("<i class='material-icons' style='vertical-align:middle;'>edit</i>&nbsp;"+self._("lmd.options"));
            var cloneImgBt=$(document.createElement("button")).attr("type", "button").addClass("btn btn-info btn-xs ltsp-img-bt btn-raised").attr("title", self._("lmd.clone"));
            $(cloneImgBt).html("<i class='material-icons' style='vertical-align:middle;'>filter</i>&nbsp;"+self._("lmd.clone"));
            var listenImgBt=$(document.createElement("button")).attr("type", "button").addClass("btn btn-info btn-xs ltsp-img-bt btn-raised").attr("title", self._("lmd.listen"));
            $(listenImgBt).html("<i class='material-icons' style='vertical-align:middle;'>pageview</i>&nbsp;"+self._("lmd.listen"));
            $(listenImgBt).attr("taskid", imageContent.taskid);
            var removeImgBt=$(document.createElement("button")).attr("type", "button").addClass("btn btn-danger btn-xs ltsp-img-bt btn-raised").attr("title", self._("lmd.delete"));
            $(removeImgBt).html("<i class='material-icons' style='vertical-align:middle;'>clear</i>&nbsp;"+self._("lmd.delete"));
                
            // Adding target ids and binding events
            $(editImgBt).attr("target_id", imageContent.id);
            $(regenerateImgBt).attr("target_id", imageContent.id);
            $(imgOptsBt).attr("target_id", imageContent.id);
            $(cloneImgBt).attr("target_id", imageContent.id);
            $(removeImgBt).attr("target_id", imageContent.id);
            $(listenImgBt).attr("target_id", imageContent.id);
            $(editOptionUpdate).attr("target_id", imageContent.id);
            $(editOptionUpdate).attr("arch", imageContent.arch);
            $(editOptionInstall).attr("target_id", imageContent.id);
            $(editOptionInstall).attr("arch", imageContent.arch);
            $(editOptionTerminal).attr("target_id", imageContent.id);
            $(editOptionTerminal).attr("arch", imageContent.arch);
            $(editOptionMATE).attr("target_id", imageContent.id);
            $(editOptionMATE).attr("arch", imageContent.arch);
            $(editOptionAwesome).attr("target_id", imageContent.id);
            $(editOptionAwesome).attr("arch", imageContent.arch);
            
            
            /*$(editImgBt).on("click", function(){
                self.editImageWithCheck($(this).attr("target_id"));
            });*/
            
            $(editOptionUpdate).on("click", function(){
                self.editImageWithCheck($(this).attr("target_id"), "run_lliurex_up", $(this).attr("arch"));
            });
            $(editOptionInstall).on("click", function(){
                self.editImageWithCheck($(this).attr("target_id"), "run_synaptic", $(this).attr("arch"));
            });
            $(editOptionTerminal).on("click", function(){
		//alert("mate-terminal");
                self.editImageWithCheck($(this).attr("target_id"), "terminal", $(this).attr("arch"));
            });
            $(editOptionMATE).on("click", function(){
                self.editImageWithCheck($(this).attr("target_id"), "desktop", $(this).attr("arch"));
            });
            $(editOptionAwesome).on("click", function(){
                self.editImageWithCheck($(this).attr("target_id"), "minimal", $(this).attr("arch"));
            });
            
               
            $(regenerateImgBt).on("click",function(){
                
                var targetid=$(this).attr("target_id");
                var text=self._("lmd.warning.refresh.image")+targetid+self._("lmd.warning.refresh.image.sure");
                self.dialogRegenerateImage(text, targetid);
            });
                
            $(imgOptsBt).on("click", function(){
                //alert("Show options for "+$(this).attr("target_id"));
                
                var credentials="";
                var n4dclass="LmdImageManager";
                var n4dmethod="getImage";
                var arglist=[$(this).attr("target_id")+".json"];
  
                Utils.n4d(credentials, n4dclass, n4dmethod, arglist, function(response){
                    self.EditImageOptions(response);
                });
           });
                
            $(cloneImgBt).on("click", function(){
                //alert("Clonerrr "+$(this).attr("target_id"));
                var targetid=$(this).attr("target_id");
                
                //var text=self._("Clone into this serever or export to another machine?");
                
            
                var txt_lmd_clone_message=self._("lmd.clone_message");
                var lmd_clone_title=self._("lmd.clone_title");
                var lmd_clonehere=self._("lmd.clonehere");
                var lmd_exportfile=self._("lmd.exportfile");
            
                console.log(self);
                console.log(self._("llx_clone_img_names_equal")+"!!");
                console.log(txt_lmd_clone_message+"****");
                
                var dialog=bootbox.dialog({
                    message: txt_lmd_clone_message,
                    title: lmd_clone_title,
                    buttons:{
                        "Clone":{
                            label:lmd_clonehere,
                            className: "btn-success btn-raised",
                            callback: function (){
                                self.exportDialog(targetid, false);
                            }
                        },
                        "Export":{
                            label:lmd_exportfile,
                            className: "btn-raised",
                            callback: function(){
                                self.exportDialog(targetid, true);
                            }
                        }
                    }
                });
                
             
                $.material.init();
                dialog.modal("show");
            });
                        
            $(removeImgBt).on("click", function(){
                var targetid=$(this).attr("target_id");
                // Ask for confirmation
                var text="You are going to delete image "+targetid+". Are you sure?";
                bootbox.confirm(text, function(res){
                    // Removing image with targetid
                    if (res)  self.deleteImage(targetid);
                });
            });
            
            
            $(listenImgBt).on("click", function(event){
                //var taskid=$(event.target).parent().parent().attr("taskid");
                //var taskid=$(event.target).parent().parent();
                var taskid=$(event.target).attr("taskid");
                console.log(taskid);
                Utils.listenJob(taskid);
            });
            
            
                        
            var imgFile=$(document.createElement("div"));
            
            if (imageContent.task_status=="RUNNING") {
                    $(imgFile).addClass("llx-ltsp-image-file llx-ltsp-image-file-wip");
                    $(ImageButtonsColumn).append(listenImgBt);
                }
            //else if (imageContent.status || imageContent.task_status=="BROKEN" || imageContent.task_status=="CANCELLED") {
            else if (imageContent.task_status=="BROKEN" || imageContent.task_status=="CANCELLED") {
                $(imgFile).addClass("llx-ltsp-image-file llx-ltsp-image-file-broken");
                if (imageContent.status==="enabled-non-editable")
                    $(ImageButtonsColumn).append(removeImgBt);
                else $(ImageButtonsColumn).append(removeImgBt, cloneImgBt, regenerateImgBt, editImgBt, imgOptsBt);
            }
            else{
                $(imgFile).addClass("llx-ltsp-image-file llx-ltsp-image-file-available");
                if (imageContent.status==="enabled-non-editable")
                    $(ImageButtonsColumn).append(removeImgBt);
                else $(ImageButtonsColumn).append(removeImgBt, cloneImgBt, regenerateImgBt, editImgBt, imgOptsBt);
            }
            
            
            $(imgFile).attr("status", imageContent.task_status); // Adding status
            //var imgFile=$(document.createElement("div")).addClass("llx-ltsp-image-file llx-ltsp-image-file-wip");
            $(imgFile).attr("target_id", imageContent.id);
            $(imgFile).append(picColumn, descColumn, ImageButtonsColumn);   
            $(imgFile).css("display", "none"); // set display to none
            // Add div image to image container div
            
            $("#llx-ltsp-imagelist").prepend(imgFile);
            
            // Increment rendered images counter and check
            self.renderedimages=self.renderedimages+1;
            console.log("renderedimages="+self.renderedimages+" from "+self.imageList.length);
            if (self.renderedimages>=self.imageList.length)
            {
                $("#llx-ltsp-imagelist_waiting").fadeOut(
                    function(){
                        $(imgFile).fadeIn();
                    });
            } else {$(imgFile).fadeIn();}
            
            
            // Binding events for running sessions
            
            $(".xpraConnectionsActive").on("click", function(){
                var screenWidth=819;
                var screenHeight=614;
                var port=$(this).attr("port");
                var imagefile=$(this).attr("imagefile");
                var id=$(this).attr("target_id");
                
                Utils.waitwin.ShowModalInfo(self._("ltsp_loading_image"), self._("ltsp_loading_image_description"), WAITWIN_LOADING);
                Utils.waitwin.SetStatus(self._("ltsp_connection_stablished"), self._("ltsp_connection_stablished_description")+sessionStorage.server+":"+port, WAITWIN_WAITING);
                                        
                self.prepareXephyrWindow(screenWidth, screenHeight, port, id, imagefile);
                
            });
            
            $("#ltsp_edit_clean_xpra_connections").on("click", function(){
                var portlist=[];
                var counter=0;
                var processed=0;
                
                Utils.waitwin.SetStatus(self._("ltsp_closing_connection"),self._("ltsp_closing_connection_description"), WAITWIN_LOADING);
                
                $(".xpraConnectionsActive").each(function(){
                    portlist.push($(this).attr("port"));
                    counter++;
                });
                
                for (i=0;i<counter;i++){
                    var port=portlist[i];
                    
                    var credentials=[sessionStorage.username , sessionStorage.password];
                    var n4dclass="RemoteWebGui";
                    var n4dmethod="close_connection";
                    var arglist=[port];
                    
                    
                    Utils.n4d(credentials, n4dclass, n4dmethod, arglist, function(response){
                      if (response!=-1) {
                        $("#divXPRA").remove();
                        processed++;
                        console.log("processed is: "+processed);
                        
                        if (processed==counter){
                            console.log("processed is counter, cleaning");
                            // Refresh image status now
                            self.imageList=[];
                            $("#llx-ltsp-imagelist").empty();
                            
                            self.timer=setTimeout(function(){
                                self.getImageList();
                                // Reset interval for refresh imagelist
                                if (self.timer===null) {
                                    self.timer=setInterval(function(){
                                        self.getImageList();
                                    }, 20000); // Timer
                                }
                            }, 1000); // TimeOut
                            
                            // Remove Modal Wait Window
                            Utils.waitwin.RemoveModalInfo();
                            message="Connection closed sucessful!";
                            Utils.msg(message, MSG_INFO);
                        }
                    }
                
                }); // n4d call ends
                }
            }); // 
            
            // End Binding events for running sessions
            
        });
        
        
    }catch(e){
        alert("exception: "+e);
        
    }
};

ImageManager.prototype.dialogRegenerateImage = function dialogRegenerateImage(textDialog, id){
    var self = this;
    var dialog = bootbox.dialog({
        title: textDialog,
        message:"<p>"+textDialog+"</p>",
        buttons: {
            ok: {
                label: self._("lmd.regenerate"),
                className: 'btn-raised btn-success',
                callback: function(){self.regenerateImage(id);}
            },
            delay: {
                label: self._("lmd.later"),
                className: 'btn-raised btn-info',
                callback: function(){
                    dialog.find('.bootbox-body').html('<div class="row"><div class="col-md-12"><div id="datetimepicker12"></div></div></div>');
                    dialog.find('.modal-footer').html('<button id="regenerateImgDelay" class="btn btn-raised btn-success">'+self._("lmd.regenerate")+'</button><button class="btn btn-raised">'+self._("lmd.cancel")+'</button>');
                    $('#datetimepicker12').datetimepicker({format:'DMYYHHmm',inline: true,sideBySide: true,minDate:Date.now()});
                    
                    dialog.find("#regenerateImgDelay").on('click',function(){
                        var datetimeImageDelay = $('#datetimepicker12').data("DateTimePicker").date().local();
                        self.regenerateImageWithDelay(id, datetimeImageDelay);
                    });
                    return false;
                }
            },
            cancel: {
                label: self._("lmd.cancel"),
                className: 'btn-raised',
                callback: function(){}
            }
        }
    });
}


ImageManager.prototype.regenerateImage=function regenerateImage(id){
    var credentials=[sessionStorage.username , sessionStorage.password];
    var n4dclass="LmdServer";
    var n4dmethod="refresh_imageWS";
    var arglist=[];
    arglist.push(id);
    Utils.n4dWithLog(credentials, n4dclass, n4dmethod, arglist, null); // no callback is needed
}

ImageManager.prototype.regenerateImageWithDelay = function regenerateImageWithDelay(id, datetimeDelay){
    var credentials=[sessionStorage.username , sessionStorage.password];
    var n4dclass="LmdServer";
    var n4dmethod="refresh_imageWS";
    var datetimeDelayFormated = datetimeDelay.format('DD-MM-YYYY HH:mm');
    var arglist=[id, datetimeDelayFormated];
    Utils.n4dWithLog(credentials, n4dclass, n4dmethod, arglist, null); // no callback is needed
}

ImageManager.prototype.RenderImageList=function RenderImageList(){
    // When image list has been loaded, we should load them one by one.
    var self=this;
    if (typeof(self.imageList)==="undefined") return;
    try{
        for (var image in self.imageList) {
            if(self.imageList.hasOwnProperty(image)){
            var imagefile=self.imageList[image];
            self.renderImage(imagefile);
        } // if
      } //for
    }
    catch(e){
        alert("Exception in RenderImageList: "+e);
    }
};

//ImageManager.prototype.getImageList=function getImageList(callback){
ImageManager.prototype.getImageList=function getImageList(){
  // Gets Thin Client Images from server, and callbacks drawing image function when all they are loaded
  var self=this;
    
  var credentials="";
  var n4dclass="LmdImageManager";
  var n4dmethod="getImageList";
  var arglist=[];
  
   Utils.n4d(credentials, n4dclass, n4dmethod, arglist, function(response){
    // console.log(response);
    //console.log(response);
    //console.log("getImageList");
    //console.log(new Date().getTime());
    //var imagelist=JSON.parse(response);
    //console.log(self);
    //console.log(self.imageList);
    //console.log(callback);
    //callback(imagelist); // Returns image list
    
    self.imageList=JSON.parse(response);
    if (self.imageList.length===0) $("#llx-ltsp-imagelist_waiting").hide();
    
    self.RenderImageList(); // ho fa el callback
    });
};


/*ImageManager.prototype.checkImageList=function checkImageList(){
    var self=this;
    //var job_id=-1;
    self.getImageList(function(){
            
        });
};*/

/*ImageManager.prototype.checkImageList=function checkImageList(){
    var self=this;
    //var job_id=-1;
    self.getImageList(function(tmp_imagelist){
        self.getTaskList(function(){
            console.log(tmp_imagelist);
            console.log(self.currenttasks);
        });
    });
};*/

    
    
                    
                    

ImageManager.prototype.checkImageList_WTF=function checkImageList_WTF(){
  // Check if there is any new image in server and its state
    var self=this;
    //var job_id=-1;
    self.getImageList(function(tmp_imagelist){
        self.getTaskList(function(){
        //console.log(self.currenttasks);
        for (var i in  tmp_imagelist){
          if(imagelist.hasOwnProperty(i)){
            var tmp_image=tmp_imagelist[i];
            //console.log("self.imagelist="+self.imageList);
            //console.log(self.imageList.indexOf(tmp_image));
            if (self.imageList.indexOf(tmp_image)<0) {
                //console.log("Rendering... "+tmp_image);
                self.renderImage(tmp_image, function(){
                    self.imageList.push(tmp_image);
                });
            } 
            else{
                var target=tmp_image.substr(0,tmp_image.length-5);
                var imagefile=$('.llx-ltsp-image-file[target_id="'+target+'"]');
                if (imagefile.length===0){  // if true, target is in imagelist, but has not been drawn!!
                    self.renderImage(tmp_image, function(){});
                }
                else{ // if is drawn, let's check its status
                    var itemstatus=$(imagefile).attr("status");
                    console.log("IMAGE FILE");
                    console.log($(imagefile));
                    var sfi=self.checkStatusForImage(target);
                    if (itemstatus==sfi.status)
                        {
                            console.log("status is the same::::::::::"+itemstatus);
                        }
                    else{ // Cal tornar a pintar l status
                        //$(itemstatus).attr("status", sfi);
                          /*console.log("status changed:");
                          console.log(target);
                          console.log(itemstatus);
                          console.log(sfi);
                          console.log("\\status changed:");*/
                            $(imagefile).remove();
                            self.renderImage(tmp_image, function(){}); 
                        }
                    }
            }
          }// if
        }  // for
        }); // getTaskList
    }); // getImageList
    
}

ImageManager.prototype.newImageAssistant=function newImageAssistant(){
    var self=this;
    if (self.imageMinimalInstalled) {
        $("#llx_ltsp_lliurex_minimal_image").hide();}
        //$("#llx-ltsp-image-assistant-stage-1").show();
    /*} else {
        $("#llx-ltsp-image-assistant-stage-1").show();
        $("#llx-ltsp-image-assistant-stage-2").hide();
    }*/
    $("#llx-ltsp-image-assistant-stage-1").show();
    $("#llx-ltsp-image-assistant-stage-2").hide();
    $("#llx-ltsp-new-image-assistant").fadeIn();
}

ImageManager.prototype.checkMinimalImageIsInstalled=function checkMinimalImageIsInstalled(){
    /*
        Checks if the minimal image is deployed
        N4d methods in use: LmdServer::check_minimal_client
        
    */
  var self=this;
  
  var credentials=null;
  var n4dclass="LmdServer";
  var n4dmethod="chek_minimal_client";
  var arglist="";
  
  Utils.n4d(null, n4dclass, n4dmethod, arglist, function(response){
    self.imageMinimalInstalled=response["status"];
    //self.imageMinimalInstalled=true;
  });
}
/*
ImageManager.prototype.PrepareLogDialog=function PrepareLogDialog(){
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


*/
ImageManager.prototype.getAvailableTemplates=function getAvailableTemplates(){
        /*
        Gets Template list and its properties
        N4d methods in use:
            LmdTemplateManager::getTemplateList
            LmdTemplateManager::getTemplate(filename)            
    */    
    var self=this;
  
    var credentials="";
    var n4dclass="LmdTemplateManager";
    var n4dmethod="getTemplateList";
    var arglist="";
  
    Utils.n4d(credentials, n4dclass, n4dmethod, arglist, function(response){
        var templatelist=JSON.parse(response);
        // Hide waiting progress
        $("#llx-ltsp-templatelist_waiting").fadeOut(
            function(){
            
            /* Recognised templates:
                "lliurex-ltsp-desktop.conf"
                "lliurex-ltsp-desktop-amd64.conf"
                "lliurex-ltsp-infantil.conf"
                "lliurex-ltsp-infantil-amd64.conf"
                "lliurex-ltsp-client.conf"
                "lliurex-ltsp-client-amd64.conf"
            */
            
            // Prepare buttons  
                                
            if (templatelist.indexOf("lliurex-ltsp-client.conf")!=-1 && self.mirrorReady &&  self.mirror32bit) {
                $("#ltsp_template_client").attr("image_client_arch_32", "true");
                $("#ltsp_template_client").show(); }
            
            if (templatelist.indexOf("lliurex-ltsp-client-amd64.conf")!=-1 && self.mirrorReady &&  self.mirror64bit) {
                $("#ltsp_template_client").attr("image_client_arch_64", "true");
                $("#ltsp_template_client").show(); }
		
	    if (templatelist.indexOf("lliurex-ltsp-client-smart-amd64.conf")!=-1 && self.mirrorReady &&  self.mirror64bit) {
                $("#ltsp_template_client_smart").attr("image_client_arch_64", "true");
                $("#ltsp_template_client_smart").show(); }
                
            if (templatelist.indexOf("lliurex-ltsp-infantil.conf")!=-1 && self.mirrorReady &&  self.mirror32bit) {
                $("#ltsp_template_infantil").attr("image_client_arch_32", "true");
                $("#ltsp_template_infantil").show(); }
                
                if (templatelist.indexOf("lliurex-ltsp-infantil-amd64.conf")!=-1 && self.mirrorReady &&  self.mirror64bit) {
                $("#ltsp_template_infantil").attr("image_client_arch_64", "true");
                $("#ltsp_template_infantil").show(); }
                
            if (templatelist.indexOf("lliurex-ltsp-desktop.conf")!=-1 && self.mirrorReady &&  self.mirror32bit) {
                $("#ltsp_template_desktop").attr("image_client_arch_32", "true");
                $("#ltsp_template_desktop").show(); }
                
            if (templatelist.indexOf("lliurex-ltsp-desktop-amd64.conf")!=-1 && self.mirrorReady &&  self.mirror64bit) {
                $("#ltsp_template_desktop").attr("image_client_arch_64", "true");
                $("#ltsp_template_desktop").show(); }
            
            // Binding select client
            $("#ltsp_template_client").bind("click", function(){
                $(".llx_ltsp_template_div").removeClass("llx_ltsp_template_div_selected");
                $("#ltsp_template_client").addClass("llx_ltsp_template_div_selected");
                $("#llx-ltsp-goto-image-assistant-stage-2").addClass("btn-primary");
                
                $("#llx_ltsp_new_image_name").val("Client");
                $("#llx_ltsp_new_image_desc").val($("#ltsp_template_client").find(".llx_ltsp_template_desc").html());
                
                if($("#ltsp_template_client").attr("image_client_arch_32")=="true")
                    $("#llx_ltsp_new_image_arch").val("i386");
                else $("#llx_ltsp_new_image_arch").val("amd64");
                
                });

            $("#ltsp_template_client_smart").bind("click", function(){
                $(".llx_ltsp_template_div").removeClass("llx_ltsp_template_div_selected");
                $("#ltsp_template_client_smart").addClass("llx_ltsp_template_div_selected");
                $("#llx-ltsp-goto-image-assistant-stage-2").addClass("btn-primary");
                
                $("#llx_ltsp_new_image_name").val("ClientSMART");
                $("#llx_ltsp_new_image_desc").val($("#ltsp_template_client_smart").find(".llx_ltsp_template_desc").html());
                
                if($("#ltsp_template_client_smart").attr("image_client_arch_32")=="true")
                    $("#llx_ltsp_new_image_arch").val("i386");
                else $("#llx_ltsp_new_image_arch").val("amd64");
                
                });

		
		
            
            // Binding select infantil
            $("#ltsp_template_infantil").bind("click", function(){
                $(".llx_ltsp_template_div").removeClass("llx_ltsp_template_div_selected");
                $("#ltsp_template_infantil").addClass("llx_ltsp_template_div_selected");
                $("#llx-ltsp-goto-image-assistant-stage-2").addClass("btn-primary");
                
                $("#llx_ltsp_new_image_name").val("Infantil");
                $("#llx_ltsp_new_image_desc").val($("#ltsp_template_infantil").find(".llx_ltsp_template_desc").html());
                
                if($("#ltsp_template_infantil").attr("image_client_arch_32")=="true")
                    $("#llx_ltsp_new_image_arch").val("i386");
                else $("#llx_ltsp_new_image_arch").val("amd64");
                });
            
            // Binding select desktop
            $("#ltsp_template_desktop").bind("click", function(){
                $(".llx_ltsp_template_div").removeClass("llx_ltsp_template_div_selected");
                $("#ltsp_template_desktop").addClass("llx_ltsp_template_div_selected");
                $("#llx-ltsp-goto-image-assistant-stage-2").addClass("btn-primary");
                
                $("#llx_ltsp_new_image_name").val("Desktop");
                $("#llx_ltsp_new_image_desc").val($("#ltsp_template_desktop").find(".llx_ltsp_template_desc").html());
                
                if($("#ltsp_template_desktop").attr("image_client_arch_32")=="true")
                    $("#llx_ltsp_new_image_arch").val("i386");
                else $("#llx_ltsp_new_image_arch").val("amd64");
                });
            
            }); // End FadeOut Callback
        
        
    });
}

ImageManager.prototype.DrawTemplateIntoAssistant=function DrawTemplateIntoAssistant(template){
    // NOT IN USE
    
    //var self=this;
    var templateDiv=$(document.createElement("div")).attr("templateFileName", template.meta_inf.name).addClass("llx_ltsp_template_div col-md-5");
    var img=$(document.createElement("div")).css("background-image", "url(modules/lliurex-ltsp/src/css/img/"+template.default.llx_img+")").addClass("llx_ltsp_template_img");
    var namedesc=$(document.createElement("div")).addClass("llx_ltsp_template_namedesc");
    var name=$(document.createElement("div")).html(template.default.llx_name).addClass("llx_ltsp_template_name");
    var desc=$(document.createElement("div")).html(template.default.llx_desc).addClass("llx_ltsp_template_desc");
    $(namedesc).append(name, desc);
    $(templateDiv).attr("image_client_name", template.default.llx_name);
    $(templateDiv).attr("image_client_desc", template.default.llx_desc);
    $(templateDiv).attr("image_client_arch", template.default.arch);
    $(templateDiv).append(img, namedesc);
    $("#llx-ltsp-assistant-image-templates").append(templateDiv);
    
    templateDiv.bind("click", function(){
        //alert($(this).attr("templateFileName"));
        $(".llx_ltsp_template_div").removeClass("llx_ltsp_template_div_selected");
        $(this).addClass("llx_ltsp_template_div_selected");
        
        // Show button as primary
        $("#llx-ltsp-goto-image-assistant-stage-2").addClass("btn-primary");
        
        //console.log($(this).attr("image_client_name"));
        $("#llx_ltsp_new_image_name").val($(this).attr("image_client_name"));
        $("#llx_ltsp_new_image_desc").val($(this).attr("image_client_desc"));
        $("#llx_ltsp_new_image_arch").val($(this).attr("image_client_arch"));
        });
};

ImageManager.prototype.confirmImageCreation=function confirmImageCreation(image_data){
    /*
    confirmImageCreation (image_data: JSON);
    Shows a confirm dialog to create a new image or cancel creation.
    */
    
    var self=this;
    
    // 1st, calculate id for image from the image_data.name:
    var id=image_data.name.replace(/([^a-z0-9]+)/gi, '');
    
    // 2nd check if exists id
    var credentials="";
    var n4dclass="LmdServer";
    var n4dmethod="check_chroot_exists";
    var arglist=[id];
  
    Utils.n4d(credentials, n4dclass, n4dmethod, arglist, function(response){
        if (!response["status"] && (image_data.name!="" && image_data.desc!="")) {
            //  if there is no image with this id, let's ask user for confirm
            var text=self._("We are going to create a new image client with these data: <br/><br/>");
            if (image_data.template==="") image_data.template="LliureX Minimal";
            text +="<table style='margin-left: 20px;'><tr><td><b>"+self._("lmd.id.chroot.folder")+"</b></td><td>  "+id+"<td></tr>"+
            "<tr><td><b>"+self._("lmd.image.assistant.Name.info")+"</b></td><td>"+image_data.name+"<td style='margin-left: 20px;'></tr>"+
            "<tr><td><b>"+self._("lmd.image.assistant.desc.info")+"</b></td><td>"+image_data.desc+"<td style='margin-left: 20px;'></tr>"+
            "<tr><td><b>"+self._("lmd.image.assistant.arch.info")+"</b></td><td>"+image_data.arch+"<td style='margin-left: 20px;'></tr>"+
            "<tr><td><b>"+self._("lmd.image.assistant.template.info")+"</b></td><td>"+image_data.template+"<td style='margin-left: 20px;'></tr></table>";
            
            
            bootbox.confirm(text, function(res){
                if (res) {
                    $("#llx-ltsp-new-image-assistant").fadeOut();
                    //alert("create image");
                    if(image_data.type == "mini"){
                        self.deployMinimalClient();                        
                    }
                    else if( image_data.type == "ISO"){
                        var iso_file = document.getElementById("llx_ltsp_new_image_iso");
                        var upload_form = new FormData();
                        upload_form.append('isofile',iso_file.files[0]);
                        Utils.crypt.setPublicKey(sessionStorage.serverKey);
                        upload_form.append('user',Utils.crypt.encrypt(sessionStorage.username));
                        upload_form.append('password',Utils.crypt.encrypt(sessionStorage.password));
                        var req = new XMLHttpRequest();
                        var timer;
                        var getUrl = window.location;
                        var baseUrl = getUrl .protocol + "//" + getUrl.host;
                        var pathname = getUrl.pathname.split('/');
                        for(var i=1; i<pathname.length; i++){
                            if(pathname[i].endsWith('php') || pathname[i] == "") break;
                            baseUrl = baseUrl + "/" + pathname[i];
                        }
                        req.open('POST',baseUrl+'/uploadiso.php');
                        req.upload.addEventListener("progress", self.progressUpload, false);
                        req.onreadystatechange = function(){
                            if(req.readyState == 2){
                                
                            }
                            else if(req.readyState == 4){
                                if(req.status == 200){
                                    var oRes = JSON.parse(req.response);
                                    if(oRes['result']){
                                        // Modify image_data info
                                        image_data['isopath'] = oRes['target'];
                                        image_data['env'] = 'VENDOR="ISO" ';
                                        self.createImageOnServer(id,image_data);
                                    }
                                    else{
                                        if (oRes.hasOwnProperty('Exception')){
                                            Utils.msg(self._("lmd.image.assisant.iso_message.n4derror"),MSG_ERROR);
                                        }
                                        else{
                                            Utils.msg(oRes['msg'],MSG_ERROR);
                                        }
                                    }
                                }
                                else{
                                    var dialog = document.querySelector("#uploadIsoDialog");
                                    if (dialog == null){
                                        Utils.msg("Error on upload url",MSG_ERROR);
                                    }
                                    else{
                                        Utils.msg(self._("lmd.image.assisant.iso_message.canceled"),MSG_INFO);
                                        $("#uploadIsoClose").click();
                                    }
                                }
                            }
                        }
                        req.send(upload_form);
                        self.progressDialog(req);
                    }
                    else { // Let's rock'n'roll
                        //console.log(image_data);
                        self.createImageOnServer(id, image_data);
                    }
                   }
                });
                    
            } else {
                bootbox.alert(self._("lmd.img.confirm.error"));
            }
    });
}


ImageManager.prototype.progressUpload = function progressUpload(event){
    var self = this;
    var percent = (event.loaded / event.total) * 100;
    $("#progressIsoUpload").css({'width': percent + '%'});
    if(percent == 100){$("#uploadIsoClose").click();}
}

ImageManager.prototype._=function _(text){
  return ( i18n.gettext("lliurex-ltsp", text));
}

ImageManager.prototype.createImageOnServer=function createImageOnServer(id, image_data){
    
    var credentials=[sessionStorage.username , sessionStorage.password];
    var n4dclass="LmdServer";
    var n4dmethod="create_imageWS";
    var arglist=[];
    arglist.push(id);
    arglist.push(image_data.name);
    arglist.push(image_data.template);
    arglist.push(image_data.desc);
    arglist.push("test.png"); // TO - DO!!!! està al div class llx_ltsp_template_img --> l'hereta del template...
    arglist.push(image_data.arch);
    if(image_data.hasOwnProperty('env')) arglist.push(image_data.env);
    if(image_data.hasOwnProperty('isopath')) arglist.push(' --isopath "' + image_data.isopath + '"');
    
    Utils.n4dWithLog(credentials, n4dclass, n4dmethod, arglist, null); // no callback is needed
    
		/*		url: 'https://'+sessionStorage.server+':9779',
				methodName: 'create_image',
				params: [[sessionStorage.username, sessionStorage.password], "LmdServer","", port, id, name, template, description, bgimg, sessionStorage.server],

    */
    
}

ImageManager.prototype.progressDialog = function progressDialog(req){
    var self = this;
    var modaldiv = $(document.createElement('div')).attr('id','uploadIsoDialog').addClass('modal');
    var modaldlg = $(document.createElement('div')).addClass('modal-dialog');
    var modalcnt = $(document.createElement('div')).addClass('modal-content');
    var modalbody = $(document.createElement('div')).addClass('modal-body');


    var modalProgressContainer = $(document.createElement('div')).addClass('progress-container progress progress-striped active').attr('id','progress-container').css({'height':'32px','background':'rgba(0,0,0,0)'});
    var progressBar = $(document.createElement('div')).attr('id','progressIsoUpload').addClass('progress-bar progress-bar-info').css({'width':'0%','height':'24px'});
    modalProgressContainer.append(progressBar);

    var modalfooter = $(document.createElement('div')).addClass('modal-footer');
    var bClose = $(document.createElement('button')).addClass('btn btn-primary').attr('id','uploadIsoClose').html(self._('lmd.close'));
    bClose.on('click',function(event){
        modaldiv.fadeOut(400,function(){modaldiv.remove()});
    });
    var bCancel = $(document.createElement('button')).addClass('btn btn-primary').attr('id','uploadIsoCancel').html(self._('lmd.cancel'));
    bCancel.on('click',function(event){
        req.abort();
    });
    modalfooter.append(bClose).append(bCancel);

    modalbody.append(modalProgressContainer);
    modalcnt.append(modalbody);
    modalcnt.append(modalfooter);
    modaldlg.append(modalcnt);
    modaldiv.append(modaldlg);


    $('body').prepend(modaldiv);
    $('.modal').hide();
    $(modaldiv).show();

}

ImageManager.prototype.deployMinimalClient=function deployMinimalClient(){
    //var self=this;
    try{            
        var credentials=[sessionStorage.username , sessionStorage.password];
        var n4dclass="LmdServer";
        var n4dmethod="deploy_minimal_clientWS";
        var arglist=[];
        //arglist.push("");
        //arglist.push(sessionStorage.server);
                
        
        //Utils.n4dWithLog(credentials, n4dclass, n4dmethod, arglist, function(response){});
        Utils.n4dWithLog(credentials, n4dclass, n4dmethod, arglist, null); // no callback is needed
        
        
        // Hide minimal image button
        $("#llx_ltsp_lliurex_minimal_image").hide();
        
	}catch (error){
		alert(error);
	   }
	};

ImageManager.prototype.bindEvents=function bindEvents(){
    var self=this;
    
    // Events Listeners for create new image UI
    $("#llx-ltsp-createImage-button").on("click", function (){
        // When clicks for create a new image
        self.newImageAssistant();
    });

    $("#llx_ltsp_lliurex_minimal_image").on("click", function(){
        // When selected to create a minimal image from dialog (other images are built in exec time)
        $(".llx_ltsp_template_div, #llx_ltsp_lliurex_from_iso").removeClass("llx_ltsp_template_div_selected");
        $(this).addClass("llx_ltsp_template_div_selected");
        // Show button as primary
        $("#llx-ltsp-goto-image-assistant-stage-2").addClass("btn-primary");
        
        //console.log($(this).attr("image_client_name"));
        $("#llx_ltsp_new_image_name").val($(this).attr("image_client_name"));
        $("#llx_ltsp_new_image_desc").val($(this).attr("image_client_desc"));
        
        
    });

    var isoicon = document.getElementById('isouploadicon');
    var isofileInput = document.getElementById('llx_ltsp_new_image_iso');
    var isolabel = document.getElementById('isouploadlabel');
    
    isofileInput.addEventListener('change', function(){
        var str = isofileInput.value;
        var i;
        if (str.lastIndexOf('\\')) {
          i = str.lastIndexOf('\\') + 1;
        } else if (str.lastIndexOf('/')) {
          i = str.lastIndexOf('/') + 1;
        }
        isolabel.innerHTML = str.slice(i, str.length);
    });



    $("#llx_ltsp_lliurex_from_iso").on("click", function(){
        $(".llx_ltsp_template_div, #llx_ltsp_lliurex_minimal_image").removeClass("llx_ltsp_template_div_selected");
        $(this).addClass("llx_ltsp_template_div_selected");
        $("#llx-ltsp-goto-image-assistant-stage-2").addClass("btn-primary");
        $("#llx_ltsp_new_image_name").val("");
        $("#llx_ltsp_new_image_desc").val("");
    });
        
    /* Dialog for create new images UI Evnet Handling */
    $("#llx-ltsp-goback-image-assistant-stage-1").on("click", function(){
          $("#llx-ltsp-image-assistant-stage-2").fadeOut(function(){
            $("#llx-ltsp-image-assistant-stage-1").fadeIn();
        });        
    });
    
    $("#llx-ltsp-goto-image-assistant-stage-2").on("click", function(){
        
        var available_type_images = ["ltsp_template_client", "ltsp_template_client_smart", "ltsp_template_infantil", "llx_ltsp_lliurex_minimal_image", "llx_ltsp_lliurex_from_iso", "ltsp_template_desktop"];
        
        var itemSelected=$(".llx_ltsp_template_div_selected");
        var id_image_selected = $(itemSelected).attr("id");

        /* Check template is supported */
        if( available_type_images.indexOf(id_image_selected) < 0 ) return -1;

        $("#llx_ltsp_new_image_assistant_arch_selector").hide();
        $("#llx_ltsp_new_image_assistant_iso_selector").hide();
        $("#warningisoassistant").hide();

        if ($(itemSelected).attr("image_client_name")==="LliureXMini") {
            // Hiding architecture
        }
        else if($(itemSelected).attr("image_client_name")==="LliureXISO"){
            $("#llx_ltsp_new_image_assistant_iso_selector").show();
            $("#warningisoassistant").show();
        }
        else {
            // Show architecture
            $("#llx_ltsp_new_image_assistant_arch_selector").show();
            
            // Set available archiectures
            var option;
            $("#llx_ltsp_new_image_arch").empty();
            if($(itemSelected).attr("image_client_arch_32")){
                option=$(document.createElement("option")).attr("value", "i386").html("i386");
                $("#llx_ltsp_new_image_arch").append(option);    
            }
            if($(itemSelected).attr("image_client_arch_64")){
                option=$(document.createElement("option")).attr("value", "amd64").html("amd64");
                $("#llx_ltsp_new_image_arch").append(option);    
            }
            
        }

        $("#llx-ltsp-image-assistant-stage-1").fadeOut(function(){
            $("#llx-ltsp-image-assistant-stage-2").fadeIn();
        });
    });
    
    $("#llx-ltsp-create-new-image").on("click", function(){

        /* Define types values */

        var list_templates = {
            "ltsp_template_client":{
                "i386":"lliurex-ltsp-client.conf",
                "amd64":"lliurex-ltsp-client-amd64.conf",
            },
            "ltsp_template_client_smart":{
                "i386":"lliurex-ltsp-client-smart.conf",
                "amd64":"lliurex-ltsp-client-smart-amd64.conf",
            },
            "ltsp_template_desktop":{
                "i386":"lliurex-ltsp-desktop.conf",
                "amd64":"lliurex-ltsp-desktop-amd64.conf",
            },
            "ltsp_template_infantil":{
                "i386":"lliurex-ltsp-infantil.conf",
                "amd64":"lliurex-ltsp-infantil-amd64.conf"
            },
            "llx_ltsp_lliurex_minimal_image":{
                "i386":"",
                "amd64":""
            },
            "llx_ltsp_lliurex_from_iso": "lliurex-from-iso.conf"
        };

        var type_image = {
            "llx_ltsp_lliurex_from_iso" : "ISO",
            "llx_ltsp_lliurex_minimal_image" : "mini",
        };

        // Check templates
        var id=$(".llx_ltsp_template_div_selected").attr("id");
        
        var image_name=$("#llx_ltsp_new_image_name").val();
        var image_desc=$("#llx_ltsp_new_image_desc").val();
        var arch=$("#llx_ltsp_new_image_arch").val();
        

        var template = "";
        var type = "generated";

        /* 
        Select template according to image selected and architecture . 
        If not exists template for options selected or it's not needed then template is void 
        */
        try{ template = list_templates[id][arch] ;} catch(err){};
        try{ type = type_image[id] ;} catch(err){};
        
        if (id == 'llx_ltsp_lliurex_from_iso')
            template = list_templates[id];
        // Setting image arch to description
        if(arch==="i386") image_desc+=" (32 bits)";
        else if (template!=="") image_desc+=" (64 bits)";
        else if (template==="") {
            image_desc+=" (32 bits)";
            arch="i386"; }
        
        
        var info_image = {"template": template,
                          "name": image_name,
                          "desc": image_desc,
                          "arch": arch,
                          "type": type
                        };

        self.confirmImageCreation(info_image);
        
    });
    
    $(".llx-ltsp-image-assistant-close").bind("click", function(){
        $("#llx-ltsp-new-image-assistant").fadeOut();
    });
    
    
    /* Event for component show */
    $("#ltsp_images").on("componentShown", function(e, args){
        if (self.timer===null) {
            self.timer=setInterval(function(){
                // check for new components in image list
                //console.log("check for new images...");
                //self.checkImageList();
                self.getImageList();
               
            //}, 5000); // Timer
            }, 20000); // less invassive for debugging
        }
    });
    
    $("#ltsp_images").on("componentHidden", function(e, args){
        clearInterval(self.timer);
        self.timer=null;
    });
    
}

ImageManager.prototype.getMirrorConfig=function getMirrorConfig(callback){
    var self=this;
    
    var credentials="";
    var n4dclass="LmdImageManager";
    var n4dmethod="check_mirror";
    var arglist=[];
    
    Utils.n4d(credentials, n4dclass, n4dmethod, arglist, function(response){
        
        self.mirrorReady=response.status;
        var archs=response.msg.llx16.ARCHITECTURES;
        
        for (i in archs){
           if (archs[i]==="amd64") self.mirror64bit=true;
           if (archs[i]==="i386") self.mirror32bit=true;
        }
        
        callback();
        
    });
}


ImageManager.prototype.init=function init(){
  var self=this;
  
  self.getImageList();
  
  self.checkMinimalImageIsInstalled();
  self.getMirrorConfig(function(){self.getAvailableTemplates();});
  self.bindEvents();
}
