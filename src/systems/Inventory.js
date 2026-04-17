import { BAIT, STORAGE } from '../core/Constants.js';

/**
 * Inventory - Enhanced inventory with bait, storage, and batch operations
 * 
 * Features:
 * - Fish storage with capacity limits
 * - Bait inventory
 * - Crafting materials
 * - Batch operations (sell, store, craft)
 * - Sorting and filtering
 */
export class Inventory {
  constructor() {
    // Fish storage
    this.fish = []; // Array of { fish, weight, timestamp, stored: false }
    this.maxSlots = STORAGE.INVENTORY;
    
    // Bait inventory
    this.bait = {}; // { [baitId]: count }
    this.maxBaitSlots = 10;
    
    // Crafting materials
    this.materials = {}; // { [materialId]: count }
    
    // Rod inventory
    this.rods = ['BASIC']; // Owned rod IDs
    this.equippedRod = 'BASIC';
    
    // Lures
    this.lures = {}; // { [lureId]: count }
    
    // Selection for batch operations
    this.selectedIndices = new Set();
  }

  /**
   * Add a caught fish to inventory
   */
  addFish(fishData, weight, metadata = {}) {
    if (this.fish.length >= this.maxSlots) {
      return { success: false, error: 'INVENTORY_FULL' };
    }

    this.fish.push({
      fish: fishData,
      weight: weight,
      caughtAt: new Date().toISOString(),
      stored: false,
      location: metadata.location || 'unknown',
      weather: metadata.weather || 'sunny',
      timeOfDay: metadata.timeOfDay || 'day',
      baitUsed: metadata.bait || null,
      rodUsed: metadata.rod || 'BASIC',
      perfect: metadata.perfect || false,
      id: this.generateId()
    });

    return { success: true, index: this.fish.length - 1 };
  }

  /**
   * Generate unique ID for inventory items
   */
  generateId() {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Remove fish by index
   */
  removeFish(index) {
    if (index >= 0 && index < this.fish.length) {
      return this.fish.splice(index, 1)[0];
    }
    return null;
  }

  /**
   * Remove fish by ID
   */
  removeFishById(id) {
    const index = this.fish.findIndex(f => f.id === id);
    if (index >= 0) {
      return this.fish.splice(index, 1)[0];
    }
    return null;
  }

  getFish(index) {
    return this.fish[index] || null;
  }

  getFishById(id) {
    return this.fish.find(f => f.id === id) || null;
  }

  getAllFish() {
    return [...this.fish];
  }

  getFishByType(fishId) {
    return this.fish.filter(item => item.fish.id === fishId);
  }

  getFishByRarity(rarity) {
    return this.fish.filter(item => item.fish.rarity === rarity);
  }

  getCount() {
    return this.fish.length;
  }

  getRemainingSlots() {
    return this.maxSlots - this.fish.length;
  }

  isFull() {
    return this.fish.length >= this.maxSlots;
  }

  getTotalValue() {
    return this.fish.reduce((sum, item) => sum + item.fish.value, 0);
  }

  getTotalWeight() {
    return this.fish.reduce((sum, item) => sum + item.weight, 0);
  }

  getHeaviestFish() {
    if (this.fish.length === 0) return null;
    return this.fish.reduce((max, item) => item.weight > max.weight ? item : max, this.fish[0]);
  }

  getRarestFish() {
    const rarityOrder = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };
    if (this.fish.length === 0) return null;
    return this.fish.reduce((max, item) => 
      rarityOrder[item.fish.rarity] > rarityOrder[max.fish.rarity] ? item : max, 
      this.fish[0]
    );
  }

  /**
   * Sort fish by various criteria
   */
  sortBy(criteria) {
    const sorters = {
      name: (a, b) => a.fish.name.localeCompare(b.fish.name),
      rarity: (a, b) => {
        const order = { legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4 };
        return order[a.fish.rarity] - order[b.fish.rarity];
      },
      weight: (a, b) => b.weight - a.weight,
      value: (a, b) => b.fish.value - a.fish.value,
      time: (a, b) => new Date(b.caughtAt) - new Date(a.caughtAt)
    };
    
    if (sorters[criteria]) {
      this.fish.sort(sorters[criteria]);
    }
  }

