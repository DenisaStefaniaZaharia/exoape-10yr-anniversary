import gsap from "gsap";
import SplitText from "gsap/SplitText";
import ScrollTrigger from "gsap/ScrollTrigger";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { AnimationMixer } from "three";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

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
const gltfLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");

//draco model
gltfLoader.load("/glb/number10F.glb", (gltf) => {
  gltf.scene.rotation.y = Math.PI;
  // gltf.scene.position.x = 5;
  gltf.scene.scale.set(4, 4, 4);
  scene.add(gltf.scene);
});
/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 2.4);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
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
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
// camera.position.set(2, 2, 2);
camera.position.set(-11, 0, 1);
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
 * Animate
 */
const clock = new THREE.Clock();
// let previousTime = 0;

const tick = () => {
  //   const elapsedTime = clock.getElapsedTime();
  //   const deltaTime = elapsedTime - previousTime;
  //   previousTime = elapsedTime;

  //   //Update mixer
  //   if (mixer != null) {
  //     mixer.update(deltaTime);
  //   }

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
