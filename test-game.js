const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Capture console logs
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  await page.goto('http://localhost:3001');
  await page.waitForTimeout(15000); // Wait 15 seconds for loading
  
  await page.screenshot({ path: 'test-result.png' });
  await browser.close();
})();
