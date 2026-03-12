# Hybrid Approach - Mix Playwright + Natural Language 🎯

**TL;DR**: You can freely mix Playwright code with Vibe's natural language commands. This is the **recommended** approach!

---

## 📖 The Philosophy

From `tests/hybrid-demo.spec.ts`:

```
┌─────────────────────────────────────────────────────┐
│  Use session.do()   → for INTERACTING with elements  │
│  Use Playwright     → for NAVIGATION & ASSERTIONS    │
└─────────────────────────────────────────────────────┘
```

**Core Principle**: Use the best tool for each job.

---

## ✅ Yes, You Can Mix Them!

```typescript
test('hybrid example', async ({ page }) => {
  const session = vibe()
    .withPage(page)
    .withMode('smart-cache')
    .build();

  // ✅ Playwright for navigation
  await page.goto('https://www.saucedemo.com');

  // ✅ Playwright for known elements
  await page.getByRole('textbox', { name: 'username' }).fill('standard_user');
  await page.getByRole('textbox', { name: 'password' }).fill('secret_sauce');

  // ✅ Natural Language for dynamic elements
  await session.do('click the login button');

  // ✅ Playwright for assertions
  expect(page.url()).toContain('inventory.html');

  // ✅ Natural Language for complex selections
  await session.do('click the add to cart button for Sauce Labs Backpack');

  // ✅ Playwright for simple checks
  const badgeCount = await page.locator('.shopping_cart_badge').textContent();
  expect(badgeCount).toBe('1');

  await session.shutdown();
});
```

**Result**: Fast, resilient, and cost-effective tests!

---

## 🎯 When to Use What?

| Task | Best Tool | Why | Cost | Speed |
|------|-----------|-----|------|-------|
| **Navigation** | `page.goto()` | No element finding | $0 | Instant |
| **Known selectors** | `page.locator()`, `page.getByRole()` | Direct access | $0 | Instant |
| **Unknown/dynamic elements** | `session.do()` | AI finds it, caches | 1st: ~$0.01, Then: $0 | 1st: ~1s, Then: ~100ms |
| **Assertions** | `expect()` | Deterministic | $0 | Instant |
| **Waits** | `page.waitForSelector()` | Built-in | $0 | Instant |
| **Select boxes** | `page.selectOption()` or `session.do()` | Both work | $0 / ~$0.01 | Instant / ~100ms |
| **Text extraction** | `page.textContent()` or `session.extract()` | Both work | $0 / ~$0.01 | Instant / ~100ms |
| **Complex verification** | `session.check()` | AI understands context | ~$0.01 | ~500ms |

---

## 💡 Recommended Patterns

### Pattern 1: Playwright for Structure, NL for Content

```typescript
// ✅ Playwright handles page structure
await page.goto('https://app.com');
await page.waitForLoadState();

// ✅ Natural Language handles dynamic content
await session.do('type "john@example.com" into email field');
await session.do('type "password123" into password field');
await session.do('click the submit button');

// ✅ Playwright handles navigation checks
await page.waitForURL('**/dashboard');
expect(page.url()).toContain('dashboard');
```

**Why**: Structure rarely changes, content/elements do.

---

### Pattern 2: NL First Run, Playwright After Caching

```typescript
// Development: Use NL to discover elements
await session.do('type "user" into username field');
// Cached: "input|username field" → "#user-name"

await session.do('click the login button');
// Cached: "button|login button" → "#login-button"

// After caching, you can switch to Playwright if you want
await page.locator('#user-name').fill('user');     // Instant, $0
await page.locator('#login-button').click();       // Instant, $0

// OR keep using NL (also instant after caching)
await session.do('type "user" into username field'); // Cache hit, $0
await session.do('click the login button');          // Cache hit, $0
```

**Why**: Get best of both worlds - resilience + speed.

---

### Pattern 3: Playwright for Known, NL for Ambiguous

```typescript
// ✅ Playwright when selector is clear
await page.selectOption('#country-select', { value: 'us' });

// ✅ Natural Language when multiple similar elements exist
await session.do('click the add to cart button for Sauce Labs Backpack');
// AI understands context: "for Sauce Labs Backpack"
```

