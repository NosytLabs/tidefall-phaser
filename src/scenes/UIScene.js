import Phaser from 'phaser';
import { eventBus } from '../core/EventBus.js';
import { EVENTS, RARITY } from '../core/Constants.js';

export class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene', active: false });
    this.panels = new Map();
    this._catchCount = 0;
    this._gold = 0;
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

    this.setupEvents();
  }

  setupEvents() {
    eventBus.on(EVENTS.PLAYER_ENERGY_CHANGE, ({ energy }) => {
      const pct = Math.max(0, Math.min(1, energy / 100));
      this.energyBar.setDisplaySize(36 * pct, 4);
      this.energyBar.setFillStyle(energy > 50 ? 0x44cc44 : energy > 25 ? 0xcccc44 : 0xcc4444);
    });

    // FIX: showMessage event sends {text, duration} object — destructure properly
    eventBus.on(EVENTS.UI_SHOW_MESSAGE, (payload) => {
      const text = typeof payload === 'object' ? payload.text : payload;
      const duration = typeof payload === 'object' ? (payload.duration ?? 2000) : 2000;
      this.showMessage(text, duration);
    });

    // FIX: UI_SHOW_CATCH params are (fish, weight, perfect) — was incorrectly named (fish, weight, value, isNew)
    eventBus.on(EVENTS.UI_SHOW_CATCH, (fish, weight, perfect) => {
      this.showCatchPanel(fish, weight, perfect);
    });

    eventBus.on(EVENTS.UI_TOGGLE_INVENTORY, () => this.toggleInventory());

    // Update HUD catches + gold when a fish is caught
    eventBus.on(EVENTS.FISHING_CATCH, ({ fish, weight }) => {
      this._catchCount++;
      const value = fish.value || 10;
      this._gold += value;
      if (this.catchesText) this.catchesText.setText(String(this._catchCount));
      if (this.goldText) this.goldText.setText(String(this._gold));
    });

    eventBus.on(EVENTS.TIME_CHANGE, ({ icon }) => {
      if (this.timeIcon) this.timeIcon.setText(icon);
    });

    eventBus.on(EVENTS.WEATHER_CHANGE, ({ icon }) => {
      if (this.weatherIcon) this.weatherIcon.setText(icon || '');
    });
  }

  showMessage(text, duration = 2000) {
    if (!text) return;
    this.messageText.setText(String(text)).setVisible(true);
    if (this.msgTimer) this.msgTimer.remove();
    this.msgTimer = this.time.delayedCall(duration, () => {
      this.messageText.setVisible(false);
    });
  }

  showCatchPanel(fish, weight, perfect) {
    if (!fish) return;
    const w = this.scale.width / 2;
    const h = this.scale.height / 2;

    if (this.catchPanel) this.catchPanel.destroy();

    const colorStr = RARITY[fish.rarity] || '#ffffff';
    const colorInt = parseInt(colorStr.replace('#', ''), 16);
    const panel = this.add.container(w, h);

    panel.add([
      this.add.rectangle(0, 0, 130, 70, 0x1a1a1a, 0.95).setDepth(200),
      this.add.rectangle(0, 0, 132, 72).setStrokeStyle(1, colorInt).setDepth(199)
    ]);

    if (perfect) {
      panel.add(this.add.text(0, -30, '✨ PERFECT!', {
        fontSize: '8px', color: '#ffff44'
      }).setOrigin(0.5).setDepth(201));
    }

    panel.add([
      this.add.text(0, -16, fish.name || 'Unknown Fish', {
        fontSize: '10px', color: colorStr, fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(201),
      this.add.text(0, -2, `${(weight || 0).toFixed(1)} kg`, {
        fontSize: '8px', color: '#ffffff'
      }).setOrigin(0.5).setDepth(201),
      this.add.text(0, 12, `+${fish.value || 10} 💰`, {
        fontSize: '8px', color: '#ffdd44'
      }).setOrigin(0.5).setDepth(201),
      this.add.text(0, 26, (fish.rarity || 'common').toUpperCase(), {
        fontSize: '7px', color: colorStr
      }).setOrigin(0.5).setDepth(201)
    ]);

    this.catchPanel = panel.setDepth(300);
    this.tweens.add({ targets: panel, scale: { from: 0, to: 1 }, duration: 300, ease: 'Back.out' });
    this.time.delayedCall(3500, () => {
      if (panel.active) {
        this.tweens.add({
          targets: panel, alpha: 0, scale: 0.8, duration: 200,
          onComplete: () => { if (panel.active) panel.destroy(); }
        });
      }
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

  update() {}
}
