


function LlxBootManager(){
   self=this;
}

// Methods

LlxBootManager.prototype.bind_ui = function bind_ui(){
	 // Nothing to do.
}
 
LlxBootManager.prototype.showMe = function showMe(){
	$("#tab_bootmanager").empty();
	$("#tab_bootmanager").attr("src", "llx-bootmanager-gui/main.html");	
}
