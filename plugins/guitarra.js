// GUITARRA: las guitarras grabadas de GREENPAD pasadas por pedales y amplificadores.
// Suma estilos a GUITARRA, a ACORDES y a MELODÍA, pensados para usarse juntos (base + solo), y ejemplos listos.
GREENPAD.plugin({
  id: 'guitarra',
  nombre: 'Guitarra',
  autor: 'GREENPAD',
  version: '1.0',
  tipo: 'sonido',
  descripcion: 'Guitarras de verdad con pedales: crunch, metal, wah, chorus, trémolo, arpegio, 12 cuerdas, rasgueo eléctrico y solo con vibrato. Trae ejemplos que las combinan.',
  setup(gp) {
    function filtro(ctx, tipo, f, q, gan) { const b = ctx.createBiquadFilter(); b.type = tipo; b.frequency.value = f; if (q) b.Q.value = q; if (gan) b.gain.value = gan; return b; }
    function cadena(...nodos) { for (let i = 0; i < nodos.length - 1; i++) nodos[i].connect(nodos[i + 1]); return nodos[0]; }
    // si la grabación todavía no llegó, una cuerda sintetizada para no dejar el hueco
    function reserva(ctx, destino, t, fuerza, f, dur) {
      const o = ctx.createOscillator(), g = ctx.createGain(), lp = filtro(ctx, 'lowpass', 2400); o.type = 'sawtooth'; o.frequency.value = f;
      g.gain.setValueAtTime(.2 * fuerza, t); g.gain.exponentialRampToValueAtTime(.001, t + dur + .5);
      cadena(o, lp, g, destino); o.start(t); o.stop(t + dur + .55);
    }
    function cuerda(ctx, destino, t, fuerza, clave, f, dur, op) { if (!gp.nota(ctx, destino, t, fuerza, clave, f, dur, op)) reserva(ctx, destino, t, fuerza * ((op && op.volumen) || 1), f, dur); }
    // amplificador: entrada fuerte, distorsión, un empujón de medios y el parlante (que corta los agudos)
    function ampli(ctx, salida, t, fin, { entrada, dist, medios, gMedios, parlante, volumen, graves }) {
      const pre = ctx.createGain(), hp = filtro(ctx, 'highpass', graves || 95), ds = gp.distorsion(ctx, dist), mid = filtro(ctx, 'peaking', medios, .8, gMedios), cab = filtro(ctx, 'lowpass', parlante, .8), vol = ctx.createGain();
      pre.gain.value = entrada; vol.gain.setValueAtTime(volumen, t); vol.gain.setValueAtTime(volumen, fin); vol.gain.setTargetAtTime(0, fin, .03);
      cadena(pre, hp, ds, mid, cab, vol, salida);
      return pre;
    }
    // chorus: dos copias atrasadas que se mueven despacio. Ensancha y endulza
    function chorus(ctx, salida, t, fin) {
      const ent = ctx.createGain(); ent.connect(salida);
      [[.013, .7], [.021, 1.1]].forEach(([base, vel]) => {
        const d = ctx.createDelay(.06), g = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain();
        d.delayTime.value = base; lfo.frequency.value = vel; lg.gain.value = .0028; g.gain.value = .55;
        lfo.connect(lg); lg.connect(d.delayTime); cadena(ent, d, g, salida); lfo.start(t); lfo.stop(fin);
      });
      return ent;
    }
    const acorde5 = (f) => [f, f * 1.4983, f * 2];                 // quinta: la nota, su quinta y la octava
    // el acorde armado como en las 6 cuerdas (de grave a agudo)
    function seisCuerdas(fs) {
      let k = 1; while (fs[0] * k > 200) k /= 2; while (fs[0] * k < 98) k *= 2;
      const r = fs[0] * k, te = fs[1] * k, qu = fs[2] * k;
      return [r / 2, r * .75, r, te, qu, r * 2].filter(f => f >= 80 && f <= 720).sort((a, b) => a - b);
    }

    // ================= GUITARRA =================
    gp.instrumento('GT', {
      id: 'crunch', nombre: 'Crunch', detalle: 'Quintas con ampli valvular, rock', usa: ['gt_electrica'],
      tocar(ctx, salida, t, fuerza, nota) {
        const dur = Math.max(.14, nota.dur + .05), amp = ampli(ctx, salida, t, t + dur, { entrada: 2.3, dist: 5, medios: 1200, gMedios: 5, parlante: 4600, volumen: .11 * Math.min(1.15, fuerza) });
        acorde5(nota.f).forEach((f, i) => cuerda(ctx, amp, t + i * .007, i ? .75 : 1, 'gt_electrica', f, dur + .3, { volumen: .5, cola: .4, brillo: 0 }));
      },
    });
    gp.instrumento('GT', {
      id: 'metal', nombre: 'Metal', detalle: 'Grave, apagada con la palma', usa: ['gt_muteada', 'gt_electrica'],
      tocar(ctx, salida, t, fuerza, nota) {
        const f = nota.f / 2, dur = Math.min(.2, Math.max(.09, nota.dur));
        const amp = ampli(ctx, salida, t, t + dur, { entrada: 5, dist: 24, medios: 750, gMedios: -5, parlante: 5200, volumen: .13 * Math.min(1.15, fuerza), graves: 70 });
        [f, f * 1.4983].forEach((x, i) => cuerda(ctx, amp, t + i * .004, 1, 'gt_muteada', x, dur + .1, { volumen: .7, cola: .1, brillo: 0 }));
      },
    });
    gp.instrumento('GT', {
      id: 'wah', nombre: 'Wah', detalle: 'Acorde corto con pedal wah, funk', usa: ['gt_electrica'],
      tocar(ctx, salida, t, fuerza, nota, afin, info) {
        const sube = Math.round(t * info.bpm / 15) % 2 === 1;                    // un paso para abajo, el siguiente para arriba
        const wah = filtro(ctx, 'bandpass', 600, 3.2), g = ctx.createGain(), seco = ctx.createGain(), dur = Math.min(.16, Math.max(.07, nota.dur));
        wah.frequency.setValueAtTime(sube ? 1900 : 520, t); wah.frequency.exponentialRampToValueAtTime(sube ? 620 : 2300, t + .13); // el pie que abre o cierra el pedal
        g.gain.value = 1.6; seco.gain.value = .2;
        cadena(wah, g, salida); seco.connect(salida);
        const notas = seisCuerdas(nota.fs || acorde5(nota.f)).slice(2), orden = sube ? notas.slice().reverse() : notas;
        orden.forEach((f, i) => { cuerda(ctx, wah, t + i * .008, fuerza * (sube ? .8 : 1), 'gt_electrica', f, dur, { volumen: .34, cola: 0, max: dur }); cuerda(ctx, seco, t + i * .008, fuerza, 'gt_electrica', f, dur, { volumen: .34, cola: 0, max: dur }); });
      },
    });
    gp.instrumento('GT', {
      id: 'chorus', nombre: 'Chorus', detalle: 'Limpia y ancha, ochentosa', usa: ['gt_electrica'],
      tocar(ctx, salida, t, fuerza, nota) { cuerda(ctx, chorus(ctx, salida, t, t + nota.dur + 2.5), t, fuerza, 'gt_electrica', nota.f, nota.dur, { volumen: .36, cola: .5 }); },
    });
    gp.instrumento('GT', {
      id: 'tremolo', nombre: 'Trémolo', detalle: 'Limpia que tiembla, con eco corto. Surf', usa: ['gt_electrica'],
      tocar(ctx, salida, t, fuerza, nota) {
        const fin = t + nota.dur + 2, tr = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain(), eco = ctx.createDelay(.3), eg = ctx.createGain();
        tr.gain.value = .65; lfo.frequency.value = 6.4; lg.gain.value = .35; lfo.connect(lg); lg.connect(tr.gain); lfo.start(t); lfo.stop(fin);
        eco.delayTime.value = .115; eg.gain.value = .38; tr.connect(salida); cadena(tr, eco, eg, salida);            // un solo rebote, como en los amplis viejos
        cuerda(ctx, tr, t, fuerza, 'gt_electrica', nota.f, nota.dur, { volumen: .5, cola: .6, brillo: 9000 });
      },
    });
    gp.instrumento('GT', {
      id: 'arpegio', nombre: 'Arpegio', detalle: 'El acorde nota por nota. Una nota por tiempo', usa: ['gt_acustica'],
      tocar(ctx, salida, t, fuerza, nota, afin, info) {
        const fs = nota.fs || acorde5(nota.f), orden = [fs[0], fs[2], fs[0] * 2, fs[1] * 2];                       // tónica, quinta, octava y tercera arriba
        orden.forEach((f, i) => cuerda(ctx, salida, t + i * info.paso, fuerza * (i ? .82 : 1), 'gt_acustica', f, info.paso * (4 - i), { volumen: .55, cola: .7 }));
      },
    });
    gp.instrumento('GT', {
      id: 'doce', nombre: '12 cuerdas', detalle: 'Cada nota con su octava. Brilla', usa: ['gt_acustica'],
      tocar(ctx, salida, t, fuerza, nota) {
        cuerda(ctx, salida, t, fuerza, 'gt_acustica', nota.f, nota.dur, { volumen: .5, cola: .6 });
        cuerda(ctx, salida, t + .011, fuerza * .8, 'gt_acustica', nota.f * 2, nota.dur, { volumen: .36, cola: .6, desafinar: 22 });
      },
    });

    // ================= ACORDES =================
    gp.instrumento('CH', {
      id: 'rasgueo', nombre: 'Rasgueo eléctrico', detalle: 'Acorde entero, limpio con chorus', usa: ['gt_electrica'],
      tocar(ctx, salida, t, fuerza, nota, afin, info) {
        const sube = Math.round(t * info.bpm / 15) % 2 === 1, ch = chorus(ctx, salida, t, t + nota.dur + 2.5);
        const notas = seisCuerdas(nota.fs || acorde5(nota.f)), orden = sube ? notas.slice(2).reverse() : notas, paso = sube ? .009 : .014;
        orden.forEach((f, i) => cuerda(ctx, ch, t + i * paso, fuerza * (sube ? .78 : 1) * (1 - i * .03), 'gt_electrica', f, Math.max(.1, nota.dur - i * paso), { volumen: .15, cola: .35 }));
      },
    });
    gp.instrumento('CH', {
      id: 'pared', nombre: 'Pared', detalle: 'Acordes con distorsión, sostenidos', usa: ['gt_electrica'],
      tocar(ctx, salida, t, fuerza, nota) {
        const dur = Math.max(.2, nota.dur + .1), amp = ampli(ctx, salida, t, t + dur, { entrada: 3, dist: 9, medios: 950, gMedios: 4, parlante: 3800, volumen: .075 * Math.min(1.15, fuerza) });
        let f = nota.f; while (f > 180) f /= 2;
        acorde5(f).forEach((x, i) => cuerda(ctx, amp, t + i * .006, 1, 'gt_electrica', x, dur + .4, { volumen: .5, cola: .5, brillo: 0 }));
      },
    });

    // ================= MELODÍA =================
    gp.instrumento('LD', {
      id: 'solo', nombre: 'Solo', detalle: 'Distorsión, vibrato y eco', usa: ['gt_electrica'],
      tocar(ctx, salida, t, fuerza, nota, afin, info) {
        const f = nota.f / 2, dur = Math.max(.12, nota.dur + .06), fin = t + dur;
        // lo que sale del ampli va directo y también a un eco que repite a tiempo (cada tres pasos)
        const mez = ctx.createGain(), eco = ctx.createDelay(1), el = filtro(ctx, 'lowpass', 2600), eg = ctx.createGain();
        eco.delayTime.value = Math.min(.9, info.paso * 3); eg.gain.value = .26;
        mez.connect(salida); cadena(mez, eco, el, eg, salida);
        const amp = ampli(ctx, mez, t, fin, { entrada: 6, dist: 16, medios: 1500, gMedios: 6, parlante: 4800, volumen: .1 * Math.min(1.15, fuerza), graves: 180 });
        const g = gp.grabado('gt_electrica', f);
        if (!g) { reserva(ctx, amp, t, 1, f, dur); return; }
        // acá se arma la cuerda a mano (en vez de gp.nota) para poder moverle la afinación: eso es el vibrato
        const s = ctx.createBufferSource(), vib = ctx.createOscillator(), vg = ctx.createGain(), sg = ctx.createGain();
        s.buffer = g.buffer; s.playbackRate.value = g.velocidad;
        vib.frequency.value = 5.6; vg.gain.setValueAtTime(0, t + .12); vg.gain.linearRampToValueAtTime(26, t + .12 + Math.min(.25, dur)); // en centésimas de tono; entra cuando la nota ya está sonando
        vib.connect(vg); vg.connect(s.detune);
        sg.gain.setValueAtTime(0, t); sg.gain.linearRampToValueAtTime(.9, t + .004);
        cadena(s, sg, amp);
        s.start(t); s.stop(fin + .15); vib.start(t); vib.stop(fin + .15);
      },
    });

    // ================= EJEMPLOS: combinaciones que funcionan =================
    gp.ejemplo({ nombre: 'Rock de estadio', detalle: 'Crunch y solo', bpm: 126, notaBase: 'Mi', ambiente: 'Triste', efectos: { reverb: .14 },
      estilos: { GT: 'Crunch', LD: 'Solo', PC: 'Crash' },
      ritmo: { BD: 'x.....x.x.......', SN: '....x.......x...', HH: 'x.x.x.x.x.x.x.x.', PC: 'x...............', BS: '1.1.1.1.6.6.7.7.', GT: '1..1..1.6..6..7.', LD: '5...8.7.5...3...' } });
    gp.ejemplo({ nombre: 'Balada eléctrica', detalle: 'Arpegio y rasgueo', bpm: 74, notaBase: 'Do', ambiente: 'Pop', efectos: { reverb: .3 },
      estilos: { BD: 'Acústico', SN: 'Aro', HH: 'Acústico', GT: 'Arpegio', CH: 'Rasgueo eléctrico', LD: 'Solo' },
      ritmo: { BD: 'x.......x.......', SN: '....x.......x...', HH: 'x.x.x.x.x.x.x.x.', BS: '1.......6.......', GT: '1...1...6...6...', CH: '1.......6.......', LD: '........3...2...' } });
    gp.ejemplo({ nombre: 'Funk con wah', detalle: 'Wah y bajo', bpm: 104, notaBase: 'Mi', ambiente: 'Groove', efectos: { reverb: .08 },
      estilos: { GT: 'Wah', LD: 'Trompeta' },
      ritmo: { BD: 'x..x......x..x..', SN: '....x..x....x...', HH: 'xxxxxxxxxxxxxxxx', BS: '1.1..8.1..4..5.3', GT: '.11.1.11.11.1.1.', LD: '........5.6.5...' } });
    gp.ejemplo({ nombre: 'Riff metalero', detalle: 'Palma, pared y solo', bpm: 152, notaBase: 'Mi', ambiente: 'Oscuro', efectos: { reverb: .1 },
      estilos: { GT: 'Metal', CH: 'Pared', LD: 'Solo', PC: 'Crash' },
      ritmo: { BD: 'x.x.x.xxx.x.x.xx', SN: '....x.......x...', HH: 'x.x.x.x.x.x.x.x.', PC: 'x...............', BS: '1.1.1.1.1.1.3.4.', GT: '11.11.1111.11.34', CH: '1.......1...3.4.', LD: '8.....7.5...3...' } });
    gp.ejemplo({ nombre: 'Surf', detalle: 'Trémolo y 12 cuerdas', bpm: 158, notaBase: 'La', ambiente: 'Triste', efectos: { reverb: .32 },
      estilos: { HH: 'Ride', GT: 'Trémolo+12 cuerdas', BD: 'Acústico', SN: 'Acústico' },
      ritmo: { BD: 'x.....x.x.....x.', SN: '....x.x.....x...', HH: 'x.x.x.x.x.x.x.x.', BS: '1...5...1...5...', GT: '1.3.5.8.5.3.1.3.' } });
    gp.ejemplo({ nombre: 'Pop de los 80', detalle: 'Chorus y rasgueo', bpm: 112, notaBase: 'Re', ambiente: 'Pop', efectos: { reverb: .24, eco: .12 },
      estilos: { GT: 'Chorus', CH: 'Rasgueo eléctrico', SN: 'Acústico' },
      ritmo: { BD: 'x.......x.x.....', SN: '....x.......x...', HH: 'x.x.x.x.x.x.x.x.', BS: '1.1.1.1.6.6.4.4.', GT: '1.5.8.5.6.3.4.8.', CH: '1.......6...4...' } });
  },
});
