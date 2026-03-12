# Hooks & Lifecycle Methods 🔄

Complete guide to using hooks and lifecycle methods with Vibe Framework.

---

## ✅ TL;DR

**Vibe Framework works seamlessly with all Playwright hooks!**

```typescript
// Use standard Playwright hooks
test.beforeAll(async () => { /* setup */ });
test.afterAll(async () => { /* cleanup */ });
test.beforeEach(async ({ page }) => { /* per-test setup */ });
test.afterEach(async () => { /* per-test cleanup */ });

// Plus Vibe-specific lifecycle methods
session.startTest('test name');     // Optional: for tracking
session.endTest('passed');          // Optional: for reporting
await session.shutdown();           // REQUIRED: cleanup resources
```

---

## 🔐 Quick: Login Setup Pattern

**Most Common Use Case**: Login with natural language before running tests

```typescript
test.describe('My Tests', () => {
  let session: any;

  // ✅ LOGIN BEFORE EACH TEST
  test.beforeEach(async ({ page }) => {
    session = vibe()
      .withPage(page)
      .withMode('smart-cache')
      .build();

    await page.goto('https://app.com');

    // Login with natural language
    await session.do('type "user@example.com" into username field');
    await session.do('type "password123" into password field');
    await session.do('click the login button');

    await page.waitForURL('**/dashboard');
  });

  // ✅ CLEANUP
  test.afterEach(async () => {
    if (session) {
      await session.shutdown();
    }
  });

  // ✅ Test starts already logged in!
  test('my test', async ({ page }) => {
    // Already logged in - start testing
    await session.do('click my feature');
  });
});
```

**See full login examples**: [`tests/login-setup-example.spec.ts`](../tests/login-setup-example.spec.ts)

---

## 📚 Table of Contents

