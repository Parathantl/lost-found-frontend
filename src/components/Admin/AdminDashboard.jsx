// src/components/Admin/AdminDashboard.js
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { dashboardAPI, adminAPI } from '../../services/api';
import LoadingSpinner from '../UI/LoadingSpinner';
import StatsCard from '../Dashboard/StatsCard';
import RecentActivity from './RecentActivity';
import { 
  Users, 
  Package, 
  FileText, 
  AlertCircle,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Settings,
  BarChart3,
  Shield // NEW: Police handover icon
} from 'lucide-react';

function AdminDashboard() {

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['adminDashboardStats'],
    queryFn: dashboardAPI.getStats,
    refetchInterval: 30000,
  });
  
  const { data: overviewData, isLoading: overviewLoading } = useQuery({
    queryKey: ['systemOverview'],
    queryFn: adminAPI.getOverview,
    refetchInterval: 60000,
  });
  
  const stats = statsData?.data?.data || {};
  const overview = overviewData?.data?.data || {};

  const isLoading = statsLoading || overviewLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="large" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            System overview and management
          </p>
        </div>
        <div className="flex space-x-3">
          <Link to="/admin/analytics" className="btn-secondary">
            <BarChart3 className="w-4 h-4 mr-2" />
            View Analytics
          </Link>
          {/* <Link to="/admin/settings" className="btn-primary">
            <Settings className="w-4 h-4 mr-2" />
            System Settings
          </Link> */}
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${overview.health?.userRegistrations ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-700">User Registrations</span>
          </div>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${overview.health?.itemActivity ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-700">Item Activity</span>
          </div>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${overview.health?.claimProcessing ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-700">Claim Processing</span>
          </div>
          {/* NEW: Police Handover Health */}
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${overview.health?.policeHandover !== false ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <span className="text-sm text-gray-700">Police Handover</span>
          </div>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${!overview.health?.expiredItemsNeedAttention ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <span className="text-sm text-gray-700">System Status</span>
          </div>
        </div>
        <div className="mt-4 text-right">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            overview.systemStatus === 'operational' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {overview.systemStatus || 'Unknown'}
          </span>
        </div>
      </div>

      {/* Key Metrics - Updated with Police Handover */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatsCard
          title="Total Users"
          value={overview.users?.total || 0}
          icon={<Users className="w-8 h-8 text-primary-600" />}
          trend={`${overview.users?.recentRegistrations || 0} new this week`}
          color="primary"
        />
        <StatsCard
          title="Active Items"
          value={stats.overview?.activeItems || 0}
          icon={<Package className="w-8 h-8 text-blue-600" />}
          trend={`${stats.overview?.recentItems || 0} reported recently`}
          color="blue"
        />
        <StatsCard
          title="Pending Claims"
          value={stats.overview?.pendingClaims || overview.items?.pendingClaims || 0}
          icon={<FileText className="w-8 h-8 text-warning-600" />}
          trend="Requiring review"
          color="warning"
        />
        {/* NEW: Police Handover Stats */}
        <StatsCard
          title="Police Handover"
          value={stats.overview?.handedOverToPolice || stats.policeHandover?.totalHandedOver || 0}
          icon={<Shield className="w-8 h-8 text-orange-600" />}
          trend={`${stats.overview?.itemsAwaitingHandover || stats.policeHandover?.awaitingHandover || 0} awaiting`}
          color="orange"
        />
        <StatsCard
          title="Success Rate"
          value={`${stats.overview?.successRate || 0}%`}
          icon={<TrendingUp className="w-8 h-8 text-success-600" />}
          trend="Items returned to owners"
          color="success"
        />
      </div>

      {/* Enhanced Statistics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Overview */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Overview</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Users</span>
              <span className="font-semibold text-gray-900">{overview.users?.total || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Users</span>
              <span className="font-semibold text-green-600">{overview.users?.active || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Staff Members</span>
              <span className="font-semibold text-blue-600">{overview.users?.staff || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Administrators</span>
              <span className="font-semibold text-purple-600">{overview.users?.admins || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">New This Week</span>
              <span className="font-semibold text-primary-600">{overview.users?.recentRegistrations || 0}</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <Link
              to="/admin/users"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Manage Users →
            </Link>
          </div>
        </div>

        {/* Item Statistics */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Item Statistics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Items</span>
              <span className="font-semibold text-gray-900">{stats.overview?.totalItems || overview.items?.total || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Lost Items</span>
              <span className="font-semibold text-red-600">{stats.breakdown?.lostItems || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Found Items</span>
              <span className="font-semibold text-green-600">{stats.breakdown?.foundItems || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Claimed Items</span>
              <span className="font-semibold text-yellow-600">{stats.overview?.claimedItems || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Returned Items</span>
              <span className="font-semibold text-success-600">{stats.overview?.returnedItems || 0}</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <Link
              to="/admin/items"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Manage Items →
            </Link>
          </div>
        </div>

        {/* NEW: Police Handover Overview */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="w-5 h-5 text-orange-600 mr-2" />
            Police Handover
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Handed Over</span>
              <span className="font-semibold text-orange-600">{stats.overview?.handedOverToPolice || stats.policeHandover?.totalHandedOver || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Awaiting Handover</span>
              <span className="font-semibold text-yellow-600">{stats.overview?.itemsAwaitingHandover || stats.policeHandover?.awaitingHandover || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Recent Handovers</span>
              <span className="font-semibold text-blue-600">{stats.overview?.policeHandoverRecentItems || stats.policeHandover?.recentHandovers || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Handover Rate</span>
              <span className="font-semibold text-green-600">{stats.overview?.policeHandoverRate || stats.policeHandover?.handoverRate || 0}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Avg. Processing Time</span>
              <span className="font-semibold text-purple-600">{stats.performance?.avgDaysToHandover || 0} days</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <Link
              to="/admin/items?handedOverToPolice=true"
              className="text-orange-600 hover:text-orange-700 text-sm font-medium"
            >
              View Police Items →
            </Link>
          </div>
        </div>
      </div>

      {/* Branch Overview */}
      {overview.branches && overview.branches.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Branch Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {overview.branches.map((branch, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{branch._id || 'Unknown Branch'}</h4>
                  <span className="badge-primary">{branch.count} staff</span>
                </div>
                <div className="text-sm text-gray-600">
                  <span>{branch.admins} admin{branch.admins !== 1 ? 's' : ''}</span>
                  <span className="mx-2">•</span>
                  <span>{branch.staff} staff member{branch.staff !== 1 ? 's' : ''}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Critical Alerts */}
      {(overview.items?.expiredItems > 0 || (stats.overview?.itemsAwaitingHandover || 0) > 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start">
            <AlertCircle className="w-6 h-6 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">Attention Required</h3>
              <div className="space-y-2 text-sm text-yellow-700">
                {overview.items?.expiredItems > 0 && (
                  <p>
                    <strong>{overview.items.expiredItems}</strong> items have expired and need attention.
                  </p>
                )}
                <p>
                  <strong>{stats.overview?.pendingClaims || 0}</strong> claims are pending review.
                </p>
                {/* NEW: Police handover alert */}
                {(stats.overview?.itemsAwaitingHandover || 0) > 0 && (
                  <p>
                    <strong>{stats.overview.itemsAwaitingHandover}</strong> expired found items need police handover.
                  </p>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link to="/admin/items" className="btn-warning btn-sm">
                  Review Items
                </Link>
                <Link to="/admin/items?filter=pending-claims" className="btn-secondary btn-sm">
                  Review Claims
                </Link>
                {/* NEW: Police handover action */}
                {(stats.overview?.itemsAwaitingHandover || 0) > 0 && (
                  <Link to="/admin/items?status=expired&type=found&handedOverToPolice=false" className="btn-orange btn-sm">
                    <Shield className="w-4 h-4 mr-1" />
                    Police Handover
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Performance Metrics */}
      {stats.performance && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {stats.performance.avgResponseTime || 0} days
              </div>
              <div className="text-sm text-gray-600">Average Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {stats.performance.minResponseTime || 0} days
              </div>
              <div className="text-sm text-gray-600">Fastest Response</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {stats.performance.maxResponseTime || 0} days
              </div>
              <div className="text-sm text-gray-600">Slowest Response</div>
            </div>
            {/* NEW: Police handover performance metrics */}
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {stats.performance.avgDaysToHandover || 0} days
              </div>
              <div className="text-sm text-gray-600">Avg. Police Handover</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {stats.performance.minDaysToHandover || 0} days
              </div>
              <div className="text-sm text-gray-600">Fastest Handover</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {stats.performance.maxDaysToHandover || 0} days
              </div>
              <div className="text-sm text-gray-600">Longest Handover</div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <RecentActivity />

      {/* Enhanced Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Link
            to="/admin/users"
            className="flex items-center p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
          >
            <Users className="w-8 h-8 text-primary-600 mr-3" />
            <div>
              <div className="font-medium text-primary-900">Manage Users</div>
              <div className="text-sm text-primary-700">Add, edit, or remove users</div>
            </div>
          </Link>
          
          <Link
            to="/admin/items"
            className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Package className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <div className="font-medium text-blue-900">Review Items</div>
              <div className="text-sm text-blue-700">Moderate reported items</div>
            </div>
          </Link>

          {/* NEW: Police Handover Quick Action */}
          <Link
            to="/admin/items?status=expired&type=found&handedOverToPolice=false"
            className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
          >
            <Shield className="w-8 h-8 text-orange-600 mr-3" />
            <div>
              <div className="font-medium text-orange-900">Police Handover</div>
              <div className="text-sm text-orange-700">Manage expired items</div>
            </div>
          </Link>
          
          <Link
            to="/admin/analytics"
            className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <BarChart3 className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <div className="font-medium text-green-900">View Analytics</div>
              <div className="text-sm text-green-700">System reports and trends</div>
            </div>
          </Link>
          
          <Link
            to="/admin/settings"
            className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Settings className="w-8 h-8 text-gray-600 mr-3" />
            <div>
              <div className="font-medium text-gray-900">System Settings</div>
              <div className="text-sm text-gray-700">Configure system options</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;