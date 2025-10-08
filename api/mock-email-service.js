// Mock email service for testing forgot password flow
// This simulates sending emails when the backend doesn't have email configured

const mockEmailStore = new Map();

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

  if (req.method === 'POST') {
    const { email, action } = req.body;
    
    if (action === 'send-otp') {
      // Generate a mock OTP
      const otp = Math.floor(10000 + Math.random() * 90000).toString();
      const timestamp = new Date().toISOString();
      
      // Store the OTP for verification
      mockEmailStore.set(email, {
        otp: otp,
        timestamp: timestamp,
        attempts: 0,
        verified: false
      });
      
      console.log(`[MockEmail] OTP sent to ${email}: ${otp}`);
      
      res.status(200).json({
        status: 1,
        message: 'OTP sent successfully to your email address',
        result: {
          email: email,
          otp: otp, // In real implementation, this wouldn't be returned
          timestamp: timestamp
        }
      });
    } else if (action === 'verify-otp') {
      const { code } = req.body;
      const storedData = mockEmailStore.get(email);
      
      if (!storedData) {
        res.status(400).json({
          status: 0,
          message: 'No OTP found for this email address',
          result: null
        });
        return;
      }
      
      // Check if OTP is correct
      if (storedData.otp === code) {
        storedData.verified = true;
        mockEmailStore.set(email, storedData);
        
        res.status(200).json({
          status: 1,
          message: 'OTP verified successfully',
          result: {
            email: email,
            verified: true
          }
        });
      } else {
        storedData.attempts += 1;
        mockEmailStore.set(email, storedData);
        
        res.status(400).json({
          status: 0,
          message: 'Invalid OTP code',
          result: null
        });
      }
    } else if (action === 'reset-password') {
      const { code, newPassword } = req.body;
      const storedData = mockEmailStore.get(email);
      
      if (!storedData || !storedData.verified) {
        res.status(400).json({
          status: 0,
          message: 'OTP not verified or expired',
          result: null
        });
        return;
      }
      
      // Simulate password reset
      console.log(`[MockEmail] Password reset for ${email} with new password: ${newPassword}`);
      
      // Clear the OTP data
      mockEmailStore.delete(email);
      
      res.status(200).json({
        status: 1,
        message: 'Password reset successfully',
        result: {
          email: email,
          reset: true
        }
      });
    } else {
      res.status(400).json({
        status: 0,
        message: 'Invalid action',
        result: null
      });
    }
  } else if (req.method === 'GET') {
    // Return stored OTPs for debugging
    const otps = Array.from(mockEmailStore.entries()).map(([email, data]) => ({
      email: email,
      otp: data.otp,
      timestamp: data.timestamp,
      verified: data.verified,
      attempts: data.attempts
    }));
    
    res.status(200).json({
      message: 'Mock email service status',
      storedOTPs: otps,
      total: otps.length
    });
  } else {
    res.status(405).json({
      status: 0,
      message: 'Method not allowed',
      result: null
    });
  }
}
