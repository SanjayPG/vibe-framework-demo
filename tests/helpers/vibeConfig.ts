/**
 * Vibe Test Helpers
 *
 * Helper functions to load Vibe configuration from vibe.config.js
 */

import * as path from 'path';
import * as fs from 'fs';

// Load vibe.config.js lazily to ensure dotenv is loaded first
let vibeConfig: any = null;

function getConfig() {
  if (vibeConfig === null) {
    const configPath = path.join(process.cwd(), 'vibe.config.js');
    vibeConfig = {};
    if (fs.existsSync(configPath)) {
      // Clear require cache to get fresh config with loaded env vars
      delete require.cache[require.resolve(configPath)];
      vibeConfig = require(configPath);
    }
  }
  return vibeConfig;
}

/**
 * Get video mode from config
 */
export function getVideoMode(): 'off' | 'on' | 'retain-on-failure' | 'on-first-retry' {
  return getConfig().video?.mode || 'retain-on-failure';
}

/**
 * Get video configuration
 */
export function getVideoConfig() {
  return getConfig().video || {
    mode: 'retain-on-failure',
    size: { width: 1280, height: 720 },
    dir: './vibe-reports/videos'
  };
}

/**
 * Get reporting configuration
 */
export function getReportingConfig() {
  return getConfig().reporting || {
    html: true,
    json: true,
    csv: true,
    console: true,
    includeScreenshots: true,
    includeVideos: true,
    outputDir: './vibe-reports'
  };
}

/**
 * Get AI configuration
 */
export function getAIConfig() {
  const config = getConfig().ai || {
    provider: 'GROQ',
    apiKey: process.env.GROQ_API_KEY
  };

  // For LOCAL provider, ensure we have the full config
  if (config.provider === 'LOCAL') {
    return {
      provider: 'LOCAL',
      baseUrl: config.baseUrl || process.env.LOCAL_MODEL_URL,
      apiPath: config.apiPath || process.env.LOCAL_MODEL_API_PATH,
      model: config.model || process.env.LOCAL_MODEL_NAME,
      format: config.format || process.env.LOCAL_MODEL_FORMAT,
      temperature: config.temperature ?? parseFloat(process.env.LOCAL_MODEL_TEMPERATURE || '0.1'),
      maxTokens: config.maxTokens ?? parseInt(process.env.LOCAL_MODEL_MAX_TOKENS || '2048')
    };
  }

  return config;
}

/**
 * Get Vibe mode
 */
export function getVibeMode(): 'pure-ai' | 'smart-cache' | 'training' | 'trained' {
  return getConfig().mode || 'smart-cache';
}

/**
 * Configure AI provider on a session builder
 * Handles both cloud providers and local models correctly
 */
export function configureAI(sessionBuilder: any) {
  const aiConfig = getAIConfig();

  if (aiConfig.provider === 'LOCAL') {
    return sessionBuilder.withLocalModel(aiConfig.baseUrl, {
      apiPath: aiConfig.apiPath,
      model: aiConfig.model,
      format: aiConfig.format,
      temperature: aiConfig.temperature,
      maxTokens: aiConfig.maxTokens
    });
  } else {
    const { AIProvider } = require('@sdetsanjay/vibe-framework');
    return sessionBuilder.withAIProvider(
      AIProvider[aiConfig.provider as keyof typeof AIProvider],
      aiConfig.apiKey
    );
  }
}

