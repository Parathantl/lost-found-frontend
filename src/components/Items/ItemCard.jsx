import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Calendar, 
  User, 
  Clock,
  Package,
  AlertCircle,
  CheckCircle,
  Eye
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function ItemCard({ item }) {
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
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200">
      {/* Image */}
      <div className="aspect-w-16 aspect-h-12 bg-gray-100 rounded-t-lg overflow-hidden">
        {item.images && item.images.length > 0 ? (
          <img
            src={item.images[0]}
            alt={item.title}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="text-4xl mb-2">{getCategoryIcon(item.category)}</div>
              <Package className="w-8 h-8 text-gray-300 mx-auto" />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {item.title}
            </h3>
          </div>
          <div className="flex flex-col items-end space-y-1 ml-2">
            <span className={`badge ${getTypeBadge(item.type)}`}>
              {item.type === 'lost' ? '🔍 Lost' : '📦 Found'}
            </span>
            <span className={`badge ${getStatusBadge(item.status)}`}>
              {item.status}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {item.description}
        </p>

        {/* Timestamp */}
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>
            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
          </span>
        </div>

        {/* Category and Claims Info */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="badge-gray">
              {getCategoryIcon(item.category)} {item.category}
            </span>
          </div>
          {item.claims && item.claims.length > 0 && (
            <div className="flex items-center text-sm text-gray-600">
              <AlertCircle className="w-4 h-4 mr-1" />
              <span>{item.claims.length} claim{item.claims.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Additional Details */}
        {item.additionalDetails && (
          <div className="mb-4 p-2 bg-gray-50 rounded text-sm">
            {item.additionalDetails.color && (
              <span className="mr-3">Color: {item.additionalDetails.color}</span>
            )}
            {item.additionalDetails.brand && (
              <span className="mr-3">Brand: {item.additionalDetails.brand}</span>
            )}
            {item.additionalDetails.size && (
              <span>Size: {item.additionalDetails.size}</span>
            )}
          </div>
        )}

        {/* Location, Date, Reporter */}
        <div className="space-y-2 mb-4 text-sm text-gray-600">
          {item.location && (
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">{item.location}</span>
            </div>
          )}
          {item.date && (
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{new Date(item.date).toLocaleDateString()}</span>
            </div>
          )}
          <div className="flex items-center">
            <User className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">
              Reported by {item.reportedBy?.name || 'Anonymous'}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <Link
          to={`/items/${item._id}`}
          className="block w-full btn-primary text-center"
        >
          <Eye className="w-4 h-4 mr-2 inline" />
          View Details
        </Link>

        {/* Urgency Indicator */}
        {item.type === 'lost' && (
          <div className="mt-2 text-xs text-gray-500 text-center">
            Time sensitive – act quickly for better chances
          </div>
        )}
      </div>
    </div>
  );
}

export default ItemCard;
