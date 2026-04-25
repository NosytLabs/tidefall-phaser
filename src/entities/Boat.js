import Phaser from 'phaser';
import { DEPTH, ASSETS, SCALE, BOAT } from '../core/Constants.js';

/**
 * Boat - Interactive boat entity with sway animation and NPC passengers
 * 
 * Features:
 * - Gentle bobbing/swaying animation on water
 * - Interactive (click to board)
 * - NPC passengers that fish from the boat
 * - Proper depth sorting
 * - Shadow underneath
 */
export class Boat {
  /**
   * @param {Phaser.Scene} scene - The scene this boat belongs to
   * @param {number} x - Initial X position
   * @param {number} y - Initial Y position
   * @param {Object} config - Boat configuration
   * @param {string} config.type - Boat type ('blue', 'yellow', 'small')
   * @param {boolean} config.hasPassenger - Whether boat has an NPC passenger
   * @param {number} config.swayDuration - Duration of sway animation (ms)
   * @param {number} config.swayAmount - Amount of vertical sway (pixels)
   */
  constructor(scene, x, y, config = {}) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.type = config.type || 'blue';
    this.swayDuration = config.swayDuration || 2500;
    this.swayAmount = config.swayAmount || 2;
    this.hasPassenger = config.hasPassenger ?? true;
    
    // Create the boat container
    this.container = scene.add.container(x, y);
    this.container.setDepth(DEPTH.BOATS);
    
    // Create shadow (underneath boat) - add to container so it moves with boat
    this.shadow = scene.add.ellipse(0, 8, 50, 12, 0x000000, 0.2).setOrigin(0.5);
    this.container.add(this.shadow);
    this.shadow.setDepth(-1); // Relative to container
    
    // Boat sprite - MASSIVE scale
    const textureKey = `boat_${this.type}`;
    if (scene.textures.exists(textureKey)) {
      // Smallburg boats are 128x128 spritesheets, use frame 0 for static view
      this.boatSprite = scene.add.sprite(0, 0, textureKey, 0).setOrigin(0.5);
      this.boatSprite.setScale(SCALE.BOAT);
    } else {
      // Fallback: simple boat shape - scaled up
      this.boatSprite = scene.add.rectangle(0, 0, 160, 64, 0x8a6a4a).setOrigin(0.5);
    }
    
    // Add to container
    this.container.add([this.boatSprite]);
    
    // Create passenger NPC if enabled
    this.passenger = null;
    if (this.hasPassenger) {
      this.createPassenger();
    }
    
    // Setup sway animation
    this.setupSway();
    
    // Setup interactivity
    this.setupInteraction();
    
