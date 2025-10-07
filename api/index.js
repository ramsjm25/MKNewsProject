// Comprehensive API handler for all endpoints
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { method, query, body } = req;
    const { type, action, id, slug } = query;
    
    // Construct the target URL
    const apiBaseUrl = process.env.API_BASE_URL || 'https://phpstack-1520234-5847937.cloudwaysapps.com/api/v1';
    let targetUrl = '';
    let logPrefix = '[API]';

    // Handle different endpoint types
    if (type) {
      // Data endpoints (languages, categories, states, districts, local-mandis, health-check)
      switch (type) {
        case 'languages':
          targetUrl = `${apiBaseUrl}/news/languages`;
          logPrefix = '[Languages API]';
          break;
        case 'categories':
          if (!query.language_id) {
            return res.status(400).json({ 
              status: 0, 
              message: 'language_id parameter is required for categories',
              result: null 
            });
          }
          targetUrl = `${apiBaseUrl}/news/categories?language_id=${query.language_id}`;
          logPrefix = '[Categories API]';
          break;
        case 'states':
          if (!query.language_id) {
            return res.status(400).json({ 
              status: 0, 
              message: 'language_id parameter is required for states',
              result: null 
            });
          }
          targetUrl = `${apiBaseUrl}/news/states?language_id=${query.language_id}`;
          logPrefix = '[States API]';
          break;
        case 'districts':
          if (!query.language_id) {
            return res.status(400).json({ 
              status: 0, 
              message: 'language_id parameter is required for districts',
              result: null 
            });
          }
          if (!query.state_id) {
            return res.status(400).json({ 
              status: 0, 
              message: 'state_id parameter is required for districts',
              result: null 
            });
          }
          targetUrl = `${apiBaseUrl}/news/districts?language_id=${query.language_id}&state_id=${query.state_id}`;
          logPrefix = '[Districts API]';
          break;
        case 'local-mandis':
          targetUrl = `${apiBaseUrl}/local-mandis`;
          logPrefix = '[Local Mandis API]';
          break;
        case 'urgency-patterns':
          // Fetch urgency patterns dynamically from backend
          try {
            const urgencyUrl = `${apiBaseUrl}/news/urgency-patterns`;
            console.log(`${logPrefix} Fetching urgency patterns from: ${urgencyUrl}`);
            
            const urgencyResponse = await fetch(urgencyUrl, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'MaroKurukshetram-Web/1.0',
                'Accept': 'application/json',
              },
              signal: AbortSignal.timeout(10000)
            });
            
            if (!urgencyResponse.ok) {
              throw new Error(`External API returned ${urgencyResponse.status}: ${urgencyResponse.statusText}`);
            }
            
            const urgencyData = await urgencyResponse.json();
            console.log(`${logPrefix} External API response:`, urgencyData);
            
            if (urgencyData.status === 1 && urgencyData.result) {
              return res.status(200).json({
                status: 1,
                message: 'Urgency patterns fetched successfully',
                result: urgencyData.result
              });
            } else {
              throw new Error(`Invalid urgency patterns response: ${urgencyData.message || 'Unknown error'}`);
            }
          } catch (urgencyError) {
            console.error(`${logPrefix} Error fetching urgency patterns:`, urgencyError);
            // Fallback: Return empty urgency patterns to prevent breaking the system
            console.log(`${logPrefix} Using fallback: empty urgency patterns`);
            return res.status(200).json({
              status: 1,
              message: 'Urgency patterns not available, using fallback',
              result: {}
            });
          }

        case 'category-keywords':
          // Fetch category keywords dynamically from backend
          try {
            const keywordsUrl = `${apiBaseUrl}/news/category-keywords`;
            console.log(`${logPrefix} Fetching category keywords from: ${keywordsUrl}`);
            
            const keywordsResponse = await fetch(keywordsUrl, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'MaroKurukshetram-Web/1.0',
                'Accept': 'application/json',
              },
              signal: AbortSignal.timeout(10000)
            });
            
            if (!keywordsResponse.ok) {
              throw new Error(`External API returned ${keywordsResponse.status}: ${keywordsResponse.statusText}`);
            }
            
            const keywordsData = await keywordsResponse.json();
            console.log(`${logPrefix} External API response:`, keywordsData);
            
            if (keywordsData.status === 1 && keywordsData.result) {
              return res.status(200).json({
                status: 1,
                message: 'Category keywords fetched successfully',
                result: keywordsData.result
              });
            } else {
              throw new Error(`Invalid category keywords response: ${keywordsData.message || 'Unknown error'}`);
            }
          } catch (keywordsError) {
            console.error(`${logPrefix} Error fetching category keywords:`, keywordsError);
            // Fallback: Return empty category keywords to prevent breaking the system
            console.log(`${logPrefix} Using fallback: empty category keywords`);
            return res.status(200).json({
              status: 1,
              message: 'Category keywords not available, using fallback',
              result: {}
            });
          }

        case 'health-check':
          // Health check functionality
          const testUrl = `${apiBaseUrl}/news/test-connection`;
          
          try {
            const healthResponse = await fetch(testUrl, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'MaroKurukshetram-Web/1.0',
                'Accept': 'application/json',
              },
              signal: AbortSignal.timeout(10000)
            });
            
            return res.status(200).json({
              status: 'ok',
              externalApi: {
                url: apiBaseUrl,
                reachable: healthResponse.ok,
                status: healthResponse.status,
                statusText: healthResponse.statusText
              },
              timestamp: new Date().toISOString()
            });
          } catch (healthError) {
            return res.status(200).json({
              status: 'error',
              externalApi: {
                url: apiBaseUrl,
                reachable: false,
                error: healthError.message,
                code: healthError.code
              },
              timestamp: new Date().toISOString()
            });
          }
        default:
          return res.status(400).json({ 
            status: 0, 
            message: 'Invalid type. Must be one of: languages, categories, states, districts, local-mandis, health-check',
            result: null 
          });
      }
    } else if (action) {
      // Auth endpoints
      switch (action) {
        case 'login':
          targetUrl = `${apiBaseUrl}/auth/userLogin`;
          logPrefix = '[Auth Login]';
          break;
        case 'register':
          targetUrl = `${apiBaseUrl}/auth/register`;
          logPrefix = '[Auth Register]';
          break;
        case 'forgot-password':
          targetUrl = `${apiBaseUrl}/auth/forgot-password`;
          logPrefix = '[Auth Forgot Password]';
          break;
        case 'verify-code':
          targetUrl = `${apiBaseUrl}/auth/verify-code`;
          logPrefix = '[Auth Verify Code]';
          break;
        case 'reset-password':
          targetUrl = `${apiBaseUrl}/auth/reset-password`;
          logPrefix = '[Auth Reset Password]';
          break;
        default:
          return res.status(400).json({ 
            status: 0, 
            message: 'Invalid auth action. Must be one of: login, register, forgot-password, verify-code, reset-password',
            result: null 
          });
      }
    } else if (id) {
      // Single news by ID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid news ID format',
          status: 400,
          type: 'VALIDATION_ERROR'
        });
      }
      targetUrl = `${apiBaseUrl}/news/${id}`;
      logPrefix = '[News API]';
    } else if (slug) {
      // Dynamic slug endpoints
      const path = Array.isArray(slug) ? slug.join('/') : slug;
      targetUrl = `${apiBaseUrl}/${path}`;
      logPrefix = '[Dynamic API]';
    } else {
      return res.status(400).json({ 
        status: 0, 
        message: 'Missing required parameter. Use type, action, id, or slug',
        result: null 
      });
    }

    // Add query parameters
    const queryParams = new URLSearchParams();
    Object.keys(query).forEach(key => {
      if (!['type', 'action', 'id', 'slug'].includes(key)) {
        queryParams.append(key, query[key]);
      }
    });
    
    if (queryParams.toString()) {
      targetUrl += `?${queryParams.toString()}`;
    }

    console.log(`${logPrefix} Proxying request to: ${targetUrl}`);
    console.log(`${logPrefix} Method: ${method}`);

    // Prepare request options
    const requestOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'MaroKurukshetram-Web/1.0',
        'Accept': 'application/json',
      },
    };

    // Add Authorization header if present
    if (req.headers.authorization) {
      requestOptions.headers['Authorization'] = req.headers.authorization;
    }

    // Add body for POST/PUT requests
    if (body && (method === 'POST' || method === 'PUT')) {
      requestOptions.body = JSON.stringify(body);
    }

    // Make the request to the external API
    const response = await fetch(targetUrl, requestOptions);
    
    console.log(`${logPrefix} Response status: ${response.status}`);
    
    if (!response.ok) {
      console.error(`${logPrefix} API response not ok: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { message: errorText };
      }
      
      return res.status(response.status).json({
        error: 'API request failed',
        message: errorData.message || `API returned ${response.status}: ${response.statusText}`,
        status: response.status,
        type: 'API_ERROR',
        details: errorData
      });
    }
    
    const data = await response.json();
    console.log(`${logPrefix} Response data received`);
    
    // Apply specific filtering for categories
    if (type === 'categories' && data.status === 1 && data.result) {
      data.result = data.result.filter(category => 
        category.is_active === 1 && category.is_deleted === 0
      );
      console.log(`${logPrefix} Filtered to ${data.result.length} active categories`);
    }
    
    res.status(response.status).json(data);
  } catch (error) {
    console.error('[API] Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      status: 500,
      type: 'PROXY_ERROR'
    });
  }
}
