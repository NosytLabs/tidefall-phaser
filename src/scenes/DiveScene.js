import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { eventBus } from '../core/EventBus.js';
import { gameState } from '../core/GameState.js';
import { EVENTS, GAME, DEPTH, WORLD } from '../core/Constants.js';

export class DiveScene extends Phaser.Scene {
  constructor() {
    super({ key: 'DiveScene' });
    this.player = null;
    this.oxygen = 100;
    this.depth = 0;
    this.treasures = [];
    this.fish = [];
  }

  create() {
    this.createUnderwaterEnvironment();
    this.player = new Player(this, GAME.WIDTH / 2, 100);
    this.createMarineLife();
    this.createTreasures();
    this.createUI();
    this.setupInput();
    this.startOxygenDepletion();
  }

  createUnderwaterEnvironment() {
    const graphics = this.add.graphics();
    for (let y = 0; y < GAME.HEIGHT; y++) {
      const ratio = y / GAME.HEIGHT;
      const r = Math.floor(0);
      const g = Math.floor(100 * (1 - ratio) + 50 * ratio);
      const b = Math.floor(200 * (1 - ratio) + 100 * ratio);
      graphics.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1);
      graphics.fillRect(0, y, GAME.WIDTH, 1);
    }
    this.bubbles = [];
    for (let i = 0; i < 20; i++) {
      const bubble = this.add.circle(Math.random() * GAME.WIDTH, Math.random() * GAME.HEIGHT, Math.random() * 3 + 1, 0xffffff, 0.3);
      this.bubbles.push({ sprite: bubble, speed: Math.random() * 1.5 + 0.5 });
    }
  }

  createMarineLife() {
    const fishTypes = ['clown_fish', 'butterfly_fish', 'neon_tetras', 'sea_horse'];
    for (let i = 0; i < 12; i++) {
      const type = fishTypes[Math.floor(Math.random() * fishTypes.length)];
      if (this.textures.exists(`fish_${type}`)) {
        const fish = this.add.sprite(Math.random() * GAME.WIDTH, 150 + Math.random() * 100, `fish_${type}`).setScale(1.2);
        this.fish.push({ sprite: fish, speedX: (Math.random() - 0.5) * 1.5, speedY: (Math.random() - 0.5) * 0.3 });
      }
    }
  }

  createTreasures() {
    const pos = [ { x: 100, y: 240 }, { x: 250, y: 220 }, { x: 400, y: 250 } ];
    pos.forEach(p => {
      const chest = this.add.rectangle(p.x, p.y, 16, 12, 0xffd700).setDepth(DEPTH.GROUND);
      this.treasures.push({ sprite: chest, collected: false });
    });
  }

  createUI() {
    this.oxygenBar = this.add.graphics().setScrollFactor(0).setDepth(DEPTH.UI);
    this.depthText = this.add.text(10, 30, 'Depth: 0m', { fontSize: '10px', fontFamily: 'monospace' }).setScrollFactor(0).setDepth(DEPTH.UI);
    this.add.text(10, GAME.HEIGHT - 20, 'WASD: Swim | SPACE: Collect | Q: Surface', { fontSize: '8px', fontFamily: 'monospace' }).setScrollFactor(0).setDepth(DEPTH.UI);
  }

  setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D');
    this.input.keyboard.on('keydown-SPACE', () => this.tryCollectTreasure());
    this.input.keyboard.on('keydown-Q', () => { if (this.scene.isActive()) this.scene.switch('FishingScene'); });
  }

  startOxygenDepletion() {
    this.time.addEvent({
      delay: 1000, loop: true,
      callback: () => {
        this.oxygen -= 2;
        this.updateOxygenBar();
        if (this.oxygen <= 0 && this.scene.isActive()) this.scene.switch('FishingScene');
      }
    });
  }

  updateOxygenBar() {
    this.oxygenBar.clear();
    this.oxygenBar.fillStyle(0x000000, 0.5);
    this.oxygenBar.fillRect(10, 10, 100, 10);
    const color = this.oxygen > 30 ? 0x00ff00 : 0xff0000;
    this.oxygenBar.fillStyle(color, 1);
    this.oxygenBar.fillRect(10, 10, 100 * (this.oxygen / 100), 10);
  }

  tryCollectTreasure() {
    this.treasures.forEach(t => {
      if (!t.collected && Phaser.Math.Distance.Between(this.player.x, this.player.y, t.sprite.x, t.sprite.y) < 30) {
        t.collected = true; t.sprite.setVisible(false);
        gameState.game.gold += 50;
        eventBus.emit(EVENTS.UI_SHOW_MESSAGE, 'Found Treasure! +50g');
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
    
    this.depth = Math.floor((this.player.y - 100) / 5);
    this.depthText.setText(`Depth: ${Math.max(0, this.depth)}m`);

    this.fish.forEach(f => {
      f.sprite.x += f.speedX; f.sprite.y += f.speedY;
      if (f.sprite.x < 0) f.sprite.x = GAME.WIDTH;
      if (f.sprite.x > GAME.WIDTH) f.sprite.x = 0;
    });
    this.bubbles.forEach(b => {
      b.sprite.y -= b.speed;
      if (b.sprite.y < 0) { b.sprite.y = GAME.HEIGHT; b.sprite.x = Math.random() * GAME.WIDTH; }
    });
  }
}

export default DiveScene;
