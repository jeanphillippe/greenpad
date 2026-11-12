// BOOMBOX: un visual para el video. Un radiograbador grande: los dos parlantes empujan con el bombo,
// el cassette gira, la aguja del dial avanza con el tema y los vúmetros de luces siguen al sonido.
GREENPAD.plugin({
  id: 'boombox',
  nombre: 'Boombox',
  autor: 'GREENPAD',
  version: '1.0',
  tipo: 'visual',
  descripcion: 'Un radiograbador de los 80: parlantes que empujan con el bombo, cassette que gira, dial que avanza con el tema y luces que siguen al sonido. Para rap, funk y todo lo que tenga graves.',
  setup(gp) {
    const TAU = Math.PI * 2, GRUESA = '"Arial Black","Helvetica Neue",Impact,system-ui,sans-serif', MONO = 'ui-monospace,Menlo,Consolas,monospace';
    function caja(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }

    // fondo: un color pleno oscuro, rayos que salen desde atrás del equipo y barras de sonido que asoman por arriba
    function fondo(g, v, m) {
      g.fillStyle = '#100d14'; g.fillRect(0, 0, v.W, v.H);
      g.save(); g.translate(360, 640); g.rotate(v.pulsos * .04);
      for (let i = 0; i < 16; i++) { g.rotate(TAU / 16); g.globalAlpha = i % 2 ? .05 + v.bombo * .05 : .025; g.fillStyle = v.color; g.beginPath(); g.moveTo(0, 0); g.lineTo(-150, -1100); g.lineTo(150, -1100); g.closePath(); g.fill(); }
      g.restore(); g.globalAlpha = 1;
      const n = 14, b = v.bandas(n), ancho = 620 / n;
      for (let i = 0; i < n; i++) {                                         // barras por bloques, detrás del equipo
        const bloques = Math.round(b[i] * 13);
        for (let k = 0; k < bloques; k++) { g.globalAlpha = .22 + k * .045; g.fillStyle = k > 10 ? v.color2 : v.color; g.fillRect(50 + i * ancho + 4, 800 - k * 34, ancho - 8, 26); }
      }
      g.globalAlpha = 1;
      m.ondas = m.ondas.filter(o => (o.r += 12) < 760);                     // ondas que salen de cada parlante con el bombo
      for (const o of m.ondas) { g.globalAlpha = Math.max(0, .3 * (1 - o.r / 760)); g.strokeStyle = v.color; g.lineWidth = 5; g.beginPath(); g.arc(o.x, 700, o.r, 0, TAU); g.stroke(); }
      g.globalAlpha = 1;
      const piso = g.createLinearGradient(0, 905, 0, 1130); piso.addColorStop(0, '#1b1622'); piso.addColorStop(1, '#0b090e');
      g.fillStyle = piso; g.fillRect(0, 905, v.W, v.H - 905);
      g.fillStyle = 'rgba(0,0,0,.5)'; g.beginPath(); g.ellipse(360, 912, 330, 20, 0, 0, TAU); g.fill();   // sombra en el piso
    }

    function parlante(g, x, y, R, empuje, v) {
      g.fillStyle = '#0a0a0c'; g.beginPath(); g.arc(x, y, R + 12, 0, TAU); g.fill();
      const aro = g.createLinearGradient(x - R, y - R, x + R, y + R); aro.addColorStop(0, '#d9dce2'); aro.addColorStop(.5, '#70747c'); aro.addColorStop(1, '#c4c8cf');
      g.fillStyle = aro; g.beginPath(); g.arc(x, y, R, 0, TAU); g.fill();                                   // aro cromado
      g.fillStyle = '#0c0c0e'; g.beginPath(); g.arc(x, y, R - 10, 0, TAU); g.fill();
      const rc = (R - 20) * (1 + empuje * .06);                                                              // el cono se agranda cuando empuja
      const cono = g.createRadialGradient(x - rc * .25, y - rc * .3, rc * .1, x, y, rc); cono.addColorStop(0, '#44464c'); cono.addColorStop(.6, '#1f2024'); cono.addColorStop(1, '#101113');
      g.fillStyle = cono; g.beginPath(); g.arc(x, y, rc, 0, TAU); g.fill();
      g.strokeStyle = 'rgba(255,255,255,.06)'; g.lineWidth = 2; for (let k = .42; k < 1; k += .19) { g.beginPath(); g.arc(x, y, rc * k, 0, TAU); g.stroke(); }
      g.globalAlpha = .15 + empuje * .8; g.strokeStyle = v.color; g.lineWidth = 5 + empuje * 6; g.beginPath(); g.arc(x, y, rc, 0, TAU); g.stroke(); g.globalAlpha = 1;
      const rt = R * .3 * (1 + empuje * .18), tapa = g.createRadialGradient(x - rt * .35, y - rt * .4, 2, x, y, rt); tapa.addColorStop(0, '#e6e8ec'); tapa.addColorStop(1, '#6a6e76');
      g.fillStyle = tapa; g.beginPath(); g.arc(x, y, rt, 0, TAU); g.fill();                                  // tapa plateada del centro
    }
    function perilla(g, x, y, r, giro) {
      const p = g.createLinearGradient(x - r, y - r, x + r, y + r); p.addColorStop(0, '#e6e8ec'); p.addColorStop(1, '#6a6e76');
      g.fillStyle = '#0a0a0c'; g.beginPath(); g.arc(x, y, r + 4, 0, TAU); g.fill(); g.fillStyle = p; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
      g.strokeStyle = '#17181b'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(giro) * r * .8, y + Math.sin(giro) * r * .8); g.stroke();
    }
    function carrete(g, x, y, r, giro) {
      g.fillStyle = '#3a2618'; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
      g.fillStyle = '#e9e4d8'; g.beginPath(); g.arc(x, y, 12, 0, TAU); g.fill(); g.fillStyle = '#0b0c0d'; g.beginPath(); g.arc(x, y, 6, 0, TAU); g.fill();
      g.fillStyle = '#e9e4d8'; for (let i = 0; i < 6; i++) { g.save(); g.translate(x, y); g.rotate(giro + i * TAU / 6); g.fillRect(4, -1.5, 5, 3); g.restore(); }
    }

    gp.visual({
      id: 'boombox',
      nombre: 'Boombox',
      detalle: 'Un radiograbador de los 80: los parlantes empujan con el bombo y los graves, el cassette gira, la aguja del dial avanza con el tema y las luces siguen al sonido. Para rap, funk y todo lo que tenga graves.',
      dibujar(g, v) {
        const m = v.memoria;
        if (!m.ondas) { m.ondas = []; m.antes = 0; m.emp = 0; m.giro = 0; m.t = v.ahora; m.vu = [0, 0]; }
        if (v.bombo > .93 && m.antes <= .93) m.ondas.push({ r: 120, x: 178 }, { r: 120, x: 542 });
        m.antes = v.bombo;
        const quiere = Math.min(1, v.bombo * .8 + v.graves * .7); m.emp += (quiere - m.emp) * (quiere > m.emp ? .7 : .22);
        const dt = Math.max(0, Math.min(.1, v.ahora - m.t)); m.t = v.ahora; m.giro += dt * (v.bpm / 60) * 2.2;
        const b8 = v.bandas(8), izq = (b8[0] + b8[1] + b8[2] + b8[3]) / 4, der = (b8[4] + b8[5] + b8[6] + b8[7]) / 4;
        [izq, der].forEach((x, i) => { m.vu[i] += (x - m.vu[i]) * (x > m.vu[i] ? .6 : .14); });
        const prog = v.dur > 0 ? Math.min(1, v.ahora / v.dur) : 0;

        fondo(g, v, m);

        // título
        g.textAlign = 'center'; g.textBaseline = 'alphabetic';
        g.font = '900 64px ' + GRUESA; g.fillStyle = '#f3efe6'; g.fillText(v.titulo.toUpperCase(), 360, 150, 620);
        g.font = '800 22px system-ui,sans-serif'; g.fillStyle = v.color; g.fillText(v.bpm + ' BPM   ·   TRACK ' + v.track, 360, 194);

        // el equipo: rebota un poco con el bombo
        g.save();
        g.translate(360, 905); g.scale(1 + v.bombo * .018, 1 + v.bombo * .03); g.rotate(Math.sin(v.pulsos * Math.PI) * .006); g.translate(-360, -905);
        // antena y manija
        g.strokeStyle = '#b9bdc5'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(610, 520); g.lineTo(688, 318); g.stroke();
        g.fillStyle = '#e6e8ec'; g.beginPath(); g.arc(688, 318, 7, 0, TAU); g.fill();
        g.strokeStyle = '#2a2c31'; g.lineWidth = 26; g.lineJoin = 'round'; g.beginPath(); g.moveTo(150, 520); g.lineTo(150, 440); g.lineTo(570, 440); g.lineTo(570, 520); g.stroke();
        g.strokeStyle = '#8c9098'; g.lineWidth = 6; g.beginPath(); g.moveTo(180, 440); g.lineTo(540, 440); g.stroke();
        // cuerpo
        const cuerpo = g.createLinearGradient(0, 500, 0, 900); cuerpo.addColorStop(0, '#34373d'); cuerpo.addColorStop(.12, '#24262b'); cuerpo.addColorStop(1, '#141518');
        g.fillStyle = cuerpo; caja(g, 30, 500, 660, 400, 26); g.fill(); g.strokeStyle = '#050506'; g.lineWidth = 4; g.stroke();
        g.fillStyle = '#b9bdc5'; caja(g, 30, 500, 660, 16, 8); g.fill();                                          // filete cromado arriba
        g.fillStyle = '#b9bdc5'; g.fillRect(44, 566, 632, 4);
        // fila de arriba: perillas, dial de la radio y teclas
        perilla(g, 82, 542, 15, -2.2 + m.vu[0] * 2.4); perilla(g, 128, 542, 15, -2.2 + m.vu[1] * 2.4);
        g.fillStyle = '#e9e4d8'; caja(g, 172, 524, 376, 36, 5); g.fill();
        g.fillStyle = '#17181b'; g.font = '700 10px ' + MONO; g.textAlign = 'center';
        for (let i = 0; i <= 12; i++) { const x = 184 + i * 29.3; g.fillRect(x, 528, 1.5, i % 2 ? 6 : 11); if (i % 2 === 0) g.fillText(88 + i * 1.7 | 0, x, 553); }
        g.fillStyle = '#e5352b'; g.fillRect(184 + prog * 352 - 1.5, 525, 3, 34);                                   // la aguja roja: por dónde va el tema
        for (let i = 0; i < 3; i++) { g.fillStyle = i === 2 ? v.color : '#8c9098'; caja(g, 566 + i * 36, 530, 28, 24, 4); g.fill(); }
        // parlantes
        parlante(g, 178, 736, 128, m.emp, v); parlante(g, 542, 736, 128, m.emp * .94, v);
        // centro: casetera, luces y teclas
        g.fillStyle = '#0c0c0e'; caja(g, 322, 588, 76, 300, 8); g.fill();
        g.save(); caja(g, 328, 596, 64, 96, 6); g.fillStyle = '#1b1c20'; g.fill(); g.clip();
        carrete(g, 360, 622, 14 + 12 * (1 - prog), m.giro); carrete(g, 360, 668, 14 + 12 * prog, m.giro * 1.07 + 1);
        g.fillStyle = 'rgba(255,255,255,.07)'; g.fillRect(328, 596, 22, 96);
        g.restore();
        for (let c = 0; c < 2; c++) for (let k = 0; k < 9; k++) {                                                   // dos columnas de luces: graves y agudos
          g.fillStyle = k >= 7 ? '#ff4b3a' : k >= 5 ? '#ffd95a' : v.color; g.globalAlpha = k < Math.round(m.vu[c] * 9) ? 1 : .12;
          g.fillRect(334 + c * 30, 806 - k * 11.5, 22, 7);
        }
        g.globalAlpha = 1;
        for (let i = 0; i < 4; i++) { g.fillStyle = i === 1 ? v.color : '#8c9098'; caja(g, 329 + i * 16, 832, 13, 44 - (i === 1 ? 6 : 0), 3); g.fill(); }   // teclas: la de play, apretada
        // tweeters arriba de cada parlante
        const hat = Math.max(v.niveles[2], v.niveles[3] * .7);
        [[72, 596], [284, 596], [436, 596], [648, 596]].forEach(([x, y]) => { g.fillStyle = '#0a0a0c'; g.beginPath(); g.arc(x, y, 17, 0, TAU); g.fill(); g.fillStyle = '#b9bdc5'; g.beginPath(); g.arc(x, y, 9 + hat * 3, 0, TAU); g.fill(); g.globalAlpha = hat; g.strokeStyle = v.color2; g.lineWidth = 3; g.beginPath(); g.arc(x, y, 15, 0, TAU); g.stroke(); g.globalAlpha = 1; });
        g.fillStyle = '#8c9098'; g.font = '900 12px system-ui,sans-serif'; g.textAlign = 'center'; g.fillText('GREENPAD', 360, 583);
        g.restore();

        // abajo: los 16 pasos y una luz por instrumento
        for (let i = 0; i < 16; i++) { g.fillStyle = i === v.paso ? v.color : i % 4 === 0 ? 'rgba(243,239,230,.4)' : 'rgba(243,239,230,.15)'; caja(g, 60 + i * 37.9, 968, 31, i === v.paso ? 14 : 8, 3); g.fill(); }
        for (let t = 0; t < 8; t++) { g.globalAlpha = .16 + v.niveles[t] * .84; g.fillStyle = v.colores[t]; caja(g, 60 + t * 76.6, 1030, 64, 22, 6); g.fill(); }
        g.globalAlpha = 1;
      },
    });
  },
});
