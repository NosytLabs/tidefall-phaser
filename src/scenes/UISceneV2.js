import Phaser from 'phaser';
import { eventBus } from '../core/EventBus.js';
import { EVENTS, GAME, RARITY } from '../core/Constants.js';
import { gameState } from '../core/GameState.js';

const W = GAME.VIEW_WIDTH;
const H = GAME.HEIGHT;
const PANEL = 0x08111f;
const TEXT = '#f5f7fb';
const MUTED = '#9db0c6';
const GOLD = '#ffd85a';

export class UISceneV2 extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene', active: false });
    this.inventoryPanel = null;
    this.messageTimer = null;
    this.handlers = [];
  }

  text(x, y, value, size = 8, color = TEXT) {
    return this.add.text(x, y, value, {
      fontFamily: 'monospace', fontSize: `${size}px`, color,
      stroke: '#02060b', strokeThickness: size > 9 ? 2 : 1, resolution: 2
    }).setScrollFactor(0);
  }

  create() {
    this.createTopBar();
    this.createMessage();
    this.createHint();
    this.createTouchControls();
    this.bindEvents();
    this.syncState();
  }

  createTopBar() {
    this.add.rectangle(0, 0, W, 22, PANEL, 0.96).setOrigin(0).setDepth(90);
    this.add.rectangle(0, 21, W, 1, 0x67d7ff, 0.25).setOrigin(0).setDepth(91);
    this.text(7, 5, 'TIDEFALL', 9, '#d9f4ff').setDepth(100);
    this.text(66, 3, 'ENERGY', 6, MUTED).setDepth(100);
    this.add.rectangle(66, 14, 58, 5, 0x203448).setOrigin(0, 0.5).setDepth(100);
    this.energyBar = this.add.rectangle(66, 14, 58, 3, 0x63e28a).setOrigin(0, 0.5).setDepth(101);
    this.fishText = this.text(136, 4, 'FISH 0').setDepth(100);
    this.goldText = this.text(199, 4, '0g', 8, GOLD).setDepth(100);
    this.timeText = this.text(252, 5, 'DAY', 7).setDepth(100);
    this.weatherText = this.text(314, 5, 'CLEAR', 7, MUTED).setDepth(100);
    this.actionText = this.text(355, 5, 'SPACE CAST', 7, '#b9e9ff').setDepth(100);
    this.text(355, 13, 'I BAG', 6, MUTED).setDepth(100);
  }

  createMessage() {
    this.messageBg = this.add.rectangle(W / 2, 34, 100, 15, PANEL, 0.92).setDepth(98).setVisible(false);
    this.messageText = this.text(W / 2, 29, '', 8, '#d7f7ff').setOrigin(0.5, 0).setDepth(99).setVisible(false);
  }

  createHint() {
    this.add.rectangle(W / 2, H - 12, 330, 16, PANEL, 0.88).setDepth(90);
    this.hintText = this.text(W / 2, H - 18, 'Walk to the shoreline, then press SPACE to cast.', 7, '#d2e0ee')
      .setOrigin(0.5, 0).setDepth(100);
  }

  createTouchControls() {
    if (!this.sys.game.device.input.touch) return;
    const scene = () => this.scene.get('FishingScene');
    const move = (direction, active) => {
      const player = scene()?.player;
      if (player) player.setInputState({ ...player.input, [direction]: active });
    };
    const button = (x, y, glyph, press, hold) => {
      const bg = this.add.rectangle(x, y, 28, 28, PANEL, 0.76)
        .setStrokeStyle(1, 0x7ea9c2, 0.7).setInteractive().setDepth(220);
      this.text(x, y, glyph, 11).setOrigin(0.5).setDepth(221);
      let down = false;
      bg.on('pointerdown', () => { down = true; bg.setFillStyle(0x102235, 0.94); press?.(); hold?.(true); });
      const up = () => { if (!down) return; down = false; bg.setFillStyle(PANEL, 0.76); hold?.(false); };
      bg.on('pointerup', up).on('pointerupoutside', up).on('pointerout', up);
    };
    button(34, H - 47, '←', null, v => move('left', v));
    button(92, H - 47, '→', null, v => move('right', v));
    button(63, H - 70, '↑', null, v => move('up', v));
    button(63, H - 24, '↓', null, v => move('down', v));
    button(W - 48, H - 48, 'F', () => scene()?.handleFishingInput?.());
    button(W - 82, H - 81, 'E', () => scene()?.handleInteract?.());
    button(W - 114, H - 48, 'I', () => this.toggleInventory());
  }

  bindEvents() {
    const on = (event, handler) => { eventBus.on(event, handler); this.handlers.push([event, handler]); };
    on(EVENTS.PLAYER_ENERGY_CHANGE, ({ energy }) => this.setEnergy(energy));
    on(EVENTS.UI_SHOW_MESSAGE, payload => this.showMessage(typeof payload === 'object' ? payload.text : payload, typeof payload === 'object' ? (payload.duration ?? 2200) : 2200));
    on(EVENTS.UI_GOLD_SYNC, payload => {
      const gold = typeof payload === 'object' ? payload.gold : payload;
      if (typeof gold === 'number') this.goldText.setText(`${gold}g`);
    });
    on(EVENTS.UI_TOGGLE_INVENTORY, () => this.toggleInventory());
    on(EVENTS.FISHING_BITE, () => {
      this.actionText.setText('SPACE HOOK');
      this.hintText.setText('Fish on! Press SPACE to hook.');
    });
    on(EVENTS.FISHING_CATCH, ({ fish, weight, perfect }) => {
      this.fishText.setText(`FISH ${gameState.game.totalCaught}`);
      this.actionText.setText('SPACE CAST');
      this.hintText.setText('Catch secured. Find another spot and cast again.');
      this.showCatch(fish, weight, perfect);
    });
    on(EVENTS.TIME_CHANGE, payload => this.timeText.setText(String(payload?.phase || payload?.timeOfDay || 'day').toUpperCase()));
    on(EVENTS.WEATHER_CHANGE, payload => this.weatherText.setText(String(payload?.weather || payload?.type || 'clear').toUpperCase()));
    this.events.once('shutdown', () => this.handlers.forEach(([event, handler]) => eventBus.off(event, handler)));
  }

  syncState() {
    this.setEnergy(gameState.player.energy);
    this.goldText.setText(`${gameState.game.gold}g`);
    this.fishText.setText(`FISH ${gameState.game.totalCaught}`);
    this.timeText.setText(String(gameState.game.timeOfDay || 'day').toUpperCase());
    this.weatherText.setText(String(gameState.game.weather || 'clear').toUpperCase());
  }

  setEnergy(energy) {
    const pct = Phaser.Math.Clamp(Number(energy) / 100, 0, 1);
    this.energyBar.setDisplaySize(58 * pct, 3);
    this.energyBar.setFillStyle(pct > 0.5 ? 0x63e28a : pct > 0.25 ? 0xf0d36a : 0xf07070);
  }

  showMessage(value, duration = 2200) {
    if (!value) return;
    this.messageText.setText(String(value)).setVisible(true);
    this.messageBg.setDisplaySize(Math.min(Math.max(this.messageText.width + 24, 90), 430)).setVisible(true);
    if (this.messageTimer) this.messageTimer.remove();
    this.messageTimer = this.time.delayedCall(duration, () => {
      this.messageText.setVisible(false);
      this.messageBg.setVisible(false);
    });
  }

  showCatch(fish, weight, perfect) {
    if (!fish) return;
    const rarity = String(fish.rarity || 'common').toLowerCase();
    const color = RARITY[rarity] || '#ffffff';
    const panel = this.add.rectangle(W / 2, 78, 230, 56, PANEL, 0.97).setDepth(300);
    const border = this.add.rectangle(W / 2, 78, 232, 58).setStrokeStyle(2, parseInt(color.slice(1), 16), 0.95).setDepth(301);
    const title = this.text(W / 2, 59, `${perfect ? 'PERFECT · ' : ''}${fish.name || 'Fish'}`, 12, color).setOrigin(0.5).setDepth(302);
    const meta = this.text(W / 2, 79, `${rarity.toUpperCase()} · ${Number(weight || 0).toFixed(2)} kg`, 8, MUTED).setOrigin(0.5).setDepth(302);
    const value = this.text(W / 2, 95, `+${fish.value || 10}g`, 9, GOLD).setOrigin(0.5).setDepth(302);
    this.tweens.add({ targets: [panel, border, title, meta, value], alpha: 0, delay: 1900, duration: 180, onComplete: () => [panel, border, title, meta, value].forEach(obj => obj.destroy()) });
  }

  toggleInventory() {
    if (this.inventoryPanel) { this.inventoryPanel.destroy(true); this.inventoryPanel = null; return; }
    const inventory = this.registry.get('inventory');
    const fish = inventory?.getAllFish?.() || [];
    const panel = this.add.container(W / 2, H / 2).setDepth(320);
    panel.add(this.add.rectangle(0, 0, 286, 176, PANEL, 0.98).setStrokeStyle(2, 0x67d7ff, 0.8));
    panel.add(this.text(0, -76, 'CATCH LOG', 11, '#d9f4ff').setOrigin(0.5));
    panel.add(this.text(0, -60, `${fish.length} / ${inventory?.maxSlots ?? 30} slots`, 7, MUTED).setOrigin(0.5));
    const lines = fish.length
      ? fish.slice(-9).reverse().map((item, i) => `${i + 1}. ${(item.fish?.name || 'Fish').slice(0, 14).padEnd(14, ' ')} ${Number(item.weight || 0).toFixed(1)}kg ${item.fish?.value ?? 0}g`).join('\n')
      : 'Nothing caught yet.\nWalk to the water and cast.';
    panel.add(this.text(0, -8, lines, 8, MUTED).setOrigin(0.5, 0));
    panel.add(this.text(0, 76, 'Press I to close', 7, '#6f849a').setOrigin(0.5));
    this.inventoryPanel = panel;
  }
}
