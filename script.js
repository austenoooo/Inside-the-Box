import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

let scene, camera, renderer;
let controls;
let box;

let fiveTone;

let modelLoader = new GLTFLoader();

function init() {
  scene = new THREE.Scene();
  scene.backgroundIntensity = 0.5;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
  document.body.appendChild(renderer.domElement);

  let backgroundColor = new THREE.Color(0xfff1c9);
  renderer.setClearColor(backgroundColor);


  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  controls = new OrbitControls(camera, renderer.domElement);

  camera.position.set(40, 60, 40);
  camera.lookAt(0, 10, 0);

  // add light
  const directionalLight = new THREE.DirectionalLight( 0xffffff, 1);
  scene.add( directionalLight );
  directionalLight.position.set(40, 60, 40);
  directionalLight.lookAt(0, 0, 0);

  // helper functions
  const axesHelper = new THREE.AxesHelper(30);
  scene.add(axesHelper);
  const gridHelper = new THREE.GridHelper(200, 200);
  // scene.add(gridHelper);

  // environmentMap();

  loadGradientMap();

  loadBoxModel();

  // addGround();

  loop();
}

function environmentMap() {
  let loader = new RGBELoader();
  loader.load("./textures/environment.hdr", (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
  });
}

// function addGround() {
//   let groundMaterial = new THREE.MeshBasicMaterial({color: 0xffffff});
//   let ground = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000), groundMaterial);
//   ground.position.set(0, 0, 0);
//   ground.rotation.set(-Math.PI/2, 0, 0);
//   ground.receiveShadow = true;
//   scene.add(ground);
// }

function loadGradientMap(){
  fiveTone = new THREE.TextureLoader().load('./textures/fiveTone.jpg');
  fiveTone.minFilter = THREE.NearestFilter;
  fiveTone.magFilter = THREE.NearestFilter;
}

function loadBoxModel(){
  modelLoader.load("./models/box.glb", function (gltf){
    box = gltf.scene;
    box.position.set(0, 0, 0);
    box.scale.set(30, 30, 30);
    box.rotation.set(0, Math.PI/2 + Math.PI/20, 0);

    box.traverse(function (object) {
      if (object.isMesh) {
        object.castShadow = true;
        object.receiveShadow = true;

        let oldMat = object.material;
        // let newMat = new THREE.MeshToonMaterial({gradientMap: fiveTone});
        let newMat = new THREE.MeshToonMaterial({map: oldMat.map, gradientMap: fiveTone});
        object.material = newMat;
      }
    });

    scene.add(box);
  }, undefined, 
  function (e) {
    console.error(e);
  }
  );
}

function loop() {

  renderer.render(scene, camera);

  window.requestAnimationFrame(loop);
}

init();
