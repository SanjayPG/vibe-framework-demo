/**
 * Basic SauceDemo Login Test
 *
 * Demonstrates:
 * - Natural language commands with vibe-framework
 * - Smart caching for faster subsequent runs
 * - HTML and console reporting
 * - Basic do(), check(), and extract() operations
 */

import { test, expect } from '@playwright/test';
import { vibe } from '@sdetsanjay/vibe-framework';
import dotenv from 'dotenv';
import { getVideoConfig, getReportingConfig, configureAI } from './helpers/vibeConfig';

// Load environment variables
dotenv.config();

test.describe('SauceDemo Login Flow', () => {
  test('should login successfully with valid credentials', async ({ page }) => {
    // Create vibe session with video recording
    const videoConfig = getVideoConfig();
    const reportingConfig = getReportingConfig();

    let sessionBuilder = vibe()
      .withPage(page)
      .withMode('smart-cache');  // Cache selectors for 95-99% faster runs

    // Configure AI provider (handles both cloud and local models)
    sessionBuilder = configureAI(sessionBuilder);

    const session = sessionBuilder
      .withReporting(reportingConfig)
      .withVideo(videoConfig.mode, {
        size: videoConfig.size,
        dir: videoConfig.dir
      })
      .build();

     // Standard Playwright — navigation
    await page.goto('https://www.saucedemo.com');

     // Natural language — element interaction
    await session.do('type "standard_user" into username field');
    await session.do('type "secret_sauce" into password field');
    await session.do('click the login button');

    // Standard Playwright — wait + assertion (no AI cost, no ambiguity)
    await page.waitForSelector('.inventory_list', { timeout: 5000 });

    // Verify we can see products by checking the URL
    expect(page.url()).toContain('inventory.html');

    console.log('✅ Login successful!');

    // Clean up and generate reports
    await session.shutdown();
  });

  test('should display product inventory after login', async ({ page }) => {
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

    // Login
    await session.do('type "standard_user" into username field');
    await session.do('type "secret_sauce" into password field');
    await session.do('click the login button');

    // Extract product information
    const firstProduct = await session.extract('name of the first product');
    console.log('First product:', firstProduct);

    expect(firstProduct).toBeTruthy();
    if (firstProduct) {
      expect(firstProduct.length).toBeGreaterThan(0);
    }

    await session.shutdown();
  });

  test('should add item to cart and verify', async ({ page }) => {
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

    // Login
    await session.do('type "standard_user" into username field');
    await session.do('type "secret_sauce" into password field');
    await session.do('click the login button');
    // Add item to cart
    await session.do('click the add to cart button for the first product');

    // Verify cart badge
    await session.check('verify shopping cart badge shows 1');

    // Navigate to cart
    await session.do('click the shopping cart icon');

    // Verify item in cart
    const result = await session.check('verify cart contains at least one item');
    expect(result.success).toBe(true);

    console.log('✅ Item added to cart successfully!');

    await session.shutdown();
  });
});
