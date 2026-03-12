#!/usr/bin/env node

/**
 * Vibe Framework Report Viewer
 *
 * Simple script to open the latest Vibe test report in your default browser
 */

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const REPORTS_DIR = './vibe-reports';
const INDEX_FILE = path.join(REPORTS_DIR, 'index.html');

// Check if reports directory exists
if (!fs.existsSync(REPORTS_DIR)) {
  console.log('❌ No reports found. Run tests first to generate reports.');
  console.log('   Example: npm test');
  process.exit(1);
}

// Check if index.html exists
if (!fs.existsSync(INDEX_FILE)) {
  console.log('❌ No report found at:', INDEX_FILE);
  console.log('   Run tests first to generate reports.');
  process.exit(1);
}

// Get absolute path
const absolutePath = path.resolve(INDEX_FILE);

// Open the report in default browser
const openCommand = process.platform === 'win32'
  ? `start "" "${absolutePath}"`
  : process.platform === 'darwin'
  ? `open "${absolutePath}"`
  : `xdg-open "${absolutePath}"`;

console.log('📊 Opening Vibe Test Report...');
console.log(`   ${absolutePath}`);

exec(openCommand, (error) => {
  if (error) {
    console.error('❌ Failed to open report:', error.message);
    console.log('   You can manually open:', absolutePath);
    process.exit(1);
  }

  console.log('✅ Report opened in your default browser!');

  // List other available reports
  const files = fs.readdirSync(REPORTS_DIR);
  const htmlReports = files.filter(f => f.endsWith('.html') && f !== 'index.html');

  if (htmlReports.length > 0) {
    console.log('\n📁 Other available reports:');
    htmlReports.forEach(file => {
      console.log(`   - ${file}`);
    });
  }

  // Show JSON and CSV files
  const jsonFiles = files.filter(f => f.endsWith('.json'));
  const csvFiles = files.filter(f => f.endsWith('.csv'));

  if (jsonFiles.length > 0 || csvFiles.length > 0) {
    console.log('\n📄 Export files:');
    jsonFiles.forEach(file => console.log(`   - ${file} (JSON)`));
    csvFiles.forEach(file => console.log(`   - ${file} (CSV)`));
  }
});
