import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { eventBus } from '../core/EventBus.js';
import { gameState } from '../core/GameState.js';
import { EVENTS, GAME, DEPTH } from '../core/Constants.js';

/**
 * Underwater dive side-location.
 * scene.switch does not re-run create() — reset on wake so oxygen/loot refresh.
 * UIScene is slept while here, so toasts are local (not eventBus → HUD).
 */
export class DiveScene extends Phaser.Scene {
  constructor() {
    super({ key: 'DiveScene' });
    this.player = null;
    this.oxygen = 100;
    this.depth = 0;
    this.treasures = [];
    this.fish = [];
    this.bubbles = [];
    this._oxygenEvent = null;
    this._toast = null;
  }

  create() {
    this.events.on('wake', () => this.resetDive());
    this.createUnderwaterEnvironment();
    this.player = new Player(this, GAME.WIDTH / 2, 100);
    this.createUI();
    this.setupInput();
    this.resetDive();
  }

  resetDive() {
    this.oxygen = 100;
    this.depth = 0;
    if (this.player?.container) {
      this.player.container.setPosition(GAME.WIDTH / 2, 100);
      this.player.stopVelocity?.();
    }
    this.treasures.forEach(t => t.sprite?.destroy());
    this.treasures = [];
    this.fish.forEach(f => f.sprite?.destroy());
    this.fish = [];
    this.createMarineLife();
    this.createTreasures();
    this.updateOxygenBar();
    if (this.depthText) this.depthText.setText('Depth: 0m');
    if (this._oxygenEvent) this._oxygenEvent.remove(false);
    this.startOxygenDepletion();
  }

  createUnderwaterEnvironment() {
    const graphics = this.add.graphics();
    for (let y = 0; y < GAME.HEIGHT; y++) {
      const ratio = y / GAME.HEIGHT;
      const r = 0;
      const g = Math.floor(100 * (1 - ratio) + 50 * ratio);
      const b = Math.floor(200 * (1 - ratio) + 100 * ratio);
      graphics.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1);
      graphics.fillRect(0, y, GAME.WIDTH, 1);
    }
    this.bubbles = [];
    for (let i = 0; i < 20; i++) {
      const bubble = this.add.circle(
        Math.random() * GAME.WIDTH,
        Math.random() * GAME.HEIGHT,
        Math.random() * 3 + 1,
        0xffffff,
        0.3
      );
      this.bubbles.push({ sprite: bubble, speed: Math.random() * 1.5 + 0.5 });
    }
  }

  createMarineLife() {
    const fishTypes = ['clown_fish', 'butterfly_fish', 'neon_tetras', 'sea_horse'];
    for (let i = 0; i < 12; i++) {
      const type = fishTypes[Math.floor(Math.random() * fishTypes.length)];
      const key = `fish_${type}`;
      if (this.textures.exists(key)) {
        const fish = this.add.sprite(
          Math.random() * GAME.WIDTH,
          150 + Math.random() * 100,
          key
        ).setScale(1.2);
        this.fish.push({
          sprite: fish,
          speedX: (Math.random() - 0.5) * 1.5,
          speedY: (Math.random() - 0.5) * 0.3,
        });
      }
    }
  }

  createTreasures() {
    const pos = [{ x: 100, y: 240 }, { x: 250, y: 220 }, { x: 400, y: 250 }];
    pos.forEach(p => {
      const chest = this.add.rectangle(p.x, p.y, 16, 12, 0xffd700).setDepth(DEPTH.GROUND);
      this.treasures.push({ sprite: chest, collected: false });
    });
  }

  createUI() {
    this.oxygenBar = this.add.graphics().setScrollFactor(0).setDepth(DEPTH.UI);
    this.depthText = this.add.text(10, 30, 'Depth: 0m', {
      fontSize: '10px', fontFamily: 'monospace', color: '#e8f4ff',
    }).setScrollFactor(0).setDepth(DEPTH.UI);
    this.add.text(10, GAME.HEIGHT - 20, 'WASD: Swim | SPACE: Collect | Q: Surface', {
      fontSize: '8px', fontFamily: 'monospace', color: '#cde',
    }).setScrollFactor(0).setDepth(DEPTH.UI);
    this._toast = this.add.text(GAME.WIDTH / 2, 40, '', {
      fontSize: '10px', fontFamily: 'monospace', color: '#ffe08a',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH.UI + 5).setVisible(false);
  }

  showToast(msg, ms = 2000) {
    if (!this._toast) return;
    this._toast.setText(msg).setVisible(true);
    this.time.delayedCall(ms, () => {
      if (this._toast) this._toast.setVisible(false);
    });
  }

  setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D');
    // KeyboardPlugin is shared across scenes — guard so slept Dive cannot steal SPACE/Q
    this.input.keyboard.on('keydown-SPACE', () => {
      if (this.scene.isActive()) this.tryCollectTreasure();
    });
    this.input.keyboard.on('keydown-Q', () => {
      if (this.scene.isActive()) this.scene.switch('FishingScene');
    });
  }

  startOxygenDepletion() {
    this._oxygenEvent = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        this.oxygen -= 2;
        this.updateOxygenBar();
        if (this.oxygen <= 0 && this.scene.isActive()) {
          this.showToast('Out of oxygen!');
          this.scene.switch('FishingScene');
        }
      },
    });
  }

  updateOxygenBar() {
    if (!this.oxygenBar) return;
    this.oxygenBar.clear();
    this.oxygenBar.fillStyle(0x000000, 0.5);
    this.oxygenBar.fillRect(10, 10, 100, 10);
    const color = this.oxygen > 30 ? 0x00ff00 : 0xff0000;
    this.oxygenBar.fillStyle(color, 1);
    this.oxygenBar.fillRect(10, 10, 100 * (Math.max(0, this.oxygen) / 100), 10);
  }

  tryCollectTreasure() {
    this.treasures.forEach(t => {
      if (!t.collected && Phaser.Math.Distance.Between(this.player.x, this.player.y, t.sprite.x, t.sprite.y) < 30) {
        t.collected = true;
        t.sprite.setVisible(false);
        gameState.game.gold += 50;
        this.showToast('Found Treasure! +50g');
        // Keep eventBus for any listeners; UIScene is usually slept here
        eventBus.emit(EVENTS.UI_SHOW_MESSAGE, { text: 'Found Treasure! +50g', duration: 2000 });
      }
    });
  }

  update(_time, delta) {
    if (!this.player) return;
    const input = {
      up: this.cursors.up.isDown || this.wasd.W.isDown,
      down: this.cursors.down.isDown || this.wasd.S.isDown,
      left: this.cursors.left.isDown || this.wasd.A.isDown,
      right: this.cursors.right.isDown || this.wasd.D.isDown,
    };
    this.player.setInputState(input);
    this.player.update(delta);

    this.depth = Math.floor((this.player.y - 100) / 5);
    if (this.depthText) this.depthText.setText(`Depth: ${Math.max(0, this.depth)}m`);

    this.fish.forEach(f => {
      f.sprite.x += f.speedX;
      f.sprite.y += f.speedY;
      if (f.sprite.x < 0) f.sprite.x = GAME.WIDTH;
      if (f.sprite.x > GAME.WIDTH) f.sprite.x = 0;
    });
    this.bubbles.forEach(b => {
      b.sprite.y -= b.speed;
      if (b.sprite.y < 0) {
        b.sprite.y = GAME.HEIGHT;
        b.sprite.x = Math.random() * GAME.WIDTH;
      }
    });
  }
}

export default DiveScene;
