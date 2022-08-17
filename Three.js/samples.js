// ######
// SAMPLE 1 - 3D SCENE SETUP
// TYPESCRIPT
// ######

import "./style.scss"
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GUI } from 'dat.gui'
import { Box3, BufferGeometry, Color, CubeTexture, DataTexture, Intersection, Object3D, Vector3 } from "three"
import { FlakesTexture } from 'three/examples/jsm/textures/FlakesTexture'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

//VARIABLES

const boardColor1 = 0x8a8a8a
const boardColor2 = 0xd6d6d6

//MANAGER
const manager = new THREE.LoadingManager()

manager.onProgress = function (url, loaded, total) {
	console.log(url, loaded, total)
}

manager.onError = function (url) {
	console.log('There was an error loading ' + url)
}

//TEXTURES
const textureLoader = new THREE.TextureLoader(manager)

const earthNormal = textureLoader.load('/earth-normal.jpg')

const bg = textureLoader.load('./bg.jpeg', () => {
	const rTarget = new THREE.WebGLCubeRenderTarget(bg.image.height)
	rTarget.fromEquirectangularTexture(renderer, bg)
	scene.background = rTarget.texture
})

//GUI
const gui = new GUI()
const folder = gui.addFolder('Folder')

const sizes = {
	width: window.innerWidth,
	height: window.innerHeight
}

const canvas = document.querySelector('.webgl')

//SCENE
const scene = new THREE.Scene()

// scene.fog = new THREE.Fog(0xffffff, 10, 20)

//CAMERA
const camera = new THREE.PerspectiveCamera(
	75,
	sizes.width / sizes.height,
	0.1,
	1000
)

camera.position.set(10, 10, 0)
camera.lookAt(0, 0, 0)

//LIGHTS
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
const light = new THREE.PointLight(0xffffff, 1)
light.position.set(20, 100, -70)

//RENDERER
const renderer = new THREE.WebGL1Renderer({
	canvas: canvas as HTMLElement,
	alpha: false as boolean,
	// antialias: true as boolean
})

// renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.25

//RAYCASTER
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()
const objs: THREE.Mesh[] = []


//MESH

let map: { [key: string]: any } = {}

let selected: any = []

const boxGroup = new THREE.Group()

const texture = new THREE.CanvasTexture(new FlakesTexture())

const createSphere = (x: number, z: number, map: any, color: number) => {

	new RGBELoader(manager).load('/texture.hdr', function (hdrmap: any) {

		texture.wrapS = THREE.RepeatWrapping
		texture.wrapT = THREE.RepeatWrapping
		texture.repeat.x = 10
		texture.repeat.y = 6

		const envmap = envmaploader.fromCubemap(hdrmap)

		const sphereParams = {
			wireframe: false,
			// normalMap: earthNormal,
			// normalScale: new THREE.Vector2(1, 10),
			// emissiveIntensity: 2
			clearcoat: 1.0,
			clearcoatRoughness: 0.1,
			metalness: 0.9,
			roughness: 0.5,
			color: color,
			// color: 0x8418ca,
			// color: 0x1a4fd6,
			normalMap: texture,
			normalScale: new THREE.Vector2(0.15, 0.15),
			envMap: envmap.texture,
			sheen: 1,
			transparent: true,
			opacity: 1
		}

		sphere = new THREE.Mesh(
			new THREE.SphereGeometry(0.3, 64, 64),
			new THREE.MeshPhysicalMaterial(sphereParams)
		)

		sphere.position.set(x, 1.3, z)

		sphere.name = `sphere${x}_${z}`

		sphere.userData.hovered = false
		sphere.userData.destination = false
		sphere.userData.selected = false
		sphere.userData.color = color

		const sphereBox = new THREE.Box3().setFromObject(sphere)

		map[`sphere${x}_${z}`] = sphere

		scene.add(sphere)
	})
}

// ######
// SAMPLE 2 - 3D CAMERA CONTROLLER
// REACT
// ######

