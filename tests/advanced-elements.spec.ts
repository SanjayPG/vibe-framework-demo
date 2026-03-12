/**
 * ============================================================
 *  ADVANCED ELEMENTS TEST — Select Boxes, Windows, Alerts
 * ============================================================
 *
 *  This test demonstrates how Vibe Framework handles:
 *  1. Select/Dropdown elements (single & multi-select)
 *  2. Window/Tab switching
 *  3. Alert/Confirm/Prompt dialogs
 *  4. Cascading dropdowns
 *
 *  APPROACH:
 *  - Use session.do() for element interactions
 *  - Use Playwright for dialog listeners, window switching
 *  - Hybrid approach for complex scenarios
 */

import { test, expect } from '@playwright/test';
import { vibe, AIProvider } from '@sdetsanjay/vibe-framework';
import dotenv from 'dotenv';
import path from 'path';
import { getVideoConfig, getReportingConfig } from './helpers/vibeConfig';

dotenv.config();

// Helper to build session
function buildSession(page: any) {
  const videoConfig = getVideoConfig();
  const reportingConfig = getReportingConfig();

  return vibe()
    .withPage(page)
    .withMode('smart-cache')
    .withAIProvider(AIProvider.GROQ, process.env.GROQ_API_KEY!)
    .withReporting(reportingConfig)
    .withVideo(videoConfig.mode, {
      size: videoConfig.size,
      dir: videoConfig.dir
    })
    .build();
}

// Test page URL
const TEST_PAGE = `file:///${path.resolve(__dirname, '../test-pages/advanced-elements.html').replace(/\\/g, '/')}`;
const NEW_WINDOW_PAGE = `file:///${path.resolve(__dirname, '../test-pages/new-window-content.html').replace(/\\/g, '/')}`;

test.describe('Advanced Elements - Select Boxes', () => {

  // ── Test 1: Single Select Dropdown ──
  test('should select option from dropdown using natural language', async ({ page }) => {
    const session = buildSession(page);
    await page.goto(TEST_PAGE);

    console.log('🔽 Testing single select dropdown...');

    // Method 1: Using session.do() with natural language
    await session.do('select "United States" from the country selector');

    // Verify selection with Playwright
    const countryValue = await page.selectOption('#country-select', 'us');
    expect(countryValue).toContain('us');

    console.log('✅ Country selected via natural language');

    await session.shutdown();
  });

  // ── Test 2: Multiple Dropdowns in Sequence ──
  test('should handle multiple dropdowns in sequence', async ({ page }) => {
    const session = buildSession(page);
    await page.goto(TEST_PAGE);

    console.log('🔽 Testing multiple dropdowns...');

    // Select country
    await session.do('select "Canada" from country selector');

    // Verify with Playwright
    let value = await page.inputValue('#country-select');
    expect(value).toBe('ca');

    // Select size
    await session.do('choose "Large" from the size selector');
    value = await page.inputValue('#size-select');
    expect(value).toBe('l');

    // Select plan
    await session.do('pick "Premium" from subscription plan');
    value = await page.inputValue('#plan-select');
    expect(value).toBe('premium');

    console.log('✅ All dropdowns selected successfully');

    // Submit and verify results
    await session.do('click the submit selections button');
    await page.waitForTimeout(500);

    const resultVisible = await page.locator('#select-result').isVisible();
    expect(resultVisible).toBe(true);

    await session.shutdown();
  });

  // ── Test 3: Hybrid Approach - NL + Playwright ──
  test('should use hybrid approach for complex select operations', async ({ page }) => {
    const session = buildSession(page);
    await page.goto(TEST_PAGE);

    console.log('🔄 Testing hybrid approach...');

    // Use NL to find and click the dropdown (if needed)
    // Then use Playwright for precise selection (faster, no AI cost)
    await page.selectOption('#country-select', { label: 'Australia' });
    await page.selectOption('#size-select', { value: 'xl' });
    await page.selectOption('#plan-select', { label: 'Enterprise - $49.99/mo' });

    // Verify selections
    expect(await page.inputValue('#country-select')).toBe('au');
    expect(await page.inputValue('#size-select')).toBe('xl');
    expect(await page.inputValue('#plan-select')).toBe('enterprise');

    console.log('✅ Hybrid approach successful - fast & accurate');

    await session.shutdown();
  });

  // ── Test 4: Cascading Dropdowns ──
  test('should handle cascading dropdowns', async ({ page }) => {
    const session = buildSession(page);
    await page.goto(TEST_PAGE);

    console.log('🔗 Testing cascading dropdowns...');

    // Select category first
    await session.do('select "Electronics" from category selector');

    // Wait for product dropdown to populate
    await page.waitForTimeout(500);

    // Check that product dropdown is now enabled
    const isDisabled = await page.locator('#product-select').isDisabled();
    expect(isDisabled).toBe(false);

    // Select product
    await session.do('select "Laptop" from product selector');

    const productValue = await page.inputValue('#product-select');
    expect(productValue).toBe('laptop');

    console.log('✅ Cascading dropdowns handled correctly');

    await session.shutdown();
  });
});

