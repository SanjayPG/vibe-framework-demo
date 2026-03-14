# Vibe Framework Token Tracking Fix

## ✅ FIXES NOW INCLUDED IN OFFICIAL PACKAGE

**As of vibe-framework@1.1.3 (March 14, 2026), all fixes below are included in the official npm package.**

**Latest Updates (March 14, 2026):**
- **autoheal-locator@1.1.4**: Updated default Gemini model to `gemini-2.5-flash` (fixes 404 errors with deprecated model)
- **vibe.config.js**: Fixed API key selection to match selected provider (prevents API key mismatches)

No patches needed! Simply use:
```bash
npm install @sdetsanjay/vibe-framework@latest
npm install @sdetsanjay/autoheal-locator@latest
```

## Summary

Successfully fixed AI token usage and cost tracking in vibe-framework reports. Token information and accurate costs now appear in console output, JSON exports, and unified HTML reports.

## Problem

The unified report and session JSON files showed `$0.000000` cost despite AI calls being made. While autoheal-locator was tracking tokens internally (visible in console: `[DOM-AI] [2088ms] [1378 tokens]`), this data wasn't being captured and propagated through vibe-framework's metrics system.

## Root Causes

1. **Token Data Not Retrieved**: AutoHealBridge didn't extract token usage from autoheal-locator's reporter
2. **Healing Detection Broken**: Healing status was incorrectly determined using metrics delta instead of checking the actual strategy used
3. **Model Name Missing**: When no model was specified, cost calculator defaulted to free Groq model instead of provider-specific default
4. **Token Usage Not Exported**: JSONExporter filtered out tokenUsage field when generating session JSON
5. **Pure-AI Mode Crash**: Cache configuration with maxSize=0 caused "At least one of max, maxSize, or ttl is required" error

## Changes Made

### 1. AutoHealBridge.js
- **Added token retrieval**: Extracts `tokensUsed` from autoheal-locator's reporter after each find() call
- **Fixed healing detection**: Uses `LocatorStrategy.DOM_ANALYSIS` or `VISUAL_ANALYSIS` to accurately detect when AI healing occurred
- **Enhanced metadata**: Includes `tokensUsed` in locator metadata passed to MetricsCollector

### 2. VibeSession.js
- **Added parameter**: Passes `autoHealMeta.tokensUsed` to `recordElementFinding()`

### 3. MetricsCollector.js
- **Updated signature**: Added `tokensUsed` parameter to `recordElementFinding()`
- **Real cost calculation**: Uses actual token counts with proper token split (80% input / 20% output)
- **Model resolution**: Added `getDefaultModelForProvider()` to get correct default model for each provider
- **Token storage**: Stores `tokenUsage.healing` in action metrics for transparency

### 4. MetricsCollector.d.ts
- **Type definition update**: Added `tokensUsed?: number` parameter to recordElementFinding signature

### 5. JSONExporter.js
- **Export enhancement**: Added `tokenUsage` field to exported action data

### 6. AutoHealBridge.js (Pure-AI Mode Fix)
- **Cache validation**: Ensures maxSize and expireAfterWriteMs have positive values
- **Fallback defaults**: Uses maxSize=1000 and expireAfterWriteMs=3600000 (1 hour) when config has 0 values
- **Mode compatibility**: Fixes crash when using 'pure-ai' or 'trained' modes that disable caching

## Results

### Before
```
Cost Analysis:
  💰 Estimated Total: $0.000000
  Total AI Calls: 14
```

### After
```
Cost Analysis:
  💰 Estimated Total: $0.006772
  🔢 Total Tokens: 31,261 (Prompt: 3,050, Completion: 28,211)
  Most Expensive: click the add to cart button for the first product ($0.001474)
```

### JSON Output
Actions now include detailed token tracking:
```json
"ai": {
  "parseAICalled": true,
  "healingAICalled": true,
  "model": "gpt-4o-mini",
  "estimatedCost": 0.001474,
  "tokenUsage": {
    "parse": 1844,
    "healing": 6141
  }
}
```

## Provider/Model Defaults

The fix correctly identifies default models for each provider:

| Provider   | Default Model                 | Cost      |
|------------|-------------------------------|-----------|
| OPENAI     | gpt-4o-mini                   | Paid      |
| GROQ       | llama-3.3-70b-versatile       | FREE      |
| GEMINI     | gemini-2.0-flash-exp          | FREE      |
| ANTHROPIC  | claude-3-5-sonnet-20241022    | Paid      |
| DEEPSEEK   | deepseek-chat                 | Paid      |
| LOCAL      | local-model                   | FREE      |

## Installation

The fix is applied via `patch-package`. To use it:

1. Install dependencies: `npm install`
2. The `postinstall` script automatically applies the patch
3. Run tests to see accurate cost tracking: `npm test`

## Patch File

The changes are persisted in: `patches/@sdetsanjay+vibe-framework+1.1.2.patch`

This patch will be automatically applied when running `npm install` or `npm ci`.

## Testing

To verify the fix works:

```bash
# Clean cache and run test with AI calls
npm run clean:cache
npm test -- tests/saucedemo.spec.ts

# Generate unified report
npm run view-unified
```

You should see:
- ✅ Non-zero costs in console output
- ✅ Token counts displayed (parse + healing)
- ✅ tokenUsage field in session JSON files
- ✅ Accurate costs in unified HTML report

### Pure-AI Mode Test

```bash
# Test pure-ai mode (no caching, all AI calls)
npm run clean:cache
npm test -- tests/saucedemo.spec.ts -g "should display product inventory" --timeout=120000
```

Expected output:
```
Healings: 4
Parse Calls: 4
Healing Calls: 4
Total AI Calls: 8
💰 Estimated Total: $0.002469
🔢 Total Tokens: 12,015 (Prompt: 1,729, Completion: 10,286)
```

Note: Pure-AI mode makes double the AI calls since it doesn't use caching, so tests may take longer and cost more.

## Future Improvements

If you upgrade `@sdetsanjay/vibe-framework` to a version that includes this fix natively:

1. Remove the patch: `rm patches/@sdetsanjay+vibe-framework+1.1.2.patch`
2. Remove patch-package from devDependencies
3. Remove postinstall script from package.json

## Credits

Fixed by: Claude Code (Sonnet 4.5)
Date: 2026-03-14
Vibe Framework Version: 1.1.2
