// src/pages/RegisterPage.js
import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Lock, Phone, UserPlus } from 'lucide-react';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const primaryColor = '#8249C0';
const hoverColor = '#7B4BCE';

function RegisterPage() {
  const { register: registerUser, isLoading } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    const result = await registerUser(data);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/login"
              className="font-medium"
              style={{ color: primaryColor }}
              onMouseEnter={(e) => e.target.style.color = hoverColor}
              onMouseLeave={(e) => e.target.style.color = primaryColor}
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="mt-1 relative">
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  {...register('name', {
                    required: 'Name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters',
                    },
                  })}
                  className={`appearance-none relative block w-full px-3 py-2 pl-10 border ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 sm:text-sm`}
                  placeholder="Enter your full name"
                  style={{ focusRingColor: primaryColor }}
                />
                <User className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

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
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 sm:text-sm`}
                  placeholder="Enter your email"
                  style={{ focusRingColor: primaryColor }}
                />
                <Mail className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="mt-1 relative">
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  {...register('phone', {
                    required: 'Phone number is required',
                    pattern: {
                      value: /^[\+]?[0-9\s\-\(\)]+$/,
                      message: 'Invalid phone number',
                    },
                  })}
                  className={`appearance-none relative block w-full px-3 py-2 pl-10 border ${
                    errors.phone ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 sm:text-sm`}
                  placeholder="Enter your phone number"
                  style={{ focusRingColor: primaryColor }}
                />
                <Phone className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
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
                  autoComplete="new-password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  className={`appearance-none relative block w-full px-3 py-2 pl-10 border ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 sm:text-sm`}
                  placeholder="Enter your password"
                  style={{ focusRingColor: primaryColor }}
                />
                <Lock className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) =>
                      value === password || 'Passwords do not match',
                  })}
                  className={`appearance-none relative block w-full px-3 py-2 pl-10 border ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 sm:text-sm`}
                  placeholder="Confirm your password"
                  style={{ focusRingColor: primaryColor }}
                />
                <Lock className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 text-sm font-medium rounded-md text-white disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: primaryColor }}
              onMouseEnter={(e) => { if (!isLoading) e.target.style.backgroundColor = hoverColor }}
              onMouseLeave={(e) => { if (!isLoading) e.target.style.backgroundColor = primaryColor }}
            >
              {isLoading ? (
                <LoadingSpinner size="small" />
              ) : (
                <>
                  <UserPlus className="w-5 h-5 mr-2" />
                  Create Account
                </>
              )}
            </button>
          </div>

          {/* Continue as guest */}
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

        {/* Terms and Privacy */}
        <div className="text-center">
          <p className="text-xs text-gray-600">
            By creating an account, you agree to our{' '}
            <a
              href="#"
              className="font-medium"
              style={{ color: primaryColor }}
              onMouseEnter={(e) => e.target.style.color = hoverColor}
              onMouseLeave={(e) => e.target.style.color = primaryColor}
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a
              href="#"
              className="font-medium"
              style={{ color: primaryColor }}
              onMouseEnter={(e) => e.target.style.color = hoverColor}
              onMouseLeave={(e) => e.target.style.color = primaryColor}
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
