# Ralph: Fix Tidefall Game Rendering

## Current Status
Game renders but NPCs lack clothing, forest glitched, boat passengers broken.

## Issues Identified
1. NPC clothing textures not loading (colors mismatch)
2. Forest background showing circles instead of trees
3. Boat passengers not rendering

## Iteration 1 - Fix NPC Clothing
**File:** `src/scenes/BootScene.js`
**What:** Load ALL clothing colors that NPCs use (not just subset)
**Validate:** Screenshot shows NPCs with full clothing
**Status:** ✅ Complete - Committed d22738e
**Result:** NPCs now have clothing! Forest fixed too!

## Iteration 2 - Fix NPC Scale
**File:** `src/entities/NPC.js`
**What:** Increase NPC sprite scale from 2.0 to 3.0 for visibility
**Validate:** NPCs are clearly visible, not tiny dots
**Status:** In Progress
