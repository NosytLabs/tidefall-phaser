import Phaser from 'phaser';
import { eventBus } from '../core/EventBus.js';
import { EVENTS, GAME } from '../core/Constants.js';

/**
 * PerformanceMonitor - Tracks FPS, memory, and game performance metrics
 * 
 * Features:
 * - FPS counter with rolling average
 * - Memory usage tracking (if available)
 * - Draw call monitoring
 * - Debug overlay toggle
 */
export class PerformanceMonitor {
  constructor(scene) {
    this.scene = scene;
    this.enabled = false;
    this.debugOverlay = null;
    
    // FPS tracking
    this.fpsHistory = [];
    this.maxFpsHistory = 60;
    this.lastTime = 0;
    this.frameCount = 0;
    this.fpsUpdateInterval = 500; // Update FPS display every 500ms
    this.lastFpsUpdate = 0;
    
    // Performance metrics
    this.metrics = {
      fps: 60,
      avgFps: 60,
      minFps: 60,
      maxFps: 60,
      drawCalls: 0,
      objectCount: 0,
      memory: 0,
      physicsTime: 0,
      updateTime: 0
    };
    
    this.setupDebugToggle();
  }
  
  setupDebugToggle() {
    // Toggle debug with backtick key
    this.scene.input.keyboard.on('keydown-BACKTICK', () => {
      this.toggle();
    });
    
    // Listen for debug toggle event
    eventBus.on(EVENTS.DEBUG_TOGGLE, () => this.toggle());
  }
  
  toggle() {
    this.enabled = !this.enabled;

    if (this.enabled) {
      this.createDebugOverlay();
    } else {
      this.destroyDebugOverlay();
    }

    // Enable/disable Phaser physics debug (with safety check)
    if (this.scene.physics?.world?.debugGraphic) {
      this.scene.physics.world.debugGraphic.visible = this.enabled;
    }

    console.log(`[PerformanceMonitor] Debug mode ${this.enabled ? 'enabled' : 'disabled'}`);
  }
  
  createDebugOverlay() {
    if (this.debugOverlay) return;
    
    const w = GAME.WIDTH;
    
    // Background panel
    this.debugBg = this.scene.add.rectangle(5, 5, 140, 80, 0x000000, 0.8)
      .setOrigin(0, 0)
      .setDepth(999)
      .setScrollFactor(0);
    
    // Debug text
    this.debugText = this.scene.add.text(8, 8, '', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#00ff00',
      lineSpacing: 2
    }).setDepth(1000).setScrollFactor(0);
    
    // FPS graph
    this.fpsGraph = this.scene.add.graphics().setDepth(1000).setScrollFactor(0);
    
    this.debugOverlay = {
      bg: this.debugBg,
      text: this.debugText,
      graph: this.fpsGraph
    };
  }
  
  destroyDebugOverlay() {
    if (!this.debugOverlay) return;
    
    this.debugOverlay.bg.destroy();
    this.debugOverlay.text.destroy();
    this.debugOverlay.graph.destroy();
    this.debugOverlay = null;
  }
  
  update(time, delta) {
    if (!this.enabled) return;
    
    // Calculate FPS
    this.frameCount++;
    const elapsed = time - this.lastFpsUpdate;
    
    if (elapsed >= this.fpsUpdateInterval) {
      this.metrics.fps = Math.round((this.frameCount * 1000) / elapsed);
      this.frameCount = 0;
      this.lastFpsUpdate = time;
      
      // Update history
      this.fpsHistory.push(this.metrics.fps);
      if (this.fpsHistory.length > this.maxFpsHistory) {
        this.fpsHistory.shift();
      }
      
      // Calculate averages
      this.metrics.avgFps = Math.round(
        this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length
      );
      this.metrics.minFps = Math.min(...this.fpsHistory);
      this.metrics.maxFps = Math.max(...this.fpsHistory);
      
      // Get memory info if available
      if (performance.memory) {
        this.metrics.memory = Math.round(performance.memory.usedJSHeapSize / 1048576);
      }
      
      // Count game objects
      this.metrics.objectCount = this.scene.children.length;
      
      // Update display
      this.updateDebugDisplay();
      this.drawFpsGraph();
    }
  }
  
  updateDebugDisplay() {
    if (!this.debugOverlay) return;
    
    const lines = [
      `FPS: ${this.metrics.fps} (avg:${this.metrics.avgFps})`,
      `Range: ${this.metrics.minFps}-${this.metrics.maxFps}`,
      `Objects: ${this.metrics.objectCount}`,
      `Memory: ${this.metrics.memory}MB`,
      '',
      '` : toggle debug'
    ];
    
    this.debugOverlay.text.setText(lines.join('\n'));
  }
  
  drawFpsGraph() {
    if (!this.debugOverlay || this.fpsHistory.length < 2) return;
    
    const graph = this.debugOverlay.graph;
    const x = 8;
    const y = 65;
    const width = 134;
    const height = 18;
    
    graph.clear();
    
    // Draw background
    graph.fillStyle(0x000000, 0.5);
    graph.fillRect(x, y, width, height);
    
    // Draw FPS line
    const barWidth = width / this.maxFpsHistory;
    
    this.fpsHistory.forEach((fps, i) => {
      const barHeight = Math.min((fps / 60) * height, height);
      const barX = x + (i * barWidth);
      const barY = y + (height - barHeight);
      
      // Color based on FPS
      let color = 0x00ff00; // Green (good)
      if (fps < 30) color = 0xff0000; // Red (bad)
      else if (fps < 50) color = 0xffff00; // Yellow (warning)
      
      graph.fillStyle(color, 0.8);
      graph.fillRect(barX, barY, barWidth - 0.5, barHeight);
    });
    
    // Draw 60fps target line
    graph.lineStyle(1, 0xffffff, 0.3);
    graph.lineBetween(x, y, x + width, y);
  }
  
  /**
   * Log current performance metrics to console
   */
  logPerformance() {
    console.log('[Performance]', this.getReport());
  }

  /**
   * Get current performance report
   */
  getReport() {
    return { ...this.metrics };
  }
  
  /**
   * Check if performance is degraded
   */
  isPerformanceDegraded() {
    return this.metrics.avgFps < 30 || this.metrics.memory > 200;
  }
  
  /**
   * Destroy and cleanup
   */
  destroy() {
    this.destroyDebugOverlay();
    eventBus.off(EVENTS.DEBUG_TOGGLE);
  }
}

