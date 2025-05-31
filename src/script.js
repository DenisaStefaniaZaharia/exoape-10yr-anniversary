import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import gsap from 'gsap'
import { addImageSphereToScene } from './imageSphere.js'

/**
 * Base
 */
// Debug
// const gui = new GUI()

// Canvas
const $container = document.querySelector("[data-select='container']");
const $canvas = document.querySelector("[data-select='canvas']");


const state = {
  scroll: {
    position: 9,
    intensity: 0,
    lerped: {
      current: 9,
      previous: 9,
    },
  },
  dimensions: {
    width: $container.offsetWidth,
    height: $container.offsetHeight,
  },
};

  
// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */

const textureLoader = new THREE.TextureLoader();
const particleTexture = textureLoader.load('/textures/particles/1.png')

/**
 * Sphere
 */
const sphereGroup = addImageSphereToScene(scene, (sphereGroup) => {
  gsap.to(sphereGroup.position, {
    x: 0,
    z: 0,
    duration: 2,
    ease: 'power2.out'
  })

  gsap.to(sphereGroup.position, {
    x: 0,
    z: 0,
    duration: 6,
    ease: 'power2.out'
  })
  
  gsap.to(sphereGroup.rotation, {
    y: Math.PI * 2,
    duration: 6,
    ease: 'power2.inOut'
  })

  //   gsap.to(sphereGroup.position, {
  //   y: "+=0.5",        // Float up a bit
  //   duration: 1.9,     // Smooth and slow
  //   repeat: -1,        // Infinite loop
  //   yoyo: true,        // Go back and forth
  //   ease: "sine.inOut" // Natural floating feel
  // })

  
})

/**
 * Particles
 */

// Geometry
const starGeometry = new THREE.BufferGeometry()
const particlesCount = 1000

const positions = new Float32Array(particlesCount * 3) // Multiply by 3 because each position is composed of 3 values (x, y, z)
const colors = new Float32Array(particlesCount * 3)

const colorChoices = [
  new THREE.Color('#D5BDBD'), 
  new THREE.Color('#3385FF'), 
  new THREE.Color('#E4E0DB') 
]

for(let i = 0; i < particlesCount * 3; i++) 
{
  positions[i * 3 + 0] = (Math.random() - 0.5) * 200
  positions[i * 3 + 1] = (Math.random() - 0.5) * 200
  positions[i * 3 + 2] = (Math.random() - 0.5) * 200

  const pickedColor = colorChoices[Math.floor(Math.random() * colorChoices.length)]

  colors[i * 3 + 0] = pickedColor.r
  colors[i * 3 + 1] = pickedColor.g
  colors[i * 3 + 2] = pickedColor.b
}

starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3)) 
starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))


// Material
const starMaterial = new THREE.PointsMaterial({
  size: 0.2,
  sizeAttenuation: true,
  transparent : true,
  alphaMap : particleTexture,
  alphaTest : 0.001,
  blending: THREE.NormalBlending,
  depthWrite: false,
  vertexColors: true
})


const trail = [];

for (let i = 0; i < 100; i++) {
  trail[i] = new THREE.Points(starGeometry, starMaterial);
  scene.add(trail[i]);
}


/**
 *
 * Wheel
 */
const handleWheel = (event) => {
  state.scroll.position -= event.deltaY * 0.05;

  state.scroll.position = THREE.MathUtils.clamp(state.scroll.position, 1.5, 12) ////keeps camera between z = 1.5 and z = 12
};

document.addEventListener('wheel', handleWheel);


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Pre-loader
 */
gsap.to(".pre-loader-logo.fill", {
  clipPath: "inset(0% 0 0 0)", // fully revealed
  duration: 1.2,
  ease: "power2.out"
})

//Hide preloader after animation
gsap.to(".preloader", {
  opacity: 0,
  duration: 0.5,
  delay: 1.4,
  onComplete: () => {
    document.querySelector(".preloader").style.display = "none"
  }
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, $canvas)
controls.enableDamping = true

/**
 * Text
 */
const introText = document.querySelector('.intro-text')

/**
 * Cursor
 */
const customCursor = document.querySelector('.custom-cursor')

//Track mouse position
document.addEventListener('mousemove', (e) => {
  // Show the cursor
  customCursor.classList.add('visible')


// Smooth follow using GSAP
gsap.to(customCursor, {
  x: e.clientX - 5,
  y: e.clientY - 3,
  duration: 0.2,
  ease: 'power2.out'
  })
})

const cursorText = customCursor.querySelector('span')
const ctaInline = document.querySelector('.cta-inline')

// When mouse enters the "click" word
ctaInline.addEventListener('mouseenter', () => {
  customCursor.classList.add('visible')
  cursorText.textContent = 'Click'
})

// When mouse leaves the "click" word
ctaInline.addEventListener('mouseleave', () => {
  customCursor.classList.remove('visible')
  cursorText.textContent = 'Scroll'
})


/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({ canvas: $canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


/**
 * Animate
 */
const handleTick = (time, delta) => {
  
  const cameraZ = camera.position.z
  const overlay = document.querySelector('.overlay')

  if (cameraZ < 3) {
    introText.classList.add('visible')
    overlay.classList.add('visible')
  } else {
    introText.classList.remove('visible')
    overlay.classList.remove('visible')
  }
  

  // Smoothly interpolate the scroll value
  state.scroll.lerped.previous = state.scroll.lerped.current;
  
  state.scroll.lerped.current = gsap.utils.interpolate(
    state.scroll.lerped.current,
    state.scroll.position,
    0.1
  );
  
  // Measure how much scrolling is happening
  state.scroll.intensity = Math.abs(
    state.scroll.lerped.previous - state.scroll.lerped.current
  );
  
  // Move 100 trail points based on scroll intensity
  for (let index = 0; index < 100; index++)
  {
    trail[index].position.z = index * 0.1 * state.scroll.intensity;
  }
  
  // Move the camera based on the interpolated scroll
  camera.position.z = state.scroll.lerped.current;
  
  // Render scene
  renderer.render(scene, camera);
  
};
  
  // GSAP calls handleTick automatically every frame
  gsap.ticker.add(handleTick);
