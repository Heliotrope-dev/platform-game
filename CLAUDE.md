# Mossbound / 苔光远行

## Structure

Keep the runtime self-contained in `mario_game.html`. `index.html` is only the Pages entry redirect. The game uses Canvas 2D and synthesized Web Audio with no external runtime assets or dependencies.

Git remote: https://github.com/Heliotrope-dev/platform-game

## Gameplay

Three procedural worlds followed by a 100 HP, three-phase boss (phase boundaries 70 and 35 HP). Preserve baseline movement/collision parameters and level geometry unless requested. Three original traveler skins share the same physics. Jump input has a seven-tick buffer and six-tick edge grace. Physics runs at a fixed 60 Hz.

At each normal level completion, STATE.UPGRADE freezes the world until the user chooses one ability. Ranks persist across levels and reset on startRun. Each ability caps at two ranks: extra air jumps, rapid fire, coin attraction, and per-level collision shields. Shields do not prevent pit deaths. Optional level goals award 300 points exactly once.

## Boss encounter

Attack patterns cycle between telegraphed fan shots, marked ground slams, lane dashes and later-phase marked columns. Core exposure in slam/recover doubles incoming damage and enables stomps. Warning-only body states are harmless. Column damage must wait for warn <= 0; preserve safe horizontal lanes. Boss and minion contact damage uses Player.hurt rather than instant death. Respawn clears projectiles/hazards without resetting boss HP. Defeat removes dangerous leftovers. Projectile lifetimes and minion counts must remain bounded.

Projectile rendering is shared through drawBolt. Player/regular-enemy projectile speeds, damage and hit detection are independent of their cosmetic trails.

## UI and audio

Menus, help, pause, ability choice and results are accessible HTML overlays. In-game HUD and artwork are Canvas. Keep pointercancel and lostpointercapture handling so touch controls do not stick. H returns to the previous state and preserves an existing pause. Blur/hidden tabs freeze gameplay and silence music; return requires manual resume during an active run.

Audio scores use `bass` for note arrays and `bassWave` for oscillator waveform strings. Never pass the note array to oscillator.type. Audio and browser-storage failures must not stop gameplay.

## Validation and deployment

Run `node --test tests/game.test.mjs`. Check desktop and mobile layouts in the browser as well; mocks do not validate actual Canvas appearance or browser audio behavior. GitHub Pages publishes main at https://heliotrope-dev.github.io/platform-game/ .
