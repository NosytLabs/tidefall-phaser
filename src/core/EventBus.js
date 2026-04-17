import Phaser from 'phaser';

/**
 * EventBus - Singleton for cross-scene communication
 * Use domain:action naming convention
 */
class EventBus extends Phaser.Events.EventEmitter {
  constructor() {
    super();
  }

  // Domain constants for event names
  static DOMAINS = {
    GAME: 'game',
    PLAYER: 'player',
    FISHING: 'fishing',
    UI: 'ui',
    AUDIO: 'audio',
    SAVE: 'save'
  };

  emit(event, ...args) {
    // Debug logging disabled for production
    // console.log(`[EventBus] ${event}`, args);
    return super.emit(event, ...args);
  }
}

// Singleton instance
export const eventBus = new EventBus();
export default eventBus;
