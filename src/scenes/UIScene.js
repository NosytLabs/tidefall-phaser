import Phaser from 'phaser';
import { eventBus } from '../core/EventBus.js';
import { EVENTS, RARITY, GAME } from '../core/Constants.js';
import { gameState } from '../core/GameState.js';

const W = GAME.VIEW_WIDTH;  // 480 — UI always at viewport coords
const H = GAME.HEIGHT;      // 270

export class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene', active: false });
    this._catchCount = 0;
    this._gold = 0;
  }

  create() {
    // ── TOP BAR ─────────────────────────────────────────────────────────────
    // Background strip
    this.add.rectangle(W / 2, 0, W, 18, 0x000000, 0.75).setOrigin(0.5, 0).setDepth(90).setScrollFactor(0);

    // ⚡ Energy bar
    this.add.text(4, 4, '⚡', { fontSize: '10px' }).setDepth(100).setScrollFactor(0);
    this.energyBg  = this.add.rectangle(22, 9, 52, 7, 0x333333).setDepth(100).setScrollFactor(0);
    this.energyBar = this.add.rectangle(22 - 25, 9, 50, 5, 0x44cc44)
      .setOrigin(0, 0.5).setDepth(101).setScrollFactor(0);
    this.add.rectangle(22, 9, 52, 7).setStrokeStyle(1, 0x666666)
      .setDepth(101).setScrollFactor(0);

    // 🐟 Catch counter
    this.add.text(82, 4, '🐟', { fontSize: '10px' }).setDepth(100).setScrollFactor(0);
    this.catchesText = this.add.text(96, 5, '0', {
      fontSize: '10px', fontFamily: 'monospace', color: '#ffffff',
      stroke: '#000', strokeThickness: 2
    }).setDepth(100).setScrollFactor(0);

    // 💰 Gold
    this.add.text(120, 4, '💰', { fontSize: '10px' }).setDepth(100).setScrollFactor(0);
    this.goldText = this.add.text(134, 5, '0', {
      fontSize: '10px', fontFamily: 'monospace', color: '#ffdd44',
      stroke: '#000', strokeThickness: 2
    }).setDepth(100).setScrollFactor(0);

    // ☀️ Time of day
    this.timeIcon = this.add.text(W / 2 - 6, 4, '☀️', { fontSize: '11px' })
      .setDepth(100).setScrollFactor(0);

    // 🌦 Weather
    this.weatherIcon = this.add.text(W / 2 + 12, 4, '', { fontSize: '11px' })
      .setDepth(100).setScrollFactor(0);

    // Controls hint (bottom)
    this.add.rectangle(W / 2, H, W, 14, 0x000000, 0.65)
      .setOrigin(0.5, 1).setDepth(90).setScrollFactor(0);
    this.add.text(W / 2, H - 11, 'WASD: Move  •  SPACE: Fish  •  E: Talk  •  I: Inv  •  V: Dive  •  N: Mine  •  G: Farm', {
      fontSize: '7px', fontFamily: 'monospace', color: '#aaaaaa'
    }).setOrigin(0.5, 0).setDepth(100).setScrollFactor(0);

    // ── MESSAGE AREA ─────────────────────────────────────────────────────────
    this.msgBg   = this.add.rectangle(W / 2, H - 36, 1, 14, 0x000000, 0.8)
      .setOrigin(0.5).setDepth(100).setScrollFactor(0).setVisible(false);
    this.msgText = this.add.text(W / 2, H - 36, '', {
      fontSize: '10px', fontFamily: 'monospace', color: '#ffff44',
      stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(101).setScrollFactor(0).setVisible(false);

    this.setupEvents();
  }

  setupEvents() {
    eventBus.on(EVENTS.PLAYER_ENERGY_CHANGE, ({ energy }) => {
      const pct = Math.max(0, Math.min(1, energy / 100));
      this.energyBar.setDisplaySize(50 * pct, 5);
      const col = energy > 50 ? 0x44cc44 : energy > 25 ? 0xcccc44 : 0xcc4444;
      this.energyBar.setFillStyle(col);
    });

    eventBus.on(EVENTS.UI_SHOW_MESSAGE, (payload) => {
      const text = typeof payload === 'object' ? payload.text     : payload;
      const dur  = typeof payload === 'object' ? (payload.duration ?? 2500) : 2500;
      this.showMessage(text, dur);
    });

    eventBus.on(EVENTS.UI_GOLD_SYNC, (payload) => {
      const gold = typeof payload === 'object' ? payload.gold : payload;
      if (typeof gold === 'number') {
        this._gold = gold;
        if (this.goldText) this.goldText.setText(String(this._gold));
      }
    });

    eventBus.on(EVENTS.UI_SHOW_CATCH, (fish, weight, perfect) => {
      this.showCatchPanel(fish, weight, perfect);
    });

    eventBus.on(EVENTS.UI_TOGGLE_INVENTORY, () => this.toggleInventory());

    eventBus.on(EVENTS.FISHING_CATCH, ({ fish, weight }) => {
      this._catchCount++;
      this._gold += fish?.value || 10;
      if (this.catchesText) this.catchesText.setText(String(this._catchCount));
      if (this.goldText)    this.goldText.setText(String(this._gold));
    });

    eventBus.on(EVENTS.TIME_CHANGE,    ({ icon }) => { if (this.timeIcon)    this.timeIcon.setText(icon); });
    eventBus.on(EVENTS.WEATHER_CHANGE, ({ icon }) => { if (this.weatherIcon) this.weatherIcon.setText(icon || ''); });
  }

  showMessage(text, duration = 2500) {
    if (!text) return;
    this.msgText.setText(String(text)).setVisible(true);
    const tw = this.msgText.width + 24;
    this.msgBg.setDisplaySize(tw, 16).setVisible(true);
    if (this._msgTimer) this._msgTimer.remove();
    this._msgTimer = this.time.delayedCall(duration, () => {
      this.msgText.setVisible(false);
      this.msgBg.setVisible(false);
    });
  }

  showCatchPanel(fish, weight, perfect) {
    if (!fish) return;
    const cx = W / 2, cy = H / 2;
    if (this.catchPanel) this.catchPanel.destroy();

    const colorStr = RARITY[fish.rarity] || '#ffffff';
    const colorInt = parseInt(colorStr.replace('#', ''), 16);
    const panel = this.add.container(cx, cy).setDepth(300).setScrollFactor(0);

    // Panel bg
    panel.add([
      this.add.rectangle(0, 0, 140, 76, 0x0a0a18, 0.95).setDepth(200),
      this.add.rectangle(0, 0, 142, 78).setStrokeStyle(2, colorInt).setDepth(199)
    ]);

    // Rarity glow strip
    panel.add(this.add.rectangle(0, -33, 140, 10, colorInt, 0.6).setDepth(201));

    if (perfect) {
      panel.add(this.add.text(0, -30, '✨ PERFECT!', {
        fontSize: '8px', color: '#ffff44', stroke: '#000', strokeThickness: 2
      }).setOrigin(0.5).setDepth(202));
    }

    panel.add([
      this.add.text(0, -18, fish.name || 'Unknown', {
        fontSize: '11px', color: colorStr, fontStyle: 'bold',
        stroke: '#000', strokeThickness: 2
      }).setOrigin(0.5).setDepth(201),
      this.add.text(0, -3, `${(weight || 0).toFixed(2)} kg`, {
        fontSize: '9px', color: '#dddddd'
      }).setOrigin(0.5).setDepth(201),
      this.add.text(0, 12, `+${fish.value || 10} 💰`, {
        fontSize: '10px', color: '#ffdd44', stroke: '#000', strokeThickness: 2
      }).setOrigin(0.5).setDepth(201),
      this.add.text(0, 26, (fish.rarity || 'common').toUpperCase(), {
        fontSize: '8px', color: colorStr
      }).setOrigin(0.5).setDepth(201)
    ]);

    this.catchPanel = panel;
    this.tweens.add({ targets: panel, scale: { from: 0, to: 1 }, duration: 280, ease: 'Back.out' });
    this.time.delayedCall(3800, () => {
      if (panel?.active) {
        this.tweens.add({
          targets: panel, alpha: 0, scale: 0.85, duration: 220,
          onComplete: () => { if (panel?.active) panel.destroy(); }
        });
      }
    });
  }

  toggleInventory() {
    if (this.inventoryPanel?.visible) {
      this.inventoryPanel.destroy(true);
      this.inventoryPanel = null;
      return;
    }
    this.buildInventoryPanel();
  }

  buildInventoryPanel() {
    if (this.inventoryPanel) {
      this.inventoryPanel.destroy(true);
      this.inventoryPanel = null;
    }
    const inv = this.registry.get('inventory');
    const fish = inv?.getAllFish?.() || [];
    const panel = this.add.container(W / 2, H / 2).setScrollFactor(0).setDepth(300);
    panel.add([
      this.add.rectangle(0, 0, 240, 160, 0x0a0a18, 0.96),
      this.add.rectangle(0, 0, 242, 162).setStrokeStyle(2, 0x4488ff),
      this.add.text(0, -68, '📦  INVENTORY', {
        fontSize: '11px', color: '#ffffff', fontStyle: 'bold', stroke: '#000', strokeThickness: 2
      }).setOrigin(0.5),
    ]);
    if (fish.length === 0) {
      panel.add(this.add.text(0, -10, 'No fish yet — cast at the shore!', {
        fontSize: '8px', color: '#aaaaaa', align: 'center', wordWrap: { width: 200 }
      }).setOrigin(0.5));
    } else {
      const lines = fish.slice(0, 8).map((item, i) => {
        const name = item.fish?.name || 'Fish';
        const w = item.weight != null ? `${Number(item.weight).toFixed(1)}kg` : '';
        const val = item.fish?.value != null ? `${item.fish.value}g` : '';
        return `${i + 1}. ${name}  ${w}  ${val}`.trim();
      });
      if (fish.length > 8) lines.push(`… +${fish.length - 8} more`);
      const slots = inv?.maxSlots ?? 30;
      panel.add(this.add.text(0, -48, `${fish.length}/${slots} slots · worth ${inv.getTotalValue?.() ?? 0}g`, {
        fontSize: '8px', color: '#88aacc'
      }).setOrigin(0.5));
      panel.add(this.add.text(0, 8, lines.join('\n'), {
        fontSize: '8px', color: '#e8e8e8', align: 'left', lineSpacing: 3
      }).setOrigin(0.5, 0));
      const sell = this.add.text(0, 62, '[S] Sell all', {
        fontSize: '9px', color: '#ffdd44', backgroundColor: '#222244'
      }).setOrigin(0.5).setPadding(4, 2).setInteractive({ useHandCursor: true });
      sell.on('pointerdown', () => this.sellAllFish());
      panel.add(sell);
      this._invSellKey = this.input.keyboard.once('keydown-S', () => {
        if (this.inventoryPanel?.visible) this.sellAllFish();
      });
    }
    panel.add(this.add.text(0, 78, 'Press I to close', {
      fontSize: '8px', color: '#666666'
    }).setOrigin(0.5));
    this.inventoryPanel = panel.setVisible(true);
  }

  sellAllFish() {
    const inv = this.registry.get('inventory');
    if (!inv?.getCount?.() && !inv?.getAllFish?.()?.length) {
      this.showMessage('Nothing to sell.', 2000);
      return;
    }
    const result = inv.sellAll?.();
    const gold = result?.gold || 0;
    const count = result?.count || 0;
    if (count <= 0) {
      this.showMessage('Nothing to sell.', 2000);
      return;
    }
    gameState.game.gold += gold;
    gameState.inventory = [];
    eventBus.emit(EVENTS.UI_GOLD_SYNC, { gold: gameState.game.gold });
    this.showMessage(`Sold ${count} fish for ${gold}g!`, 2500);
    if (this.inventoryPanel) {
      this.inventoryPanel.destroy(true);
      this.inventoryPanel = null;
    }
    this.buildInventoryPanel();
  }

  update() {}
}
