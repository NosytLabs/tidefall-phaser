# Tidefall Phaser — Comprehensive Technical Audit Report

**Date:** 2026-04-22  
**Auditor:** Rogue ⚡  
**Codebase:** `C:\Users\Tyson\clawd\tidefall-phaser`  
**Total Source Files:** 37 JS modules (~310 KB combined)  
**Stack:** Phaser 3.85 + Vite 6.3 + ES Modules  

---

## Phase 1 — Technology Stack & Architecture Analysis

### Technology Stack
| Layer | Technology | Version |
|-------|-----------|---------|
| Game Engine | Phaser | 3.85.0 |
| Build Tool | Vite | 6.3.0 |
| Language | JavaScript (ES Modules) | ES2022+ |
| Bundler | Rollup (via Vite) | — |
| Test Framework | Playwright | 1.58.2 |
| Minifier | esbuild | — |
| Package Manager | npm | — |

### Architectural Patterns
1. **Scene-based Architecture** — Phaser's scene system drives top-level organization
2. **Singleton Pattern** — `gameState`, `eventBus`, `questManager`, `settingsManager` are module-level singletons
3. **State Machine Pattern** — `StateMachine`/`State` classes for entity behavior (Player)
4. **Object Pool Pattern** — `ObjectPool`, `FishShadowPool`, `ParticlePool`, `SpritePool` for GC optimization
5. **Observer/Event Pattern** — `EventBus` with domain-prefixed events (`GAME:`, `PLAYER:`, `FISHING:`, `UI:`, `AUDIO:`, `SAVE:`)
6. **Manager/System Pattern** — Each game subsystem is a class (`FishingSystem`, `WeatherSystem`, `DayNightSystem`, etc.)
7. **Entity-Component-lite** — Entities (`Player`, `NPC`, `Boat`) are class-based with composed behaviors

### Folder Structure
```
src/
├── main.js                    # Phaser config + scene registration
├── config/
│   └── Balance.js             # Tunable game parameters
├── core/
│   ├── Constants.js           # All magic numbers centralized (12.7 KB)
│   ├── ErrorBoundary.js       # Error handling wrapper (8.4 KB)
│   ├── EventBus.js            # Pub/sub event system (0.6 KB)
│   └── GameState.js           # Global game state singleton (3.4 KB)
├── entities/
│   ├── Boat.js                # Boat entity + BoatManager (14.9 KB)
│   ├── NPC.js                 # NPC entity with dialog (12 KB)
│   └── Player.js              # Player entity with StateMachine (19.2 KB)
├── quests/
│   └── QuestManager.js        # Singleton quest manager (5.8 KB)
├── scenes/
│   ├── BootScene.js           # Asset loading + animation creation (19 KB)
│   ├── BootScene_original.js  # OLD backup (16.5 KB)
│   ├── FishingScene.js        # Main game scene (12.5 KB)
│   ├── FishingScene_backup.js # OLD backup (1.6 KB)
│   ├── GameScene.js           # PLACEHOLDER (5.9 KB)
│   ├── DiveScene.js           # Underwater scene stub (8.2 KB)
│   ├── FarmScene.js           # Farming scene stub (2.7 KB)
│   ├── MapScene.js            # Overworld map overlay (2 KB)
│   ├── MineScene.js           # Mining scene stub (6.4 KB)
│   └── UIScene.js             # Full HUD overlay (40.3 KB)
├── systems/
│   ├── AchievementSystem.js   # 50+ achievements (13.9 KB)
│   ├── AudioManager.js        # Sound effects with pooling (11.7 KB)
│   ├── DayNightSystem.js      # Day/night cycle (4.9 KB)
│   ├── EnergySystem.js        # Stardew-style energy (1.8 KB)
│   ├── FishEncyclopedia.js    # Fish collection tracker (2 KB)
│   ├── FishManager.js         # Pooled fish shadows (10.5 KB)
│   ├── FishingSystem.js       # Core fishing mechanics (27.8 KB)
│   ├── Inventory.js           # Item inventory (12.1 KB)
│   ├── NotificationSystem.js  # Toast notifications (11.4 KB)
│   ├── ObjectPool.js          # Generic pool + 3 specializations (6.9 KB)
│   ├── PerformanceMonitor.js  # FPS tracking + auto-quality (7 KB)
│   ├── PlayerAnalytics.js     # Behavior tracking (15 KB)
│   ├── QuestSystem.js         # Standalone quest logic (6.8 KB)
│   ├── SaveSystem.js          # localStorage persistence (10.5 KB)
│   ├── SettingsManager.js     # Settings with persistence (10.9 KB)
│   ├── ShopSystem.js          # Buy/sell items (3.4 KB)
│   ├── StateMachine.js        # State pattern (1.4 KB)
│   └── WeatherSystem.js       # Weather effects (10.4 KB)
└── utils/
    └── TextureValidator.js    # Texture validation (2 KB)
```

