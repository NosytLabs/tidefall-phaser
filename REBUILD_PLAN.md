# Tidefall Rebuild Plan

## Assessment: What "Looks Horrible" 

The current game generates visuals from raw Graphics API calls instead of using the 500+ Smallburg pixel art assets available. The world uses rectangles and circles, not sprite tiles. Character is a single sprite, not the layered body/pants/shirt/hair system. Fish shadows are code-generated circles, not actual sprite animations.

## Available Assets (500 PNGs, 0.9MB total)

| Category | Count | Key Assets |
|----------|-------|-----------|
| character | 232 | walk/idle body+pants+shirt+hair layer system |
| fish | 113 | species with static_fish.png and inventory_icons.png |
| animals | 79 | cow, chicken, pig with idle/walk/produce animations |
| buildings | 16 | barn, fish_market, greenhouse, silo with multi-layer sprites |
| boats | 17 | fishing_boat_blue/yellow, small_boat with back/front layers |
| animations | 29 | bobber floating, fish shadow swim, fish appear/disappear |
| trees | 7 | palm_tree, apple_tree, peach_tree, pine variants |
| terrain | 2 | farm_terrain_correct.png tile set |
| tileset | 2 | beach_tile_set.png |
| ui | 3 | fishing_ui_1_all_sprites.png, fishing_rod variants |

## Phase 1: Clean Slate

- [ ] Kill Vite dev server
- [ ] Clear Vite cache (`node_modules/.vite`)
- [ ] Verify all 500 assets are accessible and loadable
- [ ] Test asset loading with simple sprite display

## Phase 2: World Rendering (Uses sprites not Graphics)

- [ ] Create world from tile sprites (not raw shapes)
- [ ] Beach tiles: `tileset/beach_tile_set.png` as tilemap  
- [ ] Terrain: `terrain/farm_terrain_correct.png` as tilemap
- [ ] Forest/trees: `trees/*.png` sprite trees (not rectangles)
- [ ] Buildings: `buildings/barn`, `fish_market`, `greenhouse` multi-layer sprites
- [ ] Boats: `boats/fishing_boat_blue` with back/front layer compositing
- [ ] Water effects: `animations/water_ripples_animation.png`

## Phase 3: Character Rendering

- [ ] Build character from layer system: body + pants + shirt + hair
- [ ] Implement walk animation cycle (6 frames)
- [ ] Implement idle animation cycle
- [ ] Implement throw/catch/reel action states
- [ ] Use correct asset paths from analysis above

## Phase 4: Fish & Fishing

- [ ] Fish shadows: `animations/shadow/small/medium/large/animation.png`
- [ ] Fish catch: `fish/*/static_fish.png` for display
- [ ] Bobbers: `animations/bobber_floating_animation/boober_green_floating_animation.png`
- [ ] Fishing line: line graphics
- [ ] Catch animation: `animations/fish_appear` and `fish_disappear`

## Phase 5: Animals & World Life

- [ ] Animals: `animals/cow`, `chicken`, `pig` with idle/walk animations
- [ ] Animal shadows: `animals/*/shadow/*.png`
- [ ] Animal products: eggs, milk, poop icons

## Phase 6: UI

- [ ] Load `ui/fishing_ui_1_all_sprites.png` for UI elements
- [ ] Fishing rod: `ui/fishing_ui_1_fishing_rod.png`
- [ ] Hook/lure: `lure/hard_bait`, `lure/soft_bait` assets

## Phase 7: Polish

- [ ] Particle effects for water ripples
- [ ] Day/night lighting overlay
- [ ] Camera bounds and viewport

## Validation

1. All 500 assets load without 404s
2. World uses sprite tiles, not raw Graphics shapes  
3. Character renders with layered body+pants+shirt+hair
4. Fish shadows use `animations/shadow/` sprites
5. Buildings use multi-layer sprite compositing
6. Boats use back/front layer system
7. Game runs at 60fps in browser

## Backpressure Gates

- Build must succeed: `npm run build`
- No 404 asset errors in browser console
- Character must render as layered sprite (not single image)
- World must use tile sprites (not raw rectangles)