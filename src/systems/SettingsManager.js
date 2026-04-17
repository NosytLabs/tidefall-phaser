import { eventBus } from '../core/EventBus.js';
import { EVENTS } from '../core/Constants.js';

/**
 * SettingsManager - Centralized game settings with persistence
 * 
 * Features:
 * - Graphics settings
 * - Audio settings
 * - Control settings
 * - Accessibility options
 * - Auto-save functionality
 */
export class SettingsManager {
  constructor() {
    this.settings = this.getDefaultSettings();
    this.listeners = new Map();
    this.settingsKey = 'tidefall_settings_v2';
    
    this.load();
    this.applySettings();
  }

  /**
   * Get default settings
   */
  getDefaultSettings() {
    return {
      // Graphics
      graphics: {
        pixelPerfect: true,
        showFPS: false,
        particleEffects: true,
        screenShake: true,
        animationQuality: 'high', // low, medium, high
        weatherEffects: true,
        reflections: true,
        dayNightCycle: true,
      },
      
      // Audio
      audio: {
        masterVolume: 1.0,
        musicVolume: 0.5,
        sfxVolume: 0.7,
        ambientVolume: 0.4,
        muted: false,
      },
      
      // Controls
      controls: {
        keyboardLayout: 'qwerty', // qwerty, azerty, qwertz
        mouseSensitivity: 1.0,
        invertY: false,
        quickCast: false,
        autoReel: false,
      },
      
      // Gameplay
      gameplay: {
        autoSave: true,
        autoSaveInterval: 60000, // 1 minute
        showTutorials: true,
        fishingHints: true,
        notificationDuration: 3000,
        quickSaveShortcut: true,
        pauseOnFocusLoss: true,
      },
      
      // Accessibility
      accessibility: {
        colorblindMode: 'none', // none, deuteranopia, protanopia, tritanopia
        highContrast: false,
        largeFont: false,
        reducedMotion: false,
        screenReader: false,
        subtitles: true,
      },
      
      // Localization
      localization: {
        language: 'en',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h', // 12h, 24h
        numberFormat: 'en-US',
      },
    };
  }

  /**
   * Load settings from storage
   */
  load() {
    try {
      const saved = localStorage.getItem(this.settingsKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.settings = this.deepMerge(this.getDefaultSettings(), parsed);
        console.log('[SettingsManager] Settings loaded');
      }
    } catch (e) {
      console.warn('[SettingsManager] Failed to load settings:', e);
    }
  }

  /**
   * Save settings to storage
   */
  save() {
    try {
      localStorage.setItem(this.settingsKey, JSON.stringify(this.settings));
      console.log('[SettingsManager] Settings saved');
    } catch (e) {
      console.warn('[SettingsManager] Failed to save settings:', e);
    }
  }

  /**
   * Deep merge objects
   */
  deepMerge(target, source) {
    const output = { ...target };
    
    Object.keys(source).forEach(key => {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        output[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        output[key] = source[key];
      }
    });
    
    return output;
  }

  /**
   * Get a setting value
   */
  get(category, key) {
    return this.settings[category]?.[key];
  }

  /**
   * Get all settings for a category
   */
  getCategory(category) {
    return this.settings[category];
  }

  /**
   * Set a setting value
   */
  set(category, key, value) {
    if (!this.settings[category]) {
      this.settings[category] = {};
    }
    
    const oldValue = this.settings[category][key];
    this.settings[category][key] = value;
    
    // Notify listeners
    this.notify(category, key, value, oldValue);
    
    // Apply setting immediately
    this.applySetting(category, key, value);
    
    // Save to storage
    this.save();
    
    return this;
  }

  /**
   * Set multiple settings at once
   */
  setMultiple(category, values) {
    Object.entries(values).forEach(([key, value]) => {
      this.set(category, key, value);
    });
    return this;
  }

  /**
   * Apply all settings
   */
  applySettings() {
    Object.keys(this.settings).forEach(category => {
      Object.keys(this.settings[category]).forEach(key => {
        this.applySetting(category, key, this.settings[category][key]);
      });
    });
  }

  /**
   * Apply a specific setting
   */
  applySetting(category, key, value) {
    // Emit event for other systems to handle
    eventBus.emit(EVENTS.SETTING_CHANGED, { category, key, value });
    
    // Handle specific settings
    switch (`${category}.${key}`) {
      case 'audio.muted':
        eventBus.emit(value ? EVENTS.AUDIO_MUTE : EVENTS.AUDIO_UNMUTE);
        break;
        
      case 'accessibility.colorblindMode':
        this.applyColorblindFilter(value);
        break;
        
      case 'accessibility.highContrast':
        this.applyHighContrast(value);
        break;
        
      case 'accessibility.largeFont':
        this.applyLargeFont(value);
        break;
    }
  }

  /**
   * Apply colorblind filter
   */
  applyColorblindFilter(mode) {
    const filters = {
      none: 'none',
      deuteranopia: 'url(#deuteranopia-filter)',
      protanopia: 'url(#protanopia-filter)',
      tritanopia: 'url(#tritanopia-filter)',
    };
    
    document.documentElement.style.filter = filters[mode] || 'none';
  }

  /**
   * Apply high contrast mode
   */
  applyHighContrast(enabled) {
    if (enabled) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }

