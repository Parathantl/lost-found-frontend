// src/components/Staff/StaffClaimsReview.js
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { itemsAPI } from '../../services/api';
import LoadingSpinner from '../UI/LoadingSpinner';
import toast from 'react-hot-toast';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  User,
  MapPin,
  Calendar,
  Package,
  AlertCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function StaffClaimsReview() {
  const { user } = useAuth();
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [claimAction, setClaimAction] = useState({ status: '', notes: '' });

  const queryClient = useQueryClient();

  // Get items with pending claims in staff's location
  const { data, isLoading, error } = useQuery({
    queryKey: ['staffPendingClaims', user?.branch],
    queryFn: () =>
      itemsAPI.getItems({
        location: user?.branch || '',
        status: '',
        limit: 100,
      }),
    select: (data) => {
      const items = data?.data?.data || [];
      return items.filter(
        (item) =>
          item.claims &&
          item.claims.some((claim) => claim.status === 'pending') &&
          item.location.toLowerCase().includes((user?.branch || '').toLowerCase())
      );
    },
    refetchInterval: 30000,
    enabled: !!user?.branch, // important to avoid calling query before user is loaded
  });  

  const updateClaimMutation = useMutation({
    mutationKey: ['updateClaim'],
    mutationFn: ({ itemId, claimId, data }) =>
      itemsAPI.updateClaimStatus(itemId, claimId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffPendingClaims'] });
      toast.success('Claim status updated successfully');
      setShowModal(false);
      setSelectedClaim(null);
      setClaimAction({ status: '', notes: '' });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update claim');
    },
  });
  
  const markReturnedMutation = useMutation({
    mutationKey: ['markReturned'],
    mutationFn: ({ itemId, data }) => itemsAPI.markItemReturned(itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffPendingClaims'] });
      toast.success('Item marked as returned successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to mark item as returned');
    },
  });

  const handleClaimAction = (item, claim, action) => {
    setSelectedClaim({ item, claim });
    setClaimAction({ status: action, notes: '' });
    setShowModal(true);
  };

  const handleSubmitClaimAction = () => {
    if (!selectedClaim || !claimAction.status) return;

    const { item, claim } = selectedClaim;
    
    updateClaimMutation.mutate({
      itemId: item._id,
      claimId: claim._id,
      data: claimAction
    });
  };

  const handleMarkReturned = (item, claim) => {
    if (window.confirm('Mark this item as successfully returned to the claimant?')) {
      markReturnedMutation.mutate({
        itemId: item._id,
        data: {
          claimId: claim._id,
          returnNotes: `Item returned to ${claim.claimedBy?.name} on ${new Date().toLocaleDateString()}`
        }
      });
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'badge-warning', icon: Clock },
      verified: { class: 'badge-success', icon: CheckCircle },
      rejected: { class: 'badge-danger', icon: XCircle },
    };
    return badges[status] || { class: 'badge-gray', icon: Clock };
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
        <LoadingSpinner size="large" text="Loading claims..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800">Failed to load claims. Please try again.</p>
      </div>
    );
  }

  const itemsWithPendingClaims = data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Claims Review</h1>
          <div className="flex items-center mt-1 text-gray-600">
            <MapPin className="w-4 h-4 mr-1" />
            <span>Location: <strong>{user?.branch || 'Not assigned'}</strong></span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-yellow-600">
            {itemsWithPendingClaims.reduce((total, item) => 
              total + item.claims.filter(claim => claim.status === 'pending').length, 0
            )}
          </div>
          <div className="text-sm text-gray-600">Pending Claims</div>
        </div>
      </div>

      {/* Claims List */}
      {itemsWithPendingClaims.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No pending claims</h3>
          <p className="text-gray-600">
            All claims in your location have been reviewed. Great job!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {itemsWithPendingClaims.map((item) => {
            const pendingClaims = item.claims.filter(claim => claim.status === 'pending');
            
            return (
              <div key={item._id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                {/* Item Header */}
                <div className="p-6 border-b bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="text-3xl">{getCategoryIcon(item.category)}</div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 mb-2">{item.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {item.location}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(item.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {item.reportedBy?.name}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`badge ${item.type === 'lost' ? 'badge-danger' : 'badge-success'}`}>
                        {item.type === 'lost' ? '🔍 Lost' : '📦 Found'}
                      </span>
                      <a
                        href={`/items/${item._id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary btn-sm"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Item
                      </a>
                    </div>
                  </div>
                </div>

                {/* Pending Claims */}
                <div className="p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">
                    Pending Claims ({pendingClaims.length})
                  </h4>
                  
                  <div className="space-y-4">
                    {pendingClaims.map((claim, index) => {
                      const statusBadge = getStatusBadge(claim.status);
                      const StatusIcon = statusBadge.icon;

                      return (
                        <div key={index} className="border rounded-lg p-4 bg-yellow-50">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-yellow-200 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-yellow-700" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {claim.claimedBy?.name || 'Anonymous'}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {claim.claimedBy?.email}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {claim.claimDate
                                    ? `Submitted ${formatDistanceToNow(new Date(claim.claimDate), { addSuffix: true })}`
                                    : 'Submitted date not available'}
                                </div>
                              </div>
                            </div>
                            <span className={`badge ${statusBadge.class}`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {claim.status}
                            </span>
                          </div>

                          {/* Claim Details */}
                          {claim.notes && (
                            <div className="mb-4 p-3 bg-white rounded border">
                              <div className="font-medium text-gray-900 mb-1">Claimant's Statement:</div>
                              <p className="text-gray-700 text-sm">{claim.notes}</p>
                            </div>
                          )}

                          {/* Verification Documents */}
                          {claim.verificationDocuments && claim.verificationDocuments.length > 0 && (
                            <div className="mb-4">
                              <div className="font-medium text-gray-900 mb-2">Verification Documents:</div>
                              <div className="flex space-x-2">
                                {claim.verificationDocuments.map((doc, docIndex) => (
                                  <span key={docIndex} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                    <FileText className="w-3 h-3 mr-1" />
                                    Document {docIndex + 1}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleClaimAction(item, claim, 'verified')}
                              className="btn-success btn-sm"
                              disabled={updateClaimMutation.isLoading}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Verify Claim
                            </button>
                            <button
                              onClick={() => handleClaimAction(item, claim, 'rejected')}
                              className="btn-danger btn-sm"
                              disabled={updateClaimMutation.isLoading}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject Claim
                            </button>
                            {claim.status === 'verified' && (
                              <button
                                onClick={() => handleMarkReturned(item, claim)}
                                className="btn-primary btn-sm"
                                disabled={markReturnedMutation.isLoading}
                              >
                                <Package className="w-4 h-4 mr-1" />
                                Mark Returned
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Claim Action Modal */}
      {showModal && selectedClaim && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                {claimAction.status === 'verified' ? 'Verify Claim' : 'Reject Claim'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-2">
                  <strong>Item:</strong> {selectedClaim.item.title}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <strong>Claimant:</strong> {selectedClaim.claim.claimedBy?.name}
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label">
                  {claimAction.status === 'verified' ? 'Verification Notes' : 'Rejection Reason'}
                </label>
                <textarea
                  rows={4}
                  value={claimAction.notes}
                  onChange={(e) => setClaimAction({ ...claimAction, notes: e.target.value })}
                  className="form-input"
                  placeholder={
                    claimAction.status === 'verified' 
                      ? 'Add any notes about the verification process...'
                      : 'Explain why this claim is being rejected...'
                  }
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitClaimAction}
                  disabled={updateClaimMutation.isLoading}
                  className={claimAction.status === 'verified' ? 'btn-success' : 'btn-danger'}
                >
                  {updateClaimMutation.isLoading ? (
                    <LoadingSpinner size="small" />
                  ) : (
                    <>
                      {claimAction.status === 'verified' ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Verify Claim
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject Claim
                        </>
                      )}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Claim Review Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-blue-900">Verify ownership carefully</div>
              <div className="text-sm text-blue-700">Ask specific questions about the item that only the owner would know</div>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-blue-900">Document the process</div>
              <div className="text-sm text-blue-700">Add detailed notes about your verification or rejection decision</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StaffClaimsReview;