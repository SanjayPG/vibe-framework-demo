# Advanced Elements Guide - Vibe Framework

This guide demonstrates how to handle advanced web interactions using Vibe Framework:
- **Select/Dropdown elements**
- **Window/Tab switching**
- **Alert/Confirm/Prompt dialogs**
- **Multi-select elements**
- **Cascading dropdowns**

## 📁 Test Files

- **HTML Test Page**: `test-pages/advanced-elements.html`
- **New Window Page**: `test-pages/new-window-content.html`
- **Test Spec**: `tests/advanced-elements.spec.ts`

## 🚀 Running the Tests

```bash
# Run all advanced element tests
npx playwright test tests/advanced-elements.spec.ts

# Run specific test
npx playwright test tests/advanced-elements.spec.ts -g "should select option from dropdown"

# Run with headed browser (see what's happening)
npx playwright test tests/advanced-elements.spec.ts --headed

# Run specific describe block
npx playwright test tests/advanced-elements.spec.ts -g "Select Boxes"
npx playwright test tests/advanced-elements.spec.ts -g "Dialog Handling"
npx playwright test tests/advanced-elements.spec.ts -g "Window Switching"
```

---

## 1️⃣ Select Boxes / Dropdowns

### ✅ Natural Language Approach

```typescript
// Simple select
await session.do('select "United States" from the country selector');
await session.do('choose "Large" from the size selector');
await session.do('pick "Premium" from subscription plan');
```

**How it gets cached:**
```json
{
  "select|country selector": {
    "selector": "#country-select",
    "successCount": 1,
    "timestamp": 1773183643749
  }
}
```

**First run**: AI finds the dropdown → Caches it
**Subsequent runs**: Instant lookup, $0 cost

---

### ⚡ Hybrid Approach (Recommended for Speed)

```typescript
// Use Playwright directly for precise selection (faster)
await page.selectOption('#country-select', { label: 'Australia' });
await page.selectOption('#size-select', { value: 'xl' });
await page.selectOption('#plan-select', 'enterprise');

// Or use NL to find, Playwright to select
await session.do('click the country dropdown'); // NL finds it
await page.selectOption('#country-select', 'us'); // Playwright selects
```

**When to use each:**
- **Natural Language**: When you don't know the selector, or for readability
- **Playwright Direct**: When you have the selector and want max speed
- **Hybrid**: Find with NL (cached), select with Playwright

---

### 🔗 Cascading Dropdowns

```typescript
// Select parent dropdown first
await session.do('select "Electronics" from category selector');

// Wait for child dropdown to populate
await page.waitForTimeout(500);

// Now select from child dropdown
await session.do('select "Laptop" from product selector');
```

**Pro Tip**: Use Playwright's `waitForSelector` or `waitForTimeout` between cascading selections to ensure the second dropdown is ready.

---

## 2️⃣ Alert / Confirm / Prompt Dialogs

### ⚠️ Simple Alert

```typescript
// Setup listener BEFORE triggering the action
page.once('dialog', async dialog => {
  expect(dialog.message()).toBe('This is a simple alert dialog!');
  await dialog.accept();
});

// Trigger alert with natural language
await session.do('click the show alert button');
```

**Key Points:**
- ✅ Always setup `page.once('dialog')` **BEFORE** the action
- ✅ Button click gets cached (NL → selector)
- ✅ Alert handling is Playwright's job (no AI cost)

---

### ✔️ Confirm Dialog (Accept)

```typescript
page.once('dialog', async dialog => {
  expect(dialog.type()).toBe('confirm');
  await dialog.accept(); // Click "OK"
});

await session.do('click the show confirm button');
```

---

### ❌ Confirm Dialog (Dismiss)

```typescript
page.once('dialog', async dialog => {
  expect(dialog.type()).toBe('confirm');
  await dialog.dismiss(); // Click "Cancel"
});

await session.do('click the show confirm button');
```

---

