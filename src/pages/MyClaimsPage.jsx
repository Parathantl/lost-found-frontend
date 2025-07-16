// src/pages/MyClaimsPage.js
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { claimsAPI } from '../services/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  User,
  MapPin,
  Calendar,
  Search
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function MyClaimsPage() {
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['myClaims'],
    queryFn: claimsAPI.getMyClaims
  });

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
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const claims = data?.data?.data || [];

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'badge-warning', icon: Clock },
      verified: { class: 'badge-success', icon: CheckCircle },
      rejected: { class: 'badge-danger', icon: XCircle },
    };
    return badges[status] || { class: 'badge-gray', icon: Clock };
  };

  const getItemTypeBadge = (type) => {
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="large" text="Loading your claims..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800">Failed to load your claims. Please try again.</p>
      </div>
    );
  }

  // Calculate statistics
  const stats = claims.reduce((acc, claimData) => {
    acc.total++;
    acc[claimData.claim.status] = (acc[claimData.claim.status] || 0) + 1;
    return acc;
  }, { total: 0, pending: 0, verified: 0, rejected: 0 });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Claims</h1>
          <p className="text-gray-600 mt-1">
            Track the status of your item claims
          </p>
        </div>
        <Link
          to="/items"
          className="btn-primary"
        >
          <Search className="w-4 h-4 mr-2" />
          Browse Items
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-primary-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600">Total Claims</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-warning-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-success-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-900">{stats.verified}</p>
              <p className="text-sm text-gray-600">Verified</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <XCircle className="w-8 h-8 text-danger-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              <p className="text-sm text-gray-600">Rejected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Claims List */}
      {claims.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No claims submitted yet</h3>
          <p className="text-gray-600 mb-4">
            Browse found items and submit claims to recover your lost belongings
          </p>
          <Link to="/items?type=found" className="btn-primary">
            Browse Found Items
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {claims.map((claimData, index) => {
            const { item, claim } = claimData;
            const statusBadge = getStatusBadge(claim.status);
            const StatusIcon = statusBadge.icon;

            return (
              <div key={claim._id || `claim-${index}`} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`badge ${getItemTypeBadge(item.type)}`}>
                          {item.type === 'lost' ? '🔍 Lost' : '📦 Found'}
                        </span>
                        <span className={`badge ${statusBadge.class}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {claim.status}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 mb-3">{item.description}</p>
                    </div>
                    <Link
                      to={`/items/${item._id}`}
                      className="btn-secondary btn-sm ml-4"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Item
                    </Link>
                  </div>

                  {/* Item Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{item.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{formatRegularDate(item.date)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="mr-2">{getCategoryIcon(item.category)}</span>
                      <span>{item.category}</span>
                    </div>
                  </div>

                  {/* Reported By */}
                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <User className="w-4 h-4 mr-2" />
                    <span>Reported by {item.reportedBy?.name}</span>
                  </div>

                  {/* Claim Details */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Your Claim</h4>
                      <span className="text-sm text-gray-600">
                        Submitted {formatDate(claim.claimDate)}
                      </span>
                    </div>
                    
                    {claim.notes && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                          {claim.notes}
                        </p>
                      </div>
                    )}

                    {/* Status-specific information */}
                    {claim.status === 'pending' && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-start">
                          <Clock className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-yellow-800">Claim Under Review</p>
                            <p className="text-sm text-yellow-700 mt-1">
                              Staff are reviewing your claim. You will be notified once a decision is made.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {claim.status === 'verified' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-green-800">Claim Verified!</p>
                            <p className="text-sm text-green-700 mt-1">
                              Your claim has been approved. Contact the item owner to arrange pickup.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {claim.status === 'rejected' && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-start">
                          <XCircle className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-red-800">Claim Rejected</p>
                            <p className="text-sm text-red-700 mt-1">
                              Your claim could not be verified. If you believe this is an error, please contact support.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Verification Documents */}
                    {claim.verificationDocuments && claim.verificationDocuments.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Verification Documents Uploaded:
                        </p>
                        <div className="flex space-x-2">
                          {claim.verificationDocuments.map((doc, docIndex) => (
                            <span key={`doc-${docIndex}`} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              <FileText className="w-3 h-3 mr-1" />
                              Document {docIndex + 1}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tips */}
      {claims.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Claim Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-2">
              <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-blue-900">Provide detailed information</div>
                <div className="text-sm text-blue-700">Include specific details that prove ownership</div>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-blue-900">Upload verification documents</div>
                <div className="text-sm text-blue-700">Receipts, photos, or serial numbers help verify claims</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyClaimsPage;