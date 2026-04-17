/**
 * FishEncyclopedia - Tracks all discovered fish species
 * 
 * Like Stardew Valley's collection system / museum
 */
export class FishEncyclopedia {
  constructor() {
    this.discovered = {}; // fishId -> { count, heaviest, firstCaughtAt, totalWeight }
  }

  discover(fish, weight) {
    if (!this.discovered[fish.id]) {
      this.discovered[fish.id] = {
        name: fish.name,
        rarity: fish.rarity,
        biome: fish.biome,
        count: 0,
        heaviest: 0,
        totalWeight: 0,
        firstCaughtAt: Date.now(),
      };
    }

    const entry = this.discovered[fish.id];
    entry.count++;
    entry.totalWeight += weight;
    if (weight > entry.heaviest) entry.heaviest = weight;

    return entry.count === 1; // Returns true if first discovery
  }

  getDiscovered() {
    return { ...this.discovered };
  }

  getDiscoveredCount() {
    return Object.keys(this.discovered).length;
  }

  getTotalSpecies() {
    return 44; // Total fish types
  }

  getCompletionPercentage() {
    return Math.floor((this.getDiscoveredCount() / this.getTotalSpecies()) * 100);
  }

  getByBiome(biome) {
    return Object.entries(this.discovered)
      .filter(([_, entry]) => entry.biome === biome)
      .map(([id, entry]) => ({ id, ...entry }));
  }

  getByRarity(rarity) {
    return Object.entries(this.discovered)
      .filter(([_, entry]) => entry.rarity === rarity)
      .map(([id, entry]) => ({ id, ...entry }));
  }

  getHeaviestCatch() {
    let heaviest = null;
    let maxWeight = 0;
    
    Object.entries(this.discovered).forEach(([id, entry]) => {
      if (entry.heaviest > maxWeight) {
        maxWeight = entry.heaviest;
        heaviest = { id, ...entry };
      }
    });
    
    return heaviest;
  }

  isDiscovered(fishId) {
    return !!this.discovered[fishId];
  }

  serialize() {
    return { discovered: this.discovered };
  }

  static deserialize(data) {
    const enc = new FishEncyclopedia();
    if (data?.discovered) {
      enc.discovered = data.discovered;
    }
    return enc;
  }
}
