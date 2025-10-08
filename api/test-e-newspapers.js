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
  const targetUrl = `${baseUrl}/e-newspapers`;
  
  try {
    console.log(`[TestENewspapers] Testing e-newspapers endpoint`);
    
    // Test with sample parameters
    const testParams = new URLSearchParams({
      page: '1',
      limit: '10',
      language_id: '5dd95034-d533-4b09-8687-cd2ed3682ab6',
      dateFrom: '2025-10-01',
      dateTo: '2025-10-08',
      type: 'paper'
    });
    
    const testUrl = `${targetUrl}?${testParams.toString()}`;
    console.log(`[TestENewspapers] Testing URL: ${testUrl}`);
    
    // Test without authentication first
    console.log(`[TestENewspapers] Testing without authentication`);
    let response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Vercel-Test/1.0'
      }
    });
    
    const data = await response.json();
    console.log(`[TestENewspapers] Response without auth:`, {
      status: response.status,
      data: data
    });
    
    // Test with different headers
    if (response.status === 401) {
      console.log(`[TestENewspapers] 401 received, testing with different headers`);
      
      response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Vercel-Test/1.0',
          'Content-Type': 'application/json'
        }
      });
      
      const data2 = await response.json();
      console.log(`[TestENewspapers] Response with content-type:`, {
        status: response.status,
        data: data2
      });
    }
    
    res.status(200).json({
      message: 'E-newspapers test completed',
      testUrl: testUrl,
      results: {
        withoutAuth: {
          status: response.status,
          data: data
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`[TestENewspapers] Error:`, error);
    res.status(500).json({ 
      error: 'E-newspapers test failed', 
      details: error.message 
    });
  }
}
