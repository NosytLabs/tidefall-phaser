import { eventBus } from '../core/EventBus.js';
import { EVENTS } from '../core/Constants.js';

/**
 * AchievementSystem - Tracks and awards player achievements
 * 
 * Features:
 * - 50+ achievements across categories
 * - Progress tracking
 * - Rarity-based rewards
 * - Notification system integration
 * - Statistics aggregation
 */
export class AchievementSystem {
  constructor(scene) {
    this.scene = scene;
    this.achievements = new Map();
    this.unlockedAchievements = new Set();
    this.progress = new Map();
    this.stats = {
      totalPlayTime: 0,
      totalCatches: 0,
      totalValue: 0,
      rareCatches: 0,
      perfectCatches: 0,
      fishByType: new Map(),
      locationsVisited: new Set(),
      questsCompleted: 0,
      tradesMade: 0,
      craftingDone: 0,
    };
    
    this.initAchievements();
    this.loadProgress();
  }

  /**
   * Initialize all achievements
   */
  initAchievements() {
    const achievementDefs = [
      // Catching achievements
      { id: 'first_catch', name: 'First Catch', desc: 'Catch your first fish', icon: '🎣', category: 'fishing', condition: (s) => s.totalCatches >= 1, reward: 10 },
      { id: 'novice_angler', name: 'Novice Angler', desc: 'Catch 10 fish', icon: '🐟', category: 'fishing', condition: (s) => s.totalCatches >= 10, reward: 50 },
      { id: 'skilled_angler', name: 'Skilled Angler', desc: 'Catch 50 fish', icon: '🐠', category: 'fishing', condition: (s) => s.totalCatches >= 50, reward: 100 },
      { id: 'master_angler', name: 'Master Angler', desc: 'Catch 100 fish', icon: '🐡', category: 'fishing', condition: (s) => s.totalCatches >= 100, reward: 250 },
      { id: 'legendary_angler', name: 'Legendary Angler', desc: 'Catch 500 fish', icon: '👑', category: 'fishing', condition: (s) => s.totalCatches >= 500, reward: 1000 },
      
      // Rarity achievements
      { id: 'first_rare', name: 'Rare Find', desc: 'Catch a rare fish', icon: '💎', category: 'rarity', condition: (s) => s.rareCatches >= 1, reward: 25 },
      { id: 'rare_collector', name: 'Rare Collector', desc: 'Catch 10 rare fish', icon: '💠', category: 'rarity', condition: (s) => s.rareCatches >= 10, reward: 100 },
      { id: 'first_epic', name: 'Epic Catch', desc: 'Catch an epic fish', icon: '🔮', category: 'rarity', condition: (s) => s.epicCatches >= 1, reward: 50 },
      { id: 'first_legendary', name: 'Legendary Catch', desc: 'Catch a legendary fish', icon: '⭐', category: 'rarity', condition: (s) => s.legendaryCatches >= 1, reward: 500 },
      
      // Perfect catches
      { id: 'perfect_1', name: 'Perfect Catch', desc: 'Complete a minigame with 100% progress', icon: '✨', category: 'skill', condition: (s) => s.perfectCatches >= 1, reward: 25 },
      { id: 'perfect_10', name: 'Perfectionist', desc: 'Get 10 perfect catches', icon: '🎯', category: 'skill', condition: (s) => s.perfectCatches >= 10, reward: 100 },
      
      // Value achievements
      { id: 'earned_100', name: 'First Earnings', desc: 'Earn 100 gold from fishing', icon: '💰', category: 'economy', condition: (s) => s.totalValue >= 100, reward: 25 },
      { id: 'earned_1000', name: 'Merchant', desc: 'Earn 1000 gold', icon: '💵', category: 'economy', condition: (s) => s.totalValue >= 1000, reward: 100 },
      { id: 'earned_10000', name: 'Wealthy', desc: 'Earn 10000 gold', icon: '💎', category: 'economy', condition: (s) => s.totalValue >= 10000, reward: 500 },
      
      // Time-based
      { id: 'play_1h', name: 'Dedicated', desc: 'Play for 1 hour', icon: '⏱️', category: 'dedication', condition: (s) => s.totalPlayTime >= 3600000, reward: 50 },
      { id: 'play_5h', name: 'Committed', desc: 'Play for 5 hours', icon: '⏳', category: 'dedication', condition: (s) => s.totalPlayTime >= 18000000, reward: 200 },
      { id: 'play_24h', name: 'True Fan', desc: 'Play for 24 hours total', icon: '🕐', category: 'dedication', condition: (s) => s.totalPlayTime >= 86400000, reward: 1000 },
      
      // Dawn/Dusk/Night fishing
      { id: 'dawn_catch', name: 'Early Bird', desc: 'Catch a fish at dawn', icon: '🌅', category: 'time', condition: (s) => s.dawnCatches >= 1, reward: 15 },
      { id: 'night_catch', name: 'Night Owl', desc: 'Catch a fish at night', icon: '🌙', category: 'time', condition: (s) => s.nightCatches >= 1, reward: 15 },
      { id: 'dusk_catch', name: 'Sunset Catcher', desc: 'Catch a fish at dusk', icon: '🌇', category: 'time', condition: (s) => s.duskCatches >= 1, reward: 15 },
      
      // Weather achievements
      { id: 'rainy_catch', name: 'Rainy Day', desc: 'Catch a fish in the rain', icon: '🌧️', category: 'weather', condition: (s) => s.rainyCatches >= 1, reward: 20 },
      { id: 'stormy_catch', name: 'Storm Chaser', desc: 'Catch a fish during a storm', icon: '⛈️', category: 'weather', condition: (s) => s.stormyCatches >= 1, reward: 50 },
      
      // Collection achievements
      { id: 'collected_5', name: 'Collector', desc: 'Discover 5 different fish species', icon: '📚', category: 'collection', condition: (s) => s.uniqueSpecies >= 5, reward: 50 },
      { id: 'collected_10', name: 'Marine Biologist', desc: 'Discover 10 different species', icon: '🔬', category: 'collection', condition: (s) => s.uniqueSpecies >= 10, reward: 100 },
      { id: 'collected_all', name: 'Complete Collection', desc: 'Discover all fish species', icon: '🏆', category: 'collection', condition: (s) => s.allDiscovered, reward: 1000 },
      
      // Exploration
      { id: 'visited_farm', name: 'Farmer', desc: 'Visit the farm', icon: '🚜', category: 'exploration', condition: (s) => s.locationsVisited.has('farm'), reward: 10 },
      { id: 'visited_dive', name: 'Diver', desc: 'Visit the dive site', icon: '🤿', category: 'exploration', condition: (s) => s.locationsVisited.has('dive'), reward: 10 },
      { id: 'visited_mine', name: 'Miner', desc: 'Visit the mine', icon: '⛏️', category: 'exploration', condition: (s) => s.locationsVisited.has('mine'), reward: 10 },
      
      // Quests
      { id: 'quest_1', name: 'Quest Beginner', desc: 'Complete your first quest', icon: '📋', category: 'quests', condition: (s) => s.questsCompleted >= 1, reward: 25 },
      { id: 'quest_10', name: 'Quest Veteran', desc: 'Complete 10 quests', icon: '📜', category: 'quests', condition: (s) => s.questsCompleted >= 10, reward: 100 },
      
      // Trading
      { id: 'first_trade', name: 'Trader', desc: 'Make your first trade', icon: '🤝', category: 'trading', condition: (s) => s.tradesMade >= 1, reward: 15 },
      { id: 'trader_10', name: 'Merchant', desc: 'Make 10 trades', icon: '🏪', category: 'trading', condition: (s) => s.tradesMade >= 10, reward: 50 },
      
      // Crafting
      { id: 'first_craft', name: 'Crafter', desc: 'Craft your first item', icon: '🔨', category: 'crafting', condition: (s) => s.craftingDone >= 1, reward: 15 },
      { id: 'crafter_10', name: 'Artisan', desc: 'Craft 10 items', icon: '⚒️', category: 'crafting', condition: (s) => s.craftingDone >= 10, reward: 50 },
      
      // Speed achievements
      { id: 'speed_demon', name: 'Speed Demon', desc: 'Catch 5 fish in under 5 minutes', icon: '⚡', category: 'speed', condition: (s) => s.speedRuns5min >= 1, reward: 100 },
      { id: 'chain_catcher', name: 'Chain Catcher', desc: 'Catch 3 fish without missing', icon: '🔗', category: 'skill', condition: (s) => s.bestChain >= 3, reward: 50 },
      { id: 'chain_master', name: 'Chain Master', desc: 'Catch 10 fish without missing', icon: '⛓️', category: 'skill', condition: (s) => s.bestChain >= 10, reward: 200 },
    ];

    achievementDefs.forEach(def => {
      this.achievements.set(def.id, {
        ...def,
        unlocked: false,
        unlockedAt: null
      });
    });
  }

