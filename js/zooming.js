import * as THREE from "three";
import { gsap } from "gsap";

/**
 * Smoothly fly the camera to the object identified by `uuid`.
 *  - Works with PerspectiveCamera (+ OrbitControls).
 *  - Uses GSAP for a single-easing tween; swap for your own lerp if you prefer.
 *
 * @param {string} uuid                – uuid of the mesh to focus
 * @param {THREE.PerspectiveCamera} camera
 * @param {THREE.Scene} scene
 * @param {THREE.OrbitControls?} controls
 * @param {object}   opts
 *        {number}   opts.padding      – extra space around the object (default 1.2)
 *        {number}   opts.duration     – tween length in seconds  (default 1 s)
 *        {string}   opts.easing       – GSAP easing string       (default 'power3.inOut')
 */
export function smoothZoomToUuid(
  uuid,
  camera,
  scene,
  zoomLevel,
  controls = null,
  { padding = 1.2, duration = 1, easing = "power3.inOut" } = {}
) {
  /*** 1️⃣  Find the target object ***/

  const obj = scene.getObjectByProperty("uuid", uuid);
  if (!obj) {
    console.warn(`No object with uuid ${uuid}`);
    return;
  }

  /*** 2️⃣  Get its bounding box → center & size ***/
  const box = new THREE.Box3().setFromObject(obj);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  /*** 3️⃣  Figure out how far the camera must sit ***/
  const maxDim = Math.max(size.x, size.y, size.z);
  const fovRad = THREE.MathUtils.degToRad(camera.fov);
  let dist = (maxDim * 0.5) / Math.tan(fovRad * 0.5);
  dist *= padding;
  dist = 0.6;
  let zoomOutFactor = 28 / zoomLevel;
  console.log("zoomOutFactor", zoomOutFactor);
  dist = dist * zoomOutFactor; // extra space around object

  // keep current viewing direction:
  const dir = new THREE.Vector3()
    .subVectors(camera.position, controls?.target ?? center)
    .normalize();
  const targetPos = center.clone().add(dir.multiplyScalar(dist));

  /*** 4️⃣  Pre-compute the final orientation ***/
  // Snapshot starting state
  const startPos = camera.position.clone();
  const startQuat = camera.quaternion.clone();
  // Compute end quaternion by *temporarily* looking at the center
  camera.position.copy(targetPos);
  camera.lookAt(center);
  const endQuat = camera.quaternion.clone();
  // Restore starting orientation so GSAP has something to tween from
  camera.position.copy(startPos);
  camera.quaternion.copy(startQuat);

  smoothZoom(camera, controls, targetPos, endQuat, center, duration, easing);
  return;
  /*** 5️⃣  Set up the tweens ***/
  gsap.to(camera.position, {
    x: targetPos.x,
    y: targetPos.y,
    z: targetPos.z,
    duration,
    ease: easing,
    onUpdate: () => {
      camera.updateProjectionMatrix();
      if (controls) controls.update();
    },
  });

  gsap.to(camera.quaternion, {
    x: endQuat.x,
    y: endQuat.y,
    z: endQuat.z,
    w: endQuat.w,
    duration,
    ease: easing,
    onUpdate: () => {
      camera.updateProjectionMatrix();
      if (controls) controls.update();
    },
  });

  if (controls) {
    gsap.to(controls.target, {
      x: center.x,
      y: center.y,
      z: center.z,
      duration,
      ease: easing,
      onUpdate: controls.update.bind(controls),
    });
  }
}

export function smoothZoom(
  camera,
  controls,
  targetPos,
  endQuat,
  center,
  duration,
  easing
) {
  gsap.to(camera.position, {
    x: targetPos.x,
    y: targetPos.y,
    z: targetPos.z,
    duration,
    ease: easing,
    onUpdate: () => {
      camera.updateProjectionMatrix();
      if (controls) controls.update();
    },
  });

  gsap.to(camera.quaternion, {
    x: endQuat.x,
    y: endQuat.y,
    z: endQuat.z,
    w: endQuat.w,
    duration,
    ease: easing,
    onUpdate: () => {
      camera.updateProjectionMatrix();
      if (controls) controls.update();
    },
  });

  if (controls) {
    gsap.to(controls.target, {
      x: center.x,
      y: center.y,
      z: center.z,
      duration,
      ease: easing,
      onUpdate: controls.update.bind(controls),
    });
  }
}

export function zoomToUuid(
  uuid,
  camera,
  scene,
  controls = null,
  padding = 1.2,
  tweenTime = 1
) {
  // 1️⃣  Locate the object
  const obj = scene.getObjectByProperty("uuid", uuid);
  if (!obj) {
    console.warn(`No object with uuid ${uuid}`);
    return;
  }

  // 2️⃣  Get world-space bounding box → size & center
  const box = new THREE.Box3().setFromObject(obj);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  // 3️⃣  Compute distance so object fits in the frustum
  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = THREE.MathUtils.degToRad(camera.fov);
  let distance = (maxDim * 0.5) / Math.tan(fov * 0.5);
  distance = distance * padding; // extra space around object

  // Keep the current viewing direction
  const dir = new THREE.Vector3()
    .subVectors(camera.position, controls?.target || center)
    .normalize();

  const newPos = center.clone().add(dir.multiplyScalar(distance));

  // 4️⃣  Animate camera (or just set directly if you prefer)
  gsap.to(camera.position, {
    x: newPos.x,
    y: newPos.y,
    z: newPos.z,
    duration: tweenTime,
    onUpdate: () => {
      camera.lookAt(center);
      if (controls) controls.update(); // keeps damping smooth
    },
  });

  if (controls) {
    controls.target.copy(center);
    controls.update();
  }

  camera.updateProjectionMatrix();
}
