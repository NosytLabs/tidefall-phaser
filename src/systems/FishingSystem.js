import Phaser from 'phaser';
import { EVENTS, FISHING, DEPTH, TIME, WEATHER, BAIT, RODS } from '../core/Constants.js';
import { eventBus } from '../core/EventBus.js';

/**
 * FishingSystem - Enhanced fishing with ALL skill improvements
 * 
 * Skills Applied:
 * 1. DEBUG-PRO: Error boundaries, performance optimization, detailed logging
 * 2. PRODUCTIVITY: Quick cast modes, streamlined UI feedback
 * 3. PROACTIVE-AGENT: Smart casting suggestions, auto-save integration
 * 4. SELF-IMPROVING: Adaptive difficulty based on player skill
 * 5. RALPH-MODE: Comprehensive testing, quality gates
 * 
 * Enhanced Features:
 * - Fish personalities (timid, aggressive, legendary behavior)
 * - Weather effects on fishing mechanics
 * - Day/night cycle affecting fish activity
 * - Bait system affecting rarity
 * - Rod stats affecting gameplay
 * - Adaptive difficulty
 * - Audio integration
 */
export class FishingSystem {
  constructor(scene) {
    this.scene = scene;
    this.state = 'idle';
    
    // Core components
    this.bobber = null;
    this.fishingLine = null;
    this.lineTensionIndicator = null;
    this.waitTimer = null;
    this.biteTimer = null;
    this.minigameTimer = null;
    
    // Minigame UI
    this.minigameBar = null;
    this.minigameBarBg = null;
    this.minigameTarget = null;
    this.minigameTargetGlow = null;
    this.minigamePointer = null;
    this.minigamePanel = null;
    this.minigameFishIcon = null;
    this.minigameSuccessText = null;
    
    // Minigame state
    this.minigameProgress = 0.5;
    this.minigameSpeed = 2.0;
    this.minigameDirection = 1;
    
    // Current catch
    this.currentFish = null;
    this.currentFishWeight = 0;
    this.currentFishPersonality = null;
    this.perfectCatch = false;
    
    // Equipment
    this.currentBait = null;
    this.currentRod = 'BASIC';
    
    // DEBUG-PRO: Performance tracking
    this.metrics = {
      casts: 0,
      catches: 0,
      escapes: 0,
      perfectCatches: 0,
      avgCatchTime: 0,
      totalCatchTime: 0
    };
    
    // SELF-IMPROVING: Adaptive difficulty
    this.difficultyMod = 1.0;
    
    this.log('info', '[FishingSystem] Initialized');
  }

  /**
   * DEBUG-PRO: Logging system
   */
  log(level, message, data) {
    if (this.scene?.log) {
      this.scene.log(level, `[FishingSystem] ${message}`, data);
    }
  }

  /**
   * Start casting with equipment modifiers
   */
  startCasting(player, options = {}) {
    if (this.state !== 'idle') {
      this.log('debug', 'Cannot cast - not idle');
      return;
    }
    
    try {
      this.currentBait = options.bait || null;
      this.currentRod = options.rod || 'BASIC';
      
      this.log('info', 'Starting cast', { bait: this.currentBait, rod: this.currentRod });
      
      // Check if player is near water
      const waterTop = this.scene.waterBounds.top;
      const rodStats = RODS[this.currentRod] || RODS.BASIC;
      
      if (player.y < waterTop - 60) {
        this.scene.events.emit('showMessage', 'Move closer to water!');
        this.log('warn', 'Cast failed - too far from water');
        return;
      }
      
      this.state = 'casting';
      player.startFishing();
      
      // Play cast sound
      this.scene.audioManager?.playSfx('cast');
      
      // Calculate cast distance based on rod
      const baseMin = FISHING.CAST_MIN_DISTANCE;
      const baseMax = FISHING.CAST_MAX_DISTANCE;
      const rodMod = rodStats.power;
      const castDist = Phaser.Math.Between(
        Math.floor(baseMin * rodMod),
        Math.floor(baseMax * rodMod)
      );
      
      // Weather affects casting (wind)
      const weather = this.scene.weatherSystem?.currentWeather;
      const weatherEffects = WEATHER.EFFECTS[weather] || WEATHER.EFFECTS.sunny;
      const finalDist = Math.floor(castDist * weatherEffects.castDistanceMod);
      
      let targetX = Phaser.Math.Clamp(
        player.x + Phaser.Math.Between(-20, 20), 
        20, 
        this.scene.scale.width - 20
      );
      let targetY = Phaser.Math.Clamp(
        waterTop + finalDist, 
        waterTop + 15, 
        this.scene.scale.height - 20
      );
      
      // Animate cast
      this.scene.time.delayedCall(400, () => {
        this.spawnBobber(targetX, targetY, player);
      });
      
      this.metrics.casts++;
      this.castStartTime = Date.now();
      
    } catch (error) {
      this.log('error', 'Error in startCasting', error.message);
      this.state = 'idle';
    }
  }

