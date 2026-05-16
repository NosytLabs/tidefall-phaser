/**
 * Constants — Tidefall v2
 * Internal resolution: 480 x 270 (16:9 pixel art)
 * NO magic numbers allowed
 */

// Display
export const GAME = {
  WIDTH: 480,
  HEIGHT: 270,
  BACKGROUND_COLOR: '#1a1a2e',
  PIXEL_ART: true,
  ROUND_PIXELS: true,
  ANTIALIAS: false
};

// World zones (y-coordinates for 270px height)
export const WORLD = {
  SKY_TOP: 0,
  SKY_BOTTOM: 50,
  FOREST_TOP: 30,
  FOREST_BOTTOM: 80,
  GRASS_TOP: 80,
  GRASS_BOTTOM: 130,
  SAND_TOP: 130,
  SAND_BOTTOM: 150,
  WATER_TOP: 150,
  WATER_BOTTOM: 270,
  BEACH_WIDTH: 20
};

// Physics
export const PHYSICS = {
  GRAVITY: 0,
  PLAYER_SPEED: 60,
  PLAYER_SPEED_DIAGONAL: 42,
  COLLIDER_SIZE: 4
};

// Animation
export const ANIMATION = {
  WALK_FPS: 8,
  IDLE_FPS: 3,
  THROW_FPS: 10,
  CATCH_FPS: 10,
  REEL_FPS: 6,
  PULL_FPS: 8
};

// Fishing
export const FISHING = {
  CAST_MIN_DISTANCE: 20,
  CAST_MAX_DISTANCE: 45,
  WAIT_MIN_TIME: 2000,
  WAIT_MAX_TIME: 6000,
  BITE_TIMEOUT: 6000,
  MINIGAME_DURATION: 6000,
  MINIGAME_DECAY: 0.00008, // per-ms decay: bar empties in ~5s at 60fps without any input
  // How much progress bar fills on a successful press
  MINIGAME_SUCCESS_INCREMENT: 0.18,
  // How much progress bar drops on a miss press
  MINIGAME_FAIL_INCREMENT: -0.12,
  // Legacy aliases kept for any old references
  MINIGAME_SUCCESS: 0.18,
  MINIGAME_FAIL: 0.08,

  // Fish personality configs
  PERSONALITIES: {
    TIMID: {
      biteDuration: 3500,   // Escapes fast
      difficultyMod: 0.8,   // Easier minigame
      label: 'Timid'
    },
    NORMAL: {
      biteDuration: 5000,
      difficultyMod: 1.0,
      label: 'Normal'
    },
    AGGRESSIVE: {
      biteDuration: 7000,   // Stays hooked longer but harder minigame
      difficultyMod: 1.4,
      label: 'Aggressive'
    },
    LEGENDARY: {
      biteDuration: 8000,
      difficultyMod: 1.8,
      label: 'Legendary'
    }
  }
};

// Energy
export const ENERGY = {
  MAX: 100,
  COST_WALK: 0.02,
  COST_FISH: 5,
  COST_CATCH: 8,
  REGEN_RATE: 0.03
};

// Day / Night
export const TIME = {
  PHASE_DURATION: 45000,
  PHASES: ['dawn', 'day', 'dusk', 'night'],
  // Per-rarity activity multipliers by time of day (lower = rarer fish more active)
  FISH_ACTIVITY: {
    dawn:  { common: 1.2, uncommon: 1.1, rare: 1.0, epic: 0.9, legendary: 0.8 },
    day:   { common: 1.0, uncommon: 1.0, rare: 1.0, epic: 1.0, legendary: 1.0 },
    dusk:  { common: 1.1, uncommon: 1.1, rare: 1.1, epic: 1.0, legendary: 0.9 },
    night: { common: 0.8, uncommon: 0.9, rare: 1.2, epic: 1.3, legendary: 1.5 }
  }
};

// Rarity
export const RARITY = {
  common: '#aaaaaa',
  uncommon: '#44bb44',
  rare: '#4488ff',
  epic: '#aa44ff',
  legendary: '#ffaa00'
};

// Rarity weights
export const RARITY_WEIGHTS = {
  common: 50,
  uncommon: 30,
  rare: 15,
  epic: 4,
  legendary: 1
};

