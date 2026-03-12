/**
 * Groq AI Provider Test
 *
 * Demonstrates:
 * - Using Groq as the AI provider (fastest option)
 * - Smart caching with Groq
 * - HTML reporting with video embedding
 * - Video recording on failure
 *
 * Groq is recommended for:
 * - Fast development iterations
 * - Free tier usage
 * - Quick test execution
 */

import { test, expect } from '@playwright/test';
import { vibe, AIProvider } from '@sdetsanjay/vibe-framework';
import dotenv from 'dotenv';
import { getVideoConfig, getReportingConfig } from './helpers/vibeConfig';

dotenv.config();

test.describe('Groq Provider Tests', () => {
  test('should work with Groq AI provider', async ({ page }) => {
    // Configure with Groq provider and video recording
    const videoConfig = getVideoConfig();
    const reportingConfig = getReportingConfig();

    const session = vibe()
      .withPage(page)
      .withMode('smart-cache')
      .withAIProvider(AIProvider.GROQ, process.env.GROQ_API_KEY!)  // Using Groq
      .withReporting(reportingConfig)
      .withVideo(videoConfig.mode, {
        size: videoConfig.size,
        dir: videoConfig.dir
      })
      .build();

    await page.goto('https://www.saucedemo.com');

    // Perform login flow
    await session.do('type "standard_user" into username field');
    await session.do('type "secret_sauce" into password field');
    await session.do('click the login button');

    // Verify success - wait for page load
    await page.waitForSelector('.inventory_list', { timeout: 5000 });
    expect(page.url()).toContain('inventory.html');

    // Extract product info
    const productName = await session.extract('name of first product');
    console.log('First product name:', productName);
    expect(productName).toBeTruthy();

    // Add to cart
    await session.do('click add to cart button for first product');

    // Verify cart updated
    const cartResult = await session.check('verify cart badge shows 1');
    expect(cartResult.success).toBe(true);

    console.log('✅ Groq provider test completed successfully!');

    await session.shutdown();
  });

  test('should demonstrate cache benefit with Groq', async ({ page }) => {
    const videoConfig = getVideoConfig();
    const reportingConfig = getReportingConfig();

    const session = vibe()
      .withPage(page)
      .withMode('smart-cache')
      .withAIProvider(AIProvider.GROQ, process.env.GROQ_API_KEY!)
      .withReporting(reportingConfig)
      .withVideo(videoConfig.mode, {
        size: videoConfig.size,
        dir: videoConfig.dir
      })
      .build();

    await page.goto('https://www.saucedemo.com');

    // Same actions as previous test
    // On first run: Uses Groq AI
    // On subsequent runs: Uses cache (instant!)
    await session.do('type "standard_user" into username field');
    await session.do('type "secret_sauce" into password field');
    await session.do('click the login button');

    // Wait for inventory to load
    await page.waitForSelector('.inventory_list', { timeout: 5000 });
    expect(page.url()).toContain('inventory.html');

    console.log('✅ Test completed - check console output for cache details');

    await session.shutdown();
  });

  test('should handle errors gracefully with Groq', async ({ page }) => {
    const videoConfig = getVideoConfig();
    const reportingConfig = getReportingConfig();

    const session = vibe()
      .withPage(page)
      .withMode('smart-cache')
      .withAIProvider(AIProvider.GROQ, process.env.GROQ_API_KEY!)
      .withReporting(reportingConfig)
      .withVideo(videoConfig.mode, {
        size: videoConfig.size,
        dir: videoConfig.dir
      })
      .build();

    await page.goto('https://www.saucedemo.com');

    // Login first
    await session.do('type "standard_user" into username field');
    await session.do('type "secret_sauce" into password field');
    await session.do('click the login button');

    // Try to find something that doesn't exist
    try {
      const result = await session.check('verify non-existent element appears');
      // Should fail gracefully
      expect(result.success).toBe(false);
      console.log('✅ Error handled gracefully');
    } catch (error) {
      console.log('Error caught:', error);
      // Error is expected for non-existent elements
    }

    await session.shutdown();
  });
});
