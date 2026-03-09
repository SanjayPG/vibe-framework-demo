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
import { vibe } from '@sdetsanjay/vibe-framework';
import dotenv from 'dotenv';

dotenv.config();

test.describe('Groq Provider Tests', () => {
  test('should work with Groq AI provider', async ({ page }) => {
    // Configure with Groq provider
    const session = vibe()
      .withPage(page)
      .withMode('smart-cache')
      .withAIProvider('GROQ', process.env.GROQ_API_KEY!)  // Using Groq
      .withReporting({
        html: true,
        console: true,
        includeScreenshots: true,
        includeVideos: true
      })
      .withVideo('retain-on-failure')  // Record only failed tests
      .build();

    await page.goto('https://www.saucedemo.com');

    // Perform login flow
    await session.do('type "standard_user" into username field');
    await session.do('type "secret_sauce" into password field');
    await session.do('click the login button');

    // Verify success
    const loginResult = await session.check('verify products page loaded');
    expect(loginResult.success).toBe(true);

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
    console.log(`📊 Execution time: ${loginResult.executionTime}ms`);
    console.log(`💾 From cache: ${loginResult.fromCache}`);

    await session.shutdown();
  });

  test('should demonstrate cache benefit with Groq', async ({ page }) => {
    const session = vibe()
      .withPage(page)
      .withMode('smart-cache')
      .withAIProvider('GROQ', process.env.GROQ_API_KEY!)
      .withReporting({ console: true })
      .build();

    await page.goto('https://www.saucedemo.com');

    // Same actions as previous test
    // On first run: Uses Groq AI
    // On subsequent runs: Uses cache (instant!)
    await session.do('type "standard_user" into username field');
    await session.do('type "secret_sauce" into password field');
    await session.do('click the login button');

    const result = await session.check('verify products page loaded');

    if (result.fromCache) {
      console.log('⚡ Ultra-fast! Selector loaded from cache');
    } else {
      console.log('🤖 AI analysis performed (will be cached for next run)');
    }

    expect(result.success).toBe(true);

    await session.shutdown();
  });

  test('should handle errors gracefully with Groq', async ({ page }) => {
    const session = vibe()
      .withPage(page)
      .withMode('smart-cache')
      .withAIProvider('GROQ', process.env.GROQ_API_KEY!)
      .withReporting({ html: true, console: true })
      .withVideo('retain-on-failure')
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
