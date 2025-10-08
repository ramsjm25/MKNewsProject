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

  try {
    console.log(`[TestSimple] Test endpoint called`);
    
    res.status(200).json({
      message: 'Test endpoint is working',
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      status: 'ok'
    });
  } catch (error) {
    console.error(`[TestSimple] Error:`, error);
    res.status(500).json({ 
      error: 'Test endpoint failed', 
      details: error.message 
    });
  }
}
