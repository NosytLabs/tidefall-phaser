import Phaser from 'phaser';

/**
 * NPC - Non-player character with layered appearance
 * Deterministic color assignment from name hash
 */
export class NPC {
  constructor(scene, x, y, config) {
    this.scene = scene;
    this.name = config.name;
    this.role = config.role;
    this.dialogue = config.dialogue || [];
    this.dialogueIndex = 0;
    this.canInteract = false;

    // Deterministic appearance from name hash
    const h = this._hash(config.name);
    const skinTones = ['brown', 'dark', 'light'];
    const hairStyles = ['short_hair', 'long_hair', 'pony_tail', 'spikey', 'big_bun', 'small_hair'];
    const hairColors = ['black', 'blonde', 'blue', 'brown_dark', 'brown_light', 'green', 'pink', 'purple', 'red', 'white'];
    const shirtColors = ['black', 'blue_dark', 'blue_light', 'brown', 'green_dark', 'green_light', 'orange', 'pink', 'red', 'white', 'yellow'];
    const pantsColors = ['black', 'blue_dark', 'blue_light', 'brown', 'green_light', 'orange', 'pink', 'red', 'white', 'yellow'];

    this.skinTone = skinTones[h % skinTones.length];
    this.hairStyle = hairStyles[(h >> 2) % hairStyles.length];
    this.hairColor = hairColors[(h >> 4) % hairColors.length];
    this.shirtColor = shirtColors[(h >> 8) % shirtColors.length];
    this.pantsColor = pantsColors[(h >> 12) % pantsColors.length];
    this.facing = 'down';

    // Container
    this.container = scene.add.container(x, y);

    // Shadow
    const shadow = scene.add.ellipse(0, 6, 14, 6, 0x000000, 0.25).setOrigin(0.5);

    const origin = [0.5, 0.75];
    const spriteScale = 2.0;

    // Determine base type (idle if exists, otherwise walk)
    const bodyBase = scene.textures.exists(`idle_body_${this.skinTone}`) ? 'idle' : 'walk';

    // Create body sprite with idle animation if available
    this.bodySprite = scene.add.sprite(0, 0, `${bodyBase}_body_${this.skinTone}`).setOrigin(...origin).setScale(spriteScale);

    // Create clothing sprites with fallback from idle to walk
    this.pantsSprite = this._createClothingSprite(scene, 'pants', this.pantsColor, origin, spriteScale);
    this.shirtSprite = this._createClothingSprite(scene, 'shirt', this.shirtColor, origin, spriteScale);
    this.hairSprite = this._createClothingSprite(scene, 'hair', `${this.hairStyle}_${this.hairColor}`, origin, spriteScale);

    // Hide missing layers
    [this.pantsSprite, this.shirtSprite, this.hairSprite].forEach(s => {
      if (!scene.textures.exists(s.texture.key)) s.setVisible(false);
    });

    this.container.add([shadow, this.bodySprite, this.pantsSprite, this.shirtSprite, this.hairSprite]);
    this.container.setDepth(10);

    // Idle by default
    this.bodySprite.setFrame(0);
    this.syncLayers();

    // Name label
    this.label = scene.add.text(0, -22, this.name, {
      fontSize: '7px', fontFamily: 'monospace',
      color: '#ffffff', backgroundColor: '#000000aa',
      stroke: '#000000', strokeThickness: 1,
      padding: { x: 2, y: 1 },
    }).setOrigin(0.5).setDepth(11);
    this.container.add(this.label);

    // Interaction range
    this.interactRange = 20;
  }

  get x() { return this.container.x; }
  get y() { return this.container.y; }

