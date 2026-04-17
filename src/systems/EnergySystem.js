/**
 * EnergySystem - Manages player energy for daily actions
 * 
 * Similar to Stardew Valley - limited energy creates strategic decisions
 */
export class EnergySystem {
  constructor(maxEnergy = 100) {
    this.maxEnergy = maxEnergy;
    this.currentEnergy = maxEnergy;
    this.exhausted = false;
  }

  // Actions cost energy
  static COSTS = {
    WALK: 0.01,           // Per step
    CAST: 5,              // Casting fishing line
    REEL: 8,              // Reeling in fish
    MINIGAME_ATTEMPT: 2,  // Each minigame press
    SPRINT: 0.05,        // Per step while holding shift
  };

  consume(amount) {
    if (this.exhausted) return false;
    
    this.currentEnergy = Math.max(0, this.currentEnergy - amount);
    
    if (this.currentEnergy <= 0) {
      this.exhausted = true;
      this.currentEnergy = 0;
    }
    
    return this.currentEnergy > 0;
  }

  restore(amount) {
    this.currentEnergy = Math.min(this.maxEnergy, this.currentEnergy + amount);
    this.exhausted = this.currentEnergy <= 0;
    return this.currentEnergy;
  }

  // Full restore (new day)
  reset() {
    this.currentEnergy = this.maxEnergy;
    this.exhausted = false;
  }

  // Food items restore energy
  eatFood(foodItem) {
    if (foodItem.energyRestore) {
      return this.restore(foodItem.energyRestore);
    }
    return this.currentEnergy;
  }

  getPercentage() {
    return (this.currentEnergy / this.maxEnergy) * 100;
  }

  canPerform(action) {
    return this.currentEnergy >= EnergySystem.COSTS[action];
  }

  // Serialize for save
  serialize() {
    return {
      current: this.currentEnergy,
      max: this.maxEnergy,
      exhausted: this.exhausted,
    };
  }

  // Deserialize from save
  static deserialize(data) {
    const system = new EnergySystem(data.max);
    system.currentEnergy = data.current;
    system.exhausted = data.exhausted;
    return system;
  }
}
