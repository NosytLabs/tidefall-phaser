import Phaser from 'phaser';
import { gameState } from '../core/GameState.js';
import { eventBus } from '../core/EventBus.js';
import { StateMachine, State } from '../systems/StateMachine.js';
import { SCALE, PHYSICS, DEPTH, ASSETS, EVENTS } from '../core/Constants.js';

// State classes
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
    if (!this.context.isMovingInput()) {
      this.machine.transition('idle');
      return;
    }
    this.context.updateMovement(delta);
  }
  exit() { this.context.stopVelocity(); }
}

class FishingState extends State {
  enter(data) {
    const phase = data?.phase || 'idle';
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
    this.scene = scene;
    this.skin = config.skin || 'light';
    this.hairStyle = config.hair || 'short_hair';
    this.hairColor = config.hairColor || 'brown_light';
    this.shirt = config.shirt || 'blue_light';
    this.pants = config.pants || 'brown';
    this.facing = 'down';

    // Container for all sprites
    this.container = scene.add.container(x, y).setDepth(DEPTH.PLAYER);

    // Shadow
    this.shadow = scene.add.ellipse(0, 5, 12, 4, 0x000000, 0.3)
      .setOrigin(0.5);

    // Body (drives animation)
    this.body = scene.add.sprite(0, 0, `walk_body_${this.skin}`)
      .setOrigin(0.5, 0.75)
      .setScale(SCALE.PLAYER);

    // Sync clothing frame to body animation on every frame tick
    this.body.on('animationupdate', (_anim, frame) => {
      const idx = frame.index;
      [this.pantsSprite, this.shirtSprite, this.hairSprite].forEach(s => {
        if (s) s.setFrame(idx);
      });
    });

    // Clothing layers
    this.pantsSprite = this.createLayerSprite(`walk_pants_${this.pants}`);
    this.shirtSprite = this.createLayerSprite(`walk_shirt_${this.shirt}`);
    this.hairSprite = this.createLayerSprite(`walk_hair_${this.hairStyle}_${this.hairColor}`);

    this.container.add([
      this.shadow, this.body,
      this.pantsSprite, this.shirtSprite, this.hairSprite
    ].filter(Boolean));

    // Physics
    scene.physics.world.enable(this.container);
    this.physicsBody = this.container.body;
    this.physicsBody.setCircle(4, -4, -2);
    this.physicsBody.setCollideWorldBounds(true);
    this.physicsBody.setDrag(400);

    // Input state
    this.input = { up: false, down: false, left: false, right: false };

    // State machine
    this.stateMachine = new StateMachine(this);
    this.stateMachine
      .register('idle', new IdleState('idle'))
      .register('walk', new WalkState('walk'))
      .register('fishing', new FishingState('fishing'))
      .transition('idle');

    // Initial frame
    this.setDirectionFrame();
  }

  createLayerSprite(key) {
    if (!this.scene.textures.exists(key)) return null;
    return this.scene.add.sprite(0, 0, key)
      .setOrigin(0.5, 0.75)
      .setScale(SCALE.PLAYER);
  }

  get x() { return this.container.x; }
  get y() { return this.container.y; }

  setInputState(input) {
    this.input = input;
    const oldFacing = this.facing;

    if (input.left) this.facing = 'left';
    else if (input.right) this.facing = 'right';
    else if (input.up) this.facing = 'up';
    else if (input.down) this.facing = 'down';

    if (oldFacing !== this.facing) this.setDirectionFrame();
  }

  isMovingInput() {
    return this.input.up || this.input.down || this.input.left || this.input.right;
  }

  updateMovement(delta) {
    let vx = 0, vy = 0;
    if (this.input.left) vx = -PHYSICS.PLAYER_SPEED;
    if (this.input.right) vx = PHYSICS.PLAYER_SPEED;
    if (this.input.up) vy = -PHYSICS.PLAYER_SPEED;
    if (this.input.down) vy = PHYSICS.PLAYER_SPEED;

    // Normalize diagonal
    if (vx !== 0 && vy !== 0) {
      vx *= 0.707;
      vy *= 0.707;
    }

    this.physicsBody.setVelocity(vx, vy);

    // Sync clothing to body frame
    const frame = this.body.frame.name;
    [this.pantsSprite, this.shirtSprite, this.hairSprite].forEach(s => {
      if (s) s.setFrame(frame);
    });
  }

  stopVelocity() {
    this.physicsBody.setVelocity(0, 0);
  }

  playBodyAnim(animType) {
    // Fishing actions have no directional variants — use skin-only key
    const isFishing = ['throw', 'catch', 'reel', 'pull'].includes(animType);
    const key = isFishing
      ? `${animType}_${this.skin}`
      : `${animType}_${this.skin}_${this.facing}`;
    if (this.scene.anims.exists(key)) {
      this.body.play(key, true);
      // Clothing layers sync via the 'animationupdate' listener on this.body
    }
  }

  // Fishing action animations
  startFishing() { this.playBodyAnim('throw'); }
  playReel() { this.playBodyAnim('reel'); }
  playCatch() { this.playBodyAnim('catch'); }
  stopFishing() { this.showClothing(); }

  setDirectionFrame() {
    const dirs = { down: 0, left: 1, right: 2, up: 3 };
    const idx = dirs[this.facing] || 0;
    // Walk sprites: 6 frames per direction, idle: 2 frames
    const frameIdx = idx * 6; // Start of direction
    this.body.setFrame(frameIdx);
    [this.pantsSprite, this.shirtSprite, this.hairSprite].forEach(s => {
      if (s) s.setFrame(frameIdx);
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
