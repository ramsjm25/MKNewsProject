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
  const targetUrl = `${baseUrl}/auth/userLogin`;

  try {
    console.log(`[Auth] UserLogin request body:`, JSON.stringify(req.body, null, 2));
    console.log(`[Auth] UserLogin request headers:`, req.headers);
    console.log(`[Auth] Raw request body type:`, typeof req.body);
    console.log(`[Auth] Raw request body keys:`, Object.keys(req.body || {}));
    
    // Validate required fields
    const { emailOrPhone, password } = req.body;
    
    console.log(`[Auth] Extracted fields:`, {
      emailOrPhone: emailOrPhone,
      password: password ? '[REDACTED]' : password,
      emailOrPhoneType: typeof emailOrPhone,
      passwordType: typeof password
    });
    
    if (!emailOrPhone || !password) {
      console.log(`[Auth] Missing required fields:`, {
        emailOrPhone: !!emailOrPhone,
        password: !!password,
        emailOrPhoneValue: emailOrPhone,
        passwordValue: password ? '[REDACTED]' : password
      });
      
      res.status(400).json({
        error: 'Missing required fields',
        details: {
          emailOrPhone: !emailOrPhone ? 'emailOrPhone is required' : null,
          password: !password ? 'password is required' : null
        }
      });
      return;
    }
    
    // Create a clean payload to send to backend
    // Backend only wants emailOrPhone, not email field
    const backendPayload = {
      emailOrPhone: emailOrPhone.trim(),
      password: password
    };
    
    console.log(`[Auth] Sending to backend:`, {
      emailOrPhone: backendPayload.emailOrPhone,
      password: '[REDACTED]'
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
    console.log(`[Auth] UserLogin response: ${response.status}`);
    console.log(`[Auth] Backend response data:`, JSON.stringify(data, null, 2));
    
    if (response.status !== 200) {
      console.log(`[Auth] Backend error response:`, {
        status: response.status,
        data: data
      });
    }
    
    res.status(response.status).json(data);
  } catch (error) {
    console.error(`[Auth] UserLogin error:`, error);
    res.status(500).json({ 
      error: 'Authentication request failed', 
      details: error.message 
    });
  }
}