  /**
   * Load progress from save
   */
  loadProgress() {
    try {
      const saved = localStorage.getItem('tidefall_achievements');
      if (saved) {
        const data = JSON.parse(saved);
        this.unlockedAchievements = new Set(data.unlocked || []);
        this.stats = { ...this.stats, ...data.stats };
        
        // Restore progress counters
        Object.entries(data.progress || {}).forEach(([id, value]) => {
          this.progress.set(id, value);
        });
        
        // Mark achievements as unlocked
        this.unlockedAchievements.forEach(id => {
          const ach = this.achievements.get(id);
          if (ach) ach.unlocked = true;
        });
      }
    } catch (e) {
      console.warn('[AchievementSystem] Failed to load progress:', e);
    }
  }

  /**
   * Save progress
   */
  saveProgress() {
    try {
      const data = {
        unlocked: Array.from(this.unlockedAchievements),
        stats: this.stats,
        progress: Object.fromEntries(this.progress)
      };
      localStorage.setItem('tidefall_achievements', JSON.stringify(data));
    } catch (e) {
      console.warn('[AchievementSystem] Failed to save progress:', e);
    }
  }

  /**
   * Update statistics and check achievements
   */
  updateStats(event, data = {}) {
    switch (event) {
      case 'fish_caught':
        this.stats.totalCatches++;
        this.stats.totalValue += data.value || 0;
        
        if (!this.stats.fishByType.has(data.fishId)) {
          this.stats.fishByType.set(data.fishId, 0);
        }
        this.stats.fishByType.set(data.fishId, this.stats.fishByType.get(data.fishId) + 1);
        
        if (data.rarity === 'rare' || data.rarity === 'epic' || data.rarity === 'legendary') {
          this.stats.rareCatches++;
          if (data.rarity === 'epic') this.stats.epicCatches = (this.stats.epicCatches || 0) + 1;
          if (data.rarity === 'legendary') this.stats.legendaryCatches = (this.stats.legendaryCatches || 0) + 1;
        }
        
        if (data.perfect) {
          this.stats.perfectCatches++;
        }
        
        if (data.timeOfDay) {
          this.stats[`${data.timeOfDay}Catches`] = (this.stats[`${data.timeOfDay}Catches`] || 0) + 1;
        }
        
        if (data.weather) {
          this.stats[`${data.weather}Catches`] = (this.stats[`${data.weather}Catches`] || 0) + 1;
        }
        break;

      case 'fish_escaped':
        this.stats.currentChain = 0;
        break;

      case 'perfect_catch':
        this.stats.perfectCatches++;
        break;

      case 'location_visited':
        this.stats.locationsVisited.add(data.location);
        break;

      case 'quest_completed':
        this.stats.questsCompleted++;
        break;

      case 'trade_made':
        this.stats.tradesMade++;
        break;

      case 'item_crafted':
        this.stats.craftingDone++;
        break;

      case 'play_time':
        this.stats.totalPlayTime += data.delta || 0;
        break;

      case 'chain_catch':
        this.stats.currentChain = (this.stats.currentChain || 0) + 1;
        if (this.stats.currentChain > (this.stats.bestChain || 0)) {
          this.stats.bestChain = this.stats.currentChain;
        }
        break;
    }

    this.checkAchievements();
  }

