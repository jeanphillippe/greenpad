# GREENPAD

La página principal (`index.html`) es **Greenpad Banda** (ver más abajo). La caja de ritmos original quedó en `mini.html` y se describe primero.

Caja de ritmos y secuenciador de 16 pasos, inspirada en el drumpad de la consola. Tiene 4 pistas de batería y 4 melódicas (bajo, guitarra, acordes y melodía). Tema oscuro verde por defecto (hay tema claro en el menú). Corre en el navegador del teléfono y de la compu, funciona offline y guarda todo en el dispositivo (localStorage), sin base de datos.

## Archivos

| Archivo | Para qué |
|---|---|
| `mini.html` | Greenpad Mini, toda la app: estilos, motor de audio (Web Audio, sonidos sintetizados, sin samples) y lógica |
| `sw.js` | Service worker para uso offline. Subí `VERSION` en cada release |
| `manifest.webmanifest` | Permite "Agregar a pantalla de inicio" a Greenpad Mini como app |
| `icon.svg`, `icon-*.png` | Íconos |
| `_headers` | Cabeceras para Cloudflare Pages (sin caché para `index.html`, `mini.html` y `sw.js`) |

No hay build, ni dependencias, ni `package.json`.

## Subir a Cloudflare Pages (gratis)

1. Crear un repo en GitHub con el contenido de esta carpeta y hacer push.
2. En Cloudflare: **Workers & Pages → Create → Pages → Connect to Git**, elegir el repo.
3. Configuración de build:
   - Framework preset: **None**
   - Build command: *(vacío)*
   - Build output directory: `/`
4. Deploy. Cada push a la rama principal publica una versión nueva.
5. Opcional: agregar un dominio propio en **Custom domains**.

Cuando cambies algo, subí `VERSION` en `sw.js` (por ejemplo `greenpad-v1.2.1`) para que los teléfonos que ya la tienen instalada bajen la versión nueva.

Para probar en local: `python3 -m http.server 8080` dentro de la carpeta y abrir `http://localhost:8080` (Banda) o `http://localhost:8080/mini.html`. El service worker solo se registra en https.

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
- **Centro:** REVERB, ECO, LO-FI (sonido gastado), VINILO (ruido de disco), MODO 90 (vinilo, polvo, algo de reverb y swing de una) y REPETIR 1/4, 1/8, 1/16 (mantenido repite el último pedacito en las dos bandejas).
- Los efectos también suenan en la grilla y se guardan con el beat.
- Las perillas se mueven arrastrando arriba/abajo, con la rueda del mouse o con las flechas si tienen foco.
- Scratch, freno, rebobinar y repetir usan AudioWorklet (Chrome, Edge, Firefox y Safari 14.1 o más nuevos).

## Tu voz (estilo Koala)

- El botón del micrófono (tecla `V`) tiene 2 grabaciones (Grabación 1 y 2) de hasta 8 segundos cada una. Se recorta solo el silencio del principio y del final.
- Ajustes: "Empieza en" y "Termina en" para recortar, "Tono" para hacerla más grave o más aguda (±12 semitonos), y efectos al revés, eco y robot.
- Siempre suena completa (entre el inicio y el final elegidos), no se corta al largo del paso. Si el instrumento elegido ya usa esa grabación, los cambios se aplican en vivo.
- "Usarla en" elige el instrumento. En los melódicos tu voz sube y baja según la altura de cada paso; en la batería suena tal cual.
- Queda como estilo "Tu voz" en el panel de ese instrumento: se puede volver a otro estilo o sumarla como capa.
- Se guarda en este dispositivo (IndexedDB) y viaja dentro del `.txt` exportado (sección `[VOCES]`). El enlace no la incluye.
- Para grabar, la página tiene que estar en https (Cloudflare Pages lo da) y el navegador pide permiso para el micrófono. En iPhone, si no lo pide, revisar Ajustes > Chrome (o Safari) > Micrófono.

## Sin saber música

- **Dado** (cabecera o tecla `D`): inventa un patrón completo donde bajo, guitarra, acordes y melodía combinan entre sí.
- **Inventar línea nueva** (en el panel de cada instrumento, o tecla `I` con el panel abierto): cambia solo ese instrumento y respeta lo que ya está.
- **AMBIENTE** (cabecera): Oscuro, Triste, Alegre, Pop, Groove o Blues. Elige qué notas usan bajo, guitarra, acordes y melodía (la batería no cambia), así el mismo patrón suena oscuro, triste, alegre, etc. Cualquier altura combina.
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
| Grabar tu voz | V |
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

## En el teléfono

