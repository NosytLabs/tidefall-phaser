import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { NPC, NPCS } from '../entities/NPC.js';
import { FishManager } from '../systems/FishManager.js';
import { FishingSystem } from '../systems/FishingSystem.js';
import { Inventory } from '../systems/Inventory.js';
import { WeatherSystem } from '../systems/WeatherSystem.js';
import { AudioManager } from '../systems/AudioManager.js';
import { AchievementSystem } from '../systems/AchievementSystem.js';
import { NotificationSystem } from '../systems/NotificationSystem.js';
import {
  COLORS, WORLD, DEPTH, SCALE, PHYSICS, ASSETS, GAME, EVENTS,
  KEYS, ANIMATION
} from '../core/Constants.js';
import { eventBus } from '../core/EventBus.js';

/**
 * FishingScene — Tidefall main game scene
 * Built layer-by-layer: Sky → Forest → Grass → Sand → Buildings → Animals → Water → Boats → Trees
 */
export class FishingScene extends Phaser.Scene {
  constructor() {
    super({ key: 'FishingScene' });
    this.fishingState = 'NOT_FISHING';
  }

  create() {
    this.fishData = this.cache.json.get('fishData');

    // --- SYSTEMS ---
    this.inventory = new Inventory();
    this.fishManager = new FishManager(this, this.fishData);
    this.fishingSystem = new FishingSystem(this);
    this.weatherSystem = new WeatherSystem(this);
    this.audioManager = new AudioManager(this);
    this.achievementSystem = new AchievementSystem(this);
    this.notificationSystem = new NotificationSystem(this);

    this.weatherSystem.start();
    this.audioManager.init();

    // --- WORLD LAYERS (back → front) ---
    this.createSky();
    this.createClouds();
    this.createForest();
    this.createGrass();
    this.createSand();
    this.createBuildings();
    this.createAnimals();
    this.createFences();
    this.createWater();
    this.createBoats();
    this.createTreesForeground();

    // --- PLAYER ---
    this.player = new Player(this, 100, WORLD.GRASS_BOTTOM - 10);

    // --- NPCs ---
    this.npcGroup = this.add.group();
    this.npcInstances = [];
    NPCS.forEach(cfg => {
      const npc = new NPC(this, cfg.x, cfg.y, cfg);
      npc.container.setData('name', cfg.name);
      npc.container.setData('role', cfg.role);
      this.npcGroup.add(npc.container);
      this.npcInstances.push(npc);
    });

    // --- FISH SHADOWS ---
    this.fishManager.spawnFishShadows();

    // --- CAMERA ---
    this.cameras.main.startFollow(this.player.container, true, CAMERA.LERP, CAMERA.LERP);
    this.cameras.main.setDeadzone(CAMERA.DEADZONE_W, CAMERA.DEADZONE_H);
    this.cameras.main.setBounds(0, 0, GAME.WIDTH, GAME.HEIGHT);

    // --- DEPTH SORTING ---
    this.depthSortGroup = this.add.group();

    // --- INPUT ---
    this.setupInput();
    this.setupEvents();

    // --- DAY/NIGHT OVERLAY ---
    this.dayNightOverlay = this.add.rectangle(
      GAME.WIDTH / 2, GAME.HEIGHT / 2,
      GAME.WIDTH, GAME.HEIGHT,
      COLORS.SKY_NIGHT, 0
    ).setDepth(DEPTH.UI_OVERLAY).setScrollFactor(0)
      .setBlendMode(Phaser.BlendModes.MULTIPLY);

    this.dayPhase = 0;
    this.dayTimer = this.time.addEvent({
      delay: 100, loop: true, callback: () => this.updateDayNight()
    });

    // --- LAUNCH UI ---
    this.scene.launch('UIScene');

    // --- READY ---
    eventBus.emit(EVENTS.GAME_START);
  }

  // ============================================================
  // WORLD LAYERS
  // ============================================================

