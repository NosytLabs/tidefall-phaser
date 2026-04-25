# Tidefall Asset Inventory & Cross-Reference

*Generated: 2026-04-25 | Build: ✅ Clean (96KB index + 1.48MB Phaser)*

## Totals

| Metric | Count |
|--------|-------|
| **Total PNGs** | **500** |
| Character sheets | ~275 (body + hair × colors + pants + shirts) |
| Fish sprites | ~95 (44 species + variants + inventory icons + all_fish composite) |
| Animations | ~40 (shadows, bobbers, ripples, appear/disappear + duplicates in alt paths) |
| Buildings | ~15 (premade + component sheets + shadows) |
| Boats | ~14 (3 boats × layers + composites) |
| Trees | ~7 (pine variants, palm, apple, peach) |
| Animals | ~70 (cow/pig/chicken/calf/chick/piglet × states/colors/shadows) |
| Terrain | ~3 (farm, beach tileset) |
| UI | ~1 (fishing UI border sheet) |

---

## What's Already Loaded (BootScene keys)

### Terrain (5)
- `terrain_grass` — farm_terrain_correct.png
- `beach_tileset`
- `trees_pine_produce`, `trees_pine_spring_summer`, `trees_pine_spring_autumn`

### Fish (45)
- `fish_{name}` for 44 species + `fish_neon_tetras`

### Character Body — Walk (3)
- `walk_body_light`, `walk_body_brown`, `walk_body_dark` — 384×256, 64×64 frames (6 cols × 4 dirs = 24 frames each)

### Character Body — Idle (1 loaded / 3 available)
- `idle_body_light` — 128×256, 64×64 frames (2 cols × 4 dirs = 8 frames)
- idle_body_brown, idle_body_dark **exist but NOT loaded**

### Character Body — Fishing Actions (only LIGHT loaded)
- `catch_body_light` — 320×256 (5 cols)
- `pull_body_light` — 512×256 (8 cols)
- `reel_body_light` — 256×256 (4 cols)
- `throw_body_light` — 448×256 (7 cols)
- **Brown & dark variants exist for ALL actions but are NOT loaded**

### Animations (loaded)
- `shadow_small/medium/big/large` — 128×256, 16×16 frames
- `bobber_green/red/yellow` — 96×48, 16×16 frames
- `water_ripple` — 96×48, 16×16 frames
- `bobber_bite` — 192×48, 32×16 frames
- `fish_appear_small/medium/big` — 128×32, 16×16 frames
- `fish_disappear_small/medium/big` — 128×32, 16×16 frames

### Buildings (5)
- `grain_silo`, `chicken_coop`, `barn`, `greenhouse` (images)
- `fish_market` (spritesheet, 256×128, 128×128 frames)

### Boats (3)
- `boat_blue`, `boat_yellow`, `boat_small` — 1024×128, 128×128 frames

### Trees (5)
- `palm_tree` — 240×80, 80×80 frames (3 sway frames)
- `trees_pine_growth` — 352×80, 80×80 frames
- `apple_tree`, `peach_tree` — static images

### Animals (via ASSETS.ANIMAL_TYPES loop)
- `chicken_walk`, `chicken_idle`, `cow_walk`, `cow_idle`, `pig_walk`, `pig_idle`
- `chick`, `piglet` (16×16 all-frames sheets)

### UI
- `ui_border` — fishing_ui_1_all_sprites.png

---

## What's Available But NOT Loaded (High-Value Targets)

### 🔥 Character Customization (220+ files)
| Category | Available | Loaded |
|----------|-----------|--------|
| Idle hair (10 styles × 11 colors) | 110 | 0 |
| Walk hair (11 styles × 11 colors) | 121 | 0 |
| Idle pants (11 colors) | 11 | 0 |
| Walk pants (11 colors) | 11 | 0 |
| Idle shirts (11 colors) | 11 | 0 |
| Walk shirts (11 colors) | 11 | 0 |
| Catch/pull/reel/throw body (brown/dark) | 9 | 0 |

