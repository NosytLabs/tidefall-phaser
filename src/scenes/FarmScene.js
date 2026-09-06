import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { eventBus } from '../core/EventBus.js';
import { gameState } from '../core/GameState.js';
import { EVENTS, GAME, DEPTH } from '../core/Constants.js';

export class FarmScene extends Phaser.Scene {
  constructor() {
    super({ key: 'FarmScene' });
    this.player = null;
    this.animals = [];
  }

  create() {
    this.createBackground();
    this.createBuildings();
    this.player = new Player(this, GAME.WIDTH / 2, GAME.HEIGHT / 2);
    this.createAnimals();
    this.setupInput();
  }

  createBackground() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x5a9a3c, 1);
    graphics.fillRect(0, 0, GAME.WIDTH, GAME.HEIGHT);
    for (let x = 100; x < GAME.WIDTH; x += 100) {
      for (let y = 100; y < GAME.HEIGHT; y += 80) {
        graphics.fillStyle(0x8B4513, 1);
        graphics.fillRect(x, y, 40, 40);
      }
    }
  }

  createBuildings() {
    if (this.textures.exists('barn')) {
      this.add.image(60, 60, 'barn').setScale(0.8);
    }
    if (this.textures.exists('greenhouse')) {
      this.add.image(GAME.WIDTH - 60, 60, 'greenhouse').setScale(0.6);
    }
  }

  createAnimals() {
    const types = ['chicken_idle', 'cow_idle', 'pig_idle'];
    for (let i = 0; i < 6; i++) {
      const t = types[i % 3];
      if (this.textures.exists(t)) {
        const a = this.add.sprite(50 + Math.random() * (GAME.WIDTH - 100), 50 + Math.random() * (GAME.HEIGHT - 100), t).setScale(1);
        this.animals.push(a);
      }
    }
  }

  setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D');
    this.add.text(10, GAME.HEIGHT - 20, 'WASD: Move | F / ESC: Return to shore', { fontSize: '8px', fontFamily: 'monospace' }).setDepth(DEPTH.UI + 10);
    this.input.keyboard.on('keydown-F', () => { if (this.scene.isActive()) this.scene.switch('FishingScene'); });
    this.input.keyboard.on('keydown-ESC', () => { if (this.scene.isActive()) this.scene.switch('FishingScene'); });
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
  }
}

export default FarmScene;
