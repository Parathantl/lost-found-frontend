// src/components/Admin/ItemManagement.js
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { itemsAPI, adminAPI } from '../../services/api';
import LoadingSpinner from '../UI/LoadingSpinner';
import Pagination from '../UI/Pagination';
import ClaimsModal from './ClaimsModal';
import PoliceReportModal from '../PoliceHandover/PoliceReportModal';
import ItemCard from '../Items/ItemCard';
import toast from 'react-hot-toast';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Shield,
  X,
  Package,
  AlertCircle,
  Clock,
  MapPin,
  User,
  FileText,
  TrendingUp,
  Grid,
  List
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function ItemManagement() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'staff';
  
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    search: '',
    type: '',
    category: '',
    status: '',
    location: isStaff ? (user?.branch || '') : '', // Staff defaults to their branch
  });
  
  const [selectedItems, setSelectedItems] = useState([]);
  const [claimsModalOpen, setClaimsModalOpen] = useState(false);
  const [selectedItemForClaims, setSelectedItemForClaims] = useState(null);
  const [selectedItemForHandover, setSelectedItemForHandover] = useState(null);
  const [policeModalOpen, setPoliceModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState(isAdmin ? 'table' : 'cards'); // Admin defaults to table, Staff to cards
  // Staff is always restricted to location mode

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['items', filters, user?.role],
    queryFn: () => {
      let queryFilters = { ...filters };
      
      // For staff users, always enforce location filtering
      if (isStaff) {
        queryFilters.location = user?.branch || '';
      }
      
      return itemsAPI.getItems(queryFilters);
    },
    keepPreviousData: true,
  });

  // Bulk update mutations (available for both admin and staff)
  const bulkUpdateMutation = useMutation({
    mutationFn: adminAPI.bulkUpdateItems,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast.success('Items updated successfully');
      setSelectedItems([]);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to update items');
    },
  });
  
  const deleteItemMutation = useMutation({
    mutationFn: itemsAPI.deleteItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast.success('Item deleted successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to delete item');
    },
    enabled: isAdmin,
  });
  
  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters, page: 1 });
  };

  const handlePageChange = (page) => {
    setFilters({ ...filters, page });
    if (viewMode === 'cards') {
      window.scrollTo(0, 0);
    }
  };

  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map(item => item._id));
    }
  };

  const handleBulkUpdate = (updateData) => {
    if (selectedItems.length === 0) {
      toast.error('Please select items to update');
      return;
    }
    
    // For staff, only allow updates to items from their location
    if (isStaff) {
      const selectedItemsData = items.filter(item => selectedItems.includes(item._id));
      const invalidItems = selectedItemsData.filter(item => item.location !== user?.branch);
      
      if (invalidItems.length > 0) {
        toast.error('You can only update items from your assigned location');
        return;
      }
    }
    
    bulkUpdateMutation.mutate({
      itemIds: selectedItems,
      updateData
    });
  };

  const handleDeleteItem = (item) => {
    if (!isAdmin) return;
    
    if (window.confirm(`Are you sure you want to delete "${item.title}"? This action cannot be undone.`)) {
      deleteItemMutation.mutate(item._id);
    }
  };

  const handleClaimsClick = (item) => {
    setSelectedItemForClaims(item);
    setClaimsModalOpen(true);
  };

  const handleClaimsModalClose = () => {
    setClaimsModalOpen(false);
    setSelectedItemForClaims(null);
  };

  const items = data?.data?.data || [];
  const pagination = data?.data?.pagination || {};

  // Calculate statistics (especially useful for staff)
  const locationStats = items.reduce((acc, item) => {
    acc.total++;
    acc[item.type] = (acc[item.type] || 0) + 1;
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, { total: 0 });

  const getStatusBadge = (status) => {
    const badges = {
      active: 'badge-primary',
      claimed: 'badge-warning',
      returned: 'badge-success',
      expired: 'badge-gray',
    };
    return badges[status] || 'badge-gray';
  };

  const getTypeBadge = (type) => {
    return type === 'lost' ? 'badge-danger' : 'badge-success';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      electronics: '📱',
      clothing: '👕',
      accessories: '👜',
      documents: '📄',
      keys: '🔑',
      bags: '🎒',
      books: '📚',
      other: '📦',
    };
    return icons[category] || '📦';
  };

  const getClaimsStatusSummary = (claims) => {
    if (!claims || claims.length === 0) return null;
    
    const pending = claims.filter(c => c.status === 'pending').length;
    const approved = claims.filter(c => c.status === 'approved').length;
    const rejected = claims.filter(c => c.status === 'rejected').length;
    
    return { pending, approved, rejected, total: claims.length };
  };

  const canManageItem = (item) => {
    if (isAdmin) return true;
    if (isStaff) {
      // Staff can only manage items from their location
      return item.location === user?.branch;
    }
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Item Management</h1>
          <div className="flex items-center mt-1 text-gray-600">
            {isStaff && (
              <>
                <MapPin className="w-4 h-4 mr-1" />
                <span>Managing items for: {user?.branch || 'Not assigned'}</span>
              </>
            )}
            {isAdmin && (
              <span>Moderate and manage all reported items</span>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* View Mode Toggle for Staff - removed Browse All option */}
          
          {/* Display Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'cards'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          
          {/* Bulk Actions for both Admin and Staff */}
          {selectedItems.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {selectedItems.length} selected
              </span>
              <button
                onClick={() => handleBulkUpdate({ status: 'active' })}
                className="btn-primary btn-sm"
              >
                Mark Active
              </button>
              <button
                onClick={() => handleBulkUpdate({ status: 'expired' })}
                className="btn-secondary btn-sm"
              >
                Mark Expired
              </button>
              <button
                onClick={() => handleBulkUpdate({ status: 'returned' })}
                className="btn-success btn-sm"
              >
                Mark Returned
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Statistics for Staff */}
      {isStaff && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-primary-600" />
              <div className="ml-3">
                <p className="text-2xl font-bold text-gray-900">{locationStats.total}</p>
                <p className="text-sm text-gray-600">Total Items</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
              <div className="ml-3">
                <p className="text-2xl font-bold text-gray-900">{locationStats.lost || 0}</p>
                <p className="text-sm text-gray-600">Lost Items</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-2xl font-bold text-gray-900">{locationStats.found || 0}</p>
                <p className="text-sm text-gray-600">Found Items</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-2xl font-bold text-gray-900">{locationStats.active || 0}</p>
                <p className="text-sm text-gray-600">Active Items</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search items..."
                value={filters.search}
                onChange={(e) => handleFilterChange({ search: e.target.value })}
                className="form-input pl-10"
              />
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
          </div>
          
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange({ type: e.target.value })}
            className="form-input"
          >
            <option value="">All Types</option>
            <option value="lost">Lost</option>
            <option value="found">Found</option>
          </select>
          
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange({ category: e.target.value })}
            className="form-input"
          >
            <option value="">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="accessories">Accessories</option>
            <option value="documents">Documents</option>
            <option value="keys">Keys</option>
            <option value="bags">Bags</option>
            <option value="books">Books</option>
            <option value="other">Other</option>
          </select>
          
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange({ status: e.target.value })}
            className="form-input"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="claimed">Claimed</option>
            <option value="returned">Returned</option>
            <option value="expired">Expired</option>
          </select>
          
          <button
            onClick={() => setFilters({
              page: 1,
              limit: 20,
              search: '',
              type: '',
              category: '',
              status: '',
              location: isStaff ? (user?.branch || '') : '',
            })}
            className="btn-secondary"
          >
            Clear
          </button>
        </div>
        
        {/* Location Filter (for admin only) */}
        {isAdmin && (
          <div className="mt-4 pt-4 border-t">
            <input
              type="text"
              placeholder="Filter by specific location..."
              value={filters.location}
              onChange={(e) => handleFilterChange({ location: e.target.value })}
              className="form-input max-w-md"
            />
          </div>
        )}
      </div>

      {/* Removed Staff Browse Mode Info since Browse All is no longer available */}

      {/* Quick Filter Tags */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleFilterChange({ type: '', category: '', status: 'active' })}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            !filters.type && !filters.category && filters.status === 'active'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Active Items
        </button>
        <button
          onClick={() => handleFilterChange({ type: 'lost', status: 'active' })}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            filters.type === 'lost' && filters.status === 'active'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Active Lost
        </button>
        <button
          onClick={() => handleFilterChange({ type: 'found', status: 'active' })}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            filters.type === 'found' && filters.status === 'active'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Active Found
        </button>
        <button
          onClick={() => handleFilterChange({ status: 'claimed' })}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            filters.status === 'claimed'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Claimed Items
        </button>
        <button
          onClick={() => handleFilterChange({ status: 'expired' })}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            filters.status === 'expired'
              ? 'bg-gray-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Expired Items
        </button>
      </div>

      {/* Content */}
      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800">Failed to load items. Please try again.</p>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner size="large" text="Loading items..." />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {isStaff 
              ? 'No items found in your location'
              : 'No items found'
            }
          </h3>
          <p className="text-gray-600 mb-4">
            {isStaff
              ? 'No items have been reported for your assigned location yet.'
              : 'Try adjusting your search criteria or filters.'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => {
                setFilters({
                  page: 1,
                  limit: 20,
                  search: '',
                  type: '',
                  category: '',
                  status: '',
                  location: isStaff ? (user?.branch || '') : '',
                });
              }}
              className="btn-secondary"
            >
              Clear filters
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Cards View */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item) => (
                <ItemCard 
                  key={item._id} 
                  item={item} 
                  showActions={canManageItem(item)}
                  isStaffView={isStaff}
                  onClaimsClick={() => handleClaimsClick(item)}
                />
              ))}
            </div>
          )}

          {/* Table View */}
          {viewMode === 'table' && (
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedItems.length === items.length && items.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type & Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location & Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reporter
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Claims
                      </th>
                      {isAdmin && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Police Handover
                        </th>
                      )}
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {items.map((item) => {
                      const claimsSummary = getClaimsStatusSummary(item.claims);
                      
                      return (
                        <tr key={item._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedItems.includes(item._id)}
                              onChange={() => handleSelectItem(item._id)}
                              className="rounded border-gray-300"
                              disabled={isStaff && item.location !== user?.branch}
                            />
                          </td>
                          
                          <td className="px-6 py-4">
                            <div className="flex items-start space-x-3">
                              <div className="text-2xl">{getCategoryIcon(item.category)}</div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">
                                  {item.title}
                                </div>
                                <div className="text-sm text-gray-500 line-clamp-2">
                                  {item.description}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  ID: {item._id.slice(-8)}
                                </div>
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-1">
                              <span className={`badge ${getTypeBadge(item.type)}`}>
                                {item.type}
                              </span>
                              <br />
                              <span className={`badge ${getStatusBadge(item.status)}`}>
                                {item.status}
                              </span>
                              <br />
                              <span className="badge-gray">{item.category}</span>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="space-y-1">
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                <span className="truncate max-w-32">{item.location}</span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {new Date(item.date).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-gray-400">
                                {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-2" />
                              <div>
                                <div className="font-medium text-gray-900">
                                  {item.reportedBy?.name || 'Unknown'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {item.reportedBy?.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {claimsSummary ? (
                              <button
                                onClick={() => handleClaimsClick(item)}
                                className="flex items-center space-x-2 hover:bg-gray-100 rounded-lg p-2 transition-colors w-full text-left"
                              >
                                <FileText className="w-4 h-4 text-primary-600" />
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {claimsSummary.total} claim{claimsSummary.total !== 1 ? 's' : ''}
                                  </div>
                                  <div className="text-xs text-gray-500 flex items-center space-x-2">
                                    {claimsSummary.pending > 0 && (
                                      <span className="flex items-center">
                                        <div className="w-2 h-2 bg-yellow-400 rounded-full mr-1"></div>
                                        {claimsSummary.pending} pending
                                      </span>
                                    )}
                                    {claimsSummary.approved > 0 && (
                                      <span className="flex items-center">
                                        <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                                        {claimsSummary.approved} approved
                                      </span>
                                    )}
                                    {claimsSummary.rejected > 0 && (
                                      <span className="flex items-center">
                                        <div className="w-2 h-2 bg-red-400 rounded-full mr-1"></div>
                                        {claimsSummary.rejected} rejected
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </button>
                            ) : (
                              <span className="text-gray-400">No claims</span>
                            )}
                          </td>

                          {isAdmin && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {item.handedOverToPolice ? (
                                <span className="badge badge-gray">Handover Done</span>
                              ) : item.status === 'expired' && item.type === 'found' ? (
                                <button
                                  className="text-blue-600 hover:text-blue-800 flex items-center"
                                  onClick={() => {
                                    setSelectedItemForHandover(item);
                                    setPoliceModalOpen(true);
                                  }}
                                  title="Hand Over to Police"
                                >
                                  <Shield className="w-4 h-4 mr-1" />
                                  <span className="underline text-sm">Hand Over</span>
                                </button>
                              ) : item.status !== 'expired' && item.type === 'found' ? (
                                <button
                                  className="text-orange-600 hover:text-orange-800 flex items-center"
                                  onClick={() => handleBulkUpdate({ status: 'expired' })}
                                  title="Mark as Expired"
                                >
                                  <Clock className="w-4 h-4 mr-1" />
                                  <span className="underline text-sm">Make Expire</span>
                                </button>
                              ) : (
                                <span className="text-gray-400 text-sm">
                                  {item.type === 'lost' ? 'N/A for lost items' : 'Available when found & expired'}
                                </span>
                              )}
                            </td>
                          )}
                          
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <a
                                href={`/items/${item._id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-600 hover:text-primary-700"
                                title="View item"
                              >
                                <Eye className="w-4 h-4" />
                              </a>
                              {isAdmin && (
                                <button
                                  onClick={() => handleDeleteItem(item)}
                                  className="text-red-600 hover:text-red-700"
                                  title="Delete item"
                                  disabled={deleteItemMutation.isLoading}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

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
            Showing {((pagination.current - 1) * filters.limit) + 1}-{Math.min(pagination.current * filters.limit, pagination.total)} of {pagination.total} items
            {isStaff && ` in ${user?.branch}`}
          </div>
        </>
      )}

      {/* Claims Modal */}
      <ClaimsModal
        item={selectedItemForClaims}
        isOpen={claimsModalOpen}
        onClose={handleClaimsModalClose}
      />

      {/* Police Report Modal - Admin only */}
      {isAdmin && (
        <PoliceReportModal
          item={selectedItemForHandover}
          isOpen={policeModalOpen}
          onClose={() => {
            setPoliceModalOpen(false);
            setSelectedItemForHandover(null);
            queryClient.invalidateQueries({ queryKey: ['items'] });
          }}
        />
      )}
    </div>
  );
}

export default ItemManagement;