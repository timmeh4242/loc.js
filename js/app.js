var App = function() {};
var app = new App();

app.eventSystem = new EventSystem();
app.scene;
app.camera;
app.renderer;

var clock, deltaTime, totalTime;

app.renderer	= new THREE.WebGLRenderer({
  antialias: true,
  alpha: true
});
app.renderer.setClearColor(new THREE.Color('lightgrey'), 0)
app.renderer.setSize( 640, 480 );
app.renderer.domElement.style.position = 'absolute'
app.renderer.domElement.style.top = '0px'
app.renderer.domElement.style.left = '0px'
document.body.appendChild(app.renderer.domElement);

app.scene	= new THREE.Scene();
app.camera = new THREE.Camera();
app.scene.add(app.camera);

clock = new THREE.Clock();
deltaTime = 0;
totalTime = 0;

var orientationControls, controlTarget;
controlTarget = new THREE.Group();
app.scene.add(controlTarget);
orientationControls = new THREE.DeviceOrientationControls(controlTarget);

var arjsSystem = new ARJSSystem(app);
var pathfindingSystem = new PathfindingSystem(app);

// const levelMat = new THREE.MeshStandardMaterial({color: this.Color.GROUND, roughness: 1, metalness: 0});
// var ground = new THREE.Mesh(geometry, levelMat);
// this.scene.add(this.level);
//
// console.time('createZone()');
// const zone = THREE.Pathfinding.createZone(geometry);
// console.timeEnd('createZone()');
// console.log(zone)
//
// this.pathfinder.setZoneData(this.ZONE, zone);
//
// const navWireframe = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
//   color: 0x808080,
//   wireframe: true
// }));
// this.scene.add(navWireframe);
//
// this.navmesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
//   color: this.Color.NAVMESH,
//   opacity: 0.75,
//   transparent: true
// }));
// this.scene.add(this.navmesh);
//
// // Set the player's navigation mesh group
// //HACK
// // this.groupID = this.pathfinder.getGroup(this.ZONE, this.player.position);
// // this.groupID = this.pathfinder.getGroup(this.ZONE, this.player.position) || this.pathfinder.getGroup(this.ZONE, this.rootPosition) || 0; //
// this.groupID = this.pathfinder.getGroup(this.ZONE, this.player.position) || this.pathfinder.getGroup(this.ZONE, this.rootPosition) || 0; //
// this.isInitialized = true;
// if(this.queuePathUpdate) {
//   this.queuePathUpdate = false;
//   this.updatePath();
// }

function animate() {
	requestAnimationFrame(animate);

	deltaTime = clock.getDelta();
	totalTime += deltaTime;

  orientationControls.update();

  arjsSystem.update(deltaTime);

  if(Device !== DeviceType.Desktop) {
    if(app.camera.parent !== null && app.camera.parent !== app.scene) {
      THREE.SceneUtils.detach(app.camera, app.camera.parent, app.scene);
    }
    app.camera.rotation.copy(controlTarget.rotation);
    app.camera.updateMatrixWorld();
  }

	app.renderer.render(app.scene, app.camera);
}

animate();
