// src/components/Items/PoliceReportModal.js
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { itemsAPI } from '../../services/api';
import LoadingSpinner from '../UI/LoadingSpinner';
import toast from 'react-hot-toast';
import { 
  X, 
  Shield, 
  AlertTriangle, 
  FileText,
  Send
} from 'lucide-react';

const PoliceReportModal = ({ isOpen, onClose, item }) => {
  const [reportNumber, setReportNumber] = useState('');
  const queryClient = useQueryClient();

  const handoverMutation = useMutation({
    mutationFn: (data) => itemsAPI.handoverToPolice(item._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['item', item._id]);
      queryClient.invalidateQueries(['adminItems']);
      toast.success('Item successfully handed over to police');
      setReportNumber('');
      onClose();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to hand over item');
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reportNumber.trim()) {
      toast.error('Police report number is required');
      return;
    }

    handoverMutation.mutate({ policeReportNumber: reportNumber.trim() });
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Police Handover</h2>
              <p className="text-sm text-gray-600">Transfer item to police custody</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={handoverMutation.isLoading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Item Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Item Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Title:</span>
                <span className="font-medium text-gray-900">{item.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className={`badge ${item.type === 'lost' ? 'badge-danger' : 'badge-success'}`}>
                  {item.type}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Category:</span>
                <span className="font-medium text-gray-900 capitalize">{item.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Location:</span>
                <span className="font-medium text-gray-900">{item.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reported:</span>
                <span className="font-medium text-gray-900">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Warning Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Important Notice</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  This action will transfer the item to police custody. The item status will be updated 
                  and the reporter will be notified. This action cannot be undone.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">
                <FileText className="w-4 h-4 inline mr-1" />
                Police Report Number *
              </label>
              <input
                type="text"
                value={reportNumber}
                onChange={(e) => setReportNumber(e.target.value)}
                placeholder="Enter official police report number"
                className={`form-input ${!reportNumber.trim() && handoverMutation.isError ? 'border-red-300' : ''}`}
                disabled={handoverMutation.isLoading}
                required
              />
              <p className="mt-1 text-sm text-gray-600">
                This number will be used for tracking and reference purposes
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={handoverMutation.isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={handoverMutation.isLoading || !reportNumber.trim()}
                className="btn-primary"
              >
                {handoverMutation.isLoading ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Confirm Handover
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Additional Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">What happens next?</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Item status will be updated to "Police Custody"</li>
              <li>• Reporter will receive an email notification</li>
              <li>• Police report number will be recorded</li>
              <li>• Item will be flagged for police management</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoliceReportModal;