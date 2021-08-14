
import {OrbitControls} from '../js-builtin/three-js/controls/OrbitControls.js';

import {BSPTree} from '../js-userdefined/BSPTree.js';
import {D3Tree} from '../js-userdefined/D3Tree.js';


var scene, renderer, controls, fontLoader;
var observerCam, viewerCam; // observer's camera, viewer's camera
var viewerCamMesh;
var viewerCamMove = 50;
var viewerCamRot = Math.PI / 4; // 45 degree
var viewerCamRotEnabled = false;

var window_width = window.innerWidth - 30;
var window_height = window.innerHeight - 150;
var devicePixelRatio = window.devicePixelRatio;

var bspTree;
var d3Tree;

var buildEnabled = false;
var iterateStart = 0;
var iterateInd = iterateStart;
var iterateCount = 18;
var iterateOrder = [ 8, 10, 11, 6, 2, 17, 5, 15, 3, 16, 12, 4, 7, 14, 0, 1, 18, 9, 13 ];
var walls = [
	[1, 200, 1000, -400, 0, 100, 0, 90, 0, 'wall0'],
	[1, 200, 1000, -150, 0, 100, 0, 90, 0, 'wall1'],
	[1, 200, 600, 0, 0, 300, 0, 90, 0, 'wall2'],
	[1, 200, 250, 0, 0, -275, 0, 90, 0, 'wall3'],
	[1, 200, 250, 150, 0, -275, 0, 90, 0, 'wall4'],
	[1, 200, 250, 350, 0, -275, 0, 90, 0, 'wall5'],
	[1, 200, 250, 500, 0, -275, 0, 90, 0, 'wall6'],
	[1, 200, 400, 600, 0, -200, 0, 90, 0, 'wall7'],

	[1, 200, 1000, 100, 0, -400, 0, 0, 0, 'wall8'],
	[1, 200, 600, 300, 0, -150, 0, 0, 0, 'wall9'],
	[1, 200, 600, 300, 0, 0, 0, 0, 0, 'wall10'],
	[1, 200, 400, -200, 0, 600, 0, 0, 0, 'wall11'],
	[1, 200, 250, -275, 0, 500, 0, 0, 0, 'wall12'],
	[1, 200, 250, -275, 0, 350, 0, 0, 0, 'wall13'],
	[1, 200, 250, -275, 0, 200, 0, 0, 0, 'wall14'],
	[1, 200, 250, -275, 0, 50, 0, 0, 0, 'wall15'],
	[1, 200, 250, -275, 0, -50, 0, 0, 0, 'wall16'],
	[1, 200, 250, -275, 0, -200, 0, 0, 0, 'wall17'],
	[1, 200, 250, -275, 0, -300, 0, 0, 0, 'wall18']
];



$(document).ready(function() {

	init();

	//render(); // remove when using next line for animation loop (requestAnimationFrame)

	animate();

});


function init() {

	scene = new THREE.Scene();
	scene.background = new THREE.Color(0xcccccc);
	//scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );
	scene.name = "scene";

	const light = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.75);
	light.position.set(1, 1, 1);
	light.name = "hemi-light";
	scene.add(light);

	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setPixelRatio(devicePixelRatio);
	renderer.setSize(window_width, window_height);
	document.body.appendChild(renderer.domElement);

	// camera for controler's view
	observerCam = new THREE.PerspectiveCamera(60, window_width / window_height, 1, 3000);
	observerCam.position.set(500, 500, 500);
	observerCam.name = "camera-observer";

	// camera of first person movement
	viewerCam = new THREE.PerspectiveCamera(60, window_width / window_height, 1, 3000);
	viewerCam.position.set(0, 0, 0);
	viewerCam.name = "camera-viewer";
	
	
	// controls

	controls = new OrbitControls(observerCam, renderer.domElement);

	//controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)
	//controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
	//controls.dampingFactor = 0.05;
	controls.screenSpacePanning = false;
	controls.minDistance = 10;
	controls.maxDistance = 2000;
	controls.maxPolarAngle = 3; //Math.PI / 2;

	const axesHelper = new THREE.AxesHelper(1000);
	scene.add(axesHelper);
	axesHelper.name = "axes-helper";

	fontLoader = new THREE.FontLoader();


	d3Tree = new D3Tree();

	bspTree = new BSPTree(scene, d3Tree);

	createViewerCamMesh();
	
	if(!buildEnabled) {
		//setFloors();
		//walls.forEach( declare );
		for (var i = iterateStart; i < iterateCount; i++) declare(walls[iterateOrder[i]]);
	}
	
	window.addEventListener( 'resize', onWindowResize, false );
	window.addEventListener('keydown', onKeyDown, false);
	
}


