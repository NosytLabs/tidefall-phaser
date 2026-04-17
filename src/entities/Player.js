import Phaser from 'phaser';
import { gameState } from '../core/GameState.js';
import { eventBus } from '../core/EventBus.js';
import { StateMachine, State } from '../systems/StateMachine.js';
import { 
  PHYSICS, 
  ANIMATION, 
  SCALE, 
  ASSETS, 
  EVENTS,
  DEPTH 
} from '../core/Constants.js';

/**
 * Player states for StateMachine
 */
class IdleState extends State {
  enter() {
    this.context.stopVelocity();
    this.context.playAnimation('idle');
    this.context.restoreClothingLayers(); // Ensure layers visible
    gameState.setPlayerState('idle');
    eventBus.emit(EVENTS.PLAYER_STATE_CHANGE, { state: 'idle' });
  }
  
  update(delta) {
    if (this.context.isMovingInput()) {
      this.machine.transition('walk');
    }
  }
}

class WalkState extends State {
  enter() {
    this.context.playAnimation('walk');
    this.context.restoreClothingLayers(); // Ensure layers visible
    gameState.setPlayerState('walking');
    eventBus.emit(EVENTS.PLAYER_STATE_CHANGE, { state: 'walking' });
  }
  
  update(delta) {
    if (!this.context.isMovingInput()) {
      this.machine.transition('idle');
      return;
    }
    
    this.context.updateMovement(delta);
  }
  
  exit() {
    this.context.stopVelocity();
  }
}

class DiveState extends State {
  enter(data) {
    // Diving doesn't show clothing (underwater)
    this.context.hideClothingLayers();
    this.context.playAnimation('dive');
    gameState.setPlayerState('diving');
    eventBus.emit(EVENTS.PLAYER_STATE_CHANGE, { state: 'diving' });
  }
  
  update(delta) {
    // Diving handled by DiveScene
  }
  
  exit() {
    this.context.restoreClothingLayers();
  }
}

class FarmState extends State {
  enter(data) {
    // Farming shows full clothing
    this.context.restoreClothingLayers();
    this.context.playAnimation('tool');
    gameState.setPlayerState('farming');
    eventBus.emit(EVENTS.PLAYER_STATE_CHANGE, { state: 'farming' });
  }
  
  update(delta) {
    // Farming handled by FarmScene
  }
  
  exit() {
    this.context.restoreClothingLayers();
  }
}

class FishingState extends State {
  enter(data) {
    const phase = data?.phase || 'throw';
    
    // Hide clothing layers during throw/catch/reel (specialized sprites)
    // Show layers during idle fishing
    if (phase === 'throw' || phase === 'catch' || phase === 'reel') {
      this.context.hideClothingLayers();
    } else {
      this.context.restoreClothingLayers();
    }
    
    this.context.playAnimation(phase);
    gameState.setPlayerState('fishing');
    eventBus.emit(EVENTS.PLAYER_STATE_CHANGE, { state: 'fishing', phase });
  }
  
  update(delta) {
    // Fishing animation handled by FishingSystem
    // Only sync layers when dirty flag is set (not every frame)
    if (this.context._layerSyncDirty && this.context.pantsSprite.visible) {
      this.context.syncLayers();
      this.context._layerSyncDirty = false;
    }
  }
  
  exit() {
    this.context.restoreClothingLayers();
  }
}

/**
 * Player - Optimized character controller with sprite pooling and proper animation handling
 * 
 * Optimizations:
 * - Sprite layer pooling for clothing
 * - Dirty flag for layer syncing (reduces per-frame calculations)
 * - Cached texture existence checks
 * - Proper cleanup on scene shutdown
 * - Animation-aware layer visibility
 */
