# Tidefall Phaser - Visual & Sprite Specs

## Asset Inventory (Native Sizes)
- Player character: ~10×16px drawn in 64×64 frames (walk/idle/fishing)
- Fish: 64×64px (some 80×64, giant 112×96)
- Animals: chicken 16×16 frame, cow 32×32 frame, pig 16×16 frame
- Trees: palm 80×80 per frame, apple/peach 16×32 per frame (crop trees - too small)
- Buildings: fish_market 256×128, barn 128×144, greenhouse 144×160
- Boats: 128×128 per frame
- Bobbers: 16×16 per frame
- Fish shadows: 32×32 per frame (small), 48×48 (big)
- Beach tileset: 112×112 (7×7 tiles of 16×16) - transition edges only

## Proportion Rules
1. Player height = ~20px (at scale 2x body in 64×64 frame) = baseline
2. Buildings must be 3-5× player height
3. Trees must be 2-4× player height
4. Animals: chicken < player, cow ~1.5× player width, pig ~player size
5. Boats: 3-4× player width
6. Fish shadows: same as player or smaller

## Viewport
- 480×320 native, zoom 2x = 960×640 display
- Zone layout (Y):
  - 0-32: Forest/tree line
  - 32-128: Grass (walkable, buildings, NPCs, animals)
  - 128-150: Sand/beach
  - 150-320: Water (fishing)

## Visual Quality Criteria
- NPCs must have readable name labels (7px+ with stroke)
- Fishing line must be visible (white, 0.8 alpha)
- Bobber must switch to bite animation on fish bite
- Player must be distinguishable from background
- Buildings must look like buildings, not colored blocks
- Water must be flat #55A4F7 (Smallburg reference)
- No procedural noise on terrain (flat fills only)
