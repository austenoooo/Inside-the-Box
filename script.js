import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OutlineEffect } from 'three/addons/effects/OutlineEffect.js';

import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { FXAAShader } from "three/addons/shaders/FXAAShader.js";

let scene, camera, renderer;
let controls;
let box;

let fiveTone;

let modelLoader = new GLTFLoader();

let composer;

let effect;

let contentPlane;

function init() {
  scene = new THREE.Scene();
  // scene.backgroundIntensity = 0.5;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
  document.getElementById("box").appendChild(renderer.domElement);

  let backgroundColor = new THREE.Color(0xfff5d6);
  renderer.setClearColor(backgroundColor);


  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  // controls = new OrbitControls(camera, renderer.domElement);

  camera.position.set(43, 60, 43);
  camera.lookAt(0, 10, 0);

  effect = new OutlineEffect(renderer);

  // add light
  const directionalLight = new THREE.DirectionalLight( 0xffffff, 2);
  scene.add( directionalLight );
  directionalLight.position.set(40, 60, 40);
  directionalLight.lookAt(0, 0, 0);

  // helper functions
  const axesHelper = new THREE.AxesHelper(30);
  // scene.add(axesHelper);
  const gridHelper = new THREE.GridHelper(200, 200);
  // scene.add(gridHelper);

  // environmentMap();

  postProcessing();

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

function addContentPlane(){
  let video = document.getElementById("myVideo");
  let videoTexture = new THREE.VideoTexture(video);

  videoTexture.wrapS = THREE.RepeatWrapping;
  videoTexture.wrapT = THREE.RepeatWrapping;
  videoTexture.repeat.set(1, 1);

  let textureLoader = new THREE.TextureLoader();
  let disp = textureLoader.load("./textures/displacement.png");

  disp.wrapS = THREE.RepeatWrapping;
  disp.wrapT = THREE.RepeatWrapping;
  disp.repeat.set(1, 1);

  contentPlane = new THREE.Mesh(new THREE.PlaneGeometry(18.5, 17.5), new THREE.MeshBasicMaterial({ map: videoTexture, displacementMap: videoTexture}));
  scene.add(contentPlane);
  contentPlane.rotateX(-Math.PI/2);
  contentPlane.rotateZ(Math.PI/27);
  contentPlane.position.set(1.0, 16, 0);
}

function postProcessing() {
  // post processing
  composer = new EffectComposer(renderer);

  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  const effectFXAA = new ShaderPass(FXAAShader);
  effectFXAA.uniforms["resolution"].value.set(
    1 / window.innerWidth,
    1 / window.innerHeight
  );
  composer.addPass(effectFXAA);

  loop();
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

    addContentPlane();
  }, undefined, 
  function (e) {
    console.error(e);
  }
  );
}

function loop() {

  // renderer.render(scene, camera);
  composer.render();
  // effect.render( scene, camera );

  window.requestAnimationFrame(loop);
}

init();

let boxPage = document.getElementById("box");

document.addEventListener("scroll", (event) => {

  // when scroll is greater than window height, show inside
  // vice versa
  if (window.scrollY >= window.innerHeight * 1.8){
    boxPage.style.opacity = 0;
  }
  else{
    boxPage.style.opacity = 1;
  }

  // camera zoom in as scroll
  if (window.scrollY < window.innerHeight * 2){
    let ratio = window.scrollY / (window.innerHeight * 1.8);
    camera.position.set(43 - 42 * ratio, 60 - 40 * ratio, 43 - 42 * ratio);
    camera.lookAt(0, 10 - 10 * ratio, 0)
  }
});
