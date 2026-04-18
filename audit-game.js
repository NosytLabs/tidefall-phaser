const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const logs = [];
  const errors = [];
  
  // Capture all console output
  page.on('console', msg => {
    const text = msg.text();
    logs.push({ type: msg.type(), text, time: Date.now() });
    console.log(`[${msg.type().toUpperCase()}] ${text}`);
  });
  
  page.on('pageerror', err => {
    errors.push({ message: err.message, stack: err.stack, time: Date.now() });
    console.log(`[ERROR] ${err.message}`);
  });
  
  // Navigate to game
  console.log('=== Starting Game Audit ===');
  await page.goto('http://localhost:3000/');
  
  // Wait for initial load
  await page.waitForTimeout(5000);
  
  // Check if game is running
  const gameState = await page.evaluate(() => {
    if (window.__game) {
      return {
        hasGame: true,
        fps: window.__game.loop?.actualFps,
        scenes: window.__game.scene?.scenes?.map(s => s.scene?.key),
        currentScene: window.__game.scene?.getScenes(true)[0]?.scene?.key
      };
    }
    return { hasGame: false };
  });
  
  console.log('\n=== Game State ===');
  console.log(JSON.stringify(gameState, null, 2));
  
  // Take initial screenshot
  await page.screenshot({ path: 'audit-initial.png' });
  console.log('\nScreenshot saved: audit-initial.png');
  
  // Wait for full load
  await page.waitForTimeout(10000);
  
  // Check for specific issues (analyze logs in Node context)
  const textureWarnings = logs.filter(l => 
    l.text.includes('Texture') && l.text.includes('has no frame')
  );
  const perfIssues = logs.filter(l => 
    l.text.includes('Performance degraded') || l.text.includes('FPS:')
  );
  const fpsDrops = perfIssues.filter(p => {
    const match = p.text.match(/FPS:\s*([\d.]+)/);
    return match && parseFloat(match[1]) < 30;
  });
  
  console.log('\n=== Issues Found ===');
  console.log(`Missing texture warnings: ${textureWarnings.length}`);
  if (textureWarnings.length > 0) {
    console.log('Samples:', textureWarnings.slice(0, 3).map(l => l.text));
  }
  console.log(`\nPerformance issues: ${perfIssues.length}`);
  console.log(`FPS drops (< 30): ${fpsDrops.length}`);
  if (fpsDrops.length > 0) {
    console.log('Samples:', fpsDrops.slice(0, 3).map(l => l.text));
  }
  
  // Take final screenshot
  await page.screenshot({ path: 'audit-final.png' });
  console.log('\nScreenshot saved: audit-final.png');
  
  // Summary
  console.log('\n=== Audit Summary ===');
  console.log(`Total logs: ${logs.length}`);
  console.log(`Errors: ${errors.length}`);
  console.log(`Warnings: ${logs.filter(l => l.type === 'warning').length}`);
  
  // Write detailed report
  const fs = require('fs');
  const report = {
    timestamp: new Date().toISOString(),
    gameState,
    summary: {
      totalLogs: logs.length,
      errors: errors.length,
      warnings: logs.filter(l => l.type === 'warning').length,
      missingTextures: textureWarnings.length,
      fpsDrops: fpsDrops.length
    },
    errors: errors.slice(0, 10),
    criticalLogs: logs.filter(l => 
      l.type === 'error' || 
      l.text.includes('Error') || 
      l.text.includes('CRITICAL')
    ).slice(0, 20)
  };
  fs.writeFileSync('audit-report.json', JSON.stringify(report, null, 2));
  console.log('\nDetailed report saved: audit-report.json');
  
  await browser.close();
})();
