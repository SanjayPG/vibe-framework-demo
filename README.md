# Vibe Framework Demo

Demo project showcasing how to use [@sdetsanjay/vibe-framework](https://www.npmjs.com/package/@sdetsanjay/vibe-framework) for natural language test automation with Playwright.

## What is Vibe Framework?

Vibe Framework is a natural language automation library that lets you write test commands in plain English. Instead of brittle CSS selectors, you use AI-powered natural language:

```typescript
await session.do('click the login button');
await session.do('type hello@example.com into email field');
await session.check('verify dashboard is loaded');
```

Built on [@sdetsanjay/autoheal-locator](https://www.npmjs.com/package/@sdetsanjay/autoheal-locator) for intelligent element detection and self-healing capabilities.

## Features Demonstrated

- ✅ Natural language automation commands
- ✅ Multiple AI provider support (Groq, Gemini, OpenAI, etc.)
- ✅ Smart caching for 95-99% latency reduction
- ✅ Training mode for zero-cost CI/CD runs
- ✅ HTML reporting with screenshots and videos
- ✅ Parallel test execution (2.5x-3.5x speedup)
- ✅ Self-healing element location

## Prerequisites

- Node.js 16 or higher
- npm (comes with Node.js)

## Installation

1. Clone this repository:
```bash
git clone https://github.com/SanjayPG/vibe-framework-demo.git
cd vibe-framework-demo
```

2. Install dependencies:
```bash
npm install
```

3. Install Playwright browsers:
```bash
npx playwright install
```

## Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and add your API key:
```env
# Choose one (Groq recommended for getting started - fast & free!)
GROQ_API_KEY=your-groq-api-key-here

# Or use Gemini (free tier available)
# GEMINI_API_KEY=your-gemini-api-key-here

# Or OpenAI
# OPENAI_API_KEY=your-openai-api-key-here
```

**Get API Keys:**
- **Groq** (Recommended - Fast & Free): https://console.groq.com/
- **Gemini** (Free Tier): https://aistudio.google.com/app/apikey
- **OpenAI** (Paid): https://platform.openai.com/api-keys

## Running Tests

### Run all tests
```bash
npm test
```

### Run with UI mode (interactive)
```bash
npm run test:ui
```

### Run in headed mode (see browser)
```bash
npm run test:headed
```

### Run with parallel execution (faster)
```bash
npm run test:parallel
```

### Debug mode
```bash
npm run test:debug
```

## Test Examples

### Basic Test (`tests/saucedemo.spec.ts`)

Simple login flow using natural language:

```typescript
import { test } from '@playwright/test';
import { vibe } from '@sdetsanjay/vibe-framework';
import dotenv from 'dotenv';

dotenv.config();

test('Login to SauceDemo', async ({ page }) => {
  const session = vibe()
    .withPage(page)
    .withMode('smart-cache')
    .withAIProvider('GROQ', process.env.GROQ_API_KEY!)
    .withReporting({ html: true, console: true })
    .build();

  await page.goto('https://www.saucedemo.com');

  await session.do('type "standard_user" into username field');
  await session.do('type "secret_sauce" into password field');
  await session.do('click the login button');

  const result = await session.check('verify products page loaded');
  console.log('Login successful:', result.success);

  await session.shutdown();
});
```

### Parallel Test Example

See `tests/parallel-test.spec.ts` for thread-safe parallel execution example.

### Multiple Providers Example

See `tests/groq-test.spec.ts` for using different AI providers.

## Project Structure

```
vibe-framework-demo/
├── tests/                    # Test files
│   ├── saucedemo.spec.ts    # Basic login flow
│   ├── parallel-test.spec.ts # Parallel execution demo
│   └── groq-test.spec.ts    # Groq provider example
├── playwright.config.ts      # Playwright configuration
├── .env.example             # Environment template
├── .env                     # Your API keys (gitignored)
├── package.json             # Dependencies
└── README.md                # This file
```

## Generated Artifacts

After running tests, you'll find:

- `playwright-report/` - Playwright HTML report
- `vibe-reports/` - Vibe Framework HTML reports
- `test-results/` - Test screenshots and traces
- `autoheal-cache/` - Cached selectors (smart-cache mode)
- `vibe-training/` - Training data (training mode)

## Features in Detail

### Smart Caching

Smart caching reduces AI calls by 95-99% by caching successful selectors:

```typescript
const session = vibe()
  .withMode('smart-cache')  // Cache selectors
  .build();
```

First run: Uses AI to find elements
Subsequent runs: Instant lookups from cache

### Training Mode

Record selectors once, replay in CI with **zero AI cost**:

```typescript
// Local: Record
const session = vibe()
  .startTraining('my-test-suite')
  .build();

await session.do('click login');
await session.stopTraining(); // Saves training data

// CI: Replay (no AI calls!)
const ciSession = vibe()
  .loadTrainingData('my-test-suite')
  .build();

await ciSession.do('click login'); // Instant!
```

### Parallel Testing

Vibe Framework is thread-safe:

```bash
# 2.5x-3.5x faster with 4 workers
npx playwright test --workers=4
```

File-based locking prevents cache race conditions.

### Video Recording

Automatically record and embed videos in reports:

```typescript
const session = vibe()
  .withVideo('retain-on-failure')
  .withReporting({
    html: true,
    includeVideos: true
  })
  .build();
```

## Supported AI Providers

| Provider | Speed | Cost | Free Tier | Setup |
|----------|-------|------|-----------|-------|
| **Groq** | ⚡⚡⚡⚡⚡ Fastest | Free | ✅ Generous | [console.groq.com](https://console.groq.com/) |
| **Gemini** | ⚡⚡⚡⚡ Very Fast | ~$0.03/100 cmds | ✅ Yes | [aistudio.google.com](https://aistudio.google.com/) |
| **OpenAI** | ⚡⚡⚡ Fast | ~$0.10/100 cmds | ❌ No | [platform.openai.com](https://platform.openai.com/) |
| **DeepSeek** | ⚡⚡⚡ Fast | ~$0.01/100 cmds | ✅ Yes | [platform.deepseek.com](https://platform.deepseek.com/) |
| **Anthropic** | ⚡⚡⚡ Fast | ~$0.30/100 cmds | ❌ No | [console.anthropic.com](https://console.anthropic.com/) |
| **Local** | Varies | Free | ✅ Unlimited | Self-hosted (Ollama, etc.) |

**Note:** With caching, subsequent runs cost $0 regardless of provider!

## Troubleshooting

### "Module not found" error
```bash
npm install
```

### API key issues
- Check `.env` file exists (copy from `.env.example`)
- Verify API key is correct
- Ensure no extra spaces in `.env` file

### Playwright browsers not installed
```bash
npx playwright install
```

### Tests timing out
- Increase timeout in `playwright.config.ts`
- Check internet connection
- Try a faster AI provider (Groq)

## Learn More

- [Vibe Framework Documentation](https://github.com/SanjayPG/vibe-framework)
- [Vibe Framework on npm](https://www.npmjs.com/package/@sdetsanjay/vibe-framework)
- [AutoHeal Locator on npm](https://www.npmjs.com/package/@sdetsanjay/autoheal-locator)
- [Playwright Documentation](https://playwright.dev/)

## Contributing

Found a bug or have a suggestion? Please [open an issue](https://github.com/SanjayPG/vibe-framework-demo/issues).

## License

MIT

## Author

Sanjay Gorai
