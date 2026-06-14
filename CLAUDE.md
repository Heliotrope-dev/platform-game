Project: HTML5 Mario-Style Platform Game

Structure
- Single-file project: mario_game.html contains all HTML, CSS, JavaScript, and assets
- Do NOT split into multiple files — keep everything in one self-contained HTML file

Code Layout
- Physics constants are defined at the top of the <script> block in the // SETUP section
- Modify GRAVITY, JUMP_VEL, MAX_SPD, ACCEL, AIR_ACCEL, FRIC, AIR_FRIC, MAX_FALL there when tuning feel

Key Conventions
- All rendering uses HTML5 Canvas 2D API (ctx)
- Audio uses Web Audio API (AudioContext) — no external sound files
- Levels are procedurally generated per play via LCG seeded RNG
- Git remote: https://github.com/a13989358483-web/platform-game
- GitHub Pages: https://a13989358483-web.github.io/platform-game/mario_game.html

Player System
- 5 HP (green hearts) + 5 lives (red hearts) displayed in HUD top-left at 16px font
- CHAR_INDEX global (0=Mario, 1=Female Mario, 2=Dinosaur), cycle with Z key
- All characters share identical physics; only draw methods differ
- Power-up state: pl.powerup counts down from 600 (10s); resets to 0 on death/respawn
- Powered up: 1.5x speed, 1.2x jump, immune to damage, double score, 3x bullet damage on boss
- Last 3 seconds of power-up: character flashes red as warning
- Respawn uses findSafeSpawn() to scan platforms and avoid cliff edges

Power Bean
- Dropped by killed enemies: 20% chance in levels 1-3, 25% chance in boss level
- Only drops when player is NOT powered up (pl.powerup === 0)
- Collected in both STATE.PLAY and STATE.BOSS
- Visual: floating green glowing orb with bob animation

Enemy System
- Walker enemies: 3 HP, round red creature with two eyes and orange horns
- hit() reduces HP by 1 each call; hitFlash=14 frames visual only, not damage immunity
- Boss level minions: same Enemy class (walker type), 3 HP, walk on platforms and shoot
- Stomp kill: bounce player, 20% bean drop (normal state only)
- Bullet kill: 20% bean drop (normal state only)
- Powered-up walk-through kill: double score (200pts), no bean drop

Boss Fight (Level 4)
- 100 HP, phases: phase1 >80HP, phase2 >40HP, phase3 <=40HP
- Independent summon timer (not tied to attack state machine)
- Minions spawn from random side, cap 2 alive at once, walk toward center
- Player bullets vs boss and vs minions are checked OUTSIDE pl.invincible gate
  (only gated by !pl.dead) so bullets register immediately even during spawn immunity
- Minion kills: 150 pts, 25% bean drop when not powered up
- Boss stomp only works during 'slam' state; bullets always work

Terrain Generator
- Ground segments: only flat or rising steps (no downward dips visible on screen)
- 18% chance of highland segments (100-170px above ground, 240-420px wide)
- Highlands skip floating platform generation to keep visuals clean
- Coin placement: uniform 80px grid on ground, centered rows on platforms
- Coins blocked if a platform hangs directly overhead (overPlatform() check)

HUD
- Score (gold), green HP hearts, red lives hearts, level name (center), coins remaining
- Heart font 16px, spacing 22px to fit 5+5 without overlap
- livesX calculated dynamically: 116 + maxHp*22 + 8
- Game Over screen: results panel showing level reached, kills, coins, final score

Score Multipliers
- Normal enemy kill: 100pts
- Powered-up enemy kill: 200pts (double)
- Coin collect: 50pts normal, 100pts when powered up
- Minion kill (boss): 150pts
- Boss bullet hit: 50pts per damage point (3x when powered = 150pts per shot)
- Boss stomp: 500pts
- Level clear: 500pts
- Boss defeated: 2000pts bonus
