# 🎥 Video Recording Guide - Vibe Framework

Complete guide to configuring and using video recording in your Vibe Framework tests.

## 📋 Quick Start

Video recording is **now enabled by default** with the `retain-on-failure` mode. Videos are automatically embedded in your HTML reports!

### View Video in Reports
```bash
# Run a test
npm test tests/saucedemo.spec.ts

# View the report (videos are embedded)
npm run view-report
```

## 🎛️ Configuration Options

### Option 1: Environment Variables (Recommended)

Configure video settings in your `.env` file:

```bash
# Video recording mode
VIBE_VIDEO_MODE=retain-on-failure

# Video resolution
VIBE_VIDEO_WIDTH=1280
VIBE_VIDEO_HEIGHT=720

# Video output directory
VIBE_VIDEO_DIR=./vibe-reports/videos
```

### Option 2: vibe.config.js

Modify `vibe.config.js` to change default settings:

```javascript
module.exports = {
  video: {
    mode: 'retain-on-failure',  // Change this
    size: { width: 1280, height: 720 },
    dir: './vibe-reports/videos'
  }
};
```

### Option 3: Per-Test Configuration

Override settings in individual tests:

```typescript
const session = vibe()
  .withPage(page)
  .withVideo('on', {  // Always record
    size: { width: 1920, height: 1080 },
    dir: './custom-videos'
  })
  .build();
```

## 📹 Video Modes

### `retain-on-failure` (Recommended ⭐)
- Records all tests
- Keeps videos only for **failed tests**
- Saves disk space
- **Best for most use cases**

```bash
VIBE_VIDEO_MODE=retain-on-failure
```

### `on`
- Records and keeps **all test videos**
- Useful for demos and documentation
- Requires more disk space

```bash
VIBE_VIDEO_MODE=on
```

### `off`
- No video recording
- Fastest execution
- Use when videos aren't needed

```bash
VIBE_VIDEO_MODE=off
```

### `on-first-retry`
- Records only when a test is retried
- Useful for flaky test analysis
- Minimal overhead

```bash
VIBE_VIDEO_MODE=on-first-retry
```

## 🎬 Video Features in Reports

When viewing your HTML reports, videos include:

### Embedded Player
- Videos play directly in the report
- No need to download or open separately
- Embedded in each action that has video

### Controls
- **Play/Pause** - Standard video controls
- **Fullscreen** - Click the fullscreen button
- **Seek** - Scrub through the video timeline
- **Speed** - Adjust playback speed (browser default)

### Video in Action Timeline
Each action in the timeline can have:
```
Action: click the login button
├── Screenshot ✓ (click to enlarge)
├── Video ✓ (embedded player)
└── Latency: 472ms
```

## 📊 Video File Structure

```
vibe-reports/
├── videos/                        # Video files
│   └── video-{timestamp}.webm    # WebM format
├── index.html                     # Report (videos embedded)
└── report-{sessionId}.html        # Session report
```

## 🎯 Resolution Presets

### Standard (Default)
```bash
VIBE_VIDEO_WIDTH=1280
VIBE_VIDEO_HEIGHT=720
```

### HD
```bash
VIBE_VIDEO_WIDTH=1920
VIBE_VIDEO_HEIGHT=1080
```

### 4K (for demos)
```bash
VIBE_VIDEO_WIDTH=3840
VIBE_VIDEO_HEIGHT=2160
```

### Compact (save space)
```bash
VIBE_VIDEO_WIDTH=800
VIBE_VIDEO_HEIGHT=600
```

## 💡 Best Practices

### 1. Use `retain-on-failure` for Development
```bash
VIBE_VIDEO_MODE=retain-on-failure
```
- Captures failures automatically
- Doesn't fill disk with passing tests
- Easy debugging

### 2. Use `on` for Demos
```typescript
.withVideo('on', { size: { width: 1920, height: 1080 } })
```
- High-quality recordings
- Keep all test runs
- Great for presentations

### 3. Use `off` for CI/CD (Optional)
```bash
VIBE_VIDEO_MODE=off
```
- Faster execution
- Less storage needed
- Enable only when debugging CI issues

### 4. Optimize Resolution
```bash
# Development: Standard HD
VIBE_VIDEO_WIDTH=1280
VIBE_VIDEO_HEIGHT=720

# Demos: Full HD
VIBE_VIDEO_WIDTH=1920
VIBE_VIDEO_HEIGHT=1080
```

