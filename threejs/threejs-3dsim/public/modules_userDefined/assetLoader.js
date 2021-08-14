

var AssetLoader = function ( gltfLoader, scene_main, viewManager ) {

	var gltfLoader = gltfLoader;
	var scene_main = scene_main;
	var viewManager = viewManager;
	
	this.initAssets = function ( scene_main ) {
		
		//!viewManager.isLoaded() //initially nothing loaded, so no need to check
		
		var gridInd = [];
		
		var temp1 = gridIndY;
		
		var temp2 = gridIndX - 1;
		var temp3 = gridIndX + 1;
		
		gridInd.push( temp1 * world_width + gridIndX );
		if( temp2 >= 0 ) gridInd.push( temp1 * world_width + temp2 );
		if( temp3 < world_width ) gridInd.push( temp1 * world_width + temp3 );
		
		temp1 = gridIndY - 1;
		if( temp1 >= 0 ) {
			gridInd.push( temp1 * world_width + gridIndX );
			if( temp2 >= 0 ) gridInd.push( temp1 * world_width + temp2 );
			if( temp3 < world_width ) gridInd.push( temp1 * world_width + temp3 );
		}
		
		temp1 = gridIndY + 1;
		if( temp3 < world_height ) {
			gridInd.push( temp1 * world_width + gridIndX );
			if( temp2 >= 0 ) gridInd.push( temp1 * world_width + temp2 );
			if( temp3 < world_width ) gridInd.push( temp1 * world_width + temp3 );
		}
		
		//console.log("gridInd: ", gridInd); //********************************
		this.loadAssets( scene_main, gridInd );
		
	};
	
	this.parseGrids = function ( scene_main ) {
		/*
		var gridInd = [];
		
		var grid1 = next_gridInd;
		var grid2 = next_gridInd - gridNeighbour;
		var grid3 = next_gridInd + gridNeighbour;
		
		if( grid1 >= 0 && !viewManager.isLoaded( grid1 ) ) {
			gridInd.push( grid1 );
			viewManager.updateView( grid1, 1 );
		}
		
		if( grid2 >= 0 && !viewManager.isLoaded( grid2 ) ) {
			gridInd.push( grid2 );
			viewManager.updateView( grid2, 1 );
		}
		
		if( grid3 >= 0 && !viewManager.isLoaded( grid3 ) ) {
			gridInd.push( grid3 );
			viewManager.updateView( grid3, 1 );
		}
		
		console.log("gridInd: ", gridInd);
		*/
		
	};
	
	this.loadAssets = function ( scene_main, gridInd ) {
		
		var result = { path: '', assetFileName: 'terrain.glb', name: '', coordX: 0, coordY: 0 };
		
		for( var i = 0; i < gridInd.length; i++ ) {
			
			viewManager.updateView( gridInd[i], 1 );
			
			result.assetPath = 'assets/terrains/level0/terrain0/';
			//result.assetPath = 'assets/terrains/level0/terrain' + gridInd[i] + '/';
			result.name = gridInd[i];
			result.coordX = ( gridInd[i] % world_width ) * world_gridSize;
			result.coordY = Math.floor( gridInd[i] / world_width ) * world_gridSize;
			//console.log("X:", result.coordX, "Y:", result.coordY);
			
			setAsset( result, 1 /*scaleFactor*/ );
			
			this.getArchitects( gridInd[i], 0.5 /*scaleFactor*/ );
		}	
		
	};
	
	
	this.getArchitects = function ( world_gridInd, scaleFactor ) {
		var url = "/getArchitects";
		var data = {"world_gridInd": world_gridInd };
		
		$.post( url, data, function( result ) {
			Object.keys( result).forEach( function( key ) {
				// SET ARCHITECT NAME AS world_gridInd, USED TO REMOVE OBJECT
				result[key]['name'] = world_gridInd;
				setAsset( result[key], scaleFactor );
			});
		});
	};
	
	
	function setAsset( result, scaleFactor ) {
		
		//console.log( 'ajax call : ' + JSON.stringify(result) );
		
		var url_asset = result.assetPath + result.assetFileName;
		var assetName = result.name;
		//console.log( "asset add:", assetName );
		var assetCoordX = result.coordX;
		var assetCoordY = result.coordY;
		
		gltfLoader.load(
			url_asset,
			function ( gltf ) {
				
				var mesh;
				
				gltf.scene.traverse( function (child) {
					//console.log(child.name);
					if (child.isMesh) {
						child.name = assetName;
						child.position.x = assetCoordX;
						child.position.z = assetCoordY;
						child.scale.set(child.scale.x*scaleFactor, child.scale.y*scaleFactor, child.scale.z*scaleFactor);
						mesh = child;
					}
				});

				//scene_main.add( gltf.scene );
				scene_main.add( mesh );
				
			},
			undefined,
			function (error) {
				console.error(error);
			}
		);
		
	}


};

export { AssetLoader };