### Coding Conventions
- **ES Module imports/exports** throughout
- **No TypeScript** — pure JavaScript with no type annotations
- **No linter config** found (no `.eslintrc`, `biome.json`, or `prettier` config)
- **No CSS files** — all styling is Phaser-based (canvas rendering)
- **Console logging** for debugging (`console.log/warn/error`)
- **JSDoc comments** on some but not all classes/methods
- **Magic numbers** centralized in `Constants.js` (good), but violations exist in scenes

---

## Phase 2 — Architectural Audit

### 2.1 Misplaced Files & Components

| Issue | File(s) | Impact |
|-------|---------|--------|
| **Backup files in source tree** | `src/scenes/BootScene_original.js`, `src/scenes/FishingScene_backup.js` | These are compiled by Vite, adding dead weight. They confuse imports and inflate bundle |
| **GameScene is a superseded placeholder** | `src/scenes/GameScene.js` | Contains a complete but old player implementation. main.js doesn't import it, but it still ships |
| **QuestManager in `quests/` duplicates QuestSystem in `systems/`** | `src/quests/QuestManager.js` vs `src/systems/QuestSystem.js` | Two completely independent quest systems with overlapping logic |
| **ShopSystem is disconnected** | `src/systems/ShopSystem.js` | Imported only in FishingScene_backup.js, never used in the active FishingScene |
| **FishingScene_backup imports 15+ systems** | `src/scenes/FishingScene_backup.js` | The backup references Inventory, EnergySystem, ShopSystem, QuestSystem, FishEncyclopedia, SaveSystem, PerformanceMonitor, ObjectPool, AudioManager, AchievementSystem, NotificationSystem, PlayerAnalytics — none of which are instantiated in the live FishingScene |

### 2.2 Separation of Concerns Violations

| Issue | Location | Details |
|-------|----------|---------|
| **UIScene is 40.3 KB / ~1200 lines** | `src/scenes/UIScene.js` | Monolithic file mixing: HUD rendering, inventory panel, shop panel, quest panel, settings panel, achievement panel, debug panel, and keyboard shortcut handling. Should be split into sub-components |
| **FishingSystem contains minigame UI creation** | `src/systems/FishingSystem.js` (27.8 KB) | Creates Phaser game objects (minigame bar, target, pointer, panel) — blurs the line between system logic and view rendering |
| **BootScene is 19 KB with 7 animation-creation methods** | `src/scenes/BootScene.js` | Mixing asset loading (preload) with animation definitions (create). Animation definitions could live in a separate registry |
| **FishingScene directly creates game objects AND manages systems** | `src/scenes/FishingScene.js` | Scene creates terrain, water, buildings, NPCs, animals — these could be delegated to factory functions or separate managers |
| **NotificationSystem creates Phaser containers** | `src/systems/NotificationSystem.js` | System layer shouldn't directly create Phaser display objects. Should emit events for UIScene to render |

### 2.3 Coupling Issues

| Coupling | Details |
|----------|---------|
| **FishingScene ↔ FishingSystem** | FishingSystem receives `scene` reference and directly creates sprites on it. Tight bidirectional dependency |
| **QuestManager is a global singleton via `window.questManager`** | `main.js` sets `window.questManager = questManager`, breaking module encapsulation |
| **NPC.js reads from `gameState` directly** | NPC constructor uses `gameState` global singleton for dialog state |
| **NotificationSystem accesses `this.scene.gameState` and `this.scene.weatherSystem`** | Cross-cuts scene and multiple systems |
| **PerformanceMonitor mutates `game.config`** | `applyQualitySettings()` sets `game.config.particleCount`, `game.config.shadows`, `game.config.antialias` — these aren't standard Phaser config properties and have no effect |
| **PlayerAnalytics stores `scene` reference** | Stores full scene reference for accessing `weatherSystem` — should receive data via events |
| **DiveScene and MineScene use `'idle_body_light'` hardcoded** | Diver/miner sprites use a character texture key directly instead of going through Player entity |

