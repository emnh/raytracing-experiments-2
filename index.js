import * as THREE from 'three.js';

const vertexShader = `
varying vec2 vUV;
void main() {
  vUV = uv;
  gl_Position = vec4(position, 1.0);
}
`;

const copyFagmentShader = `
varying vec2 vUV;
uniform sampler2D tex;

void main() {
  gl_FragColor = texture2D(tex, vUV);
}

`;

const commonFragment = `

`;

const lightFragmentShader = `
varying vec2 vUV;
uniform float frameCounter;
uniform float time;
uniform float aspect;
uniform vec2 res;
uniform sampler2D tex;

float drawSphere(vec2 pc, vec3 sphere) {
  float dx = (pc.x - sphere.x) * aspect;
  float dy = pc.y - sphere.y;
  return sqrt(dx * dx + dy * dy) - sphere.z > 0.0 ? 0.0 : 1.0;
}

void main() {
  vec2 p = vUV;
  vec2 pc = (p - 0.5) * 2.0;
  vec3 light = vec3(-0.8, 0.85, 0.05);
  vec3 sphere1 = vec3(0.5, 0.5, 0.5);
  vec3 sphere1Color = vec3(1.0, 0.0, 0.0);
  vec3 color = vec3(0.0);
  color += vec3(1.0) * drawSphere(pc, light);
  color += sphere1Color * drawSphere(pc, sphere1);
  if (frameCounter < 0.5) {
    gl_FragColor = vec4(color.x > 0.0 ? 2.0 : 0.0, 0.0, 0.0, 1.0);
  } else {
    vec2 uv = vec2(vUV.x, vUV.y);
    vec2 dx = vec2(1.0 / res.x, 0.0);
    vec2 dy = vec2(0.0, 1.0 / res.y);
    float w1 = texture2D(tex, uv + dx).x;
    float w2 = texture2D(tex, uv - dx).x;
    float w3 = texture2D(tex, uv + dy).x;
    float w4 = texture2D(tex, uv - dy).x;
    vec4 current = texture2D(tex, uv);
    float water = current.x;
    float velocity = current.y;

    float outside = 0.0;

    int count = 4;

    if ((uv + dx).x >= 1.0) {
      w1 = outside;
      count -= 1;
    }
    if ((uv - dx).x < 0.0) {
      w2 = outside;
      count -= 1;
    }
    if ((uv + dy).y >= 1.0) {
      w3 = outside;
      count -= 1;
    }
    if ((uv - dy).y < 0.0) {
      w4 = outside;
      count -= 1;
    }

    float avg = (w1 + w2 + w3 + w4 - float(count) * water); // / float(count);
    //velocity = (velocity + avg) * 0.5;
    float newWater = water + velocity + 0.5 * avg;
    float newVelocity = newWater - water;
    //velocity *= 0.19;
    gl_FragColor = vec4(vec3(newWater, newVelocity, 0.0), 1.0);
  }
}`;

const fragmentShader = `
varying vec2 vUV;
uniform float time;
uniform float aspect;
uniform sampler2D tex;

float drawSphere(vec2 pc, vec3 sphere) {
  float dx = (pc.x - sphere.x) * aspect;
  float dy = pc.y - sphere.y;
  return sqrt(dx * dx + dy * dy) - sphere.z > 0.0 ? 0.0 : 1.0;
}

void main() {
  vec2 p = vUV;
  vec2 pc = (p - 0.5) * 2.0;
  vec3 light = vec3(-0.8, 0.85, 0.05);
  vec3 sphere1 = vec3(0.5, 0.5, 0.1);
  //vec3 sphere1 = vec3(0.5, sin(time), 0.1);
  vec3 sphere1Color = vec3(1.0, 0.0, 0.0);
  vec3 color = vec3(0.0);
  color += vec3(1.0) * drawSphere(pc, light);
  color += sphere1Color * drawSphere(pc, sphere1);
  //gl_FragColor = vec4(color, 1.0) + texture2D(tex, vUV);
  gl_FragColor = vec4(vec3(texture2D(tex, vUV).x), 1.0);
}`;

const container;
const camera, scene, renderer;
const uniforms;
const state = {};

function getRT(width, height) {
  const r1 = {};
  r1.rt = new THREE.WebGLRenderTarget(width, height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType
  });
  r1.scene = new THREE.Scene();
  r1.geo = new THREE.PlaneBufferGeometry(2, 2);
  r1.uniforms = {
      "time": { value: 1.0 },
      "aspect": { value: width / height },
      "frameCounter": { value: 0 },
      "tex": { value: null },
      "res": { value: new THREE.Vector2(width, height) }
  };
  r1.material = new THREE.ShaderMaterial({
      uniforms: r1.uniforms,
      vertexShader: vertexShader,
      fragmentShader: lightFragmentShader
  });
  r1.mesh = new THREE.Mesh(r1.geo, r1.material);
  r1.scene.add(r1.mesh);

  return r1;
}

init();
animate();
function init() {
    const width = window.innerWidth;
    const height = width; // window.innerHeight;
    container = document.getElementById('container');
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    scene = new THREE.Scene();

    state.frameCounter = 0;

    state.r1 = getRT(width, height);
    state.r2 = getRT(width, height);

    const geometry = new THREE.PlaneBufferGeometry(2, 2);
    uniforms = {
        "time": { value: 1.0 },
        "aspect": { value: width / height },
        "tex": { value: state.r1.rt.texture}
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
    renderer.setSize(width, height);
}
function onWindowResize() {
    //renderer.setSize(window.innerWidth, window.innerHeight);
}
function animate() {
    uniforms["time"].value = performance.now() / 1000;
    state.r1.uniforms["time"].value = performance.now() / 1000;
    state.r2.uniforms["time"].value = performance.now() / 1000;
    state.r1.uniforms["frameCounter"].value = state.frameCounter;
    state.r2.uniforms["frameCounter"].value = state.frameCounter;

    if (state.frameCounter % 2 == 0) {
      state.r1.uniforms.tex.value = state.r2.rt.texture;
      renderer.render(state.r1.scene, camera, state.r1.rt);
      uniforms.tex.value = state.r1.rt.texture;
    } else {
      state.r2.uniforms.tex.value = state.r1.rt.texture;
      renderer.render(state.r2.scene, camera, state.r2.rt);
      uniforms.tex.value = state.r2.rt.texture;
    }

    renderer.render(scene, camera);
    //renderer.render(state.r1.scene, camera);
    
    state.frameCounter++;
    requestAnimationFrame(animate);
}