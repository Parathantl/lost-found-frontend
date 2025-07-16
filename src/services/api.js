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
  // Get notifications
  getNotifications: (params = {}) => api.get('/notifications', { params }),
  
  // Mark notification as read
  markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
  
  // Mark all notifications as read
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
  
  // Send system notification (admin)
  sendSystemNotification: (data) => api.post('/notifications/system', data),
  
  // Send deadline reminders (admin)
  sendDeadlineReminders: () => api.post('/notifications/deadline-reminders'),
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

// Auth API
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export default api;