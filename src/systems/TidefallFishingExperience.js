import Phaser from 'phaser';
import { BAIT, FISHING, RODS, TIME, WEATHER } from '../core/Constants.js';

const ZONES = [
  {
    id: 'reed_run',
    name: 'Reed Run',
    minX: 0,
    maxX: 480,
    depth: 'shallow',
    biomes: { river: 1.45, lake: 0.75, sea: 0.18 },
    sizes: { small: 1.25, medium: 1.0, big: 0.7 },
    color: 0x82b56b
  },
  {
    id: 'old_dock',
    name: 'Old Dock',
    minX: 480,
    maxX: 960,
    depth: 'mid',
    biomes: { river: 0.7, lake: 1.35, sea: 0.55 },
    sizes: { small: 0.95, medium: 1.2, big: 1.05 },
    color: 0xd1a85d
  },
  {
    id: 'kelp_shelf',
    name: 'Kelp Shelf',
    minX: 960,
    maxX: 1440,
    depth: 'deep',
    biomes: { river: 0.12, lake: 0.55, sea: 1.65 },
    sizes: { small: 0.85, medium: 1.05, big: 1.3 },
    color: 0x5fb2ad
  },
  {
    id: 'blackwater',
    name: 'Blackwater',
    minX: 1440,
    maxX: 1920,
    depth: 'abyssal',
    biomes: { river: 0.05, lake: 0.22, sea: 2.05 },
    sizes: { small: 0.6, medium: 1.0, big: 1.65 },
    color: 0x7868bb
  }
];

const profiles = {
  small: { target: 1.08, speed: 0.92, missPenalty: 0.9 },
  medium: { target: 1.0, speed: 1.0, missPenalty: 1.0 },
  big: { target: 0.86, speed: 1.13, missPenalty: 1.12 }
};

function zoneAt(x) {
  return ZONES.find(zone => x >= zone.minX && x < zone.maxX) || ZONES[0];
}

function rarityModifier(rarity, zone) {
  if (zone.id === 'reed_run') return { common: 1.15, uncommon: 1.1, rare: 0.85, epic: 0.55, legendary: 0.35 }[rarity] ?? 1;
  if (zone.id === 'old_dock') return { common: 0.95, uncommon: 1.15, rare: 1.2, epic: 0.95, legendary: 0.7 }[rarity] ?? 1;
  if (zone.id === 'kelp_shelf') return { common: 0.8, uncommon: 1.0, rare: 1.3, epic: 1.25, legendary: 0.95 }[rarity] ?? 1;
  return { common: 0.62, uncommon: 0.82, rare: 1.25, epic: 1.5, legendary: 1.45 }[rarity] ?? 1;
}

function choosePersonality(rarity, size) {
  const roll = Math.random();
  if (rarity === 'legendary') return 'LEGENDARY';
  if (size === 'big' && roll < 0.45) return 'AGGRESSIVE';
  if (size === 'small' && roll < 0.42) return 'TIMID';
  if (rarity === 'epic' && roll < 0.48) return 'AGGRESSIVE';
  if (rarity === 'rare' && roll < 0.35) return 'TIMID';
  if (roll < 0.12) return 'AGGRESSIVE';
  if (roll < 0.28) return 'TIMID';
  return 'NORMAL';
}

