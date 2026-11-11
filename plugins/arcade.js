// ARCADE: los sonidos de una consola de 8 bits. Ondas cuadradas, triángulo y ruido, nada más.
GREENPAD.plugin({
  id: 'arcade',
  nombre: 'Arcade',
  autor: 'GREENPAD',
  version: '1.0',
  tipo: 'sonido',
  descripcion: 'Una consola de 8 bits completa: batería de ruido, bajo de triángulo, acordes en arpegio rápido y melodía de onda cuadrada con vibrato.',
  setup(gp) {
    // onda de pulso con el ancho que se pida (12 %, 25 %, 50 %): cada ancho tiene su color
    const ondas = new WeakMap();
    function pulso(ctx, ancho) {
      let m = ondas.get(ctx); if (!m) ondas.set(ctx, m = {});
      if (!m[ancho]) { const n = 48, re = new Float32Array(n), im = new Float32Array(n); for (let i = 1; i < n; i++) re[i] = 2 / (i * Math.PI) * Math.sin(i * Math.PI * ancho); m[ancho] = ctx.createPeriodicWave(re, im); }
      return m[ancho];
    }
    function ruido(ctx, t, dur, vel) { const s = ctx.createBufferSource(); s.buffer = gp.ruido(); s.loop = true; s.playbackRate.value = vel; s.start(t, Math.random() * .5); s.stop(t + dur + .02); return s; }
    function golpe(ctx, t, pico, dur) { const g = ctx.createGain(); g.gain.setValueAtTime(pico, t); g.gain.linearRampToValueAtTime(0, t + dur); return g; } // en 8 bits el volumen baja en línea recta

    gp.instrumento('BD', {
      id: 'bombo', nombre: 'Arcade', detalle: 'Triángulo que cae',
      tocar(ctx, salida, t, fuerza, nota, afin) {
        const o = ctx.createOscillator(), g = golpe(ctx, t, .8 * fuerza, .13); o.type = 'triangle';
        o.frequency.setValueAtTime(220 * afin, t); o.frequency.exponentialRampToValueAtTime(38 * afin, t + .11);
        o.connect(g); g.connect(salida); o.start(t); o.stop(t + .15);
      },
    });
    gp.instrumento('SN', {
      id: 'caja', nombre: 'Arcade', detalle: 'Ruido grueso',
      tocar(ctx, salida, t, fuerza, nota, afin) { const n = ruido(ctx, t, .12, .22 * afin), g = golpe(ctx, t, .42 * fuerza, .12); n.connect(g); g.connect(salida); },
    });
    gp.instrumento('HH', {
      id: 'hat', nombre: 'Arcade', detalle: 'Ruido fino',
      tocar(ctx, salida, t, fuerza, nota, afin) { const n = ruido(ctx, t, .035, .9 * afin), hp = ctx.createBiquadFilter(), g = golpe(ctx, t, .16 * fuerza, .035); hp.type = 'highpass'; hp.frequency.value = 5000; n.connect(hp); hp.connect(g); g.connect(salida); },
    });
    gp.instrumento('PC', {
      id: 'moneda', nombre: 'Moneda', detalle: 'Dos notas que suben',
      tocar(ctx, salida, t, fuerza, nota, afin) {
        const o = ctx.createOscillator(), g = ctx.createGain(); o.setPeriodicWave(pulso(ctx, .5));
        o.frequency.setValueAtTime(988 * afin, t); o.frequency.setValueAtTime(1319 * afin, t + .07);
        g.gain.setValueAtTime(.08 * fuerza, t); g.gain.setValueAtTime(.08 * fuerza, t + .07); g.gain.linearRampToValueAtTime(0, t + .32);
        o.connect(g); g.connect(salida); o.start(t); o.stop(t + .34);
      },
    });
    gp.instrumento('BS', {
      id: 'bajo', nombre: 'Arcade', detalle: 'Onda triángulo',
      tocar(ctx, salida, t, fuerza, nota) {
        const dur = Math.max(.08, nota.dur), o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'triangle'; o.frequency.value = nota.f;
        g.gain.setValueAtTime(.55 * fuerza, t); g.gain.setValueAtTime(.55 * fuerza, t + dur); g.gain.linearRampToValueAtTime(0, t + dur + .015);
        o.connect(g); g.connect(salida); o.start(t); o.stop(t + dur + .03);
      },
    });
    // las consolas no podían tocar acordes: tocaban las notas una atrás de otra tan rápido que parecía uno
    gp.instrumento('CH', {
      id: 'arpegio', nombre: 'Arpegio', detalle: 'El acorde, nota por nota, rapidísimo',
      tocar(ctx, salida, t, fuerza, nota) {
        const dur = Math.max(.16, nota.dur), fs = nota.fs || [nota.f], orden = [fs[0], fs[1] || fs[0], fs[2] || fs[0], fs[0] * 2], cada = .034;
        const o = ctx.createOscillator(), g = ctx.createGain(); o.setPeriodicWave(pulso(ctx, .25));
        for (let i = 0, x = t; x < t + dur; i++, x += cada) o.frequency.setValueAtTime(orden[i % 4], x);
        g.gain.setValueAtTime(.13 * fuerza, t); g.gain.linearRampToValueAtTime(.08 * fuerza, t + dur); g.gain.linearRampToValueAtTime(0, t + dur + .02);
        o.connect(g); g.connect(salida); o.start(t); o.stop(t + dur + .04);
      },
    });
    gp.instrumento('LD', {
      id: 'pulso', nombre: 'Arcade', detalle: 'Onda cuadrada con vibrato',
      tocar(ctx, salida, t, fuerza, nota) {
        const dur = Math.max(.08, nota.dur), o = ctx.createOscillator(), g = ctx.createGain(); o.setPeriodicWave(pulso(ctx, .125)); o.frequency.value = nota.f / 2;
        const vib = ctx.createOscillator(), vg = ctx.createGain(); vib.frequency.value = 6.5; vg.gain.setValueAtTime(0, t); vg.gain.setValueAtTime(nota.f * .006, t + .16); // el vibrato entra de golpe, como en los juegos
        vib.connect(vg); vg.connect(o.frequency);
        g.gain.setValueAtTime(.22 * fuerza, t); g.gain.linearRampToValueAtTime(.15 * fuerza, t + .06); g.gain.setValueAtTime(.15 * fuerza, t + dur); g.gain.linearRampToValueAtTime(0, t + dur + .02);
        o.connect(g); g.connect(salida); [o, vib].forEach(x => { x.start(t); x.stop(t + dur + .04); });
      },
    });
  },
});
