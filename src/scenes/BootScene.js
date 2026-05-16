import Phaser from 'phaser';
import { ASSETS, ANIMATION, SCALE, DEPTH } from '../core/Constants.js';

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

const CHICKEN_COLORS = ['gray','red','white','yellow'];
const PIG_COLORS     = ['gray','pink','yellow'];

export class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'BootScene' }); }

  preload() {
    this.createProgressBar();

    // ── TERRAIN ───────────────────────────────────────────────────────────────
    this.load.image('terrain_grass',           'assets/sprites/terrain/farm_terrain_correct.png');
    this.load.image('beach_tileset',           'assets/sprites/tileset/beach_tile_set.png');
    this.load.image('trees_pine_produce',      'assets/sprites/trees/trees_pine_produce.png');
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

    // ── CHARACTER: body (walk + idle + fishing, all 3 skins) ─────────────────
    const ss64 = { frameWidth: 64, frameHeight: 64 };
    ['light','brown','dark'].forEach(tone => {
      this.load.spritesheet(`walk_body_${tone}`,
        `assets/sprites/character/walk/body/character_walk_body_${tone}.png`, ss64);
      this.load.spritesheet(`idle_body_${tone}`,
        `assets/sprites/character/idle/body/character_idle_body_${tone}.png`, ss64);
      ['throw','catch','reel','pull'].forEach(action => {
        this.load.spritesheet(`${action}_body_${tone}`,
          `assets/sprites/character/${action}/body/character_${action}_body_${tone}.png`, ss64);
      });
    });

    // ── CHARACTER: walk clothing layers ─────────────────────────────────────
    ASSETS.PANTS_COLORS.forEach(color => {
      this.load.spritesheet(`walk_pants_${color}`,
        `assets/sprites/character/walk/pants/character_walk_pants_${color}.png`, ss64);
    });
    ASSETS.SHIRT_COLORS.forEach(color => {
      this.load.spritesheet(`walk_shirt_${color}`,
        `assets/sprites/character/walk/shirt/character_walk_shirt_${color}.png`, ss64);
    });
    // Walk hair
    ASSETS.HAIR_STYLES.forEach(style => {
      ASSETS.HAIR_COLORS.forEach(color => {
        this.load.spritesheet(`walk_hair_${style}_${color}`,
          `assets/sprites/character/walk/hair/character_walk_hair_${style}_${color}.png`, ss64);
      });
    });

    // ── CHARACTER: IDLE hair layers (separate idle poses) ───────────────────
    // These exist in character/idle/hair/ and must be loaded for proper idle look
    ASSETS.HAIR_STYLES.forEach(style => {
      ASSETS.HAIR_COLORS.forEach(color => {
        this.load.spritesheet(`idle_hair_${style}_${color}`,
          `assets/sprites/character/idle/hair/character_idle_hair_${style}_${color}.png`, ss64);
      });
    });

    // ── ANIMATIONS: fish swim shadows (dedicated, better quality) ────────────
    const ss16 = { frameWidth: 16, frameHeight: 16 };
    this.load.spritesheet('fish_shadow_small',
      'assets/sprites/animations/fish_shadow_swim_animations/small_fish/animation.png', ss16);
    this.load.spritesheet('fish_shadow_medium',
      'assets/sprites/animations/fish_shadow_swim_animations/medium_fish/animation.png', ss16);
    this.load.spritesheet('fish_shadow_big',
      'assets/sprites/animations/fish_shadow_swim_animations/big_fish/animation.png', ss16);
    // Generic shadow fallbacks
    ASSETS.SHADOW_SIZES.forEach(size => {
      this.load.spritesheet(`shadow_${size}`,
        `assets/sprites/animations/shadow/${size}/animation.png`, ss16);
    });

    // ── ANIMATIONS: bobbers (18-frame sheets 96x48) ───────────────────────────
    ASSETS.BOBBER_COLORS.forEach(c => {
      this.load.spritesheet(`bobber_${c}`,
        `assets/sprites/animations/bobber/boober_${c}_floating_animation.png`, ss16);
    });
    // Bobber bite (18-frame 192x48 at 32x16)
    this.load.spritesheet('bobber_bite',
      'assets/sprites/animations/bobber_bite/bobber_fish_bitting_animation.png',
      { frameWidth: 32, frameHeight: 16 });

    // ── ANIMATIONS: water + fish appear/disappear ─────────────────────────────
    // water_ripples_animation.png is at root of animations/ (96x48 = 18 frames)
    this.load.spritesheet('water_ripple',
      'assets/sprites/animations/water_ripples_animation.png', ss16);

    ASSETS.SHADOW_SIZES.forEach(size => {
      this.load.spritesheet(`fish_appear_${size}`,
        `assets/sprites/animations/fish_appear/${size}_fish_appearing_animation.png`, ss16);
      this.load.spritesheet(`fish_disappear_${size}`,
        `assets/sprites/animations/fish_disappear/${size}_fish_disappearing_animation.png`, ss16);
    });

    // ── BUILDINGS ────────────────────────────────────────────────────────────
    this.load.image('grain_silo',   'assets/sprites/buildings/grain_silo/grainsilo_premade.png');
    this.load.image('chicken_coop', 'assets/sprites/buildings/chicken_coop/chicken_coop_premade.png');
    this.load.image('barn',         'assets/sprites/buildings/barn_premade.png');
    this.load.image('greenhouse',   'assets/sprites/buildings/greenhouse_premade.png');
    // fish_market is 256x128 (2 frames 128x128) — load as spritesheet
    this.load.spritesheet('fish_market', 'assets/sprites/buildings/fish_market.png',
      { frameWidth: 128, frameHeight: 128 });

    // ── BOATS (1024x128 = 8 frames at 128x128) ───────────────────────────────
    const ss128 = { frameWidth: 128, frameHeight: 128 };
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

    // ── ANIMALS ──────────────────────────────────────────────────────────────
    // Colored chicken variants (16 frames each, 256x16)
    CHICKEN_COLORS.forEach(color => {
      this.load.spritesheet(`chicken_${color}_walk`,
        `assets/sprites/animals/chicken/chicken_${color}_walk.png`, { frameWidth: 16, frameHeight: 16 });
      this.load.spritesheet(`chicken_${color}_idle`,
        `assets/sprites/animals/chicken/chicken_${color}_idle.png`, { frameWidth: 16, frameHeight: 16 });
      this.load.spritesheet(`chicken_${color}_peck`,
        `assets/sprites/animals/chicken/chicken_${color}_peck.png`, { frameWidth: 16, frameHeight: 16 });
    });
    // Root chicken fallbacks
    this.load.spritesheet('chicken_walk', 'assets/sprites/animals/chicken_walk.png', { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('chicken_idle', 'assets/sprites/animals/chicken_idle.png', { frameWidth: 16, frameHeight: 16 });

    // Colored pig variants (256x16 = 16 frames)
    PIG_COLORS.forEach(color => {
      this.load.spritesheet(`pig_${color}_walk`,
        `assets/sprites/animals/pig/pig_${color}_walk.png`, { frameWidth: 16, frameHeight: 16 });
      this.load.spritesheet(`pig_${color}_idle`,
        `assets/sprites/animals/pig/pig_${color}_idle.png`, { frameWidth: 16, frameHeight: 16 });
    });
    this.load.spritesheet('pig_walk', 'assets/sprites/animals/pig_walk.png', { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('pig_idle', 'assets/sprites/animals/pig_idle.png', { frameWidth: 16, frameHeight: 16 });

    // Cow (subdir version — 512x32 = 64 frames!)
    this.load.spritesheet('cow_walk', 'assets/sprites/animals/cow/cow_walk.png',
      { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('cow_idle', 'assets/sprites/animals/cow/cow_idle.png',
      { frameWidth: 16, frameHeight: 16 });
    // Root cow fallback
    this.load.spritesheet('cow_walk_root', 'assets/sprites/animals/cow_walk.png',
      { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('cow_idle_root', 'assets/sprites/animals/cow_idle.png',
      { frameWidth: 16, frameHeight: 16 });

    // Chick (256x16 = 16 frames per sheet)
    this.load.spritesheet('chick_walk', 'assets/sprites/animals/chick/chick_walk.png', { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('chick_idle', 'assets/sprites/animals/chick/chick_idle.png', { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('chick_peck', 'assets/sprites/animals/chick/chick_peck.png', { frameWidth: 16, frameHeight: 16 });

    // Piglet
    this.load.spritesheet('piglet_walk', 'assets/sprites/animals/piglet/piglet_walk.png', { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('piglet_idle', 'assets/sprites/animals/piglet/piglet_idle.png', { frameWidth: 16, frameHeight: 16 });

    // ── UI ────────────────────────────────────────────────────────────────────
    this.load.image('ui_border', 'assets/sprites/ui/fishing_ui_1_all_sprites.png');
    this.load.json('fishData',   'assets/data/fish.json');

    this.load.on('loaderror', (file) => {
      // Don't spam console for optional assets (idle hair fallback is ok)
      const optional = ['idle_hair', 'cow_walk', 'cow_idle', 'piglet_', 'chick_'];
      const isOptional = optional.some(k => file.key.startsWith(k));
      if (!isOptional) console.warn('[Boot] Load error:', file.key);
    });
  }

  createProgressBar() {
    const w = this.scale.width, h = this.scale.height;
    const bg  = this.add.rectangle(w/2, h/2, 160, 16, 0x0a0a18, 0.95).setOrigin(0.5);
    this.add.rectangle(w/2, h/2, 162, 18).setStrokeStyle(1, 0x4488ff).setOrigin(0.5);
    const bar = this.add.rectangle(w/2 - 78, h/2, 0, 12, 0x44cc88).setOrigin(0, 0.5);
    const lbl = this.add.text(w/2, h/2 - 16, 'Loading Tidefall...', {
      fontSize: '8px', fontFamily: 'monospace', color: '#88ccff'
    }).setOrigin(0.5);
    const pct = this.add.text(w/2, h/2 + 16, '0%', {
      fontSize: '7px', fontFamily: 'monospace', color: '#88aa88'
    }).setOrigin(0.5);
    this.load.on('progress', v => {
      bar.setDisplaySize(156 * v, 12);
      pct.setText(Math.round(v * 100) + '%');
    });
    this.load.on('complete', () => {
      bg.destroy(); bar.destroy(); lbl.destroy(); pct.destroy();
    });
  }

  create() {
    this.createAnimations();
    this.scene.start('FishingScene');
  }

  /** Get total frame count from a spritesheet: cols × rows */
  _frames(key, fw, fh) {
    if (!this.textures.exists(key)) return 0;
    const src = this.textures.get(key).getSourceImage();
    const cols = Math.floor(src.width  / fw);
    const rows = Math.floor(src.height / (fh || fw));
    return Math.max(1, cols * rows);
  }

  /** Get only the first-row frame count (for directional spritesheets) */
  _framesRow1(key, fw) {
    if (!this.textures.exists(key)) return 0;
    const src = this.textures.get(key).getSourceImage();
    return Math.max(1, Math.floor(src.width / fw));
  }

  createAnimations() {
    const dirs = ['down','left','right','up'];

    // ── Walk: 6 frames per direction, 4 dirs ─────────────────────────────────
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

    // ── Idle: 2 frames per direction, 4 dirs ─────────────────────────────────
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

    // ── Fishing actions: first-row frames only (facing-down = toward water) ──
    const actionFps = {
      throw: ANIMATION.THROW_FPS, catch: ANIMATION.CATCH_FPS,
      reel:  ANIMATION.REEL_FPS,  pull:  ANIMATION.PULL_FPS
    };
    ['throw','catch','reel','pull'].forEach(action => {
      ['light','brown','dark'].forEach(skin => {
        const key = `${action}_body_${skin}`;
        const n = this._framesRow1(key, 64); // first row = facing-down animation
        if (!n) return;
        this.anims.create({
          key: `${action}_${skin}`,
          frames: this.anims.generateFrameNumbers(key, { start: 0, end: n - 1 }),
          frameRate: actionFps[action] || 8,
          repeat: action === 'reel' ? -1 : 0
        });
      });
    });

    // ── Fish swim shadows (128x256 = 128 frames, use first row = 8 frames) ───
    ['small','medium','big'].forEach(size => {
      // Dedicated fish swim shadows (preferred)
      const fk = `fish_shadow_${size}`;
      if (this.textures.exists(fk)) {
        this.anims.create({
          key: `fish_shadow_swim_${size}`,
          frames: this.anims.generateFrameNumbers(fk, { start: 0, end: 7 }),
          frameRate: 6, repeat: -1
        });
      }
      // Generic shadow fallback
      const gk = `shadow_${size}`;
      if (this.textures.exists(gk)) {
        this.anims.create({
          key: `shadow_swim_${size}`,
          frames: this.anims.generateFrameNumbers(gk, { start: 0, end: 7 }),
          frameRate: 8, repeat: -1
        });
      }
    });

    // ── Bobbers: 96x48 = 18 frames total (use ALL 18) ─────────────────────────
    ASSETS.BOBBER_COLORS.forEach(c => {
      const key = `bobber_${c}`;
      const total = this._frames(key, 16, 16); // full cols×rows
      if (!total) return;
      this.anims.create({
        key: `bobber_float_${c}`,
        frames: this.anims.generateFrameNumbers(key, { start: 0, end: total - 1 }),
        frameRate: 8, repeat: -1
      });
    });

    // ── Bobber bite: 192x48 at 32x16 = 18 frames ─────────────────────────────
    const bbTotal = this._frames('bobber_bite', 32, 16);
    if (bbTotal > 0) {
      this.anims.create({
        key: 'bobber_bite_anim',
        frames: this.anims.generateFrameNumbers('bobber_bite', { start: 0, end: bbTotal - 1 }),
        frameRate: 10, repeat: -1
      });
    }

    // ── Water ripple: 96x48 = 18 frames, plays once ───────────────────────────
    const wrTotal = this._frames('water_ripple', 16, 16);
    if (wrTotal > 0) {
      this.anims.create({
        key: 'ripple',
        frames: this.anims.generateFrameNumbers('water_ripple', { start: 0, end: wrTotal - 1 }),
        frameRate: 12, repeat: 0
      });
    }

    // ── Fish appear/disappear: 128x32 = 16 frames ────────────────────────────
    ASSETS.SHADOW_SIZES.forEach(size => {
      const ak = `fish_appear_${size}`;
      const dk = `fish_disappear_${size}`;
      const an = this._frames(ak, 16, 16);
      const dn = this._frames(dk, 16, 16);
      if (an > 0) this.anims.create({ key: `fish_appear_${size}`,    frames: this.anims.generateFrameNumbers(ak, { start: 0, end: an-1 }), frameRate: 10, repeat: 0 });
      if (dn > 0) this.anims.create({ key: `fish_disappear_${size}`, frames: this.anims.generateFrameNumbers(dk, { start: 0, end: dn-1 }), frameRate: 10, repeat: 0 });
    });

    // ── Palm tree sway: 240x80 = 3 frames ────────────────────────────────────
    if (this.textures.exists('palm_tree')) {
      this.anims.create({
        key: 'palm_sway',
        frames: this.anims.generateFrameNumbers('palm_tree', { start: 0, end: 2 }),
        frameRate: 3, repeat: -1, yoyo: true
      });
    }

    // ── Pine tree growth: 352x80 = 4 frames ──────────────────────────────────
    if (this.textures.exists('trees_pine_growth')) {
      this.anims.create({
        key: 'pine_sway',
        frames: this.anims.generateFrameNumbers('trees_pine_growth', { start: 0, end: 3 }),
        frameRate: 3, repeat: -1, yoyo: true
      });
    }

    // ── Animals ──────────────────────────────────────────────────────────────
    // Colored chickens (chicken_gray_walk: 256x16 = 16 frames)
    CHICKEN_COLORS.forEach(color => {
      const wk = `chicken_${color}_walk`, ik = `chicken_${color}_idle`, pk = `chicken_${color}_peck`;
      const wn = this._frames(wk, 16, 16);
      const in_ = this._frames(ik, 16, 16);
      const pn = this._frames(pk, 16, 16);
      if (wn) this.anims.create({ key: wk, frames: this.anims.generateFrameNumbers(wk, { start: 0, end: wn-1 }), frameRate: 8, repeat: -1 });
      if (in_) this.anims.create({ key: ik, frames: this.anims.generateFrameNumbers(ik, { start: 0, end: in_-1 }), frameRate: 4, repeat: -1 });
      if (pn) this.anims.create({ key: pk, frames: this.anims.generateFrameNumbers(pk, { start: 0, end: pn-1 }), frameRate: 10, repeat: 0 });
    });
    const cwn = this._frames('chicken_walk', 16, 16);
    if (cwn) this.anims.create({ key: 'chicken_walk', frames: this.anims.generateFrameNumbers('chicken_walk', { start: 0, end: cwn-1 }), frameRate: 8, repeat: -1 });
    const cin = this._frames('chicken_idle', 16, 16);
    if (cin) this.anims.create({ key: 'chicken_idle', frames: this.anims.generateFrameNumbers('chicken_idle', { start: 0, end: cin-1 }), frameRate: 4, repeat: -1 });

    // Colored pigs
    PIG_COLORS.forEach(color => {
      const wk = `pig_${color}_walk`, ik = `pig_${color}_idle`;
      const wn = this._frames(wk, 16, 16);
      const in_ = this._frames(ik, 16, 16);
      if (wn) this.anims.create({ key: wk, frames: this.anims.generateFrameNumbers(wk, { start: 0, end: wn-1 }), frameRate: 7, repeat: -1 });
      if (in_) this.anims.create({ key: ik, frames: this.anims.generateFrameNumbers(ik, { start: 0, end: in_-1 }), frameRate: 4, repeat: -1 });
    });
    const pwn = this._frames('pig_walk', 16, 16);
    if (pwn) this.anims.create({ key: 'pig_walk', frames: this.anims.generateFrameNumbers('pig_walk', { start: 0, end: pwn-1 }), frameRate: 7, repeat: -1 });

    // Cow (512x32 = 64 frames total — use first 8 as walk cycle)
    const cowWn = Math.min(8, this._framesRow1('cow_walk', 16));
    if (cowWn) this.anims.create({ key: 'cow_walk', frames: this.anims.generateFrameNumbers('cow_walk', { start: 0, end: cowWn-1 }), frameRate: 6, repeat: -1 });
    const cowIn = Math.min(4, this._framesRow1('cow_idle', 16));
    if (cowIn) this.anims.create({ key: 'cow_idle', frames: this.anims.generateFrameNumbers('cow_idle', { start: 0, end: cowIn-1 }), frameRate: 3, repeat: -1 });

    // Chick
    const ckWn = this._frames('chick_walk', 16, 16);
    if (ckWn) this.anims.create({ key: 'chick_walk', frames: this.anims.generateFrameNumbers('chick_walk', { start: 0, end: ckWn-1 }), frameRate: 8, repeat: -1 });
    const ckPn = this._frames('chick_peck', 16, 16);
    if (ckPn) this.anims.create({ key: 'chick_peck', frames: this.anims.generateFrameNumbers('chick_peck', { start: 0, end: ckPn-1 }), frameRate: 10, repeat: 0 });

    // Piglet
    const plWn = this._frames('piglet_walk', 16, 16);
    if (plWn) this.anims.create({ key: 'piglet_walk', frames: this.anims.generateFrameNumbers('piglet_walk', { start: 0, end: plWn-1 }), frameRate: 7, repeat: -1 });
  }
}
