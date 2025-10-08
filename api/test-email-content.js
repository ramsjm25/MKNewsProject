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
    console.log(`[TestEmailContent] Testing email content for forgot password`);
    
    // Test with a real email
    const testEmail = req.body?.email || 'test@example.com';
    const testPayload = {
      email: testEmail
    };
    
    console.log(`[TestEmailContent] Sending request to:`, targetUrl);
    console.log(`[TestEmailContent] Payload:`, testPayload);
    
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
    console.log(`[TestEmailContent] Backend response status:`, response.status);
    console.log(`[TestEmailContent] Backend response data:`, JSON.stringify(data, null, 2));
    
    // Analyze the response for OTP content
    const analysis = {
      httpStatus: response.status,
      responseData: data,
      emailContentAnalysis: {
        hasOTPInResponse: false,
        hasOTPInResult: false,
        hasOTPInMessage: false,
        otpValue: null,
        emailTemplate: null,
        issues: [],
        recommendations: []
      }
    };
    
    // Check if OTP is present in response
    if (data.result && data.result.otp) {
      analysis.emailContentAnalysis.hasOTPInResult = true;
      analysis.emailContentAnalysis.otpValue = data.result.otp;
    }
    
    if (data.otp) {
      analysis.emailContentAnalysis.hasOTPInResponse = true;
      analysis.emailContentAnalysis.otpValue = data.otp;
    }
    
    if (data.message && data.message.includes('OTP')) {
      analysis.emailContentAnalysis.hasOTPInMessage = true;
    }
    
    // Check if email template includes OTP
    if (data.result && data.result.emailTemplate) {
      analysis.emailContentAnalysis.emailTemplate = data.result.emailTemplate;
    }
    
    // Identify issues
    if (!analysis.emailContentAnalysis.hasOTPInResponse && !analysis.emailContentAnalysis.hasOTPInResult) {
      analysis.emailContentAnalysis.issues.push('No OTP found in backend response');
    }
    
    if (!analysis.emailContentAnalysis.emailTemplate) {
      analysis.emailContentAnalysis.issues.push('No email template found in response');
    }
    
    if (data.message && !data.message.includes('OTP') && !data.message.includes('code')) {
      analysis.emailContentAnalysis.issues.push('Response message does not mention OTP or code');
    }
    
    // Generate recommendations
    if (analysis.emailContentAnalysis.issues.length > 0) {
      analysis.emailContentAnalysis.recommendations.push('Backend email template needs to include OTP code');
      analysis.emailContentAnalysis.recommendations.push('Backend should return OTP in response for verification');
      analysis.emailContentAnalysis.recommendations.push('Email template should have placeholders for OTP insertion');
    }
    
    // Check if backend is configured to send OTP in email
    const backendEmailConfig = {
      sendsEmail: response.status === 200 || response.status === 201,
      includesOTP: analysis.emailContentAnalysis.hasOTPInResponse || analysis.emailContentAnalysis.hasOTPInResult,
      hasEmailTemplate: !!analysis.emailContentAnalysis.emailTemplate,
      otpInEmailBody: false, // This would need to be checked by looking at actual email
      configurationIssues: []
    };
    
    if (backendEmailConfig.sendsEmail && !backendEmailConfig.includesOTP) {
      backendEmailConfig.configurationIssues.push('Backend sends email but OTP is not included in response');
    }
    
    if (backendEmailConfig.sendsEmail && !backendEmailConfig.hasEmailTemplate) {
      backendEmailConfig.configurationIssues.push('Backend sends email but no template found in response');
    }
    
    res.status(200).json({
      message: 'Email content analysis completed',
      testEmail: testEmail,
      backendUrl: targetUrl,
      analysis: analysis,
      backendEmailConfig: backendEmailConfig,
      nextSteps: [
        'Check if backend email template includes OTP placeholder',
        'Verify OTP is being generated and stored in backend',
        'Check if email service is configured to replace placeholders with actual OTP',
        'Test with actual email to see if OTP appears in email body'
      ],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`[TestEmailContent] Error:`, error);
    res.status(500).json({ 
      error: 'Email content test failed', 
      details: error.message,
      stack: error.stack
    });
  }
}
