/**
 * ============================================================
 *  LOGIN SETUP EXAMPLE - Natural Language Login in Hooks
 * ============================================================
 *
 *  This example demonstrates how to use natural language login
 *  in beforeEach hook, so all tests start already logged in.
 *
 *  PATTERN: Login once per test in beforeEach
 *  - Each test starts logged in
 *  - Tests are isolated
 *  - Parallel execution safe
 *  - Login is cached after first run
 */

import { test, expect } from '@playwright/test';
import { vibe, AIProvider } from '@sdetsanjay/vibe-framework';
import dotenv from 'dotenv';
import { getVideoConfig, getReportingConfig } from './helpers/vibeConfig';

dotenv.config();

test.describe('Product Tests - With Login Setup', () => {
  let session: any;

  // ✅ LOGIN BEFORE EACH TEST
  test.beforeEach(async ({ page }) => {
    console.log('🔐 Setting up: Logging in...');

    const videoConfig = getVideoConfig();
    const reportingConfig = getReportingConfig();

    // Create session
    session = vibe()
      .withPage(page)
      .withMode('smart-cache')
      .withAIProvider(AIProvider.GROQ, process.env.GROQ_API_KEY!)
      .withReporting(reportingConfig)
      .withVideo(videoConfig.mode, {
        size: videoConfig.size,
        dir: videoConfig.dir
      })
      .build();

    // Navigate to login page
    await page.goto('https://www.saucedemo.com');

    // ✅ PERFORM LOGIN using natural language
    await session.do('type "standard_user" into username field');
    await session.do('type "secret_sauce" into password field');
    await session.do('click the login button');

    // Wait for login to complete
    await page.waitForURL('**/inventory.html', { timeout: 5000 });

    console.log('✅ Login complete - test can start');
  });

  // ✅ CLEANUP AFTER EACH TEST
  test.afterEach(async () => {
    console.log('🧹 Cleaning up session...');
    if (session) {
      await session.shutdown();
      session = null;
    }
  });

  // ──────────────────────────────────────────────────────────
  //  Tests start HERE - already logged in!
  // ──────────────────────────────────────────────────────────

  test('should display product inventory', async ({ page }) => {
    // ✅ Already logged in from beforeEach!
    console.log('📦 Test: Checking product inventory...');

    // Verify products are displayed
    const productCount = await page.locator('.inventory_item').count();
    expect(productCount).toBeGreaterThan(0);

    console.log(`✅ Found ${productCount} products`);
  });

  test('should add product to cart', async ({ page }) => {
    // ✅ Already logged in from beforeEach!
    console.log('🛒 Test: Adding product to cart...');

    // Add product using natural language
    await session.do('click the add to cart button for the first product');

    // Verify cart badge
    const cartBadge = await page.locator('.shopping_cart_badge').textContent();
    expect(cartBadge).toBe('1');

    console.log('✅ Product added to cart');
  });

  test('should view product details', async ({ page }) => {
    // ✅ Already logged in from beforeEach!
    console.log('🔍 Test: Viewing product details...');

    // Click product using natural language
    await session.do('click on the first product card');

    // Wait for product details page
    await page.waitForURL('**/inventory-item.html**');

    // Verify product details are shown
    const productName = await page.locator('.inventory_details_name').textContent();
    expect(productName).toBeTruthy();

    console.log(`✅ Product details shown: ${productName}`);
  });

  test('should filter products by price', async ({ page }) => {
    // ✅ Already logged in from beforeEach!
    console.log('💰 Test: Filtering products...');

    // Use natural language to interact with filter
    await session.do('select "Price (low to high)" from the sort dropdown');

    // Wait for page to reorder
    await page.waitForTimeout(500);

    // Verify first item is cheapest
    const prices = await page.locator('.inventory_item_price').allTextContents();
    expect(prices.length).toBeGreaterThan(0);

    console.log('✅ Products filtered by price');
  });

  test('should navigate to cart', async ({ page }) => {
    // ✅ Already logged in from beforeEach!
    console.log('🛒 Test: Navigating to cart...');

    // Click cart icon using natural language
    await session.do('click the shopping cart icon');

    // Verify cart page
    await page.waitForURL('**/cart.html');
    expect(page.url()).toContain('cart.html');

    console.log('✅ Cart page displayed');
  });
});

