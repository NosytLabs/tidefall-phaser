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

    // Determine base type (idle if exists and has frames, otherwise walk)
    const hasValidTexture = (key) => {
      if (!scene.textures.exists(key)) return false;
      const tex = scene.textures.get(key);
      return tex && tex.frameTotal > 0;
    };
    
    const idleKey = `idle_body_${this.skinTone}`;
    const walkKey = `walk_body_${this.skinTone}`;
    const useBodyKey = hasValidTexture(idleKey) ? idleKey : 
                       hasValidTexture(walkKey) ? walkKey : null;
    
    if (!useBodyKey) {
      console.warn(`[NPC] No valid body texture for ${config.name} (skin: ${this.skinTone}), using fallback`);
      // Create a colored rectangle as fallback - scaled to match sprite size
      this.bodySprite = scene.add.rectangle(0, 0, 16 * spriteScale, 24 * spriteScale, 0xffccaa).setOrigin(...origin);
    } else {
      this.bodySprite = scene.add.sprite(0, 0, useBodyKey).setOrigin(...origin).setScale(spriteScale);
    }

    // Create clothing sprites with fallback from idle to walk
    // Only create sprites if textures exist to avoid invisible placeholder sprites
    this.pantsSprite = this._createClothingSpriteSafe(scene, 'pants', this.pantsColor, origin, spriteScale);
    this.shirtSprite = this._createClothingSpriteSafe(scene, 'shirt', this.shirtColor, origin, spriteScale);
    this.hairSprite = this._createClothingSpriteSafe(scene, 'hair', `${this.hairStyle}_${this.hairColor}`, origin, spriteScale);

    // Build container children array, filtering out null sprites
    const containerChildren = [shadow, this.bodySprite];
    if (this.pantsSprite) containerChildren.push(this.pantsSprite);
    if (this.shirtSprite) containerChildren.push(this.shirtSprite);
    if (this.hairSprite) containerChildren.push(this.hairSprite);
    
    this.container.add(containerChildren);
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
   * SAFE version: returns null if no valid texture exists
   */
  _createClothingSpriteSafe(scene, type, colorOrStyle, origin, scale) {
    const idleKey = `idle_${type}_${colorOrStyle}`;
    const walkKey = `walk_${type}_${colorOrStyle}`;

    // Check if idle texture exists and is valid
    if (scene.textures.exists(idleKey)) {
      const idleTexture = scene.textures.get(idleKey);
      if (idleTexture && idleTexture.frameTotal > 0) {
        const source = idleTexture.getSourceImage();
        if (source && source.width > 0 && source.height > 0) {
          return scene.add.sprite(0, 0, idleKey).setOrigin(...origin).setScale(scale);
        }
      }
    }

    // Fall back to walk texture
    if (scene.textures.exists(walkKey)) {
      const walkTexture = scene.textures.get(walkKey);
      if (walkTexture && walkTexture.frameTotal > 0) {
        const source = walkTexture.getSourceImage();
        if (source && source.width > 0 && source.height > 0) {
          return scene.add.sprite(0, 0, walkKey).setOrigin(...origin).setScale(scale);
        }
      }
    }

    // No valid texture found - return null instead of creating invisible sprite
    return null;
  }

  /**
   * Create a clothing sprite with idle -> walk fallback
   * @deprecated Use _createClothingSpriteSafe instead
   */
  _createClothingSprite(scene, type, colorOrStyle, origin, scale) {
    return this._createClothingSpriteSafe(scene, type, colorOrStyle, origin, scale);
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
    if (!sprite.texture || sprite.texture.key !== targetKey) {
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
    const isBodyIdle = this.bodySprite.texture.key.includes('idle');
    
    // Direction mapping: 0=down, 1=left, 2=right, 3=up (standard Smallburg order)
    // Actually Phaser usually maps them as they appear in the strip.
    // Based on BootScene directions = ['down', 'left', 'right', 'up']
    const dirIndex = isBodyIdle ? Math.floor(idx / 2) : Math.floor(idx / 6);

    [this.pantsSprite, this.shirtSprite, this.hairSprite].forEach(s => {
      if (s && s.visible && s.texture) {
        const isLayerIdle = s.texture.key.includes('idle');
        const layerIdx = isLayerIdle ? (dirIndex * 2) : (dirIndex * 6);
        
        try { 
          s.setFrame(layerIdx); 
        } catch (e) {
          console.warn(`[NPC] Failed to set frame ${layerIdx} for ${s.texture.key}`);
        }
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
    // and are visible - only if sprites exist
    if (this.pantsSprite) this._setLayer(this.pantsSprite, 'pants', this.pantsColor);
    if (this.shirtSprite) this._setLayer(this.shirtSprite, 'shirt', this.shirtColor);
    if (this.hairSprite) this._setLayer(this.hairSprite, 'hair', `${this.hairStyle}_${this.hairColor}`);

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
