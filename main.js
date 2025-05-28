import * as THREE from './three.module.min.js';
import { GLTFLoader } from './GLTFLoader.js';
import { OrbitControls } from './OrbitControls.js';
import * as CANNON from './cannon-es.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.5, 3);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lights
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 5);
scene.add(light);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);

// Physics world
const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -2, 0)
});
const groundBody = new CANNON.Body({
  mass: 0,
  shape: new CANNON.Plane()
});
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
world.addBody(groundBody);

// Ground mesh
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshStandardMaterial({ color: 0x222222 })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// Load 3D model
const loader = new GLTFLoader();
let model, modelBody;

loader.load('./model.glb', (gltf) => {
  model = gltf.scene;
  model.scale.set(1, 1, 1);
  model.position.set(0, 2, 0);
  scene.add(model);

  // Create physics body
  const shape = new CANNON.Sphere(0.5);
  modelBody = new CANNON.Body({ mass: 1 });
  modelBody.addShape(shape);
  modelBody.position.set(0, 2, 0);
  world.addBody(modelBody);
});

function animate() {
  requestAnimationFrame(animate);

  world.step(1/60);

  if (model && modelBody) {
    model.position.copy(modelBody.position);
    model.quaternion.copy(modelBody.quaternion);
  }

  renderer.render(scene, camera);
}
animate();
