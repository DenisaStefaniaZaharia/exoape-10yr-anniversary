import * as THREE from "three";
import gsap from "gsap";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

const parameters = {
  materialColor: "#ffeded",
};

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Objects
 */
//Textures

const textureLoader = new THREE.TextureLoader();
const gradientTexture = textureLoader.load("/textures/gradients/3.jpg");
const particleTexture = textureLoader.load("/textures/particles/1.png");
const mapTexture = textureLoader.load("/glb/disc-map.png");
const normalTexture = textureLoader.load("/glb/disc-normal.jpg");
const roughnessTexture = textureLoader.load("/glb/disc-roughness.jpg");

/**
 * Environment Map
 */
const rgbeLoader = new RGBELoader();

const environmentMap = textureLoader.load("/environmentMaps/blockadesLabsSkybox/interior_views_cozy_wood_cabin_with_cauldron_and_p.jpg");
environmentMap.mapping = THREE.EquirectangularReflectionMapping;
environmentMap.colorSpace = THREE.SRGBColorSpace;
// scene.environment = environmentMap;

gradientTexture.magFilter = THREE.NearestFilter;

//Material
const material = new THREE.MeshToonMaterial({
  color: parameters.materialColor,
  gradientMap: gradientTexture,
});

const torusMaterial = new THREE.MeshStandardMaterial({
  color: 0xb09983,
  roughness: 0.5,
  metalness: 0.9,
  wireframe: false,
});

const sunMaterial = new THREE.MeshStandardMaterial({
  color: 0xfffce8,
  emissive: 0xfffce8,
  emissiveIntensity: 10,
});

// DRACO loader setup
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/"); // Make sure you put the decoder files in /public/draco
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

//Meshes
const objectsDistance = 10;

//First Chapter
const torus = new THREE.Mesh(new THREE.TorusGeometry(8, 0.06, 5, 80), torusMaterial);
torus.scale.set(0.2, 0.2, 0.2); // scale down to 20% in all directions
torus.rotation.x = Math.PI * 0.3;
torus.rotation.z = Math.PI * 0.2;
torus.position.set(2.5, -0.4, 0.5);

const sun = new THREE.Mesh(new THREE.SphereGeometry(0.4, 20, 20), sunMaterial);
sun.position.copy(torus.position).add(new THREE.Vector3(-1.2, 1, 2));
sun.scale.set(0.1, 0.1, 0.1);

