import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// let sizes = {};
// let camera;
// let renderer;

window.onload = function () {
  createRosary();
};

function simplePath(scene) {}

function catmullRomCurve3(scene) {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-10, 0, 10),
    new THREE.Vector3(-5, 5, 5),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(5, -5, 5),
    new THREE.Vector3(10, 0, 10),
  ]);

  const points = curve.getPoints(50);
  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  const material = new THREE.LineBasicMaterial({ color: 0xff0000 });

  // Create the final object to add to the scene
  const curveObject = new THREE.Line(geometry, material);
  scene.add(curveObject);
}
function testBezierCurve(scene) {
  const curve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(-10, 0, 10),
    new THREE.Vector3(-5, 5, 5),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(5, -5, 5)
  );

  const points = curve.getPoints(50);
  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  const material = new THREE.LineBasicMaterial({ color: 0xff0000 });

  // Create the final object to add to the scene
  const curveObject = new THREE.Line(geometry, material);
  scene.add(curveObject);
}

function createRosary() {
  const scene = new THREE.Scene();
  let gridHelper = new THREE.GridHelper(10, 10, 0x00ff00, 0x4a4a4a);
  //scene.add(gridHelper);
  let radius = 0.04;
  insertLine(scene, radius);
  let spacedPointsCount = 110;
  let spacedPoints = insertRosaryLoopTop(scene, radius, spacedPointsCount);
  let spacePoint = 4;
  insertRosaryLoopBottom(scene, radius);
  // insertBackgroundImage(scene);
  simplePath(scene);
  let beads = 0;
  for (let index = 2; index < spacedPoints.length - 2; index = index + 2) {
    beads = beads + 1;
    let color = "a0a2a5";
    if (beads % 11 == 0) {
      color = "#00ff00";
    }
    insertSphere(
      color,
      0.1,
      spacedPoints[index].x,
      spacedPoints[index].y,
      spacedPoints[index].z,
      scene
    );
  }
  console.log(beads);

  // console.log(spacedPoints);
  // insertSphere("#0000ff", -6, 0, 0, scene);
  insertLights(scene);

  let camera = addCamera(scene);

  const canvas = document.querySelector(".webgl");
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.enableZoom = true;
  controls.autoRotate = false;
  controls.autoRotateSpeed = 5;

  const renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(2);
  renderer.render(scene, camera);

  window.addEventListener("resize", () => {
    camera.updateProjectionMatrix();
    camera.aspect = window.innerWidth / window.innerHeight;
    renderer.setSize(window.innerWidth, window.innerHeight); // drawSphere();
  });

  const renderLoop = () => {
    controls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(renderLoop);
  };

  renderLoop();
}

function insertBackgroundImage(scene) {
  let size = 2;
  const geometry = new THREE.PlaneGeometry(size, size);
  const material = new THREE.MeshStandardMaterial({
    color: 0xe0e2e5,
    side: THREE.DoubleSide,
  });
  const plane = new THREE.Mesh(geometry, material);
  plane.x = 0;
  plane.y = 0;
  plane.z = -20;
  scene.add(plane);
}

function setBackground(scene, backgroundImageWidth, backgroundImageHeight) {
  var windowSize = function (withScrollBar) {
    var wid = 0;
    var hei = 0;
    if (typeof window.innerWidth != "undefined") {
      wid = window.innerWidth;
      hei = window.innerHeight;
    } else {
      if (document.documentElement.clientWidth == 0) {
        wid = document.body.clientWidth;
        hei = document.body.clientHeight;
      } else {
        wid = document.documentElement.clientWidth;
        hei = document.documentElement.clientHeight;
      }
    }
    return {
      width: wid - (withScrollBar ? wid - document.body.offsetWidth + 1 : 0),
      height: hei,
    };
  };

  if (scene.background) {
    var size = windowSize(true);
    var factor =
      backgroundImageWidth / backgroundImageHeight / (size.width / size.height);

    scene.background.offset.x = factor > 1 ? (1 - 1 / factor) / 2 : 0;
    scene.background.offset.y = factor > 1 ? 0 : (1 - factor) / 2;

    scene.background.repeat.x = factor > 1 ? 1 / factor : 1;
    scene.background.repeat.y = factor > 1 ? 1 : factor;
  }
}

