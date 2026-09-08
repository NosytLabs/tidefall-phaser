import Phaser from 'phaser';
import { DEPTH } from '../core/Constants.js';

/**
 * Fishing animation polish. Keeps authored sprites, but makes the catch payoff
 * read like a pixel-game animation instead of a spinning UI prop.
 */
export function installTidefallFishingAnimationPolish(FishingSystem) {
  FishingSystem.prototype.createFishJumpAnimation = function createFishJumpAnimationPolished() {
    const fishTexture = `fish_${this.currentFish?.id}`;
    if (!this.currentFish || !this.scene.textures.exists(fishTexture)) return;

    const jumpX = this.bobber?.x ?? this.scene.player.x;
    const jumpY = this.scene.waterBounds.top + 10;
    const fish = this.scene.add.sprite(jumpX, jumpY, fishTexture)
      .setScale(0.68)
      .setDepth(DEPTH.WATER_EFFECTS + 5)
      .setOrigin(0.5, 0.5);

    // Fish leap with a short arc and a believable landing, without the old
    // full-spin rotation that made the catch read like a generic effect.
    this.scene.tweens.add({
      targets: fish,
      x: jumpX + Phaser.Math.Between(-8, 8),
      y: jumpY - 42,
      duration: 280,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.scene.tweens.add({
          targets: fish,
          y: jumpY + 8,
          alpha: 0.15,
          duration: 360,
          ease: 'Quad.easeIn',
          onComplete: () => fish.destroy()
        });
      }
    });

    this.scene.tweens.add({
      targets: fish,
      angle: Phaser.Math.Between(-12, 12),
      duration: 220,
      yoyo: true,
      ease: 'Sine.easeInOut'
    });

    this.scene.time.delayedCall(520, () => {
      if (!this.scene?.sys?.isDestroyed) {
        const splash = this.scene.add.ellipse(
          jumpX,
          jumpY + 6,
          12,
          4,
          0xdff5ff,
          0.28
        ).setDepth(DEPTH.WATER_EFFECTS + 4);
        this.scene.tweens.add({
          targets: splash,
          scaleX: 2.2,
          scaleY: 1.35,
          alpha: 0,
          duration: 320,
          ease: 'Quad.easeOut',
          onComplete: () => splash.destroy()
        });
      }
    });
  };

  return true;
}