  createSky() {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = WORLD.SKY_BOTTOM;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, WORLD.SKY_BOTTOM);
    grad.addColorStop(0, '#1e3c72');
    grad.addColorStop(1, '#87ceeb');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1, WORLD.SKY_BOTTOM);
    this.textures.addCanvas('sky', canvas);

    this.add.tileSprite(0, 0, GAME.WIDTH, WORLD.SKY_BOTTOM, 'sky')
      .setOrigin(0, 0)
      .setDepth(DEPTH.SKY);
  }

  createClouds() {
    for (let i = 0; i < 6; i++) {
      const x = Phaser.Math.Between(0, GAME.WIDTH);
      const y = Phaser.Math.Between(5, WORLD.SKY_BOTTOM - 10);
      const cloud = this.add.ellipse(x, y,
        Phaser.Math.Between(20, 40), Phaser.Math.Between(6, 10),
        0xffffff, 0.4
      ).setDepth(DEPTH.CLOUDS).setScale(SCALE.CLOUD);

      this.tweens.add({
        targets: cloud,
        x: x + 80,
        duration: Phaser.Math.Between(15000, 30000),
        repeat: -1,
        yoyo: true,
        ease: 'Sine.easeInOut'
      });
    }
  }

  createForest() {
    // Dark forest band behind grass
    if (this.textures.exists('trees_pine_growth')) {
      for (let i = 0; i < 14; i++) {
        const x = Phaser.Math.Between(0, GAME.WIDTH);
        const y = WORLD.FOREST_BOTTOM - Phaser.Math.Between(0, 20);
        const frame = Phaser.Math.Between(0, 3);
        const tree = this.add.sprite(x, y, 'trees_pine_growth', frame % 4)
          .setOrigin(0.5, 1)
          .setDepth(DEPTH.TREES_BACK)
          .setScale(SCALE.TREE_PINE)
          .setAlpha(0.8);
        this.depthSortGroup.add(tree);
      }
    } else {
      // Fallback: dark band
      this.add.rectangle(
        GAME.WIDTH / 2,
        (WORLD.FOREST_TOP + WORLD.FOREST_BOTTOM) / 2,
        GAME.WIDTH,
        WORLD.FOREST_BOTTOM - WORLD.FOREST_TOP,
        0x0d3808, 1
      ).setOrigin(0.5).setDepth(DEPTH.TREES_BACK);
    }
  }

  createGrass() {
    const grassY = (WORLD.GRASS_TOP + WORLD.GRASS_BOTTOM) / 2;
    const grassH = WORLD.GRASS_BOTTOM - WORLD.GRASS_TOP;

    if (this.textures.exists('terrain_grass')) {
      this.add.tileSprite(GAME.WIDTH / 2, grassY, GAME.WIDTH, grassH, 'terrain_grass')
        .setOrigin(0.5)
        .setDepth(DEPTH.GROUND);
    } else {
      this.add.rectangle(GAME.WIDTH / 2, grassY, GAME.WIDTH, grassH, COLORS.GRASS)
        .setOrigin(0.5)
        .setDepth(DEPTH.GROUND);
    }

    // Grass tufts decoration
    const gfx = this.add.graphics().setDepth(DEPTH.DECORATION);
    for (let i = 0; i < 40; i++) {
      const x = Phaser.Math.Between(0, GAME.WIDTH);
      const y = Phaser.Math.Between(WORLD.GRASS_TOP + 5, WORLD.GRASS_BOTTOM - 5);
      gfx.fillStyle(0x3a7a22, 0.8);
      gfx.fillRect(x, y, 2, 3);
      gfx.fillStyle(0x2a6a15, 0.6);
      gfx.fillRect(x + 2, y + 1, 1, 2);
    }

    // Wildflowers
    const flowerColors = [0xff6b8a, 0xffdd44, 0x99bbff, 0xff88aa];
    for (let i = 0; i < 15; i++) {
      const x = Phaser.Math.Between(0, GAME.WIDTH);
      const y = Phaser.Math.Between(WORLD.GRASS_TOP + 10, WORLD.GRASS_BOTTOM - 10);
      gfx.fillStyle(flowerColors[i % 4], 1);
      gfx.fillRect(x, y, 2, 2);
    }
  }

  createSand() {
    const sandY = (WORLD.SAND_TOP + WORLD.SAND_BOTTOM) / 2;
    const sandH = WORLD.SAND_BOTTOM - WORLD.SAND_TOP;

    if (this.textures.exists('beach_tileset')) {
      this.add.tileSprite(GAME.WIDTH / 2, sandY, GAME.WIDTH, sandH, 'beach_tileset')
        .setOrigin(0.5)
        .setDepth(DEPTH.GROUND);
    } else {
      this.add.rectangle(GAME.WIDTH / 2, sandY, GAME.WIDTH, sandH, COLORS.SAND)
        .setOrigin(0.5)
        .setDepth(DEPTH.GROUND);
    }
  }

  createBuildings() {
    const buildings = [
      { key: 'barn', x: 80, y: WORLD.GRASS_BOTTOM - 5, scale: SCALE.BUILDING },
      { key: 'chicken_coop', x: 160, y: WORLD.GRASS_BOTTOM - 5, scale: SCALE.BUILDING * 0.6 },
      { key: 'greenhouse', x: 380, y: WORLD.GRASS_BOTTOM - 5, scale: SCALE.BUILDING * 0.8 },
      { key: 'fish_market', x: 300, y: WORLD.GRASS_BOTTOM - 5, scale: SCALE.BUILDING, frame: 0 },
      { key: 'grain_silo', x: 50, y: WORLD.GRASS_TOP + 30, scale: SCALE.BUILDING * 0.6 },
    ];

    buildings.forEach(cfg => {
      if (!this.textures.exists(cfg.key)) return;
      const spr = this.add.sprite(cfg.x, cfg.y, cfg.key, cfg.frame || 0)
        .setOrigin(0.5, 1)
        .setDepth(DEPTH.BUILDINGS)
        .setScale(cfg.scale);
      this.depthSortGroup.add(spr);
    });
  }

  createAnimals() {
    // Chickens near coop
    for (let i = 0; i < 4; i++) {
      const x = 170 + Phaser.Math.Between(-15, 15);
      const y = WORLD.GRASS_BOTTOM - 5 + Phaser.Math.Between(-10, 5);
      if (this.textures.exists('chicken_idle')) {
        const chick = this.add.sprite(x, y, 'chicken_idle', 0)
          .setOrigin(0.5, 1)
          .setDepth(DEPTH.NPC)
          .setScale(SCALE.ANIMAL);
        if (this.anims.exists('chicken_walk')) chick.play('chicken_walk');
        this.depthSortGroup.add(chick);
      }
    }

    // Cow near barn
    if (this.textures.exists('cow_idle')) {
      const cow = this.add.sprite(90, WORLD.GRASS_BOTTOM - 5, 'cow_idle', 0)
        .setOrigin(0.5, 1)
        .setDepth(DEPTH.NPC)
        .setScale(SCALE.ANIMAL);
      this.depthSortGroup.add(cow);
    }

    // Pig near fence
    if (this.textures.exists('pig_idle')) {
      const pig = this.add.sprite(220, WORLD.GRASS_BOTTOM - 5, 'pig_idle', 0)
        .setOrigin(0.5, 1)
        .setDepth(DEPTH.NPC)
        .setScale(SCALE.ANIMAL);
      this.depthSortGroup.add(pig);
    }
  }

  createFences() {
    const gfx = this.add.graphics().setDepth(DEPTH.DECORATION);
    for (let x = 10; x < GAME.WIDTH; x += 20) {
      gfx.fillStyle(0x8b6a3a, 1);
      gfx.fillRect(x, WORLD.SAND_TOP - 2, 1, 6);
      gfx.fillStyle(0x7a5a2a, 1);
      gfx.fillRect(x, WORLD.SAND_TOP - 4, 18, 1);
    }
  }

  createWater() {
    const waterY = (WORLD.WATER_TOP + WORLD.WATER_BOTTOM) / 2;
    const waterH = WORLD.WATER_BOTTOM - WORLD.WATER_TOP;

    // Main water body — use water tileset sprite if available
    if (this.textures.exists('water_tileset')) {
      this.add.tileSprite(GAME.WIDTH / 2, waterY, GAME.WIDTH, waterH, 'water_tileset')
        .setOrigin(0.5)
        .setDepth(DEPTH.GROUND);
    } else {
      this.add.rectangle(GAME.WIDTH / 2, waterY, GAME.WIDTH, waterH, COLORS.WATER)
        .setOrigin(0.5)
        .setDepth(DEPTH.GROUND);
    }

    // Deep water darker band
    this.add.rectangle(
      GAME.WIDTH / 2,
      WORLD.WATER_TOP + (WORLD.WATER_BOTTOM - WORLD.WATER_TOP) * 0.6,
      GAME.WIDTH,
      (WORLD.WATER_BOTTOM - WORLD.WATER_TOP) * 0.4,
      COLORS.WATER_DEEP
    ).setOrigin(0.5).setDepth(DEPTH.GROUND - 0.1);

    // Wave shimmer lines
    const gfx = this.add.graphics().setDepth(DEPTH.WATER_SURFACE);
    for (let x = 0; x < GAME.WIDTH; x += 8) {
      const waveY = WORLD.WATER_TOP + Math.sin(x * 0.15) * 2;
      gfx.fillStyle(COLORS.WATER_FOAM, 0.25);
      gfx.fillRect(x, waveY, 4, 1);
    }

    // Water surface ripple animation
    if (this.anims.exists('ripple')) {
      for (let i = 0; i < 8; i++) {
        const rx = Phaser.Math.Between(20, GAME.WIDTH - 20);
        const ry = Phaser.Math.Between(WORLD.WATER_TOP + 10, WORLD.WATER_BOTTOM - 20);
        const ripple = this.add.sprite(rx, ry, 'water_ripple', 0)
          .setDepth(DEPTH.WATER_SURFACE)
          .play('ripple');
        ripple.on('animationcomplete', () => ripple.destroy());
      }
    }
  }

  createBoats() {
    const boatCfgs = [
      { type: 'boat_blue', x: 60, y: WORLD.WATER_TOP + 20 },
      { type: 'boat_yellow', x: 150, y: WORLD.WATER_TOP + 35 },
      { type: 'boat_small', x: 240, y: WORLD.WATER_TOP + 25 },
      { type: 'boat_blue', x: 340, y: WORLD.WATER_TOP + 30 },
      { type: 'boat_small', x: 420, y: WORLD.WATER_TOP + 22 },
    ];

    boatCfgs.forEach(cfg => {
      if (!this.textures.exists(cfg.type)) return;

      const boat = this.add.sprite(cfg.x, cfg.y, cfg.type, 0)
        .setOrigin(0.5, 0.5)
        .setDepth(DEPTH.BOATS)
        .setScale(SCALE.BOAT);

      // Gentle bob tween
      this.tweens.add({
        targets: boat,
        y: cfg.y + Phaser.Math.Between(1, 3),
        duration: Phaser.Math.Between(1500, 2500),
        repeat: -1,
        yoyo: true,
        ease: 'Sine.easeInOut'
      });

      // Gentle rock tween
      this.tweens.add({
        targets: boat,
        angle: Phaser.Math.Between(-2, 2),
        duration: Phaser.Math.Between(2000, 3500),
        repeat: -1,
        yoyo: true,
        ease: 'Sine.easeInOut'
      });
    });
  }

  createTreesForeground() {
    // Palm trees on beach/sand edge
    for (let i = 0; i < 6; i++) {
      const x = 30 + i * 80 + Phaser.Math.Between(-10, 10);
      const y = WORLD.SAND_TOP + 8;
      if (this.textures.exists('palm_tree')) {
        const tree = this.add.sprite(x, y, 'palm_tree', 0)
          .setOrigin(0.5, 1)
          .setDepth(DEPTH.TREES_FORE)
          .setScale(SCALE.TREE_PALM);
        if (this.anims.exists('palm_sway')) tree.play('palm_sway');
        this.depthSortGroup.add(tree);
      }
    }

    // Apple/peach trees on grass edge
    const fruitTrees = [
      { key: 'apple_tree', x: 120, y: WORLD.GRASS_TOP + 10 },
      { key: 'peach_tree', x: 360, y: WORLD.GRASS_TOP + 15 },
    ];
    fruitTrees.forEach(t => {
      if (this.textures.exists(t.key)) {
        const tree = this.add.sprite(t.x, t.y, t.key)
          .setOrigin(0.5, 1)
          .setDepth(DEPTH.TREES_FORE)
          .setScale(SCALE.TREE_OAK * 0.6);
        this.depthSortGroup.add(tree);
      }
    });
  }

  // ============================================================
  // INPUT
  // ============================================================

  setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyW = this.input.keyboard.addKey('W');
    this.keyA = this.input.keyboard.addKey('A');
    this.keyS = this.input.keyboard.addKey('S');
    this.keyD = this.input.keyboard.addKey('D');
    this.keyE = this.input.keyboard.addKey('E');
    this.keyI = this.input.keyboard.addKey('I');
    this.keySpace = this.input.keyboard.addKey('SPACE');

    this.keySpace.on('down', () => this.handleFishingInput());
    this.keyE.on('down', () => this.handleInteract());
    this.keyI.on('down', () => this.handleInventory());
  }

  handleFishingInput() {
    if (this.player.y < WORLD.WATER_TOP) return;

    switch (this.fishingState) {
      case 'NOT_FISHING':
        this.fishingSystem.cast(this.player.x, this.player.y);
        this.fishingState = 'CASTING';
        break;
      case 'WAITING':
        // Too early — just ignore
        break;
      case 'BITE':
        this.fishingSystem.hook();
        this.fishingState = 'HOOKED';
        break;
      case 'REELING':
        this.fishingSystem.reel();
        break;
    }
  }

  handleInteract() {
    const nearby = this.findNearbyNPC();
    if (nearby) {
      const name = nearby.getData('name');
      const role = nearby.getData('role') || nearby.getData('config')?.role || 'villager';
      eventBus.emit(EVENTS.UI_SHOW_MESSAGE, {
        text: `${name}: Hello, ${role}!`,
        duration: 3000
      });
    }
  }

  handleInventory() {
    eventBus.emit(EVENTS.UI_TOGGLE_INVENTORY);
  }

  findNearbyNPC() {
    let closest = null;
    let closestDist = 40;
    this.npcGroup.getChildren().forEach(npc => {
      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        npc.x, npc.y
      );
      if (dist < closestDist) {
        closestDist = dist;
        closest = npc;
      }
    });
    return closest;
  }

  // ============================================================
  // EVENTS
  // ============================================================

  setupEvents() {
    eventBus.on(EVENTS.FISHING_BITE, () => {
      this.fishingState = 'BITE';
      this.notificationSystem.show('Fish is biting! Press SPACE!', 2000);
    });

    eventBus.on(EVENTS.FISHING_CATCH, ({ fish }) => {
      this.fishingState = 'NOT_FISHING';
      this.inventory.addFish(fish);
      this.achievementSystem.recordCatch(fish);
      this.notificationSystem.show(`Caught a ${fish.name}!`, 3000);
    });

    eventBus.on(EVENTS.FISHING_ESCAPE, () => {
      this.fishingState = 'NOT_FISHING';
      this.notificationSystem.show('It got away...', 2000);
    });

    eventBus.on(EVENTS.GAME_PAUSE, () => {
      this.scene.pause();
    });
  }

  // ============================================================
  // DAY/NIGHT
  // ============================================================

  updateDayNight() {
    const phases = [
      { color: COLORS.SKY_DAWN, alpha: 0.15 },
      { color: COLORS.SKY_DAY, alpha: 0.0 },
      { color: COLORS.SKY_DUSK, alpha: 0.2 },
      { color: COLORS.SKY_NIGHT, alpha: 0.35 }
    ];

    const newPhase = Math.floor(this.dayPhase) % phases.length;
    const phase = phases[newPhase];

    this.dayNightOverlay.setFillStyle(phase.color, phase.alpha);
    this.dayPhase += 0.0005;

    // Update time icon in UI
    const icons = ['🌅', '☀️', '🌆', '🌙'];
    const currentIcon = icons[newPhase];
    eventBus.emit(EVENTS.TIME_CHANGE, { icon: currentIcon });
  }

  // ============================================================
  // UPDATE
  // ============================================================

  update() {
    // Player input
    const input = {
      up: this.cursors.up.isDown || this.keyW.isDown,
      down: this.cursors.down.isDown || this.keyS.isDown,
      left: this.cursors.left.isDown || this.keyA.isDown,
      right: this.cursors.right.isDown || this.keyD.isDown
    };
    this.player.setInputState(input);
    this.player.update();

    // Fishing system tick
    this.fishingSystem.update();

    // Depth sort
    this.sortDepth();
  }

  sortDepth() {
    const arr = [...this.depthSortGroup.getChildren(), this.player.container, ...this.npcGroup.getChildren()];
    arr.sort((a, b) => a.y - b.y);

    let depth = DEPTH.PLAYER;
    arr.forEach(obj => {
      if (obj.active || obj.y) {
        obj.setDepth(depth);
        depth += 0.1;
      }
    });
  }
}
