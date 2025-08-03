import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { itemsAPI, claimsAPI } from '../services/api';
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

  // Fetch my items data
  const { data: itemsData, isLoading: itemsLoading, error: itemsError } = useQuery({
    queryKey: ['myItems', { type: '', status: '', page: 1, limit: 100 }],
    queryFn: () => itemsAPI.getMyItems({ type: '', status: '', page: 1, limit: 100 }),
    refetchInterval: 30000,
  });

  // Fetch my claims data
  const { data: claimsData, isLoading: claimsLoading, error: claimsError } = useQuery({
    queryKey: ['myClaims'],
    queryFn: claimsAPI.getMyClaims,
    refetchInterval: 30000,
  });

  const isLoading = itemsLoading || claimsLoading;
  const error = itemsError || claimsError;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="large" text="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Failed to load dashboard</h3>
          <p className="text-red-600">{error.message}</p>
          <p className="text-sm text-red-500 mt-2">Check the browser console and backend logs for more details.</p>
        </div>
      </div>
    );
  }

  // Process items data
  const items = itemsData?.data?.data || [];
  
  // Process claims data - handle the structure from MyClaimsPage
  let claims = [];
  if (claimsData) {
    if (Array.isArray(claimsData.data)) {
      claims = claimsData.data;
    } else if (Array.isArray(claimsData)) {
      claims = claimsData;
    } else if (claimsData.data && Array.isArray(claimsData.data.data)) {
      claims = claimsData.data.data;
    }
  }

  // Filter valid claims
  const validClaims = claims.filter(itemWithClaim => {
    return itemWithClaim && itemWithClaim.claim;
  });

  // Calculate stats from actual data
  const itemStats = items.reduce((acc, item) => {
    acc.total++;
    acc[item.type] = (acc[item.type] || 0) + 1;
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, { total: 0, lost: 0, found: 0, active: 0, claimed: 0, returned: 0 });

  const claimStats = validClaims.reduce((acc, itemWithClaim) => {
    const claim = itemWithClaim.claim;
    acc.total++;
    if (claim && claim.status) {
      acc[claim.status] = (acc[claim.status] || 0) + 1;
    }
    return acc;
  }, { total: 0, pending: 0, verified: 0, approved: 0, rejected: 0 });

  // Create overview object
  const overview = {
    myTotalItems: itemStats.total,
    myLostItems: itemStats.lost || 0,
    myFoundItems: itemStats.found || 0,
    myActiveItems: itemStats.active || 0,
    myClaimedItems: itemStats.claimed || 0,
    myReturnedItems: itemStats.returned || 0,
    myClaims: claimStats.total,
    pendingClaims: claimStats.pending || 0,
    approvedClaims: (claimStats.verified || 0) + (claimStats.approved || 0),
    rejectedClaims: claimStats.rejected || 0,
    unreadNotifications: 0 // You can implement this separately if needed
  };

  // Get recent items (last 5)
  const recentItems = items
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // Get recent claims (last 5)
  const recentClaims = validClaims
    .sort((a, b) => new Date(b.claim.createdAt) - new Date(a.claim.createdAt))
    .slice(0, 5);

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
          value={overview.myTotalItems}
          icon={<Package className="w-8 h-8 text-primary-600" />}
          trend={`${overview.myActiveItems} active`}
          color="primary"
        />
        <StatsCard
          title="My Claims"
          value={overview.myClaims}
          icon={<FileText className="w-8 h-8 text-blue-600" />}
          trend={`${overview.pendingClaims} pending`}
          color="blue"
        />
        <StatsCard
          title="Returned Items"
          value={overview.myReturnedItems}
          icon={<CheckCircle className="w-8 h-8 text-success-600" />}
          trend="Successfully returned"
          color="success"
        />
        <StatsCard
          title="Notifications"
          value={overview.unreadNotifications}
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
              <span className="font-semibold text-red-600">{overview.myLostItems}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Found Items</span>
              <span className="font-semibold text-green-600">{overview.myFoundItems}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Items</span>
              <span className="font-semibold text-blue-600">{overview.myActiveItems}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Claimed Items</span>
              <span className="font-semibold text-purple-600">{overview.myClaimedItems}</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <Link to="/my-items" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View all my items →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Claims Overview</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Claims</span>
              <span className="font-semibold text-gray-900">{overview.myClaims}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending</span>
              <span className="font-semibold text-yellow-600">{overview.pendingClaims}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Approved</span>
              <span className="font-semibold text-green-600">{overview.approvedClaims}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Rejected</span>
              <span className="font-semibold text-red-600">{overview.rejectedClaims}</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <Link to="/my-claims" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View all claims →
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/create-item" className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors">
            <Plus className="w-6 h-6 text-primary-600 mr-3" />
            <div>
              <div className="font-medium text-gray-900">Report Lost/Found Item</div>
              <div className="text-sm text-gray-600">Create a new item report</div>
            </div>
          </Link>
          <Link to="/items" className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors">
            <Package className="w-6 h-6 text-primary-600 mr-3" />
            <div>
              <div className="font-medium text-gray-900">Browse Items</div>
              <div className="text-sm text-gray-600">Search for your lost items</div>
            </div>
          </Link>
          <Link to="/my-claims" className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors">
            <FileText className="w-6 h-6 text-primary-600 mr-3" />
            <div>
              <div className="font-medium text-gray-900">My Claims</div>
              <div className="text-sm text-gray-600">Track your claim status</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Items</h3>
          {recentItems && recentItems.length > 0 ? (
            <div className="space-y-3">
              {recentItems.map((item) => (
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
          {recentClaims && recentClaims.length > 0 ? (
            <div className="space-y-3">
              {recentClaims.map((claimData, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{claimData.title || 'Unknown Item'}</div>
                    <div className="text-sm text-gray-600">
                      Claimed {claimData.reportedBy?.name ? `from ${claimData.reportedBy.name}` : ''}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`badge ${
                      claimData.claim.status === 'pending' ? 'badge-warning' :
                      claimData.claim.status === 'verified' ? 'badge-success' :
                      claimData.claim.status === 'approved' ? 'badge-success' :
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