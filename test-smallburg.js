const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const logs = [];
  const errors = [];
  
  page.on('console', msg => {
    const text = msg.text();
    logs.push({ type: msg.type(), text });
    console.log(`[${msg.type()}] ${text}`);
  });
  
  page.on('pageerror', err => {
    errors.push(err.message);
    console.log(`[ERROR] ${err.message}`);
  });
  
  console.log('=== Testing Smallburg Assets ===');
  await page.goto('http://localhost:3001');
  await page.waitForTimeout(10000);
  
  // Check game state for Smallburg sprites
  const gameState = await page.evaluate(() => {
    const state = {
      smallburgSprites: [],
      textureFrames: {}
    };
    
    if (window.__game && window.__game.textures) {
      // Check Smallburg textures
      const smallburgTextures = [
        'palm_tree', 'trees_pine_growth', 'apple_tree', 'peach_tree',
        'chicken', 'chicken_idle', 'cow', 'cow_idle',
        'fish_market', 'barn', 'greenhouse',
        'boat_blue', 'boat_yellow', 'boat_small'
      ];
      
      smallburgTextures.forEach(key => {
        if (window.__game.textures.exists(key)) {
          const texture = window.__game.textures.get(key);
          state.textureFrames[key] = {
            frameTotal: texture.frameTotal,
            hasSource: !!texture.getSourceImage()
          };
        } else {
          state.textureFrames[key] = { missing: true };
        }
      });
      
      // Count Smallburg sprites in scene
      const currentScene = window.__game.scene?.getScenes(true)[0];
      if (currentScene) {
        const allSprites = currentScene.children?.list?.filter(c => c.type === 'Sprite') || [];
        state.smallburgSprites = allSprites
          .filter(s => {
            const key = s.texture?.key || '';
            return key.includes('tree') || key.includes('chicken') || 
                   key.includes('cow') || key.includes('barn') || 
                   key.includes('greenhouse') || key.includes('boat') ||
                   key.includes('market');
          })
          .map(s => ({
            key: s.texture?.key,
            visible: s.visible,
            active: s.active,
            x: s.x,
            y: s.y
          }));
      }
    }
    
    return state;
  });
  
  console.log('\n=== Smallburg Texture Status ===');
  console.log(JSON.stringify(gameState.textureFrames, null, 2));
  
  console.log('\n=== Smallburg Sprites in Scene ===');
  console.log(`Found ${gameState.smallburgSprites.length} Smallburg sprites`);
  
  const visibleSprites = gameState.smallburgSprites.filter(s => s.visible);
  const invisibleSprites = gameState.smallburgSprites.filter(s => !s.visible);
  
  console.log(`Visible: ${visibleSprites.length}`);
  console.log(`Invisible: ${invisibleSprites.length}`);
  
  if (invisibleSprites.length > 0) {
    console.log('\nInvisible sprites:');
    invisibleSprites.slice(0, 10).forEach(s => console.log(`  - ${s.key} at (${s.x}, ${s.y})`));
  }
  
  // Check for frame-related errors
  const frameErrors = logs.filter(l => 
    l.text.includes('frame') && (l.text.includes('undefined') || l.text.includes('null') || l.text.includes('no frame'))
  );
  
  if (frameErrors.length > 0) {
    console.log('\n=== Frame Errors ===');
    frameErrors.forEach(e => console.log(`  ${e.text}`));
  }
  
  await page.screenshot({ path: 'smallburg-test.png' });
  console.log('\nScreenshot saved: smallburg-test.png');
  
  await browser.close();
})();
