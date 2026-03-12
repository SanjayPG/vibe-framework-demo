const path = require('path');
const fs = require('fs');

// Import UnifiedReporter from vibe-framework
const vibeFrameworkPath = path.join(__dirname, '..', 'vibe-framework', 'dist', 'reporting', 'UnifiedReporter.js');

// Check if compiled version exists
if (!fs.existsSync(vibeFrameworkPath)) {
  console.error('❌ UnifiedReporter not found. Please compile vibe-framework first:');
  console.error('   cd ../vibe-framework && npm run build');
  process.exit(1);
}

const { UnifiedReporter } = require(vibeFrameworkPath);

console.log('📊 Generating unified interactive report...\n');

const reporter = new UnifiedReporter('./vibe-reports');

reporter.generateUnifiedReport()
  .then(reportPath => {
    console.log(`✅ Unified report created: ${reportPath}`);
    console.log('');
    console.log('📖 Open the report in your browser to view all test sessions');
    console.log('   - Use tabs to switch between sessions');
    console.log('   - Videos are embedded at the end of each test');
    console.log('   - Click action items to expand details\n');
  })
  .catch(error => {
    console.error('❌ Failed to generate unified report:', error.message);
    process.exit(1);
  });
