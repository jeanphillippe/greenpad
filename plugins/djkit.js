// DJ KIT: para las bandejas. Tres botones (bocina, scratch y sirena) y dos perillas (bombeo y teléfono).
GREENPAD.plugin({
  id: 'djkit',
  nombre: 'DJ Kit',
  autor: 'GREENPAD',
  version: '1.0',
  tipo: 'bandeja',
  descripcion: 'Bocina de aire, scratch y sirena para disparar, más dos perillas: bombeo (la música se agacha con cada pulso) y teléfono.',
  setup(gp) {
    const curvas = {};
    function saturar(ctx, k) {
      const ws = ctx.createWaveShaper();
      if (!curvas[k]) { const a = new Float32Array(1024); for (let i = 0; i < 1024; i++) { const x = i / 511.5 - 1; a[i] = Math.tanh(x * k) / Math.tanh(k); } curvas[k] = a; }
      ws.curve = curvas[k]; return ws;
    }
    function filtro(ctx, tipo, f, q) { const b = ctx.createBiquadFilter(); b.type = tipo; b.frequency.value = f; if (q) b.Q.value = q; return b; }

    // ---------- BOCINA: tres bocinazos, el último largo y que se cae ----------
    gp.boton({
      id: 'bocina', nombre: 'Bocina', detalle: 'Tres bocinazos de aire',
      tocar(ctx, salida, t) {
        const sat = saturar(ctx, 3), bp = filtro(ctx, 'bandpass', 1150, .7), hp = filtro(ctx, 'highpass', 330), vol = ctx.createGain();
        vol.gain.value = .32; sat.connect(bp); bp.connect(hp); hp.connect(vol); vol.connect(salida);
        [[0, .13], [.18, .13], [.36, .75]].forEach(([dt, dur], k) => {
          const a = t + dt, g = ctx.createGain();
          g.gain.setValueAtTime(0, a); g.gain.linearRampToValueAtTime(.5, a + .012); g.gain.setValueAtTime(.5, a + dur - .03); g.gain.linearRampToValueAtTime(0, a + dur);
          g.connect(sat);
          [370, 466, 554].forEach((f) => [-12, 9].forEach((des) => {            // tres notas, cada una con dos trompetas apenas desafinadas
            const o = ctx.createOscillator(); o.type = 'sawtooth'; o.detune.value = des;
            o.frequency.setValueAtTime(f * 1.06, a); o.frequency.exponentialRampToValueAtTime(f, a + .04);
            if (k === 2) { o.frequency.setValueAtTime(f, a + dur - .32); o.frequency.exponentialRampToValueAtTime(f * .84, a + dur); } // la última se cae
            o.connect(g); o.start(a); o.stop(a + dur + .02);
          }));
        });
      },
    });

    // ---------- SCRATCH: dos idas y vueltas ----------
    gp.boton({
      id: 'scratch', nombre: 'Scratch', detalle: 'Dos idas y vueltas de púa',
      tocar(ctx, salida, t) {
        const n = ctx.createBufferSource(); n.buffer = gp.ruido(); n.loop = true;
        const b1 = filtro(ctx, 'bandpass', 900, 5), b2 = filtro(ctx, 'bandpass', 1900, 3.5), g = ctx.createGain();
        n.connect(b1); n.connect(b2); b1.connect(g); b2.connect(g); g.connect(salida);
        g.gain.setValueAtTime(0, t);
        let x = t;
        [[.07, 1], [.09, -1], [.06, 1], [.14, -1]].forEach(([dur, sentido]) => {     // sentido 1: el disco va para adelante (el tono sube); -1: vuelve
          const de = sentido > 0 ? 450 : 2100, a = sentido > 0 ? 2400 : 380;
          b1.frequency.setValueAtTime(de, x); b1.frequency.exponentialRampToValueAtTime(a, x + dur);
          b2.frequency.setValueAtTime(de * 2.1, x); b2.frequency.exponentialRampToValueAtTime(a * 2.1, x + dur);
          n.playbackRate.setValueAtTime(sentido > 0 ? .4 : 1.6, x); n.playbackRate.linearRampToValueAtTime(sentido > 0 ? 1.7 : .3, x + dur);
          g.gain.setValueAtTime(0, x); g.gain.linearRampToValueAtTime(.8, x + .008); g.gain.setValueAtTime(.8, x + dur - .01); g.gain.linearRampToValueAtTime(0, x + dur);
          x += dur + .012;
        });
        n.start(t); n.stop(x + .05);
      },
    });

    // ---------- SIRENA: suena mientras se mantiene apretado ----------
    let sirena = null;
    gp.boton({
      id: 'sirena', nombre: 'Sirena', detalle: 'Mantené apretado',
      tocar(ctx, salida, t) {
        if (sirena) return;
        const osc = ctx.createOscillator(), lfo = ctx.createOscillator(), cuanto = ctx.createGain(), lp = filtro(ctx, 'lowpass', 2600), vol = ctx.createGain();
        osc.type = 'square'; osc.frequency.value = 820;
        lfo.type = 'triangle'; lfo.frequency.value = 3.2; cuanto.gain.value = 300;   // el tono sube y baja 3 veces por segundo
        lfo.connect(cuanto); cuanto.connect(osc.frequency);
        vol.gain.setValueAtTime(0, t); vol.gain.linearRampToValueAtTime(.2, t + .03);
        osc.connect(lp); lp.connect(vol); vol.connect(salida); osc.start(t); lfo.start(t);
        sirena = { osc, lfo, vol };
      },
      soltar(ctx, t) {
        if (!sirena) return;
        const s = sirena; sirena = null;
        s.vol.gain.cancelScheduledValues(t); s.vol.gain.setTargetAtTime(0, t, .06);
        s.osc.frequency.setTargetAtTime(300, t, .15);                                // al soltar, se desinfla
        s.osc.stop(t + .5); s.lfo.stop(t + .5);
      },
    });

    // ---------- BOMBEO: toda la mezcla se agacha en cada pulso y vuelve, como en la radio ----------
    gp.efecto({
      id: 'bombeo', nombre: 'Bombeo',
      crear(ctx) {
        const paso = ctx.createGain(), prof = ctx.createGain(); prof.gain.value = 0; prof.connect(paso.gain);
        // la forma de un pulso: arranca abajo (-1) y vuelve a 0. Se repite una vez por negra
        const N = 4096, buf = ctx.createBuffer(1, N, ctx.sampleRate), d = buf.getChannelData(0);
        for (let i = 0; i < N; i++) { const x = i / N; d[i] = -Math.pow(1 - x, 2.6) * Math.min(1, x * 60); }
        let src = null, clave = '';
        function sincronizar(info) {
          const k = info.bpm + ':' + info.inicio; if (k === clave) return; clave = k;
          if (src) try { src.stop(); } catch (e) {}
          const negra = 60 / info.bpm;
          src = ctx.createBufferSource(); src.buffer = buf; src.loop = true; src.playbackRate.value = (N / ctx.sampleRate) / negra; src.connect(prof);
          // info.inicio: cuándo cayó el primer paso del compás. Desde ahí se cuenta para arrancar justo en una negra
          let t0 = info.ahora + .02;
          if (info.inicio != null) t0 = info.inicio + Math.max(0, Math.ceil((info.ahora + .02 - info.inicio) / negra)) * negra;
          src.start(t0);
        }
        return { entrada: paso, salida: paso, ajustar(valor, info) { prof.gain.value = valor * .85; sincronizar(info); } };
      },
    });

    // ---------- TELÉFONO: saca graves y agudos, como una voz por teléfono o una radio chica ----------
    gp.efecto({
      id: 'telefono', nombre: 'Teléfono',
      crear(ctx) {
        const hp = filtro(ctx, 'highpass', 20, .9), lp = filtro(ctx, 'lowpass', 20000, .9), sat = saturar(ctx, 2), vol = ctx.createGain();
        hp.connect(lp); lp.connect(sat); sat.connect(vol);
        return {
          entrada: hp, salida: vol,
          ajustar(valor) {
            hp.frequency.value = 20 * Math.pow(600 / 20, valor);
            lp.frequency.value = 20000 * Math.pow(2600 / 20000, valor);
            vol.gain.value = 1 + valor * .5;
          },
        };
      },
    });
  },
});
