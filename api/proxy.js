export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { type } = req.query;
  const baseUrl = 'https://phpstack-1520234-5847937.cloudwaysapps.com/api/v1';
  
  let targetUrl;
  if (type === 'languages') {
    targetUrl = `${baseUrl}/news/languages`;
  } else if (type === 'categories') {
    targetUrl = `${baseUrl}/news/categories`;
  } else if (type === 'states') {
    targetUrl = `${baseUrl}/news/states`;
  } else if (type === 'districts') {
    targetUrl = `${baseUrl}/news/districts`;
  } else if (type === 'category-keywords') {
    targetUrl = `${baseUrl}/news/category-keywords`;
  } else if (type === 'urgency-patterns') {
    targetUrl = `${baseUrl}/news/urgency-patterns`;
  } else {
    targetUrl = `${baseUrl}/api?type=${type}`;
  }

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...req.headers
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Proxy request failed' });
  }
}
