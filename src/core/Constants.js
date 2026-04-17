/**
 * Constants - ALL game configuration values
 * NO magic numbers allowed in game logic
 */

// Display and viewport
export const GAME = {
  WIDTH: 1920,
  HEIGHT: 1080,
  ZOOM: 1,
  BACKGROUND_COLOR: '#2d5a27',
  PIXEL_ART: true,
  ROUND_PIXELS: true,
  ANTIALIAS: false
};

// Safe zone for Play.fun widget (75px at top)
export const SAFE_ZONE = {
  TOP: 75,
  BOTTOM: 0,
  LEFT: 100,
  RIGHT: 100
};

// Physics
export const PHYSICS = {
  GRAVITY: 0,
  PLAYER_SPEED: 120,
  PLAYER_SPEED_DIAGONAL: 85, // 120 * 0.707
  COLLIDER_SIZE: 5
};

// World zones (y-coordinates) - scaled for 1920x1080
export const WORLD = {
  FOREST_BOTTOM: 135,
  GRASS_TOP: 135,
  SAND_Y: 675,
  WATER_Y: 740,
  BEACH_WIDTH: 200
};

// Player animation rates
export const ANIMATION = {
  WALK_FPS: 10,
  IDLE_FPS: 3,
  THROW_FPS: 12,
  CATCH_FPS: 12,
  REEL_FPS: 8,
  PULL_FPS: 10
};

// Fishing
export const FISHING = {
  CAST_MIN_DISTANCE: 30,
  CAST_MAX_DISTANCE: 60,
  WAIT_MIN_TIME: 2000,
  WAIT_MAX_TIME: 8000,
  BITE_TIMEOUT: 8000,
  MINIGAME_DURATION: 8000,
  MINIGAME_DECAY: 0.001,
  MINIGAME_SUCCESS_INCREMENT: 0.35,
  MINIGAME_FAIL_INCREMENT: 0.05,
  
  // Fish personalities affect behavior
  PERSONALITIES: {
    TIMID: { escapeChance: 0.3, biteDuration: 5000, difficultyMod: 0.7 },
    NORMAL: { escapeChance: 0.5, biteDuration: 6000, difficultyMod: 1.0 },
    AGGRESSIVE: { escapeChance: 0.7, biteDuration: 4000, difficultyMod: 1.3 },
    LEGENDARY: { escapeChance: 0.9, biteDuration: 3000, difficultyMod: 1.5 }
  }
};

// Energy
export const ENERGY = {
  MAX: 100,
  COST_WALK: 0.01,
  COST_FISH: 5,
  COST_CATCH: 10,
  REGEN_RATE: 0.05
};

// Day/Night cycle
export const TIME = {
  DAY_LENGTH: 60000, // 60 seconds per phase
  PHASES: ['dawn', 'day', 'dusk', 'night'],
  FISH_ACTIVITY: {
    dawn: { common: 1.1, uncommon: 1.2, rare: 1.3, epic: 1.0, legendary: 0.8 },
    day: { common: 1.2, uncommon: 1.0, rare: 0.8, epic: 0.5, legendary: 0.3 },
    dusk: { common: 1.0, uncommon: 1.1, rare: 1.2, epic: 1.0, legendary: 0.7 },
    night: { common: 0.6, uncommon: 0.8, rare: 1.0, epic: 1.3, legendary: 1.5 }
  }
};

