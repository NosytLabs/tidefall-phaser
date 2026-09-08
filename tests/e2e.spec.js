import { test, expect } from '@playwright/test';

test.describe('Tidefall player flows', () => {
  test('boots cleanly and exposes the game canvas', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    await page.goto('http://localhost:3010');
    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1500);
    expect(errors.filter(e => !e.includes('favicon'))).toEqual([]);
  });

  test('movement and inventory controls are wired', async ({ page }) => {
    await page.goto('http://localhost:3010');
    await page.waitForTimeout(1500);
    const state = await page.evaluate(() => ({
      hasGame: Boolean(window.__game),
      scene: window.__game?.scene?.getScene('FishingScene')?.scene?.isActive(),
      ui: window.__game?.scene?.getScene('UIScene')?.scene?.isActive(),
    }));
    expect(state.hasGame).toBe(true);
    expect(state.scene).toBe(true);
    expect(state.ui).toBe(true);

    await page.keyboard.press('I');
    await page.waitForTimeout(150);
    const inventoryOpen = await page.evaluate(() => Boolean(window.__game.scene.getScene('UIScene').inventoryPanel));
    expect(inventoryOpen).toBe(true);

    await page.keyboard.press('I');
    await page.waitForTimeout(100);
    const inventoryClosed = await page.evaluate(() => !window.__game.scene.getScene('UIScene').inventoryPanel);
    expect(inventoryClosed).toBe(true);
  });

  test('walk input reaches the player controller', async ({ page }) => {
    await page.goto('http://localhost:3010');
    await page.waitForTimeout(1500);
    const before = await page.evaluate(() => window.__game.scene.getScene('FishingScene').player.x);
    await page.keyboard.down('D');
    await page.waitForTimeout(250);
    await page.keyboard.up('D');
    const after = await page.evaluate(() => window.__game.scene.getScene('FishingScene').player.x);
    expect(after).toBeGreaterThan(before);
  });
});
