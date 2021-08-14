

var ViewManager = function () {
	
	var xHash = 0; // used to calculate physical index
	var yHash = 0;
	
	var viewData = new Array( view_width * view_height ); //shifting each element
	var viewData_1 = new Array( view_width * view_height ); //without shifting
	
	for( var ind = 0; ind < view_width * view_height; ind++ ) {
		viewData[ind] = 0;
		viewData_1[ind] = 0;
	}
	
	
	this.getViewData = function () {
		return viewData;
	};
	
	this.isLoaded = function ( gridInd ) {
		return viewData[ this.calculateVeiwIndex( gridInd ) ];
	};
	
	this.initViewBase = function () {
		view_base = ((view_height - 1) / 2) * world_width + (view_width - 1) / 2
		view_base = world_gridInd - view_base;
		//view_base = world_gridInd - view_height - view_width * world_width;
	};
	
	function getIndX( indX ) {
		//vertual to physical mapping of view indX
		
		//console.log( "xHash:", xHash );
		var ind = indX + xHash;
		if( ind < 0 ) ind = view_width + ind;
		else ind = ind % view_width;
		return ind;
	}
	
	function getIndY( indY ) {
		//vertual to physical mapping of view indY
		
		// this return only index, to get exact ind do ind = ind * view_width
		var ind = indY + yHash;
		if( ind < 0 ) ind = view_height + ind;
		else ind = ind % view_height;
		return ind;
	}
	
	
	this.updateView = function ( gridInd, flag ) {
		//console.log( "view_base:", view_base, "gridInd:", gridInd ); //******
		viewData[ this.calculateVeiwIndex( gridInd ) ] = flag;
		
		
		var a = this.calculateVeiwIndex( gridInd );
		var x = a % view_width;
		var y = Math.floor( a / view_width );
		x = getIndX( x );
		y = getIndY( y );
		//console.log( "a:", a, "ind:", y * view_width + x ); //***************
		viewData_1[ y * view_width + x ] = flag;
		
	};
	
	this.calculateVeiwIndex = function ( gridInd ) {
		//gridInd to viewInd mapping
		//take gridInd and return viewInd
				
		var viewInd = gridInd - view_base;
		
		var x = Math.floor( viewInd / world_width );
		var y = ( viewInd % world_width );
		
		viewInd = x * view_width + y;
		
		return viewInd;
	};
	
	
	this.showViewData = function () {
		
		var ind = 0;
		var logStr = '';
		logStr += 'world_gridInd: ' + world_gridInd + '\n';
		logStr += 'viewBase: ' + view_base + '\n';
		
		logStr += 'viewData:       vD1_vertual:    vD1_physical:\n';
		
		for( var j = 0; j < view_height; j++ ) {
			
			for( var i = 0; i < view_width; i++ )
				logStr += viewData[ j * view_width + i ] + ' ';
			
			logStr += '  ';
			for( var i = 0; i < view_width; i++ ) {
				var ind1 = getIndY( j ) * view_width + getIndX( i ) ;
				//console.log( "ind1:", ind1 );
				var num = viewData_1[ ind1 ]
				logStr += num + ' ';
			}
			
			logStr += '  ';
			for( var i = 0; i < view_width; i++ ) {
				var ind1 = j * view_width + i ;
				//console.log( "ind1:", ind1 );
				var num = viewData_1[ ind1 ]
				logStr += num + ' ';
			}
			
			logStr += '\n';
		}
		
		console.log( logStr ); //********************************************
		
	};
	
	
	this.viewShift = function ( flagM, callback_viewShift ) {
		
		//#####################################################################
		// WITHOUT SHIFTING EACH ELEMENT
		//#####################################################################
		var num = 0; //Math.floor( Math.random() * 100 );
		var logStr1 = xHash + " " + yHash;
		
		if( flagM == 'right' ) {
		
			xHash += 1;
			xHash = Math.sign(xHash) * ( Math.abs(xHash) % view_width );
			var j = getIndX( view_width - 1 );
			//console.log( "clearX", j ); //***********************************
			for( ; j < view_width * view_height; j += view_width )
				viewData_1[ j ] = num;
			
		} else if( flagM == 'left' ) {
		
			xHash -= 1;
			xHash = Math.sign(xHash) * ( Math.abs(xHash) % view_width );
			var j = getIndX( 0 );
			//console.log( "clearX", j ); //***********************************
			for( ; j < view_width * view_height; j += view_width )
				viewData_1[ j ] = num;
			
		} else if( flagM == 'bottom' ) {
		
			yHash += 1;
			yHash = Math.sign(yHash) * ( Math.abs(yHash) % view_height );
			var j = getIndY( view_height - 1 ) * view_width;
			//console.log( "clearY", j ); //***********************************
			for( var i = 0; i < view_width; j++, i++ )
				viewData_1[ j ] = num;
			
		} else if( flagM == 'top' ) {
		
			yHash -= 1;
			yHash = Math.sign(yHash) * ( Math.abs(yHash) % view_height );
			var j = getIndY( 0 ) * view_width;
			//console.log( "clearY", j ); //***********************************
			for( var i = 0; i < view_width; j++, i++ )
				viewData_1[ j ] = num;
			
		}
		
		//logStr1 += " NEW:" + xHash + " " + yHash;
		//console.log( logStr1 ); //*******************************************
		
		//xFactor += xFactor_change;
		//xFactor = Math.abs(xFactor) % view_width;
		//#####################################################################
		
		
		
		
		//#####################################################################
		// SHIFTING EACH ELEMENT
		//#####################################################################
		if( flagM == 'right' ) {
		
			//shift data to left
			var j = 0;
			for( ; j < view_width * view_height - 1; j++ )
				viewData[ j ] = viewData[ j + 1 ];
			j = view_width;
			for( ; j < view_width * view_height + 1; j += view_width )
				viewData[ j-1 ] = 0;
			
		} else if( flagM == 'left' ) {
		
			//shift data to right
			var j = view_width * view_height - 1;
			for( ; j > 0 ; j-- )
				viewData[ j ] = viewData[ j - 1 ];
			j = 0;
			for( ; j < view_width * view_height; j += view_width )
				viewData[ j ] = 0;
			
		} else if( flagM == 'bottom' ) {
		
			//shift data to top
			var j = 0;
			for( ; j < view_width * ( view_height - 1 ); j++ )
				viewData[ j ] = viewData[ j + view_width ];
			for( ; j < view_width * view_height; j++ )
				viewData[ j ] = 0;
			
		} else if( flagM == 'top' ) {
		
			//shift data to bottom
			var j = view_width * view_height - 1;
			for( ; j >= view_width ; j-- )
				viewData[ j ] = viewData[ j - view_width ];
			for( ; j > 0; j-- )
				viewData[ j ] = 0;
			
		}
		//#####################################################################
		
		
		callback_viewShift();
		
	};
	
};

export { ViewManager };

