// src/pages/ItemDetailPage.js
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { itemsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import ClaimForm from '../components/Items/ClaimForm';
import toast from 'react-hot-toast';
import { 
  MapPin, 
  Calendar, 
  User, 
  Clock, 
  Package,
  AlertCircle,
  CheckCircle,
  Edit,
  Trash2,
  FileText,
  Share2,
  ArrowLeft,
  Phone,
  Mail,
  Eye,
  Search
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function ItemDetailPage() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Helper function to safely format dates
  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  // Helper function to safely format regular dates
  const formatRegularDate = (dateString) => {
    if (!dateString) return 'Date not available';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting regular date:', error);
      return 'Invalid date';
    }
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['item', id],
    queryFn: () => itemsAPI.getItem(id),
    enabled: !!id,
  });  

  const deleteItemMutation = useMutation({
    mutationFn: itemsAPI.deleteItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast.success('Item deleted successfully');
      navigate('/my-items');
    },
  });
  
  const searchMatchesMutation = useMutation({
    mutationFn: itemsAPI.searchMatches,
    onSuccess: (data) => {
      const matches = data.data.data;
      if (matches.length > 0) {
        toast.success(`Found ${matches.length} potential matches!`);
      } else {
        toast.info('No potential matches found at this time');
      }
    },
    onError: (error) => {
      toast.error('Failed to search for matches');
      console.error('Search matches error:', error);
    },
  });  

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="large" text="Loading item details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Item Not Found</h2>
        <p className="text-gray-600 mb-4">The item you're looking for doesn't exist or has been removed.</p>
        <Link to="/items" className="btn-primary">
          Browse Items
        </Link>
      </div>
    );
  }

  const item = data?.data?.data;
  if (!item) return null;

  const isOwner = user && item.reportedBy._id === user.id;
  const canClaim = isAuthenticated && !isOwner && item.type === 'found' && item.status === 'active';
  const hasUserClaimed = user && item.claims?.some(claim => claim.claimedBy._id === user.id);

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

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      deleteItemMutation.mutate(id);
    }
  };

  const handleSearchMatches = () => {
    searchMatchesMutation.mutate(id);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: item.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Images and Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {item.images && item.images.length > 0 ? (
              <div>
                {/* Main Image */}
                <div className="aspect-w-16 aspect-h-12">
                  <img
                    src={item.images[selectedImageIndex]}
                    alt={item.title}
                    className="w-full h-96 object-cover"
                  />
                </div>
                
                {/* Thumbnails */}
                {item.images.length > 1 && (
                  <div className="p-4 flex space-x-2 overflow-x-auto">
                    {item.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                          selectedImageIndex === index ? 'border-primary-500' : 'border-gray-200'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${item.title} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-96 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <div className="text-6xl mb-4">{getCategoryIcon(item.category)}</div>
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No images available</p>
                </div>
              </div>
            )}
          </div>

          {/* Item Details */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`badge ${getTypeBadge(item.type)}`}>
                    {item.type === 'lost' ? '🔍 Lost' : '📦 Found'}
                  </span>
                  <span className={`badge ${getStatusBadge(item.status)}`}>
                    {item.status}
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{item.title}</h1>
                <p className="text-gray-600">{item.description}</p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col space-y-2 ml-4">
                <button
                  onClick={handleShare}
                  className="btn-secondary btn-sm"
                  title="Share this item"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                {isOwner && (
                  <>
                    <Link
                      to={`/items/${id}/edit`}
                      className="btn-secondary btn-sm"
                      title="Edit item"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={handleDelete}
                      className="btn-danger btn-sm"
                      title="Delete item"
                      disabled={deleteItemMutation.isLoading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center text-gray-600">
                <MapPin className="w-5 h-5 mr-2" />
                <span>Location: {item.location}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Calendar className="w-5 h-5 mr-2" />
                <span>Date: {formatRegularDate(item.date)}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Package className="w-5 h-5 mr-2" />
                <span>Category: {getCategoryIcon(item.category)} {item.category}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="w-5 h-5 mr-2" />
                <span>Reported: {formatDate(item.createdAt)}</span>
              </div>
            </div>

            {/* Additional Details */}
            {item.additionalDetails && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {item.additionalDetails.color && (
                    <div>
                      <span className="font-medium text-gray-700">Color:</span>
                      <span className="ml-2 text-gray-600">{item.additionalDetails.color}</span>
                    </div>
                  )}
                  {item.additionalDetails.brand && (
                    <div>
                      <span className="font-medium text-gray-700">Brand:</span>
                      <span className="ml-2 text-gray-600">{item.additionalDetails.brand}</span>
                    </div>
                  )}
                  {item.additionalDetails.size && (
                    <div>
                      <span className="font-medium text-gray-700">Size:</span>
                      <span className="ml-2 text-gray-600">{item.additionalDetails.size}</span>
                    </div>
                  )}
                </div>
                
                {item.additionalDetails.identifiers && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">Unique Identifiers:</span>
                    <p className="mt-1 text-gray-600">{item.additionalDetails.identifiers}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Claims Section (if any) */}
          {item.claims && item.claims.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Claims ({item.claims.length})
              </h3>
              <div className="space-y-3">
                {item.claims.map((claim, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-gray-900">
                          {claim.claimedBy?.name || 'Anonymous'}
                        </span>
                        <span className="text-sm text-gray-600 ml-2">
                          {formatDate(claim.claimDate)}
                        </span>
                      </div>
                      <span className={`badge ${
                        claim.status === 'pending' ? 'badge-warning' :
                        claim.status === 'verified' ? 'badge-success' :
                        'badge-danger'
                      }`}>
                        {claim.status}
                      </span>
                    </div>
                    {claim.notes && (
                      <p className="text-sm text-gray-600 mt-2">{claim.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Actions and Contact */}
        <div className="space-y-6">
          {/* Action Card */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-3">
              {canClaim && !hasUserClaimed && (
                <button
                  onClick={() => setShowClaimForm(true)}
                  className="w-full btn-primary"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Claim This Item
                </button>
              )}
              
              {hasUserClaimed && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center text-green-800">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span className="font-medium">You have claimed this item</span>
                  </div>
                </div>
              )}

              {isOwner && (
                <button
                  onClick={handleSearchMatches}
                  className="w-full btn-secondary"
                  disabled={searchMatchesMutation.isLoading}
                >
                  {searchMatchesMutation.isLoading ? (
                    <LoadingSpinner size="small" />
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Find Matches
                    </>
                  )}
                </button>
              )}

              <Link
                to="/items"
                className="w-full btn-secondary text-center"
              >
                <Eye className="w-4 h-4 mr-2" />
                Browse More Items
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <User className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">{item.reportedBy.name}</p>
                  <p className="text-sm text-gray-600">Reporter</p>
                </div>
              </div>
              
              {/* {(isAuthenticated && (canClaim || isOwner)) && (
                <>
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-gray-900">{item.contactInfo.email}</p>
                      <p className="text-sm text-gray-600">Email</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-gray-900">{item.contactInfo.phone}</p>
                      <p className="text-sm text-gray-600">Phone</p>
                    </div>
                  </div>
                </>
              )} */}
              
              {!isAuthenticated && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <Link to="/login" className="font-medium hover:underline">
                      Sign in
                    </Link> to view contact information
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Safety Tips */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Safety Tips</h4>
                <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                  <li>• Meet in public places</li>
                  <li>• Verify ownership before returning</li>
                  <li>• Trust your instincts</li>
                  <li>• Report suspicious activity</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Claim Form Modal */}
      {showClaimForm && (
        <ClaimForm
          item={item}
          onClose={() => setShowClaimForm(false)}
          onSuccess={() => {
            setShowClaimForm(false);
            queryClient.invalidateQueries(['item', id]);
          }}
        />
      )}
    </div>
  );
}

export default ItemDetailPage;