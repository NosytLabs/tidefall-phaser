/**
 * GameState - Singleton for centralized game state
 * Must be restart-safe: reset() restores clean slate
 */
class GameState {
  constructor() {
    this.reset();
  }

  reset() {
    // Player state
    this.player = {
      x: 320,
      y: 160,
      facing: 'down',
      state: 'idle',
      energy: 100,
      maxEnergy: 100
    };

    // Game progress
    this.game = {
      day: 1,
      timeOfDay: 'day',
      totalCaught: 0,
      gold: 0,
      weather: 'sunny'
    };

    // Inventory
    this.inventory = [];

    // Encyclopedia
    this.encyclopedia = {
      discovered: new Set(),
      caught: {} // fishId -> count
    };

    // Quests
    this.quests = {
      active: [],
      completed: []
    };

    // Settings
    this.settings = {
      muted: false,
      fullscreen: false
    };

    // Systems state
    this.fishing = {
      state: 'idle',
      currentFish: null
    };

    return this;
  }

  // Player methods
  setPlayerPosition(x, y) {
    this.player.x = x;
    this.player.y = y;
  }

  setPlayerState(state) {
    this.player.state = state;
  }

  consumeEnergy(amount) {
    this.player.energy = Math.max(0, this.player.energy - amount);
    return this.player.energy > 0;
  }

  restoreEnergy(amount) {
    this.player.energy = Math.min(this.player.maxEnergy, this.player.energy + amount);
  }

  // Inventory methods
  addFish(fish, weight) {
    this.inventory.push({ fish, weight, caughtAt: Date.now() });
    this.game.totalCaught++;
    
    // Track in encyclopedia
    if (!this.encyclopedia.caught[fish.id]) {
      this.encyclopedia.caught[fish.id] = { count: 0, totalWeight: 0 };
    }
    this.encyclopedia.caught[fish.id].count++;
    this.encyclopedia.caught[fish.id].totalWeight += weight;
    this.encyclopedia.discovered.add(fish.id);
  }

  // Serialization for save/load
  serialize() {
    return {
      player: { ...this.player },
      game: { ...this.game },
      inventory: [...this.inventory],
      encyclopedia: {
        discovered: Array.from(this.encyclopedia.discovered),
        caught: { ...this.encyclopedia.caught }
      },
      quests: {
        active: [...this.quests.active],
        completed: [...this.quests.completed]
      },
      settings: { ...this.settings }
    };
  }

  deserialize(data) {
    if (data.player) this.player = { ...this.player, ...data.player };
    if (data.game) this.game = { ...this.game, ...data.game };
    if (data.inventory) this.inventory = [...data.inventory];
    if (data.encyclopedia) {
      this.encyclopedia.discovered = new Set(data.encyclopedia.discovered || []);
      this.encyclopedia.caught = { ...data.encyclopedia.caught };
    }
    if (data.quests) {
      this.quests.active = [...data.quests.active];
      this.quests.completed = [...data.quests.completed];
    }
    if (data.settings) this.settings = { ...data.settings };
    return this;
  }
}

// Singleton instance
export const gameState = new GameState();
export default gameState;
