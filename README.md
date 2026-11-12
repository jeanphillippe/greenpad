# GREENPAD

La página principal (`index.html`) es **GREENPAD** (ver más abajo). La caja de ritmos original quedó en `mini.html` y se describe primero.

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

### Descargar

El botón verde de la flecha (al lado del dado; en la compu, en la fila de herramientas) abre **Descargar**. También está en el menú, en Patrón.

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
- **Grabar en vivo** pasó al panel de la barra resumen (teléfono) y al menú, en Patrón (compu). La tecla `R` sigue igual.

### En el teléfono

Parado o acostado, la cabecera se compacta para que la grilla tenga más lugar:

- Arriba quedan Play, grilla/bandejas, tempo, dado, deshacer y menú, y los patrones A a H en una sola fila.
- La barra que dice **SONIDO · AMBIENTE · DESTIEMPO** muestra cómo está el patrón y, al tocarla, abre un panel con SONIDO, DESTIEMPO, AMBIENTE, **Sumar a la mezcla** (las casillas de los patrones), CADENA, Grabar en vivo y Grabar sonido. Borrar patrón (el tacho) queda siempre a la vista, junto al dado, la descarga y deshacer. Tocar la grilla o **Listo** lo cierra.
- La canción ocupa una sola fila (el tiempo va dentro del botón CANCIÓN). Al tocar un bloque, sus herramientas aparecen en un globo debajo del bloque; **OK** lo cierra.

### Service worker y uso sin conexión

`sw.js` guarda cada página con su dirección (`index.html` y `mini.html` no se pisan; antes guardaba cualquier página como `index.html`) y guarda las grabaciones en una caché aparte que no se borra al subir `VERSION`.

Después de la primera carga (en https), la página baja de a poco, en segundo plano, todas las grabaciones que todavía no estaban guardadas (unos 7,5 MB; no lo hace con "ahorro de datos" prendido). Desde ahí la app funciona entera sin conexión, con todos los sonidos. La imagen de la firma también queda guardada.

### Video

El tercer botón del selector de pantalla (la cámara, debajo de grilla y bandejas; en el teléfono, a la derecha de la barra resumen) o la tecla `J` abre **Video**: muestra un video en sincronía con la canción y baja el audio justo para ese video. La canción se sigue armando y viendo arriba, en la línea de tiempo (la rayita marca por dónde va el video, también con la música quieta).

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

La primera vez que se abre la página en un equipo aparece una pantalla de bienvenida sobre la app borrosa: el logo con la frase amarilla, un texto corto que termina en "..." (tocándolo se lee entero; es el mismo de `acerca.txt`), una fila de estilos para empezar que se desliza (Rock, 808, Hip hop, Lo-fi, Cumbia, Reggaetón, Cuarteto, Fogón, Jazz, Phonk y muchos más, cada uno con su ambiente y tempo a la vista; **Sorpresa** elige uno al azar). Cada estilo carga un ejemplo con sus instrumentos, estilos, ambiente, efectos y destiempo ya elegidos. Abajo está el botón **PLAY**: arranca un tema nuevo con el estilo elegido en el track A, empieza a sonar y cierra la intro. Lo que había no se pierde: el tema de ejemplo ("Primera banda") o el beat sin guardar quedan en Mis beats. Si la página se abrió con un enlace de un beat, la intro sale sin los estilos y Play toca ese beat.

- En la compu: ← → eligen el estilo, Espacio o Enter es Play (con el estilo elegido, o uno al azar), Esc la cierra sin sonido.
- Ningún estilo viene elegido: tocar uno arranca el tema con ese estilo (no hace falta tocar Play), y **PLAY** solo pone uno al azar. La fila de estilos se desliza sola y da la vuelta sin fin (se frena un momento al tocarla o pasar el mouse); con "reducir movimiento" activado no se mueve sola.
- Sale una sola vez por equipo. Para verla de nuevo, abrir la dirección con `?intro` al final (por ejemplo `…/index.html?intro`).
- Los estilos están en `INTRO_ST`, en `index.html`: cada uno tiene nombre, detalle, el ejemplo de `PRESETS` que carga y el destiempo (`h`). Para sumar uno, se agrega un ejemplo a `PRESETS` y una línea a `INTRO_ST` que lo nombre.
- El texto sale al instante: la página trae una copia de `acerca.txt` y, cuando llega el archivo, se actualiza si cambió. Conviene tocar las dos cosas juntas (`ABOUT0` en `index.html` y `acerca.txt`).
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
| `plugins.html` | Landing de plugins: catálogo, instalar, quitar, actualizar y guía para crearlos |
| `plugins/*.js` | Un archivo por plugin. Los que vienen: `guitarra.js`, `tuchacha.js`, `boombap.js`, `trap.js` y `arcade.js` (sonido), `djkit.js` y `envivo.js` (bandejas), `cassette.js` y `boombox.js` (visuales) |
| `plugins/plantilla.js` | Plantilla que se baja desde la guía |

