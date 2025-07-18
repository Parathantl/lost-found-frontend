// src/components/Admin/UserManagement.js
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../UI/LoadingSpinner';
import Pagination from '../UI/Pagination';
import toast from 'react-hot-toast';
import { 
  Search, 
  Filter, 
  UserPlus, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Shield,
  User,
  Mail,
  Phone,
  Calendar,
  Package,
  FileText,
  Eye
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function UserManagement() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    search: '',
    role: '',
    branch: '',
    isActive: '',
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const queryClient = useQueryClient();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['adminUsers', filters],
    queryFn: () => adminAPI.getUsers(filters),
    keepPreviousData: true
  });
  
  
  const updateUserMutation = useMutation({
    mutationFn: ({ userId, data }) => adminAPI.updateUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast.success('User updated successfully');
      setShowEditModal(false);
      setSelectedUser(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update user');
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: adminAPI.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast.success('User deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    },
  });  

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters, page: 1 });
  };

  const handlePageChange = (page) => {
    setFilters({ ...filters, page });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is already handled by the filter change
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleDeleteUser = (user) => {
    if (window.confirm(`Are you sure you want to delete user "${user.name}"? This action cannot be undone.`)) {
      deleteUserMutation.mutate(user._id);
    }
  };

  const users = data?.data?.data || [];
  const pagination = data?.data?.pagination || {};

  const getRoleBadge = (role) => {
    const badges = {
      admin: 'badge-purple',
      staff: 'badge-blue',
      user: 'badge-gray',
    };
    return badges[role] || 'badge-gray';
  };

  const getStatusBadge = (isActive) => {
    return isActive ? 'badge-success' : 'badge-danger';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">
            Manage user accounts and permissions
          </p>
        </div>
        {/* <button className="btn-primary">
          <UserPlus className="w-4 h-4 mr-2" />
          Add New User
        </button> */}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange({ search: e.target.value })}
                  className="form-input pl-10"
                />
                <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={filters.role}
                onChange={(e) => handleFilterChange({ role: e.target.value })}
                className="form-input min-w-[120px]"
              >
                <option value="">All Roles</option>
                <option value="user">Users</option>
                <option value="staff">Staff</option>
                <option value="admin">Admins</option>
              </select>
              
              <select
                value={filters.isActive}
                onChange={(e) => handleFilterChange({ isActive: e.target.value })}
                className="form-input min-w-[120px]"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
              
              <button
                type="button"
                onClick={() => setFilters({
                  page: 1,
                  limit: 20,
                  search: '',
                  role: '',
                  branch: '',
                  isActive: '',
                })}
                className="btn-secondary whitespace-nowrap"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Users Table */}
      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800">Failed to load users. Please try again.</p>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner size="large" text="Loading users..." />
        </div>
      ) : users.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or filters</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role & Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stats
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center mr-3">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {user._id.slice(-8)}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <span className={`badge ${getRoleBadge(user.role)}`}>
                            {user.role}
                          </span>
                          <br />
                          <span className={`badge ${getStatusBadge(user.isActive)}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                          {user.branch && (
                            <>
                              <br />
                              <span className="badge-gray">{user.branch}</span>
                            </>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center mb-1">
                            <Mail className="w-4 h-4 text-gray-400 mr-2" />
                            {user.email}
                          </div>
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 text-gray-400 mr-2" />
                            {user.phone}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                          </div>
                          {user.lastLogin && (
                            <div className="flex items-center">
                              <Eye className="w-4 h-4 mr-1" />
                              Last login {formatDistanceToNow(new Date(user.lastLogin), { addSuffix: true })}
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <Package className="w-4 h-4 mr-1" />
                            {user.stats?.itemsReported || 0} items
                          </div>
                          <div className="flex items-center">
                            <FileText className="w-4 h-4 mr-1" />
                            {user.stats?.claimsSubmitted || 0} claims
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-primary-600 hover:text-primary-700"
                            title="Edit user"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="text-red-600 hover:text-red-700"
                            title="Delete user"
                            disabled={deleteUserMutation.isLoading}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

          {/* Results Summary */}
          <div className="text-center text-gray-600">
            Showing {((pagination.current - 1) * filters.limit) + 1}-{Math.min(pagination.current * filters.limit, pagination.total)} of {pagination.total} users
          </div>
        </>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onSave={(data) => updateUserMutation.mutate({ userId: selectedUser._id, data })}
          isLoading={updateUserMutation.isLoading}
        />
      )}
    </div>
  );
}

// Edit User Modal Component
function EditUserModal({ user, onClose, onSave, isLoading }) {
  const [formData, setFormData] = useState({
    role: user.role,
    isActive: user.isActive,
    branch: user.branch || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Edit User</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="form-label">Name</label>
            <input
              type="text"
              value={user.name}
              disabled
              className="form-input bg-gray-50"
            />
          </div>

          <div>
            <label className="form-label">Email</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="form-input bg-gray-50"
            />
          </div>

          <div>
            <label className="form-label">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="form-input"
            >
              <option value="user">User</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {(formData.role === 'staff' || formData.role === 'admin') && (
            <div>
              <label className="form-label">Branch</label>
              <input
                type="text"
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                className="form-input"
                placeholder="Enter branch name"
              />
            </div>
          )}

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Account is active</span>
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? <LoadingSpinner size="small" /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserManagement;