  import { eventBus } from '../core/EventBus.js';
import { EVENTS } from '../core/Constants.js';

/**
 * QuestSystem - Manages quests from NPCs
 * 
 * Quests have stages, requirements, and rewards.
 * Inspired by Stardew Valley's quest board.
 */
export class QuestSystem {
  constructor() {
    this.activeQuests = [];
    this.completedQuests = [];
    this.availableQuests = this.getDefaultQuests();
    this.eventBus = eventBus;
  }

  getDefaultQuests() {
    return [
      {
        id: 'first_catch',
        title: 'First Catch',
        description: 'Catch any fish to get started!',
        giver: 'Fisherman Joe',
        type: 'catch_count',
        requirements: { count: 1 },
        reward: { gold: 50, items: ['bait_basic'] },
        progress: 0,
        completed: false,
      },
      {
        id: 'catch_5_fish',
        title: 'Getting Started',
        description: 'Catch 5 fish to prove your skills.',
        giver: 'Fisherman Joe',
        type: 'catch_count',
        requirements: { count: 5 },
        reward: { gold: 200, items: ['bait_quality'] },
        progress: 0,
        completed: false,
      },
      {
        id: 'catch_bass',
        title: 'Bass Hunter',
        description: 'Catch 3 Bass for the village dinner.',
        giver: 'Chef Gordon',
        type: 'catch_specific',
        requirements: { fishId: 'bass', count: 3 },
        reward: { gold: 150, items: ['food_sandwich'] },
        progress: 0,
        completed: false,
      },
      {
        id: 'rare_catch',
        title: 'Rare Find',
        description: 'Catch a Rare quality fish.',
        giver: 'Mayor Elsa',
        type: 'catch_rarity',
        requirements: { rarity: 'rare', count: 1 },
        reward: { gold: 500, items: ['rod_fiberglass'] },
        progress: 0,
        completed: false,
      },
      {
        id: 'legendary_hunter',
        title: 'Legendary Hunter',
        description: 'Catch a Legendary fish! Only the best can do this.',
        giver: 'Fisherman Joe',
        type: 'catch_rarity',
        requirements: { rarity: 'legendary', count: 1 },
        reward: { gold: 2000, items: ['rod_carbon'] },
        progress: 0,
        completed: false,
      },
      {
        id: 'big_fish',
        title: 'The Big One',
        description: 'Catch a fish weighing over 20kg.',
        giver: 'Fisherman Joe',
        type: 'catch_weight',
        requirements: { minWeight: 20 },
        reward: { gold: 300, items: ['bait_premium'] },
        progress: 0,
        completed: false,
      },
      {
        id: 'shark_hunter',
        title: 'Shark Week',
        description: 'Catch any shark species.',
        giver: 'Mayor Elsa',
        type: 'catch_category',
        requirements: { fishIds: ['shark_greatwhite', 'shark_hammerhead', 'shark_saw', 'shark_whale'] },
        reward: { gold: 800, items: ['bait_premium'] },
        progress: 0,
        completed: false,
      },
      {
        id: 'collector_10',
        title: 'Collector',
        description: 'Catch 10 different species of fish.',
        giver: 'Mayor Elsa',
        type: 'unique_species',
        requirements: { count: 10 },
        reward: { gold: 500, items: ['food_stew'] },
        progress: 0,
        completed: false,
      },
      {
        id: 'master_angler',
        title: 'Master Angler',
        description: 'Catch 20 different species of fish.',
        giver: 'Fisherman Joe',
        type: 'unique_species',
        requirements: { count: 20 },
        reward: { gold: 2000, title: 'Master Angler' },
        progress: 0,
        completed: false,
      },
      {
        id: 'earn_1000',
        title: 'Entrepreneur',
        description: 'Earn 1000 gold from fishing.',
        giver: 'Chef Gordon',
        type: 'earn_gold',
        requirements: { amount: 1000 },
        reward: { gold: 500, items: ['food_stew'] },
        progress: 0,
        completed: false,
      },
    ];
  }

  // Accept a quest
  acceptQuest(questId) {
    const quest = this.availableQuests.find(q => q.id === questId);
    if (quest) {
      this.availableQuests = this.availableQuests.filter(q => q.id !== questId);
      this.activeQuests.push({ ...quest, acceptedAt: Date.now() });
      this.eventBus.emit('questAccepted', quest);
      return true;
    }
    return false;
  }

  // Check and update quest progress
  onFishCaught(fish, weight, goldEarned) {
    this.activeQuests.forEach(quest => {
      if (quest.completed) return;

      switch (quest.type) {
        case 'catch_count':
          quest.progress++;
          if (quest.progress >= quest.requirements.count) this.completeQuest(quest);
          break;

        case 'catch_specific':
          if (fish.id === quest.requirements.fishId) {
            quest.progress++;
            if (quest.progress >= quest.requirements.count) this.completeQuest(quest);
          }
          break;

        case 'catch_rarity': {
          const rarityOrder = { common: 0, uncommon: 1, rare: 2, legendary: 3 };
          const requiredLevel = rarityOrder[quest.requirements.rarity] || 0;
          const caughtLevel = rarityOrder[fish.rarity] || 0;
          if (caughtLevel >= requiredLevel) {
            quest.progress++;
            if (quest.progress >= quest.requirements.count) this.completeQuest(quest);
          }
          break;
        }

        case 'catch_weight':
          if (weight >= quest.requirements.minWeight) {
            quest.progress = 1;
            this.completeQuest(quest);
          }
          break;

        case 'catch_category':
          if (quest.requirements.fishIds.includes(fish.id)) {
            quest.progress = 1;
            this.completeQuest(quest);
          }
          break;

        case 'earn_gold':
          quest.progress += goldEarned;
          if (quest.progress >= quest.requirements.amount) this.completeQuest(quest);
          break;
      }
    });
  }

  // Update unique species quests
  updateSpeciesQuests(uniqueSpeciesCount) {
    this.activeQuests.forEach(quest => {
      if (quest.type === 'unique_species' && !quest.completed) {
        quest.progress = uniqueSpeciesCount;
        if (quest.progress >= quest.requirements.count) this.completeQuest(quest);
      }
    });
  }

  completeQuest(quest) {
    quest.completed = true;
    quest.completedAt = Date.now();
    this.completedQuests.push(quest);
    this.activeQuests = this.activeQuests.filter(q => q.id !== quest.id);
    this.eventBus.emit('questCompleted', quest);
  }

  getActiveQuests() {
    return this.activeQuests.filter(q => !q.completed);
  }

  getCompletedQuests() {
    return this.completedQuests;
  }

  getAvailableQuests() {
    return this.availableQuests;
  }

  serialize() {
    return {
      active: this.activeQuests,
      completed: this.completedQuests,
      available: this.availableQuests,
    };
  }

  static deserialize(data) {
    const system = new QuestSystem();
    if (data) {
      system.activeQuests = data.active || [];
      system.completedQuests = data.completed || [];
      system.availableQuests = data.available || system.getDefaultQuests();
    }
    return system;
  }
}
