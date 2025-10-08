# Local Development Setup for Forgot Password Flow

## Quick Start

### 1. Start the Local API Server
```bash
npm run api-server
```
This will start a local API server on `http://localhost:8080` that provides mock email service.

### 2. Start the React Development Server
```bash
npm run dev
```
This will start the React app on `http://localhost:5173` (or another port).

### 3. Test the Forgot Password Flow
1. Go to the login page
2. Click "Forgot Password"
3. Enter any email address
4. Click "Send Verification Code"
5. Check the console for the OTP (it will be displayed there)
6. Enter the OTP in the verification screen
7. Enter a new password
8. Complete the reset

## How It Works

The local API server provides:
- **Mock email service** at `/api/mock-email-service`
- **OTP generation and storage** for testing
- **OTP verification** functionality
- **Password reset simulation**

## Debugging

- **View stored OTPs**: Visit `http://localhost:8080/api/mock-email-service`
- **Check server status**: Visit `http://localhost:8080/api/health`
- **Console logs**: The OTP will be displayed in both server and browser console

## Production Deployment

When deployed to Vercel, the app will:
1. Try the backend API first
2. Fall back to the Vercel mock service if backend doesn't send emails
3. Provide the same functionality as local development

## Troubleshooting

- **404 errors**: Make sure the local API server is running on port 8080
- **CORS errors**: The local server includes CORS headers
- **OTP not showing**: Check the browser console for the generated OTP
