import * as THREE from "three";
import * as dat from "lil-gui";

/**
 * Debug
 */
const gui = new dat.GUI();

const parameters = {
  materialColor: "#ffeded",
};

gui.addColor(parameters, "materialColor").onChange(() => {
  material.color.set(parameters.materialColor);
  particleMaterial.color.set(parameters.materialColor);
});

/**
 * Base
 */

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Objects
 */

// ########## Textues ##########
const textureLoader = new THREE.TextureLoader();
const gradientTexture = textureLoader.load("textures/gradients/3.jpg");
// To stop color mixing happening due to small size of the gradient texture we will use magFilter
gradientTexture.magFilter = THREE.NearestFilter;

// ########## Material #########

// This material will be black by default as MeshToonMaterial by default needs light to be visible
const material = new THREE.MeshToonMaterial({
  color: parameters.materialColor,
  gradientMap: gradientTexture,
});

const objectDistance = 4;
const Mesh1 = new THREE.Mesh(new THREE.TorusGeometry(1, 0.4, 16, 60), material);
const Mesh2 = new THREE.Mesh(new THREE.ConeGeometry(1, 2, 32), material);
const Mesh3 = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
  material
);

Mesh1.position.y = -objectDistance * 0;
Mesh2.position.y = -objectDistance * 1;
Mesh3.position.y = -objectDistance * 2;

// Positioning objects horizontally
Mesh1.position.x = 2;
Mesh2.position.x = -2;
Mesh3.position.x = 2;

scene.add(Mesh1, Mesh2, Mesh3);

const sectionMeshes = [Mesh1, Mesh2, Mesh3];

/**
 * PARTICLES
 */
const particleCount = 400;
const positions = new Float32Array(particleCount * 3);

// Add random coordinates to the position array
for (let i = 0; i < particleCount; i++) {
  // positions[i * 3] = Math.random();
  // positions[i * 3 + 1] = Math.random();
  // positions[i * 3 + 2] = Math.random();

  // For x(horizontal) and z(depth), we can use random values that can be as much positive as they are negative
  positions[i * 3] = (Math.random() - 0.5) * 10;
  positions[i * 3 + 1] =
    objectDistance * 0.5 -
    Math.random() * objectDistance * sectionMeshes.length;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
}

// Create a geometry for particle
const particleGeometry = new THREE.BufferGeometry();
particleGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3)
);

// Create material using PointMaterial
const particleMaterial = new THREE.PointsMaterial({
  color: parameters.materialColor,
  sizeAttenuation: true,
  size: 0.03,
});

// Create Points

const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);

/**
 * LIGHTS
 */
const directionalLight = new THREE.DirectionalLight("#ffffff");
directionalLight.position.set(1, 1, 0);
scene.add(directionalLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */

// ### Create camera group ###
const cameraGroup = new THREE.Group();
scene.add(cameraGroup);

// Base camera
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 6;
// scene.add(camera);

// Now add the camera to the group
cameraGroup.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true, // for setting webGL clearColor to transparent,
  // using this, alpha : true we will be able to see the HTML content what is or will be behind the object if placed
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Scroll
 */
let scrollY = window.scrollY;
// now we need to update that value when the user scrolls. Listen to the 'scroll' event on window

window.addEventListener("scroll", () => {
  scrollY = window.scrollY;
});

/**
 * Scroll
 */

// We need to retrieve the cursor position. Create a cursor object with x and y properties
const cursor = {};
cursor.x = 0;
cursor.y = 0;

// An event listener for "mousemove"
window.addEventListener("mousemove", (event) => {
  // cursor.x = event.clientX;
  // cursor.y = event.clientY;

  // console.log(cursor)

  // currently the amplitude depends on the size of the viewport and user with different screen resolutions will
  // have different results.

  // So we can normalize (from 0 to 1) by dividing them by the size of the viewport

  // cursor.x = event.clientX / sizes.width;
  // cursor.y = event.clientY / sizes.height;

  // instead of value going from 0 to 1, it's better to have a value going from -0.5 to 0.5 for camera perspective
  cursor.x = event.clientX / sizes.width - 0.5;
  cursor.y = event.clientY / sizes.height - 0.5;
});

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  console.log(deltaTime);

  // Before doing render we are going to apply a slow rotation using the elapsed time
  for (const mesh of sectionMeshes) {
    mesh.rotation.x = elapsedTime * 0.1;
    mesh.rotation.y = elapsedTime * 0.12;
  }

  // animate the camera on scroll(before doing render)
  // scrollY is positive when scrolling down, but the camera should go down on the y axis
  camera.position.y = (-scrollY / sizes.height) * objectDistance;

  // ######## Create Parallax effect ##########
  const parallaxX = cursor.x;
  const parallaxY = -cursor.y;

  // now update the camera position
  // cameraGroup.position.x = parallaxX;
  // cameraGroup.position.y = parallaxY;

  // For easing out the motion of camera
  // cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 0.1;
  // cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 0.1;

  // Now for different screen rate devices also the speed of camera motion will be same
  cameraGroup.position.x +=
    (parallaxX - cameraGroup.position.x) * 5 * deltaTime;
  cameraGroup.position.y +=
    (parallaxY - cameraGroup.position.y) * 5 * deltaTime;

  // ############### CAMERA ON SCROLL ##############
  // 'scrollY' contains the amount of pixels that have been scrolled, if we scroll 1000 pixels, the camera will go down of 1000 units in the scene

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();

// Moving the camera with scroll
// For this we need to retrieve the scroll value. This can be done with the window.scrollY property
