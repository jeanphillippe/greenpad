// Plugin de ejemplo (tipo: sonido). Suma una kalimba a MELODÍA y a ACORDES.
GREENPAD.plugin({
  id: 'kalimba',
  nombre: 'Kalimba',
  autor: 'GREENPAD',
  version: '1.0',
  tipo: 'sonido',
  descripcion: 'Una kalimba sintetizada para la melodía y para los acordes.',
  setup(gp) {
    // una lengüeta: un tono puro, un armónico corto que le da el "tic" metálico y un golpecito de ruido
    function lengueta(ctx, salida, t, fuerza, f, dur) {
      const largo = Math.max(.5, dur + .9);
      const cuerpo = ctx.createOscillator(), gc = ctx.createGain();
      cuerpo.type = 'sine'; cuerpo.frequency.value = f;
      gc.gain.setValueAtTime(0, t);
      gc.gain.linearRampToValueAtTime(.5 * fuerza, t + .004);
      gc.gain.exponentialRampToValueAtTime(.0008, t + largo);
      cuerpo.connect(gc); gc.connect(salida); cuerpo.start(t); cuerpo.stop(t + largo + .05);

      const arm = ctx.createOscillator(), ga = ctx.createGain();
      arm.type = 'sine'; arm.frequency.value = Math.min(16000, f * 5.4);
      ga.gain.setValueAtTime(.16 * fuerza, t);
      ga.gain.exponentialRampToValueAtTime(.0008, t + .09);
      arm.connect(ga); ga.connect(salida); arm.start(t); arm.stop(t + .12);

      const golpe = ctx.createBufferSource(), gg = ctx.createGain(), fl = ctx.createBiquadFilter();
      golpe.buffer = gp.ruido(); fl.type = 'bandpass'; fl.frequency.value = 2600; fl.Q.value = 1.2;
      gg.gain.setValueAtTime(.12 * fuerza, t);
      gg.gain.exponentialRampToValueAtTime(.0008, t + .03);
      golpe.connect(fl); fl.connect(gg); gg.connect(salida); golpe.start(t); golpe.stop(t + .05);
    }

    gp.instrumento('LD', {
      id: 'kalimba',
      nombre: 'Kalimba',
      detalle: 'Lengüetas de metal, dulce',
      tocar(ctx, salida, t, fuerza, nota) { lengueta(ctx, salida, t, fuerza, nota.f, nota.dur); },
    });

    gp.instrumento('CH', {
      id: 'kalimba-acordes',
      nombre: 'Kalimba',
      detalle: 'El acorde, una lengüeta atrás de otra',
      tocar(ctx, salida, t, fuerza, nota) {
        // nota.fs trae las frecuencias del acorde; se tocan apenas separadas, como con los pulgares
        (nota.fs || [nota.f]).forEach((f, i) => lengueta(ctx, salida, t + i * .028, fuerza * .7, f, nota.dur));
      },
    });
  },
});
