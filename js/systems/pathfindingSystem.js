class PathfindingSystem {

  // constructor (app) {
  //   this.scene = app.scene;
  //   this.eventSystem = app.eventSystem;
  //
  //   this.player = app.camera;
  //   this.target;
  //
  //   this.Color = {
  //     GROUND: new THREE.Color( 0x606060 ).convertGammaToLinear( 2.2 ).getHex(),
  //     NAVMESH: new THREE.Color( 0xFFFFFF ).convertGammaToLinear( 2.2 ).getHex(),
  //   };
  //
  //   this.ZONE = 'level';
  //   this.SPEED = 5;
  //   this.OFFSET = 0.2;
  //
  //   this.level;
  //   this.navmesh;
  //
  //   this.groupID;
  //   this.path;
  //
  //   this.rootPosition = new THREE.Vector3(0,0,0);
  //   this.rootRotation = new THREE.Euler(THREE.Math.degToRad(0), THREE.Math.degToRad(0), THREE.Math.degToRad(0));
  //   this.rootQuaternion = new THREE.Quaternion().setFromEuler(this.rootRotation);
  //
  //   THREE.Pathfinding = threePathfinding.Pathfinding;
	// 	THREE.PathfindingHelper = threePathfinding.PathfindingHelper;
  //
  //   this.pathfinder = new THREE.Pathfinding();
  //   this.helper = new THREE.PathfindingHelper();
  //
  //   this.scene.add(this.helper);
  //
  //   this.isInitialized = false;
  //   this.queuePathUpdate = false;
  //
  //   this.eventSystem.addEventListener('ARRIVED_AT_DESTINATION', function(event) {
  //     // console.log(event);
  //   }.bind(this));
  //
  //   this.eventSystem.addEventListener('NEW_DESTINATION_SET', function(event) {
  //     // this.target = event.destination;
  //     this.target = this.tags[2];
  //
  //     if(this.isInitialized) {
  //       this.updatePath();
  //     } else {
  //       this.queuePathUpdate = true;
  //     }
  //   }.bind(this));
  //
  //   const gltfLoader = new THREE.GLTFLoader();
  //
  //   // gltfLoader.load('meshes/GarageNavMesh.gltf', (gltf) => {
  //   gltfLoader.load('meshes/CoderbunkerNavMesh.gltf', (gltf) => {
  //     gltf.scene.traverse((node) => {
  //       if (node.isMesh) {
  //         node.rotation.y -= THREE.Math.degToRad(180);
  //         node.scale.set(1000,1,1000);
  //         node.position.copy(this.rootPosition);
  //         node.updateMatrixWorld();
  //
  //         const geometry = node.geometry;
  //         geometry.applyMatrix(node.matrixWorld);
  //         const levelMat = new THREE.MeshStandardMaterial({color: this.Color.GROUND, roughness: 1, metalness: 0});
  //         this.level = new THREE.Mesh(geometry, levelMat);
  //         this.scene.add(this.level);
  //
  //         console.time('createZone()');
  //         const zone = THREE.Pathfinding.createZone(geometry);
  //         console.timeEnd('createZone()');
  //         console.log(zone)
  //
  //         this.pathfinder.setZoneData(this.ZONE, zone);
  //
  //         const navWireframe = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
  //           color: 0x808080,
  //           wireframe: true
  //         }));
  //         this.scene.add(navWireframe);
  //
  //         this.navmesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
  //           color: this.Color.NAVMESH,
  //           opacity: 0.75,
  //           transparent: true
  //         }));
  //         this.scene.add(this.navmesh);
  //
  //         // Set the player's navigation mesh group
  //         //HACK
  //         // this.groupID = this.pathfinder.getGroup(this.ZONE, this.player.position);
  //         // this.groupID = this.pathfinder.getGroup(this.ZONE, this.player.position) || this.pathfinder.getGroup(this.ZONE, this.rootPosition) || 0; //
  //         this.groupID = this.pathfinder.getGroup(this.ZONE, this.player.position) || this.pathfinder.getGroup(this.ZONE, this.rootPosition) || 0; //
  //         this.isInitialized = true;
  //         if(this.queuePathUpdate) {
  //           this.queuePathUpdate = false;
  //           this.updatePath();
  //         }
  //       }
  //     });
  //   }, undefined, (e) => {
  //       console.error(e);
  //   });
  //
  //   this.helper
  //     .setPlayerPosition(this.player.position.clone())
  //     .setTargetPosition(this.player.position.clone());
  // }
  //
  // updatePath() {
  //   this.helper
  //     .reset()
  //     .setPlayerPosition(this.player.position);
  //
  //   // if (event.metaKey || event.ctrlKey || event.button === 2) {
  //   //
  //   //   path.length = 0;
  //   //   groupID = pathfinder.getGroup(ZONE, target.position, true);
  //   //   const closestNode = pathfinder.getClosestNode( playerPosition, ZONE, groupID, true );
  //   //
  //   //   helper.setPlayerPosition( playerPosition.copy( target.position ) )
  //   //   if ( closestNode ) helper.setNodePosition( closestNode.centroid );
  //   //
  //   //   return;
  //   // }
  //
  //   var targetGroupID = this.pathfinder.getGroup(this.ZONE, this.target.position, true);
  //   // console.log(this.target);
  //   // console.log(this.ZONE);
  //   // console.log(targetGroupID);
  //   if(targetGroupID === null) targetGroupID = 0;
  //   const closestTargetNode = this.pathfinder.getClosestNode(this.target.position, this.ZONE, targetGroupID, true);
  //
  //   this.helper.setTargetPosition(this.target.position);
  //   if (this.closestTargetNode) this.helper.setNodePosition(closestTargetNode.centroid);
  //
  //   console.log(this.player.position)
  //   console.log(this.target.position)
  //
  //   var p0 = new THREE.Vector3(8800,200,6700)
  //   var p1 = new THREE.Vector3(7500,200,6700)
  //
  //   // Calculate a path to the target and store it
  //   // this.groupID = this.pathfinder.getGroup(this.ZONE, this.player.position) || this.pathfinder.getGroup(this.ZONE, this.rootPosition) || 0; //
  //   // this.path = this.pathfinder.findPath(this.player.position, this.target.position, this.ZONE, this.groupID);
  //   this.groupID = this.pathfinder.getGroup(this.ZONE, p0) || 0; //
  //   this.path = this.pathfinder.findPath(p0, p1, this.ZONE, this.groupID);
  //
  //   console.log(this.path)
  //   this.path.forEach(function(p) {
  //     console.log(p)
  //   })
  //
  //   if (this.path && this.path.length) {
  //
  //     this.helper.setPath(this.path);
  //
  //   } else {
  //
  //     const closestPlayerNode = this.pathfinder.getClosestNode(this.player.position, this.ZONE, this.groupID);
  //     const clamped = new THREE.Vector3();
  //
  //     // TODO(donmccurdy): Don't clone targetPosition, fix the bug.
  //     this.pathfinder.clampStep(
  //       this.player.position, this.target.position.clone(), closestPlayerNode, this.ZONE, this.groupID, clamped);
  //
  //     this.helper.setStepPosition(clamped);
  //   }
  // }

  update(dt) {
    // if ( !level || !(path||[]).length ) return
    // let targetPosition = path[ 0 ];
    // const velocity = target.position.clone().sub( player.position );
    //
    // if (velocity.lengthSq() > 0.05 * 0.05) {
    //   velocity.normalize();
    //   // Move player to target
    //   player.position.add( velocity.multiplyScalar( dt * SPEED ) );
    //   helper.setPlayerPosition( player.position );
    // } else {
    //   // Remove node from the path we calculated
    //   path.shift();
    // }
  }
}
