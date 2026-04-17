import Phaser from 'phaser';

/**
 * ObjectPool - Generic object pooling system for Phaser
 * 
 * Benefits:
 * - Reduces garbage collection pressure
 * - Eliminates create/destroy overhead
 * - Maintains steady object count
 */
export class ObjectPool {
  /**
   * @param {Phaser.Scene} scene - The scene this pool belongs to
   * @param {Object} config - Pool configuration
   * @param {number} config.maxSize - Maximum pool size
   * @param {Function} config.create - Factory function to create objects
   * @param {Function} config.reset - Function to reset objects when acquired
   * @param {Function} config.onRelease - Function called when object is released
   */
  constructor(scene, config) {
    this.scene = scene;
    this.config = {
      maxSize: 10,
      create: () => null,
      reset: (obj) => {},
      onRelease: (obj) => {},
      ...config
    };

    this.pool = [];
    this.active = new Set();
    this.totalCreated = 0;

    // Pre-populate pool
    this.prePopulate();
  }

  /**
   * Pre-populate the pool with inactive objects
   */
  prePopulate() {
    for (let i = 0; i < this.config.maxSize; i++) {
      const obj = this.config.create();
      if (obj) {
        obj.setActive(false);
        obj.setVisible(false);
        obj._poolId = this.totalCreated++;
        this.pool.push(obj);
      }
    }
  }

  /**
   * Acquire an object from the pool
   * @param {Object} data - Data to pass to reset function
   * @returns {Object|null} Acquired object or null if pool exhausted
   */
  acquire(data = {}) {
    // Find inactive object
    let obj = this.pool.find(o => !o.active);
    
    if (!obj) {
      // Pool exhausted - create new if under max expansion limit
      if (this.pool.length < this.config.maxSize * 1.5) {
        obj = this.config.create();
        if (obj) {
          obj._poolId = this.totalCreated++;
          this.pool.push(obj);
        }
      } else {
        // Steal oldest active object (emergency overflow)
        const oldest = Array.from(this.active)[0];
        if (oldest) {
          this.release(oldest);
          obj = oldest;
        }
      }
    }

    if (obj) {
      obj.setActive(true);
      obj.setVisible(true);
      this.active.add(obj);
      this.config.reset(obj, data);
    }

    return obj;
  }

  /**
   * Release an object back to the pool
   * @param {Object} obj - Object to release
   */
  release(obj) {
    if (!obj || !this.active.has(obj)) return;
    
    obj.setActive(false);
    obj.setVisible(false);
    this.active.delete(obj);
    
    // Call release handler
    if (this.config.onRelease) {
      this.config.onRelease(obj);
    }
    
    // Call object reset if available
    if (obj.reset) {
      obj.reset();
    }
  }

  /**
   * Release all active objects
   */
  releaseAll() {
    Array.from(this.active).forEach(obj => this.release(obj));
  }

  /**
   * Get all currently active objects
   * @returns {Array} Array of active objects
   */
  getActive() {
    return Array.from(this.active);
  }

  /**
   * Get pool statistics
   * @returns {Object} Pool stats
   */
  getStats() {
    return {
      total: this.pool.length,
      active: this.active.size,
      available: this.pool.length - this.active.size,
      created: this.totalCreated
    };
  }

  /**
   * Update all active objects
   * @param {number} delta - Time since last frame
   */
  update(delta) {
    this.getActive().forEach(obj => {
      if (obj.update) {
        obj.update(delta);
      }
    });
  }

  /**
   * Destroy the pool and all its objects
   */
  destroy() {
    this.releaseAll();
    this.pool.forEach(obj => {
      if (obj.destroy) {
        obj.destroy();
      }
    });
    this.pool = [];
    this.active.clear();
  }
}

/**
 * FishShadowPool - Specialized pool for fish shadows
 */
export class FishShadowPool extends ObjectPool {
  constructor(scene) {
    super(scene, {
      maxSize: 12,
      create: () => {
        const shadow = scene.add.sprite(0, 0, 'shadow_small');
        shadow.setScale(0.5);
        shadow.setDepth(2);
        shadow.setAlpha(0.6);
        return shadow;
      },
      reset: (shadow, data) => {
        shadow.setPosition(data.x, data.y);
        if (data.texture && scene.textures.exists(data.texture)) {
          shadow.setTexture(data.texture);
        }
        shadow.clearTint();
        shadow.setAlpha(0.5);
        shadow.setVisible(true);
        
        // Play animation if available
        const size = data.size || 'small';
        const animKey = `shadow_swim_${size}`;
        if (scene.anims.exists(animKey)) {
          shadow.play(animKey);
        }
      },
      onRelease: (shadow) => {
        shadow.stop();
        shadow.clearTint();
      }
    });
  }
}

/**
 * ParticlePool - For splash effects and particles
 */
export class ParticlePool extends ObjectPool {
  constructor(scene, maxSize = 30) {
    super(scene, {
      maxSize,
      create: () => {
        const p = scene.add.rectangle(0, 0, 2, 2, 0xffffff);
        p.setDepth(5);
        return p;
      },
      reset: (p, data) => {
        p.setPosition(data.x, data.y);
        p.setFillStyle(data.color || 0xffffff);
        p.setAlpha(data.alpha || 1);
        p.setScale(data.scale || 1);
        
        // Store velocity for updates
        p.velX = data.velX || 0;
        p.velY = data.velY || 0;
        p.life = data.lifetime || 300;
        p.maxLife = p.life;
      },
      onRelease: (p) => {
        p.setAlpha(0);
      }
    });
    
    // Set up update loop for particles
    scene.events.on('update', (time, delta) => {
      this.getActive().forEach(p => {
        p.life -= delta;
        if (p.life <= 0) {
          this.release(p);
          return;
        }
        
        // Move particle
        p.x += p.velX * delta * 0.001;
        p.y += p.velY * delta * 0.001;
        
        // Fade out
        const lifeRatio = p.life / p.maxLife;
        p.setAlpha(lifeRatio);
        p.setScale(lifeRatio);
      });
    });
  }
}

/**
 * SpritePool - Generic sprite pool for temporary visual effects
 */
export class SpritePool extends ObjectPool {
  constructor(scene, texture, maxSize = 20) {
    super(scene, {
      maxSize,
      create: () => {
        const sprite = scene.add.sprite(0, 0, texture);
        return sprite;
      },
      reset: (sprite, data) => {
        sprite.setPosition(data.x, data.y);
        sprite.setTexture(data.texture || texture);
        sprite.setFrame(data.frame || 0);
        sprite.setScale(data.scale || 1);
        sprite.setAlpha(data.alpha || 1);
        sprite.setTint(data.tint || 0xffffff);
        sprite.setDepth(data.depth || 0);
        sprite.setRotation(data.rotation || 0);
        sprite.setFlipX(data.flipX || false);
        sprite.setFlipY(data.flipY || false);
        
        // Auto-release after lifetime
        if (data.lifetime) {
          scene.time.delayedCall(data.lifetime, () => {
            this.release(sprite);
          });
        }
      }
    });
  }
}
