import Phaser from 'phaser';
import { eventBus } from '../core/EventBus.js';
import { gameState } from '../core/GameState.js';
import { EVENTS, GAME, DEPTH, COLORS } from '../core/Constants.js';

/**
 * DiveScene - Underwater diving gameplay scene
 * 
 * Features:
 * - Underwater exploration
 * - Treasure collection
 * - Marine life encounters
 * - Oxygen management
 * - Depth-based challenges
 */
export class DiveScene extends Phaser.Scene {
  constructor() {
    super({ key: 'DiveScene' });
    
    this.diver = null;
    this.oxygen = 100;
    this.depth = 0;
    this.treasures = [];
    this.fish = [];
  }

  create() {
    console.log('[DiveScene] Creating dive site...');
    
    // Create underwater environment
    this.createUnderwaterEnvironment();
    
    // Create diver
    this.createDiver();
    
    // Create marine life
    this.createMarineLife();
    
    // Create treasures
    this.createTreasures();
    
    // Setup UI
    this.createUI();
    
    // Setup input
    this.setupInput();
    
    // Start oxygen depletion
    this.startOxygenDepletion();
    
    // Emit scene ready
    this.events.emit('sceneReady', this);
    console.log('[DiveScene] Dive site creation complete');
  }

  createUnderwaterEnvironment() {
    // Water background with gradient
    const graphics = this.add.graphics();
    
    // Deep blue gradient
    for (let y = 0; y < GAME.HEIGHT; y++) {
      const ratio = y / GAME.HEIGHT;
      const r = Math.floor(0 * (1 - ratio) + 0 * ratio);
      const g = Math.floor(100 * (1 - ratio) + 50 * ratio);
      const b = Math.floor(200 * (1 - ratio) + 100 * ratio);
      
      graphics.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1);
      graphics.fillRect(0, y, GAME.WIDTH, 1);
    }
    
