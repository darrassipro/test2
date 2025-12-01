// Simple test script to verify API integration
const API_BASE_URL = 'http://localhost:3000/api';

async function testAPI() {
  console.log('Testing API integration...\n');

  // Test admin authentication
  console.log('1. Testing admin authentication...');
  try {
    const authResponse = await fetch(`${API_BASE_URL}/auth/admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });
    
    const authData = await authResponse.json();
    console.log('Auth response:', authData);
    
    if (authData.success && authData.data?.token) {
      const token = authData.data.token;
      console.log('✅ Authentication successful\n');
      
      // Test dashboard API
      console.log('2. Testing dashboard API...');
      const dashboardResponse = await fetch(`${API_BASE_URL}/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      const dashboardData = await dashboardResponse.json();
      console.log('Dashboard response:', dashboardData);
      console.log(dashboardData.success ? '✅ Dashboard API working' : '❌ Dashboard API failed');
      
      // Test users API
      console.log('\n3. Testing users API...');
      const usersResponse = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      const usersData = await usersResponse.json();
      console.log('Users response:', usersData);
      console.log(usersData.success ? '✅ Users API working' : '❌ Users API failed');
      
      // Test communities API
      console.log('\n4. Testing communities API...');
      const communitiesResponse = await fetch(`${API_BASE_URL}/admin/communities`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      const communitiesData = await communitiesResponse.json();
      console.log('Communities response:', communitiesData);
      console.log(communitiesData.success ? '✅ Communities API working' : '❌ Communities API failed');
      
    } else {
      console.log('❌ Authentication failed');
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

// Run the test
testAPI();