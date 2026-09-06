/**
 * Constants — Tidefall v2
 * Internal resolution: 960 x 270 (scrollable world, 16:9-ish viewport)
 */

// Display — viewport stays 480x270 but the WORLD is 1920px wide
export const GAME = {
  WIDTH: 1920,      // scrollable world width
  VIEW_WIDTH: 480,  // visible viewport width (Phaser canvas)
  HEIGHT: 270,
  BACKGROUND_COLOR: '#1a1a2e',
  PIXEL_ART: true,
  ROUND_PIXELS: true,
  ANTIALIAS: false
};

// World zones — y-coordinates for 270px height
export const WORLD = {
  SKY_TOP: 0,
  SKY_BOTTOM: 55,
  FOREST_TOP: 35,
  FOREST_BOTTOM: 85,
  GRASS_TOP: 85,
  GRASS_BOTTOM: 145,
  SAND_TOP: 145,
  SAND_BOTTOM: 168,
  WATER_TOP: 168,
  WATER_BOTTOM: 270,
  BEACH_WIDTH: 23
};

export const PHYSICS = {
  GRAVITY: 0,
  PLAYER_SPEED: 80,
  PLAYER_SPEED_DIAGONAL: 57,
  COLLIDER_SIZE: 4
};

export const ANIMATION = {
  WALK_FPS: 8,
  IDLE_FPS: 3,
  THROW_FPS: 6,
  CATCH_FPS: 4,
  REEL_FPS: 8,
  PULL_FPS: 6
};

export const FISHING = {
  CAST_MIN_DISTANCE: 20,
  CAST_MAX_DISTANCE: 50,
  WAIT_MIN_TIME: 2000,
  WAIT_MAX_TIME: 6000,
  BITE_TIMEOUT: 6000,
  MINIGAME_DURATION: 6000,
  MINIGAME_DECAY: 0.00008,
  MINIGAME_SUCCESS_INCREMENT: 0.18,
  MINIGAME_FAIL_INCREMENT: -0.12,
  MINIGAME_SUCCESS: 0.18,
  MINIGAME_FAIL: 0.08,
  PERSONALITIES: {
    TIMID:      { biteDuration: 3500, difficultyMod: 0.8,  label: 'Timid' },
    NORMAL:     { biteDuration: 5000, difficultyMod: 1.0,  label: 'Normal' },
    AGGRESSIVE: { biteDuration: 7000, difficultyMod: 1.4,  label: 'Aggressive' },
    LEGENDARY:  { biteDuration: 8000, difficultyMod: 1.8,  label: 'Legendary' }
  }
};

export const ENERGY = {
  MAX: 100,
  COST_WALK: 0.01,
  COST_FISH: 5,
  COST_CATCH: 8,
  REGEN_RATE: 0.03
};

export const TIME = {
  PHASE_DURATION: 45000,
  PHASES: ['dawn', 'day', 'dusk', 'night'],
  FISH_ACTIVITY: {
    dawn:  { common: 1.2, uncommon: 1.1, rare: 1.0, epic: 0.9, legendary: 0.8 },
    day:   { common: 1.0, uncommon: 1.0, rare: 1.0, epic: 1.0, legendary: 1.0 },
    dusk:  { common: 1.1, uncommon: 1.1, rare: 1.1, epic: 1.0, legendary: 0.9 },
    night: { common: 0.8, uncommon: 0.9, rare: 1.2, epic: 1.3, legendary: 1.5 }
  }
};

export const RARITY = {
  common: '#aaaaaa',
  uncommon: '#44bb44',
  rare: '#4488ff',
  epic: '#aa44ff',
  legendary: '#ffaa00'
};

export const RARITY_WEIGHTS = {
  common: 50, uncommon: 28, rare: 14, epic: 5, legendary: 3
};

