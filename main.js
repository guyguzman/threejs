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

  let roughness = 0.5;

  const materialRed = new THREE.MeshStandardMaterial({
    color: "#ff0000",
    roughness: roughness,
  });
  const materialGreen = new THREE.MeshStandardMaterial({
    color: "#00ff00",
    roughness: roughness,
  });
  const materialBlue = new THREE.MeshStandardMaterial({
    color: "#0000ff",
    roughness: roughness,
  });

  let curvePoints = [15, 0, 0, 0, 15, 0, 30, 15, 0, 15, 0, 0];
  let bezierCurve = drawCubicBezierCurve3D(curvePoints);
  const bezierCurveGeometry = new THREE.TubeGeometry(
    bezierCurve,
    100,
    0.5,
    4,
    false
  );
  const bezierCurveMaterial = new THREE.MeshStandardMaterial({
    color: "#ff0000",
    roughness: roughness,
  });
  let bezierCurveMesh = new THREE.Mesh(
    bezierCurveGeometry,
    bezierCurveMaterial
  );
  scene.add(bezierCurveMesh);

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

  const lightPoint = new THREE.PointLight("#ffffff", 400);
  lightPoint.position.set(0, 0, 30);
  scene.add(lightPoint);

  const lightDirectional = new THREE.DirectionalLight("#ffffff", 0.9);
  lightDirectional.position.set(10, 10, 10);
  // scene.add(lightDirectional);

  const lightSpot = new THREE.SpotLight("#ffffff", 0.9, 10, Math.PI * 0.25);
  lightSpot.position.set(0, 2, 3);
  // scene.add(lightSpot);

  const lightHemisphere = new THREE.HemisphereLight("#ffffff", "#000000", 2);
  // scene.add(lightHemisphere);

  const lightAmbient = new THREE.AmbientLight("#ffffff", 0.2);
  scene.add(lightAmbient);

  let fov = 45;
  let aspect = sizes.width / sizes.height;
  let near = 0.1;
  let far = 400;

  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.x = 0;
  camera.position.y = 0;
  camera.position.z = 40;

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
  renderer.setPixelRatio(2);
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

function createHeartShape() {
  const heartShape = new THREE.Shape();

  heartShape.moveTo(25, 25);
  heartShape.bezierCurveTo(25, 25, 20, 0, 0, 0);
  heartShape.bezierCurveTo(-30, 0, -30, 35, -30, 35);
  heartShape.bezierCurveTo(-30, 55, -10, 77, 25, 95);
  heartShape.bezierCurveTo(60, 77, 80, 55, 80, 35);
  heartShape.bezierCurveTo(80, 35, 80, 0, 50, 0);
  heartShape.bezierCurveTo(35, 0, 25, 25, 25, 25);

  const extrudeSettings = {
    depth: 8,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 2,
    bevelSize: 1,
    bevelThickness: 1,
  };

  const geometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);

  const mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial());
  return mesh;
}

function drawCubicBezierCurve2D() {
  const curveCubic = new THREE.CubicBezierCurve(
    new THREE.Vector2(-10, 0),
    new THREE.Vector2(-5, 15),
    new THREE.Vector2(20, 15),
    new THREE.Vector2(10, 0)
  );
  const points = curveCubic.getPoints(50);
  const spacedPoints = curveCubic.getSpacedPoints(50);
  console.log(spacedPoints);
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color: 0x00ff00,
    linewidth: 100,
  });

  // Create the final object to add to the scene
  const curveObject = new THREE.Line(geometry, material);
  return curveObject;
}

function drawCubicBezierCurve3D(curvePoints) {
  const curveCubic = new THREE.CubicBezierCurve3(
    new THREE.Vector3(curvePoints[0], curvePoints[1], curvePoints[2]),
    new THREE.Vector3(curvePoints[3], curvePoints[4], curvePoints[5]),
    new THREE.Vector3(curvePoints[6], curvePoints[7], curvePoints[8]),
    new THREE.Vector3(curvePoints[9], curvePoints[10], curvePoints[11])
  );

  const points = curveCubic.getPoints(50);
  const spacedPoints = curveCubic.getSpacedPoints(50);
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color: 0xffff00,
    linewidth: 100,
  });

  const curveObject = new THREE.Line(geometry, material);
  console.log(spacedPoints);
  return curveCubic;
}

function drawQuadraticBezierCurve2D() {
  const curveQuadratic = new THREE.QuadraticBezierCurve(
    new THREE.Vector2(0, 921),
    new THREE.Vector2(921, 921),
    new THREE.Vector2(921, 0)
  );

  const spacedPoints = curveCubic.getSpacedPoints(50);
  console.log(spacedPoints);
}

function drawQuadraticBezierCurve3D() {
  const curveQuadratic = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(0, 921, 0),
    new THREE.Vector3(921, 921, 0),
    new THREE.Vector3(921, 0, 0)
  );

  const spacedPoints = curveCubic.getSpacedPoints(50);
  console.log(spacedPoints);
}
