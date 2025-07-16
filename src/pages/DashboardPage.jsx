// src/pages/DashboardPage.js
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { dashboardAPI } from '../services/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import StatsCard from '../components/Dashboard/StatsCard';

import { 
  Plus, 
  Package, 
  FileText, 
  Bell, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

function DashboardPage() {
  const { user } = useAuth();

  // ✅ Updated to React Query v5 signature
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['userDashboardStats'],
    queryFn: dashboardAPI.getUserStats,
    refetchInterval: 30000,
  });

  if (statsLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="large" text="Loading dashboard..." />
      </div>
    );
  }

  const dashboardStats = stats?.data || {};
  const overview = dashboardStats.overview || {};
  const recentActivity = dashboardStats.recentActivity || {};

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-600">
              Here's what's happening with your items and claims
            </p>
          </div>
          <div className="flex space-x-3">
            <Link to="/create-item" className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Report Item
            </Link>
            {overview.unreadNotifications > 0 && (
              <Link to="/notifications" className="btn-secondary relative">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {overview.unreadNotifications}
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="My Items"
          value={overview.myTotalItems || 0}
          icon={<Package className="w-8 h-8 text-primary-600" />}
          trend={`${overview.myActiveItems || 0} active`}
          color="primary"
        />
        <StatsCard
          title="My Claims"
          value={overview.myClaims || 0}
          icon={<FileText className="w-8 h-8 text-blue-600" />}
          trend="Submitted claims"
          color="blue"
        />
        <StatsCard
          title="Returned Items"
          value={overview.myReturnedItems || 0}
          icon={<CheckCircle className="w-8 h-8 text-success-600" />}
          trend="Successfully returned"
          color="success"
        />
        <StatsCard
          title="Notifications"
          value={overview.unreadNotifications || 0}
          icon={<Bell className="w-8 h-8 text-warning-600" />}
          trend="Unread messages"
          color="warning"
        />
      </div>

      {/* Lost vs Found Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">My Items Breakdown</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Lost Items</span>
              <span className="font-semibold text-red-600">{overview.myLostItems || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Found Items</span>
              <span className="font-semibold text-green-600">{overview.myFoundItems || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Items</span>
              <span className="font-semibold text-blue-600">{overview.myActiveItems || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Claimed Items</span>
              <span className="font-semibold text-purple-600">{overview.myClaimedItems || 0}</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <Link to="/my-items" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View all my items →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link to="/create-item" className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors">
              <Plus className="w-5 h-5 text-primary-600 mr-3" />
              <div>
                <div className="font-medium text-gray-900">Report Lost/Found Item</div>
                <div className="text-sm text-gray-600">Create a new item report</div>
              </div>
            </Link>
            <Link to="/items" className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors">
              <Package className="w-5 h-5 text-primary-600 mr-3" />
              <div>
                <div className="font-medium text-gray-900">Browse Items</div>
                <div className="text-sm text-gray-600">Search for your lost items</div>
              </div>
            </Link>
            <Link to="/my-claims" className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors">
              <FileText className="w-5 h-5 text-primary-600 mr-3" />
              <div>
                <div className="font-medium text-gray-900">My Claims</div>
                <div className="text-sm text-gray-600">Track your claim status</div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Items</h3>
          {recentActivity.items && recentActivity.items.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.items.slice(0, 5).map((item) => (
                <div key={item._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{item.title}</div>
                    <div className="text-sm text-gray-600">
                      {item.type === 'lost' ? '🔍 Lost' : '📦 Found'} • {item.category} • {item.location}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`badge ${
                      item.status === 'active' ? 'badge-primary' :
                      item.status === 'claimed' ? 'badge-warning' :
                      item.status === 'returned' ? 'badge-success' : 'badge-gray'
                    }`}>
                      {item.status}
                    </div>
                  </div>
                </div>
              ))}
              <Link to="/my-items" className="block text-center text-primary-600 hover:text-primary-700 text-sm font-medium">
                View all items →
              </Link>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No items reported yet</p>
              <Link to="/create-item" className="text-primary-600 hover:text-primary-700 text-sm">
                Report your first item
              </Link>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Claims</h3>
          {recentActivity.claims && recentActivity.claims.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.claims.slice(0, 5).map((claimData, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{claimData.item.title}</div>
                    <div className="text-sm text-gray-600">
                      Claimed from {claimData.item.reportedBy?.name}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`badge ${
                      claimData.claim.status === 'pending' ? 'badge-warning' :
                      claimData.claim.status === 'verified' ? 'badge-success' :
                      'badge-danger'
                    }`}>
                      {claimData.claim.status}
                    </div>
                  </div>
                </div>
              ))}
              <Link to="/my-claims" className="block text-center text-primary-600 hover:text-primary-700 text-sm font-medium">
                View all claims →
              </Link>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No claims submitted yet</p>
              <Link to="/items" className="text-primary-600 hover:text-primary-700 text-sm">
                Browse items to claim
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Tips for Success</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-blue-900">Add detailed descriptions</div>
              <div className="text-sm text-blue-700">Include unique identifiers, colors, and brands</div>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-blue-900">Act quickly</div>
              <div className="text-sm text-blue-700">Report items as soon as possible for better chances</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