### 2.4 Excessive Complexity

| File | Lines | Issues |
|------|-------|--------|
| **UIScene.js** | ~1200 | God object. Handles 8+ UI panels, debug overlay, shortcuts, achievements display |
| **FishingSystem.js** | ~900 | State machine with 6+ states, minigame physics, audio integration, adaptive difficulty — all in one class |
| **BootScene_original.js** | ~500 | Minified single-line format. Unreadable, should be deleted |
| **Player.js** | ~600 | 5 state classes + Player class. States are inline subclasses making the file hard to navigate |

---

## Phase 3 — Code Quality & Redundancy Analysis

### 3.1 Duplicate Code

| Duplication | Location A | Location B | Details |
|-------------|-----------|-----------|---------|
| **Quest logic entirely duplicated** | `src/quests/QuestManager.js` | `src/systems/QuestSystem.js` | Both have `acceptQuest()`, `onFishCaught()`, `completeQuest()`, `getActiveQuests()`, `serialize()`. QuestManager is a singleton loaded from JSON; QuestSystem has hardcoded default quests. Both are functional, neither is fully integrated |
| **Quest progress update logic** | `QuestManager.updateQuestProgress()` | `QuestSystem.onFishCaught()` | Nearly identical switch/case for `catch_count`, `catch_specific`, `catch_rarity`, `catch_weight`, `earn_gold`, `unique_species` |
| **Rarity ordering** | `QuestManager` (line ~88) | `QuestSystem` (line ~78) | Both define `rarityOrder = { common: 0, uncommon: 1, rare: 2, ... }`. QuestManager includes 'epic' and 'legendary'; QuestSystem stops at 'legendary' without 'epic' |
| **WASD input setup** | `FishingScene.js`, `DiveScene.js`, `MineScene.js`, `GameScene.js` | All 4 scenes | Identical cursor + WASD key setup boilerplate |
| **Movement velocity logic** | `DiveScene.update()`, `MineScene.update()`, `GameScene.update()` | All 3 scenes | Same pattern: check cursors/WASD → set velocity. No shared input handler |
| **Fish shadow spawning** | `FishingScene.updateFishShadows()` | `FishManager.spawnFishShadows()` | FishingScene has its own inline fish shadow system; FishManager has a pooled version. **Both run simultaneously** |
| **Texture validation checks** | `NPC.js`, `Player.js`, `BootScene.js` | Multiple locations | `TextureValidator.js` was created to centralize this, but NPC and Player still have inline `this.scene.textures.exists()` checks |
| **ShopSystem items vs Constants** | `ShopSystem.items` | `Constants.js` (BAIT, RODS) | Shop items duplicate data already in Constants |
| **getDefaultQuests() in QuestSystem** | `QuestSystem.getDefaultQuests()` | `data/quests.json` | QuestSystem hardcodes 10 quests; quests.json has separate definitions. QuestManager uses JSON, QuestSystem uses hardcoded |

### 3.2 Unused Imports & Dead Code

| Type | File | Details |
|------|------|---------|
| **Unused import** | `FishingScene_backup.js` | Imports 15+ systems that are never used (file is dead code) |
| **Unused export** | `GameScene.js` | Exported but never imported by `main.js` |
| **Unused class** | `ParticlePool` (ObjectPool.js) | Defined but never instantiated anywhere in the codebase |
| **Unused class** | `SpritePool` (ObjectPool.js) | Defined but never instantiated |
| **Unused system** | `ShopSystem.js` | Only imported in FishingScene_backup.js (dead code). Not used in live FishingScene |
| **Unused system** | `QuestSystem.js` | Not imported by FishingScene or main.js. Superseded by QuestManager |
| **Unused system** | `EnergySystem.js` | Imported only in FishingScene_backup.js. Not used in live game |
| **Unused system** | `PerformanceMonitor.js` | Not imported in FishingScene. Only referenced in backup |
| **Unused system** | `PlayerAnalytics.js` | Not imported in FishingScene. Only referenced in backup |
| **Unused system** | `NotificationSystem.js` | Not imported in FishingScene. Only referenced in backup |
| **Unused system** | `AchievementSystem.js` | Not imported in FishingScene. Only referenced in backup |
| **Unused constant groups** | `Constants.js` | `SHORTCUTS`, `CAMERA`, `PERFORMANCE`, `KEYS` — only used in UIScene or backup code |
| **Dead method** | `MineScene.updateLighting()` | Creates a NEW Graphics object every frame (`this.add.graphics()`) — massive memory leak, never cleans up |
| **Dead property** | `PerformanceMonitor.lowFpsThreshold` | Declared twice in constructor: once as `30` (line 12), then overwritten as `3` (line 19) |

