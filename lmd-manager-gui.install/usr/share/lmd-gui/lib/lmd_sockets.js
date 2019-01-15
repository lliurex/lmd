// node.js libs
var dgram = require('dgram');
var sendport=-1; // NEW

function lmd_sockets(){
	
	self=this;
	self.server=null;
	
	this.CreateSocket=function CreateSocket(div_to_append){
		//alert("CREATING SOCKET: appending div: "+div_to_append+" with id: "+div_to_append.attr('id'));
		var server = dgram.createSocket("udp4");
		self.server=server;
		
		
		/*
		 *just a trying to show "." when working
		self.interval=setInterval(function() {
          div_to_append.append("<span class='tty'>.</span>");
		}, 2000);
		
		self.StopInterval=function StopInterval(){
			alert("");
			 clearInterval(self.interval);
		}
		*/
		
		server.on("error", function (err) {
			server.close();
			});
	
		server.on("message", function (msg, rinfo) {
			sendport=rinfo.port; // NEW
			
			len=div_to_append.children().length;
			while (len>200) { // Max Length for output
				div_to_append.find('div:first-child').remove();
				len=div_to_append.children().length;
				}
			//div_to_append.append("<div class='tty'><b>("+sendport+")</b> "+msg+"<div>");
			div_to_append.append("<div class='tty'><b>("+sendport+")</b> "+msg+"<span class='progress'></span></div>").trigger('appendedToLog', '');
					
					
			$(function() {
				var wtf    = $(div_to_append);
				var height = wtf[0].scrollHeight;
				wtf.scrollTop(height);
			});
			
			
			
		});
		
		
		
		
		//server.bind(port);
		//server.bind(('', port)); /**** orig /
		
		//server.bind();
		//port=server.address().port;
		
		return server;
	
		
		//port=server.address().port;
		//address=server.address().address;
		//alert(address+":"+port)
		//return server;
		
	}
	this.RemoveSocket=function RemoveSocket(){
			alert(5);
			self.server.close();
			
		}
} // End class lmd_sockets