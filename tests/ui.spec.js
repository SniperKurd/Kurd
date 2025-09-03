/**
 * Playwright end-to-end tests for swap UI and admin configuration.
 */
const { test, expect } = require('playwright/test');
const { spawn } = require('child_process');
const path = require('path');

test.describe.configure({ mode: 'serial' });

let server;
test.beforeAll(async () => {
  const root = path.resolve(__dirname, '..');
  server = spawn('npx', ['http-server', '-a', '127.0.0.1', '-p', '8080', '-c-1', '.'], {
    cwd: root,
    stdio: 'ignore'
  });
  await new Promise(res => setTimeout(res, 1000));
});

test.afterAll(() => {
  if (server) server.kill();
});

test('index loads and shows swap elements', async ({ page }) => {
  await page.goto('http://127.0.0.1:8080/index.html');
  await expect(page.locator('h1')).toHaveText('Token Swap');
  await expect(page.locator('#swapBtn')).toBeVisible();
});

test('admin accepts pair and slippage with mocked RPC', async ({ page }) => {
  await page.route('https://mock.rpc/**', route => {
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, result: '0x1' })
    });
  });
  await page.goto('http://127.0.0.1:8080/admin.html');
  await page.fill('#pair', '0x0000000000000000000000000000000000000001');
  await page.fill('#rpc', 'https://mock.rpc');
  await page.fill('#slippage', '2');
  await page.click('#testBtn');
  await expect(page.locator('#msg')).toContainText('اتصال ناجح');
});
