const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const logs = [];
  const errors = [];
  const textureIssues = [];
  const spriteIssues = [];
  
  page.on('console', msg => {
    const text = msg.text();
    logs.push({ type: msg.type(), text });
    
    // Capture texture-related issues
    if (text.includes('Texture') || text.includes('frame') || text.includes('sprite')) {
      textureIssues.push(text);
    }
    
    // Capture sprite-related errors
    if (text.includes('sprite') || text.includes('Sprite') || text.includes('animation')) {
      spriteIssues.push(text);
    }
    
    console.log(`[${msg.type()}] ${text}`);
  });
  
  page.on('pageerror', err => {
    errors.push(err.message);
    console.log(`[ERROR] ${err.message}`);
  });
  
  console.log('=== Testing Game Assets ===');
  await page.goto('http://localhost:3001');
  await page.waitForTimeout(8000);
  
  // Get detailed game state
  const gameState = await page.evaluate(() => {
    const state = {
      hasGame: !!window.__game,
      scenes: [],
      textures: [],
      sprites: [],
      issues: []
    };
    
    if (window.__game) {
      const game = window.__game;
      
      // Get scenes
      state.scenes = game.scene?.scenes?.map(s => ({
        key: s.scene?.key,
        active: s.scene?.active,
        visible: s.scene?.visible
      }));
      
      // Check for texture list
      if (game.textures) {
        state.textures = Object.keys(game.textures.list || {});
      }
      
      // Get current scene details
      const currentScene = game.scene?.getScenes(true)[0];
      if (currentScene) {
        state.currentScene = {
          key: currentScene.scene?.key,
          children: currentScene.children?.list?.length,
          groups: Object.keys(currentScene.groups || {}),
          sprites: currentScene.children?.list?.filter(c => c.type === 'Sprite').length
        };
        
        // Check for sprite issues
        const sprites = currentScene.children?.list?.filter(c => c.type === 'Sprite');
        sprites?.forEach(sprite => {
          if (!sprite.visible || !sprite.active || !sprite.texture?.key) {
            state.issues.push({
              type: 'sprite',
              name: sprite.name || 'unnamed',
              visible: sprite.visible,
              active: sprite.active,
              hasTexture: !!sprite.texture?.key,
              textureKey: sprite.texture?.key
            });
          }
        });
      }
    }
    
    return state;
  });
  
  console.log('\n=== Game State ===');
  console.log(JSON.stringify(gameState, null, 2));
  
  console.log('\n=== Texture Issues ===');
  console.log(`Found ${textureIssues.length} texture-related messages`);
  textureIssues.slice(0, 10).forEach(t => console.log(`  - ${t}`));
  
  console.log('\n=== Sprite Issues ===');
  console.log(`Found ${spriteIssues.length} sprite-related messages`);
  spriteIssues.slice(0, 10).forEach(s => console.log(`  - ${s}`));
  
  console.log('\n=== Sprite/Game Object Issues ===');
  if (gameState.issues?.length > 0) {
    console.log(`Found ${gameState.issues.length} issues:`);
    gameState.issues.forEach(i => console.log(`  - ${JSON.stringify(i)}`));
  } else {
    console.log('No sprite issues detected in game state');
  }
  
  await page.screenshot({ path: 'asset-test.png' });
  console.log('\nScreenshot saved: asset-test.png');
  
  await browser.close();
})();