1. [Playwright Hooks](#playwright-hooks)
2. [Vibe Lifecycle Methods](#vibe-lifecycle-methods)
3. [Common Patterns](#common-patterns)
4. [Best Practices](#best-practices)
5. [Advanced Scenarios](#advanced-scenarios)
6. [Training Mode Hooks](#training-mode-hooks)

---

## 🎭 Playwright Hooks

Vibe Framework fully supports all Playwright test hooks.

### Available Hooks

| Hook | When It Runs | Use Case |
|------|--------------|----------|
| `test.beforeAll()` | Once before all tests in a describe block | Global setup, initialize shared resources |
| `test.afterAll()` | Once after all tests in a describe block | Global cleanup, shutdown shared sessions |
| `test.beforeEach()` | Before each individual test | Create fresh session, navigate to page |
| `test.afterEach()` | After each individual test | Cleanup session, take screenshots |

---

## 🔄 Vibe Lifecycle Methods

### Core Methods

| Method | Required? | Purpose |
|--------|-----------|---------|
| `session.shutdown()` | ✅ **REQUIRED** | Cleanup resources, generate reports |
| `session.startTest(name)` | ❌ Optional | Track test start, useful for reporting |
| `session.endTest(status)` | ❌ Optional | Track test end, set pass/fail status |

### Training Mode Methods

| Method | Purpose |
|--------|---------|
| `session.startTraining(name)` | Start recording selectors for training mode |
| `session.stopTraining()` | Stop recording and save training data |

---

## 🎯 Common Patterns

### Pattern 1: Login Setup in beforeEach (Most Common) ⭐

**Use Case**: Login with natural language before each test, then run test scenarios already logged in.

```typescript
test.describe('Dashboard Tests', () => {
  let session: any;

  test.beforeEach(async ({ page }) => {
    // Create session
    session = vibe()
      .withPage(page)
      .withMode('smart-cache')
      .withAIProvider(AIProvider.GROQ, process.env.GROQ_API_KEY!)
      .build();

    // Navigate
    await page.goto('https://www.saucedemo.com');

    // ✅ LOGIN using natural language - runs before EVERY test
    await session.do('type "standard_user" into username field');
    await session.do('type "secret_sauce" into password field');
    await session.do('click the login button');

    // Wait for login to complete
    await page.waitForURL('**/inventory.html');
    console.log('✅ Logged in - ready for test');
  });

  test.afterEach(async () => {
    if (session) {
      await session.shutdown();
      session = null;
    }
  });

  // ✅ Test starts AFTER login
  test('should view products', async ({ page }) => {
    // Already logged in! Just test the feature
    const productCount = await page.locator('.inventory_item').count();
    expect(productCount).toBeGreaterThan(0);
    console.log('Products visible');
  });

  // ✅ Test starts AFTER login
  test('should add item to cart', async ({ page }) => {
    // Already logged in! Just test the feature
    await session.do('click add to cart button for the first product');

    const badge = await page.locator('.shopping_cart_badge').textContent();
    expect(badge).toBe('1');
  });

  // ✅ Test starts AFTER login
  test('should filter products', async ({ page }) => {
    // Already logged in! Just test the feature
    await session.do('select "Price (low to high)" from sort dropdown');

    // Verify first item is cheapest
    const firstPrice = await page.locator('.inventory_item_price').first().textContent();
    expect(firstPrice).toBeTruthy();
  });
});
```

**Result**:
- Login runs 3 times (once per test)
- First run: ~2 seconds (AI finds elements)
- Subsequent runs: ~300ms (cached selectors)
- Each test starts already logged in!

**Why this pattern?**
- ✅ Each test is isolated (fresh login)
- ✅ Parallel execution safe
- ✅ Tests don't affect each other
- ✅ Login is cached after first test

---

### Pattern 2: Session Per Test (Simple Tests)

**Best for**: Most use cases, parallel execution

```typescript
test.describe('Login Tests', () => {
  let session: any;

  test.afterEach(async () => {
    // ✅ ALWAYS cleanup after each test
    if (session) {
      await session.shutdown();
      session = null;
    }
  });

  test('should login successfully', async ({ page }) => {
    // Create fresh session for this test
    session = vibe()
      .withPage(page)
      .withMode('smart-cache')
      .withAIProvider(AIProvider.GROQ, process.env.GROQ_API_KEY!)
      .build();

    await page.goto('https://www.saucedemo.com');
    await session.do('type "standard_user" into username field');
    await session.do('click the login button');

    expect(page.url()).toContain('inventory.html');
  });
});
```

**Why?**
- ✅ Each test is isolated
- ✅ Parallel execution safe
- ✅ Reports are per-test
- ✅ No shared state issues

---

### Pattern 2: Login Once for All Tests (beforeAll) ⚠️

**Use Case**: Login ONCE, then run multiple tests with the same session.

⚠️ **Warning**: Not parallel-safe, but faster for sequential tests.

```typescript
test.describe.configure({ mode: 'serial' }); // ← Run tests sequentially

test.describe('Shopping Tests - Single Session', () => {
  let session: any;
  let page: any;

  test.beforeAll(async ({ browser }) => {
    // Create browser context
    const context = await browser.newContext();
    page = await context.newPage();

    // Create session
    session = vibe()
      .withPage(page)
      .withMode('smart-cache')
      .withAIProvider(AIProvider.GROQ, process.env.GROQ_API_KEY!)
      .build();

    // ✅ LOGIN ONCE using natural language
    await page.goto('https://www.saucedemo.com');
    await session.do('type "standard_user" into username field');
    await session.do('type "secret_sauce" into password field');
    await session.do('click the login button');
    await page.waitForURL('**/inventory.html');

    console.log('✅ Logged in once - will reuse for all tests');
  });

  test.afterAll(async () => {
    if (session) {
      await session.shutdown();
    }
    if (page) {
      await page.close();
    }
  });

  // All tests share the same logged-in session
  test('view products', async () => {
    const count = await page.locator('.inventory_item').count();
    expect(count).toBeGreaterThan(0);
  });

  test('add to cart', async () => {
    await session.do('click add to cart for backpack');
    const badge = await page.locator('.shopping_cart_badge').textContent();
    expect(badge).toBe('1');
  });

  test('view cart', async () => {
    await session.do('click shopping cart icon');
    await page.waitForURL('**/cart.html');
    expect(page.url()).toContain('cart.html');
  });
});
```

**Result**:
- Login runs 1 time (shared across tests)
- Faster execution (~1-2 seconds saved)
- Tests run sequentially (not in parallel)

**Why use this?**
- ✅ Faster (login once)
- ✅ Less AI cost (single login)
- ✅ Good for sequential workflows
- ❌ Not parallel-safe
- ❌ Tests can affect each other

**When to use**:
- Feature flows (add to cart → checkout → payment)
- Demo/exploratory testing
- Local development only

---

### Pattern 3: Hybrid - Login in Helper Function

**Use Case**: Reusable login function for flexibility.

```typescript
// Helper function
async function loginWithNL(page: any) {
  const session = vibe()
    .withPage(page)
    .withMode('smart-cache')
    .withAIProvider(AIProvider.GROQ, process.env.GROQ_API_KEY!)
    .build();

  await page.goto('https://www.saucedemo.com');
  await session.do('type "standard_user" into username field');
  await session.do('type "secret_sauce" into password field');
  await session.do('click the login button');
  await page.waitForURL('**/inventory.html');

  // Don't shutdown here - return session for test to use
  return session;
}

test.describe('Product Tests', () => {
  let session: any;

  test.afterEach(async () => {
    if (session) {
      await session.shutdown();
    }
  });

  test('test 1', async ({ page }) => {
    // ✅ Login as needed
    session = await loginWithNL(page);

    // Run test
    await session.do('click first product');
  });

  test('test 2', async ({ page }) => {
    // ✅ Login as needed
    session = await loginWithNL(page);

    // Run test
    await session.do('add to cart');
  });
});
```

**Why?**
- ✅ Reusable across test files
- ✅ Flexible (call when needed)
- ✅ Parallel-safe
- ✅ Can login as different users

---

### Pattern 4: Shared Session in beforeEach

**Best for**: Setup-heavy tests, consistent initialization

```typescript
test.describe('Shopping Cart', () => {
  let session: any;

  test.beforeEach(async ({ page }) => {
    // Create session before each test
    session = vibe()
      .withPage(page)
      .withMode('smart-cache')
      .withAIProvider(AIProvider.GROQ, process.env.GROQ_API_KEY!)
      .withReporting({
        html: true,
        json: true,
        includeScreenshots: true
      })
      .build();

    // Common setup for all tests
    await page.goto('https://www.saucedemo.com');
    await session.do('type "standard_user" into username');
    await session.do('type "secret_sauce" into password');
    await session.do('click the login button');
    await page.waitForURL('**/inventory.html');
  });

  test.afterEach(async () => {
    if (session) {
      await session.shutdown();
      session = null;
    }
  });

  test('should add item to cart', async ({ page }) => {
    // Test starts already logged in
    await session.do('click add to cart for backpack');
    const badge = await page.locator('.cart-badge').textContent();
    expect(badge).toBe('1');
  });

  test('should remove item from cart', async ({ page }) => {
    // Test starts already logged in
    await session.do('click add to cart for backpack');
    await session.do('click remove from cart');
    const badge = await page.locator('.cart-badge').count();
    expect(badge).toBe(0);
  });
});
```

**Why?**
- ✅ DRY - setup code in one place
- ✅ Consistent starting state
- ✅ Still isolated per test

---

### Pattern 3: Global Session (Use Carefully)

**Best for**: Simple test suites, quick prototyping

⚠️ **Not recommended for parallel execution**

```typescript
let globalSession: any;

test.beforeAll(async () => {
  console.log('🚀 Initializing global Vibe session');
});

test.afterAll(async () => {
  // Cleanup global session
  if (globalSession) {
    await globalSession.shutdown();
  }
});

test.describe('Quick Tests', () => {
  test.beforeEach(async ({ page }) => {
    globalSession = vibe()
      .withPage(page)
      .withMode('smart-cache')
      .build();
  });

  test('test 1', async ({ page }) => {
    await globalSession.do('click button');
  });

  test('test 2', async ({ page }) => {
    await globalSession.do('click link');
  });
});
```

**Why?**
- ✅ Simple setup
- ❌ Not parallel-safe
- ❌ Tests share state

---

### Pattern 4: With Test Tracking

**Best for**: Detailed reporting, debugging

```typescript
test.describe('Feature Tests', () => {
  let session: any;

  test.afterEach(async () => {
    if (session) {
      await session.shutdown();
    }
  });

  test('complete user flow', async ({ page }) => {
    session = vibe()
      .withPage(page)
      .withMode('smart-cache')
      .withReporting({
        html: true,
        verbose: true
      })
      .build();

    // ✅ Start tracking this test
    session.startTest('Complete User Flow');

    try {
      await page.goto('https://app.com');
      await session.do('click login');
      await session.do('type "user@example.com" into email');
      await session.do('click submit');

      expect(page.url()).toContain('dashboard');

      // ✅ Mark test as passed
      session.endTest('passed');
    } catch (error) {
      // ✅ Mark test as failed
      session.endTest('failed');
      throw error;
    }
  });
});
```

**Why?**
- ✅ Detailed test tracking
- ✅ Better reporting
- ✅ Useful for debugging

---

## 🏆 Best Practices

### ✅ DO

```typescript
// ✅ Always call session.shutdown()
test.afterEach(async () => {
  if (session) {
    await session.shutdown();
  }
});

// ✅ Create session per test for isolation
test('my test', async ({ page }) => {
  const session = vibe()...build();
  // ... test code ...
  await session.shutdown();
});

// ✅ Use beforeEach for common setup
test.beforeEach(async ({ page }) => {
  session = vibe()...build();
  await page.goto('https://app.com');
  await session.do('login');
});

// ✅ Check if session exists before cleanup
if (session) {
  await session.shutdown();
}

// ✅ Set session to null after cleanup
await session.shutdown();
session = null;
```

---

### ❌ DON'T

```typescript
// ❌ Don't forget to call shutdown()
test('bad test', async ({ page }) => {
  const session = vibe()...build();
  await session.do('click button');
  // Missing: await session.shutdown();
});
// Result: Memory leaks, reports not generated

// ❌ Don't share sessions across parallel tests
let sharedSession;
test.beforeAll(async () => {
  sharedSession = vibe()...build(); // Bad for parallel
});

// ❌ Don't call shutdown() multiple times
await session.shutdown();
await session.shutdown(); // Error!

// ❌ Don't create session in beforeAll for multiple tests
test.beforeAll(async ({ page }) => {
  session = vibe()...build(); // Page context issues
});
```

---

## 🚀 Advanced Scenarios

### Scenario 1: Conditional Cleanup

```typescript
test.afterEach(async ({ page }, testInfo) => {
  if (session) {
    // Take screenshot on failure
    if (testInfo.status !== 'passed') {
      await page.screenshot({
        path: `failures/${testInfo.title}.png`
      });
    }

    await session.shutdown();
    session = null;
  }
});
```

---

### Scenario 2: Multiple Sessions in One Test

```typescript
test('multi-window test', async ({ page, context }) => {
  const session1 = vibe()
    .withPage(page)
    .withMode('smart-cache')
    .build();

  // Open new window
  const pagePromise = context.waitForEvent('page');
  await session1.do('click open new window');
  const newPage = await pagePromise;

  const session2 = vibe()
    .withPage(newPage)
    .withMode('smart-cache')
    .build();

  // Use both sessions
  await session1.do('click button in window 1');
  await session2.do('click button in window 2');

  // Cleanup both
  await session1.shutdown();
  await session2.shutdown();
});
```

---

### Scenario 3: Setup with Error Handling

```typescript
test.beforeEach(async ({ page }) => {
  try {
    session = vibe()
      .withPage(page)
      .withMode('smart-cache')
      .withAIProvider(AIProvider.GROQ, process.env.GROQ_API_KEY!)
      .build();

    await page.goto('https://app.com');
    await session.do('accept cookies');
  } catch (error) {
    console.error('Setup failed:', error);
    if (session) {
      await session.shutdown();
    }
    throw error;
  }
});
```

---

### Scenario 4: Fixture-Based Session

```typescript
import { test as base } from '@playwright/test';

// Extend Playwright test with Vibe session fixture
const test = base.extend<{ vibeSession: any }>({
  vibeSession: async ({ page }, use) => {
    const session = vibe()
      .withPage(page)
      .withMode('smart-cache')
      .withAIProvider(AIProvider.GROQ, process.env.GROQ_API_KEY!)
      .build();

    // Make session available to test
    await use(session);

    // Auto-cleanup after test
    await session.shutdown();
  },
});

// Use the fixture
test('my test', async ({ page, vibeSession }) => {
  await page.goto('https://app.com');
  await vibeSession.do('click login');
});
```

**Why?**
- ✅ Auto-cleanup built-in
- ✅ Reusable across tests
- ✅ Clean test code

---

## 🎓 Training Mode Hooks

### Setup Training Mode

```typescript
test.describe('Training Mode', () => {
  let session: any;

  test('record selectors for CI', async ({ page }) => {
    session = vibe()
      .withPage(page)
      .withMode('smart-cache')
      .build();

    // ✅ Start training mode
    await session.startTraining('login-flow');

    // Record actions
    await page.goto('https://app.com');
    await session.do('type "user@example.com" into email');
    await session.do('type "password123" into password');
    await session.do('click the login button');

    // ✅ Stop and save training data
    await session.stopTraining();

    await session.shutdown();
  });
});
```

**Output**: Creates `vibe-training/login-flow.json` with recorded selectors

---

### Replay Training Data (CI)

```typescript
test('replay in CI', async ({ page }) => {
  const session = vibe()
    .withPage(page)
    .loadTrainingData('login-flow') // Load saved selectors
    .build();

  // Same commands, but instant (no AI calls)
  await page.goto('https://app.com');
  await session.do('type "user@example.com" into email');
  await session.do('type "password123" into password');
  await session.do('click the login button');

  // ✅ Zero AI cost, instant execution
  await session.shutdown();
});
```

---

## 📊 Lifecycle Flow Diagram

```
Test Start
    ↓
test.beforeAll()      ← Run once for describe block
    ↓
┌───────────────────────────────┐
│  For Each Test:               │
│    ↓                          │
│  test.beforeEach()            │
│    ↓                          │
│  session = vibe().build()     │
│    ↓                          │
│  [optional] startTest()       │
│    ↓                          │
│  Test execution               │
│    ↓                          │
│  [optional] endTest()         │
│    ↓                          │
│  session.shutdown() ✅        │
│    ↓                          │
│  test.afterEach()             │
└───────────────────────────────┘
    ↓
test.afterAll()       ← Run once for describe block
    ↓
Test End
```

---

## 🔍 Debugging Hook Issues

### Check if shutdown() is called

```typescript
test.afterEach(async () => {
  console.log('Cleaning up session...');
  if (session) {
    await session.shutdown();
    console.log('✅ Session cleaned up');
  } else {
    console.log('⚠️  No session to clean up');
  }
});
```

---

### Verify hook execution order

```typescript
test.beforeAll(async () => {
  console.log('1. beforeAll');
});

test.beforeEach(async ({ page }) => {
  console.log('2. beforeEach');
  session = vibe()...build();
});

test('test', async ({ page }) => {
  console.log('3. test execution');
});

test.afterEach(async () => {
  console.log('4. afterEach');
  await session.shutdown();
});

test.afterAll(async () => {
  console.log('5. afterAll');
});

// Output:
// 1. beforeAll
// 2. beforeEach
// 3. test execution
// 4. afterEach
// 5. afterAll
```

---

## ⚡ Performance Tips

### Tip 1: Reuse Page Context

```typescript
test.beforeEach(async ({ page }) => {
  session = vibe().withPage(page).build();

  // Navigate once in beforeEach
  await page.goto('https://app.com');

  // Common login for all tests
  await session.do('login as standard user');
});

test('test 1', async ({ page }) => {
  // Already logged in, start testing immediately
  await session.do('navigate to dashboard');
});
```

---

### Tip 2: Warm Cache in beforeAll

```typescript
test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  const session = vibe()
    .withPage(page)
    .withMode('smart-cache')
    .build();

  // Warm up cache with common elements
  await page.goto('https://app.com');
  await session.do('click login button');
  await session.do('type into username field');
  await session.do('type into password field');

  await session.shutdown();
  await context.close();
});

// All tests now have cached selectors
```

---

## 📚 Real Examples from Tests

### Example 1: afterEach Cleanup
From `tests/ambiguous-elements.spec.ts:20-25`:

```typescript
let vibeSession: any;

test.afterEach(async () => {
  if (vibeSession) {
    await vibeSession.shutdown();
    vibeSession = null;
  }
});
```

---

### Example 2: beforeAll + afterAll
From `tests/saucedemo-original.spec.ts:8-16`:

```typescript
let vibeSession: any;

test.beforeAll(async () => {
  console.log('\n🚀 Initializing Vibe for Playwright tests\n');
});

test.afterAll(async () => {
  if (vibeSession) {
    await vibeSession.shutdown();
  }
});
```

---

### Example 3: beforeEach Setup
From `tests/saucedemo-original.spec.ts:19-37`:

```typescript
test.beforeEach(async ({ page }) => {
  vibeSession = vibe()
    .withPage(page)
    .withMode('smart-cache')
    .withAIProvider('GROQ', process.env.GROQ_API_KEY)
    .withReporting({
      html: true,
      json: true,
      includeScreenshots: true
    })
    .build();

  vibeSession.startTest('User Login Flow');
  await page.goto('https://www.saucedemo.com');
});
```

---

## ✅ Summary Checklist

Before writing tests, make sure:

- [ ] ✅ Use `test.beforeEach()` or `test.afterEach()` for session management
- [ ] ✅ Always call `session.shutdown()` in cleanup hooks
- [ ] ✅ Set session to `null` after shutdown
- [ ] ✅ Check `if (session)` before cleanup
- [ ] ✅ Create fresh session per test for isolation
- [ ] ✅ Use `session.startTest()` / `endTest()` for tracking (optional)
- [ ] ✅ Handle errors in setup/teardown hooks
- [ ] ✅ Don't share sessions across parallel tests

---

## 🎯 Quick Reference

| Hook | Frequency | Use For | Session Creation |
|------|-----------|---------|------------------|
| `beforeAll` | Once per suite | Global setup | ❌ Avoid |
| `afterAll` | Once per suite | Global cleanup | ❌ N/A |
| `beforeEach` | Per test | Test setup | ✅ Recommended |
| `afterEach` | Per test | Test cleanup | ✅ Call shutdown() |

| Vibe Method | Required | Purpose |
|-------------|----------|---------|
| `.build()` | ✅ Yes | Create session |
| `.shutdown()` | ✅ Yes | Cleanup resources |
| `.startTest()` | ❌ Optional | Track test start |
| `.endTest()` | ❌ Optional | Track test end |

---

## 📖 Related Documentation

- **README.md** - Main documentation
- **HYBRID_APPROACH.md** - Mix Playwright + Natural Language
- **ADVANCED_ELEMENTS_GUIDE.md** - Advanced element handling
- **tests/saucedemo-original.spec.ts** - Working hook examples

---

**Questions? Check the examples in `tests/` directory or open an issue!**