  /**
   * Apply large font mode
   */
  applyLargeFont(enabled) {
    if (enabled) {
      document.documentElement.style.fontSize = '120%';
    } else {
      document.documentElement.style.fontSize = '100%';
    }
  }

  /**
   * Subscribe to setting changes
   */
  subscribe(category, key, callback) {
    const eventKey = `${category}.${key}`;
    if (!this.listeners.has(eventKey)) {
      this.listeners.set(eventKey, []);
    }
    this.listeners.get(eventKey).push(callback);
    
    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(eventKey);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify listeners of a change
   */
  notify(category, key, newValue, oldValue) {
    const eventKey = `${category}.${key}`;
    const listeners = this.listeners.get(eventKey);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(newValue, oldValue);
        } catch (e) {
          console.warn('[SettingsManager] Listener error:', e);
        }
      });
    }
  }

  /**
   * Reset settings to defaults
   */
  reset() {
    this.settings = this.getDefaultSettings();
    this.applySettings();
    this.save();
  }

  /**
   * Reset a category to defaults
   */
  resetCategory(category) {
    const defaults = this.getDefaultSettings();
    this.settings[category] = defaults[category];
    
    Object.keys(this.settings[category]).forEach(key => {
      this.applySetting(category, key, this.settings[category][key]);
    });
    
    this.save();
  }

  /**
   * Export settings
   */
  export() {
    return JSON.stringify(this.settings, null, 2);
  }

  /**
   * Import settings
   */
  import(json) {
    try {
      const parsed = JSON.parse(json);
      this.settings = this.deepMerge(this.getDefaultSettings(), parsed);
      this.applySettings();
      this.save();
      return true;
    } catch (e) {
      console.error('[SettingsManager] Import failed:', e);
      return false;
    }
  }

  /**
   * Get all settings for UI
   */
  getAllSettings() {
    return {
      graphics: {
        title: 'Graphics',
        icon: '🎨',
        settings: [
          { key: 'pixelPerfect', label: 'Pixel Perfect Rendering', type: 'toggle', default: true },
          { key: 'showFPS', label: 'Show FPS Counter', type: 'toggle', default: false },
          { key: 'particleEffects', label: 'Particle Effects', type: 'toggle', default: true },
          { key: 'screenShake', label: 'Screen Shake', type: 'toggle', default: true },
          { key: 'weatherEffects', label: 'Weather Effects', type: 'toggle', default: true },
          { key: 'reflections', label: 'Water Reflections', type: 'toggle', default: true },
          { key: 'animationQuality', label: 'Animation Quality', type: 'select', options: ['low', 'medium', 'high'], default: 'high' },
        ]
      },
      audio: {
        title: 'Audio',
        icon: '🔊',
        settings: [
          { key: 'masterVolume', label: 'Master Volume', type: 'slider', min: 0, max: 1, step: 0.1, default: 1.0 },
          { key: 'musicVolume', label: 'Music Volume', type: 'slider', min: 0, max: 1, step: 0.1, default: 0.5 },
          { key: 'sfxVolume', label: 'SFX Volume', type: 'slider', min: 0, max: 1, step: 0.1, default: 0.7 },
          { key: 'ambientVolume', label: 'Ambient Volume', type: 'slider', min: 0, max: 1, step: 0.1, default: 0.4 },
          { key: 'muted', label: 'Mute All', type: 'toggle', default: false },
        ]
      },
      controls: {
        title: 'Controls',
        icon: '🎮',
        settings: [
          { key: 'keyboardLayout', label: 'Keyboard Layout', type: 'select', options: ['qwerty', 'azerty', 'qwertz'], default: 'qwerty' },
          { key: 'mouseSensitivity', label: 'Mouse Sensitivity', type: 'slider', min: 0.1, max: 2, step: 0.1, default: 1.0 },
          { key: 'quickCast', label: 'Quick Cast Mode', type: 'toggle', default: false },
          { key: 'autoReel', label: 'Auto Reel Assist', type: 'toggle', default: false },
        ]
      },
      gameplay: {
        title: 'Gameplay',
        icon: '⚙️',
        settings: [
          { key: 'autoSave', label: 'Auto-Save', type: 'toggle', default: true },
          { key: 'autoSaveInterval', label: 'Auto-Save Interval', type: 'select', options: [30000, 60000, 120000, 300000], labels: ['30s', '1m', '2m', '5m'], default: 60000 },
          { key: 'showTutorials', label: 'Show Tutorials', type: 'toggle', default: true },
          { key: 'fishingHints', label: 'Fishing Hints', type: 'toggle', default: true },
          { key: 'pauseOnFocusLoss', label: 'Pause on Focus Loss', type: 'toggle', default: true },
        ]
      },
      accessibility: {
        title: 'Accessibility',
        icon: '♿',
        settings: [
          { key: 'colorblindMode', label: 'Colorblind Mode', type: 'select', options: ['none', 'deuteranopia', 'protanopia', 'tritanopia'], default: 'none' },
          { key: 'highContrast', label: 'High Contrast', type: 'toggle', default: false },
          { key: 'largeFont', label: 'Large Font', type: 'toggle', default: false },
          { key: 'reducedMotion', label: 'Reduced Motion', type: 'toggle', default: false },
          { key: 'subtitles', label: 'Subtitles', type: 'toggle', default: true },
        ]
      },
    };
  }
}

// Singleton instance
export const settingsManager = new SettingsManager();
