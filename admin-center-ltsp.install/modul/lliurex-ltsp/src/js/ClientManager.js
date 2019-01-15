
function LTSPClientManager(){
    // Class attributes
    this.clientList=[];   // Filenames for client images
    
    this.timer=null;
}


LTSPClientManager.prototype._=function _(text){
  return ( i18n.gettext("lliurex-ltsp", text));
}

LTSPClientManager.prototype.getClientProperties=function getClientProperties(client, callback){
    var self=this;
    
    var credentials="";
    var n4dclass="LmdClientManager";
    var n4dmethod="getClient";
    
    var cl=client+".json";
    var arglist=[];
    arglist.push(cl);
    console.log("CALLING N4d WITH: "+cl);
    
    Utils.n4d(credentials, n4dclass, n4dmethod, arglist, function(response){
        var ret;
        //var status="unconfigured";
        console.log(response);
        if (typeof(response)=="string") ret=JSON.parse(response);
        else ret=response;
        
        //if(ret.mac) status="configured";

        callback(ret); // Perform callback    
        
    },0);
};

LTSPClientManager.prototype.createClient=function createClient(client, callback){
    
    var self=this;

    //return ("<div>"+client.ip+"->"+client.mac+"</div>");
    
    var clientId=client.mac.split(":").join("");
    
    self.getClientProperties(clientId, function(clientProperties){
        
        if (clientProperties.mac) type="configured";
        else type="unconfigured";
        
        var ret="<div class='ltsp-clienticonContainer col-md-6' id='ltsp_client_"+clientId+"'  type='"+type+"'>";
        ret+="<i class='material-icons ltsp-clienticon noselect md-128 "+type+"' type='"+type+"'>computer</i>";
        ret+="<div class='ltsp-clienttext'>"+client.mac+"<br/>"+client.ip+"</div></div>";
        
        callback(ret, clientId);
    
        });
}

LTSPClientManager.prototype.getClientList=function getClientList(){
    var self=this;
    
    var credentials="";
    var n4dclass="LmdClientManager";
    var n4dmethod="getArpTable";
    
    var arglist=[];
    
    Utils.n4d(credentials, n4dclass, n4dmethod, arglist, function(response){
        var arplength=response.length;
        
        for (i in response){
            //alert(response[i]['mac']);
            //alert(response[i]['ip']);
            self.createClient(response[i], function(client, clientId){
                // Add client if not exists...
    
                if ($("#ltsp_client_"+clientId).length===0) {
                                        
                    $("#noClientsFound").remove(); // Delete message "No clients found"
                    if ($(client).attr("type")=="configured") $("#ltsp-clients").prepend(client);
                    else $("#ltsp-clients").append(client);
                }
                
                
                
            });
        if (($(".ltsp-clienticonContainer").length)==arplength) self.drawDisconnectedClients();
        //self.drawDisconnectedClients();
        
        }
        
        if (response=="") self.drawDisconnectedClients();
        
        
        
        
        
        
    },0);
}

LTSPClientManager.prototype.macformatter=function macFormatter(mac){
    return mac[0]+mac[1]+":"+mac[2]+mac[3]+":"+mac[4]+mac[5]+":"+mac[6]+mac[7]+":"+mac[8]+mac[9]+":"+mac[10]+mac[11];
}

