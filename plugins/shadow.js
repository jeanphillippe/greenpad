// SHADOW: te guía para volver a armar un tema que ya hiciste, por ejemplo mientras lo filmás con otro teléfono.
// Esconde las notas de los tracks y deja una marca en cada botón que hay que tocar (la que sigue late).
// Al tocar un botón marcado se pone la nota exacta del original, con su altura, así no hace falta elegirla.
// Con "Solo dejar tocar lo marcado", los demás botones no se prenden (no se arruina la toma por un toque de más).
// El original queda guardado en el equipo hasta que salgas: si se recarga la página, se puede seguir o volver a él.

GREENPAD.plugin({
  id: 'shadow',
  nombre: 'Shadow',
  autor: 'GREENPAD',
  version: '1.0',
  tipo: 'herramienta',
  descripcion: 'Te guía para volver a armar un tema ya hecho mientras lo filmás: esconde las notas y marca qué botones tocar.',

  setup(gp) {
    const KEY = 'greenpad.shadow.v1', LETS = 'ABCDEFGH', PIS = gp.pistas;
    const ui = gp.zona('pantalla');
    gp.estilo(`
.pad[data-guia]::after{content:"";position:absolute;left:50%;top:50%;width:7px;height:7px;margin:-3.5px 0 0 -3.5px;border-radius:50%;background:var(--ink2);opacity:.38;pointer-events:none;z-index:2}
.pad[data-guia~="c"]::after{width:16px;height:16px;margin:-8px 0 0 -8px;background:transparent;box-shadow:inset 0 0 0 2.5px var(--or);opacity:.95}
.pad[data-guia~="d"][data-guia~="sig"]::after{opacity:.7}
.pad[data-guia~="sig"]::after{animation:gshp 1s ease-in-out infinite}
.pb[data-guia]::after{content:"";position:absolute;left:50%;bottom:3px;width:5px;height:5px;margin-left:-2.5px;border-radius:50%;background:var(--ink2);opacity:.45;pointer-events:none}
.pb[data-guia~="c"]::after{background:var(--or);opacity:1}
.pb[data-guia~="sig"]::after{animation:gshp 1s ease-in-out infinite}
@keyframes gshp{50%{transform:scale(1.7)}}
@media (prefers-reduced-motion:reduce){.pad[data-guia]::after,.pb[data-guia]::after{animation:none!important}}
.gsh-hud{position:fixed;left:50%;bottom:calc(10px + env(safe-area-inset-bottom));transform:translateX(-50%);display:flex;align-items:center;gap:10px;max-width:calc(100vw - 20px);padding:7px 7px 7px 12px;border-radius:999px;background:color-mix(in srgb,var(--drawer) 88%,transparent);box-shadow:0 6px 24px rgba(0,0,0,.35),inset 0 0 0 1px var(--line);font-family:var(--font);color:var(--ink2);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}
.gsh-hud[hidden]{display:none}
.gsh-txt{display:flex;flex-direction:column;min-width:0;line-height:1.2}
.gsh-txt b{font-size:11px;letter-spacing:.12em;color:var(--ink)}
.gsh-txt span{font-size:13px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gsh-bar{position:relative;width:64px;height:5px;border-radius:3px;background:var(--chip);overflow:hidden;flex:none}
.gsh-bar i{position:absolute;left:0;top:0;bottom:0;width:0;background:var(--cy);transition:width .25s}
.gsh-hud button{height:32px;padding:0 12px;border:0;border-radius:999px;background:var(--chip);color:var(--ink2);font-family:var(--font);font-size:12px;font-weight:800;flex:none}
.gsh-hud button.pri{background:var(--cy);color:var(--acc-ink)}
.gsh-hud.min{padding:0;gap:0}
.gsh-hud.min>*:not(.gsh-dot){display:none}
.gsh-dot{display:none;width:34px!important;height:34px!important;padding:0!important;font-size:11px!important}
.gsh-hud.min .gsh-dot{display:block}
.gsh-sheet{position:fixed;inset:0;display:flex;align-items:flex-end;justify-content:center;padding:12px 12px calc(12px + env(safe-area-inset-bottom));background:rgba(0,0,0,.35)}
.gsh-sheet[hidden]{display:none}
.gsh-card{width:min(420px,100%);max-height:calc(100% - 20px);overflow:auto;display:flex;flex-direction:column;gap:10px;padding:16px;border-radius:20px;background:var(--drawer);box-shadow:var(--shadow),inset 0 0 0 1px var(--line);font-family:var(--font);color:var(--ink2)}
.gsh-card h4{margin:0;font-size:20px;font-weight:800;color:var(--cy);letter-spacing:-.02em}
.gsh-card p{margin:0;font-size:13px;line-height:1.5}
.gsh-card .gsh-l{font-size:10px;letter-spacing:.16em;font-weight:700;color:var(--ink);margin-top:4px}
.gsh-seg{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.gsh-seg button{height:40px;border:0;border-radius:11px;background:var(--chip);color:var(--ink2);font-family:var(--font);font-size:13px;font-weight:800}
.gsh-seg button.on{background:var(--cy);color:var(--acc-ink)}
.gsh-chk{display:flex;align-items:center;gap:10px;font-size:13px;font-weight:700;padding:4px 0}
.gsh-chk input{width:20px;height:20px;accent-color:var(--cy);flex:none}
.gsh-row{display:flex;gap:8px;margin-top:4px}
.gsh-row .btn{flex:1}
.gsh-card small{font-size:11.5px;color:var(--ink);line-height:1.45}
`);

    // ---------- estado ----------
    let sh = null, cur = 'A', rafT = 0, ready = false, endShown = false;
    const store = {
      get() { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { return null; } },
      set(v) { try { if (v) localStorage.setItem(KEY, JSON.stringify(v)); else localStorage.removeItem(KEY); } catch {} },
    };
    const ti = (L) => LETS.indexOf(L);
    const hasNotes = (n, L) => n[ti(L)].some(r => r.some(Boolean));
    const nameNow = () => { const st = gp.estado(); return st ? st.nombre || '' : ''; };
    // orden de los tracks: como aparecen en la canción y después los que falten, por letra
    function order(n) {
      const o = [];
      for (const b of gp.cancion()) if (!o.includes(b.track)) o.push(b.track);
      for (const L of LETS) if (!o.includes(L)) o.push(L);
      return o.filter(L => hasNotes(n, L));
    }
    function stats(n) {
      const r = { total: 0, done: 0, wrong: 0, per: {} };
      for (const L of sh.tracks) {
        const t = ti(L); let tot = 0, dn = 0, wr = 0;
        for (let p = 0; p < 8; p++) for (let s = 0; s < 16; s++) {
          const want = sh.snap[t][p][s], has = n[t][p][s];
          if (want) { tot++; if (has) dn++; if (has && has !== want) wr++; } else if (has) wr++;
        }
        r.per[L] = { tot, dn, wr }; r.total += tot; r.done += dn; r.wrong += wr;
      }
      return r;
    }
    const nextPending = (n, after) => { const i = sh.tracks.indexOf(after); for (let k = 1; k <= sh.tracks.length; k++) { const L = sh.tracks[(i + k) % sh.tracks.length]; const st = stats(n).per[L]; if (st.dn < st.tot) return L; } return null; };

    // ---------- marcas y progreso ----------
    function refresh() {
      cancelAnimationFrame(rafT);
      rafT = requestAnimationFrame(() => {
        if (!sh) return;
        if (sh.nombre !== nameNow()) { pause(); return; } // abrieron otro tema
        const n = gp.notas(), st = stats(n), t = ti(cur);
        gp.limpiarMarcas();
        if (sh.tracks.includes(cur)) {
          let first = true;
          for (let s = 0; s < 16; s++) for (let p = 0; p < 8; p++) {
            if (sh.snap[t][p][s] && !n[t][p][s]) { gp.marcar(PIS[p], s, sh.marcas + (first ? ' sig' : '')); first = false; }
          }
        }
        const here = st.per[cur], doneHere = !here || here.dn >= here.tot, nx = doneHere ? nextPending(n, cur) : null;
        for (const L of sh.tracks) { const q = st.per[L]; if (q.dn < q.tot && L !== cur) gp.marcarTrack(L, sh.marcas + (L === nx ? ' sig' : '')); }
        // cartel de abajo
        hudBar.style.width = (st.total ? st.done / st.total * 100 : 0).toFixed(1) + '%';
        hudDot.textContent = st.total ? Math.round(st.done / st.total * 100) + '%' : 'S';
        if (st.done >= st.total) {
          hudT.textContent = 'SHADOW'; hudS.textContent = st.wrong ? `Listo, con ${st.wrong} nota${st.wrong > 1 ? 's' : ''} distinta${st.wrong > 1 ? 's' : ''}` : 'Listo: quedó igual';
          hudX.textContent = 'Terminar'; hudX.classList.add('pri');
          if (!endShown) { endShown = true; gp.aviso(st.wrong ? 'Shadow: están todas las notas, pero hay algunas que no son las del original.' : 'Shadow: el tema quedó igual que el original. Tocá Terminar.', 3200); }
        } else {
          endShown = false; hudX.textContent = 'Salir'; hudX.classList.remove('pri');
          hudT.textContent = `SHADOW · TRACK ${cur}`;
          hudS.textContent = !sh.tracks.includes(cur) ? `Este track no está en la guía. Seguí con ${nx || sh.tracks.find(L => st.per[L].dn < st.per[L].tot)}`
            : doneHere ? `Listo el ${cur}. Seguí con ${nx}` : `${here.dn} de ${here.tot} · faltan ${st.total - st.done} en total`;
        }
      });
    }

    // ---------- tocar: la nota exacta del original ----------
    function onTap(pista, paso, track) {
      if (!sh || !sh.tracks.includes(track)) return undefined;
      const p = PIS.indexOf(pista), v = p >= 0 ? sh.snap[ti(track)][p][paso] : 0;
      if (v) return v;
      return sh.estricto ? 0 : undefined;
    }
    gp.cuando('toque', () => { if (sh) refresh(); });
    gp.cuando('track', (e) => { cur = e.track; if (sh) refresh(); if (!ready) { ready = true; boot(); } });
    gp.cuando('cambio', (e) => { cur = e.track; if (sh) refresh(); });

    // ---------- empezar, pausar, salir ----------
    function start(opt) {
      const snap = gp.notas(), tracks = opt.alcance === 'track' ? (hasNotes(snap, cur) ? [cur] : []) : order(snap);
      if (!tracks.length) { gp.aviso('Este tema no tiene notas para rehacer'); return; }
      const clean = snap.map((p, i) => tracks.includes(LETS[i]) ? p.map(r => r.map(() => 0)) : p);
      sh = { snap, tracks, estricto: opt.estricto, marcas: opt.marcas, nombre: nameNow(), t: Date.now() };
      store.set(sh); endShown = false;
      gp.ponerNotas(clean);
      gp.alTocar(onTap);
      if (!tracks.includes(cur) || opt.alcance === 'todo') gp.irATrack(tracks[0]);
      hud.hidden = false; hud.classList.remove('min');
      refresh();
    }
    function resume(saved) {
      sh = saved; endShown = false; gp.alTocar(onTap); hud.hidden = false; refresh();
    }
    function pause() { // otro tema abierto: la guía se apaga, el original sigue guardado
      sh = null; gp.alTocar(null); gp.limpiarMarcas(); hud.hidden = true;
      gp.aviso('Shadow quedó en pausa porque abriste otro tema. Para seguir, volvé a ese tema y abrí Shadow desde el menú.', 4200);
    }
    function finish(how) {
      const saved = sh || store.get(); if (!saved) return;
      if (how === 'original') { // vuelve el original solo en los tracks de la guía
        const n = gp.notas();
        for (const L of saved.tracks) n[ti(L)] = saved.snap[ti(L)].map(r => r.slice());
        gp.ponerNotas(n);
      }
      sh = null; store.set(null); gp.alTocar(null); gp.limpiarMarcas(); hud.hidden = true; closeSheet();
      gp.aviso(how === 'original' ? 'Shadow: volvió el tema original' : 'Shadow terminado', 1800);
    }

    // ---------- cartel de abajo ----------
    const hud = document.createElement('div'); hud.className = 'gsh-hud'; hud.hidden = true;
    hud.innerHTML = '<button class="gsh-dot" aria-label="Mostrar Shadow">S</button><div class="gsh-txt"><b></b><span></span></div><i class="gsh-bar"><i></i></i><button class="gsh-min" aria-label="Achicar">–</button><button class="gsh-x">Salir</button>';
    ui.appendChild(hud);
    const hudT = hud.querySelector('.gsh-txt b'), hudS = hud.querySelector('.gsh-txt span'), hudBar = hud.querySelector('.gsh-bar i'), hudX = hud.querySelector('.gsh-x'), hudDot = hud.querySelector('.gsh-dot');
    hud.querySelector('.gsh-min').addEventListener('click', () => hud.classList.add('min'));
    hudDot.addEventListener('click', () => hud.classList.remove('min'));
    hudX.addEventListener('click', () => {
      if (!sh) return;
      const st = stats(gp.notas());
      if (st.done >= st.total && !st.wrong) finish('dejar'); else askExit(st);
    });

    // ---------- hojas (empezar, salir, seguir) ----------
    const sheet = document.createElement('div'); sheet.className = 'gsh-sheet'; sheet.hidden = true; ui.appendChild(sheet);
    sheet.addEventListener('click', (e) => { if (e.target === sheet) closeSheet(); });
    function closeSheet() { sheet.hidden = true; sheet.innerHTML = ''; }
    function card(html) { sheet.innerHTML = '<div class="gsh-card">' + html + '</div>'; sheet.hidden = false; return sheet.firstChild; }

    function openStart() {
      const n = gp.notas(), all = order(n), notes = (L) => n[ti(L)].reduce((a, r) => a + r.filter(Boolean).length, 0);
      if (!all.length) { card('<h4>Shadow</h4><p>Este tema todavía no tiene notas. Abrí un tema ya armado (por ejemplo desde Mis beats) y volvé a elegir Shadow.</p><div class="gsh-row"><button class="btn pri" data-a="x">Entendido</button></div>').querySelector('[data-a="x"]').addEventListener('click', closeSheet); return; }
      const total = all.reduce((a, L) => a + notes(L), 0), opt = { alcance: 'todo', marcas: 'd', estricto: true };
      const c = card(`<h4>Shadow</h4>
        <p>Volvé a armar este tema mientras lo filmás. Las notas se esconden y queda una marca en cada botón que tenés que tocar; la que sigue late. Al tocarlo se pone la nota exacta del original, con su altura.</p>
        <span class="gsh-l">QUÉ REHACER</span>
        <div class="gsh-seg" data-k="alcance"><button data-v="todo">Todo el tema</button><button data-v="track">Solo el track ${cur}</button></div>
        <small data-info></small>
        <span class="gsh-l">MARCAS</span>
        <div class="gsh-seg" data-k="marcas"><button data-v="d">Discretas</button><button data-v="c">Claras</button></div>
        <small>Discretas: un punto chico en el centro, que casi no se ve en un video. Claras: un aro naranja.</small>
        <label class="gsh-chk"><input type="checkbox" checked> Solo dejar tocar lo marcado</label>
        <small>El tema original queda guardado hasta que salgas de Shadow. Mientras tanto no lo guardes en Mis beats.</small>
        <div class="gsh-row"><button class="btn" data-a="x">Cancelar</button><button class="btn pri" data-a="go">Empezar</button></div>`);
      const info = c.querySelector('[data-info]');
      const sync = () => {
        c.querySelectorAll('.gsh-seg').forEach(g => g.querySelectorAll('button').forEach(b => b.classList.toggle('on', opt[g.dataset.k] === b.dataset.v)));
        info.textContent = opt.alcance === 'todo' ? `${total} notas en ${all.length} track${all.length > 1 ? 's' : ''} (${all.join(', ')}), en el orden de la canción.` : `${notes(cur)} notas en el track ${cur}.`;
        c.querySelector('[data-a="go"]').disabled = opt.alcance === 'track' && !notes(cur);
      };
      c.querySelectorAll('.gsh-seg button').forEach(b => b.addEventListener('click', () => { opt[b.parentNode.dataset.k] = b.dataset.v; sync(); }));
      c.querySelector('input').addEventListener('change', (e) => { opt.estricto = e.target.checked; });
      c.querySelector('[data-a="x"]').addEventListener('click', closeSheet);
      c.querySelector('[data-a="go"]').addEventListener('click', () => { closeSheet(); start(opt); });
      sync();
    }
    function askExit(st) {
      const left = st.total - st.done;
      const c = card(`<h4>Salir de Shadow</h4>
        <p>${left ? `Faltan ${left} nota${left > 1 ? 's' : ''}.` : ''} ${st.wrong ? `Hay ${st.wrong} nota${st.wrong > 1 ? 's' : ''} distinta${st.wrong > 1 ? 's' : ''} al original.` : ''} ¿Cómo dejo el tema?</p>
        <div class="gsh-row"><button class="btn" data-a="original">Volver al original</button><button class="btn" data-a="dejar">Dejar lo que armé</button></div>
        <div class="gsh-row"><button class="btn pri" data-a="x">Seguir con Shadow</button></div>`);
      c.querySelector('[data-a="original"]').addEventListener('click', () => finish('original'));
      c.querySelector('[data-a="dejar"]').addEventListener('click', () => finish('dejar'));
      c.querySelector('[data-a="x"]').addEventListener('click', closeSheet);
    }
    function askResume(saved) {
      const mins = Math.max(1, Math.round((Date.now() - (saved.t || Date.now())) / 60000));
      const same = saved.nombre === nameNow();
      const c = card(`<h4>Shadow sin terminar</h4>
        <p>Quedó un Shadow abierto${saved.nombre ? ` de "${saved.nombre.replace(/[<>&"]/g, '')}"` : ''} (hace ${mins < 60 ? mins + ' min' : Math.round(mins / 60) + ' h'}). El original sigue guardado.</p>
        ${same ? '' : '<small>Ahora está abierto otro tema: para seguir, primero abrí ese tema. "Volver al original" pone las notas guardadas en el tema que está abierto.</small>'}
        <div class="gsh-row">${same ? '<button class="btn pri" data-a="seguir">Seguir</button>' : ''}<button class="btn" data-a="original">Volver al original</button></div>
        <div class="gsh-row"><button class="btn" data-a="descartar">Descartar</button></div>`);
      const s = c.querySelector('[data-a="seguir"]'); if (s) s.addEventListener('click', () => { closeSheet(); resume(saved); });
      c.querySelector('[data-a="original"]').addEventListener('click', () => finish('original'));
      c.querySelector('[data-a="descartar"]').addEventListener('click', () => { store.set(null); closeSheet(); gp.aviso('Shadow descartado', 1400); });
    }
    function boot() { // al abrir la página: si quedó uno a medias, pregunta
      const saved = store.get(); if (saved && !sh) askResume(saved);
    }

    gp.herramienta({
      id: 'shadow',
      nombre: 'Shadow',
      detalle: 'Guía para volver a armar este tema mientras lo filmás',
      abrir() {
        if (sh) { askExit(stats(gp.notas())); return; }
        const saved = store.get(); if (saved) { askResume(saved); return; }
        openStart();
      },
    });
  },
});
