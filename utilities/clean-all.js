#!/usr/bin/env node

/**
 * Clean All Reports Script
 *
 * Removes all test reports and artifacts:
 * - vibe-reports (session files, HTML reports, CSV exports)
 * - playwright-report (Playwright HTML reports)
 * - test-results (Playwright test artifacts)
 *
 * Usage: node clean-all.js
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 Cleaning all test reports and artifacts...\n');

const dirsToClean = ['vibe-reports', 'playwright-report', 'test-results'];
let totalFilesDeleted = 0;
let totalDirsDeleted = 0;

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

// Clean each directory
dirsToClean.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);

  if (fs.existsSync(dirPath)) {
    const filesDeleted = deleteDirectory(dirPath);

    if (filesDeleted > 0) {
      console.log(`   ✓ Cleaned ${dir}/ (${filesDeleted} file(s))`);
      totalFilesDeleted += filesDeleted;
      totalDirsDeleted++;
    } else {
      console.log(`   ○ ${dir}/ was already empty`);
    }
  } else {
    console.log(`   ○ ${dir}/ not found (nothing to clean)`);
  }
});

console.log(`\n✅ Cleaned ${totalDirsDeleted} director(y/ies), removed ${totalFilesDeleted} file(s) total\n`);