import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const CameraControls = () => {

	const cameraPositionY = 6

	const KEYS = {
		'w': 87,
		's': 83,
		'a': 65,
		'd': 68,
	}

	const { camera, gl, mouse, scene } = useThree()

	class InputController {
		constructor(target) {
			this.target = target || document
			this.initialize()
		}

		initialize() {
			this.current = {
				leftButton: false,
				rightButton: false,
				mouseXDelta: 0,
				mouseYDelta: 0,
				mouseX: 0,
				mouseY: 0,
			}
			this.previous = null
			this.keys = {}
			this.previouskeys = {}
			this.target.addEventListener('mousedown', (e) => this.onMouseDown(e), false)
			this.target.addEventListener('mousemove', (e) => this.onMouseMove(e), false)
			this.target.addEventListener('mouseup', (e) => this.onMouseUp(e), false)
			this.target.addEventListener('keydown', (e) => this.onKeyDown(e), false)
			this.target.addEventListener('keyup', (e) => this.onKeyUp(e), false)
		}

		onMouseMove(e) {
			this.current.mouseX = e.pageX - window.innerWidth / 2
			this.current.mouseY = e.pageY - window.innerHeight / 2

			if (this.previous === null) {
				this.previous = { ...this.current }
			}

			this.current.mouseXDelta = this.current.mouseX - this.previous.mouseX
			this.current.mouseYDelta = this.current.mouseY - this.previous.mouseY
		}

		onMouseDown(e) {
			this.onMouseMove(e)

			switch (e.button) {
				case 0: {
					this.current.leftButton = true
					break
				}
				case 2: {
					this.current.rightButton = true
					break
				}
			}
		}

		onMouseUp(e) {
			this.onMouseMove(e)

			switch (e.button) {
				case 0: {
					this.current.leftButton = false
					break
				}
				case 2: {
					this.current.rightButton = false
					break
				}
			}
		}

		onKeyDown(e) {
			this.keys[e.keyCode] = true
		}

		onKeyUp(e) {
			this.keys[e.keyCode] = false
		}

		key(keyCode) {
			return !!this.keys[keyCode]
		}

		isReady() {
			return this.previous !== null
		}

		update() {
			if (this.previous !== null) {
				this.current.mouseXDelta = this.current.mouseX - this.previous.mouseX
				this.current.mouseYDelta = this.current.mouseY - this.previous.mouseY

				this.previous = { ...this.current }
			}
		}
	}

	class FirstPersonCamera {
		constructor(camera, objects) {
			this.camera = camera
			this.input = new InputController()
			this.rotation = new THREE.Quaternion()
			this.translation = new THREE.Vector3(0, cameraPositionY, 0)
			this.phi = 0
			this.phiSpeed = 8
			this.theta = 0
			this.thetaSpeed = 5
			this.headBobActive = false
			this.headBobTimer = 0
			this.objects = objects
		}

		update(timeElapsedS) {
			this.updaterotation(timeElapsedS)
			this.updatecamera(timeElapsedS)
			this.updatetranslation(timeElapsedS)
			// this.updateHeadBob(timeElapsedS)
			this.input.update(timeElapsedS)
		}

		updatecamera() {
			this.camera.quaternion.copy(this.rotation)
			this.camera.position.copy(this.translation)
			this.camera.position.y += Math.sin(this.headBobTimer * 10) * 1.5

			const forward = new THREE.Vector3(0, 0, -1)
			forward.applyQuaternion(this.rotation)

			const dir = forward.clone()

			forward.multiplyScalar(100)
			forward.add(this.translation)

			let closest = forward
			const result = new THREE.Vector3()
			const ray = new THREE.Ray(this.translation, dir)

			for (let i = 0; i < this.objects.length; ++i) {
				if (ray.intersectBox(this.objects[i], result)) {
					if (result.distanceTo(ray.origin) < closest.distanceTo(ray.origin)) {
						closest = result.clone()
					}
				}
			}

			this.camera.lookAt(closest)
		}

		updateHeadBob(timeElapsedS) {
			if (this.headBobActive) {
				const wavelength = Math.PI
				const nextStep = 1 + Math.floor(((this.headBobTimer + 0.000001) * 10) / wavelength)
				const nextStepTime = nextStep * wavelength / 10
				this.headBobTimer = Math.min(this.headBobTimer + timeElapsedS, nextStepTime)

				if (this.headBobTimer == nextStepTime) {
					this.headBobActive = false
				}
			}
		}

		updatetranslation(timeElapsedS) {
			const forwardVelocity = (this.input.key(KEYS.w) ? 1 : 0) + (this.input.key(KEYS.s) ? -1 : 0)
			const strafeVelocity = (this.input.key(KEYS.a) ? 1 : 0) + (this.input.key(KEYS.d) ? -1 : 0)

			const qx = new THREE.Quaternion()
			qx.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.phi)

			const forward = new THREE.Vector3(0, 0, -1)
			forward.applyQuaternion(qx)
			forward.multiplyScalar(forwardVelocity * timeElapsedS * 10)

			const left = new THREE.Vector3(-1, 0, 0)
			left.applyQuaternion(qx)
			left.multiplyScalar(strafeVelocity * timeElapsedS * 10)

			this.translation.add(forward)
			this.translation.add(left)

			if (forwardVelocity != 0 || strafeVelocity != 0) {
				this.headBobActive = true
			}
		}

		updaterotation(timeElapsedS) {
			const xh = this.input.current.mouseXDelta / window.innerWidth
			const yh = this.input.current.mouseYDelta / window.innerHeight

			this.phi += -xh * this.phiSpeed
			this.theta = clamp(this.theta + -yh * this.thetaSpeed, -Math.PI / 3, Math.PI / 3)

			const qx = new THREE.Quaternion()
			qx.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.phi)
			const qz = new THREE.Quaternion()
			qz.setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.theta)

			const q = new THREE.Quaternion()
			q.multiply(qx)
			q.multiply(qz)

			this.rotation.copy(q)
		}
	}

	function clamp(x, a, b) {
		return Math.min(Math.max(x, a), b)
	}

	function step(timeElapsed) {
		const timeElapsedS = timeElapsed * 0.001
		FPVCam.update(timeElapsedS)
	}
	const meshes = [...scene.children]

	let objects = []

	for (let i = 0; i < meshes.length; ++i) {
		const b = new THREE.Box3()
		b.setFromObject(meshes[i])
		objects.push(b)
	}

	const FPVCam = new FirstPersonCamera(camera, objects)

	useFrame(
		({ clock }) => {
			step(10)
		}
	)

	return null
}

export default CameraControls
