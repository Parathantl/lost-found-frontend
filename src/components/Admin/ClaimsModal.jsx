// src/components/Admin/ClaimsModal.js
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { itemsAPI } from '../../services/api';
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
  Eye,
  CheckCircle,
  XCircle,
  ExternalLink
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function ClaimsModal({ item, isOpen, onClose }) {
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [previewDocument, setPreviewDocument] = useState(null);
  
  const queryClient = useQueryClient();

  const updateClaimMutation = useMutation({
    mutationFn: ({ itemId, claimId, status, notes }) => 
      itemsAPI.updateClaimStatus(itemId, claimId, { status, notes }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminItems'] });
      queryClient.invalidateQueries({ queryKey: ['itemClaims', item._id] });
      
      const statusText = variables.status === 'approved' ? 'approved' : 'rejected';
      toast.success(`Claim ${statusText} successfully`);
      
      // If claim was approved, show additional success message
      if (variables.status === 'approved') {
        toast.success('Item status updated to "claimed"', { duration: 4000 });
      }
      
      setActionLoading(false);
      
      // Update local state to reflect changes
      if (selectedClaim && selectedClaim._id === variables.claimId) {
        setSelectedClaim(prev => ({
          ...prev,
          status: variables.status,
          notes: variables.notes
        }));
      }
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to update claim');
      setActionLoading(false);
    },
  });

  const markReturnedMutation = useMutation({
    mutationFn: ({ itemId, claimId, returnNotes }) => 
      itemsAPI.markItemReturned(itemId, { claimId, returnNotes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminItems'] });
      queryClient.invalidateQueries({ queryKey: ['itemClaims', item._id] });
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
      // Show confirmation dialog for approval
      const confirmApprove = window.confirm(
        `Are you sure you want to approve this claim?\n\n` +
        `This will:\n` +
        `• Approve the claim for ${claim.claimedBy?.name}\n` +
        `• Change item status to "claimed"\n` +
        `• Automatically reject other pending claims\n\n` +
        `This action cannot be undone.`
      );
      
      if (confirmApprove) {
        updateClaimMutation.mutate({
          itemId: item._id,
          claimId: claim._id,
          status: 'approved',
          notes: 'Claim approved by admin'
        });
      } else {
        setActionLoading(false);
      }
    } else if (action === 'reject') {
      const reason = prompt('Please provide a reason for rejection:');
      if (reason && reason.trim()) {
        updateClaimMutation.mutate({
          itemId: item._id,
          claimId: claim._id,
          status: 'rejected',
          notes: reason.trim()
        });
      } else {
        if (reason === '') {
          toast.error('Rejection reason is required');
        }
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
      pending: { class: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
      approved: { class: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
      rejected: { class: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
    };
    return badges[status] || badges.pending;
  };

  const getItemStatusBadge = (status) => {
    const badges = {
      active: { class: 'bg-blue-100 text-blue-800', text: 'Active' },
      claimed: { class: 'bg-green-100 text-green-800', text: 'Claimed' },
      returned: { class: 'bg-gray-100 text-gray-800', text: 'Returned' },
      expired: { class: 'bg-red-100 text-red-800', text: 'Expired' },
    };
    return badges[status] || badges.active;
  };

  const downloadDocument = async (doc) => {
    try {
      // Handle both old base64 format and new Cloudinary URL format
      if (doc.url) {
        // New Cloudinary format - direct download
        const link = document.createElement('a');
        link.href = doc.url;
        link.download = doc.name || 'document';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Document download started');
      } else if (doc.data) {
        // Old base64 format - fallback
        const link = document.createElement('a');
        link.href = doc.data;
        link.download = doc.name || 'document';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Document downloaded successfully');
      } else {
        throw new Error('Document URL or data not available');
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document. Please try again.');
    }
  };

  const previewDocumentHandler = (doc) => {
    if (doc.url) {
      // For Cloudinary URLs, we can preview directly
      if (doc.type?.startsWith('image/')) {
        setPreviewDocument(doc);
      } else {
        // For PDFs and other documents, open in new tab
        window.open(doc.url, '_blank', 'noopener,noreferrer');
      }
    } else if (doc.data) {
      // Fallback for base64 data
      if (doc.type?.startsWith('image/')) {
        setPreviewDocument(doc);
      } else {
        const blob = dataURLToBlob(doc.data);
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        // Clean up the URL after a delay
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } else {
      toast.error('Document preview not available');
    }
  };

  // Helper function to convert data URL to blob
  const dataURLToBlob = (dataURL) => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const getFileIcon = (type) => {
    if (type?.startsWith('image/')) {
      return '🖼️';
    } else if (type === 'application/pdf') {
      return '📄';
    } else {
      return '📎';
    }
  };

  const formatFileSize = (size) => {
    if (!size) return 'Unknown size';
    const mb = size / (1024 * 1024);
    return mb > 1 ? `${mb.toFixed(1)} MB` : `${(size / 1024).toFixed(1)} KB`;
  };

  // Helper function to render claim cards
  const renderClaimCard = (claim) => {
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
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusBadge.class}`}>
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
        
        {claim.notes && (
          <div className="mt-2">
            <p className="text-xs text-gray-500 truncate">
              {claim.notes}
            </p>
          </div>
        )}
      </div>
    );
  };

  // Document Preview Modal
  const DocumentPreviewModal = ({ document, onClose }) => {
    if (!document) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4">
        <div className="bg-white rounded-lg w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {document.name || 'Document Preview'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 ml-4 flex-shrink-0"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 overflow-auto">
            {document.type?.startsWith('image/') ? (
              <div className="flex items-center justify-center p-4 min-h-full">
                <img
                  src={document.url || document.data}
                  alt={document.name || 'Document'}
                  className="max-w-full max-h-full w-auto h-auto object-contain"
                  style={{ maxHeight: 'calc(95vh - 120px)' }}
                />
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">
                  Cannot preview this document type in browser
                </p>
                <button
                  onClick={() => downloadDocument(document)}
                  className="btn-primary"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Document
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen || !item) return null;

  const claims = item.claims || [];
  const approvedClaim = claims.find(claim => claim.status === 'approved');
  const pendingClaims = claims.filter(claim => claim.status === 'pending');
  const rejectedClaims = claims.filter(claim => claim.status === 'rejected');
  const itemStatusBadge = getItemStatusBadge(item.status);

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Claims for "{item.title}"
              </h2>
              <div className="flex items-center gap-4 mt-2">
                <p className="text-sm text-gray-600">
                  {claims.length} claim{claims.length !== 1 ? 's' : ''} submitted
                </p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${itemStatusBadge.class}`}>
                  {itemStatusBadge.text}
                </span>
              </div>
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
                    {/* Show approved claim first */}
                    {approvedClaim && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approved Claim
                        </h4>
                        {renderClaimCard(approvedClaim)}
                      </div>
                    )}
                    
                    {/* Show pending claims */}
                    {pendingClaims.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-yellow-700 mb-2 flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Pending Claims ({pendingClaims.length})
                        </h4>
                        <div className="space-y-2">
                          {pendingClaims.map(claim => renderClaimCard(claim))}
                        </div>
                      </div>
                    )}
                    
                    {/* Show rejected claims */}
                    {rejectedClaims.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-red-700 mb-2 flex items-center">
                          <XCircle className="w-4 h-4 mr-1" />
                          Rejected Claims ({rejectedClaims.length})
                        </h4>
                        <div className="space-y-2">
                          {rejectedClaims.map(claim => renderClaimCard(claim))}
                        </div>
                      </div>
                    )}
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
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium disabled:opacity-50 flex items-center"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            {actionLoading ? 'Processing...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleClaimAction(selectedClaim, 'reject')}
                            disabled={actionLoading}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium disabled:opacity-50 flex items-center"
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
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium disabled:opacity-50"
                        >
                          {actionLoading ? 'Processing...' : 'Mark as Returned'}
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

                  {/* Claim Status */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-2">Claim Status</h4>
                    <div className="flex items-center">
                      {(() => {
                        const statusBadge = getStatusBadge(selectedClaim.status);
                        const StatusIcon = statusBadge.icon;
                        return (
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusBadge.class}`}>
                            <StatusIcon className="w-4 h-4 mr-1" />
                            {selectedClaim.status.charAt(0).toUpperCase() + selectedClaim.status.slice(1)}
                          </span>
                        );
                      })()}
                      {selectedClaim.status === 'approved' && (
                        <span className="ml-2 text-sm text-green-600">
                          ✓ This claim has been approved
                        </span>
                      )}
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
                      <div className="space-y-3">
                        {selectedClaim.verificationDocuments.map((doc, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                          >
                            <div className="flex items-center flex-1">
                              <div className="text-2xl mr-3">
                                {getFileIcon(doc.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center">
                                  <span className="text-sm font-medium text-gray-900 truncate">
                                    {doc.name || `Document ${index + 1}`}
                                  </span>
                                  {doc.url && (
                                    <ExternalLink className="w-3 h-3 ml-1 text-gray-400" />
                                  )}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {doc.type || 'Unknown type'}
                                  {doc.size && (
                                    <span className="ml-2">• {formatFileSize(doc.size)}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              <button
                                onClick={() => previewDocumentHandler(doc)}
                                className="text-blue-600 hover:text-blue-700 p-1 rounded"
                                title="Preview document"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => downloadDocument(doc)}
                                className="text-green-600 hover:text-green-700 p-1 rounded"
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
                      {selectedClaim.status === 'approved' && item.status === 'returned' && (
                        <div className="flex items-center text-sm">
                          <div className="w-2 h-2 bg-gray-500 rounded-full mr-3"></div>
                          <span className="text-gray-600">
                            Item marked as returned
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

      {/* Document Preview Modal */}
      <DocumentPreviewModal 
        document={previewDocument} 
        onClose={() => setPreviewDocument(null)} 
      />
    </>
  );
}

export default ClaimsModal;