# Ralph: Tidefall Sprite Rebuild

## Status: IN PROGRESS 🔄

Started: 2026-04-25 00:00 ADT

## GOAL
Replace all Graphics API rendering with Smallburg pixel art sprites.

## Validation
- Build: npm run build
- Screenshot: must show sprites not rectangles
- Console: no 404 asset errors

---

## Iteration 1 — Boot Scene Asset Loading

### Status: In Progress

### What Will Be Done
- Add all verified real asset paths to BootScene.js `loadCriticalAssets()`
- Remove any broken/non-existent asset paths
- Add terrain tiles, tree sprites, building sprites, boat sprites, water sprites, shadow sprites

### Validate
- npm run build
- Browser console: no 404 errors for assets

---

## Iteration 2 — World Rendering: Grass & Beach Tiles

### Status: Pending

### File: src/scenes/FishingScene.js
- Replace `this.add.rectangle()` for grass → tiled `terrain/farm_terrain_correct.png`
- Replace beach rectangles → tiled `tileset/beach/beach_tile_set.png`

---

## Iteration 3 — World Rendering: Trees & Decorations

### Status: Pending

### File: src/scenes/FishingScene.js
- Replace tree circles → `trees/palm_tree.png`, `trees/trees_pine_growth.png` sprite placements
- Replace forest tree circles → actual tree sprite images

---

## Iteration 4 — Water Rendering

### Status: Pending

### File: src/scenes/FishingScene.js
- Replace solid blue water rectangle → animated `animations/water_riples_animation/water_ripples_animation.png`

---

## Iteration 5 — Buildings & Boats

### Status: Pending

### File: src/scenes/FishingScene.js
- Replace building rectangles → `buildings/barn/barn_premade.png`, `buildings/fish_market.png`
- Replace boat circles → `boats/fishing_boat_blue/full_boat.png` sprites

---

## Iteration 6 — Fish Shadows

### Status: Pending

### File: src/systems/FishManager.js
- Replace `this.add.circle()` shadows → `animations/shadow/small/medium/large/animation.png` sprites

---

## Iteration 7 — Bobber Sprite

### Status: Pending

### File: src/systems/FishingSystem.js
- Replace bobber rectangle → `animations/bobber_floating_animation/boober_green_floating_animation.png`

---

## Iteration 8 — Animals in FarmScene

### Status: Pending

### File: src/scenes/FarmScene.js
- Add cow, chicken, pig sprites with idle/walk animations

---

## Iteration 9 — Character Verification

### Status: Pending

### File: src/entities/Player.js
- Verify layered sprite rendering (body + pants + shirt + hair)
- Fix any missing texture paths

---

## Iteration 10 — Final Polish & Validation

### Status: Pending

### Actions
- Full screenshot
- npm run build
- FPS check
- Mark COMPLETE
