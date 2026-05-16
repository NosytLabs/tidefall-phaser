import Phaser from 'phaser';
import { ASSETS, ANIMATION, WORLD, COLORS, SCALE, DEPTH } from '../core/Constants.js';

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

// Colored chicken/pig variants to randomize animal appearances
const CHICKEN_COLORS = ['gray', 'red', 'white', 'yellow'];
const PIG_COLORS     = ['gray', 'pink', 'yellow'];

export class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'BootScene' }); }

  preload() {
    this.createProgressBar();

    // ── TERRAIN ───────────────────────────────────────────────────────────────
    this.load.image('terrain_grass',          'assets/sprites/terrain/farm_terrain_correct.png');
    this.load.image('beach_tileset',          'assets/sprites/tileset/beach_tile_set.png');
    this.load.image('trees_pine_produce',     'assets/sprites/trees/trees_pine_produce.png');
    this.load.image('trees_pine_spring_summer','assets/sprites/trees/trees_pine_spring_summer.png');
    this.load.image('trees_pine_spring_autumn','assets/sprites/trees/trees_pine_spring_autumn.png');

    // ── FISH (44 species) ────────────────────────────────────────────────────
    FISH_NAMES.forEach(name => {
      let path = `assets/sprites/fish/${name}/static_fish.png`;
      if (name === 'butterfly_fish') path = `assets/sprites/fish/${name}/white_black_fin/static_fish.png`;
      if (name === 'clown_fish')     path = `assets/sprites/fish/${name}/red/static_fish.png`;
      if (name === 'guppy')          path = `assets/sprites/fish/${name}/blue/static_fish.png`;
      if (name === 'loach')          path = `assets/sprites/fish/${name}/silver/static_fish.png`;
      if (name === 'mackerel')       path = `assets/sprites/fish/${name}/green/static_fish.png`;
      if (name === 'parrot_fish')    path = `assets/sprites/fish/${name}/small/static_fish.png`;
      if (name === 'pirana')         path = `assets/sprites/fish/${name}/blue/static_fish.png`;
      if (name === 'swordfish')      path = `assets/sprites/fish/${name}/blue/static_fish.png`;
      if (name === 'neon_tetras')    path = `assets/sprites/fish/${name}/dark_blue/static_fish.png`;
      this.load.image(`fish_${name}`, path);
    });

    // ── CHARACTER: body + clothing ───────────────────────────────────────────
    const ss64 = { frameWidth: 64, frameHeight: 64 };
    ['light', 'brown', 'dark'].forEach(tone => {
      this.load.spritesheet(`walk_body_${tone}`,
        `assets/sprites/character/walk/body/character_walk_body_${tone}.png`, ss64);
      this.load.spritesheet(`idle_body_${tone}`,
        `assets/sprites/character/idle/body/character_idle_body_${tone}.png`, ss64);
      ['throw','catch','reel','pull'].forEach(action => {
        this.load.spritesheet(`${action}_body_${tone}`,
          `assets/sprites/character/${action}/body/character_${action}_body_${tone}.png`, ss64);
      });
    });

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

    // ── ANIMATIONS: shadows ───────────────────────────────────────────────────
    const ss16 = { frameWidth: 16, frameHeight: 16 };

    // Generic shadows (still needed for fallback)
    ASSETS.SHADOW_SIZES.forEach(size => {
      this.load.spritesheet(`shadow_${size}`,
        `assets/sprites/animations/shadow/${size}/animation.png`, ss16);
    });

    // Dedicated fish swimming shadows (better quality, used by FishManager)
    this.load.spritesheet('fish_shadow_small',
      'assets/sprites/animations/fish_shadow_swim_animations/small_fish/animation.png', ss16);
    this.load.spritesheet('fish_shadow_medium',
      'assets/sprites/animations/fish_shadow_swim_animations/medium_fish/animation.png', ss16);
    this.load.spritesheet('fish_shadow_big',
      'assets/sprites/animations/fish_shadow_swim_animations/big_fish/animation.png', ss16);

    // ── ANIMATIONS: bobbers ───────────────────────────────────────────────────
    ASSETS.BOBBER_COLORS.forEach(c => {
      this.load.spritesheet(`bobber_${c}`,
        `assets/sprites/animations/bobber/boober_${c}_floating_animation.png`, ss16);
    });

    // Bobber bite — 32x16 frames
    this.load.spritesheet('bobber_bite',
      'assets/sprites/animations/bobber_bite/bobber_fish_bitting_animation.png',
      { frameWidth: 32, frameHeight: 16 });

    // ── ANIMATIONS: water + fish appear/disappear ─────────────────────────────
    // Water ripple — try both possible paths
    this.load.spritesheet('water_ripple',
      'assets/sprites/animations/water_riples_animation/water_ripples_animation.png', ss16);

    ASSETS.SHADOW_SIZES.forEach(size => {
      this.load.spritesheet(`fish_appear_${size}`,
        `assets/sprites/animations/fish_appear/${size}_fish_appearing_animation.png`, ss16);
      this.load.spritesheet(`fish_disappear_${size}`,
        `assets/sprites/animations/fish_disappear/${size}_fish_disappearing_animation.png`, ss16);
    });

    // ── BUILDINGS ────────────────────────────────────────────────────────────
    const ss128 = { frameWidth: 128, frameHeight: 128 };
    this.load.image('grain_silo',    'assets/sprites/buildings/grain_silo/grainsilo_premade.png');
    this.load.image('chicken_coop',  'assets/sprites/buildings/chicken_coop/chicken_coop_premade.png');
    this.load.image('barn',          'assets/sprites/buildings/barn_premade.png');
    this.load.image('greenhouse',    'assets/sprites/buildings/greenhouse_premade.png');
    // fish_market is a single image (8KB) — load as image, not spritesheet
    this.load.image('fish_market',   'assets/sprites/buildings/fish_market.png');

    // ── BOATS ─────────────────────────────────────────────────────────────────
    this.load.spritesheet('boat_blue',   'assets/sprites/boats/fishing_boat_blue/full_boat.png',   ss128);
    this.load.spritesheet('boat_yellow', 'assets/sprites/boats/fishing_boat_yellow/full_boat.png', ss128);
    this.load.spritesheet('boat_small',  'assets/sprites/boats/small_boat/full_boat.png',          ss128);

    // ── TREES ────────────────────────────────────────────────────────────────
    this.load.spritesheet('palm_tree',
      'assets/sprites/trees/palm_tree.png', { frameWidth: 80, frameHeight: 80 });
    this.load.spritesheet('trees_pine_growth',
      'assets/sprites/trees/trees_pine_growth.png', { frameWidth: 80, frameHeight: 80 });
    this.load.image('apple_tree', 'assets/sprites/trees/apple_tree.png');
    this.load.image('peach_tree', 'assets/sprites/trees/peach_tree.png');

    // ── ANIMALS: flat root files (confirmed correct paths) ────────────────────
    // Cow
    this.load.spritesheet('cow_walk', 'assets/sprites/animals/cow_walk.png', { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('cow_idle', 'assets/sprites/animals/cow_idle.png', { frameWidth: 16, frameHeight: 16 });
    // Better cow from subdirectory (may have more frames/quality)
    this.load.spritesheet('cow_sub_walk', 'assets/sprites/animals/cow/cow_walk.png', { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('cow_sub_idle', 'assets/sprites/animals/cow/cow_idle.png', { frameWidth: 16, frameHeight: 16 });

    // Pig variants (pink, gray, yellow for visual diversity)
    PIG_COLORS.forEach(color => {
      this.load.spritesheet(`pig_${color}_walk`,
        `assets/sprites/animals/pig/pig_${color}_walk.png`, { frameWidth: 16, frameHeight: 16 });
      this.load.spritesheet(`pig_${color}_idle`,
        `assets/sprites/animals/pig/pig_${color}_idle.png`, { frameWidth: 16, frameHeight: 16 });
    });
    // Root fallbacks
    this.load.spritesheet('pig_walk', 'assets/sprites/animals/pig_walk.png', { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('pig_idle', 'assets/sprites/animals/pig_idle.png', { frameWidth: 16, frameHeight: 16 });

    // Colored chicken variants (gray, red, white, yellow)
    CHICKEN_COLORS.forEach(color => {
      this.load.spritesheet(`chicken_${color}_walk`,
        `assets/sprites/animals/chicken/chicken_${color}_walk.png`, { frameWidth: 16, frameHeight: 16 });
      this.load.spritesheet(`chicken_${color}_idle`,
        `assets/sprites/animals/chicken/chicken_${color}_idle.png`, { frameWidth: 16, frameHeight: 16 });
      this.load.spritesheet(`chicken_${color}_peck`,
        `assets/sprites/animals/chicken/chicken_${color}_peck.png`, { frameWidth: 16, frameHeight: 16 });
    });
    // Root fallbacks
    this.load.spritesheet('chicken_walk', 'assets/sprites/animals/chicken_walk.png', { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('chicken_idle', 'assets/sprites/animals/chicken_idle.png', { frameWidth: 16, frameHeight: 16 });

    // Chick + piglet
    this.load.spritesheet('chick',  'assets/sprites/animals/chick/chick_all_frames.png',   { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('chick_walk', 'assets/sprites/animals/chick/chick_walk.png',     { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('chick_peck', 'assets/sprites/animals/chick/chick_peck.png',     { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('piglet',     'assets/sprites/animals/piglet/piglet_all_frames.png', { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('piglet_walk','assets/sprites/animals/piglet/piglet_walk.png',   { frameWidth: 16, frameHeight: 16 });

    // ── UI ────────────────────────────────────────────────────────────────────
    this.load.image('ui_border', 'assets/sprites/ui/fishing_ui_1_all_sprites.png');
    this.load.json('fishData',   'assets/data/fish.json');

    this.load.on('loaderror', (file) => {
      // Silent warn — missing optional asset
      if (!file.key.startsWith('pig_') && !file.key.startsWith('cow_sub')) {
        console.warn('[Boot] Failed to load:', file.key, file.src);
      }
    });
  }

  createProgressBar() {
    const w = this.scale.width, h = this.scale.height;
    const bg  = this.add.rectangle(w/2, h/2, 140, 14, 0x111111, 0.9).setOrigin(0.5);
    const bar = this.add.rectangle(w/2 - 68, h/2, 0, 10, 0x44cc88).setOrigin(0, 0.5);
    const lbl = this.add.text(w/2, h/2 - 14, 'Loading Tidefall...', {
      fontSize: '8px', fontFamily: 'monospace', color: '#88ccff'
    }).setOrigin(0.5);
    this.load.on('progress', v => bar.setDisplaySize(136 * v, 10));
    this.load.on('complete', () => { bg.destroy(); bar.destroy(); lbl.destroy(); });
  }

  create() {
    this.createAnimations();
    this.scene.start('FishingScene');
  }

  /** Auto-detect frame count from spritesheet width */
  _frames(textureKey, frameW) {
    if (!this.textures.exists(textureKey)) return 0;
    const src = this.textures.get(textureKey).getSourceImage();
    return Math.max(1, Math.floor(src.width / frameW));
  }

  createAnimations() {
    const dirs = ['down','left','right','up'];

    // ── Walk (3 skins × 4 dirs × 6 frames) ──────────────────────────────────
    ['light','brown','dark'].forEach(skin => {
      if (!this.textures.exists(`walk_body_${skin}`)) return;
      dirs.forEach((dir, i) => {
        this.anims.create({
          key: `walk_${skin}_${dir}`,
          frames: this.anims.generateFrameNumbers(`walk_body_${skin}`, { start: i*6, end: i*6+5 }),
          frameRate: ANIMATION.WALK_FPS, repeat: -1
        });
      });
    });

    // ── Idle (3 skins × 4 dirs × 2 frames) ──────────────────────────────────
    ['light','brown','dark'].forEach(skin => {
      if (!this.textures.exists(`idle_body_${skin}`)) return;
      dirs.forEach((dir, i) => {
        this.anims.create({
          key: `idle_${skin}_${dir}`,
          frames: this.anims.generateFrameNumbers(`idle_body_${skin}`, { start: i*2, end: i*2+1 }),
          frameRate: ANIMATION.IDLE_FPS, repeat: -1
        });
      });
    });

    // ── Fishing actions (3 skins, no direction) ──────────────────────────────
    const actionFps = { throw: ANIMATION.THROW_FPS, catch: ANIMATION.CATCH_FPS,
                        reel: ANIMATION.REEL_FPS,   pull: ANIMATION.PULL_FPS };
    ['throw','catch','reel','pull'].forEach(action => {
      ['light','brown','dark'].forEach(skin => {
        const key = `${action}_body_${skin}`;
        const n = this._frames(key, 64);
        if (!n) return;
        this.anims.create({
          key: `${action}_${skin}`,
          frames: this.anims.generateFrameNumbers(key, { start: 0, end: n-1 }),
          frameRate: actionFps[action] || 8,
          repeat: action === 'reel' ? -1 : 0
        });
      });
    });

    // ── Fish swim shadows ────────────────────────────────────────────────────
    // Dedicated fish swim anims (used by FishManager)
    ['small','medium','big'].forEach(size => {
      const fkey = `fish_shadow_${size}`;
      const n = this._frames(fkey, 16);
      if (n > 0) {
        this.anims.create({
          key: `fish_shadow_swim_${size}`,
          frames: this.anims.generateFrameNumbers(fkey, { start: 0, end: n-1 }),
          frameRate: 6, repeat: -1
        });
      }
      // Generic fallback
      const gkey = `shadow_${size}`;
      const gn = this._frames(gkey, 16);
      if (gn > 0) {
        this.anims.create({
          key: `shadow_swim_${size}`,
          frames: this.anims.generateFrameNumbers(gkey, { start: 0, end: Math.min(gn-1, 7) }),
          frameRate: 8, repeat: -1
        });
      }
    });

    // ── Bobbers ──────────────────────────────────────────────────────────────
    ASSETS.BOBBER_COLORS.forEach(c => {
      const n = this._frames(`bobber_${c}`, 16);
      if (!n) return;
      this.anims.create({
        key: `bobber_float_${c}`,
        frames: this.anims.generateFrameNumbers(`bobber_${c}`, { start: 0, end: Math.min(n-1, 7) }),
        frameRate: 5, repeat: -1
      });
    });

    // Bobber bite
    const bbN = this._frames('bobber_bite', 32);
    if (bbN > 0) {
      this.anims.create({
        key: 'bobber_bite',
        frames: this.anims.generateFrameNumbers('bobber_bite', { start: 0, end: bbN-1 }),
        frameRate: 8, repeat: -1
      });
    }

    // ── Water ripple ─────────────────────────────────────────────────────────
    const wrN = this._frames('water_ripple', 16);
    if (wrN > 0) {
      this.anims.create({
        key: 'ripple',
        frames: this.anims.generateFrameNumbers('water_ripple', { start: 0, end: Math.min(wrN-1, 7) }),
        frameRate: 8, repeat: 0
      });
    }

    // ── Palm tree sway ───────────────────────────────────────────────────────
    const ptN = this._frames('palm_tree', 80);
    if (ptN >= 2) {
      this.anims.create({
        key: 'palm_sway',
        frames: this.anims.generateFrameNumbers('palm_tree', { start: 0, end: ptN-1 }),
        frameRate: 3, repeat: -1, yoyo: true
      });
    }

    // ── Animals ──────────────────────────────────────────────────────────────
    this._makeAnimalAnims('cow',   'cow_walk',  'cow_idle',  'cow_walk');
    this._makeAnimalAnims('pig',   'pig_walk',  'pig_idle',  'pig_walk');
    this._makeAnimalAnims('chick', 'chick_walk','chick_peck','chick_walk');

    // Colored chickens
    const CHICKEN_COLORS = ['gray','red','white','yellow'];
    CHICKEN_COLORS.forEach(color => {
      const wk = `chicken_${color}_walk`;
      const ik = `chicken_${color}_idle`;
      const pk = `chicken_${color}_peck`;
      const wn = this._frames(wk, 16);
      const in_ = this._frames(ik, 16);
      const pn = this._frames(pk, 16);
      if (wn > 0) this.anims.create({ key: wk, frames: this.anims.generateFrameNumbers(wk, { start: 0, end: wn-1 }), frameRate: 7, repeat: -1 });
      if (in_ > 0) this.anims.create({ key: ik, frames: this.anims.generateFrameNumbers(ik, { start: 0, end: in_-1 }), frameRate: 3, repeat: -1 });
      if (pn > 0) this.anims.create({ key: pk, frames: this.anims.generateFrameNumbers(pk, { start: 0, end: pn-1 }), frameRate: 6, repeat: -1 });
    });
    // Root chicken fallback
    const cwN = this._frames('chicken_walk', 16);
    if (cwN > 0) this.anims.create({ key: 'chicken_walk', frames: this.anims.generateFrameNumbers('chicken_walk', { start: 0, end: cwN-1 }), frameRate: 7, repeat: -1 });
    const ciN = this._frames('chicken_idle', 16);
    if (ciN > 0) this.anims.create({ key: 'chicken_idle', frames: this.anims.generateFrameNumbers('chicken_idle', { start: 0, end: ciN-1 }), frameRate: 3, repeat: -1 });

    // Colored pigs
    ['gray','pink','yellow'].forEach(color => {
      const wk = `pig_${color}_walk`;
      const ik = `pig_${color}_idle`;
      const wn = this._frames(wk, 16);
      const in_ = this._frames(ik, 16);
      if (wn > 0) this.anims.create({ key: wk, frames: this.anims.generateFrameNumbers(wk, { start: 0, end: wn-1 }), frameRate: 6, repeat: -1 });
      if (in_ > 0) this.anims.create({ key: ik, frames: this.anims.generateFrameNumbers(ik, { start: 0, end: in_-1 }), frameRate: 3, repeat: -1 });
    });
  }

  _makeAnimalAnims(name, walkKey, idleKey, fallbackKey) {
    const wn = this._frames(walkKey, 16);
    if (wn > 0) this.anims.create({ key: walkKey, frames: this.anims.generateFrameNumbers(walkKey, { start: 0, end: wn-1 }), frameRate: 6, repeat: -1 });
    const in_ = this._frames(idleKey, 16);
    if (in_ > 0) this.anims.create({ key: idleKey, frames: this.anims.generateFrameNumbers(idleKey, { start: 0, end: in_-1 }), frameRate: 3, repeat: -1 });
  }
}
