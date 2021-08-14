
var ViewTracker = function () {

	this.initViewTracker = function () {

		var gridStr = this.createViewTracker();
		$("#viewTrackerArea").html( gridStr );
		
	};
	
	
	this.updateViewTracker = function ( view_data ) {
		
		// clear grid
		for( var i = 0; i < world_width * world_height; i++ ) {
			
			$("#view_" + i).html( null );
			$("#viewVal_" + i).html( null );
			
		}
		
		// updating view
		var ind = 0;
		for( var y = view_base; y < view_base + view_height * world_width; y += world_width ) {
			
			for( var x = y; x < y + view_width; x++ ) {
				
				$("#view_" + x).html( ind );
				$("#viewVal_" + x).html( view_data[ ind ] );
				ind += 1;
				
			}
			
		}
		
	};
	
	
	this.highlightViewTracker = function ( gridInd ) {

		$("#grid_" + gridInd).css( "background", "#ccc" );
		$("#gridVal_" + gridInd).css( "background", "#ccc" );
		$("#view_" + gridInd).css( "background", "#ccc" );
		$("#viewVal_" + gridInd).css( "background", "#ccc" );

	};
	
	
	this.createViewTracker = function () {

		var gridStr = 'View Tracker : ';
		gridStr += '<table id="gridTable">';
		
		for( var y = 0; y < world_height; y++ ) {
		
			gridStr += '<tr>';
			
			for( var x = 0; x < world_width; x++ ) {
				gridStr += '<td id="grid_' + eval(y * world_width + x) + '" class="grid" >';
				gridStr += y * world_width + x;
				gridStr += '</td>';
				
				gridStr += '<td id="view_' + eval(y * world_width + x) + '" class="view" >';
				gridStr += '';
				gridStr += '</td>';
			}
			
			gridStr += '</tr>';
			
			gridStr += '<tr>';
			
			for( var x = 0; x < world_width; x++ ) {
				gridStr += '<td id="gridVal_' + eval(y * world_width + x) + '" class="gridVal" >';
				gridStr += '';
				gridStr += '</td>';
				
				gridStr += '<td id="viewVal_' + eval(y * world_width + x) + '" class="viewVal" >';
				gridStr += '';
				gridStr += '</td>';
			}
			
			gridStr += '</tr>';
			
		}
		
		gridStr += '</table>';
		
		return gridStr;

	};
	
};

export { ViewTracker };


