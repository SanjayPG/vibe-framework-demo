# Test Pages

This directory contains HTML test pages for advanced element testing.

## Files

### `advanced-elements.html`
Main test page featuring:
- **Select/Dropdown elements** (single select)
- **Multi-select elements**
- **Cascading dropdowns** (category → product)
- **Alert/Confirm/Prompt dialogs**
- **Window/tab opening triggers**

**How to access:**
```typescript
const TEST_PAGE = `file:///${path.resolve(__dirname, '../test-pages/advanced-elements.html')}`;
await page.goto(TEST_PAGE);
```

### `new-window-content.html`
Content for new windows/tabs opened from the main test page.

Features:
- Input field for testing new window interactions
- Accept/Cancel buttons
- Alert trigger in new window context

## Usage

These pages are used by `tests/advanced-elements.spec.ts` to test:
1. Natural language element finding
2. Dialog handling (alert, confirm, prompt)
3. Window/tab switching
4. Multi-window management

## Opening Manually

To view these pages in a browser:

```bash
# Windows
start test-pages/advanced-elements.html

# Mac/Linux
open test-pages/advanced-elements.html
```

Or simply drag the files into your browser.

## Test Coverage

The test pages support testing:
- ✅ Single select dropdowns
- ✅ Multi-select elements
- ✅ Cascading dropdowns
- ✅ Alert dialogs
- ✅ Confirm dialogs (accept/dismiss)
- ✅ Prompt dialogs (with input)
- ✅ Multiple sequential alerts
- ✅ New window opening
- ✅ New tab via link
- ✅ Multiple simultaneous windows
- ✅ Alerts in new windows
- ✅ Disabled-to-enabled state changes
