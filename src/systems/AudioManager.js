import Phaser from 'phaser';
import { eventBus } from '../core/EventBus.js';
import { EVENTS, FISHING } from '../core/Constants.js';

/**
 * AudioManager - Centralized audio system with placeholder support
 * 
 * Features:
 * - Lazy loading of audio assets
 * - Volume control for music and SFX
 * - Sound pooling for frequently played sounds
 * - Mute/unmute functionality
 * - Ambient sound management
 */
export class AudioManager {
  constructor(scene) {
    this.scene = scene;
    this.isMuted = false;
    this.musicVolume = 0.5;
    this.sfxVolume = 0.7;
    
    // Sound pools for frequently played sounds
    this.soundPools = new Map();
    this.poolSizes = {
      splash: 3,
      reel: 2,
      click: 5
    };
    
    // Currently playing sounds
    this.activeSounds = new Map();
    this.ambientSounds = new Map();
    
    // Audio analysis (for visualizers if needed)
    this.audioContext = null;
    this.analyser = null;
    
    // Placeholder sounds (generated procedurally if assets not available)
    this.usePlaceholders = true;
    
    this.init();
  }

  /**
   * Initialize audio system
   */
  init() {
    // Try to create Web Audio context for advanced features
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
    } catch (e) {
      console.warn('[AudioManager] Web Audio API not available, using Phaser sound only');
    }
    
    // Listen for mute events
    eventBus.on(EVENTS.AUDIO_MUTE, () => this.mute());
    eventBus.on(EVENTS.AUDIO_UNMUTE, () => this.unmute());
    
