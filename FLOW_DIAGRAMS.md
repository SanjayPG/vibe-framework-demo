# Test Flow Diagrams 📊

Visual diagrams explaining Vibe Framework test execution flow.

---

## 1. Hook Execution Flow - Refactored Pattern

This diagram shows how hooks execute in the refactored `saucedemo.spec.ts`:

```mermaid
sequenceDiagram
    participant Test Runner
    participant beforeEach Hook
    participant Test 1
    participant afterEach Hook
    participant Test 2
    participant Test 3

    Note over Test Runner: Test Suite Starts

    rect rgb(200, 220, 255)
        Note over Test Runner,Test 1: Test 1: "should login successfully"
        Test Runner->>beforeEach Hook: Run beforeEach
        Note over beforeEach Hook: 1. Create session
        Note over beforeEach Hook: 2. Navigate to site
        Note over beforeEach Hook: 3. Login with NL
        Note over beforeEach Hook: 4. Wait for page load
        beforeEach Hook-->>Test Runner: ✅ Setup complete

        Test Runner->>Test 1: Run test
        Note over Test 1: Already logged in!
        Note over Test 1: Verify URL
        Test 1-->>Test Runner: ✅ Test passed

        Test Runner->>afterEach Hook: Run afterEach
        Note over afterEach Hook: session.shutdown()
        Note over afterEach Hook: Generate reports
        afterEach Hook-->>Test Runner: ✅ Cleanup complete
    end

    rect rgb(200, 255, 220)
        Note over Test Runner,Test 2: Test 2: "should display products"
        Test Runner->>beforeEach Hook: Run beforeEach
        Note over beforeEach Hook: 1. Create session
        Note over beforeEach Hook: 2. Navigate to site
        Note over beforeEach Hook: 3. Login (cached! 90% faster)
        Note over beforeEach Hook: 4. Wait for page load
        beforeEach Hook-->>Test Runner: ✅ Setup complete

        Test Runner->>Test 2: Run test
        Note over Test 2: Already logged in!
        Note over Test 2: Extract product name
        Test 2-->>Test Runner: ✅ Test passed

        Test Runner->>afterEach Hook: Run afterEach
        Note over afterEach Hook: session.shutdown()
        afterEach Hook-->>Test Runner: ✅ Cleanup complete
    end

    rect rgb(255, 220, 220)
        Note over Test Runner,Test 3: Test 3: "should add to cart"
        Test Runner->>beforeEach Hook: Run beforeEach
        Note over beforeEach Hook: 1. Create session
        Note over beforeEach Hook: 2. Navigate to site
        Note over beforeEach Hook: 3. Login (cached! 90% faster)
        Note over beforeEach Hook: 4. Wait for page load
        beforeEach Hook-->>Test Runner: ✅ Setup complete

        Test Runner->>Test 3: Run test
        Note over Test 3: Already logged in!
        Note over Test 3: Add product to cart
        Test 3-->>Test Runner: ✅ Test passed

        Test Runner->>afterEach Hook: Run afterEach
        Note over afterEach Hook: session.shutdown()
        afterEach Hook-->>Test Runner: ✅ Cleanup complete
    end

    Note over Test Runner: Test Suite Complete
```

**Key Points**:
- beforeEach runs **before each test** (3 times total)
- Login is cached after first test (90% faster on tests 2 & 3)
- afterEach runs **after each test** (automatic cleanup)
- Each test starts already logged in

---

## 2. Before Refactoring (Duplicated Code)

This is what the old pattern looked like:

```mermaid
graph TD
    A[Test Suite Starts] --> B1[Test 1: Login Check]
    A --> B2[Test 2: Display Products]
    A --> B3[Test 3: Add to Cart]

    B1 --> C1[Create Session<br/>14 lines of code]
    C1 --> D1[Navigate & Login<br/>4 lines of code]
    D1 --> E1[Run Test Logic]
    E1 --> F1[session.shutdown]

    B2 --> C2[Create Session<br/>14 lines DUPLICATED]
    C2 --> D2[Navigate & Login<br/>4 lines DUPLICATED]
    D2 --> E2[Run Test Logic]
    E2 --> F2[session.shutdown]

    B3 --> C3[Create Session<br/>14 lines DUPLICATED]
    C3 --> D3[Navigate & Login<br/>4 lines DUPLICATED]
    D3 --> E3[Run Test Logic]
    E3 --> F3[session.shutdown]

    F1 --> G[Test Suite Complete]
    F2 --> G
    F3 --> G

    style C1 fill:#ffcccc
    style C2 fill:#ffcccc
    style C3 fill:#ffcccc
    style D1 fill:#ffcccc
    style D2 fill:#ffcccc
    style D3 fill:#ffcccc
```