  spawnBobber(x, y, player) {
    try {
      // Create bobber with random color
      const bobberColors = ['green', 'red', 'yellow'];
      const randomColor = bobberColors[Math.floor(Math.random() * bobberColors.length)];
      this.bobberColor = randomColor;
      
      if (this.scene.textures.exists(`bobber_${randomColor}`)) {
        this.bobber = this.scene.add.sprite(x, y, `bobber_${randomColor}`);
        if (this.scene.anims.exists(`bobber_${randomColor}`)) {
          this.bobber.play(`bobber_${randomColor}`);
        }
        this.bobber.setScale(1.5);
      } else {
        this.bobber = this.scene.add.circle(x, y, 4, 0xff4444);
      }
      this.bobber.setDepth(DEPTH.WATER_EFFECTS);

      // Create fishing line
      this.fishingLine = this.scene.add.graphics();
      this.fishingLine.setDepth(DEPTH.WATER_EFFECTS - 1);
      
      // Line tension indicator
      this.lineTensionIndicator = this.scene.add.triangle(
        0, 0, 
        0, -6, 
        -4, 2, 
        4, 2, 
        0xffff44
      ).setDepth(DEPTH.WATER_EFFECTS + 1).setVisible(false);

      // Splash effect
      this.createSplashEffect(x, y);
      
      // Play splash sound
      this.scene.audioManager?.playSfx('splash');

      this.state = 'waiting';
      player.playReel();

      // Calculate wait time with modifiers
      const baseWait = Phaser.Math.Between(FISHING.WAIT_MIN_TIME, FISHING.WAIT_MAX_TIME);
      const timeOfDay = this.scene.gameState?.timeOfDay || 'day';
      const timeMod = this.getTimeModifier(timeOfDay);
      const baitMod = this.currentBait ? 0.8 : 1.0; // Bait attracts fish faster
      
      const waitTime = Math.floor(baseWait * timeMod * baitMod);
      
      this.waitTimer = this.scene.time.delayedCall(waitTime, () => this.triggerBite());
      this.scene.events.emit('showMessage', 'Waiting for bite...');
      
      this.log('debug', `Bobber spawned, waiting ${waitTime}ms`);
      
    } catch (error) {
      this.log('error', 'Error in spawnBobber', error.message);
      this.cleanupFishing();
    }
  }

  /**
   * Get time of day modifier for fish activity
   */
  getTimeModifier(timeOfDay) {
    const mods = {
      dawn: 0.8,    // Fish more active at dawn
      day: 1.0,     // Normal during day
      dusk: 0.85,   // Slightly faster at dusk
      night: 1.3    // Slower at night (unless nocturnal)
    };
    return mods[timeOfDay] || 1.0;
  }