### 3.3 Orphaned Files

| File | Status | Action |
|------|--------|--------|
| `src/scenes/BootScene_original.js` | Minified backup, never imported | Delete |
| `src/scenes/FishingScene_backup.js` | Old scene file, never imported by main.js | Delete |
| `src/scenes/GameScene.js` | Superseded placeholder, not in main.js scene list | Delete or archive |
| `src/systems/QuestSystem.js` | Superseded by QuestManager.js | Consolidate or delete |

---

## Phase 4 — UI/UX Debugging & Layout Verification

### 4.1 Broken UI Components

| Issue | Location | Details |
|-------|----------|---------|
| **UIScene never receives quest events** | `UIScene.js` | Listens for `EVENTS.QUEST_*` events, but FishingScene uses `questManager` which emits string events like `'quest:accepted'`, not the Constants-based event names |
| **Shop panel has no data source** | `UIScene.js` | Shop rendering code exists but no `ShopSystem` is connected to the live FishingScene |
| **NotificationSystem never instantiates** | `UIScene.js` imports `NotificationSystem` | But it's only used in FishingScene_backup. Live game has no notification toasts |
| **Achievement panel is disconnected** | `UIScene.js` | Has achievement rendering code but `AchievementSystem` is never created in the active scene |
| **Settings panel toggles have no effect on gameplay** | `UIScene.js` + `SettingsManager.js` | Settings like `particleEffects`, `weatherEffects`, `reflections` are saved but never checked by rendering code |
| **Colorblind filter references non-existent SVG filters** | `SettingsManager.applyColorblindFilter()` | Sets `document.documentElement.style.filter = 'url(#deuteranopia-filter)'` but no SVG filter definitions exist in index.html |

### 4.2 Layout Issues

| Issue | Location | Details |
|-------|----------|---------|
| **Hardcoded 1280×640 resolution** | `Constants.js` GAME.WIDTH/HEIGHT | No responsive scaling. On different screen sizes, the game is either cropped or letterboxed without adaptation |
| **Safe zone defined but not used** | `Constants.js` SAFE_ZONE | Top 40px safe zone for Play.fun widget is defined but never applied to any UI positioning |
| **UIScene notification positioning** | `NotificationSystem.js` | Notifications positioned at `W / 2` center — can overlap with gameplay. No collision detection with other UI elements |
| **MineScene lighting creates Graphics every frame** | `MineScene.updateLighting()` | Calls `this.add.graphics()` in `update()` loop — creates thousands of orphaned Graphics objects, causing memory leak and eventual crash |
| **DiveScene creates text every oxygen update** | `DiveScene.updateOxygenBar()` | Calls `this.add.text()` every time oxygen changes, stacking text objects on top of each other without destroying old ones |

### 4.3 Accessibility Issues

| Issue | Details |
|-------|---------|
| **No keyboard navigation for UI panels** | UIScene panels can be opened but not navigated with keyboard alone |
| **No screen reader support** | Canvas-based game with no ARIA labels or alternative text |
| **Colorblind mode is non-functional** | References missing SVG filters |
| **High contrast mode does nothing meaningful** | Adds CSS class to body, but Phaser renders to canvas — CSS class has no visual effect on game |
| **No text scaling** | All font sizes are hardcoded pixel values |

### 4.4 Interactive Element Issues

| Element | Issue |
|---------|-------|
| **E key interaction** | `FishingScene.handleInteraction()` checks NPCs and buildings, but NPC.interact() has no visible effect (no dialog box appears in live code) |
| **Building entry** | `enterBuilding()` emits events (`openShop`, `openStorage`) that no system listens to |
| **Map scene** | MapScene shows locations but none are clickable — just decorative dots with pulse animations |
| **Dive/Mine/Farm scenes** | All use `scene.switch('FishingScene')` to return, but there's no way to enter them from FishingScene |

