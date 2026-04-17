# Project Operations - Tidefall Phaser

## Build Commands
npm run dev      # Development server (port 3000/3001)
npm run build     # Production build
npm run preview   # Preview production build

## Validation
- Game loads without console errors
- Player can move (WASD/Arrows)
- Fishing works (SPACE to cast)
- No broken imports or syntax errors

## Operational Notes
- Phaser 3.85.0 - pixel art game engine
- Vite 6.3.0 - build tool
- Port auto-increments if 3000 in use
- Game exposed as window.__game for debugging

## File Structure
src/
  core/         # EventBus, GameState, Constants, ErrorBoundary
  entities/     # Player, NPC, Boat
  scenes/       # BootScene, FishingScene, UIScene, FarmScene, DiveScene, MineScene
  systems/      # 18 game systems
  main.js       # Entry point

## Critical Files
- src/scenes/FishingScene.js (1600+ lines - needs refactoring)
- src/core/ErrorBoundary.js (error handling)
- src/main.js (game initialization)
