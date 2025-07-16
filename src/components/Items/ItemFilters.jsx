// src/components/Items/ItemFilters.js
import React from 'react';

function ItemFilters({ filters, onChange }) {
  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'documents', label: 'Documents' },
    { value: 'keys', label: 'Keys' },
    { value: 'bags', label: 'Bags' },
    { value: 'books', label: 'Books' },
    { value: 'other', label: 'Other' },
  ];

  const statuses = [
    { value: '', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'claimed', label: 'Claimed' },
    { value: 'returned', label: 'Returned' },
    { value: 'expired', label: 'Expired' },
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'Date Reported' },
    { value: 'date', label: 'Date Lost/Found' },
    { value: 'title', label: 'Title' },
    { value: 'location', label: 'Location' },
  ];

  const handleChange = (field, value) => {
    onChange({ [field]: value });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
      {/* Type Filter */}
      <div>
        <label className="form-label">Type</label>
        <select
          value={filters.type}
          onChange={(e) => handleChange('type', e.target.value)}
          className="form-input"
        >
          <option value="">All Types</option>
          <option value="lost">Lost Items</option>
          <option value="found">Found Items</option>
        </select>
      </div>

      {/* Category Filter */}
      <div>
        <label className="form-label">Category</label>
        <select
          value={filters.category}
          onChange={(e) => handleChange('category', e.target.value)}
          className="form-input"
        >
          {categories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      {/* Status Filter */}
      <div>
        <label className="form-label">Status</label>
        <select
          value={filters.status}
          onChange={(e) => handleChange('status', e.target.value)}
          className="form-input"
        >
          {statuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>

      {/* Location Filter */}
      <div>
        <label className="form-label">Location</label>
        <input
          type="text"
          placeholder="Enter location..."
          value={filters.location}
          onChange={(e) => handleChange('location', e.target.value)}
          className="form-input"
        />
      </div>

      {/* Sort Options */}
      <div>
        <label className="form-label">Sort By</label>
        <select
          value={filters.sortBy}
          onChange={(e) => handleChange('sortBy', e.target.value)}
          className="form-input"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Sort Order */}
      <div>
        <label className="form-label">Order</label>
        <select
          value={filters.sortOrder}
          onChange={(e) => handleChange('sortOrder', e.target.value)}
          className="form-input"
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
      </div>

      {/* Clear Filters */}
      <div className="md:col-span-2 lg:col-span-2 flex items-end">
        <button
          type="button"
          onClick={() => onChange({
            type: '',
            category: '',
            status: 'active',
            location: '',
            sortBy: 'createdAt',
            sortOrder: 'desc',
            page: 1,
          })}
          className="btn-secondary w-full"
        >
          Clear All Filters
        </button>
      </div>
    </div>
  );
}

export default ItemFilters;