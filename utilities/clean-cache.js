#!/usr/bin/env node

/**
 * Clean Cache Script
 *
 * Removes autoheal-cache directory containing:
 * - Cached locators
 * - AI parsing results
 *
 * Use this when you want to force fresh locator detection and AI parsing
 * Usage: node clean-cache.js
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 Cleaning autoheal cache...\n');

const cacheDir = 'autoheal-cache';
const cachePath = path.join(process.cwd(), cacheDir);

// Function to recursively delete directory
function deleteDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return 0;
  }

  let filesDeleted = 0;
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      filesDeleted += deleteDirectory(filePath);
      fs.rmdirSync(filePath);
    } else {
      fs.unlinkSync(filePath);
      filesDeleted++;
    }
  });

  return filesDeleted;
}

if (fs.existsSync(cachePath)) {
  const filesDeleted = deleteDirectory(cachePath);
  console.log(`   ✓ Cleared autoheal-cache/ (${filesDeleted} cached file(s))`);
  console.log('\n✅ Cache cleared! Next test run will generate fresh locators and AI parses\n');
} else {
  console.log('   ○ autoheal-cache/ not found (already clean)\n');
}
