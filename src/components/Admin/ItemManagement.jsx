// src/components/Admin/ItemManagement.js
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { itemsAPI, adminAPI } from '../../services/api';
import LoadingSpinner from '../UI/LoadingSpinner';
import Pagination from '../UI/Pagination';
import toast from 'react-hot-toast';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Check,
  X,
  Package,
  AlertCircle,
  Clock,
  MapPin,
  User,
  FileText
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function ItemManagement() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    search: '',
    type: '',
    category: '',
    status: '',
    location: '',
  });
  const [selectedItems, setSelectedItems] = useState([]);

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['adminItems', filters],
    queryFn: () => itemsAPI.getItems(filters),
    keepPreviousData: true,
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: adminAPI.bulkUpdateItems,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminItems'] });
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
      queryClient.invalidateQueries({ queryKey: ['adminItems'] });
      toast.success('Item deleted successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to delete item');
    },
  });
  
  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters, page: 1 });
  };

  const handlePageChange = (page) => {
    setFilters({ ...filters, page });
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
    
    bulkUpdateMutation.mutate({
      itemIds: selectedItems,
      updateData
    });
  };

  const handleDeleteItem = (item) => {
    if (window.confirm(`Are you sure you want to delete "${item.title}"? This action cannot be undone.`)) {
      deleteItemMutation.mutate(item._id);
    }
  };

  const items = data?.data?.data || [];
  const pagination = data?.data?.pagination || {};

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Item Management</h1>
          <p className="text-gray-600 mt-1">
            Moderate and manage reported items
          </p>
        </div>
        {selectedItems.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {selectedItems.length} selected
            </span>
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
              location: '',
            })}
            className="btn-secondary"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Items Table */}
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or filters</p>
        </div>
      ) : (
        <>
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
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item._id)}
                          onChange={() => handleSelectItem(item._id)}
                          className="rounded border-gray-300"
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
                        {item.claims && item.claims.length > 0 ? (
                          <div className="flex items-center">
                            <FileText className="w-4 h-4 mr-1" />
                            <span className="font-medium text-gray-900">
                              {item.claims.length}
                            </span>
                            <span className="ml-1">
                              claim{item.claims.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">No claims</span>
                        )}
                      </td>
                      
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
                          <button
                            onClick={() => handleDeleteItem(item)}
                            className="text-red-600 hover:text-red-700"
                            title="Delete item"
                            disabled={deleteItemMutation.isLoading}
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
            Showing {((pagination.current - 1) * filters.limit) + 1}-{Math.min(pagination.current * filters.limit, pagination.total)} of {pagination.total} items
          </div>
        </>
      )}
    </div>
  );
}

export default ItemManagement;