// Colors
export const COLORS = {
  // World
  SKY: 0x1a3d12,
  SKY_DAWN: 0xffaa77,
  SKY_DAY: 0x87ceeb,
  SKY_DUSK: 0xff6644,
  SKY_NIGHT: 0x1a1a3a,
  GRASS: 0x5a9a3c,
  GRASS_DARK: 0x3a6a20,
  SAND: 0xe0b868,
  SAND_WET: 0xc0a060,
  WATER: 0x55a4f7,
  WATER_DEEP: 0x4898e0,
  WATER_FOAM: 0xffffff,
  
  // UI
  UI_BG: 0x000000,
  UI_TEXT: '#ffffff',
  UI_HIGHLIGHT: '#ffff44',
  ENERGY_HIGH: 0x44cc44,
  ENERGY_MEDIUM: 0xcccc44,
  ENERGY_LOW: 0xcc4444,
  
  // Rarity
  RARITY_COMMON: '#aaaaaa',
  RARITY_UNCOMMON: '#44bb44',
  RARITY_RARE: '#4488ff',
  RARITY_EPIC: '#aa44ff',
  RARITY_LEGENDARY: '#ffaa00',
  
  // Effects
  PARTICLE_WATER: 0xffffff,
  PARTICLE_SPARKLE: 0xffffaa,
  RIPPLE: 0xffffff
};

// Rarity weights for spawning
export const RARITY_WEIGHTS = {
  common: 50,
  uncommon: 30,
  rare: 15,
  epic: 4,
  legendary: 1
};

// Depth layers
export const DEPTH = {
  BACKGROUND: 0,
  SKY: 0,
  CLOUDS: 1,
  TREES_BACKGROUND: -1,
  GROUND: 0,
  DECORATION: 1,
  WATER_EFFECTS: 2,
  WATER_SURFACE: 3,
  SHADOWS: 4,
  BUILDINGS: 5,
  TREES_FOREGROUND: 6,
  BOATS: 8,
  NPC: 9,
  PLAYER: 10,
  NPC_LABEL: 11,
  PARTICLES: 15,
  UI: 90,
  UI_FOREGROUND: 100,
  DIALOG: 200,
  INVENTORY: 300,
  NOTIFICATION: 500
};

// Scales - MASSIVE upscaling for expansive world
export const SCALE = {
  PLAYER: 2.5,
  BOAT: 2.0,
  TREE_PALM: 1.5,
  TREE_PINE: 1.2,
  TREE_OAK: 1.8,
  BUILDING_MARKET: 1.5,
  BUILDING_BARN: 1.4,
  BUILDING_GREENHOUSE: 1.2,
  BUILDING_WATCHTOWER: 1.6,
  BUILDING_PIER: 1.3,
  BUILDING_LIGHTHOUSE: 2.0,
  ANIMAL_CHICKEN: 2.0,
  ANIMAL_COW: 1.5,
  ANIMAL_PIG: 2.0,
  ANIMAL_SHEEP: 1.8,
  ANIMAL_HORSE: 2.2,
  CLOUD: 1.2,
  BIRD: 1.5,
  ROCK: 1.5,
  FLOWER: 2.0,
  GRASS_TUFT: 1.5
};

// NPC positions - spread across massive 1920 width
export const NPC_POSITIONS = [
  { x: 200, y: 280 },   // Fisherman Joe - left beach
  { x: 600, y: 240 },   // Mayor Eliza - town center
  { x: 960, y: 300 },   // Chef Gordon - town square (center)
  { x: 1300, y: 260 },  // Merchant Bella - right side
  { x: 1700, y: 320 },  // Captain Redbeard - pier area
  { x: 450, y: 220 },   // Farmer Tom - near barn
  { x: 1100, y: 250 },  // Alchemist Zara - greenhouse area
  { x: 1550, y: 290 }   // Dock Worker Sal - lighthouse area
];

// Input keys
export const KEYS = {
  UP: ['UP', 'W'],
  DOWN: ['DOWN', 'S'],
  LEFT: ['LEFT', 'A'],
  RIGHT: ['RIGHT', 'D'],
  ACTION: ['SPACE'],
  INTERACT: ['E'],
  INVENTORY: ['I'],
  FARM: ['F'],
  DIVE: ['Q'],
  MINE: ['M'],
  MUTE: ['N'],
  PAUSE: ['P', 'ESC'],
  QUICK_SAVE: ['F5'],
  QUICK_LOAD: ['F9'],
  DEBUG: ['BACKTICK'],
  SCREENSHOT: ['F12'],
  MAP: ['TAB'],
  STATS: ['C'],
  ACHIEVEMENTS: ['L'],
  SETTINGS: ['O']
};