/**
 * SpritePool - Efficient sprite recycling for particle effects and temporary objects
 */
export class SpritePool {
  constructor(scene, config) {
    this.scene = scene;
    this.config = {
      maxSize: 50,
      texture: null,
      frame: null,
      ...config
    };
    
    this.pool = [];
    this.active = new Set();
    
    // Pre-populate pool
    this.populate();
  }
  
  populate() {
    for (let i = 0; i < this.config.maxSize; i++) {
      const sprite = this.scene.add.sprite(0, 0, this.config.texture, this.config.frame);
      sprite.setActive(false);
      sprite.setVisible(false);
      this.pool.push(sprite);
    }
  }
  
  acquire(x, y, config = {}) {
    let sprite = this.pool.find(s => !s.active);
    
    if (!sprite && this.pool.length < this.config.maxSize * 2) {
      sprite = this.scene.add.sprite(0, 0, this.config.texture, this.config.frame);
      this.pool.push(sprite);
    }
    
    if (sprite) {
      sprite.setPosition(x, y);
      sprite.setActive(true);
      sprite.setVisible(true);
      sprite.setAlpha(config.alpha ?? 1);
      sprite.setScale(config.scale ?? 1);
      sprite.setTint(config.tint ?? 0xffffff);
      sprite.setDepth(config.depth ?? 0);
      
      this.active.add(sprite);
      
      // Auto-release after lifetime
      if (config.lifetime) {
        this.scene.time.delayedCall(config.lifetime, () => this.release(sprite));
      }
    }
    
    return sprite;
  }
  
  release(sprite) {
    if (!sprite || !this.active.has(sprite)) return;
    
    sprite.setActive(false);
    sprite.setVisible(false);
    this.active.delete(sprite);
  }
  
  releaseAll() {
    Array.from(this.active).forEach(s => this.release(s));
  }
  
  getActiveCount() {
    return this.active.size;
  }
  
  destroy() {
    this.releaseAll();
    this.pool.forEach(s => s.destroy());
    this.pool = [];
  }
}

/**
 * ObjectCulling - Optimizes rendering by hiding off-screen objects
 */
export class ObjectCulling {
  constructor(scene, padding = 100) {
    this.scene = scene;
    this.padding = padding;
    this.cullList = new Set();
    this.camera = scene.cameras.main;
    
    // Update culling every few frames
    this.updateInterval = 3;
    this.frameCounter = 0;
  }
  
  add(object) {
    this.cullList.add(object);
    // Store original visibility state
    object._originalVisible = object.visible;
  }
  
  remove(object) {
    this.cullList.delete(object);
    // Restore visibility
    if (object._originalVisible !== undefined) {
      object.setVisible(object._originalVisible);
    }
  }
  
  update() {
    this.frameCounter++;
    if (this.frameCounter % this.updateInterval !== 0) return;
    
    const bounds = this.camera.worldView;
    const paddedBounds = new Phaser.Geom.Rectangle(
      bounds.x - this.padding,
      bounds.y - this.padding,
      bounds.width + (this.padding * 2),
      bounds.height + (this.padding * 2)
    );
    
    this.cullList.forEach(object => {
      if (!object.active) return;
      
      const inBounds = Phaser.Geom.Rectangle.ContainsPoint(
        paddedBounds, 
        { x: object.x, y: object.y }
      );
      
      object.setVisible(inBounds && object._originalVisible);
    });
  }
  
  clear() {
    this.cullList.forEach(object => {
      if (object._originalVisible !== undefined) {
        object.setVisible(object._originalVisible);
        delete object._originalVisible;
      }
    });
    this.cullList.clear();
  }
}
