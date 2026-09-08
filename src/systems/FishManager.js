import Phaser from 'phaser';
import { FishShadowPool } from './ObjectPool.js';

/**
 * FishManager - moving fish shadows with lightweight culling and pooling.
 * Shadows are ambience, but they deliberately obey the full 1920px world bounds
 * so the player can read fish activity while scrolling between fishing spots.
 */
export class FishManager {
  constructor(scene, fishData) {
    this.scene = scene;
    this.fishData = fishData;
    this.maxShadows = 7;
    this.shadowPool = new FishShadowPool(scene);
    this.activeShadows = [];
    this.spatialGrid = new Map();
    this.gridSize = 80;
    this.camera = scene.cameras.main;
    this.cullPadding = 100;
    this.updateInterval = 2;
    this.frameCounter = 0;
    this.distanceUpdateThreshold = 320;
  }

  spawnFishShadows() {
    for (let i = 0; i < this.maxShadows; i++) this.spawnShadow();

    this.spawnTimer = this.scene.time.addEvent({
      delay: 3600,
      callback: () => {
        if (this.activeShadows.length < this.maxShadows) this.spawnShadow();
      },
      loop: true,
    });
  }

  spawnShadow() {
    const bounds = this.scene.waterBounds;
    if (!bounds) return null;

    const x = Phaser.Math.Between(bounds.left + 24, bounds.right - 24);
    const y = Phaser.Math.Between(bounds.top + 18, bounds.bottom - 22);
    const scene = this.scene;

    const sizes = [
      {
        size: 'small', weight: 50,
        texture: scene.textures.exists('fish_shadow_small') ? 'fish_shadow_small' : 'shadow_small',
        animKey: scene.anims.exists('fish_shadow_swim_small') ? 'fish_shadow_swim_small' : 'shadow_swim_small'
      },
      {
        size: 'medium', weight: 35,
        texture: scene.textures.exists('fish_shadow_medium') ? 'fish_shadow_medium' : 'shadow_medium',
        animKey: scene.anims.exists('fish_shadow_swim_medium') ? 'fish_shadow_swim_medium' : 'shadow_swim_medium'
      },
      {
        size: 'big', weight: 15,
        texture: scene.textures.exists('fish_shadow_big') ? 'fish_shadow_big' : 'shadow_big',
        animKey: scene.anims.exists('fish_shadow_swim_big') ? 'fish_shadow_swim_big' : 'shadow_swim_big'
      },
    ];
    const picked = this.weightedRandom(sizes);
    const shadow = this.shadowPool.acquire({ x, y, texture: picked.texture, size: picked.size });
    if (!shadow) return null;

    const scales = { small: 1.35, medium: 1.8, big: 2.2 };
    shadow.setScale(scales[picked.size] || 1.35);
    shadow.setAlpha(picked.size === 'big' ? 0.46 : 0.38);
    shadow.setTint(0x17395a);

    if (picked.animKey && scene.anims.exists(picked.animKey)) {
      shadow.play(picked.animKey);
    }

    shadow.fishData = {
      size: picked.size,
      speed: Phaser.Math.FloatBetween(0.28, 0.65),
      direction: Phaser.Math.FloatBetween(0, Math.PI * 2),
      changeDirTimer: 0,
      changeDirInterval: Phaser.Math.Between(1800, 4200),
      active: true,
      gridX: Math.floor(x / this.gridSize),
      gridY: Math.floor(y / this.gridSize),
      idleAlpha: picked.size === 'big' ? 0.46 : 0.38,
    };

    this.activeShadows.push(shadow);
    this.addToSpatialGrid(shadow);
    return shadow;
  }

  weightedRandom(items) {
    const total = items.reduce((sum, item) => sum + item.weight, 0);
    let roll = Math.random() * total;
    for (const item of items) {
      roll -= item.weight;
      if (roll <= 0) return item;
    }
    return items[items.length - 1];
  }

  addToSpatialGrid(shadow) {
    const { gridX, gridY } = shadow.fishData;
    const key = `${gridX},${gridY}`;
    if (!this.spatialGrid.has(key)) this.spatialGrid.set(key, new Set());
    this.spatialGrid.get(key).add(shadow);
  }

  removeFromSpatialGrid(shadow) {
    const key = `${shadow.fishData.gridX},${shadow.fishData.gridY}`;
    const cell = this.spatialGrid.get(key);
    if (!cell) return;
    cell.delete(shadow);
    if (cell.size === 0) this.spatialGrid.delete(key);
  }

  updateSpatialGrid(shadow) {
    const newGx = Math.floor(shadow.x / this.gridSize);
    const newGy = Math.floor(shadow.y / this.gridSize);
    if (newGx === shadow.fishData.gridX && newGy === shadow.fishData.gridY) return;

    this.removeFromSpatialGrid(shadow);
    shadow.fishData.gridX = newGx;
    shadow.fishData.gridY = newGy;
    this.addToSpatialGrid(shadow);
  }

