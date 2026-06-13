# Project: HTML5 Mario-Style Platform Game

## Structure
- Single-file project: `mario_game.html` contains all HTML, CSS, JavaScript, and assets
- Do NOT split into multiple files — keep everything in one self-contained HTML file

## Code Layout
- Physics constants are defined at the top of the `<script>` block in the `// SETUP` section
- Modify `GRAVITY`, `JUMP_VEL`, `MAX_SPD`, `ACCEL`, `AIR_ACCEL`, `FRIC`, `AIR_FRIC`, `MAX_FALL` there when tuning feel

## Key Conventions
- All rendering uses HTML5 Canvas 2D API (`ctx`)
- Audio uses Web Audio API (`AudioContext`) — no external sound files
- Levels are procedurally generated per play via LCG seeded RNG
- Git remote: `https://github.com/a13989358483-web/platform-game`
- GitHub Pages: `https://a13989358483-web.github.io/platform-game/mario_game.html`
