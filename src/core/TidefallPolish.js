import { FishingSystem } from '../systems/FishingSystem.js';
import { FishingScene } from '../scenes/FishingScene.js';
import { UISceneV2 } from '../scenes/UISceneV2.js';

let applied = false;
export function applyTidefallPolish() {
  if (applied) return;
  applied = true;
  const originalCreate = FishingScene.prototype.create;
  FishingScene.prototype.create = function (...args) {
    originalCreate.apply(this, args);
    this.fpsText?.destroy();
  };
  // Keep water feedback readable: no camera shake, white flash, or burst spam.
  FishingSystem.prototype.createBiteFlash = function () {};
  FishingSystem.prototype.createSplashEffect = function (x, y) {
    const ring = this.scene.add.ellipse(x, y, 10, 4, 0xffffff, 0.16).setDepth(22);
    this.scene.tweens.add({ targets: ring, scaleX: 2.2, scaleY: 1.3, alpha: 0, duration: 420, onComplete: () => ring.destroy() });
  };
  FishingSystem.prototype.createRippleEffect = function (x, y) {
    const ring = this.scene.add.ellipse(x, y, 14, 5, 0xffffff, 0.12).setDepth(22);
    this.scene.tweens.add({ targets: ring, scaleX: 2.6, scaleY: 1.5, alpha: 0, duration: 650, onComplete: () => ring.destroy() });
  };
  const originalShowMessage = UISceneV2.prototype.showMessage;
  UISceneV2.prototype.showMessage = function (text, duration = 2200) {
    const clean = String(text ?? '').replace(/^!!\s*[^!]+FISH\s*!!\s*Press SPACE!?$/i, 'BITE! PRESS SPACE TO HOOK');
    originalShowMessage.call(this, clean, duration);
  };
}
