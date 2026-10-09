# GREENPAD

Caja de ritmos de 16 pasos y 8 instrumentos, inspirada en el drumpad de la consola. Tema oscuro verde por defecto (hay tema claro en el menú). Corre en el navegador del teléfono y de la compu, funciona offline y guarda todo en el dispositivo (localStorage), sin base de datos.

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

Cuando cambies algo, subí `VERSION` en `sw.js` (por ejemplo `greenpad-v1.1.1`) para que los teléfonos que ya la tienen instalada bajen la versión nueva.

Para probar en local: `python3 -m http.server 8080` dentro de la carpeta y abrir `http://localhost:8080`. El service worker solo se registra en https.

## Cómo guarda

- El beat en curso se guarda solo en el dispositivo a cada cambio.
- **Mis beats**: lista local de beats guardados. Un beat guardado se sigue actualizando solo.
- Si abrís otro beat o creás uno nuevo con un borrador sin guardar, el borrador se guarda como "respaldo" en Mis beats para no perderlo.
- Borrar los datos del navegador borra los beats: exportá un `.txt` para respaldar.

## Patrones A a H

Cada letra es una memoria con su propia grilla de 16 pasos (por ejemplo A intro, B estrofa, C estribillo). Tocar una letra mientras suena la deja en espera hasta que termina el compás; tocarla otra vez salta ya. Con **CADENA** encendido suenan en orden los patrones que tienen notas.

## Estilos por instrumento

Tocar un ícono lo hace sonar. Mantenerlo apretado (o clic derecho, o mantener la tecla 1 a 8) abre su panel: 4 estilos (Estudio, Electro, 8-bit y uno especial de cada instrumento), afinación ±12 semitonos, volumen, silenciar y solo. El punto de color bajo cada ícono muestra el estilo elegido. En el menú se puede poner el mismo estilo a todos.

| Instrumento | Especial |
|---|---|
| Hi-hat | Tick |
| Caja | Rimshot |
| Hat abierto | Semiabierto |
| Tom | Conga |
| Shaker | Pandereta |
| Crash | Ride |
| Palmas | Chasquido |
| Bombo | Punch |

## Formato de texto (.greenpad.txt)

Se puede leer y editar a mano. `x` es golpe y `.` es silencio (también acepta `o`, `#`, `1`). Los espacios dentro de la grilla se ignoran. Solo se exportan los patrones con notas.

```
# GREENPAD beat v1
NOMBRE: Primer beat
BPM: 140
SWING: 0
CADENA: no
ESTILOS: HH=Estudio SN=Rimshot OH=Estudio TM=Conga SH=Estudio CR=Estudio CP=Estudio BD=Electro
AFINACION: BD=+2
VOLUMEN: SH=80
MUTE: -
ACTUAL: A

[A]
HI-HAT      .xx. xxxx .xx. xxxx
CAJA        ...x ...x ...x ...x
HAT ABIERTO .... ...x .... ...x
TOM         ..xx ...x ..xx ...x
SHAKER      x.x. x.x. x.x. x.x.
CRASH       ...x .... .... ...x
PALMAS      .... .... ..x. ....
BOMBO       x.x. .xx. x..x .xx.
```

Los nombres de instrumento aceptan alias en inglés (KICK, SNARE, CLAP, etc.) o los códigos `HH SN OH TM SH CR CP BD`. En `ESTILOS` va el nombre del estilo (o 0 a 3). `AFINACION` en semitonos y `VOLUMEN` en porcentaje; las líneas con `-` quedan por defecto. Los archivos de Drumpa (la versión anterior) se siguen importando.

También se importa:
- El JSON interno.
- Un enlace "Copiar enlace" (el beat viaja dentro del enlace, sin servidor).

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
| Patrón anterior / siguiente | `,` `.` o `[` `]` |
| Ir a patrón A a H | Alt + 1 a 8 |
| Tempo ±1 / ±10 | `+` `-` / RePág AvPág |
| Tap tempo | T |
| Grabar en vivo | R |
| Encadenar patrones | C |
| Estilo para todos | K |
| Dado (aleatorio) | D |
| Borrar patrón | Supr |
| Deshacer / rehacer | Ctrl+Z / Ctrl+Y |
| Copiar / pegar patrón | Ctrl+C / Ctrl+V |
| Guardar en Mis beats | Ctrl+S |
| Exportar / importar | Ctrl+E / Ctrl+O |
| Menú / ayuda | M / ? |

## En el teléfono

- Vertical: la grilla se gira (instrumentos en columnas, pasos hacia abajo). Horizontal: igual que la consola.
- Tocar y arrastrar pinta o borra varios pasos.
- Tocar un ícono suena el instrumento; mantenerlo apretado abre sus estilos.
- Un patrón elegido mientras suena entra al terminar el compás; tocarlo otra vez salta ya.
- En iPhone, si no suena, revisar el interruptor de silencio.
