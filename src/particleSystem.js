import * as THREE from "three";
import gsap from "gsap";

/**
 * Create a reusable particle system
 */
export function createParticleSystem(containerId) {
  const textureLoader = new THREE.TextureLoader();
  const particleTexture = textureLoader.load("./textures/particles/1.png");

  const state = {
    scroll: {
      position: 0,
      intensity: 0,
      lerped: {
        current: 0,
        previous: 0,
      },
    },
    dimensions: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
  };

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, state.dimensions.width / state.dimensions.height, 0.1, 1000);
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(state.dimensions.width, state.dimensions.height);
  renderer.setClearColor(0x000000, 0);

  const container = document.getElementById(containerId);
  if (!container) return null;
  container.appendChild(renderer.domElement);

  // Particles
  const geometry = new THREE.BufferGeometry();
  const material = new THREE.PointsMaterial({
    color: 0xd5bdbd,
    size: 0.2,
    transparent: true,
    opacity: 0.2,
    alphaMap: particleTexture,
    alphaTest: 0.001,
    blending: THREE.NormalBlending,
    depthWrite: false,
  });

  const positions = [];
  for (let i = 0; i < 700; i++) {
    positions.push((Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200);
  }
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));

  const trail = [];
  for (let i = 0; i < 100; i++) {
    const points = new THREE.Points(geometry, material);
    trail.push(points);
    scene.add(points);
  }

  // Wheel + resize
  const onWheel = (e) => {
    state.scroll.position -= e.deltaY * 0.05;
  };
  document.addEventListener("wheel", onWheel);

  const onResize = () => {
    state.dimensions.width = window.innerWidth;
    state.dimensions.height = window.innerHeight;
    camera.aspect = state.dimensions.width / state.dimensions.height;
    camera.updateProjectionMatrix();
    renderer.setSize(state.dimensions.width, state.dimensions.height);
  };
  window.addEventListener("resize", onResize);

  const update = () => {
    state.scroll.lerped.previous = state.scroll.lerped.current;
    state.scroll.lerped.current = gsap.utils.interpolate(state.scroll.lerped.current, state.scroll.position, 0.1);
    state.scroll.intensity = Math.abs(state.scroll.lerped.previous - state.scroll.lerped.current);

    for (let i = 0; i < trail.length; i++) {
      trail[i].position.x = i * 0.1 * state.scroll.intensity;
    }

    camera.position.z = 5 + state.scroll.lerped.current * 0.1;
    renderer.render(scene, camera);
  };

  gsap.ticker.add(update);

  return {
    scene,
    camera,
    renderer,
    cleanup: () => {
      gsap.ticker.remove(update);
      document.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", onResize);
      container.removeChild(renderer.domElement);
    },
  };
}
