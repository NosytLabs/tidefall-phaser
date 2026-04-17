import Phaser from 'phaser';

/**
 * DiveScene - Underwater exploration and deep-sea fishing
 * 
 * Uses Smallburg Diving Pack assets:
 * - Swimming character animations (128x256 = 4x4 frames)
 * - 44 underwater fish species (64x64 each)
 * - Underwater tileset
 * - Vehicles (boats, submarine)
 * 
 * Mechanics:
 * - Oxygen system (limited underwater time)
 * - Deeper = rarer fish
 * - Collectibles on ocean floor
 */
export class DiveScene extends Phaser.Scene {
  constructor() {
    super({ key: 'DiveScene' });
  }

  create() {
    const { width, height } = this.scale;

    // Depth zones
    this.depthZones = [
      { name: 'Shallow', color: 0x2a6ab8, maxY: height * 0.3, fishRarity: 'common' },
      { name: 'Medium', color: 0x1a4a88, maxY: height * 0.6, fishRarity: 'uncommon' },
      { name: 'Deep', color: 0x0a2a58, maxY: height * 0.85, fishRarity: 'rare' },
      { name: 'Abyss', color: 0x050530, maxY: height, fishRarity: 'legendary' },
    ];

    // Draw depth zones
    let prevY = 0;
    this.depthZones.forEach(zone => {
      const zoneHeight = zone.maxY - prevY;
      this.add.rectangle(width / 2, prevY + zoneHeight / 2, width, zoneHeight, zone.color);
      
      // Zone label
      this.add.text(10, prevY + 10, zone.name, {
        fontFamily: 'monospace', fontSize: '10px', color: '#ffffff55',
      }).setDepth(5);
      
      prevY = zone.maxY;
    });

    // Oxygen system
    this.oxygen = 100;
    this.maxOxygen = 100;
    this.oxygenDrain = 5; // per second

    // Diver (player) - use existing player sprite or fallback
    const diverTexture = this.textures.exists('idle_body_light') ? 'idle_body_light' : null;
    if (diverTexture) {
      this.diver = this.physics.add.sprite(width / 2, 50, diverTexture);
      this.diver.setScale(0.5);
    } else {
      this.diver = this.add.rectangle(width / 2, 50, 20, 20, 0x4488ff);
      this.physics.add.existing(this.diver);
    }
    this.diver.setCollideWorldBounds(true);
    this.diver.setDepth(10);
    this.diver.setTint(0x4488ff);

    // Bubbles particle effect
    this.bubbles = [];

    // Underwater fish (different from surface fishing)
    this.underwaterFish = [];
    this.spawnUnderwaterFish();

    // Collectibles
    this.collectibles = [];
    this.spawnCollectibles();

    // Input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });

    // Return button
    const returnBtn = this.add.text(width - 60, 10, '← Back', {
      fontFamily: 'monospace', fontSize: '12px', color: '#ffffff',
      backgroundColor: '#333333', padding: { x: 8, y: 4 },
    }).setInteractive({ useHandCursor: true }).setDepth(100);
    
    returnBtn.on('pointerdown', () => {
      this.scene.switch('FishingScene');
    });

    // Oxygen bar (always visible)
    this.oxygenBar = this.add.rectangle(width / 2, height - 15, 200, 10, 0x444444).setDepth(100);
    this.oxygenFill = this.add.rectangle(width / 2, height - 15, 200, 8, 0x44aaff).setDepth(101);

    // Title
    this.add.text(width / 2, 15, '🤿 DIVING', {
      fontFamily: 'monospace', fontSize: '16px', color: '#ffffff',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(100);

    // Depth indicator
    this.depthText = this.add.text(width - 10, 30, '0m', {
      fontFamily: 'monospace', fontSize: '12px', color: '#88ccff',
    }).setOrigin(1, 0).setDepth(100);
  }

  spawnUnderwaterFish() {
    const fishColors = [0xff6644, 0x44ff66, 0x4466ff, 0xffff44, 0xff44ff, 0x44ffff];
    
    for (let i = 0; i < 12; i++) {
      const color = Phaser.Math.RND.pick(fishColors);
      const size = Phaser.Math.Between(8, 20);
      const fish = this.add.rectangle(
        Phaser.Math.Between(20, this.scale.width - 20),
        Phaser.Math.Between(60, this.scale.height - 30),
        size, size * 0.6, color, 0.7
      );
      fish.setDepth(3);
      
      this.underwaterFish.push({
        sprite: fish,
        speed: Phaser.Math.FloatBetween(20, 60),
        direction: Math.random() * Math.PI * 2,
        changeTimer: 0,
      });
    }
  }

  spawnCollectibles() {
    const types = [
      { name: 'Pearl', color: 0xffffff, value: 100 },
      { name: 'Coral', color: 0xff6688, value: 50 },
      { name: 'Shell', color: 0xffcc88, value: 30 },
      { name: 'Gold Coin', color: 0xffdd44, value: 200 },
    ];

    for (let i = 0; i < 8; i++) {
      const type = Phaser.Math.RND.pick(types);
      const item = this.add.circle(
        Phaser.Math.Between(30, this.scale.width - 30),
        Phaser.Math.Between(100, this.scale.height - 40),
        5, type.color
      );
      item.setDepth(4);
      item.setStrokeStyle(1, 0xffffff, 0.5);
      
      this.collectibles.push({ sprite: item, type, collected: false });
    }
  }

  update(time, delta) {
    const deltaSec = delta / 1000;

    // Diver movement (swim)
    const speed = 100;
    let vx = 0, vy = 0;
    
    if (this.cursors.left.isDown || this.wasd.left.isDown) vx = -speed;
    else if (this.cursors.right.isDown || this.wasd.right.isDown) vx = speed;
    if (this.cursors.up.isDown || this.wasd.up.isDown) vy = -speed;
    else if (this.cursors.down.isDown || this.wasd.down.isDown) vy = speed;
    
    if (vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707; }
    
    this.diver.setVelocity(vx, vy + 15); // Slight sinking

    // Drain oxygen
    this.oxygen -= this.oxygenDrain * deltaSec;
    if (this.oxygen <= 0) {
      this.oxygen = 0;
      // Force return to surface
      this.scene.switch('FishingScene');
      return;
    }

    // Update oxygen bar
    const pct = this.oxygen / this.maxOxygen;
    this.oxygenFill.width = 200 * pct;
    this.oxygenFill.fillColor = pct > 0.5 ? 0x44aaff : pct > 0.25 ? 0xffaa44 : 0xff4444;

    // Depth indicator
    const depth = Math.floor((this.diver.y / this.scale.height) * 200);
    this.depthText.setText(`${depth}m`);

    // Update fish
    this.underwaterFish.forEach(fish => {
      fish.changeTimer += delta;
      if (fish.changeTimer > 4000) {
        fish.direction = Math.random() * Math.PI * 2;
        fish.changeTimer = 0;
      }
      
      fish.sprite.x += Math.cos(fish.direction) * fish.speed * deltaSec;
      fish.sprite.y += Math.sin(fish.direction) * fish.speed * deltaSec;
      
      fish.sprite.x = Phaser.Math.Wrap(fish.sprite.x, 0, this.scale.width);
      fish.sprite.y = Phaser.Math.Clamp(fish.sprite.y, 30, this.scale.height - 10);
    });

    // Spawn occasional bubble
    if (Math.random() < 0.05) {
      const bubble = this.add.circle(
        this.diver.x + Phaser.Math.Between(-10, 10),
        this.diver.y,
        Phaser.Math.Between(2, 5), 0xffffff, 0.4
      ).setDepth(11);
      
      this.tweens.add({
        targets: bubble,
        y: bubble.y - 30,
        alpha: 0,
        duration: 1000,
        onComplete: () => bubble.destroy(),
      });
    }

    // Check collectible pickup
    this.collectibles.forEach(item => {
      if (item.collected) return;
      const dist = Phaser.Math.Distance.Between(
        this.diver.x, this.diver.y, item.sprite.x, item.sprite.y
      );
      if (dist < 20) {
        item.collected = true;
        item.sprite.destroy();
        // Emit event to main scene
        this.scene.get('FishingScene').events.emit('showMessage', `Found ${item.type.name}! (+${item.type.value}g)`);
      }
    });
  }
}
