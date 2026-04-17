/**
 * PlayerAnalytics - Tracks player behavior for difficulty adaptation and tips
 * 
 * Features:
 * - Behavior tracking (locally stored)
 * - Skill analysis
 * - Difficulty adaptation
 * - Personalized tips
 * - Progress analytics
 */
export class PlayerAnalytics {
  constructor(scene) {
    this.scene = scene;
    this.analyticsKey = 'tidefall_analytics_v1';
    
    // Session data
    this.sessionStart = Date.now();
    this.sessionData = {
      catches: [],
      attempts: [],
      movements: [],
      interactions: [],
      menuOpens: [],
      settings: []
    };
    
    // Historical data
    this.historicalData = {
      totalSessions: 0,
      totalPlayTime: 0,
      totalCatches: 0,
      totalAttempts: 0,
      averageSuccessRate: 0,
      bestStreak: 0,
      favoriteLocation: null,
      peakActivityHour: null,
      skillLevel: 'beginner', // beginner, intermediate, advanced, expert
      playStyle: 'casual', // casual, focused, completionist, speedrunner
      strengths: [],
      weaknesses: []
    };
    
    // Real-time metrics
    this.currentStreak = 0;
    this.consecutiveMisses = 0;
    this.successRateWindow = []; // Last 10 attempts
    this.reactionTimes = [];
    
    // Tips system
    this.tipsGiven = new Set();
    this.tipCooldown = 0;
    
    this.load();
  }

  /**
   * Load historical data
   */
  load() {
    try {
      const saved = localStorage.getItem(this.analyticsKey);
      if (saved) {
        const data = JSON.parse(saved);
        this.historicalData = { ...this.historicalData, ...data };
      }
    } catch (e) {
      console.warn('[PlayerAnalytics] Failed to load:', e);
    }
  }

  /**
   * Save historical data
   */
  save() {
    try {
      localStorage.setItem(this.analyticsKey, JSON.stringify(this.historicalData));
    } catch (e) {
      console.warn('[PlayerAnalytics] Failed to save:', e);
    }
  }

  /**
   * Record a fish catch
   */
  recordCatch(fish, weight, value, perfect, timeOfDay, weather) {
    const catchData = {
      timestamp: Date.now(),
      fishId: fish.id,
      rarity: fish.rarity,
      weight,
      value,
      perfect,
      timeOfDay,
      weather,
      sessionTime: Date.now() - this.sessionStart
    };
    
    this.sessionData.catches.push(catchData);
    this.currentStreak++;
    this.consecutiveMisses = 0;
    
    this.successRateWindow.push(true);
    if (this.successRateWindow.length > 10) {
      this.successRateWindow.shift();
    }
    
    this.updateSkillLevel();
    this.analyzeStrengths();
  }

  /**
   * Record a failed catch
   */
  recordMiss(reason) {
    this.sessionData.attempts.push({
      timestamp: Date.now(),
      success: false,
      reason,
      sessionTime: Date.now() - this.sessionStart
    });
    
    this.currentStreak = 0;
    this.consecutiveMisses++;
    
    this.successRateWindow.push(false);
    if (this.successRateWindow.length > 10) {
      this.successRateWindow.shift();
    }
    
    this.analyzeWeaknesses();
  }

  /**
   * Record player movement patterns
   */
  recordMovement(x, y, duration) {
    // Only record every 5 seconds to avoid spam
    if (this.sessionData.movements.length > 0) {
      const last = this.sessionData.movements[this.sessionData.movements.length - 1];
      if (Date.now() - last.timestamp < 5000) return;
    }
    
    this.sessionData.movements.push({
      timestamp: Date.now(),
      x,
      y,
      duration
    });
  }

  /**
   * Record interaction
   */
  recordInteraction(type, target) {
    this.sessionData.interactions.push({
      timestamp: Date.now(),
      type,
      target,
      sessionTime: Date.now() - this.sessionStart
    });
  }