    // Light rays effect
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * GAME.WIDTH;
      graphics.fillStyle(0xffffff, 0.1);
      graphics.fillRect(x, 0, 50, GAME.HEIGHT);
    }
    
    // Bubbles
    this.bubbles = [];
    for (let i = 0; i < 20; i++) {
      const bubble = this.add.circle(
        Math.random() * GAME.WIDTH,
        Math.random() * GAME.HEIGHT,
        Math.random() * 5 + 2,
        0xffffff,
        0.3
      );
      this.bubbles.push({
        sprite: bubble,
        speed: Math.random() * 2 + 1
      });
    }
  }

  createDiver() {
    // Create diver sprite
    this.diver = this.add.sprite(GAME.WIDTH / 2, 100, 'idle_body_light');
    this.diver.setScale(2);
    
    // Diver physics
    this.physics.add.existing(this.diver);
    this.diver.body.setCollideWorldBounds(true);
    this.diver.body.setDrag(100);
  }

  createMarineLife() {
    // Create underwater fish
    const fishTypes = ['clown_fish', 'butterfly_fish', 'neon_tetras', 'sea_horse'];
    
    for (let i = 0; i < 15; i++) {
      const type = fishTypes[Math.floor(Math.random() * fishTypes.length)];
      const x = Math.random() * GAME.WIDTH;
      const y = 200 + Math.random() * (GAME.HEIGHT - 300);
      
      if (this.textures.exists(`fish_${type}`)) {
        const fish = this.add.sprite(x, y, `fish_${type}`);
        fish.setScale(1.5);
        
        this.fish.push({
          sprite: fish,
          speedX: (Math.random() - 0.5) * 2,
          speedY: (Math.random() - 0.5) * 0.5
        });
      }
    }
  }

  createTreasures() {
    // Create treasure chests
    const treasurePositions = [
      { x: 200, y: GAME.HEIGHT - 200 },
      { x: 500, y: GAME.HEIGHT - 300 },
      { x: 800, y: GAME.HEIGHT - 250 },
      { x: 1100, y: GAME.HEIGHT - 350 },
      { x: 1500, y: GAME.HEIGHT - 200 }
    ];
    
    treasurePositions.forEach(pos => {
      const chest = this.add.rectangle(pos.x, pos.y, 40, 30, 0xffd700);
      this.treasures.push({
        sprite: chest,
        collected: false
      });
    });
  }

  createUI() {
    // Oxygen bar
    this.oxygenBar = this.add.graphics();
    // Persistent oxygen label (C2 fix: don't recreate every tick)
    this.oxygenLabel = this.add.text(20, 5, 'OXYGEN', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#ffffff'
    });
    this.updateOxygenBar();
    
    // Depth indicator
    this.depthText = this.add.text(20, 60, 'Depth: 0m', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#ffffff'
    });
    
    // Instructions
    this.add.text(20, GAME.HEIGHT - 50, 'WASD: Swim | SPACE: Collect | Q: Surface', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#ffffff'
    });
  }

  updateOxygenBar() {
    this.oxygenBar.clear();
    
    // Background
    this.oxygenBar.fillStyle(0x000000, 0.5);
    this.oxygenBar.fillRect(20, 20, 200, 20);
    
    // Oxygen level
    const color = this.oxygen > 30 ? 0x00ff00 : 0xff0000;
    this.oxygenBar.fillStyle(color, 1);
    this.oxygenBar.fillRect(20, 20, 200 * (this.oxygen / 100), 20);
    
    // Label updated once, persistent (C2 fix)
    // OXYGEN label created once in createUI()
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
    
    // Collect treasure
    this.input.keyboard.on('keydown-SPACE', () => {
      this.tryCollectTreasure();
    });
    
    // Return to surface (fishing scene)
    this.input.keyboard.on('keydown-Q', () => {
      this.scene.switch('FishingScene');
    });
    
    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.switch('FishingScene');
    });
  }

  startOxygenDepletion() {
    this.oxygenTimer = this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.oxygen -= 5;
        this.updateOxygenBar();
        
        if (this.oxygen <= 0) {
          this.surfaceDiver();
        }
      },
      callbackScope: this,
      loop: true
    });
  }

  tryCollectTreasure() {
    const diverX = this.diver.x;
    const diverY = this.diver.y;
    
    this.treasures.forEach(treasure => {
      if (!treasure.collected) {
        const dist = Phaser.Math.Distance.Between(
          diverX, diverY,
          treasure.sprite.x, treasure.sprite.y
        );
        
        if (dist < 50) {
          treasure.collected = true;
          treasure.sprite.setVisible(false);
          
          // Add gold to game state
          gameState.game.gold += 50;
          
          // Show notification
          eventBus.emit(EVENTS.UI_SHOW_MESSAGE, 'Treasure collected! +50 gold');
        }
      }
    });
  }

  surfaceDiver() {
    this.oxygenTimer.remove();
    eventBus.emit(EVENTS.UI_SHOW_MESSAGE, 'Out of oxygen! Surfacing...');
    this.scene.switch('FishingScene');
  }

  update() {
    // Update diver movement
    const speed = 200;
    
    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.diver.body.setVelocityX(-speed);
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.diver.body.setVelocityX(speed);
    } else {
      this.diver.body.setVelocityX(0);
    }
    
    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      this.diver.body.setVelocityY(-speed);
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      this.diver.body.setVelocityY(speed);
    } else {
      this.diver.body.setVelocityY(0);
    }
    
    // Update depth
    this.depth = Math.floor((this.diver.y - 100) / 10);
    this.depthText.setText(`Depth: ${Math.max(0, this.depth)}m`);
    
    // Update fish
    this.fish.forEach(f => {
      f.sprite.x += f.speedX;
      f.sprite.y += f.speedY;
      
      // Wrap around screen
      if (f.sprite.x < 0) f.sprite.x = GAME.WIDTH;
      if (f.sprite.x > GAME.WIDTH) f.sprite.x = 0;
      if (f.sprite.y < 100) f.sprite.y = GAME.HEIGHT - 100;
      if (f.sprite.y > GAME.HEIGHT - 100) f.sprite.y = 100;
    });
    
    // Update bubbles
    this.bubbles.forEach(b => {
      b.sprite.y -= b.speed;
      if (b.sprite.y < 0) {
        b.sprite.y = GAME.HEIGHT;
        b.sprite.x = Math.random() * GAME.WIDTH;
      }
    });
  }
}

export default DiveScene;
