# 🎣 Tidefall - Phaser 3 Fishing Game

A cozy 2D top-down fishing mini-game built with Phaser 3 and the Smallburg Complete Pack assets.

## Features

- **8-direction player movement** with WASD or arrow keys
- **Complete fishing system**: cast → wait → bite → minigame → catch
- **44 different fish types** with rarity, biomes, and weights
- **Fish shadows** that swim around and react to your bobber
- **Timing-based minigame** - press SPACE when the pointer is in the green zone
- **Inventory system** to track your catches
- **Day/night cycle** affecting fish spawn rates
- **Pixel-perfect** 16x16 art style

## Controls

| Key | Action |
|-----|--------|
| WASD / Arrows | Move |
| SPACE | Cast line / Reel fish |
| I | Toggle inventory |

## Installation

```bash
cd tidefall-phaser
npm install
npm run dev
```

Then open http://localhost:3000 in your browser.

## Project Structure

```
tidefall-phaser/
├── src/
│   ├── core/                   # Centralized systems (EventBus, GameState, Constants)
│   ├── scenes/                 # Game scenes
│   ├── entities/               # Player, NPCs
│   ├── systems/                # StateMachine, ObjectPool, FishingSystem
│   └── main.js                 # Entry point with PWA registration
├── public/
│   ├── assets/                 # Sprites, animations, data
│   ├── manifest.json           # PWA manifest
│   └── sw.js                   # Service worker
└── package.json
```

## Architecture

This game follows the Phaser 3 skills architecture:

- **EventBus**: Cross-scene communication via domain:action events
- **GameState**: Centralized state with restart-safe reset()
- **Constants**: Zero magic numbers - all config in one file
- **State Machine**: Player behavior states (Idle/Walk/Fishing)
- **Object Pooling**: Recycled fish shadows and particles
- **PWA**: Offline play with service worker

## Fish Database

The game includes 44 fish types across 3 biomes:

- **River**: Catfish, Salmon, Piranha, Eels...
- **Lake**: Bass, Trout, Pike, Perch...
- **Sea**: Sharks, Tuna, Tropical fish, Rays...

Each fish has:
- Rarity (common, uncommon, rare, legendary)
- Size (small, medium, big)
- Weight range
- Difficulty rating
- Gold value

## Asset Credits

Uses the **Smallburg Complete Pack** by almostApixel:
- Smallburg Fishing Pack v1.13
- Smallburg Farm Pack v3.18
- Smallburg Town Pack v4.0
- Smallburg Diving Pack v1.07
- Smallburg Dungeon Pack v2.13
- Smallburg Mine Pack v1.16
- Smallburg UI Pack v1.15

Available at: https://itch.io/s/72909/smallburg-complete-pack

## License

MIT - Feel free to use and modify!