  /**
   * Record menu open
   */
  recordMenuOpen(menuType) {
    this.sessionData.menuOpens.push({
      timestamp: Date.now(),
      menu: menuType,
      sessionTime: Date.now() - this.sessionStart
    });
  }

  /**
   * Record reaction time (for minigame)
   */
  recordReactionTime(time) {
    this.reactionTimes.push(time);
    if (this.reactionTimes.length > 20) {
      this.reactionTimes.shift();
    }
  }

  /**
   * Update skill level based on performance
   */
  updateSkillLevel() {
    const successRate = this.getCurrentSuccessRate();
    const totalCatches = this.sessionData.catches.length + this.historicalData.totalCatches;
    const perfectRate = this.getPerfectCatchRate();
    
    if (successRate >= 0.9 && totalCatches >= 100 && perfectRate >= 0.5) {
      this.historicalData.skillLevel = 'expert';
    } else if (successRate >= 0.8 && totalCatches >= 50 && perfectRate >= 0.3) {
      this.historicalData.skillLevel = 'advanced';
    } else if (successRate >= 0.6 && totalCatches >= 20) {
      this.historicalData.skillLevel = 'intermediate';
    } else {
      this.historicalData.skillLevel = 'beginner';
    }
  }

  /**
   * Analyze player strengths
   */
  analyzeStrengths() {
    const strengths = [];
    
    // Check for reaction speed
    if (this.reactionTimes.length >= 5) {
      const avgReaction = this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length;
      if (avgReaction < 200) {
        strengths.push('quick_reactions');
      }
    }
    
    // Check for high success rate
    if (this.getCurrentSuccessRate() > 0.8) {
      strengths.push('consistent_catcher');
    }
    
    // Check for perfect catches
    const perfectRate = this.getPerfectCatchRate();
    if (perfectRate > 0.4) {
      strengths.push('precision');
    }
    
    // Check for rare fish catching
    const rareCatches = this.sessionData.catches.filter(c => 
      c.rarity === 'rare' || c.rarity === 'epic' || c.rarity === 'legendary'
    ).length;
    if (rareCatches > 5) {
      strengths.push('rare_fish_hunter');
    }
    
    this.historicalData.strengths = [...new Set([...this.historicalData.strengths, ...strengths])];
  }

  /**
   * Analyze player weaknesses
   */
  analyzeWeaknesses() {
    const weaknesses = [];
    
    // Check for slow reactions
    if (this.reactionTimes.length >= 5) {
      const avgReaction = this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length;
      if (avgReaction > 500) {
        weaknesses.push('slow_reactions');
      }
    }
    
    // Check for low success rate
    if (this.getCurrentSuccessRate() < 0.4 && this.sessionData.attempts.length > 10) {
      weaknesses.push('inconsistent');
    }
    
    // Check for many consecutive misses
    if (this.consecutiveMisses > 3) {
      weaknesses.push('frustration_prone');
    }
    
    this.historicalData.weaknesses = [...new Set([...this.historicalData.weaknesses, ...weaknesses])];
  }

  /**
   * Detect play style
   */
  detectPlayStyle() {
    const sessionDuration = Date.now() - this.sessionStart;
    const catchCount = this.sessionData.catches.length;
    const interactionCount = this.sessionData.interactions.length;
    
    if (sessionDuration > 60000 && catchCount / (sessionDuration / 60000) > 5) {
      return 'speedrunner';
    }
    
    if (interactionCount > catchCount * 2) {
      return 'completionist';
    }
    
    if (sessionDuration > 300000 && catchCount > 20) {
      return 'focused';
    }
    
    return 'casual';
  }

  /**
   * Get current success rate
   */
  getCurrentSuccessRate() {
    if (this.successRateWindow.length === 0) return 1;
    const successes = this.successRateWindow.filter(s => s).length;
    return successes / this.successRateWindow.length;
  }

