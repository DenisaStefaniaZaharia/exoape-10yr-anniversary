import gsap from "gsap";
import SplitText from "gsap/SplitText";
import ScrollTrigger from "gsap/ScrollTrigger";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
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

// DRACO loader setup
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

const textureLoader = new THREE.TextureLoader();

const environmentMap = textureLoader.load("/environmentMaps/blockadesLabsSkybox/interior_views_cozy_wood_cabin_with_cauldron_and_p.jpg");
environmentMap.mapping = THREE.EquirectangularReflectionMapping;
environmentMap.colorSpace = THREE.SRGBColorSpace;

const torusMaterial = new THREE.MeshStandardMaterial({
  color: 0xb09983,
  roughness: 0.5,
  metalness: 0.9,
  wireframe: false,
});

const sunMaterial = new THREE.MeshBasicMaterial({
  color: 0xfffce8,
});

/**
 * Load Model
 */
const torus2 = new THREE.Mesh(new THREE.TorusGeometry(8, 0.06, 5, 80), torusMaterial);
torus2.scale.set(0.2, 0.2, 0.2);
torus2.rotation.set(1, 0, 0);
torus2.position.y = -0.3;
// torus2.position.set(0, -0.9, 0.5);
scene.add(torus2);

let disc;
gltfLoader.load("/glb/disc-texture.glb", (gltf) => {
  disc = gltf.scene;
  disc.scale.set(0.26, 0.26, 0.26);
  disc.rotation.set(-0.5, 0, -0.8);
  disc.position.y = 1;
  disc.position.x = 0;
  scene.add(disc);
});

//Sphere model
let sphereModel2;
gltfLoader.load("/glb/sphere.glb", (gltf) => {
  sphereModel2 = gltf.scene;
  sphereModel2.scale.set(0.2, 0.2, 0.2);
  sphereModel2.position.set(0, 1.6, -0.9);
  const sphereMaterial = new THREE.MeshStandardMaterial({
    color: "#232323",
    roughness: 0.5,
    metalness: 0.3,
  });

  //applied material to all meshes inside the GLTF model
  sphereModel2.traverse((child) => {
    if (child.isMesh) {
      child.material = sphereMaterial;
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  scene.add(sphereModel2);
});

const sun = new THREE.Mesh(new THREE.SphereGeometry(0.4, 20, 20), sunMaterial);
sun.position.set(0.6, 1.9, -0.9);
sun.scale.set(0.15, 0.15, 0.15);
scene.add(sun);

const bulbLight = new THREE.PointLight(0xfffce8, 2, 5);
bulbLight.position.copy(sun.position);
scene.add(bulbLight);

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 2.4);
scene.add(ambientLight);

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

  composer.setSize(sizes.width, sizes.height);
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(2, 2, 2);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0.75, 0);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Postprocessing: Bloom
 */
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
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

  controls.update();
  // Render
  composer.render();

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