export class Player {
  /**
   * @param {Phaser.Scene} scene - The scene this player belongs to
   * @param {number} x - Initial X position
   * @param {number} y - Initial Y position
   * @param {Object} config - Player appearance configuration
   */
  constructor(scene, x, y, config = {}) {
    this.scene = scene;
    
    // Appearance config with defaults
    this.skinTone = config.skinTone || 'light';
    this.hairColor = config.hairColor || 'brown_light';
    this.shirtColor = config.shirtColor || 'blue_light';
    this.pantsColor = config.pantsColor || 'brown';
    this.hairStyle = config.hairStyle || 'short_hair';
    this.facing = 'down';
    
    // Performance: Cache texture existence
    this._textureCache = new Map();
    
    // Performance: Dirty flag for layer sync
    this._layerSyncDirty = true;
    this._lastFrame = -1;
    
    // Track which animations have clothing support
    this._clothingSupport = new Map();
    
    // Performance: Container for layered sprites
    this.container = scene.add.container(x, y);
    this.container.setDepth(DEPTH.PLAYER);
    
    // Shadow under feet
    const shadow = scene.add.ellipse(0, 6, 14, 6, 0x000000, 0.25).setOrigin(0.5);
    
    // Sprite layers with origin and scale
    const origin = [0.5, 0.75];
    const spriteScale = SCALE.PLAYER;
    
    // Body sprite - determines animation frame
    this.bodySprite = scene.add.sprite(0, 0, `walk_body_${this.skinTone}`)
      .setOrigin(...origin).setScale(spriteScale);
    
    // Pool clothing sprites from scene's sprite pool if available
    this.pantsSprite = this._getLayerSprite(`walk_pants_${this.pantsColor}`, origin, spriteScale);
    this.shirtSprite = this._getLayerSprite(`walk_shirt_${this.shirtColor}`, origin, spriteScale);
    this.hairSprite = this._getLayerSprite(`walk_hair_${this.hairStyle}_${this.hairColor}`, origin, spriteScale);
    
    // Try to load idle variants if available
    this.idlePantsSprite = this._getLayerSprite(`idle_pants_${this.pantsColor}`, origin, spriteScale);
    this.idleShirtSprite = this._getLayerSprite(`idle_shirt_${this.shirtColor}`, origin, spriteScale);
    this.idleHairSprite = this._getLayerSprite(`idle_hair_${this.hairStyle}_${this.hairColor}`, origin, spriteScale);
    
    // Hide idle variants initially (not added to container)
    this.idlePantsSprite.setVisible(false);
    this.idleShirtSprite.setVisible(false);
    this.idleHairSprite.setVisible(false);
    
    // Hide missing layers
    this._validateLayers();
    
    this.container.add([shadow, this.bodySprite, this.pantsSprite, this.shirtSprite, this.hairSprite]);
    
    // Physics
    scene.physics.world.enable(this.container);
    this.body = this.container.body;
    this.body.setCircle(PHYSICS.COLLIDER_SIZE, -5, -2);
    this.body.setCollideWorldBounds(true);
    this.body.setDrag(500); // Add drag for smoother stopping
    
    // Input state with input buffering for smoother controls
    this.inputState = { 
      left: false, 
      right: false, 
      up: false, 
      down: false,
      bufferedAction: null,
      bufferTime: 0
    };
    this.INPUT_BUFFER_DURATION = 100; // ms
    
    // State machine
    this.stateMachine = new StateMachine(this);
    this.stateMachine
      .register('idle', new IdleState('idle'))
      .register('walk', new WalkState('walk'))
      .register('fishing', new FishingState('fishing'))
      .register('diving', new DiveState('diving'))
      .register('farming', new FarmState('farming'))
      .transition('idle');
    
    // Initial frame
    this.setDirectionFrame();
    this.syncLayers();
    
    // Performance: Throttled position updates
    this._lastPositionUpdate = { x, y };
    this._positionUpdateThreshold = 2; // Only emit after 2px movement
    
    // Emit spawn event
    eventBus.emit(EVENTS.PLAYER_MOVE, { x, y });
    
    // Cleanup on scene shutdown
    scene.events.on('shutdown', this.destroy, this);
    scene.events.on('destroy', this.destroy, this);
  }
  
  /**
   * Get or create a sprite for a clothing layer
   * @private
   */
  _getLayerSprite(key, origin, scale) {
    if (this.scene.spritePool?.acquire) {
      return this.scene.spritePool.acquire(0, 0, { texture: key });
    }
    return this.scene.add.sprite(0, 0, key).setOrigin(...origin).setScale(scale);
  }
  
