import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

let beadSmallRadius = 0.1;
let beadLargeRadius = 0.15;
let beadRoughness = 0.5;
let chainRoughness = 0;
let chainRadius = 0.04;
let chainColor = "#606060";
let beadSmallColor = "#f0f2f5";
let beadLargeColor = "#ff0000";
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let camera;
let scene;
let controls;
let controlsEnabled = true;

let rosaryBeads = [];
let itemIndex = 0;

window.onload = function () {
  createRosary();
  //window.addEventListener("mousemove", onPointerMove);
  window.addEventListener("click", selectBead);
};

function selectBead(event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(scene.children);
  const bead = scene.getObjectByName(intersects[0].object.name);
  const color = scene.getObjectByName(intersects[0].object.name).material.color;
  bead.material.color.set("#00ff00");
}

function onPointerMove(event) {
  //Normalizes x and y coordinates to be between -1 and 1

  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  console.log(pointer.x, pointer.y);
}

function createRosary() {
  let enableGrid = false;
  scene = new THREE.Scene();
  if (enableGrid) scene.add(new THREE.GridHelper(10, 10, 0x00ff00, 0x4a4a4a));

  let chainRadius = 0.04;
  let spacedPointsCount = 110;

  let spacedPoints = insertLoopTop(scene, chainRadius, spacedPointsCount);
  insertLoopBottom(scene, chainRadius);
  insertLoopBeads(spacedPoints, scene);
  insertLine(scene, chainRadius);
  insertLineBeads(scene);
  insertLights(scene);

  let camera = addCamera(scene);

  const canvas = document.querySelector(".webgl");

  addOrbitControls(camera, canvas);
  pointCamera(0, -2, 0);

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
    if (controlsEnabled) controls.update();
    //selectBead();
    renderer.render(scene, camera);
    window.requestAnimationFrame(renderLoop);
  };

  //selectBead();
  renderLoop();
}

function addCamera(scene) {
  let width = window.innerWidth;
  let height = window.innerHeight;
  let fov = 20;
  let aspect = width / height;
  let near = 0.05;
  let far = 400;

  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

  camera.position.x = 0;
  camera.position.y = 0;
  camera.position.z = 10;

  scene.add(camera);
  return camera;
}

function addOrbitControls(camera, canvas) {
  if (controlsEnabled) {
    controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 5;
    controls.maxPolarAngle = Math.PI / 2;
    controls.target = new THREE.Vector3(0, -2, 0);
  }
}

function pointCamera(x, y, z) {
  camera.lookAt(x, y, z);
  console.log("camera", camera);
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

function insertSphere(color, beadRoughness, radius, x, y, z, scene) {
  let sphereRadius = radius;
  let sphereWidthSegments = 64;
  let sphereHeightSegments = 64;

  const geometrySphere = new THREE.SphereGeometry(
    sphereRadius,
    sphereWidthSegments,
    sphereHeightSegments
  );

  const material = new THREE.MeshStandardMaterial({
    color: color,
    roughness: beadRoughness,
  });

  const meshSphere = new THREE.Mesh(geometrySphere, material);
  meshSphere.position.x = x;
  meshSphere.position.y = y;
  meshSphere.position.z = z;

  scene.add(meshSphere);
  return meshSphere;
}

function insertLoopTop(scene, radius, spacedPointsCount) {
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
    tubeGeometry(bezierCurve, chainRadius),
    curveMaterial(chainColor, chainRoughness)
  );

  scene.add(curveMesh);
  return spacedPoints;
}

//Simple partial curve path for bottom part of loop (no beads)

function insertLoopBottom(scene, radius) {
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
    tubeGeometry(bezierCurve, chainRadius),
    curveMaterial(chainColor, chainRoughness)
  );

  scene.add(curveMesh);
  return curveMesh;
}

function insertLoopBeads(spacedPoints, scene) {
  let beadCount = 0;
  for (let index = 2; index < spacedPoints.length - 2; index = index + 2) {
    beadCount = beadCount + 1;
    let beadRadius = beadSmallRadius;
    let color = beadSmallColor;
    if (beadCount % 11 == 0) {
      color = beadLargeColor;
      beadRadius = beadLargeRadius;
    }
    let meshSphere = insertSphere(
      color,
      beadRoughness,
      beadRadius,
      spacedPoints[index].x,
      spacedPoints[index].y,
      spacedPoints[index].z,
      scene
    );
    itemIndex = index;
    meshSphere.name = itemIndex;
    console.log(itemIndex);
  }
  console.log(beadCount);
}

function insertLineBeads(scene) {
  for (let beadIndex = 0; beadIndex < 5; beadIndex++) {
    let beadColor;
    let beadRadius;
    if (beadIndex == 0 || beadIndex == 4) {
      beadColor = beadLargeColor;
      beadRadius = beadLargeRadius;
    } else {
      beadColor = beadSmallColor;
      beadRadius = beadSmallRadius;
    }
    let meshSphere = insertSphere(
      beadColor,
      beadRoughness,
      beadRadius,
      0,
      -0.5 - beadIndex * 0.5,
      0,
      scene
    );
    itemIndex = beadIndex + 1 + itemIndex;
    meshSphere.name = itemIndex;
    console.log(itemIndex);
  }
}

function insertLine(scene, radius) {
  let height = 3;
  let x = 0;
  let y = 0 - height / 2 - 0.375;
  let z = 0;

  const geometry = new THREE.CylinderGeometry(
    chainRadius,
    chainRadius,
    height,
    32
  );
  const material = new THREE.MeshStandardMaterial({
    color: chainColor,
    roughness: chainRoughness,
  });
  const cylinder = new THREE.Mesh(geometry, material);
  cylinder.position.x = x;
  cylinder.position.y = y;
  cylinder.position.z = z;
  scene.add(cylinder);

  return cylinder;
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

function drawCubicBezierCurve3D(curvePoints) {
  const curveCubic = new THREE.CubicBezierCurve3(
    new THREE.Vector3(curvePoints[0], curvePoints[1], curvePoints[2]),
    new THREE.Vector3(curvePoints[3], curvePoints[4], curvePoints[5]),
    new THREE.Vector3(curvePoints[6], curvePoints[7], curvePoints[8]),
    new THREE.Vector3(curvePoints[9], curvePoints[10], curvePoints[11])
  );
  return curveCubic;
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
  const curveObject = new THREE.Line(geometry, material);
  scene.add(curveObject);
}
