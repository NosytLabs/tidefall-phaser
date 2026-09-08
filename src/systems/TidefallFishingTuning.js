import Phaser from 'phaser';
import { EVENTS, FISHING, GAME, RODS, WEATHER } from '../core/Constants.js';

/**
 * Gameplay tuning for the fishing loop.
 * Fixes the original cast target bug (which clamped X to viewport width instead
 * of world width) and shortens the dead time between cast and bite.
 */
export function installTidefallFishingTuning(FishingSystem) {
  const originalSpawnBobber = FishingSystem.prototype.spawnBobber;

  FishingSystem.prototype.startCasting = function startCastingTuned(player, options = {}) {
    if (this.state !== 'idle') return;

    try {
      this.currentBait = options.bait || null;
      this.currentRod = options.rod || 'BASIC';

      const waterTop = this.scene.waterBounds.top;
      const rodStats = RODS[this.currentRod] || RODS.BASIC;
      if (player.y < waterTop - 60) {
        this.scene.events.emit(EVENTS.UI_SHOW_MESSAGE, 'Move closer to the shoreline.');
        return;
      }

      this.state = 'casting';
      player.startFishing();
      this.scene.audioManager?.playSfx('cast');

      const castDist = Phaser.Math.Between(
        Math.floor(FISHING.CAST_MIN_DISTANCE * rodStats.power),
        Math.floor(FISHING.CAST_MAX_DISTANCE * rodStats.power)
      );
      const weather = this.scene.weatherSystem?.currentWeather || 'sunny';
      const weatherEffects = WEATHER.EFFECTS[weather] || WEATHER.EFFECTS.sunny;
      const finalDist = Math.floor(castDist * weatherEffects.castDistanceMod);

      const horizontalDirection = player.facing === 'left' ? -1 : player.facing === 'right' ? 1 : 0;
      const lateral = horizontalDirection === 0
        ? Phaser.Math.Between(-18, 18)
        : horizontalDirection * Phaser.Math.Between(10, 24);
      const targetX = Phaser.Math.Clamp(
        player.x + lateral + horizontalDirection * finalDist * 0.35,
        this.scene.waterBounds.left + 20,
        this.scene.waterBounds.right - 20
      );
      const targetY = Phaser.Math.Clamp(
        waterTop + 18 + Math.floor(finalDist * 0.65),
        waterTop + 16,
        this.scene.waterBounds.bottom - 18
      );

      this.castTimer = this.scene.time.delayedCall(280, () => {
        if (this.state === 'casting') this.spawnBobber(targetX, targetY, player);
      });
      this.metrics.casts++;
      this.castStartTime = Date.now();
    } catch (error) {
      this.log('error', 'Error in tuned startCasting', error?.message);
      this.state = 'idle';
      player.stopFishing?.();
    }
  };

  FishingSystem.prototype.spawnBobber = function spawnBobberTuned(x, y, player) {
    originalSpawnBobber.call(this, x, y, player);
    if (this.waitTimer) this.waitTimer.remove();

    const phase = this.scene.timeOfDay || 'day';
    const phaseMod = phase === 'dawn' ? 0.8 : phase === 'dusk' ? 0.88 : phase === 'night' ? 1.12 : 1;
    const baitMod = this.currentBait ? 0.82 : 1;
    const rodStats = RODS[this.currentRod] || RODS.BASIC;
    const rodMod = Math.max(0.76, 1 / Math.max(0.8, rodStats.power));
    const waitTime = Math.round(
      Phaser.Math.Between(1300, 3600) * phaseMod * baitMod * rodMod
    );

    this.waitTimer = this.scene.time.delayedCall(waitTime, () => this.triggerBite());
    this.scene.events.emit(EVENTS.UI_SHOW_MESSAGE, 'Line out. Watch the bobber.');
    this.log('debug', `Tuned bite window: ${waitTime}ms`);
  };
}
