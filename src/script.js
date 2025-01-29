import * as THREE from 'three'
import gsap from 'gsap'
import MeshItem from './MeshItem'
import Loader from './js/Loader'

/**
 * Setup
 */
const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const observeResize = () => {
    const resizeHandler = () => {
        sizes.width = window.innerWidth
        sizes.height = window.innerHeight

        camera.aspect = sizes.width / sizes.height
        camera.updateProjectionMatrix()

        renderer.setSize(sizes.width, sizes.height)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    }

    window.addEventListener('resize', resizeHandler)

    return () => {
        window.removeEventListener('resize', resizeHandler)
    }
}

observeResize()

const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 2000)
camera.position.set(0, 0, 1600)
scene.add(camera)

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Objects
 */
const material = new THREE.MeshBasicMaterial(0xff0000)
const objectsDistance = sizes.height;

const mesh1 = MeshItem(1000, 667)
const mesh2 = MeshItem(450, 581)
const mesh3 = MeshItem(553, 600)
const mesh4 = MeshItem(600, 600)

const sectionMeshes = [mesh1, mesh2, mesh3, mesh4]

sectionMeshes.forEach((mesh, i) =>
  mesh.position.y = -objectsDistance * i
)

scene.add(mesh1, mesh2, mesh3, mesh4)

const loader = new Loader()
loader.loadTextures((textures) => {
    document.body.classList.remove("loading");

    sectionMeshes.forEach((mesh, i) =>
      mesh.material.uniforms.uTexture.value = textures[i]
    )

    observeScroll()
    const section = Math.round(scrollY / sizes.height)
    onSectionEnter(section)
    tick()
})


/**
 * Scroll
 */
let scrollY = window.scrollY
let currentSection = -1


// shift 
let shift = 0

const observeScroll = () => {
    const scrollHandler = () => {
        scrollY = window.scrollY

        const newSection = Math.round(scrollY / sizes.height)

        if (currentSection !== newSection) {
            shift += newSection - currentSection
            currentSection = newSection

            onSectionEnter(newSection)
        }
    }

    window.addEventListener('scroll', scrollHandler)

    return () => {
        window.removeEventListener('scroll', scrollHandler)
    }
}

const onSectionEnter = (section) => {
    gsap.to(
        sectionMeshes[section].material.uniforms.uProgress,
        {
            duration: 3.0,
            value: 1.0,
        }
    )
}

/**
 * Tick
 */
const clock = new THREE.Clock()
let time = 0
let targetPosY = -scrollY

const lerp = (a, b, t) => {
    return a + (b - a) * t;
}

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - time
    time = elapsedTime

    targetPosY = lerp(targetPosY, -scrollY, 0.1)
    camera.position.y = targetPosY
    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
}
