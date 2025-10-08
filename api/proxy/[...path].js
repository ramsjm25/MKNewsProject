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

  // Map known app endpoints to real backend endpoints
  const url = new URL(req.url, `http://${req.headers.host}`);
  // Normalize pathname by removing the serverless mount prefix
  const stripped = url.pathname.replace(/^\/api(?:\/proxy)?/, '');
  const pathname = stripped.startsWith('/') ? stripped : `/${stripped}`;
  const search = url.search || '';
  const searchParams = url.searchParams;

  // Helper: remove `type` param but keep others intact
  const buildSearchWithoutType = () => {
    const sp = new URLSearchParams(searchParams);
    sp.delete('type');
    const s = sp.toString();
    return s ? `?${s}` : '';
  };

  let targetUrl = baseUrl;

  // Handle explicit endpoints
  if (pathname.startsWith('/data')) {
    // e.g. /api/data?type=languages
    const type = searchParams.get('type');
    if (type === 'languages') targetUrl = `${baseUrl}/news/languages`;
    else if (type === 'categories') targetUrl = `${baseUrl}/news/categories${buildSearchWithoutType()}`;
    else if (type === 'states') targetUrl = `${baseUrl}/news/states${buildSearchWithoutType()}`;
    else if (type === 'districts') targetUrl = `${baseUrl}/news/districts${buildSearchWithoutType()}`;
    else if (type === 'category-keywords') targetUrl = `${baseUrl}/news/category-keywords`;
    else if (type === 'urgency-patterns') targetUrl = `${baseUrl}/news/urgency-patterns`;
    else targetUrl = `${baseUrl}${pathname}${search}`;
  } else if (pathname.startsWith('/local-mandi-categories')) {
    targetUrl = `${baseUrl}/local-mandi-categories${search}`;
  } else if (pathname.startsWith('/e-newspapers')) {
    targetUrl = `${baseUrl}/e-newspapers${search}`;
  } else if (pathname.startsWith('/auth')) {
    targetUrl = `${baseUrl}${pathname}${search}`;
  } else if (pathname.startsWith('/news')) {
    targetUrl = `${baseUrl}${pathname}${search}`;
  } else if (pathname.startsWith('/api') || pathname === '' || pathname === '/') {
    // Legacy: /api?type=languages
    const type = searchParams.get('type');
    if (type === 'languages') targetUrl = `${baseUrl}/news/languages`;
    else if (type === 'categories') targetUrl = `${baseUrl}/news/categories${buildSearchWithoutType()}`;
    else if (type === 'states') targetUrl = `${baseUrl}/news/states${buildSearchWithoutType()}`;
    else if (type === 'districts') targetUrl = `${baseUrl}/news/districts${buildSearchWithoutType()}`;
    else if (type === 'category-keywords') targetUrl = `${baseUrl}/news/category-keywords`;
    else if (type === 'urgency-patterns') targetUrl = `${baseUrl}/news/urgency-patterns`;
    else targetUrl = `${baseUrl}${pathname}${search}`;
  } else {
    // Pass-through for any other paths
    targetUrl = `${baseUrl}${pathname}${search}`;
  }

  try {
    // Debug logging
    console.log(`[Proxy] ${req.method} ${pathname} -> ${targetUrl}`);
    
    // Some backend endpoints expect POST with JSON instead of GET with query
    let forwardMethod = req.method;
    let forwardBody;
    let forwardUrl = targetUrl;

    if (pathname === '/news/filter-advanced' && req.method === 'GET') {
      // Convert query params to JSON body and use POST (backend expects POST)
      const qp = Object.fromEntries(searchParams.entries());
      const categoryId = qp.categoryId || qp.category_id || qp.category_ids;
      const categoryIdsArray = categoryId ? String(categoryId).split(',').map(s => s.trim()).filter(Boolean) : [];
      const payload = {
        language_id: qp.language_id || null,
        state_id: qp.state_id || null,
        district_id: qp.district_id || null,
        page: qp.page ? Number(qp.page) : 1,
        limit: qp.limit ? Number(qp.limit) : undefined,
        // Try multiple shapes to maximize compatibility
        category_id: categoryIdsArray[0] || null,
        category_ids: categoryIdsArray,
        categoryIds: categoryIdsArray, // some backends accept camelCase arrays
      };

      forwardMethod = 'POST';
      forwardBody = JSON.stringify(payload);
      // Remove query string when sending POST
      forwardUrl = targetUrl.split('?')[0];
    } else {
      forwardBody = req.method !== 'GET' ? JSON.stringify(req.body) : undefined;
    }

    let response = await fetch(forwardUrl, {
      method: forwardMethod,
      headers: {
        'Content-Type': 'application/json',
        ...req.headers
      },
      body: forwardBody
    });

    // Fallback: if POST mapping for filter-advanced returns 404/405, retry as GET with original query
    if (
      (response.status === 404 || response.status === 405) &&
      pathname === '/news/filter-advanced' &&
      req.method === 'GET'
    ) {
      const retryUrl = `${baseUrl}${pathname}${search}`;
      response = await fetch(retryUrl, {
        method: 'GET',
        headers: {
          ...req.headers
        }
      });
    }

    const data = await response.json();
    console.log(`[Proxy] Response: ${response.status} for ${req.method} ${pathname}`);
    res.status(response.status).json(data);
  } catch (error) {
    console.error(`[Proxy] Error for ${req.method} ${pathname}:`, error);
    res.status(500).json({ error: 'Proxy request failed', details: error.message });
  }
}
