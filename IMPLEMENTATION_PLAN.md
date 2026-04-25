# Tidefall Sprite Rebuild — Implementation Plan

## GOAL
Replace ALL Graphics API rendering with Smallburg pixel art sprites from `public/assets/sprites/`

## Asset Paths (verified)
```
terrain/farm_terrain_correct.png     — grass tiles
tileset/beach/beach_tile_set.png     — beach tiles
trees/palm_tree.png                   — palm trees
trees/apple_tree.png                  — apple trees
trees/peach_tree.png                  — peach trees
trees/trees_pine_growth.png           — pine trees
buildings/barn/barn_premade.png       — barn
buildings/fish_market.png             — fish market
buildings/greenhouse/greenhouse_premade.png — greenhouse
boats/fishing_boat_blue/full_boat.png — blue fishing boat
boats/fishing_boat_yellow/full_boat.png — yellow fishing boat
boats/small_boat/full_boat.png        — small boat
animations/water_riples_animation/water_ripples_animation.png — water
animations/shadow/small/animation.png — small fish shadow
animations/shadow/medium/animation.png — medium fish shadow
animations/shadow/large/animation.png — large fish shadow
animations/bobber_floating_animation/boober_green_floating_animation.png — bobber
character/idle/body/character_idle_body_light.png — player body idle
character/walk/body/character_walk_body_light.png — player body walk
character/idle/pants/character_idle_pants_*.png — pants variants
character/idle/shirt/character_idle_shirt_*.png — shirt variants
character/idle/hair/character_idle_hair_*.png — hair variants
animals/cow/cow_idle.png — cow
animals/chicken/chicken_red_idle.png — chicken
animals/pig/pig_pink_idle.png — pig
```

## Tasks (in order)

### Phase 1: Load All Sprite Assets
- [ ] 1.1 Add all sprite assets to BootScene.js `loadCriticalAssets()`
- [ ] 1.2 Verify no 404s in browser console

### Phase 2: World — Grass, Beach, Trees (FishingScene.js)
- [ ] 2.1 Replace grass rectangles → `terrain/farm_terrain_correct.png` tiled background
- [ ] 2.2 Replace beach rectangles → `tileset/beach/beach_tile_set.png` tiled
- [ ] 2.3 Replace tree circles → `trees/palm_tree.png` sprite placements
- [ ] 2.4 Replace pine tree circles → `trees/trees_pine_growth.png` sprite placements
- [ ] 2.5 Replace dirt paths → `terrain/farm_terrain_correct.png` varied tiles

### Phase 3: World — Water (FishingScene.js)
- [ ] 3.1 Replace solid water rectangle → `animations/water_riples_animation/water_ripples_animation.png` tiled + alpha
- [ ] 3.2 Add animated water effect (tilingSprite or multiple frames)

### Phase 4: Buildings & Boats (FishingScene.js)
- [ ] 4.1 Replace building rectangles → `buildings/barn/barn_premade.png`, `fish_market.png`, etc.
- [ ] 4.2 Replace boat circles → `boats/fishing_boat_blue/full_boat.png` sprites
- [ ] 4.3 Place boats at WATER_Y level

### Phase 5: Fish Shadows (FishManager.js)
- [ ] 5.1 Replace shadow circles → `animations/shadow/small/medium/large/animation.png` sprites
- [ ] 5.2 Animate shadow sprites (frame loop)

### Phase 6: Bobber (FishingSystem.js)
- [ ] 6.1 Replace bobber rectangle → `animations/bobber_floating_animation/boober_green_floating_animation.png`
- [ ] 6.2 Add floating animation to bobber

### Phase 7: Animals (FarmScene.js)
- [ ] 7.1 Add cow, chicken, pig sprites from `animals/` folder
- [ ] 7.2 Implement idle/walk animations for animals

### Phase 8: Character (Player.js)
- [ ] 8.1 Verify character renders with layered sprite system (body + pants + shirt + hair)
- [ ] 8.2 Fix any missing texture paths

### Phase 9: UI (UIScene.js)
- [ ] 9.1 Add UI sprites from `ui/` folder if loaded

### Phase 10: Polish
- [ ] 10.1 Full screenshot verification
- [ ] 10.2 Build test
- [ ] 10.3 FPS check

## Validation Gates
- `npm run build` must pass
- Browser screenshot must show sprite-based world (not colored rectangles)
- No console errors about missing textures

## Backpressure
- Build fails → stop, fix errors
- Screenshot shows rectangles → iteration not complete
- Console 404s → fix asset paths before moving on
