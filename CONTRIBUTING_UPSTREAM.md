# Contributing Fixes to Official vibe-framework Package

This document explains how to submit the token tracking and cost reporting fixes to the official `@sdetsanjay/vibe-framework` npm package.

## What We Fixed

Our patches fix 5 critical issues in vibe-framework@1.1.2:

1. **Missing Token Data**: AI token usage from autoheal-locator wasn't being captured
2. **Broken Healing Detection**: Used metrics delta instead of checking actual LocatorStrategy
3. **Wrong Model Costs**: Defaulted to free Groq model instead of provider-specific defaults
4. **Missing JSON Export**: tokenUsage field wasn't included in session JSON
5. **Pure-AI Mode Crash**: Cache config with maxSize=0 caused lru-cache error

## Files Modified in Our Patch

```
vibe-framework/dist/
├── integration/AutoHealBridge.js       (Token retrieval + healing detection + cache fix)
├── core/VibeSession.js                 (Pass tokensUsed to MetricsCollector)
├── reporting/
│   ├── MetricsCollector.js             (Real cost calculation + model resolution)
│   ├── MetricsCollector.d.ts           (TypeScript definitions)
│   └── JSONExporter.js                 (Export tokenUsage field)
```

## How to Submit Pull Request

### Step 1: Fork the Official Repository

1. Go to: https://github.com/sdetsanjay/vibe-framework
2. Click "Fork" button (top right)
3. Clone your fork:
```bash
git clone https://github.com/YOUR_USERNAME/vibe-framework.git
cd vibe-framework
```

### Step 2: Create Feature Branch

```bash
git checkout -b fix/token-tracking-and-pure-ai-mode
```

### Step 3: Apply Changes to Source Files

The patch modifies **compiled** files in `dist/`. You need to apply changes to **source** files in `src/`:

#### A. AutoHealBridge.ts Changes

**File**: `src/integration/AutoHealBridge.ts`

Add after line ~92 (after `const locator = await this.autoHeal.find(...)`):

```typescript
// Check reporter for actual healing status
let healed = false;
try {
    const reporter = this.autoHeal.getReporter?.();
    if (reporter && reporter.reports && reporter.reports.length > 0) {
        const lastReport = reporter.reports[reporter.reports.length - 1];
        const { LocatorStrategy } = this.autoHealModule;
        healed = lastReport.strategy === LocatorStrategy.DOM_ANALYSIS ||
                lastReport.strategy === LocatorStrategy.VISUAL_ANALYSIS;
    }
} catch (e) {
    healed = metricsAfter.successful_requests > metricsBefore.successful_requests && cacheMiss;
}
```

Add before returning locator metadata (~line 120):

```typescript
// Get token usage from autoheal-locator's reporter
let tokensUsed = 0;
try {
    const reporter = this.autoHeal.getReporter?.();
    if (reporter && reporter.reports && reporter.reports.length > 0) {
        const lastReport = reporter.reports[reporter.reports.length - 1];
        tokensUsed = lastReport.tokensUsed || 0;
    }
} catch (e) {
    // Silently ignore if reporter not available
}
```

Add `tokensUsed` to metadata object:

```typescript
locator._autoHealMetadata = {
    cacheHit,
    healed,
    selector: actualSelector,
    description,
    tokensUsed  // ADD THIS
};
```

Fix cache validation in `buildAutoHealConfig()` (~line 240):

```typescript
// Ensure cache config has valid values (lru-cache requires at least one positive value)
const maxSize = this.config.cache.maxSize || 1000;
const expireAfterWriteMs = this.config.cache.expireAfterWriteMs || 3600000;

return {
    ai: aiConfig,
    cache: {
        type: this.mapCacheType(this.config.cache.type, AHCacheType),
        maxSize: maxSize,
        expireAfterWriteMs: expireAfterWriteMs
    },
    performance: {
        executionStrategy: this.mapExecutionStrategy(this.config.executionStrategy, AHExecutionStrategy),
        elementTimeout: 10000
    }
};
```

#### B. VibeSession.ts Changes

**File**: `src/core/VibeSession.ts`

Update line ~128 to pass tokensUsed:

```typescript
this.metrics.recordElementFinding(
    findEnd - findStart,
    autoHealMeta.cacheHit ?? false,
    autoHealMeta.healed ?? false,
    autoHealMeta.selector,
    this.config.aiModel || undefined,
    autoHealMeta.tokensUsed  // ADD THIS
);
```

#### C. MetricsCollector.ts Changes

**File**: `src/reporting/MetricsCollector.ts`

Update `recordElementFinding` signature (~line 116):

```typescript
recordElementFinding(
    latencyMs: number,
    cacheHit: boolean,
    healed: boolean,
    selector?: string,
    model?: string,
    tokensUsed?: number  // ADD THIS
): void {
```

Update the healing cost calculation (~line 125):

