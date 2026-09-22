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

  const built = () => {
    push(el(`
      <div class="msg wana"><img src="assets/img/wana-planner.webp" alt="">
        <div><b>Planner Wana</b><p>Approved. The team is on it — building v1 now. I'll ping you the moment it's playable.</p>
          <span class="buildbar"><i></i></span>
          <p class="buildnote" style="margin-top:8px">Building · 4 rooms · 6 assets</p>
        </div>
      </div>`));
    document.querySelector('.stage__empty').innerHTML = '<b>Building v1</b><span>Rooms and assets are going in — you can watch here.</span>';
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
