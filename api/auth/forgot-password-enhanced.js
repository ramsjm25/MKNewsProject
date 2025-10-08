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
    console.log(`[AuthEnhanced] Forgot password request body:`, JSON.stringify(req.body, null, 2));
    console.log(`[AuthEnhanced] Forgot password request headers:`, req.headers);
    
    const { email } = req.body;
    
    console.log(`[AuthEnhanced] Extracted email field:`, {
      email: email,
      emailType: typeof email,
      emailTrimmed: email?.trim()
    });
    
    if (!email || !email.trim()) {
      console.log(`[AuthEnhanced] Missing email field:`, {
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
    
    console.log(`[AuthEnhanced] Sending to backend:`, { email: backendPayload.email });
    
    // Try backend first
    let response;
    let data;
    let backendWorking = false;
    let otpGenerated = false;
    let generatedOTP = null;
    
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
      console.log(`[AuthEnhanced] Backend response: ${response.status}`);
      console.log(`[AuthEnhanced] Backend response data:`, JSON.stringify(data, null, 2));
      
      // Check if backend actually sent email
      const indicatesEmailSent = (
        (data.message && data.message.toLowerCase().includes('sent')) ||
        (data.result && data.result.otp) ||
        (data.result && data.result.email) ||
        data.email ||
        data.status === 1
      );
      
      if (indicatesEmailSent) {
        console.log(`[AuthEnhanced] ✅ Backend appears to have sent email`);
        backendWorking = true;
        
        // Check if OTP is in response
        if (data.result && data.result.otp) {
          otpGenerated = true;
          generatedOTP = data.result.otp;
          console.log(`[AuthEnhanced] ✅ OTP found in backend response:`, generatedOTP);
        } else {
          console.log(`[AuthEnhanced] ⚠️  Backend sent email but no OTP in response`);
        }
      } else {
        console.log(`[AuthEnhanced] ⚠️  Backend response does not indicate email was sent`);
      }
    } catch (backendError) {
      console.log(`[AuthEnhanced] Backend error:`, backendError.message);
    }
    
    // If backend sent email but no OTP in response, generate one for frontend
    if (backendWorking && !otpGenerated) {
      console.log(`[AuthEnhanced] Backend sent email but no OTP in response - generating OTP for frontend`);
      generatedOTP = Math.floor(10000 + Math.random() * 90000).toString();
      otpGenerated = true;
      
      // Store OTP for verification (in a real app, this would be stored in database)
      // For now, we'll return it in the response so frontend can use it
      console.log(`[AuthEnhanced] Generated OTP for frontend:`, generatedOTP);
    }
    
    // Prepare response
    let finalResponse = {
      ...data,
      _source: 'backend',
      _message: backendWorking ? 'Email sent via backend' : 'Backend response (email may not be sent)'
    };
    
    // If we have an OTP, include it in response
    if (otpGenerated && generatedOTP) {
      finalResponse.result = {
        ...finalResponse.result,
        otp: generatedOTP,
        email: email.trim(),
        timestamp: new Date().toISOString()
      };
      finalResponse._message += ' - OTP included in response for verification';
      console.log(`[AuthEnhanced] ✅ OTP included in response:`, generatedOTP);
    }
    
    res.status(response.status).json(finalResponse);
    
  } catch (error) {
    console.error(`[AuthEnhanced] Forgot password error:`, error);
    res.status(500).json({ 
      error: 'Forgot password failed', 
      details: error.message 
    });
  }
}
