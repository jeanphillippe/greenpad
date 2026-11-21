// MANO: una herramienta para tocar y grabar con la mano apoyada en la pantalla, como en un instrumento.
// - Los 8 instrumentos están siempre a mano, sin cambiar de grupo. Con la mano quieta, cada dedo tiene el suyo:
//   pulgar BOMBO (el más grande), índice CAJA, medio HI-HAT, anular PERCU y meñique BAJO. Moviendo un poco los dedos
//   se llega a los tres verdes: GUITARRA y ACORDES del lado de la palma, MELODÍA más allá de las puntas.
// - Los cambios están en el mismo lugar: mantené apretado cualquier almohadilla y deslizá el dedo a los costados para
//   elegir su sonido (estilo). Al soltar queda.
// - En los melódicos, la altura sale de dónde apoyás el dedo: arriba agudo, abajo grave. Si lo deslizás, va tocando
//   cada nota que cruza.
// - Los tres puntos chicos, al lado del pulgar: grabar, terminar y más (vueltas por track, clic, acomodar la mano).
// - Arriba de los dedos, una fila de perillas con los efectos de todo el tema: FILTRO (a la izquierda deja los graves,
//   a la derecha los agudos), REVERB, ECO, LO-FI y VINILO. Se giran arrastrando para arriba o para abajo; dos toques
//   las vuelven a cero. Quedan guardadas con el tema y salen en Descargar. Si los dedos quedan muy arriba, la fila va abajo.
// - Lo que tocás queda en la grilla en el paso más cercano, pero suena en el momento exacto en que lo tocaste.
// - LOOP: cada instrumento tiene un botón chico arriba (o abajo). Mientras lo mantenés apretado, lo que toques en ese
//   instrumento reemplaza su ritmo y queda sonando en loop (si la música estaba quieta, arranca). Dos toques lo borran.
// - Micrófono: tres botones (1, 2 y 3) en el rincón libre. Mantenelo apretado para grabar un sonido (hasta 8 segundos);
//   un toque corto lo escucha. Después, mantené apretado cualquier instrumento y elegí MIC 1, 2 o 3 entre sus sonidos.
// - "Acomodar" pide apoyar los 5 dedos: las almohadillas amarillas quedan justo ahí y el resto se mueve y se agranda o
//   achica con la mano. Sirve para la mano derecha o la izquierda.
// - Grabar pasa de un track al siguiente: cada track suena 1, 2 o 4 vueltas mientras grabás encima y después entra el
//   próximo track vacío (con los mismos instrumentos). Al terminar se arma la canción con lo grabado y le ponés nombre.
// - En la compu: Espacio bombo, F caja, D hi-hat, S percu, A bajo, J guitarra, K acordes, L melodía; ← → cambian el
//   sonido del último que tocaste, R graba y Esc cierra.
GREENPAD.plugin({
  id: 'mano',
  nombre: 'Mano',
  autor: 'GREENPAD',
  version: '3.1',
  tipo: 'herramienta',
  descripcion: 'Tocá con la mano apoyada en la pantalla: los 8 instrumentos a mano, un LOOP por instrumento, 3 sonidos propios con el micrófono y perillas de efectos. Graba respetando el tiempo de lo que tocás y al final le ponés nombre al tema.',
  setup(gp) {
    const NECESITA = ['usarGrabacion', 'tocarGrabacion', 'misGrabaciones', 'efectos', 'enVivo', 'grabarEnVivo', 'siguiente', 'estilos', 'elegirEstilo', 'estiloDe', 'ponerCancion', 'guardarComo', 'modoCancion', 'parar'];
    // la distribución, en proporción de la pantalla (mano derecha), tal como se dibujó:
    // t: tipo (d: dedo, v: verde, p: punto) · r: radio en proporción del ancho
    const LUGARES = [
      { k: 'pul', t: 'd', p: 'BD', x: 0.426, y: 0.880, r: 0.185 },        // pulgar
      { k: 'ind', t: 'd', p: 'SN', x: 0.205, y: 0.622, r: 0.098 },        // índice
      { k: 'med', t: 'd', p: 'HH', x: 0.361, y: 0.355, r: 0.098 },        // medio
      { k: 'anu', t: 'd', p: 'PC', x: 0.630, y: 0.165, r: 0.098 },        // anular
      { k: 'men', t: 'd', p: 'BS', x: 0.875, y: 0.215, r: 0.092 },        // meñique
      { k: 'v1', t: 'v', p: 'LD', x: 0.208, y: 0.117, r: 0.148 },         // más allá de las puntas
      { k: 'v2', t: 'v', p: 'GT', x: 0.787, y: 0.375, r: 0.148 },         // del lado de la palma
      { k: 'v3', t: 'v', p: 'CH', x: 0.787, y: 0.640, r: 0.148 },
      { k: 'rec', t: 'p', x: 0.085, y: 0.802, r: 0.036 },                 // los tres puntos, al lado del pulgar
      { k: 'fin', t: 'p', x: 0.088, y: 0.880, r: 0.036 },
      { k: 'mas', t: 'p', x: 0.083, y: 0.953, r: 0.036 },
      { k: 'mic1', t: 'p', x: 0.915, y: 0.802, r: 0.036 },                // los tres micrófonos, en el rincón libre
      { k: 'mic2', t: 'p', x: 0.915, y: 0.880, r: 0.036 },
      { k: 'mic3', t: 'p', x: 0.915, y: 0.953, r: 0.036 },
    ];
    const DEDOS = LUGARES.slice(0, 5);
    const NOMBRE = { BD: 'BOMBO', SN: 'CAJA', HH: 'HI-HAT', PC: 'PERCU', BS: 'BAJO', GT: 'GUITARRA', CH: 'ACORDES', LD: 'MELODÍA' };
    const COLOR = { BD: '#3ee08a', SN: '#2ee6d6', HH: '#c6f43a', PC: '#ffae5c', BS: '#9be7c4', GT: '#6fc3ff', CH: '#ff8fb1', LD: '#b49cff' };
    const ORDEN = ['BD', 'SN', 'HH', 'PC', 'BS', 'GT', 'CH', 'LD'];
    const MEL = { BS: 1, GT: 1, CH: 1, LD: 1 }, LETRAS = 'ABCDEFGH';
    const TECLA = { ' ': 'BD', f: 'SN', d: 'HH', s: 'PC', a: 'BS', j: 'GT', k: 'CH', l: 'LD' };
    const CLAVE = 'greenpad.mano.v2';

    gp.estilo(`
.mano{position:fixed;inset:0;z-index:60;color:#eef6f1;font-family:inherit;touch-action:none;user-select:none;-webkit-user-select:none;overflow:hidden;opacity:0;transition:opacity .2s;
  /* tapete oscuro: goma mate con estrías finas en diagonal, grano y las esquinas en sombra */
  background-color:#0a0f0c;
  background-image:radial-gradient(130% 95% at 50% 45%,transparent 50%,rgba(0,0,0,.55)),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .5 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.07'/%3E%3C/svg%3E"),
    repeating-linear-gradient(45deg,rgba(255,255,255,.035) 0 1px,transparent 1px 6px),
    linear-gradient(135deg,#16231b,#080c0a 70%);
  background-size:100% 100%,180px 180px,auto,100% 100%}
.mano.on{opacity:1}
.mano *{box-sizing:border-box}
.mano button{font:inherit;color:inherit;background:none;border:0;padding:0;cursor:pointer;-webkit-tap-highlight-color:transparent}
.mano .mano-x{flex:none;width:34px;height:34px;border-radius:17px;background:rgba(255,255,255,.07);font-size:18px;line-height:34px;text-align:center}
.mano-perillas{position:absolute;left:0;right:0;z-index:3;display:flex;align-items:center;justify-content:space-between;gap:4px;padding:6px 10px}
.mano-perillas.arriba{top:env(safe-area-inset-top)}
.mano-perillas.abajo{bottom:env(safe-area-inset-bottom)}
.mano-per{flex:1;max-width:66px;display:flex;flex-direction:column;align-items:center;gap:1px;touch-action:none;cursor:ns-resize}
.mano-per svg{width:46px;height:46px;overflow:visible}
.mano-per .pista{fill:none;stroke:rgba(255,255,255,.1);stroke-width:3.5;stroke-linecap:round}
.mano-per .arco{fill:none;stroke:var(--c);stroke-width:3.5;stroke-linecap:round}
.mano-per .cuerpo{fill:#121a16;stroke:rgba(255,255,255,.08)}
.mano-per .marca{stroke:#e8f2ec;stroke-width:2.5;stroke-linecap:round}
.mano-per b{font-size:9.5px;font-weight:800;letter-spacing:.1em;color:rgba(238,246,241,.6)}
.mano-per.on b{color:var(--c)}
.mano-per.mueve .cuerpo{fill:#1b2620}
.mano-pad{position:absolute;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;text-align:center;z-index:2;
  background:radial-gradient(circle at 50% 35%,color-mix(in srgb,var(--c) 26%,#0c1410),#0a100d 75%);box-shadow:inset 0 0 0 2px color-mix(in srgb,var(--c) 70%,transparent);
  transition:transform .08s,box-shadow .15s;transform:translate(-50%,-50%)}
.mano-pad.v{background:radial-gradient(circle at 50% 35%,color-mix(in srgb,var(--c) 18%,#0c1410),#0a100d 80%);box-shadow:inset 0 0 0 1.5px color-mix(in srgb,var(--c) 50%,transparent)}
.mano-pad b{font-size:11.5px;font-weight:800;letter-spacing:.08em;color:var(--c)}
.mano-pad small{font-size:10px;color:#a7bbb0;max-width:84%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mano-pad.tq{transform:translate(-50%,-50%) scale(.93);box-shadow:inset 0 0 0 3px var(--c),0 0 26px 2px color-mix(in srgb,var(--c) 55%,transparent)}
.mano-pad.elige{box-shadow:inset 0 0 0 3px #fff,0 0 30px 4px color-mix(in srgb,var(--c) 50%,transparent)}
.mano-pad .al{position:absolute;inset:14% 24%;display:flex;flex-direction:column;justify-content:space-between;pointer-events:none;opacity:.32}
.mano-pad .al i{height:1px;background:var(--c)}
.mano-pad .al i.on{height:3px;border-radius:2px}
.mano-pt{position:absolute;border-radius:50%;transform:translate(-50%,-50%);background:rgba(255,255,255,.07);transition:box-shadow .1s;display:grid;place-items:center;font-size:13px;font-weight:800;color:#cfe0d6;z-index:2}
.mano-pt.tq{background:rgba(255,255,255,.18)}
.mano-pt[data-k=rec]{color:#ff4b4b;box-shadow:inset 0 0 0 1.5px #ff4b4b}
.mano.grab .mano-pt[data-k=rec]{background:#ff4b4b;color:#fff}
.mano.grab .mano-pt[data-k=rec].tic{box-shadow:0 0 0 7px rgba(255,75,75,.25)}
@keyframes manoLat{50%{box-shadow:0 0 0 7px rgba(255,75,75,.2)}}
.mano-loop{position:absolute;z-index:2;width:30px;height:30px;margin:-15px 0 0 -15px;border-radius:50%;display:grid;place-items:center;font-size:15px;font-weight:800;
  color:color-mix(in srgb,var(--c) 75%,#fff);background:rgba(255,255,255,.06);box-shadow:inset 0 0 0 1.5px color-mix(in srgb,var(--c) 40%,transparent);transition:transform .08s,box-shadow .12s}
.mano-loop.suena{box-shadow:inset 0 0 0 1.5px var(--c);background:color-mix(in srgb,var(--c) 16%,transparent)}
.mano-loop.on{transform:scale(1.15);background:var(--c);color:#06120c;box-shadow:0 0 18px 2px color-mix(in srgb,var(--c) 60%,transparent)}
.mano-pad.enloop{box-shadow:inset 0 0 0 3px var(--c),0 0 0 4px rgba(255,255,255,.12)}
.mano-pt.mic{font-size:0;color:#cfe0d6}
.mano-pt.mic svg{width:13px;height:13px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round}
.mano-pt.mic i{position:absolute;right:-3px;top:-3px;min-width:15px;height:15px;border-radius:8px;background:#22302a;font-size:9.5px;font-style:normal;font-weight:800;line-height:15px;text-align:center;color:#cfe0d6}
.mano-pt.mic.lleno{box-shadow:inset 0 0 0 1.5px #dcff00;color:#dcff00}
.mano-pt.mic.grabando{background:#ff4b4b;color:#fff;box-shadow:0 0 0 6px rgba(255,75,75,.25)}
.mano-burb{position:absolute;z-index:4;transform:translate(-50%,-100%);padding:8px 12px;border-radius:14px;background:#f2f6f3;color:#0a120e;font-size:13px;font-weight:800;white-space:nowrap;
  display:none;align-items:center;gap:10px;box-shadow:0 8px 24px rgba(0,0,0,.45);pointer-events:none}
.mano-burb.on{display:flex}
.mano-burb i{font-style:normal;font-size:18px;opacity:.45}
.mano-burb span{display:flex;flex-direction:column;align-items:center;line-height:1.15}
.mano-burb small{font-size:9.5px;letter-spacing:.1em;opacity:.55}
.mano-calib{position:absolute;inset:0;z-index:6;background:rgba(5,8,6,.95);display:none;flex-direction:column;align-items:center;justify-content:center;gap:10px;text-align:center;padding:30px}
.mano-calib.on{display:flex}
.mano-calib b{font-size:20px}
.mano-calib p{margin:0;max-width:300px;font-size:14px;color:#9fb3a8;line-height:1.5}
.mano-calib .dot{position:absolute;width:64px;height:64px;margin:-32px 0 0 -32px;border-radius:50%;box-shadow:inset 0 0 0 2px #dcff00;background:rgba(220,255,0,.14)}
.mano-hoja{position:absolute;left:0;right:0;bottom:0;z-index:5;padding:20px 18px calc(env(safe-area-inset-bottom) + 18px);background:#0f1813;border-radius:20px 20px 0 0;
  box-shadow:0 -10px 40px rgba(0,0,0,.5);transform:translateY(105%);transition:transform .25s;display:flex;flex-direction:column;gap:12px}
.mano-hoja.on{transform:none}
.mano-hoja b{font-size:17px}
.mano-hoja input[type=text]{width:100%;height:46px;border-radius:12px;border:0;padding:0 14px;font:inherit;font-size:16px;background:#18241e;color:#e8f2ec;outline:none;box-shadow:inset 0 0 0 1.5px #22302a}
.mano-hoja input[type=text]:focus{box-shadow:inset 0 0 0 2px #3ee08a}
.mano-hoja label{display:flex;gap:10px;align-items:center;font-size:13.5px;color:#a7bbb0}
.mano-hoja label input{width:20px;height:20px;accent-color:#3ee08a}
.mano-hoja .bs{display:flex;gap:10px}
.mano .mano-hoja .bs button{flex:1;height:46px;border-radius:12px;font-weight:800;font-size:14px;background:#18241e}
.mano .mano-hoja .bs button.pri{background:#3ee08a;color:#062012}
.mano-fila{display:flex;align-items:center;gap:8px;font-size:13.5px;color:#a7bbb0}
.mano-fila span{flex:1}
.mano .mano-op{height:34px;min-width:44px;padding:0 12px;border-radius:17px;background:#18241e;font-size:13px;font-weight:800;color:#b9cbc1}
.mano .mano-op.on{background:#3ee08a;color:#062012}
`);

    // ---------- estado ----------
    // mano: 'der' o 'izq' · pos: los 5 dedos apoyados (en proporción de la pantalla), o null para la distribución de la foto
    let G = { mano: 'der', pos: null, vueltas: 2, clic: true };
    try { const x = JSON.parse(localStorage.getItem(CLAVE) || 'null'); if (x) G = Object.assign(G, x); } catch {}
    const guardarPref = () => { try { localStorage.setItem(CLAVE, JSON.stringify(G)); } catch {} };
    const E = { abierta: false, ultima: 'BD', grab: false, ses: null, track: 'A', toques: new Map(), alturas: {}, loop: new Map(), mics: [false, false, false], micDe: {} };
    let raiz = null, el = {};
    const falta = () => NECESITA.filter(k => typeof gp[k] !== 'function');

    // ---------- armar la pantalla ----------
    function armar() {
      raiz = document.createElement('div'); raiz.className = 'mano'; raiz.setAttribute('role', 'dialog'); raiz.setAttribute('aria-label', 'Mano');
      raiz.innerHTML = `
<div class="mano-perillas arriba"><button class="mano-x" data-a="cerrar" aria-label="Cerrar">×</button></div>
<div class="mano-capa"></div>
<div class="mano-burb"><i>‹</i><span><small></small><b></b></span><i>›</i></div>
<div class="mano-calib"><b>Apoyá la mano</b><p>Poné los 5 dedos sobre la pantalla, cómodos, como si fueras a tocar. Los amarillos van a quedar justo ahí y el resto se acomoda alrededor.</p><button class="mano-op" data-a="calibCancelar">Cancelar</button></div>
<div class="mano-hoja hoja-mas">
  <b>Más</b>
  <div class="mano-fila"><span>Vueltas por track al grabar</span><button class="mano-op" data-a="v1">×1</button><button class="mano-op" data-a="v2">×2</button><button class="mano-op" data-a="v4">×4</button></div>
  <div class="mano-fila"><span>Clic en cada tiempo al grabar</span><button class="mano-op" data-a="clic">Sí</button></div>
  <div class="mano-fila"><span>Mano</span><button class="mano-op" data-a="der">Derecha</button><button class="mano-op" data-a="izq">Izquierda</button></div>
  <div class="bs"><button data-a="original">Como al principio</button><button class="pri" data-a="acomodar">Acomodar mi mano</button></div>
</div>
<div class="mano-hoja hoja-nombre">
  <b>Ponele nombre</b>
  <input type="text" maxlength="60" placeholder="Nombre del tema" aria-label="Nombre del tema">
  <label><input type="checkbox" checked> <span class="mano-resumen">Armar la canción con lo grabado</span></label>
  <div class="bs"><button data-a="seguir">Seguir tocando</button><button class="pri" data-a="guardar">Guardar</button></div>
</div>`;
      gp.zona('pantalla').appendChild(raiz);
      const q = (s) => raiz.querySelector(s);
      el = { capa: q('.mano-capa'), fila: q('.mano-perillas'),
        burb: q('.mano-burb'), calib: q('.mano-calib'), mas: q('.hoja-mas'), hoja: q('.hoja-nombre'),
        nombre: q('.hoja-nombre input[type=text]'), armarCancion: q('.hoja-nombre input[type=checkbox]'), resumen: q('.mano-resumen') };
      armarPerillas();
      raiz.addEventListener('click', alClic);
      el.capa.addEventListener('pointerdown', apoyar);
      el.fila.addEventListener('pointerdown', girarEmpieza);
      raiz.addEventListener('pointermove', mover);
      raiz.addEventListener('pointerup', soltar); raiz.addEventListener('pointercancel', soltar);
      el.calib.addEventListener('touchstart', calibrar, { passive: false });
      addEventListener('resize', () => { if (E.abierta) armarPads(); });
      addEventListener('keydown', teclas, true);
    }

    // ---------- dónde va cada cosa ----------
    // sin acomodar: la distribución de la foto (espejada para la izquierda). Acomodada: los dedos donde se apoyaron y el
    // resto movido, girado y escalado igual que la mano (el mejor ajuste entre la mano de la foto y la apoyada)
    function lugares() {
      const W = innerWidth, H = innerHeight, esp = G.mano === 'izq';
      const base = LUGARES.map(L => ({ ...L, x: (esp ? 1 - L.x : L.x) * W, y: L.y * H, r: L.r * W }));
      if (!G.pos) return base;
      const A = DEDOS.map((_, i) => [base[i].x, base[i].y]), B = G.pos.map(([x, y]) => [x * W, y * H]);
      const ca = A.reduce((s, p) => [s[0] + p[0] / 5, s[1] + p[1] / 5], [0, 0]), cb = B.reduce((s, p) => [s[0] + p[0] / 5, s[1] + p[1] / 5], [0, 0]);
      let re = 0, im = 0, nn = 0;                                            // k = Σ conj(a)·b / Σ|a|² (en números complejos)
      for (let i = 0; i < 5; i++) { const ax = A[i][0] - ca[0], ay = A[i][1] - ca[1], bx = B[i][0] - cb[0], by = B[i][1] - cb[1]; re += ax * bx + ay * by; im += ax * by - ay * bx; nn += ax * ax + ay * ay; }
      let kr = re / nn, ki = im / nn; const esc = Math.hypot(kr, ki), e2 = Math.min(1.5, Math.max(0.65, esc)); kr *= e2 / esc; ki *= e2 / esc;
      return base.map((L, i) => {
        if (i < 5) return { ...L, x: B[i][0], y: B[i][1], r: L.r * e2 };
        const ax = L.x - ca[0], ay = L.y - ca[1];
        return { ...L, x: cb[0] + kr * ax - ki * ay, y: cb[1] + ki * ax + kr * ay, r: L.r * e2 };
      });
    }
    function armarPads() {
      el.capa.innerHTML = '';
      const W = innerWidth, H = innerHeight;
      const P = lugares();
      P.forEach(L => { L.r = L.t === 'p' ? Math.max(19, Math.min(26, L.r)) : Math.max(L.k === 'pul' ? 44 : 30, Math.min(L.k === 'pul' ? 92 : 70, L.r)); });
      // la fila de perillas: arriba de los dedos, salvo que los dedos lleguen muy arriba y abajo haya más lugar
      const dd = P.filter(L => L.t === 'd'), alto = Math.min(...dd.map(L => L.y - L.r)), bajo = H - Math.max(...dd.map(L => L.y + L.r));
      const abajo = alto < 78 && bajo > alto;
      el.fila.classList.toggle('arriba', !abajo); el.fila.classList.toggle('abajo', abajo);
      const fh = el.fila.offsetHeight || 70, top = abajo ? 6 : fh + 4, fondo = abajo ? H - fh - 4 : H - 3;
      // que no se salgan ni se pisen: los dedos quedan quietos y lo demás se corre
      for (let it = 0; it < 30; it++) {
        for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) {
          const a = P[i], b = P[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1, m = a.r + b.r + 6 - d;
          if (m <= 0) continue;
          const fa = a.t === 'd' ? 0 : b.t === 'd' ? 1 : 0.5, fb = 1 - fa;
          a.x -= dx / d * m * fa; a.y -= dy / d * m * fa; b.x += dx / d * m * fb; b.y += dy / d * m * fb;
        }
        for (const L of P) { if (L.t === 'd') continue; L.x = Math.min(W - L.r - 3, Math.max(L.r + 3, L.x)); L.y = Math.min(fondo - L.r, Math.max(top + L.r, L.y)); }   // los dedos quedan donde se apoyaron
      }
      E.pads = {}; E.geo = P;
      for (const L of P) {
        const b = document.createElement('div');
        b.style.left = L.x + 'px'; b.style.top = L.y + 'px'; b.style.width = b.style.height = L.r * 2 + 'px';
        if (L.t === 'p' && L.k.startsWith('mic')) {
          const n = +L.k[3]; b.className = 'mano-pt mic' + (E.mics[n - 1] ? ' lleno' : ''); b.dataset.k = L.k;
          b.innerHTML = `<svg viewBox="0 0 16 16"><rect x="5.5" y="1.8" width="5" height="8" rx="2.5"/><path d="M3.2 7.6a4.8 4.8 0 009.6 0M8 12.4v2.2"/></svg><i>${n}</i>`;
          b.setAttribute('aria-label', 'Micrófono ' + n + ': mantené apretado para grabar');
        }
        else if (L.t === 'p') { b.className = 'mano-pt'; b.dataset.k = L.k; b.textContent = L.k === 'rec' ? '●' : L.k === 'fin' ? '■' : '⋯'; b.setAttribute('aria-label', L.k === 'rec' ? 'Grabar' : L.k === 'fin' ? 'Terminar' : 'Más'); }
        else {
          b.className = 'mano-pad' + (L.t === 'v' ? ' v' : ''); b.dataset.p = L.p; b.style.setProperty('--c', COLOR[L.p]);
          b.innerHTML = '<div class="al"></div><b></b><small></small>';
          for (let i = 0; i < 8; i++) b.querySelector('.al').appendChild(document.createElement('i'));
          if (!MEL[L.p]) b.querySelector('.al').style.display = 'none';
          E.pads[L.p] = b;
        }
        el.capa.appendChild(b);
      }
      E.loops = {};
      const ocupado = P.map(L => ({ x: L.x, y: L.y, r: L.r }));
      for (const L of P) {
        if (L.t === 'p') continue;
        const lr = 15, d = L.r + lr + 5, cand = [[0, -d], [0, d], [d, 0], [-d, 0], [d * .7, -d * .7], [-d * .7, -d * .7], [d * .7, d * .7], [-d * .7, d * .7]];
        let pos = null;
        for (const [dx, dy] of cand) {
          const x = L.x + dx, y = L.y + dy;
          if (x < lr + 3 || x > W - lr - 3 || y < top + lr || y > fondo - lr) continue;
          if (ocupado.some(o => Math.hypot(o.x - x, o.y - y) < o.r + lr + 3)) continue;
          pos = [x, y]; break;
        }
        if (!pos) pos = [L.x, Math.max(top + lr, L.y - d)];
        ocupado.push({ x: pos[0], y: pos[1], r: lr });
        const b = document.createElement('div'); b.className = 'mano-loop'; b.dataset.p = L.p; b.style.setProperty('--c', COLOR[L.p]);
        b.style.left = pos[0] + 'px'; b.style.top = pos[1] + 'px'; b.textContent = '↻'; b.setAttribute('aria-label', 'Loop de ' + NOMBRE[L.p]);
        el.capa.appendChild(b); E.loops[L.p] = b;
      }
      pintarPads(); pintarLoops();
    }

    // ---------- las perillas de efectos ----------
    // el filtro va de -1 a 1 y está apagado en el medio; VINILO se prende y se apaga
    const PERILLAS = [
      { id: 'filtro', n: 'FILTRO', c: '#dcff00', min: -1 },
      { id: 'reverb', n: 'REVERB', c: '#6fc3ff', min: 0 },
      { id: 'eco', n: 'ECO', c: '#b49cff', min: 0 },
      { id: 'lofi', n: 'LO-FI', c: '#ffae5c', min: 0 },
      { id: 'vinilo', n: 'VINILO', c: '#ff8fb1', min: 0, llave: true },
    ];
    const ang = (v, min) => (min < 0 ? v * 135 : -135 + v * 270) * Math.PI / 180;   // 0 arriba, en el sentido del reloj
    const pto = (a, r) => [24 + Math.sin(a) * r, 24 - Math.cos(a) * r];
    function arco(a0, a1, r) { if (Math.abs(a1 - a0) < 0.01) return ''; const [x0, y0] = pto(a0, r), [x1, y1] = pto(a1, r), g = Math.abs(a1 - a0) > Math.PI ? 1 : 0; return `M${x0} ${y0}A${r} ${r} 0 ${g} 1 ${x1} ${y1}`; }
    function armarPerillas() {
      const x = el.fila.querySelector('.mano-x');
      for (const K of PERILLAS) {
        const d = document.createElement('div'); d.className = 'mano-per'; d.dataset.f = K.id; d.style.setProperty('--c', K.c);
        d.innerHTML = `<svg viewBox="0 0 48 48"><path class="pista" d="${arco(-135 * Math.PI / 180, 135 * Math.PI / 180, 20)}"/><path class="arco"/><circle class="cuerpo" cx="24" cy="24" r="14"/><line class="marca"/></svg><b>${K.n}</b>`;
        d.setAttribute('role', 'slider'); d.setAttribute('aria-label', K.n);
        el.fila.insertBefore(d, x);
      }
    }
    function pintarPerillas() {
      let fx; try { fx = gp.efectos(); } catch { return; }
      for (const K of PERILLAS) {
        const d = el.fila.querySelector(`[data-f=${K.id}]`), v = K.llave ? (fx[K.id] ? 1 : 0) : +fx[K.id] || 0;
        const a = ang(v, K.min), a0 = K.min < 0 ? 0 : -135 * Math.PI / 180;
        d.querySelector('.arco').setAttribute('d', a >= a0 ? arco(a0, a, 20) : arco(a, a0, 20));
        const [x0, y0] = pto(a, 5), [x1, y1] = pto(a, 12), m = d.querySelector('.marca');
        m.setAttribute('x1', x0); m.setAttribute('y1', y0); m.setAttribute('x2', x1); m.setAttribute('y2', y1);
        d.classList.toggle('on', Math.abs(v) > 0.01);
        d.querySelector('b').textContent = K.id === 'filtro' && v < -0.01 ? 'GRAVES' : K.id === 'filtro' && v > 0.01 ? 'AGUDOS' : K.n;
        d.setAttribute('aria-valuenow', Math.round(v * 100));
      }
    }
    // arrastrar para arriba sube y para abajo baja; dos toques seguidos la vuelven a cero
    E.per = new Map();
    function girarEmpieza(e) {
      const d = e.target.closest('.mano-per'); if (!d) return;
      e.preventDefault(); e.stopPropagation();
      try { d.setPointerCapture(e.pointerId); } catch {}
      const K = PERILLAS.find(k => k.id === d.dataset.f), fx = gp.efectos(), ahora = performance.now();
      if (K.llave) { gp.efectos({ vinilo: !fx.vinilo }); pintarPerillas(); return; }
      if (ahora - (d._ult || 0) < 320) { gp.efectos({ [K.id]: 0 }); pintarPerillas(); d._ult = 0; return; }
      d._ult = ahora;
      E.per.set(e.pointerId, { d, K, y0: e.clientY, v0: +fx[K.id] || 0, pend: null });
      d.classList.add('mueve');
      d.onpointermove = (ev) => {
        const t = E.per.get(ev.pointerId); if (!t) return;
        const rango = t.K.min < 0 ? 2 : 1, v = Math.min(1, Math.max(t.K.min, t.v0 + (t.y0 - ev.clientY) / 150 * rango));
        const nv = Math.abs(v) < 0.03 && t.K.min < 0 ? 0 : v;              // el filtro se traba en el medio (apagado)
        if (t.pend == null) requestAnimationFrame(() => { gp.efectos({ [t.K.id]: t.pend }); t.pend = null; pintarPerillas(); });
        t.pend = nv;
      };
      d.onpointerup = d.onpointercancel = (ev) => { E.per.delete(ev.pointerId); d.classList.remove('mueve'); };
    }

    // ---------- pintar ----------
    function estiloDe(p) {
      try {
        const l = gp.estilos(p).slice(), i = gp.estiloDe(p);
        E.mics.forEach((ok, k) => { if (ok) l.push({ indice: 'mic' + (k + 1), nombre: 'MIC ' + (k + 1), mic: k + 1 }); });
        let j = l.findIndex(y => y.indice === i);
        if (j >= 0 && /^grabaci/i.test(l[j].nombre) && E.micDe[p]) { const m = l.findIndex(y => y.mic === E.micDe[p]); if (m >= 0) j = m; }
        return { l, j: Math.max(0, j), n: j >= 0 ? l[j].nombre : '' };
      } catch { return { l: [], j: 0, n: '' }; }
    }
    function ponerSonido(p, x) {                                               // un estilo, o un micrófono grabado
      if (x.mic) { E.micDe[p] = x.mic; return Promise.resolve(gp.usarGrabacion(x.mic, p)).then(() => { gp.tocar(p); pintarPads(); }); }
      delete E.micDe[p]; gp.elegirEstilo(p, x.indice); gp.tocar(p); pintarPads(); return Promise.resolve();
    }
    function pintarPads() {
      for (const p of ORDEN) { const b = E.pads && E.pads[p]; if (!b) continue; b.querySelector('b').textContent = NOMBRE[p]; b.querySelector('small').textContent = estiloDe(p).n; }
    }
    function pintarEst() {}                                                   // (sin tracks ni grilla a la vista)
    function pintarPaso(p) {                                                  // grabando, el punto rojo late en cada tiempo
      const r = E.pads && raiz.querySelector('.mano-pt[data-k=rec]'); if (!r || p < 0 || p % 4) return;
      r.classList.add('tic'); setTimeout(() => r.classList.remove('tic'), 110);
    }

    // ---------- tocar ----------
    function alturaDe(b, y) { const r = b.getBoundingClientRect(), f = 1 - (y - r.top - r.height * 0.14) / (r.height * 0.72); return Math.min(8, Math.max(1, Math.round(1 + f * 7))); }
    function golpe(b, y) {
      const p = b.dataset.p, n = MEL[p] ? alturaDe(b, y) : 0;
      const L = E.loop.get(p);
      if (L && !L.borrado) { for (let s2 = 0; s2 < 16; s2++) gp.poner(p, s2, 0); L.borrado = true; }   // el primer golpe con LOOP reemplaza el ritmo de ese instrumento
      if (E.loop.size && !L && !E.grab) gp.tocar(p, n || undefined);     // con un LOOP apretado, los demás suenan sin grabarse
      else gp.enVivo(p, n || undefined);
      if (MEL[p]) { E.alturas[p] = n; [...b.querySelectorAll('.al i')].forEach((x, i) => x.classList.toggle('on', 8 - i === n)); }
      b.classList.add('tq'); clearTimeout(b._t); b._t = setTimeout(() => b.classList.remove('tq'), 90);
      E.ultima = p;
      if (L) setTimeout(pintarLoops, 40);
    }
    function pintarLoops() {
      if (!E.loops) return;
      let pat = null; try { const st = gp.estado() || {}, i = LETRAS.indexOf(st.track || E.track); pat = gp.notas()[i]; } catch {}
      for (const p of ORDEN) { const b = E.loops[p]; if (!b) continue; b.classList.toggle('suena', !!(pat && pat[ORDEN.indexOf(p)].some(Boolean))); b.classList.toggle('on', E.loop.has(p)); }
      for (const p of ORDEN) if (E.pads[p]) E.pads[p].classList.toggle('enloop', E.loop.has(p));
    }
    // LOOP apretado: arranca la música si estaba quieta y graba solo ese instrumento mientras se mantiene
    function loopAbajo(b, id) {
      const p = b.dataset.p, ahora = performance.now();
      if (ahora - (b._ult || 0) < 320) { for (let s2 = 0; s2 < 16; s2++) gp.poner(p, s2, 0); b._ult = 0; gp.aviso(`${NOMBRE[p]}: loop borrado`, 900); pintarLoops(); return; }
      b._ult = ahora;
      E.loop.set(p, { borrado: false }); E.toques.set(id, { loop: p });
      const est = gp.estado() || {};
      if (!est.tocando) { gp.modoCancion(false); }
      if (!E.grab) gp.grabarEnVivo(true);                                   // prende la música si estaba quieta
      pintarLoops();
      if (navigator.vibrate) try { navigator.vibrate(8); } catch {}
    }
    function loopArriba(p) {
      E.loop.delete(p);
      if (!E.loop.size && !E.grab) gp.grabarEnVivo(false);                  // la música sigue: el loop queda sonando
      pintarLoops();
    }
    // micrófono: mantener apretado graba; soltar enseguida no pisa nada y deja escuchar lo que había
    function micAbajo(b, id) {
      const n = +b.dataset.k[3], t = { mic: n, t0: performance.now(), b };
      E.toques.set(id, t);
      Promise.resolve(gp.grabar(n)).then((ok) => { if (ok && E.toques.get(id) === t) b.classList.add('grabando'); }, () => gp.aviso('Para grabar hace falta permiso para usar el micrófono', 2600));
    }
    function micArriba(t) {
      t.b.classList.remove('grabando');
      const corto = performance.now() - t.t0 < 350;
      Promise.resolve(gp.pararGrabacion(corto)).then((k) => {
        if (corto) { if (E.mics[t.mic - 1]) gp.tocarGrabacion(t.mic); else gp.aviso(`Mantené apretado el ${t.mic} para grabar un sonido con el micrófono`, 2400); return; }
        if (!k) return;
        E.mics[t.mic - 1] = true; t.b.classList.add('lleno'); gp.tocarGrabacion(t.mic);
        // si un instrumento ya usaba este micrófono, se actualiza solo
        for (const p of Object.keys(E.micDe)) if (E.micDe[p] === t.mic) gp.usarGrabacion(t.mic, p);
        gp.aviso(`MIC ${t.mic} listo: mantené apretado un instrumento y elegí MIC ${t.mic}`, 3000);
      });
    }
    // mantener apretado: aparece el sonido arriba del dedo y deslizando a los costados se elige otro
    function abrirBurbuja(t) {
      const b = t.pad, p = b.dataset.p, e = estiloDe(p); if (!e.l.length) return;
      t.elige = { x0: t.x, j0: e.j, l: e.l, j: e.j };
      b.classList.add('elige');
      const r = b.getBoundingClientRect();
      el.burb.style.left = Math.min(innerWidth - 90, Math.max(90, r.left + r.width / 2)) + 'px';
      el.burb.style.top = Math.max(60, r.top - 8) + 'px';
      pintarBurbuja(t); el.burb.classList.add('on');
      if (navigator.vibrate) try { navigator.vibrate(12); } catch {}
    }
    function pintarBurbuja(t) { const p = t.pad.dataset.p; el.burb.querySelector('small').textContent = NOMBRE[p]; el.burb.querySelector('b').textContent = t.elige.l[t.elige.j].nombre; }
    function apoyar(e) {
      const pad = e.target.closest('.mano-pad'), pt = e.target.closest('.mano-pt'), lp = e.target.closest('.mano-loop');
      if (!pad && !pt && !lp) return;
      e.preventDefault();
      try { raiz.setPointerCapture(e.pointerId); } catch {}
      if (lp) { loopAbajo(lp, e.pointerId); return; }
      if (pt && pt.classList.contains('mic')) { micAbajo(pt, e.pointerId); return; }
      if (pt) { pt.classList.add('tq'); setTimeout(() => pt.classList.remove('tq'), 120); accion(pt.dataset.k); return; }
      const t = { pad, x: e.clientX, y: e.clientY, movio: false };
      E.toques.set(e.pointerId, t);
      golpe(pad, e.clientY);
      t.timer = setTimeout(() => { if (!t.movio) abrirBurbuja(t); }, 450);
    }
    function mover(e) {
      const t = E.toques.get(e.pointerId); if (!t || !t.pad) return;
      if (t.elige) {                                                         // eligiendo el sonido: cada 38 px, uno más
        const n = t.elige.l.length, j = ((t.elige.j0 + Math.round((e.clientX - t.elige.x0) / 38)) % n + n) % n;
        if (j !== t.elige.j) { t.elige.j = j; const p = t.pad.dataset.p; ponerSonido(p, t.elige.l[j]); pintarBurbuja(t); if (navigator.vibrate) try { navigator.vibrate(5); } catch {} }
        return;
      }
      if (Math.hypot(e.clientX - t.x, e.clientY - t.y) > 14) t.movio = true;
      const b = t.pad, p = b.dataset.p; if (!MEL[p]) return;
      if (alturaDe(b, e.clientY) !== E.alturas[p]) golpe(b, e.clientY);    // deslizando toca cada nota que cruza
    }
    function soltar(e) {
      const t = E.toques.get(e.pointerId); if (!t) return; E.toques.delete(e.pointerId);
      if (t.loop) { loopArriba(t.loop); return; }
      if (t.mic) { micArriba(t); return; }
      clearTimeout(t.timer);
      if (t.elige) { t.pad.classList.remove('elige'); el.burb.classList.remove('on'); pintarPads(); }
    }
    function cambiarEstilo(dir) {
      const p = E.ultima, e = estiloDe(p); if (!e.l.length) return;
      const n = e.l[(e.j + dir + e.l.length) % e.l.length];
      ponerSonido(p, n); gp.aviso(`${NOMBRE[p]}: ${n.nombre}`, 900);
    }

    // ---------- grabar pasando de track ----------
    const vacio = (L) => !gp.notas()[LETRAS.indexOf(L)].some(r => r.some(Boolean));
    function proximo(desde) { for (let i = LETRAS.indexOf(desde) + 1; i < 8; i++) if (vacio(LETRAS[i])) return LETRAS[i]; return null; }
    function empezar() {
      gp.modoCancion(false);
      const est = gp.estado() || {}; E.track = est.track || E.track;
      E.ses = { bloques: [{ track: E.track, veces: G.vueltas }], vuelta: 0, prox: null, cerrar: false, sinPaso: true };
      E.grab = true; raiz.classList.add('grab');
      gp.grabarEnVivo(true);
      pintarEst();
    }
    function terminar(abrirHoja) {
      if (!E.grab) return;
      E.grab = false; raiz.classList.remove('grab');
      gp.grabarEnVivo(false); gp.parar(); pintarPaso(-1);
      if (E.ses) E.ses.prox = null;
      pintarEst();
      if (abrirHoja) hoja();
    }
    function alPaso(ev) {
      if (!E.abierta) return;
      pintarPaso(ev.paso);
      if (ev.paso === 0) pintarLoops();
      if (G.clic && E.grab && ev.paso % 4 === 0) clic(ev.paso === 0);
      if (ev.track !== E.track) {                                            // entró otro track
        E.track = ev.track;
        if (E.ses && E.grab) { E.ses.bloques.push({ track: ev.track, veces: G.vueltas }); E.ses.vuelta = 0; E.ses.prox = null; }
        pintarEst();
      } else if (ev.paso === 0 && E.ses && E.grab) {
        if (E.ses.sinPaso) E.ses.sinPaso = false; else E.ses.vuelta++;
        if (E.ses.cerrar && E.ses.vuelta >= G.vueltas) { terminar(true); return; }
        pintarEst();
      }
      // en la última vuelta, antes de que termine el compás, se pide el track que sigue
      if (E.grab && E.ses && ev.paso === 11 && !E.ses.prox && !E.ses.cerrar && E.ses.vuelta + 1 >= G.vueltas) {
        const L = proximo(E.track);
        if (L) { E.ses.prox = L; gp.siguiente(L, true); } else E.ses.cerrar = true;
        pintarEst();
      }
    }
    gp.cuando('paso', alPaso);
    gp.cuando('stop', () => { if (E.grab) terminar(true); if (E.abierta) pintarPaso(-1); });

    // un clic suave en cada tiempo (solo para guiarse: no se graba ni sale en Descargar)
    function clic(fuerte) {
      const an = gp.analizador(), c = an && an.context; if (!c) return;
      const o = c.createOscillator(), g = c.createGain(), t = c.currentTime;
      o.frequency.value = fuerte ? 1600 : 1100; g.gain.setValueAtTime(fuerte ? 0.12 : 0.07, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
      o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + 0.06);
    }

    // ---------- las hojas: más opciones y el nombre ----------
    function pintarMas() {
      raiz.querySelectorAll('.hoja-mas [data-a]').forEach(b => {
        const a = b.dataset.a;
        if (a[0] === 'v' && a.length === 2) b.classList.toggle('on', +a[1] === G.vueltas);
        if (a === 'clic') { b.classList.toggle('on', !!G.clic); b.textContent = G.clic ? 'Sí' : 'No'; }
        if (a === 'der' || a === 'izq') b.classList.toggle('on', G.mano === a);
      });
    }
    function hoja() {
      const est = gp.estado() || {}, b = E.ses ? E.ses.bloques : [];
      const d = new Date(), fecha = `${d.getDate()}/${d.getMonth() + 1} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      el.nombre.value = est.nombre && !/^mi (tema|beat)$/i.test(est.nombre) ? est.nombre : 'Sesión ' + fecha;
      el.resumen.textContent = b.length > 1 ? `Armar la canción con lo grabado (${b.length} partes)` : 'Armar la canción con lo grabado';
      el.armarCancion.checked = b.length > 0; el.armarCancion.disabled = !b.length;
      el.mas.classList.remove('on'); el.hoja.classList.add('on');
      setTimeout(() => { el.nombre.focus(); el.nombre.select(); }, 260);
    }
    function guardar() {
      const b = E.ses ? E.ses.bloques : [];
      if (el.armarCancion.checked && b.length) gp.ponerCancion(b, true);
      const n = gp.guardarComo(el.nombre.value.trim());
      el.hoja.classList.remove('on'); el.nombre.blur(); E.ses = null;
      gp.aviso(`"${n}" quedó guardado en Mis beats`, 2600);
      pintarEst();
    }

    // ---------- acomodar la mano: se apoyan los 5 dedos ----------
    function calibrar(e) {
      e.preventDefault();
      [...el.calib.querySelectorAll('.dot')].forEach(x => x.remove());
      const ts = [...e.touches];
      ts.forEach(t => { const d = document.createElement('div'); d.className = 'dot'; d.style.left = t.clientX + 'px'; d.style.top = t.clientY + 'px'; el.calib.appendChild(d); });
      if (ts.length < 5) return;
      const pts = ts.slice(0, 5).map(t => [t.clientX, t.clientY]);
      // el pulgar es el que queda más lejos de los otros
      let pi = 0, mejor = -1;
      pts.forEach((p, i) => { let s = Infinity; pts.forEach((q, j) => { if (i !== j) s = Math.min(s, Math.hypot(p[0] - q[0], p[1] - q[1])); }); if (s > mejor) { mejor = s; pi = i; } });
      const pul = pts[pi], dedos = pts.filter((_, i) => i !== pi);
      // del índice al meñique: empezando por el más cercano al pulgar y siguiendo por el más cercano al anterior
      const orden = []; let ult = pul;
      while (dedos.length) { let k = 0, dm = Infinity; dedos.forEach((p, i) => { const d = Math.hypot(p[0] - ult[0], p[1] - ult[1]); if (d < dm) { dm = d; k = i; } }); ult = dedos.splice(k, 1)[0]; orden.push(ult); }
      // mano izquierda si los dedos van, vistos desde el pulgar, para el otro lado que en la foto
      const cruz = (orden[0][0] - pul[0]) * (orden[3][1] - pul[1]) - (orden[0][1] - pul[1]) * (orden[3][0] - pul[0]);
      G.mano = cruz > 0 ? 'der' : 'izq';                                      // como en la foto: derecha
      G.pos = [pul, ...orden].map(([x, y]) => [x / innerWidth, y / innerHeight]); guardarPref();
      setTimeout(() => { el.calib.classList.remove('on'); [...el.calib.querySelectorAll('.dot')].forEach(x => x.remove()); armarPads(); gp.aviso('Listo: todo quedó acomodado a tu mano'); }, 350);
    }

    // ---------- botones y teclas ----------
    function accion(k) {
      if (k === 'rec') { if (E.grab) terminar(true); else empezar(); }
      else if (k === 'fin') { if (E.grab) terminar(true); else { gp.parar(); if (E.ses) hoja(); } }
      else if (k === 'mas') { pintarMas(); el.hoja.classList.remove('on'); el.mas.classList.toggle('on'); }
    }
    function alClic(e) {
      const b = e.target.closest('[data-a]'); if (!b) return;
      const a = b.dataset.a;
      if (a === 'cerrar') cerrar();
      else if (a === 'v1' || a === 'v2' || a === 'v4') { G.vueltas = +a[1]; guardarPref(); pintarMas(); pintarEst(); }
      else if (a === 'clic') { G.clic = !G.clic; guardarPref(); pintarMas(); }
      else if (a === 'der' || a === 'izq') { G.mano = a; G.pos = null; guardarPref(); pintarMas(); armarPads(); }
      else if (a === 'original') { G.pos = null; guardarPref(); el.mas.classList.remove('on'); armarPads(); }
      else if (a === 'acomodar') { el.mas.classList.remove('on'); if (matchMedia('(pointer:coarse)').matches) el.calib.classList.add('on'); else gp.aviso('Acomodar se hace con la mano apoyada en la pantalla de un teléfono o tablet'); }
      else if (a === 'calibCancelar') el.calib.classList.remove('on');
      else if (a === 'guardar') guardar();
      else if (a === 'seguir') { el.hoja.classList.remove('on'); el.nombre.blur(); }
    }
    function teclas(e) {
      if (!E.abierta || e.ctrlKey || e.metaKey || e.target === el.nombre) return;
      const k = e.key.toLowerCase(), p = TECLA[k];
      if (p) { e.preventDefault(); e.stopImmediatePropagation(); if (!e.repeat && E.pads[p]) { const r = E.pads[p].getBoundingClientRect(); golpe(E.pads[p], r.top + r.height / 2); } return; }
      if (k === 'arrowleft' || k === 'arrowright') { e.preventDefault(); e.stopImmediatePropagation(); cambiarEstilo(k === 'arrowleft' ? -1 : 1); return; }
      if (k === 'r') { e.preventDefault(); e.stopImmediatePropagation(); accion('rec'); return; }
      if (k === 'escape') {
        e.preventDefault(); e.stopImmediatePropagation();
        if (el.hoja.classList.contains('on')) el.hoja.classList.remove('on'); else if (el.mas.classList.contains('on')) el.mas.classList.remove('on'); else cerrar();
      }
    }

    // ---------- abrir y cerrar ----------
    function abrir() {
      if (falta().length) { gp.aviso('Mano necesita la versión nueva de GREENPAD (recargá la página)', 3200); return; }
      if (!raiz) armar();
      E.abierta = true; const est = gp.estado() || {}; E.track = est.track || 'A';
      raiz.style.display = ''; requestAnimationFrame(() => raiz.classList.add('on'));
      armarPads(); pintarEst(); pintarPerillas();
      Promise.resolve(gp.misGrabaciones()).then((l) => { E.mics = [0, 1, 2].map(i => !!(l && l[i])); armarPads(); }).catch(() => {});
    }
    function cerrar() {
      if (E.grab) terminar(false);
      if (E.loop.size) { E.loop.clear(); gp.grabarEnVivo(false); }
      E.abierta = false; raiz.classList.remove('on'); el.hoja.classList.remove('on'); el.mas.classList.remove('on'); el.burb.classList.remove('on');
      setTimeout(() => { if (!E.abierta) raiz.style.display = 'none'; }, 220);
    }

    gp.herramienta({
      id: 'mano',
      nombre: 'Mano',
      detalle: 'Tocá con la mano apoyada en la pantalla: los 8 instrumentos a mano, mantené apretado para cambiar el sonido. Graba pasando de un track al siguiente y al final le ponés nombre.',
      abrir,
    });
  },
});
