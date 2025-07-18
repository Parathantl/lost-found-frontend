// src/components/Staff/StaffItemManagement.js
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { itemsAPI } from '../../services/api';
import LoadingSpinner from '../UI/LoadingSpinner';
import ItemCard from '../Items/ItemCard';
import Pagination from '../UI/Pagination';
import { 
  Search, 
  Filter, 
  Eye, 
  Package,
  MapPin,
  AlertCircle,
  Clock,
  TrendingUp
} from 'lucide-react';

function StaffItemManagement() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    search: '',
    type: '',
    category: '',
    status: '',
    location: user?.branch || '', // Default to staff's location
  });
  const [viewMode, setViewMode] = useState('location'); // 'location' or 'all'

  const { data, isLoading, error } = useQuery({
    queryKey: ['staffItems', filters, viewMode],
    queryFn: () => {
      const queryFilters = viewMode === 'location' 
        ? { ...filters, location: user?.branch || '' }
        : { ...filters, location: '' };
  
      return itemsAPI.getItems(queryFilters);
    },
    keepPreviousData: true,
  });
  
  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters, page: 1 });
  };

  const handlePageChange = (page) => {
    setFilters({ ...filters, page });
    window.scrollTo(0, 0);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is already handled by the filter change
  };

  const items = data?.data?.data || [];
  const pagination = data?.data?.pagination || {};

  // Calculate location-specific statistics
  const locationStats = items.reduce((acc, item) => {
    acc.total++;
    acc[item.type] = (acc[item.type] || 0) + 1;
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, { total: 0 });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Item Management</h1>
          <div className="flex items-center mt-1 text-gray-600">
            <MapPin className="w-4 h-4 mr-1" />
            <span>
              {viewMode === 'location' 
                ? `Managing items for: ${user?.branch || 'Not assigned'}`
                : 'Browsing all items (view-only)'
              }
            </span>
          </div>
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex items-center space-x-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('location')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'location'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              My Location
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'all'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Browse All
            </button>
          </div>
        </div>
      </div>

      {/* Location Stats (only shown in location mode) */}
      {viewMode === 'location' && (
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

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search items by title, description, or location..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange({ search: e.target.value })}
                  className="form-input pl-10"
                />
                <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange({ type: e.target.value })}
                className="form-input min-w-[120px]"
              >
                <option value="">All Types</option>
                <option value="lost">Lost</option>
                <option value="found">Found</option>
              </select>
              
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange({ category: e.target.value })}
                className="form-input min-w-[130px]"
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
                className="form-input min-w-[120px]"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="claimed">Claimed</option>
                <option value="returned">Returned</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>

          {/* Location Filter (only in browse all mode) */}
          {viewMode === 'all' && (
            <div className="pt-4 border-t">
              <input
                type="text"
                placeholder="Filter by specific location..."
                value={filters.location}
                onChange={(e) => handleFilterChange({ location: e.target.value })}
                className="form-input max-w-md"
              />
            </div>
          )}
        </form>
      </div>

      {/* View Mode Info */}
      {viewMode === 'all' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Eye className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-800">Browse Mode</h4>
              <p className="text-sm text-blue-700 mt-1">
                You're browsing all items across all locations. You can view items but management actions are limited to your assigned location.
              </p>
            </div>
          </div>
        </div>
      )}

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

      {/* Results */}
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
            {viewMode === 'location' 
              ? 'No items found in your location'
              : 'No items match your filters'
            }
          </h3>
          <p className="text-gray-600 mb-4">
            {viewMode === 'location'
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
                  location: viewMode === 'location' ? (user?.branch || '') : '',
                });
              }}
              className="btn-secondary"
            >
              Clear filters
            </button>
            {viewMode === 'location' && (
              <button
                onClick={() => setViewMode('all')}
                className="btn-primary"
              >
                Browse All Items
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <ItemCard 
                key={item._id} 
                item={item} 
                showActions={viewMode === 'location'} // Only show management actions for location items
                isStaffView={true}
              />
            ))}
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
      {items.length > 0 && (
        <div className="text-center text-gray-600">
          Showing {((pagination.current - 1) * filters.limit) + 1}-{Math.min(pagination.current * filters.limit, pagination.total)} of {pagination.total} items
          {viewMode === 'location' && ` in ${user?.branch}`}
        </div>
      )}
    </div>
  );
}

export default StaffItemManagement;