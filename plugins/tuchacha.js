// TU CHA CHA: funk brasileño. El "tum" grave, el "cha" seco, atabaques, agogô, el grave que arrastra,
// el golpe de orquesta y el puntito agudo. Trae los ritmos armados en Ejemplos.
GREENPAD.plugin({
  id: 'tuchacha',
  nombre: 'Tu Cha Cha',
  autor: 'GREENPAD',
  version: '1.0',
  tipo: 'sonido',
  descripcion: 'Funk brasileño: tum, cha, atabaques, agogô, lata, grave distorsionado, golpe de orquesta y puntito. Con los ritmos tum cha cha ya armados en Ejemplos.',
  setup(gp) {
    function filtro(ctx, tipo, f, q) { const b = ctx.createBiquadFilter(); b.type = tipo; b.frequency.value = f; if (q) b.Q.value = q; return b; }
    function ruido(ctx, t, dur, vel) { const s = ctx.createBufferSource(); s.buffer = gp.ruido(); s.loop = true; s.playbackRate.value = vel || 1; s.start(t, Math.random() * .5); s.stop(t + dur + .02); return s; }
    function golpe(ctx, t, pico, dur, ataque) { const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(pico, t + (ataque || .002)); g.gain.exponentialRampToValueAtTime(.0005, t + dur); return g; }

    // ---- TUM: bombo gordo, con clic y un poco de distorsión ----
    gp.instrumento('BD', {
      id: 'tum', nombre: 'Tum', detalle: 'Gordo y con golpe, funk',
      tocar(ctx, salida, t, fuerza, nota, afin) {
        const o = ctx.createOscillator(), g = golpe(ctx, t, .95 * fuerza, .3, .001), ds = gp.distorsion(ctx, 3);
        o.frequency.setValueAtTime(190 * afin, t); o.frequency.exponentialRampToValueAtTime(56 * afin, t + .06);
        o.connect(g); g.connect(ds); ds.connect(salida); o.start(t); o.stop(t + .36);
        const n = ruido(ctx, t, .02), bp = filtro(ctx, 'bandpass', 3200, 1), ng = golpe(ctx, t, .3 * fuerza, .016, .0005);
        n.connect(bp); bp.connect(ng); ng.connect(salida);
      },
    });

    // ---- CHA: palmas de verdad más un latigazo de ruido ----
    gp.instrumento('SN', {
      id: 'cha', nombre: 'Cha', detalle: 'Seco y brillante', usa: ['pc_palmas'],
      tocar(ctx, salida, t, fuerza, nota, afin) {
        gp.golpe(ctx, salida, t, fuerza, 'pc_palmas', { volumen: .8, velocidad: 1.18 * afin });
        const n = ruido(ctx, t, .11), hp = filtro(ctx, 'highpass', 1900 * afin), pk = filtro(ctx, 'peaking', 4200 * afin, 1.2), g = golpe(ctx, t, .42 * fuerza, .1, .001);
        pk.gain.value = 7; n.connect(hp); hp.connect(pk); pk.connect(g); g.connect(salida);
      },
    });
    gp.instrumento('SN', {
      id: 'tcha', nombre: 'Tcha doble', detalle: 'Dos cha pegados', usa: ['pc_palmas'], enVivo: true,
      tocar(ctx, salida, t, fuerza, nota, afin, info) {
        [0, info.paso / 2].forEach((dt, i) => {
          gp.golpe(ctx, salida, t + dt, fuerza * (i ? 1 : .7), 'pc_palmas', { volumen: .7, velocidad: (i ? 1.18 : 1.3) * afin });
          const n = ruido(ctx, t + dt, .08), hp = filtro(ctx, 'highpass', 2200 * afin), g = golpe(ctx, t + dt, (i ? .36 : .22) * fuerza, .07, .001);
          n.connect(hp); hp.connect(g); g.connect(salida);
        });
      },
    });

    // ---- HI-HAT: chocalho (el sacudidor) ----
    gp.instrumento('HH', {
      id: 'chocalho', nombre: 'Chocalho', detalle: 'Sacudidor rápido', usa: ['pc_shaker'],
      tocar(ctx, salida, t, fuerza, nota, afin) {
        if (gp.golpe(ctx, salida, t, fuerza, 'pc_shaker', { volumen: .36, velocidad: 1.25 * afin })) return;
        const n = ruido(ctx, t, .05), hp = filtro(ctx, 'highpass', 6000), g = golpe(ctx, t, .2 * fuerza, .045, .004); n.connect(hp); hp.connect(g); g.connect(salida);
      },
    });

    // ---- PERCU: los tambores del tamborzão ----
    gp.instrumento('PC', {
      id: 'atabaque', nombre: 'Atabaque', detalle: 'Tambor de mano, grave', usa: ['pc_conga'],
      tocar(ctx, salida, t, fuerza, nota, afin) { gp.golpe(ctx, salida, t, fuerza, 'pc_conga', { volumen: .6, velocidad: .74 * afin }); },
    });
    gp.instrumento('PC', {
      id: 'atabaque-agudo', nombre: 'Atabaque agudo', detalle: 'El que contesta', usa: ['pc_bongo'],
      tocar(ctx, salida, t, fuerza, nota, afin) { gp.golpe(ctx, salida, t, fuerza, 'pc_bongo', { volumen: .6, velocidad: 1.12 * afin }); },
    });
    gp.instrumento('PC', {
      id: 'agogo', nombre: 'Agogô', detalle: 'Dos campanas, grave y aguda', usa: ['pc_cowbell'], enVivo: true,
      tocar(ctx, salida, t, fuerza, nota, afin, info) {
        const aguda = Math.round(t / info.paso) % 4 >= 2;                         // va alternando: dos pasos la grave, dos la aguda
        gp.golpe(ctx, salida, t, fuerza, 'pc_cowbell', { volumen: .55, velocidad: (aguda ? 1.9 : 1.42) * afin });
      },
    });
    gp.instrumento('PC', {
      id: 'lata', nombre: 'Lata', detalle: 'Golpe metálico, de tarro',
      tocar(ctx, salida, t, fuerza, nota, afin) {
        [412, 587, 833, 1190].forEach((f, i) => {                                  // varios tonos que no combinan entre sí: por eso suena a chapa
          const o = ctx.createOscillator(), g = golpe(ctx, t, (.14 - i * .02) * fuerza, .13 - i * .02, .001); o.type = 'square'; o.frequency.value = f * afin;
          o.connect(g); g.connect(salida); o.start(t); o.stop(t + .16);
        });
      },
    });

    // ---- BAJO: el grave que arrastra, con distorsión ----
    gp.instrumento('BS', {
      id: 'grave', nombre: 'Grave funk', detalle: 'Sub distorsionado que arrastra',
      tocar(ctx, salida, t, fuerza, nota) {
        const dur = Math.max(.16, nota.dur), fin = t + dur + .25;
        const o = ctx.createOscillator(), pre = ctx.createGain(), ds = gp.distorsion(ctx, 7), lp = filtro(ctx, 'lowpass', 1900), g = ctx.createGain();
        o.frequency.setValueAtTime(nota.f * 2.2, t); o.frequency.exponentialRampToValueAtTime(nota.f, t + .04);
        o.frequency.setValueAtTime(nota.f, t + dur * .6); o.frequency.exponentialRampToValueAtTime(nota.f * .86, t + dur + .2); // al final se cae un poco
        pre.gain.value = .7 + fuerza * .3;
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.27 * fuerza, t + .004); g.gain.setValueAtTime(.27 * fuerza, t + dur); g.gain.setTargetAtTime(0, t + dur, .07);
        o.connect(pre); pre.connect(ds); ds.connect(lp); lp.connect(g); g.connect(salida); o.start(t); o.stop(fin + .2);
      },
    });

    // ---- ACORDES: el golpe de orquesta ----
    gp.instrumento('CH', {
      id: 'orquesta', nombre: 'Golpe de orquesta', detalle: 'Toda la orquesta de un golpe',
      tocar(ctx, salida, t, fuerza, nota) {
        const lp = filtro(ctx, 'lowpass', 5200, .7), g = ctx.createGain();
        lp.frequency.setValueAtTime(6200, t); lp.frequency.exponentialRampToValueAtTime(900, t + .38);
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.09 * fuerza, t + .006); g.gain.exponentialRampToValueAtTime(.0006, t + .45);
        lp.connect(g); g.connect(salida);
        (nota.fs || [nota.f]).forEach((f) => [.5, 1, 2].forEach((oct) => [-14, 11].forEach((des) => {       // cada nota en tres octavas, y cada una doblada
          const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f * oct; o.detune.value = des; o.connect(lp); o.start(t); o.stop(t + .5);
        })));
        const n = ruido(ctx, t, .05), ng = golpe(ctx, t, .05 * fuerza, .045, .001); n.connect(ng); ng.connect(salida);   // el arco que raspa
      },
    });

    // ---- MELODÍA: el puntito ----
    gp.instrumento('LD', {
      id: 'puntito', nombre: 'Puntito', detalle: 'Agudo, corto y nasal',
      tocar(ctx, salida, t, fuerza, nota) {
        const o = ctx.createOscillator(), bp = filtro(ctx, 'bandpass', Math.min(6000, nota.f * 2), 2.2), g = golpe(ctx, t, .62 * fuerza, .16, .002);
        o.type = 'square'; o.frequency.setValueAtTime(nota.f * 1.06, t); o.frequency.exponentialRampToValueAtTime(nota.f, t + .02);
        o.connect(bp); bp.connect(g); g.connect(salida); o.start(t); o.stop(t + .2);
      },
    });
    gp.instrumento('LD', {
      id: 'flautin', nombre: 'Flautín', detalle: 'Silbido que sube a la nota',
      tocar(ctx, salida, t, fuerza, nota) {
        const dur = Math.max(.1, nota.dur), o = ctx.createOscillator(), g = ctx.createGain(), n = ruido(ctx, t, dur + .1), nb = filtro(ctx, 'bandpass', nota.f, 6), ng = ctx.createGain();
        o.type = 'triangle'; o.frequency.setValueAtTime(nota.f * .9, t); o.frequency.exponentialRampToValueAtTime(nota.f, t + .05);
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.16 * fuerza, t + .025); g.gain.setValueAtTime(.16 * fuerza, t + dur); g.gain.linearRampToValueAtTime(0, t + dur + .06);
        ng.gain.value = .5; o.connect(g); n.connect(nb); nb.connect(ng); ng.connect(g); g.connect(salida); o.start(t); o.stop(t + dur + .1);  // un poco de aire
      },
    });

    // ================= EJEMPLOS =================
    gp.ejemplo({ nombre: 'Tu cha cha', detalle: 'Tum cha cha, tum cha cha', bpm: 130, notaBase: 'La', ambiente: 'Oscuro',
      estilos: { BD: 'Tum', SN: 'Cha', HH: 'Chocalho', PC: 'Atabaque+Atabaque agudo', BS: 'Grave funk', CH: 'Golpe de orquesta', LD: 'Puntito' },
      ritmo: { BD: 'x.......x.......', SN: '...x..x....x..x.', HH: 'x.x.x.x.x.x.x.x.', PC: '......x......xx.', BS: '1.......1.....3.', CH: '1...............', LD: '5.5.8.5...4.5...' } });
    gp.ejemplo({ nombre: 'Tamborzão', detalle: 'El de siempre, con atabaques', bpm: 130, notaBase: 'Re', ambiente: 'Oscuro',
      estilos: { BD: 'Tum', SN: 'Cha', HH: 'Chocalho', PC: 'Atabaque', BS: 'Grave funk', LD: 'Flautín' },
      ritmo: { BD: 'x.....x...x.....', SN: '...x..x....x..x.', HH: 'xxxxxxxxxxxxxxxx', PC: 'x..x...xx.x..x.x', BS: '1.....1...1.....', LD: '8...5...6.5.3...' } });
    gp.ejemplo({ nombre: 'Agogô', detalle: 'Campanas y tcha doble', bpm: 132, notaBase: 'Mi', ambiente: 'Groove',
      estilos: { BD: 'Tum', SN: 'Tcha doble', HH: 'Chocalho', PC: 'Agogô', BS: 'Grave funk', LD: 'Puntito' },
      ritmo: { BD: 'x.......x..x....', SN: '...x..x....x..x.', HH: 'x.x.x.x.x.x.x.x.', PC: 'x.x.xx.x.x.xx.x.', BS: '1.......1..1....', LD: '....5.....8.5...' } });
    gp.ejemplo({ nombre: 'Mandelão', detalle: 'Pesado, con lata', bpm: 128, notaBase: 'Fa', ambiente: 'Oscuro', efectos: { reverb: .1 },
      estilos: { BD: 'Tum', SN: 'Cha', PC: 'Lata', BS: 'Grave funk', CH: 'Golpe de orquesta' },
      ritmo: { BD: 'x..x..x.x..x..x.', SN: '....x.......x...', PC: '..x...x...x.x.x.', BS: '1..1..1.1..1..3.', CH: '1.......4.......' } });
    gp.ejemplo({ nombre: 'Funk 150', detalle: 'Rápido, para bailar', bpm: 150, notaBase: 'Sol', ambiente: 'Triste',
      estilos: { BD: 'Tum', SN: 'Cha', HH: 'Chocalho', PC: 'Atabaque agudo', BS: 'Grave funk', LD: 'Flautín' },
      ritmo: { BD: 'x..x..x...x..x..', SN: '....x.......x..x', HH: 'x.x.x.x.x.x.x.x.', PC: '.x...x...x...x..', BS: '1..1..1...1..1..', LD: '5...6...5.3.1...' } });
  },
});
