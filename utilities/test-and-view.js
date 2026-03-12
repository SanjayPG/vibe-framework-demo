#!/usr/bin/env node

/**
 * Test and View Reports Script
 *
 * Runs Playwright tests and then automatically opens the Vibe comprehensive report
 * Usage: node test-and-view.js [playwright test arguments...]
 */

const { spawn, spawnSync, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get all arguments passed to this script (after node and script name)
const testArgs = process.argv.slice(2);

// If no arguments provided, default to running only saucedemo.spec.ts (the working test file)
// This avoids running saucedemo-original.spec.ts which requires LOCAL model configuration
const finalArgs = testArgs.length > 0 ? testArgs : ['tests/saucedemo.spec.ts'];

// Clean old artifacts using centralized cleanup script
const cleanScript = path.join(__dirname, 'clean-sessions.js');
const cleanProcess = spawnSync('node', [cleanScript], { stdio: 'inherit' });
if (cleanProcess.status !== 0) {
  console.warn('⚠️  Cleanup had issues but continuing with tests...\n');
}

// Build the playwright test command
const playwrightCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const playwrightArgs = ['playwright', 'test', ...finalArgs];

console.log('🧪 Running tests...');
console.log(`   Command: npx ${playwrightArgs.slice(1).join(' ')}\n`);

// Run playwright tests
const testProcess = spawn(playwrightCmd, playwrightArgs, {
  stdio: 'inherit',
  shell: true
});

testProcess.on('close', (code) => {
  console.log('\n📊 Generating unified interactive report...\n');

  // Generate unified report with session selector
  const unifiedScript = path.join(__dirname, 'generate-unified-report.js');
  exec(`node "${unifiedScript}"`, (error, stdout, stderr) => {
    if (error) {
      console.log('ℹ️  Could not generate unified report (this is OK if only one test ran)');
      console.log('   Opening individual session report instead...\n');

      // Fall back to individual report
      const viewReportsScript = path.join(__dirname, 'view-reports.js');
      exec(`node "${viewReportsScript}"`, (viewError, viewStdout) => {
        if (viewError) {
          console.error('❌ Failed to open report:', viewError.message);
          process.exit(1);
        }
        console.log(viewStdout);
        process.exit(code);
      });
      return;
    }

    console.log(stdout);

    // Open the unified report
    const unifiedReportPath = path.resolve('./vibe-reports/unified-report.html');
    const openCommand = process.platform === 'win32'
      ? `start "" "${unifiedReportPath}"`
      : process.platform === 'darwin'
      ? `open "${unifiedReportPath}"`
      : `xdg-open "${unifiedReportPath}"`;

    console.log('🌐 Opening unified report in browser...\n');

    exec(openCommand, (openError) => {
      if (openError) {
        console.error('❌ Failed to open unified report:', openError.message);
        console.log('   You can manually open:', unifiedReportPath);
      } else {
        console.log('✅ Unified report opened!\n');
        console.log('📌 This interactive report shows ALL test sessions with session selector.\n');
      }

      // Exit with the test process exit code
      process.exit(code);
    });
  });
});

testProcess.on('error', (error) => {
  console.error('❌ Failed to run tests:', error.message);
  process.exit(1);
});
