// Local API server for development
// This provides mock email service for local development

const http = require('http');
const url = require('url');
const PORT = 8080;

// Mock email store
const mockEmailStore = new Map();

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Allow-Credentials': 'true',
  'Content-Type': 'application/json'
};

// Helper function to parse JSON body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
  });
}

// Helper function to send JSON response
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, corsHeaders);
  res.end(JSON.stringify(data));
}

// Create server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(200, corsHeaders);
    res.end();
    return;
  }

  try {
    // Mock email service endpoints
    if (path === '/api/mock-email-service' && method === 'POST') {
      const body = await parseBody(req);
      const { email, action, code, newPassword } = body;
      
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
        
        console.log(`[LocalMock] OTP sent to ${email}: ${otp}`);
        
        sendJSON(res, 200, {
          status: 1,
          message: 'OTP sent successfully to your email address',
          result: {
            email: email,
            otp: otp,
            timestamp: timestamp
          }
        });
      } else if (action === 'verify-otp') {
        const storedData = mockEmailStore.get(email);
        
        if (!storedData) {
          sendJSON(res, 400, {
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
          
          sendJSON(res, 200, {
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
          
          sendJSON(res, 400, {
            status: 0,
            message: 'Invalid OTP code',
            result: null
          });
        }
      } else if (action === 'reset-password') {
        const storedData = mockEmailStore.get(email);
        
        if (!storedData || !storedData.verified) {
          sendJSON(res, 400, {
            status: 0,
            message: 'OTP not verified or expired',
            result: null
          });
          return;
        }
        
        // Simulate password reset
        console.log(`[LocalMock] Password reset for ${email} with new password: ${newPassword}`);
        
        // Clear the OTP data
        mockEmailStore.delete(email);
        
        sendJSON(res, 200, {
          status: 1,
          message: 'Password reset successfully',
          result: {
            email: email,
            reset: true
          }
        });
      } else {
        sendJSON(res, 400, {
          status: 0,
          message: 'Invalid action',
          result: null
        });
      }
    } else if (path === '/api/mock-email-service' && method === 'GET') {
      // Get stored OTPs for debugging
      const otps = Array.from(mockEmailStore.entries()).map(([email, data]) => ({
        email: email,
        otp: data.otp,
        timestamp: data.timestamp,
        verified: data.verified,
        attempts: data.attempts
      }));
      
      sendJSON(res, 200, {
        message: 'Mock email service status',
        storedOTPs: otps,
        total: otps.length
      });
    } else if (path === '/api/health' && method === 'GET') {
      sendJSON(res, 200, { 
        status: 'ok', 
        message: 'Local API server running' 
      });
    } else {
      sendJSON(res, 404, { 
        error: 'Not found',
        path: path,
        method: method
      });
    }
  } catch (error) {
    console.error('Server error:', error);
    sendJSON(res, 500, { 
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Local API server running on http://localhost:${PORT}`);
  console.log(`📧 Mock email service available at http://localhost:${PORT}/api/mock-email-service`);
  console.log(`🔍 Debug endpoint: http://localhost:${PORT}/api/mock-email-service`);
  console.log(`💡 Start this server with: npm run api-server`);
});