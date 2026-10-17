# Mossbound / 苔光远行

## Structure

Keep the runtime self-contained in `mario_game.html`. `index.html` is only the Pages entry redirect. The game uses Canvas 2D and synthesized Web Audio with no external runtime assets or dependencies.

Git remote: https://github.com/Heliotrope-dev/platform-game

## Gameplay

Three procedural worlds followed by a 100 HP, three-phase boss. Preserve baseline movement/collision parameters and level geometry unless requested. Three original traveler skins share the same physics. Jump input has a seven-tick buffer and six-tick edge grace. Physics runs at a fixed 60 Hz.

At each normal level completion, STATE.UPGRADE freezes the world until the user chooses one ability. Ranks persist across levels and reset on startRun. Each ability caps at two ranks: extra air jumps, rapid fire, coin attraction, and per-level collision shields. Shields do not prevent pit deaths. Optional level goals award 300 points exactly once.

## UI and audio

Menus, help, pause, ability choice and results are accessible HTML overlays. In-game HUD and artwork are Canvas. Keep pointercancel and lostpointercapture handling so touch controls do not stick. H returns to the previous state and preserves an existing pause. Blur/hidden tabs freeze gameplay and silence music; return requires manual resume during an active run.

Audio scores use `bass` for note arrays and `bassWave` for oscillator waveform strings. Never pass the note array to oscillator.type. Audio and browser-storage failures must not stop gameplay.

## Validation and deployment

Run `node --test tests/game.test.mjs`. Check desktop and mobile layouts in the browser as well; mocks do not validate actual Canvas appearance or browser audio behavior. GitHub Pages publishes main at https://heliotrope-dev.github.io/platform-game/ .
