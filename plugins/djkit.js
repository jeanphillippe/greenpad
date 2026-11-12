// DJ KIT: para las bandejas. Micrófono en vivo (voz, eco y robot), grabar encima de las grabaciones 1 y 2, efectos para disparar con eco de dub
// (bocina, sirena, láser, subida, bomba, scratch) y tres perillas (bombeo, jet y radio).
GREENPAD.plugin({
  id: 'djkit',
  nombre: 'DJ Kit',
  autor: 'GREENPAD',
  version: '2.1',
  tipo: 'bandeja',
  descripcion: 'Micrófono en vivo con tres voces (limpia, con eco y robot), dos botones para grabar encima de las grabaciones 1 y 2, bocina, sirena, láser, subida, bomba y scratch con eco de dub, y las perillas bombeo, jet y radio.',
  setup(gp) {
    const ROJO = '#ff5d5d', AMBAR = '#ffb347', CELESTE = '#6fc3ff', LILA = '#b49cff';
    function filtro(ctx, tipo, f, q, gan) { const b = ctx.createBiquadFilter(); b.type = tipo; b.frequency.value = f; if (q) b.Q.value = q; if (gan) b.gain.value = gan; return b; }
    function cadena(...nodos) { for (let i = 0; i < nodos.length - 1; i++) nodos[i].connect(nodos[i + 1]); return nodos[0]; }
    function ruido(ctx, t, dur, vel) { const s = ctx.createBufferSource(); s.buffer = gp.ruido(); s.loop = true; s.playbackRate.value = vel || 1; s.start(t, Math.random() * .5); if (dur) s.stop(t + dur + .02); return s; }

    // ---- eco de dub: todo lo que se dispara puede mandar una parte acá. Repite a tiempo y cada vuelta sale más opaca ----
    const ecos = new WeakMap();
    function eco(ctx, salida, bpm) {
      let e = ecos.get(ctx);
      if (!e) {
        const ent = ctx.createGain(), d = ctx.createDelay(2), fb = ctx.createGain(), lp = filtro(ctx, 'lowpass', 2400), hp = filtro(ctx, 'highpass', 320), out = ctx.createGain();
        fb.gain.value = .52; out.gain.value = .8;
        cadena(ent, d, lp, hp, out, salida); hp.connect(fb); fb.connect(d);
        ecos.set(ctx, e = { ent, d });
      }
      e.d.delayTime.value = Math.min(1.9, 60 / (bpm || 100) * .75);   // tres semicorcheas: el eco clásico del dub
      return e.ent;
    }
    // manda un sonido directo a la salida y una parte al eco
    function conEco(ctx, salida, info, cuanto) {
      const g = ctx.createGain(), s = ctx.createGain(); s.gain.value = cuanto; g.connect(salida); g.connect(s); s.connect(eco(ctx, salida, info.bpm)); return g;
    }

    // ================= MICRÓFONO =================
    // Los tres botones se mantienen apretados para hablar. La primera vez el navegador pide permiso.
    let voz = null;
    function hablar(armar) {
      return function (ctx, salida, t, info) {
        const yo = voz = { vivo: true, fin: null };
        return gp.microfono().then((mic) => {
          if (!yo.vivo) return false;                                     // soltaron antes de que llegara el permiso
          const ent = ctx.createGain(); ent.gain.setValueAtTime(0, ctx.currentTime); ent.gain.linearRampToValueAtTime(1, ctx.currentTime + .03);
          mic.connect(ent);
          const extra = armar(ctx, ent, salida, info) || [];
          yo.fin = (cuando) => {
            ent.gain.cancelScheduledValues(cuando); ent.gain.setTargetAtTime(0, cuando, .02);
            setTimeout(() => { try { mic.disconnect(ent); } catch (e) {} extra.forEach(o => { try { o.stop(); } catch (e) {} }); }, 250);
          };
          return true;
        }).catch(() => { gp.aviso('No pude usar el micrófono. Revisá el permiso del navegador.', 3600); return false; });
      };
    }
    function callar(ctx, t) { if (!voz) return; voz.vivo = false; if (voz.fin) voz.fin(t); voz = null; gp.soltarMicrofono(45000); } // el micrófono se apaga solo si pasa un rato sin usarse

    gp.boton({ id: 'voz', nombre: 'Voz', detalle: 'Mantené apretado y hablá', color: ROJO, soltar: callar,
      tocar: hablar((ctx, ent, salida) => {                                // voz de locutor: sin graves que retumben, con presencia y pareja
        const comp = ctx.createDynamicsCompressor(), vol = ctx.createGain(); comp.threshold.value = -24; comp.ratio.value = 5; vol.gain.value = 1.5;
        cadena(ent, filtro(ctx, 'highpass', 140), filtro(ctx, 'peaking', 3200, 1, 5), comp, vol, salida);
      }) });
    gp.boton({ id: 'voz-eco', nombre: 'Voz eco', detalle: 'Mantené apretado: la voz queda rebotando', color: ROJO, soltar: callar,
      tocar: hablar((ctx, ent, salida, info) => {
        const vol = ctx.createGain(), manda = ctx.createGain(); vol.gain.value = 1.3; manda.gain.value = .85;
        cadena(ent, filtro(ctx, 'highpass', 160), vol, salida); vol.connect(manda); manda.connect(eco(ctx, salida, info.bpm));
      }) });
    gp.boton({ id: 'robot', nombre: 'Robot', detalle: 'Mantené apretado: voz de robot', color: ROJO, soltar: callar,
      tocar: hablar((ctx, ent, salida) => {                                // la voz multiplicada por un tono fijo: quedan solo las "consonantes" metálicas
        const anillo = ctx.createGain(), osc = ctx.createOscillator(), vol = ctx.createGain(); anillo.gain.value = 0; osc.type = 'sine'; osc.frequency.value = 72; vol.gain.value = 2.2;
        osc.connect(anillo.gain); osc.start();
        cadena(ent, filtro(ctx, 'highpass', 200), anillo, filtro(ctx, 'lowpass', 3400), vol, salida);
        return [osc];
      }) });

    // ---------- GRABAR 1 y 2: mientras se mantiene apretado graba con el micrófono y pisa esa grabación ----------
    // Después se toca con los botones GRABACIONES 1 y 2 de la consola (pasa por reverb, eco y lo-fi).
    [1, 2].forEach((n) => gp.boton({ id: 'grabar' + n, nombre: 'Grabar ' + n, detalle: 'Mantené apretado y grabá: reemplaza la grabación ' + n + ' (hasta 8 segundos)', color: ROJO,
      tocar() { return gp.grabar(n).catch(() => { gp.aviso('No pude usar el micrófono. Revisá el permiso del navegador.', 3600); return false; }); },
      soltar() { gp.pararGrabacion(); gp.soltarMicrofono(45000); } }));

    // ================= EFECTOS PARA DISPARAR =================
    // ---------- BOCINA: dos cornetas de aire desafinadas, tres bocinazos y el último se cae ----------
    function corneta(ctx, destino, a, dur, f, cae) {
      const g = ctx.createGain(), ds = gp.distorsion(ctx, 6), f1 = filtro(ctx, 'peaking', 1050, 1.6, 9), f2 = filtro(ctx, 'peaking', 2500, 2, 6), lp = filtro(ctx, 'lowpass', 5200), hp = filtro(ctx, 'highpass', 260);
      g.gain.setValueAtTime(0, a); g.gain.linearRampToValueAtTime(.55, a + .018); g.gain.setValueAtTime(.55, a + dur - .05); g.gain.linearRampToValueAtTime(0, a + dur);
      cadena(g, ds, f1, f2, lp, hp, destino);
      const temblor = ctx.createOscillator(), tg = ctx.createGain(); temblor.frequency.value = 31; tg.gain.value = f * .012; temblor.connect(tg);   // la lengüeta que vibra
      [1, 2.003, .5].forEach((arm, i) => {
        const o = ctx.createOscillator(); o.type = 'sawtooth'; tg.connect(o.frequency);
        o.frequency.setValueAtTime(f * arm * .93, a); o.frequency.exponentialRampToValueAtTime(f * arm, a + .05);        // arranca un poco abajo y sube
        if (cae) { o.frequency.setValueAtTime(f * arm, a + dur - .38); o.frequency.exponentialRampToValueAtTime(f * arm * .8, a + dur); }
        const og = ctx.createGain(); og.gain.value = i === 2 ? .35 : i ? .5 : 1; o.connect(og); og.connect(g); o.start(a); o.stop(a + dur + .02);
      });
      const aire = ruido(ctx, a, dur), ag = ctx.createGain(); ag.gain.value = .05; aire.connect(ag); ag.connect(g);
      temblor.start(a); temblor.stop(a + dur + .02);
    }
    gp.boton({ id: 'bocina', nombre: 'Bocina', detalle: 'Tres bocinazos de aire', color: AMBAR,
      tocar(ctx, salida, t, info) {
        const bus = conEco(ctx, salida, info, .3); bus.gain.value = .3;
        [[0, .15, false], [.2, .15, false], [.4, .95, true]].forEach(([dt, dur, cae]) => { corneta(ctx, bus, t + dt, dur, 415, cae); corneta(ctx, bus, t + dt, dur, 494 * 1.008, cae); });
      } });

    // ---------- SIRENA: la sirena de dub. Sube y baja mientras se mantiene, y al soltar queda rebotando en el eco ----------
    let sirena = null;
    gp.boton({ id: 'sirena', nombre: 'Sirena', detalle: 'Mantené apretado', color: AMBAR,
      tocar(ctx, salida, t, info) {
        if (sirena) return;
        const bus = conEco(ctx, salida, info, .55), osc = ctx.createOscillator(), lfo = ctx.createOscillator(), cuanto = ctx.createGain(), lp = filtro(ctx, 'lowpass', 3200, 2), vol = ctx.createGain();
        osc.type = 'square'; osc.frequency.value = 900; lfo.type = 'sawtooth'; lfo.frequency.setValueAtTime(2.2, t); lfo.frequency.linearRampToValueAtTime(7, t + 4);  // cada vez más rápido
        cuanto.gain.value = 420; lfo.connect(cuanto); cuanto.connect(osc.frequency);
        vol.gain.setValueAtTime(0, t); vol.gain.linearRampToValueAtTime(.16, t + .02);
        cadena(osc, lp, vol, bus); osc.start(t); lfo.start(t);
        sirena = { osc, lfo, vol };
      },
      soltar(ctx, t) {
        if (!sirena) return; const s = sirena; sirena = null;
        s.vol.gain.cancelScheduledValues(t); s.vol.gain.setTargetAtTime(0, t, .03); s.osc.stop(t + .3); s.lfo.stop(t + .3);
      } });

    // ---------- LÁSER: tres disparos que caen ----------
    gp.boton({ id: 'laser', nombre: 'Láser', detalle: 'Piu piu piu', color: AMBAR,
      tocar(ctx, salida, t, info) {
        const bus = conEco(ctx, salida, info, .45), paso = 15 / info.bpm;
        [0, 1, 2].forEach((i) => {
          const a = t + i * paso, o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sawtooth';
          o.frequency.setValueAtTime(3200, a); o.frequency.exponentialRampToValueAtTime(160, a + .16);
          g.gain.setValueAtTime(.5, a); g.gain.exponentialRampToValueAtTime(.001, a + .17);
          cadena(o, filtro(ctx, 'bandpass', 1800, .6), g, bus); o.start(a); o.stop(a + .19);
        });
      } });

    // ---------- SUBIDA: mientras se mantiene, crece. Al soltar, cae la bomba ----------
    function bomba(ctx, salida, t, info) {
      const o = ctx.createOscillator(), g = ctx.createGain(), ds = gp.distorsion(ctx, 3);
      o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(30, t + .9);
      g.gain.setValueAtTime(.95, t); g.gain.exponentialRampToValueAtTime(.001, t + 1.5);
      cadena(o, g, ds, salida); o.start(t); o.stop(t + 1.6);
      const n = ruido(ctx, t, 1.3), nf = filtro(ctx, 'lowpass', 9000), ng = ctx.createGain();                         // el platillazo
      nf.frequency.setValueAtTime(9000, t); nf.frequency.exponentialRampToValueAtTime(500, t + 1.2);
      ng.gain.setValueAtTime(.3, t); ng.gain.exponentialRampToValueAtTime(.001, t + 1.3);
      cadena(n, nf, ng, conEco(ctx, salida, info, .35));
    }
    let subida = null;
    gp.boton({ id: 'subida', nombre: 'Subida', detalle: 'Mantené apretado y soltá en el uno', color: CELESTE,
      tocar(ctx, salida, t, info) {
        if (subida) return;
        const n = ruido(ctx, t, 0), bp = filtro(ctx, 'bandpass', 300, 2.5), g = ctx.createGain(), o = ctx.createOscillator(), og = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain();
        const largo = 60 / info.bpm * 8;                                                                               // llega arriba en dos compases
        bp.frequency.setValueAtTime(300, t); bp.frequency.exponentialRampToValueAtTime(9000, t + largo);
        o.type = 'sawtooth'; o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(1760, t + largo); og.gain.value = .12;
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.3, t + .2); g.gain.linearRampToValueAtTime(.65, t + largo);
        lfo.type = 'square'; lfo.frequency.setValueAtTime(info.bpm / 60 * 2, t); lfo.frequency.linearRampToValueAtTime(info.bpm / 60 * 8, t + largo); lg.gain.value = .25;   // tiembla cada vez más rápido
        const trem = ctx.createGain(); trem.gain.value = .75; lfo.connect(lg); lg.connect(trem.gain);
        cadena(n, bp, g, trem, salida); cadena(o, og, g); o.start(t); lfo.start(t);
        subida = { n, o, lfo, g, salida, info };
      },
      soltar(ctx, t) {
        if (!subida) return; const s = subida; subida = null;
        s.g.gain.cancelScheduledValues(t); s.g.gain.setTargetAtTime(0, t, .01);
        [s.n, s.o, s.lfo].forEach(x => { try { x.stop(t + .1); } catch (e) {} });
        bomba(ctx, s.salida, t + .01, s.info);
      } });
    gp.boton({ id: 'bomba', nombre: 'Bomba', detalle: 'Un grave que cae', color: CELESTE, tocar(ctx, salida, t, info) { bomba(ctx, salida, t, info); } });

    // ---------- SCRATCH: dos idas y vueltas ----------
    gp.boton({ id: 'scratch', nombre: 'Scratch', detalle: 'Dos idas y vueltas de púa', color: CELESTE,
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
      } });

    // ================= PERILLAS =================
    // ---------- BOMBEO: toda la mezcla se agacha en cada pulso y vuelve, como en la radio ----------
    gp.efecto({
      id: 'bombeo', nombre: 'Bombeo', color: LILA,
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

    // ---------- JET: el barrido de avión (una copia atrasada apenas, que va y viene) ----------
    gp.efecto({
      id: 'jet', nombre: 'Jet', color: LILA,
      crear(ctx) {
        const ent = ctx.createGain(), sal = ctx.createGain(), d = ctx.createDelay(.05), fb = ctx.createGain(), wet = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain();
        d.delayTime.value = .0042; lfo.frequency.value = .18; lg.gain.value = .0034; lfo.connect(lg); lg.connect(d.delayTime); lfo.start();
        ent.connect(sal); cadena(ent, d, wet, sal); d.connect(fb); fb.connect(d);
        return { entrada: ent, salida: sal, ajustar(valor, info) { wet.gain.value = valor * .9; fb.gain.value = .25 + valor * .55; lfo.frequency.value = info.bpm / 60 / 8; sal.gain.value = 1 - valor * .25; } }; // una vuelta cada dos compases
      },
    });

    // ---------- RADIO: saca graves y agudos, como una radio chica o un teléfono ----------
    gp.efecto({
      id: 'radio', nombre: 'Radio', color: LILA,
      crear(ctx) {
        const hp = filtro(ctx, 'highpass', 20, .9), lp = filtro(ctx, 'lowpass', 20000, .9), ds = gp.distorsion(ctx, 2), vol = ctx.createGain();
        cadena(hp, lp, ds, vol);
        return { entrada: hp, salida: vol, ajustar(valor) { hp.frequency.value = 20 * Math.pow(600 / 20, valor); lp.frequency.value = 20000 * Math.pow(2600 / 20000, valor); vol.gain.value = 1 + valor * .5; } };
      },
    });
  },
});
