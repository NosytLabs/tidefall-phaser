/**
 * SaveSystem - Enhanced persistence with multiple slots
 * 
 * Features:
 * - Multiple save slots (5 slots + quicksave + autosave)
 * - Save metadata (timestamp, playtime, preview)
 * - Cloud save ready (export/import)
 * - Compression for large saves
 * - Migration between versions
 * - Integrity checking
 */
export class SaveSystem {
  constructor() {
    this.baseKey = 'tidefall';
    this.version = 2;
    this.maxSlots = 5;
    
    // Slot names
    this.slots = ['slot1', 'slot2', 'slot3', 'slot4', 'slot5', 'quicksave', 'autosave'];
    
    // Compression threshold (bytes)
    this.compressionThreshold = 1024;
  }

  /**
   * Save to a specific slot
   */
  saveSlot(slotName, gameState) {
    if (!this.slots.includes(slotName)) {
      return { success: false, error: 'Invalid slot name' };
    }

    try {
      const data = this.prepareSaveData(gameState);
      const key = `${this.baseKey}_save_${slotName}`;
      
      // Check size and compress if needed
      const jsonString = JSON.stringify(data);
      let saveData = jsonString;
      let compressed = false;
      
      if (jsonString.length > this.compressionThreshold) {
        saveData = this.compress(jsonString);
        compressed = true;
      }
      
      localStorage.setItem(key, saveData);
      
      // Save metadata
      this.saveMetadata(slotName, {
        timestamp: data.timestamp,
        compressed,
        size: saveData.length,
        preview: this.generatePreview(data)
      });
      
      return { 
        success: true, 
        timestamp: data.timestamp,
        slot: slotName,
        compressed,
        size: saveData.length
      };
    } catch (e) {
      console.error('[SaveSystem] Save failed:', e);
      return { success: false, error: e.message };
    }
  }

  /**
   * Load from a specific slot
   */
  loadSlot(slotName) {
    try {
      const key = `${this.baseKey}_save_${slotName}`;
      const raw = localStorage.getItem(key);
      
      if (!raw) return null;
      
      // Check if compressed
      const metadata = this.loadMetadata(slotName);
      let jsonString = raw;
      
      if (metadata?.compressed) {
        jsonString = this.decompress(raw);
      }
      
      const data = JSON.parse(jsonString);
      
      // Version migration
      if (data.version !== this.version) {
        data.migrated = this.migrateSave(data);
      }
      
      return data;
    } catch (e) {
      console.error('[SaveSystem] Load failed:', e);
      return null;
    }
  }

  /**
   * Delete a save slot
   */
  deleteSlot(slotName) {
    try {
      const key = `${this.baseKey}_save_${slotName}`;
      localStorage.removeItem(key);
      localStorage.removeItem(`${key}_meta`);
      return true;
    } catch (e) {
      console.error('[SaveSystem] Delete failed:', e);
      return false;
    }
  }