// Colors (hex numbers for graphics, strings for text)
export const COLORS = {
  SKY_DAY: 0x87ceeb,
  SKY_DAWN: 0xffaa77,
  SKY_DUSK: 0xff6644,
  SKY_NIGHT: 0x1a1a3a,
  GRASS: 0x5a9a3c,
  GRASS_DARK: 0x3a6a20,
  SAND: 0xe0c870,
  SAND_WET: 0xc8b060,
  WATER: 0x4488cc,
  WATER_DEEP: 0x3366aa,
  WATER_FOAM: 0xffffff,
  UI_BG: 0x1a1a1a,
  UI_BORDER: 0x888888,
  ENERGY_HIGH: 0x44cc44,
  ENERGY_MED: 0xcccc44,
  ENERGY_LOW: 0xcc4444,
  TEXT: '#ffffff',
  TEXT_GOLD: '#ffdd44'
};

// Depth layers
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
  WATER_EFFECTS: 22,      // Fish jumps, splashes, bobber
  UI: 90,
  UI_FOREGROUND: 95,      // Minigame bar, catch panel
  UI_PANEL: 100,
  UI_OVERLAY: 110
};

// Scales (for 480x270 game size)
export const SCALE = {
  PLAYER: 1.0,
  NPC: 1.0,
  BOAT: 0.6,
  TREE_PALM: 0.8,
  TREE_PINE: 0.7,
  TREE_OAK: 0.9,
  BUILDING: 0.8,
  ANIMAL: 0.6,
  CLOUD: 0.5,
  BIRD: 0.4,
  BOBBER: 0.5,
  FISH_SHADOW: 0.5,
  PARTICLE: 1.0
};

// Input
export const KEYS = {
  UP: ['UP', 'W'],
  DOWN: ['DOWN', 'S'],
  LEFT: ['LEFT', 'A'],
  RIGHT: ['RIGHT', 'D'],
  ACTION: ['SPACE'],
  INTERACT: ['E'],
  INVENTORY: ['I'],
  MAP: ['TAB'],
  STATS: ['C'],
  ACHIEVEMENTS: ['L'],
  SETTINGS: ['O'],
  PAUSE: ['P', 'ESC'],
  DEBUG: ['BACKTICK']
};

// Event names
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
  UI_SHOW_CATCH: 'ui:showCatch',
  UI_TOGGLE_INVENTORY: 'ui:toggleInventory',
  WEATHER_CHANGE: 'world:weatherChange',
  TIME_CHANGE: 'world:timeChange',
  ACHIEVEMENT_UNLOCKED: 'achievement:unlocked',
  AUDIO_MUTE: 'audio:mute',
  AUDIO_UNMUTE: 'audio:unmute'
};

// Asset collections
export const ASSETS = {
  SKIN_TONES: ['light', 'brown', 'dark'],
  HAIR_COLORS: ['black', 'blonde', 'blue', 'brown_dark', 'brown_light', 'green', 'pink', 'purple', 'red', 'white'],
  SHIRT_COLORS: ['black', 'blue_dark', 'blue_light', 'brown', 'green_dark', 'green_light', 'orange', 'pink', 'red', 'white', 'yellow'],
  PANTS_COLORS: ['black', 'blue_dark', 'blue_light', 'brown', 'green_light', 'orange', 'pink', 'red', 'white', 'yellow'],
  HAIR_STYLES: ['short_hair', 'long_hair', 'pony_tail', 'spikey', 'big_bun', 'small_hair'],
  CRITICAL_FISH: ['bass', 'herring', 'cod', 'catfish'],
  BOBBER_COLORS: ['green', 'red', 'yellow'],
  SHADOW_SIZES: ['small', 'medium', 'big'],
  BOAT_TYPES: ['boat_blue', 'boat_yellow', 'boat_small'],
  TREE_TYPES: ['palm_tree', 'trees_pine_growth', 'apple_tree', 'peach_tree'],
  ANIMAL_TYPES: ['chicken', 'cow', 'pig', 'chick', 'piglet'],
  BUILDING_TYPES: ['barn', 'greenhouse', 'fish_market', 'grain_silo', 'chicken_coop']
};

