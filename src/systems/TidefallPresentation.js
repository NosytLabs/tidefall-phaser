import Phaser from 'phaser';
import { COLORS, WORLD, DEPTH, GAME, FISHING, RODS } from '../core/Constants.js';

/**
 * Visual/game-feel pass for Tidefall.
 * Keeps the existing authored sprites, but removes noisy procedural presentation
 * and gives the fishing loop a quieter, more readable visual language.
 */
export function installTidefallPresentation(FishingScene, FishingSystem) {
  FishingScene.prototype.createForest = function createForestPolished() {
    const forestH = WORLD.FOREST_BOTTOM - WORLD.FOREST_TOP;
    this.add.rectangle(
      GAME.WIDTH / 2,
      WORLD.FOREST_TOP + forestH / 2,
      GAME.WIDTH,
      forestH,
      0x1f4b2d
    ).setDepth(DEPTH.TREES_BACK);

    this.add.rectangle(
      GAME.WIDTH / 2,
      WORLD.FOREST_TOP + forestH * 0.72,
      GAME.WIDTH,
      forestH * 0.56,
      0x2e5e32,
      0.72
    ).setDepth(DEPTH.TREES_BACK + 0.1);

    if (this.textures.exists('trees_pine_growth')) {
      const treeCount = Math.floor(GAME.WIDTH / 44);
      for (let i = 0; i < treeCount; i++) {
        const x = 16 + i * (GAME.WIDTH - 32) / Math.max(1, treeCount - 1);
        const y = WORLD.FOREST_BOTTOM - Phaser.Math.Between(1, 8);
        const tree = this.add.sprite(x, y, 'trees_pine_growth', i % 4)
          .setOrigin(0.5, 1)
          .setDepth(DEPTH.TREES_BACK + 0.5)
          .setScale(i % 3 === 0 ? 0.7 : 0.6)
          .setAlpha(0.82);
        this.depthSortGroup.add(tree);
      }
    }

    const understory = this.add.graphics().setDepth(DEPTH.DECORATION);
    for (let x = 10; x < GAME.WIDTH; x += 18) {
      const y = WORLD.FOREST_BOTTOM - 5 - ((x / 18) % 3) * 2;
      understory.fillStyle(0x163a27, 0.65);
      understory.fillRect(x, y, 3, 5);
      if (x % 54 === 10) {
        understory.fillStyle(0x6ea653, 0.7);
        understory.fillRect(x + 5, y - 2, 2, 3);
      }
    }
  };

  FishingScene.prototype.createGrass = function createGrassPolished() {
    const grassY = (WORLD.GRASS_TOP + WORLD.GRASS_BOTTOM) / 2;
    const grassH = WORLD.GRASS_BOTTOM - WORLD.GRASS_TOP;

    this.add.rectangle(
      GAME.WIDTH / 2,
      grassY,
      GAME.WIDTH,
      grassH,
      COLORS.GRASS
    ).setDepth(DEPTH.GROUND);

    if (this.textures.exists('terrain_grass')) {
      this.add.tileSprite(GAME.WIDTH / 2, grassY, GAME.WIDTH, grassH, 'terrain_grass')
        .setOrigin(0.5)
        .setDepth(DEPTH.GROUND + 0.1)
        .setAlpha(0.72);
    }

    const gfx = this.add.graphics().setDepth(DEPTH.DECORATION);
    for (let i = 0; i < 150; i++) {
      const x = 8 + (i * 127) % (GAME.WIDTH - 16);
      const y = WORLD.GRASS_TOP + 5 + (i * 37) % Math.max(1, grassH - 10);
      gfx.fillStyle(i % 3 === 0 ? 0x3f7f27 : 0x74a946, 0.55);
      gfx.fillRect(x, y, 1, i % 4 === 0 ? 3 : 2);
    }

    const flowers = [0xf4d35e, 0xe9899c, 0xa9c8ff];
    for (let i = 0; i < 34; i++) {
      const x = 18 + (i * 211) % (GAME.WIDTH - 36);
      const y = WORLD.GRASS_TOP + 8 + (i * 17) % Math.max(1, grassH - 16);
      gfx.fillStyle(flowers[i % flowers.length], 0.88);
      gfx.fillRect(x, y, 2, 2);
    }
  };

  FishingScene.prototype.createClouds = function createCloudsPolished() {
    const cloudCount = 8;
    for (let i = 0; i < cloudCount; i++) {
      const x = 80 + (i * 251) % (GAME.WIDTH - 160);
      const y = 9 + (i * 17) % Math.max(1, WORLD.SKY_BOTTOM - 16);
      const w = 22 + (i % 4) * 8;
      const cloud = this.add.container(x, y).setDepth(DEPTH.CLOUDS);
      cloud.add(this.add.ellipse(0, 2, w, 6, 0xffffff, 0.34));
      cloud.add(this.add.ellipse(-w * 0.22, 1, w * 0.42, 8, 0xffffff, 0.34));
      cloud.add(this.add.ellipse(w * 0.22, 1, w * 0.5, 7, 0xffffff, 0.34));
      this.tweens.add({
        targets: cloud,
        x: x + 35 + (i % 3) * 14,
        duration: 26000 + (i % 4) * 4000,
        repeat: -1,
        yoyo: true,
        ease: 'Sine.easeInOut'
      });
    }
  };

  FishingScene.prototype.createWater = function createWaterPolished() {
    const waterY = (WORLD.WATER_TOP + WORLD.WATER_BOTTOM) / 2;
    const waterH = WORLD.WATER_BOTTOM - WORLD.WATER_TOP;

    this.add.rectangle(GAME.WIDTH / 2, waterY, GAME.WIDTH, waterH, COLORS.WATER)
      .setOrigin(0.5)
      .setDepth(DEPTH.GROUND);

    this.add.rectangle(
      GAME.WIDTH / 2,
      WORLD.WATER_TOP + waterH * 0.58,
      GAME.WIDTH,
      waterH * 0.42,
      COLORS.WATER_DEEP,
      0.5
    ).setDepth(DEPTH.GROUND + 0.02);

    const mid = this.add.rectangle(
      GAME.WIDTH / 2,
      WORLD.WATER_TOP + waterH * 0.34,
      GAME.WIDTH,
      waterH * 0.18,
      0x66b4e6,
      0.13
    ).setDepth(DEPTH.GROUND + 0.03);

    this.waveGfx = this.add.graphics().setDepth(DEPTH.WATER_SURFACE);
    this.waveOffset = 0;
    this.drawWaves();

    const shore = this.add.graphics().setDepth(DEPTH.WATER_SURFACE + 1);
    shore.fillStyle(COLORS.WATER_FOAM, 0.22);
    shore.fillRect(0, WORLD.WATER_TOP, GAME.WIDTH, 2);
    for (let x = 0; x < GAME.WIDTH; x += 18) {
      if ((x / 18) % 3 !== 1) shore.fillRect(x + 3, WORLD.WATER_TOP + 3, 7, 1);
    }

    mid.setBlendMode(Phaser.BlendModes.SCREEN);
  };

  FishingScene.prototype.drawWaves = function drawWavesPolished() {
    if (!this.waveGfx) return;
    this.waveGfx.clear();
    this.waveGfx.fillStyle(0xd8f3ff, 0.2);
    for (let x = 0; x < GAME.WIDTH; x += 12) {
      const y = WORLD.WATER_TOP + 8 + Math.sin((x + this.waveOffset) * 0.05) * 1.5;
      this.waveGfx.fillRect(x, y, 7, 1);
    }
    this.waveGfx.fillStyle(0xb7dff5, 0.10);
    for (let x = 0; x < GAME.WIDTH; x += 20) {
      const y = WORLD.WATER_TOP + 22 + Math.sin((x + this.waveOffset * 0.6) * 0.035) * 2.2;
      this.waveGfx.fillRect(x + 4, y, 8, 1);
    }
  };

  FishingScene.prototype.createBoats = function createBoatsPolished() {
    const boatDefs = [
      { type: 'boat_blue', x: 200, y: WORLD.WATER_TOP + 22 },
      { type: 'boat_yellow', x: 480, y: WORLD.WATER_TOP + 38 },
      { type: 'boat_small', x: 720, y: WORLD.WATER_TOP + 28 },
      { type: 'boat_blue', x: 1050, y: WORLD.WATER_TOP + 32 },
      { type: 'boat_small', x: 1280, y: WORLD.WATER_TOP + 24 },
      { type: 'boat_yellow', x: 1550, y: WORLD.WATER_TOP + 35 },
      { type: 'boat_small', x: 1780, y: WORLD.WATER_TOP + 26 }
    ];

    boatDefs.forEach((cfg, idx) => {
      if (!this.textures.exists(cfg.type)) return;
      const boat = this.add.sprite(cfg.x, cfg.y, cfg.type, 0)
        .setOrigin(0.5)
        .setDepth(DEPTH.BOATS)
        .setScale(idx % 2 === 0 ? 0.62 : 0.58);
      this.tweens.add({
        targets: boat,
        y: cfg.y + 1.5,
        duration: 1800 + (idx % 3) * 400,
        repeat: -1,
        yoyo: true,
        ease: 'Sine.easeInOut'
      });
    });
  };

  FishingScene.prototype.createTreesForeground = function createTreesForegroundPolished() {
    const coastalPines = [110, 360, 620, 980, 1240, 1600, 1810];
    coastalPines.forEach((x, idx) => {
      if (!this.textures.exists('trees_pine_growth')) return;
      const tree = this.add.sprite(
        x,
        WORLD.SAND_TOP + 7,
        'trees_pine_growth',
        idx % 4
      ).setOrigin(0.5, 1)
        .setDepth(DEPTH.TREES_FORE)
        .setScale(0.48)
        .setAlpha(0.78);
      this.depthSortGroup.add(tree);
    });

    const fruitTrees = [
      { key: 'apple_tree', x: 100, y: WORLD.GRASS_TOP + 12 },
      { key: 'peach_tree', x: 220, y: WORLD.GRASS_TOP + 14 },
      { key: 'apple_tree', x: 1350, y: WORLD.GRASS_TOP + 10 },
      { key: 'peach_tree', x: 1480, y: WORLD.GRASS_TOP + 15 }
    ];
    fruitTrees.forEach(t => {
      if (!this.textures.exists(t.key)) return;
      const tree = this.add.sprite(t.x, t.y, t.key)
        .setOrigin(0.5, 1)
        .setDepth(DEPTH.TREES_FORE)
        .setScale(0.5);
      this.depthSortGroup.add(tree);
    });
  };

  FishingSystem.prototype.createSplashEffect = function createSplashEffectPolished(x, y) {
    for (let i = 0; i < 5; i++) {
      const angle = -Math.PI + (Math.PI * i) / 4;
      const distance = 5 + (i % 3) * 2;
      const droplet = this.scene.add.rectangle(
        x + Math.cos(angle) * distance,
        y + Math.sin(angle) * distance - 2,
        2,
        2,
        0xe5f8ff,
        0.7
      ).setDepth(DEPTH.WATER_EFFECTS);

      this.scene.tweens.add({
        targets: droplet,
        x: x + Math.cos(angle) * (distance + 8),
        y: y + Math.sin(angle) * 4,
        alpha: 0,
        duration: 300,
        ease: 'Quad.easeOut',
        onComplete: () => droplet.destroy()
      });
    }

    const ring = this.scene.add.ellipse(x, y, 12, 4, 0xdef5ff, 0.32)
      .setDepth(DEPTH.WATER_EFFECTS);
    this.scene.tweens.add({
      targets: ring,
      scaleX: 2.8,
      scaleY: 1.8,
      alpha: 0,
      duration: 450,
      ease: 'Quad.easeOut',
      onComplete: () => ring.destroy()
    });
  };

  FishingSystem.prototype.createRippleEffect = function createRippleEffectPolished(x, y) {
    const ring = this.scene.add.ellipse(x, y, 18, 6, 0xc8efff, 0.28)
      .setDepth(DEPTH.WATER_EFFECTS);
    this.scene.tweens.add({
      targets: ring,
      scaleX: 2.4,
      scaleY: 1.6,
      alpha: 0,
      duration: 700,
      ease: 'Sine.easeOut',
      onComplete: () => ring.destroy()
    });
  };

  FishingSystem.prototype.createBiteFlash = function createBiteFeedbackPolished() {
    if (!this.bobber) return;
    const marker = this.scene.add.circle(this.bobber.x, this.bobber.y, 7, 0xffd86b, 0.16)
      .setDepth(DEPTH.WATER_EFFECTS);
    this.scene.tweens.add({
      targets: marker,
      scale: 1.7,
      alpha: 0,
      duration: 420,
      ease: 'Sine.easeOut',
      onComplete: () => marker.destroy()
    });
  };

  FishingSystem.prototype.triggerBite = function triggerBitePolished(...args) {
    const result = FishingSystem.prototype.__tidefallOriginalTriggerBite.apply(this, args);
    if (this.bobber) {
      this.scene.tweens.killTweensOf(this.bobber);
      this.scene.tweens.add({
        targets: this.bobber,
        y: this.bobber.y + 2,
        duration: 220,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
    const label = this.currentFishPersonality === 'LEGENDARY'
      ? 'Rare bite! Press SPACE to hook.'
      : 'Fish on! Press SPACE to hook.';
    this.scene.events.emit('ui:showMessage', label);
    return result;
  };

  FishingSystem.prototype.createMinigameUI = function createMinigameUIPolished(targetSizeMod = 1) {
    const cx = this.scene.scale.width / 2;
    const cy = this.scene.scale.height - 48;

    this.minigamePanel = this.scene.add.rectangle(cx, cy, 292, 62, 0x08111f, 0.96)
      .setDepth(DEPTH.UI_FOREGROUND);
    this.minigamePanel.setStrokeStyle(1, 0x5d8aa5, 0.65);

    this.scene.add.text(cx - 132, cy - 25, 'REEL IN', {
      fontFamily: 'monospace', fontSize: '8px', color: '#d8eefb'
    }).setDepth(DEPTH.UI_FOREGROUND + 1);

    this.scene.add.text(cx + 131, cy - 25, String(this.currentFishPersonality || 'NORMAL'), {
      fontFamily: 'monospace', fontSize: '7px', color: '#9db0c6'
    }).setOrigin(1, 0).setDepth(DEPTH.UI_FOREGROUND + 1);

    this.minigameBarBg = this.scene.add.rectangle(cx, cy, 258, 18, 0x172638)
      .setDepth(DEPTH.UI_FOREGROUND + 1);
    this.minigameBarBg.setStrokeStyle(1, 0x48677e, 0.85);

    this.minigameBar = this.scene.add.rectangle(cx - 128, cy, 254, 14, 0x6abf83)
      .setOrigin(0, 0.5)
      .setDepth(DEPTH.UI_FOREGROUND + 2);

    const baseTargetWidth = Math.max(40, 100 * (1 - this.currentFish.difficulty * 0.4));
    const targetWidth = baseTargetWidth * targetSizeMod;
    this.minigameTarget = this.scene.add.rectangle(cx, cy, targetWidth, 14, 0x9bd8a5, 0.38)
      .setDepth(DEPTH.UI_FOREGROUND + 3);
    this.minigameTargetGlow = this.scene.add.rectangle(cx, cy, targetWidth + 4, 18)
      .setStrokeStyle(1, 0xbcecc5, 0.9)
      .setFillStyle(0, 0)
      .setDepth(DEPTH.UI_FOREGROUND + 3);

    this.minigamePointer = this.scene.add.triangle(
      cx - 120, cy - 15,
      0, 0,
      -5, 8,
      5, 8,
      0xffd36b
    ).setDepth(DEPTH.UI_FOREGROUND + 4);

    this.minigameFishIcon = this.scene.add.triangle(
      cx - 120, cy + 1,
      0, -5,
      -5, 5,
      5, 5,
      0xd8eefb
    ).setDepth(DEPTH.UI_FOREGROUND + 4);

    this.minigameSuccessText = this.scene.add.text(cx, cy - 21, 'KEEP THE MARKER IN THE ZONE', {
      fontFamily: 'monospace', fontSize: '6px', color: '#83c9a0'
    }).setOrigin(0.5).setDepth(DEPTH.UI_FOREGROUND + 5);

    this.minigamePersonalityText = null;
  };

  // Preserve the existing game logic while installing a quieter presentation.
  FishingSystem.prototype.__tidefallOriginalTriggerBite = FishingSystem.prototype.triggerBite;
  FishingSystem.prototype.triggerBite = FishingSystem.prototype.triggerBite;

  return { rodDefaults: RODS.BASIC, baitDefaults: FISHING };
}