    // Add to scene's boat group
    if (scene.boatGroup) {
      scene.boatGroup.add(this.container);
    }
  }
  
  /**
   * Create an NPC passenger that fishes from the boat
   */
  createPassenger() {
    // Random appearance for passenger
    const skinTones = ASSETS.SKIN_TONES;
    const hairStyles = ASSETS.HAIR_STYLES.slice(0, 4);
    const hairColors = ASSETS.HAIR_COLORS;
    
    const skin = skinTones[Math.floor(Math.random() * skinTones.length)];
    const hairStyle = hairStyles[Math.floor(Math.random() * hairStyles.length)];
    const hairColor = hairColors[Math.floor(Math.random() * hairColors.length)];
    
    const origin = [0.5, 0.75];
    const scale = 2.0; // Bigger passengers for visibility
    
    // Create passenger container (relative to boat)
    this.passenger = this.scene.add.container(-5, -4);
    
    // Passenger body
    const bodyKey = `idle_body_${skin}`;
    const walkBodyKey = `walk_body_${skin}`;
    const useBodyKey = this.scene.textures.exists(bodyKey) ? bodyKey : walkBodyKey;
    
    this.passengerBody = this.scene.add.sprite(0, 0, useBodyKey)
      .setOrigin(...origin).setScale(scale);
    
    // Passenger clothing
    this.passengerPants = this._createClothingSprite('pants', 'brown', origin, scale);
    this.passengerShirt = this._createClothingSprite('shirt', 'blue_light', origin, scale);
    this.passengerHair = this._createClothingSprite('hair', `${hairStyle}_${hairColor}`, origin, scale);
    
    // Set initial frame (facing down, fishing)
    this.passengerBody.setFrame(0);
    this.syncPassengerLayers();
    
    this.passenger.add([
      this.passengerBody,
      this.passengerPants,
      this.passengerShirt,
      this.passengerHair
    ]);
    
    // Add passenger to container
    this.container.add(this.passenger);
    
    // Setup fishing rod for passenger
    this.createFishingRod();
    
    // Start fishing animation loop
    this.startPassengerFishing();
  }
  
  /**
   * Create a clothing sprite with idle -> walk fallback
   */
  _createClothingSprite(type, variant, origin, scale) {
    const idleKey = `idle_${type}_${variant}`;
    const walkKey = `walk_${type}_${variant}`;
    
    let useKey = walkKey;
    if (this.scene.textures.exists(idleKey)) {
      const texture = this.scene.textures.get(idleKey);
      if (texture && texture.frameTotal > 0) {
        useKey = idleKey;
      }
    }
    
    const sprite = this.scene.add.sprite(0, 0, useKey).setOrigin(...origin).setScale(scale);
    if (!this.scene.textures.exists(useKey)) {
      sprite.setVisible(false);
    }
    return sprite;
  }
  
  /**
   * Sync passenger clothing layers to body frame
   */
  syncPassengerLayers() {
    if (!this.passengerBody?.frame) return;
    
    const idx = this.passengerBody.frame.name;
    const isIdle = this.passengerBody.texture.key.includes('idle');
    const dirIndex = Math.floor(idx / (isIdle ? 2 : 6));
    const walkIdx = dirIndex * 6;
    
    [this.passengerPants, this.passengerShirt, this.passengerHair].forEach(s => {
      if (s?.visible && s?.texture) {
        try { s.setFrame(walkIdx); } catch(e) {}
      }
    });
  }
  
  /**
   * Create a simple fishing rod for the passenger
   */
  createFishingRod() {
    // Simple line graphic for fishing rod
    this.fishingLine = this.scene.add.graphics();
    this.fishingLine.setDepth(DEPTH.BOATS + 1);
    
    // Bobber for passenger
    this.passengerBobber = this.scene.add.sprite(15, 20, 'bobber_green')
      .setScale(0.8).setDepth(DEPTH.BOATS).setVisible(false);
    
    // Add bobber to scene (not container, so it can move independently)
    this.updateFishingRod();
  }
  
  /**
   * Update fishing rod line position
   */
  updateFishingRod() {
    if (!this.fishingLine || !this.passenger) return;
    
    const boatX = this.container.x;
    const boatY = this.container.y;
    
    // Rod start position (in passenger's hand)
    const rodX = boatX + 5;
    const rodY = boatY - 8;
    
    this.fishingLine.clear();
    
    if (this.passengerBobber.visible) {
      // Draw line to bobber
      const bobberX = this.passengerBobber.x;
      const bobberY = this.passengerBobber.y;
      
      this.fishingLine.lineStyle(1, 0xffffff, 0.6);
      this.fishingLine.lineBetween(rodX, rodY, bobberX, bobberY);
    } else {
      // Rod is just held
      this.fishingLine.lineStyle(2, 0x8a6a4a, 0.8);
      this.fishingLine.lineBetween(rodX, rodY, rodX + 12, rodY - 8);
    }
  }
  
  /**
   * Start passenger fishing cycle (cast, wait, reel)
   */
  startPassengerFishing() {
    if (!this.hasPassenger || !this.passenger) return;
    
    const cycle = () => {
      if (!this.passenger) return;
      
      // Random delay before casting
      const delay = Phaser.Math.Between(2000, 6000);
      
      this.scene.time.delayedCall(delay, () => {
        if (!this.passenger) return;
        
        // Cast animation
        this.castPassengerBobber();
        
        // Wait then reel in
        this.scene.time.delayedCall(Phaser.Math.Between(3000, 8000), () => {
          if (!this.passenger) return;
          this.reelPassengerBobber();
          
          // Restart cycle
          cycle();
        });
      });
    };
    
    // Start the cycle
    cycle();
  }
  
  /**
   * Cast passenger's bobber into water
   */
  castPassengerBobber() {
    if (!this.passengerBobber) return;
    
    const boatX = this.container.x;
    const boatY = this.container.y;
    
    // Set bobber position near boat
    const offsetX = Phaser.Math.Between(20, 40);
    const offsetY = Phaser.Math.Between(10, 25);
    
    this.passengerBobber.setPosition(boatX + offsetX, boatY + offsetY);
    this.passengerBobber.setVisible(true);
    
    // Animate bobber splash
    this.scene.tweens.add({
      targets: this.passengerBobber,
      y: this.passengerBobber.y + 3,
      duration: 200,
      yoyo: true,
      repeat: 1
    });
    
    // Play bobber animation if available
    if (this.scene.anims.exists('bobber_green')) {
      this.passengerBobber.play('bobber_green');
    }
    
    // Update rod line
    this.updateFishingRod();
  }
  
  /**
   * Reel in passenger's bobber
   */
  reelPassengerBobber() {
    if (!this.passengerBobber) return;
    
    this.passengerBobber.setVisible(false);
    this.fishingLine.clear();
    
    // Occasionally show splash (successful catch)
    if (Math.random() > 0.6) {
      this.createSplashEffect();
    }
  }
  
  /**
   * Create splash effect at bobber position
   */
  createSplashEffect() {
    if (!this.passengerBobber) return;
    
    const x = this.passengerBobber.x;
    const y = this.passengerBobber.y;
    
    // Simple splash particles
    for (let i = 0; i < 4; i++) {
      const angle = (Math.PI * 2 * i) / 4;
      const particle = this.scene.add.rectangle(
        x, y, 2, 2, 0xffffff, 0.8
      ).setDepth(DEPTH.WATER_EFFECTS);
      
      this.scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * 8,
        y: y + Math.sin(angle) * 8 - 4,
        alpha: 0,
        duration: 400,
        onComplete: () => particle.destroy()
      });
    }
  }
  
  /**
   * Setup gentle sway animation
   */
  setupSway() {
    // Vertical bobbing - increased for bigger boats
    const swayAmount = this.swayAmount * 2;
    this.scene.tweens.add({
      targets: this.container,
      y: this.y + swayAmount,
      duration: this.swayDuration,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Subtle rotation
    this.scene.tweens.add({
      targets: this.container,
      rotation: BOAT.ROTATION_AMOUNT,
      duration: this.swayDuration * 1.3,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Shadow follows boat but with less movement
    this.scene.tweens.add({
      targets: this.shadow,
      y: this.y + 16 + swayAmount * 0.3,
      duration: this.swayDuration,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }
  
  /**
   * Setup click interaction for boarding
   */
  setupInteraction() {
    // Make interactive
    this.boatSprite.setInteractive({ cursor: 'pointer' });
    
    this.boatSprite.on('pointerover', () => {
      this.boatSprite.setTint(0xdddddd);
      this.scene.events.emit('showMessage', 'Click to board boat');
    });
    
    this.boatSprite.on('pointerout', () => {
      this.boatSprite.clearTint();
    });
    
    this.boatSprite.on('pointerdown', () => {
      this.onBoard();
    });
  }
  
  /**
   * Handle player boarding the boat
   */
  onBoard() {
    // Check if player is nearby - using MASSIVE board distance
    if (!this.scene.player) return;
    
    const dist = Phaser.Math.Distance.Between(
      this.scene.player.x, this.scene.player.y,
      this.x, this.y
    );
    
    if (dist > BOAT.BOARD_DISTANCE) {
      this.scene.events.emit('showMessage', 'Too far away! Move closer to board.');
      return;
    }
    
    // Teleport player to boat
    this.scene.events.emit('showMessage', 'Boarding boat...');
    
    // Move player to boat position
    const boardX = this.x + Phaser.Math.Between(-10, 10);
    const boardY = this.y - 5;
    
    this.scene.player.setPosition(boardX, boardY);
    this.scene.player.container.setDepth(DEPTH.BOATS + 1);
    
    // Add subtle camera effect
    this.scene.cameras.main.pan(boardX, boardY - 50, 300, 'Sine.easeOut');
    
    // Screen shake for impact
    this.scene.cameras.main.shake(100, 0.005);
  }
  
  /**
   * Update called each frame
   */
  update() {
    // Update fishing rod line
    if (this.hasPassenger) {
      this.updateFishingRod();
    }
    
    // Depth sort based on Y position
    const newDepth = DEPTH.BOATS + Math.floor(this.container.y / 100);
    this.container.setDepth(newDepth);
    if (this.passengerBobber) {
      this.passengerBobber.setDepth(newDepth);
    }
  }
  
  /**
   * Clean up resources
   */
  destroy() {
    // Stop tweens
    this.scene.tweens.killTweensOf(this.container);
    
    // Remove event listeners
    if (this.boatSprite) {
      this.boatSprite.removeInteractive();
    }
    
    // Destroy graphics (not in container)
    if (this.fishingLine) {
      this.fishingLine.destroy();
    }
    
    // Destroy bobber (not in container)
    if (this.passengerBobber) {
      this.passengerBobber.destroy();
    }
    
    // Destroy container (and all children including shadow, boat, passenger)
    if (this.container) {
      this.container.destroy();
    }
  }
}

/**
 * BoatManager - Manages all boats in the scene
 */
export class BoatManager {
  constructor(scene) {
    this.scene = scene;
    this.boats = [];
  }
  
  /**
   * Create a single boat at specified position
   */
  createBoat(x, y, type = 'blue', config = {}) {
    const boatConfig = {
      type: type,
      hasPassenger: config.hasPassenger ?? true,
      swayDuration: config.swayDuration || Phaser.Math.Between(BOAT.SWAY_DURATION_MIN, BOAT.SWAY_DURATION_MAX),
      swayAmount: config.swayAmount || Phaser.Math.Between(BOAT.SWAY_AMOUNT_MIN, BOAT.SWAY_AMOUNT_MAX)
    };
    
    // Try different boat texture keys
    const possibleKeys = [`boat_${type}`, 'boat_blue', 'boat_small', 'boat_yellow', 'boat'];
    const availableKey = possibleKeys.find(key => this.scene.textures.exists(key));
    
    if (availableKey) {
      boatConfig.type = availableKey.replace('boat_', '');
      const boat = new Boat(this.scene, x, y, boatConfig);
      this.boats.push(boat);
      return boat;
    }
    
    return null;
  }

  /**
   * Create boats at specified positions
   */
  createBoats(waterY) {
    const W = this.scene.scale.width;
    
    // MASSIVE fleet - 8 boats spread across the ocean
    const boatConfigs = [
      { x: 150, y: waterY + 60, type: 'blue', hasPassenger: true, swayDuration: 2200 },
      { x: 450, y: waterY + 100, type: 'small', hasPassenger: true, swayDuration: 2800 },
      { x: 750, y: waterY + 45, type: 'yellow', hasPassenger: false, swayDuration: 3200 },
      { x: 1050, y: waterY + 85, type: 'blue', hasPassenger: true, swayDuration: 2600 },
      { x: 1350, y: waterY + 55, type: 'small', hasPassenger: false, swayDuration: 3000 },
      { x: 1650, y: waterY + 110, type: 'yellow', hasPassenger: true, swayDuration: 2400 },
      { x: 1850, y: waterY + 70, type: 'blue', hasPassenger: true, swayDuration: 2800 },
      { x: 300, y: waterY + 130, type: 'small', hasPassenger: false, swayDuration: 3400 }
    ];
    
    boatConfigs.forEach(config => {
      this.createBoat(config.x, config.y, config.type, config);
    });
    
    return this.boats;
  }
  
  /**
   * Update all boats
   */
  update() {
    this.boats.forEach(boat => boat.update());
  }
  
  /**
   * Clean up all boats
   */
  destroy() {
    this.boats.forEach(boat => boat.destroy());
    this.boats = [];
  }
}
