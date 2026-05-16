import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { NPC } from '../entities/NPC.js';
import { FishManager } from '../systems/FishManager.js';
import { FishingSystem } from '../systems/FishingSystem.js';
import { Inventory } from '../systems/Inventory.js';
import { WeatherSystem } from '../systems/WeatherSystem.js';
import { AudioManager } from '../systems/AudioManager.js';
import { AchievementSystem } from '../systems/AchievementSystem.js';
import { NotificationSystem } from '../systems/NotificationSystem.js';
import {
  COLORS, WORLD, DEPTH, SCALE, PHYSICS, ASSETS, GAME, EVENTS,
  KEYS, ANIMATION, CAMERA, NPCS, TIME
} from '../core/Constants.js';
import { eventBus } from '../core/EventBus.js';

export class FishingScene extends Phaser.Scene {
  constructor() {
    super({ key: 'FishingScene' });
    this.fishingState = 'IDLE';
    this.waterBounds = {
      top: WORLD.WATER_TOP,
      bottom: WORLD.WATER_BOTTOM,
      left: 0,
      right: GAME.WIDTH
    };
  }

  create() {
    this.fishData = this.cache.json.get('fishData');
    this.depthSortGroup = this.add.group();

    // Systems
    this.inventory    = new Inventory();
    this.fishManager  = new FishManager(this, this.fishData);
    this.fishingSystem = new FishingSystem(this);
    this.weatherSystem = new WeatherSystem(this);
    this.audioManager  = new AudioManager(this);
    this.achievementSystem  = new AchievementSystem(this);
    this.notificationSystem = new NotificationSystem(this);

    this.weatherSystem.start();
    this.audioManager.init();

    // Event bridges
    this.events.on('ui:showMessage', (text) => {
      eventBus.emit(EVENTS.UI_SHOW_MESSAGE, { text, duration: 3000 });
    });
    this.events.on('fishing:catch', (fish, weight, perfect) => {
      eventBus.emit(EVENTS.FISHING_CATCH, { fish, weight, perfect });
    });
    this.events.on('fishing:escape', (reason) => {
      eventBus.emit(EVENTS.FISHING_ESCAPE, { reason });
    });

    // World build order: back → front
    this.createSky();
    this.createClouds();
    this.createForest();
    this.createGrass();
    this.createSand();
    this.createFences();
    this.createBuildings();
    this.createAnimals();
    this.createWater();
    this.createBoats();
    this.createTreesForeground();

    // Player — start near first NPC cluster
    this.player = new Player(this, 300, WORLD.GRASS_BOTTOM - 12);

    // NPCs
    this.npcGroup = this.add.group();
    this.npcInstances = [];
    NPCS.forEach(cfg => {
      const npc = new NPC(this, cfg.x, cfg.y, cfg);
      npc.container.setData('name', cfg.name);
      npc.container.setData('role', cfg.role);
      this.npcGroup.add(npc.container);
      this.npcInstances.push(npc);
    });

    // Fish shadows
    this.fishManager.spawnFishShadows();

    // Camera — follows player, scrolls horizontally across 1920px world
    this.cameras.main.startFollow(this.player.container, true, CAMERA.LERP, CAMERA.LERP);
    this.cameras.main.setDeadzone(CAMERA.DEADZONE_W, CAMERA.DEADZONE_H);
    this.cameras.main.setBounds(0, 0, GAME.WIDTH, GAME.HEIGHT);

    // Input
    this.setupInput();
    this.setupEvents();

    // Day/night
    this.dayNightOverlay = this.add.rectangle(
      0, 0, GAME.WIDTH, GAME.HEIGHT, COLORS.SKY_NIGHT, 0
    ).setOrigin(0, 0).setDepth(DEPTH.UI_OVERLAY)
      .setScrollFactor(0)
      .setDisplaySize(GAME.WIDTH * 2, GAME.HEIGHT)
      .setBlendMode(Phaser.BlendModes.MULTIPLY);
    this.dayPhase = 1; // Start at daytime
    this.dayTimer = this.time.addEvent({
      delay: 200, loop: true, callback: () => this.updateDayNight()
    });

    // Recurring water ripples
    this.time.addEvent({
      delay: 800, loop: true, callback: () => this.spawnRipple()
    });

    // Launch UI overlay
    this.scene.launch('UIScene');

    // FPS counter (debug)
    this.fpsText = this.add.text(4, 4, '', {
      fontSize: '10px', fontFamily: 'monospace', color: '#88ff88',
      stroke: '#000000', strokeThickness: 2
    }).setDepth(DEPTH.UI).setScrollFactor(0).setAlpha(0.8);

    eventBus.emit(EVENTS.GAME_START);
  }

