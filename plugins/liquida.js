// LIQUID A: un visual en WebGL para el video. Un parlante acostado, visto desde arriba, con gotas de líquido sobre el cono.
// Las gotas saltan con el bombo, las ondas que salen del centro las empujan y con el resto del sonido se van juntando en
// dibujos (como la arena sobre una placa que vibra): cada zona de frecuencias arma un dibujo distinto y el dibujo gira despacio.
// Lo iluminan dos luces bajas desde esquinas opuestas: azul desde abajo a la izquierda y roja desde arriba a la derecha.
// Cada gota tira dos sombras largas, una por luz, y la luz que la atraviesa sale del otro lado como en una gota de agua.
// Si el equipo no tiene WebGL, se dibuja una versión simple en 2D.
GREENPAD.plugin({
  id: 'liquida',
  nombre: 'Liquid A',
  autor: 'GREENPAD',
  version: '1.0',
  tipo: 'visual',
  descripcion: 'Gotas de líquido sobre un parlante, en 3D: saltan con el bombo, las ondas del cono las empujan y con el sonido se juntan en dibujos que cambian con la música. Una luz azul y una roja desde esquinas opuestas.',
  setup(gp) {
    const TAU = Math.PI * 2, N = 3200, RMAX = 0.77, FOV = 50 * Math.PI / 180, W = 720, H = 1280;
    const LB = [-2.5, 0.85, 2.9], LR = [2.7, 0.95, -2.7];                  // luz azul (abajo a la izquierda) y roja (arriba a la derecha)
    const CB = [0.22, 0.42, 1.0], CR = [1.0, 0.15, 0.09];
    // dibujos (m: líneas que cruzan el centro, n: anillos), uno por zona de frecuencias, de graves a agudos
    const MODOS = [[2, 2], [3, 2], [4, 3], [5, 3], [6, 3], [3, 4], [8, 4], [10, 5]];
    const GRUESA = '"Helvetica Neue","Arial Black",Arial,sans-serif';

    // ---------- shaders ----------
    const ALTURA = `
precision highp float;
uniform float uE; uniform vec4 uRR; uniform vec4 uRA; uniform vec3 uMd; uniform float uMA;
float prof(float r) {
  if (r < 0.22) { float q = r / 0.22; return -0.158 + 0.052 * sqrt(max(0.0, 1.0 - q * q)); }   // tapa del centro
  if (r < 0.80) { float q = (r - 0.22) / 0.58; return mix(-0.17, -0.004, pow(q, 0.8)); }      // cono
  if (r < 0.92) { float q = (r - 0.80) / 0.12; return -0.004 + 0.046 * sin(3.14159 * q); }    // borde de goma
  if (r < 1.04) return 0.014 * (1.0 - smoothstep(1.025, 1.04, r));                           // aro de metal
  return 0.0;                                                                                // la caja
}
float mov(vec2 p, float r) {
  float cm = 1.0 - smoothstep(0.80, 0.92, r), cono = 1.0 - smoothstep(0.74, 0.80, r);
  float d = uE * cm;
  for (int i = 0; i < 4; i++) { float x = r - uRR[i]; d += uRA[i] * sin(x * 42.0) * exp(-x * x * 90.0) * cono; }
  float th = atan(p.y, p.x + 1e-6);
  d += uMA * cos(uMd.x * th + uMd.z) * sin(3.14159 * uMd.y * r / 0.78) * cono * smoothstep(0.04, 0.3, r);
  return d;
}
float altura(vec2 p) { float r = length(p); return prof(r) + (r < 0.95 ? mov(p, r) : 0.0); }
`;
    const VS_SUP = ALTURA + `
attribute vec2 aXZ; uniform mat4 uVP; varying vec3 vP;
void main() { vec3 P = vec3(aXZ.x, altura(aXZ), aXZ.y); vP = P; gl_Position = uVP * vec4(P, 1.0); }
`;
    const FS_SUP = ALTURA + `
varying vec3 vP;
uniform vec3 uCam, uLB, uLR, uCB, uCR, uLedC; uniform sampler2D uSh; uniform float uPaso;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float ruido(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y); }
float tornillo(vec2 p, out float m) {
  float a = atan(p.y, p.x) - 0.3927, k = floor(a / 0.7854 + 0.5), ang = k * 0.7854 + 0.3927;
  vec2 c = 0.985 * vec2(cos(ang), sin(ang)), q = p - c; float d = length(q); m = 0.0;
  if (d > 0.022) return 0.0;
  m = 1.0; vec2 u = vec2(cos(ang + 0.7), sin(ang + 0.7));
  float h = 0.010 * sqrt(1.0 - d * d / 0.000484);
  if (abs(dot(q, u)) < 0.0028 || abs(dot(q, vec2(-u.y, u.x))) < 0.0028) h -= 0.006;     // la cruz
  return h;
}
float detalle(vec2 p, float lejos) {
  float r = length(p), h = altura(p), m;
  if (r > 0.22 && r < 0.80) h += 0.0006 * sin(r * 150.0) + 0.0003 * sin(r * 410.0) + 0.0005 * ruido(p * 70.0);       // estrías del cono de papel
  if (r > 0.92 && r < 1.04) h += tornillo(p, m);
  if (r > 1.04) h += (0.0010 * ruido(p * 90.0) + 0.0004 * ruido(p * 150.0)) * lejos;       // la caja, con textura
  return h;
}
vec3 luz(vec3 P, vec3 Nn, vec3 V, vec3 Lp, vec3 Lc, float alb, float sh, float sk) {
  vec3 L = Lp - P; float d2 = dot(L, L); L *= inversesqrt(d2);
  float at = 1.0 / (1.0 + 0.5 * d2), df = max(dot(Nn, L), 0.0);
  float sp = pow(max(dot(Nn, normalize(L + V)), 0.0), sh) * sk * (sh + 8.0) / 25.0;
  float fr = 0.04 + 0.96 * pow(1.0 - max(dot(Nn, V), 0.0), 5.0);
  return Lc * at * df * (alb + sp * (0.5 + fr));
}
void main() {
  vec2 p = vP.xz; float r = length(p);
  vec3 V = uCam - vP; float dist = length(V); V /= dist;
  float lejos = 1.0 - smoothstep(3.5, 6.0, dist), e = 0.0016, h0 = detalle(p, lejos);
  vec3 Nn = normalize(vec3(h0 - detalle(p + vec2(e, 0.0), lejos), e, h0 - detalle(p + vec2(0.0, e), lejos)));
  float alb, sh, sk, moja = 0.0, met = 0.0, tm;
  if (r < 0.22) { alb = 0.030; sh = 70.0; sk = 0.7; moja = 0.4; }
  else if (r < 0.80) { alb = 0.034; sh = 16.0; sk = 0.22; moja = 1.0; }
  else if (r < 0.92) { alb = 0.022; sh = 28.0; sk = 0.35; }
  else if (r < 1.04) { tornillo(p, tm); alb = 0.05; sh = 46.0 + tm * 40.0; sk = 1.1; met = 1.0; }
  else { alb = 0.016; sh = 14.0; sk = 0.16; }
  // sombras de las gotas: r = de la luz azul, g = de la roja, b = apoyo
  float sB = 1.0, sR = 1.0, ao = 1.0;
  if (r < 0.86) {
    vec3 s = texture2D(uSh, p / 1.7 + 0.5).rgb * (1.0 - smoothstep(0.80, 0.86, r));
    sB = 1.0 - clamp(s.r, 0.0, 0.92); sR = 1.0 - clamp(s.g, 0.0, 0.92); ao = 1.0 - clamp(s.b * 0.7, 0.0, 0.8);
  }
  vec3 col = vec3(0.0015, 0.0017, 0.0025) * (0.6 + 0.4 * Nn.y);
  col += luz(vP, Nn, V, uLB, uCB, alb, sh, sk) * sB + luz(vP, Nn, V, uLR, uCR, alb, sh, sk) * sR;
  if (moja > 0.0) {                                       // capa de líquido: un brillo fino y fuerte encima
    vec3 Nw = normalize(mix(vec3(0.0, 1.0, 0.0), Nn, 0.55));
    col += (luz(vP, Nw, V, uLB, uCB, 0.0, 260.0, 0.55) * sB + luz(vP, Nw, V, uLR, uCR, 0.0, 260.0, 0.55) * sR) * moja;
  }
  if (met > 0.0) col *= vec3(0.95, 0.97, 1.0);
  col *= ao;
  // los 16 pasos: luces chicas alrededor del parlante
  if (r > 1.09 && r < 1.17) {
    float a = atan(p.y, p.x) + 1.5708, k = mod(floor(a / 0.392699 + 0.5), 16.0), ang = k * 0.392699 - 1.5708;
    float d = length(p - 1.13 * vec2(cos(ang), sin(ang)));
    float on = abs(k - uPaso) < 0.5 ? 1.0 : 0.0;
    vec3 lc = mix(vec3(0.012, 0.012, 0.014) * (mod(k, 4.0) < 0.5 ? 2.0 : 1.0), uLedC * 2.2, on);
    col += lc * (1.0 - smoothstep(0.006, 0.010, d)) + lc * on * 0.5 * exp(-d * d * 3000.0);
  }
  col = vec3(1.0) - exp(-col * 1.7);
  gl_FragColor = vec4(pow(col, vec3(0.4545)), 1.0);
}
`;
    const VS_GOTA = `
precision highp float;
attribute vec4 aP; attribute float aB;
uniform mat4 uVP; uniform float uPS, uHalo;
varying vec3 vC; varying float vR, vAire;
void main() {
  vec4 c = uVP * vec4(aP.xyz, 1.0); gl_Position = c;
  vC = aP.xyz; vR = aP.w; vAire = clamp((aP.y - aB - aP.w) * 7.0, 0.0, 1.0);
  gl_PointSize = min(2.0 * aP.w * uPS / c.w * (uHalo > 0.5 ? 4.0 : 1.0), 120.0);
}
`;
    const FS_GOTA = `
precision highp float;
uniform vec3 uCam, uLB, uLR, uCB, uCR, uRt, uUp, uBk; uniform float uHalo;
varying vec3 vC; varying float vR, vAire;
vec3 gota(vec3 P, vec3 Nn, vec3 V, vec3 Lp, vec3 Lc) {
  vec3 L = Lp - P; float d2 = dot(L, L); L *= inversesqrt(d2);
  float at = 1.0 / (1.0 + 0.5 * d2);
  vec3 Hh = normalize(L + V); float nh = max(dot(Nn, Hh), 0.0);
  float fr = 0.03 + 0.97 * pow(1.0 - max(dot(Nn, V), 0.0), 5.0);
  vec3 R = reflect(-V, Nn);
  float brillo = pow(nh, 300.0) * 14.0 + pow(nh, 36.0) * 0.45;               // el punto de luz, chico y fuerte
  float refl = pow(max(dot(R, L), 0.0), 8.0) * (0.06 + fr * 1.2);            // el reflejo ancho de la luz
  float pasa = pow(max(dot(Nn, -L), 0.0), 4.0) * 0.22 * (1.0 - fr);          // la luz que atraviesa y sale del otro lado
  float df = max(dot(Nn, L), 0.0) * 0.012;
  return Lc * at * (brillo + refl + pasa + df);
}
void main() {
  vec2 q = gl_PointCoord * 2.0 - 1.0; q.y = -q.y; float d = dot(q, q);
  if (d > 1.0) discard;
  if (uHalo > 0.5) {                                                         // halo: solo las gotas que van por el aire
    vec3 L1 = uLB - vC, L2 = uLR - vC;
    vec3 c = uCB / (1.0 + 0.5 * dot(L1, L1)) + uCR / (1.0 + 0.5 * dot(L2, L2));
    gl_FragColor = vec4(c * exp(-d * 4.5) * vAire * 0.11, 1.0); return;
  }
  vec3 nv = vec3(q, sqrt(1.0 - d)), Nn = normalize(uRt * nv.x + uUp * nv.y + uBk * nv.z);
  vec3 P = vC + Nn * vR, V = normalize(uCam - P);
  vec3 col = vec3(0.002, 0.0022, 0.003) + gota(P, Nn, V, uLB, uCB) + gota(P, Nn, V, uLR, uCR);
  col *= 1.0 - smoothstep(0.82, 1.0, d) * 0.6;                               // borde un poco más oscuro
  col = vec3(1.0) - exp(-col * 1.7);
  gl_FragColor = vec4(pow(col, vec3(0.4545)), 1.0);
}
`;
    // sombras: cada gota se dibuja sobre un mapa visto desde arriba, estirada en la dirección contraria a cada luz
    const VS_SOMBRA = `
precision highp float;
attribute vec4 aP; attribute float aB;
uniform vec3 uL; uniform float uK, uModo; varying float vI;
void main() {
  vec3 P = aP.xyz; float h = max(P.y - aB - aP.w, 0.0);
  vec2 xz = P.xz; float rad = aP.w * 1.25 + h * 0.12, I = 0.9 / (1.0 + h * 40.0);
  if (uModo > 0.5) {
    vec3 Q = vec3(P.x, aB + (P.y + aP.w * 0.9 - aB) * uK, P.z);
    float t = (uL.y - aB) / max(uL.y - Q.y, 1e-3);
    xz = (uL + (Q - uL) * t).xz;
    rad = aP.w * (1.05 - 0.35 * uK) + h * 0.25; I = 0.55 / (1.0 + h * 9.0);
  }
  gl_Position = vec4(xz / 0.85, 0.0, 1.0);
  gl_PointSize = clamp(rad * 2.0 * 301.0, 1.0, 64.0);
  vI = I;
}
`;
    const FS_SOMBRA = `
precision highp float;
uniform vec3 uCh; varying float vI;
void main() { vec2 q = gl_PointCoord * 2.0 - 1.0; float d = dot(q, q); if (d > 1.0) discard; gl_FragColor = vec4(uCh * vI * exp(-d * 2.2), 1.0); }
`;
    // luz en el aire desde las dos esquinas y viñeta, en una sola pasada: color + fondo * alfa
    const VS_PANT = `attribute vec2 aQ; varying vec2 vU; void main() { vU = aQ * 0.5 + 0.5; gl_Position = vec4(aQ, 0.0, 1.0); }`;
    const FS_PANT = `
precision highp float;
uniform vec3 uGB, uGR; uniform float uT; varying vec2 vU;
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main() {
  vec2 p = vU * vec2(0.5625, 1.0);
  vec2 b = p - vec2(-0.06, -0.04), r = p - vec2(0.6225, 1.04);
  vec3 c = uGB * (exp(-dot(b, b) * 6.0) * 0.30 + exp(-dot(b, b) * 1.4) * 0.07)
         + uGR * (exp(-dot(r, r) * 6.0) * 0.30 + exp(-dot(r, r) * 1.4) * 0.07);
  c += (hash(vU * 913.0 + uT) - 0.5) * 0.012 + 0.005;
  vec2 v = vU - 0.5; float vin = 1.0 - smoothstep(0.35, 0.85, length(v * vec2(1.0, 0.75))) * 0.55;
  gl_FragColor = vec4(max(c, 0.0), vin);
}
`;

    // ---------- matrices ----------
    function persp(f, a, n, fa) { const t = 1 / Math.tan(f / 2), nf = 1 / (n - fa); return [t / a, 0, 0, 0, 0, t, 0, 0, 0, 0, (fa + n) * nf, -1, 0, 0, 2 * fa * n * nf, 0]; }
    const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], cruz = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const nrm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }, punto = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    function mirar(ojo, obj) {
      const f = nrm(sub(obj, ojo)), s = nrm(cruz(f, [0, 1, 0])), u = cruz(s, f);
      return { m: [s[0], u[0], -f[0], 0, s[1], u[1], -f[1], 0, s[2], u[2], -f[2], 0, -punto(s, ojo), -punto(u, ojo), punto(f, ojo), 1], s, u, b: [-f[0], -f[1], -f[2]] };
    }
    function mult(a, b) { const o = new Array(16); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) { let x = 0; for (let k = 0; k < 4; k++) x += a[k * 4 + r] * b[c * 4 + k]; o[c * 4 + r] = x; } return o; }

    // ---------- WebGL: se arma una sola vez ----------
    let GL = null, MAL = false;
    function armar() {
      const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
      const gl = cv.getContext('webgl', { antialias: true, alpha: false, preserveDrawingBuffer: true });
      if (!gl) throw new Error('sin WebGL');
      cv.addEventListener('webglcontextlost', (e) => { e.preventDefault(); GL = null; });
      function prog(vs, fs) {
        const p = gl.createProgram();
        for (const [t, src] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]]) {
          const s = gl.createShader(t); gl.shaderSource(s, src); gl.compileShader(s);
          if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error('shader: ' + gl.getShaderInfoLog(s));
          gl.attachShader(p, s);
        }
        gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('link: ' + gl.getProgramInfoLog(p));
        const u = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < n; i++) { const nm = gl.getActiveUniform(p, i).name.replace(/\[0\]$/, ''); u[nm] = gl.getUniformLocation(p, nm); }
        return { p, u, a: (nm) => gl.getAttribLocation(p, nm) };
      }
      const sup = prog(VS_SUP, FS_SUP), gota = prog(VS_GOTA, FS_GOTA), som = prog(VS_SOMBRA, FS_SOMBRA), pant = prog(VS_PANT, FS_PANT);
      // la superficie: una malla en anillos, apretada en el parlante y suelta en la caja
      const NR = 150, NA = 192, xz = new Float32Array((NR + 1) * (NA + 1) * 2), idx = new Uint16Array(NR * NA * 6);
      let k = 0;
      for (let i = 0; i <= NR; i++) {
        const t = i / NR, r = t < 0.8 ? (t / 0.8) * 1.06 : 1.06 + Math.pow((t - 0.8) / 0.2, 2) * 5;
        for (let j = 0; j <= NA; j++) { const a = j / NA * TAU; xz[k++] = Math.cos(a) * r; xz[k++] = Math.sin(a) * r; }
      }
      k = 0;
      for (let i = 0; i < NR; i++) for (let j = 0; j < NA; j++) { const a = i * (NA + 1) + j, b = a + NA + 1; idx.set([a, b, a + 1, a + 1, b, b + 1], k); k += 6; }
      const bSup = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bSup); gl.bufferData(gl.ARRAY_BUFFER, xz, gl.STATIC_DRAW);
      const bIdx = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bIdx); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
      const bGota = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bGota); gl.bufferData(gl.ARRAY_BUFFER, N * 5 * 4, gl.DYNAMIC_DRAW);
      const bPant = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bPant); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      // mapa de sombras
      const tx = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tx);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 512, 512, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      for (const [a, b] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, a, b);
      const fb = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fb); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tx, 0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      return { cv, gl, sup, gota, som, pant, bSup, bIdx, bGota, bPant, nIdx: idx.length, tx, fb, datos: new Float32Array(N * 5) };
    }

    // ---------- lo mismo que el shader, para saber a qué altura está el cono debajo de cada gota ----------
    function sobre(r, th, U) {
      let h;
      if (r < 0.22) { const q = r / 0.22; h = -0.158 + 0.052 * Math.sqrt(Math.max(0, 1 - q * q)); }
      else { const q = (r - 0.22) / 0.58; h = -0.17 + 0.166 * Math.pow(q, 0.8); }
      const cono = r < 0.74 ? 1 : 1 - (((r - 0.74) / 0.06) ** 2) * (3 - 2 * ((r - 0.74) / 0.06));
      h += U.E;
      for (let i = 0; i < 4; i++) { const x = r - U.RR[i]; if (U.RA[i]) h += U.RA[i] * Math.sin(x * 42) * Math.exp(-x * x * 90) * cono; }
      const c0 = Math.min(1, Math.max(0, (r - 0.04) / 0.26)), suave = c0 * c0 * (3 - 2 * c0);
      return h + U.MA * Math.cos(U.Md[0] * th + U.Md[2]) * Math.sin(Math.PI * U.Md[1] * r / 0.78) * cono * suave;
    }

    function iniciar(m) {
      m.x = new Float32Array(N); m.z = new Float32Array(N); m.h = new Float32Array(N); m.vy = new Float32Array(N);
      m.vx = new Float32Array(N); m.vz = new Float32Array(N); m.rad = new Float32Array(N);
      for (let i = 0; i < N; i++) {
        const r = Math.sqrt(0.02 + Math.random() * (RMAX * RMAX - 0.02)) * 0.995, a = Math.random() * TAU;
        m.x[i] = Math.cos(a) * r; m.z[i] = Math.sin(a) * r;
        m.rad[i] = 0.004 + 0.012 * Math.pow(Math.random(), 2.8) + (Math.random() < 0.03 ? 0.01 : 0);
      }
      m.t = null; m.antesB = 0; m.antesC = 0; m.E = 0; m.en = 0; m.modo = 2; m.pend = -1; m.fade = 1; m.cambio = -9; m.trk = null;
      m.RR = [9, 9, 9, 9]; m.RA = [0, 0, 0, 0]; m.giro = 0;
    }

    function mover(m, v, dt) {
      // golpes
      const bombo = v.bombo > 0.93 && m.antesB <= 0.93, caja = v.caja > 0.93 && m.antesC <= 0.93;
      m.antesB = v.bombo; m.antesC = v.caja;
      const fuerza = 0.65 + 0.45 * v.graves;
      if (bombo) { const i = m.RA.indexOf(Math.min(...m.RA)); m.RR[i] = 0.2; m.RA[i] = 0.011 * fuerza; }
      for (let i = 0; i < 4; i++) { m.RR[i] += dt * 1.25; m.RA[i] *= Math.exp(-dt * 2.6); if (m.RR[i] > 0.9) m.RA[i] = 0; }
      const quiere = 0.045 * v.bombo + 0.015 * v.graves; m.E += (quiere - m.E) * Math.min(1, dt * 18);
      // qué dibujo: la zona de frecuencias que más suena (sin los graves, que son del bombo)
      const b = v.bandas(8); let j = 1; for (let k = 2; k < 8; k++) if (b[k] > b[j]) j = k;
      let suma = 0; for (let k = 1; k < 8; k++) suma += b[k];
      m.en += (Math.min(1, suma / 7 * 1.5) - m.en) * Math.min(1, dt * 5);
      if (v.track !== m.trk) { if (m.trk !== null) m.pend = (m.modo + 3) % MODOS.length; m.trk = v.track; }
      else if (m.pend < 0 && j !== m.modo && v.pulsos - m.cambio > 2 && b[j] > b[m.modo] * 1.25) m.pend = j;
      if (m.pend >= 0) { m.fade -= dt * 5; if (m.fade <= 0) { m.fade = 0; m.modo = m.pend; m.pend = -1; m.cambio = v.pulsos; } }
      else m.fade = Math.min(1, m.fade + dt * 2.5);
      m.giro = v.pulsos * 0.06;
      const md = MODOS[m.modo], en = m.en * m.fade;
      const U = { E: m.E, RR: m.RR, RA: m.RA, Md: [md[0], md[1], m.giro], MA: 0.009 * en * Math.sin(v.pulsos * TAU * 2) };
      m.U = U;
      // gotas
      const G = 7, X = m.x, Z = m.z, Hh = m.h, VY = m.vy, VX = m.vx, VZ = m.vz, R = m.rad, out = GL.datos, paso = dt * 30;
      for (let i = 0; i < N; i++) {
        let x = X[i], z = Z[i], r = Math.hypot(x, z), th = Math.atan2(z, x);
        const kn = Math.PI * md[1] / 0.78, ca = Math.cos(md[0] * th + m.giro), sa = Math.sin(md[0] * th + m.giro), sr = Math.sin(kn * r);
        const A = ca * sr, I = Math.abs(A) * en;
        const quieta = Hh[i] <= 0 && VY[i] <= 0;
        if (quieta) {
          const s = I * 0.012 * paso;                                     // tiembla donde vibra: así se juntan donde no vibra
          x += (Math.random() - 0.5) * s; z += (Math.random() - 0.5) * s;
          // y se deslizan hacia donde el cono no vibra (las líneas del dibujo)
          const dr = ca * kn * Math.cos(kn * r), dt2 = -md[0] * sa * sr / Math.max(r, 0.05), cr = x / (r || 1), sn = z / (r || 1);
          const gx = dr * cr - dt2 * sn, gz = dr * sn + dt2 * cr, k = -A * en * 0.02;
          VX[i] = VX[i] * 0.75 + gx * k; VZ[i] = VZ[i] * 0.75 + gz * k; x += VX[i] * dt; z += VZ[i] * dt;
          if (I > 0.4 && Math.random() < (I - 0.4) * 0.12 * paso) { VY[i] = I * (0.35 + Math.random() * 0.8); VX[i] += (Math.random() - 0.5) * 0.3 * I; VZ[i] += (Math.random() - 0.5) * 0.3 * I; }
          if (caja && Math.random() < 0.18 + I * 0.5) VY[i] = 0.4 + Math.random() * 0.55;
        }
        if (bombo && Hh[i] < 0.03) {
          VY[i] = Math.max(VY[i], fuerza * (0.5 + Math.random() * 0.8) * (r < 0.22 ? 1.15 : 1));
          VX[i] += (Math.random() - 0.5) * 0.22 * fuerza; VZ[i] += (Math.random() - 0.5) * 0.22 * fuerza;
        }
        for (let k = 0; k < 4; k++) {                                         // la onda del bombo pasa y las levanta hacia afuera
          if (m.RA[k] > 0.002 && Hh[i] < 0.01) { const d = r - m.RR[k]; if (d > -0.03 && d < 0.03 && Math.random() < 0.5 * paso) { VY[i] = Math.max(VY[i], m.RA[k] * (40 + Math.random() * 45)); const o = m.RA[k] * 14 / (r || 1); VX[i] += x * o; VZ[i] += z * o; } }
        }
        if (!quieta || VY[i] > 0) {
          VY[i] -= G * dt; Hh[i] += VY[i] * dt; x += VX[i] * dt; z += VZ[i] * dt;
          if (Hh[i] <= 0) { Hh[i] = 0; if (VY[i] < -0.55) { VY[i] *= -0.3; VX[i] *= 0.55; VZ[i] *= 0.55; } else VY[i] = 0; }
        }
        r = Math.hypot(x, z);
        if (r > RMAX) { const nx = x / r, nz = z / r, vn = VX[i] * nx + VZ[i] * nz; if (vn > 0) { VX[i] -= 1.5 * vn * nx; VZ[i] -= 1.5 * vn * nz; } x = nx * RMAX; z = nz * RMAX; r = RMAX; }
        X[i] = x; Z[i] = z;
        const base = sobre(r, Math.atan2(z, x), U), o = i * 5;
        out[o] = x; out[o + 1] = base + R[i] + Hh[i]; out[o + 2] = z; out[o + 3] = R[i]; out[o + 4] = base;
      }
    }

    function dibujarGL(v, m) {
      const { gl, sup, gota, som, pant } = GL, U = m.U;
      // cámara: mira el parlante desde arriba y en diagonal; se mece despacio y baja un poco con el bombo
      const az = Math.sin(v.pulsos * Math.PI / 16) * 0.07, el = (62 + Math.sin(v.pulsos * Math.PI / 23) * 1.6) * Math.PI / 180, D = 4.15;
      const ojo = [Math.sin(az) * Math.cos(el) * D, Math.sin(el) * D - v.bombo * 0.02, Math.cos(az) * Math.cos(el) * D];
      const cam = mirar(ojo, [0, -0.04, -0.06]), VP = mult(persp(FOV, W / H, 0.1, 20), cam.m), PS = H / (2 * Math.tan(FOV / 2));
      const iB = 16 * (0.85 + 0.3 * v.graves + 0.25 * v.bombo), iR = 16 * (0.85 + 0.3 * v.medios + 0.4 * v.caja);
      const cB = CB.map(c => c * iB), cR = CR.map(c => c * iR);
      gl.bindBuffer(gl.ARRAY_BUFFER, GL.bGota); gl.bufferSubData(gl.ARRAY_BUFFER, 0, GL.datos);
      const gotas = (pr) => {
        const a = pr.a('aP'), b = pr.a('aB');
        gl.bindBuffer(gl.ARRAY_BUFFER, GL.bGota);
        gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 4, gl.FLOAT, false, 20, 0);
        if (b >= 0) { gl.enableVertexAttribArray(b); gl.vertexAttribPointer(b, 1, gl.FLOAT, false, 20, 16); }
        return () => { gl.disableVertexAttribArray(a); if (b >= 0) gl.disableVertexAttribArray(b); };
      };
      // 1. sombras
      gl.bindFramebuffer(gl.FRAMEBUFFER, GL.fb); gl.viewport(0, 0, 512, 512);
      gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.disable(gl.DEPTH_TEST); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
      gl.useProgram(som.p); let suelta = gotas(som);
      gl.uniform1f(som.u.uModo, 0); gl.uniform3f(som.u.uCh, 0, 0, 1); gl.uniform3fv(som.u.uL, LB); gl.uniform1f(som.u.uK, 0); gl.drawArrays(gl.POINTS, 0, N);
      gl.uniform1f(som.u.uModo, 1);
      for (const [L, ch] of [[LB, [1, 0, 0]], [LR, [0, 1, 0]]]) {
        gl.uniform3fv(som.u.uL, L); gl.uniform3fv(som.u.uCh, ch);
        for (const k of [0.15, 0.4, 0.65, 0.9]) { gl.uniform1f(som.u.uK, k); gl.drawArrays(gl.POINTS, 0, N); }
      }
      suelta();
      // 2. el parlante y la caja
      gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, W, H);
      gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.disable(gl.BLEND); gl.enable(gl.DEPTH_TEST); gl.depthMask(true);
      gl.useProgram(sup.p);
      const pon = (pr) => {
        const u = pr.u;
        if (u.uVP) gl.uniformMatrix4fv(u.uVP, false, VP); if (u.uCam) gl.uniform3fv(u.uCam, ojo);
        if (u.uLB) gl.uniform3fv(u.uLB, LB); if (u.uLR) gl.uniform3fv(u.uLR, LR); if (u.uCB) gl.uniform3fv(u.uCB, cB); if (u.uCR) gl.uniform3fv(u.uCR, cR);
        if (u.uE) { gl.uniform1f(u.uE, U.E); gl.uniform4fv(u.uRR, U.RR); gl.uniform4fv(u.uRA, U.RA); gl.uniform3fv(u.uMd, U.Md); gl.uniform1f(u.uMA, U.MA); }
      };
      pon(sup);
      const lc = /^#[0-9a-f]{6}$/i.test(v.color) ? [1, 3, 5].map(i => parseInt(v.color.slice(i, i + 2), 16) / 255) : [0.24, 0.88, 0.54];
      gl.uniform3fv(sup.u.uLedC, lc); gl.uniform1f(sup.u.uPaso, v.paso);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, GL.tx); gl.uniform1i(sup.u.uSh, 0);
      const aXZ = sup.a('aXZ'); gl.bindBuffer(gl.ARRAY_BUFFER, GL.bSup); gl.enableVertexAttribArray(aXZ); gl.vertexAttribPointer(aXZ, 2, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, GL.bIdx); gl.drawElements(gl.TRIANGLES, GL.nIdx, gl.UNSIGNED_SHORT, 0);
      gl.disableVertexAttribArray(aXZ);
      // 3. las gotas y su halo
      gl.useProgram(gota.p); pon(gota);
      gl.uniform1f(gota.u.uPS, PS); gl.uniform3fv(gota.u.uRt, cam.s); gl.uniform3fv(gota.u.uUp, cam.u); gl.uniform3fv(gota.u.uBk, cam.b);
      suelta = gotas(gota);
      gl.uniform1f(gota.u.uHalo, 0); gl.drawArrays(gl.POINTS, 0, N);
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE); gl.depthMask(false);
      gl.uniform1f(gota.u.uHalo, 1); gl.drawArrays(gl.POINTS, 0, N);
      suelta();
      // 4. la luz en el aire y la viñeta
      gl.disable(gl.DEPTH_TEST); gl.blendFunc(gl.ONE, gl.SRC_ALPHA);
      gl.useProgram(pant.p);
      gl.uniform3fv(pant.u.uGB, cB.map(c => c / 16)); gl.uniform3fv(pant.u.uGR, cR.map(c => c / 16)); gl.uniform1f(pant.u.uT, (v.ahora * 30 | 0) % 97);
      const aQ = pant.a('aQ'); gl.bindBuffer(gl.ARRAY_BUFFER, GL.bPant); gl.enableVertexAttribArray(aQ); gl.vertexAttribPointer(aQ, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3); gl.disableVertexAttribArray(aQ);
      gl.disable(gl.BLEND); gl.depthMask(true);
    }

    // sin WebGL: las dos luces y un parlante plano que late
    function dibujar2D(g, v) {
      g.fillStyle = '#050507'; g.fillRect(0, 0, W, H);
      const az = g.createRadialGradient(0, H, 0, 0, H, 900); az.addColorStop(0, 'rgba(56,107,255,.45)'); az.addColorStop(1, 'rgba(56,107,255,0)');
      const ro = g.createRadialGradient(W, 0, 0, W, 0, 900); ro.addColorStop(0, 'rgba(255,38,23,.45)'); ro.addColorStop(1, 'rgba(255,38,23,0)');
      g.fillStyle = az; g.fillRect(0, 0, W, H); g.fillStyle = ro; g.fillRect(0, 0, W, H);
      const R = 300 * (1 + v.bombo * 0.04);
      for (const [r, c] of [[R + 30, '#151518'], [R, '#0b0b0d'], [R * 0.75, '#121215'], [R * 0.28, '#1c1c20']]) { g.fillStyle = c; g.beginPath(); g.arc(360, 660, r, 0, TAU); g.fill(); }
      g.strokeStyle = 'rgba(80,130,255,.6)'; g.lineWidth = 3; g.beginPath(); g.arc(360, 660, R * 0.75, Math.PI * 0.6, Math.PI * 1.15); g.stroke();
      g.strokeStyle = 'rgba(255,60,40,.6)'; g.beginPath(); g.arc(360, 660, R * 0.75, Math.PI * 1.6, Math.PI * 2.15); g.stroke();
    }

    gp.visual({
      id: 'liquida',
      nombre: 'Liquid A',
      detalle: 'Gotas de líquido sobre un parlante, en 3D. Saltan con el bombo, la onda del cono las empuja hacia afuera y con el resto del sonido se juntan en dibujos que cambian con la música. Una luz azul desde abajo a la izquierda y una roja desde arriba a la derecha.',
      dibujar(g, v) {
        const m = v.memoria;
        if (!MAL && !GL) { try { GL = armar(); } catch (e) { MAL = true; console.warn('Liquid A:', e); } }
        if (GL) {
          if (!m.x) iniciar(m);
          const dt = m.t == null ? 1 / 30 : Math.max(0, Math.min(0.05, v.ahora - m.t)); m.t = v.ahora;
          mover(m, v, dt);
          dibujarGL(v, m);
          g.drawImage(GL.cv, 0, 0, W, H);
        } else dibujar2D(g, v);
        // título
        g.textAlign = 'center'; g.textBaseline = 'alphabetic';
        g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 18;
        g.font = '900 58px ' + GRUESA; g.fillStyle = '#f2eff4'; g.fillText(v.titulo.toUpperCase(), 360, 150, 620);
        g.font = '700 21px system-ui,sans-serif'; g.fillStyle = 'rgba(242,239,244,.62)'; g.fillText(v.bpm + ' BPM   ·   TRACK ' + v.track, 360, 190);
        g.shadowBlur = 0; g.shadowColor = 'transparent';
      },
    });
  },
});