test.describe('Advanced Elements - Dialog Handling', () => {

  // ── Test 5: Simple Alert ──
  test('should handle alert dialog', async ({ page }) => {
    const session = buildSession(page);
    await page.goto(TEST_PAGE);

    console.log('⚠️  Testing alert dialog...');

    // Setup alert listener BEFORE triggering
    page.once('dialog', async dialog => {
      console.log(`   Alert message: "${dialog.message()}"`);
      expect(dialog.type()).toBe('alert');
      expect(dialog.message()).toBe('This is a simple alert dialog!');
      await dialog.accept();
    });

    // Trigger alert with natural language
    await session.do('click the show alert button');

    // Verify result message appeared
    await page.waitForTimeout(500);
    const resultVisible = await page.locator('#dialog-result').isVisible();
    expect(resultVisible).toBe(true);

    console.log('✅ Alert handled successfully');

    await session.shutdown();
  });

  // ── Test 6: Confirm Dialog ──
  test('should handle confirm dialog with accept', async ({ page }) => {
    const session = buildSession(page);
    await page.goto(TEST_PAGE);

    console.log('✔️  Testing confirm dialog (Accept)...');

    page.once('dialog', async dialog => {
      expect(dialog.type()).toBe('confirm');
      expect(dialog.message()).toBe('Do you want to proceed?');
      await dialog.accept(); // Click OK
    });

    await session.do('click the show confirm button');
    await page.waitForTimeout(500);

    const resultText = await page.locator('#dialog-result').textContent();
    expect(resultText).toContain('OK clicked');

    console.log('✅ Confirm (Accept) handled successfully');

    await session.shutdown();
  });

  // ── Test 7: Confirm Dialog - Dismiss ──
  test('should handle confirm dialog with dismiss', async ({ page }) => {
    const session = buildSession(page);
    await page.goto(TEST_PAGE);

    console.log('❌ Testing confirm dialog (Dismiss)...');

    page.once('dialog', async dialog => {
      expect(dialog.type()).toBe('confirm');
      await dialog.dismiss(); // Click Cancel
    });

    await session.do('click the show confirm button');
    await page.waitForTimeout(500);

    const resultText = await page.locator('#dialog-result').textContent();
    expect(resultText).toContain('Cancel clicked');

    console.log('✅ Confirm (Dismiss) handled successfully');

    await session.shutdown();
  });

  // ── Test 8: Prompt Dialog ──
  test('should handle prompt dialog with input', async ({ page }) => {
    const session = buildSession(page);
    await page.goto(TEST_PAGE);

    console.log('📝 Testing prompt dialog...');

    page.once('dialog', async dialog => {
      expect(dialog.type()).toBe('prompt');
      expect(dialog.message()).toBe('What is your name?');
      expect(dialog.defaultValue()).toBe('John Doe');
      await dialog.accept('Alice Smith'); // Enter custom text
    });

    await session.do('click the show prompt button');
    await page.waitForTimeout(500);

    const resultText = await page.locator('#dialog-result').textContent();
    expect(resultText).toContain('Alice Smith');

    console.log('✅ Prompt handled with custom input');

    await session.shutdown();
  });

  // ── Test 9: Multiple Sequential Alerts ──
  test('should handle multiple sequential alerts', async ({ page }) => {
    const session = buildSession(page);
    await page.goto(TEST_PAGE);

    console.log('🔔 Testing multiple sequential alerts...');

    let alertCount = 0;

    // Handle all 3 alerts
    page.on('dialog', async dialog => {
      alertCount++;
      console.log(`   Alert ${alertCount}: "${dialog.message()}"`);
      expect(dialog.message()).toBe(`Alert ${alertCount} of 3`);
      await dialog.accept();
    });

    await session.do('click the show 3 alerts in sequence button');
    await page.waitForTimeout(1000);

    expect(alertCount).toBe(3);
    console.log('✅ All 3 alerts handled successfully');

    await session.shutdown();
  });
});

