
// Binary Space Partition

var BSPTree = function( scene, d3Tree ) {

	var scene = scene;
	
	// bsp tree visualization
	this.d3Tree = d3Tree;
	
	this.root = null;
	this.next = null;
	
	// used in tree visualization, pass to D3Tree.updateJSON()
	this.jsonData = {};


	this.createNode = function(object) {

		var node = new BSPTreeNode();
		
		// index for name
		var objIndex = object.name.substring(4);

		// planeMesh
		// used for planeMesh.quaternion, find another way to get quaternion from pos,rot then remove below mesh
		const geometry1 = new THREE.PlaneGeometry(250, 250);
		const material1 = new THREE.MeshNormalMaterial({
			side: THREE.DoubleSide
		});
		const planeMesh = new THREE.Mesh(geometry1, material1);
		planeMesh.position.set(object.position.x, object.position.y, object.position.z);
		planeMesh.rotation.set(object.rotation.x, object.rotation.y, object.rotation.z);
		planeMesh.name = 'PlaneMesh-' + objIndex;
		//scene.add( planeMesh );

		// Plane
		const plane = new THREE.Plane();
		const planeHelper = new THREE.PlaneHelper(plane, 250, 0xffff00);
		plane.name = 'Plane-' + objIndex;
		scene.add(planeHelper);

		var normal = new THREE.Vector3().set(0, 0, 1).applyQuaternion(planeMesh.quaternion);
		var point = new THREE.Vector3();
		point.setX(planeMesh.position.x);
		point.setY(planeMesh.position.y);
		point.setZ(planeMesh.position.z);

		plane.setFromNormalAndCoplanarPoint(normal, point);

		
		node.object = object;
		node.plane = plane;
		node.planeMesh = planeMesh;

		//console.log( plane );
		//console.log( planeMesh );

		return node;

	};

	this.add = function(object) {

		var newNode = this.createNode(object);


		if (this.root == null) {

			this.root = newNode;
			this.next = this.root;

		} else {

			this.insert(newNode);

		}

	};

	this.insert = function(newNode) {

		while (true) {

			var flag = this.getObjectPosition(this.next, newNode);

			if (flag == 1) {

				// front

				if (this.next.front == null) {

					newNode.parent = this.next;
					this.next.front = newNode;
					this.next = this.root;

					break;

				} else {

					this.next = this.next.front;

				}

			} else if (flag == -1) {

				// back

				if (this.next.back == null) {

					newNode.parent = this.next;
					this.next.back = newNode;
					this.next = this.root;

					break;

				} else {

					this.next = this.next.back;

				}

			//######## UNIMPLEMENTED ########//
			} else if (flag == 0) {

				// span
				
				break;
				
			//######## UNIMPLEMENTED ########//
			} else { // flag = 2

				// incident

				break;

			}

		}

	};

	this.getObjectPosition = function(node, newNode) {

		/*
		// FINDINF FRONT AND BACK IS NOT WORKING PROPERLY
		var nodePlaneVector = ( new THREE.Vector3( 0, 0, 1 ) ).applyQuaternion( node.planeMesh.quaternion );
		var newNodePlaneVector = ( new THREE.Vector3( 0, 0, -1 ) ).applyQuaternion( newNode.planeMesh.quaternion );
		if( nodePlaneVector.angleTo( newNodePlaneVector ) > Math.PI / 2 )
			console.log( 'facing front' );
		else
			console.log( 'facing back' );
		*/
		
		
		var flag = -2;
		
		// newNode spanning the hyperPlane
		// var condition = (node.plane.position == newNode.plane.position) ? true : false;
		// constant is only distance from origin. probably both plane are mirror position to each other from normal, eg. plane1 = 1 plane2 = -1 or viceversa
		//if (node.plane.normal == newNode.plane.normal && node.plane.constant == newNode.plane.constant /*&& condition*/)
		//	return 0;


		// front of plane is in origin side
		// 'Line' from origin to 'newNode' position
		// if 'Line' intersects the 'node.Plane' means 'newNode' is in back side
		// otherwise 'newNode' is in front side

		var line = new THREE.Line3(new THREE.Vector3(0, 0, 0), newNode.planeMesh.position);
		var intersects1 = new THREE.Vector3();
		var intersects = node.plane.intersectLine(line, intersects1);

		// newNode is in front side of the hyperPlane
		if (intersects == null) {

			//console.log(newNode.object.name, 'facing front of', node.object.name);

			flag = 1;

		// newNode is in back side of the hyperPlane
		} else {

			//console.log(newNode.object.name, 'facing back of', node.object.name);

			flag = -1;
		}

		//######## UNIMPLEMENTED ########//
		// newNode is intersecting the hyperplane
		// flag = 2;

		return flag;
		
	}

	
	this.search = function(viewerCam) {
		
		eyePoint = viewerCam.position;
		traverseTreeForSearch(this.root, eyePoint);
		
	};
	
	function traverseTreeForSearch(node, eyePoint) {
		
		if (node == null)
			return;
		
		
		var flag = this.getObjectPosition(node, newNode);

		if(flag == 1) { // eyePoint in front
			
			traverseTreeForSearch(node.back, eyePoint);
			console.log(node.polygon_list);
			traverseTreeForSearch(node.front, eyePoint);
			
		} else if(flag == -1) { // eyePoint in back
			
			traverseTreeForSearch(node.front, eyePoint);
			console.log(node.polygon_list);
			traverseTreeForSearch(node.back, eyePoint);
			
		} else if(flag == 2) { // eyePoint coincidental with partition hyperplane
			
			traverseTreeForSearch(node.front, eyePoint);
			traverseTreeForSearch(node.back, eyePoint);
			
		}
		
	}
	
	
	this.printTree = function() {

		this.jsonData = {};

		this.traverseTreeForPrint(this.root, this.jsonData);

		this.d3Tree.updateJSON(this.jsonData);

		//console.log( this.root );
		//console.log( this.jsonData );

	}

	this.traverseTreeForPrint = function(node, jsonDataNode) {

		if (node == null)
			return;

		jsonDataNode.name = node.object.name;
		jsonDataNode.children = [{}, {}]; //0:front 1:back

		this.traverseTreeForPrint(node.front, jsonDataNode.children[0]);
		this.traverseTreeForPrint(node.back, jsonDataNode.children[1]);

	};


};


var BSPTreeNode = function() {

	this.object = null;
	this.plane = null;
	this.planeMesh = null;

	this.parent = null;
	this.front = null;
	this.back = null;

};


export {
	BSPTree
};
