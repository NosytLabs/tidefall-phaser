import Phaser from 'phaser';
import { DEPTH, WEATHER } from '../core/Constants.js';
import { eventBus } from '../core/EventBus.js';

/**
 * WeatherSystem - Enhanced weather with visual effects
 * 
 * Features:
 * - Rain particle effects
 * - Wind effects
 * - Lightning (stormy)
 * - Screen tinting
 * - Weather transitions
 * - Fish spawn modifiers
 */
export class WeatherSystem {
  constructor(scene) {
    this.scene = scene;
    this.currentWeather = 'sunny';
    this.weatherTimer = null;
    this.transitionDuration = 3000;
    
    // Visual effects
    this.rainParticles = null;
    this.snowParticles = null;
    this.windParticles = null;
    this.lightningEffect = null;
    this.darknessOverlay = null;
    this.cloudOverlay = null;
    
    // Weather modifiers for fish spawning
    this.weatherModifiers = WEATHER.FISH_MODIFIER;
    
    // Wind direction and strength
    this.windDirection = 1; // 1 = right, -1 = left
    this.windStrength = 0;
    
    this.log('info', '[WeatherSystem] Initialized');
  }

  log(level, message) {
    if (this.scene?.log) {
      this.scene.log(level, message);
    }
  }

  start() {
    this.createVisualEffects();
    this.scheduleWeatherChange();
    this.log('info', 'Weather system started');
  }

  createVisualEffects() {
    // Darkness overlay for storms/night
    this.darknessOverlay = this.scene.add.rectangle(
      this.scene.scale.width / 2,
      this.scene.scale.height / 2,
      this.scene.scale.width,
      this.scene.scale.height,
      0x000000,
      0
    ).setDepth(DEPTH.UI_FOREGROUND - 1);
    
    // Cloud overlay for cloudy weather
    this.cloudOverlay = this.scene.add.rectangle(
      this.scene.scale.width / 2,
      this.scene.scale.height / 2,
      this.scene.scale.width,
      this.scene.scale.height,
      0x888888,
      0
    ).setDepth(DEPTH.UI_FOREGROUND - 2);
    
    // Rain particles
    this.createRainEffect();
    
    // Wind particles
    this.createWindEffect();
    
    // Lightning
    this.lightningEffect = this.scene.add.rectangle(
      this.scene.scale.width / 2,
      this.scene.scale.height / 2,
      this.scene.scale.width,
      this.scene.scale.height,
      0xffffff,
      0
    ).setDepth(DEPTH.UI_FOREGROUND + 10);
  }

  createRainEffect() {
    // Create rain particle emitter
    const particles = this.scene.add.particles(0, 0, 'rain_drop', {
      x: { min: 0, max: this.scene.scale.width },
      y: -10,
      lifespan: 1500,
      speedY: { min: 300, max: 500 },
      speedX: { min: -20, max: 20 },
      scale: { start: 0.5, end: 0.3 },
      alpha: { start: 0.6, end: 0 },
      quantity: 0, // Start with 0, enable when raining
      blendMode: 'ADD'
    });
    
    particles.setDepth(DEPTH.UI_FOREGROUND - 5);
    particles.stop();
    
    this.rainParticles = particles;
  }

  createWindEffect() {
    // Create wind particles (leaves/dust)
    const particles = this.scene.add.particles(0, 0, 'wind_particle', {
      x: { min: -50, max: 0 },
      y: { min: 0, max: this.scene.scale.height },
      lifespan: 2000,
      speedX: { min: 200, max: 400 },
      speedY: { min: -50, max: 50 },
      scale: { start: 0.3, end: 0.1 },
      alpha: { start: 0.4, end: 0 },
      quantity: 0,
      blendMode: 'ADD'
    });
    
    particles.setDepth(DEPTH.UI_FOREGROUND - 3);
    particles.stop();
    
    this.windParticles = particles;
  }

  scheduleWeatherChange() {
    const delay = Phaser.Math.Between(120000, 300000); // 2-5 minutes
    this.weatherTimer = this.scene.time.delayedCall(delay, () => {
      this.changeWeather();
      this.scheduleWeatherChange();
    });
  }

  changeWeather() {
    const weathers = WEATHER.TYPES;
    const weights = [40, 30, 20, 10]; // sunny, cloudy, rainy, stormy
    const total = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * total;
    
    let newWeather = 'sunny';
    for (let i = 0; i < weathers.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        newWeather = weathers[i];
        break;
      }
    }
    
