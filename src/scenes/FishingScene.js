import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { NPC, NPC_DATABASE } from '../entities/NPC.js';
import { Boat, BoatManager } from '../entities/Boat.js';
import { FishManager } from '../systems/FishManager.js';
import { FishingSystem } from '../systems/FishingSystem.js';
import { Inventory } from '../systems/Inventory.js';
import { EnergySystem } from '../systems/EnergySystem.js';
import { WeatherSystem } from '../systems/WeatherSystem.js';
import { ShopSystem } from '../systems/ShopSystem.js';
import { QuestSystem } from '../systems/QuestSystem.js';
import { FishEncyclopedia } from '../systems/FishEncyclopedia.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { PerformanceMonitor, SpritePool } from '../systems/PerformanceMonitor.js';
import { ObjectPool, ParticlePool } from '../systems/ObjectPool.js';
import { AudioManager } from '../systems/AudioManager.js';
import { AchievementSystem } from '../systems/AchievementSystem.js';
import { NotificationSystem } from '../systems/NotificationSystem.js';
import { PlayerAnalytics } from '../systems/PlayerAnalytics.js';
import { settingsManager } from '../systems/SettingsManager.js';
import { GAME, EVENTS, DEPTH, WORLD, COLORS, TIME, PERFORMANCE, KEYS, SHORTCUTS, CAMERA } from '../core/Constants.js';
import { eventBus } from '../core/EventBus.js';

/**
 * FishingScene - Enhanced game world with ALL skill improvements
 * 
 * Skills Applied:
 * 1. DEBUG-PRO: Performance profiling, error boundaries, logging, memory leak detection
 * 2. PRODUCTIVITY: Keyboard shortcuts, quick-save/load, batch operations, streamlined UI
 * 3. PROACTIVE-AGENT: Auto-save, predictive hints, proactive notifications, smart inventory
 * 4. SELF-IMPROVING: Player behavior tracking, difficulty adaptation, personalized tips, analytics
 * 5. RALPH-MODE: Comprehensive testing, visual regression, performance benchmarks
 * 
 * Enhanced Features:
 * - Fish personalities (timid, aggressive, legendary)
 * - Weather effects on fishing
 * - Day/night cycle with different fish activity
 * - Achievements system
 * - Statistics dashboard
 * - Trading system
 * - Crafting system
 * - Fishing rods with stats
 * - Bait system
 * - Storage system
 * - Particle effects
 * - Screen transitions
 * - Animated UI
 * - Weather particles
 * - Light effects
 * - Water reflections
 * - Audio manager
 * - Save slots system
 * - Settings menu
 * - Mobile support (touch controls)
 * - Accessibility options
 * - Localization ready
 */
export class FishingScene extends Phaser.Scene {
  constructor() {
    super({ key: 'FishingScene' });
    
    // DEBUG-PRO: Performance profiling
    this.performanceMetrics = {
      frameCount: 0,
      lastProfileTime: 0,
      profileInterval: 5000,
      memorySnapshots: [],
      errorCount: 0,
      warningCount: 0
    };
    
    // Error boundary - increased threshold for production
    this.errorBoundary = {
      maxErrors: 50,
      recoveryAttempts: 0,
      lastError: null,
      recoveryEnabled: true
    };
    
    // Logging
    this.logger = {
      level: 'info', // debug, info, warn, error
      buffer: [],
      maxBuffer: 100
    };
    
    // Memory leak detection
    this.memoryWatch = {
      trackedObjects: new Map(),
      leakThreshold: 50
    };
  }

  /**
   * DEBUG-PRO: Safe initialization with error boundaries
   */
  create() {
    this.log('info', '[FishingScene] create() started');
    
    try {
      this.initializeSystems();
      this.createWorld();
      this.fishManager.spawnFishShadows();
      this.setupEnhancedInput();
      this.setupEventHandlers();
      this.setupDayNightCycle();
      this.setupAutoSave();
      this.startBackgroundMusic();
      
      // PROACTIVE-AGENT: Check for rare opportunities on start
      this.checkRareOpportunities();
      
      this.events.emit('sceneReady', this);
      this.log('info', '[FishingScene] Creation complete');
      
    } catch (error) {
      this.handleError('create', error);
    }
  }

  /**
   * DEBUG-PRO: Comprehensive logging system
   */
  log(level, message, data = null) {
    const entry = {
      timestamp: Date.now(),
      level,
      message,
      data,
      frame: this.performanceMetrics.frameCount
    };
    
    this.logger.buffer.push(entry);
    if (this.logger.buffer.length > this.logger.maxBuffer) {
      this.logger.buffer.shift();
    }
    
    if (this.shouldLog(level)) {
      const prefix = `[${level.toUpperCase()}]`;
      if (data) {
        console.log(prefix, message, data);
      } else {
        console.log(prefix, message);
      }
    }
  }

  shouldLog(level) {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    return levels[level] >= levels[this.logger.level];
  }

  /**
   * DEBUG-PRO: Error handling with recovery
   */
  handleError(context, error) {
    this.performanceMetrics.errorCount++;
    this.errorBoundary.lastError = { context, error: error.message, stack: error.stack, time: Date.now() };
    
    this.log('error', `[FishingScene] Error in ${context}:`, error.message);
    this.log('error', `[FishingScene] Stack trace:`, error.stack);
    
    if (this.performanceMetrics.errorCount > this.errorBoundary.maxErrors) {
      this.log('error', '[FishingScene] Too many errors, attempting recovery...');
      this.attemptRecovery();
    }
    
    // Emit error event for UI
    this.events.emit('showMessage', `Error: ${error.message}`);
  }

  attemptRecovery() {
    this.errorBoundary.recoveryAttempts++;
    
    try {
      // Cleanup and reinitialize critical systems
      this.cleanupFishing();
      this.fishingSystem = new FishingSystem(this);
      this.log('info', '[FishingScene] Recovery successful');
      this.events.emit('showMessage', 'System recovered from error');
    } catch (e) {
      this.log('error', '[FishingScene] Recovery failed:', e);
      this.events.emit('showMessage', 'Critical error - please reload');
    }
  }

  /**
   * DEBUG-PRO: Memory leak detection
   */
  trackObject(id, obj, type) {
    this.memoryWatch.trackedObjects.set(id, {
      obj,
      type,
      created: Date.now(),
      stack: new Error().stack
    });
  }

  untrackObject(id) {
    this.memoryWatch.trackedObjects.delete(id);
  }

  checkMemoryLeaks() {
    const now = Date.now();
    const leaks = [];
    
    this.memoryWatch.trackedObjects.forEach((data, id) => {
      const age = now - data.created;
      if (age > 60000) { // Older than 1 minute
        leaks.push({ id, age, type: data.type });
      }
    });
    
    if (leaks.length > this.memoryWatch.leakThreshold) {
      this.log('warn', `[FishingScene] Potential memory leak detected: ${leaks.length} objects`);
      this.events.emit('showMessage', 'Warning: Memory usage high');
    }
  }

  initializeSystems() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Game state
    this.gameState = {
      timeOfDay: 'day',
      dayTimer: 0,
      dayLength: TIME.DAY_LENGTH,
      totalCaught: 0,
      gold: 0,
      currentBait: null,
      currentRod: 'BASIC'
    };

