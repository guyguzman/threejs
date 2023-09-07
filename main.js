import "./style.css";
import * as THREE from "three";

let sizes = {};

window.onload = function () {
  sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  window.addEventListener("resize", () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    drawSphere();
  });
};

drawSphere();

function drawSphere() {
  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  const scene = new THREE.Scene();
  const geometry = new THREE.SphereGeometry(3, 64, 64);
  const material = new THREE.MeshStandardMaterial({ color: "#ff0000" });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  const light = new THREE.PointLight("#ffffff", 200);
  light.position.set(0, 10, 10);
  scene.add(light);

  const camera = new THREE.PerspectiveCamera(
    45,
    sizes.width / sizes.height,
    0.1,
    100
  );
  camera.position.z = 20;
  scene.add(camera);

  const canvas = document.querySelector(".webgl");
  const renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setSize(sizes.width, sizes.height);
  renderer.render(scene, camera);
  console.log("Hello Three.js");
}

function drawThreeBezierCurve2D() {
  const curveCubic = new THREE.CubicBezierCurve(
    new THREE.Vector2(-10, 0),
    new THREE.Vector2(-5, 15),
    new THREE.Vector2(20, 15),
    new THREE.Vector2(10, 0)
  );
  const points = curveCubic.getPoints(50);
  const spacedPoints = curveCubic.getSpacedPoints(50);
}

function drawThreeBezierCurve3D() {
  const curveQuadratic = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(0, 921, 0),
    new THREE.Vector3(921, 921, 0),
    new THREE.Vector3(921, 0, 0)
  );

  const curveCubic = new THREE.CubicBezierCurve3(
    new THREE.Vector3(-10, 0, 0),
    new THREE.Vector3(-5, 15, 0),
    new THREE.Vector3(20, 15, 0),
    new THREE.Vector3(10, 0, 0)
  );

  const spacedPoints = curveCubic.getSpacedPoints(50);
  console.log(spacedPoints);
}