    console.log('[AudioManager] Initialized');
  }

  /**
   * Load sound assets (call from scene preload)
   */
  preloadSounds() {
    const sounds = [
      { key: 'cast', path: 'assets/sounds/cast.ogg', pool: false },
      { key: 'splash', path: 'assets/sounds/splash.ogg', pool: true },
      { key: 'bite', path: 'assets/sounds/bite.ogg', pool: false },
      { key: 'reel', path: 'assets/sounds/reel.ogg', pool: true },
      { key: 'success', path: 'assets/sounds/success.ogg', pool: false },
      { key: 'fail', path: 'assets/sounds/fail.ogg', pool: false },
      { key: 'click', path: 'assets/sounds/click.ogg', pool: true },
      { key: 'hover', path: 'assets/sounds/hover.ogg', pool: false },
      { key: 'ambient_ocean', path: 'assets/sounds/ambient_ocean.ogg', pool: false, loop: true },
      { key: 'ambient_wind', path: 'assets/sounds/ambient_wind.ogg', pool: false, loop: true },
      { key: 'ambient_birds', path: 'assets/sounds/ambient_birds.ogg', pool: false, loop: true },
      { key: 'bgm_day', path: 'assets/music/day.ogg', pool: false, loop: true },
      { key: 'bgm_night', path: 'assets/music/night.ogg', pool: false, loop: true },
    ];

    sounds.forEach(sound => {
      if (sound.loop) {
        this.scene.load.audio(sound.key, sound.path);
      } else {
        this.scene.load.audio(sound.key, sound.path);
      }
    });
  }

  /**
   * Create sound pools after assets load
   */
  createPools() {
    Object.entries(this.poolSizes).forEach(([key, size]) => {
      if (this.scene.cache.audio.exists(key)) {
        this.soundPools.set(key, []);
        for (let i = 0; i < size; i++) {
          const sound = this.scene.sound.add(key);
          this.soundPools.get(key).push({
            sound,
            available: true
          });
        }
      }
    });
  }

  /**
   * Play a sound effect
   */
  playSfx(key, options = {}) {
    if (this.isMuted) return null;

    const config = {
      volume: options.volume !== undefined ? options.volume : this.sfxVolume,
      loop: options.loop || false,
      ...options
    };

    // Try pooled sound first
    if (this.soundPools.has(key)) {
      const pool = this.soundPools.get(key);
      const pooled = pool.find(p => p.available);
      if (pooled) {
        pooled.available = false;
        pooled.sound.play(config);
        pooled.sound.once('complete', () => {
          pooled.available = true;
        });
        return pooled.sound;
      }
    }

    // Try direct sound
    if (this.scene.cache.audio.exists(key)) {
      const sound = this.scene.sound.add(key, config);
      sound.play();
      
      if (config.loop) {
        this.activeSounds.set(key, sound);
      } else {
        sound.once('complete', () => sound.destroy());
      }
      
      return sound;
    }

    // Use placeholder if enabled
    if (this.usePlaceholders) {
      this.playPlaceholderSound(key);
    }

    return null;
  }

  /**
   * Play procedural placeholder sound
   */
  playPlaceholderSound(type) {
    if (!this.audioContext || this.isMuted) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Configure based on sound type
    switch (type) {
      case 'cast':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(220, this.audioContext.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.3 * this.sfxVolume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
        break;

      case 'splash':
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.2 * this.sfxVolume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.2);
        break;

      case 'bite':
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(300, this.audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.3 * this.sfxVolume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
        break;

      case 'success':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
        oscillator.frequency.setValueAtTime(554, this.audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(659, this.audioContext.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.3 * this.sfxVolume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.5);
        break;

      case 'click':
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1 * this.sfxVolume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.05);
        break;
    }
  }

  /**
   * Play background music
   */
  playMusic(key, fadeDuration = 1000) {
    if (this.isMuted) return;

    // Stop current music
    this.stopMusic(fadeDuration);

    if (this.scene.cache.audio.exists(key)) {
      const music = this.scene.sound.add(key, {
        volume: 0,
        loop: true
      });

      music.play();
      
      // Fade in
      this.scene.tweens.add({
        targets: music,
        volume: this.musicVolume,
        duration: fadeDuration
      });

      this.activeSounds.set('music', music);
      return music;
    }

    return null;
  }

  /**
   * Stop background music
   */
  stopMusic(fadeDuration = 1000) {
    const music = this.activeSounds.get('music');
    if (music) {
      this.scene.tweens.add({
        targets: music,
        volume: 0,
        duration: fadeDuration,
        onComplete: () => {
          music.stop();
          music.destroy();
          this.activeSounds.delete('music');
        }
      });
    }
  }

  /**
   * Start ambient sounds based on time of day and weather
   */
  startAmbient(timeOfDay, weather) {
    // Ocean ambient (always playing)
    if (!this.ambientSounds.has('ocean')) {
      const ocean = this.playSfx('ambient_ocean', { loop: true, volume: 0.3 });
      if (ocean) this.ambientSounds.set('ocean', ocean);
    }

    // Wind based on weather
    if (weather === 'stormy' || weather === 'rainy') {
      if (!this.ambientSounds.has('wind')) {
        const wind = this.playSfx('ambient_wind', { loop: true, volume: 0.4 });
        if (wind) this.ambientSounds.set('wind', wind);
      }
    } else {
      this.stopAmbient('wind');
    }

    // Birds during day
    if (timeOfDay === 'day' || timeOfDay === 'dawn') {
      if (!this.ambientSounds.has('birds')) {
        const birds = this.playSfx('ambient_birds', { loop: true, volume: 0.2 });
        if (birds) this.ambientSounds.set('birds', birds);
      }
    } else {
      this.stopAmbient('birds');
    }
  }

  /**
   * Stop a specific ambient sound
   */
  stopAmbient(key) {
    const sound = this.ambientSounds.get(key);
    if (sound) {
      sound.stop();
      sound.destroy();
      this.ambientSounds.delete(key);
    }
  }

  /**
   * Stop all ambient sounds
   */
  stopAllAmbient() {
    this.ambientSounds.forEach((sound, key) => {
      sound.stop();
      sound.destroy();
    });
    this.ambientSounds.clear();
  }

  /**
   * Update ambient sounds (call when time/weather changes)
   */
  updateAmbient(timeOfDay, weather) {
    this.startAmbient(timeOfDay, weather);
  }

  /**
   * Mute all audio
   */
  mute() {
    this.isMuted = true;
    this.scene.sound.mute = true;
    
    // Suspend audio context
    if (this.audioContext && this.audioContext.state === 'running') {
      this.audioContext.suspend();
    }
  }

  /**
   * Unmute all audio
   */
  unmute() {
    this.isMuted = false;
    this.scene.sound.mute = false;
    
    // Resume audio context
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  /**
   * Set music volume
   */
  setMusicVolume(volume) {
    this.musicVolume = Phaser.Math.Clamp(volume, 0, 1);
    const music = this.activeSounds.get('music');
    if (music && !this.isMuted) {
      music.setVolume(this.musicVolume);
    }
  }

  /**
   * Set SFX volume
   */
  setSfxVolume(volume) {
    this.sfxVolume = Phaser.Math.Clamp(volume, 0, 1);
  }

  /**
   * Get current frequency data (for visualizers)
   */
  getFrequencyData() {
    if (!this.analyser) return new Uint8Array(0);
    
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }

  /**
   * Clean up all audio resources
   */
  destroy() {
    this.stopAllAmbient();
    this.stopMusic(0);
    
    this.activeSounds.forEach((sound) => {
      sound.stop();
      sound.destroy();
    });
    this.activeSounds.clear();

    this.soundPools.forEach(pool => {
      pool.forEach(p => {
        p.sound.destroy();
      });
    });
    this.soundPools.clear();

    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}