**Sumar un plugin que te mandaron**

1. Revisá el código (corre con los mismos permisos que la página).
2. Copiá el `.js` a `plugins/` (y sus audios, si trae).
3. En `plugins.html`, agregá una línea al arreglo `PLUGINS`, arriba del script: `archivo`, `tipo` (`sonido`, `bandeja` o `visual`), `nombre`, `autor`, `version` y `descripcion`.
4. Si más adelante cambia, subí `version` en esa línea: a quien lo tenga instalado le aparece **Actualizar**.

No hace falta tocar `index.html` ni subir `VERSION` en `sw.js`. El botón "Mandar mi plugin" va a la dirección de `ENVIAR`, también arriba del script de `plugins.html`.

**Cómo funciona**

- Instalar guarda el código del plugin en el equipo (`localStorage`, clave `greenpad.plugins.v1`). Por eso anda sin conexión y `index.html` lo carga al abrir, antes de leer el beat guardado.
- En el menú, sección **Plugins**: prender, apagar o quitar cada uno (recarga la página) y **Probar un plugin propio (.js)**, para quien está haciendo uno.
- Abrir la dirección con `?sinplugins` al final no carga ninguno (por si alguno rompe algo).
- Si un plugin falla al cargar, el menú muestra el error y el resto sigue andando.

**Qué puede sumar un plugin** (la guía completa, con ejemplos, está en `plugins.html`)

| Función | Qué suma |
|---|---|
| `gp.instrumento(pista, {...})` | Un estilo para uno de los 8 instrumentos. Aparece en el selector de estilos, después de Grabar, con la marca PLUGIN. Se puede usar como capa |
| `gp.efecto({...})` | Una perilla en la consola de las bandejas. El efecto va sobre toda la mezcla, entre el volumen general y el compresor, y también sale en Descargar |
| `gp.boton({...})` | Un botón en la consola de las bandejas que dispara un sonido |
| `gp.efecto({ oculto: true, ... })` | Un efecto sin perilla, siempre enchufado, para manejarlo desde los botones del plugin |
| `gp.estilo(css)` | CSS propio (otra pinta para los discos, por ejemplo) |
| `gp.visual({...})` | Un estilo más para el video vertical, en Descargar |
| `gp.cuando('paso' / 'play' / 'stop', fn)` | Avisos de la app |
| `gp.ejemplo({...})` | Un ritmo armado en el menú, en Ejemplos, bajo el nombre del plugin |
| `gp.nota`, `gp.golpe`, `gp.grabado` | Usar las grabaciones de `sonidos/` dentro de un plugin (con `usa: [...]` en el instrumento para que se bajen antes) |
| `gp.microfono()` | El micrófono en vivo, para los botones de las bandejas |
| `gp.grabar(1 o 2)` y `gp.pararGrabacion()` | Grabar con el micrófono encima de la grabación 1 o 2 (las de GRABACIONES en las bandejas) |

**Beats y plugins**

- Cada track guarda qué instrumentos de plugins usa por nombre (`plugin/instrumento`), no por posición: no importa en qué orden se instalaron.
- Si se abre un beat que usa un plugin que no está (o está apagado), suena con el primer estilo de GREENPAD y avisa cuál falta. Al instalarlo de nuevo, el beat lo recupera.
- El `.txt` lleva los instrumentos de plugins por nombre. "Copiar enlace" no los lleva (quedan con el estilo de GREENPAD) y tampoco lleva las perillas de plugins.
- De paso se arregló que las capas del estilo 9 en adelante (Cencerro, Claves y Palmas en Percu, y Grabación como capa en caja, hi-hat, percu y melodía) quedaban tildadas pero no sonaban.
- Con plugins la consola de las bandejas puede quedar más alta que la pantalla: en la compu y en el teléfono acostado se desliza por dentro y el crossfader queda siempre a la vista, abajo.
- Se arregló que el botón de borrar (un beat en Mis beats, o un plugin en el menú) quedaba trabado en "¿Borrar?": usaba la clase `arm`, que es la del brazo del tocadiscos y no deja tocar.