### 📝 Prompt Dialog (with input)

```typescript
page.once('dialog', async dialog => {
  expect(dialog.type()).toBe('prompt');
  expect(dialog.defaultValue()).toBe('John Doe');
  await dialog.accept('Alice Smith'); // Enter custom text
});

await session.do('click the show prompt button');
```

---

### 🔔 Multiple Sequential Alerts

```typescript
let alertCount = 0;

// Use page.on() instead of page.once() for multiple dialogs
page.on('dialog', async dialog => {
  alertCount++;
  console.log(`Alert ${alertCount}: ${dialog.message()}`);
  await dialog.accept();
});

await session.do('click the show 3 alerts button');
```

**Note**: Use `page.on()` for multiple dialogs, `page.once()` for single dialog.

---

## 3️⃣ Window / Tab Switching

### 🪟 Open New Window and Switch

```typescript
// Listen for new page
const pagePromise = context.waitForEvent('page');

// Trigger new window with NL
await session.do('click the open new window button');

// Wait for new page
const newPage = await pagePromise;
await newPage.waitForLoadState();

// Create new session for new window
const newSession = vibe()
  .withPage(newPage) // ← Point to new window
  .withMode('smart-cache')
  .withAIProvider(AIProvider.GROQ, process.env.GROQ_API_KEY!)
  .build();

// Interact with new window
await newSession.do('type "Hello" into the input field');
await newSession.do('click the accept button');

// Cleanup
await newPage.close();
await newSession.shutdown();
```

**Key Pattern:**
1. Setup `context.waitForEvent('page')` **before** triggering
2. Wait for new page to load
3. Create **new Vibe session** with `withPage(newPage)`
4. Use new session for interactions in that window

---

### 🔗 Open New Tab via Link

```typescript
const pagePromise = context.waitForEvent('page');

// Click link with target="_blank"
await session.do('click the link that says open in new tab');

const newPage = await pagePromise;
await newPage.waitForLoadState();

// Now interact with new tab using new session
const newSession = vibe()
  .withPage(newPage)
  .withMode('smart-cache')
  .withAIProvider(AIProvider.GROQ, process.env.GROQ_API_KEY!)
  .build();

await newSession.do('click the accept button');
```

---

### 🪟🪟 Multiple Windows Simultaneously

```typescript
// Open first window
const page1Promise = context.waitForEvent('page');
await session.do('click the open new window button');
const newPage1 = await page1Promise;
await newPage1.waitForLoadState();

// Open second window
const page2Promise = context.waitForEvent('page');
await session.do('click the open in new tab button');
const newPage2 = await page2Promise;
await newPage2.waitForLoadState();

// Create session for each window
const session1 = vibe().withPage(newPage1)...build();
const session2 = vibe().withPage(newPage2)...build();

// Interact independently
await session1.do('type "Window 1" into input');
await session2.do('type "Window 2" into input');

// Verify
expect(await newPage1.inputValue('#input')).toBe('Window 1');
expect(await newPage2.inputValue('#input')).toBe('Window 2');
```

**Pro Tip**: Each window gets its own Vibe session, but they **share the same cache file**, so selectors learned in one window apply to others!

---

### ⚠️🪟 Alert in New Window

```typescript
const pagePromise = context.waitForEvent('page');
await session.do('click open new window');
const newPage = await pagePromise;
await newPage.waitForLoadState();

// Setup alert listener for NEW window (not original page)
newPage.once('dialog', async dialog => {
  expect(dialog.message()).toBe('Alert from new window!');
  await dialog.accept();
});

const newSession = vibe().withPage(newPage)...build();
await newSession.do('click show alert button');
```

**Important**: Attach dialog listener to `newPage`, not `page`!

---

## 🎯 Best Practices Summary

### Select Boxes
✅ **DO**: Use natural language for first-time finding, Playwright for speed
✅ **DO**: Wait between cascading dropdown selections
❌ **DON'T**: Use NL for every selection if you already have the selector

