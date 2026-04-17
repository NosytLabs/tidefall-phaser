# Full Smallburg Asset Audit - Tidefall Phaser

## Currently LOADED (40 assets)
### Animals (3)
- chicken_walk.png, cow_walk.png, pig_walk.png

### Buildings (3)  
- fish_market.png, barn_premade.png, greenhouse_premade.png

### Trees (2)
- palm_tree.png, apple_tree.png

### Boats (3)
- boat_blue.png, boat_small.png, boat_yellow.png

### Character Animations (8 types × 3 tones × layers)
- walk, idle, run, jump, throw, catch, reel, pull (body/hair/shirt/pants)

### Animations (9)
- water_ripple, bobber_green/red/yellow, bobber_bite
- fish_appear (big/medium/small), fish_disappear
- shadow_small/medium/big

### UI (1)
- fishing_ui_1_all_sprites.png

### Fish (35+ species dynamically loaded)

---

## Available but NOT LOADED

### ⭐ HIGH PRIORITY
| Asset | Path | Use Case |
|-------|------|--------|
| **Terrain tiles** | farming/terrain/*.png | Replace flat grass rects with tiles |
| **Pine tree** | woodcutting/pine_tree/*.png | More tree variety |
| **Crop lifecycles** | farming/crops/*.png | Farm scene crops |

### 🏠 BUILDINGS
| Asset | Path |
|-------|------|
| Chicken coop | farming/buildings/chicken_coop_*.png |
| Grain silo | farming/buildings/grainsilo_*.png |
| Farm buildings (full) | farming/buildings/farm_buildings_all_assets.png |

### 🛠️ TOOLS (character animations)
| Tool | Path |
|------|------|
| Axe | character/tools_axe/** |
| Hoe | character/tools_hoe/** |
| Pickaxe | character/tools_pickaxe/** |
| Shovel | character/tools_shovel/** |
| Watering can | character/tools_watercan/** |
| Fork | character/tools_fork/** |

### 🏭 FURNACES
| Type | Path |
|------|------|
| Brick furnace | smelting/furnaces_brick*.png |
| Metal furnace | smelting/furnaces_metal*.png |
| Rock furnace | smelting/furnaces_rocks*.png |

### 💎 MINING
| Asset | Path |
|------|------|
| Ores | mining/ores*.png |
| Gems | mining/gems*.png |

### 🏠 HOUSING
| Asset | Path |
|------|------|
| Walls (multiple colors) | housing/wall_*.png |
| Roofs | housing/roof_*.png |
| Doors | housing/doors_*.png |
| Windows | housing/windows_*.png |

### 🌱 FARMING
| Asset | Path |
|------|------|
| Seeds | farming/items/seedpacks_*.png |
| Sprinklers | farming/items/sprinklers_*.png |
| Beehives | farming/items/beehives_*.png |
| Produce icons | farming/produce/*.png |

### 🚢 BOATS (more available)
| Boat | Path |
|------|------|
| Small boat | boats/boat_small.png ✅ (loaded) |
| All boats combined | boats/all_full_boats.png |

---

## RECOMMENDED ADDITIONS (Priority Order)
1. ✅ Pine tree (easy - just add load line)
2. ✅ Terrain tiles (easy - just add load, use for grass)
3. ✅ Crop sprites (for FarmScene)
4. ✅ Tool animations (for character tool use)
5. ✅ Furnaces (for Mining scene)
6. ⏳ Housing (future building expansion)