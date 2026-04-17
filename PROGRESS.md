# Tidefall - Game Updates

## v35 - April 16, 2026 - Game Systems Enhancement

### Added This Session

#### Player State Machine (ECS Pattern)
- **DiveState** - Underwater exploration state
- **FarmState** - Farming activity state  
- Helper methods: `startDiving()`, `stopDiving()`, `startFarming()`, `stopFarming()`

#### BootScene Asset Loading
- Tree sprites: apple_tree, peach_tree (in addition to palm, pine)
- Tool animations: hoe, shovel, watering_can, axe, pickaxe (with swing animation)
- Crop growth sprites: potato, carrot, tomato, corn, strawberry

#### FarmScene Enhancement
- Crop selection UI buttons (click to select crop type)
- Click-to-plant interaction on farm plots
- Visual crop sprites with growth stages
- Watered crops grow 2x faster
- Harvest messages when collecting crops
- Proper sprite-based animals (chicken, cow, pig with walk animations)
- Wood fence border decoration

#### DiveScene (Underwater)
- 4 depth zones (Shallow → Abyss)
- Oxygen system with drain mechanic
- Bubbles particle effect
- Collectibles: Pearl, Coral, Shell, Gold Coin
- Depth meter display
- Underwater fish AI with wandering behavior

#### MineScene
- Cave environment with rock formations
- 6 ore types: coal, iron, gold, crystal, ruby, diamond
- Hit-based mining mechanic (SPACE to mine)
- Energy cost per hit
- Ore respawning system

### 📊 Asset Summary
| Category | Loaded | Available |
|----------|-------|----------|
| Trees | 6 types | 6+ types |
| Animals | 3 | 6+ types |
| Buildings | 3 | 5+ types |
| Tools | 5 | Full set |
| Crops | 5 types | Full set |
| Character anims | 8 types | 15 types |
| Fish | 35+ | 35+ |

### 🎯 Next Priorities
1. Terrain tiles for grass texture  
2. Tool animations on player character
3. NPC dialogue system
4. Shop system UI
5. Save/Load persistence

### Documentation
- SPRITE_AUDIT.md - Full sprite analysis
- SMALLBURG_ASSETS.md - Available assets reference