**Why**: NL excels at disambiguation using context.

---

### Pattern 4: Semantic Selectors + NL Fallback

```typescript
// Try Playwright's semantic selectors first
try {
  await page.getByRole('button', { name: 'Login' }).click();
} catch {
  // Fallback to NL if element structure changed
  await session.do('click the login button');
}

// OR just use NL directly (it's cached anyway!)
await session.do('click the login button');
```

**Why**: Semantic selectors are resilient, but NL is even more so.

---

## 📊 Performance Comparison

### Scenario: Login Flow (3 actions)

| Approach | First Run | After Cache | Total Cost |
|----------|-----------|-------------|------------|
| **All Natural Language** | ~3000ms | ~500ms | $0.03 → $0 |
| **All Playwright** | ~300ms | ~300ms | $0 |
| **Hybrid (Recommended)** | ~800ms | ~350ms | $0.01 → $0 |

**Hybrid breakdown:**
- `page.goto()`: 200ms, $0
- NL form fill (2 fields): 400ms → 150ms (cached), ~$0.01 → $0
- NL button click: 200ms → 100ms (cached), ~$0.01 → $0
- `expect()`: 0ms, $0

---

## 🚀 Real-World Examples

### Example 1: E-commerce Test

```typescript
test('add product to cart', async ({ page }) => {
  const session = vibe()
    .withPage(page)
    .withMode('smart-cache')
    .withAIProvider(AIProvider.GROQ, process.env.GROQ_API_KEY!)
    .build();

  // Playwright: Navigation
  await page.goto('https://shop.example.com');

  // Natural Language: Search (dynamic element)
  await session.do('type "laptop" into the search box');
  await session.do('click the search button');

  // Playwright: Wait for results
  await page.waitForSelector('.product-list');

  // Natural Language: Select specific product (context-aware)
  await session.do('click on the MacBook Pro 16-inch product');

  // Playwright: Verify page
  await page.waitForURL('**/product/**');

  // Playwright: Select known dropdown
  await page.selectOption('#quantity', '2');

  // Natural Language: Add to cart (button might have different text)
  await session.do('click the add to cart button');

  // Playwright: Verify cart count
  const cartBadge = await page.locator('.cart-badge').textContent();
  expect(cartBadge).toBe('2');

  await session.shutdown();
});
```

---

### Example 2: Form Validation Test

```typescript
test('form validation', async ({ page }) => {
  const session = vibe()
    .withPage(page)
    .withMode('smart-cache')
    .build();

  await page.goto('https://form.example.com');

  // Natural Language: Fill form (elements might change)
  await session.do('type "John Doe" into full name field');
  await session.do('type "john@example.com" into email field');
  await session.do('select "United States" from country dropdown');

  // Playwright: Submit form (known element)
  await page.locator('button[type="submit"]').click();

  // Playwright: Check for validation message
  const successMessage = await page.locator('.success-message').isVisible();
  expect(successMessage).toBe(true);

  // OR use Natural Language for AI-powered verification
  const result = await session.check('verify success message is displayed');
  expect(result.success).toBe(true);

  await session.shutdown();
});
```

---

### Example 3: Multi-Step Workflow

```typescript
test('complete checkout flow', async ({ page }) => {
  const session = vibe()
    .withPage(page)
    .withMode('smart-cache')
    .build();

  // Step 1: Login (Hybrid)
  await page.goto('https://shop.example.com');
  await page.getByRole('link', { name: 'Login' }).click();
  await session.do('type "user@example.com" into email');
  await session.do('type "password123" into password');
  await session.do('click the login button');
  await page.waitForURL('**/dashboard');

  // Step 2: Add products (Natural Language for flexibility)
  await session.do('search for "wireless mouse"');
  await session.do('click the first product');
  await session.do('click add to cart');

  // Step 3: Navigate to cart (Playwright)
  await page.locator('.cart-icon').click();
  await page.waitForURL('**/cart');

  // Step 4: Proceed to checkout (Hybrid)
  const itemCount = await page.locator('.cart-item').count();
  expect(itemCount).toBeGreaterThan(0);

  await session.do('click the proceed to checkout button');

  // Step 5: Fill shipping (Natural Language)
  await session.do('type "123 Main St" into street address');
  await session.do('type "New York" into city');
  await session.do('select "New York" from state dropdown');
  await session.do('type "10001" into zip code');

  // Step 6: Complete order (Playwright for assertions)
  await session.do('click the place order button');
  await page.waitForURL('**/order-confirmation');

  const confirmationText = await page.locator('.confirmation-message').textContent();
  expect(confirmationText).toContain('Order placed successfully');

  await session.shutdown();
});
```

