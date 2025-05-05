import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { gsap } from "gsap";
import { smoothZoomToUuid } from "./zooming";
import { createElement, createIcons, icons } from "lucide";
import { resetWidthHeight } from "./utilities";
// import { zoom } from "d3";
// import { update } from "three/examples/jsm/libs/tween.module.js";

let beadSmallRadius = 0.15;
let beadLargeRadius = 0.18;
let beadVeryLargeRadius = 0.25;
let beadRoughness = 0.5;
let chainRoughness = 0;
let chainRadius = 0.04;

let chainColor = "#606265";
let beadSmallColor = "#f0f2f5";
let beadLargeColor = "#ff0000";
beadLargeColor = "#0080FF";
beadLargeColor = "#21A2FF";
beadLargeColor = "#50ffb5";
let crossColor = "#652500";
crossColor = "#a26f56";
let activeColor = "#00ff00";
activeColor = "#ff65a3";
activeColor = "#ff0000";
let nextColor = "#E0FF21";
let beadVeryLargeColor = beadSmallColor;

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const renderer = new THREE.WebGLRenderer({ canvas });
let camera;
let scene;
let orbitControls;
let controlsEnabled = true;
let savedCameraPosition;
let savedCameraQuaternion;
let savedControlsTarget;

let clickedBead = null;
let rosaryBeads = [];
let rosaryItems = [];
let itemIndex = 0;
let activeMeshes = [];

let currentState = {};
let currentStateJSON = null;
let clearLocalStorage = true;
let enableZoomToBead = true;

let offsetX = 0;
let offsetY = 0;
let offsetZ = 0;
let elementOverlayTopMessage = document.getElementById("overlayTopMessage");
let elementButtonStart = document.getElementById("buttonStart");
let elementButtonPrev = document.getElementById("buttonPrev");
let elementButtonNext = document.getElementById("buttonNext");
let elementButtonReset = document.getElementById("buttonReset");
let elementButtonZoomOut = document.getElementById("buttonZoomOut");
let elementButtonZoomIn = document.getElementById("buttonZoomIn");
let elementButtonsPrayers = document.getElementById("buttonsPrayers");

window.onload = function () {
  let screenSize = resetWidthHeight();
  createIcons({ icons });
  createRosary();

  if (clearLocalStorage) {
    clearStorage();
  }

  if (!checkStorageExists()) {
    initializeStorage();
    updateStorageCurrentIndex(0);
  }

  if (checkStorageExists()) {
    let currentStateJSON = localStorage.getItem("currentState");
    currentState = JSON.parse(currentStateJSON);
    if (currentState.started || !currentState.started) {
      selectBead(currentState.currentIndex);
    }
  }

  eventHandlers();
  eventHandlersButtons();
};