// Keyboard shortcuts
export const SHORTCUTS = {
  MOVE_UP: { keys: ['UP', 'W'], desc: 'Move Up' },
  MOVE_DOWN: { keys: ['DOWN', 'S'], desc: 'Move Down' },
  MOVE_LEFT: { keys: ['LEFT', 'A'], desc: 'Move Left' },
  MOVE_RIGHT: { keys: ['RIGHT', 'D'], desc: 'Move Right' },
  FISH: { keys: ['SPACE'], desc: 'Cast/Hook Fish' },
  INTERACT: { keys: ['E'], desc: 'Talk to NPCs' },
  INVENTORY: { keys: ['I'], desc: 'Open Inventory' },
  MAP: { keys: ['TAB', 'M'], desc: 'Open Map' },
  STATS: { keys: ['C'], desc: 'Character Stats' },
  ACHIEVEMENTS: { keys: ['L'], desc: 'Achievements' },
  SETTINGS: { keys: ['O', 'ESC'], desc: 'Settings Menu' },
  QUICK_SAVE: { keys: ['F5'], desc: 'Quick Save' },
  QUICK_LOAD: { keys: ['F9'], desc: 'Quick Load' },
  PAUSE: { keys: ['P', 'ESC'], desc: 'Pause Game' },
  SCREENSHOT: { keys: ['F12'], desc: 'Screenshot' },
  DEBUG: { keys: ['BACKTICK'], desc: 'Toggle Debug' },
  MUTE: { keys: ['N'], desc: 'Mute Audio' },
  
  // Scene switching
  GOTO_FARM: { keys: ['F'], desc: 'Go to Farm' },
  GOTO_DIVE: { keys: ['Q'], desc: 'Go to Dive Site' },
  GOTO_MINE: { keys: ['SHIFT+M'], desc: 'Go to Mine' }
};

// Fish shadow pool size
export const POOL = {
  FISH_SHADOWS: 8,
  SPLASH_PARTICLES: 10,
  RIPPLES: 6
};

// Asset paths
export const ASSETS = {
  CHARACTER_SKIN_TONES: ['brown', 'dark', 'light'],
  CHARACTER_HAIR_COLORS: ['black', 'blonde', 'blue', 'brown_dark', 'brown_light', 'green', 'pink', 'purple', 'red', 'white'],
  CHARACTER_SHIRT_COLORS: ['black', 'blue_dark', 'blue_light', 'brown', 'green_dark', 'green_light', 'orange', 'pink', 'red', 'white', 'yellow'],
  CHARACTER_PANTS_COLORS: ['black', 'blue_dark', 'blue_light', 'brown', 'green_light', 'orange', 'pink', 'red', 'white', 'yellow'],
  CHARACTER_HAIR_STYLES: ['short_hair', 'long_hair', 'pony_tail', 'spikey', 'big_bun', 'small_hair', 'bald', 'radical_curve']
};

