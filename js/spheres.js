import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const scene = new THREE.Scene();

sixteenSpheres();

function fiveSpheres() {
  for (let i = 0; i < 5; i++) {
    let x;
    let y;
    let z;
    let sphereColor;

    switch (i) {
      case 0:
        x = 0;
        y = 0;
        sphereColor = 0xff0000;
        break;
      case 1:
        x = -6;
        y = 0;
        sphereColor = 0x00ff00;
        break;
      case 2:
        x = 6;
        y = 0;
        sphereColor = 0x0000ff;
        break;
      case 3:
        x = 0;
        y = 6;
        sphereColor = 0xffff00;
        break;
      case 4:
        x = 0;
        y = -6;
        sphereColor = 0xff00ff;
        break;
    }
    let sphereGeometry = new THREE.SphereGeometry(3, 64, 64);
    let sphereMaterial = new THREE.MeshStandardMaterial({ color: sphereColor });
    let sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphereMesh.position.set(x, y, z);
    scene.add(sphereMesh);
  }
}

function sixteenSpheres() {
  let screenSize = 4;

  let length = 5;
  let columns = length;
  let rows = length;
  let z = 0;
  let radius = (2 * screenSize) / length;
  let diameter = radius * 2;

  for (let row = 0; row < rows; row++) {
    let y = (rows / 2) * diameter - radius - row * diameter;

    for (let column = 0; column < columns; column++) {
      let x = (columns / 2) * diameter - radius - column * diameter;

      let hue = Math.random() * 360;
      let sphereColor = `hsl(${hue}, 100%, 50%)`;

      let sphereGeometry = new THREE.SphereGeometry(radius, 64, 64);
      let sphereMaterial = new THREE.MeshStandardMaterial({
        color: sphereColor,
      });
      let sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphereMesh.position.set(x, y, z);
      scene.add(sphereMesh);
    }
  }
}
const pointLight = new THREE.PointLight(0xffffff, 100, 100);
pointLight.position.set(0, 0, 10);
scene.add(pointLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.set(10, 10, 10);
scene.add(camera);

const canvas = document.querySelector(".webgl");
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, canvas);
controls.enablePan = true;
controls.enableZoom = true;
controls.enableRotate = true;
controls.autoRotate = true;

renderer.render(scene, camera);

// const renderLoop = () => {
//   controls.update();
//   renderer.render(scene, camera);
//   window.requestAnimationFrame(renderLoop);
// };
// renderLoop();

let fps = 30;

function animate() {
  controls.update();
  renderer.render(scene, camera);
  setTimeout(() => {
    requestAnimationFrame(animate);
  }, 1000 / fps);
}
animate();
