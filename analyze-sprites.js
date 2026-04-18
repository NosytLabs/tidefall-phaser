const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const issues = [];
  const warnings = [];
  const spriteData = [];
  
  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error') {
      issues.push({ type: 'console', level: 'error', text });
    } else if (msg.type() === 'warning') {
      warnings.push({ type: 'console', level: 'warning', text });
    }
  });
  
  page.on('pageerror', err => {
    issues.push({ type: 'page', level: 'error', text: err.message });
  });
  
  console.log('=== Starting Comprehensive Sprite Analysis ===\n');
  
  await page.goto('http://localhost:3001');
  await page.waitForTimeout(10000);
  
  // Comprehensive sprite analysis
  const analysis = await page.evaluate(() => {
    const result = {
      textures: {},
      sprites: [],
      animations: {},
      missingTextures: [],
      frameErrors: [],
      invisibleSprites: [],
      spriteSheets: {}
    };
    
    if (!window.__game) {
      return { error: 'Game not loaded' };
    }
    
    const textureManager = window.__game.textures;
    const animationManager = window.__game.anims;
    
    // Analyze all textures
    textureManager.each(texture => {
      const key = texture.key;
      const source = texture.getSourceImage();
      const frames = texture.getFrameNames();
      
      result.textures[key] = {
        hasSource: !!source,
        width: source?.width || 0,
        height: source?.height || 0,
        frameTotal: texture.frameTotal,
        frames: frames.length
      };
      
      // Check for frame issues
      if (texture.frameTotal === 0 && key.includes('body')) {
        result.missingTextures.push(key);
      }
      
      // Check spritesheet dimensions
      if (source && (key.includes('walk') || key.includes('idle'))) {
        const expectedFrames = key.includes('walk') ? 24 : 8; // 4 dirs × 6/2 frames
        const actualFrames = texture.frameTotal;
        
        if (actualFrames !== expectedFrames) {
          result.frameErrors.push({
            key,
            expected: expectedFrames,
            actual: actualFrames,
            width: source.width,
            height: source.height
          });
        }
        
        result.spriteSheets[key] = {
          width: source.width,
          height: source.height,
          frames: actualFrames,
          expectedFrames: expectedFrames,
          frameWidth: source.width / (key.includes('walk') ? 6 : 2),
          frameHeight: source.height / 4
        };
      }
    });
    
    // Analyze current scene sprites
    const currentScene = window.__game.scene?.getScenes(true)[0];
    if (currentScene) {
      const allSprites = currentScene.children?.list?.filter(c => c.type === 'Sprite') || [];
      
      allSprites.forEach(sprite => {
        const data = {
          key: sprite.texture?.key,
          visible: sprite.visible,
          active: sprite.active,
          x: sprite.x,
          y: sprite.y,
          scaleX: sprite.scaleX,
          scaleY: sprite.scaleY,
          frame: sprite.frame?.name,
          hasTexture: !!sprite.texture,
          textureValid: sprite.texture?.source?.length > 0
        };
        
        result.sprites.push(data);
        
        if (!sprite.visible) {
          result.invisibleSprites.push({
            key: sprite.texture?.key,
            x: sprite.x,
            y: sprite.y,
            reason: sprite.texture?.key ? 'texture may be invalid' : 'no texture'
          });
        }
      });
    }
    
    // Analyze animations
    const animKeys = animationManager.anims.keys();
    for (const key of animKeys) {
      const anim = animationManager.get(key);
      if (anim) {
        result.animations[key] = {
          frames: anim.frames?.length || 0,
          frameRate: anim.frameRate,
          repeat: anim.repeat,
          textureKey: anim.frames?.[0]?.textureKey
        };
      }
    }
    
    return result;
  });
  
  // Report findings
  console.log('\n=== SPRITE ANALYSIS RESULTS ===\n');
  
  // Texture summary
  const textureCount = Object.keys(analysis.textures).length;
  console.log(`Total textures loaded: ${textureCount}`);
  
  // Missing textures
  if (analysis.missingTextures.length > 0) {
    console.log('\n🚨 MISSING TEXTURES (0 frames):');
    analysis.missingTextures.forEach(key => console.log(`  - ${key}`));
  }
  
  // Frame errors
  if (analysis.frameErrors.length > 0) {
    console.log('\n⚠️ FRAME COUNT MISMATCHES:');
    analysis.frameErrors.forEach(err => {
      console.log(`  - ${err.key}:`);
      console.log(`    Expected: ${err.expected} frames`);
      console.log(`    Actual: ${err.actual} frames`);
      console.log(`    Image: ${err.width}×${err.height}`);
    });
  }
  
  // Spritesheet analysis
  console.log('\n📊 SPRITESHEET ANALYSIS:');
  Object.entries(analysis.spriteSheets).forEach(([key, data]) => {
    const status = data.frames === data.expectedFrames ? '✅' : '⚠️';
    console.log(`  ${status} ${key}:`);
    console.log(`    Image: ${data.width}×${data.height}`);
    console.log(`    Frames: ${data.frames}/${data.expectedFrames}`);
    console.log(`    Frame size: ${data.frameWidth.toFixed(1)}×${data.frameHeight.toFixed(1)}`);
  });
  
  // Invisible sprites
  if (analysis.invisibleSprites.length > 0) {
    console.log('\n👻 INVISIBLE SPRITES:');
    analysis.invisibleSprites.forEach(s => {
      console.log(`  - ${s.key} at (${s.x}, ${s.y}): ${s.reason}`);
    });
  }
  
  // Animation summary
  const animCount = Object.keys(analysis.animations).length;
  console.log(`\n🎬 Total animations: ${animCount}`);
  
  // Console issues
  if (issues.length > 0) {
    console.log('\n🚨 CONSOLE ERRORS:');
    issues.slice(0, 10).forEach(i => console.log(`  [${i.level}] ${i.text}`));
  }
  
  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      textureCount,
      missingTextures: analysis.missingTextures.length,
      frameErrors: analysis.frameErrors.length,
      invisibleSprites: analysis.invisibleSprites.length,
      animationCount: animCount
    },
    details: analysis,
    issues: issues,
    warnings: warnings
  };
  
  fs.writeFileSync('sprite-analysis-report.json', JSON.stringify(report, null, 2));
  console.log('\n📄 Detailed report saved: sprite-analysis-report.json');
  
  await browser.close();
})();