// Event names (domain:action)
export const EVENTS = {
  // Game
  GAME_START: 'game:start',
  GAME_PAUSE: 'game:pause',
  GAME_RESUME: 'game:resume',
  GAME_SAVE: 'game:save',
  GAME_LOAD: 'game:load',
  GAME_QUIT: 'game:quit',
  ASSETS_LOADED: 'game:assetsLoaded',
  DEBUG_TOGGLE: 'game:debugToggle',
  TIME_OF_DAY_CHANGE: 'game:timeOfDayChange',
  SETTING_CHANGED: 'game:settingChanged',
  
  // Player
  PLAYER_MOVE: 'player:move',
  PLAYER_STATE_CHANGE: 'player:stateChange',
  PLAYER_ENERGY_CHANGE: 'player:energyChange',
  PLAYER_LEVEL_UP: 'player:levelUp',
  
  // Fishing
  FISHING_CAST: 'fishing:cast',
  FISHING_BITE: 'fishing:bite',
  FISHING_CATCH: 'fishing:catch',
  FISHING_ESCAPE: 'fishing:escape',
  FISHING_STATE_CHANGE: 'fishing:stateChange',
  
  // World
  WEATHER_CHANGE: 'world:weatherChange',
  TIME_CHANGE: 'world:timeChange',
  
  // UI
  UI_SHOW_MESSAGE: 'ui:showMessage',
  UI_SHOW_CATCH: 'ui:showCatch',
  UI_TOGGLE_INVENTORY: 'ui:toggleInventory',
  UI_UPDATE_STATS: 'ui:updateStats',
  UI_BITE_INDICATOR: 'ui:biteIndicator',
  UI_OPEN_SHOP: 'ui:openShop',
  UI_TOGGLE_MAP: 'ui:toggleMap',
  UI_SHOW_ACHIEVEMENT: 'ui:showAchievement',
  
  // Audio
  AUDIO_MUTE: 'audio:mute',
  AUDIO_UNMUTE: 'audio:unmute',
  AUDIO_PLAY_SFX: 'audio:playSfx',
  AUDIO_PLAY_BGM: 'audio:playBgm',
  AUDIO_VOLUME_CHANGE: 'audio:volumeChange',
  
  // Particles
  PARTICLE_SPLASH: 'particle:splash',
  PARTICLE_SPARKLE: 'particle:sparkle',
  SCREEN_SHAKE: 'effect:screenShake',
  
  // Achievements
  ACHIEVEMENT_UNLOCKED: 'achievement:unlocked',
  ACHIEVEMENT_PROGRESS: 'achievement:progress',
  
  // Notifications
  NOTIFICATION_SHOW: 'notification:show',
  NOTIFICATION_DISMISS: 'notification:dismiss',
  
  // Save/Load
  SAVE_CREATED: 'save:created',
  SAVE_LOADED: 'save:loaded',
  SAVE_DELETED: 'save:deleted'
};

// Camera settings - optimized for massive world
export const CAMERA = {
  FOLLOW_LERP: 0.08,
  FOLLOW_LERP_FAST: 0.15,
  DEADZONE_WIDTH: 200,
  DEADZONE_HEIGHT: 150,
  DEADZONE_X: 100,
  DEADZONE_Y: 75,
  SHAKE_DURATION_CATCH: 120,
  SHAKE_INTENSITY_COMMON: 0.003,
  SHAKE_INTENSITY_UNCOMMON: 0.005,
  SHAKE_INTENSITY_RARE: 0.008,
  SHAKE_INTENSITY_EPIC: 0.012,
  SHAKE_INTENSITY_LEGENDARY: 0.018,
  SMOOTH_ZOOM: true,
  MIN_ZOOM: 0.5,
  MAX_ZOOM: 2.0
};

// Boat settings - bigger boats, bigger world
export const BOAT = {
  SWAY_DURATION_MIN: 2000,
  SWAY_DURATION_MAX: 3500,
  SWAY_AMOUNT_MIN: 2,
  SWAY_AMOUNT_MAX: 6,
  ROTATION_AMOUNT: 0.03,
  BOARD_DISTANCE: 150,
  BOAT_COUNT_MIN: 5,
  BOAT_COUNT_MAX: 12
};

// Particle settings
export const PARTICLES = {
  SPLASH_COUNT: 6,
  SPARKLE_COUNT: 4,
  LIFETIME_SPLASH: 400,
  LIFETIME_SPARKLE: 600,
  GRAVITY: 100
};