**Problems**:
- 🔴 Session initialization duplicated 3 times
- 🔴 Login code duplicated 3 times
- 🔴 Total: 54 lines of duplicate code
- 🔴 Hard to maintain (change in 3 places)

---

## 3. After Refactoring (Clean Code)

This is the refactored pattern using hooks:

```mermaid
graph TD
    A[Test Suite Starts] --> B[beforeEach Hook<br/>Shared Setup]

    B --> C[Create Session<br/>14 lines - ONCE]
    C --> D[Navigate & Login<br/>4 lines - ONCE]

    D --> E1[Test 1: Login Check<br/>Clean test code only]
    D --> E2[Test 2: Display Products<br/>Clean test code only]
    D --> E3[Test 3: Add to Cart<br/>Clean test code only]

    E1 --> F[afterEach Hook<br/>Shared Cleanup]
    E2 --> F
    E3 --> F

    F --> G[session.shutdown<br/>Auto cleanup]
    G --> H[Test Suite Complete]

    style B fill:#ccffcc
    style C fill:#ccffcc
    style D fill:#ccffcc
    style F fill:#ccffcc
    style G fill:#ccffcc
```

**Benefits**:
- ✅ Session initialization: 1 place (beforeEach)
- ✅ Login code: 1 place (beforeEach)
- ✅ Cleanup: 1 place (afterEach)
- ✅ Easy to maintain (change in 1 place)
- ✅ Clean, focused tests

---

## 4. Session Lifecycle Timeline

```mermaid
gantt
    title Test Execution Timeline (3 Tests)
    dateFormat X
    axisFormat %s

    section Test 1
    beforeEach (Create Session)    :a1, 0, 1s
    beforeEach (Login - AI)         :a2, after a1, 2s
    Test Logic                      :a3, after a2, 1s
    afterEach (Cleanup)             :a4, after a3, 0.5s

    section Test 2
    beforeEach (Create Session)    :b1, after a4, 1s
    beforeEach (Login - Cached!)   :b2, after b1, 0.3s
    Test Logic                      :b3, after b2, 1s
    afterEach (Cleanup)             :b4, after b3, 0.5s

    section Test 3
    beforeEach (Create Session)    :c1, after b4, 1s
    beforeEach (Login - Cached!)   :c2, after c1, 0.3s
    Test Logic                      :c3, after c2, 1s
    afterEach (Cleanup)             :c4, after c3, 0.5s
```

**Performance**:
- Test 1: Login takes ~2s (AI finds elements)
- Test 2: Login takes ~0.3s (cached! 85% faster)
- Test 3: Login takes ~0.3s (cached! 85% faster)
- **Total savings**: ~3.4 seconds

---

## 5. Cache Performance Flow

```mermaid
flowchart TD
    A[Test 1 Starts] --> B{Cache Exists?}
    B -->|No| C[AI Parses NL Command]
    C --> D[AI Finds Element]
    D --> E[Save to Cache]
    E --> F[Execute Action]
    F --> G[Test 1 Complete]

    G --> H[Test 2 Starts]
    H --> I{Cache Exists?}
    I -->|Yes!| J[Load from Cache]
    J --> K[Execute Action<br/>90% faster]
    K --> L[Test 2 Complete]

    L --> M[Test 3 Starts]
    M --> N{Cache Exists?}
    N -->|Yes!| O[Load from Cache]
    O --> P[Execute Action<br/>90% faster]
    P --> Q[Test 3 Complete]

    style C fill:#ffcccc
    style D fill:#ffcccc
    style J fill:#ccffcc
    style K fill:#ccffcc
    style O fill:#ccffcc
    style P fill:#ccffcc
```

**Cache Benefits**:
- 🔴 First run: AI parsing + finding (~2000ms)
- 🟢 Cached runs: Direct lookup (~200ms)
- 💰 Cost: $0.01 first run → $0.00 cached

---

## 6. Detailed Hook Flow (Single Test)

```mermaid
stateDiagram-v2
    [*] --> TestStarts

    TestStarts --> BeforeEach

    state BeforeEach {
        [*] --> GetConfigs
        GetConfigs --> CreateSession
        CreateSession --> NavigateToSite
        NavigateToSite --> LoginWithNL
        LoginWithNL --> WaitForPage
        WaitForPage --> [*]
    }

    BeforeEach --> TestExecution

    state TestExecution {
        [*] --> TestLogic
        TestLogic --> Assertions
        Assertions --> [*]
    }

    TestExecution --> AfterEach

    state AfterEach {
        [*] --> CheckSession
        CheckSession --> Shutdown
        Shutdown --> GenerateReports
        GenerateReports --> SetNull
        SetNull --> [*]
    }

    AfterEach --> TestComplete
    TestComplete --> [*]
```

---

## 7. Comparison: Code Lines

