import Phaser from 'phaser';
import { FishShadowPool } from './ObjectPool.js';

/**
 * FishManager - Optimized fish shadow management with object pooling
 * 
 * Optimizations:
 * - Object pooling for fish shadows (reduces GC pressure)
 * - Spatial culling (only update shadows near camera)
 * - Efficient collision detection (quadtree-like grid)
 * - Batch updates
 */
export class FishManager {
  /**
   * @param {Phaser.Scene} scene - The scene this manager belongs to
   * @param {Object} fishData - Fish data from JSON
   */
  constructor(scene, fishData) {
    this.scene = scene;
    this.fishData = fishData;
    this.maxShadows = 6;
    
    // Use object pool for efficient shadow recycling
    this.shadowPool = new FishShadowPool(scene);
    this.activeShadows = [];
    
    // Spatial grid for efficient culling
    this.spatialGrid = new Map();
    this.gridSize = 80;
    
    // Culling state
    this.camera = scene.cameras.main;
    this.cullPadding = 100;
    
    // Optimization: Batch updates every N frames
    this.updateInterval = 2;
    this.frameCounter = 0;
    
    // Optimization: Skip frames when shadows are far from player
    this.distanceUpdateThreshold = 300;
  }

  /**
   * Initialize fish shadows in the water
   */
  spawnFishShadows() {
    // Spawn initial shadows from pool
    for (let i = 0; i < this.maxShadows; i++) {
      this.spawnShadow();
    }
    
    // Respawn timer with staggered delays
    this.spawnTimer = this.scene.time.addEvent({
      delay: 4000,
      callback: () => { 
        if (this.activeShadows.length < this.maxShadows) {
          this.spawnShadow();
        }
      },
      loop: true,
    });
  }

  /**
   * Spawn a single shadow from the pool
   */
  spawnShadow() {
    const bounds = this.scene.waterBounds;
    if (!bounds) {
      console.warn('[FishManager] waterBounds not set, skipping shadow spawn');
      return null;
    }
    const x = Phaser.Math.Between(bounds.left + 20, bounds.right - 20);
    const y = Phaser.Math.Between(bounds.top + 20, bounds.bottom - 20);

    const sizes = [
      { size: 'small', weight: 50, texture: 'shadow_small' },
      { size: 'medium', weight: 35, texture: 'shadow_medium' },
      { size: 'big', weight: 15, texture: 'shadow_big' },
    ];
    const picked = this.weightedRandom(sizes);

    // Acquire shadow from pool
    const shadow = this.shadowPool.acquire({
      x, y,
      texture: picked.texture,
      size: picked.size
    });

    if (!shadow) return; // Pool exhausted

    // Configure shadow properties
    const scales = { small: 1.5, medium: 2, big: 2.5 };
    shadow.setScale(scales[picked.size] || 1.5);
    shadow.setAlpha(0.5);
    shadow.setTint(0x1a2a4a);

    // Start swim animation
    shadow.play(`shadow_swim_${picked.size}`);

    // Fish movement data
    shadow.fishData = {
      size: picked.size,
      speed: Phaser.Math.FloatBetween(0.2, 0.6),
      direction: Phaser.Math.FloatBetween(0, Math.PI * 2),
      changeDirTimer: 0,
      changeDirInterval: Phaser.Math.Between(2000, 5000),
      active: true,
      gridX: Math.floor(x / this.gridSize),
      gridY: Math.floor(y / this.gridSize)
    };

    // Add to active list
    this.activeShadows.push(shadow);
    this.addToSpatialGrid(shadow);
  }

  /**
   * Weighted random selection
   * @private
   */
  weightedRandom(items) {
    const total = items.reduce((sum, i) => sum + i.weight, 0);
    let r = Math.random() * total;
    for (const item of items) {
      r -= item.weight;
      if (r <= 0) return item;
    }
    return items[0];
  }

