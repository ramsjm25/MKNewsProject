export default async function handler(req, res) {
  try {
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

    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    console.log(`[Auth] Verify code request:`, req.body);

    const baseUrl = 'https://phpstack-1520234-5847937.cloudwaysapps.com/api/v1';
    const targetUrl = `${baseUrl}/auth/verify-code`;

    // Prepare headers
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'Vercel-Auth/1.0'
    };

    // Add authorization header if present
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization;
    }

    console.log(`[Auth] Making request to: ${targetUrl}`);
    console.log(`[Auth] Headers:`, headers);
    console.log(`[Auth] Body:`, req.body);

    // Make the request
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(req.body)
    });

    console.log(`[Auth] Response status: ${response.status}`);

    // Get response data
    const data = await response.json();
    console.log(`[Auth] Response data:`, data);

    // Return the response
    res.status(response.status).json(data);

  } catch (error) {
    console.error(`[Auth] Verify code error:`, error);
    console.error(`[Auth] Error stack:`, error.stack);
    
    // Return user-friendly error
    res.status(500).json({ 
      error: 'Service temporarily unavailable. Please try again later.',
      message: 'Service temporarily unavailable. Please try again later.',
      status: 0,
      type: 'SERVICE_UNAVAILABLE',
      timestamp: new Date().toISOString()
    });
  }
}
