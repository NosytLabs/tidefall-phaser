import Phaser from 'phaser';
import {
  ASSETS, ANIMATION, WORLD, COLORS, SCALE, DEPTH
} from '../core/Constants.js';

/**
 * BootScene — Asset loading & animation creation
 */

const FISH_NAMES = [
  'bass','blobfish','butterfly_fish','catfish','char','cherry_salmon',
  'clown_fish','cod','coho_salmon','cow_fish','giant_tevally','golden_trout',
  'guppy','halibut','herring','lion_fish','loach','mackerel','mahi_mahi',
  'manta_ray','napolean_fish','neon_tetras','oarfish','ocean_sunfish',
  'parrot_fish','pike','pink_salmon','pirana','plaice','pompano',
  'puffer_fish','rainbow_fish','sea_horse','shark_greatwhite','shark_hammerhead',
  'shark_saw','shark_whale','silver_eel','sockeye_salmon','squid',
  'sucker_fish','surgeon_fish','swordfish','whiting_fish'
];

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    this.createProgressBar();

    // --- TERRAIN ---
    this.load.image('terrain_grass', 'assets/sprites/terrain/farm_terrain_correct.png');
    this.load.image('beach_tileset', 'assets/sprites/tileset/beach_tile_set.png');
    this.load.image('trees_pine_produce', 'assets/sprites/trees/trees_pine_produce.png');
    this.load.image('trees_pine_spring_summer', 'assets/sprites/trees/trees_pine_spring_summer.png');
    this.load.image('trees_pine_spring_autumn', 'assets/sprites/trees/trees_pine_spring_autumn.png');

    // --- FISH (44 species) ---
    FISH_NAMES.forEach(name => {
      let path = `assets/sprites/fish/${name}/static_fish.png`;
      if (name === 'butterfly_fish') path = `assets/sprites/fish/${name}/white_black_fin/static_fish.png`;
      if (name === 'clown_fish')  path = `assets/sprites/fish/${name}/red/static_fish.png`;
      if (name === 'guppy')       path = `assets/sprites/fish/${name}/blue/static_fish.png`;
      if (name === 'loach')       path = `assets/sprites/fish/${name}/silver/static_fish.png`;
      if (name === 'mackerel')    path = `assets/sprites/fish/${name}/green/static_fish.png`;
      if (name === 'parrot_fish') path = `assets/sprites/fish/${name}/small/static_fish.png`;
      if (name === 'pirana')      path = `assets/sprites/fish/${name}/blue/static_fish.png`;
      if (name === 'swordfish')   path = `assets/sprites/fish/${name}/blue/static_fish.png`;
      if (name === 'neon_tetras') path = `assets/sprites/fish/${name}/dark_blue/static_fish.png`;
      this.load.image(`fish_${name}`, path);
    });

    // --- CHARACTER: body (all 3 skins × walk + idle + fishing actions) ---
    const ss64 = { frameWidth: 64, frameHeight: 64 };
    ['light', 'brown', 'dark'].forEach(tone => {
      this.load.spritesheet(`walk_body_${tone}`,
        `assets/sprites/character/walk/body/character_walk_body_${tone}.png`, ss64);
      this.load.spritesheet(`idle_body_${tone}`,
        `assets/sprites/character/idle/body/character_idle_body_${tone}.png`, ss64);
      ['throw', 'catch', 'reel', 'pull'].forEach(action => {
        this.load.spritesheet(`${action}_body_${tone}`,
          `assets/sprites/character/${action}/body/character_${action}_body_${tone}.png`, ss64);
      });
    });

    // --- CHARACTER: clothing layers (pants, shirts, hair) ---
    // These MUST be loaded for the player to appear dressed
    ASSETS.PANTS_COLORS.forEach(color => {
      this.load.spritesheet(`walk_pants_${color}`,
        `assets/sprites/character/walk/pants/character_walk_pants_${color}.png`, ss64);
    });
    ASSETS.SHIRT_COLORS.forEach(color => {
      this.load.spritesheet(`walk_shirt_${color}`,
        `assets/sprites/character/walk/shirt/character_walk_shirt_${color}.png`, ss64);
    });
    ASSETS.HAIR_STYLES.forEach(style => {
      ASSETS.HAIR_COLORS.forEach(color => {
        this.load.spritesheet(`walk_hair_${style}_${color}`,
          `assets/sprites/character/walk/hair/character_walk_hair_${style}_${color}.png`, ss64);
      });
    });

    // --- ANIMATIONS ---
    const ss16 = { frameWidth: 16, frameHeight: 16 };
    ASSETS.SHADOW_SIZES.forEach(size => {
      this.load.spritesheet(`shadow_${size}`,
        `assets/sprites/animations/shadow/${size}/animation.png`, ss16);
    });
    ASSETS.BOBBER_COLORS.forEach(c => {
      this.load.spritesheet(`bobber_${c}`,
        `assets/sprites/animations/bobber/boober_${c}_floating_animation.png`, ss16);
    });
    this.load.spritesheet('water_ripple',
      'assets/sprites/animations/water_ripples_animation.png', ss16);
    this.load.spritesheet('bobber_bite',
      'assets/sprites/animations/bobber_bite/bobber_fish_bitting_animation.png',
      { frameWidth: 32, frameHeight: 16 });
    ASSETS.SHADOW_SIZES.forEach(size => {
      this.load.spritesheet(`fish_appear_${size}`,
        `assets/sprites/animations/fish_appear/${size}_fish_appearing_animation.png`, ss16);
      this.load.spritesheet(`fish_disappear_${size}`,
        `assets/sprites/animations/fish_disappear/${size}_fish_disappearing_animation.png`, ss16);
    });

    // --- BUILDINGS ---
    const ss128 = { frameWidth: 128, frameHeight: 128 };
    this.load.image('grain_silo',    'assets/sprites/buildings/grain_silo/grainsilo_premade.png');
    this.load.image('chicken_coop',  'assets/sprites/buildings/chicken_coop/chicken_coop_premade.png');
    this.load.image('barn',          'assets/sprites/buildings/barn_premade.png');
    this.load.image('greenhouse',    'assets/sprites/buildings/greenhouse_premade.png');
    this.load.spritesheet('fish_market', 'assets/sprites/buildings/fish_market.png', ss128);

    // --- BOATS ---
    this.load.spritesheet('boat_blue',   'assets/sprites/boats/fishing_boat_blue/full_boat.png', ss128);
    this.load.spritesheet('boat_yellow', 'assets/sprites/boats/fishing_boat_yellow/full_boat.png', ss128);
    this.load.spritesheet('boat_small',  'assets/sprites/boats/small_boat/full_boat.png', ss128);

    // --- TREES ---
    this.load.spritesheet('palm_tree',        'assets/sprites/trees/palm_tree.png',        { frameWidth: 80, frameHeight: 80 });
    this.load.spritesheet('trees_pine_growth','assets/sprites/trees/trees_pine_growth.png', { frameWidth: 80, frameHeight: 80 });
    this.load.image('apple_tree', 'assets/sprites/trees/apple_tree.png');
    this.load.image('peach_tree', 'assets/sprites/trees/peach_tree.png');

    // --- ANIMALS ---
    ASSETS.ANIMAL_TYPES.forEach(animal => {
      if (animal === 'chick' || animal === 'piglet') {
        this.load.spritesheet(animal,
          `assets/sprites/animals/${animal}/${animal}_all_frames.png`,
          { frameWidth: 16, frameHeight: 16 });
      } else {
        this.load.spritesheet(`${animal}_walk`,
          `assets/sprites/animals/${animal}_walk.png`, { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet(`${animal}_idle`,
          `assets/sprites/animals/${animal}_idle.png`, { frameWidth: 16, frameHeight: 16 });
      }
    });

    this.load.image('ui_border', 'assets/sprites/ui/fishing_ui_1_all_sprites.png');
    this.load.json('fishData', 'assets/data/fish.json');

    this.load.on('loaderror', (file) => {
      console.warn('[BootScene] Failed to load:', file.key);
    });
  }

  createProgressBar() {
    const w = this.scale.width, h = this.scale.height;
    const bg  = this.add.rectangle(w / 2, h / 2, 120, 12, 0x222222).setOrigin(0.5);
    const bar = this.add.rectangle(w / 2 - 58, h / 2 - 5, 116, 10, 0x44cc88).setOrigin(0, 0);
    this.load.on('progress', v => bar.setDisplaySize(116 * v, 10));
    this.load.on('complete', () => { bg.destroy(); bar.destroy(); });
  }

  create() {
    this.createAnimations();
    this.scene.start('FishingScene');
  }

  createAnimations() {
    const dirs = ['down', 'left', 'right', 'up'];

    // --- Walk (all 3 skins, 4 directions, 6 frames each) ---
    ['light', 'brown', 'dark'].forEach(skin => {
      if (!this.textures.exists(`walk_body_${skin}`)) return;
      dirs.forEach((dir, i) => {
        this.anims.create({
          key: `walk_${skin}_${dir}`,
          frames: this.anims.generateFrameNumbers(`walk_body_${skin}`, { start: i * 6, end: i * 6 + 5 }),
          frameRate: ANIMATION.WALK_FPS, repeat: -1
        });
      });
    });

    // --- Idle (all 3 skins, 4 directions, 2 frames each) ---
    ['light', 'brown', 'dark'].forEach(skin => {
      if (!this.textures.exists(`idle_body_${skin}`)) return;
      dirs.forEach((dir, i) => {
        this.anims.create({
          key: `idle_${skin}_${dir}`,
          frames: this.anims.generateFrameNumbers(`idle_body_${skin}`, { start: i * 2, end: i * 2 + 1 }),
          frameRate: ANIMATION.IDLE_FPS, repeat: -1
        });
      });
    });

    // --- Fishing actions (all 3 skins, no direction — single animation per action+skin) ---
    const actionFps = { throw: 6, catch: 4, reel: 8, pull: 6 };
    ['throw', 'catch', 'reel', 'pull'].forEach(action => {
      ['light', 'brown', 'dark'].forEach(skin => {
        const key = `${action}_body_${skin}`;
        if (!this.textures.exists(key)) return;
        const src = this.textures.get(key).getSourceImage();
        const framesX = Math.floor(src.width / 64);
        if (framesX < 1) return;
        this.anims.create({
          key: `${action}_${skin}`,
          frames: this.anims.generateFrameNumbers(key, { start: 0, end: framesX - 1 }),
          frameRate: actionFps[action] || 8,
          repeat: action === 'reel' ? -1 : 0
        });
      });
    });

    // --- Fish shadows ---
    const shadowFrames = { start: 0, end: 7 };
    ASSETS.SHADOW_SIZES.forEach(size => {
      if (this.textures.exists(`shadow_${size}`)) {
        this.anims.create({
          key: `shadow_swim_${size}`,
          frames: this.anims.generateFrameNumbers(`shadow_${size}`, shadowFrames),
          frameRate: 8, repeat: -1
        });
      }
    });

    // --- Bobbers ---
    ASSETS.BOBBER_COLORS.forEach(c => {
      if (this.textures.exists(`bobber_${c}`)) {
        this.anims.create({
          key: `bobber_float_${c}`,
          frames: this.anims.generateFrameNumbers(`bobber_${c}`, { start: 0, end: 3 }),
          frameRate: 4, repeat: -1
        });
      }
    });

    // --- Water ripple ---
    if (this.textures.exists('water_ripple')) {
      this.anims.create({
        key: 'ripple',
        frames: this.anims.generateFrameNumbers('water_ripple', { start: 0, end: 7 }),
        frameRate: 8, repeat: 0
      });
    }

    // --- Palm tree sway ---
    if (this.textures.exists('palm_tree')) {
      this.anims.create({
        key: 'palm_sway',
        frames: this.anims.generateFrameNumbers('palm_tree', { start: 0, end: 2 }),
        frameRate: 3, repeat: -1, yoyo: true
      });
    }

    // --- Animals (chicken, cow, pig — walk + idle) ---
    ['chicken', 'cow', 'pig'].forEach(animal => {
      if (this.textures.exists(`${animal}_walk`)) {
        const src = this.textures.get(`${animal}_walk`).getSourceImage();
        const frames = Math.max(1, Math.floor(src.width / 16));
        this.anims.create({
          key: `${animal}_walk`,
          frames: this.anims.generateFrameNumbers(`${animal}_walk`, { start: 0, end: frames - 1 }),
          frameRate: 6, repeat: -1
        });
      }
      if (this.textures.exists(`${animal}_idle`)) {
        const src = this.textures.get(`${animal}_idle`).getSourceImage();
        const frames = Math.max(1, Math.floor(src.width / 16));
        this.anims.create({
          key: `${animal}_idle`,
          frames: this.anims.generateFrameNumbers(`${animal}_idle`, { start: 0, end: Math.min(frames - 1, 3) }),
          frameRate: 3, repeat: -1
        });
      }
    });

    // --- Chick / Piglet ---
    ['chick', 'piglet'].forEach(animal => {
      if (this.textures.exists(animal)) {
        const src = this.textures.get(animal).getSourceImage();
        const frames = Math.max(1, Math.floor(src.width / 16));
        this.anims.create({
          key: `${animal}_walk`,
          frames: this.anims.generateFrameNumbers(animal, { start: 0, end: Math.min(frames - 1, 7) }),
          frameRate: 6, repeat: -1
        });
      }
    });
  }
}
