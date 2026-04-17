/**
 * PerformanceMonitor - Track game performance metrics
 * 
 * Features:
 * - FPS monitoring with rolling average
 * - Frame time tracking
 * - Memory usage monitoring (if available)
 * - Performance warnings when FPS drops
 * - Automatic quality adjustment suggestions
 */

export class PerformanceMonitor {
  constructor(scene) {
    this.scene = scene;
    
    // FPS tracking
    this.fpsHistory = [];
    this.maxHistorySize = 60; // 1 second at 60fps
    this.lastFrameTime = 0;
    this.frameTimeHistory = [];
    
    // Warnings
    this.lowFpsThreshold = 30;
    this.highFrameTimeThreshold = 33.33; // 30fps = 33.33ms per frame
    this.warningCooldown = 5000; // ms between warnings
    this.lastWarningTime = 0;
    
    // Quality adjustment
    this.qualityLevel = 'high'; // high, medium, low
    this.autoAdjust = true;
    this.consecutiveLowFps = 0;
    this.lowFpsThreshold = 3; // consecutive seconds before adjusting
    
    // Debug display
    this.debugText = null;
    this.showDebug = false;
  }
  
  /**
   * Start monitoring
   */
  start() {
    this.scene.events.on('update', this.update, this);
    
    // Create debug text if enabled
    if (this.showDebug) {
      this.createDebugDisplay();
    }
  }
  
  /**
   * Stop monitoring
   */
  stop() {
    this.scene.events.off('update', this.update, this);
    if (this.debugText) {
      this.debugText.destroy();
      this.debugText = null;
    }
  }
  
  /**
   * Update performance metrics
   */
  update(time, delta) {
    // Calculate FPS
    const fps = 1000 / delta;
    this.fpsHistory.push(fps);
    
    // Keep history at max size
    if (this.fpsHistory.length > this.maxHistorySize) {
      this.fpsHistory.shift();
    }
    
    // Track frame time
    this.frameTimeHistory.push(delta);
    if (this.frameTimeHistory.length > this.maxHistorySize) {
      this.frameTimeHistory.shift();
    }
    
    // Check for performance issues
    this.checkPerformance(time);
    
    // Update debug display
    if (this.showDebug && this.debugText) {
      this.updateDebugDisplay();
    }
  }
  
  /**
   * Check for performance issues and warn/adjust
   */
  checkPerformance(currentTime) {
    const avgFps = this.getAverageFps();
    const avgFrameTime = this.getAverageFrameTime();
    
    // Low FPS warning
    if (avgFps < this.lowFpsThreshold) {
      this.consecutiveLowFps++;
      
      // Warn if cooldown has passed
      if (currentTime - this.lastWarningTime > this.warningCooldown) {
        console.warn(`[PerformanceMonitor] Low FPS detected: ${avgFps.toFixed(1)} FPS`);
        this.lastWarningTime = currentTime;
      }
      
      // Auto-adjust quality if consistently low
      if (this.autoAdjust && this.consecutiveLowFps >= this.lowFpsThreshold) {
        this.adjustQuality('down');
        this.consecutiveLowFps = 0;
      }
    } else {
      this.consecutiveLowFps = Math.max(0, this.consecutiveLowFps - 1);
    }
    
    // High frame time warning
    if (avgFrameTime > this.highFrameTimeThreshold) {
      if (currentTime - this.lastWarningTime > this.warningCooldown) {
        console.warn(`[PerformanceMonitor] High frame time: ${avgFrameTime.toFixed(2)}ms`);
        this.lastWarningTime = currentTime;
      }
    }
  }
  
  /**
   * Get average FPS over the history window
   */
  getAverageFps() {
    if (this.fpsHistory.length === 0) return 60;
    const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
    return sum / this.fpsHistory.length;
  }
  
  /**
   * Get average frame time over the history window
   */
  getAverageFrameTime() {
    if (this.frameTimeHistory.length === 0) return 16.67;
    const sum = this.frameTimeHistory.reduce((a, b) => a + b, 0);
    return sum / this.frameTimeHistory.length;
  }
  
  /**
   * Get minimum FPS in history
   */
  getMinFps() {
    if (this.fpsHistory.length === 0) return 60;
    return Math.min(...this.fpsHistory);
  }
  
  /**
   * Get maximum FPS in history
   */
  getMaxFps() {
    if (this.fpsHistory.length === 0) return 60;
    return Math.max(...this.fpsHistory);
  }
  
  /**
   * Adjust quality level
   */
  adjustQuality(direction) {
    const levels = ['low', 'medium', 'high'];
    const currentIndex = levels.indexOf(this.qualityLevel);
    
    if (direction === 'down' && currentIndex > 0) {
      this.qualityLevel = levels[currentIndex - 1];
      console.log(`[PerformanceMonitor] Quality adjusted to: ${this.qualityLevel}`);
      this.applyQualitySettings();
    } else if (direction === 'up' && currentIndex < levels.length - 1) {
      this.qualityLevel = levels[currentIndex + 1];
      console.log(`[PerformanceMonitor] Quality adjusted to: ${this.qualityLevel}`);
      this.applyQualitySettings();
    }
  }
  
  /**
   * Apply quality settings based on level
   */
  applyQualitySettings() {
    const game = this.scene.game;
    
    switch (this.qualityLevel) {
      case 'low':
        // Reduce particle effects
        game.config.particleCount = 50;
        // Disable shadows
        game.config.shadows = false;
        // Reduce animation quality
        game.config.antialias = false;
        break;
        
      case 'medium':
        game.config.particleCount = 100;
        game.config.shadows = true;
        game.config.antialias = false;
        break;
        
      case 'high':
        game.config.particleCount = 200;
        game.config.shadows = true;
        game.config.antialias = true;
        break;
    }
    
    // Emit event for other systems to adjust
    this.scene.events.emit('qualityChanged', this.qualityLevel);
  }
  
  /**
   * Create debug display
   */
  createDebugDisplay() {
    this.debugText = this.scene.add.text(10, 10, '', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#00ff00',
      backgroundColor: '#00000088'
    });
    this.debugText.setScrollFactor(0);
    this.debugText.setDepth(1000);
  }
  
  /**
   * Update debug display
   */
  updateDebugDisplay() {
    const avgFps = this.getAverageFps();
    const avgFrameTime = this.getAverageFrameTime();
    const minFps = this.getMinFps();
    
    this.debugText.setText([
      `FPS: ${avgFps.toFixed(1)} (min: ${minFps.toFixed(1)})`,
      `Frame: ${avgFrameTime.toFixed(2)}ms`,
      `Quality: ${this.qualityLevel}`,
      `Sprites: ${this.scene.children?.list?.length || 0}`
    ]);
  }
  
  /**
   * Toggle debug display
   */
  toggleDebug() {
    this.showDebug = !this.showDebug;
    
    if (this.showDebug && !this.debugText) {
      this.createDebugDisplay();
    } else if (!this.showDebug && this.debugText) {
      this.debugText.destroy();
      this.debugText = null;
    }
  }
  
  /**
   * Get performance report
   */
  getReport() {
    return {
      fps: {
        current: this.fpsHistory[this.fpsHistory.length - 1] || 60,
        average: this.getAverageFps(),
        min: this.getMinFps(),
        max: this.getMaxFps()
      },
      frameTime: {
        average: this.getAverageFrameTime()
      },
      quality: this.qualityLevel,
      spriteCount: this.scene.children?.list?.length || 0
    };
  }
}

export default PerformanceMonitor;
