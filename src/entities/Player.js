import Phaser from 'phaser';
import { gameState } from '../core/GameState.js';
import { eventBus } from '../core/EventBus.js';
import { StateMachine, State } from '../systems/StateMachine.js';
import { SCALE, PHYSICS, DEPTH, ASSETS, EVENTS } from '../core/Constants.js';

class IdleState extends State {
  enter() {
    this.context.stopVelocity();
    this.context.playBodyAnim('idle');
    gameState.setPlayerState('idle');
    eventBus.emit(EVENTS.PLAYER_STATE_CHANGE, { state: 'idle' });
  }
  update() {
    if (this.context.isMovingInput()) this.machine.transition('walk');
  }
}

class WalkState extends State {
  enter() {
    this.context.playBodyAnim('walk');
    gameState.setPlayerState('walking');
    eventBus.emit(EVENTS.PLAYER_STATE_CHANGE, { state: 'walking' });
  }
  update(delta) {
    if (!this.context.isMovingInput()) { this.machine.transition('idle'); return; }
    this.context.updateMovement(delta);
  }
  exit() { this.context.stopVelocity(); }
}

class FishingState extends State {
  enter(data) {
    const phase = data?.phase || 'throw';
    this.context.hideClothing();
    this.context.playBodyAnim(phase);
    gameState.setPlayerState('fishing');
    eventBus.emit(EVENTS.PLAYER_STATE_CHANGE, { state: 'fishing', phase });
  }
  update() {}
  exit() { this.context.showClothing(); }
}

export class Player {
  constructor(scene, x, y, config = {}) {
    this.scene     = scene;
    this.skin      = config.skin      || 'light';
    this.hairStyle = config.hair      || 'short_hair';
    this.hairColor = config.hairColor || 'brown_light';
    this.shirt     = config.shirt     || 'blue_light';
    this.pants     = config.pants     || 'brown';
    this.facing    = 'down';
    this._isIdle   = false;

    // Container
    this.container = scene.add.container(x, y).setDepth(DEPTH.PLAYER);

    // Shadow ellipse
    this.shadow = scene.add.ellipse(0, 6, 14, 5, 0x000000, 0.2).setOrigin(0.5);

    // Body
    this.body = scene.add.sprite(0, 0, `walk_body_${this.skin}`)
      .setOrigin(0.5, 0.75).setScale(SCALE.PLAYER);

    // Sync all clothing frames whenever body animation advances
    this.body.on('animationupdate', (_anim, frame) => {
      const idx = frame.index;
      [this.pantsSprite, this.shirtSprite, this.hairSprite].forEach(s => {
        if (s) s.setFrame(idx);
      });
    });

    // Clothing layers
    this.pantsSprite = this._makeLayer(`walk_pants_${this.pants}`);
    this.shirtSprite = this._makeLayer(`walk_shirt_${this.shirt}`);
    this.hairSprite  = this._makeLayer(`walk_hair_${this.hairStyle}_${this.hairColor}`);

    this.container.add([
      this.shadow, this.body,
      this.pantsSprite, this.shirtSprite, this.hairSprite
    ].filter(Boolean));

    // Physics
    scene.physics.world.enable(this.container);
    this.physicsBody = this.container.body;
    this.physicsBody.setCircle(4, -4, -2);
    this.physicsBody.setCollideWorldBounds(true);
    this.physicsBody.setDrag(300);

    // Input state
    this.input = { up: false, down: false, left: false, right: false };

    // State machine
    this.stateMachine = new StateMachine(this);
    this.stateMachine
      .register('idle',    new IdleState('idle'))
      .register('walk',    new WalkState('walk'))
      .register('fishing', new FishingState('fishing'))
      .transition('idle');

    this.setDirectionFrame();
  }

  _makeLayer(key) {
    if (!this.scene.textures.exists(key)) return null;
    return this.scene.add.sprite(0, 0, key)
      .setOrigin(0.5, 0.75).setScale(SCALE.PLAYER);
  }

