// src/components/Staff/StaffDashboard.js
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { staffAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../UI/LoadingSpinner';
import StatsCard from '../Dashboard/StatsCard';
import { 
  Package, 
  FileText, 
  AlertCircle,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  Eye,
  User,
  Calendar,
  Bell,
  Settings,
  BarChart3,
  Activity,
  Filter
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function StaffDashboard() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('30');

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['staffDashboardStats', timeRange],
    queryFn: () => staffAPI.getDashboardStats(timeRange),
    refetchInterval: 30000,
  });  

  const { data: activityData, isLoading: activityLoading } = useQuery({
    queryKey: ['staffRecentActivity'],
    queryFn: () => staffAPI.getRecentActivity(15),
    refetchInterval: 30000,
  });  

  const { data: attentionData, isLoading: attentionLoading } = useQuery({
    queryKey: ['staffItemsRequiringAttention'],
    queryFn: staffAPI.getItemsRequiringAttention,
    refetchInterval: 60000,
  });

  const stats = statsData?.data?.data || {};
  const activities = activityData?.data?.data || [];
  const attention = attentionData?.data?.data || {};

  const isLoading = statsLoading || activityLoading || attentionLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="large" text="Loading dashboard..." />
      </div>
    );
  }

  const getActivityIcon = (type) => {
    const icons = {
      item_reported: Package,
      claim_submitted: FileText,
      item_returned: CheckCircle,
      claim_verified: CheckCircle,
      item_expired: AlertCircle,
    };
    return icons[type] || Package;
  };

  const getActivityColor = (type) => {
    const colors = {
      item_reported: 'text-blue-600 bg-blue-100',
      claim_submitted: 'text-yellow-600 bg-yellow-100',
      item_returned: 'text-green-600 bg-green-100',
      claim_verified: 'text-green-600 bg-green-100',
      item_expired: 'text-red-600 bg-red-100',
    };
    return colors[type] || 'text-gray-600 bg-gray-100';
  };

  const formatActivityMessage = (activity) => {
    const { type, data: activityData } = activity;
    
    switch (type) {
      case 'item_reported':
        return `New ${activityData.itemType} item: "${activityData.itemTitle}"`;
      case 'claim_submitted':
        return `Claim submitted for "${activityData.itemTitle}"`;
      case 'item_returned':
        return `Item returned: "${activityData.itemTitle}"`;
      case 'claim_verified':
        return `Claim verified for "${activityData.itemTitle}"`;
      case 'item_expired':
        return `Item expired: "${activityData.itemTitle}"`;
      default:
        return 'Unknown activity';
    }
  };

  const totalAttentionItems = (attention.counts?.pendingClaims || 0) + 
                              (attention.counts?.expired || 0) + 
                              (attention.counts?.expiringSoon || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard</h1>
          <div className="flex items-center mt-1 text-gray-600">
            <MapPin className="w-4 h-4 mr-1" />
            <span>Managing items for: <strong>{stats.location || user?.branch}</strong></span>
          </div>
          <div className="flex items-center mt-1 text-sm text-gray-500">
            <Activity className="w-4 h-4 mr-1" />
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="form-input"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 3 months</option>
          </select>
          <Link to="/staff/analytics" className="btn-primary">
            <BarChart3 className="w-4 h-4 mr-2" />
            View Analytics
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Items"
          value={stats.overview?.totalItems || 0}
          icon={<Package className="w-8 h-8 text-blue-600" />}
          trend={`${stats.overview?.recentItems || 0} new in ${timeRange} days`}
          color="blue"
        />
        <StatsCard
          title="Active Items"
          value={stats.overview?.activeItems || 0}
          icon={<Clock className="w-8 h-8 text-primary-600" />}
          trend="Currently active"
          color="primary"
        />
        <StatsCard
          title="Pending Claims"
          value={stats.overview?.pendingClaims || 0}
          icon={<FileText className="w-8 h-8 text-warning-600" />}
          trend="Requiring review"
          color="warning"
        />
        <StatsCard
          title="Success Rate"
          value={`${stats.overview?.successRate || 0}%`}
          icon={<CheckCircle className="w-8 h-8 text-success-600" />}
          trend="Items returned"
          color="success"
        />
      </div>

      {/* Attention Required Alert */}
      {totalAttentionItems > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start">
            <AlertCircle className="w-6 h-6 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                {totalAttentionItems} Items Requiring Attention
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-yellow-700 mb-4">
                {attention.counts?.pendingClaims > 0 && (
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    <strong>{attention.counts.pendingClaims}</strong> claims need review
                  </div>
                )}
                {attention.counts?.expired > 0 && (
                  <div className="flex items-center">
                    <XCircle className="w-4 h-4 mr-2" />
                    <strong>{attention.counts.expired}</strong> items have expired
                  </div>
                )}
                {attention.counts?.expiringSoon > 0 && (
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    <strong>{attention.counts.expiringSoon}</strong> items expiring soon
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                {attention.counts?.pendingClaims > 0 && (
                  <Link to="/staff/claims" className="btn-warning btn-sm">
                    <FileText className="w-4 h-4 mr-1" />
                    Review Claims
                  </Link>
                )}
                {(attention.counts?.expired > 0 || attention.counts?.expiringSoon > 0) && (
                  <Link to="/staff/items?filter=expired" className="btn-secondary btn-sm">
                    <Package className="w-4 h-4 mr-1" />
                    Manage Expired Items
                  </Link>
                )}
                <Link to="/staff/items" className="btn-primary btn-sm">
                  <Eye className="w-4 h-4 mr-1" />
                  View All Items
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Location Overview */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Overview</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                <span className="text-gray-600">Lost Items</span>
              </div>
              <span className="font-semibold text-red-600">{stats.breakdown?.lostItems || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-gray-600">Found Items</span>
              </div>
              <span className="font-semibold text-green-600">{stats.breakdown?.foundItems || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                <span className="text-gray-600">Claimed Items</span>
              </div>
              <span className="font-semibold text-yellow-600">{stats.overview?.claimedItems || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-gray-600">Returned Items</span>
              </div>
              <span className="font-semibold text-success-600">{stats.overview?.returnedItems || 0}</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <Link
              to="/staff/items"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Manage Items →
            </Link>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">
                {stats.performance?.avgResponseTime || 0}
              </div>
              <div className="text-sm text-blue-800 font-medium">Average Response Time</div>
              <div className="text-xs text-blue-600">days to process claims</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-xl font-bold text-green-600">
                  {stats.performance?.minResponseTime || 0}d
                </div>
                <div className="text-xs text-green-800">Fastest Response</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-xl font-bold text-orange-600">
                  {stats.performance?.maxResponseTime || 0}d
                </div>
                <div className="text-xs text-orange-800">Slowest Response</div>
              </div>
            </div>
            <div className="pt-3 border-t">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Success Rate:</span>
                <span className={`font-semibold ${
                  (stats.overview?.successRate || 0) > 70 ? 'text-green-600' :
                  (stats.overview?.successRate || 0) > 40 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {stats.overview?.successRate || 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {stats.breakdown?.categories && stats.breakdown.categories.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Items by Category</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.breakdown.categories.slice(0, 8).map((category, index) => (
              <div key={index} className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="text-2xl font-bold text-gray-900">{category.count}</div>
                <div className="text-sm text-gray-600 capitalize mb-1">{category._id}</div>
                <div className="text-xs text-gray-500">
                  <div>{category.active} active</div>
                  <div>{category.returned} returned</div>
                </div>
              </div>
            ))}
          </div>
          {stats.breakdown.categories.length > 8 && (
            <div className="mt-4 text-center">
              <Link
                to="/staff/analytics"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                View detailed breakdown →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <div className="flex items-center space-x-2">
            <div className="flex items-center text-sm text-gray-500">
              <Activity className="w-4 h-4 mr-1" />
              Location-based
            </div>
            <Link to="/staff/items" className="btn-secondary btn-sm">
              <Filter className="w-4 h-4 mr-1" />
              View All
            </Link>
          </div>
        </div>

        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-lg font-medium">No recent activity</p>
            <p className="text-sm">No activity in your location yet</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {activities.slice(0, 10).map((activity, index) => {
                const ActivityIcon = getActivityIcon(activity.type);
                const colorClasses = getActivityColor(activity.type);
                const message = formatActivityMessage(activity);

                return (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`p-2 rounded-lg ${colorClasses}`}>
                      <ActivityIcon className="w-4 h-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{message}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-xs text-gray-600">
                          by {activity.data.reportedBy?.name || activity.data.claimedBy?.name}
                        </p>
                        {activity.data.location && (
                          <>
                            <span className="text-gray-400">•</span>
                            <p className="text-xs text-gray-600">{activity.data.location}</p>
                          </>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                            {activity.timestamp && !isNaN(new Date(activity.timestamp)) 
                                ? formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })
                                : 'Unknown time'}
                            </p>

                    </div>

                    <div className="flex-shrink-0">
                      <span className={`badge ${
                        activity.data.itemType === 'lost' ? 'badge-danger' : 'badge-success'
                      }`}>
                        {activity.data.itemType}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {activities.length > 10 && (
              <div className="mt-4 pt-4 border-t text-center">
                <Link
                  to="/staff/items"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View All Activities →
                </Link>
              </div>
            )}
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/staff/claims"
            className="flex items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors border border-yellow-200"
          >
            <FileText className="w-8 h-8 text-yellow-600 mr-3" />
            <div>
              <div className="font-medium text-yellow-900">Review Claims</div>
              <div className="text-sm text-yellow-700">
                {attention.counts?.pendingClaims || 0} pending
              </div>
            </div>
          </Link>
          
          <Link
            to="/staff/items"
            className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
          >
            <Package className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <div className="font-medium text-blue-900">Manage Items</div>
              <div className="text-sm text-blue-700">Location-based items</div>
            </div>
          </Link>
          
          <Link
            to="/staff/analytics"
            className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors border border-green-200"
          >
            <BarChart3 className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <div className="font-medium text-green-900">View Analytics</div>
              <div className="text-sm text-green-700">Location insights</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Pending Items Requiring Action */}
      {(attention.pendingClaims?.length > 0 || attention.expiredItems?.length > 0 || attention.expiringSoon?.length > 0) && (
        <div className="space-y-4">
          {/* Pending Claims */}
          {attention.pendingClaims && attention.pendingClaims.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Pending Claims ({attention.pendingClaims.length})
              </h3>
              <div className="space-y-3">
                {attention.pendingClaims.slice(0, 3).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Package className="w-5 h-5 text-yellow-600" />
                      <div>
                        <div className="font-medium text-gray-900">{item.title}</div>
                        <div className="text-sm text-gray-600">{item.location}</div>
                      </div>
                    </div>
                    <Link
                      to="/staff/claims"
                      className="btn-warning btn-sm"
                    >
                      Review
                    </Link>
                  </div>
                ))}
                {attention.pendingClaims.length > 3 && (
                  <div className="text-center pt-2">
                    <Link
                      to="/staff/claims"
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      View all {attention.pendingClaims.length} pending claims →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Expired/Expiring Items */}
          {(attention.expiredItems?.length > 0 || attention.expiringSoon?.length > 0) && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Items Requiring Attention
              </h3>
              <div className="space-y-3">
                {/* Expired Items */}
                {attention.expiredItems?.slice(0, 2).map((item, index) => (
                  <div key={`expired-${index}`} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <div>
                        <div className="font-medium text-gray-900">{item.title}</div>
                        <div className="text-sm text-red-600">Expired on {new Date(item.expiryDate).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <span className="badge-danger">Expired</span>
                  </div>
                ))}
                
                {/* Expiring Soon Items */}
                {attention.expiringSoon?.slice(0, 2).map((item, index) => (
                  <div key={`expiring-${index}`} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-orange-600" />
                      <div>
                        <div className="font-medium text-gray-900">{item.title}</div>
                        <div className="text-sm text-orange-600">
                          Expires on {new Date(item.expiryDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <span className="badge-warning">Expiring Soon</span>
                  </div>
                ))}
                
                <div className="text-center pt-2">
                  <Link
                    to="/staff/items?filter=attention"
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Manage all attention items →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tips for Staff */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Staff Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-2">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-blue-900">Verify ownership carefully</div>
              <div className="text-sm text-blue-700">Check verification documents and ask detailed questions</div>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-blue-900">Process claims promptly</div>
              <div className="text-sm text-blue-700">Review pending claims within 24-48 hours</div>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <Bell className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-blue-900">Stay updated</div>
              <div className="text-sm text-blue-700">Check for expired items and send reminders</div>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <Settings className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-blue-900">Maintain records</div>
              <div className="text-sm text-blue-700">Keep detailed notes for all verifications</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StaffDashboard;