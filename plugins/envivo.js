// EN VIVO: seis botones para jugar con toda la mezcla mientras suena. Se mantienen apretados y al soltar vuelve todo.
// Cortes a tiempo, freno de cinta, filtros que barren y un eco que atrapa lo que suena.
GREENPAD.plugin({
  id: 'envivo',
  nombre: 'En vivo',
  autor: 'GREENPAD',
  version: '1.0',
  tipo: 'bandeja',
  descripcion: 'Seis botones para mantener apretados sobre toda la mezcla: corte en 1/8 y 1/16, freno de cinta, filtro que cierra, filtro que sube y un eco que atrapa lo que suena.',
  setup(gp) {
    const VERDE = '#3ee08a', NARANJA = '#ffae5c', ROSA = '#ff8fb1';
    let U = null;   // la cadena de efectos que está sonando (se arma cuando arranca el audio)

    // Un efecto "oculto" no tiene perilla: queda siempre enchufado y lo manejan los botones.
    // Con todo suelto no cambia nada: volumen 1, filtros abiertos, sin atraso.
    gp.efecto({
      id: 'cadena', nombre: 'En vivo', oculto: true,
      crear(ctx) {
        const ent = ctx.createGain(), corte = ctx.createGain(), lp = ctx.createBiquadFilter(), hp = ctx.createBiquadFilter(), cinta = ctx.createDelay(1.5), mudo = ctx.createGain(), sal = ctx.createGain();
        lp.type = 'lowpass'; lp.frequency.value = 20000; lp.Q.value = .7; hp.type = 'highpass'; hp.frequency.value = 10; hp.Q.value = .7; cinta.delayTime.value = 0;
        [ent, corte, lp, hp, cinta, mudo, sal].reduce((a, b) => (a.connect(b), b));
        // eco: lo que entra mientras el botón está apretado queda dando vueltas
        const manda = ctx.createGain(), eco = ctx.createDelay(2), vuelve = ctx.createGain(), opaco = ctx.createBiquadFilter();
        manda.gain.value = 0; vuelve.gain.value = .62; opaco.type = 'lowpass'; opaco.frequency.value = 2800;
        hp.connect(manda); manda.connect(eco); eco.connect(opaco); opaco.connect(vuelve); vuelve.connect(eco); opaco.connect(sal);
        // la forma del corte: medio paso suena, medio paso calla
        const N = 2048, forma = ctx.createBuffer(1, N, ctx.sampleRate), d = forma.getChannelData(0);
        for (let i = 0; i < N; i++) { const x = i / N; d[i] = x < .5 ? 0 : -Math.min(1, (x - .5) * 80, (1 - x) * 80); }   // se suma al volumen (que vale 1): 0 deja pasar, -1 calla
        const u = { ctx, corte, lp, hp, cinta, mudo, manda, eco, forma, N, info: { bpm: 120, inicio: null }, gate: null };
        if (typeof ctx.startRendering !== 'function') U = u;   // en Descargar la cadena existe pero nadie la toca
        return { entrada: ent, salida: sal, ajustar(valor, info) { u.info = info; } };
      },
    });

    // el próximo momento que cae justo en la cuadrícula (cada "cada" segundos, contando desde el primer paso del compás)
    function enCuadricula(u, t, cada) { const i = u.info.inicio; return i == null ? t : i + Math.ceil((t - i) / cada - .02) * cada; }

    // ---------- CORTE: la música entra y sale a tiempo ----------
    function corte(id, nombre, porNegra) {
      gp.boton({ id, nombre, detalle: 'Mantené apretado: corta la música a tiempo', color: VERDE,
        tocar(ctx, salida, t, info) {
          const u = U; if (!u) return false;
          if (u.gate) try { u.gate.stop(); } catch (e) {}
          const dura = 60 / info.bpm / porNegra, s = ctx.createBufferSource(); s.buffer = u.forma; s.loop = true; s.playbackRate.value = (u.N / ctx.sampleRate) / dura;
          s.connect(u.corte.gain); s.start(enCuadricula(u, t, dura)); u.gate = s;
        },
        soltar(ctx, t) { const u = U; if (u && u.gate) { try { u.gate.stop(t); } catch (e) {} u.gate = null; } } });
    }
    corte('corte8', 'Corte 1/8', 2);
    corte('corte16', 'Corte 1/16', 4);

    // ---------- FRENO: como apagar un tocadiscos. El sonido se atrasa cada vez más rápido, y eso lo hace bajar de tono ----------
    gp.boton({ id: 'freno', nombre: 'Freno', detalle: 'Mantené apretado: la música se frena como una cinta', color: NARANJA,
      tocar(ctx, salida, t) {
        const u = U; if (!u) return false;
        const D = .9;
        u.cinta.delayTime.cancelScheduledValues(t); u.cinta.delayTime.setValueAtTime(0, t);
        for (let i = 1; i <= 12; i++) { const x = i / 12; u.cinta.delayTime.linearRampToValueAtTime(x * x * D / 2, t + x * D); }   // el atraso crece cada vez más rápido
        u.mudo.gain.cancelScheduledValues(t); u.mudo.gain.setValueAtTime(1, t + D * .75); u.mudo.gain.linearRampToValueAtTime(0, t + D);
      },
      soltar(ctx, t) {
        const u = U; if (!u) return;
        u.mudo.gain.cancelScheduledValues(t); u.mudo.gain.setTargetAtTime(0, t, .004);
        u.cinta.delayTime.cancelScheduledValues(t + .02); u.cinta.delayTime.setValueAtTime(0, t + .03);                   // ya en silencio, el atraso vuelve a cero
        u.mudo.gain.setTargetAtTime(1, t + .04, .008);                                    // vuelve de golpe, a tiempo con lo que siguió sonando
      } });

    // ---------- FILTRO: se cierra de a poco (queda solo el grave) ----------
    gp.boton({ id: 'cierra', nombre: 'Cierra', detalle: 'Mantené apretado: se van los agudos', color: ROSA,
      tocar(ctx, salida, t, info) {
        const u = U; if (!u) return false;
        u.lp.Q.setTargetAtTime(5, t, .02); u.lp.frequency.cancelScheduledValues(t); u.lp.frequency.setValueAtTime(16000, t); u.lp.frequency.exponentialRampToValueAtTime(220, t + 60 / info.bpm * 4);
      },
      soltar(ctx, t) { const u = U; if (!u) return; u.lp.frequency.cancelScheduledValues(t); u.lp.frequency.setTargetAtTime(20000, t, .04); u.lp.Q.setTargetAtTime(.7, t, .05); } });

    // ---------- SUBE: se van los graves de a poco. Soltalo en el uno y vuelve todo el peso ----------
    gp.boton({ id: 'sube', nombre: 'Sube', detalle: 'Mantené apretado: se van los graves. Soltá en el uno', color: ROSA,
      tocar(ctx, salida, t, info) {
        const u = U; if (!u) return false;
        u.hp.Q.setTargetAtTime(4, t, .02); u.hp.frequency.cancelScheduledValues(t); u.hp.frequency.setValueAtTime(30, t); u.hp.frequency.exponentialRampToValueAtTime(3200, t + 60 / info.bpm * 8);
      },
      soltar(ctx, t) { const u = U; if (!u) return; u.hp.frequency.cancelScheduledValues(t); u.hp.frequency.setTargetAtTime(10, t, .012); u.hp.Q.setTargetAtTime(.7, t, .03); } });

    // ---------- ECO: atrapa lo que suena mientras está apretado y lo deja rebotando ----------
    gp.boton({ id: 'eco', nombre: 'Atrapa', detalle: 'Mantené apretado: lo que suena queda rebotando', color: NARANJA,
      tocar(ctx, salida, t, info) { const u = U; if (!u) return false; u.eco.delayTime.setValueAtTime(Math.min(1.9, 60 / info.bpm * .75), t); u.manda.gain.setTargetAtTime(1, t, .01); },
      soltar(ctx, t) { const u = U; if (u) u.manda.gain.setTargetAtTime(0, t, .01); } });
  },
});
