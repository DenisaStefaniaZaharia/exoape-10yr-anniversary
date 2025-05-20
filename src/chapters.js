import * as THREE from 'three'
gsap.registerPlugin(ScrollTrigger);

/**
 * Base
 */
// Canvas
// const canvas = document.querySelector('canvas.webgl')
const $container = document.querySelector("[data-select='container']");
const $canvas = document.querySelector("[data-select='canvas']");

// Scene
const scene = new THREE.Scene()

// Sections
const contents = gsap.utils.toArray("#horizontal .content");
const dots = document.querySelectorAll('.dot');

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
      width: $container.offsetWidth,
      height: $container.offsetHeight,
    },
  };

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const particleTexture = textureLoader.load('./textures/particles/1.png')


/**
 * Particles
 */

// Geometry
const starGeometry = new THREE.BufferGeometry()
const particlesCount = 2000

const positions = new Float32Array(particlesCount * 3) // Multiply by 3 because each position is composed of 3 values (x, y, z)
const colors = new Float32Array(particlesCount * 3)

const colorChoices = [
  new THREE.Color('#D5BDBD'), 
  new THREE.Color('#E4E0DB'), 
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
    size: 0.5,
    sizeAttenuation: true,
    transparent : true,
    alphaMap : particleTexture,
    alphaTest : 0.001,
    blending: THREE.NormalBlending,
    depthWrite: false,
    vertexColors: true
})

//Points
// const particles = new THREE.Points(starGeometry, starMaterial)
// scene.add(particles)
  

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
    event.preventDefault(); // Prevent normal vertical scrolling
    state.scroll.position -= event.deltaY * 0.05;
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
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 3
scene.add(camera)

 /**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: $canvas,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Scroll
 */

// Horizontal Scroll Animation
const horizontalScroll = gsap.to(contents, {
    xPercent: -100 * (contents.length - 1),
    ease: "none",
    scrollTrigger: {
        trigger: "#horizontal",
        pin: true,
        scrub: 1,
        snap: 1 / (contents.length - 1),
        end: () => "+=" + document.querySelector("#horizontal").offsetWidth,
        onUpdate: self => {
            const progress = self.progress;
            const index = Math.round(progress * (contents.length - 1));

            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
        }
    }
});

/**
 * Animate
 */
const handleTick = () => {
    state.scroll.lerped.previous = state.scroll.lerped.current;
    state.scroll.lerped.current = gsap.utils.interpolate(
      state.scroll.lerped.current,
      state.scroll.position,
      0.1
    );
  
    state.scroll.intensity = Math.abs(
      state.scroll.lerped.previous - state.scroll.lerped.current
    );
  
    // Move the entire trail (optional, based on intensity)
    for (let index = 0; index < 100; index++) {
      trail[index].position.x = index * 0.1 * state.scroll.intensity;
    }
  
    // Move camera horizontally 
    camera.position.x = -state.scroll.lerped.current;
  
  
    renderer.render(scene, camera);
  };
  
    
gsap.ticker.add(handleTick);