function insertBackgroundGradient(scene) {
  let background = "#e0e2e5";
  scene.background = new THREE.Color(background);

  let planeGeometry = new THREE.PlaneGeometry(1, 1);
  let planeMaterial = new THREE.ShaderMaterial({
    uniforms: {
      color1: { value: new THREE.Color(0xff00ff) },
      color2: { value: new THREE.Color(0xff0000) },
      ratio: { value: innerWidth / innerHeight },
    },
    vertexShader: `varying vec2 vUv;
      void main(){
        vUv = uv;
        gl_Position = vec4(position, 1.);
      }`,
    fragmentShader: `varying vec2 vUv;
        uniform vec3 color1;
        uniform vec3 color2;
        uniform float ratio;
        void main(){
        	vec2 uv = (vUv - 0.5) * vec2(ratio, 1.);
          gl_FragColor = vec4( mix( color1, color2, length(uv)), 1. );
        }`,
  });
  let planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
  planeMesh.x = -1;
  planeMesh.y = -1;
  planeMesh.z = 2;
  scene.add(planeMesh);
}
function addCamera(scene) {
  let width = window.innerWidth;
  let height = window.innerHeight;
  let fov = 45;
  let aspect = width / height;
  let near = 0.1;
  let far = 400;

  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

  camera.position.x = 4;
  camera.position.y = 4;
  camera.position.z = 4;

  scene.add(camera);
  return camera;
}

function insertLights(scene) {
  const lightPoint = new THREE.PointLight("#ffffff", 1200);
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
}

function insertSphere(color, radius, x, y, z, scene) {
  let sphereRadius = radius;
  let sphereWidthSegments = 64;
  let sphereHeightSegments = 64;
  let roughness = 0.5;

  const geometrySphere = new THREE.SphereGeometry(
    sphereRadius,
    sphereWidthSegments,
    sphereHeightSegments
  );

  const material = new THREE.MeshStandardMaterial({
    color: color,
    roughness: roughness,
  });

  const meshSphere = new THREE.Mesh(geometrySphere, material);
  meshSphere.position.x = x;
  meshSphere.position.y = y;
  meshSphere.position.z = z;

  scene.add(meshSphere);
  return meshSphere;
}

function insertRosaryLoopTop(scene, radius, spacedPointsCount) {
  let color = "#ff0000";
  let roughness = 0.5;
  let rosaryOriginX = 0;
  let anchorTopY = 10;
  let anchorBottomY = -1;
  let rateTop = 1;
  let base = 0.5;

  let curvePoints = [
    rosaryOriginX - base,
    0,
    0,
    rosaryOriginX - anchorTopY / rateTop,
    anchorTopY,
    0,
    rosaryOriginX + anchorTopY / rateTop,
    anchorTopY,
    0,
    rosaryOriginX + base,
    0,
    0,
  ];

  let bezierCurve = drawCubicBezierCurve3D(curvePoints);

  const points = bezierCurve.getPoints(spacedPointsCount);
  const spacedPoints = bezierCurve.getSpacedPoints(spacedPointsCount);

  let curveMesh = new THREE.Mesh(
    tubeGeometry(bezierCurve, radius),
    curveMaterial(color, roughness)
  );

  scene.add(curveMesh);
  return spacedPoints;
}

function insertRosaryLoopBottom(scene, radius) {
  let color = "#ff0000";
  let roughness = 0.5;
  let rosaryOriginX = 0;
  let anchorTopY = 10;
  let anchorBottomY = -0.5;
  let rateTop = 2;
  let base = 0.5;

  let curvePoints = [
    rosaryOriginX - base,
    0,
    0,
    rosaryOriginX,
    anchorBottomY,
    0,
    rosaryOriginX,
    anchorBottomY,
    0,
    rosaryOriginX + base,
    0,
    0,
  ];

  let bezierCurve = drawCubicBezierCurve3D(curvePoints);

  const points = bezierCurve.getPoints(50);
  const spacedPoints = bezierCurve.getSpacedPoints(50);

  let curveMesh = new THREE.Mesh(
    tubeGeometry(bezierCurve, radius),
    curveMaterial(color, roughness)
  );

  scene.add(curveMesh);
  return curveMesh;
}

function insertLine(scene, radius) {
  const material = new THREE.LineBasicMaterial({
    color: 0xff0000,
  });

  const points = [];
  points.push(new THREE.Vector3(0, 0, 0));
  points.push(new THREE.Vector3(0, -5, 0));

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line(geometry, material);
  // let curveMesh = new THREE.Mesh(tubeGeometry(line), material());

  // scene.add(line);

  let height = 5;
  let x = 0;
  let y = -2.87;
  let z = 0;

  const geometry1 = new THREE.CylinderGeometry(radius, radius, height, 32);
  const material1 = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  const cylinder1 = new THREE.Mesh(geometry1, material1);
  cylinder1.position.x = x;
  cylinder1.position.y = y;
  cylinder1.position.z = z;
  scene.add(cylinder1);

  return line;
}

function curveMaterial(color, roughness) {
  let bezierCurveMaterial = new THREE.MeshStandardMaterial({
    color: color,
    roughness: roughness,
  });

  return bezierCurveMaterial;
}

function tubeGeometry(curve, radius) {
  let tubularSegments = 128;
  let tubularRadius = radius;
  let tubularRadialSegments = 16;
  let tubularClosed = false;
  let tubeGeometry = new THREE.TubeGeometry(
    curve,
    tubularSegments,
    tubularRadius,
    tubularRadialSegments,
    tubularClosed
  );
  return tubeGeometry;
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
