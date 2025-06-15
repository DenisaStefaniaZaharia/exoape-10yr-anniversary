import * as THREE from "three";
import gsap from "gsap";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

const parameters = {
  materialColor: "#ffeded",
};

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");
const dots = document.querySelectorAll(".dot");

// Scene
const scene = new THREE.Scene();

/**
 * Objects
 */
//Textures

const textureLoader = new THREE.TextureLoader();
const gradientTexture = textureLoader.load("/textures/gradients/3.jpg");
const particleTexture = textureLoader.load("/textures/particles/1.png");
// const mapTexture = textureLoader.load("/glb/disc-map.png");
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

const sunMaterial = new THREE.MeshBasicMaterial({
  color: 0xfffce8,
});

// DRACO loader setup
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

//Meshes
const objectsDistance = 10;

//First Chapter
const torusGeometry = new THREE.TorusGeometry(8, 0.06, 5, 80);
const torus = new THREE.Mesh(torusGeometry, torusMaterial);
torus.scale.set(0.2, 0.2, 0.2);
torus.rotation.x = Math.PI * 0.3;
torus.rotation.z = Math.PI * 0.2;
torus.position.set(2.5, -0.4, 0.5);

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
gltfLoader.load(
  "glb/sphere.glb",
  (gltf) => {
    sphereModel = gltf.scene;
    sphereModel.scale.set(0.13, 0.13, 0.13);
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
        const R = 1.6; // major radius
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
  },
  undefined,
  (error) => {
    console.error("❌ Failed to load sphere.glb:", error);
  }
);

//Second Chapter
let awward;
gltfLoader.load("/glb/awwwards-v2.glb", (gltf) => {
  awward = gltf.scene;
  awward.scale.set(1.6, 1.6, 1.6);
  awward.position.x = objectsDistance * 1.4;
  // awward.position.y = 0.3
  awward.rotation.set(-0.5, -0.5, -0.5);

  //applied material to all meshes inside the GLTF model
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

  //applied material to all meshes inside the GLTF model
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

  //applied material to all meshes inside the GLTF model
  disc.traverse((child) => {
    if (child.isMesh) {
      const mapTexture = child.material.map;
      child.material = new THREE.MeshStandardMaterial({
        color: 0xe5d9cf,
        metalness: 0.1,
        roughness: 1.5,
        map: mapTexture,
        roughnessMap: roughnessTexture,
        normalMap: normalTexture,
        roughnessMap: roughnessTexture,
      });
    }
  });

  scene.add(disc);
  sectionMeshes.push(disc);
});

const numLights = 3;
const radius = 1.5;
const speed = 0.5;
const lightArray = [];

//Fifth Chapter Infinite Model
let infiniteModel;
gltfLoader.load("/glb/infinite.glb", (gltf) => {
  infiniteModel = gltf.scene;
  infiniteModel.scale.set(0.4, 0.4, 0.4);
  infiniteModel.rotation.x = Math.PI;

  infiniteModel.traverse((child) => {
    if (child.isMesh) {
      child.material = torusMaterial;
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  infiniteModel.position.set(objectsDistance * 3.5, -0.3, 0.5);

  scene.add(infiniteModel);
  sectionMeshes.push(infiniteModel);

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

  infinityGroup.position.copy(infiniteModel.position);
});

const sectionMeshes = [];
scene.add(torus, sun, torus2, sun2);
sectionMeshes.push(torus, sun, torus2, sun2);
/**
 * Particles
 */

// const state = {
//   scroll: {
//     position: 0,
//     intensity: 0,
//     lerped: {
//       current: 0,
//       previous: 0,
//     },
//   },
// };

//Geometry
const particlesCount = 1500;
const positions = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount; i++) {
  positions[i * 3 + 0] = (Math.random() - 0.5) * objectsDistance * document.querySelectorAll(".section").length * 2;
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

// const ambientLight = new THREE.AmbientLight(0xffffff, 2.4);
// scene.add(ambientLight);

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

  composer.setSize(sizes.width, sizes.height); //
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
 * Scroll
 */

let scrollX = window.scrollX;
let currentSection = 0;

window.addEventListener("scroll", () => {
  scrollX = window.scrollX;
  const newSection = Math.round(scrollX / sizes.width);

  if (newSection !== currentSection) {
    currentSection = newSection;

    dots.forEach((dot, index) => {
      if (index === currentSection) {
        dot.classList.add("active");
      } else {
        dot.classList.remove("active");
      }
    });
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
// const handleWheel = (event) => {
//   //   event.preventDefault(); // Prevent normal vertical scrolling
//   state.scroll.position -= event.deltaY * 0.05;
// };

// document.addEventListener("wheel", handleWheel);

// // Handle resize
// const handleResize = () => {
//   state.dimensions.width = window.innerWidth;
//   state.dimensions.height = window.innerHeight;

//   // particleSystems.forEach(({ camera, renderer }) => {
//   //   camera.aspect = state.dimensions.width / state.dimensions.height;
//   //   camera.updateProjectionMatrix();
//   //   renderer.setSize(state.dimensions.width, state.dimensions.height);
//   // });
// };
// window.addEventListener("resize", handleResize);

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

  //3 suns celebration section
  lightArray.forEach(({ mesh, light, offset }) => {
    const t = elapsedTime * speed + offset;

    //parametric infinity shape (lemniscate of Gerono)
    const x = radius * Math.sin(t);
    const y = radius * Math.sin(t) * Math.cos(t);

    mesh.position.set(x, y, 0);
    light.position.copy(mesh.position);
  });

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

  // Render
  // renderer.render(scene, camera);

  composer.render();

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