// Weather
export const WEATHER = {
  TYPES: ['sunny', 'cloudy', 'rainy', 'stormy'],
  CHANGE_INTERVAL: 300000, // 5 minutes
  FISH_MODIFIER: {
    sunny: { common: 1.0, uncommon: 1.0, rare: 0.8, epic: 0.6, legendary: 0.4 },
    cloudy: { common: 1.0, uncommon: 1.1, rare: 1.0, epic: 0.8, legendary: 0.6 },
    rainy: { common: 0.9, uncommon: 1.0, rare: 1.2, epic: 1.0, legendary: 0.8 },
    stormy: { common: 0.7, uncommon: 0.9, rare: 1.0, epic: 1.3, legendary: 1.2 }
  },
  // Effects on fishing mechanics
  EFFECTS: {
    sunny: { castDistanceMod: 1.0, visibility: 1.0 },
    cloudy: { castDistanceMod: 0.95, visibility: 0.9 },
    rainy: { castDistanceMod: 0.85, visibility: 0.7, slipChance: 0.1 },
    stormy: { castDistanceMod: 0.7, visibility: 0.5, slipChance: 0.25, danger: true }
  }
};

// Bait types
export const BAIT = {
  WORM: { id: 'worm', name: 'Worm', attract: ['common', 'uncommon'], bonus: 0.1, cost: 5 },
  GRUB: { id: 'grub', name: 'Grub', attract: ['common', 'uncommon', 'rare'], bonus: 0.15, cost: 10 },
  MINNOW: { id: 'minnow', name: 'Minnow', attract: ['uncommon', 'rare', 'epic'], bonus: 0.2, cost: 25 },
  SHRIMP: { id: 'shrimp', name: 'Shrimp', attract: ['rare', 'epic'], bonus: 0.25, cost: 50 },
  GOLDEN_BAIT: { id: 'golden_bait', name: 'Golden Bait', attract: ['epic', 'legendary'], bonus: 0.35, cost: 100 }
};

// Fishing rod stats
export const RODS = {
  BASIC: { id: 'basic', name: 'Basic Rod', power: 1.0, accuracy: 1.0, durability: 100, cost: 0 },
  FIBERGLASS: { id: 'fiberglass', name: 'Fiberglass Rod', power: 1.2, accuracy: 1.1, durability: 150, cost: 500 },
  CARBON: { id: 'carbon', name: 'Carbon Fiber Rod', power: 1.4, accuracy: 1.2, durability: 200, cost: 1500 },
  TITANIUM: { id: 'titanium', name: 'Titanium Rod', power: 1.6, accuracy: 1.3, durability: 300, cost: 5000 },
  LEGENDARY: { id: 'legendary', name: 'Rod of Legends', power: 2.0, accuracy: 1.5, durability: 500, cost: 25000 }
};

// Crafting recipes
export const RECIPES = {
  WORM_BAIT: { ingredients: { common: 3 }, result: 'worm', count: 1 },
  GRUB_BAIT: { ingredients: { uncommon: 2 }, result: 'grub', count: 1 },
  MINNOW_BAIT: { ingredients: { rare: 1 }, result: 'minnow', count: 1 },
  LURE_BASIC: { ingredients: { common: 5, uncommon: 2 }, result: 'lure_basic', count: 1 },
  LURE_SILVER: { ingredients: { uncommon: 5, rare: 2 }, result: 'lure_silver', count: 1 },
  LURE_GOLD: { ingredients: { rare: 5, epic: 1 }, result: 'lure_gold', count: 1 }
};

// Storage capacity
export const STORAGE = {
  INVENTORY: 30,
  BARN: 100,
  WAREHOUSE: 500
};

// Performance thresholds
export const PERFORMANCE = {
  TARGET_FPS: 60,
  LOW_FPS_THRESHOLD: 45,
  CRITICAL_FPS_THRESHOLD: 30,
  MEMORY_THRESHOLD_MB: 128,
  OBJECT_COUNT_WARNING: 500
};

// Debug options
export const DEBUG = {
  SHOW_FPS: true,
  SHOW_MEMORY: true,
  SHOW_OBJECT_COUNT: true,
  SHOW_FISH_SPAWN_INFO: false,
  SHOW_COLLISION_BOUNDS: false,
  INFINITE_ENERGY: false,
  INSTANT_CATCH: false,
  SHOW_PATHFINDING: false
};
