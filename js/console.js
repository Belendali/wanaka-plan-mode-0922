/* The plan console — the handheld the plan arrives on.
   Ported from the plan-mode prototype; the host mounts it and listens for approval. */
const Console = (() => {
  const $ = (id) => document.getElementById(id);
  let host = null, plan = null;

  const ic = (d, extra = '') => `<svg class="ti" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="1.9" stroke-linecap="round"
    stroke-linejoin="round">${d}${extra}</svg>`;

  function compE(p) {
    const f = p.form;
    const so = (label, v, on, title = '') =>
      `<button class="eo${on ? ' is-on' : ''}" data-v="${v}"${title ? ` title="${title}"` : ''}>${label}</button>`;
    const seg = (k, items) => `<span class="eseg" data-k="${k}">${items}</span>`;
    const dots = Array.from({ length: 12 }, () => '<i></i>').join('');
    return `
    <div class="room room--studio room--square">
      <!-- no room of its own: the console arrives over the Studio, behind a scrim -->
      <span class="room__scrim"></span>

      <!-- behind the console: the light that spills out as it opens -->
      <span class="con__light" aria-hidden="true"><i class="con__rays"></i></span>
      <!-- the keychain: drawn flat over the room, hung from the eyelet, pulled by gravity -->
      <div class="kc" id="kc" aria-hidden="true">
        <svg class="kc__chain" id="kcChain"></svg>
        <button class="kc__charm" id="kcCharm" tabindex="-1">
          <img class="kc__img" src="assets/console/tag-v2-1.png" alt="">
        </button>
      </div>
      <div class="con" id="con">
        <span class="con__paw" aria-hidden="true"><img src="assets/console/paw.png" alt=""><i class="paw__arm"></i></span>
        <div class="con__body">
          <!-- the half that stays on the desk: the plan, and the buttons -->
          <!-- the underside of the base, seen when the shut console turns round -->
          <div class="con__under" aria-hidden="true">
            <span class="under__vents">${'<i></i>'.repeat(7)}</span>
            <span class="under__label"><b>wanaka</b><em>W1 · Handheld plan console</em><em>Made for players · Build 0922</em></span>
          </div>
          <section class="con__half con__base">
            <!-- the strap hole the keychain hangs from -->
            <span class="con__lug"><span class="con__eyelet" id="eyelet"></span></span>
            <div class="con__glass">
              <div class="ts" id="ts" data-step="1">
                <header class="ts__top">
                  <button class="ts__tab is-on" data-step="1"><b>1</b>Plan</button>
                  <button class="ts__tab" data-step="2"><b>2</b>Assets</button>
                  <span class="ts__bat" title="Battery 82%"><em>82%</em><span class="ts__cell"><i></i><i></i><i></i><i></i></span></span>
                </header>
                <div class="ts__pages">
                  <section class="ts__page is-on" data-page="1">
                    <input class="ts__name" data-need value="${p.title}" placeholder="Name your game" spellcheck="false">
                    <div class="tr"><span class="tr__k">Genre</span>
                      <button class="ep" data-slip="genre"><span class="ep__v" data-val>${genreV(f.genre)}</span><i class="ep__c"><svg viewBox="0 0 40 40" aria-hidden="true"><path d="M30 15L20 25L10 15"/></svg></i></button>
                    </div>
                    <label class="tf"><span class="tr__k">What you do</span>
                      <textarea data-need rows="2" spellcheck="false" placeholder="What does the player do?">${f.what || p.doing}</textarea>
                    </label>
                    <label class="tf"><span class="tr__k">How it feels</span>
                      <textarea rows="2" spellcheck="false" placeholder="What should it feel like?">${f.feel || p.feel}</textarea>
                    </label>
                    <div class="tr"><span class="tr__k">Look</span>
                      <button class="ep ep--look" data-slip="look"><span class="ep__v" data-val>${lookV(p, f.style, f.quality)}</span><i class="ep__c"><svg viewBox="0 0 40 40" aria-hidden="true"><path d="M30 15L20 25L10 15"/></svg></i></button>
                    </div>
                    <!-- the look opens as a drop-down in place, pushing the rest down -->
                    <div class="elook" data-slipbox="look" hidden>
                      <header class="elook__h"><b>Pick a look</b><button class="elook__done" data-slipdone>Done</button></header>
                      <div class="eslip__grid">${F.styles.map(([k, n]) =>
                        `<button class="eslip__s${k === f.style ? ' is-on' : ''}" data-s="${k}"><img src="${thumb(p, k)}" alt=""><span>${n}</span></button>`).join('')}</div>
                      <div class="eslip__q">${F.quality.map((q) =>
                        `<button class="eo${q === f.quality ? ' is-on' : ''}" data-q="${q}">${q}</button>`).join('')}</div>
                    </div>
                    <div class="tr"><span class="tr__k">Scope</span>
                      <span class="eseg eseg--scope" data-k="scope">${F.scopes.map(([k, n, w, cr, t]) =>
                        `<button class="eo eo--scope${k === f.scope ? ' is-on' : ''}" data-v="${k}"><b>${n}</b><small>${w}</small><small>${cr} · ${t}</small></button>`).join('')}</span>
                    </div>
                    <div class="tr"><span class="tr__k">Plays on</span>
                      <span class="emulti" data-multi>${[['Web', 'web'], ['Mobile', 'mobile']].map(([n, k]) =>
                        `<button class="eck${f.plat.includes(k) ? ' is-on' : ''}" data-v="${k}"><i></i>${n}</button>`).join('')}</span>
                    </div>
                    <div class="tr"><span class="tr__k">A run</span>
                      ${seg('len', F.length.map((n, i) => so(n, i, i === f.len)).join(''))}
                    </div>
                    <div class="tr"><span class="tr__k">Difficulty</span>
                      ${seg('diff', F.difficulty.map((n, i) => so(n, i, i === f.diff)).join(''))}
                    </div>
                  </section>
                  <section class="ts__page ts__page--parts" data-page="2">
                    <div class="elib elib--ts" id="elibTs"></div>
                  </section>
                </div>
                <footer class="ts__foot">
                  <span class="ts__sum"><b data-sum>${sumV(f.scope)}</b><em data-count></em></span>
                  <button class="ts__go" id="tsgo">Next · Assets<i class="kb">A</i></button>
                </footer>

                <div class="eslip eslip--genre" data-slipbox="genre" hidden>
                  ${F.genres.map(([k, n]) =>
                    `<button class="eslip__g${k === f.genre ? ' is-on' : ''}" data-g="${k}">${GICON[k]}${n}</button>`).join('')}
                </div>
              </div>
            </div>
            <div class="con__ctrl">
              <span class="con__dpad">
                <i class="dpad__well"></i><i class="dpad__cap"><i class="dpad__v"></i><i class="dpad__h"></i><i class="dpad__dot"></i></i>
                <button class="con__pad con__pad--up" data-pad="up" aria-label="Scroll up"></button>
                <button class="con__pad con__pad--left" data-pad="left" aria-label="Step 1"></button>
                <button class="con__pad con__pad--right" data-pad="right" aria-label="Step 2"></button>
                <button class="con__pad con__pad--down" data-pad="down" aria-label="Scroll down"></button>
              </span>
              <span class="con__abxy">
                <button data-key="x" title="X · look">X</button>
                <button data-key="y" title="Y · genre">Y</button>
                <button data-key="a" title="A · next / approve">A</button>
                <button data-key="b" title="B · back">B</button>
              </span>
              <span class="con__legend">A next<br>B back</span>
              <span class="con__sys">
                <button data-key="select" title="Select · next look"></button>
                <button data-key="start" title="Start · next / approve"></button>
              </span>
              <span class="con__grille">${dots}</span>
              <span class="con__led"></span>
            </div>
          </section>

          <span class="con__hinge" aria-hidden="true"><i></i><i></i></span>

          <!-- the lid: swings open around the hinge, the game on its face -->
          <section class="con__lid">
            <div class="con__face">
              <span class="lid__ver" aria-hidden="true"><i></i>Plan · Version 1.0</span>
              <div class="con__glass con__glass--game">
                <img id="congame" src="${p.cover}" alt="">
                <button class="regen" id="regen">Regenerate cover</button>
                <!-- step 2: the parts on this screen, their models on the touch screen -->
                <div class="elib elib--parts" id="elib">
                  <header class="eparts__h"><b>Assets</b><em>Pick models for each part on the right. Leave a part alone and the Artist makes it.</em></header>
                  <div class="eslots">
                    ${p.parts.map(([name], i) => `
                      <button class="eslot${i === 0 ? ' is-sel' : ''}" data-slot="${i}">
                        <span class="eslot__t"><b>${name}</b><em data-st></em></span>
                        <span class="eslot__picks" data-picks></span>
                        <i class="eslot__go"></i>
                      </button>`).join('')}
                  </div>
                </div>
                <!-- the loading screen: once as the lid opens, again when the plan is approved -->
                <div class="cload" aria-hidden="true">
                  <span class="cload__icon"><img src="assets/console/wanaka-icon.png" alt=""><i></i></span>
                  <span class="cload__word"></span>
                  <span class="cload__bar">${Array.from({ length: 14 }, (_, i) => `<i style="--i:${i}"></i>`).join('')}</span>
                  <span class="cload__cap"><b data-cap>Opening your plan</b><em class="cload__pct"></em></span>
                </div>
                <span class="con__scan"></span>
                <span class="con__sweep"></span>
              </div>
              <!-- square console only: the shell below the 16:9 screen, dressed up -->
              <div class="lid__deco" aria-hidden="true">
                <span class="deco__id"><i class="deco__word"></i><span class="deco__stripes"><i></i><i></i><i></i></span></span>
                <img class="deco__stk deco__stk--cat" id="decoStk" src="assets/console/stk-epoxy-${1 + Math.floor(Math.random() * 6)}.png?v=3" alt="">
              </div>
            </div>
            <div class="con__back">
              <!-- the Wanaka badge stands proud of the lid; the name is cut into it -->
              <span class="lid__paws" aria-hidden="true"></span>
              <span class="lid__badge"><img src="assets/console/wanaka-icon.png" alt=""></span>
              <span class="lid__word" aria-label="Wanaka"></span>
              <span class="lid__screw lid__screw--a"></span><span class="lid__screw lid__screw--b"></span>
            </div>
          </section>
        </div>
        <span class="con__shadow"></span>
      </div>

      <button class="pcat" id="pcat" title="Planner Wana">
        <span class="pcat__shadow"></span>
        <img src="assets/console/crew-planner.webp" alt="Planner Wana">
      </button>

      <button class="replay" id="replay">↻ Replay</button>
    </div>`;
  }

  const F = {
    genres: [['adventure', 'Adventure'], ['platformer', 'Platformer'], ['puzzle', 'Puzzle'],
             ['collect', 'Collectathon'], ['racing', 'Racing'], ['action', 'Action']],
    styles: [['default', 'Default'], ['realistic', 'Realistic'], ['toon', 'Stylized Toon'],
             ['graphic-ink', 'Graphic Ink'], ['ink-wash', 'Ink Wash'], ['pixel', 'Pixel Screen'],
             ['crosshatch', 'Crosshatch'], ['one-bit', 'One-Bit'], ['phosphor', 'Phosphor'],
             ['retro-warm', 'Retro Warm'], ['horror', 'Horror']],
    quality: ['Low', 'Medium', 'High', 'Ultra', 'Cinematic'],
    scopes: [['slice', 'Slice', '1 room · 3 assets', '180–260 cr', '~6 min'],
             ['standard', 'Standard', '4 rooms · 6 assets', '320–560 cr', '~12 min'],
             ['ambitious', 'Ambitious', '7 rooms · 11 assets', '640–980 cr', '~25 min']],
    length: ['3–5 min', '8–12 min', '15–20 min'],
    difficulty: ['Gentle', 'Normal', 'Tough'],
    genreSub: {
      adventure: 'Explore a world and find your way', platformer: 'Jump, land and time your moves',
      puzzle: 'Work it out, then pull it off', collect: 'Sweep a place clean of things worth having',
      racing: 'Get there first, or beat the clock', action: 'React fast and stay alive',
    },
    lengthSub: ['Fast retries, quick payoff', 'Room for mastery and an arc', 'A longer run with varied beats'],
    diffSub: ['Forgiving, few hazards', 'Fair, with room to fail', 'Tight timing, real pressure'],
  };
  const GICON = {
    adventure: ic('<path d="M3 18l5-11 5 8 3-5 5 8z"/>'),
    platformer: ic('<path d="M3 19h5v-5h5v-5h5V5h3"/>'),
    puzzle: ic('<path d="M5 9h3.5a2 2 0 1 1 4 0H16v3.5a2 2 0 1 0 0 4V20H5z"/>'),
    collect: ic('<path d="M12 4l2.4 5 5.4.6-4 3.7 1.1 5.4L12 16l-4.9 2.7 1.1-5.4-4-3.7 5.4-.6z"/>'),
    racing: ic('<path d="M5 21V4m0 1h12l-2 4 2 4H5"/>'),
    action: ic('<path d="M13 3L5 13h6l-1 8 8-10h-6z"/>'),
  };
  // each cover has its own set of style renders
  const full = (p, k) => (p.set === 'boy' ? `assets/console/boy-${k}.jpg` : `assets/console/cover-${k}.jpg`);
  const thumb = (p, k) => (p.set === 'boy' ? `assets/console/boy-sty-${k}.jpg` : `assets/console/sty-${k}.jpg`);
  const opt = (label, v, on, title = '') =>
    `<button class="o${on ? ' is-on' : ''}" data-v="${v}"${title ? ` title="${title}"` : ''}><i class="rd"></i>${label}</button>`;
  const genreV = (k) => {
    const g = F.genres.find((x) => x[0] === k) || F.genres[0];
    return `${GICON[g[0]]}${g[1]}`;
  };
  const lookV = (p, k, q) => {
    const st = F.styles.find((x) => x[0] === k) || F.styles[0];
    return `<img src="${thumb(p, k)}" alt="">${st[1]} · ${q}`;
  };
  const sumV = (k) => {
    const sc = F.scopes.find((x) => x[0] === k) || F.scopes[1];
    return `${sc[2].split(' · ')[0]} · ${sc[3]}`;
  };

  function wireForm(p, root, onLook) {
    const f = { ...p.form };
    const box = (k) => root.querySelector(`[data-slipbox="${k}"]`);
    const val = (k) => root.querySelector(`[data-slip="${k}"] [data-val]`);
    const close = () => {
      root.querySelectorAll('[data-slipbox]').forEach((x) => { x.hidden = true; });
      root.querySelectorAll('[data-slip]').forEach((x) => x.classList.remove('is-open'));
    };

    root.querySelectorAll('[data-slip]').forEach((b) => {
      b.onclick = (e) => {
        e.stopPropagation();
        const slip = box(b.dataset.slip);
        const wasShut = slip.hidden;
        close();
        slip.hidden = !wasShut;
        b.classList.toggle('is-open', wasShut);
        if (wasShut && slip.classList.contains('elook')) {
          setTimeout(() => slip.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 30);
        }
      };
    });
    root.querySelectorAll('[data-slipdone]').forEach((d) => { d.onclick = (e) => { e.stopPropagation(); close(); }; });
    root.addEventListener('click', (e) => {
      if (!e.target.closest('[data-slipbox]') && !e.target.closest('[data-slip]')) close();
    });

    box('genre').querySelectorAll('[data-g]').forEach((b) => {
      b.onclick = () => {
        f.genre = b.dataset.g;
        box('genre').querySelectorAll('[data-g]').forEach((x) => x.classList.toggle('is-on', x === b));
        val('genre').innerHTML = genreV(f.genre);
        close();
      };
    });
    // choosing a look re-renders the game in that style and re-lights the room
    box('look').querySelectorAll('[data-s]').forEach((b) => {
      b.onclick = () => {
        f.style = b.dataset.s;
        box('look').querySelectorAll('[data-s]').forEach((x) => x.classList.toggle('is-on', x === b));
        val('look').innerHTML = lookV(p, f.style, f.quality);
        onLook(full(p, f.style));
      };
    });
    box('look').querySelectorAll('[data-q]').forEach((b) => {
      b.onclick = () => {
        f.quality = b.dataset.q;
        box('look').querySelectorAll('[data-q]').forEach((x) => x.classList.toggle('is-on', x === b));
        val('look').innerHTML = lookV(p, f.style, f.quality);
      };
    });

    root.querySelectorAll('[data-k]').forEach((g) => {
      g.querySelectorAll('[data-v]').forEach((o) => {
        o.onclick = () => {
          g.querySelectorAll('[data-v]').forEach((x) => x.classList.toggle('is-on', x === o));
          const sum = root.querySelector('[data-sum]');
          if (g.dataset.k === 'scope' && sum) sum.textContent = sumV(o.dataset.v);
        };
      });
    });

    // a game has to ship somewhere: the last platform will not untick
    root.querySelectorAll('[data-multi] [data-v]').forEach((c) => {
      c.onclick = () => {
        const on = root.querySelectorAll('[data-multi] [data-v].is-on').length;
        if (c.classList.contains('is-on') && on === 1) {
          c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake');
          return;
        }
        c.classList.toggle('is-on');
      };
    });
  }

  // several per row, or leave it to the Artist — which is the same as clearing it

  function needWatch(root) {
    root.querySelectorAll('[data-need]').forEach((x) =>
      x.addEventListener('input', () => x.classList.remove('is-missing')));
  }
  function formCheck(root, btn) {
    const need = [...root.querySelectorAll('[data-need]')];
    const miss = need.filter((x) => !x.value.trim());
    need.forEach((x) => x.classList.toggle('is-missing', miss.includes(x)));
    if (miss.length) {
      btn.classList.remove('shake'); void btn.offsetWidth; btn.classList.add('shake');
      miss[0].focus();
    }
    return !miss.length;
  }

  function wireE(p) {
    const ts = $('ts');
    const con = $('con');
    const room = document.querySelector('.room');
    const body = document.querySelector('.con__body');
    const go = $('tsgo');
    const page1 = ts.querySelector('[data-page="1"]');
    needWatch(page1);

    const key = (k) => con.querySelector(`[data-key="${k}"]`);
    const pad = con.querySelector('.con__dpad');
    const press = (el) => {
      if (!el) return;
      el.classList.add('is-down');
      setTimeout(() => el.classList.remove('is-down'), 170);
    };
    const tip = (d) => {
      pad.classList.add('is-' + d);
      setTimeout(() => pad.classList.remove('is-' + d), 170);
    };

    const step = (n) => {
      if (n === 2 && !formCheck(page1, go)) return;
      ts.dataset.step = n;
      ts.querySelectorAll('.ts__tab').forEach((t) => t.classList.toggle('is-on', +t.dataset.step === n));
      ts.querySelectorAll('.ts__page').forEach((pg) => pg.classList.toggle('is-on', +pg.dataset.page === n));
      con.classList.toggle('is-lib', n === 2 && !con.classList.contains('is-approved') && !con.classList.contains('is-loading'));
      if (!con.classList.contains('is-approved')) {
        if (n === 1) go.innerHTML = 'Next · Assets<i class="kb">A</i>';
        else con.__enter?.();
      }
    };
    ts.querySelectorAll('.ts__tab').forEach((t) => { t.onclick = () => step(+t.dataset.step); });

    const cat = $('pcat');
    const hop = () => { cat.classList.remove('is-hop'); void cat.offsetWidth; cat.classList.add('is-hop'); };
    // on Assets the button walks the parts one by one; after the last it approves
    go.onclick = () => {
      press(key('a'));
      if (ts.dataset.step === '1') { step(2); return; }
      if (con.classList.contains('is-approved') || con.classList.contains('is-loading')) return;
      if (!con.__next()) con.__approve();
    };
    con.__approve = () => {
      if (con.classList.contains('is-approved') || room.classList.contains('is-leaving')) return;
      press(key('start'));
      // approving: the lid shuts, the console spins, the paw takes it away, and the Studio comes back
      go.disabled = true;
      go.innerHTML = 'Approved ✓';
      con.classList.remove('is-lib');
      body.style.removeProperty('--rx'); body.style.removeProperty('--ry');
      room.classList.add('is-leaving');
      setTimeout(() => { room.classList.add('is-gone'); document.dispatchEvent(new CustomEvent('e-approved')); }, 3900);
    };
    cat.onclick = hop;

    // the console's own buttons drive the screen
    const openSlip = () => ts.querySelector('[data-slipbox]:not([hidden])');
    const act = {
      a: () => go.click(),
      start: () => go.click(),
      b: () => {
        const s = openSlip();
        if (s) { s.hidden = true; return; }
        if (ts.dataset.step === '2') step(1);
      },
      x: () => ts.querySelector('[data-slip="look"]').click(),
      y: () => ts.querySelector('[data-slip="genre"]').click(),
      select: () => {                            // flick through the looks
        const all = [...ts.querySelectorAll('[data-slipbox="look"] [data-s]')];
        const at = all.findIndex((x) => x.classList.contains('is-on'));
        all[(at + 1) % all.length].click();
      },
    };
    Object.keys(act).forEach((k) => {
      const el = key(k);
      el.onclick = (e) => { e.stopPropagation(); press(el); act[k](); };
    });
    const page = () => ts.querySelector('.ts__page.is-on');
    const dir = {
      left: () => step(1),
      right: () => step(2),
      up: () => (ts.dataset.step === '2' ? con.__slot(-1) : page().scrollBy({ top: -70, behavior: 'smooth' })),
      down: () => (ts.dataset.step === '2' ? con.__slot(1) : page().scrollBy({ top: 70, behavior: 'smooth' })),
    };
    pad.querySelectorAll('[data-pad]').forEach((b) => {
      b.onclick = () => { tip(b.dataset.pad); dir[b.dataset.pad](); };
    });

    // and so does the keyboard, unless you are typing
    if (window.__eKeys) document.removeEventListener('keydown', window.__eKeys);
    window.__eKeys = (e) => {
      if (which !== 'e' || !document.getElementById('ts')) return;
      const typing = /INPUT|TEXTAREA/.test((document.activeElement || {}).tagName || '');
      if (typing) { if (e.key === 'Escape') document.activeElement.blur(); return; }
      const m = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' }[e.key];
      if (m) { e.preventDefault(); pad.querySelector(`[data-pad="${m}"]`).click(); return; }
      if (e.key === 'Enter') { e.preventDefault(); key('a').click(); }
      if (e.key === 'Escape' || e.key === 'Backspace') { e.preventDefault(); key('b').click(); }
    };
    document.addEventListener('keydown', window.__eKeys);

    // the body turns a little toward the pointer — but holds still while you use the screen
    room.onmousemove = (e) => {
      if (e.target.closest('.ts') || room.classList.contains('is-leaving')) return;
      const r = room.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      body.style.setProperty('--ry', `${x * 7}deg`);
      body.style.setProperty('--rx', `${10 - y * 5}deg`);
    };
    room.onmouseleave = () => ['--ry', '--rx'].forEach((v) => body.style.removeProperty(v));

    wireLibrary(p, ts, con);
    wireForm(p, ts, (src) => { $('congame').src = src; });
    wireKeychain(room);
    // the sticker: a tap presses it down a touch and it springs straight back
    const stk = $('decoStk');
    if (stk) stk.onclick = () => { stk.classList.remove('is-tap'); void stk.offsetWidth; stk.classList.add('is-tap'); };
    // regenerate the cover: the screen shimmers and comes back as a new take
    const regen = $('regen'), game = $('congame');
    let take = 0;
    const TAKES = [['50% 50%', 1], ['30% 55%', 1.12], ['68% 45%', 1.1], ['50% 70%', 1.08]];
    regen.onclick = (e) => {
      e.stopPropagation();
      if (con.classList.contains('is-regen')) return;
      con.classList.add('is-regen');
      setTimeout(() => {
        take = (take + 1) % TAKES.length;
        game.style.objectPosition = TAKES[take][0];
        game.style.transform = `scale(${TAKES[take][1]})`;
      }, 520);
      setTimeout(() => con.classList.remove('is-regen'), 1250);
    };
    $('replay').onclick = () => Console.replay();
  }

  const CHARMS = [['tag-v2-1', .524, .115, .998], ['tag-v2-2', .482, .119, .973], ['tag-v2-3', .488, .118, .996],
    ['tag-v2-4', .473, .113, .981], ['tag-v2-5', .489, .116, 1.002]];
  let charmPick = CHARMS[Math.floor(Math.random() * CHARMS.length)];
  function wireKeychain(room) {
    {
      const [f, hx, hy, ar] = charmPick, c = $('kcCharm');
      if (c) {
        c.querySelector('img').src = `assets/console/${f}.png`;
        c.style.setProperty('--hx', hx); c.style.setProperty('--hy', hy); c.style.setProperty('--ar', ar);
      }
    }
    cancelAnimationFrame(window.__kcRaf);
    const kc = $('kc'), svg = $('kcChain'), charm = $('kcCharm'), eye = $('eyelet');
    if (!kc || !eye) return;
    const N = 7;                                   // ring + links + the charm's jump ring
    const P = Array.from({ length: N }, () => ({ x: 0, y: 0, px: 0, py: 0 }));
    let seg = 9, ready = false, held = null, spin = 0, spinV = 0, last = performance.now();
    const W = [0, 1, 1, 1, 1, 1, 9];               // the charm is heavier than a link
    const anchor = () => {
      const r = eye.getBoundingClientRect(), k = kc.getBoundingClientRect();
      return { x: r.left + r.width / 2 - k.left, y: r.top + r.height / 2 - k.top, w: r.width };
    };
    const place = (a) => P.forEach((q, i) => { q.x = q.px = a.x; q.y = q.py = a.y + i * seg; });
    const step = (dt) => {
      const a = anchor();
      if (!a.w) return;
      seg = Math.max(6, a.w * .62);
      if (!ready) { place(a); ready = true; }
      const g = 2400 * dt * dt;
      P.forEach((q, i) => {
        if (i === 0 || q === held) return;
        const vx = (q.x - q.px) * .955, vy = (q.y - q.py) * .955;
        q.px = q.x; q.py = q.y;
        q.x += vx; q.y += vy + g;
      });
      P[0].x = a.x; P[0].y = a.y;
      for (let it = 0; it < 10; it++) {
        for (let i = 0; i < N - 1; i++) {
          const A = P[i], B = P[i + 1];
          const dx = B.x - A.x, dy = B.y - A.y, d = Math.hypot(dx, dy) || .001;
          const diff = (d - seg) / d;
          const wa = i === 0 || A === held ? 0 : 1 / (W[i] || 1);
          const wb = B === held ? 0 : 1 / W[i + 1];
          const sum = wa + wb || 1;
          A.x += dx * diff * wa / sum; A.y += dy * diff * wa / sum;
          B.x -= dx * diff * wb / sum; B.y -= dy * diff * wb / sum;
        }
      }
    };
    const draw = () => {
      // links alternate face-on and edge-on, like a real curb chain
      let h = '';
      for (let i = 0; i < N - 1; i++) {
        const A = P[i], B = P[i + 1];
        const cx = (A.x + B.x) / 2, cy = (A.y + B.y) / 2;
        const ang = Math.atan2(B.y - A.y, B.x - A.x) * 180 / Math.PI;
        const L = seg * 1.18;
        h += i % 2
          ? `<rect x="${-L / 2}" y="-1.3" width="${L}" height="2.6" rx="1.3" transform="translate(${cx} ${cy}) rotate(${ang})" class="kc__edge"/>`
          : `<ellipse rx="${L / 2}" ry="${seg * .36}" transform="translate(${cx} ${cy}) rotate(${ang})" class="kc__link"/>`;
      }
      const a = P[0];
      h = `<circle cx="${a.x}" cy="${a.y}" r="${seg * .72}" class="kc__ring"/>` + h;
      svg.innerHTML = h;
      const E = P[N - 1], D = P[N - 2];
      const ang = Math.atan2(E.y - D.y, E.x - D.x) * 180 / Math.PI - 90;
      charm.style.transform = `translate(${E.x}px, ${E.y}px) rotate(${ang}deg) rotateY(${spin}deg)`;
    };
    const tick = (now) => {
      const dt = Math.min(.033, (now - last) / 1000); last = now;
      const n = 2;
      for (let i = 0; i < n; i++) step(dt / n);
      if (spinV) { spin += spinV * dt; spinV *= .96; if (Math.abs(spinV) < 20) { spinV = 0; spin = Math.round(spin / 360) * 360; } }
      if (ready) draw();
      window.__kcRaf = requestAnimationFrame(tick);
    };
    window.__kcRaf = requestAnimationFrame(tick);

    // tap: the charm is recognised — it lights, jumps and spins; drag: carry it
    let down = null;
    const local = (e) => { const k = kc.getBoundingClientRect(); return { x: e.clientX - k.left, y: e.clientY - k.top }; };
    charm.onpointerdown = (e) => {
      e.preventDefault();
      charm.setPointerCapture(e.pointerId);
      down = { ...local(e), t: performance.now(), moved: false };
    };
    charm.onpointermove = (e) => {
      if (!down) return;
      const q = local(e);
      if (!down.moved && Math.hypot(q.x - down.x, q.y - down.y) > 5) { down.moved = true; held = P[N - 1]; kc.classList.add('is-held'); }
      if (held) {
        // the chain can't stretch: keep the charm within reach of the eyelet
        const A = P[0], max = (N - 1) * seg, d = Math.hypot(q.x - A.x, q.y - A.y);
        if (d > max) { q.x = A.x + (q.x - A.x) * max / d; q.y = A.y + (q.y - A.y) * max / d; }
        held.px = held.x; held.py = held.y; held.x = q.x; held.y = q.y;
      }
    };
    charm.onpointerup = () => {
      if (!down) return;
      if (!down.moved) toss();
      held = null; down = null; kc.classList.remove('is-held');
    };
    const toss = () => {
      const E = P[N - 1];
      const side = Math.random() < .5 ? -1 : 1;
      E.py = E.y + seg * .24; E.px = E.x - side * seg * .08;     // an upward kick
      P[N - 2].py = P[N - 2].y + seg * .1;
      spinV = 0;
      kc.classList.remove('is-hit'); void kc.offsetWidth; kc.classList.add('is-hit');
      const burst = document.createElement('span');
      burst.className = 'kc__burst';
      burst.style.left = `${E.x}px`; burst.style.top = `${E.y + seg * 2.6}px`;
      burst.innerHTML = Array.from({ length: 7 }, (_, i) => `<i style="--a:${i * 360 / 7 + Math.random() * 20}deg;--d:${.8 + Math.random() * .6}"></i>`).join('');
      kc.appendChild(burst);
      setTimeout(() => burst.remove(), 900);
    };
  }

  const SHELF = {
    'The bedroom': [
      [['Block castle', 'toy-blocks'], ['Reading nook', 'book-stacks'], ['Toy chest', 'dresser'], ['Hoop corner', 'basketball'],
        ['Toy garage', 'truck'], ['Plush pile', 'teddy'], ['Star mobile', 'stars'], ['Pencil desk', 'pencils'],
        ['Robot shelf', 'robot-pal'], ['Dino rug', 'dino-suit'], ['Ball bin', 'baseballs']],
      [['Alphabet blocks', 'toy-blocks'], ['Block tower', 'toy-blocks'], ['Bookcase', 'book-stacks'], ['Storybook pile', 'book-stacks'], ['Tall dresser', 'dresser']]],
    'Big toys': [
      [['Beach ball', 'basketball'], ['Fire truck', 'truck'], ['Stuffed bear', 'teddy'], ['Toy robot', 'robot-pal'],
        ['Toy dino', 'dino-suit'], ['Block tower', 'toy-blocks'], ['Giant crayons', 'pencils'], ['Bouncy ball', 'baseballs'],
        ['Pop-up book', 'book-stacks'], ['Toy cabinet', 'dresser'], ['Star pillow', 'stars']],
      [['Dump truck', 'truck'], ['Toy crane', 'truck'], ['Plush bunny', 'teddy'], ['Wind-up bear', 'teddy'], ['Kickball', 'basketball']]],
    'To collect': [
      [['Gold coins', 'stars'], ['Crayons', 'pencils'], ['Marbles', 'baseballs'], ['Mini blocks', 'toy-blocks'],
        ['Tiny books', 'book-stacks'], ['Mini trucks', 'truck'], ['Gummy bears', 'teddy'], ['Robot bolts', 'robot-pal'],
        ['Dino eggs', 'dino-suit'], ['Hoop tokens', 'basketball'], ['Drawer keys', 'dresser']],
      [['Gold stars', 'stars'], ['Glitter stars', 'stars'], ['Star badges', 'stars'], ['Paper stars', 'stars'], ['Star beads', 'stars']]],
    'The kid': [
      [['Robot suit', 'robot-pal'], ['Dino hoodie', 'dino-suit'], ['Hoop star', 'basketball'], ['Little trucker', 'truck'],
        ['Bear onesie', 'teddy'], ['Bookworm', 'book-stacks'], ['Little artist', 'pencils'], ['Star captain', 'stars'],
        ['Block builder', 'toy-blocks'], ['Slugger', 'baseballs'], ['Sleepwalker', 'dresser']],
      [['Hiker kid', 'backpacker'], ['Camp kid', 'backpacker'], ['Map reader', 'backpacker'], ['Trail scout', 'backpacker'], ['Tiny backpacker', 'backpacker']]],
  };
  function wireLibrary(p, ts, con) {
    const lib = $('elibTs');
    const slots = [...con.querySelectorAll('.eslot')];
    const picked = p.parts.map(([, opts, pick]) => new Set(pick >= 0 ? [opts[pick]] : []));
    const seen = new Set();
    let sel = 0;
    const img = (n, key) => (!p.partImg ? '' : key ? `assets/console/boy-part-${key}.jpg` : p.partImg(n));
    const models = (i) => {
      const [name, opts] = p.parts[i];
      const [more, deep] = SHELF[name] || [[], []];
      return [...opts.map((n) => [n, '', 'pick']), ...more.map(([n, k]) => [n, k, '']), ...deep.map(([n, k]) => [n, k, 'deep'])]
        .map(([n, key, kind]) => ({ n, kind, src: img(n, key) }));
    };
    const card = (m) => `
      <button class="lcard" data-n="${m.n}"${m.kind === 'deep' ? ' data-deep hidden' : ''}>
        <span class="lcard__art">${m.src ? `<img src="${m.src}" alt="">` : `<b>${m.n[0]}</b>`}<i class="lcard__box"></i></span>
        <span class="lcard__n">${m.n}</span>${m.kind === 'pick' ? '<em>Artist’s pick</em>' : ''}
      </button>`;
    const paintRows = () => {
      slots.forEach((b, i) => {
        const set = picked[i];
        b.classList.toggle('is-sel', i === sel);
        b.classList.toggle('is-seen', seen.has(i));
        b.querySelector('[data-st]').textContent = set.size ? `${set.size} from the library`
          : seen.has(i) ? 'Left to the Artist' : 'Not opened yet';
        const shown = [...set].slice(0, 3);
        b.querySelector('[data-picks]').innerHTML = set.size
          ? shown.map((n) => { const m = models(i).find((x) => x.n === n); return m && m.src ? `<img src="${m.src}" alt="">` : '<i></i>'; }).join('')
            + (set.size > 3 ? `<b>+${set.size - 3}</b>` : '')
          : '<span class="eslot__ai">✦ Artist</span>';
      });
      const total = picked.reduce((a, s2) => a + s2.size, 0);
      const left = picked.filter((s2) => !s2.size).length;
      foot();
    };
    // the right-hand footer: where you are, and the way to the next part
    const nextUnseen = () => {
      const next = slots.findIndex((_, i) => i > sel && !seen.has(i));
      return next >= 0 ? next : slots.findIndex((_, i) => !seen.has(i));
    };
    const foot = () => {
      const go = $('tsgo');
      if (ts.dataset.step !== '2' || con.classList.contains('is-approved') || con.classList.contains('is-loading')) return;
      const n = picked[sel].size;
      const c = ts.querySelector('[data-count]');
      if (c) c.textContent = `Part ${sel + 1} of ${slots.length} · ${n ? `${n} picked here` : 'the Artist makes this'}`;
      const after = nextUnseen();
      go.classList.toggle('is-done', after < 0);
      go.innerHTML = after < 0 ? 'Approve<i class="kb">A</i>'
        : `Next · ${p.parts[after][0].replace(/^The /, '')}<i class="kb">A</i>`;
    };
    con.__foot = foot;
    con.__enter = () => { seen.add(sel); paintRows(); };
    con.__next = () => {
      const after = nextUnseen();
      if (after < 0) return false;
      pick(after);
      return true;
    };
    const paintLib = () => {
      const [name] = p.parts[sel];
      const all = models(sel);
      const set = picked[sel];
      const shelf = all.filter((m) => m.kind !== 'deep').length;
      lib.innerHTML = `
        <header class="elib__h">
          <span class="elib__t"><b>${name}</b><em>${shelf} of ${all.length} models${set.size ? ` · ${set.size} picked` : ''}</em></span>
          <label class="elib__s"><i>⌕</i><input type="text" spellcheck="false" placeholder="Search ${name.replace(/^The /, '').toLowerCase()}…"><button type="button" class="elib__x" hidden>✕</button></label>
        </header>
        <div class="elib__grid">
          <button class="lcard lcard--ai${set.size ? '' : ' is-on'}" data-ai>
            <span class="lcard__art"><img src="assets/console/crew-artist.webp" alt=""></span>
            <span class="lcard__n">Artist makes it</span><em>✦ New</em>
          </button>
          ${all.map(card).join('')}
        </div>
        <div class="elib__none" hidden><b>Nothing here matches <span data-q></span></b>
          <button class="elib__ai">✦ Leave it to the Artist</button></div>`;
      const grid = lib.querySelector('.elib__grid');
      const box = lib.querySelector('input');
      const x = lib.querySelector('.elib__x');
      const mark = () => {
        grid.querySelectorAll('.lcard[data-n]').forEach((c) => c.classList.toggle('is-on', set.has(c.dataset.n)));
        grid.querySelector('[data-ai]').classList.toggle('is-on', !set.size);
        lib.querySelector('.elib__t em').textContent = `${shelf} of ${all.length} models${set.size ? ` · ${set.size} picked` : ''}`;
        paintRows();
      };
      grid.querySelectorAll('.lcard[data-n]').forEach((c) => {
        c.onclick = () => { if (set.has(c.dataset.n)) set.delete(c.dataset.n); else set.add(c.dataset.n); mark(); };
      });
      const toArtist = () => { set.clear(); mark(); };
      grid.querySelector('[data-ai]').onclick = toArtist;
      lib.querySelector('.elib__ai').onclick = () => { box.value = ''; search(); toArtist(); };
      const search = () => {
        const q = box.value.trim().toLowerCase();
        x.hidden = !q;
        let hits = 0;
        grid.querySelectorAll('.lcard[data-n]').forEach((c) => {
          const hit = q ? c.dataset.n.toLowerCase().includes(q) : !c.hasAttribute('data-deep');
          c.hidden = !hit; if (hit) hits++;
        });
        grid.querySelector('[data-ai]').hidden = !!q;
        lib.querySelector('.elib__none').hidden = !(q && !hits);
        grid.hidden = !!(q && !hits);
        lib.querySelector('[data-q]').textContent = `“${box.value.trim()}”`;
        lib.querySelector('.elib__t em').textContent = q ? `${hits} found in ${all.length} models` : `${shelf} of ${all.length} models${set.size ? ` · ${set.size} picked` : ''}`;
      };
      box.oninput = search;
      box.onkeydown = (e) => { e.stopPropagation(); if (e.key === 'Escape') { if (box.value) { box.value = ''; search(); } else box.blur(); } };
      x.onclick = () => { box.value = ''; search(); box.focus(); };
      mark();
    };
    const pick = (i) => { sel = (i + slots.length) % slots.length; if (ts.dataset.step === '2') seen.add(sel); paintLib(); paintRows(); };
    slots.forEach((b, i) => { b.onclick = () => pick(i); });
    con.__slot = (d) => pick(sel + d);
    pick(0);
  }

  const slug = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const mount = (el, p) => {
    host = el; plan = p;
    charmPick = CHARMS[Math.floor(Math.random() * CHARMS.length)];
    host.innerHTML = compE(p);
    host.hidden = false;
    wireE(p);
  };
  const replay = () => mount(host, plan);
  const unmount = () => { if (host) { host.innerHTML = ''; host.hidden = true; } };
  return { mount, replay, unmount };
})();