> Massive untapped potential. The Smallburg character system supports layered sprites (body + hair + shirt + pants). Currently rendering naked bald characters.

### Buildings — Component Sheets & Shadows
- `barn_all_assets`, `barn_shadow_all_assets`
- `chicken_coop_assets`, `chicken_coop_shadow_assets`
- `grainsilo_all_assets`, `grainsilo_shadow_all_assets`
- `greenhouse_all_assets`, `greenhouse_shadow_all_assets`
- `farm_buildings_all_assets` — composite of everything

### Boats — Layered Rendering
- `boat_back_layer` + `boat_front_layer` for all 3 boats
- `motor_layer` for small boat
- `all_sprites` per boat (combined sheet)
- `all_full_boats` — 1024×384 master composite

### Animals — Color Variants & States
- Chickens: gray, red, white, yellow variants (idle/walk/peck + all_frames)
- Pigs: gray, pink, yellow variants (idle/walk/wallowing)
- Shadows for all animals (calf, chick, chicken, cow, pig, piglet)
- Animal icons, poop, produce sprites
- Chick `peck` animation, piglet `wallowing` animation

### Fish — Alternate Variants NOT Loaded
- `butterfly_fish` — 4 other color variants (white_yellow_no_fin, yellow_blue_no_fin, yellow_white_blue_fin, yellow_white_fin)
- `clown_fish` — yellow variant
- `guppy` — red variant
- `loach` — yellow variant
- `mackerel` — silver variant
- `neon_tetras` — light_blue variant
- `pirana` — gold variant

---

## Key Sprite Dimensions

| Asset | Size | Frame Size | Frame Count |
|-------|------|------------|-------------|
| Walk body (all tones) | 384×256 | 64×64 | 24 (6×4 dirs) |
| Idle body (all tones) | 128×256 | 64×64 | 8 (2×4 dirs) |
| Catch body | 320×256 | 64×64 | 20 (5×4 dirs) |
| Pull body | 512×256 | 64×64 | 32 (8×4 dirs) |
| Reel body | 256×256 | 64×64 | 16 (4×4 dirs) |
| Throw body | 448×256 | 64×64 | 28 (7×4 dirs) |
| all_fish.png | 480×736 | — | 44 fish composite |
| Boat sheets | 1024×128 | 128×128 | 8 frames |
| Shadow swim | 128×256 | 16×16 | 128 (uses first 8) |
| Fish market | 256×128 | 128×128 | 2 frames |

---

## Top 5 Easiest Visual Wins

### 1. Enable brown & dark skin tones for idle + fishing actions
**Effort:** 5 lines in BootScene preload + createAnimations already loops over them.  
**Impact:** Characters don't look like clones. Three distinct skin tones in walk, idle, catch, pull, reel, throw.

### 2. Add ONE hair layer to the character
**Effort:** Load one `idle_hair_*` and one `walk_hair_*` spritesheet; render as child sprite offset to body.  
**Impact:** Massive — transforms bald stick figures into actual characters. 10 styles × 11 colors = 110 idle combos ready.

### 3. Layered boat rendering (back → player → front)
**Effort:** Load `boat_back_layer` + `boat_front_layer` per boat; render player between them.  
**Impact:** Boats gain real depth. Character appears to sit *in* the boat instead of floating on top.

### 4. Add animal idle/peck/wallowing animations
**Effort:** Load `chicken_gray_idle`, `pig_pink_idle`, etc. Already have frame counts from filenames.  
**Impact:** Farm scene comes alive. Animals stop sliding around and actually idle/peck/wallow.

### 5. Load building component sheets for dynamic construction
**Effort:** Load `barn_all_assets`, `coop_assets`, etc. as spritesheets.  
**Impact:** Enables building construction/repair animations, damage states, or placement previews.

---

## Bug Found

`fish_neon_tetras` appears in the FISH_NAMES array inside BootScene but is **not in the 44-species list** — it's loaded separately at the bottom of the fish block. Check if it should be added to FISH_NAMES or removed as a duplicate.
