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
    console.log(`[TestBackend] Testing backend forgot password endpoint directly`);
    
    // Test with a real email format
    const testEmail = 'test@example.com';
    const testPayload = {
      email: testEmail
    };
    
    console.log(`[TestBackend] Sending request to:`, targetUrl);
    console.log(`[TestBackend] Payload:`, testPayload);
    
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
    console.log(`[TestBackend] Backend response status:`, response.status);
    console.log(`[TestBackend] Backend response data:`, JSON.stringify(data, null, 2));
    
    // Analyze the response
    const analysis = {
      httpStatus: response.status,
      responseData: data,
      analysis: {
        hasStatus: 'status' in data,
        statusValue: data.status,
        hasMessage: 'message' in data,
        messageValue: data.message,
        hasEmail: 'email' in data,
        emailValue: data.email,
        hasResult: 'result' in data,
        resultValue: data.result,
        allKeys: Object.keys(data),
        indicatesEmailSent: false,
        reasons: []
      }
    };
    
    // Check if response indicates email was sent
    if (data.message && data.message.toLowerCase().includes('sent')) {
      analysis.analysis.indicatesEmailSent = true;
      analysis.analysis.reasons.push('Message contains "sent"');
    }
    if (data.message && data.message.toLowerCase().includes('email')) {
      analysis.analysis.indicatesEmailSent = true;
      analysis.analysis.reasons.push('Message contains "email"');
    }
    if (data.message && data.message.toLowerCase().includes('otp')) {
      analysis.analysis.indicatesEmailSent = true;
      analysis.analysis.reasons.push('Message contains "otp"');
    }
    if (data.result && data.result.otp) {
      analysis.analysis.indicatesEmailSent = true;
      analysis.analysis.reasons.push('Result contains OTP');
    }
    if (data.result && data.result.email) {
      analysis.analysis.indicatesEmailSent = true;
      analysis.analysis.reasons.push('Result contains email');
    }
    if (data.email) {
      analysis.analysis.indicatesEmailSent = true;
      analysis.analysis.reasons.push('Response contains email field');
    }
    if (data.status === 1 || data.status === 200) {
      analysis.analysis.indicatesEmailSent = true;
      analysis.analysis.reasons.push('Status indicates success');
    }
    
    // Check if backend is configured for email sending
    const backendEmailConfig = {
      hasEmailService: false,
      hasSMTPConfig: false,
      hasEmailTemplate: false,
      issues: []
    };
    
    if (!analysis.analysis.indicatesEmailSent) {
      backendEmailConfig.issues.push('No indication that email was sent');
    }
    if (!data.message || !data.message.toLowerCase().includes('sent')) {
      backendEmailConfig.issues.push('Response message does not indicate email was sent');
    }
    if (!data.result || !data.result.otp) {
      backendEmailConfig.issues.push('No OTP found in response result');
    }
    
    res.status(200).json({
      message: 'Backend forgot password test completed',
      testEmail: testEmail,
      backendUrl: targetUrl,
      analysis: analysis,
      backendEmailConfig: backendEmailConfig,
      recommendations: [
        'Check if backend has email service configured (SMTP, SendGrid, etc.)',
        'Verify email templates are set up',
        'Check if email sending is enabled in backend configuration',
        'Verify the email address is valid and accessible',
        'Check backend logs for email sending errors'
      ],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`[TestBackend] Error:`, error);
    res.status(500).json({ 
      error: 'Backend test failed', 
      details: error.message,
      stack: error.stack
    });
  }
}
