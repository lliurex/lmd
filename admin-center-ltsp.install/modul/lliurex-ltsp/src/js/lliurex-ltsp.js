function LliureXLTSP(){
    // Class attributes
    this.imageManager=null;
    
    this.Llx_ltsconf_LI=null;  // LTS.conf options
    
    this.ExportedManager=null;
    
    
    
}

LliureXLTSP.prototype.init=function init(){
    var self=this;
    self.imageManager=new ImageManager();
    self.imageManager.init();
        
    // LTS.conf options
    self.Llx_ltsconf_LI=new Llx_ltsconf();
    self.Llx_ltsconf_LI.bindEvents();
    
    // Exported Manager
    self.ExportedManager=new LTSPExportedManager();
    self.ExportedManager.init();
    
    // Clients Manager
    self.ClientManager=new LTSPClientManager();
    self.ClientManager.init();

}

LliureXLTSP.prototype.bindEvents=function bindEvents(){
  var self=this;

  // Module Loaded: Triggered when a module is fully loaded (html and scripts)
  $(document).on("moduleLoaded", function(e, args){
    var moduleName="lliurex-ltsp";
    if(args["moduleName"]===moduleName)
      self.init();
  });
  
   $("#bttest").on("click", function(event){
    //var text=Utils.showMarkDown.makeHtml("#hello, markdown!");
    //alert(text);
    event.stopPropagation();
    var helpname=$(event.currentTarget).attr("help");
    var location=window.location.toString();
    var helpfile = location.substring(0,location.length-8)+"modules/lliurex-ltsp/src/help/"+helpname;
    Utils.showHelp(helpfile);
    
    });

  // componentShown: Triggered when a module component is clicked
  /* EXAMPLE: $("#lliurex-guard").on("componentClicked", function(e, args){
    // Refresh status
    self.getStatus();
  });*/
}


var LtspManager=new LliureXLTSP();
LtspManager.bindEvents();
