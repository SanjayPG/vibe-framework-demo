# Unified Interactive Report Guide

## Overview

The **Unified Interactive Report** is a single HTML page that consolidates all test sessions with an interactive session selector, full detailed reports, and embedded videos.

## Features

✅ **Session Selector** - Switch between sessions using tabs (desktop) or dropdown (mobile)
✅ **Full Detailed Reports** - Complete metrics, actions timeline, and test results per session
✅ **Video Integration** - Test recordings embedded at the end of each test
✅ **Screenshot References** - Links to Playwright HTML report for detailed screenshots
✅ **Responsive Design** - Works seamlessly on desktop and mobile devices
✅ **Single Page Experience** - No juggling multiple HTML files

## How to Use

### Generate Unified Report

```bash
# Generate report from existing test sessions
npm run unified

# Generate and open report in browser
npm run view-unified
```

### Run Tests and View Unified Report

```bash
# Run tests and automatically open unified report
npm run test:view
```

This will:
1. Run your Playwright tests
2. Generate vibe session data
3. Create the unified interactive report
4. Open it in your default browser

## Report Structure

### 1. Unified Header
- Overall test statistics across all sessions
- Total tests passed/failed
- Number of sessions
- Success rate

### 2. Session Selector
- **Desktop**: Horizontal tabs showing worker status (✓ or ✗)
- **Mobile**: Dropdown menu for session selection
- Color-coded by pass/fail status

### 3. Session Content (per session)
Each session displays:

#### Session Header
- Worker number and session ID
- Start time and duration
- Configuration (mode, AI provider)
- Screenshot banner with link to Playwright report

#### Overview Cards
- **Actions**: Total, successful, and failed actions
- **Performance**: Average latency, total time, fastest action
- **Cache**: Hit rate, hits, healings
- **AI Usage**: Total calls, parse calls, estimated cost

#### Tests Section
For each test:
- Test name, status icon (✓/✗), and duration
- Test statistics (actions, pass rate, cache performance)
- **Actions Timeline**: Expandable action items with details
  - Action type and selector
  - Latency breakdown
  - Cache status
  - AI usage
  - Screenshot indicator (📸 links to Playwright report)
- **🎬 Test Recording**: Video player embedded at end of test

## Navigating the Report

### Switching Sessions
- **Desktop**: Click tabs at the top to switch between workers
- **Mobile**: Use the dropdown selector

### Viewing Action Details
- Click any action item to expand/collapse details
- See latency breakdown, cache status, AI usage, and errors

### Watching Test Videos
- Scroll to the end of each test to find the video player
- Click **⛶ Fullscreen** button to watch in fullscreen mode
- Videos are automatically matched to tests by timestamp

### Viewing Screenshots
- Each action shows a "📸 Available in Playwright Report" indicator if screenshots exist
- Click the **"Open Playwright Report"** button in the session header
- This opens Playwright's HTML report with detailed screenshots for each step

## Technical Details

### Video Matching
Videos are matched to tests using:
1. Timestamp proximity (finds video created closest to test start time)
2. Only matches videos within 5 minutes of test execution
3. Relative paths from `vibe-reports/` to `test-results/`

### Screenshot Handling
- Screenshots are captured during test execution
- Stored in Playwright's HTML report
- The unified report provides convenient links to view them
- Action items show indicators when screenshots are available

### Performance
- All session content is pre-rendered in HTML
- Session switching uses CSS `display:none/block` for instant switching
- No network requests or API calls needed
- Works offline once generated

## Files

### Created Files
- `C:\Backup\vibe-framework\src\reporting\UnifiedReporter.ts` - Reporter class
- `C:\Backup\vibe-framework-demo\generate-unified-report.js` - CLI script
- `C:\Backup\vibe-framework-demo\vibe-reports\unified-report.html` - Generated report

### Modified Files
- `test-and-view.js` - Updated to generate unified report
- `package.json` - Added `unified` and `view-unified` scripts

## Example Workflow

```bash
# 1. Run your tests with multiple workers
npm test -- --workers=3

# 2. Generate unified report (happens automatically with test:view)
npm run test:view

# 3. Report opens showing all 3 worker sessions
# - Click tabs to switch between workers
# - Scroll down to see test videos
# - Click "Open Playwright Report" for detailed screenshots
```

## Comparison with Other Reports

| Feature | Unified Report | Consolidated Report | Individual Reports |
|---------|---------------|--------------------|--------------------|
| Single HTML file | ✅ | ✅ | ❌ |
| Session selector | ✅ | ❌ | ❌ |
| Full test details | ✅ | ❌ | ✅ |
| Videos at test end | ✅ | ❌ | ❌ |
| Quick navigation | ✅ | ✅ | ❌ |
| Mobile responsive | ✅ | ✅ | ✅ |

## Tips

1. **View Latest Results**: Always run `npm run unified` after tests to regenerate the report with latest data

2. **Multiple Test Runs**: The unified report shows ALL sessions from `vibe-reports/session-*.json` files

3. **Clean Old Sessions**: Delete old `session-*.json` files if you only want to see recent test results

4. **Video Playback**: If videos don't play, ensure:
   - Test-results directory exists
   - Videos were generated during test execution
   - Paths are relative and correct

5. **Screenshots**: For detailed step-by-step screenshots:
   - Open Playwright HTML report via the link in session header
   - Or run: `npm run view-playwright`

## Troubleshooting

### Videos Not Showing
- Verify `test-results/` directory contains video.webm files
- Check that videos were created within 5 minutes of test execution
- Regenerate report: `npm run unified`

### Screenshots Not Visible
- Screenshots are in Playwright HTML report, not embedded
- Click "Open Playwright Report" button in session header
- Or run: `npx playwright show-report`

### Report Not Opening
- Manually open: `vibe-reports/unified-report.html`
- Check browser console for errors
- Ensure all session JSON files are valid

## Next Steps

- Run tests to generate fresh data
- View unified report to analyze results
- Use session tabs to compare worker performance
- Watch test videos to understand failures
- Access Playwright report for detailed screenshots

Enjoy your unified testing experience! 🎉
