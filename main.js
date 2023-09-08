import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// let sizes = {};
// let camera;
// let renderer;

window.onload = function () {
  drawSpheres();
};

function drawSpheres() {
  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  let sphereRadius = 2;
  let sphereWidthSegments = 64;
  let sphereHeightSegments = 64;

  const scene = new THREE.Scene();
  const geometrySphere = new THREE.SphereGeometry(
    sphereRadius,
    sphereWidthSegments,
    sphereHeightSegments
  );

  const materialRed = new THREE.MeshStandardMaterial({ color: "#ff0000" });
  const materialGreen = new THREE.MeshStandardMaterial({ color: "#00ff00" });
  const materialBlue = new THREE.MeshStandardMaterial({ color: "#0000ff" });

  const meshSphere01 = new THREE.Mesh(geometrySphere, materialRed);
  meshSphere01.position.x = 0;
  meshSphere01.position.y = 0;
  meshSphere01.position.z = 0;
  scene.add(meshSphere01);

  const meshSphere02 = new THREE.Mesh(geometrySphere, materialGreen);
  meshSphere02.position.x = 6;
  meshSphere02.position.y = 0;
  meshSphere02.position.z = 0;
  scene.add(meshSphere02);

  const meshSphere03 = new THREE.Mesh(geometrySphere, materialBlue);
  meshSphere03.position.x = -6;
  meshSphere03.position.y = 0;
  meshSphere03.position.z = 0;
  scene.add(meshSphere03);

  const lightPoint = new THREE.PointLight("#ffffff", 200);
  lightPoint.position.set(0, 0, 10);
  scene.add(lightPoint);

  // const lightDirectional = new THREE.DirectionalLight("#ffffff", 0.9);
  // lightDirectional.position.set(10, 10, 10);
  // scene.add(lightDirectional);

  // const lightSpot = new THREE.SpotLight("#ffffff", 0.9, 10, Math.PI * 0.25);
  // lightSpot.position.set(0, 2, 3);
  // scene.add(lightSpot);

  const lightAmbient = new THREE.AmbientLight("#ffffff", 0.2);
  scene.add(lightAmbient);

  // const lightHemisphere = new THREE.HemisphereLight("#ffffff", "#000000", 2);
  // scene.add(lightHemisphere);

  const camera = new THREE.PerspectiveCamera(
    45,
    sizes.width / sizes.height,
    0.1,
    100
  );
  camera.position.z = 20;
  scene.add(camera);

  const canvas = document.querySelector(".webgl");
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 5;

  const renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setSize(sizes.width, sizes.height);
  renderer.render(scene, camera);

  window.addEventListener("resize", () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.updateProjectionMatrix();
    camera.aspect = sizes.width / sizes.height;
    renderer.setSize(sizes.width, sizes.height); // drawSphere();
  });

  const renderLoop = () => {
    controls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(renderLoop);
  };

  renderLoop();
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
