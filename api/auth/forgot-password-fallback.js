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
  const targetUrl = `${baseUrl}/auth/forgot-password`;
  
  try {
    console.log(`[AuthFallback] Forgot password request body:`, JSON.stringify(req.body, null, 2));
    console.log(`[AuthFallback] Forgot password request headers:`, req.headers);
    
    const { email } = req.body;
    
    console.log(`[AuthFallback] Extracted email field:`, {
      email: email,
      emailType: typeof email,
      emailTrimmed: email?.trim()
    });
    
    if (!email || !email.trim()) {
      console.log(`[AuthFallback] Missing email field:`, {
        email: !!email,
        emailValue: email
      });
      res.status(400).json({
        error: 'Missing required fields',
        details: { email: !email ? 'email is required' : null }
      });
      return;
    }
    
    const backendPayload = { email: email.trim() };
    
    console.log(`[AuthFallback] Sending to backend:`, { email: backendPayload.email });
    
    // Try backend first
    let response;
    let data;
    let backendWorking = false;
    
    try {
      response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Vercel-Proxy/1.0'
        },
        body: JSON.stringify(backendPayload)
      });

      data = await response.json();
      console.log(`[AuthFallback] Backend response: ${response.status}`);
      console.log(`[AuthFallback] Backend response data:`, JSON.stringify(data, null, 2));
      
      // Check if backend actually sent email
      const indicatesEmailSent = (
        (data.message && data.message.toLowerCase().includes('sent')) ||
        (data.result && data.result.otp) ||
        (data.result && data.result.email) ||
        data.email ||
        data.status === 1
      );
      
      if (indicatesEmailSent) {
        console.log(`[AuthFallback] ✅ Backend appears to have sent email`);
        backendWorking = true;
      } else {
        console.log(`[AuthFallback] ⚠️  Backend response does not indicate email was sent`);
      }
    } catch (backendError) {
      console.log(`[AuthFallback] Backend error:`, backendError.message);
    }
    
    // If backend didn't work or didn't send email, use mock service
    if (!backendWorking) {
      console.log(`[AuthFallback] Using mock email service as fallback`);
      
      try {
        const mockResponse = await fetch(`${req.headers.origin || 'http://localhost:3000'}/api/mock-email-service`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            email: email.trim(),
            action: 'send-otp'
          })
        });
        
        const mockData = await mockResponse.json();
        console.log(`[AuthFallback] Mock service response:`, mockData);
        
        res.status(200).json({
          ...mockData,
          _source: 'mock-email-service',
          _message: 'Using mock email service - check console for OTP'
        });
        return;
      } catch (mockError) {
        console.error(`[AuthFallback] Mock service error:`, mockError);
        // Fall back to backend response even if it doesn't send email
      }
    }
    
    // Return backend response
    res.status(response.status).json({
      ...data,
      _source: 'backend',
      _message: backendWorking ? 'Email sent via backend' : 'Backend response (email may not be sent)'
    });
    
  } catch (error) {
    console.error(`[AuthFallback] Forgot password error:`, error);
    res.status(500).json({ 
      error: 'Forgot password failed', 
      details: error.message 
    });
  }
}
