# Tidefall Sprite Asset Audit

**Generated:** 2026-04-25  
**Scope:** `public/assets/sprites/` — PNG files  
**Source of Truth:** `src/scenes/BootScene.js`

---

## Summary

| Metric | Count |
|--------|-------|
| **Total PNG files in public/assets/sprites/** | **500** |
| **BootScene load calls (unique keys)** | **~84** |
| **Available but unused PNG files** | **~416** |
| **Asset duplication / dead paths** | **~30** |

**Status:** The project has a massive asset footprint. BootScene loads roughly **16.8%** of available sprite files. Many categories (character hair/clothing, animal variants, building alt sheets, fish inventory icons) are completely unused but present in the build output. Several duplicate folder structures exist (e.g., `bobber/` vs `bobber_floating_animation/` holding identical files).

---

## How to Read This Report

- **Loaded Assets** — explicitly referenced in `BootScene.preload()`
- **Available but Unused** — files present in `public/assets/sprites/` with no matching `this.load.*()` call
- **Duplications** — identical or near-identical files under two folder paths; the game likely only needs one

---

## Loaded Assets (from BootScene.js)

### Terrain (2 keys)
| Key | File |
|-----|------|
| `terrain_grass` | `assets/sprites/terrain/farm_terrain.png` |
| `beach_tileset` | `assets/sprites/tileset/beach_tile_set.png` |

### Fish — 44 species (44 keys, 44 files loaded)
| Key | File |
|-----|------|
| `fish_bass` | `fish/bass/static_fish.png` |
| `fish_blobfish` | `fish/blobfish/static_fish.png` |
| `fish_butterfly_fish` | `fish/butterfly_fish/white_black_fin/static_fish.png` |
| `fish_catfish` | `fish/catfish/static_fish.png` |
| `fish_char` | `fish/char/static_fish.png` |
| `fish_cherry_salmon` | `fish/cherry_salmon/static_fish.png` |
| `fish_clown_fish` | `fish/clown_fish/red/static_fish.png` |
| `fish_cod` | `fish/cod/static_fish.png` |
| `fish_coho_salmon` | `fish/coho_salmon/static_fish.png` |
| `fish_cow_fish` | `fish/cow_fish/static_fish.png` |
| `fish_giant_tevally` | `fish/giant_tevally/static_fish.png` |
| `fish_golden_trout` | `fish/golden_trout/static_fish.png` |
| `fish_guppy` | `fish/guppy/blue/static_fish.png` |
| `fish_halibut` | `fish/halibut/static_fish.png` |
| `fish_herring` | `fish/herring/static_fish.png` |
| `fish_lion_fish` | `fish/lion_fish/static_fish.png` |
| `fish_loach` | `fish/loach/silver/static_fish.png` |
| `fish_mackerel` | `fish/mackerel/green/static_fish.png` |
| `fish_mahi_mahi` | `fish/mahi_mahi/static_fish.png` |
| `fish_manta_ray` | `fish/manta_ray/static_fish.png` |
| `fish_napolean_fish` | `fish/napolean_fish/static_fish.png` |
| `fish_neon_tetras` | `fish/neon_tetras/dark_blue/static_fish.png` |
| `fish_oarfish` | `fish/oarfish/static_fish.png` |
| `fish_ocean_sunfish` | `fish/ocean_sunfish/static_fish.png` |
| `fish_parrot_fish` | `fish/parrot_fish/small/static_fish.png` |
| `fish_pike` | `fish/pike/static_fish.png` |
| `fish_pink_salmon` | `fish/pink_salmon/static_fish.png` |
| `fish_pirana` | `fish/pirana/blue/static_fish.png` |
| `fish_plaice` | `fish/plaice/static_fish.png` |
| `fish_pompano` | `fish/pompano/static_fish.png` |
| `fish_puffer_fish` | `fish/puffer_fish/static_fish.png` |
| `fish_rainbow_fish` | `fish/rainbow_fish/static_fish.png` |
| `fish_sea_horse` | `fish/sea_horse/static_fish.png` |
| `fish_shark_greatwhite` | `fish/shark_greatwhite/static_fish.png` |
| `fish_shark_hammerhead` | `fish/shark_hammerhead/static_fish.png` |
| `fish_shark_saw` | `fish/shark_saw/static_fish.png` |
| `fish_shark_whale` | `fish/shark_whale/static_fish.png` |
| `fish_silver_eel` | `fish/silver_eel/static_fish.png` |
| `fish_sockeye_salmon` | `fish/sockeye_salmon/static_fish.png` |
| `fish_squid` | `fish/squid/static_fish.png` |
| `fish_sucker_fish` | `fish/sucker_fish/static_fish.png` |
| `fish_surgeon_fish` | `fish/surgeon_fish/static_fish.png` |
| `fish_swordfish` | `fish/swordfish/blue/static_fish.png` |
| `fish_whiting_fish` | `fish/whiting_fish/static_fish.png` |

### Character — Body (8 keys / 8 files)
| Key | File |
|-----|------|
| `walk_body_light` | `character/walk/body/character_walk_body_light.png` |
| `walk_body_brown` | `character/walk/body/character_walk_body_brown.png` |
| `walk_body_dark` | `character/walk/body/character_walk_body_dark.png` |
| `idle_body_light` | `character/idle/body/character_idle_body_light.png` |
| `throw_body_light` | `character/throw/body/character_throw_body_light.png` |
| `catch_body_light` | `character/catch/body/character_catch_body_light.png` |
| `reel_body_light` | `character/reel/body/character_reel_body_light.png` |
| `pull_body_light` | `character/pull/body/character_pull_body_light.png` |

### Animations (10 keys / 10 files)
| Key | File |
|-----|------|
| `shadow_small` | `animations/shadow/small/animation.png` |
| `shadow_medium` | `animations/shadow/medium/animation.png` |
| `shadow_big` | `animations/shadow/big/animation.png` |
| `shadow_large` | `animations/shadow/large/animation.png` |
| `bobber_green` | `animations/bobber/boober_green_floating_animation.png` |
| `bobber_red` | `animations/bobber/boober_red_floating_animation.png` |
| `bobber_yellow` | `animations/bobber/boober_yellow_floating_animation.png` |
| `water_ripple` | `animations/water_ripples_animation.png` |
| `bobber_bite` | `animations/bobber_bite/bobber_fish_bitting_animation.png` |
| `fish_appear_small` | `animations/fish_appear/small_fish_appearing_animation.png` |
| `fish_appear_medium` | `animations/fish_appear/medium_fish_appearing_animation.png` |
| `fish_appear_big` | `animations/fish_appear/big_fish_appearing_animation.png` |
| `fish_disappear_small` | `animations/fish_disappear/small_fish_disappearing_animation.png` |
| `fish_disappear_medium` | `animations/fish_disappear/medium_fish_disappearing_animation.png` |
| `fish_disappear_big` | `animations/fish_disappear/big_fish_disappearing_animation.png` |

### Buildings (5 keys / 5 files)
| Key | File |
|-----|------|
| `barn` | `buildings/barn_premade.png` |
| `greenhouse` | `buildings/greenhouse_premade.png` |
| `fish_market` | `buildings/fish_market.png` |
| `grain_silo` | `buildings/grain_silo/grainsilo_premade.png` |
| `chicken_coop` | `buildings/chicken_coop/chicken_coop_premade.png` |

### Boats (3 keys / 3 files)
| Key | File |
|-----|------|
| `boat_blue` | `boats/fishing_boat_blue/full_boat.png` |
| `boat_yellow` | `boats/fishing_boat_yellow/full_boat.png` |
| `boat_small` | `boats/small_boat/full_boat.png` |

### Trees (4 keys / 4 files)
| Key | File |
|-----|------|
| `palm_tree` | `trees/palm_tree.png` |
| `trees_pine_growth` | `trees/trees_pine_growth.png` |
| `apple_tree` | `trees/apple_tree.png` |
| `peach_tree` | `trees/peach_tree.png` |

### Animals — simplified sprite sheets (4 keys / 4 files)
| Key | File |
|-----|------|
| `chick` | `animals/chick/chick_all_frames.png` |
| `chicken_walk` | `animals/chicken_walk.png` |
| `chicken_idle` | `animals/chicken_idle.png` |
| `cow_walk` | `animals/cow_walk.png` |
| `cow_idle` | `animals/cow_idle.png` |
| `pig_walk` | `animals/pig_walk.png` |
| `pig_idle` | `animals/pig_idle.png` |

### UI (1 key / 1 file)
| Key | File |
|-----|------|
| `ui_border` | `ui/fishing_ui_1_all_sprites.png` |

**BootScene total unique asset keys: ~84**

---

## Available but Unused (Selected Highlights)

> **Note:** The raw file count is ~416 unused PNGs. Below are grouped by category with recommended use and priority.

### Character Customization — Completely Unused (~195 files)
| Asset Group | Count | Recommended Use | Priority |
|-------------|-------|-----------------|----------|
| `character/idle/hair/*` (80 variants) | 80 | Character creator / equipment | **LOW** |
| `character/idle/pants/*` (11 colours) | 11 | Character creator / equipment | **LOW** |
| `character/idle/shirt/*` (11 colours) | 11 | Character creator / equipment | **LOW** |
| `character/walk/hair/*` (90 variants) | 90 | Character creator / equipment | **LOW** |
| `character/walk/pants/*` (11 colours) | 11 | Character creator / equipment | **LOW** |
| `character/walk/shirt/*` (11 colours) | 11 | Character creator / equipment | **LOW** |
| `character/{catch,pull,reel,throw}/body_{brown,dark}` (6 files) | 6 | Add skin-tone diversity | **MED** |
| `character/idle/body_{brown,dark}` (2 files) | 2 | Add skin-tone diversity | **MED** |

### Fish Inventory Icons — Completely Unused (~88 files)
| Asset Group | Count | Recommended Use | Priority |
|-------------|-------|-----------------|----------|
| `fish/*/inventory_icons.png` | ~88 | Inventory / journal UI for caught fish | **HIGH** |

### Fish Colour Variants — Completely Unused (~8 files)
| Asset | Variant Loaded | Unused Variant(s) | Recommended Use | Priority |
|-------|---------------|-------------------|-----------------|----------|
| `butterfly_fish` | white_black_fin | white_yellow_no_fin, yellow_blue_no_fin, yellow_white_blue_fin, yellow_white_fin | Rare colour morphs / bait preference | **LOW** |
| `clown_fish` | red | yellow | Rare variant | **LOW** |
| `guppy` | blue | red | Rare variant | **LOW** |
| `loach` | silver | yellow *(+ `loach_all_sprites.png`)* | Rare variant | **LOW** |
| `mackerel` | green | silver | Rare variant | **LOW** |
| `neon_tetras` | dark_blue | light_blue | Rare variant | **LOW** |
| `pirana` | blue | gold | Rare variant | **LOW** |
| `swordfish` | blue | white, white_pink | Rare variant | **LOW** |

### Animal Variants & Detail Frames (~90 files)
| Asset Group | Count | Recommended Use | Priority |
|-------------|-------|-----------------|----------|
| `animals/calf/*` (idle, walk, shadow frames) | 6 | FarmScene baby animals | **MED** |
| `animals/chick/*` (idle, walk, peck, shadow) | 8 | FarmScene detailed chick | **MED** |
| `animals/chicken/*` (gray/red/white/yellow variants + icon/poop/produce/shadow) | 30 | FarmScene chicken variety | **MED** |
| `animals/cow/*` (all_frames, icon, poop, produce, shadow) | 10 | FarmScene detailed cow | **MED** |
| `animals/pig/*` (gray/pink/yellow variants + icon/poop/produce/wallowing/shadow) | 24 | FarmScene pig variety | **MED** |
| `animals/piglet/*` (idle, walk, wallowing, shadow) | 8 | FarmScene baby pigs | **MED** |

### Building Alt Sheets & Shadows (~8 files)
| Asset | Recommended Use | Priority |
|-------|-----------------|----------|
| `buildings/farm_buildings_all_assets.png` | Atlas for FarmScene builder | **MED** |
| `buildings/barn/barn_all_assets.png` | Animated barn (doors, states) | **LOW** |
| `buildings/barn/shadow/barn_shadow_all_assets.png` | Dynamic shadow | **LOW** |
| `buildings/chicken_coop/chicken_coop_assets.png` | Coop states | **LOW** |
| `buildings/chicken_coop/Shadow/chicken_coop_shadow_assets.png` | Dynamic shadow | **LOW** |
| `buildings/grain_silo/grainsilo_all_assets.png` | Silo states | **LOW** |
| `buildings/greenhouse/greenhouse_all_assets.png` | Greenhouse states | **LOW** |

### Boat Layered Assets & Root Duplicates (~11 files)
| Asset | Recommended Use | Priority |
|-------|-----------------|----------|
| `boats/all_full_boats.png` | Boat selection menu atlas | **LOW** |
| `boats/boat_blue.png` *(root)* | Duplicate of `fishing_boat_blue/full_boat.png` | **CLEANUP** |
| `boats/boat_small.png` *(root)* | Duplicate of `small_boat/full_boat.png` | **CLEANUP** |
| `boats/boat_yellow.png` *(root)* | Duplicate of `fishing_boat_yellow/full_boat.png` | **CLEANUP** |
| `boats/fishing_boat_blue/all_sprites.png` | Boat customization / damage states | **LOW** |
| `boats/fishing_boat_blue/boat_back_layer.png` | Z-sorting depth layers | **LOW** |
| `boats/fishing_boat_blue/boat_front_layer.png` | Z-sorting depth layers | **LOW** |
| `boats/fishing_boat_yellow/*` (same 3 alt files) | Same as above | **LOW** |
| `boats/small_boat/all_sprites.png` | Small boat states | **LOW** |
| `boats/small_boat/boat_back_layer.png` | Z-sorting | **LOW** |
| `boats/small_boat/boat_front_layer.png` | Z-sorting | **LOW** |
| `boats/small_boat/motor_layer.png` | Motor on/off toggle | **LOW** |

### Trees — Seasonal Variants (~3 files)
| Asset | Recommended Use | Priority |
|-------|-----------------|----------|
| `trees/trees_pine_produce.png` | Pine tree with fruit / harvest | **LOW** |
| `trees/trees_pine_spring_autumn.png` | Season change system | **LOW** |
| `trees/trees_pine_spring_summer.png` | Season change system | **LOW** |

### Terrain / Tileset Duplicates (~3 files)
| Asset | Recommended Use | Priority |
|-------|-----------------|----------|
| `terrain/farm_terrain_correct.png` | Fix for terrain tiling gaps | **MED** |
| `tileset/beach/beach_tile_set.png` | Duplicate of `tileset/beach_tile_set.png` | **CLEANUP** |

### UI Detail (~2 files)
| Asset | Recommended Use | Priority |
|-------|-----------------|----------|
| `ui/fishing_ui_1_fishing_rod_pulley.png` | Animated pulley during reel | **LOW** |
| `ui/fishing_ui_1_fishing_rod.png` | Rod-only UI element | **LOW** |

### Fish Atlas (~1 file)
| Asset | Recommended Use | Priority |
|-------|-----------------|----------|
| `fish/all_fish.png` | Encyclopedia / catch gallery atlas | **MED** |

---

## Duplicate / Dead Path Inventory

The following paths contain the **same file** as another already-loaded path. They bloat the build and should be consolidated or removed.

| Duplicate Path | Original / Loaded Path | Status |
|----------------|------------------------|--------|
| `animations/bobber_floating_animation/*.png` | `animations/bobber/*.png` | **DELETE** |
| `animations/bobber_fish_bitting/*.png` | `animations/bobber_bite/*.png` | **DELETE** |
| `animations/fish_appearing_animation/*.png` | `animations/fish_appear/*.png` | **DELETE** |
| `animations/fish_dissapearing_animation/*.png` | `animations/fish_disappear/*.png` | **DELETE** |
| `animations/fish_shadow_swim_animations/*/animation.png` | `animations/shadow/*/animation.png` | **DELETE** |
| `animations/water_riples_animation/*.png` | `animations/water_ripples_animation.png` | **DELETE** |
| `boats/boat_blue.png` | `boats/fishing_boat_blue/full_boat.png` | **DELETE** |
| `boats/boat_small.png` | `boats/small_boat/full_boat.png` | **DELETE** |
| `boats/boat_yellow.png` | `boats/fishing_boat_yellow/full_boat.png` | **DELETE** |
| `tileset/beach/beach_tile_set.png` | `tileset/beach_tile_set.png` | **DELETE** |

---

## Priority Recommendations

### 1. Easy Wins (add 1–3 load lines, immediate value)
1. **Fish inventory icons** — Load `inventory_icons.png` per species. Enables an inventory / journal UI without new art. (~88 files, but codegen-friendly loop)
2. **Terrain fix** — Swap `farm_terrain.png` → `farm_terrain_correct.png` if tiling looks off.
3. **Extra skin tones for idle/catch/pull/reel/throw** — Load `*_brown` and `*_dark` variants alongside `*_light`. One-liner per tone.

### 2. Medium Effort (enable whole scenes)
1. **Animal full variants** — Replace the simplified root `chicken_walk.png` / `cow_walk.png` / `pig_walk.png` loads with the detailed `animals/chicken/` and `animals/cow/` / `animals/pig/` variant spritesheets. Unlocks colour variety and icon/poop/produce frames for FarmScene.
2. **Farm building alt sheets** — Load `barn_all_assets.png`, `greenhouse_all_assets.png`, etc., to support building states / construction phases.
3. **Boat layered sprites** — Load `boat_back_layer.png` + `boat_front_layer.png` for proper character-over-boat, boat-over-water depth sorting.

### 3. Large Effort (systemic changes)
1. **Character equipment system** — Hair + shirt + pants variants require a layered character renderer (Phaser container with multiple spritesheets). Not a quick add.
2. **Season system** — Swap `trees_pine_growth.png` ↔ `trees_pine_spring_autumn.png` etc. based on in-game calendar.
3. **Fish colour morph system** — Randomly select `static_fish.png` from variant subdirs per catch. Requires data model update.
4. **Cleanup duplicates** — Safe but tedious; affects build size (~20–30MB saved if duplicates are pruned).

---

## Quick Stats by Folder

| Folder | PNG Count | Loaded | Unused |
|--------|-----------|--------|--------|
| `animals/` | ~95 | 10 | ~85 |
| `animations/` | ~30 | 15 | ~15 *(mostly dupes)* |
| `boats/` | ~15 | 3 | ~12 |
| `buildings/` | ~12 | 5 | ~7 |
| `character/` | ~203 | 8 | ~195 |
| `fish/` | ~132 | 44 | ~88 |
| `terrain/` | 2 | 1 | 1 |
| `tileset/` | 2 | 1 | 1 |
| `trees/` | 7 | 4 | 3 |
| `ui/` | 3 | 1 | 2 |

---

*End of audit.*
