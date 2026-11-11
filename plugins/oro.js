// VINILO DE ORO: cambia la pinta de las bandejas, solo con CSS.
GREENPAD.plugin({
  id: 'oro',
  nombre: 'Vinilo de oro',
  autor: 'GREENPAD',
  version: '1.0',
  tipo: 'bandeja',
  descripcion: 'Otra pinta para las bandejas: etiquetas, luces y bordes dorados.',
  setup(gp) {
    gp.estilo(`
      #dj .lab{background:radial-gradient(circle at 35% 28%,#fff6c2 0,#edbd3f 36%,#a8770f 76%,#6b4a06 100%);color:#2a1c00;box-shadow:inset 0 0 0 4px rgba(0,0,0,.18),0 0 0 3px #caa02c}
      #dj .lab i{background:#2a1c00}
      #dj .plat .base{box-shadow:0 12px 34px rgba(0,0,0,.45),inset 0 0 0 3px #b48a22}
      #dj .led.n{background:#6b5a22}
      #dj .led.on{background:#ffd95a;box-shadow:0 0 10px #ffd95a}
      #dj .sheen{background:conic-gradient(from 20deg,transparent 0deg,rgba(255,220,120,.18) 40deg,transparent 80deg,transparent 200deg,rgba(255,220,120,.13) 240deg,transparent 280deg)}
      #dj .dn b{color:#edbd3f}
    `);
  },
});
