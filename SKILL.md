---
name: tidefall-phaser
version: 2.0.0
description: Refactored Tidefall game using Phaser 3 skills architecture
skills: [
  neversight-learn-skills.dev-phaser,
  davila7-claude-code-templates-web-games,
  neversight-learn-skills.dev-phaser-design-patterns,
  neversight-learn-skills.dev-phaser-gamedev,
  sickn33-antigravity-awesome-skills-web-games
]
---

# Tidefall Phaser - Skills Architecture

## Applied Phaser Skills

### 1. neversight-learn-skills.dev-phaser
**Applied patterns:**
- ✅ Core/ directory with EventBus, GameState, Constants
- ✅ Composition over inheritance (Player uses container + state machine)
- ✅ Event-driven communication (domain:action naming)
- ✅ Restart-safe GameState with reset()
- ✅ Zero magic numbers in Constants.js
- ✅ Tab visibility handling for pause/resume

### 2. davila7-claude-code-templates-web-games
**Applied patterns:**
- ✅ Framework selection (Phaser 3 for 2D)
- ✅ Optimization priority (object pooling)
- ✅ Progressive loading strategy
- ✅ Tab throttling handling

### 3. neversight-learn-skills.dev-phaser-design-patterns
**Applied patterns:**
- ✅ State Machine pattern for Player (IdleState, WalkState, FishingState)
- ✅ Object Pool pattern for fish shadows and particles
- ✅ Observer pattern via EventBus
- ✅ Composition over deep inheritance

### 4. neversight-learn-skills.dev-phaser-gamedev
**Applied patterns:**
- ✅ Proper scene lifecycle (init → preload → create → update)
- ✅ Arcade physics with proper colliders
- ✅ Animation management in BootScene
- ✅ Frame-rate independent movement using delta

### 5. sickn33-antigravity-awesome-skills-web-games
**Applied patterns:**
- ✅ PWA manifest.json for installability
- ✅ Service worker for offline play
- ✅ Responsive canvas scaling
- ✅ Asset compression strategy

## Architecture Overview

```
src/
├── core/                    # Centralized systems (from phaser skill)
│   ├── EventBus.js         # Singleton event emitter
│   ├── GameState.js        # Centralized state with reset()
│   └── Constants.js        # All config values, zero magic numbers
├── scenes/
│   ├── BootScene.js        # Asset loading with progress bar
│   ├── FishingScene.js     # Main gameplay
│   └── UIScene.js          # UI overlay (parallel scene)
├── entities/
│   ├── Player.js           # State machine player controller
│   └── NPC.js              # Non-player characters
├── systems/
│   ├── StateMachine.js     # State pattern implementation
│   ├── ObjectPool.js       # Pooling for performance
│   ├── FishingSystem.js    # Fishing mechanics
│   ├── FishManager.js      # Fish shadow AI
│   └── Inventory.js        # Inventory management
└── main.js                 # Entry point with PWA registration
```

## Key Features

### State Machine Player
- IdleState: Stops velocity, plays idle animation
- WalkState: Handles movement input, consumes energy
- FishingState: Manages fishing animations, hides clothing layers

### EventBus Communication
- `game:start` - Game initialization
- `player:move` - Player position updates
- `fishing:cast/bite/catch/escape` - Fishing lifecycle
- `ui:showMessage/showCatch/toggleInventory` - UI events

### Object Pooling
- FishShadowPool: 8 max recycled shadows
- ParticlePool: 20 max for splash effects
- Reduces GC pressure during gameplay

### PWA Support
- Service worker caches assets for offline play
- Manifest for home screen installation
- Tab visibility API for auto-pause

## Build

```bash
npm install
npm run build    # Creates dist/ with optimized bundle
npm run dev      # Development server
```

## Credits

Uses 5 LobeHub Phaser skills for professional game architecture.