export const COLORS = {
  SKY_DAY:    0x87ceeb,
  SKY_DAWN:   0xffaa77,
  SKY_DUSK:   0xff6644,
  SKY_NIGHT:  0x1a1a3a,
  GRASS:      0x5a9a3c,
  GRASS_DARK: 0x3a6a20,
  SAND:       0xe0c870,
  SAND_WET:   0xc8b060,
  WATER:      0x3a86c8,
  WATER_DEEP: 0x1e5a99,
  WATER_FOAM: 0xffffff,
  UI_BG:      0x1a1a1a,
  UI_BORDER:  0x888888,
  ENERGY_HIGH: 0x44cc44,
  ENERGY_MED:  0xcccc44,
  ENERGY_LOW:  0xcc4444,
  TEXT:       '#ffffff',
  TEXT_GOLD:  '#ffdd44'
};

export const DEPTH = {
  SKY: 0,
  CLOUDS: 1,
  TREES_BACK: 2,
  GROUND: 5,
  DECORATION: 6,
  BUILDINGS: 8,
  NPC: 9,
  PLAYER: 10,
  TREES_FORE: 11,
  BOATS: 12,
  PARTICLES: 15,
  WATER_SURFACE: 20,
  WATER_EFFECTS: 22,
  UI: 90,
  UI_FOREGROUND: 95,
  UI_PANEL: 100,
  UI_OVERLAY: 110
};

// Scales tuned for 270px-tall world with 1920px width
export const SCALE = {
  PLAYER:    1.0,   // 64px character, fits 85px grass zone
  NPC:       1.0,
  BOAT:      0.65,
  TREE_PALM: 0.75,
  TREE_PINE: 0.65,
  TREE_OAK:  0.8,
  BUILDING:  0.38,  // 128px × 0.38 ≈ 49px — fits inside 60px grass zone
  ANIMAL:    0.9,
  CLOUD:     0.5,
  BIRD:      0.4,
  BOBBER:    0.6,
  FISH_SHADOW: 0.55,
  PARTICLE:  1.0
};

export const KEYS = {
  UP: ['UP','W'], DOWN: ['DOWN','S'], LEFT: ['LEFT','A'], RIGHT: ['RIGHT','D'],
  ACTION: ['SPACE'], INTERACT: ['E'], INVENTORY: ['I'],
  MAP: ['TAB'], STATS: ['C'], ACHIEVEMENTS: ['L'],
  SETTINGS: ['O'], PAUSE: ['P','ESC'], DEBUG: ['BACKTICK']
};

export const EVENTS = {
  GAME_START: 'game:start',
  GAME_PAUSE: 'game:pause',
  PLAYER_MOVE: 'player:move',
  PLAYER_STATE_CHANGE: 'player:stateChange',
  PLAYER_ENERGY_CHANGE: 'player:energyChange',
  FISHING_CAST: 'fishing:cast',
  FISHING_BITE: 'fishing:bite',
  FISHING_CATCH: 'fishing:catch',
  FISHING_ESCAPE: 'fishing:escape',
  UI_SHOW_MESSAGE: 'ui:showMessage',
  UI_GOLD_SYNC: 'ui:goldSync',
  UI_SHOW_CATCH: 'ui:showCatch',
  UI_TOGGLE_INVENTORY: 'ui:toggleInventory',
  WEATHER_CHANGE: 'world:weatherChange',
  TIME_CHANGE: 'world:timeChange',
  ACHIEVEMENT_UNLOCKED: 'achievement:unlocked',
  AUDIO_MUTE: 'audio:mute',
  AUDIO_UNMUTE: 'audio:unmute'
};

export const ASSETS = {
  SKIN_TONES:   ['light', 'brown', 'dark'],
  HAIR_COLORS:  ['black', 'blonde', 'blue', 'brown_dark', 'brown_light', 'green', 'pink', 'purple', 'red', 'white'],
  SHIRT_COLORS: ['black', 'blue_dark', 'blue_light', 'brown', 'green_dark', 'green_light', 'orange', 'pink', 'red', 'white', 'yellow'],
  PANTS_COLORS: ['black', 'blue_dark', 'blue_light', 'brown', 'green_dark', 'green_light', 'orange', 'pink', 'red', 'white', 'yellow'],
  HAIR_STYLES:  ['short_hair', 'long_hair', 'pony_tail', 'spikey', 'big_bun', 'small_hair'],
  CRITICAL_FISH: ['bass', 'herring', 'cod', 'catfish'],
  BOBBER_COLORS: ['green', 'red', 'yellow'],
  SHADOW_SIZES:  ['small', 'medium', 'big'],
  BOAT_TYPES:    ['boat_blue', 'boat_yellow', 'boat_small'],
  TREE_TYPES:    ['palm_tree', 'trees_pine_growth', 'apple_tree', 'peach_tree'],
  ANIMAL_TYPES:  ['chicken', 'cow', 'pig', 'chick', 'piglet'],
  BUILDING_TYPES: ['barn', 'greenhouse', 'fish_market', 'grain_silo', 'chicken_coop']
};

