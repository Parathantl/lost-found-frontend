import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const primaryColor = '#8249C0';
const hoverColor = '#7B4BCE';

function ForgotPasswordPage() {
  const [emailSent, setEmailSent] = useState(false);
  const { forgotPassword, isLoading } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues
  } = useForm();

  const onSubmit = async (data) => {
    const result = await forgotPassword(data.email);
    if (result.success) {
      setEmailSent(true);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Check Your Email
            </h2>
            <p className="text-gray-600 mb-4">
              We've sent a password reset link to:
            </p>
            <p className="font-semibold text-gray-900 mb-6">
              {getValues('email')}
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> The reset link will expire in 10 minutes. 
                If you don't see the email, check your spam folder.
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => setEmailSent(false)}
                className="w-full py-2 px-4 text-sm font-medium rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
              >
                Send Another Email
              </button>
              <Link
                to="/login"
                className="block w-full py-2 px-4 text-sm font-medium rounded-md text-white"
                style={{ backgroundColor: primaryColor }}
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link
            to="/login"
            className="inline-flex items-center text-sm font-medium mb-6"
            style={{ color: primaryColor }}
            onMouseEnter={(e) => e.target.style.color = hoverColor}
            onMouseLeave={(e) => e.target.style.color = primaryColor}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sign In
          </Link>
          
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Forgot Your Password?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            No worries! Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div className="mt-1 relative">
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                className={`appearance-none relative block w-full px-3 py-2 pl-10 border ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 sm:text-sm`}
                placeholder="Enter your email address"
                style={{
                  focusBorderColor: primaryColor,
                  focusRingColor: primaryColor,
                }}
              />
              <Mail className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 text-sm font-medium rounded-md text-white disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: primaryColor,
              }}
              onMouseEnter={(e) => { if (!isLoading) e.target.style.backgroundColor = hoverColor }}
              onMouseLeave={(e) => { if (!isLoading) e.target.style.backgroundColor = primaryColor }}
            >
              {isLoading ? (
                <LoadingSpinner size="small" />
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Send Reset Link
                </>
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Remember your password?{' '}
              <Link
                to="/login"
                className="font-medium"
                style={{ color: primaryColor }}
                onMouseEnter={(e) => e.target.style.color = hoverColor}
                onMouseLeave={(e) => e.target.style.color = primaryColor}
              >
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;