LTSPClientManager.prototype.drawDisconnectedClients=function drawDisconnectedClients(){
    var self=this;
    
    var credentials="";
    var n4dclass="LmdClientManager";
    var n4dmethod="getClientList";
    
    var arglist=[];
    Utils.n4d(credentials, n4dclass, n4dmethod, arglist, function(response){
        var disconnected_clients=JSON.parse(response);
        
        if ((disconnected_clients.length)>0){
            for (clientindex in disconnected_clients){
                
                //alert("#ltsp_client_"+(disconnected_clients[clientindex]).replace(".json",""));
                var mac=(disconnected_clients[clientindex]).replace(".json","");
                var clientId="ltsp_client_"+mac;
                
                if ($("#"+clientId).length===0)  {
                    var item="<div class='ltsp-clienticonContainer col-md-6' id='"+clientId+"'  type='configured'>";
                    item+="<i class='material-icons ltsp-clienticon noselect md-128 disconnected'>computer</i>";
                    item+="<div class='ltsp-clienttext'>"+self.macformatter(mac)+"<br/>Disconnected</div></div>";
                    
                    $("#noClientsFound").remove(); // Delete message "No clients found"
                    $("#ltsp-clients").append(item);
                    
                    
                    
                } // end if
                self.bindEvents(); // Binding events after draw all disconnected items
            } // end for
            
                
            //alert(disconnected_clients[clientindex]);
        } // end if
        else {self.bindEvents();} // Binding events if there are no items disconnected to draw
        
    },0);
    
}

LTSPClientManager.prototype.deleteClientConfig=function deleteClientConfig(id){
    var self=this;
    var client=id.replace("ltsp_client_","");
    
    var credentials=[sessionStorage.username , sessionStorage.password];
    var n4dclass="LmdClientManager";
    var n4dmethod="deleteClient";
    var arglist=[client];
    
    // establir la mac (id) en format mac i fer el setClientConfig igual...
    
    
    Utils.n4d(credentials, n4dclass, n4dmethod, arglist, function(response){
        self.regenerateLtsConf(function(){
            var mac=self.macformatter(client);
            var credentials=[sessionStorage.username , sessionStorage.password];
            var n4dclass="LlxBootManager";
            var n4dmethod="setClientConfig";
            var arglist=[mac];

            Utils.n4d(credentials, n4dclass, n4dmethod, arglist, function(response){
                    // Remove client config for ui
                    $("#"+id).find("i").removeClass("configured");
                    $("#"+id).find("i").addClass("unconfigured");
                    $("#"+id).attr("type","unconfigured");
                    $("#"+id).find("i").attr("type","unconfigured");
                    
                    if($("#"+id).find("i").hasClass("disconnected")) $("#"+id).remove();
                    
                    message=(self._("llx.ltspclientmanager.client.deleted"));
                    Utils.msg(message, MSG_SUCCESS);
            },0);
            
        }); 
        
        
        
    },0);
    
    
    
};

