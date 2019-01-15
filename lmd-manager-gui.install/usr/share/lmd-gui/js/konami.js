$(document).ready(function(){
	var keys 	= [];
	//var konami  = '38,38,40,40,37,39,37,39,66,65';
	var konami  = '37,39,37,39';
	var konami2  = '38,40,38,40';
	var konami3  = '38,38,38,38';
	
	$(document)
		.keydown(
			function(e) {
				keys.push( e.keyCode );
				if ( keys.toString().indexOf( konami ) >= 0 ){
					require('nw.gui').Window.get().showDevTools();
					keys = [];
				}
				
				if ( keys.toString().indexOf( konami2 ) >= 0 ){
					require('nw.gui').Window.get().reload();
					keys = [];
				}
				
	/*			if ( keys.toString().indexOf( konami3 ) >= 0 ){
					alert("3");
					console.log($(".twitter-typeahead"));
					keys = [];
				}
				*/
				
			}
		);
});
