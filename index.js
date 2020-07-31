import * as THREE from 'three.js';

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
uniform float time;
float drawSphere(vec2 pc, vec3 sphere) {
  float dx = pc.x - sphere.x;
  float dy = pc.y - sphere.y;
  return sqrt(dx * dx + dy * dy) - sphere.z > 0.0 ? 0.0 : 1.0;
}

void main() {
  vec2 p = vUv;
  vec2 pc = (p - 0.5) * 2.0;
  vec3 light = vec3(0.2, 0.2, 0.01);
  vec3 sphere1 = vec3(0.5, 0.5, 0.1);
  vec3 sphere1Color = vec3(1.0, 0.0, 0.0);
  vec3 color = vec3(0.0);
  color += vec3(1.0) * drawSphere(light);
  color += sphere1Color * drawSphere(pc, sphere1);
  gl_FragColor = vec4(color, 0.0);
}`;

const container;
const camera, scene, renderer;
const uniforms;
init();
animate();
function init() {
    container = document.getElementById('container');
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    scene = new THREE.Scene();
    const geometry = new THREE.PlaneBufferGeometry(2, 2);
    uniforms = {
        "time": { value: 1.0 }
    };
    const material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    onWindowResize();
    window.addEventListener('resize', onWindowResize, false);
    const rt1 = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat,
        type: THREE.FloatType
    });
    const rt2 = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat,
        type: THREE.FloatType
    });
}
function onWindowResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
}
function animate() {
    uniforms["time"].value = performance.now() / 1000;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}