  /**
   * Check if texture exists with caching
   * @private
   */
  _textureExists(key) {
    if (!this._textureCache.has(key)) {
      this._textureCache.set(key, this.scene.textures.exists(key));
    }
    return this._textureCache.get(key);
  }
  
  /**
   * Validate and hide missing layer textures
   * @private
   */
  _validateLayers() {
    [this.pantsSprite, this.shirtSprite, this.hairSprite,
     this.idlePantsSprite, this.idleShirtSprite, this.idleHairSprite].forEach(s => {
      if (!this._textureExists(s.texture.key)) {
        s.setVisible(false);
      }
    });
  }
  
  /**
   * Check if a specific animation type has clothing support
   * @private
   */
  _hasClothingSupport(animType) {
    if (!this._clothingSupport.has(animType)) {
      // Check if walk variants exist (used as fallback)
      const hasPants = this._textureExists(`walk_pants_${this.pantsColor}`);
      const hasShirt = this._textureExists(`walk_shirt_${this.shirtColor}`);
      const hasHair = this._textureExists(`walk_hair_${this.hairStyle}_${this.hairColor}`);
      
      // Idle animations have 2 frames per direction vs walk's 6
      // We can still use walk sprites by mapping frames
      this._clothingSupport.set(animType, { pants: hasPants, shirt: hasShirt, hair: hasHair });
    }
    return this._clothingSupport.get(animType);
  }
  
  // Getters
  get x() { return this.container.x; }
  get y() { return this.container.y; }
  
  // Physics body delegation
  /**
   * @param {number|Object} x - Velocity X or velocity object
   * @param {number} y - Velocity Y
   */
  setVelocity(x, y) {
    if (this.body) {
      if (typeof x === 'object') {
        this.body.setVelocity(x.x, x.y);
      } else {
        this.body.setVelocity(x, y);
      }
    }
  }
  
  setVelocityX(x) {
    if (this.body) this.body.setVelocityX(x);
  }
  
  setVelocityY(y) {
    if (this.body) this.body.setVelocityY(y);
  }
  
  setPosition(x, y) {
    this.container.setPosition(x, y);
    if (this.body) {
      this.body.reset(x, y);
    }
  }
  
  /**
   * Set input state with optional buffering
   * @param {Object} input - Input state object
   * @param {boolean} bufferAction - Whether to buffer this action
   */
  setInputState(input, bufferAction = false) {
    this.inputState = { ...this.inputState, ...input };
    
    // Update facing based on input
    if (input.left || input.right || input.up || input.down) {
      const oldFacing = this.facing;
      
      if (Math.abs(input.x || 0) > Math.abs(input.y || 0)) {
        this.facing = (input.x || 0) < 0 ? 'left' : 'right';
      } else if (input.y) {
        this.facing = input.y < 0 ? 'up' : 'down';
      }
      
      // Mark dirty if facing changed
      if (oldFacing !== this.facing) {
        this._layerSyncDirty = true;
      }
    }
    
    if (bufferAction && input.action) {
      this.inputState.bufferedAction = input.action;
      this.inputState.bufferTime = this.scene.time.now;
    }
  }
  
  /**
   * Get buffered action if within buffer window
   */
  getBufferedAction() {
    if (this.inputState.bufferedAction && 
        this.scene.time.now - this.inputState.bufferTime < this.INPUT_BUFFER_DURATION) {
      const action = this.inputState.bufferedAction;
      this.inputState.bufferedAction = null;
      return action;
    }
    this.inputState.bufferedAction = null;
    return null;
  }
  
  isMovingInput() {
    return this.inputState.left || this.inputState.right || 
           this.inputState.up || this.inputState.down;
  }
  
