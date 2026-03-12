/**
 * Vibe Framework Configuration
 *
 * Centralized configuration for video recording, reporting, and other Vibe settings.
 * Can be overridden by environment variables.
 */

module.exports = {
  // Video Recording Configuration
  video: {
    // Mode: 'off' | 'on' | 'retain-on-failure' | 'on-first-retry'
    mode: process.env.VIBE_VIDEO_MODE || 'retain-on-failure',

    // Video size (resolution)
    size: {
      width: parseInt(process.env.VIBE_VIDEO_WIDTH) || 1280,
      height: parseInt(process.env.VIBE_VIDEO_HEIGHT) || 720
    },

    // Video output directory
    dir: process.env.VIBE_VIDEO_DIR || './vibe-reports/videos'
  },

  // Reporting Configuration
  reporting: {
    html: process.env.VIBE_HTML_REPORT !== 'false',  // default: true
    json: process.env.VIBE_JSON_REPORT !== 'false',  // default: true
    csv: process.env.VIBE_CSV_REPORT !== 'false',    // default: true
    console: process.env.VIBE_CONSOLE_REPORT !== 'false', // default: true
    includeScreenshots: process.env.VIBE_SCREENSHOTS !== 'false', // default: true
    includeVideos: process.env.VIBE_INCLUDE_VIDEOS !== 'false',  // default: true
    outputDir: process.env.VIBE_OUTPUT_DIR || './vibe-reports'
  },

  // AI Provider Configuration
  ai: {
    provider: process.env.VIBE_AI_PROVIDER || 'GROQ',
    apiKey: process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY
  },

  // Cache Mode
  mode: process.env.VIBE_MODE || 'smart-cache'
};
