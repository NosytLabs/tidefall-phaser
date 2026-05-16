import Phaser from 'phaser';
import { BootScene }    from './scenes/BootScene.js';
import { FishingScene } from './scenes/FishingScene.js';
import { UIScene }      from './scenes/UIScene.js';
import { DiveScene }    from './scenes/DiveScene.js';
import { MineScene }    from './scenes/MineScene.js';
import { FarmScene }    from './scenes/FarmScene.js';
import { GAME }         from './core/Constants.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  // Viewport = 480x270 — the world scrolls at GAME.WIDTH (1920px)
  width:  GAME.VIEW_WIDTH,
  height: GAME.HEIGHT,
  pixelArt: true,
  backgroundColor: GAME.BACKGROUND_COLOR,
  roundPixels: true,
  antialias: false,
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false, fps: 60 }
  },
  render: {
    pixelArt: true, roundPixels: true, antialias: false, batchSize: 2048
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    autoRound: true
  },
  scene: [BootScene, FishingScene, UIScene, DiveScene, MineScene, FarmScene]
};

const game = new Phaser.Game(config);
window.__game = game;

const loadingDiv = document.getElementById('loading');
if (loadingDiv) loadingDiv.style.display = 'none';

document.addEventListener('visibilitychange', () => {
  game.scene.scenes.forEach(s => {
    if (document.hidden  && s.scene.isActive()) s.scene.pause();
    if (!document.hidden && s.scene.isPaused()) s.scene.resume();
  });
});
