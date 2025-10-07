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

  const baseUrl = 'https://phpstack-1520234-5847937.cloudwaysapps.com/api/v1';

  // Map known app endpoints to real backend endpoints
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.replace(/^\/api/, '');
  const search = url.search || '';

  let targetUrl = baseUrl;

  // Handle explicit endpoints
  if (pathname.startsWith('/data')) {
    // e.g. /api/data?type=languages
    const type = url.searchParams.get('type');
    if (type === 'languages') targetUrl = `${baseUrl}/news/languages`;
    else if (type === 'categories') targetUrl = `${baseUrl}/news/categories${search.replace('?type=categories', '')}`;
    else if (type === 'states') targetUrl = `${baseUrl}/news/states${search.replace('?type=states', '')}`;
    else if (type === 'districts') targetUrl = `${baseUrl}/news/districts${search.replace('?type=districts', '')}`;
    else if (type === 'category-keywords') targetUrl = `${baseUrl}/news/category-keywords`;
    else if (type === 'urgency-patterns') targetUrl = `${baseUrl}/news/urgency-patterns`;
    else targetUrl = `${baseUrl}${pathname}${search}`;
  } else if (pathname.startsWith('/local-mandi-categories')) {
    targetUrl = `${baseUrl}/local-mandi-categories${search}`;
  } else if (pathname.startsWith('/e-newspapers')) {
    targetUrl = `${baseUrl}/e-newspapers${search}`;
  } else if (pathname.startsWith('/news')) {
    targetUrl = `${baseUrl}${pathname}${search}`;
  } else if (pathname.startsWith('/api')) {
    // Legacy: /api?type=languages
    const type = url.searchParams.get('type');
    if (type === 'languages') targetUrl = `${baseUrl}/news/languages`;
    else if (type === 'categories') targetUrl = `${baseUrl}/news/categories${search.replace('?type=categories', '')}`;
    else if (type === 'states') targetUrl = `${baseUrl}/news/states${search.replace('?type=states', '')}`;
    else if (type === 'districts') targetUrl = `${baseUrl}/news/districts${search.replace('?type=districts', '')}`;
    else if (type === 'category-keywords') targetUrl = `${baseUrl}/news/category-keywords`;
    else if (type === 'urgency-patterns') targetUrl = `${baseUrl}/news/urgency-patterns`;
    else targetUrl = `${baseUrl}${pathname}${search}`;
  } else {
    // Pass-through for any other paths
    targetUrl = `${baseUrl}${pathname}${search}`;
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
