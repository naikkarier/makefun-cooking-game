[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![make.fun rank](https://make.fun/badge/best-cooking-game-20261125-0137/naikkarier/makefun-cooking-game/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![make.fun reward](https://make.fun/badge/best-cooking-game-20261125-0137/naikkarier/makefun-cooking-game/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)

# Dapur Kilat — Warung Rush

A complete, original cooking game that plays offline in a desktop browser from
static files. Run a little Indonesian warung kitchen: orders land on the board,
you grab ingredients from the bins, chop and cook them, assemble the dish on a
plate, and serve it at the window before the customer walks away.

## How to play

- Move: WASD, arrow keys, or click anywhere on the floor.
- Use a station: walk up to it and press Space or E, or click the station.
- Pick up ingredients from the top bins (Nasi, Mie, Ayam, Telur, Sayur, Kecap).
- Chop on the Talenan, cook in the Wajan. A station holds one item while it works.
- Add ready ingredients to a Piring. When a plate matches a recipe exactly it
  glows: pick it up and serve it at the Jendela Saji.
- Recipes: Nasi Goreng (nasi + telur + kecap), Mie Goreng (mie + ayam + sayur),
  Sate Ayam (ayam + kecap), Tumis Sayur (sayur + telur).
- Each order has a patience timer. Serve fast for a tip, chain serves for a
  combo. Three walk-away customers end the shift early; otherwise the shift
  lasts 150 seconds. P pauses, M mutes.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network request, no library: `game/index.html` and its ES
modules under `game/src/` are the whole game. Sounds are synthesized with
WebAudio.

## Screenshots

`shots.json` lists the four staged scenes (`?shot=start|play|serve|end`
with `&seed=7`); each plays the real rules forward with the autopilot in
`game/src/shots.js`, so the frames are honest renders of the game's own code.

## Hand-in

`main.ts` (Node 22, standard library only) copies `game/` and `screenshots/`
to `/output` and writes `/output/dossier.json` with the vendored make.fun
library:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Entry for the make.fun bounty
[Make the best cooking game](https://make.fun/bounty/best-cooking-game-20261125-0137).