- Vertical: la grilla se gira (instrumentos en columnas, pasos hacia abajo) y ocupa todo el ancho. Si no entra de alto, se desplaza deslizando el dedo por los márgenes de los costados o por la franja entre batería y melódicos, y sigue sola a la reproducción. Horizontal: igual que la consola.
- Tocar y arrastrar sobre los cuadros pinta o borra varios pasos.
- Mantener apretado un ícono abre sus estilos; mantener apretado un paso melódico abre las notas.
- Bandejas en vertical: los dos discos arriba, la mezcla con el crossfader en el medio y los controles de cada bandeja abajo.
- En iPhone, si no suena, revisar el interruptor de silencio.
- Modo liviano (menú, Sonido): reverb más corta, menos sonidos superpuestos y la animación de fondo a la mitad de cuadros. Se activa solo si el reloj de audio se atrasa (el equipo no da abasto) y queda guardado en ese dispositivo.

## Rendimiento (notas técnicas)

- Cada golpe arma su propio grupo de nodos de audio. Al terminar se desconecta a mano, porque Safari no libera solo los nodos que siguen conectados y con el tiempo se va poniendo lento.
- Hay un tope de sonidos a la vez por instrumento (el más viejo se apaga suave) y un tope general (40 en táctiles, 72 en la compu).
- Caja, hi-hat y percu se pre-renderizan una vez por estilo y afinación, y después cada golpe es un solo nodo. El bombo sigue sintetizado en vivo para que pegue en fase con el bajo.
- Las cuerdas (Karplus-Strong) usan búferes más chicos con afinación exacta y una caché de 48 notas.
- Con lo-fi en 0 la señal no pasa por sus filtros, el vinilo apagado no procesa nada y en la grilla la bandeja A va directo (sin filtros ni scratch).

## Greenpad Banda (`index.html`, la página principal)

Versión pensada para armar canciones enteras con instrumentos grabados de verdad. Tiene sus propios beats guardados (no se mezclan con los de Greenpad Mini) y se abre en la dirección principal (`/`). Antes se llamaba `banda.html`.

### Archivos extra

| Archivo | Para qué |
|---|---|
| `index.html` | La app Banda completa |
| `banda.webmanifest` | "Agregar a pantalla de inicio" abre Banda directo |
| `sonidos/` | 330 grabaciones mp3 (unos 7,5 MB). Solo se bajan las que usa el tema, y quedan guardadas para usar sin conexión |
| `sonidos/CREDITOS.txt` | De dónde sale cada grabación y su licencia |
| `lame.min.js` | Conversor a MP3 para Descargar (lamejs, LGPL 3.0) |

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

- El micrófono (tecla `V`) graba un sonido en una de las 2 grabaciones y "Usar en" la pone en un instrumento **solo en el patrón que estás editando**. En los otros patrones ese instrumento sigue sonando normal, y cada patrón puede usar una grabación distinta en el mismo instrumento.
- Si una grabación larga sigue sonando cuando pasás a un patrón donde el instrumento es normal, se apaga sola para no tapar al instrumento.
- En el `.txt` cada patrón lleva `GRABACION: BS=g1+eco+L90` y las grabaciones van una sola vez al final, en la sección `[GRABACIONES]`. Los `.txt` viejos (con `VOZ:` y `[VOCES]`) se siguen importando.
- **Bandejas:** en el centro hay dos botones, GRABACIONES 1 y 2. Mantenido apretado suena mientras lo tenés; con un toque corto queda sonando en loop hasta que lo volvés a tocar. Pasa por REVERB, ECO y LO-FI. En la compu, teclas `O` y `P`.

### Canción

La barra debajo de la cabecera es la línea de tiempo.

- **+ A** (o tecla `G`) suma el patrón que estás editando. Si el último bloque es el mismo patrón, le suma una vuelta.
- Tocar un bloque lo elige: aparecen botones para moverlo, tocarlo más o menos veces, duplicarlo o quitarlo. Play arranca desde el bloque elegido.
- **AUTO** arma una estructura con intro, verso y estribillo usando los patrones que tienen notas.
- **CANCIÓN** (tecla `L`) prende el modo canción: Play toca la línea de tiempo de principio a fin. Apagado, Play repite el patrón como en Greenpad.
- Mientras suena, tocar un bloque salta a ese bloque al terminar el compás.
- El botón de flechas repite la canción. Apagado, el tema cierra con platillo y bombo, y se frena.
- El ancho de cada bloque muestra cuánto dura, y arriba a la izquierda se ve el tiempo total y por dónde va.

En el `.txt` se agregan estas líneas (los .txt de Greenpad se importan igual; los estilos viejos se pasan a los nuevos por nombre):

```
CANCION: Ax2 Bx2 Ax2 Bx2 Cx2 Bx4
MODO: cancion
REPETIR: si
DESTIEMPO: 60
```

El enlace de "Copiar enlace" también lleva la canción, el destiempo y la mezcla de cada patrón (las grabaciones no, para eso está el `.txt`).

### Descargar

El botón verde de la flecha (al lado del dado; en la compu, en la fila de herramientas) abre **Descargar**. También está en el menú, en Patrón.