### Dialogs (Alert/Confirm/Prompt)
✅ **DO**: Setup `page.once('dialog')` **before** triggering action
✅ **DO**: Use `page.on('dialog')` for multiple sequential dialogs
❌ **DON'T**: Try to handle dialogs after they appear (too late)

### Windows/Tabs
✅ **DO**: Use `context.waitForEvent('page')` before triggering
✅ **DO**: Create new Vibe session with `withPage(newPage)`
✅ **DO**: Share cache across windows (automatic)
❌ **DON'T**: Try to use same session for different windows

---

## 📊 Caching Behavior

All these interactions get cached:

```json
{
  "select|country selector": {
    "selector": "#country-select",
    "successCount": 5
  },
  "button|open new window": {
    "selector": "button[onclick='openNewWindow()']",
    "successCount": 3
  },
  "button|show alert": {
    "selector": "button[onclick='showAlert()']",
    "successCount": 2
  },
  "input|input field": {
    "selector": "#new-window-input",
    "successCount": 7
  }
}
```

**First Run**: AI parses NL → Finds elements → Caches selectors
**Subsequent Runs**: Instant cache lookup → $0 AI cost → 95-99% faster

---

## 🧪 Test Coverage

| Test # | Scenario | What It Tests |
|--------|----------|---------------|
| 1 | Single select dropdown | Basic NL selection |
| 2 | Multiple dropdowns | Sequential selections |
| 3 | Hybrid approach | NL + Playwright combo |
| 4 | Cascading dropdowns | Parent-child dependencies |
| 5 | Simple alert | Alert handling |
| 6 | Confirm accept | Confirm dialog - OK |
| 7 | Confirm dismiss | Confirm dialog - Cancel |
| 8 | Prompt with input | Prompt dialog with text |
| 9 | Multiple alerts | Sequential dialog handling |
| 10 | New window | Window switching |
| 11 | New tab via link | Tab opening |
| 12 | Multiple windows | Multi-window management |
| 13 | Alert in new window | Dialog in different context |
| 14 | Disabled-to-enabled | Dynamic state changes |
| 15 | Complex labels | Options with special text |

---

## 📈 Performance Metrics

After running tests once, you'll see:

```
Test Suite: Advanced Elements
├─ Total Actions: 45
├─ Cache Hit Rate: 100%
├─ AI Calls: 0 (all cached)
├─ Estimated Cost: $0.00
└─ Average Speed: 95% faster than first run
```

---

## 🐛 Troubleshooting

### Select not working?
- Ensure dropdown is visible: `await page.waitForSelector('#select')`
- Check if dropdown is enabled: `expect(await page.isDisabled()).toBe(false)`
- Try hybrid approach: Use Playwright's `selectOption()` directly

### Alert not being caught?
- Listener must be setup **BEFORE** action
- Use `page.once()` for single alert, `page.on()` for multiple
- Check you're listening on correct page (original vs new window)

### New window not detected?
- Use `context.waitForEvent('page')` before triggering
- Ensure link has `target="_blank"` or uses `window.open()`
- Wait for page to load: `await newPage.waitForLoadState()`

### Cache not working?
- Verify `withMode('smart-cache')` is set
- Check `autoheal-cache/selectors.json` exists
- Ensure descriptions are consistent (case-sensitive)

---

## 🎓 Next Steps

1. **Run the tests**: See all scenarios in action
2. **Check the cache**: Look at `autoheal-cache/selectors.json` after first run
3. **Run again**: See 95-99% speed improvement with 100% cache hits
4. **Adapt patterns**: Use these patterns in your own tests
5. **Mix approaches**: Combine NL + Playwright for optimal speed & maintainability

---

## 📚 Related Documentation

- Main README: `README.md`
- Quick Start: `QUICK_START.md`
- Reporting Guide: `REPORTING.md`
- Video Guide: `VIDEO_GUIDE.md`

Happy testing! 🚀
