// GREENPAD: arma el index.html liviano que se publica, a partir de fuente/index.html (el que se edita).
//
//   node fuente/build.mjs        (desde la carpeta del proyecto, con internet la primera vez)
//
// Qué hace:
//  1. Achica los estilos y el código (saca comentarios, espacios y acorta nombres internos) con esbuild.
//     El código de los plugins no se toca: siguen hablando con GREENPAD.plugin({...}) igual que antes.
//  2. Escribe ../index.html (no editarlo a mano: se pisa en cada build).
//  3. Cambia BUILD en ../sw.js con una huella del index.html nuevo: así los teléfonos que ya abrieron
//     GREENPAD reciben la versión nueva en su próxima visita con internet.
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const ESBUILD = 'esbuild@0.24.2';

const esb = (code, loader) => execFileSync('npx', ['--yes', ESBUILD, '--minify', '--loader=' + loader, '--legal-comments=none', '--charset=utf8'], { input: code, maxBuffer: 64 << 20 }).toString().trim();

const src = readFileSync(join(here, 'index.html'), 'utf8');
let css = 0, js = 0;
// trozos: <style>...</style>, <script>...</script> sin src, <textarea>...</textarea> (se deja igual) y el resto (marcado)
const out = src.replace(/(<style>)([\s\S]*?)(<\/style>)|(<script>)([\s\S]*?)(<\/script>)|(<textarea[\s\S]*?<\/textarea>)|([^<]*(?:<(?!style>|script>|textarea)[^<]*)*)/g,
  (m, s1, sBody, s2, j1, jBody, j2, ta, html) => {
    if (s1) { css++; return s1 + esb(sBody, 'css') + s2; }
    if (j1) { js++; return j1 + esb(jBody, 'js') + j2; }
    if (ta) return ta;
    if (html) return html.replace(/<!--(?!\s*\[)[\s\S]*?-->/g, '').replace(/>\s+</g, (w) => (w.includes('\n') ? '>\n<' : '> <'));
    return m;
  });

if (!css || !js) throw new Error('no encontré <style> o <script> en fuente/index.html');
writeFileSync(join(root, 'index.html'), out);

const hash = createHash('sha256').update(out).digest('hex').slice(0, 10);
const swPath = join(root, 'sw.js');
const sw = readFileSync(swPath, 'utf8');
if (!/^const BUILD = '[^']*';$/m.test(sw)) throw new Error("no encontré la línea const BUILD = '...'; en sw.js");
writeFileSync(swPath, sw.replace(/^const BUILD = '[^']*';$/m, `const BUILD = '${hash}';`));

const kb = (n) => (n / 1024).toFixed(0) + ' KB';
console.log(`index.html: ${kb(Buffer.byteLength(src))} -> ${kb(Buffer.byteLength(out))} (BUILD ${hash})`);
