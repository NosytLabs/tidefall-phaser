import { GAME, FISHING, TIME, RODS } from '../src/core/Constants.js';
import gameState from '../src/core/GameState.js';

const checks = [
  ['viewport', GAME.VIEW_WIDTH === 480 && GAME.HEIGHT === 270],
  ['world width', GAME.WIDTH >= GAME.VIEW_WIDTH],
  ['fishing wait range', FISHING.WAIT_MIN_TIME < FISHING.WAIT_MAX_TIME],
  ['time phases', TIME.PHASES.length === 4],
  ['rods', Object.keys(RODS).length >= 3],
  ['state reset', gameState.player.energy === 100 && gameState.game.totalCaught === 0],
];

for (const [name, ok] of checks) {
  if (!ok) {
    console.error(`FAIL: ${name}`);
    process.exit(1);
  }
}

console.log(`Tidefall unit checks passed (${checks.length}).`);
