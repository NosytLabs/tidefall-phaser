import Phaser from 'phaser';

/**
 * MineScene - Mining for ores and gems
 * 
 * Uses Smallburg Mine Pack assets:
 * - Mining character animations
 * - Ores (crystals, gems, ores)
 * - Mine carts
 * - Cave walls and floors
 * - Critters
 */
export class MineScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MineScene' });
  }

  create() {
    const { width, height } = this.scale;

    // Cave background
    this.add.rectangle(width / 2, height / 2, width, height, 0x2a2a3a);
    
    // Cave walls (border)
    this.add.rectangle(width / 2, 8, width, 16, 0x4a4a5a);
    this.add.rectangle(width / 2, height - 8, width, 16, 0x4a4a5a);
    this.add.rectangle(8, height / 2, 16, height, 0x4a4a5a);
    this.add.rectangle(width - 8, height / 2, 16, height, 0x4a4a5a);

    // Rock formations
    for (let i = 0; i < 20; i++) {
      const rock = this.add.rectangle(
        Phaser.Math.Between(30, width - 30),
        Phaser.Math.Between(30, height - 30),
        Phaser.Math.Between(16, 40),
        Phaser.Math.Between(16, 32),
        0x3a3a4a, 0.8
      );
      rock.setStrokeStyle(2, 0x2a2a3a);
      rock.setDepth(1);
    }

    // Mineable ore nodes
    this.oreNodes = [];
    this.spawnOreNodes();

    // Player (miner) - use existing player sprite or fallback
    const minerTexture = this.textures.exists('idle_body_light') ? 'idle_body_light' : null;
    if (minerTexture) {
      this.miner = this.physics.add.sprite(width / 2, height / 2, minerTexture);
      this.miner.setScale(0.5);
    } else {
      this.miner = this.add.rectangle(width / 2, height / 2, 20, 20, 0xffaa44);
      this.physics.add.existing(this.miner);
    }
    this.miner.setCollideWorldBounds(true);
    this.miner.setDepth(10);
    this.miner.setTint(0xffaa44);

    // Energy for mining
    this.mineEnergy = 50;

    // Input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.spaceKey.on('down', () => this.tryMine());

    // Return button
    const returnBtn = this.add.text(width - 60, 10, '← Back', {
      fontFamily: 'monospace', fontSize: '12px', color: '#ffffff',
      backgroundColor: '#333333', padding: { x: 8, y: 4 },
    }).setInteractive({ useHandCursor: true }).setDepth(100);
    
    returnBtn.on('pointerdown', () => {
      this.scene.switch('FishingScene');
    });

    // Title
    this.add.text(width / 2, 15, '⛏️ MINE', {
      fontFamily: 'monospace', fontSize: '16px', color: '#ffffff',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(100);

    // Energy bar
    this.energyText = this.add.text(10, height - 15, '⚡ 50/50', {
      fontFamily: 'monospace', fontSize: '10px', color: '#ffdd44',
    }).setDepth(100);
  }

  spawnOreNodes() {
    const oreTypes = [
      { type: 'coal', color: 0x333333, hardness: 3, value: 10, name: 'Coal' },
      { type: 'iron', color: 0x888888, hardness: 5, value: 25, name: 'Iron' },
      { type: 'gold', color: 0xffdd44, hardness: 7, value: 50, name: 'Gold' },
      { type: 'crystal', color: 0x44aaff, hardness: 8, value: 75, name: 'Crystal' },
      { type: 'ruby', color: 0xff4444, hardness: 10, value: 100, name: 'Ruby' },
      { type: 'diamond', color: 0xffffff, hardness: 12, value: 200, name: 'Diamond' },
    ];

    for (let i = 0; i < 10; i++) {
      const ore = Phaser.Math.RND.weightedPick(oreTypes.map(o => ({ ...o, weight: o.hardness })));
      const node = this.add.rectangle(
        Phaser.Math.Between(40, this.scale.width - 40),
        Phaser.Math.Between(40, this.scale.height - 40),
        20, 18, ore.color
      );
      node.setStrokeStyle(2, 0xffffff, 0.3);
      node.setDepth(2);

      this.oreNodes.push({
        sprite: node,
        type: ore,
        hits: 0,
        maxHits: ore.hardness,
        depleted: false,
      });
    }
  }

  tryMine() {
    if (this.mineEnergy <= 0) return;

    // Find nearby ore
    const nearby = this.oreNodes.find(n => {
      if (n.depleted) return false;
      const dist = Phaser.Math.Distance.Between(
        this.miner.x, this.miner.y, n.sprite.x, n.sprite.y
      );
      return dist < 30;
    });

    if (nearby) {
      nearby.hits++;
      this.mineEnergy--;
      
      // Shake effect
      this.tweens.add({
        targets: nearby.sprite,
        x: nearby.sprite.x + Phaser.Math.Between(-3, 3),
        duration: 50,
        yoyo: true,
      });

      if (nearby.hits >= nearby.maxHits) {
        nearby.depleted = true;
        nearby.sprite.destroy();
        
        // Notify main scene
        this.scene.get('FishingScene').events.emit('showMessage', 
          `⛏️ Mined ${nearby.type.name}! (+${nearby.type.value}g)`);
        this.scene.get('FishingScene').shopSystem.gold += nearby.type.value;
      }
    }
  }

  update(time, delta) {
    const speed = 80;
    let vx = 0, vy = 0;
    
    if (this.cursors.left.isDown || this.wasd.left.isDown) vx = -speed;
    else if (this.cursors.right.isDown || this.wasd.right.isDown) vx = speed;
    if (this.cursors.up.isDown || this.wasd.up.isDown) vy = -speed;
    else if (this.cursors.down.isDown || this.wasd.down.isDown) vy = speed;
    
    if (vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707; }
    
    this.miner.setVelocity(vx, vy);

    // Update energy display
    this.energyText.setText(`⚡ ${this.mineEnergy}/50`);
  }
}
