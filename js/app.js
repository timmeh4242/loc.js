//////////////////////////////////////////////////////////////////////////////////
//		Init
//////////////////////////////////////////////////////////////////////////////////

var App = function() {};
var app = new App();

app.eventSystem = new EventSystem();

var scene, camera, renderer, clock, deltaTime, totalTime;

renderer	= new THREE.WebGLRenderer({
  antialias: true,
  alpha: true
});
renderer.setClearColor(new THREE.Color('lightgrey'), 0)
renderer.setSize( 640, 480 );
renderer.domElement.style.position = 'absolute'
renderer.domElement.style.top = '0px'
renderer.domElement.style.left = '0px'
document.body.appendChild( renderer.domElement );

scene	= new THREE.Scene();
camera = new THREE.Camera();
scene.add(camera);

clock = new THREE.Clock();
deltaTime = 0;
totalTime = 0;

var arToolkitSource = new THREEx.ArToolkitSource({
  // to read from the webcam
  sourceType : 'webcam',

  // // to read from an image
  // sourceType : 'image',
  // sourceUrl : THREEx.ArToolkitContext.baseURL + '../data/images/img.jpg',

  // to read from a video
  // sourceType : 'video',
  // sourceUrl : THREEx.ArToolkitContext.baseURL + '../data/videos/headtracking.mp4',
})

arToolkitSource.init(function onReady(){
  onResize()
})

window.addEventListener('resize', function(){
  onResize()
})
function onResize(){
  arToolkitSource.onResize()
  arToolkitSource.copySizeTo(renderer.domElement)
  if( arToolkitContext.arController !== null ){
    arToolkitSource.copySizeTo(arToolkitContext.arController.canvas)
  }
}

var arToolkitContext = new THREEx.ArToolkitContext({
  cameraParametersUrl: THREEx.ArToolkitContext.baseURL + './data/camera_para.dat',
  detectionMode: 'mono',
})

arToolkitContext.init(function onCompleted(){
  // copy projection matrix to camera
  camera.projectionMatrix.copy( arToolkitContext.getProjectionMatrix() );
})

// as we do changeMatrixMode: 'cameraTransformMatrix', start with invisible scene
// scene.visible = false

let loader = new THREE.TextureLoader();
let texture = loader.load( 'images/border.png' );

let patternArray = ["letterA", "letterB", "letterC", "letterD", "letterF", "kanji", "hiro"];
let colorArray = [0xff0000, 0xff8800, 0xffff00, 0x00cc00, 0x0000ff, 0xcc00ff, 0xcccccc];
var markerRoots = [];
var markerRootProxies = [];
let tags = [];
for (let i = 0; i < 7; i++) {
  let markerRoot = new THREE.Group();
  markerRoot.name = "MarkerRoot" + i;
  scene.add(markerRoot);
  let markerControls = new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
    type : 'pattern', patternUrl : "./markers/patterns/" + patternArray[i] + ".patt",
  });

  // let mesh = new THREE.Mesh(
  //   new THREE.CubeGeometry(1.25,1.25,1.25),
  //   new THREE.MeshBasicMaterial({color:colorArray[i], map:texture, transparent:true, opacity:0.5})
  // );
  // mesh.position.y = 1.25/2;
  // markerRoot.add(mesh);
  markerRoots.push(markerRoot);

  let markerRootProxy = new THREE.Group();
  markerRootProxies.push(markerRootProxy);
  scene.add(markerRootProxy);

  let mesh = new THREE.Mesh(
    new THREE.CubeGeometry(1.25,1.25,1.25),
    new THREE.MeshBasicMaterial({color:colorArray[i], map:texture, transparent:true, opacity:0.5})
  );
  mesh.position.y = 1.25/2;
  markerRootProxy.add(mesh);

  let tag = new THREE.Group();
  tag.position.set(i*3,0,-10);
  tags.push(tag);
  scene.add(tag);
}

function update(){
	if ( arToolkitSource.ready !== false ) {
    arToolkitContext.update( arToolkitSource.domElement );

    // update scene.visible if the marker is seen
    // scene.visible = camera.visible
  }
}

// let mesh = new THREE.Mesh(
//   new THREE.CubeGeometry(1.25,1.25,1.25),
//   new THREE.MeshBasicMaterial({color:"pink", map:texture, transparent:true, opacity:0.5})
// );
// mesh.position.set(0,0,-5)
// scene.add(mesh)

// var xFilter = new KalmanFilter({R: 0.01, Q: 3});
// var yFilter = new KalmanFilter({R: 0.01, Q: 3});
// var zFilter = new KalmanFilter({R: 0.01, Q: 3});

var xPosFilter = new KalmanFilter(2);
var yPosFilter = new KalmanFilter(2);
var zPosFilter = new KalmanFilter(2);

var xPositions = [];
var yPositions = [];
var zPositions = [];

var filteredX = 0;
var filteredY = 0;
var filteredZ = 0;

var filteredPosition;

function animate() {
	requestAnimationFrame(animate);
	deltaTime = clock.getDelta();
	totalTime += deltaTime;
	update();

  scene.add(camera);
  camera.position.set(0,0,0);
  camera.updateMatrixWorld();
  camera.rotation.set(0,0,0);
  camera.updateMatrixWorld();

  for(let i = 0; i < markerRootProxies.length; i++) {
    markerRootProxies[i].position.copy(markerRoots[i].position);
    markerRootProxies[i].updateMatrixWorld();
    markerRootProxies[i].rotation.copy(markerRoots[i].rotation);
    markerRootProxies[i].updateMatrixWorld();
  }

  var markerDistances = [];
  var closestMarkerProxy;
  var shortestDistance = 1000000;
  for(let i = 0; i < markerRoots.length; i++) {
    if(markerRoots[i].visible) {
      var distance = camera.position.distanceTo(markerRoots[i].position)
      if(distance < shortestDistance) {
        closestMarkerProxy = markerRootProxies[i];
        shortestDistance = distance;
      }
    }
  }

  if(closestMarkerProxy !== undefined) {
    THREE.SceneUtils.attach(camera, scene, closestMarkerProxy);
  }

  for(let i = 0; i < markerRootProxies.length; i++) {
    markerRootProxies[i].position.copy(tags[i].position);
    markerRootProxies[i].updateMatrixWorld();
    markerRootProxies[i].rotation.copy(tags[i].rotation);
    markerRootProxies[i].updateMatrixWorld();
    markerRootProxies[i].visible = markerRootProxies[i] === closestMarkerProxy || closestMarkerProxy !== undefined;
  }

  xPositions.push(camera.position.x);
  yPositions.push(camera.position.y);
  zPositions.push(camera.position.z);

  if(xPositions.length > 60) {
    xPositions.shift();

    filteredX = xPositions.map(function(v) {
      return xPosFilter.filter(v);
    });
  }

  if(yPositions.length > 60) {
    yPositions.shift();

    filteredY = yPositions.map(function(v) {
      return yPosFilter.filter(v);
    });
  }

  if(zPositions.length > 60) {
    zPositions.shift();

    filteredZ = zPositions.map(function(v) {
      return zPosFilter.filter(v);
    });
  }

  filteredPosition = new THREE.Vector3(filteredX[filteredX.length-1],filteredY[filteredY.length-1],filteredZ[filteredZ.length-1]);
  camera.position.copy(filteredPosition);

	renderer.render(scene, camera);
}

animate();
