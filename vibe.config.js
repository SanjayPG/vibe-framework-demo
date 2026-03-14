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
    apiKey: (() => {
      const provider = process.env.VIBE_AI_PROVIDER || 'GROQ';
      if (provider === 'GEMINI') return process.env.GEMINI_API_KEY;
      if (provider === 'OPENAI') return process.env.OPENAI_API_KEY;
      if (provider === 'GROQ') return process.env.GROQ_API_KEY;
      if (provider === 'ANTHROPIC') return process.env.ANTHROPIC_API_KEY;
      if (provider === 'DEEPSEEK') return process.env.DEEPSEEK_API_KEY;
      // Fallback to any available key
      return process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
    })(),

    // Optional: Custom model for cloud providers (overrides defaults)
    // Examples: llama-3.3-70b-versatile, gemini-2.0-flash-exp, gpt-4o, deepseek-chat
    model: process.env.VIBE_AI_MODEL,

    // Local model configuration (used when VIBE_AI_PROVIDER=LOCAL)
    baseUrl: process.env.LOCAL_MODEL_URL,
    apiPath: process.env.LOCAL_MODEL_API_PATH,
    localModel: process.env.LOCAL_MODEL_NAME,
    format: process.env.LOCAL_MODEL_FORMAT,
    temperature: parseFloat(process.env.LOCAL_MODEL_TEMPERATURE || '0.1'),
    maxTokens: parseInt(process.env.LOCAL_MODEL_MAX_TOKENS || '2048')
  },

  // Cache Mode
  mode: process.env.VIBE_MODE || 'smart-cache'
};