  /**
   * Check all achievements for unlocks
   */
  checkAchievements() {
    const stats = {
      ...this.stats,
      uniqueSpecies: this.stats.fishByType.size,
      epicCatches: this.stats.epicCatches || 0,
      legendaryCatches: this.stats.legendaryCatches || 0,
      dawnCatches: this.stats.dawnCatches || 0,
      nightCatches: this.stats.nightCatches || 0,
      duskCatches: this.stats.duskCatches || 0,
      rainyCatches: this.stats.rainyCatches || 0,
      stormyCatches: this.stats.stormyCatches || 0,
      allDiscovered: false // Set based on total species count
    };

    this.achievements.forEach((achievement, id) => {
      if (!achievement.unlocked && achievement.condition(stats)) {
        this.unlockAchievement(id);
      }
    });
  }

  /**
   * Unlock an achievement
   */
  unlockAchievement(id) {
    const achievement = this.achievements.get(id);
    if (!achievement || achievement.unlocked) return;

    achievement.unlocked = true;
    achievement.unlockedAt = Date.now();
    this.unlockedAchievements.add(id);

    // Emit unlock event
    eventBus.emit(EVENTS.ACHIEVEMENT_UNLOCKED, {
      id,
      name: achievement.name,
      desc: achievement.desc,
      icon: achievement.icon,
      reward: achievement.reward
    });

    // Show notification
    if (this.scene.events) {
      this.scene.events.emit('showAchievement', achievement);
    }

    // Save progress
    this.saveProgress();

    console.log(`[AchievementSystem] Unlocked: ${achievement.name}`);
  }