  /**
   * Get perfect catch rate
   */
  getPerfectCatchRate() {
    const perfectCatches = this.sessionData.catches.filter(c => c.perfect).length;
    const totalCatches = this.sessionData.catches.length;
    if (totalCatches === 0) return 0;
    return perfectCatches / totalCatches;
  }

  /**
   * Get personalized tip
   */
  getTip() {
    if (this.tipCooldown > 0) return null;
    
    const tips = [];
    
    // Reaction-based tips
    if (this.historicalData.weaknesses.includes('slow_reactions')) {
      tips.push({
        id: 'tip_reactions',
        title: 'Quick Reactions',
        text: 'Try to press SPACE as soon as the fish bites! Practice makes perfect.',
        priority: 1
      });
    }
    
    // Success rate tips
    if (this.getCurrentSuccessRate() < 0.5) {
      tips.push({
        id: 'tip_timing',
        title: 'Timing is Key',
        text: 'Wait for the pointer to be fully in the green zone before pressing SPACE.',
        priority: 2
      });
    }
    
    // Frustration tips
    if (this.historicalData.weaknesses.includes('frustration_prone')) {
      tips.push({
        id: 'tip_patience',
        title: 'Stay Patient',
        text: 'Take a break if you\'re frustrated. Fishing requires patience!',
        priority: 3
      });
    }
    
    // Time of day tips
    const hour = new Date().getHours();
    if (hour >= 5 && hour <= 7) {
      tips.push({
        id: 'tip_dawn',
        title: 'Dawn Fishing',
        text: 'Many rare fish are active at dawn. It\'s a great time to fish!',
        priority: 4
      });
    }
    
    // Weather tips
    if (this.scene.weatherSystem?.currentWeather === 'rainy') {
      tips.push({
        id: 'tip_rain',
        title: 'Rainy Day Bonus',
        text: 'Rain increases rare fish spawns! Take advantage of this weather.',
        priority: 5
      });
    }
    
    // Skill-based tips
    if (this.historicalData.skillLevel === 'beginner') {
      tips.push({
        id: 'tip_basics',
        title: 'Fishing Basics',
        text: 'Press SPACE to cast, wait for a bite, then press SPACE again in the green zone!',
        priority: 6
      });
    }
    
    // Filter out already given tips
    const newTips = tips.filter(t => !this.tipsGiven.has(t.id));
    
    if (newTips.length === 0) return null;
    
    // Sort by priority and get highest
    newTips.sort((a, b) => a.priority - b.priority);
    const tip = newTips[0];
    
    this.tipsGiven.add(tip.id);
    this.tipCooldown = 10; // 10 catches before next tip
    
    return tip;
  }

  /**
   * Decrement tip cooldown
   */
  decrementTipCooldown() {
    if (this.tipCooldown > 0) {
      this.tipCooldown--;
    }
  }

  /**
   * Get difficulty modifier for adaptive difficulty
   */
  getDifficultyModifier() {
    const skillLevel = this.historicalData.skillLevel;
    
    switch (skillLevel) {
      case 'beginner':
        return { minigameSpeed: 0.7, targetSize: 1.3, decay: 0.8 };
      case 'intermediate':
        return { minigameSpeed: 0.9, targetSize: 1.1, decay: 0.9 };
      case 'advanced':
        return { minigameSpeed: 1.1, targetSize: 0.9, decay: 1.1 };
      case 'expert':
        return { minigameSpeed: 1.3, targetSize: 0.7, decay: 1.3 };
      default:
        return { minigameSpeed: 1.0, targetSize: 1.0, decay: 1.0 };
    }
  }

