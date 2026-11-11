// Plugin de ejemplo (tipo: visual). Suma un estilo de video: barras que suben con el sonido.
GREENPAD.plugin({
  id: 'barras',
  nombre: 'Barras',
  autor: 'GREENPAD',
  version: '1.0',
  tipo: 'visual',
  descripcion: 'Un estilo de video simple: barras que suben con el sonido y un círculo que late con el bombo.',
  setup(gp) {
    gp.visual({
      id: 'barras',
      nombre: 'Barras',
      detalle: 'Barras que suben con el sonido, del grave al agudo, y un círculo que late con el bombo.',
      // g es el contexto 2D del canvas (siempre 720 × 1280). v trae todo lo que pasa en la música en ese cuadro.
      dibujar(g, v) {
        const { W, H } = v;
        g.fillStyle = '#060b08'; g.fillRect(0, 0, W, H);

        // barras: v.bandas(n) devuelve n valores de 0 a 1, de graves a agudos
        const n = 24, b = v.bandas(n), ancho = (W - 120) / n;
        for (let i = 0; i < n; i++) {
          const alto = 30 + b[i] * 470, x = 60 + i * ancho;
          g.fillStyle = i % 2 ? v.color : v.color2;
          g.globalAlpha = .35 + b[i] * .65;
          g.fillRect(x + 3, H * .78 - alto, ancho - 6, alto);
        }
        g.globalAlpha = 1;

        // círculo que late con el bombo (v.bombo va de 0 a 1 y se apaga solo)
        g.beginPath(); g.arc(W / 2, H * .3, 90 + v.bombo * 60, 0, Math.PI * 2);
        g.fillStyle = v.color; g.fill();

        // una luz por instrumento: v.niveles[0..7] se prende en 1 cuando suena y se va apagando
        for (let t = 0; t < 8; t++) {
          g.globalAlpha = .15 + v.niveles[t] * .85;
          g.fillStyle = v.colores[t];
          g.fillRect(60 + t * ((W - 120) / 8) + 6, H * .82, (W - 120) / 8 - 12, 14);
        }
        g.globalAlpha = 1;

        // título y tempo, arriba (abajo va el logo de GREENPAD, que se dibuja solo)
        g.fillStyle = '#e8f3ec'; g.textAlign = 'center';
        g.font = '700 44px system-ui, sans-serif'; g.fillText(v.titulo, W / 2, H * .1, W - 120);
        g.font = '600 26px system-ui, sans-serif'; g.globalAlpha = .6; g.fillText(v.bpm + ' BPM', W / 2, H * .135);
        g.globalAlpha = 1;
      },
    });
  },
});
