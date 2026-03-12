#!/usr/bin/env node

/**
 * Generate Consolidated Vibe Report
 *
 * Merges all individual session reports into one comprehensive report
 * showing ALL tests across all sessions
 */

const path = require('path');

// Import from local vibe-framework
const vibeFrameworkPath = path.join(__dirname, '..', 'vibe-framework', 'dist', 'reporting', 'ConsolidatedReporter.js');
const { generateConsolidatedReport } = require(vibeFrameworkPath);

const outputDir = path.join(__dirname, 'vibe-reports');

console.log('\n📊 Generating consolidated report from all sessions...\n');

generateConsolidatedReport(outputDir)
  .then(reportPath => {
    console.log(`✅ Success! Consolidated report created at:`);
    console.log(`   ${reportPath}\n`);
    console.log(`📌 This report combines ALL test sessions into one view.\n`);
  })
  .catch(error => {
    console.error('❌ Failed to generate consolidated report:', error.message);
    if (error.message.includes('No session files found')) {
      console.log('\n💡 Tip: Run tests first to generate session data:');
      console.log('   npm test\n');
    }
    process.exit(1);
  });
