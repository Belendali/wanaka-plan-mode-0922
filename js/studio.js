/* The Studio screen: the build canvas, and the chat where plan mode runs.
   The run is scripted — swap `script()` for a real stream and nothing else moves. */
const Studio = (() => {
  let thread, timers = [];
  const at = (ms, fn) => timers.push(setTimeout(fn, ms));
  const clear = () => { timers.forEach(clearTimeout); timers = []; };
  const el = (html) => {
    const d = document.createElement('div');
    d.innerHTML = html.trim();
    return d.firstElementChild;
  };
  const push = (node) => { thread.appendChild(node); thread.scrollTop = thread.scrollHeight; return node; };

  const shell = () => `
    <section class="stage">
      <span class="stage__sky"></span><span class="stage__grid"></span>
      <div class="stage__bar">
        <div class="proj"><span class="proj__badge">W</span><span class="proj__name">Toy house explorer</span></div>
        <div class="stage__tools">
          <button class="tool">Multiplayer</button>
          <button class="tool">Resume</button>
        </div>
      </div>
      <div class="stage__empty"><b>Nothing built yet</b><span>The plan comes first — approve it and the team starts.</span></div>
    </section>
    <aside class="chat">
      <div class="chat__modes">
        <div class="modes">
          <button class="modes__b is-on"><img src="assets/icon/build.svg" alt="" width="16" height="16">Build</button>
          <button class="modes__b"><img src="assets/icon/preview.svg" alt="" width="16" height="16">Preview</button>
        </div>
        <button class="publish"><img src="assets/icon/publish.svg" alt="" width="16" height="16">publish</button>
      </div>
      <div class="chat__head">
        <button class="chat__name"><span>Toy house explorer</span><img src="assets/icon/chat-name-arrow.svg" alt="" width="16" height="16"></button>
        <span class="chat__rule"></span>
        <span class="chat__coins"><img src="assets/img/coin.png" alt="">320</span>
        <button class="upgrade"><img src="assets/icon/crown.svg" alt="" width="16" height="16">Upgrade</button>
      </div>
      <div class="thread" id="thread"></div>
      <form class="chatbox">
        <div class="chatbox__who"><img src="assets/img/wana.png" alt="">Wanaka 1.0 Lite</div>
        <textarea placeholder="Ask, plan, build anything..." spellcheck="false"></textarea>
        <div class="chatbox__row">
          <span style="display:flex;gap:12px">
            <button class="iconbtn" type="button" aria-label="Attach"><img src="assets/icon/composer-plus.svg" alt="" width="16" height="16"></button>
          </span>
          <button class="chatbox__send" type="button" aria-label="Send">↑</button>
        </div>
      </form>
    </aside>`;

  /* what the team does after you press Plan mode */
  const script = (idea, onPlanReady) => {
    push(el(`<div class="msg msg--you">${idea}
      <span class="msg__tools"><img src="assets/icon/msg-copy.svg" alt="" width="20" height="20"><img src="assets/icon/msg-edit.svg" alt="" width="20" height="20"></span></div>`));

    at(500, () => {
      const think = push(el(`<p class="msg thinking">Thinking<i></i></p>`));
      let n = 0;
      const dots = setInterval(() => { think.querySelector('i').textContent = '.'.repeat(n++ % 4); }, 320);
      at(1500, () => { clearInterval(dots); think.remove(); });
    });

    at(1500, () => {
      const card = push(el(`
        <div class="msg deep">
          <button class="deep__head" type="button">Deep Thinking…<img src="assets/icon/chevron-up.svg" alt="" width="16" height="16"></button>
          <div class="deep__body">
            <p style="margin:0 0 12px">A toy house with a secret — love it. I've called in the team; we'll draft the whole plan for you to check before anything gets built.</p>
            <ul class="tasks"></ul>
          </div>
        </div>`));
      card.querySelector('.deep__head').onclick = () => card.classList.toggle('is-shut');
      const list = card.querySelector('.tasks');
      PLAN_STEPS.forEach((s, i) => {
        at(i * 900, () => {
          const row = list.appendChild(el(`<li class="task is-live"><img src="assets/icon/task-active.svg" alt="" width="12" height="12">${s}</li>`));
          thread.scrollTop = thread.scrollHeight;
          at(700, () => {
            row.classList.remove('is-live');
            row.classList.add('is-done');
            row.querySelector('img').src = 'assets/icon/task-done.svg';
          });
        });
      });
    });

    const after = 1500 + PLAN_STEPS.length * 900 + 700;
    at(after, () => push(el(`
      <div class="msg wana"><img src="assets/img/wana-planner.webp" alt="">
        <div><b>Planner Wana</b><p>Here it is — it opens on the left. Every card is yours to change, and nothing gets built until you approve it.</p></div>
      </div>`)));
    at(after + 600, () => {
      const card = push(el(`
        <div class="msg plancard"><img src="${PLAN.cover}" alt="">
          <div><em>Plan v1.0</em><b>${PLAN.title}</b><button type="button">View full plan</button></div>
        </div>`));
      card.querySelector('button').onclick = () => onPlanReady();
      at(700, () => card.classList.add('is-hot'));
      at(1400, () => onPlanReady());
    });
  };

  /* the crew bar: one cat works at a time, the line says what it is doing */
  const CREW = ['planner', 'developer', 'artist', 'audio', 'tester'];
  const CREW_LINE = {
    planner: 'Planner: plan approved — keeping the crew on track',
    developer: 'Developer: Writing your game logic...',
    artist: 'Artist: Modelling the bedroom and the toys...',
    audio: 'Musician: Scoring a theme loop for the bedroom...',
    tester: 'Tester: Playing it through before you do...',
  };
  const crewbar = (active) => {
    const stage = document.querySelector('.stage');
    let bar = document.querySelector('.crew');
    if (!bar) {
      bar = el(`<div class="crew">
        <button class="crew__min" type="button" aria-label="Minimise"></button>
        <div class="crew__row">${CREW.map((k) => `
          <button class="crew__cat" type="button" data-k="${k}"><img alt="${k}"></button>`).join('')}</div>
        <p class="crew__line"></p>
      </div>`);
      stage.appendChild(bar);
      bar.querySelector('.crew__min').onclick = () => bar.remove();
      bar.querySelectorAll('.crew__cat').forEach((c) => {
        c.onmouseenter = () => { bar.querySelector('.crew__line').textContent = CREW_LINE[c.dataset.k]; };
        c.onmouseleave = () => { bar.querySelector('.crew__line').textContent = CREW_LINE[bar.dataset.active]; };
      });
    }
    bar.dataset.active = active;
    bar.querySelectorAll('.crew__cat').forEach((c) => {
      const on = c.dataset.k === active;
      c.classList.toggle('is-on', on);
      c.querySelector('img').src = `assets/img/crew-${c.dataset.k}${on ? '.webp' : '-still.png'}`;
    });
    bar.querySelector('.crew__line').textContent = CREW_LINE[active];
    return bar;
  };

  const built = () => {
    clear();
    push(el(`<div class="msg msg--you">Approve and build now</div>`));
    at(400, () => push(el(`
      <div class="msg wana"><img src="assets/img/wana-planner.webp" alt="">
        <div><b>Planner Wana</b><p>Cool, my crew is working for you...</p></div>
      </div>`)));

    const STEPS = [['developer', 'Game logic'], ['artist', 'Models and scene'],
                   ['audio', 'Theme music'], ['tester', 'Playtest']];
    let rows = [];
    at(800, () => {
      const list = push(el(`<div class="msg steps">${STEPS
        .map(([, t], i) => `<p class="step${i === 0 ? ' is-busy' : ''}"><i></i>${t}</p>`).join('')}</div>`));
      rows = [...list.querySelectorAll('.step')];
      document.querySelector('.stage__empty').innerHTML = '<b>Building v1</b><span>The crew is at work — the room goes in piece by piece.</span>';
      crewbar('developer');
    });

    // each cat takes its turn; the one working is the only one in colour
    STEPS.forEach(([who], i) => {
      at(900 + i * 5000, () => {
        crewbar(who);
        rows.forEach((r, k) => r.classList.toggle('is-busy', k === i));
      });
      at(900 + (i + 1) * 5000 - 200, () => {
        rows[i]?.classList.remove('is-busy');
        rows[i]?.classList.add('is-done');
      });
    });

    // version 1.0 is up
    at(900 + STEPS.length * 5000, () => {
      document.querySelector('.crew')?.remove();
      document.querySelector('.stage__empty').innerHTML = '<b>Version 1.0</b><span>Five stars to find, one hoop to reach.</span>';
      push(el(`
        <div class="msg wana"><img src="assets/img/crew-tester.webp" alt="">
          <div><b>Tester Wana</b><p>Version 1.0 is up and it holds together — five stars to find, one hoop to reach. Give it a go.</p></div>
        </div>`));
      push(el(`
        <div class="msg plancard"><img src="${PLAN.cover}" alt="">
          <div><em>Version 1.0</em><b>${PLAN.title}: ${PLAN.sub}</b><button type="button">▶ Play</button></div>
        </div>`));
    });
  };

  const open = (idea, onPlanReady) => {
    clear();
    const screen = document.getElementById('screenStudio');
    screen.innerHTML = shell();
    thread = document.getElementById('thread');
    script(idea, onPlanReady);
  };

  return { open, built, clear };
})();