  /**
   * Update player movement with delta time
   * @param {number} delta - Time since last frame in ms
   */
  updateMovement(delta) {
    let vx = 0, vy = 0;
    
    if (this.inputState.left) vx = -PHYSICS.PLAYER_SPEED;
    else if (this.inputState.right) vx = PHYSICS.PLAYER_SPEED;
    if (this.inputState.up) vy = -PHYSICS.PLAYER_SPEED;
    else if (this.inputState.down) vy = PHYSICS.PLAYER_SPEED;
    
    // Normalize diagonal
    if (vx !== 0 && vy !== 0) {
      vx *= 0.707;
      vy *= 0.707;
    }
    
    this.body.setVelocity(vx, vy);
    
    // Consume energy
    if (vx !== 0 || vy !== 0) {
      gameState.consumeEnergy(PHYSICS.COST_WALK || 0.01);
    }
    
    // Update animation
    this.playAnimation('walk');
    
    // Mark layers for sync
    this._layerSyncDirty = true;
    
    // Throttled position update
    const dx = this.x - this._lastPositionUpdate.x;
    const dy = this.y - this._lastPositionUpdate.y;
    if (Math.abs(dx) > this._positionUpdateThreshold || 
        Math.abs(dy) > this._positionUpdateThreshold) {
      eventBus.emit(EVENTS.PLAYER_MOVE, { x: this.x, y: this.y });
      this._lastPositionUpdate = { x: this.x, y: this.y };
    }
  }
  
  stopVelocity() {
    this.body.setVelocity(0, 0);
  }
  
  /**
   * Play animation by type
   * @param {string} type - Animation type (walk, idle, throw, catch, reel)
   */
  playAnimation(type) {
    const animKey = `${type}_${this.skinTone}_${this.facing}`;
    
    if (this.scene.anims.exists(animKey)) {
      this.bodySprite.play(animKey, true);
      
      // Check if we should show clothing for this animation type
      const support = this._hasClothingSupport(type);
      
      // For walk/idle: always show if available
      // For throw/catch/reel: only show if specialized sprites exist
      const shouldShowClothing = (type === 'walk' || type === 'idle') || 
        (support.pants || support.shirt || support.hair);
      
      if (shouldShowClothing) {
        this.restoreClothingLayers();
      } else {
        this.hideClothingLayers();
      }
    }
  }
  
  /**
   * Sync clothing layers to body sprite frame
   * Optimized with dirty flag to reduce per-frame calculations
   */
  syncLayers() {
    // Skip if not dirty and frame hasn't changed
    if (!this._layerSyncDirty && this.bodySprite.frame.name === this._lastFrame) {
      return;
    }
    
    if (!this.bodySprite?.frame) return;
    
    const idx = this.bodySprite.frame.name;
    this._lastFrame = idx;
    this._layerSyncDirty = false;
    
    // Map animation frame to walk sprite frame
    // Walk animations: 6 frames per direction (down: 0-5, left: 6-11, right: 12-17, up: 18-23)
    // Idle animations: 2 frames per direction (down: 0-1, left: 2-3, right: 4-5, up: 6-7)
    // Throw animations: 6 frames per direction
    // Catch animations: 5 frames per direction
    // Reel animations: 4 frames per direction
    
    const isIdle = this.stateMachine?.isInState('idle');
    const currentAnim = this.bodySprite.anims.currentAnim?.key || '';
    
    let walkIdx;
    if (isIdle) {
      // Map idle frame to walk frame
      // Idle: dirIndex * 2 + offset -> Walk: dirIndex * 6
      const dirIndex = Math.floor(idx / 2);
      const idleOffset = idx % 2;
      walkIdx = dirIndex * 6 + idleOffset * 3; // Spread idle frames across walk
    } else {
      // Already in walk frame format
      const dirIndex = Math.floor(idx / 6);
      const walkOffset = idx % 6;
      walkIdx = dirIndex * 6 + walkOffset;
    }
    
    [this.pantsSprite, this.shirtSprite, this.hairSprite].forEach(s => {
      if (s.visible && s.texture) {
        try { 
          s.setFrame(walkIdx); 
        } catch(e) {
          // Frame doesn't exist, hide this layer
          s.setVisible(false);
        }
      }
    });
  }
  
