import { systemHealthSummary } from './dist/tools/systemHealthSummary.js';

async function testHealthSummary() {
  try {
    console.log('Testing system health summary...');
    const result = await systemHealthSummary({});
    console.log('Success! Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testHealthSummary();

// Made with Bob
