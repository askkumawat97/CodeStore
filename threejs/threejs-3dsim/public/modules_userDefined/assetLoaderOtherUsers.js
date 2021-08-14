
var AssetLoaderOtherUsers = function (gltfLoader, scene_main) {

	var gltfLoader = gltfLoader;
	var scene_main = scene_main;
	var userMesh;
	
	this.getUser = function () {
		return userMesh;
	}
	
	/*
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
	
};

export { AssetLoaderOtherUsers };

