# Ralph Mode: Tidefall Asset Integration

## Task: Integrate Smallburg pixel art assets into Tidefall Phaser game

**Project:** C:\Users\Tyson\clawd\tidefall-phaser
**Context:** Game renders using Graphics API (rectangles/circles) instead of 500 available pixel art assets

## Asset Inventory (verified, public/assets/sprites/)

- **232 character files** — walk/idle body+pants+shirt+hair layer system (10 colors × 6 hair styles × 2 shirt + pants)
- **113 fish files** — species with `static_fish.png` and `inventory_icons.png`
- **79 animal files** — cow/chicken/pig with idle/walk/produce + shadow variants  
- **17 boat files** — `fishing_boat_blue/yellow` with back_layer/front_layer/full_boat
- **16 building files** — `barn`, `fish_market`, `greenhouse` with premade + all_assets sheets
- **29 animation files** — bobber floating, fish shadow swim, fish appear/disappear, water ripples
- **7 tree files** — `palm_tree`, `apple_tree`, `peach_tree`, `pine` variants
- **2 terrain tiles** — `farm_terrain_correct.png`, `beach_tile_set.png`

## Phase 1: Asset Loading Test

File: `src/scenes/BootScene.js`
Task: Add all sprite loads for the above assets using `this.load.image()` and `this.load.spritesheet()`
Validate: Browser loads game, no 404 errors in console, assets visible in scene

## Phase 2: World from Sprites (NOT Graphics rectangles)

File: `src/scenes/FishingScene.js` — `createWorld()` method  
Task: Replace `this.add.rectangle()` calls with sprite placements using actual tile assets

Key replacements:
- Beach tiles → `terrain/beach_tile_set.png` (tiled)
- Grass terrain → `terrain/farm_terrain_correct.png` (tiled)  
- Trees → `trees/palm_tree.png`, `trees/trees_pine_growth.png`
- Buildings → `buildings/barn/barn_premade.png`, etc.
- Boats → `boats/fishing_boat_blue/full_boat.png`
- Water → `animations/water_ripples_animation.png`

## Phase 3: Character from Layers (NOT single sprite)

File: `src/entities/Player.js`
Task: Build player from layered PNGs:
- body: `character/idle/body/character_idle_body_light.png`  
- pants: `character/idle/pants/character_idle_pants_blue_dark.png`
- shirt: `character/idle/shirt/character_idle_shirt_blue_light.png`
- hair: `character/idle/hair/character_idle_hair_short_hair_brown_light.png`

Walk cycle via `character/walk/` variants.

## Phase 4: Fish Shadows from Sprites

File: `src/systems/FishManager.js`  
Task: Replace code-generated shadow circles with `animations/shadow/small/animation.png`

## Validate After Each Phase

1. `npm run build` — must pass
2. Browser screenshot — assets visible, not rectangles  
3. No console errors about missing files

## Rules
- ONE file per iteration
- Validate with build + screenshot  
- Update PROGRESS.md after each iteration
- Exit when build passes and screenshot shows sprite-based world