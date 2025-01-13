import * as THREE from 'three'
import image1 from '../../static/textures/01.webp'
import image2 from '../../static/textures/02.webp'
import image3 from '../../static/textures/03.webp'
import image4 from '../../static/textures/04.webp'

export default class Loader {
    loadTextures(onComplete) {
        const textureLoader = new THREE.TextureLoader()
        let loadCount = 0
        const imageSources = [image1, image2, image3, image4]
        const textures = []
        
        imageSources.forEach((src, index) => {
            const onLoad = (texture) => {
                textures[index] = texture
    
                loadCount += 1
                if (loadCount == imageSources.length) {
                    onComplete(textures)
                }
            }
            textureLoader.load(src, onLoad)
        })
    }
}