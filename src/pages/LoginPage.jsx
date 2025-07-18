// src/pages/LoginPage.js
import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, LogIn } from 'lucide-react';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const primaryColor = '#8249C0';
const hoverColor = '#7B4BCE';

function LoginPage() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    const result = await login(data.email, data.password);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/register"
              className="font-medium"
              style={{ color: primaryColor }}
              onMouseEnter={(e) => e.target.style.color = hoverColor}
              onMouseLeave={(e) => e.target.style.color = primaryColor}
            >
              create a new account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Email */}
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
                  placeholder="Enter your email"
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

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  className={`appearance-none relative block w-full px-3 py-2 pl-10 border ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 sm:text-sm`}
                  placeholder="Enter your password"
                  style={{
                    focusBorderColor: primaryColor,
                    focusRingColor: primaryColor,
                  }}
                />
                <Lock className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="flex items-center justify-between">
            <div></div> {/* Empty div for spacing */}
            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium"
                style={{ color: primaryColor }}
                onMouseEnter={(e) => e.target.style.color = hoverColor}
                onMouseLeave={(e) => e.target.style.color = primaryColor}
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          {/* Submit Button */}
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
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign in
                </>
              )}
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/items"
              className="text-sm"
              style={{ color: primaryColor }}
              onMouseEnter={(e) => e.target.style.color = hoverColor}
              onMouseLeave={(e) => e.target.style.color = primaryColor}
            >
              Continue as guest
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