---

## 🎨 Best Practices

### ✅ DO

```typescript
// ✅ Use Playwright for navigation
await page.goto('https://example.com');

// ✅ Use Playwright for known, stable selectors
await page.locator('#submit-button').click();

// ✅ Use Natural Language for dynamic/changing elements
await session.do('click the login button');

// ✅ Use Natural Language when context matters
await session.do('click the delete button for John Doe');

// ✅ Use Playwright for assertions
expect(page.url()).toContain('dashboard');

// ✅ Use Natural Language for AI-powered checks
const result = await session.check('verify welcome message appears');
```

### ❌ DON'T

```typescript
// ❌ Don't use NL for everything (overkill)
await session.do('navigate to https://example.com'); // Just use page.goto()
await session.do('wait for page to load');           // Use page.waitForLoadState()

// ❌ Don't use brittle Playwright selectors
await page.locator('div > div > button:nth-child(3)').click(); // Use NL instead

// ❌ Don't mix without strategy
// Random mix without thinking about performance/cost
```

---

## 💰 Cost Optimization Strategies

### Strategy 1: Start with NL, Optimize Later

```typescript
// Phase 1: Development (use NL everywhere)
await session.do('click login');
await session.do('type text into search');

// Phase 2: Tests stabilize (check cache)
// Look at autoheal-cache/selectors.json:
// "button|login" → "#login-btn"
// "input|search" → "#search-input"

// Phase 3: Optimize hot paths (switch to Playwright)
await page.locator('#login-btn').click();     // Instant
await page.locator('#search-input').fill('text'); // Instant

// Phase 4: Keep NL for dynamic elements
await session.do('click the product card for iPhone 15'); // Still NL
```

**Result**: 0 AI cost, maximum speed, still resilient where needed.

---

### Strategy 2: Cache-First Development

```typescript
// 1. Run once to build cache
npm run test:advanced  // Creates cache

// 2. Subsequent runs use cache (instant + free)
// All NL commands hit cache → $0 cost

// 3. Only new elements trigger AI
await session.do('click the new feature button'); // AI call
await session.do('click the new feature button'); // Cached!
```

**Result**: Pay once, use forever (per element).

---

### Strategy 3: Playwright for CI, NL for Dev

```typescript
// .env.local (development)
USE_NATURAL_LANGUAGE=true

// .env.ci (CI/CD)
USE_NATURAL_LANGUAGE=false

// Test code
if (process.env.USE_NATURAL_LANGUAGE) {
  await session.do('click login');
} else {
  await page.locator('#login-btn').click();
}

// OR just use cache mode (recommended)
// Cache is committed → CI uses cache → $0 cost
```

**Result**: Flexibility in dev, speed in CI.

---

## 📈 Performance Tips

### Tip 1: Batch Static Actions

```typescript
// ❌ Slow: Multiple NL calls for static elements
await session.do('click menu');
await session.do('click settings');
await session.do('click profile');

// ✅ Fast: Use Playwright for static navigation
await page.locator('#menu').click();
await page.locator('#settings').click();
await page.locator('#profile').click();
```

---

### Tip 2: Use NL for Dynamic Content

```typescript
// ❌ Brittle: Playwright with dynamic selectors
await page.locator('.user-card').nth(0).locator('button').click();

// ✅ Resilient: Natural Language with context
await session.do('click the edit button for user John Doe');
```

---

### Tip 3: Cache Warm-Up