- **Título:** el que pongas queda como nombre del tema y se guarda en Mis beats (si no estaba guardado, se guarda solo). Es también el nombre del archivo.
- **Qué:** la canción completa (como suena en modo canción, con el cierre de platillo al final) o el patrón que estás editando, de 1 a 8 vueltas, con su mezcla.
- **Audio MP3:** liviano (192 kbps), para mandar o subir. Usa `lame.min.js` (lamejs, licencia LGPL 3.0), que se carga solo cuando hace falta.
- **Audio WAV:** calidad máxima, 44,1 kHz estéreo.
- **Video vertical 9:16** (720 × 1280, 30 cuadros): casi sin texto (solo título, BPM y el logo de Greenpad). Cinco estilos, que quedan recordados en cada equipo:
  - **Caracol:** arriba el logo, el título y los BPM. En el centro, un anillo de barras que crecen con las frecuencias como un caracol (graves arriba, girando en sentido horario; cada barra ajusta su propio nivel, así los agudos de la izquierda se mueven tanto como los graves), los 16 pasos marcados alrededor y un círculo que late con el bombo. Abajo, los íconos de los instrumentos se prenden con su color cuando suenan, y una barra muestra las partes de la canción en color y por dónde va. Va con cualquier tema.
  - **Revista:** papel con grano, tinta negra y un color de imprenta por parte de la canción. El tempo en números grandes que se llenan con el bombo, un círculo de semitono con ondas que salen del centro, con un degradado blanco detrás, y la onda del sonido en tinta, recta, cruzando el centro del círculo. De fondo, 7 barras verticales naranjas y suaves, de lado a lado de la pantalla (cada una junta varias frecuencias), que suben desde abajo con el sonido hasta el alto completo (graves a la izquierda, agudos a la derecha). Título en serif itálica sobre una franja de papel y, debajo, solo la barra de avance de la canción. Ideal para temas con guitarras y banda.
  - **Neón:** brillos, chispas, anillos que giran y la grilla del logo que se prende. Para trap y electrónica.
  - **Flor:** una flor de bordes bien marcados (contorno oscuro y borde claro, tipo sticker) sobre un fondo oscuro en degradado que gira despacio, con círculos que suben. Hojas que se balancean con el pulso; tres capas de pétalos: los de afuera se mueven con medios y agudos, los del medio con los medios y los de adentro con los graves. Con cada bombo la flor se abre, sale una onda y vuela polen. En el centro, los 16 pasos como semillas.
  - **Flor 3D:** un loto en perspectiva, dibujado como a lápiz (contorno marcado, sombra gris en la base y en los bordes de cada pétalo), sobre agua de noche con luciérnagas. Se balancea girando de un lado al otro y tiene un lado abierto que deja ver el centro, con las semillas que marcan los 16 pasos y los estambres que se mueven con los agudos. Cada pétalo sigue su banda de frecuencias: se abre y la punta se tiñe del color de la parte. Con el bombo florece un poco y se abre una onda en el agua. En la versión liviana no dibuja la sombra de los bordes ni los nervios.
  - **Liviano** (casilla): 540 × 960 a 24 cuadros y menos elementos, para teléfonos viejos o si el video sale entrecortado.
  - En iPhone sale en MP4; en la compu, MP4 o WebM según el navegador. Tarda lo mismo que dura la canción: hay que dejar la pantalla prendida.
- El audio se mezcla sin tocar en tiempo real (más rápido) con los mismos sonidos, efectos, mezclas y destiempo, y se ajusta el volumen para que quede fuerte sin recortar.
- Al terminar aparece para escucharlo, **Descargar** y, en el teléfono, **Compartir** (en iPhone, Compartir > Guardar video lo deja en Fotos).
- **Grabar en vivo** pasó al panel de la barra resumen (teléfono) y al menú, en Patrón (compu). La tecla `R` sigue igual.

### En el teléfono

Parado o acostado, la cabecera se compacta para que la grilla tenga más lugar:

- Arriba quedan Play, grilla/bandejas, tempo, dado, deshacer y menú, y los patrones A a H en una sola fila.
- La barra que dice **SONIDO · AMBIENTE · DESTIEMPO** muestra cómo está el patrón y, al tocarla, abre un panel con SONIDO, DESTIEMPO, AMBIENTE, **Sumar a la mezcla** (las casillas de los patrones), CADENA, Grabar en vivo y Grabar sonido. Borrar patrón (el tacho) queda siempre a la vista, junto al dado, la descarga y deshacer. Tocar la grilla o **Listo** lo cierra.
- La canción ocupa una sola fila (el tiempo va dentro del botón CANCIÓN). Al tocar un bloque, sus herramientas aparecen en un globo debajo del bloque; **OK** lo cierra.

### Service worker

`sw.js` guarda cada página con su dirección (`index.html` y `mini.html` no se pisan; antes guardaba cualquier página como `index.html`) y guarda las grabaciones en una caché aparte que no se borra al subir `VERSION`.
