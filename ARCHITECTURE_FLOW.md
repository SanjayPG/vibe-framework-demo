# Vibe Framework Architecture - Complete End-to-End Flow 🔄

Complete visual explanation of how Vibe Framework works internally, from natural language input to reporting.

---

## 🎯 Complete Healing Mechanism Flow

This diagram shows the entire journey of a natural language command through the Vibe Framework:

```mermaid
flowchart TD
    Start([User writes Natural Language Command]) --> Input["session.do('click the login button')"]

    Input --> ParseCache{Parse Cache<br/>Exists?}

    ParseCache -->|Cache Hit| ParseCached[Load Parsed Command<br/>from Cache<br/>⚡ Instant]
    ParseCache -->|Cache Miss| ParseAI[AI Natural Language Parser<br/>Groq/Gemini/OpenAI<br/>~500ms]

    ParseAI --> ParseResult[Parse Result:<br/>Action: click<br/>Element: login button<br/>Type: button]
    ParseResult --> SaveParse[Save to Parse Cache<br/>for next time]
    SaveParse --> ParseCached

    ParseCached --> SelectorCache{Selector Cache<br/>autoheal-cache/<br/>selectors.json<br/>Exists?}

    SelectorCache -->|Cache Hit ✅| CachedSelector["Retrieved from Cache:<br/>button|login button<br/>→ #login-button<br/>⚡ ~100ms<br/>💰 $0"]
    SelectorCache -->|Cache Miss ❌| AutoHeal[AutoHeal Element Finder<br/>AI-Powered]

    AutoHeal --> TryOriginal{Try Original<br/>Locator First}
    TryOriginal -->|Found ✅| OriginalWorks[Original Locator Works!<br/>e.g., button found]
    TryOriginal -->|Not Found ❌| DOMAnalysis[AI DOM Analysis<br/>Scan page structure<br/>~800ms]

    OriginalWorks --> SaveToCache

    DOMAnalysis --> AIFind{AI Found<br/>Element?}
    AIFind -->|Yes ✅| ElementFound[Element Located:<br/>#login-button<br/>💰 ~$0.01]
    AIFind -->|No ❌| VisualAI[Visual AI Analysis<br/>Screenshot + Vision AI<br/>~2000ms<br/>💰 ~$0.03]

    VisualAI --> VisualFound{Visual AI<br/>Found?}
    VisualFound -->|Yes ✅| ElementFound
    VisualFound -->|No ❌| ElementFailed[Element Not Found<br/>❌ Healing Failed]

    ElementFound --> SaveToCache[Save to Cache:<br/>button|login button<br/>→ #login-button<br/>successCount: 1]

    SaveToCache --> CachedSelector

    CachedSelector --> ExecuteAction[Execute Playwright Action:<br/>page.locator('#login-button').click]

    ExecuteAction --> ActionResult{Action<br/>Successful?}

    ActionResult -->|Success ✅| IncrementSuccess[Increment successCount<br/>in cache]
    ActionResult -->|Failure ❌| IncrementFailure[Increment failureCount<br/>in cache]

    IncrementSuccess --> RecordMetrics[Record Metrics:<br/>- Latency time<br/>- Token count<br/>- Cost estimate<br/>- Cache hit/miss]
    IncrementFailure --> CheckFailCount{failureCount<br/>> threshold?}

    CheckFailCount -->|Yes| InvalidateCache[Invalidate Cache Entry<br/>Force re-heal next time]
    CheckFailCount -->|No| RecordMetrics

    InvalidateCache --> RecordMetrics

    RecordMetrics --> GenerateReport[Generate Test Report:<br/>- HTML Report<br/>- JSON Report<br/>- CSV Report<br/>- Console Output]

    GenerateReport --> AttachArtifacts{Include<br/>Artifacts?}

    AttachArtifacts -->|Yes| AddScreenshot[Add Screenshot<br/>to Report]
    AttachArtifacts -->|No| FinalReport

    AddScreenshot --> AddVideo{Video<br/>Recording?}
    AddVideo -->|Yes| EmbedVideo[Embed Video<br/>in Report]
    AddVideo -->|No| FinalReport

    EmbedVideo --> FinalReport[Final Report with:<br/>✅ Action status<br/>⏱️ Performance metrics<br/>💰 Cost analysis<br/>📊 Cache statistics<br/>📸 Screenshots<br/>🎥 Video]

    FinalReport --> SessionSummary[Update Session Summary:<br/>- Total actions<br/>- Success/fail counts<br/>- Cache hit rate<br/>- Total cost<br/>- Total time]

    SessionSummary --> End([Command Complete<br/>Ready for Next Action])

    ElementFailed --> ErrorReport[Generate Error Report:<br/>- Element description<br/>- Page screenshot<br/>- DOM snapshot<br/>- Suggestions]
    ErrorReport --> ThrowError[Throw Error to Test<br/>❌ Test Failed]
    ThrowError --> SessionSummary

    %% Styling
    style Start fill:#e1f5ff
    style End fill:#e1f5ff
    style ParseCached fill:#ccffcc
    style CachedSelector fill:#ccffcc
    style SaveToCache fill:#ccffcc
    style IncrementSuccess fill:#ccffcc
    style ElementFound fill:#ccffcc
    style ParseAI fill:#fff4cc
    style AutoHeal fill:#fff4cc
    style DOMAnalysis fill:#fff4cc
    style VisualAI fill:#ffebcc
    style ElementFailed fill:#ffcccc
    style ThrowError fill:#ffcccc
    style IncrementFailure fill:#ffcccc
    style FinalReport fill:#e8f5e9
    style GenerateReport fill:#e8f5e9
```

