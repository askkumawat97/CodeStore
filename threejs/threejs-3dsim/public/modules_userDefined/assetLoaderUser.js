
// assetLoader for user
var AssetLoaderUser = function (gltfLoader, scene_main) {

	var gltfLoader = gltfLoader;
	var scene_main = scene_main;
	var userMesh_in;
	var userId_in;
	var userLocId_in;
	var world_gridInd_in;
	var gridPosInd_in;

	this.getUserAsset = function () { return userMesh_in; }
	this.getUserId = function () { return userId_in; }
	this.getUserLocId = function () { return userLocId_in; }
	this.getWorld_gridInd = function () { return world_gridInd_in; }
	this.getGridPosInd = function () { return gridPosInd_in; }
	
	/*
	this.ajaxCall(url, data, setUser);
	
	callbackTester (setUser, result, callback_getUser);
	
	function callbackTester () {
		arguments[0] (arguments[1], arguments[2]);
	}
	*/
	
	this.ajaxCall = function (url, data, callback) {
		$.ajax({
			url: url,
			type: "POST",
			data: data
		}).done( callback );
	};
	
	this.leaveSession = function (userLocId) {
		var url = "/leaveSession";
		var data = {"userLocId": userLocId };
		
		$.post(url, data, function(result) {
			console.log(result);
		});
	};
	
	
	this.updateUserLoc = function (userLocId, world_gridInd, gridPosInd) {
		var url = "/updateUserLoc";
		var data = {"userLocId": userLocId, "world_gridInd": world_gridInd, "gridPosInd": gridPosInd };
		
		$.post(url, data, function(result) {
			//console.log(result);
		});
	};
	
	this.updateUserGrid = function (userId, userLocId, world_gridIndPrev, world_gridInd, gridPosInd, callback_updateUserGridAndLocId) {
		var url = "/updateUserGrid";
		var data = {"userId": userId, "userLocId": userLocId, "world_gridIndPrev":world_gridIndPrev, "world_gridInd": world_gridInd, "gridPosInd": gridPosInd };
		
		$.post(url, data, function(result) {
			updateUserGridAndLocId(result, callback_updateUserGridAndLocId);
		});
	};
	
	function updateUserGridAndLocId(result, callback_updateUserGridAndLocId) {
		//console.log("callback", result);
		userLocId_in = result.userLocId;
		callback_updateUserGridAndLocId();
	}
	
	
	
	
	
	this.loadUser = function (userName, world_width, world_gridSize, callback_getUser) {
		var url = "/getUser";
		var data = {"tableName": "users", "userName": userName };
		
		$.post(url, data, function(result) {
			setUser(result, world_width, world_gridSize, callback_getUser);
		});
		
	};
	
	function setUser(result, world_width, world_gridSize, callback_getUser) {
		
		//console.log( 'ajax call : ' + JSON.stringify(result) );
		
		var url_asset = result.assetPath + result.assetFileName;
		var assetName = result.name;
		var assetCoordX = world_gridSize * ( result.world_gridInd % world_width ) + result.gridPosInd % world_gridSize;
		var assetCoordY = world_gridSize * Math.floor( result.world_gridInd / world_width ) + Math.floor( result.gridPosInd / world_gridSize );
		var scaleFactor = 1;
		
		userId_in = result.id;
		userLocId_in = result.userLocId;
		world_gridInd_in = result.world_gridInd;
		gridPosInd_in = result.gridPosInd;
		
		gltfLoader.load(
			url_asset,
			function ( gltf ) {
				
				var mesh;
				
				gltf.scene.traverse(function (child) {
					//console.log(child.name);
					if (child.isMesh) {
						child.name = assetName;
						child.position.x = assetCoordX;
						child.position.z = assetCoordY;
						child.scale.set(child.scale.x*scaleFactor, child.scale.y*scaleFactor, child.scale.z*scaleFactor);
						mesh = child;
					}
				});

				//scene_main.add(gltf.scene);
				scene_main.add( mesh );
				
				//####################################
				userMesh_in = mesh;
				callback_getUser();
				
			},
			undefined,
			function (error) {
				console.error(error);
			}
		);
		
	}
	
	
	


};

export { AssetLoaderUser };