## 🔍 Troubleshooting

### Videos Not Showing in Reports?

**Check 1: Video mode is enabled**
```bash
# In .env file
VIBE_VIDEO_MODE=retain-on-failure  # or 'on'
```

**Check 2: includeVideos is enabled**
```bash
VIBE_INCLUDE_VIDEOS=true
```

**Check 3: Video files exist**
```bash
ls vibe-reports/videos/
```

**Check 4: Test failed (if using retain-on-failure)**
- Videos are only kept for failed tests in this mode
- Use `VIBE_VIDEO_MODE=on` to keep all videos

### Video Player Not Working?

**Issue: Browser doesn't support WebM**
- Solution: Use Chrome, Firefox, or Edge
- Safari may have limited support

**Issue: Video file path is wrong**
- Check the video directory setting
- Ensure relative paths are correct

### Large Video Files?

**Reduce resolution:**
```bash
VIBE_VIDEO_WIDTH=800
VIBE_VIDEO_HEIGHT=600
```

**Use retain-on-failure:**
```bash
VIBE_VIDEO_MODE=retain-on-failure
```

**Limit test duration:**
- Keep tests focused and short
- Break long tests into smaller ones

## 📝 Example Configurations

### Debug Mode (Keep Everything)
```bash
VIBE_VIDEO_MODE=on
VIBE_VIDEO_WIDTH=1920
VIBE_VIDEO_HEIGHT=1080
VIBE_INCLUDE_VIDEOS=true
```

### Production Mode (Failures Only)
```bash
VIBE_VIDEO_MODE=retain-on-failure
VIBE_VIDEO_WIDTH=1280
VIBE_VIDEO_HEIGHT=720
VIBE_INCLUDE_VIDEOS=true
```

### Performance Mode (No Videos)
```bash
VIBE_VIDEO_MODE=off
VIBE_INCLUDE_VIDEOS=false
```

### Demo Mode (High Quality)
```bash
VIBE_VIDEO_MODE=on
VIBE_VIDEO_WIDTH=1920
VIBE_VIDEO_HEIGHT=1080
VIBE_INCLUDE_VIDEOS=true
```

## 🎬 Advanced Usage

### Conditional Video Recording

```typescript
// Record video only in CI
const videoMode = process.env.CI ? 'on' : 'retain-on-failure';

const session = vibe()
  .withPage(page)
  .withVideo(videoMode)
  .build();
```

### Custom Video Directory per Test

```typescript
const session = vibe()
  .withPage(page)
  .withVideo('on', {
    dir: `./videos/${test.info().title}`
  })
  .build();
```

### Dynamic Resolution

```typescript
const isCI = process.env.CI === 'true';
const videoSize = isCI
  ? { width: 800, height: 600 }   // Smaller in CI
  : { width: 1920, height: 1080 }; // HD locally

const session = vibe()
  .withPage(page)
  .withVideo('on', { size: videoSize })
  .build();
```

## 📚 Video Format Details

- **Format**: WebM (VP8/VP9 codec)
- **Container**: WebM
- **Compatibility**: Chrome, Firefox, Edge, Opera
- **File Size**: ~2-5 MB per minute (depends on resolution)
- **Quality**: Good balance of size and clarity

## 🎯 Common Use Cases

### Use Case 1: Debugging Failures
```bash
VIBE_VIDEO_MODE=retain-on-failure
```
Automatically captures failed test videos for debugging.

### Use Case 2: Creating Documentation
```bash
VIBE_VIDEO_MODE=on
VIBE_VIDEO_WIDTH=1920
VIBE_VIDEO_HEIGHT=1080
```
High-quality recordings for tutorials and docs.

### Use Case 3: CI/CD Pipeline
```bash
VIBE_VIDEO_MODE=retain-on-failure
VIBE_VIDEO_WIDTH=1280
VIBE_VIDEO_HEIGHT=720
```
Balance between debugging capability and storage.

### Use Case 4: Local Development
```bash
VIBE_VIDEO_MODE=retain-on-failure
VIBE_VIDEO_WIDTH=1280
VIBE_VIDEO_HEIGHT=720
```
Quick feedback on failures without filling disk.

---

**Video recording is now fully integrated!** 🎉

Run your tests and check the beautiful reports with embedded videos:
```bash
npm test
npm run view-report
```