  /**
   * End session and save data
   */
  endSession() {
    const sessionDuration = Date.now() - this.sessionStart;
    
    // Update historical data
    this.historicalData.totalSessions++;
    this.historicalData.totalPlayTime += sessionDuration;
    this.historicalData.totalCatches += this.sessionData.catches.length;
    this.historicalData.totalAttempts += this.sessionData.attempts.length;
    
    // Update best streak
    if (this.currentStreak > this.historicalData.bestStreak) {
      this.historicalData.bestStreak = this.currentStreak;
    }
    
    // Detect play style
    this.historicalData.playStyle = this.detectPlayStyle();
    
    // Calculate average success rate
    const totalAttempts = this.historicalData.totalCatches + this.historicalData.totalAttempts;
    if (totalAttempts > 0) {
      this.historicalData.averageSuccessRate = this.historicalData.totalCatches / totalAttempts;
    }
    
    this.save();
    
    return this.getSessionSummary();
  }

  /**
   * Get session summary
   */
  getSessionSummary() {
    const duration = Date.now() - this.sessionStart;
    const catches = this.sessionData.catches.length;
    const attempts = this.sessionData.attempts.length + catches;
    const successRate = attempts > 0 ? (catches / attempts * 100).toFixed(1) : 0;
    
    return {
      duration,
      catches,
      attempts,
      successRate,
      perfectCatches: this.sessionData.catches.filter(c => c.perfect).length,
      rareCatches: this.sessionData.catches.filter(c => 
        c.rarity === 'rare' || c.rarity === 'epic' || c.rarity === 'legendary'
      ).length,
      totalValue: this.sessionData.catches.reduce((sum, c) => sum + c.value, 0),
      skillLevel: this.historicalData.skillLevel,
      playStyle: this.historicalData.playStyle
    };
  }

  /**
   * Get full analytics report
   */
  getReport() {
    return {
      historical: { ...this.historicalData },
      session: this.getSessionSummary(),
      recommendations: this.generateRecommendations(),
      stats: this.calculateStats()
    };
  }

  /**
   * Generate recommendations based on analytics
   */
  generateRecommendations() {
    const recs = [];
    
    if (this.historicalData.weaknesses.includes('slow_reactions')) {
      recs.push('Practice the fishing minigame in calm weather to improve reaction time');
    }
    
    if (this.getCurrentSuccessRate() < 0.5) {
      recs.push('Try fishing during the day for easier catches');
    }
    
    if (this.historicalData.skillLevel === 'beginner') {
      recs.push('Focus on catching common fish first to build confidence');
    }
    
    if (!this.historicalData.strengths.includes('rare_fish_hunter')) {
      recs.push('Try fishing during storms for increased rare fish spawns');
    }
    
    return recs;
  }

  /**
   * Calculate additional stats
   */
  calculateStats() {
    const catches = [...this.sessionData.catches];
    
    if (catches.length === 0) {
      return { averageCatchValue: 0, favoriteTimeOfDay: null, favoriteWeather: null };
    }
    
    const averageCatchValue = catches.reduce((sum, c) => sum + c.value, 0) / catches.length;
    
    // Find favorite time of day
    const timeCounts = {};
    catches.forEach(c => {
      timeCounts[c.timeOfDay] = (timeCounts[c.timeOfDay] || 0) + 1;
    });
    const favoriteTimeOfDay = Object.entries(timeCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0];
    
    // Find favorite weather
    const weatherCounts = {};
    catches.forEach(c => {
      weatherCounts[c.weather] = (weatherCounts[c.weather] || 0) + 1;
    });
    const favoriteWeather = Object.entries(weatherCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0];
    
    return {
      averageCatchValue: Math.round(averageCatchValue),
      favoriteTimeOfDay,
      favoriteWeather,
      uniqueFishCaught: new Set(catches.map(c => c.fishId)).size
    };
  }

  /**
   * Serialize for save
   */
  serialize() {
    return {
      historical: this.historicalData,
      session: this.sessionData
    };
  }

  /**
   * Deserialize from save
   */
  deserialize(data) {
    if (data.historical) {
      this.historicalData = { ...this.historicalData, ...data.historical };
    }
  }
}
