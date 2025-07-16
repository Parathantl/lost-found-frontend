import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from '../../services/api';
import LoadingSpinner from '../UI/LoadingSpinner';
import {
  Package,
  FileText,
  User,
  Clock,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function RecentActivity() {
  
  const { data, isLoading } = useQuery({
    queryKey: ['recentActivity'],
    queryFn: () => dashboardAPI.getActivity(20),
    refetchInterval: 30000,
  });

  // Helper function to safely format dates
  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const activities = data?.data?.data || [];

  const getActivityIcon = (type) => {
    const icons = {
      item_reported: Package,
      claim_submitted: FileText,
      user_registered: User,
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
      user_registered: 'text-green-600 bg-green-100',
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
        return {
          message: `New ${activityData?.itemType || 'unknown'} item reported: "${activityData?.itemTitle || 'Unknown item'}"`,
          subtitle: `by ${activityData?.reportedBy?.name || 'Unknown user'} in ${activityData?.location || 'Unknown location'}`,
        };
      case 'claim_submitted':
        return {
          message: `Claim submitted for "${activityData?.itemTitle || 'Unknown item'}"`,
          subtitle: `by ${activityData?.claimedBy?.name || 'Unknown user'} - Status: ${activityData?.claimStatus || 'Unknown'}`,
        };
      case 'user_registered':
        return {
          message: `New user registered: ${activityData?.userName || 'Unknown user'}`,
          subtitle: `Role: ${activityData?.userRole || 'Unknown role'}`,
        };
      case 'item_returned':
        return {
          message: `Item successfully returned: "${activityData?.itemTitle || 'Unknown item'}"`,
          subtitle: `to ${activityData?.returnedTo?.name || 'Unknown user'}`,
        };
      case 'claim_verified':
        return {
          message: `Claim verified for "${activityData?.itemTitle || 'Unknown item'}"`,
          subtitle: `Claimant: ${activityData?.claimedBy?.name || 'Unknown user'}`,
        };
      case 'item_expired':
        return {
          message: `Item expired: "${activityData?.itemTitle || 'Unknown item'}"`,
          subtitle: `Reported by ${activityData?.reportedBy?.name || 'Unknown user'}`,
        };
      default:
        return {
          message: 'Unknown activity',
          subtitle: '',
        };
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <LoadingSpinner size="large" text="Loading recent activity..." />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
      {activities.length === 0 ? (
        <p className="text-gray-600 text-sm">No recent activity yet.</p>
      ) : (
        <div className="space-y-4">
          {activities.map((activity, idx) => {
            const Icon = getActivityIcon(activity.type);
            const colorClass = getActivityColor(activity.type);
            const { message, subtitle } = formatActivityMessage(activity);
            const timestamp = formatDate(activity.timestamp);

            return (
              <div
                key={activity._id || `activity-${idx}`}
                className="flex items-start space-x-4 border-b pb-4 last:border-b-0 last:pb-0"
              >
                <div className={`p-2 rounded-full ${colorClass}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{message}</p>
                  {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
                </div>
                <div className="flex-shrink-0 text-xs text-gray-400">
                  <Clock className="inline w-3 h-3 mr-1" />
                  {timestamp}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default RecentActivity;