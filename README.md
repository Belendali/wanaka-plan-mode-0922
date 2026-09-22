# Wanaka · Plan mode

The front end for plan mode, from the idea box on the home page to the plan
arriving on a handheld and the build starting.

    npm start        # or: python3 serve.py   →  http://localhost:8467

## The run

1. **Home** — you type an idea. **Plan mode** sits in the idea box, on by default.
2. **Studio** — the message lands in the chat, Wana thinks, and the team works
   through four steps in a Deep Thinking card.
3. **The plan** — it arrives as a card in the chat and opens by itself: a handheld
   console over the Studio, with the plan on one screen and the assets on the other.
4. **Approve** — the console shuts, spins, and a paw takes it away. The chat says
   the team is building v1.

## Layout

    index.html          the shell: sidebar, home screen, studio screen
    css/tokens.css      the values the screens are built from
    css/app.css         shell + sidebar
    css/home.css        hero, idea box, plan button, trending
    css/studio.css      build canvas + the chat panel
    css/console.css     the plan console
    js/data.js          trending games, the plan, the steps  ← swap for an API
    js/home.js          the idea box
    js/studio.js        the chat, and the scripted run        ← swap `script()` for a stream
    js/console.js       the console (mount / replay / unmount)
    js/app.js           home → studio → console → build

## Where the real thing plugs in

* `js/data.js` holds every piece of content. A real endpoint returns the same shapes.
* `js/studio.js` → `script()` fakes the team working. Replace it with the stream;
  the messages and the task list are already components.
* The console tells the app it is done with a `e-approved` event on `document`.

## Built from

Figma · Wanaka Studio — `home page` (48075:33470) and the Studio chat panel
(46840:74905). Icons and images are exported from those frames into `assets/`.
