// BOOM BAP: batería polvorienta, bajo redondo, piano eléctrico y silbido, al estilo del hip hop de los 90.
// Todo sintetizado con Web Audio, sin grabaciones.
GREENPAD.plugin({
  id: 'boombap',
  nombre: 'Boom Bap',
  autor: 'GREENPAD',
  version: '1.0',
  tipo: 'sonido',
  descripcion: 'Hip hop de los 90: bombo y caja polvorientos, hi-hat crujiente, scratch, bajo redondo, piano eléctrico y el silbido agudo del G-funk.',
  setup(gp) {
    // ---- ayudas ----
    const curvas = {};
    function saturar(ctx, cuanto) {            // distorsión suave, como una sampleadora vieja
      const ws = ctx.createWaveShaper(), k = cuanto;
      if (!curvas[k]) { const a = new Float32Array(1024); for (let i = 0; i < 1024; i++) { const x = i / 511.5 - 1; a[i] = Math.tanh(x * k) / Math.tanh(k); } curvas[k] = a; }
      ws.curve = curvas[k]; return ws;
    }
    function ruido(ctx, t, dur, vel) {
      const s = ctx.createBufferSource(); s.buffer = gp.ruido(); s.loop = true; s.playbackRate.value = vel || 1;
      s.start(t, Math.random() * .5); s.stop(t + dur + .02); return s;
    }
    function filtro(ctx, tipo, f, q) { const b = ctx.createBiquadFilter(); b.type = tipo; b.frequency.value = f; if (q) b.Q.value = q; return b; }
    function golpe(ctx, t, pico, dur, ataque) { // un volumen que sube de golpe y cae
      const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(pico, t + (ataque || .002));
      g.gain.exponentialRampToValueAtTime(.0005, t + dur); return g;
    }

    // ---- BOMBO: grave y corto, con un clic de palillo ----
    gp.instrumento('BD', {
      id: 'bombo', nombre: 'Boom Bap', detalle: 'Grave, seco y con polvo',
      tocar(ctx, salida, t, fuerza, nota, afin) {
        const sat = saturar(ctx, 2.2), lp = filtro(ctx, 'lowpass', 3200);
        sat.connect(lp); lp.connect(salida);
        const o = ctx.createOscillator(), g = golpe(ctx, t, .95 * fuerza, .34);
        o.frequency.setValueAtTime(150 * afin, t); o.frequency.exponentialRampToValueAtTime(50 * afin, t + .07);
        o.connect(g); g.connect(sat); o.start(t); o.stop(t + .4);
        const n = ruido(ctx, t, .02), nf = filtro(ctx, 'lowpass', 1600), ng = golpe(ctx, t, .35 * fuerza, .018, .001);
        n.connect(nf); nf.connect(ng); ng.connect(sat);
      },
    });

    // ---- CAJA: dos capas de ruido apenas corridas y un cuerpo afinado ----
    gp.instrumento('SN', {
      id: 'caja', nombre: 'Boom Bap', detalle: 'Con crack, de disco viejo',
      tocar(ctx, salida, t, fuerza, nota, afin) {
        const sat = saturar(ctx, 3), lp = filtro(ctx, 'lowpass', 7000);
        sat.connect(lp); lp.connect(salida);
        [[0, .4, 1900, .19], [.011, .26, 3300, .13]].forEach(([dt, vol, f, dur]) => {
          const n = ruido(ctx, t + dt, dur), bp = filtro(ctx, 'bandpass', f * afin, .7), hp = filtro(ctx, 'highpass', 320), g = golpe(ctx, t + dt, vol * fuerza, dur);
          n.connect(bp); bp.connect(hp); hp.connect(g); g.connect(sat);
        });
        const o = ctx.createOscillator(), g = golpe(ctx, t, .34 * fuerza, .1); o.type = 'triangle';
        o.frequency.setValueAtTime(230 * afin, t); o.frequency.exponentialRampToValueAtTime(165 * afin, t + .06);
        o.connect(g); g.connect(sat); o.start(t); o.stop(t + .14);
      },
    });

    // ---- HI-HAT: corto y áspero ----
    gp.instrumento('HH', {
      id: 'hat', nombre: 'Boom Bap', detalle: 'Corto y crujiente',
      tocar(ctx, salida, t, fuerza, nota, afin) {
        const n = ruido(ctx, t, .07, .55), hp = filtro(ctx, 'highpass', 5200 * afin), bp = filtro(ctx, 'peaking', 8200 * afin, 1.5), g = golpe(ctx, t, .2 * fuerza, .055, .001);
        bp.gain.value = 8; n.connect(hp); hp.connect(bp); bp.connect(g); g.connect(salida);
      },
    });

    // ---- PERCU: scratch (ida y vuelta) ----
    gp.instrumento('PC', {
      id: 'scratch', nombre: 'Scratch', detalle: 'Ida y vuelta de púa',
      tocar(ctx, salida, t, fuerza, nota, afin) {
        const n = ctx.createBufferSource(); n.buffer = gp.ruido(); n.loop = true;
        const bp = filtro(ctx, 'bandpass', 900, 5), bp2 = filtro(ctx, 'bandpass', 1800, 3), g = ctx.createGain(), m = ctx.createGain();
        n.connect(bp); n.connect(bp2); bp.connect(m); bp2.connect(m); m.connect(g); g.connect(salida); m.gain.value = 1.6;
        const ida = .075, vuelta = .1;
        // la velocidad del "disco" sube y baja: eso mueve el tono
        [[bp.frequency, 1], [bp2.frequency, 2.1]].forEach(([p, k]) => {
          p.setValueAtTime(500 * k * afin, t); p.exponentialRampToValueAtTime(2300 * k * afin, t + ida * .7); p.exponentialRampToValueAtTime(700 * k * afin, t + ida);
          p.setValueAtTime(1900 * k * afin, t + ida + .012); p.exponentialRampToValueAtTime(380 * k * afin, t + ida + vuelta);
        });
        n.playbackRate.setValueAtTime(.4, t); n.playbackRate.linearRampToValueAtTime(1.6, t + ida * .7); n.playbackRate.setValueAtTime(1.4, t + ida + .012); n.playbackRate.linearRampToValueAtTime(.3, t + ida + vuelta);
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.3 * fuerza, t + .008); g.gain.setValueAtTime(.3 * fuerza, t + ida - .008); g.gain.linearRampToValueAtTime(0, t + ida);
        g.gain.setValueAtTime(0, t + ida + .012); g.gain.linearRampToValueAtTime(.25 * fuerza, t + ida + .02); g.gain.exponentialRampToValueAtTime(.001, t + ida + vuelta + .02);
        n.start(t); n.stop(t + ida + vuelta + .05);
      },
    });

    // ---- BAJO: redondo, casi puro grave ----
    gp.instrumento('BS', {
      id: 'bajo', nombre: 'Boom Bap', detalle: 'Redondo y profundo',
      tocar(ctx, salida, t, fuerza, nota) {
        const dur = Math.max(.12, nota.dur), fin = t + dur + .14;
        const sat = saturar(ctx, 1.6), lp = filtro(ctx, 'lowpass', 900), g = ctx.createGain();
        sat.connect(lp); lp.connect(g); g.connect(salida);
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.5 * fuerza, t + .008); g.gain.setTargetAtTime(.38 * fuerza, t + .02, .12);
        g.gain.setValueAtTime(.38 * fuerza, t + dur); g.gain.linearRampToValueAtTime(0, fin);
        const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g2 = ctx.createGain();
        o.frequency.setValueAtTime(nota.f * 1.5, t); o.frequency.exponentialRampToValueAtTime(nota.f, t + .025); // el dedo que ataca la cuerda
        o2.type = 'triangle'; o2.frequency.value = nota.f * 2; g2.gain.value = .22;
        lp.frequency.setValueAtTime(1400, t); lp.frequency.exponentialRampToValueAtTime(420, t + .25);
        o.connect(sat); o2.connect(g2); g2.connect(sat);
        o.start(t); o2.start(t); o.stop(fin + .02); o2.stop(fin + .02);
      },
    });

    // ---- ACORDES: piano eléctrico (un tono que modula a otro, con un "tic" metálico al atacar) ----
    function tecla(ctx, destino, t, fuerza, f, dur) {
      const fin = t + Math.max(.5, dur + 1.3);
      const port = ctx.createOscillator(), mod = ctx.createOscillator(), cuanto = ctx.createGain(), g = ctx.createGain();
      port.frequency.value = f; mod.frequency.value = f;
      cuanto.gain.setValueAtTime(f * (1.1 + fuerza * 1.6), t); cuanto.gain.exponentialRampToValueAtTime(f * .25, t + .5); // más fuerte, más "ladra"
      mod.connect(cuanto); cuanto.connect(port.frequency);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.095 * fuerza, t + .006);
      g.gain.setTargetAtTime(.052 * fuerza, t + .01, .25); g.gain.setTargetAtTime(0, t + dur, .28);
      port.connect(g); g.connect(destino);
      const tic = ctx.createOscillator(), tg = golpe(ctx, t, .024 * fuerza, .07, .001); tic.frequency.value = Math.min(9000, f * 9.01);
      tic.connect(tg); tg.connect(destino);
      [port, mod, tic].forEach(o => { o.start(t); o.stop(fin); });
    }
    gp.instrumento('CH', {
      id: 'rhodes', nombre: 'Rhodes', detalle: 'Piano eléctrico, cálido',
      tocar(ctx, salida, t, fuerza, nota) {
        // un vaivén lento de volumen, como el trémolo del piano eléctrico
        const trem = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain(), lp = filtro(ctx, 'lowpass', 3600);
        lfo.frequency.value = 4.6; lg.gain.value = .16; lfo.connect(lg); lg.connect(trem.gain);
        trem.connect(lp); lp.connect(salida); lfo.start(t); lfo.stop(t + nota.dur + 2);
        (nota.fs || [nota.f]).forEach((f, i) => tecla(ctx, trem, t + i * .007, fuerza, f, nota.dur));
      },
    });

    // ---- MELODÍA: el silbido agudo del G-funk, que resbala de una nota a la otra ----
    let ultima = 0, cuando = -9;
    gp.instrumento('LD', {
      id: 'silbido', nombre: 'Silbido', detalle: 'Agudo y resbalado, G-funk',
      tocar(ctx, salida, t, fuerza, nota) {
        const dur = Math.max(.1, nota.dur), fin = t + dur + .1;
        const desde = t - cuando < .9 && t >= cuando && ultima ? ultima : nota.f; // si la nota anterior fue recién, resbala desde ahí
        ultima = nota.f; cuando = t;
        const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g2 = ctx.createGain(), lp = filtro(ctx, 'lowpass', Math.min(9000, nota.f * 4)), g = ctx.createGain();
        o.type = 'sine'; o2.type = 'sawtooth'; g2.gain.value = .28;
        [o, o2].forEach(x => { x.frequency.setValueAtTime(desde, t); x.frequency.exponentialRampToValueAtTime(nota.f, t + .07); });
        const vib = ctx.createOscillator(), vg = ctx.createGain(); vib.frequency.value = 5.6;
        vg.gain.setValueAtTime(0, t); vg.gain.linearRampToValueAtTime(nota.f * .012, t + Math.min(dur, .3)); // el vibrato entra de a poco
        vib.connect(vg); vg.connect(o.frequency); vg.connect(o2.frequency);
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.14 * fuerza, t + .02); g.gain.setValueAtTime(.14 * fuerza, t + dur); g.gain.linearRampToValueAtTime(0, fin);
        o.connect(lp); o2.connect(g2); g2.connect(lp); lp.connect(g); g.connect(salida);
        [o, o2, vib].forEach(x => { x.start(t); x.stop(fin + .02); });
      },
    });
  },
});