  /**
   * Filter fish by criteria
   */
  filterBy(criteria) {
    const { rarity, stored, minWeight, maxWeight } = criteria;
    
    return this.fish.filter(item => {
      if (rarity && item.fish.rarity !== rarity) return false;
      if (stored !== undefined && item.stored !== stored) return false;
      if (minWeight && item.weight < minWeight) return false;
      if (maxWeight && item.weight > maxWeight) return false;
      return true;
    });
  }

  clear() {
    this.fish = [];
    this.selectedIndices.clear();
  }

  /**
   * Bait management
   */
  addBait(baitId, count = 1) {
    const baitData = BAIT[baitId];
    if (!baitData) return { success: false, error: 'INVALID_BAIT' };
    
    const currentBait = Object.keys(this.bait).length;
    const currentCount = this.bait[baitId] || 0;
    
    // Check if adding new bait type would exceed slot limit
    if (currentCount === 0 && currentBait >= this.maxBaitSlots) {
      return { success: false, error: 'BAIT_SLOTS_FULL' };
    }
    
    this.bait[baitId] = (this.bait[baitId] || 0) + count;
    
    return { success: true, count: this.bait[baitId] };
  }

  removeBait(baitId, count = 1) {
    if (!this.bait[baitId] || this.bait[baitId] < count) {
      return { success: false, error: 'INSUFFICIENT_BAIT' };
    }
    
    this.bait[baitId] -= count;
    
    if (this.bait[baitId] <= 0) {
      delete this.bait[baitId];
    }
    
    return { success: true, remaining: this.bait[baitId] || 0 };
  }

  getBaitCount(baitId) {
    return this.bait[baitId] || 0;
  }

  getAllBait() {
    return { ...this.bait };
  }

  getEquippedBait() {
    // Return the bait type with highest count
    return Object.entries(this.bait)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  }

  hasBait(baitId) {
    return (this.bait[baitId] || 0) > 0;
  }

  /**
   * Rod management
   */
  addRod(rodId) {
    if (!this.rods.includes(rodId)) {
      this.rods.push(rodId);
      return { success: true };
    }
    return { success: false, error: 'ALREADY_OWNED' };
  }

  equipRod(rodId) {
    if (this.rods.includes(rodId)) {
      this.equippedRod = rodId;
      return { success: true };
    }
    return { success: false, error: 'ROD_NOT_OWNED' };
  }

  getEquippedRod() {
    return this.equippedRod;
  }

  getOwnedRods() {
    return [...this.rods];
  }

  hasRod(rodId) {
    return this.rods.includes(rodId);
  }

  /**
   * Material management (for crafting)
   */
  addMaterial(materialId, count = 1) {
    this.materials[materialId] = (this.materials[materialId] || 0) + count;
    return { success: true, count: this.materials[materialId] };
  }

  removeMaterial(materialId, count = 1) {
    if (!this.materials[materialId] || this.materials[materialId] < count) {
      return { success: false, error: 'INSUFFICIENT_MATERIALS' };
    }
    
    this.materials[materialId] -= count;
    
    if (this.materials[materialId] <= 0) {
      delete this.materials[materialId];
    }
    
    return { success: true, remaining: this.materials[materialId] || 0 };
  }

  getMaterialCount(materialId) {
    return this.materials[materialId] || 0;
  }

  hasMaterials(requirements) {
    for (const [materialId, count] of Object.entries(requirements)) {
      if ((this.materials[materialId] || 0) < count) {
        return false;
      }
    }
    return true;
  }

  /**
   * Lure management
   */
  addLure(lureId, count = 1) {
    this.lures[lureId] = (this.lures[lureId] || 0) + count;
    return { success: true, count: this.lures[lureId] };
  }

  removeLure(lureId, count = 1) {
    if (!this.lures[lureId] || this.lures[lureId] < count) {
      return { success: false, error: 'INSUFFICIENT_LURES' };
    }
    
    this.lures[lureId] -= count;
    
    if (this.lures[lureId] <= 0) {
      delete this.lures[lureId];
    }
    
    return { success: true, remaining: this.lures[lureId] || 0 };
  }

  /**
   * Selection for batch operations
   */
  selectFish(index) {
    if (this.selectedIndices.has(index)) {
      this.selectedIndices.delete(index);
    } else {
      this.selectedIndices.add(index);
    }
  }

  selectAll() {
    this.selectedIndices = new Set(this.fish.map((_, i) => i));
  }

  deselectAll() {
    this.selectedIndices.clear();
  }

