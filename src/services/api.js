// src/services/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'authorization': `Bearer ${localStorage.getItem('token') || ''}`,
  },
});

// Items API
export const itemsAPI = {
  // Get all items with filters
  getItems: (params = {}) => api.get('/items', { params }),
  
  // Get single item
  getItem: (id) => api.get(`/items/${id}`),
  
  // Create new item
  createItem: (data) => api.post('/items', data),
  
  // Update item
  updateItem: (id, data) => api.put(`/items/${id}`, data),
  
  // Delete item
  deleteItem: (id) => api.delete(`/items/${id}`),
  
  // Get user's items
  getMyItems: (params = {}) => api.get('/items/my-items', { params }),
  
  // Search for matches
  searchMatches: (itemId) => api.post('/items/search-matches', { itemId }),
  
  // Submit claim
  submitClaim: (itemId, data) => api.post(`/items/${itemId}/claim`, data),
  
  // Get item claims (staff/admin)
  getItemClaims: (itemId) => api.get(`/items/${itemId}/claims`),
  
  // Update claim status (staff/admin)
  updateClaimStatus: (itemId, claimId, data) => 
    api.put(`/items/${itemId}/claims/${claimId}`, data),
  
  // Mark item as returned (staff/admin)
  markItemReturned: (itemId, data) => api.put(`/items/${itemId}/return`, data),

  // Mark item as handed over to police
  handoverToPolice: (itemId, data) => api.put(`/items/handover/${itemId}`, data),

};

// Claims API
export const claimsAPI = {
  // Get user's claims
  getMyClaims: () => api.get('/claims/my-claims'),
};

// Dashboard API
export const dashboardAPI = {
  // Get dashboard stats (staff/admin)
  getStats: (timeRange = 30) => api.get(`/dashboard/stats?timeRange=${timeRange}`),
  
  // Get recent activity (staff/admin)
  getActivity: (limit = 20) => api.get(`/dashboard/activity?limit=${limit}`),
  
  // Get user dashboard stats
  getUserStats: () => api.get('/dashboard/user-stats'),
  
  // Get location stats (staff/admin)
  getLocationStats: () => api.get('/dashboard/location-stats'),
};

// Notifications API
export const notificationsAPI = {
  getNotifications: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const { data } = await api.get(`/notifications?${queryString}`);
    return data;
  },
  

  getUnreadCount: async () => {
    const { data } = await api.get(`/notifications/unread-count`);
    return data;
  },
  
  markAsRead: async (notificationId) => {
    const { data } = await api.put(`/notifications/${notificationId}/read`);
    return data;
  },
  
  markAllAsRead: async () => {
    const { data } = await api.put(`/notifications/mark-all-read`);
    return data;
  },
  
  deleteNotification: async (notificationId) => {
    const { data } = await api.delete(`/notifications/${notificationId}`);
    return data;
  },
  
};

// Admin API
export const adminAPI = {
  // Get all users
  getUsers: (params = {}) => api.get('/admin/users', { params }),
  
  // Update user
  updateUser: (userId, data) => api.put(`/admin/users/${userId}`, data),
  
  // Delete user
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  
  // Get system overview
  getOverview: () => api.get('/admin/overview'),
  
  // Bulk update items
  bulkUpdateItems: (data) => api.put('/admin/items/bulk-update', data),
  
  // Export data
  exportData: (type, format = 'json', params = {}) => 
    api.get(`/admin/export?type=${type}&format=${format}`, { 
      params,
      responseType: format === 'csv' ? 'blob' : 'json'
    }),
};

export const staffAPI = {
  // Get staff dashboard stats
  getDashboardStats: (timeRange = 30) => api.get(`/staff/dashboard/stats?timeRange=${timeRange}`),
  
  // Get staff recent activity
  getRecentActivity: (limit = 20) => api.get(`/staff/dashboard/activity?limit=${limit}`),
  
  // Get items requiring attention
  getItemsRequiringAttention: () => api.get('/staff/dashboard/attention'),
  
  // Get staff location analytics
  getLocationAnalytics: (timeRange = 30) => api.get(`/staff/dashboard/analytics?timeRange=${timeRange}`),
};

// Auth API
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export default api;