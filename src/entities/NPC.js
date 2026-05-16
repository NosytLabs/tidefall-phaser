import Phaser from 'phaser';
import { DEPTH, SCALE, ASSETS } from '../core/Constants.js';

// NPCS array lives in Constants.js — re-export for backward compat
export { NPCS } from '../core/Constants.js';

export class NPC {
  constructor(scene, x, y, config) {
    this.scene = scene;
    this.config = config;

    // Randomise appearance across full asset range
    this.skin      = ASSETS.SKIN_TONES[Phaser.Math.Between(0, ASSETS.SKIN_TONES.length - 1)];
    this.shirtColor= ASSETS.SHIRT_COLORS[Phaser.Math.Between(0, ASSETS.SHIRT_COLORS.length - 1)];
    this.pantsColor= ASSETS.PANTS_COLORS[Phaser.Math.Between(0, ASSETS.PANTS_COLORS.length - 1)];
    this.hairStyle = ASSETS.HAIR_STYLES[Phaser.Math.Between(0, ASSETS.HAIR_STYLES.length - 1)];
    this.hairColor = ASSETS.HAIR_COLORS[Phaser.Math.Between(0, ASSETS.HAIR_COLORS.length - 1)];

    this.container = scene.add.container(x, y).setDepth(DEPTH.NPC);
    this.container.setData('name', config.name);
    this.container.setData('role', config.role);

    // Shadow — slightly transparent
    this.container.add(
      scene.add.ellipse(0, 6, 14, 5, 0x000000, 0.25).setOrigin(0.5)
    );

    // Body
    this.bodySprite = scene.add.sprite(0, 0, `walk_body_${this.skin}`, 0)
      .setOrigin(0.5, 0.75).setScale(SCALE.NPC);
    this.container.add(this.bodySprite);

    // Clothing
    this.pantsSprite = this.addLayer(`walk_pants_${this.pantsColor}`);
    this.shirtSprite = this.addLayer(`walk_shirt_${this.shirtColor}`);
    this.hairSprite  = this.addLayer(`walk_hair_${this.hairStyle}_${this.hairColor}`);

    // Idle bob
    scene.tweens.add({
      targets: this.container,
      y: y + 1.5,
      duration: Phaser.Math.Between(900, 2000),
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
    });

    // Occasional turn
    this._baseX = x;
    scene.time.addEvent({
      delay: Phaser.Math.Between(3000, 7000),
      loop: true,
      callback: () => this.changeDirection()
    });

    // Occasional small wander (only for fishermen / anglers near water)
    if (config.role === 'fisherman' || config.role === 'angler') {
      scene.time.addEvent({
        delay: Phaser.Math.Between(4000, 8000),
        loop: true,
        callback: () => {
          scene.tweens.add({
            targets: this.container,
            x: this._baseX + Phaser.Math.Between(-12, 12),
            duration: 1200,
            ease: 'Sine.easeInOut'
          });
        }
      });
    }
  }

  addLayer(key) {
    if (!this.scene.textures.exists(key)) return null;
    const s = this.scene.add.sprite(0, 0, key)
      .setOrigin(0.5, 0.75).setScale(SCALE.NPC);
    this.container.add(s);
    return s;
  }

  changeDirection() {
    const startFrames = [0, 6, 12, 18]; // down, left, right, up
    const frame = startFrames[Phaser.Math.Between(0, 3)];
    this.bodySprite.setFrame(frame);
    [this.pantsSprite, this.shirtSprite, this.hairSprite].forEach(s => {
      if (s) s.setFrame(frame);
    });
  }

  update() {
    this.container.setDepth(DEPTH.NPC + this.container.y * 0.001);
  }
}
