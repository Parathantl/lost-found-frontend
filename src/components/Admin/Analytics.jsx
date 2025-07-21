// src/components/Admin/Analytics.js
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from '../../services/api';
import LoadingSpinner from '../UI/LoadingSpinner';
import StatsCard from '../Dashboard/StatsCard';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Calendar,
  MapPin,
  Package,
  Users,
  FileText,
  Clock
} from 'lucide-react';

function Analytics() {
  const [timeRange, setTimeRange] = useState('30');
  // const [exportFormat, setExportFormat] = useState('json');

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboardStats', timeRange],
    queryFn: () => dashboardAPI.getStats(timeRange),
    keepPreviousData: true,
  });
  
  const { data: locationData, isLoading: locationLoading } = useQuery({
    queryKey: ['locationStats'],
    queryFn: () => dashboardAPI.getLocationStats(),
  });
  
  const stats = statsData?.data?.data || {};
  const locationStats = locationData?.data?.data || [];

  if (statsLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="large" text="Loading analytics..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-600 mt-1">
            System performance and usage statistics
          </p>
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
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Items"
          value={stats.overview?.totalItems || 0}
          icon={<Package className="w-8 h-8 text-primary-600" />}
          trend={`${stats.overview?.recentItems || 0} new in ${timeRange} days`}
          color="primary"
        />
        <StatsCard
          title="Success Rate"
          value={`${stats.overview?.successRate || 0}%`}
          icon={<TrendingUp className="w-8 h-8 text-success-600" />}
          trend="Items returned to owners"
          color="success"
        />
        <StatsCard
          title="Active Users"
          value={stats.overview?.totalUsers || 0}
          icon={<Users className="w-8 h-8 text-blue-600" />}
          trend="Platform users"
          color="blue"
        />
        <StatsCard
          title="Avg Response"
          value={`${stats.performance?.avgResponseTime || 0}d`}
          icon={<Clock className="w-8 h-8 text-warning-600" />}
          trend="Time to claim"
          color="warning"
        />
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Items by Category</h3>
          {stats.breakdown?.categories && stats.breakdown.categories.length > 0 ? (
            <div className="space-y-3">
              {stats.breakdown.categories.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-primary-600 rounded mr-3" style={{
                      backgroundColor: `hsl(${index * 360 / stats.breakdown.categories.length}, 70%, 50%)`
                    }} />
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {category._id}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      {category.count}
                    </div>
                    <div className="text-xs text-gray-500">
                      {category.active} active
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No category data available</p>
          )}
        </div>

        {/* Location Hotspots */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Locations</h3>
          {locationLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="default" />
            </div>
          ) : locationStats.length > 0 ? (
            <div className="space-y-3">
              {locationStats.slice(0, 8).map((location, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center flex-1 min-w-0">
                    <MapPin className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-900 truncate">
                      {location._id}
                    </span>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-sm font-semibold text-gray-900">
                      {location.total}
                    </div>
                    <div className="text-xs text-gray-500">
                      {location.lost}L / {location.found}F
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No location data available</p>
          )}
        </div>
      </div>

      {/* Performance Metrics */}
      {stats.performance && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {stats.performance.avgResponseTime || 0}
              </div>
              <div className="text-sm text-blue-800 font-medium">Average Response Time</div>
              <div className="text-xs text-blue-600 mt-1">days to claim</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {stats.performance.minResponseTime || 0}
              </div>
              <div className="text-sm text-green-800 font-medium">Fastest Response</div>
              <div className="text-xs text-green-600 mt-1">days (best case)</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {stats.performance.maxResponseTime || 0}
              </div>
              <div className="text-sm text-orange-800 font-medium">Slowest Response</div>
              <div className="text-xs text-orange-600 mt-1">days (worst case)</div>
            </div>
          </div>
        </div>
      )}

      {/* Daily Trends */}
      {stats.trends?.daily && stats.trends.daily.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Activity Trends</h3>
          <div className="space-y-2">
            {stats.trends.daily.slice(-7).map((day, index) => {
              const date = new Date(day._id.date);
              return (
                <div key={index} className="flex items-center justify-between py-2">
                  <div className="text-sm text-gray-600">
                    {date.toLocaleDateString()}
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm">
                      <span className="text-red-600">{day._id.type === 'lost' ? day.count : 0} Lost</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-green-600">{day._id.type === 'found' ? day.count : 0} Found</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Data Export */}
      {/* <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Export</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="form-label">Export Format</label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="form-input"
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
            </select>
          </div>
          <div className="flex items-end">
            <div className="space-y-2 w-full">
              <label className="form-label">Available Exports</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleExport('users')}
                  className="btn-secondary btn-sm"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Users
                </button>
                <button
                  onClick={() => handleExport('items')}
                  className="btn-secondary btn-sm"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Items
                </button>
                <button
                  onClick={() => handleExport('claims')}
                  className="btn-secondary btn-sm"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Claims
                </button>
              </div>
            </div>
          </div>
        </div>
      </div> */}

      {/* System Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Item Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Items</span>
              <span className="font-semibold">{stats.overview?.totalItems || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active Items</span>
              <span className="font-semibold text-blue-600">{stats.overview?.activeItems || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Claimed Items</span>
              <span className="font-semibold text-yellow-600">{stats.overview?.claimedItems || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Returned Items</span>
              <span className="font-semibold text-green-600">{stats.overview?.returnedItems || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pending Claims</span>
              <span className="font-semibold text-orange-600">{stats.overview?.pendingClaims || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Success Rate</span>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  (stats.overview?.successRate || 0) > 70 ? 'bg-green-500' : 
                  (stats.overview?.successRate || 0) > 40 ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <span className="font-semibold">{stats.overview?.successRate || 0}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Response Time</span>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  (stats.performance?.avgResponseTime || 0) < 3 ? 'bg-green-500' : 
                  (stats.performance?.avgResponseTime || 0) < 7 ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <span className="font-semibold">{stats.performance?.avgResponseTime || 0} days</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Active Users</span>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2 bg-blue-500" />
                <span className="font-semibold">{stats.overview?.totalUsers || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;