import gsap from "gsap";
import SplitText from "gsap/SplitText";
import ScrollTrigger from "gsap/ScrollTrigger";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { AnimationMixer } from "three";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

gsap.registerPlugin(SplitText, ScrollTrigger);

// Custom cursor (unchanged)
const customCursor = document.querySelector(".custom-cursor");
const cursorText = customCursor.querySelector("span");

document.addEventListener("mousemove", (e) => {
  customCursor.classList.add("visible");

  gsap.to(customCursor, {
    x: e.clientX - 5,
    y: e.clientY - 3,
    duration: 0.2,
    ease: "power2.out",
  });
});

const clickableElements = document.querySelectorAll('a, button, [data-cursor="hover"]');
clickableElements.forEach((element) => {
  element.addEventListener("mouseenter", () => {
    customCursor.classList.add("visible");
    cursorText.textContent = "Click";
  });

  element.addEventListener("mouseleave", () => {
    customCursor.classList.remove("visible");
    cursorText.textContent = "Scroll";
  });
});

document.fonts.ready.then(() => {
  gsap.set(".title-line", { opacity: 1 });

  let title;
  SplitText.create(".title-line", {
    type: "words,lines",
    linesClass: "line",
    autoSplit: true,
    mask: "lines",
    onSplit: (self) => {
      title = gsap.from(self.lines, {
        duration: 5,
        yPercent: 100,
        opacity: 0,
        stagger: 0.2,
        ease: "expo.out",
      });
      return title;
    },
  });
});

/**
 * Base
 */

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Load Model
 */
//DRACO loader setup
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

/**
 * Objects
 */

// Material
const torusMaterial = new THREE.MeshStandardMaterial({
  color: 0xb09983,
  roughness: 0.5,
  metalness: 0.9,
  wireframe: false,
});

const sunMaterial = new THREE.MeshBasicMaterial({
  color: 0xfffce8,
});

const objectsDistance = 4;

// Meshes

const numLights = 3;
const radius = 1.5;
const speed = 0.5;
const lightArray = [];

//Infinite model
let infinite;
gltfLoader.load("/glb/infinite.glb", (gltf) => {
  infinite = gltf.scene;
  infinite.scale.set(0.4, 0.4, 0.4);
  infinite.rotation.x = Math.PI;
  infinite.position.y = -objectsDistance * 1.2;

  infinite.traverse((child) => {
    if (child.isMesh) {
      child.material = torusMaterial;
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  scene.add(infinite);
  sectionMeshes.push(infinite);

  const infinityGroup = new THREE.Group();
  scene.add(infinityGroup);

  for (let i = 0; i < numLights; i++) {
    const sunSphere = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), sunMaterial);

    const pointLight = new THREE.PointLight(0xfffce8, 2, 3);
    pointLight.castShadow = false;

    infinityGroup.add(sunSphere);
    infinityGroup.add(pointLight);

    lightArray.push({
      mesh: sunSphere,
      light: pointLight,
      offset: (i / numLights) * Math.PI * 2, // phase offset
    });
  }

  infinityGroup.position.copy(infinite.position);
});

// //Ten model
// let tenModel;
// gltfLoader.load("/glb/sper.glb", (gltf) => {
//   tenModel = gltf.scene;
//   tenModel.scale.set(1, 1, 1);
//   tenModel.rotation.y = Math.PI;
//   tenModel.position.y = -objectsDistance * 3.8;

//   scene.add(tenModel);
//   sectionMeshes.push(tenModel);
//   console.log(tenModel);
// });

let mixer = null;
let tenModel;
gltfLoader.load("/glb/sper2.glb", (gltf) => {
  tenModel = gltf.scene;
  mixer = new THREE.AnimationMixer(tenModel);

  gltf.animations.forEach((clip) => {
    const action = mixer.clipAction(clip);
    action.play();
    action.timeScale = 1.5; // 2x faster, default is 1
  });

  tenModel.scale.set(1, 1, 1);
  tenModel.rotation.y = -Math.PI / 2;
  tenModel.position.x += 1;

  tenModel.position.y = -objectsDistance * 3.8;

  // tenModel.traverse((child) => {
  //   if (child.isMesh) {
  //     // Rotate the plane more
  //     child.rotation.z += Math.PI / 2; // ↻ rotate 45° more
  //   }
  // });
  sectionMeshes.push(tenModel);
  scene.add(tenModel);
});

const sectionMeshes = [];

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 20;
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = -7;
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Scroll
 */
let scrollY = window.scrollY;

window.addEventListener("scroll", () => {
  scrollY = window.scrollY;
});

/**
 * Cursor
 */
const cursor = {};
cursor.x = 0;
cursor.y = 0;

window.addEventListener("mousemove", (event) => {
  cursor.x = event.clientX / sizes.width - 0.5;
  cursor.y = event.clientY / sizes.height - 0.5;
});

/**
 * Camera
 */
//Group camera for scrolling
const groupCamera = new THREE.Group();
scene.add(groupCamera);

// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100);
camera.position.z = 6;
groupCamera.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Postprocessing: Bloom
 */
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
renderPass.clear = true;
renderPass.clearAlpha = 0;
composer.addPass(renderPass);

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(sizes.width, sizes.height),
  1.5, // strength
  0.4, // radius
  0.85 // threshold
);
composer.addPass(bloomPass);

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  //Update mixer
  if (mixer != null) {
    mixer.update(deltaTime);
  }

  //3 suns celebration section
  lightArray.forEach(({ mesh, light, offset }) => {
    const t = elapsedTime * speed + offset;

    //parametric infinity shape (lemniscate of Gerono)
    const x = radius * Math.sin(t);
    const y = radius * Math.sin(t) * Math.cos(t);

    mesh.position.set(x, y, 0);
    light.position.copy(mesh.position);
  });

  // Animate camera
  camera.position.y = (-scrollY / sizes.height) * objectsDistance;

  const parallaxX = cursor.x * 0.5;
  const parallaxY = -cursor.y * 0.5;

  groupCamera.position.x += (parallaxX - groupCamera.position.x) * 5 * deltaTime;
  groupCamera.position.y += (parallaxY - groupCamera.position.y) * 5 * deltaTime;

  // Render
  composer.render();

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();

const params = new URLSearchParams(window.location.search);
const sectionId = params.get("from");

const closeBtn = document.getElementById("closeBtn");
if (sectionId) {
  closeBtn.href = `chapters.html#${sectionId}`;
} else {
  closeBtn.href = "chapters.html";
}
