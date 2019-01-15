
function LTSPExportedManager(){    
    this.timer=null;
}




LTSPExportedManager.prototype.createExportedItem=function createExportedItem(content){
    var self=this;
 //return $(document.createElement("div")).html(content);
 
 
    var img=$(document.createElement("img")).addClass("lmdImgIcom").attr("src", "modules/lliurex-ltsp/src/css/img/generic.png");
    var exportedname=$(document.createElement("div")).addClass("lmdImgText").html(content);
    var item=$(document.createElement("div")).addClass("lmdimgContainer").attr("rsc", content);
    var buttonrow=$(document.createElement("div")).addClass("ButtonRow");
    
    //html("<i class='material-icons' style='vertical-align:middle;'>edit</i>&nbsp;Options"
    
    var icon=$(document.createElement("i")).addClass("material-icons md-10").css("vertical-align", "middle").html("content_copy");
    var icondownload=$(document.createElement("i")).addClass("material-icons md-10").css("vertical-align", "middle").html("file_download");

    // Download Button
    var text=$(document.createElement("span")).addClass("BtnMini").html(self._("ltsp.exporter.download"));
    var downloadButton=$(document.createElement("button")).addClass("btn btn-primary btn-xs BtnDownload").attr("rsc", content);
    $(downloadButton).append([icondownload,text]);

    // Import Button
    var importButton=$(document.createElement("button")).addClass("btn btn-primary btn-xs BtnDownload").attr("rsc", content);
    var textimport=$(document.createElement("span")).addClass("BtnMini").html(self._("ltsp.exporter.import"));
    $(importButton).append([icon,textimport]);

    $(buttonrow).append(downloadButton, importButton);
    
    $(item).append([img, exportedname,buttonrow]);
    
    $(downloadButton).bind("click", function(event){
            event.stopPropagation();
            var filename=$(event.currentTarget).attr("rsc");
            window.location.href = "http://server/exported/"+filename; // Descarreg
        })

       $(importButton).bind("click", function(event){
            event.stopPropagation();
            var filename=$(event.currentTarget).attr("rsc");
            self.importExportedImage(filename);
        })


    
    return item;
    
    
};

LTSPExportedManager.prototype.importExportedImage=function importExportedImage(filename){
    var self=this;
    
    // Ask for confirm
    var lmd_import_content=self._("ltsp.exporter.ask.confirm.import");
            
    var confirm=bootbox.confirm(lmd_import_content, function(res){
        if (res){
        
            var id=filename.substring(0,filename.length-7);
            
            var credentials=[sessionStorage.username , sessionStorage.password];
            var n4dclass="LlxBootManager";
            var n4dmethod="pushToBootList";
            var arglist=["ltsp_label"+id];
            Utils.n4d(credentials, n4dclass, n4dmethod, arglist, function(response){
                var credentials=[sessionStorage.username , sessionStorage.password];
                var n4dclass="LmdServer";
                var n4dmethod="ImportImageWS";
                var arglist=[filename];
                //arglist.push(id);
                Utils.n4dWithLog(credentials, n4dclass, n4dmethod, arglist, function(){}); // no callback is needed                                    
                                                
             },0);
                
        }
        })
    confirm.modal("show");
}

LTSPExportedManager.prototype.getExportedList=function getExportedList(){
    var self=this;
      var credentials="";
    var n4dclass="LmdServer";
    var n4dmethod="getExportedList";
    var arglist=[];
    
    Utils.n4d(credentials, n4dclass, n4dmethod, arglist, function(response){
        console.log(response.status+" "+response.response);
        $("#Llx_ltsp_images_exported").empty();
        if ((response.status)&&(response.msg)){
            console.log(response.msg);
            for (var i in response.msg){
                var item=self.createExportedItem(response.msg[i]);
                $("#Llx_ltsp_images_exported").append(item);
            }
            
        } else alert(response.msg);
        
        },0);
    
}

LTSPExportedManager.prototype.bindEvents=function bindEvents(){
    var self=this;
    
    /* Event for component show */
    $("#llx-exported").on("componentShown", function(e, args){
        if (self.timer===null) {
            self.timer=setInterval(function(){
                self.getExportedList();
               
            //}, 5000); // Timer
            }, 1000000); // less invassive for debugging
        }
    });
    
    $("#llx-exported").on("componentHidden", function(e, args){
        clearInterval(self.timer);
        self.timer=null;
    });
    
}



LTSPExportedManager.prototype._=function _(text){
  return ( i18n.gettext("lliurex-ltsp", text));
}

LTSPExportedManager.prototype.init=function init(){
  var self=this;
  self.getExportedList();
  self.bindEvents();
}
