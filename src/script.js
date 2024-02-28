import * as THREE from "three";
import * as dat from "lil-gui";

/**
 * Debug
 */
const gui = new dat.GUI();

const parameters = {
  materialColor: "#ffeded",
};

gui
  .addColor(parameters, "materialColor")
  .onChange(() => material.color.set(parameters.materialColor));

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

scene.add(Mesh1, Mesh2, Mesh3);

const sectionMeshes = [Mesh1, Mesh2, Mesh3];

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
// Base camera
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 6;
scene.add(camera);

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
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Before doing render we are going to apply a slow rotation using the elapsed time
  for (const mesh of sectionMeshes) {
    mesh.rotation.x = elapsedTime * 0.1;
    mesh.rotation.y = elapsedTime * 0.12;
  }

  // animate the camera on scroll(before doing render)
  // scrollY is positive when scrolling down, but the camera should go down on the y axis
  camera.position.y = (-scrollY / sizes.height) * objectDistance;

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
