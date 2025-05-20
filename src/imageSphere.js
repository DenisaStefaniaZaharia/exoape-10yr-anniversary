import * as THREE from 'three'

// test sphere
// export function createSphere() {
//     const geometry = new THREE.SphereGeometry(1, 32, 32)
//     const material = new THREE.MeshBasicMaterial({ color: 0x00aaff })
//     const sphere = new THREE.Mesh(geometry, material)

//     return sphere
// }

export function addImageSphereToScene(scene) {
    const textureLoader = new THREE.TextureLoader()
    const textures = []
    const total = 18
    const totalPlanes = 50
    const radius = 3
    let loadedCount = 0

    const imagePaths = []
    for (let i = 1; i <= total; i++) {
        imagePaths.push(`/images/img${i}.jpg`)
    }

    imagePaths.forEach((path, i) => {
        textureLoader.load(
            path,
            (texture) => {
                texture.colorSpace = THREE.SRGBColorSpace
                texture.generateMipmaps = true
                texture.minFilter = THREE.LinearMipMapLinearFilter
                texture.magFilter = THREE.LinearFilter

                textures[i] = texture
                loadedCount++

                if (loadedCount === total) {
                    buildSphere()
                }
            },
            undefined,
            () => {
                console.error(`❌ Failed to load image: ${path}`)
            }
        )
    })

    function buildSphere() {
        const goldenAngle = Math.PI * (3 - Math.sqrt(5))
        const selectedTextures = [...textures]

        while (selectedTextures.length < totalPlanes) {
            const randomTexture = textures[Math.floor(Math.random() * textures.length)]
            selectedTextures.push(randomTexture)
        }

        selectedTextures.sort(() => Math.random() - 0.5)

        for (let i = 0; i < totalPlanes; i++) {
            const texture = selectedTextures[i]
            const iNormalized = (i + 0.5) / totalPlanes
            const phi = Math.acos(1 - 2 * iNormalized) //how far up and down the image goes on the sphere
            const theta = goldenAngle * i //rotation around the sphere

            const x = radius * Math.sin(phi) * Math.cos(theta) 
            const y = radius * Math.sin(phi) * Math.sin(theta)
            const z = radius * Math.cos(phi)

            const planeGeo = new THREE.PlaneGeometry(0.4, 0.5)
            const planeMat = new THREE.MeshBasicMaterial({
                map: texture,
                side: THREE.DoubleSide,
                transparent: true
            })

            const plane = new THREE.Mesh(planeGeo, planeMat)
            plane.position.set(x, y, z)
            plane.lookAt(0, 0, 0)

            plane.rotation.y += (Math.random() - 0.5) * 0.3
            plane.rotation.x += (Math.random() - 0.5) * 0.3

            scene.add(plane)
        }
    }
}

