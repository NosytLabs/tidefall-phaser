# Core Specification — Tidefall v2

## Design Pillars
1. **Cozy pixel art** — chunky pixels, warm palette, handcrafted feel
2. **Living world** — animated water, swaying trees, drifting clouds, bobbing boats
3. **Clear visual hierarchy** — player always readable, environment supports not distracts
4. **Asset maximalism** — every Smallburg sprite gets used somewhere

## Resolution & Scaling
- **Internal resolution:** 480 x 270 (16:9, exact pixel grid)
- **Display:** FIT mode, autoCenter BOTH
- **pixelArt:** true, roundPixels: true, antialias: false
- **Game feels:** tight camera, immediate surroundings, no sprawling empty space

## Asset Inventory (504 sprites)
- **animals/** 79 — cows, chickens, pigs, chicks, piglets (idle/walk, shadows)
- **animations/** 33 — bobbers, ripples, fish shadows, catch animations
- **boats/** 17 — blue, yellow, small boats (layered sprites)
- **buildings/** 16 — barn, greenhouse, fish_market, grain_silo, chicken_coop, watchtower, lighthouse, pier, farmhouse
- **character/** 232 — body/hair/shirt/pants for walk/idle/throw/catch/reel/pull (3 skin tones, 10 hair colors, 11 shirt, 10 pants, 8 styles)
- **fish/** 113 — 44 species static sprites
- **terrain/** 2 — grass, sand tilesets (use for world base)
- **tileset/** 2 — decorative tilesets
- **trees/** 7 — palm, pine, apple, peach, oak, birch, willow
- **ui/** 3 — fishing_ui_1, status_bars, icons

## World Layout (y zones for 270px height)
```
0-40    Sky + parallax clouds
40-100  Forest back (pine trees, dark)
100-140 Grass (tileset-based, not solid color)
140-155 Sand beach (tileset-based, wet/dry zones)
155-200 Ocean (animated waves, depth variation)
200-270 Deep water (darker, fish shadows)
```

## Depth Layers
```
0   Sky, clouds (parallax)
1   Distant trees
2   Ground decorations (back)
5   Buildings
8   NPCs, animals
10  Player
11  Trees (foreground)
15  Particles
20  Water surface effects
90  UI
100 UI panels
```

## UI Design
- Use `fishing_ui_1_all_sprites.png` as 9-slice border for ALL panels
- Status bars from `status_bars` for energy/health
- Monospace text is OK for data, but panels MUST have sprite borders
- No solid rectangle panels — always bordered
