

var AssetRemover = function ( gltfLoader, scene_main, viewManager ) {

	var gltfLoader = gltfLoader;
	var scene_main = scene_main;
	var viewManager = viewManager;
	
	this.clearGrids = function ( removableAssets, shiftBy ) {
		
		var ind;
		//console.log( "removableAssets:", removableAssets );
		
		this.removeTerrain( removableAssets[ 0 ] );
		
		for( var i = 1; i < removableAssets.length; i += 2 ) {
			ind = removableAssets[ 0 ] + removableAssets[ i ] * shiftBy;
			this.removeTerrain( ind );
			ind = removableAssets[ 0 ] + removableAssets[ i + 1 ] * shiftBy;
			this.removeTerrain( ind );
		}
		
	};
	
	this.removeTerrain = function ( objName ) {
		/*
		scene_main.traverse( function( child ) {
			console.log( "child:", child );
			if ( child.name === objName ) {
				scene_main.remove( child );
			}
		});
		*/
		
		var selectedObject = scene_main.getObjectByName( objName );
		while( selectedObject ) {
			//console.log( "asset remove:", objName );
			scene_main.remove( selectedObject );
			selectedObject = scene_main.getObjectByName( objName );
		}
		
	};

};

export { AssetRemover };

