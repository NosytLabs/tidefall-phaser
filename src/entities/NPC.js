import Phaser from 'phaser';
import { DEPTH, SCALE, ASSETS } from '../core/Constants.js';

export const NPCS = [
  { id: 'joe', name: 'Fisherman Joe', x: 60, y: 145, role: 'fisherman' },
  { id: 'eliza', name: 'Mayor Eliza', x: 200, y: 125, role: 'mayor' },
  { id: 'bella', name: 'Merchant Bella', x: 340, y: 120, role: 'merchant' },
  { id: 'tom', name: 'Farmer Tom', x: 130, y: 115, role: 'farmer' },
  { id: 'zara', name: 'Angler Zara', x: 280, y: 145, role: 'angler' }
];

export class NPC {
  constructor(scene, x, y, config) {
    this.scene = scene;
    this.config = config;

    // Random appearance from available assets
    const skins = ASSETS.SKIN_TONES;
    const shirts = ASSETS.SHIRT_COLORS.slice(0, 3);
    const pants = ASSETS.PANTS_COLORS.slice(0, 3);
    const hairColors = ASSETS.HAIR_COLORS.slice(0, 3);

    this.skin = skins[Phaser.Math.Between(0, skins.length - 1)];
    this.shirt = shirts[Phaser.Math.Between(0, shirts.length - 1)];
    this.pants = pants[Phaser.Math.Between(0, pants.length - 1)];
    this.hairColor = hairColors[Phaser.Math.Between(0, hairColors.length - 1)];

    this.container = scene.add.container(x, y).setDepth(DEPTH.NPC);
    this.container.setData('name', config.name);

    // Shadow
    this.container.add(
      scene.add.ellipse(0, 5, 12, 4, 0x000000, 0.3).setOrigin(0.5)
    );

    // Body
    this.body = scene.add.sprite(0, 0, `walk_body_${this.skin}`, 0)
      .setOrigin(0.5, 0.75)
      .setScale(SCALE.NPC);
    this.container.add(this.body);

    // Clothing
    this.pants = this.addLayer(`walk_pants_${this.pants}`);
    this.shirt = this.addLayer(`walk_shirt_${this.shirt}`);
    this.hair = this.addLayer(`walk_hair_short_hair_${this.hairColor}`);

    // Idle bob animation
    scene.tweens.add({
      targets: this.container,
      y: y + 1,
      duration: Phaser.Math.Between(1000, 2000),
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Occasional direction change
    this.facingIndex = 0;
    scene.time.addEvent({
      delay: Phaser.Math.Between(3000, 6000),
      loop: true,
      callback: () => this.changeDirection()
    });
  }

  addLayer(key) {
    if (!this.scene.textures.exists(key)) return null;
    const s = this.scene.add.sprite(0, 0, key)
      .setOrigin(0.5, 0.75)
      .setScale(SCALE.NPC);
    this.container.add(s);
    return s;
  }

  changeDirection() {
    const frames = [0, 6, 12, 18]; // down, left, right, up start frames
    this.facingIndex = Phaser.Math.Between(0, 3);
    const frame = frames[this.facingIndex];

    this.body.setFrame(frame);
    [this.pants, this.shirt, this.hair].forEach(s => {
      if (s) s.setFrame(frame);
    });
  }

  update() {
    // Depth sort by Y
    this.container.setDepth(DEPTH.NPC + Math.floor(this.container.y / 50) * 0.1);
  }
}
