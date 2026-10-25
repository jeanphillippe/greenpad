# GREENPAD

Caja de ritmos y secuenciador de 16 pasos, inspirada en el drumpad de la consola. Tiene 4 pistas de batería y 4 melódicas (bajo, guitarra, acordes y melodía). Tema oscuro verde por defecto (hay tema claro en el menú). Corre en el navegador del teléfono y de la compu, funciona offline y guarda todo en el dispositivo (localStorage), sin base de datos.

## Archivos

| Archivo | Para qué |
|---|---|
| `index.html` | Toda la app: estilos, motor de audio (Web Audio, sonidos sintetizados, sin samples) y lógica |
| `sw.js` | Service worker para uso offline. Subí `VERSION` en cada release |
| `manifest.webmanifest` | Permite "Agregar a pantalla de inicio" como app |
| `icon.svg`, `icon-*.png` | Íconos |
| `_headers` | Cabeceras para Cloudflare Pages (sin caché para `index.html` y `sw.js`) |

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

Para probar en local: `python3 -m http.server 8080` dentro de la carpeta y abrir `http://localhost:8080`. El service worker solo se registra en https.

## Instrumentos y estilos

| # | Instrumento | Estilos |
|---|---|---|
| 1 | Bombo | Estudio, Electro, 8-bit, Punch |
| 2 | Caja | Estudio, Electro, 8-bit, Rimshot, Chasquido |
| 3 | Hi-hat | Estudio, Electro, 8-bit, Abierto, Semiabierto, Ride |
| 4 | Percu | Palmas, Clap 808, 8-bit, Shaker, Pandereta, Conga, Tom, Crash |
| 5 | Bajo | Eléctrico, Sub 808, 8-bit, Acid, Contrabajo |
| 6 | Guitarra | Acústica, Eléctrica, 8-bit, Funk, Nylon |
| 7 | Acordes | Piano, Stab, 8-bit (arpegio), Órgano, Pad |
| 8 | Melodía | Marimba, Lead, 8-bit, Campana, Flauta |

- El nombre del estilo se ve debajo de cada ícono. **SONIDO** (arriba) pone a todos en Estudio, Electro, 8-bit o Especial; si cada uno tiene uno distinto dice "MIXTO".
- Tocar un ícono lo hace sonar. Mantenerlo apretado (o clic derecho, o mantener la tecla 1 a 8) abre su panel: estilo, afinación ±12 semitonos, volumen, silenciar y solo.
- **Capas:** en ese panel, el **+** de cada estilo lo suma encima del elegido (por ejemplo bombo Estudio + Sub 808). El ícono muestra "+1", "+2".

## Tu voz (estilo Koala)

- El botón del micrófono (tecla `V`) graba hasta 4 segundos. Se recorta solo el silencio del principio y del final.
- Efectos: al revés, eco, robot, y "Largo" para usar solo una parte.
- "Usarla en" elige el instrumento. En los melódicos tu voz sube y baja según la altura de cada paso; en la batería suena tal cual.
- Queda como estilo "Tu voz" en el panel de ese instrumento: se puede volver a otro estilo o sumarla como capa.
- Se guarda en este dispositivo (IndexedDB) y viaja dentro del `.txt` exportado (sección `[VOCES]`). El enlace no la incluye.
- Para grabar, la página tiene que estar en https (Cloudflare Pages lo da) y el navegador pide permiso para el micrófono.

## Sin saber música

- **Dado** (cabecera o tecla `D`): inventa un patrón completo donde bajo, guitarra, acordes y melodía combinan entre sí.
- **Inventar línea nueva** (en el panel de cada instrumento, o tecla `I` con el panel abierto): cambia solo ese instrumento y respeta lo que ya está.
- **AMBIENTE** (cabecera): Oscuro, Triste, Alegre, Pop, Groove o Blues. Cambia el carácter de todo y cualquier altura combina.
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

En el menú, 24 ejemplos. Trap y rap: Trap, Drill, Phonk, Trap melódico, Rage, Boom bap. Rock: Rock, Punk, Metal, Grunge, Rock nacional, Captura. Otros: Pop, Cumbia, Dembow, House, Techno, Lo-fi, Reggae, Funk, Disco, Bossa nova, Synthwave, Chiptune. Se cargan en el patrón actual con su tempo, tono y estilos, y arranca a sonar.

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
VOZ: LD=voz+eco+L80
CADENA: no
MEZCLA: B
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

## En el teléfono

- Vertical: la grilla se gira (instrumentos en columnas, pasos hacia abajo). Horizontal: igual que la consola.
- Tocar y arrastrar pinta o borra varios pasos.
- Mantener apretado un ícono abre sus estilos; mantener apretado un paso melódico abre las notas.
- En iPhone, si no suena, revisar el interruptor de silencio.
