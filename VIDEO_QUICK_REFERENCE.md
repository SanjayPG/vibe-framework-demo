# 🎥 Video Recording - Quick Reference

## One-Line Configuration

Change video mode in `.env`:
```bash
VIBE_VIDEO_MODE=on  # Always record & keep
VIBE_VIDEO_MODE=retain-on-failure  # Keep only failures (default)
VIBE_VIDEO_MODE=off  # No recording
VIBE_VIDEO_MODE=on-first-retry  # Record on retry only
```

## Quick Commands

```bash
# Run test with videos
npm test

# View report (videos embedded)
npm run view-report

# Run with video override
VIBE_VIDEO_MODE=on npm test

# HD videos
VIBE_VIDEO_WIDTH=1920 VIBE_VIDEO_HEIGHT=1080 npm test
```

## Video Locations

- **Configuration**: `.env` or `vibe.config.js`
- **Videos**: `vibe-reports/videos/`
- **Reports**: `vibe-reports/index.html` (videos embedded)

## Common Scenarios

**Debugging Failures:**
```bash
VIBE_VIDEO_MODE=retain-on-failure  # (default)
```

**Creating Demos:**
```bash
VIBE_VIDEO_MODE=on
VIBE_VIDEO_WIDTH=1920
VIBE_VIDEO_HEIGHT=1080
```

**Fastest Tests:**
```bash
VIBE_VIDEO_MODE=off
```

---

For complete guide, see **VIDEO_GUIDE.md**
