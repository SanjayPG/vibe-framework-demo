/**
 * Vibe Test Helpers
 *
 * Helper functions to load Vibe configuration from vibe.config.js
 */

import * as path from 'path';
import * as fs from 'fs';

// Load vibe.config.js
const configPath = path.join(process.cwd(), 'vibe.config.js');
let vibeConfig: any = {};

if (fs.existsSync(configPath)) {
  vibeConfig = require(configPath);
}

/**
 * Get video mode from config
 */
export function getVideoMode(): 'off' | 'on' | 'retain-on-failure' | 'on-first-retry' {
  return vibeConfig.video?.mode || 'retain-on-failure';
}

/**
 * Get video configuration
 */
export function getVideoConfig() {
  return vibeConfig.video || {
    mode: 'retain-on-failure',
    size: { width: 1280, height: 720 },
    dir: './vibe-reports/videos'
  };
}

/**
 * Get reporting configuration
 */
export function getReportingConfig() {
  return vibeConfig.reporting || {
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
  return vibeConfig.ai || {
    provider: 'GROQ',
    apiKey: process.env.GROQ_API_KEY
  };
}

/**
 * Get Vibe mode
 */
export function getVibeMode(): 'pure-ai' | 'smart-cache' | 'training' | 'trained' {
  return vibeConfig.mode || 'smart-cache';
}