  _hash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) - h + str.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
  }

  /**
   * Create a clothing sprite with idle -> walk fallback
   */
  _createClothingSprite(scene, type, colorOrStyle, origin, scale) {
    const idleKey = `idle_${type}_${colorOrStyle}`;
    const walkKey = `walk_${type}_${colorOrStyle}`;

    // Check if idle texture exists and is valid (not empty/transparent)
    let useIdle = false;
    if (scene.textures.exists(idleKey)) {
      const idleTexture = scene.textures.get(idleKey);
      // Check if texture has valid frames and content
      if (idleTexture && idleTexture.frameTotal > 0) {
        const source = idleTexture.getSourceImage();
        // If source exists and has dimensions, check if it has content
        if (source && source.width > 0 && source.height > 0) {
          useIdle = true;
        }
      }
    }

    // Use idle if available, otherwise fall back to walk
    const textureKey = useIdle ? idleKey : walkKey;
    return scene.add.sprite(0, 0, textureKey).setOrigin(...origin).setScale(scale);
  }

  /**
   * Safely set a layer's texture with fallback
   */
  _setLayer(sprite, type, variant) {
    const idleKey = `idle_${type}_${variant}`;
    const walkKey = `walk_${type}_${variant}`;

    // Determine which texture to use
    let targetKey = walkKey;
    let isIdle = false;

    if (this.scene.textures.exists(idleKey)) {
      const idleTexture = this.scene.textures.get(idleKey);
      if (idleTexture && idleTexture.frameTotal > 0) {
        const source = idleTexture.getSourceImage();
        if (source && source.width > 0 && source.height > 0) {
          targetKey = idleKey;
          isIdle = true;
        }
      }
    }

    // Only update if texture changed
    if (sprite.texture.key !== targetKey) {
      const currentFrame = sprite.frame ? sprite.frame.name : 0;
      sprite.setTexture(targetKey);
      sprite.setVisible(this.scene.textures.exists(targetKey));

      // Convert frame index if switching between idle and walk
      // Idle: 2 frames per direction, Walk: 6 frames per direction
      // Map idle frame to walk frame: idleDir * 2 + offset -> walkDir * 6
      if (isIdle && targetKey === walkKey) {
        // Was idle, now walk - convert to walk frame
        const dirIndex = Math.floor(currentFrame / 2);
        const walkFrame = dirIndex * 6;
        sprite.setFrame(walkFrame);
      } else if (!isIdle && targetKey === idleKey) {
        // Was walk, now idle - convert to idle frame
        const dirIndex = Math.floor(currentFrame / 6);
        const idleFrame = dirIndex * 2;
        sprite.setFrame(idleFrame);
      } else {
        // Same type, preserve frame or reset
        try {
          sprite.setFrame(currentFrame);
        } catch (e) {
          sprite.setFrame(0);
        }
      }
    }

    return isIdle;
  }

  /**
   * Get direction index from frame number
   * Idle: 2 frames per direction (0-1=down, 2-3=up, 4-5=right, 6-7=left)
   * Walk: 6 frames per direction (0-5=down, 6-11=up, 12-17=right, 18-23=left)
   */
  _getDirectionFromFrame(frame, isIdle) {
    if (isIdle) {
      const dirMap = { 0: 'down', 1: 'up', 2: 'right', 3: 'left' };
      return dirMap[Math.floor(frame / 2)] || 'down';
    } else {
      const dirMap = { 0: 'down', 1: 'up', 2: 'right', 3: 'left' };
      return dirMap[Math.floor(frame / 6)] || 'down';
    }
  }

  /**
   * Get frame index for a direction
   * For walk: use first frame of the direction (dirIndex * 6)
   * For idle: use first frame of the direction (dirIndex * 2)
   */
  _getFrameForDirection(direction, isIdle) {
    const dirIndices = { down: 0, up: 1, right: 2, left: 3 };
    const dirIndex = dirIndices[direction] || 0;
    return isIdle ? dirIndex * 2 : dirIndex * 6;
  }

  syncLayers() {
    if (!this.bodySprite?.frame) return;
    const idx = this.bodySprite.frame.name;

    const dirIndex = Math.floor(idx / 2);
    const walkIdx = dirIndex * 6;

    [this.pantsSprite, this.shirtSprite, this.hairSprite].forEach(s => {
      if (s && s.visible && s.texture) {
        try { s.setFrame(walkIdx); } catch (e) {}
      }
    });
  }

  update(playerX, playerY) {
    const dist = Phaser.Math.Distance.Between(this.x, this.y, playerX, playerY);
    this.canInteract = dist < this.interactRange;

    // Face the player when nearby
    if (dist < 40) {
      const dx = playerX - this.x;
      const dy = playerY - this.y;
      if (Math.abs(dx) > Math.abs(dy)) {
        this.facing = dx < 0 ? 'left' : 'right';
      } else {
        this.facing = dy < 0 ? 'up' : 'down';
      }
    }

    // Play idle animation on body
    const animKey = `idle_${this.skinTone}_${this.facing}`;
    if (this.scene.anims.exists(animKey)) {
      this.bodySprite.play(animKey, true);
    } else {
      // Fallback: set static frame for idle stance
      const dirIndices = { down: 0, up: 1, right: 2, left: 3 };
      const dirIndex = dirIndices[this.facing] || 0;
      const idleFrame = dirIndex * 2; // Idle has 2 frames per direction
      this.bodySprite.setFrame(idleFrame);
    }

    // Ensure clothing layers use correct textures (walk as fallback for idle)
    // and are visible
    this._setLayer(this.pantsSprite, 'pants', this.pantsColor);
    this._setLayer(this.shirtSprite, 'shirt', this.shirtColor);
    this._setLayer(this.hairSprite, 'hair', `${this.hairStyle}_${this.hairColor}`);

    // Sync frame positions
    this.syncLayers();
  }

  interact() {
    if (this.dialogueIndex < this.dialogue.length) {
      this.scene.events.emit('showMessage', `${this.name}: ${this.dialogue[this.dialogueIndex]}`);
      this.dialogueIndex = (this.dialogueIndex + 1) % this.dialogue.length;
    }
  }

  destroy() {
    this.container.destroy();
  }
}

export const NPC_DATABASE = [
  { name: 'Fisherman Joe', role: 'fisherman', dialogue: [
    'Nice day for fishing!', 'Try casting near the darker water.', 'I heard rare fish come out at night...'
  ]},
  { name: 'Mayor Elsa', role: 'questgiver', dialogue: [
    'Welcome to Tidefall!', 'The fishing here is legendary.', 'Have you met Chef Gordon?'
  ]},
  { name: 'Chef Gordon', role: 'shopkeeper', dialogue: [
    'I buy fresh fish!', 'Rare fish fetch premium prices.', 'Come back when you have a big catch!'
  ]},
];
