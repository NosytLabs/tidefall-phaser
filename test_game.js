const pw = require('playwright');
(async () => {
  const browser = await pw.chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  const warnings = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
    else if (msg.type() === 'warning') warnings.push(msg.text());
  });
  
  page.on('pageerror', err => errors.push('PAGE ERROR: ' + err.message));
  
  await page.goto('http://localhost:3000', { timeout: 15000 });
  await page.waitForTimeout(5000);
  
  // Screenshot
  await page.screenshot({ path: 'C:/Users/Tyson/clawd/tidefall-phaser/audit/v45_audit.png', fullPage: false });
  
  // Check canvas
  const canvas = await page.$('canvas');
  console.log('Canvas found:', !!canvas);
  
  // Report
  if (errors.length > 0) {
    console.log('ERRORS:', JSON.stringify(errors.slice(0,15), null, 2));
  } else {
    console.log('NO ERRORS');
  }
  console.log('Warnings count:', warnings.length);
  
  await browser.close();
})();