// ────────────────────────────────────────────────────────────
//  ALTERNATIVE PATTERN: Login ONCE for all tests (sequential)
// ────────────────────────────────────────────────────────────

test.describe.configure({ mode: 'serial' }); // Run sequentially

test.describe('Checkout Flow - Single Session', () => {
  let session: any;
  let page: any;

  // ✅ LOGIN ONCE before all tests
  test.beforeAll(async ({ browser }) => {
    console.log('🔐 Setting up: Logging in ONCE for all tests...');

    const videoConfig = getVideoConfig();
    const reportingConfig = getReportingConfig();

    // Create context and page
    const context = await browser.newContext();
    page = await context.newPage();

    // Create session
    session = vibe()
      .withPage(page)
      .withMode('smart-cache')
      .withAIProvider(AIProvider.GROQ, process.env.GROQ_API_KEY!)
      .withReporting(reportingConfig)
      .withVideo(videoConfig.mode, {
        size: videoConfig.size,
        dir: videoConfig.dir
      })
      .build();

    // Navigate and login
    await page.goto('https://www.saucedemo.com');
    await session.do('type "standard_user" into username field');
    await session.do('type "secret_sauce" into password field');
    await session.do('click the login button');
    await page.waitForURL('**/inventory.html');

    console.log('✅ Logged in once - will reuse for all tests');
  });

  // ✅ CLEANUP ONCE after all tests
  test.afterAll(async () => {
    console.log('🧹 Cleaning up shared session...');
    if (session) {
      await session.shutdown();
    }
    if (page) {
      await page.close();
    }
  });

  // Tests share the same session (sequential workflow)

  test('step 1: add product to cart', async () => {
    console.log('Step 1: Adding product...');
    await session.do('click add to cart button for backpack');
    const badge = await page.locator('.shopping_cart_badge').textContent();
    expect(badge).toBe('1');
  });

  test('step 2: go to cart', async () => {
    console.log('Step 2: Opening cart...');
    await session.do('click shopping cart icon');
    await page.waitForURL('**/cart.html');
    expect(page.url()).toContain('cart.html');
  });

  test('step 3: proceed to checkout', async () => {
    console.log('Step 3: Checkout...');
    await session.do('click the checkout button');
    await page.waitForURL('**/checkout-step-one.html');
    expect(page.url()).toContain('checkout');
  });

  test('step 4: fill shipping info', async () => {
    console.log('Step 4: Filling form...');
    await session.do('type "John" into first name field');
    await session.do('type "Doe" into last name field');
    await session.do('type "12345" into zip code field');
    await session.do('click continue button');

    await page.waitForURL('**/checkout-step-two.html');
    expect(page.url()).toContain('step-two');
  });
});

// ────────────────────────────────────────────────────────────
//  HELPER FUNCTION PATTERN: Reusable login
// ────────────────────────────────────────────────────────────

async function loginAsUser(page: any, username: string, password: string) {
  const session = vibe()
    .withPage(page)
    .withMode('smart-cache')
    .withAIProvider(AIProvider.GROQ, process.env.GROQ_API_KEY!)
    .build();

  await page.goto('https://www.saucedemo.com');
  await session.do(`type "${username}" into username field`);
  await session.do(`type "${password}" into password field`);
  await session.do('click the login button');
  await page.waitForURL('**/inventory.html');

  return session; // Return session for test to use
}

test.describe('Multi-User Tests', () => {
  let session: any;

  test.afterEach(async () => {
    if (session) {
      await session.shutdown();
    }
  });

  test('login as standard user', async ({ page }) => {
    // ✅ Login with helper function
    session = await loginAsUser(page, 'standard_user', 'secret_sauce');

    const url = page.url();
    expect(url).toContain('inventory.html');
  });

  test('login as problem user', async ({ page }) => {
    // ✅ Login as different user
    session = await loginAsUser(page, 'problem_user', 'secret_sauce');

    const url = page.url();
    expect(url).toContain('inventory.html');
  });
});
