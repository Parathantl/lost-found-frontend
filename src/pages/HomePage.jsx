// src/pages/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Search,
  Plus,
  Shield,
  Users,
  Clock,
  ArrowRight,
  Package
} from 'lucide-react';

const primaryColor = '#8249C0';
const hoverColor = '#7B4BCE';
const successColor = '#83D14E';

function HomePage() {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <Search className="w-8 h-8" style={{ color: primaryColor }} />,
      title: 'Smart Search',
      description: 'Advanced search and filtering to find lost items quickly using keywords, categories, and locations.',
    },
    {
      icon: <Shield className="w-8 h-8" style={{ color: primaryColor }} />,
      title: 'Secure Claims',
      description: 'Verification system with document upload to ensure items are returned to rightful owners.',
    },
    {
      icon: <Users className="w-8 h-8" style={{ color: primaryColor }} />,
      title: 'Community Based',
      description: 'Connect with your community to report and recover lost items through collaborative effort.',
    },
    {
      icon: <Clock className="w-8 h-8" style={{ color: primaryColor }} />,
      title: 'Real-time Updates',
      description: 'Get instant notifications when potential matches are found or claims are processed.',
    },
  ];

  const steps = [
    {
      number: '1',
      title: 'Report Item',
      description: 'Lost something? Create a detailed report with photos and description.',
    },
    {
      number: '2',
      title: 'Community Helps',
      description: 'Others in your community can report found items that match your description.',
    },
    {
      number: '3',
      title: 'Verify & Claim',
      description: 'Verify ownership through our secure claim process and get your item back.',
    },
    {
      number: '4',
      title: 'Reunited',
      description: 'Meet up safely and get your valuable item returned to you.',
    },
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
            Lost & Found
            <span className="block" style={{ color: primaryColor }}>Community Platform</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A secure, centralized platform for community-based item recovery.
            Report lost items, register found items, and help reunite people with their belongings.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {!isAuthenticated ? (
            <>
              <Link
                to="/register"
                className="inline-flex items-center px-6 py-3 text-base font-medium rounded-md text-white"
                style={{ backgroundColor: primaryColor }}
                onMouseEnter={(e) => e.target.style.backgroundColor = hoverColor}
                onMouseLeave={(e) => e.target.style.backgroundColor = primaryColor}
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/items"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Search className="mr-2 w-5 h-5" />
                Browse Items
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/create-item"
                className="inline-flex items-center px-6 py-3 text-base font-medium rounded-md text-white"
                style={{ backgroundColor: primaryColor }}
                onMouseEnter={(e) => e.target.style.backgroundColor = hoverColor}
                onMouseLeave={(e) => e.target.style.backgroundColor = primaryColor}
              >
                <Plus className="mr-2 w-5 h-5" />
                Report Item
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Package className="mr-2 w-5 h-5" />
                My Dashboard
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="space-y-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Platform Features</h2>
          <p className="mt-4 text-lg text-gray-600">
            Everything you need to recover lost items and help others
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center space-y-4">
              <div className="flex justify-center">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-50 -mx-4 px-4 py-16">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-4 text-lg text-gray-600">
              Simple steps to recover your lost items
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center space-y-4">
                <div
                  className="inline-flex items-center justify-center w-12 h-12 text-white text-xl font-bold rounded-full"
                  style={{ backgroundColor: primaryColor }}
                >
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="text-center space-y-8">
        <h2 className="text-3xl font-bold text-gray-900">Join Our Community</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <div className="text-4xl font-bold" style={{ color: primaryColor }}>500+</div>
            <div className="text-gray-600">Items Reported</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl font-bold" style={{ color: successColor }}>250+</div>
            <div className="text-gray-600">Successfully Returned</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl font-bold" style={{ color: primaryColor }}>1,000+</div>
            <div className="text-gray-600">Community Members</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="-mx-4 px-4 py-16 text-center" style={{ backgroundColor: primaryColor, color: 'white' }}>
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
          <p className="text-xl text-white">
            Join thousands of community members helping each other recover lost items
          </p>
          {!isAuthenticated && (
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-3 text-base font-medium rounded-md"
              style={{
                backgroundColor: 'white',
                color: primaryColor
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#F0F0FF'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
            >
              Create Your Account
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