// NPC config
export const NPCS = [
  { id: 'joe',   name: 'Fisherman Joe',  x: 60,  y: 140, role: 'fisherman' },
  { id: 'eliza', name: 'Mayor Eliza',    x: 200, y: 120, role: 'mayor' },
  { id: 'bella', name: 'Merchant Bella', x: 340, y: 120, role: 'merchant' },
  { id: 'tom',   name: 'Farmer Tom',     x: 130, y: 110, role: 'farmer' },
  { id: 'zara',  name: 'Angler Zara',    x: 280, y: 140, role: 'angler' }
];

// Camera
export const CAMERA = {
  LERP: 0.1,
  DEADZONE_W: 60,
  DEADZONE_H: 40,
  SHAKE_DURATION: 100,
  SHAKE_INTENSITY: 0.005
};

// Performance
export const PERF = {
  TARGET_FPS: 60,
  LOW_FPS: 45,
  CRITICAL_FPS: 30,
  BATCH_SIZE: 2048
};

// Bait types — each has a cost, rarity bonus multiplier, and list of rarities it attracts
export const BAIT = {
  WORM:   { id: 'worm',   name: 'Worm',        bonus: 0.10, cost: 5,   attract: ['common', 'uncommon'] },
  GRUB:   { id: 'grub',   name: 'Grub',        bonus: 0.15, cost: 10,  attract: ['common', 'uncommon', 'rare'] },
  MINNOW: { id: 'minnow', name: 'Minnow',      bonus: 0.20, cost: 25,  attract: ['uncommon', 'rare'] },
  SHRIMP: { id: 'shrimp', name: 'Shrimp',      bonus: 0.25, cost: 50,  attract: ['rare', 'epic'] },
  GOLDEN: { id: 'golden', name: 'Golden Bait', bonus: 0.35, cost: 100, attract: ['epic', 'legendary'] }
};

// Fishing rods
export const RODS = {
  BASIC:      { id: 'basic',      name: 'Basic Rod',   power: 1.0, accuracy: 1.0 },
  FIBERGLASS: { id: 'fiberglass', name: 'Fiberglass',  power: 1.2, accuracy: 1.1 },
  CARBON:     { id: 'carbon',     name: 'Carbon Rod',  power: 1.4, accuracy: 1.2 }
};

// Weather — EFFECTS used for cast distance, FISH_MODIFIER for rarity weights
export const WEATHER = {
  TYPES: ['sunny', 'cloudy', 'rainy', 'stormy'],
  // Cast distance modifiers per weather type
  EFFECTS: {
    sunny:  { castDistanceMod: 1.0 },
    cloudy: { castDistanceMod: 0.9 },
    rainy:  { castDistanceMod: 0.8 },
    stormy: { castDistanceMod: 0.6 }
  },
  // Per-rarity catch rate multipliers per weather
  FISH_MODIFIER: {
    sunny:  { common: 1.0, uncommon: 0.9, rare: 0.8, epic: 0.7, legendary: 0.4 },
    cloudy: { common: 1.0, uncommon: 1.0, rare: 1.0, epic: 0.8, legendary: 0.6 },
    rainy:  { common: 0.9, uncommon: 1.0, rare: 1.2, epic: 1.1, legendary: 0.8 },
    stormy: { common: 0.7, uncommon: 0.9, rare: 1.0, epic: 1.3, legendary: 1.2 }
  },
  // Legacy alias
  MODIFIERS: {
    sunny:  { common: 1.0, rare: 0.8, legendary: 0.4 },
    cloudy: { common: 1.0, rare: 1.0, legendary: 0.6 },
    rainy:  { common: 0.9, rare: 1.2, legendary: 0.8 },
    stormy: { common: 0.7, rare: 1.0, legendary: 1.2 }
  }
};

// Storage
export const STORAGE = {
  INVENTORY: 30,
  BARN: 100,
  WAREHOUSE: 500
};

// Debug
export const DEBUG = {
  SHOW_FPS: true,
  SHOW_HITBOXES: false,
  INFINITE_ENERGY: false
};
