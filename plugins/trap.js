// TRAP: bombo corto, clap, redoble de hi-hat, 808 que resbala, cuerdas cortas y campana.
// Todo sintetizado con Web Audio, sin grabaciones.
GREENPAD.plugin({
  id: 'trap',
  nombre: 'Trap',
  autor: 'GREENPAD',
  version: '1.0',
  tipo: 'sonido',
  descripcion: 'Bombo corto, clap, hi-hat que redobla solo, un 808 que resbala de nota en nota, cuerdas cortas y campana oscura.',
  setup(gp) {
    const curvas = {};
    function saturar(ctx, k) {
      const ws = ctx.createWaveShaper();
      if (!curvas[k]) { const a = new Float32Array(1024); for (let i = 0; i < 1024; i++) { const x = i / 511.5 - 1; a[i] = Math.tanh(x * k) / Math.tanh(k); } curvas[k] = a; }
      ws.curve = curvas[k]; return ws;
    }
    function ruido(ctx, t, dur, vel) { const s = ctx.createBufferSource(); s.buffer = gp.ruido(); s.loop = true; s.playbackRate.value = vel || 1; s.start(t, Math.random() * .5); s.stop(t + dur + .02); return s; }
    function filtro(ctx, tipo, f, q) { const b = ctx.createBiquadFilter(); b.type = tipo; b.frequency.value = f; if (q) b.Q.value = q; return b; }
    function golpe(ctx, t, pico, dur, ataque) { const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(pico, t + (ataque || .002)); g.gain.exponentialRampToValueAtTime(.0005, t + dur); return g; }

    // ---- BOMBO: un golpe corto que deja lugar al 808 ----
    gp.instrumento('BD', {
      id: 'bombo', nombre: 'Trap', detalle: 'Corto, pega y se va',
      tocar(ctx, salida, t, fuerza, nota, afin) {
        const o = ctx.createOscillator(), g = golpe(ctx, t, .85 * fuerza, .2, .001), sat = saturar(ctx, 2.5);
        o.frequency.setValueAtTime(210 * afin, t); o.frequency.exponentialRampToValueAtTime(52 * afin, t + .045);
        o.connect(g); g.connect(sat); sat.connect(salida); o.start(t); o.stop(t + .25);
        const n = ruido(ctx, t, .012), hp = filtro(ctx, 'highpass', 2500), ng = golpe(ctx, t, .25 * fuerza, .01, .0005);
        n.connect(hp); hp.connect(ng); ng.connect(salida);
      },
    });

    // ---- CAJA: clap (varias palmas apenas corridas) con una caja debajo ----
    gp.instrumento('SN', {
      id: 'clap', nombre: 'Clap trap', detalle: 'Palmas con caja debajo',
      tocar(ctx, salida, t, fuerza, nota, afin) {
        const bp = filtro(ctx, 'bandpass', 1350 * afin, 1.1), hp = filtro(ctx, 'highpass', 650);
        bp.connect(hp); hp.connect(salida);
        [0, .009, .019, .03].forEach((dt, i) => {
          const ult = i === 3, n = ruido(ctx, t + dt, ult ? .22 : .012), g = golpe(ctx, t + dt, (ult ? .85 : .6) * fuerza, ult ? .2 : .011, .001);
          n.connect(g); g.connect(bp);
        });
        const n2 = ruido(ctx, t, .14), h2 = filtro(ctx, 'highpass', 3800), g2 = golpe(ctx, t, .22 * fuerza, .13); n2.connect(h2); h2.connect(g2); g2.connect(salida);
        const o = ctx.createOscillator(), g = golpe(ctx, t, .3 * fuerza, .08); o.type = 'triangle'; o.frequency.setValueAtTime(240 * afin, t); o.frequency.exponentialRampToValueAtTime(180 * afin, t + .05);
        o.connect(g); g.connect(salida); o.start(t); o.stop(t + .1);
      },
    });

    // ---- HI-HAT ----
    function hat(ctx, salida, t, vol, afin, dur) {
      const n = ruido(ctx, t, dur + .02), hp = filtro(ctx, 'highpass', 7800 * afin), pk = filtro(ctx, 'peaking', 10500 * afin, 2), g = golpe(ctx, t, vol, dur, .001);
      pk.gain.value = 6; n.connect(hp); hp.connect(pk); pk.connect(g); g.connect(salida);
    }
    gp.instrumento('HH', {
      id: 'hat', nombre: 'Trap', detalle: 'Fino y metálico',
      tocar(ctx, salida, t, fuerza, nota, afin) { hat(ctx, salida, t, .17 * fuerza, afin, .04); },
    });
    // enVivo: se arma en cada golpe, porque depende del tempo (info.paso es lo que dura un paso)
    gp.instrumento('HH', {
      id: 'redoble', nombre: 'Redoble x3', detalle: 'Tres golpes en un paso, creciendo', enVivo: true,
      tocar(ctx, salida, t, fuerza, nota, afin, info) { for (let i = 0; i < 3; i++) hat(ctx, salida, t + i * info.paso / 3, (.1 + i * .045) * fuerza, afin, .03); },
    });
    gp.instrumento('HH', {
      id: 'redoble4', nombre: 'Redoble x4', detalle: 'Cuatro golpes en un paso', enVivo: true,
      tocar(ctx, salida, t, fuerza, nota, afin, info) { for (let i = 0; i < 4; i++) hat(ctx, salida, t + i * info.paso / 4, (.19 - i * .03) * fuerza, afin * (1 + i * .03), .025); },
    });

    // ---- BAJO: 808 largo, con distorsión, que resbala desde la nota anterior ----
    let ultima = 0, cuando = -9;
    gp.instrumento('BS', {
      id: '808', nombre: '808 Glide', detalle: 'Largo, sucio y resbala',
      tocar(ctx, salida, t, fuerza, nota) {
        const dur = Math.max(.2, nota.dur), fin = t + dur + .45;
        const pegado = t - cuando < .7 && t >= cuando && ultima && ultima !== nota.f;
        const o = ctx.createOscillator(), pre = ctx.createGain(), sat = saturar(ctx, 4), lp = filtro(ctx, 'lowpass', 2600), g = ctx.createGain();
        if (pegado) { o.frequency.setValueAtTime(ultima, t); o.frequency.exponentialRampToValueAtTime(nota.f, t + .09); }          // resbala
        else { o.frequency.setValueAtTime(nota.f * 2.4, t); o.frequency.exponentialRampToValueAtTime(nota.f, t + .035); }            // o pega como un bombo
        ultima = nota.f; cuando = t;
        pre.gain.value = .55 + fuerza * .35;
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.44 * fuerza, t + .004); g.gain.setValueAtTime(.44 * fuerza, t + dur); g.gain.setTargetAtTime(0, t + dur, .12);
        o.connect(pre); pre.connect(sat); sat.connect(lp); lp.connect(g); g.connect(salida); o.start(t); o.stop(fin + .3);
      },
    });

    // ---- ACORDES: cuerdas cortas, de película de suspenso ----
    gp.instrumento('CH', {
      id: 'cuerdas', nombre: 'Cuerdas', detalle: 'Cortas y oscuras',
      tocar(ctx, salida, t, fuerza, nota) {
        const dur = Math.max(.14, nota.dur), lp = filtro(ctx, 'lowpass', 2600, .8), g = ctx.createGain();
        lp.frequency.setValueAtTime(3400, t); lp.frequency.exponentialRampToValueAtTime(1500, t + dur + .2);
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.05 * fuerza, t + .03); g.gain.setValueAtTime(.05 * fuerza, t + dur); g.gain.setTargetAtTime(0, t + dur, .09);
        lp.connect(g); g.connect(salida);
        (nota.fs || [nota.f]).forEach((f) => [-9, 0, 8].forEach((des, i) => {
          const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f * (i === 1 ? .5 : 1); o.detune.value = des; // tres violines por nota, uno una octava abajo
          o.connect(lp); o.start(t); o.stop(t + dur + .7);
        }));
      },
    });

    // ---- MELODÍA: campana oscura ----
    gp.instrumento('LD', {
      id: 'campana', nombre: 'Campana', detalle: 'Metálica y oscura',
      tocar(ctx, salida, t, fuerza, nota) {
        const f = nota.f / 2, fin = t + 1.6;
        const port = ctx.createOscillator(), mod = ctx.createOscillator(), cuanto = ctx.createGain(), g = golpe(ctx, t, .16 * fuerza, 1.5, .002);
        port.frequency.value = f; mod.frequency.value = f * 3.51;   // una proporción que no es entera: por eso suena a metal
        cuanto.gain.setValueAtTime(f * 3.2, t); cuanto.gain.exponentialRampToValueAtTime(f * .3, t + .6);
        mod.connect(cuanto); cuanto.connect(port.frequency); port.connect(g); g.connect(salida);
        const sub = ctx.createOscillator(), sg = golpe(ctx, t, .06 * fuerza, .9, .004); sub.frequency.value = f; sub.connect(sg); sg.connect(salida);
        [port, mod, sub].forEach(o => { o.start(t); o.stop(fin); });
      },
    });
  },
});