  // ── WORLD LAYERS ──────────────────────────────────────────────────────────

  createSky() {
    const canvas = document.createElement('canvas');
    canvas.width = 4; canvas.height = WORLD.SKY_BOTTOM;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, WORLD.SKY_BOTTOM);
    grad.addColorStop(0.0, '#0d2057');
    grad.addColorStop(0.4, '#1e4ca8');
    grad.addColorStop(1.0, '#87ceeb');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 4, WORLD.SKY_BOTTOM);
    this.textures.addCanvas('skyGradient', canvas);

    this.add.tileSprite(0, 0, GAME.WIDTH, WORLD.SKY_BOTTOM, 'skyGradient')
      .setOrigin(0, 0).setDepth(DEPTH.SKY);
  }

  createClouds() {
    const cloudCount = 20;
    for (let i = 0; i < cloudCount; i++) {
      const x = Phaser.Math.Between(0, GAME.WIDTH);
      const y = Phaser.Math.Between(4, WORLD.SKY_BOTTOM - 8);
      const w = Phaser.Math.Between(25, 60);
      const h = Phaser.Math.Between(6, 14);
      const cloud = this.add.ellipse(x, y, w, h, 0xffffff,
        Phaser.Math.FloatBetween(0.3, 0.6))
        .setDepth(DEPTH.CLOUDS);

      this.tweens.add({
        targets: cloud,
        x: x + Phaser.Math.Between(60, 120),
        duration: Phaser.Math.Between(20000, 40000),
        repeat: -1, yoyo: true, ease: 'Sine.easeInOut'
      });
    }
  }

  createForest() {
    if (this.textures.exists('trees_pine_growth')) {
      const treeCount = Math.floor(GAME.WIDTH / 30);
      for (let i = 0; i < treeCount; i++) {
        const x = Phaser.Math.Between(0, GAME.WIDTH);
        const y = WORLD.FOREST_BOTTOM - Phaser.Math.Between(0, 20);
        const tree = this.add.sprite(x, y, 'trees_pine_growth', i % 4)
          .setOrigin(0.5, 1).setDepth(DEPTH.TREES_BACK)
          .setScale(SCALE.TREE_PINE).setAlpha(0.75);
        this.depthSortGroup.add(tree);
      }
    } else {
      this.add.rectangle(
        GAME.WIDTH / 2,
        (WORLD.FOREST_TOP + WORLD.FOREST_BOTTOM) / 2,
        GAME.WIDTH, WORLD.FOREST_BOTTOM - WORLD.FOREST_TOP,
        0x0d3808
      ).setDepth(DEPTH.TREES_BACK);
    }
  }

  createGrass() {
    const grassY = (WORLD.GRASS_TOP + WORLD.GRASS_BOTTOM) / 2;
    const grassH = WORLD.GRASS_BOTTOM - WORLD.GRASS_TOP;
    if (this.textures.exists('terrain_grass')) {
      this.add.tileSprite(GAME.WIDTH / 2, grassY, GAME.WIDTH, grassH, 'terrain_grass')
        .setOrigin(0.5).setDepth(DEPTH.GROUND);
    } else {
      this.add.rectangle(GAME.WIDTH / 2, grassY, GAME.WIDTH, grassH, COLORS.GRASS)
        .setDepth(DEPTH.GROUND);
    }
    // Detail grass blades
    const gfx = this.add.graphics().setDepth(DEPTH.DECORATION);
    for (let i = 0; i < 300; i++) {
      const x = Phaser.Math.Between(0, GAME.WIDTH);
      const y = Phaser.Math.Between(WORLD.GRASS_TOP + 4, WORLD.GRASS_BOTTOM - 4);
      gfx.fillStyle(0x3a7a22, 0.7);
      gfx.fillRect(x, y, 2, 4);
    }
    // Flowers
    const fc = [0xff6b8a, 0xffdd44, 0x99bbff, 0xffaa44, 0xccffaa];
    for (let i = 0; i < 80; i++) {
      const x = Phaser.Math.Between(0, GAME.WIDTH);
      const y = Phaser.Math.Between(WORLD.GRASS_TOP + 8, WORLD.GRASS_BOTTOM - 8);
      gfx.fillStyle(fc[i % fc.length], 1);
      gfx.fillRect(x, y, 2, 2);
      gfx.fillStyle(fc[(i + 2) % fc.length], 0.5);
      gfx.fillRect(x - 1, y + 2, 4, 1);
    }
  }

  createSand() {
    const sandY = (WORLD.SAND_TOP + WORLD.SAND_BOTTOM) / 2;
    const sandH = WORLD.SAND_BOTTOM - WORLD.SAND_TOP;
    if (this.textures.exists('beach_tileset')) {
      this.add.tileSprite(GAME.WIDTH / 2, sandY, GAME.WIDTH, sandH, 'beach_tileset')
        .setOrigin(0.5).setDepth(DEPTH.GROUND);
    } else {
      this.add.rectangle(GAME.WIDTH / 2, sandY, GAME.WIDTH, sandH, COLORS.SAND)
        .setDepth(DEPTH.GROUND);
    }
    // Pebbles
    const gfx = this.add.graphics().setDepth(DEPTH.DECORATION);
    for (let i = 0; i < 120; i++) {
      const x = Phaser.Math.Between(0, GAME.WIDTH);
      const y = Phaser.Math.Between(WORLD.SAND_TOP + 2, WORLD.SAND_BOTTOM - 2);
      gfx.fillStyle(0xc8b060, 0.6);
      gfx.fillEllipse(x, y, Phaser.Math.Between(2, 4), 2);
    }
  }

  createFences() {
    const gfx = this.add.graphics().setDepth(DEPTH.DECORATION);
    // Only fence in the farm area (x=0 to x=700)
    for (let x = 10; x < 700; x += 22) {
      gfx.fillStyle(0x8b6a3a);
      gfx.fillRect(x, WORLD.SAND_TOP - 2, 2, 8);
      gfx.fillStyle(0x7a5a2a);
      gfx.fillRect(x, WORLD.SAND_TOP - 4, 20, 2);
    }
  }

  createBuildings() {
    // Spread across 1920px world: farm left, market center, greenhouse right
    const buildings = [
      // Farm cluster (x=50–450)
      { key: 'barn',        x: 130, y: WORLD.GRASS_BOTTOM, scale: SCALE.BUILDING },
      { key: 'grain_silo',  x: 260, y: WORLD.GRASS_BOTTOM, scale: SCALE.BUILDING * 0.85 },
      { key: 'chicken_coop',x: 380, y: WORLD.GRASS_BOTTOM, scale: SCALE.BUILDING * 0.7 },
      // Market / village center (x=700–1200)
      { key: 'fish_market', x: 850, y: WORLD.GRASS_BOTTOM, scale: SCALE.BUILDING, frame: 0 },
      // Greenhouse east (x=1300–1700)
      { key: 'greenhouse',  x: 1400, y: WORLD.GRASS_BOTTOM, scale: SCALE.BUILDING * 0.9 },
    ];

    buildings.forEach(cfg => {
      if (!this.textures.exists(cfg.key)) return;
      const spr = this.add.sprite(cfg.x, cfg.y, cfg.key, cfg.frame ?? 0)
        .setOrigin(0.5, 1).setDepth(DEPTH.BUILDINGS).setScale(cfg.scale);
      this.depthSortGroup.add(spr);
    });
  }

  createAnimals() {
    const CHICKEN_COLORS = ['gray','red','white','yellow'];
    const PIG_COLORS     = ['gray','pink','yellow'];

    // 5 colored chickens near coop — each random color, wanders
    for (let i = 0; i < 5; i++) {
      const color  = CHICKEN_COLORS[i % CHICKEN_COLORS.length];
      const wkKey  = `chicken_${color}_walk`;
      const texKey = this.textures.exists(`chicken_${color}_walk`) ? `chicken_${color}_walk`
                   : this.textures.exists('chicken_walk') ? 'chicken_walk'
                   : 'chicken_idle';
      if (!this.textures.exists(texKey)) continue;

      const x = 380 + Phaser.Math.Between(-50, 50);
      const y = WORLD.GRASS_BOTTOM - 6 + Phaser.Math.Between(-10, 4);
      const chick = this.add.sprite(x, y, texKey, 0)
        .setOrigin(0.5, 1).setDepth(DEPTH.NPC).setScale(SCALE.ANIMAL);

      // Play walk anim or peck occasionally
      const walkAnim = this.anims.exists(wkKey) ? wkKey : 'chicken_walk';
      const peckAnim = `chicken_${color}_peck`;
      if (this.anims.exists(walkAnim)) chick.play(walkAnim);

      // Wander left/right
      this.tweens.add({
        targets: chick,
        x: x + Phaser.Math.Between(-30, 30),
        duration: Phaser.Math.Between(1800, 3500),
        repeat: -1, yoyo: true, ease: 'Sine.easeInOut',
        onYoyo: () => { chick.flipX = !chick.flipX; }
      });
      // Occasional peck
      this.time.addEvent({
        delay: Phaser.Math.Between(4000, 8000), loop: true,
        callback: () => {
          if (this.anims.exists(peckAnim)) {
            chick.play(peckAnim);
            this.time.delayedCall(800, () => {
              if (this.anims.exists(walkAnim)) chick.play(walkAnim);
            });
          }
        }
      });
      this.depthSortGroup.add(chick);
    }

    // A few chicks near the coop
    for (let i = 0; i < 3; i++) {
      const texKey = this.textures.exists('chick_walk') ? 'chick_walk' : 'chick';
      if (!this.textures.exists(texKey)) continue;
      const x = 380 + Phaser.Math.Between(-30, 30);
      const y = WORLD.GRASS_BOTTOM - 3 + Phaser.Math.Between(-4, 2);
      const baby = this.add.sprite(x, y, texKey, 0)
        .setOrigin(0.5, 1).setDepth(DEPTH.NPC).setScale(SCALE.ANIMAL * 0.7);
      if (this.anims.exists('chick_walk')) baby.play('chick_walk');
      this.tweens.add({
        targets: baby, x: x + Phaser.Math.Between(-15, 15),
        duration: Phaser.Math.Between(1200, 2500), repeat: -1, yoyo: true, ease: 'Sine'
      });
      this.depthSortGroup.add(baby);
    }

    // Cow near the barn — uses dedicated cow animations
    const cowTex = this.textures.exists('cow_sub_idle') ? 'cow_sub_idle'
                 : this.textures.exists('cow_idle') ? 'cow_idle' : null;
    if (cowTex) {
      const cow = this.add.sprite(160, WORLD.GRASS_BOTTOM - 8, cowTex, 0)
        .setOrigin(0.5, 1).setDepth(DEPTH.NPC).setScale(SCALE.ANIMAL * 1.2);
      const cowAnim = this.anims.exists('cow_idle') ? 'cow_idle' : null;
      if (cowAnim) cow.play(cowAnim);
      this.depthSortGroup.add(cow);
    }

    // Colored pigs near the grain silo
    PIG_COLORS.forEach((color, idx) => {
      const wkKey  = `pig_${color}_walk`;
      const texKey = this.textures.exists(wkKey) ? wkKey
                   : this.textures.exists('pig_walk') ? 'pig_walk' : null;
      if (!texKey) return;
      const x = 250 + idx * 30 + Phaser.Math.Between(-10, 10);
      const y = WORLD.GRASS_BOTTOM - 5;
      const pig = this.add.sprite(x, y, texKey, 0)
        .setOrigin(0.5, 1).setDepth(DEPTH.NPC).setScale(SCALE.ANIMAL * 1.1);
      const animKey = this.anims.exists(wkKey) ? wkKey : 'pig_walk';
      if (this.anims.exists(animKey)) pig.play(animKey);
      this.tweens.add({
        targets: pig, x: x + Phaser.Math.Between(-20, 20),
        duration: Phaser.Math.Between(2000, 4000), repeat: -1, yoyo: true, ease: 'Sine'
      });
      this.depthSortGroup.add(pig);
    });

    // Piglet near pigs
    if (this.textures.exists('piglet_walk')) {
      const piglet = this.add.sprite(280, WORLD.GRASS_BOTTOM - 4, 'piglet_walk', 0)
        .setOrigin(0.5, 1).setDepth(DEPTH.NPC).setScale(SCALE.ANIMAL * 0.65);
      if (this.anims.exists('piglet_walk')) piglet.play('piglet_walk');
      this.depthSortGroup.add(piglet);
    }
  }

  createWater() {
    const waterY = (WORLD.WATER_TOP + WORLD.WATER_BOTTOM) / 2;
    const waterH = WORLD.WATER_BOTTOM - WORLD.WATER_TOP;

    // Base water
    this.add.rectangle(GAME.WIDTH / 2, waterY, GAME.WIDTH, waterH, COLORS.WATER)
      .setOrigin(0.5).setDepth(DEPTH.GROUND);

    // Deep area
    this.add.rectangle(
      GAME.WIDTH / 2,
      WORLD.WATER_TOP + waterH * 0.55,
      GAME.WIDTH, waterH * 0.45,
      COLORS.WATER_DEEP
    ).setDepth(DEPTH.GROUND - 0.1);

    // Animated wave strip at waterline
    this.waveGfx = this.add.graphics().setDepth(DEPTH.WATER_SURFACE);
    this.waveOffset = 0;
    this.drawWaves();

    // Shoreline highlight
    const shore = this.add.graphics().setDepth(DEPTH.WATER_SURFACE + 1);
    shore.fillStyle(0xffffff, 0.18);
    shore.fillRect(0, WORLD.WATER_TOP, GAME.WIDTH, 3);
  }

  drawWaves() {
    if (!this.waveGfx) return;
    this.waveGfx.clear();
    this.waveGfx.fillStyle(0xffffff, 0.2);
    for (let x = 0; x < GAME.WIDTH; x += 6) {
      const y = WORLD.WATER_TOP + 4 + Math.sin((x + this.waveOffset) * 0.06) * 2.5;
      this.waveGfx.fillRect(x, y, 4, 1);
    }
    this.waveGfx.fillStyle(0xffffff, 0.08);
    for (let x = 0; x < GAME.WIDTH; x += 10) {
      const y = WORLD.WATER_TOP + 10 + Math.sin((x + this.waveOffset * 0.7) * 0.04) * 3;
      this.waveGfx.fillRect(x, y, 6, 1);
    }
  }

  spawnRipple() {
    if (!this.anims.exists('ripple')) return;
    const rx = Phaser.Math.Between(20, GAME.WIDTH - 20);
    const ry = Phaser.Math.Between(WORLD.WATER_TOP + 8, WORLD.WATER_BOTTOM - 30);
    const r = this.add.sprite(rx, ry, 'water_ripple', 0)
      .setDepth(DEPTH.WATER_SURFACE + 2).play('ripple');
    r.on('animationcomplete', () => r.destroy());
  }

  createBoats() {
    // Spread boats across full width, stay above sortDepth by using fixed BOATS depth
    const boatDefs = [
      { type: 'boat_blue',   x: 200,  y: WORLD.WATER_TOP + 22 },
      { type: 'boat_yellow', x: 480,  y: WORLD.WATER_TOP + 38 },
      { type: 'boat_small',  x: 720,  y: WORLD.WATER_TOP + 28 },
      { type: 'boat_blue',   x: 1050, y: WORLD.WATER_TOP + 32 },
      { type: 'boat_small',  x: 1280, y: WORLD.WATER_TOP + 24 },
      { type: 'boat_yellow', x: 1550, y: WORLD.WATER_TOP + 35 },
      { type: 'boat_small',  x: 1780, y: WORLD.WATER_TOP + 26 },
    ];

    boatDefs.forEach(cfg => {
      if (!this.textures.exists(cfg.type)) return;
      const boat = this.add.sprite(cfg.x, cfg.y, cfg.type, 0)
        .setOrigin(0.5, 0.5).setDepth(DEPTH.BOATS).setScale(SCALE.BOAT);
      // Bob
      this.tweens.add({
        targets: boat, y: cfg.y + Phaser.Math.Between(2, 4),
        duration: Phaser.Math.Between(1400, 2600), repeat: -1, yoyo: true, ease: 'Sine.easeInOut'
      });
      // Rock
      this.tweens.add({
        targets: boat, angle: Phaser.Math.Between(-3, 3),
        duration: Phaser.Math.Between(2000, 4000), repeat: -1, yoyo: true, ease: 'Sine.easeInOut'
      });
    });
  }

  createTreesForeground() {
    // Palm trees along the beach edge across full width
    const palmSpacing = 120;
    for (let x = 40; x < GAME.WIDTH; x += palmSpacing + Phaser.Math.Between(-20, 20)) {
      if (this.textures.exists('palm_tree')) {
        const tree = this.add.sprite(x, WORLD.SAND_TOP + 6, 'palm_tree', 0)
          .setOrigin(0.5, 1).setDepth(DEPTH.TREES_FORE).setScale(SCALE.TREE_PALM);
        if (this.anims.exists('palm_sway')) tree.play('palm_sway');
        this.depthSortGroup.add(tree);
      }
    }

    // Apple and peach trees in the farm area and greenhouse area
    const fruitTrees = [
      { key: 'apple_tree', x: 100,  y: WORLD.GRASS_TOP + 12 },
      { key: 'peach_tree', x: 220,  y: WORLD.GRASS_TOP + 14 },
      { key: 'apple_tree', x: 1350, y: WORLD.GRASS_TOP + 10 },
      { key: 'peach_tree', x: 1480, y: WORLD.GRASS_TOP + 15 },
    ];
    fruitTrees.forEach(t => {
      if (!this.textures.exists(t.key)) return;
      const tree = this.add.sprite(t.x, t.y, t.key)
        .setOrigin(0.5, 1).setDepth(DEPTH.TREES_FORE)
        .setScale(SCALE.TREE_OAK * 0.65);
      this.depthSortGroup.add(tree);
    });
  }

  /** Current time of day from dayPhase */
  get timeOfDay() {
    if (this.dayPhase === undefined) return 'day';
    return TIME.PHASES[Math.floor(this.dayPhase) % TIME.PHASES.length];
  }

  // ── INPUT ────────────────────────────────────────────────────────────────

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
    this.keyE.on('down',     () => this.handleInteract());
    this.keyI.on('down',     () => this.handleInventory());
  }

  handleFishingInput() {
    const fs = this.fishingSystem;
    if (!fs) return;
    const atWater = this.player.y >= WORLD.SAND_TOP;

    switch (this.fishingState) {
      case 'IDLE':
        if (atWater) {
          fs.startCasting(this.player, {});
          this.fishingState = 'CASTING';
          this.player.startFishing();
        } else {
          this.notify('Walk to the water to fish! (press S / ↓)', 2500);
        }
        break;
      case 'WAITING':
        break;
      case 'BITE':
        fs.triggerHook?.();
        this.fishingState = 'HOOKED';
        break;
      case 'REELING':
        fs.minigamePress?.();
        break;
    }
  }

  handleInteract() {
    const nearby = this.findNearbyNPC();
    if (nearby) {
      const name = nearby.getData('name');
      const role = nearby.getData('role') || 'villager';
      this.notify(`${name}: "Welcome, angler!"`, 3000);
    }
  }

  handleInventory() { eventBus.emit(EVENTS.UI_TOGGLE_INVENTORY); }

  /** Convenience wrapper — notification system accepts both string and object */
  notify(text, duration = 2000) {
    eventBus.emit(EVENTS.UI_SHOW_MESSAGE, { text, duration });
  }

  findNearbyNPC() {
    let closest = null, closestDist = 48;
    this.npcGroup.getChildren().forEach(npc => {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y);
      if (d < closestDist) { closestDist = d; closest = npc; }
    });
    return closest;
  }

  // ── EVENTS ──────────────────────────────────────────────────────────────

  setupEvents() {
    eventBus.on(EVENTS.FISHING_BITE, () => {
      this.fishingState = 'BITE';
      this.player.playReel?.();
      this.notify('Fish on! Press SPACE to hook it! 🎣', 2500);
    });

    eventBus.on(EVENTS.FISHING_CATCH, ({ fish, weight, perfect }) => {
      this.fishingState = 'IDLE';
      this.inventory.addFish(fish, weight, {
        weather: this.weatherSystem?.currentWeather || 'sunny',
        timeOfDay: this.timeOfDay, perfect
      });
      this.achievementSystem.recordCatch(fish, weight, {
        weather: this.weatherSystem?.currentWeather || 'sunny',
        timeOfDay: this.timeOfDay, perfect
      });
      this.player.stopFishing?.();
      const stars = perfect ? ' ⭐ PERFECT!' : '';
      this.notify(`Caught ${fish.name}! ${weight?.toFixed(1)}kg${stars}`, 3500);
    });

    eventBus.on(EVENTS.FISHING_ESCAPE, () => {
      this.fishingState = 'IDLE';
      this.player.stopFishing?.();
      this.notify('It got away! Try again.', 2000);
    });

    eventBus.on(EVENTS.GAME_PAUSE, () => this.scene.pause());
  }

  // ── DAY/NIGHT ────────────────────────────────────────────────────────────

  updateDayNight() {
    const phases = [
      { color: COLORS.SKY_DAWN,  alpha: 0.12 },
      { color: COLORS.SKY_DAY,   alpha: 0.0  },
      { color: COLORS.SKY_DUSK,  alpha: 0.18 },
      { color: COLORS.SKY_NIGHT, alpha: 0.32 }
    ];
    const idx = Math.floor(this.dayPhase) % phases.length;
    const { color, alpha } = phases[idx];
    this.dayNightOverlay.setFillStyle(color, alpha);
    this.dayPhase += 0.0004;
    const icons = ['🌅','☀️','🌆','🌙'];
    eventBus.emit(EVENTS.TIME_CHANGE, { icon: icons[idx] });
  }

  // ── UPDATE ──────────────────────────────────────────────────────────────

  update(time, delta) {
    const input = {
      up:    this.cursors.up.isDown    || this.keyW.isDown,
      down:  this.cursors.down.isDown  || this.keyS.isDown,
      left:  this.cursors.left.isDown  || this.keyA.isDown,
      right: this.cursors.right.isDown || this.keyD.isDown
    };
    this.player.setInputState(input);
    this.player.update(delta);

    // Sync fishing state
    const fsState = this.fishingSystem?.state;
    if (fsState === 'waiting')  this.fishingState = 'WAITING';
    if (fsState === 'bite')     this.fishingState = 'BITE';
    if (fsState === 'minigame') this.fishingState = 'REELING';
    if (fsState === 'idle' || fsState === 'success' || fsState === 'fail') {
      if (this.fishingState !== 'IDLE') this.fishingState = 'IDLE';
    }

    this.fishingSystem?.update?.();

    // Animate waves
    this.waveOffset += delta * 0.04;
    this.drawWaves();

    // NPC updates
    this.npcInstances?.forEach(n => n.update?.());

    this.sortDepth();

    if (this.fpsText) {
      this.fpsText.setText(`FPS:${Math.round(this.game.loop.actualFps)}`);
    }
  }

  sortDepth() {
    // Sort character-layer objects by Y (depth-sort), leaving boats/terrain at fixed depths
    const arr = [
      ...this.depthSortGroup.getChildren(),
      this.player.container,
      ...this.npcGroup.getChildren()
    ].filter(Boolean);

    arr.sort((a, b) => a.y - b.y);
    let d = DEPTH.PLAYER;
    arr.forEach(obj => { if (obj.active) { obj.setDepth(d); d += 0.1; } });
  }
}
