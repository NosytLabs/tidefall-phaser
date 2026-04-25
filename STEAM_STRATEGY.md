# Tidefall Steam Strategy — Competitive Analysis & Roadmap
**Generated:** 2026-04-24
**Target:** Steam release for Tidefall

---

## 1. COMPETITIVE LANDSCAPE

| Game | Price | Reviews | Core Hook | What They Have We Don't |
|------|-------|---------|-----------|------------------------|
| **Fishing Corner** | TBD | N/A (unreleased) | Corner-of-screen idle fishing while you work | Desktop widget mode, world map |
| **Rusty's Retirement** | $8.99 CAD | 14,465 (Overwhelmingly Positive) | Bottom-of-screen idle farming while you work | Twitch integration, automation/robots, biofuel economy, vertical mode |
| **Fishing Inc** | $6.49 CAD | 477 (Very Positive) | Clicker/incremental fishing | 17 achievements, 8 languages, clicker depth |
| **Cast n Chill** | $6.49 CAD | TBD | Relaxing fishing, 16 locations | 50+ fish, co-op multiplayer, dog companion, legendary system, 2nd monitor mode |

### Key Market Insight
The "bottom-of-screen idle" genre (Rusty's Retirement, Fishing Corner) has massive traction. This is a proven Steam niche.

---

## 2. TIDEFALL CURRENT STATE

### What's Implemented ✅
- 44 fish species across 3 biomes (river/lake/sea)
- Fishing minigame with casting, reeling, pulling
- Day/night cycle with time-based rarity multipliers
- Boat system (8 boats on the water)
- Farm scene (animals: chickens, cows, pigs)
- Dive scene (underwater exploration, oxygen system)
- Mine scene (ore mining, darkness/lighting)
- Quest system (12 quests)
- Inventory system
- Shop/economy
- Skill progression
- Weather system
- Performance monitoring

### What's Missing vs Competitors ❌

| Feature | Cast n Chill | Rusty's | Fishing Inc | Tidefall Status |
|---------|-------------|---------|-------------|-----------------|
| 50+ fish species | ✅ 50+ | N/A | ✅ Many | ❌ 44 — need 6+ more |
| Co-op multiplayer | ✅ | ❌ | ❌ | ❌ Not started |
| Pet companion | ✅ Dog | ❌ | ❌ | ❌ Not started |
| Desktop/corner mode | ✅ 2nd monitor | ✅ Bottom screen | ❌ | ❌ Not started |
| Achievements | ✅ | ✅ 71 | ✅ 17 | ❌ None |
| Steam integration | ✅ | ✅ | ✅ | ❌ Not started |
| Twitch integration | ❌ | ✅ | ❌ | ❌ Not started |
| Legendary system | ✅ 16 legendaries | ❌ | ❌ | ✅ Partial (legendary rarity exists) |
| Multiple locations | ✅ 16 spots | N/A | ✅ | ❌ Only 1 scene |
| Automation/robots | ❌ | ✅ | ❌ | ❌ Not started |
| Languages | ✅ | ✅ 11 | ✅ 8 | ❌ English only |
| Character customization | ❌ | ❌ | ❌ | ⚠️ Assets exist, not wired |

---

## 3. SMALLBURG ASSET UTILIZATION REPORT

### Assets We Own But DON'T Use (WASTED)

**Character System (MASSIVE waste):**
- 8 hairstyles × 10 colors = 80 hair sprites
- 10 pants colors = 10 pants sprites  
- 10 shirt colors = 10 shirt sprites
- 3 body types (light/brown/dark)
- Animations: idle, walk, throw, reel, pull, catch
- **STATUS:** Only basic player sprite used. Could add full character creator.

**Fish Species Gap:**
Smallburg Fishing Pack includes 50+ fish. We only have 44 in fish.json.
Missing common pack fish: NEED TO INVENTORY

**Buildings:**
- barn, chicken_coop, fish_market, grain_silo, greenhouse
- **STATUS:** Some placed, not interactive

**Mine System:**
- 11 ores, 8 crystals, mine cart + tracks
- **STATUS:** Basic mining exists, but NO mine cart system, NO crystals

**Dungeon Pack:**
- Full dungeon tiles, 3 enemy types (skeleton, bat, slime)
- **STATUS:** DungeonScene doesn't exist

**UI Pack:**
- skill bars, health bars, inventory grids, icons
- **STATUS:** Custom UI used instead of Smallburg UI

**Boats:**
- 3 boat types with 8-direction sprites + layered sprites (back/front)
- **STATUS:** Boats exist but are static decorations, not driveable

---

## 4. STEAM POSITIONING STRATEGY

### Recommended Positioning
**"Tidefall — The most fish you'll ever catch in a pixel village"**

Key differentiators against each competitor:
- vs **Rusty's:** We're fishing-focused, not farming. We have 44 fish species vs crops.
- vs **Fishing Inc:** We're cozy/pixel art, not clicker. We have exploration.
- vs **Cast n Chill:** We have village building + farming + mining + diving, not just fishing.
- vs **Fishing Corner:** We're a full game, not a widget.

### Unique Selling Points (USPs)
1. **Multi-activity fishing RPG** — fish, farm, mine, dive in one cozy world
2. **44 hand-animated fish species** in pixel art
3. **Exploration layers** — surface fishing + underwater diving + cave mining
4. **Village progression** — build up your fishing town
5. **Smallburg pixel art** — recognizable, consistent 16x16 style

---

## 5. PRIORITY ROADMAP TO STEAM

### Phase 1: Must-Have (Steam Requirement)
- [ ] Steam SDK integration (achievements, leaderboards)
- [ ] 6+ more fish species to hit 50+ (matches competitors)
- [ ] Steam store page + trailer
- [ ] Achievements system (target: 20+)
- [ ] Settings menu (audio, graphics, controls)
- [ ] Save/load system verification

### Phase 2: Competitive Parity
- [ ] Driveable boats (use Smallburg 8-dir boat sprites)
- [ ] Character customization (wire up existing Smallburg assets)
- [ ] Legendary fish hunt system (like Cast n Chill)
- [ ] Multiple fishing locations (not just one scene)
- [ ] Pet companion (dog/cat from Smallburg animals)

### Phase 3: Differentiation
- [ ] Twitch integration (follow Rusty's model)
- [ ] Desktop/corner mode (follow Rusty's model)
- [ ] Co-op multiplayer (biggest gap vs Cast n Chill)
- [ ] Mine cart system (use Smallburg tracks/sprites)
- [ ] Dungeon scene (use Smallburg dungeon pack)

### Phase 4: Polish
- [ ] Localization (8+ languages, use Steam's model)
- [ ] Controller support
- [ ] Cloud saves
- [ ] Trading cards

---

## 6. IMMEDIATE ACTION ITEMS

| # | Task | Estimated Time | Priority |
|---|------|----------------|----------|
| 1 | Add 6+ fish to hit 50 species | 2 hours | 🔥 Critical |
| 2 | Wire character customization | 4 hours | 🔥 Critical |
| 3 | Make boats driveable | 3 hours | High |
| 4 | Add achievement system | 4 hours | High |
| 5 | Add settings menu | 3 hours | High |
| 6 | Steam SDK wrapper | 6 hours | 🔥 Critical |
| 7 | Create Steam store page assets | 8 hours | High |
| 8 | Trailer recording | 4 hours | Medium |

---

## 7. TECHNICAL NOTES

- Game built on Phaser 3.85 + Vite 6.3 — web-first, Electron wrapper for Steam
- Smallburg assets are PAID/licensed — good for commercial Steam release
- Current resolution: 1920×1080 — good for desktop
- No save encryption — Steam cloud saves need file-based saves
- No analytics — should add Steam's analytics or similar

---

*Next: I'll start implementing the critical tasks. Which should we tackle first?*
