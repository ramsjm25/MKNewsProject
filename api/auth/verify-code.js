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

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const baseUrl = 'https://phpstack-1520234-5847937.cloudwaysapps.com/api/v1';
  const targetUrl = `${baseUrl}/auth/verify-code`;

  try {
    console.log(`[Auth] Verify code request body:`, JSON.stringify(req.body, null, 2));
    console.log(`[Auth] Verify code request headers:`, req.headers);
    
    // Validate required fields before sending
    const { email, code } = req.body;
    
    console.log(`[Auth] Extracted fields:`, {
      email: email,
      code: code,
      emailType: typeof email,
      codeType: typeof code
    });
    
    if (!email || !code) {
      console.log(`[Auth] Missing required fields:`, {
        email: !!email,
        code: !!code
      });
      
      res.status(400).json({
        error: 'Missing required fields',
        details: {
          email: !email ? 'email is required' : null,
          code: !code ? 'code is required' : null
        }
      });
      return;
    }
    
    // Create a clean payload to send to backend
    const backendPayload = {
      email: email.trim(),
      code: code.trim()
    };
    
    console.log(`[Auth] Sending to backend:`, {
      email: backendPayload.email,
      code: backendPayload.code
    });
    
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Vercel-Proxy/1.0'
      },
      body: JSON.stringify(backendPayload)
    });

    const data = await response.json();
    console.log(`[Auth] Verify code response: ${response.status}`);
    console.log(`[Auth] Backend response data:`, JSON.stringify(data, null, 2));
    
    if (response.status !== 200) {
      console.log(`[Auth] Backend error response:`, {
        status: response.status,
        data: data
      });
    }
    
    res.status(response.status).json(data);
  } catch (error) {
    console.error(`[Auth] Verify code error:`, error);
    res.status(500).json({ 
      error: 'Verify code request failed', 
      details: error.message 
    });
  }
}
