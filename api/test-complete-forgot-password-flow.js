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
  const testEmail = 'test@example.com';
  const testOTP = '12345';
  const testPassword = 'TestPassword123!';
  
  try {
    console.log(`[TestCompleteFlow] Testing complete forgot password flow`);
    
    const results = {
      step1_forgotPassword: null,
      step2_verifyCode: null,
      step3_resetPassword: null,
      summary: {
        allStepsPassed: false,
        issues: []
      }
    };
    
    // Step 1: Test forgot password
    console.log(`[TestCompleteFlow] Step 1: Testing forgot password`);
    try {
      const forgotResponse = await fetch(`${baseUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Vercel-Test/1.0'
        },
        body: JSON.stringify({ email: testEmail })
      });
      
      const forgotData = await forgotResponse.json();
      results.step1_forgotPassword = {
        status: forgotResponse.status,
        data: forgotData,
        success: forgotResponse.status === 200 || forgotResponse.status === 201
      };
      
      if (!results.step1_forgotPassword.success) {
        results.summary.issues.push('Step 1 (forgot password) failed');
      }
    } catch (error) {
      results.step1_forgotPassword = {
        error: error.message,
        success: false
      };
      results.summary.issues.push('Step 1 (forgot password) error: ' + error.message);
    }
    
    // Step 2: Test verify code
    console.log(`[TestCompleteFlow] Step 2: Testing verify code`);
    try {
      const verifyResponse = await fetch(`${baseUrl}/auth/verify-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Vercel-Test/1.0'
        },
        body: JSON.stringify({ email: testEmail, code: testOTP })
      });
      
      const verifyData = await verifyResponse.json();
      results.step2_verifyCode = {
        status: verifyResponse.status,
        data: verifyData,
        success: verifyResponse.status === 200 || verifyResponse.status === 201
      };
      
      if (!results.step2_verifyCode.success) {
        results.summary.issues.push('Step 2 (verify code) failed');
      }
    } catch (error) {
      results.step2_verifyCode = {
        error: error.message,
        success: false
      };
      results.summary.issues.push('Step 2 (verify code) error: ' + error.message);
    }
    
    // Step 3: Test reset password
    console.log(`[TestCompleteFlow] Step 3: Testing reset password`);
    try {
      const resetResponse = await fetch(`${baseUrl}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Vercel-Test/1.0'
        },
        body: JSON.stringify({ 
          email: testEmail, 
          code: testOTP, 
          newPassword: testPassword 
        })
      });
      
      const resetData = await resetResponse.json();
      results.step3_resetPassword = {
        status: resetResponse.status,
        data: resetData,
        success: resetResponse.status === 200 || resetResponse.status === 201
      };
      
      if (!results.step3_resetPassword.success) {
        results.summary.issues.push('Step 3 (reset password) failed');
      }
    } catch (error) {
      results.step3_resetPassword = {
        error: error.message,
        success: false
      };
      results.summary.issues.push('Step 3 (reset password) error: ' + error.message);
    }
    
    // Determine if all steps passed
    results.summary.allStepsPassed = 
      results.step1_forgotPassword?.success && 
      results.step2_verifyCode?.success && 
      results.step3_resetPassword?.success;
    
    res.status(200).json({
      message: 'Complete forgot password flow test completed',
      testEmail: testEmail,
      testOTP: testOTP,
      results: results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`[TestCompleteFlow] Error:`, error);
    res.status(500).json({ 
      error: 'Complete flow test failed', 
      details: error.message 
    });
  }
}
