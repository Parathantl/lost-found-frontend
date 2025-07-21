import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { notificationsAPI } from '../services/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Pagination from '../components/UI/Pagination';
import toast from 'react-hot-toast';
import { 
  Bell, 
  BellOff, 
  Check, 
  CheckCheck, 
  Eye,
  Filter,
  Package,
  FileText,
  AlertCircle,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function NotificationsPage() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    unreadOnly: false,
  });

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['notifications', filters],
    queryFn: () => notificationsAPI.getNotifications(filters),
    keepPreviousData: true,
  });
  
  const markAsReadMutation = useMutation({
    mutationFn: notificationsAPI.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['userDashboardStats'] });
    },
    onError: (error) => {
      toast.error('Failed to mark notification as read');
      console.error('Error marking notification as read:', error);
    },
  });
  
  const markAllAsReadMutation = useMutation({
    mutationFn: notificationsAPI.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['userDashboardStats'] });
      toast.success('All notifications marked as read');
    },
    onError: (error) => {
      toast.error('Failed to mark all notifications as read');
      console.error('Error marking all notifications as read:', error);
    },
  });

  const handleMarkAsRead = (notificationId) => {
    markAsReadMutation.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handlePageChange = (page) => {
    setFilters({ ...filters, page });
    window.scrollTo(0, 0);
  };

  const notifications = data?.data?.notifications || [];
  const pagination = data?.data?.pagination || {};

  const getNotificationIcon = (type) => {
    const icons = {
      match_found: Package,
      claim_submitted: FileText,
      claim_approved: CheckCheck,
      claim_rejected: AlertCircle,
      item_returned: Package,
      deadline_reminder: Clock,
      claim_verified: CheckCheck,
      item_expired: AlertCircle,
    };
    return icons[type] || Bell;
  };

  const getNotificationColor = (type) => {
    const colors = {
      match_found: 'text-blue-600',
      claim_submitted: 'text-yellow-600',
      claim_approved: 'text-green-600',
      claim_rejected: 'text-red-600',
      item_returned: 'text-green-600',
      deadline_reminder: 'text-orange-600',
      claim_verified: 'text-green-600',
      item_expired: 'text-red-600',
    };
    return colors[type] || 'text-gray-600';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="large" text="Loading notifications..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800">Failed to load notifications. Please try again.</p>
        <p className="text-red-600 text-sm mt-2">Error: {error.message}</p>
        <button 
          onClick={() => queryClient.invalidateQueries({ queryKey: ['notifications'] })}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">
            Stay updated with your items and claims
          </p>
        </div>
        {pagination.unread > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={markAllAsReadMutation.isLoading}
            className="btn-secondary"
          >
            {markAllAsReadMutation.isLoading ? (
              <LoadingSpinner size="small" />
            ) : (
              <>
                <CheckCheck className="w-4 h-4 mr-2" />
                Mark All Read
              </>
            )}
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <Bell className="w-8 h-8 text-primary-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-900">{pagination.total || 0}</p>
              <p className="text-sm text-gray-600">Total Notifications</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <BellOff className="w-8 h-8 text-warning-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-900">{pagination.unread || 0}</p>
              <p className="text-sm text-gray-600">Unread</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <Check className="w-8 h-8 text-success-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-900">{(pagination.total || 0) - (pagination.unread || 0)}</p>
              <p className="text-sm text-gray-600">Read</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.unreadOnly}
                onChange={(e) => setFilters({ ...filters, unreadOnly: e.target.checked, page: 1 })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Show unread only</span>
            </label>
            <button
              onClick={() => setFilters({ ...filters, unreadOnly: false, page: 1 })}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Clear filters
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filters.unreadOnly ? 'No unread notifications' : 'No notifications yet'}
          </h3>
          <p className="text-gray-600 mb-4">
            {filters.unreadOnly 
              ? 'All caught up! Check back later for new updates.'
              : 'Notifications about your items and claims will appear here'
            }
          </p>
          {filters.unreadOnly && (
            <button
              onClick={() => setFilters({ ...filters, unreadOnly: false })}
              className="btn-secondary"
            >
              Show All Notifications
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {notifications.map((notification) => {
              const NotificationIcon = getNotificationIcon(notification.type);
              const iconColor = getNotificationColor(notification.type);

              return (
                <div
                  key={notification._id}
                  className={`bg-white rounded-lg shadow-sm border p-4 transition-colors ${
                    !notification.read ? 'border-l-4 border-l-primary-500 bg-primary-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-lg ${!notification.read ? 'bg-primary-100' : 'bg-gray-100'}`}>
                      <NotificationIcon className={`w-5 h-5 ${iconColor}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </h4>
                          <p className={`text-sm mt-1 ${!notification.read ? 'text-gray-800' : 'text-gray-600'}`}>
                            {notification.message}
                          </p>
                          
                          <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                            <span>{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</span>
                            
                            {notification.relatedItem && (
                              <Link
                                to={`/items/${notification.relatedItem._id}`}
                                className="text-primary-600 hover:text-primary-700 flex items-center"
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                View Item
                              </Link>
                            )}
                            
                            {notification.relatedUser && (
                              <span className="text-gray-500">
                                by {notification.relatedUser.name}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          {!notification.read && (
                            <button
                              onClick={() => handleMarkAsRead(notification._id)}
                              disabled={markAsReadMutation.isLoading}
                              className="text-primary-600 hover:text-primary-700 p-1"
                              title="Mark as read"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          {notification.read && (
                            <span className="text-green-600" title="Read">
                              <Check className="w-4 h-4" />
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {notification.relatedItem && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-medium text-gray-700">Item:</span> 
                              <span className="ml-1 text-gray-900">{notification.relatedItem.title}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                notification.relatedItem.type === 'lost' 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {notification.relatedItem.type}
                              </span>
                              <span>•</span>
                              <span>{notification.relatedItem.location}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <Pagination
              currentPage={pagination.current}
              totalPages={pagination.pages}
              onPageChange={handlePageChange}
              hasNext={pagination.hasNext}
              hasPrev={pagination.hasPrev}
            />
          )}
        </>
      )}

      {/* Results Summary */}
      {notifications.length > 0 && (
        <div className="text-center text-gray-600">
          Showing {((pagination.current - 1) * filters.limit) + 1}-{Math.min(pagination.current * filters.limit, pagination.total)} of {pagination.total} notifications
        </div>
      )}

      {/* Notification Settings Info */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">🔔 Notification Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start space-x-2">
            <Package className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-blue-900">Match Found</div>
              <div className="text-blue-700">When potential matches are found for your items</div>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <FileText className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-blue-900">Claim Updates</div>
              <div className="text-blue-700">When someone claims your item or your claims are processed</div>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <Clock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-blue-900">Deadline Reminders</div>
              <div className="text-blue-700">When your items are about to expire</div>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCheck className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-blue-900">Item Returns</div>
              <div className="text-blue-700">When items are successfully returned to owners</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotificationsPage;