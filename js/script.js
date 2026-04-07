const MAX_COLORS = 8;
const frag = `
#define MAX_COLORS ${MAX_COLORS}
uniform vec2 uCanvas;
uniform float uTime;
uniform float uSpeed;
uniform vec2 uRot;
uniform int uColorCount;
uniform vec3 uColors[MAX_COLORS];
uniform int uTransparent;
uniform float uScale;
uniform float uFrequency;
uniform float uWarpStrength;
uniform vec2 uPointer;
uniform float uMouseInfluence;
uniform float uParallax;
uniform float uNoise;
varying vec2 vUv;

void main() {
  float t = uTime * uSpeed;
  vec2 p = vUv * 2.0 - 1.0;
  p += uPointer * uParallax * 0.1;
  vec2 rp = vec2(p.x * uRot.x - p.y * uRot.y, p.x * uRot.y + p.y * uRot.x);
  vec2 q = vec2(rp.x * (uCanvas.x / uCanvas.y), rp.y);
  q /= max(uScale, 0.0001);
  q /= 0.5 + 0.2 * dot(q, q);
  q += 0.2 * cos(t) - 7.56;
  vec2 toward = (uPointer - rp);
  q += toward * uMouseInfluence * 0.2;

  vec3 col = vec3(0.0);
  float a = 1.0;

  vec2 s = q;
  vec3 sumCol = vec3(0.0);
  float cover = 0.0;
  
  for (int i = 0; i < MAX_COLORS; ++i) {
    if (i >= uColorCount) break;
    s -= 0.01;
    vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency));
    float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(i)) / 4.0);
    float kBelow = clamp(uWarpStrength, 0.0, 1.0);
    float kMix = pow(kBelow, 0.3);
    float gain = 1.0 + max(uWarpStrength - 1.0, 0.0);
    vec2 disp = (r - s) * kBelow;
    vec2 warped = s + disp * gain;
    float m1 = length(warped + sin(5.0 * warped.y * uFrequency - 3.0 * t + float(i)) / 4.0);
    float m = mix(m0, m1, kMix);
    float w = 1.0 - exp(-6.0 / exp(6.0 * m));
    sumCol += uColors[i] * w;
    cover = max(cover, w);
  }
  
  col = clamp(sumCol, 0.0, 1.0);
  a = uTransparent > 0 ? cover : 1.0;

  if (uNoise > 0.0001) {
    float n = fract(sin(dot(gl_FragCoord.xy + vec2(uTime), vec2(12.9898, 78.233))) * 43758.5453123);
    col += (n - 0.5) * uNoise;
    col = clamp(col, 0.0, 1.0);
  }

  vec3 rgb = (uTransparent > 0) ? col * a : col;
  gl_FragColor = vec4(rgb, a);
}
`;

const vert = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

function initColorBends() {
  console.log('Initializing ColorBends effect...');
  const container = document.querySelector('.hero');
  const colorBendsContainer = document.createElement('div');
  colorBendsContainer.className = 'color-bends-container';
  container.appendChild(colorBendsContainer);
  console.log('Container created');

  const mouse = new THREE.Vector2(0, 0);
  const targetMouse = new THREE.Vector2(0, 0);
  const lerpFactor = 0.05;

  window.addEventListener('mousemove', (event) => {
    targetMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    targetMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  });

  function lerpVector2(v1, v2, alpha) {
    v1.x += (v2.x - v1.x) * alpha;
    v1.y += (v2.y - v1.y) * alpha;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const geometry = new THREE.PlaneGeometry(2, 2);

  const colors = [
    new THREE.Vector3(0.69, 0.36, 0.99),
    new THREE.Vector3(0.53, 0.23, 0.96),
    new THREE.Vector3(1, 0.35, 0.98),
    new THREE.Vector3(0.31, 0.44, 0.98)
  ];

  const uColorsArray = Array.from({ length: MAX_COLORS }, (_, i) =>
    i < colors.length ? colors[i] : new THREE.Vector3(0, 0, 0)
  );
  console.log('Colors initialized');

  const material = new THREE.ShaderMaterial({
    vertexShader: vert,
    fragmentShader: frag,
    uniforms: {
      uCanvas: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      uTime: { value: 0 },
      uSpeed: { value: 0.2 },
      uRot: { value: new THREE.Vector2(1, 0) },
      uColorCount: { value: colors.length },
      uColors: { value: uColorsArray },
      uTransparent: { value: 0 },
      uScale: { value: 1.0 },
      uFrequency: { value: 1.0 },
      uWarpStrength: { value: 1.0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uMouseInfluence: { value: 0.5 },
      uParallax: { value: 0.0 },
      uNoise: { value: 0.0 }
    },
    transparent: true
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });

  console.log('Initializing renderer...');
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);

  const canvas = renderer.domElement;
  canvas.style.display = 'block';
  colorBendsContainer.appendChild(canvas);
  console.log('Canvas added to container');

  const clock = new THREE.Clock();
  const pointerTarget = new THREE.Vector2(0, 0);
  const pointerCurrent = new THREE.Vector2(0, 0);

  function handleResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    material.uniforms.uCanvas.value.set(w, h);
  }

  window.addEventListener('resize', handleResize);

  colorBendsContainer.addEventListener('mousemove', (e) => {
    const rect = colorBendsContainer.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    pointerTarget.set(x, y);
  });

  function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();
    material.uniforms.uTime.value = elapsed;

    lerpVector2(mouse, targetMouse, lerpFactor);

    const parallaxX = mouse.x * 0.1;
    const parallaxY = mouse.y * 0.1;
    scene.position.x = parallaxX;
    scene.position.y = parallaxY;

    material.uniforms.uPointer.value.copy(mouse);

    renderer.render(scene, camera);
  }

  animate();
}

document.addEventListener('DOMContentLoaded', initColorBends);

const cursor = document.querySelector('.cursor');
const cursorFollower = document.querySelector('.cursor-follower');

let mouseX = 0;
let mouseY = 0;
let cursorX = 0;
let cursorY = 0;
let followerX = 0;
let followerY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function updateCursor() {
  cursorX += (mouseX - cursorX) * 0.2;
  cursorY += (mouseY - cursorY) * 0.2;
  cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;

  followerX += (mouseX - followerX) * 0.1;
  followerY += (mouseY - followerY) * 0.1;
  cursorFollower.style.transform = `translate(${followerX}px, ${followerY}px) translate(-50%, -50%)`;

  requestAnimationFrame(updateCursor);
}

updateCursor();

document.addEventListener('mousedown', () => {
  cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%) scale(0.8)`;
  cursorFollower.style.transform = `translate(${followerX}px, ${followerY}px) translate(-50%, -50%) scale(0.6)`;
});

document.addEventListener('mouseup', () => {
  cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%) scale(1)`;
  cursorFollower.style.transform = `translate(${followerX}px, ${followerY}px) translate(-50%, -50%) scale(1)`;
});

document.querySelectorAll('a, button').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursorFollower.style.transform = `translate(${followerX}px, ${followerY}px) translate(-50%, -50%) scale(1.5)`;
    cursor.style.opacity = '0.5';
  });

  el.addEventListener('mouseleave', () => {
    cursorFollower.style.transform = `translate(${followerX}px, ${followerY}px) translate(-50%, -50%) scale(1)`;
    cursor.style.opacity = '1';
  });
});

function init() {
  var style = ["style1", "style2", "style3", "style4"];

  function getRandomArbitrary(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  var numeroAleatorio = 5000;

  setTimeout(function () {
    carregarMeteoro();
  }, numeroAleatorio);

  function carregarMeteoro() {
    setTimeout(carregarMeteoro, numeroAleatorio);
    numeroAleatorio = getRandomArbitrary(5000, 10000);
    var meteoro =
      "<div class='meteoro " + style[getRandomArbitrary(0, 4)] + "'></div>";
    document.getElementsByClassName("chuvaMeteoro")[0].innerHTML = meteoro;
    setTimeout(function () {
      document.getElementsByClassName("chuvaMeteoro")[0].innerHTML = "";
    }, 1000);
  }
}
window.onload = init;


var scene = new THREE.Scene();
document.addEventListener("mousemove", onMouseMove, false);
var camera = new THREE.PerspectiveCamera(
  100,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

var renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const loader = new THREE.TextureLoader();

const distance = Math.min(300, window.innerWidth);
const geometry = new THREE.BufferGeometry();
const vertices = [];

for (var i = 0; i < 1600; i++) {
  var theta = Math.acos(THREE.MathUtils.randFloatSpread(2));
  var phi = THREE.MathUtils.randFloatSpread(360);

  vertices.push(
    distance * Math.sin(theta) * Math.cos(phi),
    distance * Math.sin(theta) * Math.sin(phi),
    distance * Math.cos(theta)
  );
}

geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
const material = new THREE.PointsMaterial({
  flatShading: true,
});

var particles = new THREE.Points(geometry, material);
particles.boundingSphere = 5;

var renderingParent = new THREE.Group();
renderingParent.add(particles);
var resizeContainer = new THREE.Group();
resizeContainer.add(renderingParent);
scene.add(resizeContainer);

camera.position.z = 360;

var animate = function () {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
};
var myTween;
function onMouseMove(event) {
  if (myTween) myTween.kill();

  mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
  myTween = gsap.to(particles.rotation, {
    duration: 0.1,
    x: mouseY * -1,
    y: mouseX,
  });
}
animate();

var animProps = { scale: 1, xRot: 0, yRot: 0 };
gsap.to(animProps, {
  duration: 16,
  scale: 1.5,
  repeat: -1,
  yoyo: true,
  ease: "sine",
  onUpdate: function () {
    renderingParent.scale.set(
      animProps.scale,
      animProps.scale,
      animProps.scale
    );
  },
});

gsap.to(animProps, {
  duration: 1000,
  xRot: Math.PI * 2,
  yRot: Math.PI * 4,
  repeat: -1,
  yoyo: true,
  ease: "none",
  onUpdate: function () {
    renderingParent.rotation.set(animProps.xRot, animProps.yRot, 0);
  },
});

const initProjectCards = () => {
  if (typeof VanillaTilt === 'undefined') {
    console.warn('VanillaTilt n\'est pas chargé');
    return;
  }

  const cards = document.querySelectorAll('.project-card');

  cards.forEach(card => {
    VanillaTilt.init(card, {
      reverse: false,
      max: 10,
      startX: 0,
      startY: 0,
      perspective: 1500,
      scale: 1.03,
      speed: 300,
      transition: true,
      axis: null,
      reset: true,
      "full-page-listening": false,
      gyroscope: false,
      gyroscopeMinAngleX: -45,
      gyroscopeMaxAngleX: 45,
      gyroscopeMinAngleY: -45,
      gyroscopeMaxAngleY: 45
    });

    card.style.transformStyle = 'preserve-3d';

    const content = card.querySelector('.project-content');
    const image = card.querySelector('.project-image');
    const title = card.querySelector('h3');
    const description = card.querySelector('p');
    const button = card.querySelector('.project-btn');

    if (content) content.style.transform = 'translateZ(30px)';
    if (image) image.style.transform = 'translateZ(40px)';
    if (title) title.style.transform = 'translateZ(50px)';
    if (description) description.style.transform = 'translateZ(40px)';
    if (button) button.style.transform = 'translateZ(45px)';
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProjectCards);
} else {
  initProjectCards();
}

const initBoxTilt = () => {
  const boxes = document.querySelectorAll('.container .box');

  boxes.forEach(box => {
    VanillaTilt.init(box, {
      max: 25,
      speed: 400,
      glare: true,
      "max-glare": 0.5,
      scale: 1.1,
      perspective: 1000,
      easing: "cubic-bezier(.03,.98,.52,.99)",
      transition: true
    });
    box.style.transformStyle = 'preserve-3d';

    const content = box.querySelector('b');
    if (content) {
      content.style.transform = 'translateZ(50px)';
    }
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBoxTilt);
} else {
  initBoxTilt();
}

particlesJS("particles-js", {
  particles: {
    number: {
      value: 80,
      density: {
        enable: true,
        value_area: 800
      }
    },
    color: {
      value: ["#8093F1", "#B388EB", "#F7AEF8"]
    },
    shape: {
      type: "circle"
    },
    opacity: {
      value: 0.5,
      random: true
    },
    size: {
      value: 3,
      random: true
    },
    move: {
      enable: true,
      speed: 2,
      direction: "none",
      random: true,
      out_mode: "out"
    }
  },
  interactivity: {
    detect_on: "canvas",
    events: {
      onhover: {
        enable: true,
        mode: "grab"
      },
      onclick: {
        enable: true,
        mode: "push"
      },
      resize: true
    }
  }
});

window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset;
  const parallaxBg = document.querySelector('.parallax-bg');
  parallaxBg.style.transform = `translateY(${scrolled * 0.5}px)`;
});

document.addEventListener('mousemove', (e) => {
  const space = document.querySelector('.space');
  const stars = document.querySelector('.stars1');
  const flares = document.querySelectorAll('.flare');

  const mouseX = e.clientX / window.innerWidth;
  const mouseY = e.clientY / window.innerHeight;

  if (space) {
    space.style.transform = `translate3d(${mouseX * -30}px, ${mouseY * -30}px, 0)`;
  }
  if (stars) {
    stars.style.transform = `translate3d(${mouseX * -50}px, ${mouseY * -50}px, 0)`;
  }

  flares.forEach((flare, index) => {
    const depth = (index + 1) * 0.2;
    flare.style.transform = `translate3d(${mouseX * -70 * depth}px, ${mouseY * -70 * depth}px, 0)`;
  });
});

const observerOptions = {
  threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
    }
  });
}, observerOptions);

document.querySelectorAll('.project-card').forEach(card => {
  observer.observe(card);
});