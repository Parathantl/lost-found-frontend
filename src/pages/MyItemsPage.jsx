// src/pages/MyItemsPage.js
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { itemsAPI } from '../services/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import ItemCard from '../components/Items/ItemCard';
import Pagination from '../components/UI/Pagination';
import { 
  Plus, 
  Filter, 
  Package, 
  Search,
  Calendar,
  TrendingUp
} from 'lucide-react';

function MyItemsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    type: searchParams.get('type') || '',
    status: searchParams.get('status') || '',
    page: parseInt(searchParams.get('page')) || 1,
    limit: 12,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['myItems', filters],
    queryFn: () => itemsAPI.getMyItems(filters),
    keepPreviousData: true,
  });

  const handleFilterChange = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    setFilters(updatedFilters);
    
    // Update URL
    const params = new URLSearchParams();
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value && value !== '') {
        params.set(key, value.toString());
      }
    });
    setSearchParams(params);
  };

  const handlePageChange = (page) => {
    setFilters({ ...filters, page });
    window.scrollTo(0, 0);
  };

  const items = data?.data?.data || [];
  const pagination = data?.data?.pagination || {};

  // Calculate statistics
  const stats = items.reduce((acc, item) => {
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
          <h1 className="text-3xl font-bold text-gray-900">My Items</h1>
          <p className="text-gray-600 mt-1">
            Manage your reported lost and found items
          </p>
        </div>
        <Link
          to="/create-item"
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Report New Item
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <Package className="w-8 h-8 text-primary-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600">Total Items</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <Search className="w-8 h-8 text-red-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-900">{stats.lost || 0}</p>
              <p className="text-sm text-gray-600">Lost Items</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <Package className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-900">{stats.found || 0}</p>
              <p className="text-sm text-gray-600">Found Items</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-success-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-900">{stats.returned || 0}</p>
              <p className="text-sm text-gray-600">Returned</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <div className="flex flex-wrap gap-4">
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange({ type: e.target.value })}
              className="form-input min-w-[120px]"
            >
              <option value="">All Types</option>
              <option value="lost">Lost Items</option>
              <option value="found">Found Items</option>
            </select>
            
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange({ status: e.target.value })}
              className="form-input min-w-[120px]"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="claimed">Claimed</option>
              <option value="returned">Returned</option>
              <option value="expired">Expired</option>
            </select>
            
            <button
              onClick={() => handleFilterChange({ type: '', status: '' })}
              className="btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Quick Filter Tags */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleFilterChange({ type: '', status: '' })}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            !filters.type && !filters.status
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Items ({stats.total})
        </button>
        <button
          onClick={() => handleFilterChange({ type: 'lost', status: '' })}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            filters.type === 'lost'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Lost ({stats.lost || 0})
        </button>
        <button
          onClick={() => handleFilterChange({ type: 'found', status: '' })}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            filters.type === 'found'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Found ({stats.found || 0})
        </button>
        <button
          onClick={() => handleFilterChange({ type: '', status: 'active' })}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            filters.status === 'active'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Active ({stats.active || 0})
        </button>
        <button
          onClick={() => handleFilterChange({ type: '', status: 'returned' })}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            filters.status === 'returned'
              ? 'bg-success-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Returned ({stats.returned || 0})
        </button>
      </div>

      {/* Results */}
      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800">Failed to load your items. Please try again.</p>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner size="large" text="Loading your items..." />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filters.type || filters.status ? 'No items match your filters' : 'No items reported yet'}
          </h3>
          <p className="text-gray-600 mb-4">
            {filters.type || filters.status 
              ? 'Try adjusting your filters to see more items'
              : 'Start by reporting a lost or found item'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {(filters.type || filters.status) && (
              <button
                onClick={() => handleFilterChange({ type: '', status: '' })}
                className="btn-secondary"
              >
                Clear filters
              </button>
            )}
            <Link to="/create-item" className="btn-primary">
              Report Your First Item
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <ItemCard key={item._id} item={item} showActions={true} />
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
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Tips for Managing Your Items</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-2">
            <Calendar className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-blue-900">Keep items updated</div>
              <div className="text-sm text-blue-700">Update status if item is found or returned</div>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <Search className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-blue-900">Use search matches</div>
              <div className="text-sm text-blue-700">Regularly check for potential matches</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyItemsPage;