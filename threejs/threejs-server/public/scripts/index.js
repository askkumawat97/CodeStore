

$( document ).ready( function() {
	
	$("#createScene").click( function() {
		
		console.log( "createScene clicked" );
		
		var url = "/createScene";
		var data = { "state": 1 };
		$.post( url, data, function( result ) {
			console.log( result );
		});
		
	});
	
	$("#getScene").click( function() {
		
		console.log( "getScene clicked" );
		
		var url = "/getScene";
		var data = { "state": 1 };
		$.post( url, data, function( result ) {
			console.log( result );
		});
		
	});
			
});