  /**
   * Add shadow to spatial grid for efficient queries
   * @private
   */
  addToSpatialGrid(shadow) {
    const gx = shadow.fishData.gridX;
    const gy = shadow.fishData.gridY;
    const key = `${gx},${gy}`;
    
    if (!this.spatialGrid.has(key)) {
      this.spatialGrid.set(key, new Set());
    }
    this.spatialGrid.get(key).add(shadow);
  }

  /**
   * Remove shadow from spatial grid
   * @private
   */
  removeFromSpatialGrid(shadow) {
    const gx = shadow.fishData.gridX;
    const gy = shadow.fishData.gridY;
    const key = `${gx},${gy}`;
    
    const cell = this.spatialGrid.get(key);
    if (cell) {
      cell.delete(shadow);
      if (cell.size === 0) {
        this.spatialGrid.delete(key);
      }
    }
  }

  /**
   * Update shadow grid position
   * @private
   */
  updateSpatialGrid(shadow) {
    const newGx = Math.floor(shadow.x / this.gridSize);
    const newGy = Math.floor(shadow.y / this.gridSize);
    
    if (newGx !== shadow.fishData.gridX || newGy !== shadow.fishData.gridY) {
      this.removeFromSpatialGrid(shadow);
      shadow.fishData.gridX = newGx;
      shadow.fishData.gridY = newGy;
      this.addToSpatialGrid(shadow);
    }
  }

  /**
   * Check if shadow is within camera view
   * @private
   */
  isInCameraView(shadow) {
    const bounds = this.camera.worldView;
    return shadow.x >= bounds.x - this.cullPadding &&
           shadow.x <= bounds.right + this.cullPadding &&
           shadow.y >= bounds.y - this.cullPadding &&
           shadow.y <= bounds.bottom + this.cullPadding;
  }

  /**
   * Get distance to player for LOD
   * @private
   */
  getDistanceToPlayer(shadow) {
    if (!this.scene.player) return Infinity;
    return Phaser.Math.Distance.Between(
      shadow.x, shadow.y, 
      this.scene.player.x, this.scene.player.y
    );
  }

  /**
   * Main update loop with culling and optimizations
   * @param {number} delta - Time since last frame in ms
   */
  update(delta) {
    this.frameCounter++;
    
    const bounds = this.scene.waterBounds;
    const dt = delta / 1000;
    const bobber = this.scene.fishingSystem?.bobber;
    const fishingState = this.scene.fishingSystem?.state;

    // Process shadows
    for (let i = this.activeShadows.length - 1; i >= 0; i--) {
      const shadow = this.activeShadows[i];
      const fd = shadow.fishData;
      
      // Skip inactive shadows
      if (!fd.active) continue;
      
      // Culling: Skip off-screen shadows
      const isVisible = this.isInCameraView(shadow);
      shadow.setVisible(isVisible);
      
      // Distance culling: Skip updates for distant shadows every other frame
      const distanceToPlayer = this.getDistanceToPlayer(shadow);
      const shouldSkipUpdate = !isVisible || 
        (distanceToPlayer > this.distanceUpdateThreshold && this.frameCounter % 2 !== 0);
      
      if (shouldSkipUpdate) continue;

      // Update direction timer
      fd.changeDirTimer += delta;
      if (fd.changeDirTimer >= fd.changeDirInterval) {
        fd.direction += Phaser.Math.FloatBetween(-1, 1);
        fd.changeDirTimer = 0;
        fd.changeDirInterval = Phaser.Math.Between(2000, 5000);
      }

      // Move shadow
      const speed = fd.speed * 15;
      const newX = shadow.x + Math.cos(fd.direction) * speed * dt;
      const newY = shadow.y + Math.sin(fd.direction) * speed * dt;
      
      shadow.x = newX;
      shadow.y = newY;

      // Flip based on direction
      shadow.setFlipX(Math.cos(fd.direction) < 0);

      // Bounce off bounds
      if (shadow.x < bounds.left + 10) { 
        shadow.x = bounds.left + 10; 
        fd.direction = Math.PI - fd.direction; 
      }
      if (shadow.x > bounds.right - 10) { 
        shadow.x = bounds.right - 10; 
        fd.direction = Math.PI - fd.direction; 
      }
      if (shadow.y < bounds.top + 10) { 
        shadow.y = bounds.top + 10; 
        fd.direction = -fd.direction; 
      }
      if (shadow.y > bounds.bottom - 10) { 
        shadow.y = bounds.bottom - 10; 
        fd.direction = -fd.direction; 
      }

      // Attract to bobber (only check every few frames)
      if (bobber && fishingState === 'waiting' && this.frameCounter % 3 === 0) {
        const dist = Phaser.Math.Distance.Between(shadow.x, shadow.y, bobber.x, bobber.y);
        if (dist < 60) {
          fd.direction = Phaser.Math.Angle.Between(shadow.x, shadow.y, bobber.x, bobber.y);
          fd.speed = 1.0;
          shadow.setAlpha(0.8);
        } else {
          fd.speed = Phaser.Math.FloatBetween(0.2, 0.6);
          shadow.setAlpha(0.5);
        }
      }

      // Update spatial grid
      if (this.frameCounter % 5 === 0) {
        this.updateSpatialGrid(shadow);
      }

      // Remove if way off-screen
      if (shadow.x < -50 || shadow.x > this.scene.scale.width + 50 ||
          shadow.y < -50 || shadow.y > this.scene.scale.height + 50) {
        this.removeShadow(i);
      }
    }

    // Replenish shadows if needed
    if (this.activeShadows.length < this.maxShadows && this.frameCounter % 60 === 0) {
      this.spawnShadow();
    }
  }