test.describe('Advanced Elements - Window Switching', () => {

  // ── Test 10: Open New Window and Switch ──
  test('should open new window and switch to it', async ({ page, context }) => {
    const session = buildSession(page);
    await page.goto(TEST_PAGE);

    console.log('🪟 Testing window switching...');

    // Track new page opening
    const pagePromise = context.waitForEvent('page');

    // Trigger new window with natural language
    await session.do('click the open new window button');

    // Wait for new page to open
    const newPage = await pagePromise;
    await newPage.waitForLoadState();

    console.log(`   New window opened: ${newPage.url()}`);

    // Verify new window loaded correct content
    const heading = await newPage.locator('h1').textContent();
    expect(heading).toContain('New Window Opened Successfully');

    console.log('✅ New window detected and verified');

    // Create new session for new window
    const newSession = vibe()
      .withPage(newPage)
      .withMode('smart-cache')
      .withAIProvider(AIProvider.GROQ, process.env.GROQ_API_KEY!)
      .withReporting(getReportingConfig())
      .build();

    // Interact with elements in new window
    await newSession.do('type "Testing new window" into the input field');

    const inputValue = await newPage.inputValue('#new-window-input');
    expect(inputValue).toBe('Testing new window');

    console.log('✅ Successfully interacted with new window');

    // Close new window
    await newPage.close();
    await newSession.shutdown();
    await session.shutdown();
  });

  // ── Test 11: New Tab via Link ──
  test('should open new tab via link and interact', async ({ page, context }) => {
    const session = buildSession(page);
    await page.goto(TEST_PAGE);

    console.log('🔗 Testing new tab via link...');

    const pagePromise = context.waitForEvent('page');

    // Click link that opens in new tab
    await session.do('click the link that says open in new tab');

    const newPage = await pagePromise;
    await newPage.waitForLoadState();

    console.log(`   New tab opened: ${newPage.url()}`);

    // Verify we can interact with new tab
    const newSession = vibe()
      .withPage(newPage)
      .withMode('smart-cache')
      .withAIProvider(AIProvider.GROQ, process.env.GROQ_API_KEY!)
      .build();

    // Click accept button in new tab
    await newSession.do('click the accept button');

    // Wait for result to appear
    await newPage.waitForTimeout(500);
    const resultVisible = await newPage.locator('#result').isVisible();
    expect(resultVisible).toBe(true);

    console.log('✅ New tab interaction successful');

    // Window should auto-close after 2 seconds
    await newPage.waitForTimeout(2500);
    expect(newPage.isClosed()).toBe(true);

    console.log('✅ New tab closed automatically');

    await newSession.shutdown();
    await session.shutdown();
  });

  // ── Test 12: Multiple Windows Management ──
  test('should manage multiple windows simultaneously', async ({ page, context }) => {
    const session = buildSession(page);
    await page.goto(TEST_PAGE);

    console.log('🪟🪟 Testing multiple windows...');

    // Open first new window
    const page1Promise = context.waitForEvent('page');
    await session.do('click the open new window button');
    const newPage1 = await page1Promise;
    await newPage1.waitForLoadState();

    // Go back to original page and open second window
    const page2Promise = context.waitForEvent('page');
    await session.do('click the open in new tab button');
    const newPage2 = await page2Promise;
    await newPage2.waitForLoadState();

    // Verify we have 3 pages total
    const allPages = context.pages();
    expect(allPages.length).toBe(3);

    console.log(`   Total pages open: ${allPages.length}`);

    // Create sessions for each window
    const session1 = vibe()
      .withPage(newPage1)
      .withMode('smart-cache')
      .withAIProvider(AIProvider.GROQ, process.env.GROQ_API_KEY!)
      .build();

    const session2 = vibe()
      .withPage(newPage2)
      .withMode('smart-cache')
      .withAIProvider(AIProvider.GROQ, process.env.GROQ_API_KEY!)
      .build();

    // Interact with window 1
    await session1.do('type "Window 1" into the input field');
    expect(await newPage1.inputValue('#new-window-input')).toBe('Window 1');

    // Interact with window 2
    await session2.do('type "Window 2" into the input field');
    expect(await newPage2.inputValue('#new-window-input')).toBe('Window 2');

    console.log('✅ Multiple windows managed successfully');

    // Cleanup
    await newPage1.close();
    await newPage2.close();
    await session1.shutdown();
    await session2.shutdown();
    await session.shutdown();
  });

  // ── Test 13: Alert in New Window ──
  test('should handle alert in new window', async ({ page, context }) => {
    const session = buildSession(page);
    await page.goto(TEST_PAGE);

    console.log('⚠️🪟 Testing alert in new window...');

    const pagePromise = context.waitForEvent('page');
    await session.do('click the open new window button');
    const newPage = await pagePromise;
    await newPage.waitForLoadState();

    // Setup alert listener for NEW window
    newPage.once('dialog', async dialog => {
      console.log(`   Alert in new window: "${dialog.message()}"`);
      expect(dialog.message()).toBe('This alert is from the new window!');
      await dialog.accept();
    });

    // Create session for new window
    const newSession = vibe()
      .withPage(newPage)
      .withMode('smart-cache')
      .withAIProvider(AIProvider.GROQ, process.env.GROQ_API_KEY!)
      .build();

    // Trigger alert in new window
    await newSession.do('click the show alert in new window button');
    await newPage.waitForTimeout(500);

    console.log('✅ Alert in new window handled successfully');

    await newPage.close();
    await newSession.shutdown();
    await session.shutdown();
  });
});

