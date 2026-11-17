// ONDA: la onda de lo que suena, sobre la barra de la canción, mientras armás el tema.
// Corre de derecha a izquierda al ritmo del tempo (dos rayitas por paso) y cada rayita lleva el color
// del track que estaba sonando, igual que los bloques de la canción. Al tocar un botón de la grilla
// también aparece, así se ve cómo va quedando cada sonido. En silencio queda una línea quieta.

GREENPAD.plugin({
  id: 'onda',
  nombre: 'Onda',
  autor: 'GREENPAD',
  version: '1.0',
  tipo: 'herramienta',
  descripcion: 'La onda de lo que suena, sobre la barra de la canción, con el color de cada track.',

  setup(gp) {
    const zona = gp.zona('cancion');
    const cv = document.createElement('canvas');
    zona.appendChild(cv);
    gp.estilo('.pz-cancion canvas{display:block;width:100%;height:100%;mix-blend-mode:screen}:root:not([data-theme="night"]) .pz-cancion canvas{mix-blend-mode:multiply}');
    const g = cv.getContext('2d');

    let an = null, buf = null, track = 'A', last = 0, idle = 0, colT = 0;
    let amp = new Float32Array(0), col = new Uint8Array(0); // historial: alto (0 a 1) y track (0 a 7) de cada rayita
    const colors = [];
    const readColors = () => {
      const cs = getComputedStyle(document.documentElement);
      for (let i = 0; i < 8; i++) colors[i] = cs.getPropertyValue('--s' + i).trim() || '#3ee08a';
      colors[8] = cs.getPropertyValue('--line').trim() || 'rgba(255,255,255,.15)';
    };
    readColors();

    gp.cuando('paso', (e) => { track = e.track; });
    gp.cuando('track', (e) => { const st = gp.estado(); if (!st || !st.tocando) track = e.track; });
    gp.cuando('stop', () => { const st = gp.estado(); if (st) track = st.track; });

    function size() {
      const dpr = Math.min(2, window.devicePixelRatio || 1), w = Math.round(cv.clientWidth * dpr), h = Math.round(cv.clientHeight * dpr);
      if (!w || !h) return 0;
      if (cv.width !== w || cv.height !== h) {
        cv.width = w; cv.height = h;
        const n = Math.max(8, Math.floor(w / (4 * dpr))), a2 = new Float32Array(n), c2 = new Uint8Array(n);
        a2.set(amp.subarray(Math.max(0, amp.length - n)), Math.max(0, n - amp.length)); // se queda con lo último que se veía
        c2.set(col.subarray(Math.max(0, col.length - n)), Math.max(0, n - col.length));
        amp = a2; col = c2; idle = 0; // vuelve a dibujar con el tamaño nuevo
      }
      return dpr;
    }
    function level() {
      if (!an) { an = gp.analizador(); if (an) buf = new Float32Array(an.fftSize); }
      if (!an) return 0;
      an.getFloatTimeDomainData(buf);
      let pk = 0; for (let i = 0; i < buf.length; i += 2) { const v = Math.abs(buf[i]); if (v > pk) pk = v; }
      return pk;
    }
    function draw(dpr) {
      const w = cv.width, h = cv.height, n = amp.length, bw = 3 * dpr, gap = w / n - bw, base = h - 2 * dpr;
      g.clearRect(0, 0, w, h);
      for (let i = 0; i < n; i++) { // rayitas que suben desde abajo (así se siguen leyendo los bloques)
        const a = amp[i]; if (a < .01) continue;
        const bh = Math.max(dpr, a * h * .8), x = i * (bw + gap);
        g.globalAlpha = .3 + .5 * (i / n); // lo más viejo, más tenue
        g.fillStyle = colors[col[i]] || colors[0];
        g.fillRect(x, base - bh, bw, bh);
      }
      g.globalAlpha = 1;
    }
    function frame(now) {
      requestAnimationFrame(frame);
      if (document.hidden || !cv.offsetParent) return; // bandejas, video o pestaña escondida: no dibuja
      const dpr = size(); if (!dpr) return;
      if (now - colT > 2000) { colT = now; readColors(); }
      const st = gp.estado(), bpm = st ? st.bpm : 100, every = 7500 / bpm; // dos rayitas por paso
      if (now - last < every) return;
      const steps = Math.min(8, Math.floor((now - last) / every)); last = now;
      const lv = level(), a = Math.min(1, Math.pow(lv * 1.5, .7)), ti = Math.max(0, 'ABCDEFGH'.indexOf(track));
      if (a < .01 && idle > amp.length) return; // ya está todo en silencio: nada que mover
      idle = a < .01 ? idle + steps : 0;
      for (let k = 0; k < steps; k++) { amp.copyWithin(0, 1); col.copyWithin(0, 1); amp[amp.length - 1] = a; col[col.length - 1] = ti; }
      draw(dpr);
    }
    requestAnimationFrame(frame);
  },
});