---

## Phase 5 — Performance Bottleneck Analysis

### 5.1 Main Thread Heavy Computations

| Bottleneck | File | Impact |
|------------|------|--------|
| **MineScene creates Graphics per frame** | `MineScene.updateLighting()` | **CRITICAL**: `this.add.graphics()` in update loop = thousands of new objects per second. Will crash the game within minutes |
| **DiveScene creates Text per oxygen tick** | `DiveScene.updateOxygenBar()` | `this.add.text()` called every second without destroying previous text. Memory leak |
| **Fish shadow double-spawning** | `FishingScene.updateFishShadows()` + `FishManager` | Both create fish shadows independently. FishingScene uses raw sprites (no pooling), FishManager uses pooling. Wasted CPU + memory |
| **BootScene loads 880+ spritesheets** | `BootScene.preload()` | 8 hair styles × 10 colors × 2 (walk+idle) = 160 hair spritesheets alone. Total character assets: ~300+ spritesheets. Most are never used in gameplay |
| **UIScene creates all panels on boot** | `UIScene.create()` | All 8+ panels (inventory, shop, quests, achievements, settings, debug, stats, map) are created at startup regardless of visibility |

### 5.2 Asset & Bundle Analysis

| Issue | Details |
|-------|--------|
| **Phaser is 1MB+ unsplit** | Vite config has `manualChunks: { phaser: ['phaser'] }` — good, but Phaser still loads fully even if only a subset is used |
| **No lazy loading for scene assets** | BootScene loads everything upfront (all character variants, all buildings, all animals, all effects) |
| **300+ character texture variants** | 8 hair × 10 colors × 2 (walk+idle) = 160 hair alone, plus body × 3, pants × 11, shirt × 11 = 300+ textures. Only a handful are ever used per session |
| **No texture atlas** | Each clothing variant is a separate PNG. A texture atlas would reduce draw calls significantly |
| **Action animations (catch/reel/throw/pull) use body fallback** | `BootScene_original.js` loads `catch_body_${skin}` but maps pants/shirt to same body texture — loading duplicate data |

### 5.3 Caching & Optimization Opportunities

| Opportunity | Current State | Improvement |
|-------------|--------------|-------------|
| **Fish shadow pooling** | FishManager has pooling, FishingScene doesn't use it | Remove inline `updateFishShadows()` from FishingScene, use FishManager instead |
| **Lazy panel creation** | All UIScene panels created at boot | Create panels on first open, cache after that |
| **Sprite batching for terrain** | Individual `add.image()` calls for grass/sand tiles | Use Phaser TileSprite or single large Graphics fill |
| **DayNightSystem alpha overlay** | Full-screen rectangle with alpha tween every frame | Use a single Graphics object, update fill style only when phase changes |
| **PlayerAnalytics localStorage** | Saves on every session end | Fine, but `recordMovement()` could throttle more aggressively |
| **PerformanceMonitor.applyQualitySettings** | Writes to `game.config` which has no effect | Should actually adjust particle counts, shadow visibility, etc. via scene references |

---

## Phase 6 — Broken Code & File Integrity Check

### 6.1 Syntax & Runtime Errors

| Error | File | Details |
|-------|------|---------|
| **Duplicate texture key load** | `BootScene_original.js` | Loads `fish_shadow_medium` and `fish_shadow_large` twice — once from `fish_shadow/` path and again from `shadow/` path. Phaser will warn and use first load |
| **PerformanceMonitor.lowFpsThreshold overwritten** | `PerformanceMonitor.js` constructor | Set to `30` on line 12, then overwritten to `3` on line 19. The second value (`3`) is wrong for an FPS threshold — it means "3 FPS is low" which is nonsensical. First value should be kept |
| **MineScene.updateLighting memory leak** | `MineScene.js` | Creates new `Graphics` object every frame without destroying previous. Will cause out-of-memory crash |
| **DiveScene.updateOxygenBar text leak** | `DiveScene.js` | `this.add.text()` called in update without destroying old text objects |
| **FishingScene references `this.player.x/y`** | `FishingScene.handleInteraction()` | Player entity wraps position in a container. `this.player.x` may not reflect actual world position (should be `this.player.container.x`) |

### 6.2 Broken Imports & Missing Dependencies

