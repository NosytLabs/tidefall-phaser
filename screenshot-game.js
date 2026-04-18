const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 }
  });
  
  const screenshots = [];
  const consoleErrors = [];
  const consoleWarnings = [];
  
  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error') {
      consoleErrors.push(text);
    } else if (msg.type() === 'warning') {
      consoleWarnings.push(text);
    }
  });
  
  page.on('pageerror', err => {
    consoleErrors.push(`PAGE ERROR: ${err.message}`);
  });
  
  console.log('=== Taking Game Screenshots ===\n');
  
  // Load the game
  await page.goto('http://localhost:3002');
  
  // Wait for game to load
  await page.waitForTimeout(5000);
  
  // Screenshot 1: Initial load
  await page.screenshot({ path: 'screenshot-01-initial.png', fullPage: false });
  screenshots.push('screenshot-01-initial.png');
  console.log('✓ Screenshot 1: Initial load');
  
  // Wait a bit more for any animations
  await page.waitForTimeout(3000);
  
  // Screenshot 2: After animations
  await page.screenshot({ path: 'screenshot-02-gameplay.png', fullPage: false });
  screenshots.push('screenshot-02-gameplay.png');
  console.log('✓ Screenshot 2: Gameplay state');
  
  // Try to move the player (WASD)
  await page.keyboard.press('w');
  await page.waitForTimeout(500);
  await page.keyboard.press('a');
  await page.waitForTimeout(500);
  
  // Screenshot 3: After movement
  await page.screenshot({ path: 'screenshot-03-movement.png', fullPage: false });
  screenshots.push('screenshot-03-movement.png');
  console.log('✓ Screenshot 3: After movement');
  
  // Try fishing (space)
  await page.keyboard.press(' ');
  await page.waitForTimeout(2000);
  
  // Screenshot 4: Fishing
  await page.screenshot({ path: 'screenshot-04-fishing.png', fullPage: false });
  screenshots.push('screenshot-04-fishing.png');
  console.log('✓ Screenshot 4: Fishing attempt');
  
  // Get game state
  const gameState = await page.evaluate(() => {
    const state = {
      gameLoaded: !!window.__game,
      currentScene: null,
      spriteCount: 0,
      visibleSprites: 0,
      errors: []
    };
    
    if (window.__game) {
      const scenes = window.__game.scene?.getScenes(true);
      if (scenes && scenes.length > 0) {
        state.currentScene = scenes[0].scene?.key;
        const allSprites = scenes[0].children?.list?.filter(c => c.type === 'Sprite') || [];
        state.spriteCount = allSprites.length;
        state.visibleSprites = allSprites.filter(s => s.visible).length;
      }
    }
    
    return state;
  });
  
  // Save analysis report
  const report = {
    timestamp: new Date().toISOString(),
    screenshots,
    gameState,
    consoleErrors: consoleErrors.slice(0, 20),
    consoleWarnings: consoleWarnings.slice(0, 20),
    totalErrors: consoleErrors.length,
    totalWarnings: consoleWarnings.length
  };
  
  fs.writeFileSync('game-analysis-report.json', JSON.stringify(report, null, 2));
  
  console.log('\n=== Screenshot Analysis Complete ===');
  console.log(`Game loaded: ${gameState.gameLoaded}`);
  console.log(`Current scene: ${gameState.currentScene}`);
  console.log(`Sprites: ${gameState.visibleSprites}/${gameState.spriteCount} visible`);
  console.log(`Console errors: ${consoleErrors.length}`);
  console.log(`Console warnings: ${consoleWarnings.length}`);
  
  await browser.close();
})();
