
const express = require('express');
const http = require('http');
//const bcrypt = require('bcrypt');
const path = require("path");
const bodyParser = require('body-parser');
var mysql = require('mysql');

var vars = require('./public/scripts/variables.js');

var values_assetPath = [
	[],
	[1, 'assets/users/'],
	[2, 'assets/terrains/'],
	[3, 'assets/architects/'],
	[4, 'assets/trees/'],
	[5, 'assets/objects/']
];

var usersData = new Array( world_width * world_height );
// usersData[world_gridInd][userLocId]

//for( var ind = 0; ind < world_width * world_height; ind++)
//	usersData[ind] = [ [] ];


const app = express();
const server = http.createServer(app);
var sqlConnFlag = 0;
let connection = mysql.createConnection({
	host: mysql_host,
	user: mysql_user,
	//port: mysql_port,
	password: mysql_password,
	//database: mysql_database,
	//socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock' //for mac and linux
});

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname,'./public')));


connection.connect(function(err) {
	if (err) {
		return console.error('error: ' + err.message);
	}
	console.log('Connected to the MySQL server.');
	sqlConnFlag = 1;
	
});

function closeConnection() {
	connection.end();
}

/*
app.get('/',(req,res) => {
    res.sendFile(path.join(__dirname,'./public/index.html'));
});
*/


app.post('/getUser', async (req, res) => {
    try {
    	if(sqlConnFlag == 0) return;
    	// req.body.x1
    	var query = '';
		
		connection.query('USE ' + mysql_database, function (err, result) {
			if (err) return console.error('error: ' + err.message);
		});
		
		
		query = 'SELECT * FROM ' + req.body.tableName + ' WHERE name = "' + req.body.userName + '"';
		
		//console.log(query);
    	connection.query(query, function (err, result) {
			if (err) return console.error('error: ' + err.message);
			
			//console.log("row fetched from " + req.body.tableName + ": " + result.length);
			
			var obj = Object.assign({}, result[0]);
			obj.assetPath = values_assetPath[obj.assetPathId][1];
			//console.log(obj);
			
			//fill usersData
			if(usersData[obj.world_gridInd] == undefined)
				usersData[obj.world_gridInd] = [ [] ];
			var newuserLocId = usersData[obj.world_gridInd].length;
			usersData[obj.world_gridInd].push( [ obj.gridPosInd ] );
			obj.userLocId = newuserLocId;
			
			connection.query('UPDATE users SET userLocId = ' + newuserLocId + ' WHERE id = ' + obj.id, function (err, result) {
				if (err) return console.error('error: ' + err.message);
				//console.log("userLocId updates for user " + obj.id);
			});
			
			
			//console.log("newuserLocId:", newuserLocId);
			//console.log("usersData:", usersData);
			
			res.send(obj);
		});
		
    } catch {
        res.send("ERROR: Internal server error");
    }
});


app.post('/updateUserLoc', async (req, res) => {
    try {
    	if(sqlConnFlag == 0) return;
    	// req.body.x1
    	
    	usersData[req.body.world_gridInd][req.body.userLocId][0] = req.body.gridPosInd;
		
		//console.log("usersData:", usersData);
		
		var result = { "userLocId": req.body.userLocId, "world_gridInd": req.body.world_gridInd, "gridPosInd": usersData[req.body.world_gridInd][req.body.userLocId][0] };
		res.send(result);
		
    } catch(err) {
        res.send("ERROR: " + err);
    }
});

app.post('/updateUserGrid', async (req, res) => {
	try {
		if(sqlConnFlag == 0) return;
		// req.body.x1
		
		var newuserLocId;
		
		//removing the user entry and storing that userLocId in [0] for further use
		usersData[req.body.world_gridIndPrev][0].push(req.body.userLocId);
		
		//adding user to new grid
		if(usersData[req.body.world_gridInd] == undefined)
				usersData[req.body.world_gridInd] = [ [] ];
				
		if(usersData[req.body.world_gridInd][0].length == 0) {
			newuserLocId = usersData[req.body.world_gridInd].length;
			usersData[req.body.world_gridInd].push( [ req.body.gridPosInd ] );
		} else {
			newuserLocId = usersData[req.body.world_gridInd][0].pop();
			usersData[req.body.world_gridInd][newuserLocId][0] = req.body.gridPosInd;
		}
		
		
		//##########################################################################
		/*
		var query = 'UPDATE users SET userLocId = ' + newuserLocId + ',world_gridInd = ' + req.body.world_gridInd + ' WHERE id = ' + req.body.userId;
		connection.query(query, function (err, result) {
			if (err) return console.error('error: ' + err.message);
			console.log("userLocId, world_gridInd updates for user " + req.body.userId);
		});
		*/
		
		//console.log("newuserLocId:", newuserLocId);
		//console.log("usersData:", usersData);
			
		var result = { "userLocId": newuserLocId, "world_gridInd": req.body.world_gridInd, "gridPosInd": usersData[req.body.world_gridInd][newuserLocId][0] };
		res.send(result);
		
	} catch(err) {
		res.send("ERROR: " + err);
	}
});


app.post('/leaveSession', async (req, res) => {
    try {
    	if(sqlConnFlag == 0) return;
    	// req.body.x1
    	
    	// logout logic
    	
		var result = { "user": req.body.userLocId, "status": "session closed" };
		res.send(result);
		
    } catch {
        res.send("ERROR: Internal server error");
    }
});


app.post('/getArchitects', async (req, res) => {
    try {
    	if(sqlConnFlag == 0) return;
    	// req.body.x1
    	var query = '';
		
		connection.query('USE ' + mysql_database, function (err, result) {
			if (err) return console.error('error: ' + err.message);
		});
		
		
		query = 'SELECT * FROM architectsVertual, architectsPhysical WHERE parentId = ' + req.body.world_gridInd ;
		
    	connection.query(query, function (err, result) {
			if (err) return console.error('error: ' + err.message);
			
			//console.log("row fetched from architects table: " + result.length);
			
			var obj = Object.assign({}, result);
			var len = result.length;
			for( var ind = 0; ind < len; ind++ )
				obj[ind].assetPath = values_assetPath[obj[ind].assetPathId][1];
			//console.log(obj);
			
			res.send(obj);
		});
		
    } catch {
        res.send("ERROR: Internal server error");
    }
});


app.post('/getOtherUsers', async (req, res) => {
    try {
    	if(sqlConnFlag == 0) return;
    	// req.body.x1
    	
    	
		var result = { "status": "inside getOtherUsers" };
		res.send(result);
		
    } catch {
        res.send("ERROR: Internal server error");
    }
});


server.listen(8080, function(){
    console.log("server is listening on port: 8080");
});