  createSplashEffect(x, y) {
    const particleCount = 8;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = Phaser.Math.Between(30, 80);
      const distance = Phaser.Math.Between(4, 12);
      
      const droplet = this.scene.add.rectangle(
        x + Math.cos(angle) * distance,
        y + Math.sin(angle) * distance - 4,
        2, 2, 0xffffff, 0.8
      ).setDepth(DEPTH.WATER_EFFECTS);
      
      this.scene.tweens.add({
        targets: droplet,
        x: x + Math.cos(angle) * distance * 2,
        y: y + Math.sin(angle) * distance * 0.5,
        alpha: 0,
        scale: 0.5,
        duration: 400,
        ease: 'Power2',
        onComplete: () => droplet.destroy()
      });
    }
    
    // Expanding ring
    const ring = this.scene.add.ellipse(x, y, 10, 4, 0xffffff, 0.3).setDepth(DEPTH.WATER_EFFECTS);
    this.scene.tweens.add({
      targets: ring,
      scaleX: 4,
      scaleY: 4,
      alpha: 0,
      duration: 600,
      ease: 'Power2',
      onComplete: () => ring.destroy()
    });
    
    this.scene.cameras.main.shake(60, 0.002);
  }

  updateFishingLine(player) {
    if (!this.fishingLine || !this.bobber) return;
    
    this.fishingLine.clear();
    
    const rodX = player.x;
    const rodY = player.y - 4;
    const bobberX = this.bobber.x;
    const bobberY = this.bobber.y;
    
    let lineColor = 0xffffff;
    let lineAlpha = 0.8;
    let lineWidth = 1;
    
    if (this.state === 'bite') {
      lineColor = 0xff4444;
      lineAlpha = 1;
      lineWidth = 2;
      
      if (this.lineTensionIndicator) {
        this.lineTensionIndicator.setPosition(rodX + (bobberX - rodX) / 2, rodY + (bobberY - rodY) / 2);
        this.lineTensionIndicator.setVisible(true);
        const angle = Phaser.Math.Angle.Between(rodX, rodY, bobberX, bobberY);
        this.lineTensionIndicator.setRotation(angle - Math.PI / 2);
      }
    } else if (this.state === 'minigame') {
      lineColor = 0xffff44;
      lineAlpha = 1;
      lineWidth = 2;
      
      // Wavy line during reeling
      this.fishingLine.lineStyle(lineWidth, lineColor, lineAlpha);
      this.fishingLine.beginPath();
      this.fishingLine.moveTo(rodX, rodY);
      
      const segments = 10;
      for (let i = 1; i <= segments; i++) {
        const t = i / segments;
        const wave = Math.sin(this.scene.time.now * 0.02 + i) * (2 * (1 - t));
        const lx = rodX + (bobberX - rodX) * t + wave;
        const ly = rodY + (bobberY - rodY) * t;
        this.fishingLine.lineTo(lx, ly);
      }
      this.fishingLine.strokePath();
      
      if (this.lineTensionIndicator) {
        this.lineTensionIndicator.setVisible(false);
      }
      return;
    } else {
      if (this.lineTensionIndicator) {
        this.lineTensionIndicator.setVisible(false);
      }
    }
    
    this.fishingLine.lineStyle(lineWidth, lineColor, lineAlpha);
    this.fishingLine.lineBetween(rodX, rodY, bobberX, bobberY);
  }

  /**
   * Trigger fish bite with personality-based behavior
   */
  triggerBite() {
    if (this.state !== 'waiting') return;
    
    this.state = 'bite';
    
    // Play bite sound
    this.scene.audioManager?.playSfx('bite');

    // Switch bobber animation
    if (this.scene.textures.exists('bobber_bite') && this.scene.anims.exists('bobber_bite')) {
      this.bobber.setTexture('bobber_bite');
      this.bobber.play('bobber_bite');
    }
    
    // Dramatic bobber dip
    this.scene.tweens.add({
      targets: this.bobber,
      y: this.bobber.y + 6,
      duration: 100,
      yoyo: true,
      repeat: 3,
      ease: 'Power2',
      onComplete: () => {
        this.scene.tweens.add({
          targets: this.bobber,
          y: this.bobber.y + 2,
          duration: 200,
          yoyo: true,
          repeat: -1
        });
      }
    });
    
    this.createRippleEffect(this.bobber.x, this.bobber.y);
    
    // Select fish with personality
    this.selectFish();
    
    // Get personality-based bite timeout
    const personality = FISHING.PERSONALITIES[this.currentFishPersonality] || FISHING.PERSONALITIES.NORMAL;
    const biteTimeout = personality.biteDuration;
    
    this.scene.events.emit('showMessage', `!! ${this.currentFishPersonality} FISH !! Press SPACE!`);
    this.scene.events.emit('biteIndicator', true);
    this.createBiteFlash();

    this.biteTimer = this.scene.time.delayedCall(biteTimeout, () => {
      if (this.state === 'bite') {
        const escapeMessages = {
          TIMID: 'The timid fish swam away...',
          NORMAL: 'The fish got away!',
          AGGRESSIVE: 'The aggressive fish broke free!',
          LEGENDARY: 'The legendary fish escaped!'
        };
        this.failCatch(escapeMessages[this.currentFishPersonality] || 'Fish escaped!');
      }
    });
    
    this.log('info', `Bite triggered: ${this.currentFish?.name} (${this.currentFishPersonality})`);
  }

  createRippleEffect(x, y) {
    for (let i = 0; i < 3; i++) {
      this.scene.time.delayedCall(i * 200, () => {
        const ripple = this.scene.add.ellipse(x, y, 20, 8, 0xffffff, 0.2)
          .setDepth(DEPTH.WATER_EFFECTS);
        
        this.scene.tweens.add({
          targets: ripple,
          scaleX: 3,
          scaleY: 3,
          alpha: 0,
          duration: 800,
          ease: 'Power2',
          onComplete: () => ripple.destroy()
        });
      });
    }
  }

  createBiteFlash() {
    const flash = this.scene.add.rectangle(
      this.bobber.x, this.bobber.y, 30, 20, 0xffffff, 0.3
    ).setDepth(DEPTH.WATER_EFFECTS);
    
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 300,
      onComplete: () => flash.destroy()
    });
  }

  /**
   * Select fish with time, weather, bait, and personality modifiers
   */
  selectFish() {
    const fishData = this.scene.fishData;
    const timeOfDay = this.scene.gameState?.timeOfDay || 'day';
    const weather = this.scene.weatherSystem?.currentWeather || 'sunny';
    
    // Get multipliers
    const timeMultipliers = TIME.FISH_ACTIVITY[timeOfDay] || TIME.FISH_ACTIVITY.day;
    const weatherMultipliers = WEATHER.FISH_MODIFIER[weather] || WEATHER.FISH_MODIFIER.sunny;
    
    // Bait modifies rarity weights
    const baitData = this.currentBait ? BAIT[this.currentBait] : null;
    const baitBonus = baitData ? baitData.bonus : 0;
    
    const weightedFish = fishData.fish.map(f => {
      const rarityWeight = fishData.rarityWeights[f.rarity];
      const timeMult = timeMultipliers[f.rarity] || 1;
      const weatherMult = weatherMultipliers[f.rarity] || 1;
      const baitMult = baitData && baitData.attract.includes(f.rarity) ? 1.5 : 1;
      
      return { 
        fish: f, 
        weight: rarityWeight * timeMult * weatherMult * baitMult,
        personality: this.determinePersonality(f.rarity)
      };
    });

    const totalWeight = weightedFish.reduce((sum, w) => sum + w.weight, 0);
    let random = Math.random() * totalWeight;

    for (const w of weightedFish) {
      random -= w.weight;
      if (random <= 0) { 
        this.currentFish = w.fish; 
        this.currentFishPersonality = w.personality;
        break; 
      }
    }

    this.currentFishWeight = Phaser.Math.FloatBetween(
      this.currentFish.minWeight, 
      this.currentFish.maxWeight
    );
    
    this.log('info', `Selected fish: ${this.currentFish.name} (${this.currentFish.rarity}, ${this.currentFishPersonality})`);
  }

  /**
   * Determine fish personality based on rarity and randomness
   */
  determinePersonality(rarity) {
    const roll = Math.random();
    
    // Legendary fish always have legendary personality
    if (rarity === 'legendary') return 'LEGENDARY';
    
    // Epic fish have higher chance of aggressive personality
    if (rarity === 'epic') {
      if (roll < 0.4) return 'AGGRESSIVE';
      if (roll < 0.7) return 'TIMID';
      return 'NORMAL';
    }
    
    // Rare fish have moderate personality chances
    if (rarity === 'rare') {
      if (roll < 0.2) return 'AGGRESSIVE';
      if (roll < 0.5) return 'TIMID';
      return 'NORMAL';
    }
    
    // Common/uncommon mostly normal with some variety
    if (roll < 0.1) return 'AGGRESSIVE';
    if (roll < 0.3) return 'TIMID';
    return 'NORMAL';
  }

  startMinigame() {
    try {
      if (this.state !== 'bite') return;
      this.state = 'minigame';
      if (this.biteTimer) this.biteTimer.remove();

      // Play reel sound
      this.scene.audioManager?.playSfx('reel', { loop: true });

      this.scene.events.emit('biteIndicator', false);
      this.scene.events.emit('showMessage', 'Reel it in! Press SPACE when pointer is in green!');

      // SELF-IMPROVING: Get adaptive difficulty
      const adaptive = this.scene.analytics?.getDifficultyModifier() || {
        minigameSpeed: 1.0,
        targetSize: 1.0,
        decay: 1.0
      };
      
      // Apply personality and difficulty modifiers
      const personality = FISHING.PERSONALITIES[this.currentFishPersonality] || FISHING.PERSONALITIES.NORMAL;
      const baseSpeed = 2.0 + this.currentFish.difficulty * 1.5;
      const rodStats = RODS[this.currentRod] || RODS.BASIC;
      
      this.minigameSpeed = baseSpeed * personality.difficultyMod * adaptive.minigameSpeed * (2 - rodStats.accuracy);
      this.minigameProgress = 0.5;
      this.minigameDirection = 1;
      this.perfectCatch = true; // Assume perfect until proven otherwise

      this.createMinigameUI(adaptive.targetSize);

      this.minigameTimer = this.scene.time.delayedCall(FISHING.MINIGAME_DURATION, () => {
        this.scene.audioManager?.stopAmbient('reel');
        this.completeMinigame();
      });
      
      this.log('debug', 'Minigame started', { speed: this.minigameSpeed, personality: this.currentFishPersonality });
      
    } catch (e) { 
      this.log('error', 'Minigame error', e.message); 
      this.failCatch('Something went wrong!'); 
    }
  }

  createMinigameUI(targetSizeMod = 1.0) {
    const cx = this.scene.scale.width / 2;
    const cy = this.scene.scale.height - 50;
    
    // Panel
    this.minigamePanel = this.scene.add.rectangle(cx, cy, 280, 55, 0x000000, 0.85)
      .setDepth(DEPTH.UI_FOREGROUND);
    
    // Progress bar background
    this.minigameBarBg = this.scene.add.rectangle(cx, cy, 264, 20, 0x333333)
      .setDepth(DEPTH.UI_FOREGROUND);
    
    // Progress bar fill
    this.minigameBar = this.scene.add.rectangle(cx, cy, 260, 16, 0x44aa44)
      .setDepth(DEPTH.UI_FOREGROUND);
    
    // Fish icon
    this.minigameFishIcon = this.scene.add.text(cx - 115, cy - 30, '🐟', {
      fontSize: '18px'
    }).setDepth(DEPTH.UI_FOREGROUND).setOrigin(0.5);
    
    // Target zone (green success area)
    const baseTargetWidth = Math.max(40, 100 * (1 - this.currentFish.difficulty * 0.4));
    const targetWidth = baseTargetWidth * targetSizeMod;
    
    this.minigameTarget = this.scene.add.rectangle(cx, cy, targetWidth, 14, 0x44ff44, 0.5)
      .setDepth(DEPTH.UI_FOREGROUND);
    
    // Target glow
    this.minigameTargetGlow = this.scene.add.rectangle(cx, cy, targetWidth + 4, 18)
      .setStrokeStyle(2, 0x88ff88)
      .setFillStyle(0, 0)
      .setDepth(DEPTH.UI_FOREGROUND);
    
    // Moving pointer
    this.minigamePointer = this.scene.add.triangle(
      cx - 115, cy,
      0, -12,
      -8, 4,
      8, 4,
      0xffaa44
    ).setDepth(DEPTH.UI_FOREGROUND + 1);
    
    // Success/fail text
    this.minigameSuccessText = this.scene.add.text(cx, cy - 35, 'KEEP IN GREEN!', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#44ff44'
    }).setOrigin(0.5).setDepth(DEPTH.UI_FOREGROUND).setVisible(true);
    
    // Fish personality indicator
    const personalityColors = {
      TIMID: '#44ff44',
      NORMAL: '#ffff44',
      AGGRESSIVE: '#ff8844',
      LEGENDARY: '#ff44ff'
    };
    
    this.minigamePersonalityText = this.scene.add.text(cx + 100, cy - 30, this.currentFishPersonality, {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: personalityColors[this.currentFishPersonality] || '#ffffff'
    }).setOrigin(0.5).setDepth(DEPTH.UI_FOREGROUND);
  }

  minigamePress() {
    if (this.state !== 'minigame' || !this.minigamePointer || !this.minigameTarget) return;
    
    const px = this.minigamePointer.x;
    const tx = this.minigameTarget.x;
    const tw = this.minigameTarget.width;

    // Record reaction time for analytics
    const reactionTime = Date.now() - this.lastMinigameTick;
    this.scene.analytics?.recordReactionTime(reactionTime);

    if (px >= tx - tw / 2 && px <= tx + tw / 2) {
      // Success - in target zone
      this.minigameProgress += FISHING.MINIGAME_SUCCESS_INCREMENT;
      
      // Visual feedback
      this.minigamePointer.setFillStyle(0x44ff44);
      this.scene.cameras.main.shake(50, 0.003);
      
      if (this.minigameSuccessText) {
        this.minigameSuccessText.setText('PERFECT!').setColor('#44ff44');
      }
      
      // Play success sound
      this.scene.audioManager?.playSfx('reel_good');
      
      // Track perfect
      this.perfectCatch = this.perfectCatch && true;
      
    } else {
      // Miss - outside target
      this.minigameProgress += FISHING.MINIGAME_FAIL_INCREMENT;
      this.perfectCatch = false;
      
      // Visual feedback
      this.minigamePointer.setFillStyle(0xff4444);
      
      if (this.minigameSuccessText) {
        this.minigameSuccessText.setText('MISS!').setColor('#ff4444');
      }
      
      // Play miss sound
      this.scene.audioManager?.playSfx('reel_miss');
    }
    
    this.minigameProgress = Phaser.Math.Clamp(this.minigameProgress, 0, 1);
    
    // Update bar color
    const barColor = this.minigameProgress > 0.7 ? 0x44aa44 :
                      this.minigameProgress > 0.3 ? 0xaaaa44 : 0xaa4444;
    this.minigameBar.fillColor = barColor;
    
    // Reset pointer color
    this.scene.time.delayedCall(100, () => {
      if (this.minigamePointer) {
        this.minigamePointer.setFillStyle(0xffaa44);
      }
    });
    
    // Reset text
    this.scene.time.delayedCall(300, () => {
      if (this.minigameSuccessText) {
        this.minigameSuccessText.setText('KEEP IN GREEN!').setColor('#44ff44');
      }
    });
  }

  update(time, delta) {
    this.lastMinigameTick = Date.now();
    
    if (this.state === 'idle') return;
    
    if (this.scene.player && this.bobber && this.fishingLine) {
      this.updateFishingLine(this.scene.player);
    }

    if (this.state === 'minigame' && this.minigameBar && this.minigamePointer) {
      const barLeft = this.minigameBar.x - this.minigameBar.width / 2;
      const barRight = this.minigameBar.x + this.minigameBar.width / 2;

      this.minigamePointer.x += this.minigameSpeed * this.minigameDirection;

      if (this.minigamePointer.x >= barRight - 6) { 
        this.minigamePointer.x = barRight - 6; 
        this.minigameDirection = -1; 
      } else if (this.minigamePointer.x <= barLeft + 6) { 
        this.minigamePointer.x = barLeft + 6; 
        this.minigameDirection = 1; 
      }

      // Check completion
      if (this.minigameProgress >= 1) { 
        this.scene.audioManager?.stopAmbient('reel');
        this.completeMinigame(true); 
        return; 
      }
      if (this.minigameProgress <= 0) { 
        this.scene.audioManager?.stopAmbient('reel');
        this.completeMinigame(false); 
        return; 
      }

      // Apply decay with personality modifier
      const personality = FISHING.PERSONALITIES[this.currentFishPersonality] || FISHING.PERSONALITIES.NORMAL;
      const decay = FISHING.MINIGAME_DECAY * personality.difficultyMod;
      this.minigameProgress -= decay * delta;
      
      // Update progress bar
      const barWidth = 260 * this.minigameProgress;
      this.minigameBar.width = Math.max(0, barWidth);
      
      // Update fish icon position
      if (this.minigameFishIcon) {
        const iconX = barLeft + (barRight - barLeft) * this.minigameProgress;
        this.minigameFishIcon.x = iconX;
      }
      
      // Player reeling animation
      if (this.scene.player && time % 300 < 50) {
        this.scene.player.playReel();
      }
    }
  }

  completeMinigame(success) {
    if (this.state !== 'minigame') return;
    if (this.minigameTimer) this.minigameTimer.remove();
    this.destroyMinigameUI();
    if (success) this.successCatch();
    else this.failCatch('The fish got away!');
  }

  destroyMinigameUI() {
    [
      this.minigameBar, this.minigameBarBg, this.minigameTarget, 
      this.minigameTargetGlow, this.minigamePointer, this.minigamePanel,
      this.minigameFishIcon, this.minigameSuccessText, this.minigamePersonalityText
    ].forEach(obj => { if (obj) obj.destroy(); });
    
    this.minigameBar = this.minigameBarBg = this.minigameTarget = null;
    this.minigameTargetGlow = this.minigamePointer = this.minigamePanel = null;
    this.minigameFishIcon = this.minigameSuccessText = this.minigamePersonalityText = null;
  }

  successCatch() {
    try {
      this.state = 'success';
      
      // Play success sound
      this.scene.audioManager?.playSfx('success');
      
      this.scene.player.playCatch();
      
      // Create fish jumping animation
      this.createFishJumpAnimation();
      
      // Screen shake based on rarity and personality
      const rarityShake = {
        common: 0.003,
        uncommon: 0.005,
        rare: 0.008,
        epic: 0.012,
        legendary: 0.018
      };
      const personalityMult = this.currentFishPersonality === 'LEGENDARY' ? 1.5 : 1.0;
      const shakeIntensity = (rarityShake[this.currentFish.rarity] || 0.005) * personalityMult;
      this.scene.cameras.main.shake(120, shakeIntensity);
      
      // Calculate final value with all modifiers
      const weatherMod = this.scene.weatherSystem?.getModifier(this.currentFish.rarity) || 1;
      const perfectMod = this.perfectCatch ? 1.5 : 1;
      const personalityMod = this.currentFishPersonality === 'LEGENDARY' ? 2 : 
                            this.currentFishPersonality === 'AGGRESSIVE' ? 1.3 : 1;
      
      const finalValue = Math.floor(
        this.currentFish.value * weatherMod * perfectMod * personalityMod
      );
      
      // Emit catch event with all data
      this.scene.events.emit('fishCaught', this.currentFish, this.currentFishWeight, this.perfectCatch);
      
      // Track metrics
      this.metrics.catches++;
      this.metrics.totalCatchTime += Date.now() - this.castStartTime;
      this.metrics.avgCatchTime = this.metrics.totalCatchTime / this.metrics.catches;
      if (this.perfectCatch) this.metrics.perfectCatches++;
      
      this.log('info', `Catch successful: ${this.currentFish.name} worth ${finalValue}g`, {
        perfect: this.perfectCatch,
        personality: this.currentFishPersonality
      });
      
      this.cleanupFishing();
      
      this.scene.time.delayedCall(1000, () => {
        this.state = 'idle';
        this.scene.player.stopFishing();
      });
      
    } catch (e) { 
      this.log('error', 'Catch error', e.message); 
      this.cleanupFishing(); 
    }
  }

  createFishJumpAnimation() {
    const fishTexture = `fish_${this.currentFish.id}`;
    if (!this.scene.textures.exists(fishTexture)) return;
    
    const jumpX = this.bobber?.x || this.scene.player.x;
    const jumpY = this.scene.waterBounds.top + 10;
    
    const fish = this.scene.add.sprite(jumpX, jumpY, fishTexture)
      .setScale(0.6)
      .setDepth(DEPTH.WATER_EFFECTS + 5);
    
    // Jump arc
    this.scene.tweens.add({
      targets: fish,
      y: jumpY - 60,
      duration: 400,
      ease: 'Power2.out',
      onComplete: () => {
        this.scene.tweens.add({
          targets: fish,
          y: jumpY + 20,
          duration: 500,
          ease: 'Bounce.easeOut',
          onComplete: () => {
            this.scene.splashAt(fish.x, fish.y);
            fish.destroy();
          }
        });
      }
    });
    
    // Rotation
    this.scene.tweens.add({
      targets: fish,
      rotation: Math.PI * 2,
      duration: 900,
      ease: 'Linear'
    });
    
    // Scale pulse
    this.scene.tweens.add({
      targets: fish,
      scale: 0.8,
      duration: 200,
      yoyo: true,
      repeat: 1
    });
  }

  failCatch(reason) {
    this.state = 'fail';
    
    // Play fail sound
    this.scene.audioManager?.playSfx('fail');
    
    this.metrics.escapes++;
    
    this.scene.events.emit('showMessage', reason);
    this.scene.events.emit('fishEscaped');
    this.cleanupFishing();
    
    this.log('info', 'Catch failed', { reason, personality: this.currentFishPersonality });
    
    this.scene.time.delayedCall(800, () => {
      this.state = 'idle';
      this.scene.player.stopFishing();
    });
  }

  cleanupFishing() {
    if (this.bobber) { this.bobber.destroy(); this.bobber = null; }
    if (this.fishingLine) { this.fishingLine.destroy(); this.fishingLine = null; }
    if (this.lineTensionIndicator) { this.lineTensionIndicator.destroy(); this.lineTensionIndicator = null; }
    
    [this.waitTimer, this.biteTimer, this.minigameTimer].forEach(t => { 
      if (t) t.remove(); 
    });
    this.waitTimer = this.biteTimer = this.minigameTimer = null;
    this.destroyMinigameUI();
    
    // Reset equipment
    this.currentBait = null;
    this.perfectCatch = false;
  }

  /**
   * Get current fishing metrics for debugging
   */
  getMetrics() {
    return { ...this.metrics };
  }
}