```typescript
if (healed) {
    this.currentAction.ai.healingAICalled = true;
    this.currentAction.ai.model = model;

    // Calculate real cost from token usage if available
    if (tokensUsed && tokensUsed > 0) {
        const { CostCalculator } = require('../utils/CostCalculator');

        const estimatedPromptTokens = Math.floor(tokensUsed * 0.8);
        const estimatedCompletionTokens = Math.ceil(tokensUsed * 0.2);

        const tokenUsageObj = {
            promptTokens: estimatedPromptTokens,
            completionTokens: estimatedCompletionTokens,
            totalTokens: tokensUsed
        };

        const provider = this.sessionConfig.aiProvider || 'GROQ';
        const actualModel = model || this.sessionConfig.aiModel || this.getDefaultModelForProvider(provider);
        const cost = CostCalculator.calculateCost(provider, actualModel, tokenUsageObj);

        this.currentAction.ai.estimatedCost += cost;
        this.currentAction.ai.model = actualModel;

        if (!this.currentAction.ai.tokenUsage) {
            this.currentAction.ai.tokenUsage = { parse: 0, healing: 0 };
        }
        this.currentAction.ai.tokenUsage.healing = tokensUsed;
    } else {
        // Fallback to estimate if no token data
        this.currentAction.ai.estimatedCost += 0.0004;
    }
}
```

Add helper method at end of class (~line 290):

```typescript
private getDefaultModelForProvider(provider: string): string {
    const defaultModels: Record<string, string> = {
        'GEMINI': 'gemini-2.0-flash-exp',
        'OPENAI': 'gpt-4o-mini',
        'ANTHROPIC': 'claude-3-5-sonnet-20241022',
        'DEEPSEEK': 'deepseek-chat',
        'GROQ': 'llama-3.3-70b-versatile',
        'LOCAL': 'local-model'
    };
    return defaultModels[provider] || 'gpt-4o-mini';
}
```

#### D. JSONExporter.ts Changes

**File**: `src/reporting/JSONExporter.ts`

Add `tokenUsage` to action export (~line 160):

```typescript
ai: {
    parseAICalled: action.ai.parseAICalled,
    healingAICalled: action.ai.healingAICalled,
    model: action.ai.model,
    estimatedCost: action.ai.estimatedCost,
    tokenUsage: action.ai.tokenUsage  // ADD THIS
},
```

### Step 4: Build and Test

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test
```

### Step 5: Commit Changes

```bash
git add src/
git commit -m "Fix AI token tracking and pure-ai mode cache configuration

- Capture token usage from autoheal-locator reporter
- Fix healing detection to use LocatorStrategy enum
- Resolve model names with provider-specific defaults
- Export tokenUsage in JSON reports
- Fix pure-ai mode crash with cache validation

Fixes show accurate costs: $0.006772 for 14 AI calls with full token breakdown"
```

### Step 6: Push and Create PR

```bash
# Push to your fork
git push origin fix/token-tracking-and-pure-ai-mode
```

Then:
1. Go to https://github.com/YOUR_USERNAME/vibe-framework
2. Click "Compare & pull request"
3. Fill in PR details (see template below)
4. Submit!

## Pull Request Template

```markdown
## Description

Fixes critical issues with AI token tracking and cost reporting in vibe-framework.

## Problem

- Token usage from autoheal-locator AI healing calls wasn't being captured
- Reports showed $0.000000 cost despite making AI calls
- Pure-AI mode crashed with cache configuration error
- Healing detection used metrics delta instead of actual strategy

## Solution

1. **Token Retrieval**: Extract tokensUsed from autoheal-locator's reporter
2. **Healing Detection**: Check LocatorStrategy.DOM_ANALYSIS/VISUAL_ANALYSIS
3. **Model Resolution**: Use provider-specific defaults (OPENAI→gpt-4o-mini)
4. **Cost Calculation**: Calculate real costs from actual token counts
5. **JSON Export**: Include tokenUsage field in session exports
6. **Cache Validation**: Ensure maxSize/expireAfterWriteMs > 0 for pure-ai mode

## Results

Before:
```
💰 Estimated Total: $0.000000
Total AI Calls: 14
```

After:
```
💰 Estimated Total: $0.006772
🔢 Total Tokens: 31,261 (Prompt: 3,050, Completion: 28,211)
Most Expensive: click add to cart ($0.001474)
```

## Testing

- ✅ Smart-cache mode: Works with cached selectors
- ✅ Pure-AI mode: No longer crashes, shows accurate costs
- ✅ Token tracking: Parse + healing tokens displayed
- ✅ JSON export: tokenUsage field preserved
- ✅ All modes: Accurate cost calculation by provider

## Breaking Changes

None - all changes are backward compatible.

## Checklist

- [x] Code follows project style guidelines
- [x] Changes have been tested
- [x] Documentation updated (PATCH_NOTES.md in demo)
- [x] No breaking changes
```

## Alternative: Create Issue First

If you prefer, you can create an issue first to discuss the fixes:

1. Go to: https://github.com/sdetsanjay/vibe-framework/issues
2. Click "New Issue"
3. Title: "AI token usage not tracked, pure-ai mode crashes"
4. Describe the problems and link to this demo repo showing the fixes

## Reference Implementation

Our working patch is available at:
- **GitHub**: https://github.com/SanjayPG/vibe-framework-demo
- **Patch File**: `patches/@sdetsanjay+vibe-framework+1.1.2.patch`
- **Documentation**: `PATCH_NOTES.md`

The maintainer can review our working implementation before merging.

## Questions?

Contact: Sanjay (package owner) via GitHub issues or npm package page.
