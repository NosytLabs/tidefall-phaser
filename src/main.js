import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { FishingScene } from './scenes/FishingScene.js';
import { UISceneV2 } from './scenes/UISceneV2.js';
import { DiveScene } from './scenes/DiveScene.js';
import { MineScene } from './scenes/MineScene.js';
import { FarmScene } from './scenes/FarmScene.js';
import { GAME } from './core/Constants.js';

// FishingScene still contains a legacy debug FPS text object in its create()
// path. It is not part of the production HUD and, under headless Chromium,
// updating that destroyed Phaser Text object can hit a null canvas context.
// Remove the legacy object immediately after scene creation; production HUD
// owns all telemetry now.
const createFishingScene = FishingScene.prototype.create;
FishingScene.prototype.create = function (...args) {
  createFishingScene.apply(this, args);
  if (this.fpsText) {
    this.fpsText.destroy();
    this.fpsText = null;
  }
};

const config = {
  type: Phaser.WEBGL,
  parent: 'game-container',
  width: GAME.VIEW_WIDTH,
  height: GAME.HEIGHT,
  pixelArt: false,
  smoothPixelArt: true,
  backgroundColor: GAME.BACKGROUND_COLOR,
  roundPixels: false,
  antialias: true,
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false, fps: 60 }
  },
  render: { smoothPixelArt: true, antialias: true, batchSize: 2048 },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    autoRound: false
  },
  scene: [BootScene, FishingScene, UISceneV2, DiveScene, MineScene, FarmScene]
};

const game = new Phaser.Game(config);
window.__game = game;

const loading = document.getElementById('loading');
if (loading) loading.style.display = 'none';

document.addEventListener('visibilitychange', () => {
  game.scene.scenes.forEach(scene => {
    if (document.hidden && scene.scene.isActive()) scene.scene.pause();
    if (!document.hidden && scene.scene.isPaused()) scene.scene.resume();
  });
});
