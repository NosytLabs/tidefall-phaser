const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const logs = [];
  const errors = [];
  const warnings = [];
  
  page.on('console', msg => {
    const text = msg.text();
    logs.push({ type: msg.type(), text });
    if (msg.type() === 'error') {
      errors.push(text);
      console.log(`[ERROR] ${text}`);
    } else if (msg.type() === 'warning') {
      warnings.push(text);
      console.log(`[WARNING] ${text}`);
    } else {
      console.log(`[${msg.type()}] ${text}`);
    }
  });
  
  page.on('pageerror', err => {
    errors.push(err.message);
    console.log(`[PAGE ERROR] ${err.message}`);
  });
  
  console.log('=== Starting Game Debug & Audit ===');
  await page.goto('http://localhost:3001');
  
  // Wait for game to load
  await page.waitForTimeout(8000);
  
  // Take initial screenshot
  await page.screenshot({ path: 'debug-initial.png' });
  console.log('Screenshot saved: debug-initial.png');
  
  // Test player movement
  console.log('\n=== Testing Player Movement ===');
  await page.keyboard.press('w');
  await page.waitForTimeout(500);
  await page.keyboard.press('s');
  await page.waitForTimeout(500);
  await page.keyboard.press('a');
  await page.waitForTimeout(500);
  await page.keyboard.press('d');
  await page.waitForTimeout(500);
  
  // Test fishing
  console.log('\n=== Testing Fishing ===');
  await page.keyboard.press(' ');
  await page.waitForTimeout(3000);
  
  // Take screenshot after fishing attempt
  await page.screenshot({ path: 'debug-fishing.png' });
  console.log('Screenshot saved: debug-fishing.png');
  
  // Get game state
  const gameState = await page.evaluate(() => {
    if (!window.__game) return null;
    
    const currentScene = window.__game.scene?.getScenes(true)[0];
    
    return {
      fps: window.__game.loop.actualFps,
      targetFps: window.__game.loop.targetFps,
      scenes: window.__game.scene.scenes.map(s => s.scene.key),
      currentScene: currentScene?.scene.key,
      player: currentScene?.player ? {
        x: currentScene.player.x,
        y: currentScene.player.y,
        facing: currentScene.player.facing,
        state: currentScene.player.state
      } : null,
      spriteCount: currentScene?.children?.list?.length || 0,
      textureCount: window.__game.textures.list.length,
      errors: window.__errorBoundary?.getReport?.() || null
    };
  });
  
  console.log('\n=== Game State ===');
  console.log(JSON.stringify(gameState, null, 2));
  
  // Check for specific issues
  console.log('\n=== Issue Analysis ===');
  
  // Check FPS
  if (gameState?.fps < 50) {
    console.log(`⚠️ Low FPS detected: ${gameState.fps.toFixed(1)} FPS`);
  } else {
    console.log(`✅ FPS OK: ${gameState.fps.toFixed(1)} FPS`);
  }
  
  // Check for texture warnings
  const textureWarnings = logs.filter(l => 
    l.text.includes('texture') && l.text.includes('frame')
  );
  if (textureWarnings.length > 0) {
    console.log(`⚠️ ${textureWarnings.length} texture frame warnings`);
  }
  
  // Check for null errors
  const nullErrors = errors.filter(e => e.includes('null') || e.includes('undefined'));
  if (nullErrors.length > 0) {
    console.log(`🚨 ${nullErrors.length} null/undefined errors`);
    nullErrors.slice(0, 3).forEach(e => console.log(`   - ${e}`));
  }
  
  // Summary
  console.log('\n=== Debug Summary ===');
  console.log(`Total logs: ${logs.length}`);
  console.log(`Errors: ${errors.length}`);
  console.log(`Warnings: ${warnings.length}`);
  console.log(`Current scene: ${gameState?.currentScene}`);
  console.log(`Sprites in scene: ${gameState?.spriteCount}`);
  console.log(`Textures loaded: ${gameState?.textureCount}`);
  
  await browser.close();
})();
