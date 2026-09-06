import * as THREE from "three";

const canvas = document.getElementById("scene");

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
  powerPreference: "high-performance"
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(
  35,
  window.innerWidth / window.innerHeight,
  0.1,
  200
);

camera.position.set(0, 0.8, 8.5);

const clock = new THREE.Clock();


// ----------------------------------------------------
// STARS
// ----------------------------------------------------

const starGeometry = new THREE.BufferGeometry();

const starCount = 3500;
const starPositions = new Float32Array(starCount * 3);

for (let i = 0; i < starCount; i++) {

  const radius = 35 + Math.random() * 45;

  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);

  starPositions[i * 3] =
    radius * Math.sin(phi) * Math.cos(theta);

  starPositions[i * 3 + 1] =
    radius * Math.cos(phi);

  starPositions[i * 3 + 2] =
    radius * Math.sin(phi) * Math.sin(theta);
}

starGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(starPositions, 3)
);

const starMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.055,
  sizeAttenuation: true
});

const stars = new THREE.Points(
  starGeometry,
  starMaterial
);

scene.add(stars);


// ----------------------------------------------------
// EARTH GROUP
// ----------------------------------------------------

const earthSystem = new THREE.Group();

scene.add(earthSystem);


// ----------------------------------------------------
// EARTH TEXTURES
// ----------------------------------------------------

const loader = new THREE.TextureLoader();

const earthTexture = loader.load(
  "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg"
);

earthTexture.colorSpace = THREE.SRGBColorSpace;

const earthNormal = loader.load(
  "https://threejs.org/examples/textures/planets/earth_normal_2048.jpg"
);

const earthSpecular = loader.load(
  "https://threejs.org/examples/textures/planets/earth_specular_2048.jpg"
);


// ----------------------------------------------------
// EARTH
// ----------------------------------------------------

const earthGeometry = new THREE.SphereGeometry(
  2.25,
  96,
  96
);

const earthMaterial = new THREE.MeshPhongMaterial({
  map: earthTexture,
  normalMap: earthNormal,
  specularMap: earthSpecular,
  specular: new THREE.Color(0x333333),
  shininess: 12
});

const earth = new THREE.Mesh(
  earthGeometry,
  earthMaterial
);

earthSystem.add(earth);


// ----------------------------------------------------
// ATMOSPHERE
// ----------------------------------------------------

const atmosphereGeometry = new THREE.SphereGeometry(
  2.31,
  96,
  96
);

const atmosphereMaterial = new THREE.MeshBasicMaterial({
  color: 0x4aa8ff,
  transparent: true,
  opacity: 0.12,
  side: THREE.BackSide
});

const atmosphere = new THREE.Mesh(
  atmosphereGeometry,
  atmosphereMaterial
);

earthSystem.add(atmosphere);


// ----------------------------------------------------
// LIGHTING
// ----------------------------------------------------

const sunLight = new THREE.DirectionalLight(
  0xffffff,
  3.0
);

sunLight.position.set(
  -5,
  2,
  6
);

scene.add(sunLight);


const ambientLight = new THREE.AmbientLight(
  0x334466,
  0.22
);

scene.add(ambientLight);


// ----------------------------------------------------
// SIMULATION
// ----------------------------------------------------

let simulationTime = 0;

const NORMAL_SPEED = 0.65;

let rotationSpeed = NORMAL_SPEED;

let state = "NORMAL";


// ----------------------------------------------------
// UI
// ----------------------------------------------------

const rotationState =
  document.getElementById("rotationState");

const simTime =
  document.getElementById("simTime");

const speedValue =
  document.getElementById("speedValue");


// ----------------------------------------------------
// FORMAT TIME
// ----------------------------------------------------

function formatTime(seconds) {

  const total = Math.floor(seconds);

  const minutes = Math.floor(total / 60);

  const secs = total % 60;

  return (
    String(minutes).padStart(2, "0") +
    ":" +
    String(secs).padStart(2, "0")
  );
}


// ----------------------------------------------------
// SIMULATION LOGIC
// ----------------------------------------------------

function updateSimulation(dt) {

  simulationTime += dt;

  /*
    Timeline

    0 - 6 sec
    Normal rotation

    6 - 12 sec
    Earth rapidly slows

    12 sec+
    Earth stops
  */

  if (simulationTime < 6) {

    state = "NORMAL";

    rotationSpeed = NORMAL_SPEED;

  }

  else if (simulationTime < 12) {

    state = "DECELERATING";

    const progress =
      (simulationTime - 6) / 6;

    rotationSpeed =
      NORMAL_SPEED *
      (1 - progress);

  }

  else {

    state = "STOPPED";

    rotationSpeed = 0;

  }


  earth.rotation.y +=
    rotationSpeed * dt;


  // UI

  rotationState.textContent = state;

  const percent =
    Math.max(
      0,
      Math.round(
        (rotationSpeed / NORMAL_SPEED) * 100
      )
    );

  speedValue.textContent =
    percent + "%";

  simTime.textContent =
    formatTime(simulationTime);
}


// ----------------------------------------------------
// CAMERA
// ----------------------------------------------------

function updateCamera() {

  let targetZ = 8.5;

  let targetY = 0.8;

  /*
    Slow cinematic push toward Earth.
  */

  if (simulationTime < 20) {

    const p =
      Math.min(simulationTime / 20, 1);

    targetZ =
      8.5 - p * 2.0;

    targetY =
      0.8 - p * 0.25;

  }

  camera.position.z +=
    (targetZ - camera.position.z) * 0.008;

  camera.position.y +=
    (targetY - camera.position.y) * 0.008;

  camera.lookAt(0, 0, 0);
}


// ----------------------------------------------------
// STAR MOVEMENT
// ----------------------------------------------------

function updateStars(dt) {

  stars.rotation.y += dt * 0.002;

  stars.rotation.x += dt * 0.0005;
}


// ----------------------------------------------------
// RESIZE
// ----------------------------------------------------

function resize() {

  const width =
    window.innerWidth;

  const height =
    window.innerHeight;

  camera.aspect =
    width / height;

  camera.updateProjectionMatrix();

  renderer.setSize(
    width,
    height
  );

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
  );
}

window.addEventListener(
  "resize",
  resize
);


// ----------------------------------------------------
// MAIN LOOP
// ----------------------------------------------------

function animate() {

  requestAnimationFrame(animate);

  const dt =
    Math.min(
      clock.getDelta(),
      0.05
    );

  updateSimulation(dt);

  updateCamera();

  updateStars(dt);

  renderer.render(
    scene,
    camera
  );
}

animate();
