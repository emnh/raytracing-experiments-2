import * as THREE from 'three';

const vertexShader = `
varying vec2 vUV;
void main() {
  vUV = uv;
  gl_Position = vec4(position, 1.0);
}
`;

const copyFragmentShader = `
varying vec2 vUV;
uniform sampler2D tex;

void main() {
  gl_FragColor = texture2D(tex, vUV);
}

`;

const commonFragment = `

`;

const horizontalGaussianFragmentShader = `
varying vec2 vUV;
uniform float frameCounter;
uniform float time;
uniform float aspect;
uniform vec2 res;
uniform sampler2D tex;

#define iChannel0 tex

void main() {
  vec2 uv = gl_FragCoord.xy / res;
  //gl_FragColor = texture2D(tex, vUV);

  if (distance(uv, vec2(0.5, 0.5)) >= 0.5) {
    discard;
  }

  float h = 1.0 / res.x;
  vec4 sum = vec4(0.0);
  float total = 0.0;
  
  if (distance(vec2(uv.x - 1.0*h, uv.y), vec2(0.5, 0.5)) < 0.5) {
    sum += texture2D(iChannel0, fract(vec2(uv.x - 1.0*h, uv.y)) ) * 0.27901;
    total += 0.27901;
  }
  if (distance(vec2(uv.x + 0.0*h, uv.y), vec2(0.5, 0.5)) < 0.5) {
    sum += texture2D(iChannel0, fract(vec2(uv.x + 0.0*h, uv.y)) ) * 0.44198;
    total += 0.44198;
  }
  if (distance(vec2(uv.x + 1.0*h, uv.y), vec2(0.5, 0.5)) < 0.5) {
    sum += texture2D(iChannel0, fract(vec2(uv.x + 1.0*h, uv.y)) ) * 0.27901;
    total += 0.27901;
  }

  /*
	sum += texture2D(iChannel0, fract(vec2(uv.x - 4.0*h, uv.y)) ) * 0.05;
	sum += texture2D(iChannel0, fract(vec2(uv.x - 3.0*h, uv.y)) ) * 0.09;
	sum += texture2D(iChannel0, fract(vec2(uv.x - 2.0*h, uv.y)) ) * 0.12;
	sum += texture2D(iChannel0, fract(vec2(uv.x - 1.0*h, uv.y)) ) * 0.15;
	sum += texture2D(iChannel0, fract(vec2(uv.x + 0.0*h, uv.y)) ) * 0.16;
	sum += texture2D(iChannel0, fract(vec2(uv.x + 1.0*h, uv.y)) ) * 0.15;
	sum += texture2D(iChannel0, fract(vec2(uv.x + 2.0*h, uv.y)) ) * 0.12;
	sum += texture2D(iChannel0, fract(vec2(uv.x + 3.0*h, uv.y)) ) * 0.09;
	sum += texture2D(iChannel0, fract(vec2(uv.x + 4.0*h, uv.y)) ) * 0.05;
  */
  
  //gl_FragColor = sum / total; // normalize
  gl_FragColor = mix(texture(iChannel0, uv), sum / total, 0.01);
  //gl_FragColor = sum / 0.98; // normalize
  //gl_FragColor.xz = texture(iChannel0, fract(vec2(uv.x, uv.y)) ).xz;
}

`;