  isInCameraView(shadow) {
    const bounds = this.camera.worldView;
    return shadow.x >= bounds.x - this.cullPadding &&
      shadow.x <= bounds.right + this.cullPadding &&
      shadow.y >= bounds.y - this.cullPadding &&
      shadow.y <= bounds.bottom + this.cullPadding;
  }

  getDistanceToPlayer(shadow) {
    if (!this.scene.player) return Infinity;
    return Phaser.Math.Distance.Between(shadow.x, shadow.y, this.scene.player.x, this.scene.player.y);
  }

  update(delta) {
    this.frameCounter++;
    const bounds = this.scene.waterBounds;
    const dt = delta / 1000;
    const bobber = this.scene.fishingSystem?.bobber;
    const fishingState = this.scene.fishingSystem?.state;

    for (let i = this.activeShadows.length - 1; i >= 0; i--) {
      const shadow = this.activeShadows[i];
      const fd = shadow.fishData;
      if (!fd?.active) continue;

      const visible = this.isInCameraView(shadow);
      shadow.setVisible(visible);
      const farAway = this.getDistanceToPlayer(shadow) > this.distanceUpdateThreshold;
      if (!visible || (farAway && this.frameCounter % this.updateInterval !== 0)) continue;

      fd.changeDirTimer += delta;
      if (fd.changeDirTimer >= fd.changeDirInterval) {
        fd.direction += Phaser.Math.FloatBetween(-0.85, 0.85);
        fd.changeDirTimer = 0;
        fd.changeDirInterval = Phaser.Math.Between(1800, 4200);
      }

      let speed = fd.speed * 15;
      if (bobber && (fishingState === 'waiting' || fishingState === 'bite')) {
        const dist = Phaser.Math.Distance.Between(shadow.x, shadow.y, bobber.x, bobber.y);
        if (dist < 72) {
          fd.direction = Phaser.Math.Angle.Between(shadow.x, shadow.y, bobber.x, bobber.y);
          speed *= dist < 34 ? 1.25 : 1.05;
          shadow.setAlpha(Math.min(0.78, fd.idleAlpha + 0.25));
        } else {
          shadow.setAlpha(fd.idleAlpha);
        }
      }

      shadow.x += Math.cos(fd.direction) * speed * dt;
      shadow.y += Math.sin(fd.direction) * speed * dt;
      shadow.setFlipX(Math.cos(fd.direction) < 0);

      if (shadow.x < bounds.left + 10 || shadow.x > bounds.right - 10) {
        shadow.x = Phaser.Math.Clamp(shadow.x, bounds.left + 10, bounds.right - 10);
        fd.direction = Math.PI - fd.direction;
      }
      if (shadow.y < bounds.top + 10 || shadow.y > bounds.bottom - 10) {
        shadow.y = Phaser.Math.Clamp(shadow.y, bounds.top + 10, bounds.bottom - 10);
        fd.direction = -fd.direction;
      }

      if (this.frameCounter % 5 === 0) this.updateSpatialGrid(shadow);
    }

    if (this.activeShadows.length < this.maxShadows && this.frameCounter % 60 === 0) {
      this.spawnShadow();
    }
  }

  removeShadow(index) {
    const shadow = this.activeShadows[index];
    if (!shadow) return;
    this.removeFromSpatialGrid(shadow);
    this.shadowPool.release(shadow);
    this.activeShadows.splice(index, 1);
  }

  findNearbyShadows(x, y, radius = 50) {
    const nearby = [];
    const gridRadius = Math.ceil(radius / this.gridSize);
    const gx = Math.floor(x / this.gridSize);
    const gy = Math.floor(y / this.gridSize);

    for (let dx = -gridRadius; dx <= gridRadius; dx++) {
      for (let dy = -gridRadius; dy <= gridRadius; dy++) {
        const cell = this.spatialGrid.get(`${gx + dx},${gy + dy}`);
        if (!cell) continue;
        cell.forEach(shadow => {
          if (Phaser.Math.Distance.Between(x, y, shadow.x, shadow.y) <= radius) nearby.push(shadow);
        });
      }
    }
    return nearby;
  }

  checkCollision(x, y, threshold = 20) {
    return this.findNearbyShadows(x, y, threshold)
      .find(shadow => Phaser.Math.Distance.Between(x, y, shadow.x, shadow.y) < threshold) || null;
  }

  destroy() {
    this.spawnTimer?.remove();
    this.activeShadows.forEach(shadow => this.shadowPool.release(shadow));
    this.activeShadows = [];
    this.spatialGrid.clear();
    this.shadowPool.releaseAll();
  }
}