LTSPClientManager.prototype.showClientDialog=function showClientDialog(id, configured){
    //var client=id.replace("ltsp_client_","")+".json";
    var client=id.replace("ltsp_client_","");
    var self=this;
    
    /*var credentials="";
    var n4dclass="LmdClientManager";
    var n4dmethod="getClient";
    
    var arglist=[];
    arglist.push(client);*/
    
    
    self.getClientProperties(client, function(clientProperties){
         var content="";
         
         var autologin="";
         if ((clientProperties.autologin)&&(clientProperties.autologin).toLowerCase()=="true") autologin="checked";
         
         var username=clientProperties.user || "";
         var pass=clientProperties.pass || "";
         
         var forceThinClient="";
         if ((clientProperties.forceThin)&&(clientProperties.forceThin).toLowerCase()=="true") forceThinClient="checked";
         
         var extraOptions=clientProperties.extraOptions || "";
         
         var default_boot=clientProperties.defaultBoot || "default";
         
        
        content+=Utils.formFactory.createCheckbox({"id":"ltsp_client_use_autologin",
                                                "label":self._("ltsp_client_use_autologin"),
                                                "default":autologin,
                                                "help":self._("ltsp_client_use_autologin")});
        
        content+=Utils.formFactory.createText({"id":"ltsp_client_autologin_name",
                                        "label": self._("ltsp_client_autologin_name"),
                                        "help":self._("ltsp_client_autologin_name"),
                                        "value":username});
        
        
        content+=Utils.formFactory.createText({"id":"ltsp_client_autologin_pass",
                                        "label": self._("ltsp_client_autologin_pass"),
                                        "help":self._("ltsp_client_autologin_pass"),
                                        "value":pass});
        
        content+=Utils.formFactory.createCheckbox({"id":"ltsp_client_force_thin",
                                                "label":self._("ltsp_client_force_thin"),
                                                "default":forceThinClient,
                                                "help":self._("ltsp_client_force_thin")});
        
        content+=Utils.formFactory.createTextArea({"id":"ltsp_client_extra_opts_per_mac",
                                        "label": self._("ltsp_client_extra_opts_per_mac"),
                                        "help": self._("ltsp_client_extra_opts_per_mac"),
                                        "value":extraOptions});
        
         
         
         var ButtonList={
                "Apply":{
                    label:self._("lmd_client_options_dialog.apply"),
                    className: "btn-success btn-raised",
                    callback: function (){
                        var ltsp_client_use_autologin=$("#ltsp_client_use_autologin").is(":checked");
                        var ltsp_client_autologin_name=$("#ltsp_client_autologin_name").val();
                        var ltsp_client_autologin_pass=$("#ltsp_client_autologin_pass").val();
                        var ltsp_client_force_thin=$("#ltsp_client_force_thin").is(":checked");
                        var ltsp_client_extra_opts_per_mac=$("#ltsp_client_extra_opts_per_mac").val();
                        var ltsp_client_default_boot=$("#ltsp_client_default_boot").val();
                        
                        /*console.log(ltsp_client_use_autologin);
                        console.log(ltsp_client_autologin_name);
                        console.log(ltsp_client_autologin_pass);*/
                        
                        // Set up Client Options
                        var clientOptions={"mac":self.macformatter(client), "defaultBoot":ltsp_client_default_boot,
                                            "forceThin":ltsp_client_force_thin.toString(),
                                           "extraOptions":ltsp_client_extra_opts_per_mac};
                                           
                        // Check autologin, user and password
                        
                        if (ltsp_client_use_autologin && ((ltsp_client_autologin_name=="")||(ltsp_client_autologin_pass==""))){
                            //$("[controlid="+ltsp_client_autologin_name+"]").addClass("has-error");
                            if ((ltsp_client_autologin_name=="")) $('[controlid=ltsp_client_autologin_name]').addClass("has-error");
                            if ((ltsp_client_autologin_pass=="")) $('[controlid=ltsp_client_autologin_pass]').addClass("has-error");
                            return false;
                        }
                        
                        // If autologin is in use, adds autologin, password and user                        
                        clientOptions.user=ltsp_client_autologin_name;
                        clientOptions.pass=ltsp_client_autologin_pass;
                        clientOptions.autologin=ltsp_client_use_autologin.toString();
                        
                        // Create options string
                        json_client_options=JSON.stringify(clientOptions);
                        
                        // Perform n4d call to save client configuration
                        var credentials=[sessionStorage.username , sessionStorage.password];
                        var n4dclass="LmdClientManager";
                        var n4dmethod="setClient";
                        //var arglist=[client, clientOptions];
                        
                        var arglist=[client,json_client_options];
                        
                        Utils.n4d(credentials, n4dclass, n4dmethod, arglist, function(response){
                            self.regenerateLtsConf(function(){
                                self.generateBootForClient(clientOptions);
                                }); // after regenerate, it will set boot for client
                        },0);
                        
            
                      }
                    },
                cancel:{
                label:self._("lmd.cancel"),
                //label:"cancel",
               className: "btn-cancel btn-raised" }
            };
            
            
        
        // Add delete button
        if (configured=="configured")
            ButtonList.deleteButton={
                label:self._("lmd.delete"),
                //label:"cancel",
               className: "btn-danger btn-raised",
               callback: function (){
                self.deleteClientConfig(id);
                }};
         
         
        // Get boot list
        
        self.getBootList(function(bootList){ // callback to continue
            try{
                content+=Utils.formFactory.createSelect({"id":"ltsp_client_default_boot",
                                   "help":self._("ltsp_client_default_boot"),
                                   "label":self._("ltsp_client_default_boot"),
                                   "default":default_boot,
                                   "options":bootList });
                
                var dialog=bootbox.dialog({
                message: content,
                title: "Client",
                buttons:ButtonList});
    
                 
                 console.log(dialog);
                 
            $.material.init();
            dialog.modal("show");
            
            }catch(e){
                console.log(e);
            };   
            
        }); // end callback for getbootlist
    
          
            
     }); // end callback for getclientconfig
        
    
}
LTSPClientManager.prototype.generateBootForClient=function generateBootForClient(client){
    
    // Boot: client.mac, client.defaultBoot.replace("ltsp_label", "")
    
    var credentials=[sessionStorage.username , sessionStorage.password];
    var n4dclass="LlxBootManager";
    var n4dmethod="setClientConfig";
    var arglist=[client.mac];
    if (client.defaultBoot!="default") arglist.push(client.defaultBoot.replace("ltsp_label",""));

    Utils.n4d(credentials, n4dclass, n4dmethod, arglist, function(response){
        var id="#ltsp_client_"+(client.mac.replace(/:/g,""));
        //alert(id);
        $(id).find("i").removeClass("unconfigured");
        //alert($(id).find("i"));
        $(id).find("i").addClass("configured");
        $(id).attr("type","configured");
        $(id).find("i").attr("type","configured");
        
        message=(self._("llx.ltspclientmanager.client.saved"));
        Utils.msg(message, MSG_SUCCESS);
        
    },0);
    
}


