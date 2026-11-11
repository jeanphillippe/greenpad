// PARLANTES: un visual para el video. Una torre de parlantes: los conos empujan con el bombo y los graves,
// los tweeters brillan con el hi-hat y en el medio hay un ecualizador de luces.
GREENPAD.plugin({
  id: 'parlantes',
  nombre: 'Parlantes',
  autor: 'GREENPAD',
  version: '1.0',
  tipo: 'visual',
  descripcion: 'Una torre de parlantes: los conos empujan con el bombo, los tweeters brillan con el hi-hat y el ecualizador de luces sigue al sonido. Para rap, trap y todo lo que tenga graves.',
  setup(gp) {
    const TAU = Math.PI * 2, GRUESA = '"Arial Black","Helvetica Neue",Impact,system-ui,sans-serif';
    function caja(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }

    // fondo: pared de ladrillos apenas iluminada por un foco del color de la parte que suena
    function pared(g, v, m) {
      g.fillStyle = '#0b0a0c'; g.fillRect(0, 0, v.W, v.H);
      const foco = g.createRadialGradient(360, 520, 60, 360, 520, 820); foco.addColorStop(0, v.color); foco.addColorStop(1, 'rgba(0,0,0,0)');
      g.globalAlpha = .13 + v.bombo * .2; g.fillStyle = foco; g.fillRect(0, 0, v.W, v.H); g.globalAlpha = 1;
      g.strokeStyle = 'rgba(255,255,255,.045)'; g.lineWidth = 2;
      for (let f = 0; f < 30; f++) {
        const y = f * 44; g.beginPath(); g.moveTo(0, y); g.lineTo(v.W, y); g.stroke();
        for (let x = f % 2 ? 45 : 0; x < v.W; x += 90) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 44); g.stroke(); }
      }
      // ondas que salen de los parlantes con cada bombo
      m.ondas = m.ondas.filter(o => (o.r += 13) < 900);
      for (const o of m.ondas) { g.globalAlpha = Math.max(0, .34 * (1 - o.r / 900)); g.strokeStyle = v.color; g.lineWidth = 5; g.beginPath(); g.arc(360, o.y, o.r, 0, TAU); g.stroke(); }
      g.globalAlpha = 1;
    }

    function woofer(g, x, y, R, empuje, v) {
      const aro = g.createLinearGradient(x - R, y - R, x + R, y + R); aro.addColorStop(0, '#6d7178'); aro.addColorStop(.5, '#2b2d31'); aro.addColorStop(1, '#55585e');
      g.fillStyle = aro; g.beginPath(); g.arc(x, y, R, 0, TAU); g.fill();                              // aro de metal
      for (let i = 0; i < 8; i++) { const a = i * TAU / 8 + .39; g.fillStyle = '#0d0e10'; g.beginPath(); g.arc(x + Math.cos(a) * (R - 11), y + Math.sin(a) * (R - 11), 4.5, 0, TAU); g.fill(); }
      g.fillStyle = '#0c0c0e'; g.beginPath(); g.arc(x, y, R - 22, 0, TAU); g.fill();                    // suspensión de goma
      g.strokeStyle = 'rgba(255,255,255,.09)'; g.lineWidth = 3; g.beginPath(); g.arc(x, y, R - 30, 0, TAU); g.stroke();
      const rc = (R - 40) * (1 + empuje * .055);                                                        // el cono: se agranda cuando empuja
      const cono = g.createRadialGradient(x - rc * .25, y - rc * .3, rc * .1, x, y, rc); cono.addColorStop(0, '#3b3d42'); cono.addColorStop(.6, '#1d1e21'); cono.addColorStop(1, '#101113');
      g.fillStyle = cono; g.beginPath(); g.arc(x, y, rc, 0, TAU); g.fill();
      g.strokeStyle = 'rgba(255,255,255,.05)'; g.lineWidth = 2;
      for (let k = .45; k < 1; k += .18) { g.beginPath(); g.arc(x, y, rc * k, 0, TAU); g.stroke(); }
      g.globalAlpha = .1 + empuje * .75; g.strokeStyle = v.color; g.lineWidth = 6 + empuje * 6; g.beginPath(); g.arc(x, y, rc, 0, TAU); g.stroke(); g.globalAlpha = 1; // el borde se prende
      const rt = R * .27 * (1 + empuje * .16);                                                          // tapa del centro
      const tapa = g.createRadialGradient(x - rt * .35, y - rt * .4, 2, x, y, rt); tapa.addColorStop(0, '#5a5d63'); tapa.addColorStop(1, '#17181b');
      g.fillStyle = tapa; g.beginPath(); g.arc(x, y, rt, 0, TAU); g.fill();
      g.globalAlpha = .25 + empuje * .5; g.fillStyle = '#fff'; g.beginPath(); g.ellipse(x - rt * .3, y - rt * .38, rt * .34, rt * .16, -.6, 0, TAU); g.fill(); g.globalAlpha = 1;
    }

    function tweeter(g, x, y, brillo, color) {
      g.fillStyle = '#2b2d31'; g.beginPath(); g.arc(x, y, 46, 0, TAU); g.fill();
      g.fillStyle = '#0c0c0e'; g.beginPath(); g.arc(x, y, 36, 0, TAU); g.fill();
      const domo = g.createRadialGradient(x - 6, y - 8, 2, x, y, 22); domo.addColorStop(0, '#d9dce2'); domo.addColorStop(1, '#4b4e55');
      g.fillStyle = domo; g.beginPath(); g.arc(x, y, 20 + brillo * 3, 0, TAU); g.fill();
      g.globalAlpha = brillo * .9; g.strokeStyle = color; g.lineWidth = 5; g.beginPath(); g.arc(x, y, 36, 0, TAU); g.stroke(); g.globalAlpha = 1;
    }

    gp.visual({
      id: 'parlantes',
      nombre: 'Parlantes',
      detalle: 'Una torre de parlantes contra una pared de ladrillos: los conos empujan con el bombo y los graves, los tweeters brillan con el hi-hat y el ecualizador de luces sigue al sonido. Para rap, trap y todo lo que tenga graves.',
      dibujar(g, v) {
        const m = v.memoria;
        if (!m.ondas) { m.ondas = []; m.antes = 0; m.emp = 0; m.picos = new Float32Array(10); }
        if (v.bombo > .93 && m.antes <= .93) m.ondas.push({ r: 140, y: 452 }, { r: 140, y: 886 });        // un bombo nuevo: salen dos ondas
        m.antes = v.bombo;
        const quiere = Math.min(1, v.bombo * .8 + v.graves * .7); m.emp += (quiere - m.emp) * (quiere > m.emp ? .7 : .22);

        pared(g, v, m);

        // título, bien grande
        g.textAlign = 'center'; g.textBaseline = 'alphabetic';
        g.font = '900 62px ' + GRUESA; g.fillStyle = '#f3efe6'; g.fillText(v.titulo.toUpperCase(), 360, 138, 600);
        g.font = '800 22px system-ui,sans-serif'; g.fillStyle = v.color; g.fillText(v.bpm + ' BPM   ·   TRACK ' + v.track, 360, 182);

        // el bafle (tiembla un poco con el bombo)
        g.save();
        g.translate((Math.random() - .5) * v.bombo * 5, (Math.random() - .5) * v.bombo * 5);
        g.fillStyle = 'rgba(0,0,0,.55)'; caja(g, 96, 246, 560, 860, 26); g.fill();
        const madera = g.createLinearGradient(80, 0, 640, 0); madera.addColorStop(0, '#1b1c1f'); madera.addColorStop(.5, '#25272b'); madera.addColorStop(1, '#17181a');
        g.fillStyle = madera; caja(g, 80, 228, 560, 860, 26); g.fill();
        g.strokeStyle = '#050506'; g.lineWidth = 4; g.stroke();
        g.strokeStyle = 'rgba(255,255,255,.07)'; g.lineWidth = 2; caja(g, 96, 244, 528, 828, 16); g.stroke();
        [[80, 228, 1, 1], [640, 228, -1, 1], [80, 1088, 1, -1], [640, 1088, -1, -1]].forEach(([x, y, sx, sy]) => { // esquineros de metal
          g.fillStyle = '#787c84'; g.beginPath(); g.moveTo(x, y + sy * 26); g.arcTo(x, y, x + sx * 26, y, 26); g.lineTo(x + sx * 58, y); g.lineTo(x, y + sy * 58); g.closePath(); g.fill();
        });

        woofer(g, 360, 452, 168, m.emp, v);
        woofer(g, 360, 886, 168, m.emp * .92, v);
        const hat = Math.max(v.niveles[2], v.niveles[3] * .7);
        tweeter(g, 176, 669, hat, v.color2); tweeter(g, 544, 669, hat, v.color2);

        // ecualizador de luces entre los tweeters: 10 columnas de 6 luces, con un pico que cae despacio
        const b = v.bandas(10);
        for (let i = 0; i < 10; i++) {
          m.picos[i] = Math.max(b[i], m.picos[i] - .025);
          const prend = Math.round(b[i] * 6), pico = Math.min(5, Math.floor(m.picos[i] * 6));
          for (let k = 0; k < 6; k++) {
            g.fillStyle = k >= 5 ? '#ff4b3a' : k >= 4 ? '#ffd95a' : v.color;
            g.globalAlpha = k < prend ? 1 : k === pico && m.picos[i] > .08 ? .8 : .1;
            g.fillRect(250 + i * 22.4, 698 - k * 12.4, 17, 8);
          }
        }
        g.globalAlpha = 1;
        // chapita de la marca
        g.fillStyle = '#787c84'; caja(g, 306, 1046, 108, 24, 5); g.fill();
        g.fillStyle = '#17181a'; g.font = '900 13px system-ui,sans-serif'; g.fillText('GREENPAD', 360, 1063);
        g.restore();

        // una luz por instrumento, abajo
        for (let t = 0; t < 8; t++) { g.globalAlpha = .14 + v.niveles[t] * .86; g.fillStyle = v.colores[t]; g.beginPath(); g.arc(150 + t * 60, 1114, 8, 0, TAU); g.fill(); }
        g.globalAlpha = 1;
      },
    });
  },
});