---

## 📊 Layer-by-Layer Architecture

```mermaid
graph TB
    subgraph Layer1["🎤 Layer 1: Natural Language Interface"]
        NL1[session.do<br/>'click the login button']
        NL2[session.extract<br/>'name of first product']
        NL3[session.check<br/>'verify cart has items']
    end

    subgraph Layer2["🧠 Layer 2: AI Parser + Cache"]
        Parser[Natural Language Parser<br/>Groq/Gemini/OpenAI]
        ParseCache[Parse Cache<br/>In-Memory]
    end

    subgraph Layer3["🔧 Layer 3: AutoHeal Bridge"]
        Bridge[AutoHeal Bridge<br/>Smart Caching Layer]
        FileCache[File Cache<br/>autoheal-cache/selectors.json]
    end

    subgraph Layer4["🔍 Layer 4: AutoHeal Locator"]
        Original[Try Original Locator]
        DomAI[DOM AI Analysis]
        Visual[Visual AI Analysis]
    end

    subgraph Layer5["🎭 Layer 5: Playwright Execution"]
        Playwright[Playwright API<br/>click/fill/select/etc]
    end

    subgraph Layer6["📊 Layer 6: Reporting & Metrics"]
        Metrics[Metrics Collection]
        Reports[Report Generation<br/>HTML/JSON/CSV]
        Video[Video Recording]
    end

    NL1 --> Parser
    NL2 --> Parser
    NL3 --> Parser

    Parser --> ParseCache
    ParseCache --> Bridge

    Bridge --> FileCache
    FileCache --> Original

    Original -->|Not Found| DomAI
    DomAI -->|Not Found| Visual
    Original -->|Found| Playwright
    DomAI -->|Found| Playwright
    Visual -->|Found| Playwright

    Playwright --> Metrics
    Metrics --> Reports
    Metrics --> Video

    style Layer1 fill:#e1f5ff
    style Layer2 fill:#fff4e1
    style Layer3 fill:#f0e1ff
    style Layer4 fill:#ffe1e1
    style Layer5 fill:#e1ffe1
    style Layer6 fill:#ffe1f5
```

---

## ⚡ Cache Performance Flow

```mermaid
stateDiagram-v2
    [*] --> FirstRun

    state FirstRun {
        [*] --> NoParseCa
        NoParseCa: No Parse Cache
        NoParseCa --> AIParser
        AIParser --> ParseResult
        ParseResult --> SaveParse
        SaveParse --> NoSelectorCache
        NoSelectorCache: No Selector Cache
        NoSelectorCache --> AutoHealFind
        AutoHealFind --> DOMAnalysis
        DOMAnalysis --> SaveSelector
        SaveSelector --> ExecuteAction
        ExecuteAction --> [*]
    }

    FirstRun --> SubsequentRuns: Next command

    state SubsequentRuns {
        [*] --> ParseCacheHit
        ParseCacheHit: Parse Cache Hit ✅
        ParseCacheHit --> SelectorCacheHit
        SelectorCacheHit: Selector Cache Hit ✅
        SelectorCacheHit --> ExecuteFast
        ExecuteFast: Execute (Instant)
        ExecuteFast --> [*]
    }

    SubsequentRuns --> [*]

    note right of FirstRun
        First Run:
        - Parse: ~500ms
        - Find: ~800ms
        - Execute: ~100ms
        Total: ~1400ms
        Cost: ~$0.01
    end note

    note right of SubsequentRuns
        Cached Runs:
        - Parse: 0ms (cached)
        - Find: 0ms (cached)
        - Execute: ~100ms
        Total: ~100ms
        Cost: $0.00

        93% faster!
    end note
```

---

## 🔄 AutoHeal Self-Healing Process

