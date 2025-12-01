// Test script to verify backend connectivity
const http = require('http');

const testEndpoint = (url, description) => {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log(`\n✅ ${description}`);
        console.log(`Status: ${res.statusCode}`);
        try {
          const parsed = JSON.parse(data);
          console.log('Response:', JSON.stringify(parsed, null, 2));
        } catch (e) {
          console.log('Response:', data);
        }
        resolve(true);
      });
    }).on('error', (err) => {
      console.log(`\n❌ ${description}`);
      console.log(`Error Code: ${err.code}`);
      console.log(`Error: ${err.message}`);
      console.log(`Full Error:`, err);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log(`\n⏱️ ${description} - Timeout after 5s`);
      req.destroy();
      resolve(false);
    });
  });
};

async function runTests() {
  console.log('🧪 Testing Backend Connectivity...\n');
  console.log('Backend URL: http://localhost:8080');
  console.log('API Base: http://localhost:8080/api\n');
  console.log('='.repeat(50));
  
  await testEndpoint('http://localhost:8080/api/health', 'Health Check');
  
  console.log('\n' + '='.repeat(50));
  console.log('\n✨ All tests completed!\n');
}

runTests();
