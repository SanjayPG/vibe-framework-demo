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

dotenv.config();

test.describe('Parallel Execution Tests', () => {
  // Test 1: Login test
  test('parallel test 1 - login', async ({ page }) => {
    const session = vibe()
      .withPage(page)
      .withMode('smart-cache')
      .withAIProvider('GROQ', process.env.GROQ_API_KEY!)
      .withReporting({ console: true })
      .build();

    await page.goto('https://www.saucedemo.com');

    await session.do('type "standard_user" into username field');
    await session.do('type "secret_sauce" into password field');
    await session.do('click the login button');

    const result = await session.check('verify products page loaded');
    expect(result.success).toBe(true);

    await session.shutdown();
  });

  // Test 2: Product listing test
  test('parallel test 2 - product listing', async ({ page }) => {
    const session = vibe()
      .withPage(page)
      .withMode('smart-cache')
      .withAIProvider('GROQ', process.env.GROQ_API_KEY!)
      .withReporting({ console: true })
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
    const session = vibe()
      .withPage(page)
      .withMode('smart-cache')
      .withAIProvider('GROQ', process.env.GROQ_API_KEY!)
      .withReporting({ console: true })
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
    const session = vibe()
      .withPage(page)
      .withMode('smart-cache')
      .withAIProvider('GROQ', process.env.GROQ_API_KEY!)
      .withReporting({ console: true })
      .build();

    await page.goto('https://www.saucedemo.com');

    await session.do('type "standard_user" into username field');
    await session.do('type "secret_sauce" into password field');
    await session.do('click the login button');

    await session.do('click add to cart button for first product');
    await session.do('click shopping cart icon');

    const result = await session.check('verify cart page is displayed');
    expect(result.success).toBe(true);

    await session.shutdown();
  });
});