```mermaid
flowchart TD
    Start([Element Not Found]) --> Analyze[Analyze Page State]

    Analyze --> Check1{Check 1:<br/>Element Exists<br/>but Changed?}

    Check1 -->|Yes| Heal1[Heal Strategy 1:<br/>Find by similar attributes<br/>data-testid, aria-label]
    Check1 -->|No| Check2{Check 2:<br/>Element Moved<br/>in DOM?}

    Heal1 --> TryHeal1{Success?}
    TryHeal1 -->|Yes ✅| UpdateCache1[Update Cache<br/>with New Selector]
    TryHeal1 -->|No ❌| Check2

    Check2 -->|Yes| Heal2[Heal Strategy 2:<br/>Find by text content<br/>or position]
    Check2 -->|No| Check3{Check 3:<br/>Element<br/>Renamed?}

    Heal2 --> TryHeal2{Success?}
    TryHeal2 -->|Yes ✅| UpdateCache2[Update Cache<br/>with New Selector]
    TryHeal2 -->|No ❌| Check3

    Check3 -->|Yes| Heal3[Heal Strategy 3:<br/>AI DOM Analysis<br/>Find semantically]
    Check3 -->|No| Check4{Check 4:<br/>Can Use<br/>Visual AI?}

    Heal3 --> TryHeal3{Success?}
    TryHeal3 -->|Yes ✅| UpdateCache3[Update Cache<br/>with New Selector]
    TryHeal3 -->|No ❌| Check4

    Check4 -->|Yes| Heal4[Heal Strategy 4:<br/>Visual AI Analysis<br/>Screenshot + Vision]
    Check4 -->|No| Failed

    Heal4 --> TryHeal4{Success?}
    TryHeal4 -->|Yes ✅| UpdateCache4[Update Cache<br/>with New Selector]
    TryHeal4 -->|No ❌| Failed

    UpdateCache1 --> Success([✅ Element Healed<br/>Test Continues])
    UpdateCache2 --> Success
    UpdateCache3 --> Success
    UpdateCache4 --> Success

    Failed([❌ Healing Failed<br/>Throw Error])

    style Heal1 fill:#e8f5e9
    style Heal2 fill:#fff9c4
    style Heal3 fill:#ffe0b2
    style Heal4 fill:#ffccbc
    style Success fill:#ccffcc
    style Failed fill:#ffcccc
```

---

## 📈 Performance Metrics Flow

```mermaid
graph LR
    subgraph Action["Single Action Execution"]
        Start[Start Timer] --> Parse[Parse NL]
        Parse --> Find[Find Element]
        Find --> Execute[Execute Action]
        Execute --> Stop[Stop Timer]
    end

    subgraph Metrics["Metrics Collection"]
        Stop --> M1[Parse Time]
        Stop --> M2[Find Time]
        Stop --> M3[Execute Time]
        Stop --> M4[Total Latency]
        Stop --> M5[Token Count]
        Stop --> M6[Cache Hit/Miss]
        Stop --> M7[Success/Failure]
    end

    subgraph Cost["Cost Calculation"]
        M5 --> C1[Calculate AI Cost<br/>tokens × price]
        M6 --> C2[Cache Hit → $0<br/>Cache Miss → calculated]
        C1 --> Total[Total Cost]
        C2 --> Total
    end

    subgraph Report["Report Generation"]
        M1 --> R1[Action Timeline]
        M2 --> R1
        M3 --> R1
        M4 --> R1
        Total --> R2[Cost Analysis]
        M6 --> R3[Cache Statistics]
        M7 --> R4[Success Rate]
    end

    R1 --> Final[Final HTML Report]
    R2 --> Final
    R3 --> Final
    R4 --> Final

    style Action fill:#e1f5ff
    style Metrics fill:#fff4e1
    style Cost fill:#f0e1ff
    style Report fill:#e8f5e9
```

---

## 🎯 Success vs Failure Paths

```mermaid
graph TD
    Start[Execute Action] --> Try[Try Action]

    Try --> Result{Result?}

    Result -->|Success ✅| S1[Increment successCount]
    Result -->|Failure ❌| F1[Increment failureCount]

    S1 --> S2[Record Success Metrics:<br/>- Latency<br/>- Tokens<br/>- Cost]
    F1 --> F2[Record Failure Metrics:<br/>- Error message<br/>- Screenshot<br/>- DOM state]

    S2 --> S3{successCount<br/>> 10?}
    F2 --> F3{failureCount<br/>> 3?}

    S3 -->|Yes| S4[Mark as Reliable<br/>High confidence]
    S3 -->|No| Report

    F3 -->|Yes| F4[Invalidate Cache<br/>Force re-heal]
    F3 -->|No| F5[Keep in Cache<br/>Try again next time]

    S4 --> Report[Generate Report]
    F4 --> Report
    F5 --> Report

    Report --> Console[Console Output:<br/>✅/❌ status<br/>⏱️ time<br/>💰 cost]
    Report --> HTML[HTML Report:<br/>📊 charts<br/>📸 screenshots<br/>🎥 video]
    Report --> JSON[JSON Report:<br/>raw data<br/>for analysis]
    Report --> CSV[CSV Report:<br/>metrics table]

    Console --> End[Test Continues]
    HTML --> End
    JSON --> End
    CSV --> End

    style S1 fill:#ccffcc
    style S2 fill:#ccffcc
    style S3 fill:#ccffcc
    style S4 fill:#ccffcc
    style F1 fill:#ffcccc
    style F2 fill:#ffcccc
    style F3 fill:#ffcccc
    style F4 fill:#ffcccc
    style F5 fill:#ffffcc
```

