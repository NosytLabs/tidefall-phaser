# Tidefall — Consolidated Game Specification

## Overview

Cozy pixel-art fishing game built with Phaser 3 (v3.85) + Vite 6.3. Internal resolution 480×270, 16:9, FIT mode with autoCenter. 504 Smallburg pixel-art sprites. All UI panels use sprite-based borders (9-slice from `fishing_ui_1_all_sprites.png`).

## Design Pillars

1. **Cozy pixel art** — chunky pixels, warm palette, handcrafted feel
2. **Living world** — animated water, swaying trees, drifting clouds, bobbing boats
3. **Clear visual hierarchy** — player always readable, environment supports not distracts
4. **Asset maximalism** — every Smallburg sprite gets used somewhere

## Asset Inventory (504 sprites)

- **animals/** 79 — cows, chickens, pigs, chicks, piglets (idle/walk, shadows)
- **animations/** 33 — bobbers, ripples, fish shadows, catch animations
- **boats/** 17 — blue, yellow, small boats (layered sprites)
- **buildings/** 16 — barn, greenhouse, fish_market, grain_silo, chicken_coop, watchtower, lighthouse, pier, farmhouse
- **character/** 232 — body/hair/shirt/pants for walk/idle/throw/catch/reel/pull (3 skin tones, 10 hair colors, 11 shirt, 10 pants, 8 styles)
- **fish/** 113 — 44 species static sprites
- **terrain/** 2 — grass, sand tilesets (world base)
- **tileset/** 2 — decorative tilesets
- **trees/** 7 — palm, pine, apple, peach, oak, birch, willow
- **ui/** 3 — fishing_ui_1, status_bars, icons

## World Layout

```
0-40    Sky + parallax clouds
40-100  Forest back (pine trees, dark)
100-140 Grass (tileset-based, not solid color)
140-155 Sand beach (tileset-based, wet/dry zones)
155-200 Ocean (animated waves, depth variation)
200-270 Deep water (darker, fish shadows)
```

## Depth Layers

| Layer | Value | Contents |
|-------|-------|----------|
| SKY | 0 | Sky, parallax |
| CLOUDS | 1 | Drifting clouds |
| TREES_BACK | 2 | Distant trees |
| GROUND | 5 | Tile ground (grass, sand, water) |
| DECORATION | 6 | Grass tufts, fences, flowers |
| BUILDINGS | 8 | Barn, coop, greenhouse, etc. |
| NPC | 9 | Animals, NPCs |
| PLAYER | 10 | Player character |
| TREES_FORE | 11 | Foreground trees |
| BOATS | 12 | Bobbing boats |
| PARTICLES | 15 | Splash, emitters |
| WATER_SURFACE | 20 | Wave shimmer, ripples |
| UI | 90 | Top-level UI |
| UI_PANEL | 100 | Panel containers |
| UI_OVERLAY | 110 | Day/night overlay, modal backdrops |

## Input Map

| Action | Keys |
|--------|------|
| Move Up | W / UP |
| Move Down | S / DOWN |
| Move Left | A / LEFT |
| Move Right | D / RIGHT |
| Fish / Cast / Hook | SPACE |
| Interact | E |
| Inventory | I |
| Map | TAB |
| Stats | C |
| Achievements | L |
| Settings | O |
| Pause | P / ESC |
| Debug | BACKTICK |

## Fishing Minigame Flow

1. Player must be at or below water line (y ≥ 150)
2. Press SPACE to cast
   - Cast distance: 20–45 px from player
3. Bobber appears at cast point with floating animation
4. Wait random 2–6 seconds (`WAIT_MIN_TIME`–`WAIT_MAX_TIME`)
5. Bite indicator (!) + bobber bite animation
6. Press SPACE within 6-second (`BITE_TIMEOUT`) window to hook
7. Minigame starts (6-second duration)
   - Progress bar decays at 0.002 per tick
   - Green zone = success (≥ 0.3)
   - Red zone = fail (≤ 0.08)
   - Hold SPACE to fight
8. **Success** → catch panel with fish sprite + stats, inventory add, achievement record
9. **Fail** → fish escapes with splash notification

## Player Customization

| Category | Options |
|----------|---------|
| Skin Tones | light, brown, dark |
| Hair Colors | black, blonde, blue, brown_dark, brown_light, green, pink, purple, red, white |
| Shirt Colors | black, blue_dark, blue_light, brown, green_dark, green_light, orange, pink, red, white, yellow |
| Pants Colors | black, blue_dark, blue_light, brown, green_light, orange, pink, red, white, yellow |
| Hair Styles | short_hair, long_hair, pony_tail, spikey, big_bun, small_hair |

## Day / Night Cycle

- 4 phases: dawn → day → dusk → night
- Each phase: 45 seconds (`PHASE_DURATION`)
- Overlay color transitions via `MULTIPLY` blend mode

## Weather System

| Weather | Common | Rare | Legendary |
|---------|--------|------|-----------|
| sunny | 1.0x | 0.8x | 0.4x |
| cloudy | 1.0x | 1.0x | 0.6x |
| rainy | 0.9x | 1.2x | 0.8x |
| stormy | 0.7x | 1.0x | 1.2x |

## Bait & Rods

| Bait | Bonus | Cost |
|------|-------|------|
| Worm | +10% | $5 |
| Grub | +15% | $10 |
| Minnow | +20% | $25 |
| Shrimp | +25% | $50 |
| Golden | +35% | $100 |

| Rod | Power | Accuracy |
|-----|-------|----------|
| Basic | 1.0x | 1.0x |
| Fiberglass | 1.2x | 1.1x |
| Carbon | 1.4x | 1.2x |

## Energy System

- Max: 100
- Walk cost: 0.02 per tick
- Fish cost: 5 per cast
- Catch cost: 8 per successful catch
- Regen: 0.03 per tick

## NPCs

| ID | Name | Role | Position |
|----|------|------|----------|
| joe | Fisherman Joe | fisherman | 60, 140 |
| eliza | Mayor Eliza | mayor | 200, 120 |
| bella | Merchant Bella | merchant | 340, 120 |
| tom | Farmer Tom | farmer | 130, 110 |
| zara | Angler Zara | angler | 280, 140 |

## Fish Rarity Colors

| Rarity | Color |
|--------|-------|
| common | #aaaaaa |
| uncommon | #44bb44 |
| rare | #4488ff |
| epic | #aa44ff |
| legendary | #ffaa00 |

## Scenes

| Scene | Key | Purpose |
|-------|-----|---------|
| BootScene | BootScene | Asset preload, sprite atlas setup |
| FishingScene | FishingScene | Main game world + fishing loop |
| UIScene | UIScene | HUD, panels, inventory overlay |
| DiveScene | DiveScene | (planned) Underwater diving |
| FarmScene | FarmScene | (planned) Farming mechanics |
| MineScene | MineScene | (planned) Mining mechanics |
| MapScene | MapScene | (planned) World map |

## Systems (instantiated in FishingScene)

| System | File | Status |
|--------|------|--------|
| Inventory | systems/Inventory.js | Instantiated |
| FishManager | systems/FishManager.js | Instantiated, spawns shadows |
| FishingSystem | systems/FishingSystem.js | Instantiated |
| WeatherSystem | systems/WeatherSystem.js | Instantiated, started |
| AudioManager | systems/AudioManager.js | Instantiated, initialized |
| AchievementSystem | systems/AchievementSystem.js | Instantiated |
| NotificationSystem | systems/NotificationSystem.js | Instantiated |

## Performance Targets

- 60 FPS sustained
- < 200 draw calls
- < 100 MB memory

## Acceptance Criteria

### Visual
- [x] Game renders at 480×270 internal, crisp pixel art
- [x] No solid-color rectangles for ground/water (use sprites/tilesets)
- [x] All UI panels have sprite-based borders
- [x] Player sprite is clearly readable (~80px on screen)
- [x] Day/night cycle changes sky/water colors visibly
- [x] At least 5 unique tree types visible
- [x] At least 3 boat types on water
- [x] Animals (chickens/cows/pigs) in farm zone
- [x] Fish shadows swim in water with animation

### Functional
- [x] WASD movement, E interact, I inventory, Space fish
- [x] Fishing minigame works end-to-end
- [x] Inventory shows fish with rarity-colored names
- [x] NPCs spawn and can be talked to
- [x] Day/night cycle progresses automatically
- [x] Weather changes periodically
- [x] Audio manager plays ambient sounds
- [x] Settings panel toggles work

### Performance
- [ ] 60 FPS sustained
- [ ] < 200 draw calls
- [ ] < 100MB memory