  get x() { return this.container.x; }
  get y() { return this.container.y; }

  setInputState(input) {
    this.input = input;
    const old = this.facing;
    if      (input.left)  this.facing = 'left';
    else if (input.right) this.facing = 'right';
    else if (input.up)    this.facing = 'up';
    else if (input.down)  this.facing = 'down';
    if (old !== this.facing) this.setDirectionFrame();
  }

  isMovingInput() {
    return this.input.up || this.input.down || this.input.left || this.input.right;
  }

  updateMovement(delta) {
    let vx = 0, vy = 0;
    if (this.input.left)  vx = -PHYSICS.PLAYER_SPEED;
    if (this.input.right) vx =  PHYSICS.PLAYER_SPEED;
    if (this.input.up)    vy = -PHYSICS.PLAYER_SPEED;
    if (this.input.down)  vy =  PHYSICS.PLAYER_SPEED;
    if (vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707; }
    this.physicsBody.setVelocity(vx, vy);

    // Sync clothing to current body frame
    const frame = this.body.frame.name;
    [this.pantsSprite, this.shirtSprite, this.hairSprite].forEach(s => {
      if (s) s.setFrame(frame);
    });
  }

  stopVelocity() { this.physicsBody.setVelocity(0, 0); }

  playBodyAnim(animType) {
    const isFishing = ['throw','catch','reel','pull'].includes(animType);
    const isIdle    = animType === 'idle';

    // Build animation key
    const animKey = isFishing
      ? `${animType}_${this.skin}`                     // fishing: no direction
      : `${animType}_${this.skin}_${this.facing}`;     // walk/idle: directional

    if (this.scene.anims.exists(animKey)) {
      this.body.play(animKey, true);
    }

    // Switch hair to idle or walk variant
    // Idle hair has proper idle poses; walk hair is used for walk/fish states
    if (this.hairSprite && !isFishing) {
      const hairPrefix = isIdle ? 'idle_hair' : 'walk_hair';
      const hairKey    = `${hairPrefix}_${this.hairStyle}_${this.hairColor}`;
      const fallback   = `walk_hair_${this.hairStyle}_${this.hairColor}`;
      const target     = this.scene.textures.exists(hairKey) ? hairKey : fallback;
      if (this.hairSprite.texture.key !== target) {
        this.hairSprite.setTexture(target);
        // Reset frame to match current direction
        const dirs = { down: 0, left: 1, right: 2, up: 3 };
        const dirIdx = dirs[this.facing] || 0;
        this.hairSprite.setFrame(dirIdx * 2); // 2 frames per dir for idle
      }
    }

    this._isIdle = isIdle;
  }

  // Fishing helpers
  startFishing()  { this.playBodyAnim('throw'); }
  playReel()      { this.playBodyAnim('reel');  }
  playCatch()     { this.playBodyAnim('catch'); }
  stopFishing()   { this.showClothing(); }

  setDirectionFrame() {
    const dirs  = { down: 0, left: 1, right: 2, up: 3 };
    const base  = (dirs[this.facing] || 0) * 6; // walk: 6 frames/dir
    this.body.setFrame(base);
    [this.pantsSprite, this.shirtSprite, this.hairSprite].forEach(s => {
      if (s) s.setFrame(base);
    });
  }

  hideClothing() {
    [this.pantsSprite, this.shirtSprite, this.hairSprite].forEach(s => {
      if (s) s.setVisible(false);
    });
  }

  showClothing() {
    [this.pantsSprite, this.shirtSprite, this.hairSprite].forEach(s => {
      if (s) s.setVisible(true);
    });
    this.setDirectionFrame();
  }

  update(delta) {
    this.stateMachine.update(delta);
    this.container.setDepth(DEPTH.PLAYER + Math.floor(this.y / 100) * 0.1);
    gameState.setPlayerPosition(this.x, this.y);
  }
}
