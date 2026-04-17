import Phaser from 'phaser';
import { eventBus } from '../core/EventBus.js';
import { gameState } from '../core/GameState.js';
import { EVENTS, GAME } from '../core/Constants.js';

/**
 * FarmScene - Farming gameplay scene
 * 
 * Features:
 * - Crop planting and harvesting
 * - Farm animals (chickens, cows)
 * - Barn and greenhouse buildings
 * - Day/night cycle effects
 */
export class FarmScene extends Phaser.Scene {
  constructor() {
    super({ key: 'FarmScene' });
  }

  create() {
    console.log('[FarmScene] Creating farm...');
    
    // Create farm background
    this.createBackground();
    
    // Create farm buildings
    this.createBuildings();
    
    // Create crops
    this.createCrops();
    
    // Create animals
    this.createAnimals();
    
    // Setup input
    this.setupInput();
    
    // Emit scene ready
    this.events.emit('sceneReady', this);
    console.log('[FarmScene] Farm creation complete');
  }

  createBackground() {
    // Farm ground
    const graphics = this.add.graphics();
    graphics.fillStyle(0x5a9a3c, 1); // Grass color
    graphics.fillRect(0, 0, GAME.WIDTH, GAME.HEIGHT);
    
    // Farm plots
    for (let x = 200; x < 800; x += 150) {
      for (let y = 200; y < 600; y += 150) {
        graphics.fillStyle(0x8B4513, 1); // Soil color
        graphics.fillRect(x, y, 100, 100);
      }
    }
  }

  createBuildings() {
    // Barn
    if (this.textures.exists('barn')) {
      this.add.image(150, 300, 'barn').setScale(2);
    }
    
    // Greenhouse
    if (this.textures.exists('greenhouse')) {
      this.add.image(900, 250, 'greenhouse').setScale(1.5);
    }
  }

  createCrops() {
    // Placeholder for crops system
    this.crops = [];
    console.log('[FarmScene] Crops system initialized');
  }

  createAnimals() {
    // Chickens
    for (let i = 0; i < 3; i++) {
      const x = 300 + Math.random() * 200;
      const y = 400 + Math.random() * 100;
      if (this.textures.exists('chicken')) {
        this.add.sprite(x, y, 'chicken').setScale(2);
      }
    }
    
    // Cows
    for (let i = 0; i < 2; i++) {
      const x = 600 + Math.random() * 150;
      const y = 350 + Math.random() * 100;
      if (this.textures.exists('cow')) {
        this.add.sprite(x, y, 'cow').setScale(2);
      }
    }
  }

  setupInput() {
    // ESC to return to fishing
    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.switch('FishingScene');
    });
    
    // F to return to fishing
    this.input.keyboard.on('keydown-F', () => {
      this.scene.switch('FishingScene');
    });
  }

  update() {
    // Farm update logic
  }
}

export default FarmScene;