const verticalGaussianFragmentShader = `
varying vec2 vUV;
uniform float frameCounter;
uniform float time;
uniform float aspect;
uniform vec2 res;
uniform sampler2D tex;

#define iChannel0 tex

void main() {
  vec2 uv = gl_FragCoord.xy / res;
  //gl_FragColor = texture2D(tex, vUV);

  if (distance(uv, vec2(0.5, 0.5)) >= 0.5) {
    discard;
  }

  float v = 1.0 / res.y;
  vec4 sum = vec4(0.0);
  float total = 0.0;

  if (distance(vec2(uv.x, uv.y - 1.0*v), vec2(0.5, 0.5)) < 0.5) {
    sum += texture2D(iChannel0, fract(vec2(uv.x, uv.y - 1.0*v)) ) * 0.27901;
    total += 0.27901;
  }
  if (distance(vec2(uv.x, uv.y + 0.0*v), vec2(0.5, 0.5)) < 0.5) {
    sum += texture2D(iChannel0, fract(vec2(uv.x, uv.y + 0.0*v)) ) * 0.44198;
    total += 0.44198;
  }
  if (distance(vec2(uv.x, uv.y + 1.0*v), vec2(0.5, 0.5)) < 0.5) {
    sum += texture2D(iChannel0, fract(vec2(uv.x, uv.y + 1.0*v)) ) * 0.27901;
    total += 0.27901;
  }

  /*
	sum += texture2D(iChannel0, fract(vec2(uv.x, uv.y - 4.0*v)) ) * 0.05;
	sum += texture2D(iChannel0, fract(vec2(uv.x, uv.y - 3.0*v)) ) * 0.09;
	sum += texture2D(iChannel0, fract(vec2(uv.x, uv.y - 2.0*v)) ) * 0.12;
	sum += texture2D(iChannel0, fract(vec2(uv.x, uv.y - 1.0*v)) ) * 0.15;
	sum += texture2D(iChannel0, fract(vec2(uv.x, uv.y + 0.0*v)) ) * 0.16;
	sum += texture2D(iChannel0, fract(vec2(uv.x, uv.y + 1.0*v)) ) * 0.15;
	sum += texture2D(iChannel0, fract(vec2(uv.x, uv.y + 2.0*v)) ) * 0.12;
	sum += texture2D(iChannel0, fract(vec2(uv.x, uv.y + 3.0*v)) ) * 0.09;
	sum += texture2D(iChannel0, fract(vec2(uv.x, uv.y + 4.0*v)) ) * 0.05;
  */

  gl_FragColor = mix(texture(iChannel0, uv), sum / total, 0.01);

  //gl_FragColor = sum / 0.98; // normalize
  //gl_FragColor.xz = texture(iChannel0, fract(vec2(uv.x, uv.y)) ).xz;

}

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
  //color += vec3(1.0) * drawSphere(pc, light);
  //color += sphere1Color * drawSphere(pc, sphere1);

  //color += sphere1Color * drawSphere(pc, vec3(0.0, 0.0, 0.5));
  color += vec3(1.0, 0.0, 0.0) * drawSphere(pc, vec3(0.25, 0.25, 0.1));
  color += vec3(1.0, 0.0, 0.25) * drawSphere(pc, vec3(0.25, -0.25, 0.1));
  color += vec3(1.0, 0.0, 0.5) * drawSphere(pc, vec3(-0.25, 0.25, 0.1));
  color += vec3(1.0, 0.0, 0.75) * drawSphere(pc, vec3(-0.25, -0.25, 0.1));

  color += vec3(0.0, 0.0, 0.5) * drawSphere(pc, vec3(0.0, 0.0, 0.1));

  for (int i = 0; i < 10; i++) {
    float angle = float(i) / 10.0 * 2.0 * 3.1415926;
    float rr = 0.2;
    float x = rr * cos(angle);
    float y = rr * sin(angle);
    color += vec3(1.0, 0.0, float(i) / 10.0) * drawSphere(pc, vec3(x, y, 0.05));
  }

  if (frameCounter < 0.5) {
    gl_FragColor = vec4(color.x > 0.0 ? 2.0 : 0.0, 0.0, color.z > 0.0 ? 2.0 : 0.0, 0.0);
  } else {

    if (color.x > 0.0) {
      discard;
    }

    //vec2 uv = vec2(vUV.x, vUV.y);
    vec2 uv = gl_FragCoord.xy / res.xy;
    vec2 dx = vec2(1.0 / res.x, 0.0);
    vec2 dy = vec2(0.0, 1.0 / res.y);
    float w1 = texture2D(tex, uv + dx).x;
    float w2 = texture2D(tex, uv - dx).x;
    float w3 = texture2D(tex, uv + dy).x;
    float w4 = texture2D(tex, uv - dy).x;
    vec4 current = texture2D(tex, uv);
    float water = current.x;
    float velocity = current.y;
    
    /*
    float v1 = texture2D(tex, uv + dx).y;
    float v2 = texture2D(tex, uv - dx).y;
    float v3 = texture2D(tex, uv + dy).y;
    float v4 = texture2D(tex, uv - dy).y;

    float h1 = texture2D(tex, uv + dx).z;
    float h2 = texture2D(tex, uv - dx).z;
    float h3 = texture2D(tex, uv + dy).z;
    float h4 = texture2D(tex, uv - dy).z;
    float hue = mod(current.z + 0.0 * velocity + 0.1 * velocity * (v1 * h1 + v2 * h2 + v3 * h3 + v4 * h4), 1.0);
    */

    float outside = 0.0;

    int count = 4;

    float r = 0.5;
    vec2 center = vec2(0.5, 0.5);

    if ((uv + dx).x >= 1.0 || distance(uv + dx, center) >= r) {
      w1 = outside;
      count -= 1;
    }
    if ((uv - dx).x < 0.0 || distance(uv - dx, center) >= r) {
      w2 = outside;
      count -= 1;
    }
    if ((uv + dy).y >= 1.0 || distance(uv + dy, center) >= r) {
      w3 = outside;
      count -= 1;
    }
    if ((uv - dy).y < 0.0  || distance(uv - dy, center) >= r) {
      w4 = outside;
      count -= 1;
    }

    float vfac = 1.0;

    float avg = (w1 + w2 + w3 + w4 - float(count) * water);
    float newWater = water + vfac * velocity + 0.5 * avg;
    float newVelocity = newWater - water;

    w1 = texture2D(tex, uv + dx).z;
    w2 = texture2D(tex, uv - dx).z;
    w3 = texture2D(tex, uv + dy).z;
    w4 = texture2D(tex, uv - dy).z;
    current = texture2D(tex, uv);
    float water2 = current.z;
    float velocity2 = current.w;

    count = 4;

    if ((uv + dx).x >= 1.0 || distance(uv + dx, center) >= r) {
      w1 = outside;
      count -= 1;
    }
    if ((uv - dx).x < 0.0 || distance(uv - dx, center) >= r) {
      w2 = outside;
      count -= 1;
    }
    if ((uv + dy).y >= 1.0 || distance(uv + dy, center) >= r) {
      w3 = outside;
      count -= 1;
    }
    if ((uv - dy).y < 0.0  || distance(uv - dy, center) >= r) {
      w4 = outside;
      count -= 1;
    }

    float avg2 = (w1 + w2 + w3 + w4 - float(count) * water2);
    float newWater2 = water2 + vfac * velocity2 + 0.5 * avg2;
    float newVelocity2 = newWater2 - water2;
    gl_FragColor = vec4(newWater, newVelocity, newWater2, newVelocity2);
  }
}`;