function createViewerCamMesh() {
	
	var viewerCamMeshRadius = 100;
	var viewerCamMeshLen = 1.5 * viewerCamMeshRadius; // percent of viewerCamMeshRadius
	
	var geometry = new THREE.ConeGeometry(viewerCamMeshRadius, viewerCamMeshLen, 4);
	
	geometry.rotateY(Math.PI / 4/*45 degree*/);
	geometry.rotateX(Math.PI / 2/*90 degree*/);
	geometry.scale(1, window_height / window_width, 1);
	geometry.translate(0, 0, -viewerCamMeshLen / 2);
	
	viewerCamMesh = new THREE.Mesh(geometry, new THREE.MeshNormalMaterial());
	
	//viewerCamMesh.material.wireframe = true;
	viewerCamMesh.name = 'viewerCam-mesh';
	viewerCamMesh.position.copy(viewerCam.position);
	
	//viewerCamMesh.position.set(0,0,0,);
	
	scene.add(viewerCamMesh);
	
}


function setFloors() {

	// objects
	var f1geometry = new THREE.BoxGeometry(400, 1, 1000);
	//var f1material = new THREE.MeshLambertMaterial( { map: new THREE.TextureLoader().load('img/FloorsCheckerboard_S_Diffuse.jpg') } );
	var f1material = new THREE.MeshNormalMaterial();
	var f1cube = new THREE.Mesh(f1geometry, f1material);

	f1cube.position.set(-200, -100, 100);
	scene.add(f1cube);

	var f2geometry = new THREE.BoxGeometry(600, 1, 400);
	//var f2material = new THREE.MeshLambertMaterial( { map: new THREE.TextureLoader().load('img/FloorsCheckerboard_S_Diffuse.jpg') } );
	var f2material = new THREE.MeshNormalMaterial();
	var f2cube = new THREE.Mesh(f2geometry, f2material);

	f2cube.position.set(300, -100, -200);
	scene.add(f2cube);

}

function addWall(name, breadth, height, length, xpos, ypos, zpos, xrot, yrot, zrot) {

	// convert degree to radian
	xrot = dtr(xrot);
	yrot = dtr(yrot);
	zrot = dtr(zrot);

	var geometry = new THREE.BoxGeometry(length, height, breadth);
	//var material = new THREE.MeshLambertMaterial( { map: new THREE.TextureLoader().load('img/brick_bump.jpg') } );
	var material = new THREE.MeshNormalMaterial();
	var mesh = new THREE.Mesh(geometry, material);

	mesh.name = name;
	mesh.position.set(xpos, ypos, zpos);
	mesh.rotation.set(xrot, yrot, zrot);

	scene.add(mesh);

	// index for nam
	var objIndex = name.substring(4);

	// add text to wall
	fontLoader.load('static/fonts/helvetiker_regular.typeface.json', function(font) {

		const textGeometry = new THREE.TextGeometry(name, {
			font: font,
			size: 60,
			height: 1
		});

		textGeometry.computeBoundingBox();
		textGeometry.translate(
			-0.5 * (textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x),
			-0.5 * (textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y),
			-0.5 * (textGeometry.boundingBox.max.z - textGeometry.boundingBox.min.z)
		);

		var textMesh1 = new THREE.Mesh(textGeometry, new THREE.MeshBasicMaterial());

		textMesh1.name = 'WallText-' + objIndex;

		textMesh1.position.x = xpos;
		textMesh1.position.y = ypos;
		textMesh1.position.z = zpos;

		textMesh1.rotation.x = xrot;
		textMesh1.rotation.y = yrot;
		textMesh1.rotation.z = zrot;

		//var boxHelper = new THREE.BoxHelper( textMesh1, 0xff8000 );
		//scene.add( boxHelper );

		scene.add(textMesh1);

	});


	// add into bspTree
	bspTree.add(mesh);
	bspTree.printTree();

};

function declare(value) {
	
	addWall(value[9], value[0], value[1], value[2], value[3], value[4], value[5], value[6], value[7], value[8]);
	
}

//searching in BSP Tree
function search() {
	
	bspTree.search( viewerCam );
	
}


