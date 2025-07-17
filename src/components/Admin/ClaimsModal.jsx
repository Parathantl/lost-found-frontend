// src/components/Admin/ClaimsModal.js
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  FileText, 
  Calendar,
  Check,
  AlertCircle,
  Clock,
  Download,
  Eye
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function ClaimsModal({ item, isOpen, onClose }) {
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  const queryClient = useQueryClient();

  const updateClaimMutation = useMutation({
    mutationFn: ({ itemId, claimId, status, notes }) => 
      adminAPI.updateClaimStatus(itemId, claimId, { status, notes }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminItems'] });
      toast.success(`Claim ${variables.status} successfully`);
      setActionLoading(false);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to update claim');
      setActionLoading(false);
    },
  });

  const markReturnedMutation = useMutation({
    mutationFn: ({ itemId, claimId, returnNotes }) => 
      adminAPI.markItemReturned(itemId, { claimId, returnNotes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminItems'] });
      toast.success('Item marked as returned successfully');
      setActionLoading(false);
      onClose();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to mark as returned');
      setActionLoading(false);
    },
  });

  const handleClaimAction = async (claim, action) => {
    setActionLoading(true);
    
    if (action === 'approve') {
      updateClaimMutation.mutate({
        itemId: item._id,
        claimId: claim._id,
        status: 'approved',
        notes: 'Claim approved by admin'
      });
    } else if (action === 'reject') {
      const reason = prompt('Please provide a reason for rejection:');
      if (reason) {
        updateClaimMutation.mutate({
          itemId: item._id,
          claimId: claim._id,
          status: 'rejected',
          notes: reason
        });
      } else {
        setActionLoading(false);
      }
    } else if (action === 'return') {
      const returnNotes = prompt('Add return notes (optional):');
      markReturnedMutation.mutate({
        itemId: item._id,
        claimId: claim._id,
        returnNotes: returnNotes || ''
      });
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { class: 'bg-green-100 text-green-800', icon: Check },
      rejected: { class: 'bg-red-100 text-red-800', icon: X },
    };
    return badges[status] || badges.pending;
  };

  const downloadDocument = (doc) => {
    // Create a download link for the document
    const link = document.createElement('a');
    link.href = `data:${doc.type};base64,${doc.data}`;
    link.download = doc.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen || !item) return null;

  const claims = item.claims || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Claims for "{item.title}"
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {claims.length} claim{claims.length !== 1 ? 's' : ''} submitted
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex h-[calc(90vh-120px)]">
          {/* Claims List */}
          <div className="w-1/2 border-r border-gray-200 overflow-y-auto">
            <div className="p-4">
              <h3 className="font-medium text-gray-900 mb-4">All Claims</h3>
              
              {claims.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No claims submitted yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {claims.map((claim) => {
                    const statusBadge = getStatusBadge(claim.status);
                    const StatusIcon = statusBadge.icon;
                    
                    return (
                      <div
                        key={claim._id}
                        onClick={() => setSelectedClaim(claim)}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                          selectedClaim?._id === claim._id ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900">
                              {claim.claimedBy?.name || 'Unknown User'}
                            </span>
                          </div>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusBadge.class}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {claim.status}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center">
                            <Mail className="w-3 h-3 mr-2" />
                            {claim.claimedBy?.email || 'No email'}
                          </div>
                          <div className="flex items-center">
                            <Phone className="w-3 h-3 mr-2" />
                            {claim.claimedBy?.phone || 'No phone'}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-2" />
                            {formatDistanceToNow(new Date(claim.createdAt), { addSuffix: true })}
                          </div>
                        </div>
                        
                        {claim.verificationDocuments?.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs text-gray-500">
                              {claim.verificationDocuments.length} document{claim.verificationDocuments.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Claim Details */}
          <div className="w-1/2 overflow-y-auto">
            {selectedClaim ? (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Claim Details</h3>
                  <div className="flex items-center space-x-2">
                    {selectedClaim.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleClaimAction(selectedClaim, 'approve')}
                          disabled={actionLoading}
                          className="btn-success btn-sm"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleClaimAction(selectedClaim, 'reject')}
                          disabled={actionLoading}
                          className="btn-danger btn-sm"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </button>
                      </>
                    )}
                    {selectedClaim.status === 'approved' && item.status !== 'returned' && (
                      <button
                        onClick={() => handleClaimAction(selectedClaim, 'return')}
                        disabled={actionLoading}
                        className="btn-primary btn-sm"
                      >
                        Mark as Returned
                      </button>
                    )}
                  </div>
                </div>

                {/* Claimant Information */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Claimant Information</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-3" />
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedClaim.claimedBy?.name || 'Unknown User'}
                        </span>
                        {selectedClaim.claimedBy?.role && (
                          <span className="ml-2 text-xs text-gray-500">
                            ({selectedClaim.claimedBy.role})
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-400 mr-3" />
                      <a
                        href={`mailto:${selectedClaim.claimedBy?.email}`}
                        className="text-sm text-primary-600 hover:text-primary-700"
                      >
                        {selectedClaim.claimedBy?.email || 'No email provided'}
                      </a>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-400 mr-3" />
                      <a
                        href={`tel:${selectedClaim.claimedBy?.phone}`}
                        className="text-sm text-primary-600 hover:text-primary-700"
                      >
                        {selectedClaim.claimedBy?.phone || 'No phone provided'}
                      </a>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-600">
                        Submitted {formatDistanceToNow(new Date(selectedClaim.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Claim Notes */}
                {selectedClaim.notes && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {selectedClaim.notes}
                      </p>
                    </div>
                  </div>
                )}

                {/* Verification Documents */}
                {selectedClaim.verificationDocuments?.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">
                      Verification Documents ({selectedClaim.verificationDocuments.length})
                    </h4>
                    <div className="space-y-2">
                      {selectedClaim.verificationDocuments.map((doc, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center">
                            <FileText className="w-4 h-4 text-gray-400 mr-3" />
                            <div>
                              <span className="text-sm font-medium text-gray-900">
                                {doc.name}
                              </span>
                              <span className="text-xs text-gray-500 ml-2">
                                ({doc.type})
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                // Preview document (you can implement a preview modal)
                                toast.info('Document preview feature coming soon');
                              }}
                              className="text-primary-600 hover:text-primary-700"
                              title="Preview document"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => downloadDocument(doc)}
                              className="text-primary-600 hover:text-primary-700"
                              title="Download document"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status History */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Status History</h4>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-gray-600">
                        Claim submitted on {new Date(selectedClaim.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {selectedClaim.updatedAt !== selectedClaim.createdAt && (
                      <div className="flex items-center text-sm">
                        <div className={`w-2 h-2 rounded-full mr-3 ${
                          selectedClaim.status === 'approved' ? 'bg-green-500' : 
                          selectedClaim.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                        }`}></div>
                        <span className="text-gray-600">
                          Status updated to "{selectedClaim.status}" on {new Date(selectedClaim.updatedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Select a claim to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClaimsModal;