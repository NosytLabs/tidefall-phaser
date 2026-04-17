/**
 * ShopSystem - Buy and sell items, fish
 */
export class ShopSystem {
  constructor(scene) {
    this.scene = scene;
    this.gold = 100; // Starting gold
    
    // Shop inventory
    this.items = {
      bait_basic: { name: 'Basic Bait', price: 5, sellPrice: 2, type: 'bait', effect: 'common_boost' },
      bait_quality: { name: 'Quality Bait', price: 15, sellPrice: 7, type: 'bait', effect: 'uncommon_boost' },
      bait_premium: { name: 'Premium Bait', price: 50, sellPrice: 25, type: 'bait', effect: 'rare_boost' },
      rod_bamboo: { name: 'Bamboo Rod', price: 100, sellPrice: 50, type: 'rod', power: 1 },
      rod_fiberglass: { name: 'Fiberglass Rod', price: 500, sellPrice: 250, type: 'rod', power: 2 },
      rod_carbon: { name: 'Carbon Fiber Rod', price: 2000, sellPrice: 1000, type: 'rod', power: 3 },
      food_sandwich: { name: 'Energy Sandwich', price: 20, sellPrice: 10, type: 'food', energy: 30 },
      food_stew: { name: 'Fish Stew', price: 50, sellPrice: 25, type: 'food', energy: 80 },
    };
    
    this.inventory = {}; // Owned items
    this.currentRod = 'rod_bamboo';
  }

  buy(itemId) {
    const item = this.items[itemId];
    if (!item) return { success: false, message: 'Item not found' };
    
    if (this.gold < item.price) {
      return { success: false, message: 'Not enough gold!' };
    }
    
    this.gold -= item.price;
    this.inventory[itemId] = (this.inventory[itemId] || 0) + 1;
    
    // Auto-equip rods
    if (item.type === 'rod') {
      this.currentRod = itemId;
    }
    
    return { success: true, message: `Bought ${item.name}!` };
  }

  sell(itemId, quantity = 1) {
    if (!this.inventory[itemId] || this.inventory[itemId] < quantity) {
      return { success: false, message: 'Not enough items!' };
    }
    
    const item = this.items[itemId];
    const total = item.sellPrice * quantity;
    
    this.gold += total;
    this.inventory[itemId] -= quantity;
    
    if (this.inventory[itemId] <= 0) {
      delete this.inventory[itemId];
    }
    
    return { success: true, message: `Sold ${quantity}x ${item.name} for ${total} gold!`, gold: total };
  }

  sellFish(fishData, weight) {
    // Fish sell for their base value, modified by weight
    const weightBonus = Math.floor(weight * 2);
    const total = fishData.value + weightBonus;
    
    this.gold += total;
    
    return { success: true, gold: total, message: `Sold ${fishData.name} (${weight.toFixed(2)}kg) for ${total} gold!` };
  }

  getGold() {
    return this.gold;
  }

  getCurrentRod() {
    return this.items[this.currentRod];
  }

  getRodPower() {
    return this.items[this.currentRod]?.power || 1;
  }

  useBait(baitId) {
    if (!this.inventory[baitId] || this.inventory[baitId] <= 0) {
      return null;
    }
    
    this.inventory[baitId]--;
    if (this.inventory[baitId] <= 0) {
      delete this.inventory[baitId];
    }
    
    return this.items[baitId];
  }

  useFood(foodId) {
    if (!this.inventory[foodId] || this.inventory[foodId] <= 0) {
      return null;
    }
    
    this.inventory[foodId]--;
    if (this.inventory[foodId] <= 0) {
      delete this.inventory[foodId];
    }
    
    return this.items[foodId];
  }

  getShopItems() {
    return Object.entries(this.items).map(([id, item]) => ({
      id,
      ...item,
      owned: this.inventory[id] || 0,
    }));
  }

  getInventory() {
    return Object.entries(this.inventory).map(([id, quantity]) => ({
      id,
      ...this.items[id],
      quantity,
    }));
  }
}
