// src/components/Layout/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Github,
  ExternalLink,
  Heart,
  Shield,
  Clock,
  Users
} from 'lucide-react';

const primaryColor = '#8249C0';
const hoverColor = '#7B4BCE';

function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Browse Items', href: '/items' },
    { name: 'Report Lost Item', href: '/create-item' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Success Stories', href: '#success-stories' },
  ];

  const supportLinks = [
    { name: 'Help Center', href: '#help' },
    { name: 'Safety Guidelines', href: '#safety' },
    { name: 'FAQ', href: '#faq' },
    { name: 'Contact Support', href: '#contact' },
  ];

  const legalLinks = [
    { name: 'Privacy Policy', href: '#privacy' },
    { name: 'Terms of Service', href: '#terms' },
    { name: 'Cookie Policy', href: '#cookies' },
    { name: 'Community Guidelines', href: '#guidelines' },
  ];

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: '#facebook' },
    { name: 'Twitter', icon: Twitter, href: '#twitter' },
    { name: 'Instagram', icon: Instagram, href: '#instagram' },
    { name: 'LinkedIn', icon: Linkedin, href: '#linkedin' },
    { name: 'GitHub', icon: Github, href: '#github' },
  ];

  const features = [
    { icon: Shield, text: 'Secure & Verified' },
    { icon: Clock, text: '24/7 Support' },
    { icon: Users, text: 'Community Driven' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <Package className="w-8 h-8" style={{ color: primaryColor }} />
              <span className="text-xl font-bold">Lost & Found</span>
            </div>
            <p className="text-gray-300 mb-6">
              Connecting communities to reunite people with their lost belongings.
              A secure, trusted platform for item recovery.
            </p>

            {/* Features */}
            <div className="space-y-3">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-center space-x-3">
                    <Icon className="w-5 h-5" style={{ color: primaryColor }} />
                    <span className="text-sm text-gray-300">{feature.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-gray-300 text-sm transition-colors duration-200"
                    style={{ hover: { color: primaryColor } }}
                    onMouseEnter={(e) => e.target.style.color = hoverColor}
                    onMouseLeave={(e) => e.target.style.color = ''} // reset
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-3">
              {supportLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-gray-300 text-sm flex items-center transition-colors duration-200"
                    onMouseEnter={(e) => e.target.style.color = hoverColor}
                    onMouseLeave={(e) => e.target.style.color = ''}
                  >
                    {link.name}
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: primaryColor }} />
                <div className="text-sm text-gray-300">
                  <p>123 Community Street</p>
                  <p>Lost & Found Center</p>
                  <p>Jaffna, Northern Province, LK</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5" style={{ color: primaryColor }} />
                <span className="text-sm text-gray-300">+94 21 222 3333</span>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5" style={{ color: primaryColor }} />
                <span className="text-sm text-gray-300">support@lostandfound.lk</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-3">Follow Us</h4>
              <div className="flex space-x-3">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.href}
                      className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center transition-colors duration-200"
                      title={social.name}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = primaryColor}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1F2937'}
                    >
                      <Icon className="w-4 h-4 text-white" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              ['500+', 'Items Reported'],
              ['250+', 'Successfully Returned'],
              ['1,000+', 'Active Users'],
              ['85%', 'Success Rate'],
            ].map(([count, label], index) => (
              <div key={index}>
                <div className="text-2xl font-bold" style={{ color: primaryColor }}>{count}</div>
                <div className="text-sm text-gray-400">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter Signup */}
      {/* <div className="border-t border-gray-800 bg-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-lg font-semibold mb-2">Stay Updated</h3>
            <p className="text-gray-300 mb-4">
              Get notifications about new features and success stories from our community.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2"
                style={{ borderColor: 'transparent', outlineColor: primaryColor }}
              />
              <button
                type="submit"
                className="px-6 py-2 text-white font-medium rounded-md transition-colors duration-200"
                style={{ backgroundColor: primaryColor }}
                onMouseEnter={(e) => e.target.style.backgroundColor = hoverColor}
                onMouseLeave={(e) => e.target.style.backgroundColor = primaryColor}
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div> */}

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 bg-gray-900">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="flex items-center space-x-4">
              <p className="text-sm text-gray-400">
                © {currentYear} Lost & Found Platform. All rights reserved.
              </p>
            </div>

            {/* Legal Links */}
            <div className="flex items-center space-x-6">
              {legalLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="text-sm text-gray-400 transition-colors duration-200"
                  onMouseEnter={(e) => e.target.style.color = hoverColor}
                  onMouseLeave={(e) => e.target.style.color = ''}
                >
                  {link.name}
                </a>
              ))}
            </div>

            {/* Made with Love */}
            <div className="flex items-center space-x-1 text-sm text-gray-400">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500" />
              <span>by the Community</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
