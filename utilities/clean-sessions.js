#!/usr/bin/env node

/**
 * Clean Session Files Script
 *
 * Removes old vibe session JSON files from vibe-reports directory
 * Usage: node clean-sessions.js
 */

const fs = require('fs');
const path = require('path');

const reportsDir = './vibe-reports';

console.log('🧹 Cleaning old session files...\n');

if (!fs.existsSync(reportsDir)) {
  console.log('   Reports directory not found. Nothing to clean.\n');
  process.exit(0);
}

const files = fs.readdirSync(reportsDir);

// Categorize all artifact types
const sessionFiles = files.filter(f => f.startsWith('session-') && f.endsWith('.json'));
const reportFiles = files.filter(f => f.startsWith('report-') && f.endsWith('.html'));
const csvActionFiles = files.filter(f => f.startsWith('actions-') && f.endsWith('.csv'));
const csvSummaryFiles = files.filter(f => f.startsWith('summary-') && f.endsWith('.csv'));

// Static reports to remove
const staticReports = ['index.html', 'unified-report.html', 'consolidated-report.html'];
const existingStaticReports = staticReports.filter(f => files.includes(f));

// Combine all files to delete
const allFilesToDelete = [
  ...sessionFiles,
  ...reportFiles,
  ...csvActionFiles,
  ...csvSummaryFiles,
  ...existingStaticReports
];

if (allFilesToDelete.length === 0) {
  console.log('   No artifacts found. Already clean!\n');
  process.exit(0);
}

// Delete with categorized reporting
const categories = {
  'session files': sessionFiles.length,
  'HTML reports': reportFiles.length + existingStaticReports.length,
  'CSV exports': csvActionFiles.length + csvSummaryFiles.length
};

allFilesToDelete.forEach(file => {
  const filePath = path.join(reportsDir, file);
  fs.unlinkSync(filePath);
});

// Show summary by category
Object.entries(categories).forEach(([name, count]) => {
  if (count > 0) {
    console.log(`   ✓ Removed ${count} ${name}`);
  }
});

console.log(`\n✅ Cleaned ${allFilesToDelete.length} file(s) total\n`);
