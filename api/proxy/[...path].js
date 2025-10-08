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

    console.log(`[Proxy] ${req.method} ${req.url}`);

    // Health check
    if (req.url === '/api/health' || req.url === '/api/proxy/health') {
      res.status(200).json({ 
        status: 'ok', 
        message: 'Proxy is working',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const baseUrl = 'https://phpstack-1520234-5847937.cloudwaysapps.com/api/v1';
    
    // Extract path from URL
    let path = req.url;
    if (path.startsWith('/api/proxy/')) {
      path = path.replace('/api/proxy', '');
    } else if (path.startsWith('/api/')) {
      path = path.replace('/api', '');
    }
    
    // Build target URL
    const targetUrl = `${baseUrl}${path}`;
    console.log(`[Proxy] Target URL: ${targetUrl}`);

    // Prepare headers
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'Vercel-Proxy/1.0'
    };

    // Add authorization header if present
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization;
    }

    // Prepare body for POST/PUT requests
    let body;
    if (req.method !== 'GET' && req.body) {
      body = JSON.stringify(req.body);
    }

    console.log(`[Proxy] Making request to: ${targetUrl}`);
    console.log(`[Proxy] Method: ${req.method}`);
    console.log(`[Proxy] Headers:`, headers);

    // Make the request
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: body
    });

    console.log(`[Proxy] Response status: ${response.status}`);

    // Get response data
    const data = await response.json();
    console.log(`[Proxy] Response data:`, data);

    // Return the response
    res.status(response.status).json(data);

  } catch (error) {
    console.error(`[Proxy] Error:`, error);
    console.error(`[Proxy] Error stack:`, error.stack);
    
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