| Issue | File | Details |
|-------|------|---------|
| **FishingScene_backup imports non-existent constants** | `FishingScene_backup.js` | Imports `PERFORMANCE`, `KEYS`, `SHORTCUTS`, `CAMERA` from Constants — these exist but are never used in the file |
| **GameScene uses old texture keys** | `GameScene.js` | Uses `walk_body`, `walk_pants`, `walk_shirt`, `walk_hair` — these keys don't exist in BootScene (which uses `walk_body_light`, `walk_pants_brown`, etc.) |
| **GameScene references undefined animations** | `GameScene.js` | Uses `walk_${facing}` and `idle_${facing}` — BootScene only creates `walk_light_${facing}` and `idle_light_${facing}` (with aliases for light skin only) |
| **DiveScene references non-existent textures** | `DiveScene.js` | `createMarineLife()` tries `fish_clown_fish`, `fish_butterfly_fish`, `fish_neon_tetras`, `fish_sea_horse` — these textures are never loaded by BootScene |
| **MineScene references non-existent textures** | `MineScene.js` | Uses `idle_body_light` as miner sprite — this is a spritesheet key, not a single image. Won't render correctly |
| **FarmScene references textures by wrong keys** | `FarmScene.js` | Uses `'chicken'` and `'cow'` — these exist in BootScene, but `'barn'` and `'greenhouse'` need exact file paths that may not match |

### 6.3 Circular Dependencies

No circular dependency chains detected. Import graph is largely one-directional:
- Scenes → Entities, Systems, Core
- Systems → Core (Constants, EventBus, GameState)
- Entities → Core (Constants, EventBus, GameState, StateMachine)
- Core has no upward dependencies ✓

### 6.4 Incomplete Implementations

| Component | Status | Details |
|-----------|--------|---------|
| **DiveScene** | Stub | No actual diving mechanics. Oxygen depletes but there's no real gameplay. Treasure collection is trivial. Marine life textures don't load |
| **FarmScene** | Stub | Creates grass, buildings, animals but has no crop system, no interaction, no farming mechanics. `update()` is empty |
| **MineScene** | Broken | Lighting system causes memory leak. Ore mining works but falling rocks never despawn properly. No tool upgrade system |
| **MapScene** | Decorative only | Shows location markers with no interactivity. Can't click to travel |
| **ShopSystem** | Disconnected | Full buy/sell logic exists but isn't wired to any scene |
| **EnergySystem** | Disconnected | Complete energy system but never consumed by any action in the live game |
| **AchievementSystem** | Disconnected | 50+ achievements defined but never tracks or unlocks in live game |
| **NotificationSystem** | Disconnected | Full toast system but never instantiated |
| **PlayerAnalytics** | Disconnected | Complete analytics engine but never records data in live game |
| **PerformanceMonitor** | Disconnected | Auto-quality adjustment defined but quality changes have no effect |

---

## Phase 7 — Comprehensive Recommendations Report

### CRITICAL (Must Fix)

| # | Category | Issue | Impact | Solution |
|---|----------|-------|--------|----------|
| C1 | Code Integrity | **MineScene.updateLighting() memory leak** | Game will crash from OOM within minutes of entering MineScene | Replace `this.add.graphics()` per-frame with a single persistent Graphics object: create in `createCaveEnvironment()`, clear + redraw in `updateLighting()` |
| C2 | Code Integrity | **DiveScene.updateOxygenBar() text leak** | Stacking text objects every second causes memory leak | Store text reference in `createUI()`, call `setText()` in update. Remove the `this.add.text()` call from update |
| C3 | Performance | **Dual fish shadow spawning** | FishingScene.updateFishShadows() AND FishManager both create fish shadows — double CPU, double memory | Remove `updateFishShadows()` and `this.fishShadows` from FishingScene. Use FishManager exclusively (already instantiated but its spawn method is never called from FishingScene) |
| C4 | Code Integrity | **GameScene uses non-existent texture keys** | GameScene would crash with texture-not-found errors if ever loaded | Delete GameScene.js (superseded by FishingScene). Or update texture keys to match BootScene naming |
| C5 | Architecture | **DiveScene references unloaded textures** | `fish_clown_fish`, etc. don't exist — marine life silently fails to render | Add missing fish textures to BootScene, or remove marine life creation until assets exist |

### HIGH PRIORITY (Significant Impact)

