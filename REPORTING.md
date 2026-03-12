# Vibe Framework - Beautiful Test Reports 📊

The Vibe Framework now includes comprehensive reporting with token information, performance metrics, screenshots, and videos!

## 📁 Report Files

After running tests, you'll find these files in the `vibe-reports` directory:

### HTML Reports
- **`index.html`** - The latest test report (opens automatically)
- **`report-{sessionId}.html`** - Individual session reports
- **`consolidated-report.html`** - Combined report from parallel execution

### JSON Reports
- **`session-{sessionId}.json`** - Complete session data with all metrics

### CSV Reports
- **`actions-{sessionId}.csv`** - Action-by-action breakdown
- **`summary-{sessionId}.csv`** - Session summary metrics

## ✨ Features Included in HTML Reports

### 1. **Token & Cost Information**
- Total AI calls (parsing + healing)
- Estimated cost per action
- Total session cost
- Token usage breakdown

### 2. **Step-by-Step Actions Timeline**
- Every command executed
- Latency breakdown (parsing, finding, execution)
- Cache hit/miss status
- AI usage per action
- Success/failure status

### 3. **Screenshots**
- Embedded in the report
- Click to enlarge (lightbox view)
- Captured on failure or when explicitly requested

### 4. **Video Recording**
- Embedded video player
- Fullscreen mode
- Recorded based on configuration (on-failure, always, or retain-on-failure)

### 5. **Performance Metrics**
- Total test duration
- Average latency per action
- Fastest/slowest actions
- Cache performance (hit rate, healings)

### 6. **Interactive Features**
- Search actions by keyword
- Filter by status (passed/failed)
- Expand/collapse all actions
- Sortable columns
- Beautiful UI with Playwright-style design

## 🚀 How to Enable Reporting

In your test files, configure the vibe session with reporting options:

```typescript
const session = vibe()
  .withPage(page)
  .withMode('smart-cache')
  .withAIProvider('GROQ', process.env.GROQ_API_KEY!)
  .withReporting({
    html: true,              // Generate HTML report
    json: true,              // Generate JSON report
    csv: true,               // Generate CSV reports
    console: true,           // Print to console
    includeScreenshots: true // Embed screenshots
  })
  .withVideo('retain-on-failure')  // Video recording mode
  .build();
```

## 📊 Report Sections

### 1. Header Section
- Test name and timestamp
- Overall pass/fail status
- Total duration
- Session ID and configuration

### 2. Overview Cards
- **Actions**: Total, successful, failed
- **Performance**: Average latency, total time, fastest/slowest actions
- **Cache**: Hit rate, hits, misses, healings
- **AI Usage**: Total calls, parse calls, healing calls, estimated cost

### 3. Performance Charts
- Latency distribution chart
- Color-coded by speed (fast/medium/slow)
- Interactive tooltips

### 4. Cache Performance
- Visual progress bar showing hit/miss ratio
- Healing information
- Recommendations for optimization

### 5. Cost Breakdown
- Total estimated cost
- Parse AI calls
- Healing AI calls
- Most expensive action

### 6. Tests List
- Individual test summaries
- Test-level metrics
- Status indicators

### 7. Actions Timeline
- Expandable action items
- Detailed breakdown:
  - Action type and command
  - Element selector
  - Latency breakdown (parse, find, execute)
  - Cache status (parse cache, AutoHeal cache)
  - AI usage and cost
  - Screenshots (click to enlarge)
  - Videos (embedded player with fullscreen)
  - Error messages (if failed)

## 🎯 View Your Reports

### Option 1: Open Directly
```bash
# Open the latest report
start vibe-reports/index.html

# Or on Mac/Linux
open vibe-reports/index.html
```

### Option 2: From Test Output
The test will print the report path:
```
📊 HTML Report: vibe-reports/report-{sessionId}.html
```

### Option 3: Use HTTP Server
```bash
# Install http-server (if needed)
npm install -g http-server

# Serve the reports
http-server vibe-reports -p 8080

# Open http://localhost:8080 in your browser
```

## 📈 Consolidated Reports (Parallel Execution)

When running tests in parallel, you can generate a consolidated report:

```bash
# Run tests in parallel
npx playwright test --workers=4

# The framework automatically generates consolidated reports
# combining metrics from all parallel workers
```

The consolidated report shows:
- Aggregated metrics across all workers
- Individual worker performance
- Links to detailed session reports
- Parallel execution statistics

## 🎨 Report Customization

You can customize the report output directory:

```typescript
const session = vibe()
  .withPage(page)
  .withReporting({
    html: true,
    outputDir: './custom-reports'  // Custom output directory
  })
  .build();
```

## 📝 Export Formats

### JSON Format
Perfect for CI/CD integration and custom analysis:
```json
{
  "session": {
    "id": "uuid",
    "startTime": "2026-03-10T21:27:00.000Z",
    "config": { ... }
  },
  "summary": {
    "tests": { "total": 1, "passed": 1, "failed": 0 },
    "actions": { "total": 10, "successful": 10 },
    "performance": { "averageLatencyMs": 500 },
    "cache": { "hitRate": "85.5%" },
    "ai": { "totalCalls": 15, "estimatedCost": "$0.000180" }
  },
  "tests": [ ... ]
}
```

### CSV Format
Great for spreadsheet analysis:
- **actions-{sessionId}.csv**: Action-level data
- **summary-{sessionId}.csv**: High-level metrics

## 🔍 What Gets Tracked

### Per Action
- Command text
- Action type (click, type, check, extract)
- Element description
- Selector used
- Latency (total and breakdown)
- Cache status (parse and AutoHeal)
- AI usage (parse and healing)
- Estimated cost
- Success/failure
- Error messages
- Screenshots
- Video recordings

### Per Session
- Total tests run
- Pass/fail counts
- Total actions
- Cache performance
- AI usage and cost
- Performance metrics
- Configuration used

## 💡 Tips

1. **Enable screenshots for debugging**: Set `includeScreenshots: true`
2. **Use video recording wisely**: `'retain-on-failure'` saves disk space
3. **Monitor AI costs**: Check the cost breakdown section
4. **Analyze cache performance**: Aim for >80% hit rate for optimal speed
5. **Review slow actions**: Check the performance section for bottlenecks

## 🎉 Example Report Structure

```
vibe-reports/
├── index.html                          # Latest report
├── report-{sessionId}.html             # Individual session report
├── session-{sessionId}.json            # Complete session data
├── actions-{sessionId}.csv             # Action breakdown
└── summary-{sessionId}.csv             # Session summary
```

## 📚 More Information

- **Vibe Framework Docs**: See the main vibe-framework repository
- **Video Recording Guide**: Check VIDEO_RECORDING.md in vibe-framework
- **Export Guide**: See EXPORT_GUIDE.md in vibe-framework/src/reporting

---

**Generated with Vibe Framework** - AI-Powered Natural Language Testing 🚀
