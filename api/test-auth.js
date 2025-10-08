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

  try {
    console.log(`[TestAuth] Request body:`, JSON.stringify(req.body, null, 2));
    console.log(`[TestAuth] Request headers:`, req.headers);
    
    // Simulate validation
    const { emailOrPhone, password, firstName, lastName, email, phone } = req.body;
    
    const validation = {
      emailOrPhone: {
        present: !!emailOrPhone,
        value: emailOrPhone,
        trimmed: emailOrPhone?.trim(),
        isEmpty: !emailOrPhone?.trim()
      },
      password: {
        present: !!password,
        value: password,
        trimmed: password?.trim(),
        isEmpty: !password?.trim()
      },
      firstName: {
        present: !!firstName,
        value: firstName,
        trimmed: firstName?.trim(),
        isEmpty: !firstName?.trim()
      },
      lastName: {
        present: !!lastName,
        value: lastName,
        trimmed: lastName?.trim(),
        isEmpty: !lastName?.trim()
      },
      email: {
        present: !!email,
        value: email,
        trimmed: email?.trim(),
        isEmpty: !email?.trim()
      },
      phone: {
        present: !!phone,
        value: phone,
        trimmed: phone?.trim(),
        isEmpty: !phone?.trim()
      }
    };
    
    res.status(200).json({
      message: 'Test endpoint working',
      validation,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`[TestAuth] Error:`, error);
    res.status(500).json({ 
      error: 'Test failed', 
      details: error.message 
    });
  }
}
