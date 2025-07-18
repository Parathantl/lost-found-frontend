// src/components/Staff/StaffAnalytics.js
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { staffAPI } from '../../services/api';
import LoadingSpinner from '../UI/LoadingSpinner';
import StatsCard from '../Dashboard/StatsCard';
import { 
  TrendingUp, 
  MapPin, 
  BarChart3, 
  Clock,
  Package,
  Calendar,
  Users,
  Target,
  Download,
  Share2,
  AlertCircle,
  CheckCircle,
  Activity
} from 'lucide-react';

function StaffAnalytics() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('30');

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['staffLocationAnalytics', timeRange],
    queryFn: () => staffAPI.getLocationAnalytics(timeRange),
    keepPreviousData: true,
  });
  
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['staffDashboardStats', timeRange],
    queryFn: () => staffAPI.getDashboardStats(timeRange),
  });  

  const analytics = analyticsData?.data?.data || {};
  const stats = statsData?.data?.data || {};
  const isLoading = analyticsLoading || statsLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="large" text="Loading analytics..." />
      </div>
    );
  }

  const generateInsights = () => {
    const insights = [];
    
    if (stats.overview?.successRate > 70) {
      insights.push({ type: 'success', message: `Excellent success rate of ${stats.overview.successRate}%` });
    } else if (stats.overview?.successRate > 40) {
      insights.push({ type: 'warning', message: 'Moderate success rate - room for improvement' });
    } else {
      insights.push({ type: 'danger', message: 'Low success rate - requires attention' });
    }

    if (stats.performance?.avgResponseTime < 3) {
      insights.push({ type: 'success', message: 'Fast response time - great customer service' });
    } else if (stats.performance?.avgResponseTime < 7) {
      insights.push({ type: 'warning', message: 'Moderate response time - consider optimization' });
    } else {
      insights.push({ type: 'danger', message: 'Slow response time - needs improvement' });
    }

    const pendingClaims = stats.overview?.pendingClaims;

    if (pendingClaims === 0) {
      insights.push({ type: 'success', message: 'All claims processed - excellent work!' });
    } else if (pendingClaims > 0) {
      insights.push({ type: 'info', message: `${pendingClaims} claims pending review` });
    } else {
      insights.push({ type: 'info', message: 'Pending claims data not available' });
    }    

    return insights;
  };

  const generateRecommendations = () => {
    const recommendations = [];
    
    if (analytics.peakHours && analytics.peakHours.length > 0) {
      recommendations.push(`Peak activity: ${analytics.peakHours[0]._id}:00 - schedule accordingly`);
    }
    
    if (analytics.topCategories && analytics.topCategories[0]) {
      recommendations.push(`Most common: ${analytics.topCategories[0]._id} items`);
    }
    
    recommendations.push('Focus on processing pending claims quickly');
    recommendations.push('Maintain detailed verification records');
    recommendations.push('Encourage user feedback for continuous improvement');
    
    if (stats.performance?.avgResponseTime > 5) {
      recommendations.push('Consider streamlining the claim verification process');
    }
    
    return recommendations;
  };

  const insights = generateInsights();
  const recommendations = generateRecommendations();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Location Analytics</h1>
          <div className="flex items-center mt-1 text-gray-600">
            <MapPin className="w-4 h-4 mr-1" />
            <span>Analyzing data for: <strong>{analytics.location || user?.branch}</strong></span>
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
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      {/* Key Performance Metrics */}
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
          icon={<Target className="w-8 h-8 text-success-600" />}
          trend="Items successfully returned"
          color="success"
        />
        <StatsCard
          title="Response Time"
          value={`${stats.performance?.avgResponseTime || 0}d`}
          icon={<Clock className="w-8 h-8 text-blue-600" />}
          trend="Average time to claim"
          color="blue"
        />
        <StatsCard
          title="Active Claims"
          value={stats.overview?.pendingClaims || 0}
          icon={<Users className="w-8 h-8 text-warning-600" />}
          trend="Requiring attention"
          color="warning"
        />
      </div>

      {/* Category Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Common Categories</h3>
          {analytics.topCategories && analytics.topCategories.length > 0 ? (
            <div className="space-y-3">
              {analytics.topCategories.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded mr-3" style={{
                      backgroundColor: `hsl(${index * 45}, 70%, 50%)`
                    }} />
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {category._id}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      {category.count} total
                    </div>
                    <div className="text-xs text-gray-500">
                      {category.recent} recent
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No category data available</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Peak Activity Hours</h3>
          {analytics.peakHours && analytics.peakHours.length > 0 ? (
            <div className="space-y-3">
              {analytics.peakHours.map((hour, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-blue-500 mr-2" />
                    <span className="text-sm font-medium text-gray-900">
                      {hour._id}:00 - {hour._id + 1}:00
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${(hour.count / analytics.peakHours[0].count) * 100}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {hour.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No peak hours data available</p>
          )}
        </div>
      </div>

      {/* Weekly Trends */}
      {analytics.weeklyTrends && analytics.weeklyTrends.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Trends</h3>
          <div className="space-y-3">
            {analytics.weeklyTrends.map((week, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">
                    Week {week._id.week} - {week._id.type} items
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`badge ${week._id.type === 'lost' ? 'badge-danger' : 'badge-success'}`}>
                    {week._id.type}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {week.count} items
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Insights */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {stats.performance?.avgResponseTime || 0}
            </div>
            <div className="text-sm text-blue-800 font-medium">Average Response Time</div>
            <div className="text-xs text-blue-600 mt-1">days to process claims</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {stats.performance?.minResponseTime || 0}
            </div>
            <div className="text-sm text-green-800 font-medium">Fastest Response</div>
            <div className="text-xs text-green-600 mt-1">best case scenario</div>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {stats.performance?.maxResponseTime || 0}
            </div>
            <div className="text-sm text-orange-800 font-medium">Slowest Response</div>
            <div className="text-xs text-orange-600 mt-1">needs improvement</div>
          </div>
        </div>
      </div>

      {/* Location Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Item Types Breakdown</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                <span className="font-medium text-red-900">Lost Items</span>
              </div>
              <span className="text-red-600 font-bold text-lg">
                {stats.breakdown?.lostItems || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="font-medium text-green-900">Found Items</span>
              </div>
              <span className="text-green-600 font-bold text-lg">
                {stats.breakdown?.foundItems || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-500 rounded-full mr-3"></div>
                <span className="font-medium text-gray-900">Total Items</span>
              </div>
              <span className="text-gray-600 font-bold text-lg">
                {stats.overview?.totalItems || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Items</span>
              <div className="flex items-center">
                <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ 
                      width: `${((stats.overview?.activeItems || 0) / (stats.overview?.totalItems || 1)) * 100}%` 
                    }}
                  />
                </div>
                <span className="font-semibold text-blue-600">{stats.overview?.activeItems || 0}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Claimed Items</span>
              <div className="flex items-center">
                <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-yellow-600 h-2 rounded-full" 
                    style={{ 
                      width: `${((stats.overview?.claimedItems || 0) / (stats.overview?.totalItems || 1)) * 100}%` 
                    }}
                  />
                </div>
                <span className="font-semibold text-yellow-600">{stats.overview?.claimedItems || 0}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Returned Items</span>
              <div className="flex items-center">
                <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ 
                      width: `${((stats.overview?.returnedItems || 0) / (stats.overview?.totalItems || 1)) * 100}%` 
                    }}
                  />
                </div>
                <span className="font-semibold text-green-600">{stats.overview?.returnedItems || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Insights & Recommendations */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">📊 Insights & Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-blue-900 mb-3">Performance Analysis</h4>
            <div className="space-y-2">
              {insights.map((insight, index) => (
                <div key={index} className="flex items-start space-x-2">
                  {insight.type === 'success' && <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />}
                  {insight.type === 'warning' && <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />}
                  {insight.type === 'danger' && <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />}
                  {insight.type === 'info' && <Activity className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />}
                  <span className="text-sm text-blue-800">{insight.message}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-blue-900 mb-3">Recommendations</h4>
            <div className="space-y-2">
              {recommendations.map((rec, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-blue-800">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}

export default StaffAnalytics;