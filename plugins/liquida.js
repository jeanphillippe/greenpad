// LIQUID A: un visual en WebGL para el video. Un parlante acostado, visto desde arriba, con gotas de líquido sobre el cono.
// - Las gotas caen desde arriba al empezar. Saltan con el bombo y algunas salen volando: caen en la caja, rebotan,
//   se van de cuadro, y al rato vuelven a caer nuevas desde arriba. Algunas salen disparadas hacia la cámara y pasan
//   grandes y desenfocadas por delante.
// - Cada caja salpica en un punto al azar del cono (una corona de gotas y una onda que sale de ahí) y los hi-hats
//   hacen saltar gotitas sueltas por todos lados.
// - La cámara cambia de plano cada 2 compases (casi siempre un primer plano; a veces rasante, de costado, desde
//   arriba o abierto) y tiembla más cuanto más fuerte suena.
// - Con el resto del sonido el cono vibra y las gotas se juntan en dibujos (como la arena sobre una placa que vibra).
//   Cada zona de frecuencias arma un dibujo distinto y el dibujo gira despacio.
// - Dos luces bajas desde esquinas opuestas: azul abajo a la izquierda (sube con el bombo) y roja arriba a la derecha
//   (sube con la caja). Cada gota tira una sombra larga por luz.
// - Sombras baratas: no hay mapa de sombras. Cada sombra es un punto en pantalla que dibuja adentro una cápsula estirada
//   hacia donde no llega la luz, y oscurece lo que ya está dibujado (mezcla multiplicativa). La sombra de la luz azul
//   saca el azul y deja el rojo, y al revés. Son dos pasadas en total.
// - Alrededor del parlante, sobre la caja: el espectro en rayitas (graves del lado de la luz azul, agudos del lado de la
//   roja), los 16 pasos y un círculo que se completa con el tema. Arriba, el título en tipografía suiza.
// Si el equipo no tiene WebGL, se dibuja una versión simple en 2D.
GREENPAD.plugin({
  id: 'liquida',
  nombre: 'Liquid A',
  autor: 'GREENPAD',
  version: '3.0',
  tipo: 'visual',
  descripcion: 'Gotas de líquido sobre un parlante, en 3D y en primer plano: caen, saltan con el bombo, salpican con la caja, vuelan hacia la cámara y se juntan en dibujos que cambian con la música. Luz azul y roja desde esquinas opuestas y el espectro dibujado alrededor.',
  setup(gp) {
    const TAU = Math.PI * 2, N = 3200, RCONO = 0.78, FOV = 50 * Math.PI / 180, W = 720, H = 1280, NB = 64;
    const LB = [-2.4, 0.6, 2.8], LR = [2.6, 0.7, -2.6];                    // luz azul (abajo a la izquierda) y roja (arriba a la derecha)
    const CB = [0.2, 0.42, 1.0], CR = [1.0, 0.14, 0.08];
    const TB = [0.92, 0.5, 0.22], TR = [0.22, 0.55, 0.95];                  // lo que deja pasar la sombra de cada luz
    // dibujos (m: líneas que cruzan el centro, n: anillos), uno por zona de frecuencias, de graves a agudos
    const MODOS = [[2, 2], [3, 2], [4, 3], [5, 3], [6, 3], [3, 4], [8, 4], [10, 5]];
    const SUIZA = '"Helvetica Neue",Helvetica,Arial,sans-serif', MONO = 'ui-monospace,Menlo,Consolas,monospace';

    // ---------- shaders ----------
    const ALTURA = `
precision highp float;
uniform float uE; uniform vec4 uRR, uRA, uRX, uRZ; uniform vec3 uMd; uniform float uMA;
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
  for (int i = 0; i < 4; i++) { float x = length(p - vec2(uRX[i], uRZ[i])) - uRR[i]; d += uRA[i] * sin(x * 42.0) * exp(-x * x * 90.0) * cono; }
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
uniform vec3 uCam, uLB, uLR, uCB, uCR, uLedC; uniform sampler2D uSpec; uniform float uPaso, uProg, uBrillo;
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
  if (r > 0.22 && r < 0.80) h += 0.0006 * sin(r * 150.0) + 0.0003 * sin(r * 410.0) + 0.0005 * ruido(p * 70.0);   // cono de papel
  if (r > 0.92 && r < 1.04) h += tornillo(p, m);
  if (r > 1.04) h += (0.0008 * ruido(p * 90.0) + 0.0003 * ruido(p * 150.0)) * lejos;                         // la caja, con textura
  return h;
}
vec3 luz(vec3 P, vec3 Nn, vec3 V, vec3 Lp, vec3 Lc, float alb, float sh, float sk) {
  vec3 L = Lp - P; float d2 = dot(L, L); L *= inversesqrt(d2);
  float at = 1.0 / (1.0 + 0.5 * d2), df = max(dot(Nn, L), 0.0);
  float sp = pow(max(dot(Nn, normalize(L + V)), 0.0), sh) * sk * (sh + 8.0) / 25.0;
  float fr = 0.04 + 0.96 * pow(1.0 - max(dot(Nn, V), 0.0), 5.0);
  return Lc * at * df * (alb + sp * (0.5 + fr));
}
float linea(float d, float w) { return 1.0 - smoothstep(w, w + 0.0022, d); }
void main() {
  vec2 p = vP.xz; float r = length(p);
  vec3 V = uCam - vP; float dist = length(V); V /= dist;
  float lejos = 1.0 - smoothstep(3.5, 6.0, dist), e = 0.0016, h0 = detalle(p, lejos);
  vec3 Nn = normalize(vec3(h0 - detalle(p + vec2(e, 0.0), lejos), e, h0 - detalle(p + vec2(0.0, e), lejos)));
  float alb, sh, sk, moja = 0.0, tm;
  if (r < 0.22) { alb = 0.026; sh = 70.0; sk = 0.7; moja = 0.4; }
  else if (r < 0.80) { alb = 0.028; sh = 16.0; sk = 0.22; moja = 1.0; }
  else if (r < 0.92) { alb = 0.018; sh = 28.0; sk = 0.35; }
  else if (r < 1.04) { tornillo(p, tm); alb = 0.04; sh = 46.0 + tm * 40.0; sk = 1.1; }
  else { alb = 0.008; sh = 18.0; sk = 0.12; }
  vec3 col = vec3(0.0008, 0.0009, 0.0014) * (0.6 + 0.4 * Nn.y);
  col += luz(vP, Nn, V, uLB, uCB, alb, sh, sk) + luz(vP, Nn, V, uLR, uCR, alb, sh, sk);
  if (moja > 0.0) {                                       // capa de líquido: un brillo fino y fuerte encima
    vec3 Nw = normalize(mix(vec3(0.0, 1.0, 0.0), Nn, 0.55));
    col += (luz(vP, Nw, V, uLB, uCB, 0.0, 260.0, 0.6) + luz(vP, Nw, V, uLR, uCR, 0.0, 260.0, 0.6)) * moja;
  }
  // ---- lo dibujado sobre la caja: líneas finas que se mueven con el sonido ----
  if (r > 1.06 && r < 1.47) {
    float a = atan(p.y, p.x);
    // los 16 pasos: rayitas cortas justo afuera del aro; la que suena, encendida
    float sp = 6.28318 / 16.0, ks = floor((a + 1.5708) / sp + 0.5), as = ks * sp - 1.5708;
    float on = abs(mod(ks, 16.0) - uPaso) < 0.5 ? 1.0 : 0.0;
    float dS = abs(sin(a - as)) * r;
    col += mix(vec3(0.02) * (mod(ks, 4.0) < 0.5 ? 2.5 : 1.0), uLedC * 2.4, on) * linea(dS, on > 0.5 ? 0.006 : 0.0025) * step(1.065, r) * step(r, 1.095);
    // el espectro: 96 rayitas; los graves del lado de la luz azul y los agudos del lado de la roja, igual de los dos lados
    float sg = 6.28318 / 96.0, k = floor(a / sg + 0.5), ang = k * sg;
    float u = abs(mod(ang - 2.35619 + 3.14159, 6.28318) - 3.14159) / 3.14159;
    float b = texture2D(uSpec, vec2(0.01 + u * 0.98, 0.5)).r;
    float r0 = 1.125, len = 0.01 + 0.34 * b;
    float tick = linea(abs(sin(a - ang)) * r, 0.0018) * step(r0, r) * (1.0 - smoothstep(r0 + len - 0.003, r0 + len, r));
    vec3 tc = mix(mix(vec3(0.3, 0.52, 1.0), vec3(0.85), smoothstep(0.12, 0.42, u)), vec3(1.0, 0.28, 0.2), smoothstep(0.58, 0.88, u));
    col += tc * tick * (0.1 + 1.9 * b) * uBrillo;
    // un círculo fino que se va completando con el tema (desde arriba, en el sentido del reloj)
    float dc = abs(r - 1.43), pr = fract((a + 1.5708) / 6.28318);
    col += vec3(1.0) * linea(dc, 0.0012) * (pr < uProg ? 0.55 : 0.05);
    col += vec3(1.0) * linea(length(p - 1.43 * vec2(cos(uProg * 6.28318 - 1.5708), sin(uProg * 6.28318 - 1.5708))), 0.008) * 0.9;
  }
  col *= 1.0 - smoothstep(3.6, 6.2, dist);                // a lo lejos se pierde en lo oscuro
  col = vec3(1.0) - exp(-col * 1.7);
  gl_FragColor = vec4(pow(col, vec3(0.4545)), 1.0);
}
`;
    const VS_GOTA = `
precision highp float;
attribute vec4 aP; attribute float aB;
uniform mat4 uVP; uniform float uPS, uHalo, uMax, uFoco, uPase;
varying vec3 vC; varying float vR, vAire, vBlur;
void main() {
  vec4 c = uVP * vec4(aP.xyz, 1.0); gl_Position = c;
  vC = aP.xyz; vR = aP.w; vAire = clamp((aP.y - aB - aP.w) * 5.0, 0.0, 1.0);
  vBlur = clamp((uFoco * 0.62 - c.w) / (uFoco * 0.4), 0.0, 1.0);             // más cerca de la cámara que el parlante: fuera de foco
  float px = 2.0 * aP.w * uPS / c.w * (uHalo > 0.5 ? 4.0 : 1.0 + vBlur * 0.6);
  gl_PointSize = min(px, uMax);
  if (uHalo < 0.5 && (uPase < 0.5 ? vBlur > 0.02 : vBlur <= 0.02)) gl_Position = vec4(2.0, 2.0, 2.0, 1.0);   // cada una en su pasada
}
`;
    const FS_GOTA = `
precision highp float;
uniform vec3 uCam, uLB, uLR, uCB, uCR, uRt, uUp, uBk; uniform float uHalo;
varying vec3 vC; varying float vR, vAire, vBlur;
vec3 gota(vec3 P, vec3 Nn, vec3 V, vec3 Lp, vec3 Lc) {
  vec3 L = Lp - P; float d2 = dot(L, L); L *= inversesqrt(d2);
  float at = 1.0 / (1.0 + 0.5 * d2);
  vec3 Hh = normalize(L + V); float nh = max(dot(Nn, Hh), 0.0);
  float fr = 0.03 + 0.97 * pow(1.0 - max(dot(Nn, V), 0.0), 5.0);
  vec3 R = reflect(-V, Nn);
  float brillo = pow(nh, 300.0) * 14.0 + pow(nh, 36.0) * 0.45;              // el punto de luz, chico y fuerte
  float refl = pow(max(dot(R, L), 0.0), 8.0) * (0.06 + fr * 1.2);            // el reflejo ancho de la luz
  float pasa = pow(max(dot(Nn, -L), 0.0), 4.0) * 0.22 * (1.0 - fr);          // la luz que atraviesa y sale del otro lado
  return Lc * at * (brillo + refl + pasa + max(dot(Nn, L), 0.0) * 0.012);
}
void main() {
  vec2 q = gl_PointCoord * 2.0 - 1.0; q.y = -q.y; float d = dot(q, q);
  if (d > 1.0) discard;
  float bl = uHalo > 0.5 ? 0.0 : vBlur;
  if (bl > 0.0) q *= 1.0 + bl * 0.6;                                         // la gota ocupa menos del punto: el resto es borde suave
  d = min(dot(q, q), 0.999);
  if (uHalo > 0.5) {                                                         // halo: solo las gotas que van por el aire
    vec3 L1 = uLB - vC, L2 = uLR - vC;
    vec3 c = uCB / (1.0 + 0.5 * dot(L1, L1)) + uCR / (1.0 + 0.5 * dot(L2, L2));
    gl_FragColor = vec4(c * exp(-d * 4.5) * vAire * 0.06, 1.0); return;
  }
  vec3 nv = vec3(q, sqrt(1.0 - d)), Nn = normalize(uRt * nv.x + uUp * nv.y + uBk * nv.z);
  vec3 P = vC + Nn * vR, V = normalize(uCam - P);
  vec3 col = vec3(0.002, 0.0022, 0.003) + gota(P, Nn, V, uLB, uCB) + gota(P, Nn, V, uLR, uCR);
  col *= 1.0 - smoothstep(0.82, 1.0, d) * 0.6 * (1.0 - bl);
  col = mix(col, vec3(dot(col, vec3(0.33))) * 0.6 + col * 0.5, bl * 0.5);  // desenfocada: brillos más repartidos
  col = vec3(1.0) - exp(-col * 1.7);
  float rr = length(gl_PointCoord * 2.0 - 1.0), al = 1.0 - smoothstep(1.0 / (1.0 + bl * 0.6) - 0.02 - bl * 0.35, 1.0 / (1.0 + bl * 0.6) + bl * 0.25, rr);
  gl_FragColor = vec4(pow(col, vec3(0.4545)), bl > 0.0 ? al * (1.0 - bl * 0.35) : 1.0);
}
`;
    // sombras: un punto por gota y por luz. Adentro del punto se dibuja una cápsula que va desde donde cae la sombra de la
    // parte de abajo de la gota hasta donde cae la de arriba (las dos proyectadas desde la luz sobre el piso que tiene abajo).
    const VS_SOMBRA = `
precision highp float;
attribute vec4 aP; attribute float aB;
uniform mat4 uVP; uniform vec3 uL; uniform vec2 uRes; uniform float uPS, uMax;
varying vec2 vA, vB; varying float vRad, vI, vSz;
vec3 piso(vec3 Q, float y) { float t = (uL.y - y) / max(uL.y - Q.y, 0.05); vec3 T = uL + (Q - uL) * t; T.y = y; return T; }
void main() {
  vec3 P = aP.xyz; float h = max(P.y - aB - aP.w, 0.0);
  vec3 S0 = piso(P - vec3(0.0, aP.w * 0.8, 0.0), aB), S1 = piso(P + vec3(0.0, aP.w * 0.8, 0.0), aB);
  vec3 d = S1 - S0; float l = length(d); if (l > 0.24) S1 = S0 + d / l * 0.24;   // sombras largas, pero con tope
  vec4 a = uVP * vec4(S0, 1.0), b = uVP * vec4(S1, 1.0);
  vec2 sa = a.xy / a.w * 0.5 * uRes, sb = b.xy / b.w * 0.5 * uRes, m = (sa + sb) * 0.5;
  float rpx = aP.w * uPS / a.w * (1.1 + h * 3.0);                            // más grande y suave cuanto más alto va la gota
  float sz = min(length(sb - sa) + 2.0 * rpx + 4.0, uMax);
  gl_Position = vec4(m / (0.5 * uRes), 0.0, 1.0);
  gl_PointSize = sz;
  vA = sa - m; vB = sb - m; vRad = rpx; vSz = sz; vI = 0.55 / (1.0 + h * 7.0);
}
`;
    const FS_SOMBRA = `
precision highp float;
uniform vec3 uTinte; varying vec2 vA, vB; varying float vRad, vI, vSz;
void main() {
  vec2 p = (gl_PointCoord - 0.5) * vSz; p.y = -p.y;
  vec2 ab = vB - vA; float k = clamp(dot(p - vA, ab) / max(dot(ab, ab), 1e-4), 0.0, 1.0);
  float d = length(p - vA - ab * k), r = vRad * mix(1.0, 0.6, k);
  float a = (1.0 - smoothstep(r * 0.5, r * 1.3, d)) * vI * mix(1.0, 0.45, k);
  if (a < 0.004) discard;
  gl_FragColor = vec4(mix(vec3(1.0), uTinte, a), 1.0);
}
`;
    // la luz en el aire, desde las dos esquinas, y la viñeta, en una sola pasada: color + fondo * alfa
    const VS_PANT = `attribute vec2 aQ; varying vec2 vU; void main() { vU = aQ * 0.5 + 0.5; gl_Position = vec4(aQ, 0.0, 1.0); }`;
    const FS_PANT = `
precision highp float;
uniform vec3 uGB, uGR; uniform float uT; varying vec2 vU;
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main() {
  vec2 p = vU * vec2(0.5625, 1.0);
  vec2 b = p - vec2(-0.04, -0.03), r = p - vec2(0.6025, 1.03);
  vec3 c = uGB * (exp(-dot(b, b) * 14.0) * 0.22 + exp(-dot(b, b) * 3.0) * 0.035)
         + uGR * (exp(-dot(r, r) * 14.0) * 0.22 + exp(-dot(r, r) * 3.0) * 0.035);
  c += (hash(vU * 913.0 + uT) - 0.5) * 0.01 + 0.002;
  vec2 v = vU - 0.5; float vin = 1.0 - smoothstep(0.3, 0.8, length(v * vec2(1.0, 0.72))) * 0.7;
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

    // ---------- planos de cámara: cambian cada 2 compases (el primer plano sale más seguido) ----------
    // el: altura en grados, D: distancia, az: giro, t: adónde mira, p: cuántas chances tiene de salir
    const PLANOS = [
      { el: 48, D: 2.75, az: 0.0, t: [0, 0.0, 0.05], p: 3 },               // primer plano
      { el: 42, D: 2.45, az: 0.45, t: [0.18, 0.02, 0.1], p: 1.6 },         // primer plano de costado
      { el: 42, D: 2.45, az: -0.45, t: [-0.18, 0.02, 0.1], p: 1.6 },
      { el: 21, D: 2.25, az: 0.12, t: [0, 0.1, -0.05], p: 1.3 },           // rasante: las gotas pasan por delante
      { el: 78, D: 2.9, az: 0.3, t: [0, 0, 0], p: 1 },                     // desde arriba
      { el: 54, D: 4.3, az: 0.0, t: [0, 0.05, -0.12], p: 1 },              // abierto, con el espectro entero
    ];
    function elegirPlano(m) {
      let tot = 0; PLANOS.forEach((x, i) => { if (i !== m.plano) tot += x.p; });
      let r = Math.random() * tot;
      for (let i = 0; i < PLANOS.length; i++) { if (i === m.plano) continue; r -= PLANOS[i].p; if (r <= 0) return i; }
      return 0;
    }

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
      // el espectro, en una textura de una fila
      const tx = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tx);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, NB, 1, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, null);
      for (const [a, b] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, a, b);
      const maxPS = gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE)[1] || 64;
      return { cv, gl, sup, gota, som, pant, bSup, bIdx, bGota, bPant, nIdx: idx.length, tx, maxPS, datos: new Float32Array(N * 5), espectro: new Uint8Array(NB) };
    }

    // ---------- lo mismo que el shader, para saber a qué altura está el piso debajo de cada gota ----------
    function prof(r) {
      if (r < 0.22) { const q = r / 0.22; return -0.158 + 0.052 * Math.sqrt(Math.max(0, 1 - q * q)); }
      if (r < 0.80) return -0.17 + 0.166 * Math.pow((r - 0.22) / 0.58, 0.8);
      if (r < 0.92) return -0.004 + 0.046 * Math.sin(Math.PI * (r - 0.80) / 0.12);
      if (r < 1.04) return r < 1.025 ? 0.014 : 0.014 * (1 - (r - 1.025) / 0.015);
      return 0;
    }
    const suave = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
    function suelo(r, th, U) {
      let h = prof(r);
      if (r >= 0.92) return h;
      h += U.E * (1 - suave(0.80, 0.92, r));
      const cono = 1 - suave(0.74, 0.80, r); if (!cono) return h;
      for (let i = 0; i < 4; i++) { if (!U.RA[i]) continue; const x = Math.hypot(r * Math.cos(th) - U.RX[i], r * Math.sin(th) - U.RZ[i]) - U.RR[i]; h += U.RA[i] * Math.sin(x * 42) * Math.exp(-x * x * 90) * cono; }
      return h + U.MA * Math.cos(U.Md[0] * th + U.Md[2]) * Math.sin(Math.PI * U.Md[1] * r / 0.78) * cono * suave(0.04, 0.3, r);
    }

    // una gota nueva que cae desde arriba (muchas empiezan fuera de cuadro)
    function nueva(m, i, alto) {
      const r = Math.sqrt(Math.random()) * 0.74, a = Math.random() * TAU;
      m.x[i] = Math.cos(a) * r; m.z[i] = Math.sin(a) * r; m.y[i] = alto;
      m.vx[i] = (Math.random() - 0.5) * 0.12; m.vz[i] = (Math.random() - 0.5) * 0.12; m.vy[i] = -Math.random() * 0.5;
      m.g[i] = 0; m.t[i] = 0; m.tv[i] = 2.5 + Math.random() * 6;
    }
    function iniciar(m) {
      for (const k of ['x', 'y', 'z', 'vx', 'vy', 'vz', 'rad', 't', 'tv']) m[k] = new Float32Array(N);
      m.g = new Uint8Array(N);
      m.fx = 0; m.fz = 1;                                                    // hacia dónde está la cámara, mirando desde arriba
      for (let i = 0; i < N; i++) {
        m.rad[i] = 0.004 + 0.012 * Math.pow(Math.random(), 2.8) + (Math.random() < 0.03 ? 0.01 : 0);
        nueva(m, i, 0.15 + Math.random() * 3.4);                           // al empezar llueven todas sobre el parlante
      }
      m.tAnt = null; m.antesB = 0; m.antesC = 0; m.E = 0; m.en = 0; m.modo = 2; m.pend = -1; m.fade = 1; m.cambio = -9; m.trk = null;
      m.RR = [9, 9, 9, 9]; m.RA = [0, 0, 0, 0]; m.RX = [0, 0, 0, 0]; m.RZ = [0, 0, 0, 0]; m.giro = 0; m.vgiro = 0.06; m.flB = 0; m.flR = 0;
      m.esp = new Float32Array(NB); m.prom = new Float32Array(NB).fill(0.3); m.pico = new Float32Array(NB).fill(0.5);
      m.plano = 5; m.tramo = -1; const p0 = PLANOS[5]; m.cam = { el: p0.el, D: p0.D, az: p0.az, t: p0.t.slice() }; m.sx = 0; m.sy = 0;
    }

    function mover(m, v, dt) {
      // golpes
      const bombo = v.bombo > 0.93 && m.antesB <= 0.93, caja = v.caja > 0.93 && m.antesC <= 0.93;
      m.antesB = v.bombo; m.antesC = v.caja;
      const fuerza = 0.65 + 0.45 * v.graves, grande = bombo ? 0.02 + 0.07 * v.graves : 0;
      const onda = (x, z, r0, a) => { const i = m.RA.indexOf(Math.min(...m.RA)); m.RX[i] = x; m.RZ[i] = z; m.RR[i] = r0; m.RA[i] = a; };
      if (bombo) { onda(0, 0, 0.2, 0.011 * fuerza); m.flB = 1; }
      let sx = 0, sz = 0;                                                    // la caja salpica en un punto al azar del cono
      if (caja) { const a = Math.random() * TAU, rr = 0.25 + Math.random() * 0.42; sx = Math.cos(a) * rr; sz = Math.sin(a) * rr; onda(sx, sz, 0, 0.007 * (0.7 + v.medios)); m.flR = 1; }
      const agudos = (v.bandas(8)[6] + v.bandas(8)[7]) / 2;
      m.flB *= Math.exp(-dt * 7); m.flR *= Math.exp(-dt * 8);
      for (let i = 0; i < 4; i++) { m.RR[i] += dt * 1.25; m.RA[i] *= Math.exp(-dt * 2.6); if (m.RR[i] > 1.3) m.RA[i] = 0; }
      const quiere = 0.045 * v.bombo + 0.015 * v.graves; m.E += (quiere - m.E) * Math.min(1, dt * 18);
      // el espectro: sube rápido y baja despacio
      // el espectro: cuánto se pasa cada banda de lo que venía sonando (así se mueve aunque el tema suene parejo)
      const bs = v.bandas(NB), kp = 1 - Math.exp(-dt * 0.8), kc = Math.exp(-dt * 0.25);
      for (let k = 0; k < NB; k++) {
        const x = bs[k]; m.prom[k] += (x - m.prom[k]) * kp; m.pico[k] = Math.max(x, m.pico[k] * kc, m.prom[k] + 0.06);
        let y = Math.max(0, (x - m.prom[k] * 0.8) / (m.pico[k] - m.prom[k] * 0.8)); y = Math.min(1, y * 0.85 + x * 0.25);
        if (k < 10) y = Math.min(1, y + m.flB * 0.45 * (1 - k / 10)); else if (k > 44) y = Math.min(1, y + m.flR * 0.3);
        m.esp[k] = y > m.esp[k] ? y : m.esp[k] * Math.exp(-dt * 6);
        GL.espectro[k] = Math.min(255, m.esp[k] * 255) | 0;
      }
      // qué dibujo: la zona de frecuencias que más suena (sin los graves, que son del bombo)
      const b = v.bandas(8); let j = 1; for (let k = 2; k < 8; k++) if (b[k] > b[j]) j = k;
      let suma = 0; for (let k = 1; k < 8; k++) suma += b[k];
      m.en += (Math.min(1, suma / 7 * 1.5) - m.en) * Math.min(1, dt * 5);
      if (v.track !== m.trk) { if (m.trk !== null) m.pend = (m.modo + 3) % MODOS.length; m.trk = v.track; }
      else if (m.pend < 0 && j !== m.modo && v.pulsos - m.cambio > 2 && b[j] > b[m.modo] * 1.25) m.pend = j;
      if (m.pend >= 0) { m.fade -= dt * 5; if (m.fade <= 0) { m.fade = 0; m.modo = m.pend; m.pend = -1; m.cambio = v.pulsos; m.vgiro = (Math.random() < 0.5 ? -1 : 1) * (0.03 + Math.random() * 0.14); } }
      else m.fade = Math.min(1, m.fade + dt * 2.5);
      m.giro += dt * (v.bpm / 60) * m.vgiro * (1 + v.medios);              // cada dibujo gira para su lado y más rápido cuando suena más
      const md = MODOS[m.modo], en = m.en * m.fade, kn = Math.PI * md[1] / 0.78;
      const U = { E: m.E, RR: m.RR, RA: m.RA, RX: m.RX, RZ: m.RZ, Md: [md[0], md[1], m.giro], MA: 0.009 * en * Math.sin(v.pulsos * TAU * 2) };
      m.U = U;
      // las gotas
      const GR = 7, X = m.x, Y = m.y, Z = m.z, VX = m.vx, VY = m.vy, VZ = m.vz, R = m.rad, G = m.g, out = GL.datos, paso = dt * 30;
      for (let i = 0; i < N; i++) {
        let x = X[i], z = Z[i], r = Math.hypot(x, z);
        if (G[i]) {
          if (r < RCONO) {                                                   // sobre el cono
            const th = Math.atan2(z, x), ca = Math.cos(md[0] * th + m.giro), sa = Math.sin(md[0] * th + m.giro), sr = Math.sin(kn * r);
            const A = ca * sr, I = Math.abs(A) * en;
            const s = I * 0.012 * paso;                                      // tiembla donde vibra: así se juntan donde no vibra
            x += (Math.random() - 0.5) * s; z += (Math.random() - 0.5) * s;
            const dr = ca * kn * Math.cos(kn * r), dq = -md[0] * sa * sr / Math.max(r, 0.05), cr = x / (r || 1), sn = z / (r || 1);
            const kk = -A * en * 0.02;                                       // y se deslizan hacia donde el cono no vibra
            VX[i] = VX[i] * 0.75 + (dr * cr - dq * sn) * kk; VZ[i] = VZ[i] * 0.75 + (dr * sn + dq * cr) * kk;
            x += VX[i] * dt; z += VZ[i] * dt;
            if (I > 0.4 && Math.random() < (I - 0.4) * 0.12 * paso) { VY[i] = I * (0.35 + Math.random() * 0.8); VX[i] += (Math.random() - 0.5) * 0.3 * I; VZ[i] += (Math.random() - 0.5) * 0.3 * I; G[i] = 0; }
            if (caja) {                                                      // la corona de la salpicadura
              const dx = x - sx, dz = z - sz, d = Math.hypot(dx, dz);
              if (d < 0.16) { const f = 1 - d / 0.16, o = (0.25 + Math.random() * 0.7) * f / (d || 1); VY[i] = (0.9 + Math.random() * 1.6) * (0.4 + f); VX[i] += dx * o; VZ[i] += dz * o; G[i] = 0; }
              else if (Math.random() < 0.05) { VY[i] = 0.3 + Math.random() * 0.4; G[i] = 0; }
            }
            if (G[i] && Math.random() < agudos * agudos * 0.006 * paso) { VY[i] = 0.25 + Math.random() * 0.55 * (0.5 + agudos); G[i] = 0; }   // chispitas de los hi-hats
            if (bombo) {
              if (Math.random() < grande) {                                  // algunas salen volando lejos
                if (Math.random() < 0.3) {                                   // y algunas, hacia la cámara
                  const o = 0.5 + Math.random() * 1.0;
                  VY[i] = 3.0 + Math.random() * 1.6; VX[i] = m.fx * o + (Math.random() - 0.5) * 0.5; VZ[i] = m.fz * o + (Math.random() - 0.5) * 0.5;
                } else {
                  const o = 0.45 + Math.random() * 1.1, a = th + (Math.random() - 0.5) * 0.9;
                  VY[i] = 2.1 + Math.random() * 1.6; VX[i] = Math.cos(a) * o; VZ[i] = Math.sin(a) * o;
                }
              } else {
                VY[i] = fuerza * (0.7 + Math.random() * 1.1) * (r < 0.22 ? 1.2 : 1);
                VX[i] += (Math.random() - 0.5) * 0.22 * fuerza; VZ[i] += (Math.random() - 0.5) * 0.22 * fuerza;
              }
              G[i] = 0;
            }
            for (let k = 0; k < 4 && G[i]; k++) {                            // la onda del bombo pasa y las levanta hacia afuera
              if (m.RA[k] > 0.002) { const ox = x - m.RX[k], oz = z - m.RZ[k], dd = Math.hypot(ox, oz), d = dd - m.RR[k]; if (d > -0.03 && d < 0.03 && Math.random() < 0.5 * paso) { VY[i] = m.RA[k] * (40 + Math.random() * 45); const o = m.RA[k] * 14 / (dd || 1); VX[i] += ox * o; VZ[i] += oz * o; G[i] = 0; } }
            }
          } else {                                                           // en el borde, el aro o la caja
            const sl = (prof(r + 0.004) - prof(r - 0.004)) / 0.008, nx = x / r, nz = z / r;
            VX[i] -= sl * GR * 0.8 * nx * dt; VZ[i] -= sl * GR * 0.8 * nz * dt;  // la goma las hace resbalar para un lado o el otro
            const fr = r > 1.04 ? 0.86 : 0.94; VX[i] *= fr; VZ[i] *= fr;
            x += VX[i] * dt; z += VZ[i] * dt;
            if (bombo && Math.random() < 0.45) { VY[i] = fuerza * (0.12 + Math.random() * 0.3); G[i] = 0; }   // la caja también vibra
            m.t[i] += dt;
            if (m.t[i] > m.tv[i] || r > 2.2) { nueva(m, i, 1.4 + Math.random() * 2.2); x = X[i]; z = Z[i]; }
          }
          if (G[i]) { r = Math.hypot(x, z); Y[i] = suelo(r, Math.atan2(z, x), U) + R[i]; }
        }
        if (!G[i]) {                                                         // en el aire
          VY[i] -= GR * dt; x += VX[i] * dt; z += VZ[i] * dt; Y[i] += VY[i] * dt;
          r = Math.hypot(x, z);
          const piso = suelo(r, Math.atan2(z, x), U) + R[i];
          if (Y[i] <= piso) {
            Y[i] = piso;
            if (VY[i] < -0.7) { VY[i] *= -0.3; VX[i] *= 0.6; VZ[i] *= 0.6; } // rebota
            else { VY[i] = 0; G[i] = 1; m.t[i] = 0; }
          }
          if (r > 3.2 || Y[i] < -1) { nueva(m, i, 1.4 + Math.random() * 2.2); x = X[i]; z = Z[i]; r = Math.hypot(x, z); }
        }
        X[i] = x; Z[i] = z;
        const o = i * 5, base = Y[i] > 0.5 ? (r < 1.04 ? prof(r) : 0) : suelo(r, Math.atan2(z, x), U);
        out[o] = x; out[o + 1] = Y[i]; out[o + 2] = z; out[o + 3] = R[i]; out[o + 4] = base;
      }
    }

    // la cámara: se calcula en cada cuadro
    function camara(m, v, dt) {
      const prog = v.dur > 0 ? Math.min(1, v.ahora / v.dur) : 0;
      // un plano nuevo cada 2 compases (y al cambiar de track); el primero es abierto, para ver la lluvia
      const tramo = Math.floor(v.pulsos / 8);
      if (tramo !== m.tramo || v.track !== m.trkCam) { if (m.tramo >= 0) m.plano = elegirPlano(m); m.tramo = tramo; m.trkCam = v.track; }
      const P0 = PLANOS[m.plano], c = m.cam, kc = 1 - Math.exp(-dt * 4.5);
      c.el += (P0.el - c.el) * kc; c.D += (P0.D - c.D) * kc; c.az += (P0.az - c.az) * kc; for (let k = 0; k < 3; k++) c.t[k] += (P0.t[k] - c.t[k]) * kc;
      // temblor de cámara en mano: más fuerte cuanto más suena
      const tiem = 0.004 + 0.02 * v.bombo + 0.01 * v.graves;
      m.sx += ((Math.random() - 0.5) * tiem - m.sx) * 0.35; m.sy += ((Math.random() - 0.5) * tiem - m.sy) * 0.35;
      const az = c.az + Math.sin(v.pulsos * Math.PI / 16) * 0.06, el = (c.el + Math.sin(v.pulsos * Math.PI / 23) * 1.4) * Math.PI / 180, D = c.D * (1 - prog * 0.06);
      const ojo = [Math.sin(az) * Math.cos(el) * D + m.sx, Math.sin(el) * D - v.bombo * 0.02 + m.sy, Math.cos(az) * Math.cos(el) * D];
      m.fx = Math.sin(az); m.fz = Math.cos(az);
      const obj = [c.t[0] + m.sx * 0.5, c.t[1] + m.sy * 0.5, c.t[2]];
      const cam = mirar(ojo, obj), VP = mult(persp(FOV, W / H, 0.05, 20), cam.m), PS = H / (2 * Math.tan(FOV / 2)), foco = Math.hypot(ojo[0] - obj[0], ojo[1] - obj[1], ojo[2] - obj[2]);
      m.vista = { ojo, cam, VP, PS, foco, prog };
    }

    function dibujarGL(v, m) {
      const { gl, sup, gota, som, pant } = GL, U = m.U;
      // cámara: mira el parlante desde arriba y en diagonal; se mece despacio, se acerca con el tema y tiembla con el bombo
      const { ojo, cam, VP, PS, foco, prog } = m.vista;
      const iB = 16 * (0.55 + 0.25 * v.graves + 0.9 * m.flB), iR = 16 * (0.55 + 0.25 * v.medios + 0.8 * m.flR);
      const cB = CB.map(c => c * iB), cR = CR.map(c => c * iR), maxP = Math.min(GL.maxPS, 420);
      gl.bindBuffer(gl.ARRAY_BUFFER, GL.bGota); gl.bufferSubData(gl.ARRAY_BUFFER, 0, GL.datos);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, GL.tx);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, NB, 1, gl.LUMINANCE, gl.UNSIGNED_BYTE, GL.espectro);
      const gotas = (pr) => {
        const a = pr.a('aP'), b = pr.a('aB');
        gl.bindBuffer(gl.ARRAY_BUFFER, GL.bGota);
        gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 4, gl.FLOAT, false, 20, 0);
        if (b >= 0) { gl.enableVertexAttribArray(b); gl.vertexAttribPointer(b, 1, gl.FLOAT, false, 20, 16); }
        return () => { gl.disableVertexAttribArray(a); if (b >= 0) gl.disableVertexAttribArray(b); };
      };
      const pon = (pr) => {
        const u = pr.u;
        if (u.uVP) gl.uniformMatrix4fv(u.uVP, false, VP); if (u.uCam) gl.uniform3fv(u.uCam, ojo);
        if (u.uLB) gl.uniform3fv(u.uLB, LB); if (u.uLR) gl.uniform3fv(u.uLR, LR); if (u.uCB) gl.uniform3fv(u.uCB, cB); if (u.uCR) gl.uniform3fv(u.uCR, cR);
        if (u.uE) { gl.uniform1f(u.uE, U.E); gl.uniform4fv(u.uRR, U.RR); gl.uniform4fv(u.uRA, U.RA); gl.uniform4fv(u.uRX, U.RX); gl.uniform4fv(u.uRZ, U.RZ); gl.uniform3fv(u.uMd, U.Md); gl.uniform1f(u.uMA, U.MA); }
        if (u.uPS) gl.uniform1f(u.uPS, PS); if (u.uMax) gl.uniform1f(u.uMax, maxP);
      };
      // 1. el parlante y la caja
      gl.viewport(0, 0, W, H);
      gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.disable(gl.BLEND); gl.enable(gl.DEPTH_TEST); gl.depthMask(true);
      gl.useProgram(sup.p); pon(sup);
      const lc = /^#[0-9a-f]{6}$/i.test(v.color) ? [1, 3, 5].map(i => parseInt(v.color.slice(i, i + 2), 16) / 255) : [0.24, 0.88, 0.54];
      gl.uniform3fv(sup.u.uLedC, lc); gl.uniform1f(sup.u.uPaso, v.paso); gl.uniform1f(sup.u.uProg, prog); gl.uniform1f(sup.u.uBrillo, 0.8 + 0.5 * Math.max(m.flB, m.flR));
      gl.uniform1i(sup.u.uSpec, 0);
      const aXZ = sup.a('aXZ'); gl.bindBuffer(gl.ARRAY_BUFFER, GL.bSup); gl.enableVertexAttribArray(aXZ); gl.vertexAttribPointer(aXZ, 2, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, GL.bIdx); gl.drawElements(gl.TRIANGLES, GL.nIdx, gl.UNSIGNED_SHORT, 0);
      gl.disableVertexAttribArray(aXZ);
      // 2. las sombras: oscurecen lo dibujado (mezcla multiplicativa), una pasada por luz
      gl.disable(gl.DEPTH_TEST); gl.depthMask(false); gl.enable(gl.BLEND); gl.blendFunc(gl.DST_COLOR, gl.ZERO);
      gl.useProgram(som.p); pon(som); gl.uniform2f(som.u.uRes, W, H); gl.uniform1f(som.u.uMax, Math.min(GL.maxPS, 160));
      let suelta = gotas(som);
      gl.uniform3fv(som.u.uL, LB); gl.uniform3fv(som.u.uTinte, TB); gl.drawArrays(gl.POINTS, 0, N);
      gl.uniform3fv(som.u.uL, LR); gl.uniform3fv(som.u.uTinte, TR); gl.drawArrays(gl.POINTS, 0, N);
      suelta();
      // 3. las gotas y su halo
      gl.disable(gl.BLEND); gl.enable(gl.DEPTH_TEST); gl.depthMask(true);
      gl.useProgram(gota.p); pon(gota);
      gl.uniform3fv(gota.u.uRt, cam.s); gl.uniform3fv(gota.u.uUp, cam.u); gl.uniform3fv(gota.u.uBk, cam.b); gl.uniform1f(gota.u.uFoco, foco);
      suelta = gotas(gota);
      gl.uniform1f(gota.u.uHalo, 0); gl.uniform1f(gota.u.uPase, 0); gl.drawArrays(gl.POINTS, 0, N);     // nítidas
      gl.enable(gl.BLEND); gl.depthMask(false);
      gl.blendFunc(gl.ONE, gl.ONE); gl.uniform1f(gota.u.uHalo, 1); gl.drawArrays(gl.POINTS, 0, N);       // halos
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.uniform1f(gota.u.uHalo, 0); gl.uniform1f(gota.u.uPase, 1); gl.drawArrays(gl.POINTS, 0, N);   // las de cerca, desenfocadas
      suelta();
      // 4. la luz en el aire y la viñeta
      gl.disable(gl.DEPTH_TEST); gl.blendFunc(gl.ONE, gl.SRC_ALPHA);
      gl.useProgram(pant.p);
      gl.uniform3fv(pant.u.uGB, cB.map(c => c / 16)); gl.uniform3fv(pant.u.uGR, cR.map(c => c / 16)); gl.uniform1f(pant.u.uT, (v.ahora * 30 | 0) % 97);
      const aQ = pant.a('aQ'); gl.bindBuffer(gl.ARRAY_BUFFER, GL.bPant); gl.enableVertexAttribArray(aQ); gl.vertexAttribPointer(aQ, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3); gl.disableVertexAttribArray(aQ);
      gl.disable(gl.BLEND); gl.depthMask(true);
    }

    // arriba: tipografía suiza, alineada a la izquierda, con una línea fina que avanza con el tema
    function textos(g, v, m) {
      const prog = v.dur > 0 ? Math.min(1, v.ahora / v.dur) : 0, X0 = 48, X1 = 672, flB = m.flB || 0, flR = m.flR || 0;
      const min = (s) => (s / 60 | 0) + ':' + String(s % 60 | 0).padStart(2, '0');
      g.textBaseline = 'alphabetic';
      // una franja oscura arriba, para que el texto se lea en cualquier plano
      const sc = g.createLinearGradient(0, 0, 0, 270); sc.addColorStop(0, 'rgba(0,0,0,.72)'); sc.addColorStop(0.6, 'rgba(0,0,0,.4)'); sc.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = sc; g.fillRect(0, 0, W, 270);
      // la letra del track, grande y solo de contorno, a la derecha
      g.textAlign = 'right'; g.font = '700 170px ' + SUIZA;
      g.lineWidth = 1.5; g.strokeStyle = `rgba(242,240,244,${0.16 + flB * 0.3})`; g.strokeText(String(v.track), X1 + 6, 150);
      // título y datos
      g.textAlign = 'left'; g.fillStyle = '#f2f0f4'; g.font = '700 44px ' + SUIZA;
      const tit = String(v.titulo || '').toUpperCase(); g.fillText(tit, X0, 112, 470);
      g.font = '600 15px ' + SUIZA; g.fillStyle = 'rgba(242,240,244,.55)';
      g.fillStyle = `rgba(80,130,255,${0.7 + flB * 0.3})`; g.fillRect(X0, 135, 8, 8);
      g.fillStyle = 'rgba(242,240,244,.6)'; g.fillText(v.bpm + ' BPM', X0 + 16, 144);
      const w1 = g.measureText(v.bpm + ' BPM').width;
      g.fillStyle = `rgba(255,60,40,${0.7 + flR * 0.3})`; g.fillRect(X0 + 36 + w1, 135, 8, 8);
      g.fillStyle = 'rgba(242,240,244,.6)'; g.fillText('TRACK ' + v.track, X0 + 52 + w1, 144);
      g.textAlign = 'right'; g.font = '500 14px ' + MONO; g.fillStyle = 'rgba(242,240,244,.45)';
      g.fillText(min(v.ahora) + (v.dur > 0 ? ' / ' + min(v.dur) : ''), X1, 192);
      // la línea: fina de punta a punta, y gruesa hasta donde va el tema
      g.fillStyle = 'rgba(242,240,244,.14)'; g.fillRect(X0, 166, X1 - X0, 1);
      g.fillStyle = 'rgba(242,240,244,.85)'; g.fillRect(X0, 165, (X1 - X0) * prog, 3);
      // a los costados: dos líneas verticales finas que suben con los graves (izquierda, azul) y los medios (derecha, roja)
      const y0 = 1060, alto = 760, gb = Math.min(1, v.graves * 1.1 + flB * 0.2), md = Math.min(1, v.medios * 1.4 + flR * 0.2);
      g.fillStyle = 'rgba(242,240,244,.08)'; g.fillRect(22, y0 - alto, 1, alto); g.fillRect(W - 23, y0 - alto, 1, alto);
      g.fillStyle = 'rgba(90,140,255,.9)'; g.fillRect(21, y0 - alto * gb, 3, alto * gb);
      g.fillStyle = 'rgba(255,70,50,.9)'; g.fillRect(W - 24, y0 - alto * md, 3, alto * md);
    }

    // sin WebGL: las dos luces y un parlante plano que late
    function dibujar2D(g, v) {
      g.fillStyle = '#030304'; g.fillRect(0, 0, W, H);
      const az = g.createRadialGradient(0, H, 0, 0, H, 700); az.addColorStop(0, 'rgba(56,107,255,.4)'); az.addColorStop(1, 'rgba(56,107,255,0)');
      const ro = g.createRadialGradient(W, 0, 0, W, 0, 700); ro.addColorStop(0, 'rgba(255,38,23,.4)'); ro.addColorStop(1, 'rgba(255,38,23,0)');
      g.fillStyle = az; g.fillRect(0, 0, W, H); g.fillStyle = ro; g.fillRect(0, 0, W, H);
      const R = 290 * (1 + v.bombo * 0.04);
      for (const [r, c] of [[R + 30, '#121215'], [R, '#09090b'], [R * 0.75, '#101013'], [R * 0.28, '#19191d']]) { g.fillStyle = c; g.beginPath(); g.arc(360, 680, r, 0, TAU); g.fill(); }
      g.strokeStyle = 'rgba(80,130,255,.6)'; g.lineWidth = 3; g.beginPath(); g.arc(360, 680, R * 0.75, Math.PI * 0.6, Math.PI * 1.15); g.stroke();
      g.strokeStyle = 'rgba(255,60,40,.6)'; g.beginPath(); g.arc(360, 680, R * 0.75, Math.PI * 1.6, Math.PI * 2.15); g.stroke();
    }

    gp.visual({
      id: 'liquida',
      nombre: 'Liquid A',
      detalle: 'Gotas de líquido sobre un parlante, en 3D y casi siempre en primer plano. Caen desde arriba, saltan con el bombo, salpican con la caja, chispean con los hi-hats y algunas vuelan hacia la cámara; con el resto del sonido se juntan en dibujos que cambian con la música. El plano cambia cada 2 compases. Luz azul abajo a la izquierda (late con el bombo) y roja arriba a la derecha (late con la caja), con el espectro dibujado alrededor.',
      dibujar(g, v) {
        const m = v.memoria;
        if (!MAL && !GL) { try { GL = armar(); } catch (e) { MAL = true; console.warn('Liquid A:', e); } }
        if (GL) {
          if (!m.x) iniciar(m);
          const dt = m.tAnt == null ? 1 / 30 : Math.max(0, Math.min(0.05, v.ahora - m.tAnt)); m.tAnt = v.ahora;
          mover(m, v, dt); camara(m, v, dt);
          dibujarGL(v, m);
          g.drawImage(GL.cv, 0, 0, W, H);
        } else dibujar2D(g, v);
        textos(g, v, m);
      },
    });
  },
});
