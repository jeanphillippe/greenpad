# GREENPAD

La página principal (`index.html`) es **GREENPAD** (ver más abajo). La caja de ritmos original quedó en `mini.html` y se describe primero.

Caja de ritmos y secuenciador de 16 pasos, inspirada en el drumpad de la consola. Tiene 4 pistas de batería y 4 melódicas (bajo, guitarra, acordes y melodía). Tema oscuro verde por defecto (hay tema claro en el menú). Corre en el navegador del teléfono y de la compu, funciona offline y guarda todo en el dispositivo (localStorage), sin base de datos.

## Actualizaciones

- **Ajustes** (`greenpad-v1.28.1`): sin Node ni build, `index.html` vuelve a ser el archivo que se edita y la app se actualiza sola comparando la huella de la página publicada. En el teléfono, los pasos y las tablas de `plugins.html` y `temas.html` ya no se cortan palabra por palabra. "Mandar mi plugin" y "Mandar mi tema" abren un mail a hello@jeanphillippe.com con el asunto y un texto para completar.
- **Plantillas, variación y temas** (`greenpad-v1.28.0`): en el menú, **Plantillas de canción** arma un tema nuevo con las partes (Intro, Estrofa, Estribillo, Puente o Solo, Cierre) en tracks con nombre, el orden de la canción y la batería de cada parte; bajo, guitarra, acordes y melodía los suma quien hace el tema, y el cierre viene vacío. **Variación** (en el panel del track, en el menú o con la tecla `F`) copia el track a uno libre con cambios chicos. **temas.html** es la página de temas de la comunidad, enlazada desde el menú y el pie.
- **Siempre al día** (`greenpad-v1.27.0`, ajustado en `v1.28.1`): cada visita con internet trae la última versión y sin conexión abre la copia guardada (si la red tarda más de 4 segundos, también). Si GREENPAD quedó abierto en segundo plano, al volver se fija si el `index.html` publicado cambió (su huella, el ETag de Cloudflare) y se recarga sola cuando no molesta (sin sonar, sin ventanas abiertas, sin grabar ni video cargado); si la persona la está usando, espera a que pase a otra app o la deje un minuto quieta, y avisa "GREENPAD se actualizó". No hace falta subir ningún número de versión ni correr nada antes de subir. La primera instalación baja la página una sola vez (antes dos) y ya no precarga `mini.html` ni `plugins.html`. Bandejas con el teléfono acostado: los dos discos grandes uno al lado del otro, tracks y FRENO / REBOBINAR entre ambos, crossfader abajo y la mezcla debajo (deslizando).
- **Mano 3.3: acomodar a mano** (plugin): en ⋯, ACOMODAR deja arrastrar cada almohadilla y cada botón para moverlo y cambiar su tamaño con el punto amarillo del borde o pellizcando con dos dedos (sin tener que apoyar los 5 dedos a la vez). 5 DEDOS sigue como atajo: acomoda todo a la mano apoyada y después se ajusta a mano. LISTO guarda la distribución en el equipo; COMO AL PRINCIPIO vuelve a la de la foto. La barra de acomodar se corre al otro lado si se agarra algo cerca de ella.
- **Mano 3.2: voz en loop y grilla** (`greenpad-v1.26.0`): cada micrófono de Mano tiene su ↻: mantenido apretado graba la voz en tiempo (hasta un compás) y al soltar la deja en la fila de un instrumento libre del track (o la que ya tenía ese micrófono) como una nota en el paso donde empezó, con su corrimiento exacto, y suena en loop. El botón GRILLA de Mano lleva a la grilla sin cortar la música ni la grabación, y el botón MANO de abajo vuelve. En la grilla, cada nota grabada en vivo se ve corrida dentro de su cuadro según cuándo se tocó (con una rayita en el centro del paso). La API de plugins suma el corrimiento en `gp.poner(pista, paso, nota, corrimiento)`, `gp.ultimaGrabacion()` y `gp.pararGrabacion(cancelar, callado)`.
- **Mano 3.1: loops y micrófono** (`greenpad-v1.25.0`): cada instrumento tiene un botón LOOP chico arriba (o abajo, o al costado) de su almohadilla; mientras se mantiene apretado, lo que se toca en ese instrumento reemplaza su ritmo en el track y queda sonando (si la música estaba quieta, arranca; con un LOOP apretado los demás instrumentos suenan sin grabarse; dos toques lo borran). Tres botones de micrófono en el rincón libre: mantener apretado graba un sonido en las grabaciones 1 a 3 (hasta 8 segundos), un toque corto lo escucha sin pisarlo, y después cualquier instrumento puede usarlo eligiendo MIC 1, 2 o 3 entre sus sonidos (mantener apretado y deslizar). La API de plugins suma `gp.misGrabaciones`, `gp.tocarGrabacion`, `gp.usarGrabacion` y `gp.pararGrabacion(cancelar)`.
- **Tiempo exacto, filtro y Mano 3.0** (`greenpad-v1.24.0`): lo que se graba en vivo (con REC o desde Mano) queda en el paso más cercano de la grilla pero guarda cuánto se corrió del paso (`S.mt`, de -50 a 50 % del paso) y suena en el momento exacto en que se tocó, también en las bandejas y en Descargar; editar esa nota a mano la vuelve a su paso (el corrimiento no viaja en el .txt ni en Copiar enlace). Filtro general nuevo en la cadena de efectos (`S.fx.flt`, de -1 solo graves a 1 solo agudos). La API de plugins suma `gp.efectos`. Mano 3.0: fondo oscuro con estrías en diagonal, sin tracks ni grilla a la vista, una fila de perillas (FILTRO, REVERB, ECO, LO-FI, VINILO) arriba de los dedos (abajo si los dedos quedan muy arriba), y los dedos quedan exactamente donde se apoyaron al acomodar.
- **Herramienta Mano 2.0** (plugin): los 8 instrumentos a mano, sin cambiar de grupo, en la distribución dibujada por Phillippe. Con la mano quieta: pulgar BOMBO (el más grande), índice CAJA, medio HI-HAT, anular PERCU y meñique BAJO; moviendo un poco los dedos, GUITARRA y ACORDES del lado de la palma y MELODÍA más allá de las puntas. Mantener apretado cualquier almohadilla y deslizar a los costados cambia su sonido. Los tres puntos chicos al lado del pulgar: grabar, terminar y más (vueltas por track, clic, mano derecha o izquierda, acomodar). Acomodar pone los 5 dedos donde se apoyaron y mueve, gira y escala el resto igual que la mano. Fondo de tapete antiestático verde, con grilla y reglas impresas. Teclado: Espacio, F, D, S, A, J, K, L, ← →, R y Esc.
- **Herramienta Mano** (plugin, `greenpad-v1.23.0`): tocar y grabar con la mano apoyada en la pantalla. Cuatro almohadillas quedan donde caen los dedos (ACOMODAR pide apoyar los 5 dedos y las pone justo ahí, mano derecha o izquierda) y una más grande bajo el pulgar, que cambia entre BATERÍA y MELODÍA (tocarlo cambia; mantenerlo cambia mientras se tiene). En los melódicos la altura sale de dónde se apoya el dedo y deslizarlo toca cada nota que cruza. Alrededor del pulgar: estilo anterior y siguiente del último instrumento, grabar y terminar. Grabar pasa de un track al siguiente vacío (1, 2 o 4 vueltas por track, con los mismos instrumentos) y al terminar arma la canción con lo grabado y pide el nombre del tema, que queda en Mis beats. En la compu: A S D F, Espacio, ← →, R y Esc. La API de plugins suma `gp.enVivo`, `gp.grabarEnVivo`, `gp.play`, `gp.parar`, `gp.modoCancion`, `gp.siguiente`, `gp.estilos`, `gp.estiloDe`, `gp.elegirEstilo`, `gp.ponerCancion`, `gp.sumarACancion` y `gp.guardarComo`; un golpe grabado justo al final del compás cae en el paso 1 del track que entra.
- **Intro más directa y guía de plugins con IA** (`greenpad-v1.22.0`): la intro tiene una frase corta y un Play grande que arranca con un estilo al azar de los que mejor suenan; los demás estilos quedan chicos y quietos debajo. Un globito, sin cortar nada, explica que tocar un ícono de instrumento lo hace sonar y mantenerlo apretado lo cambia. En `plugins.html`, "Hacé tu plugin" empieza con 3 pasos y unas instrucciones para copiar y pegar en una IA junto con lo que se quiere hacer; la guía completa queda plegada abajo.
- **Visual Liquid A 4.0** (plugin): en vez de bolitas, un líquido negro y espeso sobre un parlante en 3D (WebGL). Es un fluido de partículas: se empujan cuando están muy juntas, se atraen cuando se separan un poco y se frenan entre vecinas (espesor). Por la pendiente del cono resbala al centro y se junta alrededor de la tapa. El bombo empuja el cono y hace saltar el charco (con los bombos fuertes salen chorros lejos o hacia la cámara), la caja salpica en un punto al azar, los hi-hats sueltan gotitas, los medios lo hacen girar y siempre cae líquido nuevo desde arriba. Para dibujarlo, cada partícula suma una mancha suave en una imagen a media resolución y donde se juntan se pinta una sola superficie con los brillos de las dos luces; las que pasan cerca de la cámara se ven desenfocadas. Siguen la cámara que cambia de plano cada 2 compases, las sombras en pantalla, el espectro, los pasos y la tipografía.
- **Herramientas: Onda y Shadow** (`greenpad-v1.21.0`): plugins de un tipo nuevo, Herramienta. Onda muestra la onda de lo que suena sobre la barra de la canción mientras armás el tema. Shadow guía para volver a armar un tema ya hecho (por ejemplo, mientras se filma). La API de plugins suma `gp.herramienta`, `gp.zona`, `gp.analizador`, notas, marcas y los avisos `toque`, `track` y `cambio`.
- **Recordings and UX improvements** (`greenpad-v1.20.1`): 5 grabaciones de cualquier sonido, cortadas solas en trozos para repartir en los instrumentos con un toque (y Repartir en batería); grabar manteniendo apretado; GRABACIONES 1 a 5 en las bandejas; los plugins de bandejas pasan abajo de los dos canales; cabecera más liviana (2 filas en el teléfono) con el botón AMBIENTE al lado de los tracks y un aviso para elegir el ambiente al empezar las melodías de un track.