function eventHandlers() {
  window.addEventListener("mousemove", onPointerMove);
  window.addEventListener("click", clickBead);
  window.addEventListener("resize", () => {
    screenSize = resetWidthHeight();
    createRosary();
    camera.updateProjectionMatrix();
    camera.aspect = window.innerWidth / window.innerHeight;
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
  screen.orientation.addEventListener("change", function () {
    // Orientation has changed
    const currentOrientation = screen.orientation.type; // e.g., "portrait-primary", "landscape-secondary"
    const currentAngle = screen.orientation.angle; // e.g., 0, 90, -90, 180
    screenSize = resetWidthHeight();
    createRosary();
    camera.updateProjectionMatrix();
    camera.aspect = window.innerWidth / window.innerHeight;
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

async function eventHandlersButtons() {
  // elementButtonStart.addEventListener("click", function () {
  //   initializeStorage();
  //   resetBeadsOriginalColors();
  //   selectBead(0);
  //   updateStorageStarted(true);
  //   updateStorageZoomEnabled(false);
  //   updateStorageDateTime();
  // });

  elementButtonPrev.addEventListener("click", function () {
    selectPreviousBead();
  });

  elementButtonNext.addEventListener("click", function () {
    selectNextBead();
  });

  elementButtonReset.addEventListener("click", async function () {
    resetBeadsOriginalColors();
    await restoreCameraSettings();
    await initializeStorage();
  });

  elementButtonZoomIn.addEventListener("click", async function () {
    await updateStorageItem("zoomEnabled", true);
    let currentIndex = await getStorageItemCurrentIndex();
    selectBead(currentIndex);
  });

  elementButtonZoomOut.addEventListener("click", async function () {
    await restoreCameraSettings();
    updateStorageItem("zoomEnabled", false);
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function testStorage() {
  localStorage.setItem("currentState", JSON.stringify(currentState));
  let currentStateJSON = localStorage.getItem("currentState");
  currentState = JSON.parse(currentStateJSON);
}

function setState() {}

function setStorage(
  started = false,
  currentIndex = 0,
  zoomEnabled = false,
  cameraSettings = cameraSettings,
  camera = null,
  lastIimeStamp = new Date()
) {
  if (checkStorageExists()) {
    let previousState = getStorage();
  }

  currentState = {
    started: started,
    currentIndex: currentIndex,
    zoomEnabled: zoomEnabled,
    originalCameraSettings: cameraSettings,
    camera: camera,
    lastIimeStamp: lastIimeStamp,
  };
  localStorage.setItem("currentState", JSON.stringify(currentState));
}

async function updateStoragePerspectiveCamera() {
  savedCameraPosition = camera.position.clone();
  savedCameraQuaternion = camera.quaternion.clone();
  updateStorageItem("perspectiveCameraPosition", savedCameraPosition);
  updateStorageItem("perspectiveCameraQuaternion", savedCameraQuaternion);
  if (orbitControls && orbitControls.target) {
    savedControlsTarget = orbitControls.target.clone();
    updateStorageItem("perspectiveControlsTarget", savedControlsTarget);
  }
}

async function restoreCameraSettings() {
  savedCameraPosition = await getStorageItem("perspectiveCameraPosition");
  savedCameraQuaternion = await getStorageItem("perspectiveCameraQuaternion");
  savedControlsTarget = await getStorageItem("perspectiveControlsTarget");

  if (savedCameraPosition && savedCameraQuaternion) {
    camera.position.copy(savedCameraPosition);
    camera.quaternion.copy(savedCameraQuaternion);
  }

  if (orbitControls && orbitControls.target && savedControlsTarget) {
    orbitControls.target.copy(savedControlsTarget);
    orbitControls.update();
  } else if (controls && controls.target) {
  }
}

async function updateStorageCurrentIndex(index) {
  updateStorageItem("currentIndex", index);
}

async function updateStorageZoomEnabled(zoomEnabled) {
  updateStorageItem("zoomEnabled", zoomEnabled);
}

async function updateStorageDateTime() {
  updateStorageItem("lastIimeStamp", new Date());
}

async function updateStorageStarted(started) {
  updateStorageItem("started", started);
}

async function getStorageItem(property) {
  if (checkStorageExists()) {
    currentStateJSON = localStorage.getItem("currentState");
    currentState = JSON.parse(currentStateJSON);
    return currentState[property];
  } else {
    return null;
  }
}

async function getStorageItemCurrentIndex() {
  let storage = getStorage();
  return storage.currentIndex;
}

async function updateStorageItem(property, value) {
  if (checkStorageExists()) {
    currentState = JSON.parse(localStorage.getItem("currentState"));
  }
  currentState[property] = value;
  if (property == "perspectiveCamera") {
  }
  currentState.lastIimeStamp = new Date();
  localStorage.setItem("currentState", JSON.stringify(currentState));
}

async function initializeStorage() {
  updateStorageStarted(false);
  updateStorageCurrentIndex(0);
  updateStoragePerspectiveCamera();
  updateStorageZoomEnabled(false);
  updateStorageDateTime();
  selectBead(0);
}

function checkStorageExists() {
  let currentStateJSON = localStorage.getItem("currentState");
  if (currentStateJSON == null) {
    return false;
  } else {
    return true;
  }
}

function clearStorage() {
  localStorage.clear();
}

function getStorage() {
  let currentStateJSON = localStorage.getItem("currentState");
  currentState = JSON.parse(currentStateJSON);
  return currentState;
}

function clickBead(event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);

  let intersects = raycaster.intersectObjects(scene.children);
  let intersectsCount = intersects.length;
  if (intersectsCount == 0) {
    return;
  }

  let objectUuid = scene.getObjectByProperty("uuid", intersects[0].object.uuid);

  if (
    objectUuid.geometry.type == "CylinderGeometry" ||
    objectUuid.geometry.type == "TubeGeometry"
  ) {
    return;
  }

  setActiveBead(objectUuid);
}

async function selectNextBead() {
  let storage = getStorage();
  let currentIndex = storage.currentIndex;
  let nextIndex = currentIndex + 1;
  if (nextIndex > rosaryItems.length - 1) {
    nextIndex = currentIndex;
  }
  let rosaryItem = rosaryItems[nextIndex];
  let objectUuid = scene.getObjectByProperty("uuid", rosaryItem.uuid);
  setActiveBead(objectUuid);
  updateStorageCurrentIndex(nextIndex);
}

async function selectPreviousBead() {
  let storage = getStorage();
  let currentIndex = storage.currentIndex;
  let previousIndex = currentIndex - 1;
  if (previousIndex < 0) {
    previousIndex = 0;
  }
  let rosaryItem = rosaryItems[previousIndex];
  let objectUuid = scene.getObjectByProperty("uuid", rosaryItem.uuid);
  setActiveBead(objectUuid);
  updateStorageCurrentIndex(previousIndex);
}

async function selectBead(index = 0) {
  let rosaryItem = rosaryItems[index];
  let objectUuid = scene.getObjectByProperty("uuid", rosaryItem.uuid);
  setActiveBead(objectUuid);
}

async function setActiveBead(objectUuid) {
  let zoomEnabled = await getStorageItem("zoomEnabled");

  resetBeadsOriginalColors();
  resetPrayers();

  let isCross = false;
  let crossGroup = null;

  if (objectUuid.children.length > 0) {
    isCross = true;
    crossGroup = objectUuid;
  }

  if (objectUuid.parent.type == "Group") {
    isCross = true;
    crossGroup = objectUuid.parent;
  }

  if (isCross) {
    let rosaryIndex = rosaryItems.findIndex(
      (item) => item.uuid == crossGroup.uuid
    );
    let rosaryItem = rosaryItems[rosaryIndex];
    rosaryItem.prayers.forEach((prayer) => {
      let buttonPrayer = document.createElement("div");
      buttonPrayer.classList.add("buttonPrayer");
      buttonPrayer.innerText = prayer.prayer;
      elementButtonsPrayers.appendChild(buttonPrayer);
    });
    updateStorageCurrentIndex(rosaryIndex);
    let crossGroupChildren = crossGroup.children;
    activeMeshes.push(crossGroupChildren[0]);
    activeMeshes.push(crossGroupChildren[1]);
    crossGroupChildren[0].material.color.set(activeColor);
    crossGroupChildren[1].material.color.set(activeColor);
    if (zoomEnabled) {
      zoomToBead(crossGroup);
    }
  }

  if (!isCross && objectUuid.parent.type == "Scene") {
    let rosaryIndex = rosaryItems.findIndex(
      (item) => item.uuid == objectUuid.uuid
    );
    let rosaryItem = rosaryItems[rosaryIndex];
    rosaryItem.prayers.forEach((prayer) => {
      let buttonPrayer = document.createElement("div");
      buttonPrayer.classList.add("buttonPrayer");
      buttonPrayer.innerText = prayer.prayer;
      elementButtonsPrayers.appendChild(buttonPrayer);
    });
    updateStorageCurrentIndex(rosaryIndex);
    objectUuid.material.color.set(activeColor);
    activeMeshes.push(objectUuid);
    if (zoomEnabled) {
      zoomToBead(objectUuid);
    }
  }

  return;
}

function resetPrayers() {
  while (elementButtonsPrayers.firstChild) {
    elementButtonsPrayers.removeChild(elementButtonsPrayers.firstChild);
  }
}

function getCameraSettings() {
  let cameraPosition = new THREE.Vector3(
    camera.position.x,
    camera.position.y,
    camera.position.z
  );
  let cameraRotation = new THREE.Quaternion(
    camera.quaternion.x,
    camera.quaternion.y,
    camera.quaternion.z,
    camera.quaternion.w
  );
  let cameraZoom = camera.zoom;
  let cameraTarget = orbitControls.target;
  let cameraFov = camera.fov;
  let cameraAspect = camera.aspect;
  let cameraNear = camera.near;
  let cameraFar = camera.far;
  let cameraProjectionMatrix = camera.projectionMatrix;
  let cameraProjectionMatrixInverse = camera.projectionMatrixInverse;
  let cameraSettings = {
    cameraPosition,
    cameraRotation,
    cameraZoom,
    cameraTarget,
    cameraFov,
    cameraAspect,
    cameraNear,
    cameraFar,
    cameraProjectionMatrix,
    cameraProjectionMatrixInverse,
  };
  return cameraSettings;
}

function zoomToBead(objectUuid) {
  const startPos = camera.position.clone();
  const startQuat = camera.quaternion.clone();
  const center = new THREE.Vector3();
  const size = new THREE.Vector3();
  const box = new THREE.Box3().setFromObject(objectUuid);
  box.getCenter(center);
  box.getSize(size);
  const distance = size.length() * 0.5;

  if (enableZoomToBead) {
    smoothZoomToUuid(objectUuid.uuid, camera, scene, orbitControls, {
      padding: 1.2,
      duration: 1,
      easing: "power3.inOut",
    });
  }
}
function resetBeadsOriginalColors() {
  let originalColor;
  if (activeMeshes.length > 0) {
    activeMeshes.forEach((mesh) => {
      if (mesh.parent.type == "Scene") {
        originalColor = rosaryItems.find(
          (item) => item.uuid == mesh.uuid
        ).color;
        mesh.material.color.set(originalColor);
      }

      if (mesh.parent.type == "Group") {
        originalColor = rosaryItems.find(
          (item) => item.uuid == mesh.parent.uuid
        ).color;
        mesh.material.color.set(originalColor);
      }
    });

    activeMeshes = [];
  }
}

function onPointerMove(event) {
  //Normalizes x and y coordinates to be between -1 and 1

  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function insertItemIntoRosaryItems(
  name,
  description,
  prayers,
  itemIndex,
  uuid,
  group,
  color
) {
  let rosayItem = {
    name: name,
    description: description,
    prayers: prayers,
    itemIndex: itemIndex,
    uuid: uuid,
    group: group,
    color: color,
  };
  rosaryItems.push(rosayItem);
}

function createRosary() {
  let enableGrid = false;
  scene = new THREE.Scene();
  if (enableGrid) scene.add(new THREE.GridHelper(10, 10, 0x00ff00, 0x4a4a4a));

  let chainRadius = 0.04;
  let spacedPointsCount = 110;

  let spacedPoints = insertLoopTop(scene, chainRadius, spacedPointsCount);
  insertBrownCross(scene);
  insertLineBeads(scene);
  insertLoopBottom(scene, chainRadius);
  insertLine(scene, chainRadius);
  insertLoopBeads(spacedPoints, scene);
  insertSalveRegina(scene);
  insertLights(scene);

  let camera = addCamera(scene);
  const canvas = document.querySelector(".webgl");

  addOrbitControls(camera, canvas);
  moveCameraTo(0, 0, 50);
  pointCameraTo(0, -1, 0);

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(2);
  renderer.render(scene, camera);

  // window.addEventListener("resize", () => {
  //   camera.updateProjectionMatrix();
  //   camera.aspect = window.innerWidth / window.innerHeight;
  //   renderer.setSize(window.innerWidth, window.innerHeight);
  // });

  const renderLoop = () => {
    if (controlsEnabled) orbitControls.update();
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

  scene.add(camera);
  return camera;
}

function addOrbitControls(camera, canvas) {
  if (controlsEnabled) {
    orbitControls = new OrbitControls(camera, canvas);
    orbitControls.enableDamping = true;
    orbitControls.enablePan = true;
    orbitControls.enableZoom = true;
    orbitControls.autoRotate = false;
    orbitControls.autoRotateSpeed = 5;
    // controls.maxPolarAngle = Math.PI / 2;
    // controls.maxPolarAngle = Math.PI;
    orbitControls.minPolarAngle = THREE.MathUtils.degToRad(10); // limit vertical tilt
    orbitControls.maxPolarAngle = THREE.MathUtils.degToRad(180);
    orbitControls.target = new THREE.Vector3(0, 0, 0);
    orbitControls.enablePan = false;
    orbitControls.enableRotate = false;
    orbitControls.enableZoom = false;
  }
}

function pointCameraTo(x, y, z) {
  orbitControls.target = new THREE.Vector3(x, y, z);
}

function moveCameraTo(x, y, z) {
  camera.position.x = x;
  camera.position.y = y;
  camera.position.z = z;
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
  let description = "";
  for (let index = 2; index < spacedPoints.length - 2; index = index + 2) {
    beadCount = beadCount + 1;
    let beadRadius = beadSmallRadius;
    let beadColor = beadSmallColor;
    itemIndex = itemIndex + 1;
    description = "HailMary";
    let prayers = [{ prayer: "Hail Mary" }];
    let threePrayers = [10, 21, 32, 43];
    if (threePrayers.includes(beadCount)) {
      prayers = [
        { prayer: "Hail Mary" },
        { prayer: "Glory Be" },
        { prayer: "Fatima Prayer" },
      ];
    }
    if (beadCount % 11 == 0) {
      beadColor = beadLargeColor;
      beadRadius = beadLargeRadius;
      description = "OurFather";
      prayers = [{ prayer: "Our Father" }];
      console.log(beadCount);
    }
    let meshSphere = insertSphere(
      beadColor,
      beadRoughness,
      beadRadius,
      spacedPoints[index].x,
      spacedPoints[index].y,
      spacedPoints[index].z,
      scene
    );
    meshSphere.name = itemIndex;
    rosaryBeads.push(meshSphere);

    insertItemIntoRosaryItems(
      meshSphere.name,
      description,
      prayers,
      itemIndex,
      meshSphere.uuid,
      false,
      beadColor
    );
  }
}

function insertLine(scene, radius) {
  let height = 3.5;
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

function insertLineBeads(scene) {
  //insert Our Father, three Hail Mary and another Out Father
  let beadCount = 0;
  let y = 0;
  let description = "";
  for (let beadIndex = 5; beadIndex > 0; beadIndex--) {
    beadCount = beadCount + 1;
    let beadColor;
    let beadRadius;
    let prayers = [];
    if (beadIndex == 1 || beadIndex == 5) {
      beadColor = beadLargeColor;
      beadRadius = beadLargeRadius;
      description = "OurFather";
      prayers = [{ prayer: "Our Father" }];
    } else if (beadIndex > 0) {
      beadColor = beadSmallColor;
      beadRadius = beadSmallRadius;
      description = "HailMary";
      prayers = [{ prayer: "Hail Mary" }];
      if (beadIndex == 2) {
        prayers = [{ prayer: "Hail Mary" }, { prayer: "Glory Be" }];
      }
    } else if (beadIndex == 0) {
      beadColor = beadVeryLargeColor;
      beadRadius = beadVeryLargeRadius;
      description = "ApostlesCreed";
      prayers = [{ prayer: "Apostles Creed" }];
    }

    if (beadIndex == 0) {
      y = -0.35 - beadIndex * 0.5;
    } else {
      y = -0.35 - beadIndex * 0.5 - 0.25;
    }

    let meshSphere = insertSphere(
      beadColor,
      beadRoughness,
      beadRadius,
      0,
      y,
      0,
      scene
    );
    if (beadIndex > 0) itemIndex = itemIndex + 1;
    if (beadIndex == 0) itemIndex = 0;
    meshSphere.name = itemIndex;
    insertItemIntoRosaryItems(
      meshSphere.name,
      description,
      prayers,
      itemIndex,
      meshSphere.uuid,
      false,
      beadColor
    );
  }
}

function insertSalveRegina(scene) {
  let beadCount = 0;
  let y = 0;
  let beadColor = beadVeryLargeColor;
  let beadRadius = beadVeryLargeRadius;
  let description = "SalveRegina";
  beadCount = beadCount + 1;
  let prayers = [];
  prayers = [{ prayer: "Salve Regina" }];
  y = -0.35;

  let meshSphere = insertSphere(
    beadColor,
    beadRoughness,
    beadRadius,
    0,
    y,
    0,
    scene
  );

  itemIndex = 60;
  meshSphere.name = itemIndex;
  insertItemIntoRosaryItems(
    meshSphere.name,
    description,
    prayers,
    itemIndex,
    meshSphere.uuid,
    false,
    beadColor
  );
}

function insertBrownCross(scene) {
  // --- Configuration ---
  const verticalHeight = 1.5; // Total height of the vertical beam
  const horizontalWidth = 1.0; // Total width of the horizontal beam
  const armThickness = 0.2; // Thickness of both beams
  const intersectionOffset = 0.25; // How far above the center the horizontal beam is placed

  // --- Material ---
  // Using MeshBasicMaterial for simplicity (doesn't require lights)
  // const material = new THREE.MeshBasicMaterial({ color: brownColor });

  const material = new THREE.MeshStandardMaterial({
    color: crossColor,
    roughness: 0.9,
  });

  // Alternatively, use MeshStandardMaterial for a more realistic look (requires lights)
  // const material = new THREE.MeshStandardMaterial({ color: brownColor, roughness: 0.8, metalness: 0.1 });

  // --- Geometries ---
  // Vertical bar geometry (width/depth = thickness, height = verticalHeight)
  const verticalGeometry = new THREE.BoxGeometry(
    armThickness,
    verticalHeight,
    armThickness
  );
  // Horizontal bar geometry (width = horizontalWidth, height/depth = thickness)
  const horizontalGeometry = new THREE.BoxGeometry(
    horizontalWidth,
    armThickness,
    armThickness
  );

  // --- Meshes ---
  // Create the mesh for the vertical bar
  const verticalMesh = new THREE.Mesh(verticalGeometry, material);
  // Create the mesh for the horizontal bar
  const horizontalMesh = new THREE.Mesh(horizontalGeometry, material);

  // --- Positioning ---
  // Position the horizontal bar higher up on the Y-axis
  horizontalMesh.position.set(0, intersectionOffset, 0);
  // The vertical mesh remains centered at the group's origin (0,0,0) by default.

  // --- Group ---
  // Create a group to hold both parts of the cross
  const crossGroup = new THREE.Group();
  crossGroup.add(verticalMesh);
  crossGroup.add(horizontalMesh); // Add the positioned horizontal mesh

  crossGroup.position.set(0, -4.5, 0); // Center the group at the origin
  crossGroup.name = 0;
  scene.add(crossGroup);
  let prayers = [{ prayer: "Apostles Creed" }];
  insertItemIntoRosaryItems(
    crossGroup.name,
    "Cross",
    prayers,
    0,
    crossGroup.uuid,
    true,
    crossColor
  );
  return crossGroup;
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
}

function drawQuadraticBezierCurve3D() {
  const curveQuadratic = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(0, 921, 0),
    new THREE.Vector3(921, 921, 0),
    new THREE.Vector3(921, 0, 0)
  );

  const spacedPoints = curveCubic.getSpacedPoints(50);
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
