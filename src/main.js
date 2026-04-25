// Service Worker: Development mode - clear old caches
// Production: Use proper versioning strategy
const isDev = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
if (isDev && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(reg => {
      reg.unregister();
      console.log('[SW] Unregistered:', reg.scope);
    });
  });
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => caches.delete(name));
    });
  }
}

import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { FishingScene } from './scenes/FishingScene.js';
import { UIScene } from './scenes/UIScene.js';
import { FarmScene } from './scenes/FarmScene.js';
import { DiveScene } from './scenes/DiveScene.js';
import { MineScene } from './scenes/MineScene.js';
import { GAME } from './core/Constants.js';
import { ErrorBoundary } from './core/ErrorBoundary.js';

/**
 * Tidefall - Optimized Phaser 3 Pixel Art Fishing RPG
 * 
 * Optimizations applied:
 * - Round pixels for crisp pixel art
 * - Disabled antialiasing
 * - Optimized physics step
 * - Automatic GC on tab hidden
 */

// Phaser game configuration with optimizations
const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GAME.WIDTH,
  height: GAME.HEIGHT,
  // zoom removed — FIT mode handles scaling
  pixelArt: true,
  backgroundColor: GAME.BACKGROUND_COLOR,
  roundPixels: true, // Critical for pixel art
  antialias: false,
  
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
      fps: 60,
      timeScale: 1,
      // Optimize physics for pixel art
      overlapBias: 4,
      tileBias: 4,
      maxEntries: 16
    }
  },
  
  render: {
    pixelArt: true,
    roundPixels: true,
    antialias: false,
    // Batch draw calls
    batchSize: 4096
  },
  
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    // Prevent pixel bleeding
    autoRound: true
  },
  
  // Scene order: Boot first, then game scenes
  scene: [BootScene, FishingScene, UIScene, FarmScene, DiveScene, MineScene]
};

// Create game instance
const game = new Phaser.Game(config);

// Hide loading text once game is created
const loadingDiv = document.getElementById('loading');
if (loadingDiv) loadingDiv.style.display = 'none';

// Expose for debugging
window.__game = game;

// Initialize error boundary
const errorBoundary = new ErrorBoundary(game);
window.__errorBoundary = errorBoundary;

// Handle tab visibility (pause when hidden, resume when visible)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Pause all scenes
    game.scene.scenes.forEach((scene) => {
      if (scene.scene.isActive()) {
        scene.scene.pause();
      }
    });
    
    // Request garbage collection if available
    if (window.gc) {
      window.gc();
    }
    
    console.log('[Game] Paused - tab hidden');
  } else {
    // Resume all paused scenes
    game.scene.scenes.forEach((scene) => {
      if (scene.scene.isPaused()) {
        scene.scene.resume();
      }
    });
    console.log('[Game] Resumed - tab visible');
  }
});

// Performance monitoring (optional)
if (window.performance && performance.mark) {
  performance.mark('game-created');
  
  // Log FPS every 10 seconds in development
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    setInterval(() => {
      const fps = game.loop.actualFps.toFixed(1);
      const target = game.loop.targetFps;
      const delta = Math.abs(target - fps);
      
      if (fps < target - 10) {
        console.warn(`[Performance] FPS: ${fps}/${target} - Performance degraded`);
      }
    }, 10000);
  }
}

// Expose game for debugging/testing
window.__game = game;

// Register Service Worker for offline play
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('[SW] Registered:', registration.scope);
      })
      .catch((error) => {
        console.log('[SW] Registration failed:', error);
      });
  });
}

// Phaser FIT mode handles all responsive scaling automatically

// Error handling
window.addEventListener('error', (e) => {
  console.error('[Game] Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('[Game] Unhandled promise rejection:', e.reason);
});
