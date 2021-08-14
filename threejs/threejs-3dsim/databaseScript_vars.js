

var query_parrentMapper = "INSERT INTO parrentMapper (id, tableName) VALUES ?";
var query_assetPath = "INSERT INTO assetPath (id, path) VALUES ?";

var query_users = "INSERT INTO users (id, userLocId, world_gridInd, gridPosInd, assetPathId, assetFileName, name) VALUES ?";
var query_terrains = "INSERT INTO terrains (id, coordX, coordY, coordZ, assetPathId, assetFileName) VALUES ?";
var query_architectsVertual = "INSERT INTO architectsVertual (id, coordX, coordY, coordZ, physicalId, parentId) VALUES ?";
var query_treesVertual = "INSERT INTO treesVertual (id, coordX, coordY, coordZ, physicalId, parentId) VALUES ?";
var query_objectsVertual = "INSERT INTO objectsVertual (id, coordX, coordY, coordZ, physicalId, parentId, parrentMapperId) VALUES ?";

var query_architectsPhysical = "INSERT INTO architectsPhysical (id, assetPathId, assetFileName) VALUES ?";
var query_treesPhysical = "INSERT INTO treesPhysical (id, assetPathId, assetFileName) VALUES ?";
var query_objectsPhysical = "INSERT INTO objectsPhysical (id, assetPathId, assetFileName) VALUES ?";



var values_parrentMapper = [
	[1, 'users'],
	[2, 'terrains'],
	[3, 'architects'],
	[4, 'treesVertual'],
	[5, 'objectsVertual']
];

var values_assetPath = [
	[1, 'assets/users/'],
	[2, 'assets/terrains/'],
	[3, 'assets/architects/'],
	[4, 'assets/trees/'],
	[5, 'assets/objects/']
];

var values_architectsPhysical = [[1, 3, 'level0/architect1/architect.glb']];
var values_treesPhysical = [[1, 4, 'level0/tree1/tree.glb']];
var values_objectsPhysical = [[1, 5, 'level0/object1/object.glb']];

var values_users = [
	[1, 1, 0, 0, 1, 'level0/user1/user.glb', 'user1'],
	[2, 2, 0, 0, 1, 'level0/user2/user.glb', 'user2']
];

var values_treesVertual = [];

var values_terrains = [];

var values_architectsVertual = [];

var values_objectsVertual = [];







module.exports = {

	query_parrentMapper,
	query_assetPath,

	query_users,
	query_terrains,
	query_architectsVertual,
	query_treesVertual,
	query_objectsVertual,

	query_architectsPhysical,
	query_treesPhysical,
	query_objectsPhysical,



	values_parrentMapper,
	values_assetPath,

	values_users,
	values_terrains,
	values_architectsVertual,
	values_treesVertual,
	values_objectsVertual,

	values_architectsPhysical,
	values_treesPhysical,
	values_objectsPhysical

}