// degree to radian			
function dtr(degree) {
	
	return Math.PI / 180 * degree;
	
};

// box at origin
function setObjectAtOrigin() {

	//object at origin
	const geometryOrigin = new THREE.BoxGeometry(1, 1, 1);
	var meshOrigin = new THREE.Mesh(geometryOrigin, new THREE.MeshNormalMaterial({flatShading: true}));
	meshOrigin.position.x = 0;
	meshOrigin.position.y = 0;
	meshOrigin.position.z = 0;
	meshOrigin.updateMatrix();
	meshOrigin.name = 'obj_origin';
	scene.add(meshOrigin);

}

function onKeyDown() {

	var keyCode = event.which;
			
			
			if ( keyCode == 67 ) { // _C
				/*
				// Change Camera view
				cameraViewFlag = ( cameraViewFlag + 1 ) % 3;
				// 0 = x-axis, side view
				// 1 = y-axis, top view
				// 2 = z-axis, front view
				
				var cameraDist = 1500;
				
				var pos = new THREE.Vector3( 0, 0, 0 );
				var rot = new THREE.Vector3( 0, 0, 0 );
				
				if( cameraViewFlag == 0 )      pos.x = cameraDist, rot.y = 90, cameraView.innerHTML = '( side view )';
				else if( cameraViewFlag == 1 ) pos.y = cameraDist, rot.x = -90, cameraView.innerHTML = '( top view )';
				else                           pos.z = cameraDist, cameraView.innerHTML = '( front view )';
				
				camera.position.copy( pos );
				camera.rotation.setFromVector3( rot );
				*/
			} else if ( keyCode == 32 ) {
				// Reset Location and Rotation _SPACE
				viewerCam.position.x = 0;
				viewerCam.position.y = 0;
				viewerCam.position.z = 0;
				
				viewerCam.rotation.x = 0;
				viewerCam.rotation.y = 0;
				viewerCam.rotation.z = 0;
				
			} else if( keyCode == 82 ) { //rotation flag _R
				viewerCamRotEnabled = viewerCamRotEnabled ? false : true;
				
			} else if( keyCode == 70 ) { //finding _F
				search();
				
			} else if( keyCode == 66 && buildEnabled ) { //build _B
				if( iterateInd < iterateCount ) {
					declare( walls[ iterateOrder[ iterateInd ] ] );
					iterateInd++;
				}
			
			} else if( !viewerCamRotEnabled ) {
				// Movement
				if ( keyCode == 65 ) { //left _A
					viewerCam.position.x -= viewerCamMove;
				} else if ( keyCode == 68 ) { //right _D
					viewerCam.position.x += viewerCamMove;
				} else if ( keyCode == 83 ) { //up _S
					viewerCam.position.y -= viewerCamMove;
				} else if ( keyCode == 87 ) { //down _W
					viewerCam.position.y += viewerCamMove;
				} else if ( keyCode == 81 ) { //up _Q
					viewerCam.position.z -= viewerCamMove;
				} else if ( keyCode == 69 ) { //down _E
					viewerCam.position.z += viewerCamMove;
				}
				
			} else {
				// Rotation
				if ( keyCode == 65 ) { //left _ctrl+A
					viewerCam.rotation.x -= viewerCamRot;
				} else if ( keyCode == 68 ) { //right _ctrl+D
					viewerCam.rotation.x += viewerCamRot;
				} else if ( keyCode == 83 ) { //up _ctrl+S
					viewerCam.rotation.y -= viewerCamRot;
				} else if ( keyCode == 87 ) { //down _ctrl+W
					viewerCam.rotation.y += viewerCamRot;
				} else if ( keyCode == 81 ) { //up _ctrl+Q
					viewerCam.rotation.z -= viewerCamRot;
				} else if ( keyCode == 69 ) { //down _ctrl+E
					viewerCam.rotation.z += viewerCamRot;
				}
			}

			viewerCamMesh.position.copy( viewerCam.position );
			viewerCamMesh.rotation.copy( viewerCam.rotation );
			viewerCam.updateMatrix();
			viewerCamMesh.updateMatrix();
	
}


function onWindowResize() {

	observerCam.aspect = window_width / window_height;
	observerCam.updateProjectionMatrix();

	renderer.setSize(window_width, window_height);

}

function animate() {

	requestAnimationFrame(animate);

	//controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

	render();

}

function render() {

	renderer.render(scene, observerCam);

}