// NPCs spread across the 1920px world — authoritative source (removed from NPC.js)
export const NPCS = [
  { id: 'tom',   name: 'Farmer Tom',     x: 200,  y: 140, role: 'farmer'    },
  { id: 'joe',   name: 'Fisherman Joe',  x: 480,  y: 160, role: 'fisherman' },
  { id: 'eliza', name: 'Mayor Eliza',    x: 800,  y: 135, role: 'mayor'     },
  { id: 'bella', name: 'Merchant Bella', x: 1100, y: 135, role: 'merchant'  },
  { id: 'zara',  name: 'Angler Zara',    x: 1550, y: 160, role: 'angler'    }
];

export const CAMERA = {
  LERP: 0.08,
  DEADZONE_W: 80,
  DEADZONE_H: 30,
  SHAKE_DURATION: 100,
  SHAKE_INTENSITY: 0.005
};

export const PERF = {
  TARGET_FPS: 60, LOW_FPS: 45, CRITICAL_FPS: 30, BATCH_SIZE: 2048
};

export const BAIT = {
  WORM:   { id: 'worm',   name: 'Worm',        bonus: 0.10, cost: 5,   attract: ['common','uncommon'] },
  GRUB:   { id: 'grub',   name: 'Grub',        bonus: 0.15, cost: 10,  attract: ['common','uncommon','rare'] },
  MINNOW: { id: 'minnow', name: 'Minnow',      bonus: 0.20, cost: 25,  attract: ['uncommon','rare'] },
  SHRIMP: { id: 'shrimp', name: 'Shrimp',      bonus: 0.25, cost: 50,  attract: ['rare','epic'] },
  GOLDEN: { id: 'golden', name: 'Golden Bait', bonus: 0.35, cost: 100, attract: ['epic','legendary'] }
};

export const RODS = {
  BASIC:      { id: 'basic',      name: 'Basic Rod',   power: 1.0, accuracy: 1.0 },
  FIBERGLASS: { id: 'fiberglass', name: 'Fiberglass',  power: 1.2, accuracy: 1.1 },
  CARBON:     { id: 'carbon',     name: 'Carbon Rod',  power: 1.4, accuracy: 1.2 }
};

export const WEATHER = {
  TYPES: ['sunny', 'cloudy', 'rainy', 'stormy'],
  EFFECTS: {
    sunny:  { castDistanceMod: 1.0 },
    cloudy: { castDistanceMod: 0.9 },
    rainy:  { castDistanceMod: 0.8 },
    stormy: { castDistanceMod: 0.6 }
  },
  FISH_MODIFIER: {
    sunny:  { common: 1.0, uncommon: 0.9, rare: 0.8,  epic: 0.7, legendary: 0.4 },
    cloudy: { common: 1.0, uncommon: 1.0, rare: 1.0,  epic: 0.8, legendary: 0.6 },
    rainy:  { common: 0.9, uncommon: 1.0, rare: 1.2,  epic: 1.1, legendary: 0.8 },
    stormy: { common: 0.7, uncommon: 0.9, rare: 1.0,  epic: 1.3, legendary: 1.2 }
  },
  MODIFIERS: {
    sunny:  { common: 1.0, rare: 0.8, legendary: 0.4 },
    cloudy: { common: 1.0, rare: 1.0, legendary: 0.6 },
    rainy:  { common: 0.9, rare: 1.2, legendary: 0.8 },
    stormy: { common: 0.7, rare: 1.0, legendary: 1.2 }
  }
};

export const STORAGE = { INVENTORY: 30, BARN: 100, WAREHOUSE: 500 };
export const DEBUG   = { SHOW_FPS: true, SHOW_HITBOXES: false, INFINITE_ENERGY: false };