```typescript
// Run once to warm up cache (development)
test.beforeAll(async ({ page }) => {
  const session = vibe().withPage(page).withMode('smart-cache').build();

  // Visit key pages and cache common elements
  await page.goto('https://app.com/login');
  await session.do('click the login button');
  await session.do('type into username field');
  await session.do('type into password field');

  await session.shutdown();
});

// All tests now use cached selectors (instant)
```

---

## 🔍 Debugging Hybrid Tests

### Check What's Cached

```bash
# View cache file
cat autoheal-cache/selectors.json

# Example output:
{
  "button|login button": {
    "selector": "#login-btn",
    "successCount": 15
  },
  "input|username field": {
    "selector": "#username",
    "successCount": 15
  }
}
```

### Monitor Cache Performance

```typescript
// Enable verbose logging
const session = vibe()
  .withMode('smart-cache')
  .withReporting({
    verbose: true,
    console: true
  })
  .build();

// Watch console output:
// [CACHE] Hit: button|login button → #login-btn (120ms)
// [DOM-AI] Miss: button|new feature → .new-feature-btn (850ms)
```

---

## 📚 Example: Complete Test Suite

See `tests/hybrid-demo.spec.ts` for working examples:

```typescript
// Test 1: Login with NL, assert with Playwright
test('login', async ({ page }) => {
  await page.goto('https://www.saucedemo.com');
  await session.do('type "standard_user" into username field');
  await session.do('type "secret_sauce" into password field');
  await session.do('click the login button');

  await page.waitForSelector('.inventory_list');
  expect(page.url()).toContain('inventory.html');
});

// Test 2: Extract with NL, validate with Playwright
test('extract product name', async ({ page }) => {
  await page.goto('https://www.saucedemo.com');
  await session.do('type "standard_user" into username field');
  await session.do('type "secret_sauce" into password field');
  await session.do('click the login button');

  const firstProduct = await session.extract('name of the first product');
  expect(firstProduct).toBeTruthy();
  expect(firstProduct.length).toBeGreaterThan(0);
});

// Test 3: Full hybrid workflow
test('add to cart', async ({ page }) => {
  await page.goto('https://www.saucedemo.com');

  await session.do('type "standard_user" into username field');
  await session.do('type "secret_sauce" into password field');
  await session.do('click the login button');

  await page.waitForSelector('.inventory_list');

  await session.do('click the add to cart button for the first product');

  const badgeCheck = await session.check('verify cart badge shows 1');

  await page.waitForURL('**/cart.html');
  expect(page.url()).toContain('cart.html');
});
```

---

## 🎯 Summary

### The Golden Rule

**Use Playwright for what it's good at (structure, assertions, navigation).**
**Use Natural Language for what it's good at (finding dynamic elements, context-aware selection).**

### Quick Decision Tree

```
Is it navigation/waiting/assertion?
  → Yes: Use Playwright
  → No: Continue

Do you know the selector and it's stable?
  → Yes: Use Playwright
  → No: Continue

Does context matter (e.g., "for John Doe")?
  → Yes: Use Natural Language
  → No: Continue

Is the element dynamic/might change?
  → Yes: Use Natural Language
  → No: Use Playwright
```

### Performance Goals

- **First run**: < 5 seconds per test (mix of NL + Playwright)
- **Cached runs**: < 1 second per test (mostly cache hits)
- **Cost**: ~$0.05 first run → $0 cached runs

### Final Thoughts

The hybrid approach gives you:
- ✅ **Speed** of Playwright
- ✅ **Resilience** of Natural Language
- ✅ **Flexibility** to choose
- ✅ **Cost optimization** through caching
- ✅ **Best of both worlds**

**You don't have to choose one or the other - use both!** 🚀

---

## 📖 Related Documentation

- **README.md** - Main project documentation
- **ADVANCED_ELEMENTS_GUIDE.md** - Select boxes, alerts, windows
- **ADVANCED_ELEMENTS_QUICK_REFERENCE.md** - Quick code snippets
- **tests/hybrid-demo.spec.ts** - Working examples

---

**Questions? Check out the examples in `tests/hybrid-demo.spec.ts` or open an issue!**
