import Phaser from 'phaser';
import { eventBus } from '../core/EventBus.js';
import { gameState } from '../core/GameState.js';
import { ASSETS, EVENTS } from '../core/Constants.js';

/**
 * BootScene - Optimized asset loading with priority tiers and lazy loading
 * 
 * Loading Tiers:
 * - CRITICAL: Must load before game starts (player, UI, water)
 * - HIGH: Needed for initial gameplay (fish shadows, bobbers)
 * - MEDIUM: Character customization options
 * - LOW: Can load in background (all variants, animals, extra fish)
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    this.createProgressBar();
    this.loadCriticalAssets();
    this.loadHighPriorityAssets();
    this.loadMediumPriorityAssets();
    
    // LOW priority assets load after scene starts
    this.load.on('complete', () => {
      this.time.delayedCall(100, () => this.loadLowPriorityAssets());
    });
  }

  createProgressBar() {
    const width = this.scale.width;
    const height = this.scale.height;
    
    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x222222, 0.8);
    bg.fillRect(width/2 - 160, height/2 - 25, 320, 50);
    
    // Progress bar
    this.progressBar = this.add.graphics();
    
    // Loading text
    this.loadingText = this.add.text(width/2, height/2 - 50, 'Loading...', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    // Asset counter for detailed feedback
    this.assetCounterText = this.add.text(width/2, height/2 + 35, '0 / 0', {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#88ccff'
    }).setOrigin(0.5);
    
    // Progress events
    this.load.on('progress', (value) => {
      this.progressBar.clear();
      this.progressBar.fillStyle(0x88ccff, 1);
      this.progressBar.fillRect(width/2 - 150, height/2 - 15, 300 * value, 30);
    });
    
    this.load.on('fileprogress', (file) => {
      const total = this.load.totalToLoad;
      const remaining = this.load.list.size;
      const loaded = total - remaining;
      this.assetCounterText.setText(`${loaded} / ${total} - ${file.key}`);
    });
    
    this.load.on('complete', () => {
      this.progressBar.destroy();
      bg.destroy();
      this.loadingText.destroy();
      this.assetCounterText.destroy();
    });
    
    this.load.on('loaderror', (file) => {
      console.warn(`[BootScene] Failed to load: ${file.key}`);
      // Show error to user but continue loading
      this.loadingText.setText(`Loading... (missing: ${file.key})`);
      this.loadingText.setColor('#ffaa44');
    });
  }

  /**
   * CRITICAL: Assets required before game can start
   */
  loadCriticalAssets() {
    const ss = { frameWidth: 64, frameHeight: 64 };
    
    // Core fish (most common for gameplay)
    const criticalFish = ['bass', 'herring', 'cod', 'catfish'];
    criticalFish.forEach(name => {
      this.load.image(`fish_${name}`, `assets/sprites/fish/${name}/static_fish.png`);
    });

    // Default player appearance (light skin, brown hair)
    // Body animations
    this.load.spritesheet('walk_body_light', 
      'assets/sprites/character/walk/body/character_walk_body_light.png', ss);
    this.load.spritesheet('idle_body_light', 
      'assets/sprites/character/idle/body/character_idle_body_light.png', ss);
    this.load.spritesheet('throw_body_light', 
      'assets/sprites/character/throw/body/character_throw_body_light.png', ss);
    this.load.spritesheet('catch_body_light', 
      'assets/sprites/character/catch/body/character_catch_body_light.png', ss);
    this.load.spritesheet('reel_body_light', 
      'assets/sprites/character/reel/body/character_reel_body_light.png', ss);
    
    // Default clothing (WALK)
    this.load.spritesheet('walk_pants_brown', 
      'assets/sprites/character/walk/pants/character_walk_pants_brown.png', ss);
    this.load.spritesheet('walk_shirt_blue_light', 
      'assets/sprites/character/walk/shirt/character_walk_shirt_blue_light.png', ss);
    this.load.spritesheet('walk_hair_short_hair_brown_light', 
      'assets/sprites/character/walk/hair/character_walk_hair_short_hair_brown_light.png', ss);
    
    // Default clothing (IDLE) - for better idle animations
    this.load.spritesheet('idle_pants_brown', 
      'assets/sprites/character/idle/pants/character_idle_pants_brown.png', ss);
    this.load.spritesheet('idle_shirt_blue_light', 
      'assets/sprites/character/idle/shirt/character_idle_shirt_blue_light.png', ss);
    this.load.spritesheet('idle_hair_short_hair_brown_light', 
      'assets/sprites/character/idle/hair/character_idle_hair_short_hair_brown_light.png', ss);

    // UI
    this.load.image('fishing_ui', 'assets/sprites/ui/fishing_ui_1_all_sprites.png');

    // Data
    this.load.json('fishData', 'assets/data/fish.json');
  }

  /**
   * HIGH: Needed for full gameplay experience
   */
  loadHighPriorityAssets() {
    const ss = { frameWidth: 64, frameHeight: 64 };
    
    // Fish shadows (needed for fishing)
    ['small', 'medium', 'big'].forEach(size => {
      this.load.spritesheet(`shadow_${size}`, 
        `assets/sprites/animations/shadow/${size}/animation.png`,
        { frameWidth: 16, frameHeight: 16 });
    });

    // Bobbers
    ['green', 'red', 'yellow'].forEach(color => {
      this.load.spritesheet(`bobber_${color}`, 
        `assets/sprites/animations/bobber/boober_${color}_floating_animation.png`,
        { frameWidth: 16, frameHeight: 16 });
    });

    // Water effects
    this.load.spritesheet('water_ripple', 
      'assets/sprites/animations/water_ripples_animation.png', 
      { frameWidth: 16, frameHeight: 16 });

    // Bobber bite
    this.load.spritesheet('bobber_bite',
      'assets/sprites/animations/bobber_bite/bobber_fish_bitting_animation.png',
      { frameWidth: 32, frameHeight: 16 });

    // Buildings
    this.load.spritesheet('fish_market', 'assets/sprites/buildings/fish_market.png', { frameWidth: 128, frameHeight: 128 });
    this.load.image('barn', 'assets/sprites/buildings/barn_premade.png');
    this.load.image('greenhouse', 'assets/sprites/buildings/greenhouse_premade.png');

    // Boats - Smallburg boats are 128x128 spritesheets with 8 frames
    this.load.spritesheet('boat_blue', 'assets/sprites/boats/boat_blue.png', { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('boat_yellow', 'assets/sprites/boats/boat_yellow.png', { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('boat_small', 'assets/sprites/boats/boat_small.png', { frameWidth: 128, frameHeight: 128 });
    
    // Particles and effects
    // NOTE: Splash spritesheet removed - file doesn't exist
    // this.load.spritesheet('splash',
    //   'assets/sprites/animations/splash_animation.png',
    //   { frameWidth: 16, frameHeight: 16 });
  }

  /**
   * MEDIUM: Character customization variants
   */
  loadMediumPriorityAssets() {
    const ss = { frameWidth: 64, frameHeight: 64 };
    const skinTones = ASSETS.CHARACTER_SKIN_TONES;
    const hairColors = ASSETS.CHARACTER_HAIR_COLORS.slice(0, 5); // Limit initial load
    const shirtColors = ASSETS.CHARACTER_SHIRT_COLORS.slice(0, 5);
    const pantsColors = ASSETS.CHARACTER_PANTS_COLORS.slice(0, 5);
    const hairStyles = ASSETS.CHARACTER_HAIR_STYLES.slice(0, 3);

    // Load remaining skin tones (excluding light which is already loaded)
    skinTones.filter(t => t !== 'light').forEach(tone => {
      this.load.spritesheet(`walk_body_${tone}`, 
        `assets/sprites/character/walk/body/character_walk_body_${tone}.png`, ss);
      this.load.spritesheet(`idle_body_${tone}`, 
        `assets/sprites/character/idle/body/character_idle_body_${tone}.png`, ss);
      this.load.spritesheet(`throw_body_${tone}`, 
        `assets/sprites/character/throw/body/character_throw_body_${tone}.png`, ss);
      this.load.spritesheet(`catch_body_${tone}`, 
        `assets/sprites/character/catch/body/character_catch_body_${tone}.png`, ss);
      this.load.spritesheet(`reel_body_${tone}`, 
        `assets/sprites/character/reel/body/character_reel_body_${tone}.png`, ss);
      this.load.spritesheet(`pull_body_${tone}`, 
        `assets/sprites/character/pull/body/character_pull_body_${tone}.png`, ss);
    });

    // Hair variants (excluding brown_light which is already loaded)
    hairColors.filter(c => c !== 'brown_light').forEach(color => {
      hairStyles.forEach(style => {
        this.load.spritesheet(`walk_hair_${style}_${color}`, 
          `assets/sprites/character/walk/hair/character_walk_hair_${style}_${color}.png`, ss);
        // Also load idle variants
        this.load.spritesheet(`idle_hair_${style}_${color}`, 
          `assets/sprites/character/idle/hair/character_idle_hair_${style}_${color}.png`, ss);
      });
    });

    // Shirt variants (excluding blue_light which is already loaded)
    shirtColors.filter(c => c !== 'blue_light').forEach(color => {
      this.load.spritesheet(`walk_shirt_${color}`, 
        `assets/sprites/character/walk/shirt/character_walk_shirt_${color}.png`, ss);
      // Also load idle variants
      this.load.spritesheet(`idle_shirt_${color}`, 
        `assets/sprites/character/idle/shirt/character_idle_shirt_${color}.png`, ss);
    });

    // Pants variants (excluding brown which is already loaded)
    pantsColors.filter(c => c !== 'brown').forEach(color => {
      this.load.spritesheet(`walk_pants_${color}`, 
        `assets/sprites/character/walk/pants/character_walk_pants_${color}.png`, ss);
      // Also load idle variants
      this.load.spritesheet(`idle_pants_${color}`, 
        `assets/sprites/character/idle/pants/character_idle_pants_${color}.png`, ss);
    });

    // Environment
    this.load.spritesheet('palm_tree', 
      'assets/sprites/trees/palm_tree.png',
      { frameWidth: 80, frameHeight: 80 });
    this.load.spritesheet('trees_pine_growth', 
      'assets/sprites/trees/trees_pine_growth.png',
      { frameWidth: 80, frameHeight: 80 });
    this.load.image('apple_tree', 'assets/sprites/trees/apple_tree.png');
    this.load.image('peach_tree', 'assets/sprites/trees/peach_tree.png');

    // Animals
    this.load.spritesheet('chicken', 'assets/sprites/animals/chicken_walk.png',
      { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('chicken_idle', 'assets/sprites/animals/chicken_idle.png',
      { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('cow', 'assets/sprites/animals/cow_walk.png',
      { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('cow_idle', 'assets/sprites/animals/cow_idle.png',
      { frameWidth: 32, frameHeight: 32 });
  }

  /**
   * LOW: Background loading - non-critical assets
   */
  loadLowPriorityAssets() {
    const ss = { frameWidth: 64, frameHeight: 64 };
    
    console.log('[BootScene] Starting background asset loading...');

    // Remaining fish
    const remainingFish = [
      'blobfish', 'char', 'cherry_salmon', 'coho_salmon', 'cow_fish', 
      'giant_tevally', 'golden_trout', 'halibut', 'lion_fish', 'mahi_mahi',
      'manta_ray', 'napolean_fish', 'oarfish', 'ocean_sunfish', 'pike',
      'pink_salmon', 'plaice', 'pompano', 'puffer_fish', 'rainbow_fish',
      'sea_horse', 'shark_greatwhite', 'shark_hammerhead', 'shark_saw',
      'shark_whale', 'silver_eel', 'sockeye_salmon', 'squid',
      'sucker_fish', 'surgeon_fish', 'whiting_fish'
    ];

    remainingFish.forEach((name, index) => {
      this.load.image(`fish_${name}`, `assets/sprites/fish/${name}/static_fish.png`);
    });

    // Variant fish
    const variantFish = {
      'butterfly_fish': 'white_black_fin',
      'clown_fish': 'red',
      'guppy': 'blue',
      'loach': 'silver',
      'mackerel': 'green',
      'neon_tetras': 'dark_blue',
      'parrot_fish': 'small',
      'pirana': 'blue',
      'swordfish': 'blue',
    };

    Object.entries(variantFish).forEach(([name, variant]) => {
      this.load.image(`fish_${name}`, `assets/sprites/fish/${name}/${variant}/static_fish.png`);
    });

    // Remaining hair colors and styles
    const remainingHairColors = ASSETS.CHARACTER_HAIR_COLORS.slice(5);
    const remainingHairStyles = ASSETS.CHARACTER_HAIR_STYLES.slice(3);
    
    remainingHairColors.forEach(color => {
      ASSETS.CHARACTER_HAIR_STYLES.forEach(style => {
        const walkKey = `walk_hair_${style}_${color}`;
        const idleKey = `idle_hair_${style}_${color}`;
        if (!this.textures.exists(walkKey)) {
          this.load.spritesheet(walkKey, 
            `assets/sprites/character/walk/hair/character_walk_hair_${style}_${color}.png`, ss);
        }
        if (!this.textures.exists(idleKey)) {
          this.load.spritesheet(idleKey, 
            `assets/sprites/character/idle/hair/character_idle_hair_${style}_${color}.png`, ss);
        }
      });
    });

    // Remaining clothing colors
    const remainingShirtColors = ASSETS.CHARACTER_SHIRT_COLORS.slice(5);
    const remainingPantsColors = ASSETS.CHARACTER_PANTS_COLORS.slice(5);
    
    remainingShirtColors.forEach(color => {
      const walkKey = `walk_shirt_${color}`;
      const idleKey = `idle_shirt_${color}`;
      if (!this.textures.exists(walkKey)) {
        this.load.spritesheet(walkKey, 
          `assets/sprites/character/walk/shirt/character_walk_shirt_${color}.png`, ss);
      }
      if (!this.textures.exists(idleKey)) {
        this.load.spritesheet(idleKey, 
          `assets/sprites/character/idle/shirt/character_idle_shirt_${color}.png`, ss);
      }
    });
    
    remainingPantsColors.forEach(color => {
      const walkKey = `walk_pants_${color}`;
      const idleKey = `idle_pants_${color}`;
      if (!this.textures.exists(walkKey)) {
        this.load.spritesheet(walkKey, 
          `assets/sprites/character/walk/pants/character_walk_pants_${color}.png`, ss);
      }
      if (!this.textures.exists(idleKey)) {
        this.load.spritesheet(idleKey, 
          `assets/sprites/character/idle/pants/character_idle_pants_${color}.png`, ss);
      }
    });

    // Remaining animals
    this.load.spritesheet('pig', 'assets/sprites/animals/pig_walk.png',
      { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('pig_idle', 'assets/sprites/animals/pig_idle.png',
      { frameWidth: 16, frameHeight: 16 });

    // Terrain
    this.load.image('beach_tileset', 'assets/sprites/tileset/beach_tile_set.png');
    this.load.image('farm_terrain', 'assets/sprites/terrain/farm_terrain.png');

    // Fish appear/disappear
    ['small', 'medium', 'big'].forEach(size => {
      this.load.spritesheet(`fish_appear_${size}`,
        `assets/sprites/animations/fish_appear/${size}_fish_appearing_animation.png`,
        { frameWidth: 32, frameHeight: 16 });
      this.load.spritesheet(`fish_disappear_${size}`,
        `assets/sprites/animations/fish_disappear/${size}_fish_disappearing_animation.png`,
        { frameWidth: 32, frameHeight: 16 });
    });

    // Birds and wildlife
    this.load.spritesheet('bird', 'assets/sprites/animations/bird_animation.png',
      { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('cloud', 'assets/sprites/animations/cloud_animation.png',
      { frameWidth: 64, frameHeight: 32 });

    // Placeholder fallbacks
    this.load.image('placeholder_player', 'assets/generated/player.svg');

    // Start the background loader
    this.load.start();
    
    this.load.on('complete', () => {
      console.log('[BootScene] Background asset loading complete');
      eventBus.emit(EVENTS.ASSETS_LOADED);
    });
  }

  create() {
    console.log('[BootScene] Creating animations...');
    this.createAnimations();
    
    eventBus.emit(EVENTS.GAME_START);
    this.scene.start('FishingScene');
  }

  createAnimations() {
    const skinTones = ASSETS.CHARACTER_SKIN_TONES;
    const directions = ['down', 'left', 'right', 'up'];

    skinTones.forEach(tone => {
      // Only create animations for loaded textures
      if (!this.textures.exists(`walk_body_${tone}`)) return;
      
      // Get actual frame counts from textures
      const getFrameCount = (key) => {
        if (!this.textures.exists(key)) return 0;
        return this.textures.get(key).frameTotal;
      };
      
      const walkFrames = getFrameCount(`walk_body_${tone}`);
      const idleFrames = getFrameCount(`idle_body_${tone}`);
      const throwFrames = getFrameCount(`throw_body_${tone}`);
      const catchFrames = getFrameCount(`catch_body_${tone}`);
      const reelFrames = getFrameCount(`reel_body_${tone}`);
      const pullFrames = getFrameCount(`pull_body_${tone}`);
      
      // Calculate frames per direction dynamically
      const walkFPD = Math.floor(walkFrames / 4);
      const idleFPD = Math.floor(idleFrames / 4);
      const throwFPD = Math.floor(throwFrames / 4);
      const catchFPD = Math.floor(catchFrames / 4);
      const reelFPD = Math.floor(reelFrames / 4);
      const pullFPD = Math.floor(pullFrames / 4);
      
      directions.forEach((dir, dirIndex) => {
        // Walk animation
        if (walkFrames > 0) {
          const start = dirIndex * walkFPD;
          const end = Math.min(start + walkFPD - 1, walkFrames - 1);
          if (start < walkFrames) {
            this.anims.create({
              key: `walk_${tone}_${dir}`,
              frames: this.anims.generateFrameNumbers(`walk_body_${tone}`, { start, end }),
              frameRate: 10,
              repeat: -1
            });
          }
        }
        
        // Idle animation
        if (idleFrames > 0) {
          const start = dirIndex * idleFPD;
          const end = Math.min(start + idleFPD - 1, idleFrames - 1);
          if (start < idleFrames) {
            this.anims.create({
              key: `idle_${tone}_${dir}`,
              frames: this.anims.generateFrameNumbers(`idle_body_${tone}`, { start, end }),
              frameRate: 3,
              repeat: -1
            });
          }
        }
        
        // Throw animation
        if (throwFrames > 0) {
          const start = dirIndex * throwFPD;
          const end = Math.min(start + throwFPD - 1, throwFrames - 1);
          if (start < throwFrames) {
            this.anims.create({
              key: `throw_${tone}_${dir}`,
              frames: this.anims.generateFrameNumbers(`throw_body_${tone}`, { start, end }),
              frameRate: 12,
              repeat: 0
            });
          }
        }
        
        // Catch animation
        if (catchFrames > 0) {
          const start = dirIndex * catchFPD;
          const end = Math.min(start + catchFPD - 1, catchFrames - 1);
          if (start < catchFrames) {
            this.anims.create({
              key: `catch_${tone}_${dir}`,
              frames: this.anims.generateFrameNumbers(`catch_body_${tone}`, { start, end }),
              frameRate: 12,
              repeat: 0
            });
          }
        }
        
        // Reel animation
        if (reelFrames > 0) {
          const start = dirIndex * reelFPD;
          const end = Math.min(start + reelFPD - 1, reelFrames - 1);
          if (start < reelFrames) {
            this.anims.create({
              key: `reel_${tone}_${dir}`,
              frames: this.anims.generateFrameNumbers(`reel_body_${tone}`, { start, end }),
              frameRate: 8,
              repeat: -1
            });
          }
        }

        // Pull animation
        if (pullFrames > 0) {
          const start = dirIndex * pullFPD;
          const end = Math.min(start + pullFPD - 1, pullFrames - 1);
          if (start < pullFrames) {
            this.anims.create({
              key: `pull_${tone}_${dir}`,
              frames: this.anims.generateFrameNumbers(`pull_body_${tone}`, { start, end }),
              frameRate: 10,
              repeat: -1
            });
          }
        }
      });
    });

    // Bobber animations
    ['green', 'red', 'yellow'].forEach(color => {
      if (this.textures.exists(`bobber_${color}`)) {
        this.anims.create({
          key: `bobber_${color}`,
          frames: this.anims.generateFrameNumbers(`bobber_${color}`, { start: 0, end: 5 }),
          frameRate: 8,
          repeat: -1
        });
      }
    });

    // Fish shadows
    ['small', 'medium', 'big'].forEach(size => {
      if (this.textures.exists(`shadow_${size}`)) {
        this.anims.create({
          key: `shadow_swim_${size}`,
          frames: this.anims.generateFrameNumbers(`shadow_${size}`, { start: 0, end: 3 }),
          frameRate: 6,
          repeat: -1
        });
      }
    });

    // Animals
    this.createAnimalAnimations();

    // Environment
    if (this.textures.exists('water_ripple')) {
      this.anims.create({
        key: 'water_ripple',
        frames: this.anims.generateFrameNumbers('water_ripple', { start: 0, end: 5 }),
        frameRate: 6,
        repeat: -1
      });
    }

    // Bobber bite
    if (this.textures.exists('bobber_bite')) {
      this.anims.create({
        key: 'bobber_bite',
        frames: this.anims.generateFrameNumbers('bobber_bite', { start: 0, end: 5 }),
        frameRate: 8,
        repeat: -1
      });
    }
    
    // Splash animation
    if (this.textures.exists('splash')) {
      this.anims.create({
        key: 'splash',
        frames: this.anims.generateFrameNumbers('splash', { start: 0, end: 7 }),
        frameRate: 12,
        repeat: 0
      });
    }
    
    // Trees - palm sway
    if (this.textures.exists('palm_tree')) {
      this.anims.create({
        key: 'palm_sway',
        frames: this.anims.generateFrameNumbers('palm_tree', { start: 0, end: 2 }),
        frameRate: 2,
        repeat: -1,
        yoyo: true
      });
    }
    
    // Birds
    if (this.textures.exists('bird')) {
      this.anims.create({
        key: 'bird_fly',
        frames: this.anims.generateFrameNumbers('bird', { start: 0, end: 3 }),
        frameRate: 8,
        repeat: -1
      });
    }
    
    // Clouds
    if (this.textures.exists('cloud')) {
      this.anims.create({
        key: 'cloud_float',
        frames: this.anims.generateFrameNumbers('cloud', { start: 0, end: 2 }),
        frameRate: 2,
        repeat: -1,
        yoyo: true
      });
    }
    
    // Fish appear/disappear
    ['small', 'medium', 'big'].forEach(size => {
      if (this.textures.exists(`fish_appear_${size}`)) {
        this.anims.create({
          key: `fish_appear_${size}`,
          frames: this.anims.generateFrameNumbers(`fish_appear_${size}`, { start: 0, end: 5 }),
          frameRate: 10,
          repeat: 0
        });
      }
      if (this.textures.exists(`fish_disappear_${size}`)) {
        this.anims.create({
          key: `fish_disappear_${size}`,
          frames: this.anims.generateFrameNumbers(`fish_disappear_${size}`, { start: 0, end: 5 }),
          frameRate: 10,
          repeat: 0
        });
      }
    });
  }

  createAnimalAnimations() {
    const animalDirs = ['down', 'left', 'right', 'up'];

    // Chicken: 16 frames walk, 4 frames idle
    if (this.textures.exists('chicken')) {
      animalDirs.forEach((dir, i) => {
        this.anims.create({
          key: `chicken_walk_${dir}`,
          frames: this.anims.generateFrameNumbers('chicken', { start: i * 4, end: i * 4 + 3 }),
          frameRate: 8,
          repeat: -1
        });
      });
    }
    
    if (this.textures.exists('chicken_idle')) {
      animalDirs.forEach((dir, i) => {
        this.anims.create({
          key: `chicken_idle_${dir}`,
          frames: this.anims.generateFrameNumbers('chicken_idle', { start: i, end: i }),
          frameRate: 4,
          repeat: -1
        });
      });
    }

    // Cow: 16 frames walk, 8 frames idle (2 per dir)
    if (this.textures.exists('cow')) {
      animalDirs.forEach((dir, i) => {
        this.anims.create({
          key: `cow_walk_${dir}`,
          frames: this.anims.generateFrameNumbers('cow', { start: i * 4, end: i * 4 + 3 }),
          frameRate: 6,
          repeat: -1
        });
      });
    }
    
    if (this.textures.exists('cow_idle')) {
      animalDirs.forEach((dir, i) => {
        this.anims.create({
          key: `cow_idle_${dir}`,
          frames: this.anims.generateFrameNumbers('cow_idle', { start: i * 2, end: i * 2 + 1 }),
          frameRate: 4,
          repeat: -1
        });
      });
    }

    // Pig: 16 frames walk, 4 frames idle
    if (this.textures.exists('pig')) {
      animalDirs.forEach((dir, i) => {
        this.anims.create({
          key: `pig_walk_${dir}`,
          frames: this.anims.generateFrameNumbers('pig', { start: i * 4, end: i * 4 + 3 }),
          frameRate: 8,
          repeat: -1
        });
      });
    }
    
    if (this.textures.exists('pig_idle')) {
      animalDirs.forEach((dir, i) => {
        this.anims.create({
          key: `pig_idle_${dir}`,
          frames: this.anims.generateFrameNumbers('pig_idle', { start: i, end: i }),
          frameRate: 4,
          repeat: -1
        });
      });
    }
  }
}