---

## 💾 Cache Management

```mermaid
stateDiagram-v2
    [*] --> CacheEmpty: First Run

    CacheEmpty --> CacheMiss: No entry found

    CacheMiss --> AIProcess: Use AI
    AIProcess --> SaveToCache: Element found

    SaveToCache --> CacheHit: Entry saved

    CacheHit --> CheckExpiry: Subsequent runs

    CheckExpiry --> Valid: < 24 hours old
    CheckExpiry --> Expired: > 24 hours old

    Expired --> AIProcess: Re-validate

    Valid --> CheckSuccess: Check success rate

    CheckSuccess --> HighSuccess: successCount > 10,<br/>failureCount = 0
    CheckSuccess --> MediumSuccess: Mixed results
    CheckSuccess --> HighFailure: failureCount > 3

    HighSuccess --> UseCache: High confidence
    MediumSuccess --> UseCache: Try again
    HighFailure --> InvalidateEntry: Low confidence

    InvalidateEntry --> AIProcess: Force re-heal

    UseCache --> Success: Action succeeds
    UseCache --> Failure: Action fails

    Success --> IncrementSuccess
    Failure --> IncrementFailure

    IncrementSuccess --> CacheHit
    IncrementFailure --> CheckFailCount

    CheckFailCount --> KeepEntry: failureCount < 3
    CheckFailCount --> InvalidateEntry: failureCount >= 3

    KeepEntry --> CacheHit

    note right of CacheHit
        Cache Entry:
        {
          "selector": "#login-btn",
          "successCount": 15,
          "failureCount": 0,
          "timestamp": 1234567890
        }
    end note
```

---

## 🔧 Configuration & Modes

```mermaid
graph TB
    Session[Vibe Session] --> Config{Configuration}

    Config --> Mode[Cache Mode]
    Config --> Provider[AI Provider]
    Config --> Report[Reporting Options]
    Config --> Video[Video Options]

    Mode --> M1[smart-cache:<br/>File-based persistence<br/>Shared across runs]
    Mode --> M2[training:<br/>Record selectors<br/>for CI replay]
    Mode --> M3[no-cache:<br/>Always use AI<br/>for testing]

    Provider --> P1[Groq:<br/>Fast & Free<br/>llama-3.3-70b]
    Provider --> P2[Gemini:<br/>Free tier available<br/>gemini-1.5-flash]
    Provider --> P3[OpenAI:<br/>GPT-4o<br/>High accuracy]
    Provider --> P4[Local:<br/>Self-hosted<br/>Unlimited]

    Report --> R1[HTML:<br/>Beautiful reports<br/>with charts]
    Report --> R2[JSON:<br/>Raw data<br/>for analysis]
    Report --> R3[CSV:<br/>Metrics table<br/>for Excel]
    Report --> R4[Console:<br/>Real-time output<br/>colored logs]

    Video --> V1[on:<br/>Always record]
    Video --> V2[retain-on-failure:<br/>Only save failures]
    Video --> V3[off:<br/>No recording]

    M1 --> Execute[Execute Tests]
    M2 --> Execute
    M3 --> Execute
    P1 --> Execute
    P2 --> Execute
    P3 --> Execute
    P4 --> Execute
    R1 --> Execute
    R2 --> Execute
    R3 --> Execute
    R4 --> Execute
    V1 --> Execute
    V2 --> Execute
    V3 --> Execute

    style M1 fill:#ccffcc
    style P1 fill:#e1f5ff
    style R1 fill:#fff4e1
    style V2 fill:#f0e1ff
```

---

## Summary

These diagrams show:
1. ✅ **Complete end-to-end flow** - From NL input to reporting
2. ✅ **Layer-by-layer architecture** - 6 distinct layers
3. ✅ **Cache performance** - First run vs cached runs
4. ✅ **AutoHeal healing process** - 4 healing strategies
5. ✅ **Performance metrics** - How metrics are collected
6. ✅ **Success vs failure paths** - Different outcomes
7. ✅ **Cache management** - Lifecycle and invalidation
8. ✅ **Configuration modes** - All available options

**Result**: Complete visual understanding of the entire framework! 📊
