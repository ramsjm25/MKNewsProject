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
  const targetUrl = `${baseUrl}/news/filter-advanced`;
  
  try {
    console.log(`[TestNewsFilter] Testing news/filter-advanced endpoint`);
    
    // Test with sample parameters (GET request)
    const testParams = new URLSearchParams({
      language_id: '5dd95034-d533-4b09-8687-cd2ed3682ab6',
      categoryId: '40c4b7ab-c38a-4cdc-9d97-6db86ec6d598',
      state_id: 'b6be8d5c-f276-4d63-b878-6fc765180ccf',
      district_id: 'e197a31c-b290-473f-b014-6c708f53b3fe',
      page: '1'
    });
    
    const testUrl = `${targetUrl}?${testParams.toString()}`;
    console.log(`[TestNewsFilter] Testing GET URL: ${testUrl}`);
    
    // Test GET request first
    let response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Vercel-Test/1.0'
      }
    });
    
    const getData = await response.json();
    console.log(`[TestNewsFilter] GET Response:`, {
      status: response.status,
      data: getData
    });
    
    // Test POST request with JSON body
    const postPayload = {
      language_id: '5dd95034-d533-4b09-8687-cd2ed3682ab6',
      category_id: '40c4b7ab-c38a-4cdc-9d97-6db86ec6d598',
      state_id: 'b6be8d5c-f276-4d63-b878-6fc765180ccf',
      district_id: 'e197a31c-b290-473f-b014-6c708f53b3fe',
      page: 1
    };
    
    console.log(`[TestNewsFilter] Testing POST with payload:`, postPayload);
    
    response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Vercel-Test/1.0'
      },
      body: JSON.stringify(postPayload)
    });
    
    const postData = await response.json();
    console.log(`[TestNewsFilter] POST Response:`, {
      status: response.status,
      data: postData
    });
    
    res.status(200).json({
      message: 'News filter test completed',
      testUrl: testUrl,
      results: {
        get: {
          status: response.status,
          data: getData
        },
        post: {
          status: response.status,
          data: postData
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`[TestNewsFilter] Error:`, error);
    res.status(500).json({ 
      error: 'News filter test failed', 
      details: error.message 
    });
  }
}
