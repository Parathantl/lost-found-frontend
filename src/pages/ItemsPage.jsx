// src/pages/ItemsPage.js
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { itemsAPI } from '../services/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import ItemCard from '../components/Items/ItemCard';
import ItemFilters from '../components/Items/ItemFilters';
import Pagination from '../components/UI/Pagination';
import { Search, Plus, Filter } from 'lucide-react';

function ItemsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  
  // Filter states
  const [filters, setFilters] = useState({
    type: searchParams.get('type') || '',
    category: searchParams.get('category') || '',
    status: searchParams.get('status') || 'active',
    location: searchParams.get('location') || '',
    page: parseInt(searchParams.get('page')) || 1,
    limit: 12,
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc',
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        params.set(key, value.toString());
      }
    });
    if (searchQuery) {
      params.set('search', searchQuery);
    }
    setSearchParams(params);
  }, [filters, searchQuery, setSearchParams]);

  // Fetch items
  const { data, isLoading, error } = useQuery({
    queryKey: ['items', { ...filters, search: searchQuery }],
    queryFn: () => itemsAPI.getItems({ ...filters, search: searchQuery }),
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters, page: 1 });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1 });
  };

  const handlePageChange = (page) => {
    setFilters({ ...filters, page });
    window.scrollTo(0, 0);
  };

  const items = data?.data?.data || [];
  const pagination = data?.data?.pagination || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Browse Items</h1>
          <p className="text-gray-600 mt-1">
            Search through {pagination.total || 0} reported items
          </p>
        </div>
        <Link
          to="/create-item"
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Report Item
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search items by title, description, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input pl-10"
                />
                <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary md:w-auto"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
            <button type="submit" className="btn-primary md:w-auto">
              Search
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <ItemFilters
              filters={filters}
              onChange={handleFilterChange}
            />
          )}
        </form>
      </div>

      {/* Quick Filter Tags */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleFilterChange({ type: '', category: '', status: 'active' })}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            !filters.type && !filters.category
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Items
        </button>
        <button
          onClick={() => handleFilterChange({ type: 'lost' })}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            filters.type === 'lost'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Lost Items
        </button>
        <button
          onClick={() => handleFilterChange({ type: 'found' })}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            filters.type === 'found'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Found Items
        </button>
        <button
          onClick={() => handleFilterChange({ category: 'electronics' })}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            filters.category === 'electronics'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Electronics
        </button>
        <button
          onClick={() => handleFilterChange({ category: 'accessories' })}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            filters.category === 'accessories'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Accessories
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
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search criteria or filters
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => {
                setSearchQuery('');
                setFilters({
                  ...filters,
                  type: '',
                  category: '',
                  location: '',
                  page: 1,
                });
              }}
              className="btn-secondary"
            >
              Clear filters
            </button>
            <Link to="/create-item" className="btn-primary">
              Report a new item
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <ItemCard key={item._id} item={item} />
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
    </div>
  );
}

export default ItemsPage;