LTSPClientManager.prototype.regenerateLtsConf=function regenerateLtsConf(callback){
    var self=this;
    
    // Perform n4d call to save client configuration in lts.conf file
    var credentials=[sessionStorage.username , sessionStorage.password];
    var n4dclass="LmdBootManager";
    var n4dmethod="setLtsClientsConf";
    
    var arglist=[];
      
    Utils.n4d(credentials, n4dclass, n4dmethod, arglist, function(response){
        //console.log(response);
        //alert(response);
        callback();        
    },0);
};




LTSPClientManager.prototype.getBootList=function getBootList(callback){
    
    var self=this;
    var bootlist=[];
    bootlist.push({"value":"default", "label":self._("ltsp_client_boot_default")});
    
    
     $.get("http://"+sessionStorage.server+"/ipxeboot/getmenujson.php", function(data){
        var response=JSON.parse(data);
        
        for (i in response) {
            if (response[i].id.indexOf("ltsp_")===0){
                menu_text=response[i].label.replace("menu label ", "");
                bootlist.push({"value":response[i].id, "label":menu_text});
            }
        }
        callback(bootlist); // Perform callback    
        
    });
    
}


LTSPClientManager.prototype.getBootListOld=function getBootListOld(callback){
    
    var self=this;
    var bootlist=[];
    bootlist.push({"value":"default", "label":self._("ltsp_client_boot_default")});
    
    var credentials="";
    var n4dclass="LlxBootManager";
    var n4dmethod="getBootList";    
    var arglist=[];

    Utils.n4d(credentials, n4dclass, n4dmethod, arglist, function(response){
        console.log(response);
        for (i in response) {
            if (response[i].id.indexOf("ltsp_")===0){
                menu_text=response[i].label.replace("menu label ", "");
                bootlist.push({"value":response[i].id, "label":menu_text});
            }
            //console.log(response[i])
            //{"value":"es", "label":self._("option2...")},
        }
        callback(bootlist); // Perform callback    
        
    },0);
    
}


LTSPClientManager.prototype.bindEvents=function bindEvents(){
    self=this;
    $(".ltsp-clienticonContainer").off("click");
    $(".ltsp-clienticonContainer").on("click", function(event){
        if ($("body").css("cursor")=="wait") return -1; // avoid double click
        event.stopPropagation();
        var id=$(event.currentTarget).attr("id");
        var configured=$(event.currentTarget).attr("type");
        self.showClientDialog(id,configured);
        });    
}



LTSPClientManager.prototype.init=function init(){
  var self=this;
  self.getClientList();
  //self.bindEvents();
  $("#ltsp-client-management").on("componentShown", function(e, args){
            self.getClientList();
            self.bindEvents();
    });
  
  
}
