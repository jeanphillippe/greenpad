// Plugin de ejemplo (tipo: bandeja). Suma a las bandejas una perilla TRÉMOLO y un botón SIRENA.
GREENPAD.plugin({
  id: 'dub',
  nombre: 'Dub',
  autor: 'GREENPAD',
  version: '1.0',
  tipo: 'bandeja',
  descripcion: 'Para las bandejas: una perilla de trémolo que late con el tempo y un botón de sirena.',
  setup(gp) {
    // Perilla: toda la mezcla pasa por acá. Con la perilla en 0 el efecto queda desenchufado.
    gp.efecto({
      id: 'tremolo',
      nombre: 'Trémolo',
      crear(ctx) {
        const paso = ctx.createGain(), lfo = ctx.createOscillator(), prof = ctx.createGain();
        lfo.type = 'sine'; lfo.frequency.value = 8; prof.gain.value = 0;
        lfo.connect(prof); prof.connect(paso.gain); lfo.start();
        return {
          entrada: paso,
          salida: paso,
          // valor va de 0 a 1; info trae el tempo
          ajustar(valor, info) {
            paso.gain.value = 1 - valor * .5;       // el volumen sube y baja alrededor de este punto
            prof.gain.value = valor * .5;
            lfo.frequency.value = info.bpm / 60 * 4; // cuatro latidos por negra: semicorcheas
          },
        };
      },
    });

    // Botón: suena mientras se lo mantiene apretado
    let sirena = null;
    gp.boton({
      id: 'sirena',
      nombre: 'Sirena',
      detalle: 'Mantené apretado',
      tocar(ctx, salida, t) {
        const osc = ctx.createOscillator(), sube = ctx.createOscillator(), cuanto = ctx.createGain(), vol = ctx.createGain();
        osc.type = 'square'; osc.frequency.value = 760;
        sube.type = 'sawtooth'; sube.frequency.value = 5; cuanto.gain.value = 320;
        sube.connect(cuanto); cuanto.connect(osc.frequency);
        vol.gain.setValueAtTime(0, t); vol.gain.linearRampToValueAtTime(.22, t + .02);
        osc.connect(vol); vol.connect(salida); osc.start(t); sube.start(t);
        sirena = { osc, sube, vol };
      },
      soltar(ctx, t) {
        if (!sirena) return;
        const s = sirena; sirena = null;
        s.vol.gain.cancelScheduledValues(t); s.vol.gain.setTargetAtTime(0, t, .05);
        s.osc.stop(t + .4); s.sube.stop(t + .4);
      },
    });
  },
});
