class ARJSSystem {

  constructor(app) {
    this.app = app;
    this.eventSystem = app.eventSystem;
    this.scene = app.scene;
    this.camera = app.camera;

    this.arToolkitSource = new THREEx.ArToolkitSource({
      // to read from the webcam
      sourceType : 'webcam',

      // // to read from an image
      // sourceType : 'image',
      // sourceUrl : THREEx.ArToolkitContext.baseURL + '../data/images/img.jpg',

      // to read from a video
      // sourceType : 'video',
      // sourceUrl : THREEx.ArToolkitContext.baseURL + '../data/videos/headtracking.mp4',
    })

    this.arToolkitSource.init(function onReady(){
      this.onResize()
    }.bind(this))

    window.addEventListener('resize', function(){
      this.onResize()
    }.bind(this))

    this.onResize = () => {
      this.arToolkitSource.onResize()
      this.arToolkitSource.copySizeTo(this.app.renderer.domElement)
      if(this.arToolkitContext.arController !== null ){
        this.arToolkitSource.copySizeTo(this.arToolkitContext.arController.canvas)
      }
    }

    this.arToolkitContext = new THREEx.ArToolkitContext({
      cameraParametersUrl: THREEx.ArToolkitContext.baseURL + './data/camera_para.dat',
      detectionMode: 'mono',
    })

    this.arToolkitContext.init(function onCompleted(){
      // copy projection matrix to camera
      this.camera.projectionMatrix.copy(this.arToolkitContext.getProjectionMatrix() );
    }.bind(this))

    // as we do changeMatrixMode: 'cameraTransformMatrix', start with invisible scene
    // scene.visible = false

    let loader = new THREE.TextureLoader();
    let texture = loader.load( 'images/border.png' );

    let patternArray = ["letterA", "letterB", "letterC", "letterD", "letterF", "kanji", "hiro"];
    let colorArray = [0xff0000, 0xff8800, 0xffff00, 0x00cc00, 0x0000ff, 0xcc00ff, 0xcccccc];
    this.markerRoots = [];
    this.markerRootProxies = [];
    this.tags = [];
    for (let i = 0; i < 7; i++) {
      let markerRoot = new THREE.Group();
      markerRoot.name = "MarkerRoot" + i;
      this.scene.add(markerRoot);
      let markerControls = new THREEx.ArMarkerControls(this.arToolkitContext, markerRoot, {
        type : 'pattern', patternUrl : "./markers/patterns/" + patternArray[i] + ".patt",
      });

      // let mesh = new THREE.Mesh(
      //   new THREE.CubeGeometry(1.25,1.25,1.25),
      //   new THREE.MeshBasicMaterial({color:colorArray[i], map:texture, transparent:true, opacity:0.5})
      // );
      // mesh.position.y = 1.25/2;
      // markerRoot.add(mesh);
      this.markerRoots.push(markerRoot);

      let markerRootProxy = new THREE.Group();
      markerRootProxy.name = "MarkerRootProxy" + i;
      this.markerRootProxies.push(markerRootProxy);
      this.scene.add(markerRootProxy);

      let mesh = new THREE.Mesh(
        new THREE.CubeGeometry(1.25,1.25,1.25),
        new THREE.MeshBasicMaterial({color:colorArray[i], map:texture, transparent:true, opacity:0.5})
      );
      mesh.position.y = 1.25/2;
      markerRootProxy.add(mesh);

      let tag = new THREE.Group();
      tag.position.set(i*3,0,-10);
      this.tags.push(tag);
      this.scene.add(tag);
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

    this.xPosFilter = new KalmanFilter(2);
    this.yPosFilter = new KalmanFilter(2);
    this.zPosFilter = new KalmanFilter(2);

    this.xPositions = [];
    this.yPositions = [];
    this.zPositions = [];

    this.filteredX = 0;
    this.filteredY = 0;
    this.filteredZ = 0;

    this.filteredPosition;
  }

  update(dt) {
    if (this.arToolkitSource.ready !== false) {
      this.arToolkitContext.update(this.arToolkitSource.domElement);

      // update scene.visible if the marker is seen
      // scene.visible = camera.visible
    }

    if(this.camera.parent !== null && this.camera.parent !== this.scene) {
      THREE.SceneUtils.detach(this.camera, this.camera.parent, this.scene);
    }

    for(let i = 0; i < this.markerRootProxies.length; i++) {
      this.markerRootProxies[i].position.copy(this.markerRoots[i].position);
      this.markerRootProxies[i].updateMatrixWorld();
      this.markerRootProxies[i].rotation.copy(this.markerRoots[i].rotation);
      this.markerRootProxies[i].updateMatrixWorld();
    }

    var markerDistances = [];
    var closestMarkerProxy;
    var shortestDistance = 1000000;
    var defaultPosition = new THREE.Vector3(0,0,0);
    for(let i = 0; i < this.markerRoots.length; i++) {
      if(this.markerRoots[i].visible) {
        //TODO -> we're testing against a 'default position' now as that's normally the camera's position in arjs...
        //... need to re-think on this
        // var distance = this.camera.position.distanceTo(this.markerRoots[i].position)
        var distance = defaultPosition.distanceTo(this.markerRoots[i].position)
        if(distance < shortestDistance) {
          closestMarkerProxy = this.markerRootProxies[i];
          shortestDistance = distance;
        }
      }
    }

    if(closestMarkerProxy !== undefined) {
      this.camera.position.set(0,0,0);
      this.camera.updateMatrixWorld();
      this.camera.rotation.set(0,0,0);
      this.camera.updateMatrixWorld();
      THREE.SceneUtils.attach(this.camera, this.scene, closestMarkerProxy);
    }

    for(let i = 0; i < this.markerRootProxies.length; i++) {
      this.markerRootProxies[i].position.copy(this.tags[i].position);
      this.markerRootProxies[i].updateMatrixWorld();
      this.markerRootProxies[i].rotation.copy(this.tags[i].rotation);
      this.markerRootProxies[i].updateMatrixWorld();
      // this.markerRootProxies[i].visible = this.markerRootProxies[i] === closestMarkerProxy || closestMarkerProxy !== undefined;
      this.markerRootProxies[i].visible = true;
    }

    this.xPositions.push(this.camera.position.x);
    this.yPositions.push(this.camera.position.y);
    this.zPositions.push(this.camera.position.z);

    if(this.xPositions.length > 60) {
      this.xPositions.shift();

      this.filteredX = this.xPositions.map(function(v) {
        return this.xPosFilter.filter(v);
      }.bind(this));
    }

    if(this.yPositions.length > 60) {
      this.yPositions.shift();

      this.filteredY = this.yPositions.map(function(v) {
        return this.yPosFilter.filter(v);
      }.bind(this));
    }

    if(this.zPositions.length > 60) {
      this.zPositions.shift();

      this.filteredZ = this.zPositions.map(function(v) {
        return this.zPosFilter.filter(v);
      }.bind(this));
    }

    if(closestMarkerProxy !== undefined) {
      this.filteredPosition = new THREE.Vector3(this.filteredX[this.filteredX.length-1],this.filteredY[this.filteredY.length-1],this.filteredZ[this.filteredZ.length-1]);
      this.camera.position.copy(this.filteredPosition);
      this.camera.updateMatrixWorld();
    }
  }
}