| # | Category | Issue | Impact | Solution |
|---|----------|-------|--------|----------|
| H1 | Architecture | **Two quest systems (QuestManager + QuestSystem)** | Confusion about which system is authoritative. Divergent quest definitions. Duplicate code | Consolidate: keep QuestManager (singleton, JSON-driven), delete QuestSystem.js. Ensure FishingScene imports and uses QuestManager for quest events |
| H2 | Code Quality | **8+ systems disconnected from live game** | ShopSystem, EnergySystem, AchievementSystem, NotificationSystem, PlayerAnalytics, PerformanceMonitor, QuestSystem, Inventory — all exist but are only referenced in FishingScene_backup.js | Incrementally wire each system into FishingScene.create() in order of gameplay priority: 1) Inventory, 2) ShopSystem, 3) EnergySystem, 4) AchievementSystem, 5) NotificationSystem, 6) PerformanceMonitor |
| H3 | Code Quality | **Backup files shipping in production bundle** | BootScene_original.js (16.5 KB minified), FishingScene_backup.js (1.6 KB), GameScene.js (5.9 KB) — all compiled by Vite but never used | Move to `src/_archive/` or delete entirely. Add Vite exclude pattern if keeping for reference |
| H4 | UI/UX | **UIScene event name mismatch** | Quest-related UI panels never update because QuestManager emits `'quest:completed'` while UIScene listens for `EVENTS.QUEST_COMPLETED` | Map QuestManager string events to Constants-based events in QuestManager, or update UIScene to listen on the same string events |
| H5 | Code Quality | **PerformanceMonitor.lowFpsThreshold bug** | Value `3` (line 19) overwrites `30` (line 12). Auto-quality adjustment triggers at 3 FPS instead of 30 FPS | Remove the second declaration on line 19, or rename to `consecutiveLowFpsThreshold` |
| H6 | Architecture | **window.questManager global** | Breaks module encapsulation, potential naming collision | Import questManager directly where needed (ES modules handles this) |
| H7 | Performance | **BootScene loads 300+ character textures** | Most never used in a session. Increases load time and memory significantly | Implement lazy loading: load only the active player's skin/clothing combo + NPC combos. Load others on demand |
| H8 | Code Integrity | **SettingsManager colorblind filters non-functional** | `url(#deuteranopia-filter)` references SVG filters that don't exist in index.html | Add SVG filter definitions to index.html, or implement colorblindness via Phaser pipeline/postFX |
| H9 | Performance | **PerformanceMonitor.applyQualitySettings has no effect** | Writes to `game.config.*` which doesn't affect running Phaser instance | Replace with actual system adjustments: reduce FishManager.maxShadows, toggle WeatherSystem particles, reduce shadow count |

### MEDIUM PRIORITY (Notable Improvement)

| # | Category | Issue | Impact | Solution |
|---|----------|-------|--------|----------|
| M1 | Code Quality | **UIScene is 1200-line monolith** | Hard to maintain, hard to test, high cognitive load | Split into: `UIPanels/HUD.js`, `UIPanels/InventoryPanel.js`, `UIPanels/QuestPanel.js`, `UIPanels/SettingsPanel.js`, `UIPanels/ShopPanel.js`, `UIPanels/AchievementPanel.js` |
| M2 | Code Quality | **FishingSystem mixes logic and view** | 27.8 KB file creates Phaser sprites (minigame UI) alongside fishing state machine | Extract minigame rendering into `MinigameUI.js` component. FishingSystem manages state, emits events for view updates |
| M3 | Architecture | **WASD input boilerplate duplicated in 4 scenes** | Same 10-line setup repeated verbatim | Create `src/utils/InputManager.js` that sets up cursors + WASD + returns input state object |
| M4 | Code Quality | **No linter or formatter configured** | Inconsistent style, no static analysis, easy to introduce bugs | Add ESLint + Prettier or Biome. Configure for ES modules + Phaser globals |
| M5 | Code Quality | **Rarity ordering duplicated in quest files** | If a new rarity tier is added, both files need updating | Define `RARITY_ORDER` in Constants.js, import in both QuestManager and any system that needs it |
| M6 | Architecture | **NotificationSystem creates Phaser objects** | System layer shouldn't own view rendering | Emit notification events; let UIScene handle display. Or create a `NotificationUI` component |
| M7 | UI/UX | **Safe zone defined but unused** | Play.fun widget overlay could obscure UI | Apply `SAFE_ZONE.TOP` offset to all UIScene top-edge elements |
| M8 | Performance | **No texture atlases** | Individual PNGs = more draw calls, slower rendering | Combine related sprites (all bobber variants, all fish shadows, all animal frames) into texture atlases |
| M9 | Code Quality | **ShopSystem items duplicate Constants data** | BAIT and RODS defined in Constants, then again in ShopSystem | ShopSystem should reference Constants values, not redefine them |
| M10 | Architecture | **DiveScene/MineScene use raw sprites instead of Player entity** | Diver/miner don't have layered clothing, state machine, or proper animation | Refactor to use Player entity with `diving`/`mining` states (Player already supports `diving` and `farming` states) |