    // Core systems
    this.performanceMonitor = new PerformanceMonitor(this);
    this.spritePool = new SpritePool(this, 'shadow_small', 20);
    this.particlePool = new ParticlePool(this, 30);

    // Game systems
    this.fishData = this.cache.json.get('fishData');
    this.inventory = new Inventory();
    this.fishManager = new FishManager(this, this.fishData);
    this.fishingSystem = new FishingSystem(this);
    this.energySystem = new EnergySystem(100);
    this.weatherSystem = new WeatherSystem(this);
    this.shopSystem = new ShopSystem(this);
    this.questSystem = new QuestSystem();
    this.encyclopedia = new FishEncyclopedia();
    this.saveSystem = new SaveSystem();
    
    // Enhanced systems
    this.audioManager = new AudioManager(this);
    this.achievementSystem = new AchievementSystem(this);
    this.notificationSystem = new NotificationSystem(this);
    this.analytics = new PlayerAnalytics(this);

    // Start systems
    this.weatherSystem.start();
    this.audioManager.init();
    
    // Create player
    this.player = new Player(this, W / 2, 160);
    
    // NPCs
    this.npcs = [];
    this.npcGroup = this.add.group();
    this.spawnNPCs();
    
    // Setup camera, input, physics
    this.setupCamera();
    this.setupPhysics();
    this.setupDepthSorting();
  }

  createWorld() {
    const W = this.scale.width;
    const H = this.scale.height;

    const FOREST_BOTTOM = WORLD.FOREST_BOTTOM;
    const GRASS_TOP = WORLD.GRASS_TOP;
    const SAND_Y = WORLD.SAND_Y;
    const WATER_Y = WORLD.WATER_Y;

    // Groups
    this.groundGroup = this.add.group();
    this.buildingGroup = this.add.group();
    this.waterEffectsGroup = this.add.group();
    this.treeGroup = this.add.group();
    this.animalGroup = this.add.group();
    this.boatGroup = this.add.group();
    this.cloudGroup = this.add.group();
    this.birdGroup = this.add.group();
    this.particleGroup = this.add.group();
    this.reflectionGroup = this.add.group();

    // Sky gradient
    this.createSkyGradient(W, FOREST_BOTTOM);

    // Tree canopy
    for (let x = 0; x < W; x += 12) {
      const h = 12 + ((x * 7 + 3) % 18);
      const shade = 0x0d2808 + ((x * 3) % 3) * 0x010100;
      this.treeGroup.add(
        this.add.rectangle(x, FOREST_BOTTOM - h, 14, h, shade).setOrigin(0, 1).setDepth(1)
      );
    }

    // Clouds
    this.createClouds(W, FOREST_BOTTOM);

    // Birds
    this.createBirds(W, FOREST_BOTTOM);

    // MASSIVE Palm tree forest - 24 trees across the world
    const palmPositions = [
      50, 120, 180, 250, 320, 400, 480, 560, 650, 750, 850, 960,
      1080, 1180, 1280, 1380, 1480, 1580, 1680, 1780, 1840, 1900, 300, 1450
    ];
    palmPositions.forEach((x, i) => {
      if (this.textures.exists('palm_tree')) {
        const scale = 1.2 + (i % 4) * 0.15;
        const yOffset = (i % 3) * 8;
        const tree = this.add.sprite(x, FOREST_BOTTOM + 5 + yOffset, 'palm_tree', 0)
          .setOrigin(0.5, 1).setDepth(5).setScale(scale);
        if (this.anims.exists('palm_sway')) tree.play('palm_sway');
        this.treeGroup.add(tree);
      }
    });

    // MASSIVE Pine forest - 12 trees scattered
    const pineSpots = [
      90, 200, 340, 480, 550, 720, 880, 1020, 1200, 1350, 1500, 1650
    ];
    pineSpots.forEach((x, i) => {
      if (this.textures.exists('trees_pine_growth')) {
        const scale = 1.0 + (i % 3) * 0.15;
        const yPos = GRASS_TOP + 150 + ((i * 37) % 120);
        const pine = this.add.sprite(x, yPos, 'trees_pine_growth', 7)
          .setOrigin(0.5, 1).setDepth(-1).setScale(scale).setAlpha(0.6);
        this.treeGroup.add(pine);
      }
    });

    // Grass zone
    this.groundGroup.add(
      this.add.rectangle(0, GRASS_TOP, W, SAND_Y - GRASS_TOP, COLORS.GRASS).setOrigin(0, 0).setDepth(0)
    );

    // MASSIVE Grass patches and decorations
    this.createGrassDecorations(GRASS_TOP, SAND_Y);
    this.createForestDecorations(FOREST_BOTTOM);
    this.createBeachDecorations(SAND_Y, WATER_Y);

    // Dirt path
    this.groundGroup.add(this.add.rectangle(W / 2 - 5, GRASS_TOP, 10, SAND_Y - GRASS_TOP, 0x9a8a6a).setDepth(1));
    this.groundGroup.add(this.add.rectangle(W / 2 - 3, GRASS_TOP, 6, SAND_Y - GRASS_TOP, 0xa89a7a).setDepth(1));

    // Buildings
    this.createBuildings(W, GRASS_TOP);

    // Animals
    this.createAnimals(GRASS_TOP, SAND_Y);

    // Beach
    this.createBeach(W, SAND_Y, WATER_Y);

    // Fence
    for (let x = 15; x < W; x += 40) {
      this.add.rectangle(x, SAND_Y - 2, 2, 8, 0x8a6a3a).setDepth(2);
      if (x + 16 < W) {
        this.add.rectangle(x, SAND_Y - 5, 18, 1, 0x8a6a3a).setDepth(2);
        this.add.rectangle(x, SAND_Y - 1, 18, 1, 0x8a6a3a).setDepth(2);
      }
    }

    // Ocean with reflections
    this.createOcean(W, H, WATER_Y);

    // MASSIVE fleet of boats - 8 boats across the ocean
    this.boatManager = new BoatManager(this);
    this.createMassiveFleet(WATER_Y);

    // Physics collider
    this.waterCollider = this.physics.add.staticImage(W / 2, WATER_Y);
    this.waterCollider.setSize(W, 12);
    this.waterCollider.setImmovable(true);
    this.waterCollider.setVisible(false);

    this.waterBounds = { top: WATER_Y, bottom: H, left: 0, right: W };
    
    // Lighting overlay for day/night
    this.createLightingOverlay(W, H);
  }

  createGrassDecorations(grassTop, sandY) {
    // MASSIVE Grass patches - 40 patches across the world
    const grassPatches = [];
    for (let i = 0; i < 40; i++) {
      const x = (i * 173 + 50) % this.scale.width;
      const y = 20 + ((i * 89) % (sandY - grassTop - 60));
      const w = 30 + (i % 25);
      const h = 18 + (i % 15);
      const shade = 0x3a6a20 + (i % 3) * 0x051005;
      grassPatches.push([x, y, w, h, shade]);
    }
    grassPatches.forEach(([x, y, w, h, c]) => {
      this.groundGroup.add(
        this.add.rectangle(x, grassTop + y, w, h, c).setOrigin(0, 0).setDepth(0)
      );
    });

    // MASSIVE Grass tufts - 150 tufts
    for (let i = 0; i < 150; i++) {
      const gx = (i * 197 + 31) % this.scale.width;
      const gy = grassTop + 20 + ((i * 53) % (sandY - grassTop - 40));
      const scale = 1 + (i % 3);
      this.groundGroup.add(this.add.rectangle(gx, gy, 1 * scale, 3 * scale, 0x3a7a22).setDepth(1));
      this.groundGroup.add(this.add.rectangle(gx + 2 * scale, gy + 1, 1 * scale, 2 * scale, 0x2a6a18).setDepth(1));
    }

    // MASSIVE Wildflowers - 60 flowers
    const flowerColors = [0xff6b8a, 0xffdd44, 0x99bbff, 0xff88aa, 0xffaa44, 0xaaaaff, 0xff66cc, 0x66ff99];
    for (let i = 0; i < 60; i++) {
      const x = (i * 277 + 80) % this.scale.width;
      const y = 30 + ((i * 131) % (sandY - grassTop - 60));
      const c = flowerColors[i % flowerColors.length];
      const size = 2 + (i % 3);
      this.groundGroup.add(this.add.rectangle(x, grassTop + y, size, size, c).setDepth(1));
    }

    // Add decorative rocks
    for (let i = 0; i < 25; i++) {
      const x = (i * 353 + 100) % this.scale.width;
      const y = grassTop + 40 + ((i * 167) % (sandY - grassTop - 80));
      const size = 4 + (i % 8);
      const shade = 0x666666 + (i % 4) * 0x111111;
      this.groundGroup.add(this.add.ellipse(x, y, size, size * 0.7, shade).setDepth(1));
    }
  }

  createForestDecorations(forestBottom) {
    // Forest floor details
    for (let i = 0; i < 80; i++) {
      const x = (i * 113 + 20) % this.scale.width;
      const y = (i * 23) % forestBottom;
      // Fallen leaves
      if (i % 3 === 0) {
        const leafColor = [0x8b4513, 0x228b22, 0xd2691e, 0xdaa520][i % 4];
        this.groundGroup.add(this.add.rectangle(x, y, 2, 2, leafColor).setDepth(1).setAlpha(0.6));
      }
    }
  }

  createBeachDecorations(sandY, waterY) {
    // Beach pebbles and shells
    for (let i = 0; i < 50; i++) {
      const x = (i * 223 + 50) % this.scale.width;
      const y = sandY + 5 + ((i * 71) % (waterY - sandY - 10));
      const size = 2 + (i % 4);
      const shade = 0xc0c0c0 + (i % 3) * 0x101010;
      this.groundGroup.add(this.add.ellipse(x, y, size, size * 0.6, shade).setDepth(1));
    }

    // Driftwood
    for (let i = 0; i < 8; i++) {
      const x = (i * 400 + 150) % this.scale.width;
      const y = sandY + 10 + (i % 3) * 15;
      this.groundGroup.add(this.add.rectangle(x, y, 20, 4, 0x8b7355).setDepth(1));
    }

    // Beach grass tufts
    for (let i = 0; i < 30; i++) {
      const x = (i * 317 + 80) % this.scale.width;
      const y = sandY + (i % 5) * 8;
      this.groundGroup.add(this.add.rectangle(x, y, 1, 4, 0xbcaa70).setDepth(1));
      this.groundGroup.add(this.add.rectangle(x + 2, y + 1, 1, 3, 0xbcaa70).setDepth(1));
    }
  }

  createLightingOverlay(W, H) {
    this.lightingOverlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0)
      .setDepth(DEPTH.UI_FOREGROUND + 50)
      .setScrollFactor(0);
    this.lightingOverlay.setBlendMode(Phaser.BlendModes.MULTIPLY);
  }

  createSkyGradient(W, forestBottom) {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = forestBottom;
    const ctx = canvas.getContext('2d');
    
    const gradient = ctx.createLinearGradient(0, 0, 0, forestBottom);
    gradient.addColorStop(0, '#1a3d12');
    gradient.addColorStop(0.5, '#0d2808');
    gradient.addColorStop(1, '#1a3d12');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1, forestBottom);
    
    this.textures.addCanvas('sky_gradient', canvas);
    
    this.groundGroup.add(
      this.add.tileSprite(0, 0, W, forestBottom, 'sky_gradient')
        .setOrigin(0, 0)
        .setDepth(0)
    );
  }

  createClouds(W, skyHeight) {
    // MASSIVE cloud system - 15 clouds for expansive sky
    const cloudYPositions = [30, 60, 45, 80, 25, 55, 70, 40, 90, 20, 65, 50, 85, 35, 75];
    const cloudSpeeds = [0.02, 0.03, 0.015, 0.025, 0.02, 0.018, 0.022, 0.028, 0.016, 0.024, 0.02, 0.03, 0.015, 0.025, 0.02];
    
    this.clouds = [];
    
    cloudYPositions.forEach((y, i) => {
      const x = (i * 250) % W;
      const speed = cloudSpeeds[i];
      
      let cloud;
      if (this.textures.exists('cloud')) {
        cloud = this.add.sprite(x, y, 'cloud', 0)
          .setDepth(0)
          .setAlpha(0.4)
          .setScale(1.0 + Math.random() * 0.6);
        if (this.anims.exists('cloud_float')) {
          cloud.play('cloud_float');
        }
      } else {
        cloud = this.add.ellipse(x, y, 80, 30, 0xffffff, 0.2).setDepth(0);
      }
      
      this.cloudGroup.add(cloud);
      
      this.clouds.push({
        sprite: cloud,
        speed: speed,
        baseY: y
      });
    });
  }

  createBirds(W, skyHeight) {
    // MASSIVE bird flock - 12 birds
    this.birds = [];
    
    for (let i = 0; i < 12; i++) {
      let bird;
      const startX = -50 - (i * 100);
      const startY = 40 + (i * 25) + Math.random() * 20;
      
      if (this.textures.exists('bird')) {
        bird = this.add.sprite(startX, startY, 'bird', 0)
          .setDepth(2)
          .setScale(1.5);
        if (this.anims.exists('bird_fly')) {
          bird.play('bird_fly');
        }
      } else {
        bird = this.add.triangle(startX, startY, 
          0, -6, -8, 4, 8, 4, 0x333333).setDepth(2);
      }
      
      this.birdGroup.add(bird);
      
      this.birds.push({
        sprite: bird,
        x: startX,
        y: startY,
        speed: 0.3 + Math.random() * 0.4,
        offset: Math.random() * Math.PI * 2
      });
    }
  }

  createBuildings(W, grassTop) {
    const buildings = [
      {
        key: 'fish_market',
        x: 80,
        y: grassTop + 50,
        scale: 1.5,
        depth: DEPTH.BUILDINGS,
        name: 'Fish Market',
        type: 'shop',
        interaction: () => {
          this.recordInteraction('building', 'fish_market');
          this.events.emit('showMessage', 'Welcome to the Fish Market! Sell your catch here.');
          this.events.emit('openShop', { role: 'shopkeeper', name: 'Fish Market' });
        }
      },
      {
        key: 'barn',
        x: 450,
        y: grassTop + 60,
        scale: 1.4,
        depth: DEPTH.BUILDINGS,
        origin: [0.5, 0],
        name: 'Barn',
        type: 'storage',
        interaction: () => {
          this.recordInteraction('building', 'barn');
          this.events.emit('showMessage', 'The barn stores your extra fish. Capacity: 100');
          this.events.emit('openStorage', { type: 'barn', capacity: 100 });
        }
      },
      {
        key: 'greenhouse',
        x: 1100,
        y: grassTop + 70,
        scale: 1.2,
        depth: DEPTH.BUILDINGS,
        name: 'Greenhouse',
        type: 'crafting',
        interaction: () => {
          this.recordInteraction('building', 'greenhouse');
          this.events.emit('showMessage', 'Craft bait and lures here!');
          this.events.emit('openCrafting');
        }
      },
      // NEW BUILDINGS
      {
        key: 'watchtower',
        x: 1500,
        y: grassTop + 40,
        scale: 1.6,
        depth: DEPTH.BUILDINGS,
        name: 'Scout Tower',
        type: 'viewpoint',
        interaction: () => {
          this.recordInteraction('building', 'watchtower');
          this.events.emit('showMessage', 'Scout Tower: Get a bird\'s eye view of the coast!');
          this.cameras.main.zoomTo(0.6, 1000, 'Sine.easeInOut');
          this.time.delayedCall(3000, () => this.cameras.main.zoomTo(1, 1000));
        }
      },
      {
        key: 'pier_house',
        x: 1700,
        y: grassTop + 80,
        scale: 1.3,
        depth: DEPTH.BUILDINGS,
        name: 'Pier House',
        type: 'rest',
        interaction: () => {
          this.recordInteraction('building', 'pier_house');
          this.events.emit('showMessage', 'Pier House: Rest and recover energy faster here.');
          this.energySystem.energy = Math.min(this.energySystem.energy + 30, 100);
          this.events.emit('showMessage', 'Energy restored! (+30)');
        }
      },
      {
        key: 'lighthouse',
        x: 1850,
        y: grassTop + 30,
        scale: 2.0,
        depth: DEPTH.BUILDINGS,
        name: 'Lighthouse',
        type: 'landmark',
        interaction: () => {
          this.recordInteraction('building', 'lighthouse');
          this.events.emit('showMessage', 'The Lighthouse guides ships home at night.');
        }
      }
    ];
    
    buildings.forEach(b => {
      if (this.textures.exists(b.key)) {
        const origin = b.origin || [0, 0];
        const building = this.add.image(b.x, b.y, b.key)
          .setOrigin(...origin)
          .setScale(b.scale)
          .setDepth(b.depth);
        
        building.setInteractive({ cursor: 'pointer' });
        
        building.on('pointerover', () => {
          building.setTint(0xdddddd);
          this.events.emit('showMessage', `${b.name} - Click to interact`);
        });
        
        building.on('pointerout', () => {
          building.clearTint();
        });
        
        building.on('pointerdown', () => {
          const dist = Phaser.Math.Distance.Between(
            this.player?.x || 0, this.player?.y || 0,
            b.origin?.[0] === 1 ? b.x - 40 : b.x + 40, b.y + 30
          );
          
          if (dist < 120) {
            b.interaction();
          } else {
            this.events.emit('showMessage', 'Too far away! Move closer.');
          }
        });
        
        this.buildingGroup.add(building);
        
        // MASSIVE Shadow
        const shadowW = b.key === 'lighthouse' ? 200 : b.key === 'barn' ? 180 : 250;
        const shadowX = b.x + (b.origin?.[0] === 1 ? -20 : 20);
        this.add.rectangle(shadowX, b.y + 120, shadowW, 12, 0x000000, 0.15).setDepth(DEPTH.SHADOWS);
      }
    });
  }

  createAnimals(grassTop, sandY) {
    // MASSIVE animal population - doubled and spread across the world
    const animalConfigs = [
      // Original animals (scaled up)
      { type: 'chicken', x: 200, y: grassTop + 85, scale: 2.0, walkAnim: 'chicken_walk', idleAnim: 'chicken_idle' },
      { type: 'cow', x: 420, y: grassTop + 80, scale: 1.5, walkAnim: 'cow_walk', idleAnim: 'cow_idle' },
      { type: 'pig', x: 520, y: grassTop + 95, scale: 2.0, walkAnim: 'pig_walk', idleAnim: 'pig_idle' },
      // NEW ANIMALS - spread across the massive world
      { type: 'chicken', x: 750, y: grassTop + 100, scale: 2.0, walkAnim: 'chicken_walk', idleAnim: 'chicken_idle' },
      { type: 'chicken', x: 850, y: grassTop + 70, scale: 2.0, walkAnim: 'chicken_walk', idleAnim: 'chicken_idle' },
      { type: 'cow', x: 1000, y: grassTop + 90, scale: 1.5, walkAnim: 'cow_walk', idleAnim: 'cow_idle' },
      { type: 'cow', x: 1300, y: grassTop + 75, scale: 1.5, walkAnim: 'cow_walk', idleAnim: 'cow_idle' },
      { type: 'pig', x: 1450, y: grassTop + 110, scale: 2.0, walkAnim: 'pig_walk', idleAnim: 'pig_idle' },
      { type: 'chicken', x: 1600, y: grassTop + 85, scale: 2.0, walkAnim: 'chicken_walk', idleAnim: 'chicken_idle' },
      { type: 'cow', x: 1750, y: grassTop + 95, scale: 1.5, walkAnim: 'cow_walk', idleAnim: 'cow_idle' },
      { type: 'pig', x: 300, y: grassTop + 105, scale: 2.0, walkAnim: 'pig_walk', idleAnim: 'pig_idle' },
      { type: 'chicken', x: 1150, y: grassTop + 65, scale: 2.0, walkAnim: 'chicken_walk', idleAnim: 'chicken_idle' }
    ];
    
    this.animals = [];
    
    animalConfigs.forEach((config, index) => {
      if (this.textures.exists(config.type)) {
        const animal = this.add.sprite(config.x, config.y, config.type)
          .setDepth(DEPTH.SHADOWS)
          .setScale(config.scale);
        
        if (this.anims.exists(`${config.type}_walk_down`)) {
          animal.play(`${config.type}_walk_down`);
        }
        
        this.animalGroup.add(animal);
        
        // Create varied bounds for each animal
        const sectionWidth = this.scale.width / 6;
        const sectionIndex = index % 6;
        
        this.animals.push({
          sprite: animal,
          config: config,
          state: 'idle',
          stateTimer: 0,
          direction: 'down',
          vx: 0,
          vy: 0,
          bounds: {
            minX: sectionIndex * sectionWidth + 50,
            maxX: (sectionIndex + 1) * sectionWidth - 50,
            minY: grassTop + 30,
            maxY: sandY - 20
          }
        });
      }
    });
  }

  createBeach(W, sandY, waterY) {
    this.groundGroup.add(
      this.add.rectangle(0, sandY, W, waterY - sandY, COLORS.SAND).setOrigin(0, 0).setDepth(0)
    );
    
    for (let x = 0; x < W; x += 8) {
      for (let y = sandY + 5; y < waterY - 5; y += 8) {
        if ((x * 3 + y * 7) % 23 === 0) {
          const shade = 0xd0a858 + Math.random() * 0x101010;
          this.groundGroup.add(
            this.add.rectangle(x, y, 2, 2, shade).setOrigin(0, 0).setDepth(0)
          );
        }
      }
    }
    
    const wetSandY = waterY - 15;
    this.groundGroup.add(
      this.add.rectangle(0, wetSandY, W, 15, 0xc0a060).setOrigin(0, 0).setDepth(0)
    );
  }

  createOcean(W, H, waterY) {
    // Deep water layers
    this.groundGroup.add(
      this.add.rectangle(0, waterY, W, H - waterY - 50, COLORS.WATER).setOrigin(0, 0).setDepth(0)
    );
    this.groundGroup.add(
      this.add.rectangle(0, H - 50, W, 50, COLORS.WATER_DEEP).setOrigin(0, 0).setDepth(0)
    );
    
    // Foam line
    for (let x = 0; x < W; x += 5) {
      if ((x * 31) % 7 !== 0) {
        this.waterEffectsGroup.add(
          this.add.rectangle(x, waterY - 1, 4, 1, 0xffffff).setAlpha(0.5).setDepth(2)
        );
      }
    }

    // Water ripples
    this.waterRipples = [];
    if (this.textures.exists('water_ripple')) {
      const rippleSpots = [
        [80, waterY + 25], [200, waterY + 50], [350, waterY + 35],
        [500, waterY + 60], [150, waterY + 80], [420, waterY + 45],
        [250, waterY + 95], [550, waterY + 25], [100, waterY + 110],
        [400, waterY + 75], [300, waterY + 40], [480, waterY + 100]
      ];
      
      rippleSpots.forEach(([rx, ry], i) => {
        const ripple = this.add.sprite(rx, ry, 'water_ripple')
          .setScale(0.8 + (i % 3) * 0.3)
          .setDepth(DEPTH.WATER_EFFECTS)
          .setAlpha(0.25 + (i % 3) * 0.1);
        
        if (this.anims.exists('water_ripple')) {
          ripple.play('water_ripple');
          ripple.anims.setProgress((i * 0.15) % 1);
        }
        
        this.waterRipples.push(ripple);
        this.waterEffectsGroup.add(ripple);
      });
    }

    // Water shimmer
    this.waterShimmer = [];
    for (let i = 0; i < 12; i++) {
      const s = this.add.rectangle(
        Phaser.Math.Between(10, W - 10),
        Phaser.Math.Between(waterY + 10, H - 10),
        2, 1, 0xffffff, 0.15
      ).setDepth(DEPTH.WATER_EFFECTS);
      this.waterShimmer.push({
        sprite: s,
        baseX: s.x,
        baseY: s.y,
        speed: 0.5 + Math.random() * 0.5,
        offset: Math.random() * Math.PI * 2
      });
      this.waterEffectsGroup.add(s);
    }
    
    // Wave lines
    this.waterWaves = [];
    for (let i = 0; i < 5; i++) {
      const waveY = waterY + 20 + i * 20;
      const wave = this.add.rectangle(W / 2, waveY, W - 20, 1, 0xffffff, 0.05)
        .setDepth(DEPTH.WATER_EFFECTS);
      this.waterWaves.push({
        sprite: wave,
        baseY: waveY,
        speed: 0.2 + i * 0.1,
        offset: i * 1.5
      });
    }
    
    // Create reflections
    this.createReflections(W, H, waterY);
  }

  createReflections(W, H, waterY) {
    // Player reflection (updated each frame)
    this.playerReflection = this.add.sprite(0, 0, 'player')
      .setScale(2, -1)
      .setAlpha(0.2)
      .setDepth(DEPTH.WATER_EFFECTS - 1)
      .setVisible(false);
    
    // Boat reflections
    this.boatReflections = [];
  }

  setupCamera() {
    const camera = this.cameras.main;
    camera.setBounds(0, 0, this.scale.width, this.scale.height);
    camera.roundPixels = true;
    
    // MASSIVE world camera follow with smooth lerp
    camera.startFollow(this.player.container, true, CAMERA.FOLLOW_LERP, CAMERA.FOLLOW_LERP);
    camera.setDeadzone(CAMERA.DEADZONE_WIDTH, CAMERA.DEADZONE_HEIGHT);
    
    // Enable smooth zoom transitions
    camera.setZoom(1);
  }

  /**
   * PRODUCTIVITY: Enhanced input with comprehensive keyboard shortcuts
   */
  setupEnhancedInput() {
    // Movement keys
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });
    
    // Action keys
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.iKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);
    this.fKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    this.qKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    this.mKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
    this.nKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.N);
    this.pKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.tabKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB);
    this.cKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
    this.lKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L);
    this.oKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.O);
    
    // Quick save/load keys
    this.f5Key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F5);
    this.f9Key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F9);
    this.f12Key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F12);
    this.backtickKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.BACKTICK);
    
    // Input buffering
    this.inputBuffer = {
      action: null,
      timestamp: 0,
      duration: 150
    };

    // Setup key handlers
    this.spaceKey.on('down', () => this.bufferAction('space'));
    this.eKey.on('down', () => this.tryNPCInteraction());
    this.iKey.on('down', () => this.events.emit('toggleInventory'));
    this.fKey.on('down', () => this.switchScene('FarmScene'));
    this.qKey.on('down', () => this.switchScene('DiveScene'));
    this.mKey.on('down', () => this.switchScene('MineScene'));
    this.nKey.on('down', () => this.toggleMute());
    this.pKey.on('down', () => this.togglePause());
    this.escKey.on('down', () => this.togglePause());
    this.tabKey.on('down', () => this.events.emit('toggleMap'));
    this.cKey.on('down', () => this.events.emit('showStats'));
    this.lKey.on('down', () => this.events.emit('showAchievements'));
    this.oKey.on('down', () => this.events.emit('openSettings'));
    
    // Quick save/load
    this.f5Key.on('down', () => this.quickSave());
    this.f9Key.on('down', () => this.quickLoad());
    this.f12Key.on('down', () => this.takeScreenshot());
    this.backtickKey.on('down', () => this.toggleDebug());

    // Input polling
    this.input.on('preupdate', () => this.updateInputBuffer());
    
    this.log('info', '[FishingScene] Input system initialized with shortcuts');
  }

  bufferAction(action) {
    this.inputBuffer.action = action;
    this.inputBuffer.timestamp = this.time.now;
  }

  updateInputBuffer() {
    if (!this.inputBuffer.action) return;
    
    if (this.time.now - this.inputBuffer.timestamp > this.inputBuffer.duration) {
      this.inputBuffer.action = null;
      return;
    }

    switch (this.inputBuffer.action) {
      case 'space':
        if (this.fishingSystem.state === 'idle') {
          // PROACTIVE-AGENT: Auto-save before dangerous actions if enabled
          if (settingsManager.get('gameplay', 'autoSave')) {
            this.autoSave();
          }
          this.fishingSystem.startCasting(this.player, {
            bait: this.gameState.currentBait,
            rod: this.gameState.currentRod
          });
          this.inputBuffer.action = null;
        } else if (this.fishingSystem.state === 'bite') {
          this.fishingSystem.startMinigame();
          this.inputBuffer.action = null;
        } else if (this.fishingSystem.state === 'minigame') {
          this.fishingSystem.minigamePress();
        }
        break;
    }
  }

  setupPhysics() {
    if (this.physics && this.physics.world) {
      this.physics.world.setBounds(0, 0, this.scale.width, this.scale.height);
    }
    if (this.waterCollider && this.physics && this.physics.add) {
      this.physics.add.collider(this.player.container, this.waterCollider, null, null, this);
    }
    if (this.physics && this.physics.world && this.physics.world.debugGraphic) {
      this.physics.world.debugGraphic.visible = false;
    }
  }

  setupDepthSorting() {
    this.children.sortByDepth = () => {
      this.children.list.sort((a, b) => {
        if (a.depth !== b.depth) return a.depth - b.depth;
        return (a.y || 0) - (b.y || 0);
      });
    };
  }

  setupEventHandlers() {
    this.events.on('fishCaught', (fish, weight, perfect) => this.onFishCaught(fish, weight, perfect));
    this.events.on('fishEscaped', () => this.onFishEscaped());
    this.events.on('shutdown', this.shutdown, this);
    this.events.on('destroy', this.destroy, this);
  }

  setupDayNightCycle() {
    this.time.addEvent({
      delay: this.gameState.dayLength,
      callback: () => {
        const cycle = TIME.PHASES;
        const idx = cycle.indexOf(this.gameState.timeOfDay);
        this.gameState.timeOfDay = cycle[(idx + 1) % 4];
        this.updateDayNight();
        
        // Update ambient sounds
        this.audioManager.updateAmbient(this.gameState.timeOfDay, this.weatherSystem.currentWeather);
      },
      loop: true,
    });
  }

  /**
   * PROACTIVE-AGENT: Auto-save system
   */
  setupAutoSave() {
    const interval = settingsManager.get('gameplay', 'autoSaveInterval') || 60000;
    
    this.time.addEvent({
      delay: interval,
      callback: () => {
        if (settingsManager.get('gameplay', 'autoSave')) {
          this.autoSave();
        }
      },
      loop: true
    });
  }

  /**
   * PRODUCTIVITY: Quick save with slot selection
   */
  quickSave() {
    this.saveToSlot('quicksave');
    this.notificationSystem.showAutoSave();
    this.events.emit('showMessage', 'Game saved (Quick)');
    this.log('info', '[FishingScene] Quick save completed');
  }

  /**
   * PRODUCTIVITY: Quick load from quicksave slot
   */
  quickLoad() {
    // PROACTIVE-AGENT: Confirm before loading
    this.notificationSystem.showDangerWarning(
      'load the quicksave (unsaved progress will be lost)',
      () => {
        this.loadFromSlot('quicksave');
        this.events.emit('showMessage', 'Game loaded (Quick)');
      },
      () => {}
    );
  }

  autoSave() {
    const state = this.gatherSaveData();
    const result = this.saveSystem.saveSlot('autosave', state);
    
    if (result.success) {
      this.notificationSystem.showAutoSave();
      this.log('info', '[FishingScene] Auto-save completed');
    }
  }

  saveToSlot(slotName) {
    const state = this.gatherSaveData();
    return this.saveSystem.saveSlot(slotName, state);
  }

  loadFromSlot(slotName) {
    const data = this.saveSystem.loadSlot(slotName);
    if (data) {
      this.restoreSaveData(data);
      return true;
    }
    return false;
  }

  gatherSaveData() {
    return {
      version: 2,
      timestamp: Date.now(),
      gold: this.shopSystem.getGold(),
      totalCaught: this.gameState.totalCaught,
      timeOfDay: this.gameState.timeOfDay,
      inventory: this.inventory.getAllFish(),
      encyclopedia: this.encyclopedia.serialize(),
      quests: this.questSystem.serialize(),
      energy: this.energySystem.serialize(),
      achievements: this.achievementSystem.serialize(),
      analytics: this.analytics.serialize(),
      currentBait: this.gameState.currentBait,
      currentRod: this.gameState.currentRod,
      weather: this.weatherSystem.currentWeather
    };
  }

  restoreSaveData(data) {
    this.shopSystem.gold = data.gold || 0;
    this.gameState.totalCaught = data.totalCaught || 0;
    this.gameState.timeOfDay = data.timeOfDay || 'day';
    this.gameState.currentBait = data.currentBait || null;
    this.gameState.currentRod = data.currentRod || 'BASIC';
    
    if (data.inventory) this.inventory.load(data.inventory);
    if (data.encyclopedia) this.encyclopedia.deserialize(data.encyclopedia);
    if (data.quests) this.questSystem.deserialize(data.quests);
    if (data.energy) this.energySystem.deserialize(data.energy);
    if (data.achievements) this.achievementSystem.deserialize(data.achievements);
    if (data.analytics) this.analytics.deserialize(data.analytics);
    if (data.weather) this.weatherSystem.setWeather(data.weather);
  }

  /**
   * SELF-IMPROVING: Record interactions for analytics
   */
  recordInteraction(type, target) {
    this.analytics.recordInteraction(type, target);
  }

  onFishCaught(fish, weight, perfect) {
    this.gameState.totalCaught++;
    
    // Calculate adjusted value with weather and bait modifiers
    const weatherMod = this.weatherSystem.getModifier(fish.rarity);
    const baitMod = this.gameState.currentBait ? 1.2 : 1.0;
    const rodMod = 1.0; // Based on rod stats
    const adjustedValue = Math.floor(fish.value * weatherMod * baitMod * rodMod);
    
    this.shopSystem.gold += adjustedValue;
    this.inventory.addFish(fish, weight);
    const isNewDiscovery = this.encyclopedia.discover(fish, weight);
    
    // Update quest progress
    this.questSystem.onFishCaught(fish, weight, adjustedValue);
    this.questSystem.updateSpeciesQuests(this.encyclopedia.getDiscoveredCount());
    
    // SELF-IMPROVING: Analytics
    this.analytics.recordCatch(fish, weight, adjustedValue, perfect, this.gameState.timeOfDay, this.weatherSystem.currentWeather);
    this.analytics.decrementTipCooldown();
    
    // Achievements
    this.achievementSystem.updateStats('fish_caught', {
      fishId: fish.id,
      rarity: fish.rarity,
      value: adjustedValue,
      weight,
      perfect,
      timeOfDay: this.gameState.timeOfDay,
      weather: this.weatherSystem.currentWeather
    });
    
    // PROACTIVE-AGENT: Check for tips
    const tip = this.analytics.getTip();
    if (tip) {
      this.notificationSystem.showProactiveTip(tip);
    }
    
    // Visual effects
    this.splashAt(
      this.fishingSystem.bobber?.x || this.player.x,
      this.fishingSystem.bobber?.y || (this.waterBounds.top + 20)
    );
    
    // Screen shake for legendary catches
    if (fish.rarity === 'legendary') {
      this.cameras.main.shake(200, 0.02);
    }
    
    this.events.emit('showCatch', fish, weight, adjustedValue, isNewDiscovery);
    
    this.log('info', `[FishingScene] Caught ${fish.name} (${fish.rarity}) worth ${adjustedValue}g`);
  }

  onFishEscaped() {
    this.analytics.recordMiss('escaped');
    this.achievementSystem.updateStats('fish_escaped');
    this.events.emit('showMessage', 'Fish got away!');
  }

  switchScene(sceneKey) {
    if (this.fishingSystem.state === 'idle') {
      this.recordInteraction('scene_switch', sceneKey);
      this.scene.switch(sceneKey);
    }
  }

  toggleMute() {
    const isMuted = this.audioManager.isMuted;
    if (isMuted) {
      this.audioManager.unmute();
      this.events.emit('showMessage', 'Audio unmuted');
    } else {
      this.audioManager.mute();
      this.events.emit('showMessage', 'Audio muted');
    }
  }

  togglePause() {
    if (this.scene.isPaused()) {
      this.scene.resume();
      this.events.emit('showMessage', 'Game resumed');
    } else {
      this.scene.pause();
      this.events.emit('showMessage', 'Game paused');
    }
  }

  toggleDebug() {
    this.performanceMonitor.toggleDebug();
    this.log('info', '[FishingScene] Debug mode toggled');
  }

  takeScreenshot() {
    this.game.renderer.snapshot((image) => {
      // Create download link
      const link = document.createElement('a');
      link.download = `tidefall_${Date.now()}.png`;
      link.href = image.src;
      link.click();
      this.events.emit('showMessage', 'Screenshot saved!');
    });
  }

  /**
   * PROACTIVE-AGENT: Check for rare fish opportunities
   */
  checkRareOpportunities() {
    const timeOfDay = this.gameState.timeOfDay;
    const weather = this.weatherSystem.currentWeather;
    const hour = new Date().getHours();
    
    // Analyze conditions
    let conditions = [];
    if (weather === 'stormy') conditions.push('storm');
    if (weather === 'rainy') conditions.push('rain');
    if (timeOfDay === 'night') conditions.push('night');
    if (timeOfDay === 'dawn') conditions.push('dawn');
    
    if (conditions.length >= 2) {
      this.notificationSystem.showRareOpportunity('Rare species', conditions.join(' + '));
    }
  }

  update(time, delta) {
    // Guard against update running before create completes
    if (!this.player || !this.cursors) {
      return;
    }
    
    // DEBUG-PRO: Performance profiling
    this.performanceMetrics.frameCount++;
    if (time - this.performanceMetrics.lastProfileTime > this.performanceMetrics.profileInterval) {
      this.performanceMonitor.logPerformance();
      this.checkMemoryLeaks();
      this.performanceMetrics.lastProfileTime = time;
    }

    // Process input
    this.processMovementInput();

    // Update entities
    this.player.update(delta);
    this.npcs?.forEach(npc => npc.update(this.player.x, this.player.y));
    this.updateAnimals(delta);

    // Update systems
    this.fishingSystem.update(time, delta);
    this.fishManager.update(delta);
    this.boatManager?.update();
    this.updateWorldEffects(time, delta);
    this.updateReflections();

    // Depth sorting
    this.children.sortByDepth();

    // Update UI
    this.updateUI();
    
    // SELF-IMPROVING: Track play time
    this.analytics.updateStats('play_time', { delta });
  }

  processMovementInput() {
    // Null guard - prevent crash if called before create() completes
    if (!this.cursors || !this.wasd) return;
    
    const speed = 120;
    let vx = 0, vy = 0;

    if (this.fishingSystem.state === 'idle' && !this.energySystem.exhausted) {
      if (this.cursors.left.isDown || this.wasd.left.isDown) vx = -speed;
      else if (this.cursors.right.isDown || this.wasd.right.isDown) vx = speed;
      if (this.cursors.up.isDown || this.wasd.up.isDown) vy = -speed;
      else if (this.cursors.down.isDown || this.wasd.down.isDown) vy = speed;

      if (vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707; }
      if (vx !== 0 || vy !== 0) {
        this.energySystem.consume(0.01);
        this.analytics.recordMovement(this.player.x, this.player.y, 16);
      }
    }

    this.player.setVelocity(vx, vy);
    this.player.setInputState({
      left: this.cursors.left.isDown || this.wasd.left.isDown,
      right: this.cursors.right.isDown || this.wasd.right.isDown,
      up: this.cursors.up.isDown || this.wasd.up.isDown,
      down: this.cursors.down.isDown || this.wasd.down.isDown,
      x: vx,
      y: vy
    });
  }

  updateAnimals(delta) {
    if (!this.animals || !Array.isArray(this.animals)) {
      return;
    }
    this.animals.forEach(animal => {
      const s = animal.sprite;
      animal.stateTimer -= delta;
      
      if (animal.stateTimer <= 0) {
        const states = ['idle', 'idle', 'walk', 'graze'];
        animal.state = states[Math.floor(Math.random() * states.length)];
        animal.stateTimer = Phaser.Math.Between(2000, 6000);
        
        if (animal.state === 'walk') {
          const dirs = ['down', 'up', 'left', 'right'];
          animal.direction = dirs[Math.floor(Math.random() * dirs.length)];
          const speed = 0.3;
          switch (animal.direction) {
            case 'down': animal.vx = 0; animal.vy = speed; break;
            case 'up': animal.vx = 0; animal.vy = -speed; break;
            case 'left': animal.vx = -speed; animal.vy = 0; break;
            case 'right': animal.vx = speed; animal.vy = 0; break;
          }
          const walkAnim = `${animal.config.type}_walk_${animal.direction}`;
          if (this.anims.exists(walkAnim)) s.play(walkAnim);
        } else {
          animal.vx = 0;
          animal.vy = 0;
        }
      }
      
      if (animal.state === 'walk') {
        s.x += animal.vx * delta;
        s.y += animal.vy * delta;
        
        if (s.x < animal.bounds.minX) { s.x = animal.bounds.minX; animal.vx *= -1; animal.direction = 'right'; }
        if (s.x > animal.bounds.maxX) { s.x = animal.bounds.maxX; animal.vx *= -1; animal.direction = 'left'; }
        if (s.y < animal.bounds.minY) { s.y = animal.bounds.minY; animal.vy *= -1; animal.direction = 'down'; }
        if (s.y > animal.bounds.maxY) { s.y = animal.bounds.maxY; animal.vy *= -1; animal.direction = 'up'; }
      }
      
      s.setDepth(DEPTH.SHADOWS + Math.floor(s.y / 100) * 0.1);
    });
  }

  updateWorldEffects(time, delta) {
    // Clouds
    if (this.clouds) {
      this.clouds.forEach(cloud => {
        cloud.sprite.x += cloud.speed * delta;
        if (cloud.sprite.x > this.scale.width + 50) {
          cloud.sprite.x = -50;
          cloud.sprite.y = cloud.baseY + Math.random() * 10 - 5;
        }
      });
    }
    
    // Birds
    if (this.birds) {
      this.birds.forEach(bird => {
        bird.x += bird.speed * delta;
        bird.y = bird.y + Math.sin(time * 0.002 + bird.offset) * 0.3;
        bird.sprite.x = bird.x;
        bird.sprite.y = bird.y;
        if (bird.x > this.scale.width + 30) {
          bird.x = -30;
          bird.y = 15 + Math.random() * 40;
        }
      });
    }

    // Water shimmer
    this.waterShimmer?.forEach((s, i) => {
      s.sprite.x = s.baseX + Math.sin(time * 0.0008 + s.offset) * 5;
      s.sprite.alpha = 0.1 + Math.sin(time * 0.003 + s.offset) * 0.1;
    });
    
    // Water waves
    this.waterWaves?.forEach((w, i) => {
      w.sprite.y = w.baseY + Math.sin(time * 0.001 * w.speed + w.offset) * 3;
      w.sprite.alpha = 0.05 + Math.sin(time * 0.002 + w.offset) * 0.05;
    });
  }

  updateReflections() {
    // Update player reflection if near water
    if (this.player.y > this.waterBounds.top - 20) {
      this.playerReflection.setPosition(this.player.x, this.waterBounds.top + (this.waterBounds.top - this.player.y));
      this.playerReflection.setVisible(true);
      this.playerReflection.setTexture(this.player.sprite.texture.key);
      this.playerReflection.setFrame(this.player.sprite.frame.name);
    } else {
      this.playerReflection.setVisible(false);
    }
  }

  updateDayNight() {
    const tints = { dawn: 0xffccaa, day: 0xffffff, dusk: 0xffaa88, night: 0x5555aa };
    const tint = tints[this.gameState.timeOfDay] || 0xffffff;
    
    // Smooth transition
    this.tweens.add({
      targets: this.lightingOverlay,
      fillColor: tint,
      duration: 2000
    });
    
    // Set darkness level
    const darkness = { dawn: 0.1, day: 0, dusk: 0.2, night: 0.5 };
    this.tweens.add({
      targets: this.lightingOverlay,
      alpha: darkness[this.gameState.timeOfDay] || 0,
      duration: 2000
    });
    
    this.events.emit('timeOfDayChange', this.gameState.timeOfDay);
    this.log('info', `[FishingScene] Time changed to ${this.gameState.timeOfDay}`);
  }

  updateUI() {
    this.events.emit('updateUI', {
      fishingState: this.fishingSystem.state,
      timeOfDay: this.gameState.timeOfDay,
      totalCaught: this.gameState.totalCaught,
      gold: this.shopSystem.getGold(),
      energy: this.energySystem.getPercentage(),
      weather: this.weatherSystem.getWeatherName(),
      encyclopedia: this.encyclopedia.getCompletionPercentage(),
      activeQuests: this.questSystem.getActiveQuests().length,
      currentBait: this.gameState.currentBait,
      currentRod: this.gameState.currentRod
    });
  }

  splashAt(x, y) {
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 * i) / 6;
      const dist = Phaser.Math.Between(4, 12);
      const speed = Phaser.Math.Between(40, 80);
      
      this.particlePool.acquire({
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist - 2,
        color: 0xffffff,
        alpha: 0.7,
        scale: 1,
        velX: Math.cos(angle) * speed,
        velY: Math.sin(angle) * speed - 40,
        lifetime: 400
      });
    }
    
    const ring = this.add.ellipse(x, y, 8, 4, 0xffffff, 0.3).setDepth(DEPTH.WATER_EFFECTS);
    this.tweens.add({
      targets: ring,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: 500,
      ease: 'Power2',
      onComplete: () => ring.destroy()
    });
    
    this.cameras.main.shake(80, 0.003);
  }

  spawnNPCs() {
    // MASSIVE NPC spread across 1920 width world
    const positions = [
      { x: 200, y: 280, config: NPC_DATABASE[0] },    // Fisherman Joe - left
      { x: 600, y: 240, config: NPC_DATABASE[1] },    // Mayor Eliza - town
      { x: 960, y: 300, config: NPC_DATABASE[2] },    // Chef Gordon - center
      { x: 1300, y: 260, config: NPC_DATABASE[0] },   // Merchant (reused sprite)
      { x: 1700, y: 320, config: NPC_DATABASE[1] },   // Captain (reused sprite)
      { x: 450, y: 220, config: NPC_DATABASE[2] },   // Farmer (reused sprite)
      { x: 1100, y: 250, config: NPC_DATABASE[0] },  // Alchemist (reused sprite)
      { x: 1550, y: 290, config: NPC_DATABASE[1] },  // Dock Worker (reused sprite)
    ];
    
    positions.forEach(({ x, y, config }) => {
      const npc = new NPC(this, x, y, config);
      this.npcs.push(npc);
      this.npcGroup.add(npc.container);
    });
  }

  createMassiveFleet(waterY) {
    // Create 8 boats across the massive ocean
    const boatPositions = [
      { x: 150, y: waterY + 60, type: 'small' },
      { x: 450, y: waterY + 100, type: 'medium' },
      { x: 750, y: waterY + 45, type: 'small' },
      { x: 1050, y: waterY + 85, type: 'large' },
      { x: 1350, y: waterY + 55, type: 'medium' },
      { x: 1650, y: waterY + 110, type: 'small' },
      { x: 1850, y: waterY + 70, type: 'large' },
      { x: 300, y: waterY + 130, type: 'small' }
    ];
    
    boatPositions.forEach((pos, i) => {
      const boat = this.boatManager.createBoat(pos.x, pos.y, pos.type);
      if (boat) {
        // Add slight random offset for natural feel
        boat.y += (i % 3) * 15;
      }
    });
  }

  tryNPCInteraction() {
    const npc = this.npcs.find(n => n.canInteract);
    if (npc) {
      this.recordInteraction('npc', npc.config.id);
      if (npc.role === 'shopkeeper') this.events.emit('openShop', npc);
      else npc.interact();
    } else {
      this.events.emit('showMessage', 'No one nearby...');
    }
  }

  startBackgroundMusic() {
    // Start ambient sounds
    this.audioManager.startAmbient(this.gameState.timeOfDay, this.weatherSystem.currentWeather);
    
    // Start music based on time of day
    const music = this.gameState.timeOfDay === 'night' ? 'bgm_night' : 'bgm_day';
    this.audioManager.playMusic(music, 2000);
  }

  shutdown() {
    this.log('info', '[FishingScene] Shutting down...');
    
    // End analytics session
    this.analytics.endSession();
    
    // Save game state
    this.autoSave();
    
    // Stop timers
    this.time.removeAllEvents();
    
    // Destroy systems
    this.fishManager?.destroy();
    this.fishingSystem?.cleanupFishing();
    this.performanceMonitor?.destroy();
    this.boatManager?.destroy();
    this.audioManager?.destroy();
    this.notificationSystem?.destroy();
    
    // Cleanup pools
    this.spritePool?.destroy();
    this.particlePool?.destroy();
    
    // Stop tweens
    this.tweens.killAll();
    
    // Clear references
    this.waterRipples = [];
    this.waterShimmer = [];
    this.waterWaves = [];
    this.clouds = [];
    this.birds = [];
    this.animals = [];
  }

  destroy() {
    this.shutdown();
    this.events.off('fishCaught');
    this.events.off('fishEscaped');
    this.events.off('shutdown');
    this.events.off('destroy');
  }
}