  setDirectionFrame() {
    const dirMap = { down: 0, left: 1, right: 2, up: 3 };
    const dirIdx = dirMap[this.facing] || 0;
    
    const isIdle = this.stateMachine?.isInState('idle') ?? true;
    const fpd = isIdle ? 2 : 6; // frames per direction
    const frameIndex = dirIdx * fpd;
    
    this.bodySprite.setFrame(frameIndex);
    this._layerSyncDirty = true;
    
    // Sync clothing to match
    const walkIdx = dirIdx * 6; // Walk always has 6 frames per direction
    [this.pantsSprite, this.shirtSprite, this.hairSprite].forEach(s => {
      if (s.visible && s.texture) {
        try { s.setFrame(walkIdx); } catch(e) {}
      }
    });
  }
  
  /**
   * Hide all clothing layers (for special animations)
   */
  hideClothingLayers() {
    this.pantsSprite.setVisible(false);
    this.shirtSprite.setVisible(false);
    this.hairSprite.setVisible(false);
  }
  
  /**
   * Restore clothing layers (if textures exist)
   */
  restoreClothingLayers() {
    this._setLayer(this.pantsSprite, `walk_pants_${this.pantsColor}`);
    this._setLayer(this.shirtSprite, `walk_shirt_${this.shirtColor}`);
    this._setLayer(this.hairSprite, `walk_hair_${this.hairStyle}_${this.hairColor}`);
    
    // Mark for sync
    this._layerSyncDirty = true;
  }

  _setLayer(sprite, key) {
    if (this._textureExists(key)) {
      // Only update if different texture
      if (sprite.texture.key !== key) {
        sprite.setTexture(key);
      }
      sprite.setVisible(true);
    } else {
      sprite.setVisible(false);
    }
  }
  
  // Fishing transitions with proper animation handling
  startFishing() {
    this.stateMachine.transition('fishing', { phase: 'throw' });
  }
  
  stopFishing() {
    this.stateMachine.transition('idle');
    this.setDirectionFrame();
  }
  
  playReel() {
    this.stateMachine.transition('fishing', { phase: 'reel' });
    this.playAnimation('reel');
  }
  
  playCatch() {
    this.stateMachine.transition('fishing', { phase: 'catch' });
    this.playAnimation('catch');
    
    // Restore clothing after catch animation
    this.scene.time.delayedCall(600, () => {
      this.restoreClothingLayers();
    });
  }

  playDive() {
    this.playAnimation('dive');
  }

  playTool() {
    this.playAnimation('tool');
  }

  startDiving() {
    this.stateMachine.transition('diving', {});
  }

  stopDiving() {
    this.stateMachine.transition('idle');
    this.setDirectionFrame();
  }

  startFarming() {
    this.stateMachine.transition('farming', {});
  }

  stopFarming() {
    this.stateMachine.transition('idle');
    this.setDirectionFrame();
  }
  
  /**
   * Main update loop - optimized
   * @param {number} delta - Time since last frame in ms
   */
  update(delta) {
    this.stateMachine.update(delta);
    
    // Only sync layers if visible
    if (this.pantsSprite.visible || this.shirtSprite.visible || this.hairSprite.visible) {
      this.syncLayers();
    }
    
    // Batch gameState update
    gameState.setPlayerPosition(this.x, this.y);
    
    // Update depth based on Y position for proper sorting
    this.container.setDepth(DEPTH.PLAYER + Math.floor(this.y / 100) * 0.1);
  }
  
  /**
   * Proper cleanup with sprite pooling
   */
  destroy() {
    // Remove event listeners
    eventBus.off(EVENTS.FISHING_STATE_CHANGE);
    this.scene.events.off('shutdown', this.destroy, this);
    this.scene.events.off('destroy', this.destroy, this);
    
    // Return sprites to pool if available
    if (this.scene.spritePool?.release) {
      [this.pantsSprite, this.shirtSprite, this.hairSprite].forEach(s => {
        if (s) this.scene.spritePool.release(s);
      });
    }
    
    // Destroy container (and children)
    if (this.container) {
      this.container.destroy();
    }
    
    // Clear cache
    this._textureCache.clear();
    this._clothingSupport.clear();
  }
}