### OPTIONAL ENHANCEMENTS

| # | Category | Issue | Impact | Solution |
|---|----------|-------|--------|----------|
| O1 | Performance | **Lazy-load scene assets** | BootScene loads everything at start, slow initial load | Use Phaser's `scene.load` in each scene's `preload()` for scene-specific assets |
| O2 | Architecture | **TypeScript migration** | No type safety, easy to introduce runtime type errors | Incrementally add JSDoc types → then migrate to `.ts` with `allowJs: true` |
| O3 | Performance | **Lazy UIScene panel creation** | All 8+ panels created at boot | Create panels on first open, destroy when closed (or cache) |
| O4 | UI/UX | **No way to enter Dive/Mine/Farm from FishingScene** | Stub scenes exist but are unreachable | Add dock/pier/cave NPCs or interaction zones that `scene.switch()` to these scenes |
| O5 | Code Quality | **No unit tests** | `test` script points to `tests/unit-test.js` but no test files found | Add tests for: StateMachine, EventBus, QuestManager, Inventory, FishEncyclopedia, EnergySystem |
| O6 | Performance | **Vite server port mismatch** | `vite.config.js` sets port 3001, but HEARTBEAT.md says http://localhost:3000 | Align port configuration |
| O7 | Architecture | **GameState is mutable global singleton** | Any code can modify state from anywhere | Consider immutable state patterns or at least add change event emission on mutation |
| O8 | Code Quality | **Player state classes are inline in Player.js** | 5 State subclasses in one file | Move each state to `src/entities/states/IdleState.js`, etc. |
| O9 | UI/UX | **No responsive design** | Fixed 1280×640 doesn't adapt to screen | Add Phaser Scale Manager with `RESIZE` or `FIT` mode |
| O10 | Architecture | **ErrorBoundary.js (8.4 KB) barely used** | Only imported in FishingScene_backup.js | Wire ErrorBoundary into active FishingScene's create/update lifecycle |

---

## Summary Statistics

| Metric | Value |
|--------|-------|
| Total source files | 37 |
| Total source size | ~310 KB |
| Active systems (connected to live game) | 7 of 17 (FishingSystem, WeatherSystem, DayNightSystem, FishManager, EventBus, GameState, SettingsManager) |
| Disconnected systems (backup-only) | 10 (ShopSystem, QuestSystem, EnergySystem, AchievementSystem, NotificationSystem, PlayerAnalytics, PerformanceMonitor, Inventory, SaveSystem, AudioManager) |
| Orphaned/dead files | 4 (BootScene_original.js, FishingScene_backup.js, GameScene.js, QuestSystem.js) |
| Critical bugs | 5 (memory leaks ×2, double spawning, broken textures ×2) |
| High priority issues | 9 |
| Medium priority issues | 10 |
| Optional enhancements | 10 |
| Duplicate code instances | 9 |
| Broken UI components | 6 |

### Priority Fix Order

1. **C1 + C2** — Memory leaks in MineScene and DiveScene (will crash game)
2. **C3** — Dual fish shadow spawning (wasted resources)
3. **C4 + C5** — Broken texture references (crashes if scenes are accessed)
4. **H1** — Consolidate quest systems (architectural clarity)
5. **H3** — Remove dead files (reduces bundle size ~24 KB)
6. **H2** — Wire disconnected systems (gameplay depth)
7. **H4** — Fix event name mismatch (UI actually updates)
8. **H5** — Fix PerformanceMonitor threshold bug
9. **Remaining H/M/O items** — In order of gameplay impact

---

*End of audit report. No code changes were made during this assessment.*
