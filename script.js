import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

let scene, camera, renderer;
let controls;

function init() {
  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  document.body.appendChild(renderer.domElement);

  let backgroundColor = new THREE.Color(0xfff1c9);
  renderer.setClearColor(backgroundColor);

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  // controls = new OrbitControls(camera, renderer.domElement);

  camera.position.set(100, 100, 100);
  camera.lookAt(0, 0, 0);

  // helper functions
  const axesHelper = new THREE.AxesHelper(30);
  scene.add(axesHelper);
  const gridHelper = new THREE.GridHelper(200, 200);
  // scene.add(gridHelper);

  loop();
}

function loop() {
  renderer.render(scene, camera);

  window.requestAnimationFrame(loop);
}

init();
