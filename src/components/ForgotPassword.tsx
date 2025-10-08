import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { forgotPassword } from '../api/auth';
import { ArrowLeft, Mail, Loader2 } from 'lucide-react';

interface ForgotPasswordProps {
  onBack: () => void;
  onSuccess: (email: string) => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBack, onSuccess }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError(t('auth.fillAllFields'));
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t('auth.invalidEmail'));
      return;
    }

    setLoading(true);

    try {
      console.log('Sending forgot password request for email:', email);
      const response = await forgotPassword(email);
      console.log('Forgot password successful:', response);
      console.log('Response data:', response);
      
      // Check if the response indicates OTP was sent
      // Backend returns: {status: 1, message: 'Request processed successfully', result: {...}}
      console.log('Validating response for OTP send indication:', {
        status: response?.status,
        message: response?.message,
        hasEmail: !!response?.email,
        hasResult: !!response?.result,
        resultKeys: response?.result ? Object.keys(response.result) : []
      });
      
      const isOtpSent = response && (
        response.status === 1 || 
        response.status === 200 || 
        response.email ||
        (response.message && response.message.toLowerCase().includes('sent')) ||
        (response.result && (response.result.otp || response.result.email))
      );
      
      if (isOtpSent) {
        console.log('✅ OTP send confirmed, showing success message');
        
        // Check if OTP is available in response
        if (response.result?.otp) {
          console.log('🔑 OTP AVAILABLE IN RESPONSE:', response.result.otp);
          console.log('📧 Email was sent and OTP is available for verification');
          
          if (response._source === 'mock-email-service') {
            setSuccess(`OTP sent successfully! For testing: ${response.result.otp} (Check console for details)`);
          } else {
            setSuccess(`OTP sent successfully! Your verification code is: ${response.result.otp} (Also check your email)`);
          }
        } else {
          // Check if using mock service
          if (response._source === 'mock-email-service') {
            console.log('🔑 MOCK OTP FOR TESTING:', response.result?.otp);
            console.log('📧 This OTP is for testing purposes only');
            setSuccess(`OTP sent successfully! For testing: ${response.result?.otp} (Check console for details)`);
          } else {
            setSuccess(t('auth.otpSent') || 'OTP has been sent to your email address. Please check your email and spam folder.');
          }
        }
        
        setTimeout(() => {
          onSuccess(email);
        }, 2000);
      } else {
        console.log('❌ OTP send not confirmed, showing error:', response);
        setError('Failed to send OTP. Please check your email address or try again later. If the problem persists, contact support.');
      }
    } catch (error: any) {
      console.error('Forgot password error:', error);
      console.error('Error details:', {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
        type: error?.type
      });
      
      let errorMessage = t('auth.forgotPasswordFailed');
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.status === 400) {
        errorMessage = t('auth.invalidEmail');
      } else if (error?.response?.status === 404) {
        errorMessage = t('auth.emailNotFound');
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 md:max-h-none md:overflow-visible">
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <img
              src="/lovable-uploads/3b336ab1-e951-42a8-b0c4-758eed877e6a.png"
              alt="App Logo"
              className="h-18 w-32"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('auth.forgotPasswordTitle')}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {t('auth.forgotPasswordDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                {t('auth.email')}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder={t('auth.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <Button
                type="submit"
                className="w-full bg-red-500 hover:bg-red-600 text-white"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('auth.sending')}
                  </>
                ) : (
                  t('auth.sendOTP')
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={onBack}
                disabled={loading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('auth.backToLogin')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