const fragmentShader = `
varying vec2 vUV;
uniform float time;
uniform float aspect;
uniform sampler2D tex;
uniform vec2 res;

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

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
  //gl_FragColor = vec4(vec3(texture2D(tex, vUV).x), 1.0);
  //vec4 texc = texture2D(tex, vUV);
  vec4 texc = texture2D(tex, (gl_FragCoord.xy + 0.5) / res);
  float s = pow(2.0 * texc.y, 0.5);
  s = 1.0;
  //gl_FragColor = vec4(hsv2rgb(vec3(texc.z, 1.0, s)), 1.0);
  //gl_FragColor = vec4(2.0 * vec3(texc.x, 4.0 * (texc.y + texc.w), texc.z), 1.0);
  gl_FragColor = vec4(vec3(10.0 * texc.x), 1.0);
  /* gl_FragColor =
    texc.y > 0.0 ?
      vec4(hsv2rgb(vec3(texc.z, 1.0, 1.0)), 1.0) : 
      vec4(vec3(0.0), 1.0); */
}`;

const container;
const camera, scene, renderer;
const uniforms;
const state = {};

function getRT(width, height, fragmentShader) {
  const r1 = {};
  r1.rt = new THREE.WebGLRenderTarget(width, height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      //minFilter: THREE.NearestFilter,
      //magFilter: THREE.NearestFilter,
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
      fragmentShader: fragmentShader
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

    state.r1 = getRT(width, height, lightFragmentShader);
    state.r2 = getRT(width, height, lightFragmentShader);
    state.g1 = getRT(width, height, verticalGaussianFragmentShader);
    state.g2 = getRT(width, height, horizontalGaussianFragmentShader);
    //state.g1 = getRT(width, height, copyFragmentShader);
    //state.g2 = getRT(width, height, copyFragmentShader);

    const geometry = new THREE.PlaneBufferGeometry(2, 2);
    uniforms = {
        "time": { value: 1.0 },
        "aspect": { value: width / height },
        "res": { value: new THREE.Vector2(width, height) },
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
    renderer.getContext().getExtension("OES_texture_float");
    renderer.getContext().getExtension("OES_texture_float_linear");
    container.appendChild(renderer.domElement);
    onWindowResize();
    window.addEventListener('resize', onWindowResize, false);
    renderer.setSize(width, height);
    renderer.domElement.width = width;
    renderer.domElement.height = height;
    state.width = width;
    state.height = height;
}
function onWindowResize() {
    //renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setSize(state.width, state.height);
}
function animate() {
    uniforms["time"].value = performance.now() / 1000;

    for (let i = 0; i < 1; i++) {
      state.r1.uniforms["time"].value = performance.now() / 1000;
      state.r2.uniforms["time"].value = performance.now() / 1000;
      state.r1.uniforms["frameCounter"].value = state.frameCounter;
      state.r2.uniforms["frameCounter"].value = state.frameCounter;

      if (state.frameCounter % 2 == 0) {
        renderer.setRenderTarget(state.r1.rt);
        renderer.render(state.r1.scene, camera);
        uniforms.tex.value = state.r1.rt.texture;
        state.g1.uniforms.tex.value = state.r1.rt.texture;
        state.r2.uniforms.tex.value = state.r1.rt.texture;
      } else {
        renderer.setRenderTarget(state.r2.rt);
        renderer.render(state.r2.scene, camera);
        uniforms.tex.value = state.r2.rt.texture;
        state.g1.uniforms.tex.value = state.r2.rt.texture;
        state.r1.uniforms.tex.value = state.r2.rt.texture;
      }

      if (state.frameCounter % 1 == 0) {
        renderer.setRenderTarget(state.g1.rt);
        renderer.render(state.g1.scene, camera);

        state.g2.uniforms.tex.value = state.g1.rt.texture;
        renderer.setRenderTarget(state.g2.rt);
        renderer.render(state.g2.scene, camera);

        uniforms.tex.value = state.g2.rt.texture;

        state.r1.uniforms.tex.value = state.g2.rt.texture;
        state.r2.uniforms.tex.value = state.g2.rt.texture;
      }

      state.frameCounter++;
    }
    
    renderer.setRenderTarget(null);
    renderer.render(scene, camera);
    //renderer.render(state.r1.scene, camera);
    
    
    requestAnimationFrame(animate);
}