  getSelectedCount() {
    return this.selectedIndices.size;
  }

  getSelectedFish() {
    return Array.from(this.selectedIndices).map(i => this.fish[i]).filter(Boolean);
  }

  /**
   * Batch operations
   */
  sellSelected() {
    const selected = Array.from(this.selectedIndices).sort((a, b) => b - a);
    let gold = 0;
    
    selected.forEach(index => {
      const item = this.removeFish(index);
      if (item) {
        gold += item.fish.value;
      }
    });
    
    this.selectedIndices.clear();
    return { success: true, gold, count: selected.length };
  }

  sellFishByType(fishId) {
    let gold = 0;
    let count = 0;
    
    this.fish = this.fish.filter(item => {
      if (item.fish.id === fishId) {
        gold += item.fish.value;
        count++;
        return false;
      }
      return true;
    });
    
    this.selectedIndices.clear();
    return { success: true, gold, count };
  }

  sellAll() {
    const gold = this.getTotalValue();
    const count = this.fish.length;
    this.clear();
    return { success: true, gold, count };
  }

  sellRarest() {
    const rarest = this.getRarestFish();
    if (!rarest) return { success: false, error: 'NO_FISH' };
    
    const index = this.fish.indexOf(rarest);
    if (index >= 0) {
      const item = this.removeFish(index);
      return { success: true, gold: item.fish.value, fish: item };
    }
    
    return { success: false, error: 'NOT_FOUND' };
  }

  /**
   * Store fish in building storage
   */
  storeSelected(storageType) {
    const selected = Array.from(this.selectedIndices).sort((a, b) => b - a);
    const stored = [];
    
    selected.forEach(index => {
      const item = this.fish[index];
      if (item) {
        item.stored = true;
        item.storageLocation = storageType;
        stored.push(item);
      }
    });
    
    // Remove from inventory (stored elsewhere)
    this.fish = this.fish.filter((_, i) => !this.selectedIndices.has(i));
    this.selectedIndices.clear();
    
    return { success: true, count: stored.length, fish: stored };
  }

  /**
   * Get summary stats for display
   */
  getStats() {
    const byRarity = {};
    const byBiome = {};
    const byTimeOfDay = {};
    const byBait = {};

    this.fish.forEach(item => {
      byRarity[item.fish.rarity] = (byRarity[item.fish.rarity] || 0) + 1;
      byBiome[item.fish.biome] = (byBiome[item.fish.biome] || 0) + 1;
      byTimeOfDay[item.timeOfDay] = (byTimeOfDay[item.timeOfDay] || 0) + 1;
      if (item.baitUsed) {
        byBait[item.baitUsed] = (byBait[item.baitUsed] || 0) + 1;
      }
    });

    return {
      totalCaught: this.fish.length,
      totalValue: this.getTotalValue(),
      totalWeight: this.getTotalWeight(),
      remainingSlots: this.getRemainingSlots(),
      byRarity,
      byBiome,
      byTimeOfDay,
      byBait,
      heaviest: this.getHeaviestFish(),
      rarest: this.getRarestFish(),
      baitTypes: Object.keys(this.bait).length,
      totalBait: Object.values(this.bait).reduce((a, b) => a + b, 0),
      ownedRods: this.rods.length,
      equippedRod: this.equippedRod,
      materials: { ...this.materials }
    };
  }

  /**
   * Serialize for save
   */
  serialize() {
    return {
      fish: this.fish,
      bait: this.bait,
      materials: this.materials,
      rods: this.rods,
      equippedRod: this.equippedRod,
      lures: this.lures
    };
  }

  /**
   * Deserialize from save
   */
  deserialize(data) {
    if (data.fish) this.fish = data.fish;
    if (data.bait) this.bait = data.bait;
    if (data.materials) this.materials = data.materials;
    if (data.rods) this.rods = data.rods;
    if (data.equippedRod) this.equippedRod = data.equippedRod;
    if (data.lures) this.lures = data.lures;
    
    this.selectedIndices.clear();
  }

  /**
   * Load legacy format (backward compatibility)
   */
  load(legacyData) {
    if (Array.isArray(legacyData)) {
      // Old format - just array of fish
      this.fish = legacyData.map(item => ({
        ...item,
        id: item.id || this.generateId(),
        stored: item.stored || false
      }));
    } else {
      this.deserialize(legacyData);
    }
  }
}