  /**
   * Remove a shadow and return it to the pool
   * @private
   */
  removeShadow(index) {
    const shadow = this.activeShadows[index];
    this.removeFromSpatialGrid(shadow);
    this.shadowPool.release(shadow);
    this.activeShadows.splice(index, 1);
  }

  /**
   * Find nearby shadows using spatial grid (efficient collision detection)
   * @param {number} x - X position to check
   * @param {number} y - Y position to check
   * @param {number} radius - Search radius
   * @returns {Array} Array of nearby shadows
   */
  findNearbyShadows(x, y, radius = 50) {
    const nearby = [];
    const gridRadius = Math.ceil(radius / this.gridSize);
    const gx = Math.floor(x / this.gridSize);
    const gy = Math.floor(y / this.gridSize);

    // Check surrounding grid cells
    for (let dx = -gridRadius; dx <= gridRadius; dx++) {
      for (let dy = -gridRadius; dy <= gridRadius; dy++) {
        const key = `${gx + dx},${gy + dy}`;
        const cell = this.spatialGrid.get(key);
        if (cell) {
          cell.forEach(shadow => {
            const dist = Phaser.Math.Distance.Between(x, y, shadow.x, shadow.y);
            if (dist <= radius) {
              nearby.push(shadow);
            }
          });
        }
      }
    }

    return nearby;
  }

  /**
   * Check collision between point and any shadow
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} threshold - Collision distance
   * @returns {Object|null} Collided shadow or null
   */
  checkCollision(x, y, threshold = 20) {
    const nearby = this.findNearbyShadows(x, y, threshold);
    
    for (const shadow of nearby) {
      const dist = Phaser.Math.Distance.Between(x, y, shadow.x, shadow.y);
      if (dist < threshold) {
        return shadow;
      }
    }
    
    return null;
  }

  /**
   * Destroy and cleanup all resources
   */
  destroy() {
    if (this.spawnTimer) {
      this.spawnTimer.remove();
    }
    
    // Return all shadows to pool
    this.activeShadows.forEach(shadow => {
      this.shadowPool.release(shadow);
    });
    this.activeShadows = [];
    this.spatialGrid.clear();
    
    this.shadowPool.releaseAll();
  }
}
