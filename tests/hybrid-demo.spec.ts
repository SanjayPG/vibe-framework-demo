/**
 * ============================================================
 *  HYBRID DEMO — Natural Language + Playwright Side by Side
 * ============================================================
 *
 *  This file demonstrates the core philosophy of Vibe Framework:
 *
 *    ┌─────────────────────────────────────────────────────┐
 *    │  Use session.do()   → for INTERACTING with elements  │
 *    │  Use Playwright     → for NAVIGATION & ASSERTIONS    │
 *    └─────────────────────────────────────────────────────┘
 *
 *  Natural language handles the "which element?" problem.
 *  Playwright handles the rest — fast, zero AI cost.
 *
 *  Layers:
 *    NL command → NLParser (AI) → AutoHealBridge (AI/cache)
 *                → ActionExecutor → Playwright API
 *
 *  After the first run, selectors are cached in:
 *    autoheal-cache/selectors.json
 *  — subsequent runs are 95–99% faster with $0 AI cost.
 */

import { test, expect } from '@playwright/test';
import { vibe, AIProvider } from '@sdetsanjay/vibe-framework';
import dotenv from 'dotenv';
import { getVideoConfig, getReportingConfig } from './helpers/vibeConfig';

// Load API keys from .env
dotenv.config();

// ─────────────────────────────────────────────────────────────
//  Helper: build a fresh VibeSession for each test
//  (every test gets its own session so reports stay isolated)
// ─────────────────────────────────────────────────────────────
function buildSession(page: any) {
  const videoConfig    = getVideoConfig();
  const reportingConfig = getReportingConfig();

  return vibe()
    .withPage(page)
    .withMode('smart-cache')                              // persist selector cache to disk
    .withAIProvider(AIProvider.GROQ, process.env.GROQ_API_KEY!)
    .withReporting(reportingConfig)                       // HTML + JSON + CSV reports
    .withVideo(videoConfig.mode, {
      size: videoConfig.size,
      dir:  videoConfig.dir
    })
    .build();
}

// ─────────────────────────────────────────────────────────────
//  Test Suite
// ─────────────────────────────────────────────────────────────
test.describe('Hybrid Demo — NL + Playwright Together', () => {

  // ── Test 1 ──────────────────────────────────────────────────
  test('login with natural language, assert with Playwright', async ({ page }) => {
    const session = buildSession(page);

    // ── PLAYWRIGHT ── navigate to the app (no element lookup needed)
    await page.goto('https://www.saucedemo.com');

    // ── NATURAL LANGUAGE ── fill the login form
    //    Vibe sends these strings to the AI, which resolves the
    //    correct CSS selectors (#user-name, #password, #login-button)
    await session.do('type "standard_user" into username field');
    await session.do('type "secret_sauce" into password field');
    await session.do('click the login button');

    // ── PLAYWRIGHT ── wait for the products page to load
    //    Standard Playwright is faster and more reliable for
    //    DOM-ready checks — no AI involved here
    await page.waitForSelector('.inventory_list', { timeout: 5000 });

    // ── PLAYWRIGHT ── assert the URL changed to the inventory page
    expect(page.url()).toContain('inventory.html');

    console.log('✅ Login verified via Playwright URL assertion');

    // Flush session reports (HTML / JSON / CSV / video)
    await session.shutdown();
  });

  // ── Test 2 ──────────────────────────────────────────────────
  test('extract product name with NL, validate length with Playwright', async ({ page }) => {
    const session = buildSession(page);

    // ── PLAYWRIGHT ── navigate
    await page.goto('https://www.saucedemo.com');

    // ── NATURAL LANGUAGE ── log in
    await session.do('type "standard_user" into username field');
    await session.do('type "secret_sauce" into password field');
    await session.do('click the login button');

    // ── PLAYWRIGHT ── wait for inventory to be visible
    await page.waitForSelector('.inventory_list', { timeout: 5000 });

    // ── NATURAL LANGUAGE ── extract text from an element by description
    //    session.extract() returns the innerText / value of the matched element
    const firstProduct = await session.extract('name of the first product');
    console.log('📦 First product found:', firstProduct);

    // ── PLAYWRIGHT ── assert the extracted value is a non-empty string
    expect(firstProduct).toBeTruthy();
    if (firstProduct) {
      expect(firstProduct.length).toBeGreaterThan(0);
    }

    await session.shutdown();
  });

  // ── Test 3 ──────────────────────────────────────────────────
  test('add to cart with NL, verify badge and navigate with Playwright', async ({ page }) => {
    const session = buildSession(page);

    // ── PLAYWRIGHT ── navigate
    await page.goto('https://www.saucedemo.com');

    // ── NATURAL LANGUAGE ── log in (cached after first run → instant)
    await session.do('type "standard_user" into username field');
    await session.do('type "secret_sauce" into password field');
    await session.do('click the login button');

    // ── PLAYWRIGHT ── guard: make sure we are on the products page
    await page.waitForSelector('.inventory_list', { timeout: 5000 });

    // ── NATURAL LANGUAGE ── click the add-to-cart button for the first product
    //    The AI identifies the correct button even without a specific selector
    await session.do('click the add to cart button for the first product');

    // ── NATURAL LANGUAGE ── soft assertion: check element content via AI
    //    session.check() returns { success: boolean, message: string }
    //    Use this when you need AI to evaluate visible text on the page
    const badgeCheck = await session.check('verify shopping cart badge shows 1');
    console.log('🛒 Cart badge check:', badgeCheck.success ? 'passed' : 'failed');

    // ── NATURAL LANGUAGE ── click cart icon to open cart page
    await session.do('click the shopping cart icon');

    // ── PLAYWRIGHT ── assert the URL moved to cart.html
    //    Faster and more deterministic than asking the AI to verify the URL
    await page.waitForURL('**/cart.html', { timeout: 5000 });
    expect(page.url()).toContain('cart.html');

    // ── NATURAL LANGUAGE ── final content check inside the cart page
    const cartCheck = await session.check('verify cart contains at least one item');

    // ── PLAYWRIGHT ── turn the AI result into a hard test assertion
    expect(cartCheck.success).toBe(true);

    console.log('✅ Cart verified — item present on cart page');

    await session.shutdown();
  });

});
