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
**Status:** In Progress
