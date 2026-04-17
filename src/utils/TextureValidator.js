/**
 * TextureValidator - Centralized texture validation utilities
 * 
 * Eliminates duplicate texture validation code across:
 * - NPC.js
 * - Player.js
 * - BootScene.js
 */

export class TextureValidator {
  constructor(scene) {
    this.scene = scene;
  }

  /**
   * Check if a texture exists and is valid
   * @param {string} key - Texture key
   * @returns {boolean} - True if texture exists and has valid source
   */
  isValid(key) {
    if (!this.scene.textures.exists(key)) {
      return false;
    }

    const texture = this.scene.textures.get(key);
    if (!texture || texture.frameTotal === 0) {
      return false;
    }

    const source = texture.getSourceImage();
    return source && source.width > 0 && source.height > 0;
  }

  /**
   * Get the best available texture from a list of candidates
   * @param {string[]} keys - Array of texture keys in priority order
   * @returns {string|null} - First valid texture key or null
   */
  getBestAvailable(keys) {
    for (const key of keys) {
      if (this.isValid(key)) {
        return key;
      }
    }
    return null;
  }

  /**
   * Validate idle vs walk texture preference
   * @param {string} type - Clothing type (pants, shirt, hair)
   * @param {string} variant - Style/color variant
   * @returns {Object} - { key: string, isIdle: boolean }
   */
  getClothingTexture(type, variant) {
    const idleKey = `idle_${type}_${variant}`;
    const walkKey = `walk_${type}_${variant}`;

    // Prefer idle if available
    if (this.isValid(idleKey)) {
      return { key: idleKey, isIdle: true };
    }

    // Fall back to walk
    if (this.isValid(walkKey)) {
      return { key: walkKey, isIdle: false };
    }

    return { key: null, isIdle: false };
  }

  /**
   * Get frame count for a texture
   * @param {string} key - Texture key
   * @returns {number} - Frame count or 0 if invalid
   */
  getFrameCount(key) {
    if (!this.isValid(key)) {
      return 0;
    }
    return this.scene.textures.get(key).frameTotal;
  }
}

export default TextureValidator;
