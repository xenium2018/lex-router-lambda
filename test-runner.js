const { handler } = require('./index');
const testEvents = require('./__tests__/test-data');

async function runTests() {
  console.log('🧪 Running manual tests...\n');

  const tests = [
    { name: 'Booking Intent', event: testEvents.bookingIntent },
    { name: 'Status Intent', event: testEvents.statusIntent },
    { name: 'Incomplete Booking', event: testEvents.incompleteBooking },
    { name: 'Unknown Intent', event: testEvents.unknownIntent }
  ];

  for (const test of tests) {
    console.log(`📋 Testing: ${test.name}`);
    try {
      const result = await handler(test.event);
      console.log('✅ Result:', JSON.stringify(result, null, 2));
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
    console.log('─'.repeat(50));
  }
}

if (require.main === module) {
  runTests();
}

module.exports = { runTests };