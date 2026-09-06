# Tidefall

> A Phaser 4 browser fishing game — 44 fish types, biomes, and a real-time day/night cycle.

[![Play Online](https://img.shields.io/badge/Play-Online-6366f1?style=flat-square)](https://nosytlabs.github.io/tidefall-phaser)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Phaser 4](https://img.shields.io/badge/Phaser-4-orange?style=flat-square)](https://phaser.io/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

A skill-based fishing game built with [Phaser 4](https://phaser.io/). Cast your line, read the environment, and reel in rare catches across three distinct biomes.

## Features

- **44 fish types** with individual rarity tiers and spawn conditions
- **3 biomes** — River, Lake, and Sea, each with unique fish populations
- **Day/night cycle** — time of day affects which fish spawn
- **Timing-based minigame** — cast and reel with precision for better catches
- **Inventory system** — track and review your haul mid-session

## Controls

| Key | Action |
|---|---|
| `WASD` / Arrow Keys | Move character |
| `SPACE` | Cast / Reel |
| `E` | Talk to nearby NPC |
| `I` | Open inventory |
| `V` | Enter Dive scene (exit with `Q`) |
| `N` | Enter Mine scene (exit with `M`) |
| `G` | Enter Farm scene (exit with `F` / `ESC`) |

> Location hotkeys use `V`/`N`/`G` so they do not fight WASD movement or the Mine/Farm exit keys (`M`/`F`).

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build

```bash
npm run build
```

Output goes to `/dist`.

## Tech Stack

- [Phaser 4](https://phaser.io/) — game framework
- JavaScript (ES6+)
- Vite (dev server + bundler)

## Contributing

Issues and PRs welcome. Check open issues for ideas.

---

Built by [NosytLabs](https://nosytlabs.com) · NOSYT LLC

