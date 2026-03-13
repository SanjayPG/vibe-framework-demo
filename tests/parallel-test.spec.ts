/**
 * Parallel Execution Test
 *
 * Demonstrates:
 * - Thread-safe parallel test execution
 * - File-based locking to prevent cache race conditions
 * - Running multiple tests concurrently with vibe-framework
 *
 * Run with: npx playwright test --workers=4
 * Expected speedup: 2.5x-3.5x faster
 */

import { test, expect } from '@playwright/test';
import { vibe } from '@sdetsanjay/vibe-framework';
import dotenv from 'dotenv';
import { getVideoConfig, getReportingConfig, configureAI } from './helpers/vibeConfig';

dotenv.config();

test.describe('Parallel Execution Tests', () => {
  // Test 1: Login test
  test('parallel test 1 - login', async ({ page }) => {
    const videoConfig = getVideoConfig();
    const reportingConfig = getReportingConfig();

    let sessionBuilder = vibe()
      .withPage(page)
      .withMode('smart-cache');

    sessionBuilder = configureAI(sessionBuilder);

    const session = sessionBuilder
      .withReporting(reportingConfig)
      .withVideo(videoConfig.mode, {
        size: videoConfig.size,
        dir: videoConfig.dir
      })
      .build();

    await page.goto('https://www.saucedemo.com');

    await session.do('type "standard_user" into username field');
    await session.do('type "secret_sauce" into password field');
    await session.do('click the login button');

    // Wait for page to load
    await page.waitForSelector('.inventory_list', { timeout: 5000 });
    expect(page.url()).toContain('inventory.html');

    await session.shutdown();
  });

  // Test 2: Product listing test
  test('parallel test 2 - product listing', async ({ page }) => {
    const videoConfig = getVideoConfig();
    const reportingConfig = getReportingConfig();

    let sessionBuilder = vibe()
      .withPage(page)
      .withMode('smart-cache');

    sessionBuilder = configureAI(sessionBuilder);

    const session = sessionBuilder
      .withReporting(reportingConfig)
      .withVideo(videoConfig.mode, {
        size: videoConfig.size,
        dir: videoConfig.dir
      })
      .build();

    await page.goto('https://www.saucedemo.com');

    await session.do('type "standard_user" into username field');
    await session.do('type "secret_sauce" into password field');
    await session.do('click the login button');

    const productName = await session.extract('name of first product');
    expect(productName).toBeTruthy();

    await session.shutdown();
  });

  // Test 3: Add to cart test
  test('parallel test 3 - add to cart', async ({ page }) => {
    const videoConfig = getVideoConfig();
    const reportingConfig = getReportingConfig();

    let sessionBuilder = vibe()
      .withPage(page)
      .withMode('smart-cache');

    sessionBuilder = configureAI(sessionBuilder);

    const session = sessionBuilder
      .withReporting(reportingConfig)
      .withVideo(videoConfig.mode, {
        size: videoConfig.size,
        dir: videoConfig.dir
      })
      .build();

    await page.goto('https://www.saucedemo.com');

    await session.do('type "standard_user" into username field');
    await session.do('type "secret_sauce" into password field');
    await session.do('click the login button');

    await session.do('click add to cart button for first product');
    await session.check('verify cart badge shows 1');

    await session.shutdown();
  });

  // Test 4: Cart navigation test
  test('parallel test 4 - cart navigation', async ({ page }) => {
    const videoConfig = getVideoConfig();
    const reportingConfig = getReportingConfig();

    let sessionBuilder = vibe()
      .withPage(page)
      .withMode('smart-cache');

    sessionBuilder = configureAI(sessionBuilder);

    const session = sessionBuilder
      .withReporting(reportingConfig)
      .withVideo(videoConfig.mode, {
        size: videoConfig.size,
        dir: videoConfig.dir
      })
      .build();

    await page.goto('https://www.saucedemo.com');

    await session.do('type "standard_user" into username field');
    await session.do('type "secret_sauce" into password field');
    await session.do('click the login button');

    await session.do('click add to cart button for first product');
    await session.do('click shopping cart icon');

    // Wait for cart page to load
    await page.waitForSelector('.cart_list', { timeout: 5000 });
    expect(page.url()).toContain('cart.html');

    await session.shutdown();
  });
});
