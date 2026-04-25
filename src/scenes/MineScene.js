import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { eventBus } from '../core/EventBus.js';
import { gameState } from '../core/GameState.js';
import { EVENTS, GAME, DEPTH } from '../core/Constants.js';

export class MineScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MineScene' });
    this.player = null;
    this.lightRadius = 120;
    this.ores = [];
  }

  create() {
    this.createCaveEnvironment();
    this.player = new Player(this, 60, GAME.HEIGHT / 2);
    this.createOres();
    this.createUI();
    this.setupInput();
    this.maskGraphics = this.add.graphics().setDepth(DEPTH.UI_OVERLAY);
  }

  createCaveEnvironment() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x1a1510, 1);
    graphics.fillRect(0, 0, GAME.WIDTH, GAME.HEIGHT);
    for (let i = 0; i < 40; i++) {
      graphics.fillStyle(0x2a2015, 1);
      graphics.fillCircle(Math.random() * GAME.WIDTH, Math.random() * GAME.HEIGHT, 20 + Math.random() * 30);
    }
    for (let x = 100; x < GAME.WIDTH; x += 160) {
      graphics.fillStyle(0x3a2a1a, 1);
      graphics.fillRect(x, 0, 12, GAME.HEIGHT);
    }
  }

  createOres() {
    const types = [
      { color: 0xC0C0C0, val: 20, name: 'Silver' },
      { color: 0xFFD700, val: 50, name: 'Gold' },
      { color: 0xB87333, val: 10, name: 'Copper' }
    ];
    for (let i = 0; i < 15; i++) {
      const t = types[Math.floor(Math.random() * types.length)];
      const ore = this.add.circle(150 + Math.random() * (GAME.WIDTH - 200), 50 + Math.random() * (GAME.HEIGHT - 100), 8, t.color);
      this.ores.push({ sprite: ore, type: t, mined: false });
    }
  }

  createUI() {
    this.add.text(10, GAME.HEIGHT - 20, 'WASD: Move | SPACE: Mine | M: Exit', { fontSize: '8px', fontFamily: 'monospace' }).setDepth(DEPTH.UI + 10);
  }

  setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D');
    this.input.keyboard.on('keydown-SPACE', () => this.tryMine());
    this.input.keyboard.on('keydown-M', () => this.scene.switch('FishingScene'));
  }

  tryMine() {
    this.ores.forEach(o => {
      if (!o.mined && Phaser.Math.Distance.Between(this.player.x, this.player.y, o.sprite.x, o.sprite.y) < 35) {
        o.mined = true; o.sprite.setVisible(false);
        gameState.game.gold += o.type.val;
        eventBus.emit(EVENTS.UI_SHOW_MESSAGE, `Mined ${o.type.name}! +${o.type.val}g`);
      }
    });
  }

  update(time, delta) {
    const input = {
      up: this.cursors.up.isDown || this.wasd.W.isDown,
      down: this.cursors.down.isDown || this.wasd.S.isDown,
      left: this.cursors.left.isDown || this.wasd.A.isDown,
      right: this.cursors.right.isDown || this.wasd.D.isDown,
    };
    this.player.setInputState(input);
    this.player.update(delta);

    this.maskGraphics.clear();
    this.maskGraphics.fillStyle(0x000000, 0.85);
    this.maskGraphics.fillRect(0, 0, GAME.WIDTH, GAME.HEIGHT);
    this.maskGraphics.blendMode = Phaser.BlendModes.ERASE;
    this.maskGraphics.fillStyle(0xffffff, 1);
    this.maskGraphics.fillCircle(this.player.x, this.player.y, this.lightRadius);
    this.maskGraphics.blendMode = Phaser.BlendModes.NORMAL;
  }
}

export default MineScene;