export function installTidefallFishingExperience(FishingSystem) {
  const originalSelectFish = FishingSystem.prototype.selectFish;
  const originalSpawnBobber = FishingSystem.prototype.spawnBobber;
  const originalStartMinigame = FishingSystem.prototype.startMinigame;
  const originalMinigamePress = FishingSystem.prototype.minigamePress;

  FishingSystem.prototype.getFishingZone = function getFishingZone() {
    const x = this.bobber?.x ?? this.scene.player?.x ?? 0;
    return zoneAt(x);
  };

  FishingSystem.prototype.selectFish = function selectFishByHabitat() {
    const fishData = this.scene.fishData;
    if (!fishData?.fish?.length) {
      return originalSelectFish.call(this);
    }

    const zone = this.getFishingZone();
    const timeOfDay = this.scene.timeOfDay || 'day';
    const weather = this.scene.weatherSystem?.currentWeather || 'sunny';
    const timeMultipliers = TIME.FISH_ACTIVITY[timeOfDay] || TIME.FISH_ACTIVITY.day;
    const weatherMultipliers = WEATHER.FISH_MODIFIER[weather] || WEATHER.FISH_MODIFIER.sunny;
    const baitData = this.currentBait ? BAIT[this.currentBait] : null;
    const fallbackRarityWeights = { common: 50, uncommon: 28, rare: 14, epic: 5, legendary: 3 };

    const candidates = fishData.fish.map(fish => {
      const habitat = zone.biomes[fish.biome] ?? 0.08;
      const rarityWeight = fishData.rarityWeights?.[fish.rarity] ?? fallbackRarityWeights[fish.rarity] ?? 1;
      const timeMod = timeMultipliers[fish.rarity] ?? 1;
      const weatherMod = weatherMultipliers[fish.rarity] ?? 1;
      const baitMod = baitData?.attract?.includes(fish.rarity) ? 1.55 : 1;
      const rarityMod = rarityModifier(fish.rarity, zone);
      const sizeMod = zone.sizes[fish.size] ?? 1;

      return {
        fish,
        weight: rarityWeight * habitat * timeMod * weatherMod * baitMod * rarityMod * sizeMod
      };
    }).filter(entry => entry.weight > 0);

    const total = candidates.reduce((sum, entry) => sum + entry.weight, 0);
    let roll = Math.random() * total;
    let chosen = candidates[candidates.length - 1];
    for (const entry of candidates) {
      roll -= entry.weight;
      if (roll <= 0) {
        chosen = entry;
        break;
      }
    }

    this.currentFish = chosen.fish;
    this.currentFishPersonality = choosePersonality(this.currentFish.rarity, this.currentFish.size);
    this.currentFishWeight = Phaser.Math.FloatBetween(this.currentFish.minWeight, this.currentFish.maxWeight);
    this.currentFishingZone = zone;

    this.log('info', `Hooked habitat: ${this.currentFish.name} in ${zone.name}`, {
      biome: this.currentFish.biome,
      size: this.currentFish.size,
      rarity: this.currentFish.rarity,
      personality: this.currentFishPersonality
    });
  };

  FishingSystem.prototype.spawnBobber = function spawnBobberWithZone(x, y, player) {
    originalSpawnBobber.call(this, x, y, player);

    this.currentFishingZone = zoneAt(x);
    const zone = this.currentFishingZone;
    this.castDepth = y < this.scene.waterBounds.top + 52 ? 'shallow' : y < this.scene.waterBounds.top + 105 ? 'mid' : 'deep';

    if (this.bobber) {
      const floatAnim = `bobber_float_${this.bobberColor || 'red'}`;
      if (this.scene.anims.exists(floatAnim)) this.bobber.play(floatAnim);
      this.bobber.setScale(1.05);
    }

    this.scene.events.emit('ui:showMessage', `${zone.name} · ${this.castDepth} water`);
  };

  FishingSystem.prototype.startMinigame = function startHabitatMinigame(...args) {
    const result = originalStartMinigame.apply(this, args);
    if (!this.currentFish) return result;

    const profile = profiles[this.currentFish.size] || profiles.medium;
    this.minigameSpeed *= profile.speed;
    this.minigameHitStreak = 0;
    this.minigameMisses = 0;

    if (this.minigameTarget) {
      const currentWidth = this.minigameTarget.width;
      const width = Math.max(34, currentWidth * profile.target);
      this.minigameTarget.setDisplaySize(width, this.minigameTarget.height);
      this.minigameTargetGlow?.setDisplaySize(width + 4, (this.minigameTargetGlow.height || 18));
    }

    if (this.minigameSuccessText) {
      this.minigameSuccessText.setText(`${this.currentFish.name.toUpperCase()} · HIT THE GREEN`);
    }

    return result;
  };

  FishingSystem.prototype.minigamePress = function minigamePressWithMovement(...args) {
    if (this.state !== 'minigame' || !this.minigamePointer || !this.minigameTarget) return;

    const before = this.minigameProgress;
    const result = originalMinigamePress.apply(this, args);
    const improved = this.minigameProgress > before;

    if (improved) {
      this.minigameHitStreak = (this.minigameHitStreak || 0) + 1;
      if (this.minigameHitStreak >= 2 && this.minigameProgress < 1) {
        const maxX = this.minigameBar.x + this.minigameBar.width / 2 - 12;
        const minX = this.minigameBar.x - this.minigameBar.width / 2 + 12;
        const shift = Phaser.Math.Between(-14, 14);
        this.minigameTarget.x = Phaser.Math.Clamp(this.minigameTarget.x + shift, minX + 18, maxX - 18);
        if (this.minigameTargetGlow) this.minigameTargetGlow.x = this.minigameTarget.x;
      }
      if (this.minigameHitStreak === 3) {
        this.scene.events.emit('ui:showMessage', 'Nice! Keep the streak going.');
      }
    } else {
      this.minigameHitStreak = 0;
      this.minigameMisses = (this.minigameMisses || 0) + 1;
      if (this.minigameTarget) {
        const maxX = this.minigameBar.x + this.minigameBar.width / 2 - 24;
        const minX = this.minigameBar.x - this.minigameBar.width / 2 + 24;
        this.minigameTarget.x = Phaser.Math.Clamp(this.minigameTarget.x + Phaser.Math.Between(-8, 8), minX, maxX);
        if (this.minigameTargetGlow) this.minigameTargetGlow.x = this.minigameTarget.x;
      }
    }

    return result;
  };

  FishingSystem.prototype.getFishingZoneLabel = function getFishingZoneLabel() {
    return this.currentFishingZone?.name || 'Reed Run';
  };

  FishingSystem.prototype.getFishingZones = () => ZONES.map(zone => ({ ...zone }));

  // Expose tuning metadata without changing the existing event API.
  FishingSystem.prototype.getCatchQuality = function getCatchQuality() {
    const misses = this.minigameMisses || 0;
    if (misses === 0) return 'perfect';
    if (misses === 1) return 'clean';
    return 'scrappy';
  };

  return { zones: ZONES };
}
