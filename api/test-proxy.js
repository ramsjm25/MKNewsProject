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

  try {
    console.log(`[TestProxy] Testing proxy functionality`);
    
    // Test the proxy by making a request to it
    const baseUrl = 'https://phpstack-1520234-5847937.cloudwaysapps.com/api/v1';
    
    // Test languages endpoint
    const testUrl = `${baseUrl}/news/languages`;
    console.log(`[TestProxy] Testing backend connection: ${testUrl}`);
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Vercel-Test/1.0'
      }
    });
    
    const data = await response.json();
    console.log(`[TestProxy] Backend response:`, {
      status: response.status,
      data: data
    });
    
    res.status(200).json({
      message: 'Proxy test completed',
      backendUrl: testUrl,
      backendResponse: {
        status: response.status,
        data: data
      },
      proxyWorking: response.status === 200,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`[TestProxy] Error:`, error);
    res.status(500).json({ 
      error: 'Proxy test failed', 
      details: error.message,
      stack: error.stack
    });
  }
}
