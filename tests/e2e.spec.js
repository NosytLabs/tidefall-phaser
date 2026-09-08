import { test, expect } from '@playwright/test';

test.describe('Tidefall player flows', () => {
  test('boots cleanly and exposes the game canvas', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.stack || error.message));
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
    await page.keyboard.down('d');
    await page.waitForTimeout(250);
    const during = await page.evaluate(() => ({
      x: window.__game.scene.getScene('FishingScene').player.x,
      vx: window.__game.scene.getScene('FishingScene').player.physicsBody.velocity.x,
      right: window.__game.scene.getScene('FishingScene').player.input.right,
    }));
    await page.keyboard.up('d');
    expect(during.right).toBe(true);
    expect(during.vx).toBeGreaterThan(0);
    expect(during.x).toBeGreaterThanOrEqual(before);
  });

  test('visual audit captures the core fishing flow', async ({ page }) => {
    await page.goto('http://localhost:3010');
    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1200);

    await page.screenshot({ path: 'test-results/tidefall-boot.png', fullPage: true });

    await page.evaluate(() => {
      const scene = window.__game.scene.getScene('FishingScene');
      scene.player.x = 420;
      scene.player.y = scene.waterBounds.top + 12;
      scene.fishingSystem.startCasting(scene.player);
    });
    await page.waitForTimeout(650);
    await page.screenshot({ path: 'test-results/tidefall-cast.png', fullPage: true });

    await page.evaluate(() => {
      const scene = window.__game.scene.getScene('FishingScene');
      scene.fishingSystem.triggerBite();
    });
    await page.waitForTimeout(250);
    await page.screenshot({ path: 'test-results/tidefall-bite.png', fullPage: true });

    await page.keyboard.press('Space');
    await page.waitForTimeout(200);
    const minigame = await page.evaluate(() => ({
      state: window.__game.scene.getScene('FishingScene').fishingSystem.state,
      hasPanel: Boolean(window.__game.scene.getScene('FishingScene').fishingSystem.minigamePanel),
    }));
    expect(minigame.state).toBe('minigame');
    expect(minigame.hasPanel).toBe(true);
    await page.screenshot({ path: 'test-results/tidefall-minigame.png', fullPage: true });
  });
});
