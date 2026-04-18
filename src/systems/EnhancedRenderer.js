import Phaser from 'phaser';
import { DEPTH, COLORS } from '../core/Constants.js';

/**
 * EnhancedRenderer - Advanced visual rendering system
 * 
 * Features:
 * - Multi-layer parallax backgrounds
 * - Dynamic lighting system
 * - Weather particle effects
 * - Water shader effects
 * - Ambient occlusion
 */
export class EnhancedRenderer {
  constructor(scene) {
    this.scene = scene;
    this.layers = new Map();
    this.effects = new Map();
  }

  /**
   * Create enhanced sky with gradient and atmosphere
   */
  createAtmosphericSky(width, height) {
    // Create gradient texture
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Beautiful sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, '#4a90d9');    // Deep blue
    gradient.addColorStop(0.3, '#87ceeb');   // Sky blue
    gradient.addColorStop(0.6, '#b8e6f0');  // Light blue
    gradient.addColorStop(1, '#e8f4f8');    // Near white
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1, 512);
    
    this.scene.textures.addCanvas('atmospheric_sky', canvas);
    
    // Add sky sprite
    const sky = this.scene.add.tileSprite(0, 0, width, height, 'atmospheric_sky')
      .setOrigin(0, 0)
      .setDepth(DEPTH.BACKGROUND)
      .setScrollFactor(0);
    
    return sky;
  }

  /**
   * Create parallax mountain layers
   */
  createParallaxMountains(width, yPosition) {
    const layers = [];
    
    // Far mountains (slowest)
    const farMountains = this.scene.add.graphics().setDepth(DEPTH.BACKGROUND + 1);
    this.drawMountainLayer(farMountains, width, yPosition, 0x2d5016, 0.3, 0.4);
    layers.push({ sprite: farMountains, speed: 0.1 });
    
    // Mid mountains
    const midMountains = this.scene.add.graphics().setDepth(DEPTH.BACKGROUND + 2);
    this.drawMountainLayer(midMountains, width, yPosition, 0x3d6b1f, 0.5, 0.6);
    layers.push({ sprite: midMountains, speed: 0.2 });
    
    // Near mountains (fastest)
    const nearMountains = this.scene.add.graphics().setDepth(DEPTH.BACKGROUND + 3);
    this.drawMountainLayer(nearMountains, width, yPosition, 0x4a7c23, 0.7, 0.8);
    layers.push({ sprite: nearMountains, speed: 0.3 });
    
    return layers;
  }

  drawMountainLayer(graphics, width, yBase, color, heightScale, alpha) {
    graphics.fillStyle(color, alpha);
    graphics.beginPath();
    graphics.moveTo(0, yBase);
    
    // Generate mountain peaks
    for (let x = 0; x <= width; x += 50) {
      const peakHeight = 30 + Math.random() * 60 * heightScale;
      const y = yBase - peakHeight;
      graphics.lineTo(x, y);
    }
    
    graphics.lineTo(width, yBase);
    graphics.lineTo(0, yBase);
    graphics.closePath();
    graphics.fillPath();
  }

  /**
   * Create dynamic water with waves
   */
  createDynamicWater(x, y, width, height) {
    const water = this.scene.add.graphics().setDepth(DEPTH.WATER_SURFACE);
    
    // Wave animation data
    const waves = [];
    for (let i = 0; i < 5; i++) {
      waves.push({
        offset: i * 20,
        speed: 0.5 + Math.random() * 0.5,
        amplitude: 3 + Math.random() * 3
      });
    }
    
    // Animate water
    this.scene.events.on('update', () => {
      water.clear();
      
      // Base water color
      water.fillStyle(0x55a4f7, 0.9);
      water.fillRect(x, y, width, height);
      
      // Wave highlights
      const time = this.scene.time.now / 1000;
      waves.forEach((wave, i) => {
        water.fillStyle(0x87ceeb, 0.3);
        const waveY = y + wave.offset + Math.sin(time * wave.speed + i) * wave.amplitude;
        water.fillRect(x, waveY, width, 2);
      });
    });
    
    return water;
  }

  /**
   * Create particle system for atmosphere
   */
  createAtmosphereParticles(count, bounds) {
    const particles = [];
    
    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Between(bounds.left, bounds.right);
      const y = Phaser.Math.Between(bounds.top, bounds.bottom);
      
      const particle = this.scene.add.circle(x, y, 1, 0xffffff, 0.3)
        .setDepth(DEPTH.PARTICLES);
      
      particles.push({
        sprite: particle,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        baseAlpha: 0.2 + Math.random() * 0.3
      });
    }
    
    // Animate particles
    this.scene.events.on('update', () => {
      particles.forEach(p => {
        p.sprite.x += p.vx;
        p.sprite.y += p.vy;
        
        // Wrap around bounds
        if (p.sprite.x < bounds.left) p.sprite.x = bounds.right;
        if (p.sprite.x > bounds.right) p.sprite.x = bounds.left;
        if (p.sprite.y < bounds.top) p.sprite.y = bounds.bottom;
        if (p.sprite.y > bounds.bottom) p.sprite.y = bounds.top;
        
        // Twinkle effect
        p.sprite.alpha = p.baseAlpha + Math.sin(this.scene.time.now / 500) * 0.1;
      });
    });
    
    return particles;
  }

  /**
   * Create enhanced lighting overlay
   */
  createLightingSystem(width, height) {
    // Day/night overlay
    const overlay = this.scene.add.rectangle(
      width / 2, height / 2, width, height,
      0x000020, 0
    ).setDepth(DEPTH.UI_FOREGROUND + 100).setScrollFactor(0);
    
    overlay.setBlendMode(Phaser.BlendModes.MULTIPLY);
    
    return {
      overlay,
      setTimeOfDay: (hour) => {
        // hour: 0-24
        let alpha = 0;
        if (hour < 6 || hour > 20) {
          alpha = 0.6; // Night
        } else if (hour < 8 || hour > 18) {
          alpha = 0.3; // Dawn/Dusk
        }
        overlay.setAlpha(alpha);
      }
    };
  }

  /**
   * Create weather effects
   */
  createWeatherEffect(type, intensity = 1) {
    switch (type) {
      case 'rain':
        return this.createRain(intensity);
      case 'snow':
        return this.createSnow(intensity);
      case 'fog':
        return this.createFog(intensity);
      default:
        return null;
    }
  }

  createRain(intensity) {
    const drops = [];
    const count = 100 * intensity;
    const bounds = this.scene.cameras.main.getBounds();
    
    for (let i = 0; i < count; i++) {
      const drop = this.scene.add.line(
        Phaser.Math.Between(bounds.x, bounds.x + bounds.width),
        Phaser.Math.Between(bounds.y, bounds.y + bounds.height),
        0, 0, 0, 8,
        0x87ceeb, 0.4
      ).setDepth(DEPTH.PARTICLES + 10);
      
      drops.push({
        sprite: drop,
        speed: 8 + Math.random() * 4,
        resetY: bounds.y - 10
      });
    }
    
    this.scene.events.on('update', () => {
      drops.forEach(drop => {
        drop.sprite.y += drop.speed;
        if (drop.sprite.y > bounds.y + bounds.height) {
          drop.sprite.y = drop.resetY;
          drop.sprite.x = Phaser.Math.Between(bounds.x, bounds.x + bounds.width);
        }
      });
    });
    
    return drops;
  }

  createSnow(intensity) {
    const flakes = [];
    const count = 50 * intensity;
    const bounds = this.scene.cameras.main.getBounds();
    
    for (let i = 0; i < count; i++) {
      const flake = this.scene.add.circle(
        Phaser.Math.Between(bounds.x, bounds.x + bounds.width),
        Phaser.Math.Between(bounds.y, bounds.y + bounds.height),
        2,
        0xffffff, 0.6
      ).setDepth(DEPTH.PARTICLES + 10);
      
      flakes.push({
        sprite: flake,
        vx: (Math.random() - 0.5) * 1,
        vy: 1 + Math.random() * 2,
        resetY: bounds.y - 10
      });
    }
    
    this.scene.events.on('update', () => {
      flakes.forEach(flake => {
        flake.sprite.x += flake.vx;
        flake.sprite.y += flake.vy;
        
        if (flake.sprite.y > bounds.y + bounds.height) {
          flake.sprite.y = flake.resetY;
          flake.sprite.x = Phaser.Math.Between(bounds.x, bounds.x + bounds.width);
        }
      });
    });
    
    return flakes;
  }

  createFog(intensity) {
    const bounds = this.scene.cameras.main.getBounds();
    
    const fog = this.scene.add.rectangle(
      bounds.x + bounds.width / 2,
      bounds.y + bounds.height / 2,
      bounds.width,
      bounds.height,
      0xffffff,
      0.3 * intensity
    ).setDepth(DEPTH.PARTICLES + 20);
    
    return fog;
  }
}
