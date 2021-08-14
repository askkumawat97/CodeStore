
//var mysql = require('/usr/local/lib/node_modules/mysql');
var mysql = require('mysql');
var vars = require('./databaseScript_vars.js');

var vars = require('./public/scripts/variables.js');

var world_width = 10; //horizontal grid count
var world_height = 10; //vertical grid count
var world_gridSize = 20;

var objCount = 5; //object count for each grid

let connection = mysql.createConnection({
	host: mysql_host,
	user: mysql_user,
	//port: mysql_port,
	password: mysql_password,
	//database: mysql_database,
	//socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock' //for mac and linux
});

connection.connect(function(err) {
	if (err) {
		return console.error('error: ' + err.message);
	}
	console.log('Connected to the MySQL server.');
	
	
	var id				= 'id INT AUTO_INCREMENT PRIMARY KEY';
	var loc				= 'coordX INT NOT NULL, coordY INT NOT NULL, coordZ INT NOT NULL';
	var url				= 'assetPathId INT, assetFileName VARCHAR(32), ' + 'FOREIGN KEY (assetPathId) REFERENCES assetPath(id)';
		
	var parentIdTerrain	= 'parentId INT'; // + ', ' + 'FOREIGN KEY (parentId) REFERENCES terrains(id)';
	var phyIdArchs		= 'physicalId INT, ' + 'FOREIGN KEY (physicalId) REFERENCES architectsPhysical(id)';
	var phyIdTree		= 'physicalId INT, ' + 'FOREIGN KEY (physicalId) REFERENCES treesPhysical(id)';
	var phyIdObjs		= 'physicalId INT, ' + 'FOREIGN KEY (physicalId) REFERENCES objectsPhysical(id)';
	var parrentMapperId	= 'parrentMapperId INT, ' + 'FOREIGN KEY (parrentMapperId) REFERENCES parrentMapper(id)';
	
	var parentIdAll		= 'parentId INT, ' + 
						'CONSTRAINT users_FK FOREIGN KEY (parentId) REFERENCES users(id), ' + 
						'CONSTRAINT terrains_FK FOREIGN KEY (parentId) REFERENCES terrains(id), ' + 
						'CONSTRAINT architects_FK FOREIGN KEY (parentId) REFERENCES architects(id), ' + 
						'CONSTRAINT trees_FK FOREIGN KEY (parentId) REFERENCES treesVertual(id), ' + 
						'CONSTRAINT objects_FK FOREIGN KEY (parentId) REFERENCES objectsVertual(id)' ;
	parentIdAll			= 'parentId INT';
	
	
	var queryCol = [
	/*  0 */ "CREATE DATABASE db_3dsim;",
	/*  1 */ "USE db_3dsim;",
	/*  2 */ "SHOW tables;",
	/*  3 */ "",
	/*  4 */ "",
	/*  5 */ "",
	
	/*  6 */ "CREATE TABLE parrentMapper "		+ "( " + genQuery([ id, "tableName VARCHAR(32)"					]) + " );",
	/*  7 */ "CREATE TABLE assetPath "			+ "( " + genQuery([ id, "path VARCHAR(64)"						]) + " );",
	/*  8 */ "CREATE TABLE users "				+ "( " + genQuery([ id, "userLocId INT", "world_gridInd INT", "gridPosInd INT", url, "name VARCHAR(32)" ]) + " );",
	/*  9 */ "CREATE TABLE terrains "			+ "( " + genQuery([ id, loc, url								]) + " );",
	/* 10 */ "CREATE TABLE architectsPhysical "	+ "( " + genQuery([ id, url										]) + " );",
	/* 11 */ "CREATE TABLE architectsVertual "	+ "( " + genQuery([ id, loc, phyIdArchs, parentIdTerrain		]) + " );",
	/* 12 */ "CREATE TABLE treesPhysical "		+ "( " + genQuery([ id, url										]) + " );",
	/* 13 */ "CREATE TABLE treesVertual "		+ "( " + genQuery([ id, loc, phyIdTree, parentIdTerrain			]) + " );",
	/* 14 */ "CREATE TABLE objectsPhysical "	+ "( " + genQuery([ id, url										]) + " );",
	/* 15 */ "CREATE TABLE objectsVertual "		+ "( " + genQuery([ id, loc, phyIdObjs, parentIdAll, parrentMapperId ]) + " );",
	
	/* 16 */ "",
	/* 17 */ "",
	/* 18 */ "",
	/* 19 */ "DELETE FROM tablename WHERE id > 0;",
	/* 20 */ "DROP TABLE architectsVertual;",
	/* 21 */ "INSERT INTO tablename (coordX, coordY) VALUES (1, 1);",
	/* 22 */ "INSERT INTO tablename (coordX, coordY) VALUES ?;",
	/* 23 */ "SELECT * FROM tablename;",
	/* 24 */ "",
	/* 25 */ ""
	];
	
	
	//dynamicQuery(queryCol, [ 1, ]);
	
	// ----DONE----
	//bulkInsertionInTable( vars.query_parrentMapper,		vars.values_parrentMapper );
	//bulkInsertionInTable( vars.query_assetPath,			vars.values_assetPath );
	//bulkInsertionInTable( vars.query_users,				vars.values_users );
	//bulkInsertionInTable( vars.query_architectsPhysical,	vars.values_architectsPhysical );
	//bulkInsertionInTable( vars.query_treesPhysical,		vars.values_treesPhysical );
	//bulkInsertionInTable( vars.query_objectsPhysical,		vars.values_objectsPhysical );
	
	//bulkInsertionInTable_architects( vars.query_architectsVertual, vars.values_architectsVertual );
	//bulkInsertionInTable_objects( vars.query_objectsVertual, vars.values_objectsVertual );
	
	
	// ----DESABLED----
	//bulkInsertionInTable( vars.query_treesVertual,		vars.values_treesVertual );
	
	// ----NO NEED IN DB----
	//values_terrains = [ [1, 0, 0, 0, 2, 'level0/terrain_1_1/terrain.glb'] ];
	//bulkInsertionInTable_terrains( vars.query_terrains, vars.values_terrains );
	
	
	connection.end();
	
});

