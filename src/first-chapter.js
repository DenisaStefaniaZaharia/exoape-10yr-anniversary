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
const torusGeometry = new THREE.TorusGeometry(8, 0.06, 5, 80);
const torus = new THREE.Mesh(torusGeometry, torusMaterial);
torus.scale.set(0.3, 0.3, 0.3);
torus.rotation.x = Math.PI * 0.3;
torus.rotation.z = Math.PI * 0.2;
torus.rotation.y = Math.PI * 0.1;
torus.position.y = -objectsDistance * 5;

function getTorusPoint(R, r, u, v) {
  const x = (R + r * Math.cos(v)) * Math.cos(u);
  const y = (R + r * Math.cos(v)) * Math.sin(u);
  const z = r * Math.sin(v);
  return new THREE.Vector3(x, y, z);
}

const sun = new THREE.Mesh(new THREE.SphereGeometry(0.4, 20, 20), sunMaterial);
sun.position.copy(torus.position).add(new THREE.Vector3(-1.2, 1, 2));
sun.scale.set(0.1, 0.1, 0.1);

const bulbLight = new THREE.PointLight(0xfffce8, 2, 5); // color, intensity, distance
bulbLight.position.copy(sun.position);
scene.add(bulbLight);

//Sphere model
let sphereModel;
gltfLoader.load("/glb/sphere.glb", (gltf) => {
  sphereModel = gltf.scene;
  sphereModel.scale.set(0.2, 0.2, 0.2);
  sphereModel.position.copy(torus.position).add(new THREE.Vector3(-0.8, 0.9, 2));

  const sphereMaterial = new THREE.MeshStandardMaterial({
    color: "#232323",
    roughness: 0.5,
    metalness: 0.3,
  });

  //applied  material to all meshes inside the GLTF model
  sphereModel.traverse((child) => {
    if (child.isMesh) {
      child.material = sphereMaterial;
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  scene.add(sphereModel);
  sectionMeshes.push(sphereModel);

  //Glow light that follows sphere around torus
  const glowLight = new THREE.PointLight(0xfffce8, 2, 5);
  scene.add(glowLight);
  const glowGeometry = new THREE.SphereGeometry(0.1, 16, 16);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0xfffce8,
    transparent: true,
    opacity: 0.4,
  });
  const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
  scene.add(glowMesh);

  let angle = { u: 0 };

  gsap.to(angle, {
    u: Math.PI * 2,
    repeat: -1,
    duration: 10,
    ease: "none",
    onUpdate: () => {
      const R = 2.4; // major radius
      const r = 0.07; // minor radius
      const v = Math.PI / 4; // fixed around tube

      const pos = getTorusPoint(R, r, angle.u, v);

      const localPos = getTorusPoint(R, r, angle.u, v);
      const worldPos = localPos.clone().applyEuler(torus.rotation).add(torus.position);
      sphereModel.position.copy(worldPos);

      sphereModel.rotation.y = angle.u;

      //animate light
      glowLight.position.copy(worldPos);
      glowMesh.position.copy(worldPos);

      //animate sun
      const sunOrbitRadius = 0.5; // distance from the sphere
      const orbitSpeed = 2; // speed multiplier for orbit
      const orbitAngle = angle.u * orbitSpeed;

      const offsetX = sunOrbitRadius * Math.cos(orbitAngle);
      const offsetY = sunOrbitRadius * Math.sin(orbitAngle);

      const sunOffset = new THREE.Vector3(offsetX, offsetY, 0);
      sun.position.copy(worldPos.clone().add(sunOffset));
      bulbLight.position.copy(sun.position); //light follow the sun
    },
  });
});

const textureLoader = new THREE.TextureLoader();

const environmentMap = textureLoader.load("/environmentMaps/blockadesLabsSkybox/interior_views_cozy_wood_cabin_with_cauldron_and_p.jpg");
environmentMap.mapping = THREE.EquirectangularReflectionMapping;
environmentMap.colorSpace = THREE.SRGBColorSpace;

//Award model
let award;
gltfLoader.load("/glb/awwwards-v2.glb", (gltf) => {
  award = gltf.scene;
  award.scale.set(1.5, 1.5, 1.5);
  award.position.y = -objectsDistance * 7.6;
  award.rotation.set(-0.4, -0.3, -0.4);

  gltf.scene.traverse((child) => {
    if (child.isMesh) {
      if (child.name === "w") {
        // gold "W"
        child.material = new THREE.MeshPhysicalMaterial({
          color: 0xfac562,
          metalness: 1,
          roughness: 0.2,
          reflectivity: 1,
          clearcoat: 1,
          envMap: environmentMap,
          envMapIntensity: 1.5,
        });
      }

      if (child.name === "awwwards") {
        child.material = new THREE.MeshPhysicalMaterial({
          color: 0x000000,
          metalness: 1,
          roughness: 0.2,
          clearcoat: 1,
          clearcoatRoughness: 0.1,
          envMap: environmentMap,
          envMapIntensity: 0.3,
        });
      }
    }
  });

  scene.add(award);
  sectionMeshes.push(award);
});

const sectionMeshes = [];
scene.add(torus, sun);
sectionMeshes.push(torus, sun);

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
