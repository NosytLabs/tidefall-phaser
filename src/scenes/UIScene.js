import Phaser from 'phaser';
import { eventBus } from '../core/EventBus.js';
import { EVENTS, RARITY } from '../core/Constants.js';

export class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene', active: false });
    this.panels = new Map();
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;

    // HUD background
    this.add.rectangle(w / 2, 10, w, 20, 0x000000, 0.7).setDepth(90);

    // Energy bar
    this.energyBg = this.add.rectangle(50, 10, 40, 6, 0x333333).setDepth(100);
    this.energyBar = this.add.rectangle(31, 10, 36, 4, 0x44cc44)
      .setOrigin(0, 0.5).setDepth(101);
    this.add.text(4, 6, '⚡', { fontSize: '8px' }).setDepth(100);

    // Stats
    this.statsText = this.add.text(w - 4, 6, '', {
      fontFamily: 'monospace', fontSize: '8px', color: '#ffffff', align: 'right'
    }).setOrigin(1, 0).setDepth(100);

    // Time icon
    this.timeIcon = this.add.text(w / 2 - 40, 6, '☀️', { fontSize: '10px' }).setDepth(100);
    this.weatherIcon = this.add.text(w / 2 - 25, 6, '', { fontSize: '10px' }).setDepth(100);

    // Gold & catches
    this.add.text(95, 6, '🐟', { fontSize: '8px' }).setDepth(100);
    this.catchesText = this.add.text(106, 6, '0', { fontSize: '8px' }).setDepth(100);
    this.add.text(130, 6, '💰', { fontSize: '8px' }).setDepth(100);
    this.goldText = this.add.text(141, 6, '0', { fontSize: '8px', color: '#ffff44' }).setDepth(100);

    // Message area
    this.messageText = this.add.text(w / 2, h - 30, '', {
      fontFamily: 'monospace', fontSize: '10px', color: '#ffff44',
      backgroundColor: '#000000cc', padding: { x: 6, y: 4 }
    }).setOrigin(0.5).setDepth(100).setVisible(false);

    // Setup event handlers
    this.setupEvents();
  }

  setupEvents() {
    eventBus.on(EVENTS.PLAYER_ENERGY_CHANGE, ({ energy }) => {
      const pct = Math.max(0, Math.min(1, energy / 100));
      this.energyBar.setDisplaySize(36 * pct, 4);
      this.energyBar.setFillStyle(energy > 50 ? 0x44cc44 : energy > 25 ? 0xcccc44 : 0xcc4444);
    });

    eventBus.on(EVENTS.UI_SHOW_MESSAGE, (text) => this.showMessage(text));
    eventBus.on(EVENTS.UI_SHOW_CATCH, (fish, weight, value, isNew) => {
      this.showCatchPanel(fish, weight, value, isNew);
    });
    eventBus.on(EVENTS.UI_TOGGLE_INVENTORY, () => this.toggleInventory());
  }

  showMessage(text, duration = 2000) {
    this.messageText.setText(text).setVisible(true);
    if (this.msgTimer) this.msgTimer.remove();
    this.msgTimer = this.time.delayedCall(duration, () => {
      this.messageText.setVisible(false);
    });
  }

  showCatchPanel(fish, weight, value, isNew) {
    const w = this.scale.width / 2;
    const h = this.scale.height / 2;

    if (this.catchPanel) this.catchPanel.destroy();

    const color = RARITY[fish.rarity] || '#ffffff';
    const panel = this.add.container(w, h);

    panel.add([
      this.add.rectangle(0, 0, 120, 60, 0x1a1a1a, 0.95).setDepth(200),
      this.add.rectangle(0, 0, 122, 62).setStrokeStyle(1, parseInt(color.replace('#', ''), 16)).setDepth(199)
    ]);

    if (isNew) {
      panel.add(this.add.text(0, -25, '✨ NEW!', {
        fontSize: '8px', color: '#ffff44'
      }).setOrigin(0.5).setDepth(201));
    }

    panel.add([
      this.add.text(0, -12, fish.name, {
        fontSize: '10px', color: color, fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(201),
      this.add.text(0, 0, `${weight.toFixed(1)}kg`, {
        fontSize: '8px', color: '#ffffff'
      }).setOrigin(0.5).setDepth(201),
      this.add.text(0, 12, `+${value}g`, {
        fontSize: '8px', color: '#ffdd44'
      }).setOrigin(0.5).setDepth(201),
      this.add.text(0, 24, fish.rarity.toUpperCase(), {
        fontSize: '6px', color: color
      }).setOrigin(0.5).setDepth(201)
    ]);

    this.catchPanel = panel.setDepth(300);

    this.tweens.add({ targets: panel, scale: { from: 0, to: 1 }, duration: 300, ease: 'Back.out' });
    this.time.delayedCall(3000, () => {
      this.tweens.add({
        targets: panel, alpha: 0, scale: 0.8, duration: 200,
        onComplete: () => panel.destroy()
      });
    });
  }

  toggleInventory() {
    if (this.inventoryPanel?.visible) {
      this.inventoryPanel.setVisible(false);
      return;
    }
    this.showInventory();
  }

  showInventory() {
    if (this.inventoryPanel) {
      this.inventoryPanel.setVisible(true);
      return;
    }

    const w = this.scale.width / 2;
    const h = this.scale.height / 2;

    const panel = this.add.container(w, h);
    panel.add([
      this.add.rectangle(0, 0, 200, 120, 0x1a1a1a, 0.98).setDepth(300),
      this.add.rectangle(0, 0, 202, 122).setStrokeStyle(2, 0x888888).setDepth(299),
      this.add.text(0, -50, '📦 INVENTORY', {
        fontSize: '10px', color: '#ffffff', fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(301)
    ]);

    this.inventoryPanel = panel.setDepth(300).setVisible(true);
  }

  update() {
    // Could update dynamic elements here
  }
}
