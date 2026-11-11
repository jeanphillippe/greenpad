// PLANTILLA DE PLUGIN PARA GREENPAD
// 1. Cambiá los datos de abajo (el id va en minúsculas, sin espacios, y no se cambia más).
// 2. Dejá solo las partes que uses (instrumento, efecto, boton, visual) y borrá el resto.
// 3. Probalo: en GREENPAD, menú > Plugins > "Probar un plugin propio (.js)".
// La guía completa está en plugins.html.

GREENPAD.plugin({
  id: 'mi-plugin',
  nombre: 'Mi plugin',
  autor: 'Tu nombre',
  version: '1.0',
  tipo: 'sonido',            // sonido, bandeja o visual
  descripcion: 'Qué hace, en una línea.',

  setup(gp) {
    // ---------- SONIDO: un estilo nuevo para un instrumento ----------
    // Pistas: 'BD' bombo, 'SN' caja, 'HH' hi-hat, 'PC' percu, 'BS' bajo, 'GT' guitarra, 'CH' acordes, 'LD' melodía
    gp.instrumento('LD', {
      id: 'mi-sonido',
      nombre: 'Mi sonido',
      detalle: 'Una línea corta que lo describe',
      // ctx: el AudioContext. salida: adonde hay que conectar. t: cuándo suena. fuerza: 0 a 1.
      // nota: en bajo, guitarra, acordes y melodía trae { f, fs, dur } (frecuencia, frecuencias del acorde, duración).
      //       En la batería viene vacía (null).
      // afin: afinación del instrumento (1 = normal). En la batería, multiplicá tus frecuencias por este número.
      tocar(ctx, salida, t, fuerza, nota, afin) {
        const osc = ctx.createOscillator(), vol = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = nota ? nota.f : 200 * afin;
        vol.gain.setValueAtTime(.4 * fuerza, t);
        vol.gain.exponentialRampToValueAtTime(.001, t + .4);
        osc.connect(vol); vol.connect(salida);
        osc.start(t); osc.stop(t + .45);
      },
    });

    // ---------- BANDEJAS: una perilla de efecto ----------
    gp.efecto({
      id: 'mi-efecto',
      nombre: 'Filtro',        // hasta 10 letras
      crear(ctx) {
        const filtro = ctx.createBiquadFilter();
        filtro.type = 'lowpass';
        return {
          entrada: filtro,
          salida: filtro,
          ajustar(valor, info) { filtro.frequency.value = 18000 * Math.pow(.02, valor); }, // valor: 0 a 1. info.bpm: el tempo
        };
      },
    });

    // ---------- BANDEJAS: un botón que dispara un sonido ----------
    gp.boton({
      id: 'mi-boton',
      nombre: 'Bip',           // hasta 10 letras
      detalle: 'Qué hace',
      tocar(ctx, salida, t) {
        const osc = ctx.createOscillator(), vol = ctx.createGain();
        osc.frequency.value = 880;
        vol.gain.setValueAtTime(.3, t);
        vol.gain.exponentialRampToValueAtTime(.001, t + .2);
        osc.connect(vol); vol.connect(salida);
        osc.start(t); osc.stop(t + .25);
      },
      // soltar(ctx, t) { ... }   // opcional: al levantar el dedo
    });

    // ---------- BANDEJAS: otra pinta, con CSS ----------
    // gp.estilo('#dj .disc{filter:hue-rotate(120deg)}');

    // ---------- VISUAL: un estilo nuevo para el video vertical ----------
    gp.visual({
      id: 'mi-visual',
      nombre: 'Mi visual',
      detalle: 'Cómo se ve, en una línea.',
      dibujar(g, v) {            // g: contexto 2D de un canvas de 720 × 1280
        g.fillStyle = '#060b08'; g.fillRect(0, 0, v.W, v.H);
        g.fillStyle = v.color;
        g.beginPath(); g.arc(v.W / 2, v.H / 2, 120 + v.bombo * 80, 0, Math.PI * 2); g.fill();
      },
    });
  },
});