function genQuery(list) {
	var query = '';
	var ind = 0;
	for(; ind < list.length-1; ind++)
		query += list[ind] + ', ';
	query += list[ind];
	
	return query;
}

function dynamicQuery(queryCol, queryColInd) {
	for (i = 0; i < queryColInd.length; i++) {
		console.log("query: " + queryCol[queryColInd[i]]);
		connection.query(queryCol[queryColInd[i]], function (err, result) {
			if (err)
				return console.error('error: ' + err.message);
			
			//console.log(result);
		});
	}
}

function bulkInsertionInTable(query, values) {
	connection.query("USE db_3dsim", function (err, result) {
		if (err) return console.error('error: ' + err.message);
	});
	
	connection.query(query, [values], function (err, result) {
		if (err) return console.error('error: ' + err.message);
	});
}

function bulkInsertionInTable_architects(query, values) {
	//values_architectsVertual = [ [1, 0, 0, 0, 1, parentIdTerrain] ];
	connection.query("USE db_3dsim", function (err, result) {
		if (err) return console.error('error: ' + err.message);
	});
	
	var query = '';
	for (var i = 0; i < world_width; i++) {
		for (var j = 0; j < world_height; j++) {
			for (var k = 0; k < objCount; k++) {
				query = "INSERT INTO architectsVertual (coordX, coordY, coordZ, physicalId, parentId) VALUES (" + 
					eval( Math.floor(Math.random() * world_gridSize) + j*world_gridSize ) + ", " + 
					eval( Math.floor(Math.random() * world_gridSize) + i*world_gridSize ) + ", " + 
					"0, " + 
					"1, " + 
					eval(i*world_width+j) + 
				")";
				
				//console.log(query);
				connection.query(query, function (err, result) {
					if (err) return console.error('error: ' + err.message);
				});
			}
		}
	}
	
}

function bulkInsertionInTable_objects(query, values) {
	//values_objectsVertual = [ [1, 0, 0, 0, 1, parentId, parrentMapperId] ];
	connection.query("USE db_3dsim", function (err, result) {
		if (err) return console.error('error: ' + err.message);
	});
	
	
	
}