    this.setWeather(newWeather);
  }

  setWeather(weather) {
    if (this.currentWeather === weather) return;
    
    this.log('info', `Weather changing: ${this.currentWeather} -> ${weather}`);
    
    // Transition out old weather
    this.transitionOut(this.currentWeather);
    
    // Set new weather
    this.currentWeather = weather;
    
    // Transition in new weather
    this.transitionIn(weather);
    
    // Emit event
    this.scene.events.emit('weatherChanged', weather);
    eventBus.emit('world:weatherChange', weather);
    
    // Show notification
    const weatherNames = {
      sunny: '☀️ The sun is shining',
      cloudy: '☁️ Clouds are gathering',
      rainy: '🌧️ Rain has started',
      stormy: '⛈️ A storm is brewing!'
    };
    
    this.scene.events.emit('showMessage', weatherNames[weather]);
  }

  transitionOut(weather) {
    switch (weather) {
      case 'rainy':
        if (this.rainParticles) {
          this.scene.tweens.add({
            targets: this.rainParticles,
            alpha: 0,
            duration: 1000,
            onComplete: () => this.rainParticles.stop()
          });
        }
        break;
        
      case 'stormy':
        if (this.rainParticles) {
          this.scene.tweens.add({
            targets: this.rainParticles,
            alpha: 0,
            duration: 1000,
            onComplete: () => this.rainParticles.stop()
          });
        }
        if (this.windParticles) {
          this.scene.tweens.add({
            targets: this.windParticles,
            alpha: 0,
            duration: 1000,
            onComplete: () => this.windParticles.stop()
          });
        }
        this.scene.tweens.add({
          targets: this.darknessOverlay,
          alpha: 0,
          duration: 2000
        });
        break;
        
      case 'cloudy':
        this.scene.tweens.add({
          targets: this.cloudOverlay,
          alpha: 0,
          duration: 2000
        });
        break;
    }
  }

  transitionIn(weather) {
    switch (weather) {
      case 'rainy':
        // Light rain
        if (this.rainParticles) {
          this.rainParticles.start();
          this.rainParticles.setConfig({ quantity: 2 });
          this.scene.tweens.add({
            targets: this.rainParticles,
            alpha: 1,
            duration: 1000
          });
        }
        // Slight darkening
        this.scene.tweens.add({
          targets: this.darknessOverlay,
          alpha: 0.2,
          duration: 2000
        });
        break;
        
      case 'stormy':
        // Heavy rain
        if (this.rainParticles) {
          this.rainParticles.start();
          this.rainParticles.setConfig({ quantity: 5 });
          this.scene.tweens.add({
            targets: this.rainParticles,
            alpha: 1,
            duration: 1000
          });
        }
        // Wind
        if (this.windParticles) {
          this.windParticles.start();
          this.windParticles.setConfig({ quantity: 3 });
          this.scene.tweens.add({
            targets: this.windParticles,
            alpha: 1,
            duration: 1000
          });
        }
        // Strong darkening
        this.scene.tweens.add({
          targets: this.darknessOverlay,
          alpha: 0.4,
          duration: 2000
        });
        // Schedule lightning
        this.scheduleLightning();
        break;
        
      case 'cloudy':
        this.scene.tweens.add({
          targets: this.cloudOverlay,
          alpha: 0.3,
          duration: 2000
        });
        break;
        
      case 'sunny':
        // Clear all effects
        this.scene.tweens.add({
          targets: [this.darknessOverlay, this.cloudOverlay],
          alpha: 0,
          duration: 2000
        });
        break;
    }
  }

  scheduleLightning() {
    if (this.currentWeather !== 'stormy') return;
    
    const delay = Phaser.Math.Between(3000, 10000);
    this.scene.time.delayedCall(delay, () => {
      if (this.currentWeather === 'stormy') {
        this.triggerLightning();
        this.scheduleLightning();
      }
    });
  }

  triggerLightning() {
    // Flash effect
    this.lightningEffect.setAlpha(0.8);
    
    this.scene.tweens.add({
      targets: this.lightningEffect,
      alpha: 0,
      duration: 200,
      ease: 'Power2'
    });
    
    // Screen shake
    this.scene.cameras.main.shake(300, 0.01);
    
    // Thunder sound (placeholder)
    // this.scene.audioManager?.playSfx('thunder');
    
    this.log('debug', 'Lightning strike');
  }

  getModifier(rarity) {
    return this.weatherModifiers[this.currentWeather][rarity] || 1.0;
  }

  getWeatherName() {
    const names = {
      sunny: '☀️ Sunny',
      cloudy: '☁️ Cloudy',
      rainy: '🌧️ Rainy',
      stormy: '⛈️ Stormy',
    };
    return names[this.currentWeather];
  }

  getWeatherIcon() {
    const icons = {
      sunny: '☀️',
      cloudy: '☁️',
      rainy: '🌧️',
      stormy: '⛈️'
    };
    return icons[this.currentWeather];
  }

  /**
   * Get current wind effect on casting
   */
  getWindEffect() {
    const effects = {
      sunny: { direction: 0, strength: 0 },
      cloudy: { direction: Math.random() > 0.5 ? 1 : -1, strength: 0.1 },
      rainy: { direction: Math.random() > 0.5 ? 1 : -1, strength: 0.3 },
      stormy: { direction: Math.random() > 0.5 ? 1 : -1, strength: 0.6 }
    };
    
    return effects[this.currentWeather];
  }

  /**
   * Check if weather is dangerous (for proactive warnings)
   */
  isDangerous() {
    return this.currentWeather === 'stormy';
  }

  /**
   * Get fishing recommendations based on weather
   */
  getRecommendations() {
    const recs = {
      sunny: ['Good for common fish', 'Clear visibility'],
      cloudy: ['Rare fish more active', 'Comfortable conditions'],
      rainy: ['Excellent for rare fish', 'Fish are biting well'],
      stormy: ['LEGENDARY fish possible!', 'Be careful - dangerous conditions']
    };
    
    return recs[this.currentWeather];
  }

  update() {
    // Update wind particles direction based on wind
    if (this.windParticles && this.currentWeather === 'stormy') {
      this.windParticles.setConfig({
        speedX: { min: 200 * this.windDirection, max: 400 * this.windDirection }
      });
    }
  }

  destroy() {
    if (this.weatherTimer) {
      this.weatherTimer.remove();
    }
    
    this.rainParticles?.destroy();
    this.windParticles?.destroy();
    this.darknessOverlay?.destroy();
    this.cloudOverlay?.destroy();
    this.lightningEffect?.destroy();
  }
}
