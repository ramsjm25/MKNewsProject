export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const baseUrl = 'https://phpstack-1520234-5847937.cloudwaysapps.com/api/v1';
  
  try {
    console.log(`[TestBackend] Testing backend connectivity`);
    
    // Test 1: Check if backend is reachable
    const healthResponse = await fetch(`${baseUrl}/news/languages`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log(`[TestBackend] Health check response: ${healthResponse.status}`);
    
    // Test 2: Test auth endpoint with sample data
    const testAuthPayload = {
      emailOrPhone: 'test@example.com',
      password: 'testpassword'
    };
    
    console.log(`[TestBackend] Testing auth endpoint with:`, testAuthPayload);
    
    const authResponse = await fetch(`${baseUrl}/auth/userLogin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(testAuthPayload)
    });
    
    const authData = await authResponse.json();
    console.log(`[TestBackend] Auth test response: ${authResponse.status}`, authData);
    
    res.status(200).json({
      message: 'Backend test completed',
      healthCheck: {
        status: healthResponse.status,
        url: `${baseUrl}/news/languages`
      },
      authTest: {
        status: authResponse.status,
        url: `${baseUrl}/auth/userLogin`,
        response: authData
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`[TestBackend] Error:`, error);
    res.status(500).json({ 
      error: 'Backend test failed', 
      details: error.message 
    });
  }
}
