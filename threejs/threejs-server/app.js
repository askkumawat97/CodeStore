const express = require('express');
const http = require('http');
const path = require("path");
const bodyParser = require('body-parser');

const THREE = require('three')
var jsdom = require("jsdom");

var JSDOM = jsdom.JSDOM;
global.document = new JSDOM( '<h1>Hello world</h1>', 'http://example.com' ).window.document;

/*
var domino = require('domino');
var Element = domino.impl.Element;
var window = domino.createWindow('<h1>Hello world</h1>', 'http://example.com');
var document = window.document;
*/

const app = express();
const server = http.createServer( app );
app.use( bodyParser.urlencoded( { extended: false } ) );
app.use( express.static( path.join( __dirname, './public' ) ) );




var window_width = 400;
var window_height = 400;

var scene, camera;



app.get( '/', ( req, res ) => {
    res.sendFile( path.join( __dirname, './public/index.html' ) );
});


app.post( '/apiurl', async ( req, res ) => {
    
    try {
    	
		var result = { "status": "inside api" };
		res.send(result);
		
    } catch {
        res.send( "ERROR: Internal server error" );
    }
    
});


app.post( '/getScene', async ( req, res ) => {
	
	try {
    	
    	var str = '';
    	scene.traverse( function ( child ) {
			str += child.name + ", ";
		});
		
		res.send( str );
		
    } catch {
        res.send( "ERROR: Internal server error" );
    }
	
});


app.post( '/createScene', async ( req, res ) => {

	scene = new THREE.Scene();
	scene.name = "scene";
	camera = new THREE.PerspectiveCamera( 75, window_width / window_height, 0.1, 1000);
	camera.name = "camera";
	camera.position.set(400,400,0);
	
	var ambientLight = new THREE.AmbientLight( 0xffffff, 0.5 );
	ambientLight.name = "ambientLight";
	scene.add( ambientLight );
	
	var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.9 );
	directionalLight.position.set( 1, 1, 0 ); //default; light shining from top
	directionalLight.castShadow = true;
	directionalLight.name = "directionalLight";
	scene.add( directionalLight );
	
	
	var floor1_geometry = new THREE.BoxGeometry( 400, 1, 1000 );
	var floor1_material = new THREE.MeshLambertMaterial( { map: new THREE.TextureLoader().load('public/img/FloorsCheckerboard_S_Diffuse.jpg') } );	       
	var floor1_mesh = new THREE.Mesh( floor1_geometry, floor1_material );
	floor1_mesh.position.set( -200, -100, 100 );
	floor1_mesh.name = "floor_1";
	scene.add( floor1_mesh );
	
	
	var floor2_geometry = new THREE.BoxGeometry( 600,1,400);
	var floor2_material = new THREE.MeshLambertMaterial( { map: new THREE.TextureLoader().load('public/img/FloorsCheckerboard_S_Diffuse.jpg') } );	       
	var floor2_mesh = new THREE.Mesh( floor2_geometry, floor2_material );
	floor2_mesh.position.set( 300, -100, -200 );
	floor2_mesh.name = "floor_2";
	scene.add( floor2_mesh );
	
	
	var addWall = function( length, breadth, height, xaxis, yaxis, zaxis, name )
	{
		var geometry = new THREE.BoxGeometry( length, breadth, height );
		var material = new THREE.MeshLambertMaterial( { map: new THREE.TextureLoader().load('public/img/brick_bump.jpg') } );
		var cube = new THREE.Mesh( geometry, material );
		
		cube.name = name;
		cube.position.set( xaxis, yaxis, zaxis );
		scene.add( cube );
	};
	
	var walls = [
		[1,200,1000,-400,0,100, "wall_1" ],
		[1,200,1000,-150,0,100, "wall_2" ],
		[1,200,600,0,0,300, "wall_3" ],
		[1,200,250,0,0,-275, "wall_4" ],
		[1,200,250,150,0,-275, "wall_5" ],
		[1,200,250,350,0,-275, "wall_6" ],
		[1,200,250,500,0,-275, "wall_7" ],
		[1,200,400,600,0,-200, "wall_8" ],
		[1000,200,1,100,0,-400, "wall_9" ],
		[600,200,1,300,0,-150, "wall_10" ],
		[600,200,1,300,0,0, "wall_11" ],
		[400,200,1,-200,0,600, "wall_12" ],
		[250,200,1,-275,0,500, "wall_13" ],
		[250,200,1,-275,0,350, "wall_14" ],
		[250,200,1,-275,0,200, "wall_15" ],
		[250,200,1,-275,0,50, "wall_16" ],
		[250,200,1,-275,0,-50, "wall_17" ],
		[250,200,1,-275,0,-200, "wall_18" ],
		[250,200,1,-275,0,-300, "wall_19" ]
	]
	
	walls.forEach( declare );
	
	function declare( value ) {
		addWall( value[0],value[1],value[2],value[3],value[4],value[5], value[6] );
	}
	
	
	res.send( "scene created" );

});


server.listen( 8080, function() {
    console.log("server is listening on port: 8080");
});



