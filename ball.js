import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

let modelLoader = new GLTFLoader();

export class Ball{
  constructor(material, allObjects){
    this.model = undefined;

    modelLoader.load(
      "./models/deformed_ball.glb",
      function (gltf) {
        let ball = gltf.scene;
        ball.traverse(function (object) {
          if (object.isMesh) {
            // random materials
            object.material = material;
          }
        });
        ball.position.set(
          Math.random() * 600 - 300,
          Math.random() * 400 - 200,
          Math.random() * 600 - 300
        );
        let scale = Math.random() * 30 + 10;
        ball.scale.set(scale, scale, scale);
        ball.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        allObjects.add(ball);
      },
      undefined,
      function (e) {
        console.error(e);
      }
    );
  }
}