## Archivos

| Archivo | Para qué |
|---|---|
| `mini.html` | Greenpad Mini, toda la app: estilos, motor de audio (Web Audio, sonidos sintetizados, sin samples) y lógica |
| `index.html` | GREENPAD: toda la app en un archivo (se edita directo) |
| `sw.js` | Service worker: uso sin conexión y actualización sola. `VERSION` es el nombre de la caché: subilo solo si cambiás `sw.js` |
| `manifest.webmanifest` | Permite "Agregar a pantalla de inicio" a Greenpad Mini como app |
| `icon.svg`, `icon-*.png` | Íconos |
| `temas.html` | Temas de la comunidad: la lista `TEMAS` de arriba del script se edita a mano |
| `_headers` | Cabeceras para Cloudflare Pages (sin caché para `index.html`, `mini.html`, `plugins.html`, `temas.html` y `sw.js`) |

No hay build, ni dependencias, ni `package.json`: los archivos se editan y se suben tal cual.

## Subir a Cloudflare Pages (gratis)

1. Crear un repo en GitHub con el contenido de esta carpeta y hacer push.
2. En Cloudflare: **Workers & Pages → Create → Pages → Connect to Git**, elegir el repo.
3. Configuración de build:
   - Framework preset: **None**
   - Build command: *(vacío)*
   - Build output directory: `/`
4. Deploy. Cada push a la rama principal publica una versión nueva.
5. Opcional: agregar un dominio propio en **Custom domains**.

Cuando cambies GREENPAD, editá `index.html` y subilo: los teléfonos que ya la tienen bajan la versión nueva en la próxima visita con internet, y si la tenían abierta se recarga sola cuando no molesta. Lo mismo con `mini.html`, `plugins.html`, `temas.html`, los plugins y los `.txt`. `VERSION` en `sw.js` se sube solo si cambiás `sw.js`.

Para probar en local: `python3 -m http.server 8080` dentro de la carpeta y abrir `http://localhost:8080` (GREENPAD) o `http://localhost:8080/mini.html`. El service worker solo se registra en https.

## Instrumentos y estilos

| # | Instrumento | Estilos |
|---|---|---|
| 1 | Bombo | Estudio, Electro, 8-bit, Punch |
| 2 | Caja | Estudio, Electro, 8-bit, Rimshot, Chasquido |
| 3 | Hi-hat | Estudio, Electro, 8-bit, Abierto, Semiabierto, Ride |
| 4 | Percu | Palmas, Clap 808, 8-bit, Shaker, Pandereta, Conga, Tom, Crash |
| 5 | Bajo | Eléctrico, Sub 808, 8-bit, Acid, Contrabajo |
| 6 | Guitarra | Acústica, Eléctrica, 8-bit, Funk, Nylon, Limpia (eléctrica sin distorsión) |
| 7 | Acordes | Piano, Stab, 8-bit (arpegio), Órgano, Pad |
| 8 | Melodía | Marimba, Lead, 8-bit, Campana, Flauta |

- El nombre del estilo se ve debajo de cada ícono. **SONIDO** (arriba) pone a todos los instrumentos del patrón actual en Estudio, Electro, 8-bit o Especial; si cada uno tiene uno distinto dice "MIXTO".
- Tocar un ícono lo hace sonar. Mantenerlo apretado (o clic derecho, o mantener la tecla 1 a 8) abre su panel: estilo, afinación ±12 semitonos, volumen, silenciar y solo.
- **Capas:** en ese panel, el **+** de cada estilo lo suma encima del elegido (por ejemplo bombo Estudio + Sub 808). El ícono muestra "+1", "+2".

## Bandejas (segunda pantalla)

El botón del disco, al lado de Play (o la tecla `B`), cambia entre la grilla y las bandejas. Las dos pantallas comparten el mismo beat y el mismo tempo.

- **Dos bandejas, A y B.** Cada una toca el patrón que elijas con las letras de arriba del disco. Si cambiás de patrón mientras suena, entra en el próximo tiempo.
- **Crossfader** (abajo en el centro): pasa de una bandeja a la otra. Los botones A y B lo llevan de golpe a cada punta.
- **Scratch:** arrastrá un disco con el dedo o el mouse. La velocidad y el sentido del giro son la velocidad y el sentido del audio (usa los últimos segundos de esa bandeja).
- **FRENO:** el disco se detiene como un tocadiscos. Tocalo otra vez para soltarlo. **REBOBINAR:** lo tira para atrás un instante.
- **VOLUMEN** y **FILTRO** por bandeja (el filtro a la izquierda deja solo graves y a la derecha solo agudos; doble toque lo vuelve al centro).
- **AGUDOS, MEDIOS, GRAVES:** cortan esa parte del sonido de la bandeja.
- **Íconos de abajo:** apagan o prenden cada instrumento en esa bandeja, para armar la mezcla en vivo.
- **Centro:** REVERB, ECO, LO-FI (sonido gastado), VINILO (ruido de disco), MODO 90 (vinilo, polvo, algo de reverb y swing de una), GRABACIONES 1 a 5 y REPETIR 1/4, 1/8, 1/16 (mantenido repite el último pedacito en las dos bandejas).
- Los efectos también suenan en la grilla y se guardan con el beat.
- Las perillas se mueven arrastrando arriba/abajo, con la rueda del mouse o con las flechas si tienen foco.
- **Plugins:** si hay plugins de bandejas instalados, aparecen abajo de los dos canales, en el bloque PLUGINS.
- Scratch, freno, rebobinar y repetir usan AudioWorklet (Chrome, Edge, Firefox y Safari 14.1 o más nuevos).

## Grabaciones (estilo Koala)

