import Phaser from 'phaser';

/**
 * FarmScene - Crop planting and animal care
 * 
 * Uses Smallburg Farm Pack assets:
 * - Animals: chicken (256x48, 8 frames), cow (512x64, 8 frames), pig
 * - Crops: Various growth stages
 * - Tools: Hoe, watering can
 */
export class FarmScene extends Phaser.Scene {
  constructor() {
    super({ key: 'FarmScene' });
  }

  create() {
    const { width, height } = this.scale;

    // Farm background (dirt field with grass border)
    this.add.rectangle(width / 2, height / 2, width, height, 0x8B6914);
    
    // Grass border top
    this.add.rectangle(width / 2, 10, width, 20, 0x5a9a3c).setDepth(0);
    
    // Wood fence border
    for (let x = 8; x < width; x += 16) {
      this.add.rectangle(x, 20, 12, 16, 0x8B6914).setDepth(1).setStrokeStyle(1, 0x6B5914);
    }

    // Farm plots (8x6 grid of 32x32 plots)
    this.plots = [];
    const startX = 32, startY = 48;
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 8; col++) {
        const plot = {
          x: startX + col * 48,
          y: startY + row * 40,
          crop: null,
          stage: 0,
          watered: false,
          cropSprite: null,
        };
        
        // Visual plot (tilled soil)
        const rect = this.add.rectangle(plot.x + 20, plot.y + 16, 40, 32, 0x6B4914);
        rect.setStrokeStyle(1, 0x5B3914);
        plot.rect = rect;
        
        this.plots.push(plot);
      }
    }

    // Animals (spawn with proper sprites)
    this.animals = [];
    if (this.textures.exists('chicken')) {
      this.spawnAnimal('chicken', 200, 280, 'chicken_walk');
      this.spawnAnimal('chicken', 300, 260, 'chicken_walk');
    }
    if (this.textures.exists('cow')) {
      this.spawnAnimal('cow', 350, 200, 'cow_walk');
    }
    if (this.textures.exists('pig')) {
      this.spawnAnimal('pig', 450, 280, 'pig_walk');
    }

    // Available crops with growth stages
    this.cropTypes = [
      { id: 'potato', name: 'Potato', growTime: 30000, stages: 4, sellPrice: 25, sprite: 'crop_potato' },
      { id: 'carrot', name: 'Carrot', growTime: 20000, stages: 3, sellPrice: 20, sprite: 'crop_carrot' },
      { id: 'tomato', name: 'Tomato', growTime: 40000, stages: 5, sellPrice: 35, sprite: 'crop_tomato' },
      { id: 'corn', name: 'Corn', growTime: 50000, stages: 5, sellPrice: 40, sprite: 'crop_corn' },
      { id: 'strawberry', name: 'Strawberry', growTime: 35000, stages: 4, sellPrice: 30, sprite: 'crop_strawberry' },
    ];

    // Crop selection UI
    this.cropButtons = [];
    const btnY = 30;
    this.cropTypes.forEach((crop, i) => {
      const btn = this.add.text(40 + i * 55, btnY, `${crop.name[0]}`, {
        fontFamily: 'monospace', fontSize: '10px', color: '#ffffff',
        backgroundColor: '#2a5a2a', padding: { x: 4, y: 2 },
      }).setInteractive({ useHandCursor: true }).setDepth(100);
      
      btn.on('pointerdown', () => this.selectCrop(i));
      btn.on('pointerover', () => btn.setStyle({ backgroundColor: '#3a7a3a' }));
      btn.on('pointerout', () => btn.setStyle({ backgroundColor: '#2a5a2a' }));
      
      this.cropButtons.push({ btn, crop });
    });
    this.selectedCropIndex = 0;

    // Return to main scene button
    const returnBtn = this.add.text(width - 60, 10, '← Back', {
      fontFamily: 'monospace', fontSize: '12px', color: '#ffffff',
      backgroundColor: '#333333', padding: { x: 8, y: 4 },
    }).setInteractive({ useHandCursor: true }).setDepth(100);
    
    returnBtn.on('pointerdown', () => {
      this.scene.switch('FishingScene');
    });

    // Farm title
    this.add.text(width / 2, 15, 'FARM', {
      fontFamily: 'monospace', fontSize: '16px', color: '#ffffff',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(100);
    
    // Instructions
    this.add.text(width / 2, height - 10, 'Click plot to plant | SPACE to harvest', {
      fontFamily: 'monospace', fontSize: '5px', color: '#aaaaaa',
    }).setOrigin(0.5).setDepth(100);
    
    // Click to plant
    this.input.on('pointerdown', (pointer) => this.handlePlotClick(pointer));
  }

  spawnAnimal(type, x, y, animKey) {
    let sprite;
    if (this.textures.exists(type)) {
      sprite = this.add.sprite(x, y, type);
      if (this.anims.exists(animKey)) sprite.play(animKey);
      sprite.setDepth(5);
    } else {
      const colors = { chicken: 0xFFFF00, cow: 0xFFFFFF, pig: 0xFFB6C1 };
      const sizes = { chicken: { w: 16, h: 16 }, cow: { w: 32, h: 32 }, pig: { w: 16, h: 16 } };
      const s = sizes[type] || { w: 16, h: 16 };
      sprite = this.add.rectangle(x, y, s.w, s.h, colors[type] || 0xFF0000);
      sprite.setDepth(5);
    }
    
    this.animals.push({
      type,
      sprite,
      speed: type === 'cow' ? 10 : 20,
      direction: Math.random() * Math.PI * 2,
      changeTimer: 0,
      productTimer: 0,
    });
  }

  selectCrop(index) {
    this.selectedCropIndex = index;
    this.cropButtons.forEach((c, i) => {
      c.btn.setStyle({ backgroundColor: i === index ? '#4a8a4a' : '#2a5a2a' });
    });
  }

  handlePlotClick(pointer) {
    this.plots.forEach((plot, index) => {
      const px = plot.x + 20;
      const py = plot.y + 16;
      if (pointer.x >= px - 20 && pointer.x <= px + 20 &&
          pointer.y >= py - 16 && pointer.y <= py + 16) {
        this.handlePlotInteraction(index);
      }
    });
  }

  handlePlotInteraction(plotIndex) {
    const plot = this.plots[plotIndex];
    
    if (!plot.crop) {
      // Plant crop
      const cropType = this.cropTypes[this.selectedCropIndex];
      this.plantCrop(plotIndex, cropType);
    } else if (plot.stage >= plot.crop.stages) {
      // Harvest
      const result = this.harvestCrop(plotIndex);
      if (result) {
        this.events.emit('showMessage', `Harvested ${result.name}! +${result.value}g`);
      }
    } else {
      // Water the crop
      plot.watered = true;
      plot.rect.setFillStyle(0x4a6a2a);
    }
  }

  update(time, delta) {
    // Update animal wandering
    this.animals.forEach(animal => {
      animal.changeTimer += delta;
      if (animal.changeTimer > 3000) {
        animal.direction = Math.random() * Math.PI * 2;
        animal.changeTimer = 0;
      }
      
      const speed = animal.speed * (delta / 1000);
      animal.sprite.x += Math.cos(animal.direction) * speed;
      animal.sprite.y += Math.sin(animal.direction) * speed;
      
      // Keep in bounds
      animal.sprite.x = Phaser.Math.Clamp(animal.sprite.x, 20, this.scale.width - 20);
      animal.sprite.y = Phaser.Math.Clamp(animal.sprite.y, 40, this.scale.height - 20);
    });

    // Update crop growth
    this.plots.forEach(plot => {
      if (plot.crop && plot.stage < plot.crop.stages) {
        plot.growTimer = (plot.growTimer || 0) + delta;
        
        // Watered grows faster
        const growRate = plot.watered ? 2 : 1;
        if (plot.growTimer >= (plot.crop.growTime / plot.crop.stages) * growRate) {
          plot.stage++;
          plot.growTimer = 0;
          
          // Update visual based on stage
          this.updateCropVisual(plot);
        }
      }
    });
  }

  updateCropVisual(plot) {
    const stageColors = [0x6B4914, 0x4a7a2c, 0x5a9a3c, 0x6aba4c, 0x7ada5c];
    plot.rect.fillColor = stageColors[Math.min(plot.stage, 4)];
    
    // If we have a crop sprite, update the frame
    if (plot.cropSprite && plot.crop.sprite) {
      const frameCount = this.textures.get(plot.crop.sprite).frameTotal;
      const frame = Math.min(plot.stage, frameCount - 1);
      plot.cropSprite.setFrame(frame);
    }
  }

  plantCrop(plotIndex, cropType) {
    const plot = this.plots[plotIndex];
    if (!plot || plot.crop) return false;
    
    plot.crop = cropType;
    plot.stage = 0;
    plot.growTimer = 0;
    plot.watered = false;
    
    // Create crop sprite if available
    if (this.textures.exists(cropType.sprite)) {
      plot.cropSprite = this.add.sprite(plot.x + 20, plot.y + 8, cropType.sprite, 0);
      plot.cropSprite.setDepth(2);
    }
    
    return true;
  }

  harvestCrop(plotIndex) {
    const plot = this.plots[plotIndex];
    if (!plot || !plot.crop || plot.stage < plot.crop.stages) return null;
    
    const crop = plot.crop;
    plot.crop = null;
    plot.stage = 0;
    plot.rect.fillColor = 0x6B4914;
    
    if (plot.cropSprite) {
      plot.cropSprite.destroy();
      plot.cropSprite = null;
    }
    
    return { name: crop.name, value: crop.sellPrice };
  }
}