//Sphere model
let sphereModel;
gltfLoader.load("/glb/sphere.glb", (gltf) => {
  sphereModel = gltf.scene;
  sphereModel.scale.set(0.13, 0.13, 0.13);
  sphereModel.position.copy(torus.position).add(new THREE.Vector3(-0.8, 0.9, 2));

  const sphereMaterial = new THREE.MeshStandardMaterial({
    color: "#232323",
    roughness: 0.5,
    metalness: 0.3,
  });

  // apply material to all meshes inside the GLTF model
  sphereModel.traverse((child) => {
    if (child.isMesh) {
      child.material = sphereMaterial;
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  scene.add(sphereModel);
  sectionMeshes.push(sphereModel);
});

//Second Chapter
// const mesh2 = new THREE.Mesh(new THREE.ConeGeometry(1, 2, 32), material);
let awward;
gltfLoader.load("/glb/awwwards-v2.glb", (gltf) => {
  awward = gltf.scene;
  awward.scale.set(1.6, 1.6, 1.6);
  awward.position.x = objectsDistance * 1.4;
  awward.rotation.set(0, -0.5, 0);

  //   awward.position.copy(torus2.position).add(new THREE.Vector3(0.1, 1, 2));

  // apply material to all meshes inside the GLTF model
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

  scene.add(awward);
  sectionMeshes.push(awward);
  console.log(awward);
});

//Third Chapter
const torus2 = new THREE.Mesh(new THREE.TorusGeometry(8, 0.06, 5, 80), torusMaterial);
torus2.scale.set(0.2, 0.2, 0.2);
torus2.rotation.set(Math.PI / 2, -0.5, 2);
torus2.position.set(objectsDistance * 2.3, -0.9, 0.5);

const sun2 = new THREE.Mesh(new THREE.SphereGeometry(0.4, 20, 20), sunMaterial);
// sun2.position.set(objectsDistance * 2, 2, 1);
sun2.position.copy(torus2.position).add(new THREE.Vector3(1, 1.9, 2));
sun2.scale.set(0.1, 0.1, 0.1);

//Sphere model
let sphereModel2;
gltfLoader.load("/glb/sphere.glb", (gltf) => {
  sphereModel2 = gltf.scene;
  sphereModel2.scale.set(0.13, 0.13, 0.13);
  sphereModel2.position.copy(torus2.position).add(new THREE.Vector3(0.7, 1.4, 2));

  const sphereMaterial = new THREE.MeshStandardMaterial({
    color: "#232323",
    roughness: 0.5,
    metalness: 0.3,
  });

  // apply material to all meshes inside the GLTF model
  sphereModel2.traverse((child) => {
    if (child.isMesh) {
      child.material = sphereMaterial;
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  scene.add(sphereModel2);
  sectionMeshes.push(sphereModel2);
});

//Disc model
let disc;
gltfLoader.load("/glb/disc-texture.glb", (gltf) => {
  disc = gltf.scene;
  disc.scale.set(0.2, 0.2, 0.2);
  disc.rotation.set(Math.PI / 2, 0.7, 2.2);
  disc.position.copy(torus2.position).add(new THREE.Vector3(0.1, 1, 2));

  // apply material to all meshes inside the GLTF model
  disc.traverse((child) => {
    if (child.isMesh) {
      child.material = new THREE.MeshStandardMaterial({
        color: 0xe5d9cf,
        roughness: 2,
        metalness: 0,
        map: mapTexture,
        roughnessMap: roughnessTexture,
        normalMap: normalTexture,
      });
    }
  });

  scene.add(disc);
  sectionMeshes.push(disc);
});

//Fifth Chapter Infinite Model
let infiniteModel;
gltfLoader.load("/glb/infinite.glb", (gltf) => {
  infiniteModel = gltf.scene;
  infiniteModel.scale.set(0.4, 0.4, 0.4);
  infiniteModel.rotation.x = Math.PI;

  const infiniteMaterial = new THREE.MeshStandardMaterial({
    color: "#232323",
    roughness: 0.5,
    metalness: 0.3,
  });

  // apply material to all meshes inside the GLTF model
  infiniteModel.traverse((child) => {
    if (child.isMesh) {
      child.material = infiniteMaterial;
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  infiniteModel.position.set(objectsDistance * 3.5, -0.3, 0.5);
  scene.add(infiniteModel);
  sectionMeshes.push(infiniteModel);
});

scene.add(torus, sun, torus2, sun2);

const sectionMeshes = [torus, sun, torus2, sun2];

/**
 * Particles
 */

const state = {
  scroll: {
    position: 0,
    intensity: 0,
    lerped: {
      current: 0,
      previous: 0,
    },
  },
};

//Geometry
const particlesCount = 1500;
const positions = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount; i++) {
  positions[i * 3 + 0] = (Math.random() - 0.5) * objectsDistance * sectionMeshes.length * 2;
  positions[i * 3 + 1] = (Math.random() - 0.5) * 10; // Small range vertically
  positions[i * 3 + 2] = (Math.random() - 0.5) * 10; // Z-axis depth
}

const particlesGeometry = new THREE.BufferGeometry();
particlesGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

//Material
const particlesMaterial = new THREE.PointsMaterial({
  color: parameters.materialColor,
  size: 0.03,
  sizeAttenuation: true,
  transparent: true,
  //   opacity: 0.2,
  alphaMap: particleTexture,
  alphaTest: 0.001,
  blending: THREE.NormalBlending,
  depthWrite: false,
});

//Points
const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

// const trail = [];

// for (let i = 0; i < 20; i++) {
//   trail[i] = new THREE.Points(particlesGeometry, particlesMaterial);
//   scene.add(trail[i]);
// }

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

//particles function
// import { createParticleSystem } from "./particleSystem.js";

// const systems = [createParticleSystem("particles1"), createParticleSystem("particles2"), createParticleSystem("particles3")].filter(Boolean);

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
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Scroll
 */

let scrollX = window.scrollX;
let currentSection = 0;

window.addEventListener("scroll", () => {
  scrollX = window.scrollX;
  const newSection = Math.round(scrollX / sizes.width);

  if (newSection !== currentSection) {
    currentSection = newSection;

    //ROTATE OBJECTS GSAP
    // gsap.to(sectionMeshes[currentSection].rotation, {
    //   duration: 1.5,
    //   ease: "power2.inOut",
    //   x: "+=6",
    //   y: "+=3",
    //   z: "+=1.5",
    // });
  }
});

window.addEventListener(
  "wheel",
  function (event) {
    // Only apply on wide scrollable container
    if (document.body.scrollWidth > window.innerWidth) {
      event.preventDefault();
      window.scrollBy({
        left: event.deltaY * 0.5, // Reduce sensitivity and make it smoother
        behavior: "auto", // Remove smooth scrolling for more responsive feel
      });
    }
  },
  { passive: false }
);

/**
 *
 * Wheel
 */
const handleWheel = (event) => {
  //   event.preventDefault(); // Prevent normal vertical scrolling
  state.scroll.position -= event.deltaY * 0.05;
};

document.addEventListener("wheel", handleWheel);

// Handle resize
const handleResize = () => {
  state.dimensions.width = window.innerWidth;
  state.dimensions.height = window.innerHeight;

  particleSystems.forEach(({ camera, renderer }) => {
    camera.aspect = state.dimensions.width / state.dimensions.height;
    camera.updateProjectionMatrix();
    renderer.setSize(state.dimensions.width, state.dimensions.height);
  });
};
window.addEventListener("resize", handleResize);

/**
 * Cursor
 */

const cursor = {};
cursor.x = 0;
cursor.y = 0;

window.addEventListener("mousemove", (event) => {
  cursor.x = event.clientX / sizes.height - 0.5;
  cursor.y = event.clientY / sizes.height - 0.5;
});

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  // Update scroll
  //   state.scroll.lerped.previous = state.scroll.lerped.current;
  //   state.scroll.lerped.current = gsap.utils.interpolate(state.scroll.lerped.current, state.scroll.position, 0.1);

  //   state.scroll.intensity = Math.abs(state.scroll.lerped.previous - state.scroll.lerped.current);

  //Animate camera horizontally
  camera.position.x = (scrollX / sizes.width) * objectsDistance;

  const parallaxX = cursor.x * 0.5;
  const parallaxY = -cursor.y * 0.5;

  groupCamera.position.x += (parallaxX - groupCamera.position.x) * 5 * deltaTime;
  groupCamera.position.y += (parallaxY - groupCamera.position.y) * 5 * deltaTime;

  // Move the entire trail (optional, based on intensity)
  //   for (let index = 0; index < 20; index++) {
  //     trail[index].position.x = index * 0.1 * state.scroll.intensity;
  //   }

  //Rotate sphere around torus

  //   //Animate meshes
  //   for (const mesh of sectionMeshes) {
  //     mesh.rotation.x += deltaTime * 0.1;
  //     mesh.rotation.y += deltaTime * 0.12;
  //   }

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();

// Custom cursor setup
const customCursor = document.querySelector(".custom-cursor");
const cursorText = customCursor.querySelector("span");
const ctaInlineLinks = document.querySelectorAll(".cta-inline");

ctaInlineLinks.forEach((link) => {
  link.addEventListener("mouseenter", () => {
    customCursor.classList.add("visible");
    cursorText.textContent = "Click";
  });

  link.addEventListener("mouseleave", () => {
    customCursor.classList.remove("visible");
    cursorText.textContent = "Scroll";
  });
});

// Track mouse position
document.addEventListener("mousemove", (e) => {
  //show the cursor
  customCursor.classList.add("visible");

  gsap.to(customCursor, {
    x: e.clientX - 5,
    y: e.clientY - 3,
    duration: 0.2,
    ease: "power2.out",
  });
});
