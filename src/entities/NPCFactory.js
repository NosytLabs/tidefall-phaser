import Phaser from 'phaser';
import { NPC } from './NPC.js';

/**
 * NPCFactory - Factory pattern for reliable NPC creation
 * 
 * Ensures all required textures exist before creating NPCs.
 * Falls back to safe defaults if specific assets missing.
 */
export class NPCFactory {
  constructor(scene) {
    this.scene = scene;
    this.fallbackSkin = 'light';
    this.fallbackHair = { style: 'short_hair', color: 'brown_light' };
    this.fallbackClothes = { shirt: 'blue_light', pants: 'brown' };
  }

  /**
   * Check if texture exists and has frames
   */
  hasValidTexture(key) {
    if (!this.scene.textures.exists(key)) return false;
    const tex = this.scene.textures.get(key);
    return tex && tex.frameTotal > 0;
  }

  /**
   * Get safe skin tone that has loaded textures
   */
  getSafeSkinTone(preferred) {
    const tones = [preferred, this.fallbackSkin, 'brown', 'dark'];
    for (const tone of tones) {
      if (this.hasValidTexture(`idle_body_${tone}`) || this.hasValidTexture(`walk_body_${tone}`)) {
        return tone;
      }
    }
    return this.fallbackSkin;
  }

  /**
   * Get safe clothing color that has loaded textures
   */
  getSafeClothing(type, preferred) {
    const fallback = type === 'shirt' ? this.fallbackClothes.shirt : this.fallbackClothes.pants;
    const options = [preferred, fallback, 'white', 'black'];
    
    for (const color of options) {
      if (this.hasValidTexture(`idle_${type}_${color}`) || this.hasValidTexture(`walk_${type}_${color}`)) {
        return color;
      }
    }
    return fallback;
  }

  /**
   * Get safe hair combination
   */
  getSafeHair(style, color) {
    const fallback = this.fallbackHair;
    const combinations = [
      { style, color },
      fallback,
      { style: 'short_hair', color: 'black' }
    ];
    
    for (const combo of combinations) {
      const key = `${combo.style}_${combo.color}`;
      if (this.hasValidTexture(`idle_hair_${key}`) || this.hasValidTexture(`walk_hair_${key}`)) {
        return combo;
      }
    }
    return fallback;
  }

  /**
   * Create NPC with guaranteed valid assets
   */
  create(x, y, config) {
    // Determine safe appearance from name hash
    const h = this.hash(config.name);
    
    // Get safe skin tone
    const skinTones = ['brown', 'dark', 'light'];
    const preferredSkin = skinTones[h % skinTones.length];
    const safeSkin = this.getSafeSkinTone(preferredSkin);
    
    // Get safe clothing
    const shirtColors = ['black', 'blue_dark', 'blue_light', 'brown', 'green_dark', 'green_light', 'orange', 'pink', 'red', 'white', 'yellow'];
    const pantsColors = ['black', 'blue_dark', 'blue_light', 'brown', 'green_light', 'orange', 'pink', 'red', 'white', 'yellow'];
    const preferredShirt = shirtColors[(h >> 8) % shirtColors.length];
    const preferredPants = pantsColors[(h >> 12) % pantsColors.length];
    
    const safeShirt = this.getSafeClothing('shirt', preferredShirt);
    const safePants = this.getSafeClothing('pants', preferredPants);
    
    // Get safe hair
    const hairStyles = ['short_hair', 'long_hair', 'pony_tail', 'spikey', 'big_bun', 'small_hair'];
    const hairColors = ['black', 'blonde', 'blue', 'brown_dark', 'brown_light', 'green', 'pink', 'purple', 'red', 'white'];
    const preferredStyle = hairStyles[(h >> 2) % hairStyles.length];
    const preferredColor = hairColors[(h >> 4) % hairColors.length];
    const safeHair = this.getSafeHair(preferredStyle, preferredColor);
    
    // Override config with safe values
    const safeConfig = {
      ...config,
      _safeSkin: safeSkin,
      _safeShirt: safeShirt,
      _safePants: safePants,
      _safeHairStyle: safeHair.style,
      _safeHairColor: safeHair.color
    };
    
    return new NPC(this.scene, x, y, safeConfig);
  }

  hash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) - h + str.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
  }
}