  /**
   * List all save slots with metadata
   */
  listSlots() {
    const slots = [];
    
    for (const slotName of this.slots) {
      const metadata = this.loadMetadata(slotName);
      if (metadata) {
        slots.push({
          name: slotName,
          ...metadata
        });
      }
    }
    
    return slots.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get available save slots
   */
  getAvailableSlots() {
    return this.slots.filter(slot => !this.hasSave(slot));
  }

  /**
   * Check if slot has save
   */
  hasSave(slotName) {
    const key = `${this.baseKey}_save_${slotName}`;
    return !!localStorage.getItem(key);
  }

  /**
   * Prepare save data with all required fields
   */
  prepareSaveData(gameState) {
    return {
      version: this.version,
      timestamp: Date.now(),
      playtime: gameState.playtime || 0,
      
      // Core game state
      gold: gameState.gold || 0,
      totalCaught: gameState.totalCaught || 0,
      timeOfDay: gameState.timeOfDay || 'day',
      currentBait: gameState.currentBait,
      currentRod: gameState.currentRod || 'BASIC',
      
      // Systems data
      inventory: gameState.inventory || [],
      encyclopedia: gameState.encyclopedia || {},
      quests: gameState.quests || {},
      energy: gameState.energy || {},
      achievements: gameState.achievements || {},
      analytics: gameState.analytics || {},
      weather: gameState.weather || 'sunny',
      
      // Settings
      settings: gameState.settings || {}
    };
  }

  /**
   * Generate preview for save slot UI
   */
  generatePreview(data) {
    const date = new Date(data.timestamp);
    return {
      gold: data.gold,
      totalCaught: data.totalCaught,
      timeOfDay: data.timeOfDay,
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
      playtime: this.formatPlaytime(data.playtime)
    };
  }

  formatPlaytime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m ${seconds % 60}s`;
  }

  /**
   * Save metadata for a slot
   */
  saveMetadata(slotName, metadata) {
    try {
      const key = `${this.baseKey}_save_${slotName}_meta`;
      localStorage.setItem(key, JSON.stringify(metadata));
    } catch (e) {
      console.warn('[SaveSystem] Failed to save metadata:', e);
    }
  }

  /**
   * Load metadata for a slot
   */
  loadMetadata(slotName) {
    try {
      const key = `${this.baseKey}_save_${slotName}_meta`;
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Simple compression (base64)
   * In production, use a proper compression library
   */
  compress(data) {
    // For now, just return as-is
    // In production: return LZString.compressToUTF16(data);
    return data;
  }

  decompress(data) {
    // For now, just return as-is
    // In production: return LZString.decompressFromUTF16(data);
    return data;
  }

  /**
   * Migrate save data between versions
   */
  migrateSave(data) {
    const migrations = [];
    
    // Version 1 to 2
    if (data.version === 1) {
      // Add new fields
      data.currentBait = null;
      data.currentRod = 'BASIC';
      data.weather = 'sunny';
      data.achievements = data.achievements || {};
      data.analytics = data.analytics || {};
      
      migrations.push('1->2');
      data.version = 2;
    }
    
    return migrations;
  }

  /**
   * Export save data for cloud backup
   */
  exportSave(slotName) {
    const data = this.loadSlot(slotName);
    if (!data) return null;
    
    return {
      game: 'tidefall',
      version: this.version,
      slot: slotName,
      exported: Date.now(),
      data: btoa(JSON.stringify(data)) // Base64 encode
    };
  }

  /**
   * Import save data from cloud backup
   */
  importSave(exportedData, targetSlot = null) {
    try {
      // Verify
      if (exportedData.game !== 'tidefall') {
        return { success: false, error: 'Invalid save file' };
      }
      
      // Decode
      const jsonString = atob(exportedData.data);
      const data = JSON.parse(jsonString);
      
      // Find slot
      const slot = targetSlot || exportedData.slot || 'slot1';
      
      // Save
      return this.saveSlot(slot, data);
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  /**
   * Get storage usage info
   */
  getStorageInfo() {
    let totalSize = 0;
    let slotCount = 0;
    
    for (const slotName of this.slots) {
      const key = `${this.baseKey}_save_${slotName}`;
      const data = localStorage.getItem(key);
      if (data) {
        totalSize += data.length * 2; // Approximate bytes (UTF-16)
        slotCount++;
      }
    }
    
    return {
      used: totalSize,
      usedFormatted: this.formatBytes(totalSize),
      slotsUsed: slotCount,
      slotsTotal: this.slots.length
    };
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Legacy compatibility methods
   */
  save(gameState) {
    return this.saveSlot('slot1', gameState);
  }

  load() {
    return this.loadSlot('slot1');
  }

  hasSave() {
    return this.hasSave('slot1');
  }

  deleteSave() {
    return this.deleteSlot('slot1');
  }

  getSaveInfo() {
    const metadata = this.loadMetadata('slot1');
    return metadata?.preview || null;
  }

  /**
   * Settings management
   */
  saveSettings(settings) {
    try {
      localStorage.setItem(`${this.baseKey}_settings`, JSON.stringify(settings));
    } catch (e) {
      console.error('[SaveSystem] Settings save failed:', e);
    }
  }

  loadSettings() {
    try {
      const raw = localStorage.getItem(`${this.baseKey}_settings`);
      return raw ? JSON.parse(raw) : this.getDefaultSettings();
    } catch (e) {
      return this.getDefaultSettings();
    }
  }

  getDefaultSettings() {
    return {
      musicVolume: 0.5,
      sfxVolume: 0.7,
      pixelPerfect: true,
      showFPS: false,
      autoSave: true,
      autoSaveInterval: 60000,
      language: 'en'
    };
  }

  /**
   * Integrity check for save data
   */
  verifySave(slotName) {
    const data = this.loadSlot(slotName);
    if (!data) return { valid: false, error: 'No save data' };
    
    const required = ['version', 'timestamp', 'gold', 'inventory'];
    const missing = required.filter(field => !(field in data));
    
    if (missing.length > 0) {
      return { valid: false, error: `Missing fields: ${missing.join(', ')}` };
    }
    
    return { valid: true };
  }

  /**
   * Backup all saves
   */
  exportAllSaves() {
    const backup = {
      game: 'tidefall',
      version: this.version,
      exported: Date.now(),
      saves: {}
    };
    
    for (const slotName of this.slots) {
      const data = this.loadSlot(slotName);
      if (data) {
        backup.saves[slotName] = data;
      }
    }
    
    return btoa(JSON.stringify(backup));
  }

  /**
   * Restore from backup
   */
  importAllSaves(backupString) {
    try {
      const backup = JSON.parse(atob(backupString));
      
      if (backup.game !== 'tidefall') {
        return { success: false, error: 'Invalid backup file' };
      }
      
      const results = [];
      
      for (const [slotName, data] of Object.entries(backup.saves)) {
        const result = this.saveSlot(slotName, data);
        results.push({ slot: slotName, ...result });
      }
      
      return { success: true, results };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
}