- Sirve cualquier sonido, no solo cantar o hablar: palmas, chasquidos, golpes en la mesa, una lata, una puerta, un instrumento de verdad.
- El botón del micrófono (tecla `V`) tiene 5 grabaciones (1 a 5) de hasta 8 segundos cada una. Se recorta solo el silencio del principio y del final. El botón rojo se toca para empezar y otra vez para parar, o se mantiene apretado mientras se graba.
- Cada grabación se separa sola en **trozos** (cortes donde hay 60 ms de silencio o un golpe fuerte, hasta 12). Se elige un trozo tocándolo en la onda o en los números de TROZOS, o se arrastra sobre la onda para marcar un pedazo (las manijas de los bordes ajustan el inicio y el final).
- Tocar un instrumento le pone el pedazo elegido, sin cerrar la ventana: así cada instrumento del mismo track usa un trozo distinto de la misma grabación (comparten el audio). El número rojo en cada instrumento dice cuál usa (`2·3` = grabación 2, trozo 3). Tocar otra vez el mismo instrumento lo devuelve a su sonido normal.
- **Repartir en batería** reparte los trozos solo: lo más grave al bombo, lo más agudo al hi-hat y lo del medio a caja y percu (según el brillo de cada trozo).
- Si Grabar se abre desde un instrumento (botón Grabar de sus estilos), lo que se graba queda puesto ahí directamente.
- Teclado con la ventana abierta: `1` a `8` ponen el pedazo en ese instrumento, `←` `→` cambian de trozo, `↑` `↓` de grabación, `Enter` escucha y `Espacio` graba.
- Ajustes: las manijas de la onda para recortar, "Tono" para hacerla más grave o más aguda (±12 semitonos), y efectos al revés, eco y robot.
- Siempre suena completa (entre el inicio y el final elegidos), no se corta al largo del paso. Después de tocar un instrumento, los ajustes (manijas, tono, efectos) se aplican en vivo en ese instrumento; elegir otro trozo empieza un pedazo nuevo.
- En los melódicos la grabación sube y baja según la altura de cada paso; en la batería suena tal cual.
- Queda como estilo "Grabación" en el panel de ese instrumento: se puede volver a otro estilo o sumarla como capa.
- Se guarda en este dispositivo (IndexedDB) y viaja dentro del `.txt` exportado (sección `[GRABACIONES]`; los `.txt` viejos con `[VOCES]` se siguen leyendo). El enlace no la incluye.
- Para grabar, la página tiene que estar en https (Cloudflare Pages lo da) y el navegador pide permiso para el micrófono. En iPhone, si no lo pide, revisar Ajustes > Chrome (o Safari) > Micrófono.

## Sin saber música

- **Dado** (cabecera o tecla `D`): inventa un patrón completo donde bajo, guitarra, acordes y melodía combinan entre sí.
- **Inventar línea nueva** (en el panel de cada instrumento, o tecla `I` con el panel abierto): cambia solo ese instrumento y respeta lo que ya está.
- **AMBIENTE** (el botón al lado de las letras de los tracks): Oscuro, Triste, Alegre, Pop, Groove o Blues. Elige qué notas usan bajo, guitarra, acordes y melodía (la batería no cambia), así el mismo patrón suena oscuro, triste, alegre, etc. Cualquier altura combina.
- **Por patrón:** cada patrón (A a H) guarda su propio AMBIENTE, su SONIDO y el estilo de cada instrumento. Al mezclar o encadenar patrones, cada uno suena con lo suyo. En el `.txt` cada sección `[A]`, `[B]`... lleva sus líneas `AMBIENTE:` y `ESTILOS:`; las de la cabecera valen para los patrones que no las tengan.
- La nota base es opcional y está en el menú, en Sonido.

## Alturas

- Cada paso melódico tiene una altura del 1 (grave) al 8 (agudo). En la grilla se ve como un círculo más o menos lleno.
- Tocar un paso vacío pone la última altura elegida para ese instrumento. Mantenerlo apretado (o clic derecho) abre la lista de alturas; en la compu, pasar el mouse por la lista las hace sonar. También: rueda del mouse sobre el paso, o Shift + ↑ ↓ con el cursor.
- Acordes arma la tríada de la escala sobre ese grado.
- La nota dura hasta el siguiente paso con nota (máximo 4 pasos).
- La melodía usa una escala simplificada (pentatónica) en Oscuro, Alegre y Blues, así es difícil que algo desafine.

## Patrones A a H y mezcla

- Cada letra es una grilla distinta (por ejemplo A intro, B estrofa, C estribillo). Tocar la letra la edita.
- **Mezcla:** la casilla a la izquierda de cada letra (zona separada y más grande en pantallas táctiles) la suma a lo que suena. Las notas de los patrones tildados aparecen como fantasmas (contorno) en la grilla del patrón que estás editando. Tecla `Q` tilda el actual.
- **CADENA:** los patrones con notas suenan uno detrás de otro. Se puede combinar con la mezcla.
- Si cambiás de patrón mientras suena, entra al terminar el compás; tocarlo otra vez salta ya.

## Ejemplos

En el menú, 30 ejemplos. Noventas (con swing y efectos): Golden era, Guitarra 90, Trip hop, G-funk, Rap rock, Jazz rap. Trap y rap: Trap, Drill, Phonk, Trap melódico, Rage, Boom bap. Rock: Rock, Punk, Metal, Grunge, Rock nacional, Captura. Otros: Pop, Cumbia, Dembow, House, Techno, Lo-fi, Reggae, Funk, Disco, Bossa nova, Synthwave, Chiptune. Se cargan en el patrón actual con su tempo, swing, tono y estilos, y arranca a sonar. Los noventosos también ponen sus efectos (reverb, lo-fi, vinilo).

## Cómo guarda

- El beat en curso se guarda solo en el dispositivo a cada cambio.
- **Mis beats**: lista local de beats guardados. Un beat guardado se sigue actualizando solo.
- Si abrís otro beat o creás uno nuevo con un borrador sin guardar, el borrador se guarda como "respaldo" en Mis beats para no perderlo.
- Borrar los datos del navegador borra los beats: exportá un `.txt` para respaldar.
- Los beats de las versiones anteriores (Drumpa y Greenpad de 8 percusiones) se pasan solos: bombo, caja, hi-hat (cerrado y abierto juntos) y percu (palmas y shaker). Tom y crash viejos se descartan.

## Formato de texto (.greenpad.txt)

Se puede leer y editar a mano. Batería: `x` golpe, `.` silencio. Melódicos: `1` a `8` grado de la escala, `.` silencio. Los espacios dentro de la grilla se ignoran. Solo se exportan los patrones con notas.

```
# GREENPAD beat v3
NOMBRE: Mi beat
BPM: 118
SWING: 0
TONO: Mi menor
VOZ: LD=voz+eco+L80+I10+T-3
CADENA: no
MEZCLA: B
EFECTOS: reverb=20 eco=0 lofi=35 vinilo=si
ESTILOS: BD=Estudio SN=Estudio HH=Estudio PC=Crash BS=Eléctrico GT=Eléctrica+Nylon CH=Piano LD=Marimba
AFINACION: -
VOLUMEN: -
MUTE: -
ACTUAL: A

[A]
BOMBO     x... .... x.x. ....
CAJA      .... x... .... x...
HI-HAT    x.x. x.x. x.x. x.x.
PERCU     x... .... .... ....
BAJO      1.1. 1.1. 6.6. 7.7.
GUITARRA  1... 1... 6... 7...
ACORDES   .... .... .... ....
MELODÍA   .... .... .... ....
```