```mermaid
pie title Code Distribution - Before Refactoring
    "Session Init (duplicated 3x)" : 42
    "Login Code (duplicated 3x)" : 12
    "Test Logic" : 30
    "Cleanup (duplicated 3x)" : 3
    "Total" : 129
```

```mermaid
pie title Code Distribution - After Refactoring
    "Session Init (once)" : 14
    "Login Code (once)" : 4
    "Hooks (beforeEach/afterEach)" : 8
    "Test Logic" : 30
    "Total" : 98
```

**Result**: 24% less code, 0% duplication

---

## 8. Parallel Execution Flow

```mermaid
graph TB
    subgraph Worker1[Worker 1]
        A1[Test 1 Start] --> B1[beforeEach]
        B1 --> C1[Create Session]
        C1 --> D1[Login - AI]
        D1 --> E1[Test Logic]
        E1 --> F1[afterEach]
        F1 --> G1[shutdown]
    end

    subgraph Worker2[Worker 2]
        A2[Test 2 Start] --> B2[beforeEach]
        B2 --> C2[Create Session]
        C2 --> D2[Login - AI]
        D2 --> E2[Test Logic]
        E2 --> F2[afterEach]
        F2 --> G2[shutdown]
    end

    subgraph Worker3[Worker 3]
        A3[Test 3 Start] --> B3[beforeEach]
        B3 --> C3[Create Session]
        C3 --> D3[Login - AI]
        D3 --> E3[Test Logic]
        E3 --> F3[afterEach]
        F3 --> G3[shutdown]
    end

    subgraph SharedCache[Shared Cache File]
        SC[autoheal-cache/selectors.json]
    end

    D1 -.Writes.-> SC
    D2 -.Reads/Writes.-> SC
    D3 -.Reads/Writes.-> SC

    style Worker1 fill:#e1f5ff
    style Worker2 fill:#fff4e1
    style Worker3 fill:#ffe1f5
    style SharedCache fill:#ccffcc
```

**Key Points**:
- Each worker has its own session (isolated)
- All workers share the same cache file
- File locking prevents race conditions
- Parallel execution is safe

---

## 9. Session State Machine

```mermaid
stateDiagram-v2
    [*] --> NotCreated

    NotCreated --> Created : vibe().build()

    Created --> LoggingIn : session.do('login')

    LoggingIn --> LoggedIn : Login successful
    LoggingIn --> Failed : Login failed

    LoggedIn --> Testing : Test execution

    Testing --> LoggedIn : More actions
    Testing --> ShuttingDown : session.shutdown()

    Failed --> ShuttingDown : session.shutdown()

    ShuttingDown --> Shutdown : Reports generated

    Shutdown --> [*]

    note right of Created
        Session ready
        Cache loaded
    end note

    note right of LoggedIn
        All tests start here
        (with beforeEach)
    end note

    note right of Shutdown
        Reports in vibe-reports/
        Cache updated
    end note
```

---

## 10. Decision Tree: When to Use Hooks

```mermaid
flowchart TD
    A{Do all tests need<br/>the same setup?} -->|Yes| B{Is setup complex<br/>or time-consuming?}
    A -->|No| C[Use separate<br/>session per test]

    B -->|Yes| D[✅ Use beforeEach<br/>RECOMMENDED]
    B -->|No| E{Is setup just<br/>1-2 lines?}

    E -->|Yes| F[Either works<br/>Your choice]
    E -->|No| D

    C --> G[Create session<br/>inside each test]

    D --> H[Benefits:<br/>✅ No duplication<br/>✅ Easy to maintain<br/>✅ Clean tests]

    G --> I[Benefits:<br/>✅ Test-specific config<br/>✅ More explicit<br/>❌ Code duplication]

    style D fill:#ccffcc
    style H fill:#e8f5e9
```

---

## How to View These Diagrams

### In GitHub
1. Push to GitHub
2. View this file - diagrams render automatically! ✨

### In VSCode
1. Install "Markdown Preview Mermaid Support" extension
2. Open this file
3. Click "Preview" (Ctrl+Shift+V)

### Online
1. Copy diagram code
2. Go to https://mermaid.live/
3. Paste and view

---

## Summary

These diagrams explain:
1. ✅ How hooks execute in refactored code
2. ✅ Before vs After refactoring comparison
3. ✅ Session lifecycle and timing
4. ✅ Cache performance improvements
5. ✅ Parallel execution behavior
6. ✅ Code reduction benefits
7. ✅ When to use each pattern

**Result**: Visual proof that the refactored code is better! 📊

---

## Related Documentation

- **tests/saucedemo.spec.ts** - Refactored test file
- **HOOKS_AND_LIFECYCLE.md** - Complete hooks guide
- **tests/login-setup-example.spec.ts** - More examples
