# Spot the Difference

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/jekglory/spot-the-difference-game-20261121/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/jekglory/spot-the-difference-game-20261121/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

Referral: https://make.fun/r/wkrc9se2

A complete, original spot the difference game that plays offline in a desktop
browser from its own static files. Two near-identical pictures side by side,
markers on the differences found, several still unfound, and a counter of how
many remain — across three hand-drawn scenes and 29 differences.

## Play

Serve `game/` with any static server and open `game/index.html`, or run
`node serve.ts` from the repository root and open http://localhost:8080.

- Click a difference on either picture to mark it (red circle + number).
- Wrong clicks cost 10 points and 5 seconds; hints cost 50 points (3 per level).
- Find all differences before the timer runs out to clear the level.
- Keys: Space/Enter start, H hint, P/Esc pause, R restart, M mute, 1/2/3 jump levels.

## Levels

1. **Sunny Garden** — 7 differences, 150 seconds.
2. **Harbor at Dusk** — 10 differences, 180 seconds.
3. **Lantern Night Market** — 12 differences, 210 seconds.

## Layout

- `main.ts` — the make.fun program: copies `game/` and `screenshots/` to the
  output directory and writes `dossier.json` (Node 22, stdlib only).
- `game/index.html` — the page; `game/src/main.js` is the entry point.
- `game/src/config.js` — field geometry, scoring, palette, level list.
- `game/src/random.js` — seeded PRNG for staged effects.
- `game/src/differences.js` — the 29 difference spots, one list per level.
- `game/src/scenes.js` — the three original scene painters.
- `game/src/world.js` — game state and rules.
- `game/src/render.js` — header, panels, markers, toasts, overlays.
- `game/src/input.js` — pointer and keyboard input.
- `game/src/sound.js` — WebAudio sound effects, synthesised, no files.
- `game/src/shots.js` — screenshot staging (`?shot=start|play|mid|end`).
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged.
- `screenshots/` — four real renders of the game's own code.

## Entry

Built for the [make.fun bounty](https://make.fun/c/best-spot-the-difference-game-20261121-0451)
"Make the best spot the difference game" by [@gentle-owl-26](https://make.fun/u/gentle-owl-26).