- `ESTILOS`: nombre del estilo (los espacios van con `_`, por ejemplo `Sub_808`) y las capas con `+`.
- `TONO`: nota en Do Re Mi o en letras (A, C#, Bb) más la escala.
- `EFECTOS`: reverb, eco y lo-fi de 0 a 100, vinilo si/no.
- `AFINACION` en semitonos y `VOLUMEN` en porcentaje; `-` deja todo por defecto.
- Nombres de pista aceptados: los de arriba, sus códigos `BD SN HH PC BS GT CH LD` o en inglés (KICK, SNARE, BASS, GUITAR, CHORDS, LEAD).
- También se importa el JSON interno, los textos de las versiones anteriores y los enlaces de "Copiar enlace" (el beat viaja dentro del enlace, sin servidor).

## Atajos de teclado

| Acción | Tecla |
|---|---|
| Play / pausa | Espacio |
| Stop | Esc |
| Tocar instrumento | 1 a 8 |
| Estilos del instrumento | mantener 1 a 8 |
| Silenciar instrumento | Shift + 1 a 8 |
| Solo | Alt + clic en el ícono |
| Mover cursor / marcar paso | Flechas / Enter o X |
| Subir / bajar nota | Shift + ↑ ↓, o rueda del mouse |
| Patrón anterior / siguiente | `,` `.` o `[` `]` |
| Ir a patrón A a H | Alt + 1 a 8 |
| Mezclar el patrón actual | Q |
| Tempo ±1 / ±10 | `+` `-` / RePág AvPág |
| Tap tempo | T |
| Grabar en vivo | R |
| Encadenar patrones | C |
| Sonido para todos | K |
| Inventar patrón (dado) | D |
| Variación del track | F |
| Grabar un sonido | V |
| Borrar patrón | Supr |
| Deshacer / rehacer | Ctrl+Z / Ctrl+Y |
| Copiar / pegar patrón | Ctrl+C / Ctrl+V |
| Guardar en Mis beats | Ctrl+S |
| Exportar / importar | Ctrl+E / Ctrl+O |
| Menú y ejemplos / ayuda | M / ? |
| Grilla / bandejas | B |
| Bandejas: patrón en A | Q W E R T Y U I (A a H) |
| Bandejas: patrón en B | A S D F G H J K (A a H) |
| Bandejas: crossfader | ← → (Shift: a la punta), ↓ al medio |
| Bandejas: repetir 1/4, 1/8, 1/16 | mantener Z, X, C |
| Bandejas: freno A / B | N / , |
| Pantalla video (solo GREENPAD) | J |
| Video: 1 segundo atrás / adelante | ← → (Shift: un compás) |

## En el teléfono

- Vertical: la grilla se gira (instrumentos en columnas, pasos hacia abajo) y ocupa todo el ancho. Si no entra de alto, se desplaza deslizando el dedo por los márgenes de los costados o por la franja entre batería y melódicos, y sigue sola a la reproducción. Horizontal: igual que la consola.
- Tocar y arrastrar sobre los cuadros pinta o borra varios pasos.
- Mantener apretado un ícono abre sus estilos; mantener apretado un paso melódico abre las notas.
- No se hace zoom al tocar varias veces seguidas ni con dos dedos (en iPhone y iPad también).
- Las tablets paradas usan la misma pantalla que el teléfono parado, con el logo arriba entre el tempo y las herramientas. En tablets acostadas (y pantallas de 900 a 1240 px de ancho) el logo va al final de la fila de la canción; en bandejas, arriba a la derecha. En el teléfono el logo se ve en el menú.
- Bandejas en vertical: los dos discos arriba, la mezcla con el crossfader en el medio y los controles de cada bandeja abajo.
- En iPhone, si no suena, revisar el interruptor de silencio.
- Modo liviano (menú, Sonido): reverb más corta, menos sonidos superpuestos y la animación de fondo a la mitad de cuadros. Se activa solo si el reloj de audio se atrasa (el equipo no da abasto) y queda guardado en ese dispositivo.

## Rendimiento (notas técnicas)

- Cada golpe arma su propio grupo de nodos de audio. Al terminar se desconecta a mano, porque Safari no libera solo los nodos que siguen conectados y con el tiempo se va poniendo lento.
- Hay un tope de sonidos a la vez por instrumento (el más viejo se apaga suave) y un tope general (40 en táctiles, 72 en la compu).
- Caja, hi-hat y percu se pre-renderizan una vez por estilo y afinación, y después cada golpe es un solo nodo. El bombo sigue sintetizado en vivo para que pegue en fase con el bajo.
- Las cuerdas (Karplus-Strong) usan búferes más chicos con afinación exacta y una caché de 48 notas.
- Con lo-fi en 0 la señal no pasa por sus filtros, el vinilo apagado no procesa nada y en la grilla la bandeja A va directo (sin filtros ni scratch).

## GREENPAD (`index.html`, la página principal)

Versión pensada para armar canciones enteras con instrumentos grabados de verdad. Tiene sus propios beats guardados (no se mezclan con los de Greenpad Mini) y se abre en la dirección principal (`/`). Antes se llamaba `banda.html`.

### Archivos extra

| Archivo | Para qué |
|---|---|
| `index.html` | La app GREENPAD completa |
| `banda.webmanifest` | "Agregar a pantalla de inicio" abre GREENPAD directo |
| `sonidos/` | 330 grabaciones mp3 (unos 7,5 MB). Solo se bajan las que usa el tema, y quedan guardadas para usar sin conexión |
| `sonidos/CREDITOS.txt` | De dónde sale cada grabación y su licencia |
| `lame.min.js` | Conversor a MP3 para Descargar (lamejs, LGPL 3.0) |
| `frases.txt` | Frases que aparecen sobre el logo (una por línea) |
| `acerca.txt` | Texto de "Acerca de" (hasta 3 párrafos) |
| `caveat-bold.woff2` | Letra de la frase del logo (Caveat Bold, SIL Open Font License 1.1) |

Para probar en local hace falta el servidor (`python3 -m http.server 8080`): abriendo el archivo directo, el navegador no deja leer la carpeta `sonidos/` y suena el sintetizado.

### Sonidos grabados

SONIDO tiene cuatro familias: **Banda** (micrófono cerca), **Acústico** (la misma batería con aire de sala), **Noventa** (grabación gastada, de disco viejo) y **Electro** (los sintetizados de Greenpad).

| # | Instrumento | Estilos |
|---|---|---|
| 1 | Bombo | Banda, Acústico, Noventa, 808, Legüero, Punch |
| 2 | Caja | Banda, Acústico, Noventa, Caja 808, Aro, Rimshot, Palmas, Chasquido |
| 3 | Hi-hat | Banda, Acústico, Noventa, Hat 808, Abierto, Semiabierto, Ride, Campana |
| 4 | Percu | Pandereta, Conga, Shaker, Clap 808, Crash, Tom, Tom grave, Bongó, Cencerro, Claves, Palmas |
| 5 | Bajo | Eléctrico, Contrabajo, Apagado, Sub 808, Acid |
| 6 | Guitarra | Eléctrica, Acústica, Jazz, Saturada, Criolla, Muteada, Rasguido |
| 7 | Acordes | Piano, Rasguido, Piano viejo, Pad, Órgano, Vibráfono, Stab |
| 8 | Melodía | Saxo, Flauta, Vibráfono, Lead, Marimba, Trompeta, Campanita, Armónica |

- La batería tiene varias capas de fuerza y varios golpes distintos por capa: un golpe suave suena distinto a uno fuerte, y dos golpes seguidos nunca son el mismo.
- **Rasguido** arma el acorde como en una guitarra de 6 cuerdas y lo toca hacia abajo y hacia arriba según el paso.
- **Saturada** toca un power chord grabado que pasa por un amplificador con distorsión.
- Los instrumentos melódicos suenan más brillantes cuanto más fuerte se tocan.
- Mientras una grabación no llegó, suena el sintetizado de Greenpad. Al darle Play la primera vez espera unos segundos a que lleguen ("Afinando la banda").

### Destiempo

El botón **DESTIEMPO** (al lado de SONIDO) tiene 4 niveles: apagado, 35, 65 y 100%. En el menú hay un control fino. Cada golpe sale con un poco más o menos de fuerza (acentos en los tiempos, hi-hat más suave entre tiempos, caja apenas atrás) y unos milisegundos corrido, como tocado por una persona. Apagado queda exacto, como una máquina.

### Mezcla por patrón

Cada patrón guarda su propia mezcla: si estás editando H y tildás B y C, H suena siempre con B y C, en la grilla, en la canción y en las bandejas. Los demás patrones no se ven afectados. En las bandejas los patrones mezclados se marcan con un borde y al lado del nombre aparece "+B +C". Los `.txt` y beats viejos (una sola mezcla para todo) se pasan solos: cada patrón queda con esa mezcla.

En el `.txt`, cada sección de patrón puede llevar su línea `MEZCLA: B C`.

### Grabaciones

- El micrófono (tecla `V`) graba un sonido en una de las 5 grabaciones y tocar un instrumento le pone el pedazo elegido **solo en el patrón que estás editando**. En los otros patrones ese instrumento sigue sonando normal, y cada patrón puede usar una grabación distinta en el mismo instrumento.
- Si una grabación larga sigue sonando cuando pasás a un patrón donde el instrumento es normal, se apaga sola para no tapar al instrumento.
- En el `.txt` cada patrón lleva `GRABACION: BS=g1+eco+L90` y las grabaciones van una sola vez al final, en la sección `[GRABACIONES]`. Los `.txt` viejos (con `VOZ:` y `[VOCES]`) se siguen importando.
- **Bandejas:** en el centro hay cinco botones, GRABACIONES 1 a 5. Mantenido apretado suena mientras lo tenés; con un toque corto queda sonando en loop hasta que lo volvés a tocar. Pasa por REVERB, ECO y LO-FI. En la compu, teclas `O`, `P`, `L`, `Ñ` y la que sigue a la `Ñ`.

### Canción

La barra debajo de la cabecera es la línea de tiempo.

- **+ A** (o tecla `G`) suma el patrón que estás editando. Si el último bloque es el mismo patrón, le suma una vuelta.
- Tocar un bloque lo elige: aparecen botones para moverlo, tocarlo más o menos veces, duplicarlo o quitarlo. Play arranca desde el bloque elegido.
- **AUTO** arma una estructura con intro, verso y estribillo usando los patrones que tienen notas.
- **CANCIÓN** (tecla `L`) prende el modo canción: Play toca la línea de tiempo de principio a fin. Apagado, Play repite el patrón como en Greenpad.
- Mientras suena, tocar un bloque salta a ese bloque al terminar el compás.
- El botón de flechas repite la canción. Apagado, el tema termina con el último compás y se frena (no se agrega ningún platillo: el cierre lo arma quien hace el tema en la grilla).
- El ancho de cada bloque muestra cuánto dura, y arriba a la izquierda se ve el tiempo total y por dónde va.

En el `.txt` se agregan estas líneas (los .txt de Greenpad se importan igual; los estilos viejos se pasan a los nuevos por nombre):

```
CANCION: Ax2 Bx2 Ax2 Bx2 Cx2 Bx4
MODO: cancion
REPETIR: si
DESTIEMPO: 60
```

El enlace de "Copiar enlace" también lleva la canción, el destiempo y la mezcla de cada patrón (las grabaciones no, para eso está el `.txt`).

### Plantillas de canción

En el menú, **Plantillas de canción** (Trap, Trap melódico, Hip hop, Rock, Rock nacional, Funk, Cumbia, Reggaetón, Pop y Lo-fi) arma un tema nuevo (el anterior, si no estaba guardado, queda en Mis beats):

- Cada parte va en un track con nombre: A Intro, B Estrofa, C Estribillo, D Puente (o Solo), E Cierre. Los demás quedan libres.
- La canción ya trae el orden (por ejemplo `Intro×2 Estrofa×4 Estribillo×4 Estrofa×4 Estribillo×4 Puente×2 Estribillo×4 Cierre`) y queda prendida.
- Tempo, sonidos, ambiente y efectos salen del ejemplo del mismo género.
- Solo trae batería, con más o menos fuerza según la parte: la intro marca el pulso, la estrofa lleva el ritmo, el estribillo suma el platillo o el clap, el puente va a media velocidad. Bajo, guitarra, acordes y melodía los suma quien hace el tema. El **Cierre viene vacío**: lo arma quien hace el tema.
- El nombre de cada parte se ve debajo de la letra en los bloques de la canción y en el panel del track. Viaja en el enlace y en el `.txt`, con una línea `SECCION: Estribillo` en el track. Las plantillas se cambian en `PLANTILLAS`, en `index.html` (nombre, ejemplo del que salen los sonidos, destiempo y partes con sus compases).

### Variación

**Variación** (en el panel del botón AMBIENTE, junto a Borrar track; en el menú, sección Track; o tecla `F`) copia el track que se edita al próximo track libre (vacío, sin nombre de parte y que no esté en la canción) con cambios chicos: más o menos golpes de hi-hat y bombo, un redoble en el último tiempo, el bajo que salta de octava y la melodía que cambia la segunda mitad. La armonía no cambia, así que combina con el original. Si el track tenía nombre de parte, la variación se llama igual con un 2 (Estribillo 2). Si no gusta, Deshacer.

### Temas de la comunidad (`temas.html`)

Página con temas hechos con GREENPAD, enlazada desde el menú (sección Temas) y desde el pie (TEMAS). Cada tema se abre en GREENPAD con un toque (queda en Mis beats) y se puede copiar su enlace. Muestra tempo y duración, leídos del propio enlace, y un filtro por género que se arma solo.

Para sumar uno, agregá una línea en `TEMAS`, arriba del script de `temas.html`: `nombre`, `autor`, `genero`, `descripcion` y `enlace` (el de "Copiar enlace"; se puede pegar entero). El botón "Mandar mi tema" abre un mail a `ENVIAR` (hello@jeanphillippe.com) con el asunto `ASUNTO` y un texto `TEXTO` para completar; los tres están arriba del script. Los temas con grabaciones o instrumentos de plugins no viajan enteros por enlace: para esos está el `.txt`.

### Descargar

El botón verde de la flecha (en la compu y la tablet, en la fila de herramientas) abre **Descargar**. En el teléfono está en el menú, en Track (Descargar canción).

- **Título:** el que pongas queda como nombre del tema y se guarda en Mis beats (si no estaba guardado, se guarda solo). Es también el nombre del archivo.
- **Qué:** la canción completa (como suena en modo canción: termina con el último compás, sin agregar nada) o el patrón que estás editando, de 1 a 8 vueltas, con su mezcla.
- **Audio MP3:** liviano (192 kbps), para mandar o subir. Usa `lame.min.js` (lamejs, licencia LGPL 3.0), que se carga solo cuando hace falta.
- **Audio WAV:** calidad máxima, 44,1 kHz estéreo.
- **Video vertical 9:16** (720 × 1280, 30 cuadros): casi sin texto (solo título, BPM y el logo de Greenpad). Siete estilos, que quedan recordados en cada equipo (quien tenía elegido Marea, que se sacó, pasa a Diente de león):
  - **Caracol:** arriba el logo, el título y los BPM. En el centro, un anillo de barras que crecen con las frecuencias como un caracol (graves arriba, girando en sentido horario; cada barra ajusta su propio nivel, así los agudos de la izquierda se mueven tanto como los graves), los 16 pasos marcados alrededor y un círculo que late con el bombo. Abajo, los íconos de los instrumentos se prenden con su color cuando suenan, y una barra muestra las partes de la canción en color y por dónde va. Va con cualquier tema.
  - **Revista:** papel con grano, tinta negra y un color de imprenta por parte de la canción. El tempo en números grandes que se llenan con el bombo, un círculo de semitono con ondas que salen del centro, con un degradado blanco detrás, y la onda del sonido en tinta, recta, cruzando el centro del círculo. De fondo, 7 barras verticales naranjas y suaves, de lado a lado de la pantalla (cada una junta varias frecuencias), que suben desde abajo con el sonido hasta el alto completo (graves a la izquierda, agudos a la derecha). Título en serif itálica sobre una franja de papel y, debajo, solo la barra de avance de la canción. Ideal para temas con guitarras y banda.
  - **Neón:** brillos, chispas, anillos que giran y la grilla del logo que se prende. Para trap y electrónica.
  - **Flor:** una flor de bordes bien marcados (contorno oscuro y borde claro, tipo sticker) sobre un fondo oscuro en degradado que gira despacio, con círculos que suben. Hojas que se balancean con el pulso; tres capas de pétalos: los de afuera se mueven con medios y agudos, los del medio con los medios y los de adentro con los graves. Con cada bombo la flor se abre, sale una onda y vuela polen. En el centro, los 16 pasos como semillas.
  - **Flor 3D:** un loto en 3D dibujado con WebGL (viene en el navegador, sin librerías) y armado con la sucesión de Fibonacci y la proporción áurea: 21 pétalos en tres capas de 5, 8 y 8 (todos números de Fibonacci), cada capa girada el ángulo áureo (137,5°) respecto de la anterior, con el largo creciendo en proporción φ hacia afuera y el ancho sacado del largo dividido φ. Con poco sonido queda cerrado como un capullo abultado (panzón abajo, con las puntas finas que se juntan arriba y las de afuera apenas abiertas) y con mucho sonido se abre del todo; mientras está cerrado se ve más cerca y al abrirse la cámara se aleja un poco: el nivel sale de la mezcla misma, comparado con las partes más fuertes del tema, sube rápido con cada golpe y baja más despacio, así la flor respira. Cada capa tiene su forma cerrada y su forma abierta y va de una a otra con resortes de distinto peso (se mueven con desfase); la música además abre zonas de la flor (8 direcciones por capa, cada una con su banda), las puntas se mueven con los agudos y la flor cabecea con el bombo. No se atraviesan: todos los pétalos de una capa se apoyan sobre la misma superficie y cada uno se levanta de a poco de un borde al otro, como las hojas del diafragma de una cámara, así donde dos vecinos se solapan uno queda siempre encima; una capa de adentro nunca se abre más que la de afuera y las formas están medidas para que entre capas siempre quede lugar. Las puntas se doblan con la música: cada zona de la flor sigue su banda, los pétalos de adentro se cierran sobre el centro y se doblan más, los del medio levantan la punta y los de afuera la levantan en silencio y la tiran hacia afuera con el sonido; como el doblez va en la superficie de la capa, los vecinos se doblan juntos y no se cruzan. Color: cada pétalo va de un tono claro y cálido en el centro al color de la flor y a uno más profundo afuera; el color gira alrededor del color de la parte, más rápido cuanto más suena, la caja lo sacude, cada pétalo se enciende con su banda y cada bombo larga una ola de luz que sale del centro y recorre los pétalos. Detrás, una luz del color de la flor que late con los graves. En el centro, el cono del loto con las 16 semillas de los pasos en espiral áurea (se prende la del paso que suena), sin estambres; su tamaño se ajusta a la capa de adentro, así con la flor cerrada queda escondido y crece cuando se abre. El tallo es largo y se corta en el borde del video. Luz con sombras entre pétalos y contorno de grosor variable. De fondo, 7 barras naranjas y suaves como en Revista. Si el equipo no tiene WebGL, se dibuja una versión 2D más simple.
  - **Grilla:** la familia de Revista impresa en papel oscuro con grano (no hay fondo blanco). Adelante, como en Revista: el tempo en números grandes en contorno que se llenan con el bombo, el círculo de semitono con los 16 pasos marcados alrededor, la onda del sonido en crema cruzando el círculo y el título en serif itálica. Atrás, en segundo plano y en tono bajo, la grilla tal como se ve en el teléfono parado: una columna por instrumento con su ícono y su nombre arriba (batería a la izquierda, melódicos a la derecha) y los 16 pasos hacia abajo, con las notas de la parte que suena (y de los tracks sumados a la mezcla); en los melódicos el círculo se llena según la altura de la nota. En reposo casi no se ve; cada golpe la ilumina: la celda salta, brilla y abre un anillo, la columna se enciende con el color del instrumento y el ícono de arriba se prende y crece. Cuando cambia la parte, las notas nuevas aparecen de arriba hacia abajo. Los instrumentos silenciados se ven apagados.
  - **Diente de león:** un diente de león de tallo verde sobre tinta flotando en agua, como una hidroimpresión, dibujado en 2D. El fondo arranca como una película de franjas en diagonal (negro, blanco, lavanda, violeta y una franja fucsia gruesa) ya marmolada, y la tinta se mueve con la música: cada golpe deja caer una gota que empuja la tinta que ya estaba (así se forman los anillos y las vetas, como en el marmolado). El bombo cae cerca de la flor y abre de golpe, el hi-hat salpica chiquito, el bajo y los acordes se expanden más despacio, y en bajo, guitarra, acordes y melodía la altura de la nota decide dónde cae la gota (aguda arriba, grave abajo, y la grave más grande), así la melodía va dibujando el fondo. Los colores siguen el AMBIENTE de cada parte (Triste: celeste y lila o turquesa y coral; Pop: rosa y menta o naranja y azul; Oscuro: violeta y fucsia o verde y azul noche; Alegre: naranja y azul o dorado y violeta; Groove: turquesa y coral o dorado y violeta; Blues: rojo y crema o celeste y lila) y cada 8 compases alterna entre los dos de ese ambiente: al cambiar cae una gota grande del color nuevo y pasa un peine. Cada sonido usa siempre la misma tinta del juego (el bombo el color fuerte, la caja la clara, el bajo la profunda, y en los melódicos la nota: grave oscura, aguda clara). Con el bombo late una luz del color fuerte alrededor de la flor, y el filo entre tintas brilla más con los medios y agudos. Además una corriente suave lleva la tinta en diagonal sin deformarla (más rápido con los graves, y cada 8 compases cambia de sentido) y cada dos compases un peine invisible la arrastra: una vez una línea, la otra varias paralelas que dejan vetas onduladas. Las manchas que quedan finitas como un hilo se borran solas, así el dibujo no se vuelve pesado en temas largos. Entre tintas hay un filo fino, y encima grano y un brillo suave. La vida de la flor sigue la canción: arranca como capullo (hojitas verdes detrás), se abre la flor amarilla (144 pétalos finos en 6 anillos, con la punta dentada), cerca de la mitad del tema, justo al empezar una parte (o si no, un compás), se deshace en semillas en un par de tiempos y los pétalos de afuera salen volando; al final el viento se lleva todas las semillas. Cada anillo de pétalos responde a dos instrumentos intercalados pétalo por pétalo (el de afuera a hi-hat y melodía, después percusión y guitarra, acordes y caja, el bajo y en el centro el bombo), y las semillas están repartidas por toda la bola: al sonar se estiran, toman su color y cambian de forma. Los pétalos y las semillas que se estiran demasiado con el sonido se desprenden y se van con el viento hasta salir de la pantalla (los pétalos caen, las semillas suben; el viento sopla en ráfagas con el pulso y cada bombo les da un empujón) y después vuelven a crecer; con la bola abierta, la caja y los melódicos además sueltan semillas. Como las miniaturas cuadradas recortan arriba y abajo, en este estilo los textos van chicos y de costado, dentro del cuadrado del centro: a la izquierda el título y los BPM leyendo de arriba hacia abajo, y a la derecha el logo GREENPAD y el avance de la canción en vertical con el color de cada parte.
  - En iPhone sale en MP4; en la compu, MP4 o WebM según el navegador. Tarda lo mismo que dura la canción: hay que dejar la pantalla prendida.
- El audio se mezcla sin tocar en tiempo real (más rápido) con los mismos sonidos, efectos, mezclas y destiempo, y se ajusta el volumen para que quede fuerte sin recortar.
- Al terminar aparece para escucharlo, **Descargar** y, en el teléfono, **Compartir** (en iPhone, Compartir > Guardar video lo deja en Fotos).
- **Grabar en vivo** está en el panel del botón AMBIENTE (teléfono) y en el menú, en Track. La tecla `R` sigue igual.

### Botón AMBIENTE y panel del track

- Al lado de las letras de los tracks hay un botón con el **AMBIENTE** del track que estás editando (Oscuro, Triste, Alegre, Pop, Groove o Blues), en el color de ese ambiente. En la compu y la tablet muestra además el SONIDO, el DESTIEMPO y la mezcla.
- Al tocarlo se abre el panel del track: AMBIENTE (un toque elige, con botones de colores), SONIDO, DESTIEMPO, **Sumar a la mezcla**, CADENA y las herramientas (Grabar en vivo y Grabar sonido en el teléfono, y Borrar track en todas las pantallas). Tocar la grilla, Escape o **Listo** lo cierra.
- **Elegir el ambiente:** al poner la primera nota de bajo, guitarra, acordes o melodía en un track vacío aparece un globo que pregunta qué ambiente tiene ese track. No frena nada: se puede seguir tocando, elegir uno o tocar **Después** (se cierra solo a los 14 segundos). Pregunta una sola vez por track; si ya se eligió el ambiente desde el panel, no pregunta.

### En el teléfono

Parado o acostado, la cabecera se compacta para que la grilla tenga más lugar (en la actualización Recordings and UX improvements pasó de 3 filas a 2, más la canción):

- Fila 1: Play, tempo, grilla/bandejas/video, dado, deshacer y menú.
- Fila 2: los tracks A a H y el botón AMBIENTE. Descargar y Borrar track pasan al menú (y Borrar track también al panel del track).
- Acostado, todo eso va en una sola fila.
- En bandejas, la fila 2 es la barra **MÁS** con Grabar en vivo y Grabar sonido.
- La canción ocupa una sola fila (el tiempo va dentro del botón CANCIÓN). Al tocar un bloque, sus herramientas aparecen en un globo debajo del bloque; **OK** lo cierra.

### Service worker y uso sin conexión

`sw.js` guarda cada página con su dirección limpia (`/`, `/mini`, `/plugins`: Cloudflare Pages redirige `index.html` a `/` y la copia se guarda sin esa redirección, que no sirve para abrir sin conexión) y guarda las grabaciones en una caché aparte que no se borra con cada versión. Las páginas van por red primero, con un tope de 4 segundos: si la red no responde, abre la copia guardada y lo nuevo queda para la próxima. Íconos, fuente, manifest y el conversor a MP3 salen de la copia guardada al instante y se renuevan por detrás.

Después de la primera carga (en https), la página baja de a poco, en segundo plano, todas las grabaciones que todavía no estaban guardadas (unos 7,5 MB; no lo hace con "ahorro de datos" prendido). Desde ahí la app funciona entera sin conexión, con todos los sonidos. La imagen de la firma también queda guardada.

### Video

El tercer botón del selector de pantalla (la cámara, debajo de grilla y bandejas; en el teléfono, en la primera fila) o la tecla `J` abre **Video**: muestra un video en sincronía con la canción y baja el audio justo para ese video. La canción se sigue armando y viendo arriba, en la línea de tiempo (la rayita marca por dónde va el video, también con la música quieta).

- **Elegir un video** del equipo (horizontal 16:9, vertical 9:16, cuadrado o cualquier otra medida: la pantalla se acomoda). No se sube a ningún lado. También se puede soltar el archivo sobre la página.
- El video no se guarda: al recargar hay que elegirlo otra vez. Dónde empieza la música sí queda guardado con el beat (si se elige el mismo archivo; con otro video arranca de cero).
- **Play** (el del video, el de arriba o Espacio) toca el video y la canción juntos. Manda el video: cuando ya está andando, la música entra justo en ese punto (contando lo que tarda en salir el sonido). Al video nunca se le cambia la velocidad ni se lo hace saltar, así su sonido no se corta. Si con el tiempo se separan más de un octavo de segundo, o el video se traba cargando, la música se vuelve a enganchar sola.
- **Ondas:** arriba, el sonido del video; abajo, la música con el color de cada parte de la canción (la onda de la música se recalcula sola un momento después de cada cambio, con la música quieta). Tocar o arrastrar arriba va a ese momento; arrastrar la onda de la música la corre.
- **VOLUMEN:** uno para el video y otro para la música (el de la música es el mismo "Volumen general" del menú). Ninguno cambia la descarga.
- **MÚSICA DESDE:** − y + la corren de a 0,05 segundos (mantener apretado para ir rápido); **ACÁ** la hace empezar en el momento que se ve.
- **Cortes:** las rayas amarillas son los momentos donde el sonido del video cambia fuerte, en volumen o en color (graves, medios y agudos se miran por separado), comparando el medio segundo de antes con el de después. Marca hasta 24. Abajo del volumen dice cuántos caen justo en un cambio de parte de la canción.
- **Sugerencias** (aparecen solas si mejoran algo; **PROBAR** aplica y Deshacer vuelve atrás):
  - la más liviana entre **otro orden** de los mismos bloques (mismo tempo) o **solo otro tempo** (misma canción), la que haga caer más momentos;
  - **rearmar**: busca el tempo (entre 20 % menos y 25 % más que el actual) donde más momentos caen justo al empezar un compás y arma partes nuevas que empiezan en esos momentos, repitiendo los tracks de la canción en su orden (dos partes seguidas no repiten track). Se muestra si cae en más momentos que la liviana.
  - Las partes duran compases enteros, así que los momentos que caen a mitad de compás con cualquier tempo no se pueden alcanzar. Dónde empieza la música no se toca.
- **AJUSTAR TEMPO AL VIDEO** cambia el tempo para que la canción termine junto con el video (si queda entre 40 y 240).
- **AUDIO PARA EL VIDEO** abre Descargar con **Para el video**: MP3 o WAV del mismo largo que el video, con silencio hasta donde empieza la música y cortado al final del video. Se pega debajo del video, desde el principio, en cualquier editor. Si la canción se repite, sigue hasta tapar el video; si no, termina con el último compás.
- Con CANCIÓN apagado, la música es el patrón que se está editando en loop.
- En el iPhone el volumen del video se maneja desde la app (el sonido del video pasa por el mismo motor de audio que la música).

### Intro

La primera vez que se abre la página en un equipo aparece una pantalla de bienvenida sobre la app borrosa: el logo con la frase amarilla, una frase corta ("Hacé tu tema tocando cuadros. No hace falta saber música.") y un botón **PLAY** grande que late despacio. Play arranca a sonar enseguida con un estilo al azar de los que mejor suenan, sin decir cuál, y cierra la intro. Debajo, chicos y quietos, está "O elegí un estilo" con una fila de estilos que se desliza a mano (Rock, 808, Hip hop, Lo-fi, Cumbia, Reggaetón, Cuarteto, Fogón, Jazz, Phonk y muchos más): tocar uno arranca ese (no hace falta tocar Play). Cada estilo carga un ejemplo con sus instrumentos, estilos, ambiente, efectos y destiempo ya elegidos. Lo que había no se pierde: el tema de ejemplo ("Primera banda") o el beat sin guardar quedan en Mis beats. Si la página se abrió con un enlace de un beat, la intro sale sin los estilos y Play toca ese beat.

- En la compu: ← → eligen el estilo, Espacio o Enter es Play (con el estilo elegido, o uno al azar), Esc la cierra sin sonido.
- La frase está en `INTRO_TXT` y los estilos que puede elegir Play en `INTRO_PLAY` (por nombre de `INTRO_ST`), los dos en `index.html`.
- Sale una sola vez por equipo. Para verla de nuevo, abrir la dirección con `?intro` al final (por ejemplo `…/index.html?intro`).
- Los estilos están en `INTRO_ST`, en `index.html`: cada uno tiene nombre, detalle, el ejemplo de `PRESETS` que carga y el destiempo (`h`). Para sumar uno, se agrega un ejemplo a `PRESETS` y una línea a `INTRO_ST` que lo nombre.

### Pista de los íconos de instrumentos

Tocar un ícono de la columna de instrumentos lo hace sonar; mantenerlo apretado abre sus estilos (cambiar el instrumento, capas, grabar). Para que se entienda sin cortar a nadie aparece un globito al lado del ícono, que no se puede tocar y se va solo:

- Las primeras 3 veces que alguien toca un ícono.
- Una vez sola, unos segundos después de empezar a sonar, si todavía no tocó ningún ícono (los íconos laten un poco).
- Deja de salir para siempre cuando alguien abre los estilos manteniendo apretado (o con clic derecho o manteniendo la tecla del número).
- Mientras se mantiene apretado, el ícono se va marcando con un borde hasta que se abren los estilos.

- Arriba a la derecha está el selector de idioma (también en el menú, sección Vista). Usa el widget de Google Translate, que se carga solo cuando se elige otro idioma; el elegido queda guardado en el equipo. Volver a Español recarga la página si hace falta. El logo y la frase amarilla no se traducen.

### Frase sobre el logo

Sobre el logo (arriba a la derecha en la compu, y en el menú) aparece una frase inclinada en amarillo, como la de Minecraft. Las frases están en `frases.txt`, una por línea (las líneas vacías o que empiezan con `#` no cuentan). Cada vez que se abre la app sale una distinta de la vez anterior. Tocar el logo o la frase abre "Acerca de". Para sumar frases alcanza con editar `frases.txt` en el repo: no hace falta tocar `index.html` ni subir `VERSION` (el service worker lo pide siempre a la red primero). Si no se puede leer el archivo, sale "A gente ajuda". La letra es Caveat Bold (`caveat-bold.woff2`, licencia SIL Open Font 1.1 en `caveat-OFL.txt`), guardada en el repo para que funcione sin conexión.

### Nombre y firma
En la página principal el nombre es **GREENPAD**, con GREEN en verde y PAD en el otro color (cabecera, menú, ayuda, video y al agregarla a la pantalla de inicio). La firma "Hecho en La Pampa por Jean Phillippe Studio" (con el enlace a jeanphillippe.com) va abajo de todo y centrada: en el teléfono parado, después de la grilla (se ve al hacer scroll); en la compu, debajo de la app (la app ocupa todo el alto de la pantalla, así la grilla y las bandejas se ven más grandes; la firma se ve bajando un poco).

### Acerca de

Arriba de la firma hay un **ACERCA DE** que abre un texto corto sobre GREENPAD. También se abre desde el menú (Vista) y al tocar el logo o la frase amarilla. El texto está en `acerca.txt`: párrafos separados por una línea vacía (conviene que sean hasta 3); las líneas que empiezan con `#` no se muestran. Se edita en el repo sin tocar `index.html` ni subir `VERSION`, igual que `frases.txt`.

### Tracks

En la pantalla, los patrones A a H se llaman **tracks** (en este README a veces siguen apareciendo como "patrones"; es lo mismo). En el menú, la sección **Track** (copiar, pegar, dado, borrar, grabar en vivo y descargar) está arriba, justo después de Beat. El formato `.txt` no cambió.

### Plugins

GREENPAD acepta plugins: archivos `.js` que suman instrumentos, mods para las bandejas y visuales para el video. La página `plugins.html` (enlazada desde el menú, sección Plugins, y desde el pie, al lado de ACERCA DE) es la vitrina: lista los disponibles, los instala y trae la guía para hacerlos.

| Archivo | Para qué |
|---|---|
| `plugins.html` | Landing de plugins: catálogo, instalar, quitar, actualizar, instrucciones para hacer un plugin con una IA (texto para copiar, en `#promptTxt`) y guía completa plegada |
| `plugins/*.js` | Un archivo por plugin. Los que vienen: `guitarra.js`, `tuchacha.js`, `boombap.js`, `trap.js` y `arcade.js` (sonido), `djkit.js` y `envivo.js` (bandejas), `cassette.js`, `boombox.js` y `liquida.js` (visuales), `onda.js`, `shadow.js` y `mano.js` (herramientas) |
| `plugins/plantilla.js` | Plantilla que se baja desde la guía |

**Sumar un plugin que te mandaron**

1. Revisá el código (corre con los mismos permisos que la página).
2. Copiá el `.js` a `plugins/` (y sus audios, si trae).
3. En `plugins.html`, agregá una línea al arreglo `PLUGINS`, arriba del script: `archivo`, `tipo` (`sonido`, `bandeja`, `visual` o `herramienta`), `nombre`, `autor`, `version` y `descripcion`.
4. Si más adelante cambia, subí `version` en esa línea: a quien lo tenga instalado le aparece **Actualizar**.

No hace falta tocar `index.html` ni subir `VERSION` en `sw.js`. El botón "Mandar mi plugin" abre un mail a `ENVIAR` (hello@jeanphillippe.com) con el asunto `ASUNTO` y un texto `TEXTO` para completar, también arriba del script de `plugins.html`.

**Cómo funciona**

- Instalar guarda el código del plugin en el equipo (`localStorage`, clave `greenpad.plugins.v1`). Por eso anda sin conexión y `index.html` lo carga al abrir, antes de leer el beat guardado.
- En el menú, sección **Plugins**: prender, apagar o quitar cada uno (recarga la página) y **Probar un plugin propio (.js)**, para quien está haciendo uno.
- Abrir la dirección con `?sinplugins` al final no carga ninguno (por si alguno rompe algo).
- Si un plugin falla al cargar, el menú muestra el error y el resto sigue andando.

**Qué puede sumar un plugin** (la guía completa, con ejemplos, está en `plugins.html`)

| Función | Qué suma |
|---|---|
| `gp.instrumento(pista, {...})` | Un estilo para uno de los 8 instrumentos. Aparece en el selector de estilos, después de Grabar, con la marca PLUGIN. Se puede usar como capa |
| `gp.efecto({...})` | Una perilla en el bloque PLUGINS de las bandejas (abajo de los dos canales). El efecto va sobre toda la mezcla, entre el volumen general y el compresor, y también sale en Descargar |
| `gp.boton({...})` | Un botón en el bloque PLUGINS de las bandejas que dispara un sonido |
| `gp.efecto({ oculto: true, ... })` | Un efecto sin perilla, siempre enchufado, para manejarlo desde los botones del plugin |
| `gp.estilo(css)` | CSS propio (otra pinta para los discos, por ejemplo) |
| `gp.visual({...})` | Un estilo más para el video vertical, en Descargar |
| `gp.cuando('paso' / 'play' / 'stop', fn)` | Avisos de la app |
| `gp.ejemplo({...})` | Un ritmo armado en el menú, en Ejemplos, bajo el nombre del plugin |
| `gp.nota`, `gp.golpe`, `gp.grabado` | Usar las grabaciones de `sonidos/` dentro de un plugin (con `usa: [...]` en el instrumento para que se bajen antes) |
| `gp.microfono()` | El micrófono en vivo, para los botones de las bandejas |
| `gp.grabar(1 a 5)` y `gp.pararGrabacion()` | Grabar con el micrófono encima de una de las grabaciones 1 a 5 (las de GRABACIONES en las bandejas) |
| `gp.herramienta({...})` | Un botón en el menú, sección **Herramientas** (aparece solo si hay alguna), que llama a `abrir()` |
| `gp.zona('cancion' / 'pantalla')` | Un lugar para dibujar sobre la barra de la canción (no tapa los toques) o una capa encima de la app para carteles propios |
| `gp.analizador()` | Un AnalyserNode con lo que suena (null hasta que suena algo por primera vez) |
| `gp.notas()`, `gp.ponerNotas(n)`, `gp.poner(pista, paso, nota)` | Leer y cambiar las notas: `[track][pista][paso]`, 0 vacío, 1 a 8 la altura en los melódicos |
| `gp.alTocar(fn)` | Al marcar un paso, `fn(pista, paso, track)` elige la nota (1 a 8), devuelve 0 para no dejar marcarlo, o nada para lo normal |
| `gp.marcar`, `gp.marcarTrack`, `gp.limpiarMarcas` | Marcas en la grilla y en las letras (`data-guia`), para dibujarlas con `gp.estilo` |
| `gp.irATrack(letra)`, `gp.cancion()` | Pasar a otro track; los bloques de la canción |
| `gp.cuando('toque' / 'track' / 'cambio', fn)` | Avisos al marcar o borrar un paso, al cambiar de track (y una vez al abrir) y cuando cambia todo de golpe (deshacer, abrir un tema) |

**Beats y plugins**

- Cada track guarda qué instrumentos de plugins usa por nombre (`plugin/instrumento`), no por posición: no importa en qué orden se instalaron.
- Si se abre un beat que usa un plugin que no está (o está apagado), suena con el primer estilo de GREENPAD y avisa cuál falta. Al instalarlo de nuevo, el beat lo recupera.
- El `.txt` lleva los instrumentos de plugins por nombre. "Copiar enlace" no los lleva (quedan con el estilo de GREENPAD) y tampoco lleva las perillas de plugins.
- **Onda** (`onda.js`): la onda de lo que suena sobre la barra de la canción, corriendo de derecha a izquierda a dos rayitas por paso, con el color del track que sonaba. Muestra también los golpes que se prueban en la grilla con la música quieta. En bandejas y video no dibuja.
- **Shadow** (`shadow.js`): menú, Herramientas, Shadow. Elegís rehacer todo el tema (en el orden de la canción) o solo el track actual, marcas discretas (un punto chico en el centro) o claras (un aro naranja), y si se puede tocar solo lo marcado. Esconde las notas, marca los botones que faltan (el siguiente late) y las letras de los tracks que siguen. Al tocar un botón marcado pone la nota exacta del original, con su altura; con "Solo dejar tocar lo marcado", los demás no se prenden. Un cartel chico abajo muestra el progreso (se achica con –). Al salir se elige volver al original o dejar lo armado. El original queda en `localStorage` (`greenpad.shadow.v1`): si se recarga la página, pregunta si seguir, volver al original o descartar; si se abre otro tema, la guía queda en pausa. Mientras dura, el aviso de AMBIENTE de los tracks vacíos no aparece.
- De paso se arregló que las capas del estilo 9 en adelante (Cencerro, Claves y Palmas en Percu, y Grabación como capa en caja, hi-hat, percu y melodía) quedaban tildadas pero no sonaban.
- Las perillas y botones de plugins de bandejas van abajo de los dos canales (debajo de FRENO, REBOBINAR, FILTRO y los íconos de instrumentos), en un bloque PLUGINS a todo el ancho, una tarjeta por plugin. La consola del centro queda corta y la pantalla de bandejas se desliza para abajo para llegar a los plugins.
- Se arregló que el botón de borrar (un beat en Mis beats, o un plugin en el menú) quedaba trabado en "¿Borrar?": usaba la clase `arm`, que es la del brazo del tocadiscos y no deja tocar.
