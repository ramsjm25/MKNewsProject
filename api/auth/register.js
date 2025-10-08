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
    console.log(`[Auth] Register request:`, req.body);
    
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...req.headers
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    console.log(`[Auth] Register response: ${response.status}`);
    
    res.status(response.status).json(data);
  } catch (error) {
    console.error(`[Auth] Register error:`, error);
    res.status(500).json({ 
      error: 'Registration request failed', 
      details: error.message 
    });
  }
}
