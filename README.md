# Platform Adventure

浏览器平台游戏，单文件，零依赖，2550 行纯 JavaScript。

[**→ 直接游玩**](https://heliotrope-dev.github.io/platform-game/mario_game.html)

## 特性

- 3 个主题关卡（草原 / 洞穴 / 火山）+ 最终 Boss 战
- 自研芯片音乐引擎，每个关卡独立 BGM（Web Audio API，无音频文件）
- 程序化关卡生成，每次地形随机
- 多角色选择
- Boss 三阶段 AI，支持冲刺、召唤、远程攻击

## 技术实现

**音乐引擎**：不依赖任何音频文件，用 Web Audio API 实时合成方波 / 三角波 / 锯齿波，支持主旋律 + 和声双轨并行播放。

```javascript
const SEQ = {
  1: { bpm:148, wave:'square', notes: [...] },   // 草原主题
  2: { bpm:112, wave:'triangle', notes: [...] },  // 洞穴主题
  3: { bpm:172, wave:'sawtooth', notes: [...] },  // 火山主题
}
```

**程序化生成**：按关卡难度配置平台密度、敌人数量、金币分布，每次生成保证可通关（spawn 区固定安全区）。

**物理系统**：分地面 / 空中两套摩擦系数，实现 Mario 式滑行手感。

```javascript
const ACCEL    = 0.58;  // 地面加速
const AIR_ACCEL = 0.30; // 空中控制
const FRIC     = 0.79;  // 地面摩擦
const AIR_FRIC = 0.95;  // 空中惯性
```

**Boss 战**：三阶段状态机，HP 阈值触发行为切换，支持弹幕、近战冲刺、平台召唤。

## 运行

直接用浏览器打开 `mario_game.html`，无需安装任何依赖。
