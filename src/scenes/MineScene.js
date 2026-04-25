import Phaser from 'phaser';
import { eventBus } from '../core/EventBus.js';
import { gameState } from '../core/GameState.js';
import { EVENTS, GAME } from '../core/Constants.js';

/**
 * MineScene - Mining gameplay scene
 * 
 * Features:
 * - Cave exploration
 * - Ore mining
 * - Tool upgrades
 * - Light management
 * - Hazards and dangers
 */
export class MineScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MineScene' });
    
    this.miner = null;
    this.lightRadius = 150;
    this.ores = [];
    this.hazards = [];
  }

  create() {
    console.log('[MineScene] Creating mine...');
    
    // Create cave environment
    this.createCaveEnvironment();
    
    // Create miner
    this.createMiner();
    
    // Create ore deposits
    this.createOres();
    
    // Create hazards
    this.createHazards();
    
    // Setup UI
    this.createUI();
    
    // Setup input
    this.setupInput();
    
    // Emit scene ready
    this.events.emit('sceneReady', this);
    console.log('[MineScene] Mine creation complete');
  }

  createCaveEnvironment() {
    // Dark cave background
    const graphics = this.add.graphics();
    graphics.fillStyle(0x1a1a1a, 1);
    graphics.fillRect(0, 0, GAME.WIDTH, GAME.HEIGHT);
    
    // Cave walls (procedural)
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * GAME.WIDTH;
      const y = Math.random() * GAME.HEIGHT;
      const size = 30 + Math.random() * 50;
      
      graphics.fillStyle(0x333333, 1);
      graphics.fillCircle(x, y, size);
    }
    
    // Support beams
    for (let x = 100; x < GAME.WIDTH; x += 300) {
      graphics.fillStyle(0x4a3728, 1);
      graphics.fillRect(x, 0, 20, GAME.HEIGHT);
    }
    
    // Darkness overlay (will be masked by light)
    this.darkness = this.add.rectangle(
      GAME.WIDTH / 2, GAME.HEIGHT / 2,
      GAME.WIDTH, GAME.HEIGHT,
      0x000000, 0.7
    );
  }

  createMiner() {
    // Create miner sprite
    this.miner = this.add.sprite(100, GAME.HEIGHT / 2, 'idle_body_light');
    this.miner.setScale(2);
    
    // Miner physics
    this.physics.add.existing(this.miner);
    this.miner.body.setCollideWorldBounds(true);
    this.miner.body.setDrag(200);

    // Persistent lighting graphics (C1 fix: don't recreate every frame)
    this.miningGraphics = this.add.graphics().setDepth(100);
  }

  createOres() {
    // Create ore deposits
    const oreTypes = [
      { color: 0xC0C0C0, value: 10, name: 'Silver' },
      { color: 0xFFD700, value: 25, name: 'Gold' },
      { color: 0xB87333, value: 5, name: 'Copper' },
      { color: 0xFF0000, value: 50, name: 'Ruby' },
      { color: 0x00FF00, value: 40, name: 'Emerald' }
    ];
    
    for (let i = 0; i < 20; i++) {
      const type = oreTypes[Math.floor(Math.random() * oreTypes.length)];
      const x = 200 + Math.random() * (GAME.WIDTH - 400);
      const y = 100 + Math.random() * (GAME.HEIGHT - 200);
      
      const ore = this.add.circle(x, y, 15, type.color);
      
      this.ores.push({
        sprite: ore,
        type: type,
        mined: false
      });
    }
  }

  createHazards() {
    // Create falling rocks hazard
    this.time.addEvent({
      delay: 3000,
      callback: () => {
        this.spawnFallingRock();
      },
      callbackScope: this,
      loop: true
    });
  }

  spawnFallingRock() {
    const x = 200 + Math.random() * (GAME.WIDTH - 400);
    const rock = this.add.circle(x, -20, 20, 0x666666);
    
    this.physics.add.existing(rock);
    rock.body.setVelocityY(200);
    
    // Remove rock after it falls
    this.time.delayedCall(3000, () => {
      rock.destroy();
    });
  }

  createUI() {
    // Light radius indicator
    this.lightText = this.add.text(20, 20, 'Light: 100%', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#ffff00'
    });
    
    // Instructions
    this.add.text(20, GAME.HEIGHT - 50, 'WASD: Move | SPACE: Mine | M: Exit Mine', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#ffffff'
    });
  }

  setupInput() {
    // Movement
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });
    
    // Mine ore
    this.input.keyboard.on('keydown-SPACE', () => {
      this.tryMineOre();
    });
    
    // Exit mine
    this.input.keyboard.on('keydown-M', () => {
      this.scene.switch('FishingScene');
    });
    
    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.switch('FishingScene');
    });
  }

  tryMineOre() {
    const minerX = this.miner.x;
    const minerY = this.miner.y;
    
    this.ores.forEach(ore => {
      if (!ore.mined) {
        const dist = Phaser.Math.Distance.Between(
          minerX, minerY,
          ore.sprite.x, ore.sprite.y
        );
        
        if (dist < 60) {
          ore.mined = true;
          ore.sprite.setVisible(false);
          
          // Add value to game state
          gameState.game.gold += ore.type.value;
          
          // Show notification
          eventBus.emit(EVENTS.UI_SHOW_MESSAGE, `Mined ${ore.type.name}! +${ore.type.value} gold`);
        }
      }
    });
  }

  update() {
    // Update miner movement
    const speed = 150;
    
    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.miner.body.setVelocityX(-speed);
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.miner.body.setVelocityX(speed);
    } else {
      this.miner.body.setVelocityX(0);
    }
    
    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      this.miner.body.setVelocityY(-speed);
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      this.miner.body.setVelocityY(speed);
    } else {
      this.miner.body.setVelocityY(0);
    }
    
    // Update darkness/lighting effect
    this.updateLighting();
  }

  updateLighting() {
    // Reuse persistent graphics (C1 fix)
    const g = this.miningGraphics;
    g.clear();

    // Dark everywhere except around miner
    g.fillStyle(0x000000, 0.8);
    g.fillRect(0, 0, GAME.WIDTH, GAME.HEIGHT);

    // Light circle around miner
    g.fillStyle(0x000000, 0);
    g.fillCircle(this.miner.x, this.miner.y, this.lightRadius);
  }
}

export default MineScene;
