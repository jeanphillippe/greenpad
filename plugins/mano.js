// MANO: una herramienta para tocar y grabar con los dedos apoyados en la pantalla, como en un instrumento.
// - Cuatro almohadillas quedan donde caen los dedos (índice, medio, anular y meñique) y una más grande bajo el pulgar.
//   "Acomodar" pide apoyar los 5 dedos y pone cada almohadilla justo ahí (sirve para la mano derecha o la izquierda).
// - Cada dedo es un instrumento. El pulgar cambia de grupo: BATERÍA (bombo, caja, hi-hat, percu) o MELODÍA (bajo,
//   guitarra, acordes, melodía). Tocarlo cambia; mantenerlo apretado cambia mientras lo tenés.
// - En los melódicos, la altura sale de dónde apoyás el dedo en la almohadilla: arriba agudo, abajo grave. Si lo deslizás,
//   va tocando cada nota que cruza.
// - Alrededor del pulgar, al alcance: estilo anterior y siguiente del último instrumento que tocaste, grabar y terminar.
// - Grabar pasa de un track al siguiente: cada track suena 1, 2 o 4 vueltas mientras grabás encima y después entra el
//   próximo track vacío (con los mismos instrumentos). Al terminar se arma la canción con lo grabado y le ponés nombre.
// - En la compu: A S D F son los dedos, Espacio cambia de grupo, ← → el estilo, R graba y Esc cierra.
GREENPAD.plugin({
  id: 'mano',
  nombre: 'Mano',
  autor: 'GREENPAD',
  version: '1.0',
  tipo: 'herramienta',
  descripcion: 'Tocá con la mano apoyada en la pantalla: cada dedo un instrumento y el pulgar cambia de grupo y de estilo. Graba pasando de un track al siguiente y al final le ponés nombre al tema.',
  setup(gp) {
    const NECESITA = ['enVivo', 'grabarEnVivo', 'siguiente', 'estilos', 'elegirEstilo', 'estiloDe', 'ponerCancion', 'guardarComo', 'modoCancion', 'parar'];
    const GRUPOS = [
      { n: 'BATERÍA', p: ['BD', 'SN', 'HH', 'PC'], c: ['#3ee08a', '#2ee6d6', '#c6f43a', '#ffae5c'] },
      { n: 'MELODÍA', p: ['BS', 'GT', 'CH', 'LD'], c: ['#9be7c4', '#6fc3ff', '#ff8fb1', '#b49cff'] },
    ];
    const NOMBRE = { BD: 'BOMBO', SN: 'CAJA', HH: 'HI-HAT', PC: 'PERCU', BS: 'BAJO', GT: 'GUITARRA', CH: 'ACORDES', LD: 'MELODÍA' };
    const MEL = { BS: 1, GT: 1, CH: 1, LD: 1 }, LETRAS = 'ABCDEFGH', TECLAS = ['a', 's', 'd', 'f'];
    const CLAVE = 'greenpad.mano.v1';
    // dónde caen los dedos de una mano derecha apoyada, en proporción de la pantalla: pulgar, índice, medio, anular, meñique
    const DER = [[0.2, 0.8], [0.3, 0.46], [0.52, 0.38], [0.73, 0.44], [0.88, 0.6]];

    gp.estilo(`
.mano{position:fixed;inset:0;z-index:60;background:radial-gradient(120% 80% at 50% 100%,#0d1712,#050806);color:#e8f2ec;font-family:inherit;
  touch-action:none;user-select:none;-webkit-user-select:none;overflow:hidden;opacity:0;transition:opacity .2s}
.mano.on{opacity:1}
.mano *{box-sizing:border-box}
.mano button{font:inherit;color:inherit;background:none;border:0;padding:0;cursor:pointer;-webkit-tap-highlight-color:transparent}
.mano-top{position:absolute;left:0;right:0;top:0;padding:calc(env(safe-area-inset-top) + 10px) 12px 8px;display:flex;flex-direction:column;gap:8px;pointer-events:auto}
.mano-f1{display:flex;align-items:center;gap:8px}
.mano-f1 b{font-size:15px;letter-spacing:.06em}
.mano-f1 b span{color:#3ee08a}
.mano-f1 .esp{flex:1}
.mano .mano-chip{height:30px;padding:0 11px;border-radius:15px;background:rgba(255,255,255,.07);font-size:12px;font-weight:700;letter-spacing:.04em;color:#b9cbc1}
.mano .mano-chip.on{background:#3ee08a;color:#062012}
.mano .mano-x{width:34px;height:34px;border-radius:17px;background:rgba(255,255,255,.08);font-size:18px;line-height:34px;text-align:center}
.mano-trks{display:flex;gap:5px}
.mano .mano-trk{flex:1;height:26px;border-radius:7px;background:rgba(255,255,255,.05);font-size:12px;font-weight:800;color:#6f8379;display:grid;place-items:center;position:relative}
.mano .mano-trk.lleno{color:#b9cbc1;background:rgba(255,255,255,.1)}
.mano .mano-trk.ya{box-shadow:inset 0 0 0 1.5px rgba(62,224,138,.55)}
.mano .mano-trk.cur{background:#3ee08a;color:#062012}
.mano .mano-trk.rec{background:#ff4b4b;color:#fff}
.mano .mano-trk.prox{box-shadow:inset 0 0 0 1.5px #ff4b4b}
.mano-pasos{display:grid;grid-template-columns:repeat(16,1fr);gap:3px;height:5px}
.mano-pasos i{border-radius:2px;background:rgba(255,255,255,.09)}
.mano-pasos i:nth-child(4n+1){background:rgba(255,255,255,.18)}
.mano-pasos i.on{background:#3ee08a}
.mano.grab .mano-pasos i.on{background:#ff4b4b}
.mano-mini{display:grid;grid-template-columns:repeat(16,1fr);grid-auto-rows:4px;gap:2px}
.mano-mini i{border-radius:1px;background:rgba(255,255,255,.04)}
.mano-mini i.v{background:var(--c)}
.mano-ayuda{font-size:12px;color:#7f948a;text-align:center;min-height:16px}
.mano-pad{position:absolute;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;text-align:center;
  background:radial-gradient(circle at 50% 35%,color-mix(in srgb,var(--c) 28%,#0c1410),#0a100d 75%);box-shadow:inset 0 0 0 2px color-mix(in srgb,var(--c) 70%,transparent),0 0 0 0 var(--c);
  transition:transform .08s,box-shadow .15s;transform:translate(-50%,-50%)}
.mano-pad b{font-size:12px;font-weight:800;letter-spacing:.08em;color:var(--c)}
.mano-pad small{font-size:10.5px;color:#a7bbb0;max-width:86%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mano-pad.tq{transform:translate(-50%,-50%) scale(.93);box-shadow:inset 0 0 0 3px var(--c),0 0 26px 2px color-mix(in srgb,var(--c) 55%,transparent)}
.mano-pad .al{position:absolute;inset:14% 22%;display:flex;flex-direction:column;justify-content:space-between;pointer-events:none;opacity:.35}
.mano-pad .al i{height:1px;background:var(--c)}
.mano-pad .al i.on{height:3px;opacity:1;border-radius:2px}
.mano-pul{position:absolute;border-radius:50%;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;
  background:#101a15;box-shadow:inset 0 0 0 2px rgba(255,255,255,.14);font-size:11px;font-weight:800;letter-spacing:.08em;color:#b9cbc1}
.mano-pul i{font-style:normal;font-size:9.5px;color:#6f8379;letter-spacing:.06em}
.mano-pul.tq{background:#18261f}
.mano-sat{position:absolute;border-radius:50%;transform:translate(-50%,-50%);background:rgba(255,255,255,.07);display:grid;place-items:center;font-size:17px;font-weight:800;color:#cfe0d6}
.mano-sat.tq{background:rgba(255,255,255,.18)}
.mano-sat.rec{background:#2a1212;color:#ff4b4b;box-shadow:inset 0 0 0 2px #ff4b4b}
.mano.grab .mano-sat.rec{background:#ff4b4b;color:#fff;animation:manoLat 1s ease-in-out infinite}
@keyframes manoLat{50%{box-shadow:0 0 0 8px rgba(255,75,75,.18)}}
.mano-est{position:absolute;transform:translate(-50%,-50%);font-size:11px;font-weight:700;color:#cfe0d6;white-space:nowrap;text-align:center;pointer-events:none;line-height:1.3}
.mano-est span{display:block;font-size:9.5px;color:#7f948a;letter-spacing:.08em}
.mano-calib{position:absolute;inset:0;background:rgba(5,8,6,.94);display:none;flex-direction:column;align-items:center;justify-content:center;gap:10px;text-align:center;padding:30px}
.mano-calib.on{display:flex}
.mano-calib b{font-size:20px}
.mano-calib p{margin:0;max-width:300px;font-size:14px;color:#9fb3a8;line-height:1.5}
.mano-calib .dot{position:absolute;width:64px;height:64px;margin:-32px 0 0 -32px;border-radius:50%;box-shadow:inset 0 0 0 2px #3ee08a;background:rgba(62,224,138,.12)}
.mano-hoja{position:absolute;left:0;right:0;bottom:0;padding:20px 18px calc(env(safe-area-inset-bottom) + 18px);background:#0f1813;border-radius:20px 20px 0 0;
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
`);

    // ---------- estado ----------
    let G = { mano: 'der', pos: null, vueltas: 2, clic: true };
    try { const x = JSON.parse(localStorage.getItem(CLAVE) || 'null'); if (x && Array.isArray(x.pos) && x.pos.length === 5) G = Object.assign(G, x); } catch {}
    const guardarPref = () => { try { localStorage.setItem(CLAVE, JSON.stringify(G)); } catch {} };
    const E = { abierta: false, grupo: 0, shift: -1, ultima: 'BD', grab: false, ses: null, paso: -1, track: 'A', toques: new Map(), alturas: {} };
    let raiz = null, el = {};

    function falta() { return NECESITA.filter(k => typeof gp[k] !== 'function'); }

    // ---------- armar la pantalla ----------
    function armar() {
      raiz = document.createElement('div'); raiz.className = 'mano'; raiz.setAttribute('role', 'dialog'); raiz.setAttribute('aria-label', 'Mano');
      raiz.innerHTML = `
<div class="mano-top">
  <div class="mano-f1"><b>MA<span>NO</span></b><span class="esp"></span>
    <button class="mano-chip" data-a="vueltas" title="Cuántas vueltas suena cada track mientras grabás"></button>
    <button class="mano-chip" data-a="clic" title="Un clic en cada tiempo mientras grabás">CLIC</button>
    <button class="mano-chip" data-a="acomodar">ACOMODAR</button>
    <button class="mano-x" data-a="cerrar" aria-label="Cerrar">×</button></div>
  <div class="mano-trks"></div>
  <div class="mano-pasos"></div>
  <div class="mano-mini"></div>
  <div class="mano-ayuda"></div>
</div>
<div class="mano-capa"></div>
<div class="mano-calib"><b>Apoyá la mano</b><p>Poné los 5 dedos sobre la pantalla, cómodos, como si fueras a tocar. Cada almohadilla va a quedar justo ahí.</p><button class="mano-chip" data-a="calibCancelar">CANCELAR</button></div>
<div class="mano-hoja">
  <b>Ponele nombre</b>
  <input type="text" maxlength="60" placeholder="Nombre del tema" aria-label="Nombre del tema">
  <label><input type="checkbox" checked> <span class="mano-resumen">Armar la canción con lo grabado</span></label>
  <div class="bs"><button data-a="seguir">Seguir tocando</button><button class="pri" data-a="guardar">Guardar</button></div>
</div>`;
      gp.zona('pantalla').appendChild(raiz);
      el = {
        top: raiz.querySelector('.mano-top'), trks: raiz.querySelector('.mano-trks'), pasos: raiz.querySelector('.mano-pasos'), mini: raiz.querySelector('.mano-mini'),
        ayuda: raiz.querySelector('.mano-ayuda'), capa: raiz.querySelector('.mano-capa'), calib: raiz.querySelector('.mano-calib'), hoja: raiz.querySelector('.mano-hoja'),
        nombre: raiz.querySelector('.mano-hoja input[type=text]'), armarCancion: raiz.querySelector('.mano-hoja input[type=checkbox]'), resumen: raiz.querySelector('.mano-resumen'),
        vueltas: raiz.querySelector('[data-a=vueltas]'), clic: raiz.querySelector('[data-a=clic]'),
      };
      for (let i = 0; i < 8; i++) { const b = document.createElement('button'); b.className = 'mano-trk'; b.textContent = LETRAS[i]; b.dataset.t = LETRAS[i]; el.trks.appendChild(b); }
      for (let i = 0; i < 16; i++) el.pasos.appendChild(document.createElement('i'));
      for (let i = 0; i < 8 * 16; i++) el.mini.appendChild(document.createElement('i'));
      raiz.addEventListener('click', alClic);
      el.trks.addEventListener('click', (e) => { const b = e.target.closest('.mano-trk'); if (b && !E.grab) { gp.irATrack(b.dataset.t); E.track = b.dataset.t; pintarTop(); } });
      el.capa.addEventListener('pointerdown', apoyar);
      raiz.addEventListener('pointermove', mover);
      raiz.addEventListener('pointerup', soltar); raiz.addEventListener('pointercancel', soltar);
      el.calib.addEventListener('touchstart', calibrar, { passive: false });
      addEventListener('resize', () => { if (E.abierta) armarPads(); });
      addEventListener('keydown', teclas, true);
    }

    // las almohadillas: los 4 dedos, el pulgar y lo que tiene alrededor
    function armarPads() {
      el.capa.innerHTML = '';
      const W = innerWidth, H = innerHeight, tope = el.top.getBoundingClientRect().bottom + 8;
      const base = G.pos || DER.map(([x, y]) => [G.mano === 'izq' ? 1 - x : x, y]);
      let P = base.map(([x, y]) => [x * W, y * H]);
      // que no se metan arriba ni se salgan
      let d = Infinity; for (let i = 1; i < 4; i++) d = Math.min(d, Math.hypot(P[i][0] - P[i + 1][0], P[i][1] - P[i + 1][1]));
      const r = Math.max(34, Math.min(72, d * 0.48, W * 0.15));
      P = P.map(([x, y]) => [Math.min(W - r - 4, Math.max(r + 4, x)), Math.min(H - r - 4, Math.max(tope + r, y))]);
      E.geo = { P, r };
      // dedos
      E.pads = [];
      for (let k = 0; k < 4; k++) {
        const b = document.createElement('div'); b.className = 'mano-pad'; b.dataset.k = k;
        b.style.left = P[k + 1][0] + 'px'; b.style.top = P[k + 1][1] + 'px'; b.style.width = b.style.height = r * 2 + 'px';
        b.innerHTML = '<div class="al"></div><b></b><small></small>';
        for (let i = 0; i < 8; i++) b.querySelector('.al').appendChild(document.createElement('i'));
        el.capa.appendChild(b); E.pads.push(b);
      }
      // pulgar: más grande
      const rp = r * 1.15, [tx, ty] = P[0];
      const pul = document.createElement('div'); pul.className = 'mano-pul'; pul.dataset.a = 'pulgar';
      pul.style.left = tx + 'px'; pul.style.top = ty + 'px'; pul.style.width = pul.style.height = rp * 2 + 'px';
      el.capa.appendChild(pul); E.pul = pul;
      // alrededor del pulgar, del lado contrario a los dedos: estilo anterior, siguiente, grabar y terminar
      let fx = 0, fy = 0; for (let k = 1; k < 5; k++) { fx += P[k][0] / 4; fy += P[k][1] / 4; }
      const base0 = Math.atan2(ty - fy, tx - fx), rs = Math.max(24, r * 0.55), dist = rp + rs + 10;
      const sats = [['ant', '‹', -1.25], ['sig', '›', -0.42], ['rec', '●', 0.42], ['fin', '■', 1.25]];
      E.sats = {};
      for (const [a, txt, ang] of sats) {
        const s = document.createElement('div'); s.className = 'mano-sat' + (a === 'rec' ? ' rec' : ''); s.dataset.a = a; s.textContent = txt;
        let x = tx + Math.cos(base0 + ang) * dist, y = ty + Math.sin(base0 + ang) * dist;
        x = Math.min(W - rs - 4, Math.max(rs + 4, x)); y = Math.min(H - rs - 4, Math.max(tope + rs, y));
        s.style.left = x + 'px'; s.style.top = y + 'px'; s.style.width = s.style.height = rs * 2 + 'px';
        el.capa.appendChild(s); E.sats[a] = s;
      }
      // ‹ siempre a la izquierda de ›
      if (parseFloat(E.sats.ant.style.left) > parseFloat(E.sats.sig.style.left)) { const a = E.sats.ant.style, b = E.sats.sig.style; [a.left, b.left] = [b.left, a.left]; [a.top, b.top] = [b.top, a.top]; }
      // el nombre del estilo, entre las dos flechas
      const est = document.createElement('div'); est.className = 'mano-est';
      const a1 = E.sats.ant.getBoundingClientRect(), a2 = E.sats.sig.getBoundingClientRect();
      let ex = (a1.left + a1.right + a2.left + a2.right) / 4, ey = (a1.top + a1.bottom + a2.top + a2.bottom) / 4 + (ty > (a1.top + a2.top) / 2 ? -rs - 14 : rs + 14);
      est.style.left = Math.min(W - 70, Math.max(70, ex)) + 'px'; est.style.top = ey + 'px';
      el.capa.appendChild(est); E.est = est;
      pintarPads();
    }

    // ---------- pintar ----------
    const grupoActivo = () => (E.shift >= 0 ? E.shift : E.grupo);
    function nombreEstilo(p) { try { const l = gp.estilos(p), i = gp.estiloDe(p), x = l.find(y => y.indice === i); return x ? x.nombre : ''; } catch { return ''; } }
    function pintarPads() {
      if (!E.pads) return;
      const g = GRUPOS[grupoActivo()];
      E.pads.forEach((b, k) => {
        const p = g.p[k]; b.dataset.p = p; b.style.setProperty('--c', g.c[k]);
        b.querySelector('b').textContent = NOMBRE[p]; b.querySelector('small').textContent = nombreEstilo(p);
        b.querySelector('.al').style.display = MEL[p] ? '' : 'none';
      });
      E.pul.innerHTML = `${g.n}<i>${GRUPOS[1 - grupoActivo()].n}</i>`;
      E.est.innerHTML = `${NOMBRE[E.ultima]}<span>${(nombreEstilo(E.ultima) || '').toUpperCase()}</span>`;
    }
    function pintarTop() {
      el.vueltas.textContent = '×' + G.vueltas;
      el.clic.classList.toggle('on', !!G.clic);
      const notas = gp.notas(), cur = E.track, i0 = LETRAS.indexOf(cur);
      const ses = E.ses ? E.ses.bloques.map(b => b.track) : [];
      [...el.trks.children].forEach((b, i) => {
        const L = LETRAS[i], lleno = notas[i].some(r => r.some(Boolean));
        b.className = 'mano-trk' + (lleno ? ' lleno' : '') + (ses.includes(L) ? ' ya' : '') + (L === cur ? (E.grab ? ' rec' : ' cur') : '') + (E.ses && E.ses.prox === L ? ' prox' : '');
      });
      // la grilla chica del track que suena
      const pat = notas[i0] || [], cols = GRUPOS[0].c.concat(GRUPOS[1].c), mini = el.mini.children;
      for (let t = 0; t < 8; t++) for (let s = 0; s < 16; s++) { const m = mini[t * 16 + s], v = pat[t] && pat[t][s]; m.className = v ? 'v' : ''; if (v) m.style.setProperty('--c', cols[t]); }
      ayuda();
    }
    function ayuda(txt) {
      if (txt) { el.ayuda.textContent = txt; return; }
      if (E.grab && E.ses) el.ayuda.textContent = `Grabando en ${E.track} · vuelta ${Math.min(E.ses.vuelta + 1, G.vueltas)} de ${G.vueltas}` + (E.ses.prox ? ` · después ${E.ses.prox}` : E.ses.cerrar ? ' · último track' : '');
      else el.ayuda.textContent = 'Tocá con los dedos. El pulgar cambia de grupo; ‹ › cambian el sonido; ● graba.';
    }
    function pintarPaso(p) { [...el.pasos.children].forEach((x, i) => x.classList.toggle('on', i === p)); }

    // ---------- tocar ----------
    function alturaDe(b, y) { const r = b.getBoundingClientRect(), f = 1 - (y - r.top - r.height * 0.14) / (r.height * 0.72); return Math.min(8, Math.max(1, Math.round(1 + f * 7))); }
    function marcarAltura(b, n) { [...b.querySelectorAll('.al i')].forEach((x, i) => x.classList.toggle('on', 8 - i === n)); }
    function golpe(b, y) {
      const p = b.dataset.p, n = MEL[p] ? alturaDe(b, y) : 0;
      gp.enVivo(p, n || undefined);
      if (MEL[p]) { E.alturas[b.dataset.k] = n; marcarAltura(b, n); }
      b.classList.add('tq'); clearTimeout(b._t); b._t = setTimeout(() => b.classList.remove('tq'), 90);
      if (E.ultima !== p) { E.ultima = p; pintarPads(); }
      if (E.grab) setTimeout(pintarTop, 30);
    }
    function apoyar(e) {
      const pad = e.target.closest('.mano-pad'), pul = e.target.closest('.mano-pul'), sat = e.target.closest('.mano-sat');
      if (!pad && !pul && !sat) return;
      e.preventDefault();
      try { raiz.setPointerCapture(e.pointerId); } catch {}
      if (pad) { E.toques.set(e.pointerId, { pad }); golpe(pad, e.clientY); return; }
      if (pul) { pul.classList.add('tq'); E.toques.set(e.pointerId, { pul: true, t0: performance.now() }); E.pulT = setTimeout(() => { E.shift = 1 - E.grupo; pintarPads(); }, 230); return; }
      if (sat) { sat.classList.add('tq'); setTimeout(() => sat.classList.remove('tq'), 120); accion(sat.dataset.a); }
    }
    function mover(e) {
      const t = E.toques.get(e.pointerId); if (!t || !t.pad) return;
      const b = t.pad, p = b.dataset.p; if (!MEL[p]) return;
      const n = alturaDe(b, e.clientY);
      if (n !== E.alturas[b.dataset.k]) golpe(b, e.clientY);                // deslizando toca cada nota que cruza
    }
    function soltar(e) {
      const t = E.toques.get(e.pointerId); if (!t) return; E.toques.delete(e.pointerId);
      if (t.pul) {
        clearTimeout(E.pulT); E.pul.classList.remove('tq');
        if (E.shift >= 0) E.shift = -1; else E.grupo = 1 - E.grupo;        // tocarlo cambia; mantenerlo cambia mientras lo tenés
        pintarPads();
      }
    }
    function cambiarEstilo(dir) {
      const p = E.ultima, l = gp.estilos(p); if (!l.length) return;
      const i = Math.max(0, l.findIndex(x => x.indice === gp.estiloDe(p))), n = l[(i + dir + l.length) % l.length];
      gp.elegirEstilo(p, n.indice); gp.tocar(p); pintarPads();
    }

    // ---------- grabar pasando de track ----------
    const notasDe = (L) => gp.notas()[LETRAS.indexOf(L)];
    const vacio = (L) => !notasDe(L).some(r => r.some(Boolean));
    function proximo(desde) { // el próximo track vacío después de este
      for (let i = LETRAS.indexOf(desde) + 1; i < 8; i++) if (vacio(LETRAS[i])) return LETRAS[i];
      return null;
    }
    function empezar() {
      gp.modoCancion(false);
      const est = gp.estado() || {}; E.track = est.track || E.track;
      E.ses = { bloques: [{ track: E.track, veces: G.vueltas }], vuelta: 0, prox: null, cerrar: false, sinPaso: true };
      E.grab = true; raiz.classList.add('grab');
      gp.grabarEnVivo(true);
      pintarTop();
    }
    function terminar(abrirHoja) {
      if (!E.grab) return;
      E.grab = false; raiz.classList.remove('grab');
      gp.grabarEnVivo(false); gp.parar(); pintarPaso(-1);
      if (E.ses) { E.ses.prox = null; }
      pintarTop();
      if (abrirHoja) hoja();
    }
    function alPaso(ev) {
      if (!E.abierta) return;
      pintarPaso(ev.paso);
      if (G.clic && E.grab && ev.paso % 4 === 0) clic(ev.paso === 0);
      if (ev.track !== E.track) { // entró otro track
        E.track = ev.track;
        if (E.ses && E.grab) { E.ses.bloques.push({ track: ev.track, veces: G.vueltas }); E.ses.vuelta = 0; E.ses.prox = null; }
        pintarTop();
      } else if (ev.paso === 0 && E.ses && E.grab) {
        if (E.ses.sinPaso) E.ses.sinPaso = false; else E.ses.vuelta++;
        if (E.ses.cerrar && E.ses.vuelta >= G.vueltas) { terminar(true); return; }
        pintarTop();
      }
      // en la última vuelta, antes de que termine el compás, se pide el track que sigue
      if (E.grab && E.ses && ev.paso === 11 && !E.ses.prox && !E.ses.cerrar && E.ses.vuelta + 1 >= G.vueltas) {
        const L = proximo(E.track);
        if (L) { E.ses.prox = L; gp.siguiente(L, true); } else E.ses.cerrar = true;
        pintarTop();
      }
      if (ev.paso % 4 === 0 && E.grab) pintarTop();
    }
    gp.cuando('paso', alPaso);
    gp.cuando('stop', () => { if (E.grab) terminar(true); pintarPaso(-1); });

    // un clic suave en cada tiempo (solo para guiarse, no se graba ni sale en Descargar)
    function clic(fuerte) {
      const an = gp.analizador(); const c = an && an.context; if (!c) return;
      const o = c.createOscillator(), g = c.createGain(), t = c.currentTime;
      o.frequency.value = fuerte ? 1600 : 1100; g.gain.setValueAtTime(fuerte ? 0.12 : 0.07, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
      o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + 0.06);
    }

    // ---------- la hoja para ponerle nombre ----------
    function hoja() {
      const est = gp.estado() || {}, b = E.ses ? E.ses.bloques : [];
      const d = new Date(), fecha = `${d.getDate()}/${d.getMonth() + 1} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      el.nombre.value = est.nombre && !/^mi (tema|beat)$/i.test(est.nombre) ? est.nombre : 'Sesión ' + fecha;
      el.resumen.textContent = b.length ? `Armar la canción con lo grabado: ${b.map(x => x.track + (x.veces > 1 ? ' ×' + x.veces : '')).join(', ')}` : 'Armar la canción con lo grabado';
      el.armarCancion.checked = b.length > 0; el.armarCancion.disabled = !b.length;
      el.hoja.classList.add('on');
      setTimeout(() => { el.nombre.focus(); el.nombre.select(); }, 260);
    }
    function guardar() {
      const b = E.ses ? E.ses.bloques : [];
      if (el.armarCancion.checked && b.length) gp.ponerCancion(b, true);
      const n = gp.guardarComo(el.nombre.value.trim());
      el.hoja.classList.remove('on'); el.nombre.blur(); E.ses = null;
      gp.aviso(`"${n}" quedó guardado en Mis beats`, 2600);
      pintarTop();
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
      const pul = pts[pi], dedos = pts.filter((_, i) => i !== pi), mx = dedos.reduce((a, p) => a + p[0], 0) / 4;
      const izq = pul[0] > mx;                                               // pulgar a la derecha: mano izquierda
      dedos.sort((a, b) => izq ? b[0] - a[0] : a[0] - b[0]);                 // del índice al meñique
      G.mano = izq ? 'izq' : 'der';
      G.pos = [pul, ...dedos].map(([x, y]) => [x / innerWidth, y / innerHeight]); guardarPref();
      setTimeout(() => { el.calib.classList.remove('on'); [...el.calib.querySelectorAll('.dot')].forEach(x => x.remove()); armarPads(); gp.aviso('Listo: cada dedo tiene su almohadilla'); }, 350);
    }

    // ---------- botones y teclas ----------
    function accion(a) {
      if (a === 'ant') cambiarEstilo(-1);
      else if (a === 'sig') cambiarEstilo(1);
      else if (a === 'rec') { if (E.grab) terminar(true); else empezar(); }
      else if (a === 'fin') { if (E.grab) terminar(true); else { gp.parar(); if (E.ses) hoja(); } }
    }
    function alClic(e) {
      const b = e.target.closest('[data-a]'); if (!b || b.closest('.mano-capa')) return;
      const a = b.dataset.a;
      if (a === 'cerrar') cerrar();
      else if (a === 'vueltas') { G.vueltas = G.vueltas === 1 ? 2 : G.vueltas === 2 ? 4 : 1; guardarPref(); pintarTop(); }
      else if (a === 'clic') { G.clic = !G.clic; guardarPref(); pintarTop(); }
      else if (a === 'acomodar') { if (matchMedia('(pointer:coarse)').matches) el.calib.classList.add('on'); else gp.aviso('Acomodar se hace con la mano apoyada en la pantalla de un teléfono o tablet'); }
      else if (a === 'calibCancelar') el.calib.classList.remove('on');
      else if (a === 'guardar') guardar();
      else if (a === 'seguir') { el.hoja.classList.remove('on'); el.nombre.blur(); }
    }
    function teclas(e) {
      if (!E.abierta || e.ctrlKey || e.metaKey || e.target === el.nombre) return;
      const k = e.key.toLowerCase(), i = TECLAS.indexOf(k);
      if (i >= 0) { e.preventDefault(); e.stopImmediatePropagation(); if (!e.repeat) { const b = E.pads[i], r = b.getBoundingClientRect(); golpe(b, r.top + r.height / 2); } return; }
      if (k === ' ') { e.preventDefault(); e.stopImmediatePropagation(); if (!e.repeat) { E.grupo = 1 - E.grupo; pintarPads(); } return; }
      if (k === 'arrowleft' || k === 'arrowright') { e.preventDefault(); e.stopImmediatePropagation(); cambiarEstilo(k === 'arrowleft' ? -1 : 1); return; }
      if (k === 'r') { e.preventDefault(); e.stopImmediatePropagation(); accion('rec'); return; }
      if (k === 'escape') { e.preventDefault(); e.stopImmediatePropagation(); if (el.hoja.classList.contains('on')) el.hoja.classList.remove('on'); else cerrar(); }
    }

    // ---------- abrir y cerrar ----------
    function abrir() {
      const f = falta(); if (f.length) { gp.aviso('Mano necesita la versión nueva de GREENPAD (recargá la página)', 3200); return; }
      if (!raiz) armar();
      E.abierta = true; const est = gp.estado() || {}; E.track = est.track || 'A';
      raiz.style.display = ''; requestAnimationFrame(() => raiz.classList.add('on'));
      armarPads(); pintarTop();
      if (!G.pos && matchMedia('(pointer:coarse)').matches) setTimeout(() => el.calib.classList.add('on'), 250);   // la primera vez en el teléfono, a acomodar la mano
    }
    function cerrar() {
      if (E.grab) terminar(false);
      E.abierta = false; raiz.classList.remove('on'); el.hoja.classList.remove('on');
      setTimeout(() => { if (!E.abierta) raiz.style.display = 'none'; }, 220);
    }

    gp.herramienta({
      id: 'mano',
      nombre: 'Mano',
      detalle: 'Tocá con la mano apoyada en la pantalla: cada dedo un instrumento, el pulgar cambia de grupo y de sonido. Graba pasando de un track al siguiente y al final le ponés nombre.',
      abrir,
    });
  },
});