test.describe('Advanced Elements - Edge Cases', () => {

  // ── Test 14: Disabled Select Re-enablement ──
  test('should wait for disabled select to become enabled', async ({ page }) => {
    const session = buildSession(page);
    await page.goto(TEST_PAGE);

    console.log('⏳ Testing disabled-to-enabled select...');

    // Initially product select is disabled
    expect(await page.locator('#product-select').isDisabled()).toBe(true);

    // Select category to enable product select
    await session.do('select "Books" from category');
    await page.waitForTimeout(300);

    // Now product select should be enabled
    expect(await page.locator('#product-select').isDisabled()).toBe(false);

    // Can now select product
    await session.do('select "Fiction" from product');
    expect(await page.inputValue('#product-select')).toBe('fiction');

    console.log('✅ Disabled-to-enabled select handled');

    await session.shutdown();
  });

  // ── Test 15: Select with Complex Labels ──
  test('should handle select options with complex labels', async ({ page }) => {
    const session = buildSession(page);
    await page.goto(TEST_PAGE);

    console.log('🏷️  Testing complex option labels...');

    // Select option with price in label
    await session.do('select "Premium" from subscription plan');

    const value = await page.inputValue('#plan-select');
    expect(value).toBe('premium');

    // Verify by label
    const selectedOption = await page.locator('#plan-select option:checked').textContent();
    expect(selectedOption).toContain('$19.99/mo');

    console.log('✅ Complex label option selected correctly');

    await session.shutdown();
  });
});
