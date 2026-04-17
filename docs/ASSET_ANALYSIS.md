# Smallburg Complete Pack - Asset Analysis

## Sprite Sheet Dimensions

### Character Animations (Fishing Pack)

#### Tool: Fishing Rod - THROW
- **File**: `character_tools_fishing_rod_throw_body_*.png`
- **Dimensions**: 448×256 pixels
- **Frame Size**: 64×64 pixels
- **Layout**: 7 columns × 4 rows = 28 frames
- **Directions**:
  - Row 0 (frames 0-6): Facing DOWN
  - Row 1 (frames 7-13): Facing LEFT
  - Row 2 (frames 14-20): Facing RIGHT
  - Row 3 (frames 21-27): Facing UP
- **Skin Tones**: brown, dark, light, medium

#### Tool: Fishing Rod - CATCH
- **File**: `character_tools_fishing_rod_catch_body_*.png`
- **Dimensions**: 320×256 pixels
- **Frame Size**: 64×64 pixels
- **Layout**: 5 columns × 4 rows = 20 frames
- **Directions**:
  - Row 0 (frames 0-4): Facing DOWN
  - Row 1 (frames 5-9): Facing LEFT
  - Row 2 (frames 10-14): Facing RIGHT
  - Row 3 (frames 15-19): Facing UP

#### Tool: Fishing Rod - REEL
- **File**: `character_tools_fishing_rod_reel_body_*.png`
- **Dimensions**: 256×256 pixels
- **Frame Size**: 64×64 pixels
- **Layout**: 4 columns × 4 rows = 16 frames
- **Directions**:
  - Row 0 (frames 0-3): Facing DOWN
  - Row 1 (frames 4-7): Facing LEFT
  - Row 2 (frames 8-11): Facing RIGHT
  - Row 3 (frames 12-15): Facing UP

#### Tool: Fishing Rod - PULL
- **File**: `character_tools_fishing_rod_pull_body_*.png`
- **Dimensions**: 512×256 pixels
- **Frame Size**: 64×64 pixels
- **Layout**: 8 columns × 4 rows = 32 frames
- **Directions**:
  - Row 0 (frames 0-7): Facing DOWN
  - Row 1 (frames 8-15): Facing LEFT
  - Row 2 (frames 16-23): Facing RIGHT
  - Row 3 (frames 24-31): Facing UP

### Fish Sprites

#### Static Fish
- **Size**: 64×64 pixels
- **Format**: Single frame per fish type
- **Location**: `fish/[type]/static_fish.png`

#### Inventory Icons
- **Size**: 96×64 pixels (3 icons per sheet)
- **Format**: 3 frames per sheet
- **Location**: `fish/[type]/inventory_icons.png`

### Animation Sprites

#### Bobber Floating
- **File**: `boober_*_floating_animation.png`
- **Size**: 96×48 pixels
- **Frames**: 6 frames (16×16 each)
- **Colors**: green, red, yellow

#### Fish Shadows
- **Small**: 64×64 pixels, 4 frames (16×16 each)
- **Medium**: 128×128 pixels, 4 frames (32×32 each)
- **Big**: 192×192 pixels, 4 frames (48×48 each)

### UI Sprites

#### Fishing UI
- **File**: `fishing_ui_1_all_sprites.png`
- **Size**: 320×208 pixels
- **Contains**: Multiple UI elements in atlas

## Asset Count by Pack

| Pack | Sprite Count | Key Assets |
|------|-------------|------------|
| Fishing | 885 | 44 fish, character anims, bobbers, UI |
| Farm | 2,347 | Crops, animals, tools, buildings |
| Town | 726 | Buildings, NPCs, props, interiors |
| Diving | 527 | Swimming anims, underwater fish |
| Dungeon | 2,315 | Enemies, weapons, armor, tiles |
| Mine | 1,332 | Ores, tools, cave environment |
| UI | 72 | Buttons, frames, icons, dialogs |
| **TOTAL** | **8,204** | |

## Animation Frame Rates

| Animation | FPS | Duration | Loop |
|-----------|-----|----------|------|
| Throw | 12 | ~0.6s | No |
| Catch | 12 | ~0.4s | No |
| Reel | 8 | 0.5s | Yes |
| Pull | 10 | 0.8s | Yes |
| Bobber | 8 | 0.75s | Yes |
| Fish Shadow | 6 | 0.67s | Yes |

## Phaser 3 Configuration

### Sprite Sheet Loading
```javascript
// Character with directional frames
this.load.spritesheet('body_throw_brown', 'path.png', {
  frameWidth: 64,
  frameHeight: 64
});
```

### Animation Creation
```javascript
// Directional animation (DOWN facing)
this.anims.create({
  key: 'throw_brown_down',
  frames: this.anims.generateFrameNumbers('body_throw_brown', {
    start: 0,  // Row 0, frame 0
    end: 6     // Row 0, frame 6
  }),
  frameRate: 12,
  repeat: 0
});
```

## Unused Assets (Potential for Expansion)

### Fishing Pack
- Boats (3 types)
- Fishing rods (multiple types)
- Lures (hard, soft, natural bait)
- Fish market props

### Farm Pack (Completely Unused)
- 7 crop types with growth stages
- 3 animals (chicken, cow, pig) with full animations
- Farm tools (hoe, watering can, scythe)
- Farm buildings (barn, coop, farmhouse)
- Season variants for all assets

### Town Pack (Completely Unused)
- 20+ building types
- 30+ NPC characters
- Town decorations (fences, paths, lamps)
- Interior furniture

### Diving Pack (Completely Unused)
- Swimming animations (8 directions)
- Underwater fish (different from surface)
- Diving gear (mask, tank, fins)
- Coral reef environment

### Dungeon Pack (Completely Unused)
- 20+ enemy types
- Weapons (sword, bow, staff)
- Armor sets
- Dungeon tileset

### Mine Pack (Completely Unused)
- 10+ ore types
- Mining tools (pickaxe, drill)
- Cave tileset
- Mine cart system
