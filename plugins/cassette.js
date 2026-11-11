// CASSETTE: un visual para el video. Un cassette con el título escrito a mano, los carretes girando,
// dos vúmetros de aguja y un fondo de puntos que sube con el sonido.
GREENPAD.plugin({
  id: 'cassette',
  nombre: 'Cassette',
  autor: 'GREENPAD',
  version: '1.0',
  tipo: 'visual',
  descripcion: 'Un cassette con el título escrito a mano, carretes que giran con el tempo, vúmetros de aguja y un fondo de puntos que sube con el sonido.',
  setup(gp) {
    const TAU = Math.PI * 2, CREMA = '#efe6d2', TINTA = '#1d2f7a';
    const MANO = '"GPHand","Marker Felt","Bradley Hand","Segoe Print","Comic Sans MS",cursive';
    const MONO = 'ui-monospace,Menlo,Consolas,monospace';
    function caja(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }

    // fondo: una trama de puntos (como impresa) donde cada columna es una franja de frecuencias
    function fondo(g, v) {
      g.fillStyle = '#14100c'; g.fillRect(0, 0, v.W, v.H);
      const cols = 18, filas = 32, b = v.bandas(cols), dx = v.W / cols, dy = v.H / filas;
      g.fillStyle = v.color;
      for (let c = 0; c < cols; c++) {
        const alto = b[c] * filas * .8;
        for (let f = 0; f < filas; f++) {
          const k = Math.max(0, Math.min(1, alto - f)), r = 2.2 + k * (dx * .34);   // los puntos de abajo se agrandan con el sonido
          g.globalAlpha = .08 + k * .26;
          g.beginPath(); g.arc(c * dx + dx / 2, v.H - f * dy - dy / 2, r, 0, TAU); g.fill();
        }
      }
      g.globalAlpha = 1;
      const som = g.createRadialGradient(v.W / 2, v.H * .45, 120, v.W / 2, v.H * .45, 760); som.addColorStop(0, 'rgba(20,16,12,0)'); som.addColorStop(1, 'rgba(8,6,4,.86)');
      g.fillStyle = som; g.fillRect(0, 0, v.W, v.H);
    }

    function carrete(g, x, y, cinta, giro) {
      g.fillStyle = '#3a2618'; g.beginPath(); g.arc(x, y, cinta, 0, TAU); g.fill();                    // la cinta enrollada
      g.strokeStyle = 'rgba(255,255,255,.07)'; g.lineWidth = 1;
      for (let r = 30; r < cinta; r += 7) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.stroke(); }
      g.fillStyle = '#e9e4d8'; g.beginPath(); g.arc(x, y, 24, 0, TAU); g.fill();                        // el centro, con sus 6 dientes
      g.fillStyle = '#0b0c0d'; g.beginPath(); g.arc(x, y, 13, 0, TAU); g.fill();
      g.fillStyle = '#e9e4d8';
      for (let i = 0; i < 6; i++) { const a = giro + i * TAU / 6; g.save(); g.translate(x, y); g.rotate(a); g.fillRect(9, -2.5, 8, 5); g.restore(); }
    }

    function cassette(g, v, m) {
      const prog = v.dur > 0 ? Math.min(1, v.ahora / v.dur) : 0;
      g.save();
      g.translate(360, 560); g.rotate(-.055 + Math.sin(v.pulsos * Math.PI / 2) * .008); g.scale(1 + v.bombo * .028, 1 + v.bombo * .028);
      g.fillStyle = 'rgba(0,0,0,.5)'; caja(g, -298, -180, 620, 396, 24); g.fill();                     // sombra
      const cuerpo = g.createLinearGradient(0, -198, 0, 198); cuerpo.addColorStop(0, '#2b2e33'); cuerpo.addColorStop(1, '#17191c');
      g.fillStyle = cuerpo; caja(g, -310, -198, 620, 396, 24); g.fill();
      g.strokeStyle = '#08090a'; g.lineWidth = 3; g.stroke();
      g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 2; g.beginPath(); g.moveTo(-284, -194); g.lineTo(284, -194); g.stroke();
      [[-288, -176], [288, -176], [-288, 176], [288, 176]].forEach(([x, y]) => {                        // tornillos
        g.fillStyle = '#6a7077'; g.beginPath(); g.arc(x, y, 7, 0, TAU); g.fill();
        g.strokeStyle = '#22252a'; g.lineWidth = 2; g.beginPath(); g.moveTo(x - 4, y - 3); g.lineTo(x + 4, y + 3); g.stroke();
      });
      // etiqueta de papel
      g.fillStyle = CREMA; caja(g, -276, -172, 552, 250, 12); g.fill();
      g.fillStyle = v.color; g.fillRect(-276, 34, 552, 16); g.fillStyle = v.color2; g.fillRect(-276, 54, 552, 6);
      g.fillStyle = '#c9412b'; g.beginPath(); g.arc(-236, -132, 22, 0, TAU); g.fill();                  // el lado
      g.fillStyle = CREMA; g.font = '800 26px system-ui,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(v.track, -236, -131);
      g.strokeStyle = 'rgba(29,47,122,.25)'; g.lineWidth = 1.5;                                          // renglones
      [-104, -62].forEach(y => { g.beginPath(); g.moveTo(-200, y); g.lineTo(256, y); g.stroke(); });
      g.fillStyle = TINTA; g.textAlign = 'left'; g.textBaseline = 'alphabetic';
      g.font = '700 50px ' + MANO; g.fillText(v.titulo, -196, -112, 440);                                // el título, a mano
      g.font = '700 30px ' + MANO; g.fillText(v.bpm + ' bpm  ·  greenpad', -196, -70, 440);
      g.fillStyle = 'rgba(0,0,0,.55)'; g.font = '700 15px ' + MONO; g.textAlign = 'right'; g.fillText('C-90  NORMAL BIAS', 262, 74);
      // ventana con los carretes: el de la izquierda se vacía y el de la derecha se llena a medida que avanza el tema
      g.save();
      caja(g, -168, -44, 336, 72, 12); g.fillStyle = '#0b0c0d'; g.fill(); g.clip();
      carrete(g, -96, -8, 30 + 44 * (1 - prog), m.giro); carrete(g, 96, -8, 30 + 44 * prog, m.giro * 1.07 + 1);
      g.fillStyle = 'rgba(255,255,255,.06)'; g.fillRect(-168, -44, 336, 22);                             // reflejo del plástico
      g.restore();
      g.strokeStyle = '#3d4147'; g.lineWidth = 2; caja(g, -168, -44, 336, 72, 12); g.stroke();
      // la parte de abajo, por donde pasa la cinta
      g.fillStyle = '#121416'; g.beginPath(); g.moveTo(-206, 198); g.lineTo(-176, 104); g.lineTo(176, 104); g.lineTo(206, 198); g.closePath(); g.fill();
      g.strokeStyle = '#08090a'; g.lineWidth = 2; g.stroke();
      g.fillStyle = '#050606'; [[-118, 158, 13], [118, 158, 13], [-46, 172, 7], [46, 172, 7]].forEach(([x, y, r]) => { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); });
      g.fillStyle = '#7a5a3a'; g.fillRect(-18, 180, 36, 10);
      g.restore();
    }

    function vumetro(g, x, y, nivel, nombre, color) {
      const w = 286, h = 176;
      g.fillStyle = '#0c0d0e'; caja(g, x - 6, y - 6, w + 12, h + 12, 16); g.fill();
      const cara = g.createLinearGradient(0, y, 0, y + h); cara.addColorStop(0, '#f6efdd'); cara.addColorStop(1, '#d9cdb0');
      g.fillStyle = cara; caja(g, x, y, w, h, 11); g.fill();
      const cx = x + w / 2, cy = y + h + 26, R = 150, a0 = -Math.PI / 2 - .78, a1 = -Math.PI / 2 + .78;
      g.lineWidth = 5; g.strokeStyle = '#2a2a2a'; g.beginPath(); g.arc(cx, cy, R, a0, a0 + (a1 - a0) * .72); g.stroke();
      g.strokeStyle = '#c9412b'; g.beginPath(); g.arc(cx, cy, R, a0 + (a1 - a0) * .72, a1); g.stroke();   // la zona roja
      for (let i = 0; i <= 10; i++) {
        const a = a0 + (a1 - a0) * i / 10, l = i % 5 === 0 ? 16 : 9;
        g.strokeStyle = i > 7 ? '#c9412b' : '#2a2a2a'; g.lineWidth = i % 5 === 0 ? 3 : 2;
        g.beginPath(); g.moveTo(cx + Math.cos(a) * (R - 4), cy + Math.sin(a) * (R - 4)); g.lineTo(cx + Math.cos(a) * (R - 4 - l), cy + Math.sin(a) * (R - 4 - l)); g.stroke();
      }
      g.fillStyle = '#2a2a2a'; g.font = '800 15px system-ui,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.fillText(nombre, cx, y + h - 46);
      g.font = '700 11px system-ui,sans-serif'; g.globalAlpha = .6; g.fillText('VU', cx, y + h - 30); g.globalAlpha = 1;
      const a = a0 + (a1 - a0) * Math.min(1.04, nivel);                                                   // la aguja
      g.save(); caja(g, x, y, w, h, 11); g.clip();
      g.strokeStyle = '#111'; g.lineWidth = 3; g.lineCap = 'round'; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * (R + 8), cy + Math.sin(a) * (R + 8)); g.stroke();
      g.fillStyle = '#1a1a1a'; g.beginPath(); g.arc(cx, y + h + 6, 30, 0, TAU); g.fill();
      g.restore();
      g.fillStyle = nivel > .74 ? '#ff4b3a' : '#4a1712'; g.beginPath(); g.arc(x + w - 22, y + 22, 7, 0, TAU); g.fill(); // luz de pico
      g.fillStyle = color; g.fillRect(x + 16, y + 16, 26, 6);
    }

    gp.visual({
      id: 'cassette',
      nombre: 'Cassette',
      detalle: 'Un cassette con el título escrito a mano, los carretes girando con el tempo, dos vúmetros de aguja y un fondo de puntos que sube con el sonido. Para boom bap, lo-fi y todo lo que suene a cinta.',
      dibujar(g, v) {
        const m = v.memoria;
        if (m.giro == null) { m.giro = 0; m.vu = [0, 0]; m.antes = v.ahora; }
        const dt = Math.max(0, Math.min(.1, v.ahora - m.antes)); m.antes = v.ahora;
        m.giro += dt * (v.bpm / 60) * 2.2;                                   // los carretes giran más rápido con más tempo
        // agujas: suben rápido y bajan despacio, como las de verdad
        const b = v.bandas(8), agudos = (b[4] + b[5] + b[6] + b[7]) / 4, graves = Math.max(v.bombo * .9, (b[0] + b[1] + b[2]) / 3);
        [graves, agudos].forEach((x, i) => { m.vu[i] += (x - m.vu[i]) * (x > m.vu[i] ? .5 : .1); });

        fondo(g, v);

        // arriba: contador como el de una casetera y los 16 pasos
        g.fillStyle = '#0a0b0a'; caja(g, 60, 108, 250, 86, 12); g.fill();
        const s = Math.floor(v.ahora), reloj = String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
        g.fillStyle = v.color; g.font = '700 56px ' + MONO; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(reloj, 185, 153);
        g.textAlign = 'right'; g.fillStyle = CREMA; g.font = '800 22px system-ui,sans-serif'; g.fillText('▶ PLAY', 660, 138);
        g.globalAlpha = .55; g.font = '700 17px system-ui,sans-serif'; g.fillText('LADO ' + v.track, 660, 168); g.globalAlpha = 1;
        for (let i = 0; i < 16; i++) {
          g.fillStyle = i === v.paso ? v.color : i % 4 === 0 ? 'rgba(239,230,210,.4)' : 'rgba(239,230,210,.16)';
          caja(g, 60 + i * 37.9, 232, 31, i === v.paso ? 14 : 8, 3); g.fill();
        }

        cassette(g, v, m);
        vumetro(g, 60, 842, m.vu[0], 'GRAVES', v.color);
        vumetro(g, 374, 842, m.vu[1], 'AGUDOS', v.color2);

        // una luz por instrumento
        for (let t = 0; t < 8; t++) {
          g.globalAlpha = .16 + v.niveles[t] * .84; g.fillStyle = v.colores[t];
          caja(g, 60 + t * 76.6, 1066, 64, 22, 6); g.fill();
        }
        g.globalAlpha = 1;
      },
    });
  },
});
