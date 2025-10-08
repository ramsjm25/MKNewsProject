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
  const targetUrl = `${baseUrl}/auth/register`;

  try {
    console.log(`[Auth] Register request body:`, JSON.stringify(req.body, null, 2));
    console.log(`[Auth] Register request headers:`, req.headers);
    
    // Validate required fields before sending
    const { firstName, lastName, email, phone, password, roleId } = req.body;
    
    console.log(`[Auth] Extracted fields:`, {
      firstName: firstName,
      lastName: lastName,
      email: email,
      phone: phone,
      password: password ? '[REDACTED]' : password,
      roleId: roleId
    });
    
    if (!firstName || !lastName || !email || !phone || !password || !roleId) {
      console.log(`[Auth] Missing required fields:`, {
        firstName: !!firstName,
        lastName: !!lastName,
        email: !!email,
        phone: !!phone,
        password: !!password,
        roleId: !!roleId
      });
      
      res.status(400).json({
        error: 'Missing required fields',
        details: {
          firstName: !firstName ? 'firstName is required' : null,
          lastName: !lastName ? 'lastName is required' : null,
          email: !email ? 'email is required' : null,
          phone: !phone ? 'phone is required' : null,
          password: !password ? 'password is required' : null,
          roleId: !roleId ? 'roleId is required' : null
        }
      });
      return;
    }
    
    // Create a clean payload to send to backend
    const backendPayload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password: password,
      roleId: roleId
    };
    
    console.log(`[Auth] Sending to backend:`, {
      firstName: backendPayload.firstName,
      lastName: backendPayload.lastName,
      email: backendPayload.email,
      phone: backendPayload.phone,
      password: '[REDACTED]',
      roleId: backendPayload.roleId
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
    console.log(`[Auth] Register response: ${response.status}`);
    console.log(`[Auth] Backend response data:`, JSON.stringify(data, null, 2));
    
    if (response.status !== 200) {
      console.log(`[Auth] Backend error response:`, {
        status: response.status,
        data: data
      });
    }
    
    res.status(response.status).json(data);
  } catch (error) {
    console.error(`[Auth] Register error:`, error);
    res.status(500).json({ 
      error: 'Registration request failed', 
      details: error.message 
    });
  }
}
