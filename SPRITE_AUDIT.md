# Full Sprite Audit - Tidefall Phaser

## Source Assets (Smallburg)
- **Fishing Pack v1.13**: 3,225 PNG files across 2 packs (fishing + farm)
- **Character animations**: walk, idle, run, jump, throw, catch, reel, pull — each with body/hair/shirt/pants layers × 3 skin tones × 10 colors = ~200 files each
- **Fish**: 35+ species, each with static_fish.png (64×64) + inventory_icons.png (96×64)
- **Animals**: chicken (16×16 frames), cow (32×32), pig (16×16), calf, chick
- **Buildings**: barn (128×144 premade), greenhouse (144×160), fish_market (256×128)

## Game Assets (public/assets/sprites/)
- Total files: ~250 PNGs
- Character layers properly set up
- All fish species loaded (35+ types with variants)

## ❌ CRITICAL ISSUES

### 1. 0% Opaque Sprites (INVISIBLE IN GAME)
These sprites load but render as INVISIBLE because they're 100% transparent:

**Idle pants (ALL 11 colors):** 0% opaque
- character_idle_pants_black.png through yellow.png

**Idle shirts (9 colors):** 0% opaque  
- character_idle_shirt_blue_dark through yellow.png
- (black and pink shirts work fine at ~1KB)

**Fish appear/disappear:**
- small_fish_appearing_animation.png: 0% opaque
- small_fish_disappearing_animation.png: 0% opaque

### 2. Shadow Frame Size
- shadow/big/animation.png loaded as 32×32 frames ✅ (not 48×48)
- All shadows extremely sparse (1-8% opaque) — this is NORMAL for shadows

### 3. Missing Source Assets
These Smallburg assets exist but aren't in the game:
- **Terrain tileset** (farm pack has full ground tiles)
- **Chicken coop** building
- **Grain silo** building  
- **Crop lifecycle** sprites (all 20+ crops)
- **Furnaces** (3 types)
- **Housing** walls/roofs/doors/windows
- **Tools** (axe, hoe, pickaxe, shovel, watercan, fork) — all character animations with tools
- **Run/Jump** character animations

### 4. Potentially Wrong Frame Sizes
- bobber_bite loaded as 32×16 — file is 192×48 = 6×3 frames ✅
- apple_tree loaded as 16×32 — file is 272×32 = 17×1 frames ✅

## Summary
| Category | Status |
|----------|--------|
| Character walk/throw/catch/reel/pull | ✅ Working |
| Character idle | ⚠️ Body works, pants+shirts invisible (0% opaque) |
| Fish (35 species) | ✅ All loaded |
| Animals (chicken/cow/pig) | ✅ Working |
| Boats (3 types) | ✅ Working |
| Buildings (3 types) | ✅ Working |
| Trees (palm, apple) | ✅ Working |
| Shadows | ✅ Working (sparse but normal) |
| Water ripples/bobbers | ✅ Working |
| Fish appear/disappear | ⚠️ Small variant is 0% opaque |

## Recommended Fixes
1. **Fix idle pants/shirts** — re-copy from Smallburg source (may need different file variant)
2. **Fix small fish appear/disappear** — re-copy from source
3. **Add more trees** (peach exists but isn't used, pine trees available)
4. **Add terrain tiles** for proper ground (currently using flat rectangles)
