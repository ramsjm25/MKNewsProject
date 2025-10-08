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
  const targetUrl = `${baseUrl}/auth/forgot-password`;
  
  try {
    console.log(`[TestForgotPassword] Testing forgot password endpoint`);
    
    // Test with a sample email
    const testEmail = 'test@example.com';
    const testPayload = {
      email: testEmail
    };
    
    console.log(`[TestForgotPassword] Sending test request with email:`, testEmail);
    
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Vercel-Test/1.0'
      },
      body: JSON.stringify(testPayload)
    });
    
    const data = await response.json();
    console.log(`[TestForgotPassword] Backend response:`, {
      status: response.status,
      data: data
    });
    
    // Analyze the response to see if it indicates OTP was sent
    const analysis = {
      httpStatus: response.status,
      responseStatus: data.status,
      message: data.message,
      hasEmail: !!data.email,
      hasResult: !!data.result,
      resultKeys: data.result ? Object.keys(data.result) : [],
      indicatesOtpSent: false,
      reasons: []
    };
    
    if (data.message && data.message.toLowerCase().includes('sent')) {
      analysis.indicatesOtpSent = true;
      analysis.reasons.push('Message contains "sent"');
    }
    if (data.result && data.result.otp) {
      analysis.indicatesOtpSent = true;
      analysis.reasons.push('Result contains OTP');
    }
    if (data.result && data.result.email) {
      analysis.indicatesOtpSent = true;
      analysis.reasons.push('Result contains email');
    }
    if (data.email) {
      analysis.indicatesOtpSent = true;
      analysis.reasons.push('Response contains email field');
    }
    if (data.status === 1 || data.status === 200) {
      analysis.indicatesOtpSent = true;
      analysis.reasons.push('Status indicates success');
    }
    
    res.status(200).json({
      message: 'Forgot password test completed',
      testEmail: testEmail,
      backendResponse: {
        status: response.status,
        data: data
      },
      analysis: analysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`[TestForgotPassword] Error:`, error);
    res.status(500).json({ 
      error: 'Forgot password test failed', 
      details: error.message 
    });
  }
}