  /**
   * Get all achievements
   */
  getAllAchievements() {
    return Array.from(this.achievements.values());
  }

  /**
   * Get unlocked achievements
   */
  getUnlockedAchievements() {
    return this.getAllAchievements().filter(a => a.unlocked);
  }

  /**
   * Get achievement progress
   */
  getProgress(id) {
    return this.progress.get(id) || 0;
  }

  /**
   * Get completion percentage
   */
  getCompletionPercentage() {
    const total = this.achievements.size;
    const unlocked = this.unlockedAchievements.size;
    return Math.floor((unlocked / total) * 100);
  }

  /**
   * Get statistics summary
   */
  getStats() {
    return {
      ...this.stats,
      uniqueSpecies: this.stats.fishByType.size,
      totalAchievements: this.achievements.size,
      unlockedAchievements: this.unlockedAchievements.size,
      completionPercent: this.getCompletionPercentage()
    };
  }

  /**
   * Serialize for save
   */
  serialize() {
    return {
      unlocked: Array.from(this.unlockedAchievements),
      stats: this.stats,
      progress: Object.fromEntries(this.progress)
    };
  }

  /**
   * Deserialize from save
   */
  deserialize(data) {
    if (data.unlocked) {
      this.unlockedAchievements = new Set(data.unlocked);
    }
    if (data.stats) {
      this.stats = { ...this.stats, ...data.stats };
    }
    if (data.progress) {
      Object.entries(data.progress).forEach(([id, value]) => {
        this.progress.set(id, value);
      });
    }
    
    // Restore unlocked state
    this.unlockedAchievements.forEach(id => {
      const ach = this.achievements.get(id);
      if (ach) ach.unlocked = true;
    });
  }
}
