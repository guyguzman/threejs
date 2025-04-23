import * as THREE from "three";

export function createBrownCross() {
  // --- Configuration ---
  const verticalHeight = 1.5; // Total height of the vertical beam
  const horizontalWidth = 1.0; // Total width of the horizontal beam
  const armThickness = 0.2; // Thickness of both beams
  const intersectionOffset = 0.25; // How far above the center the horizontal beam is placed
  const brownColor = 0x652500; // Hex code for SaddleBrown

  // --- Material ---
  // Using MeshBasicMaterial for simplicity (doesn't require lights)
  // const material = new THREE.MeshBasicMaterial({ color: brownColor });

  const material = new THREE.MeshStandardMaterial({
    color: brownColor,
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
  return crossGroup;
}
