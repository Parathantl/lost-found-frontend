// src/components/Items/ClaimForm.js
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { itemsAPI } from '../../services/api';
import LoadingSpinner from '../UI/LoadingSpinner';
import toast from 'react-hot-toast';
import { X, Upload, FileText, AlertCircle, Send } from 'lucide-react';

function ClaimForm({ item, onClose, onSuccess }) {
  const [verificationFiles, setVerificationFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const submitClaimMutation = useMutation({
    mutationFn: (data) => itemsAPI.submitClaim(item._id, data),
    onSuccess: () => {
      toast.success('Claim submitted successfully!');
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to submit claim');
    },
  });  

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 3) {
      toast.error('You can upload maximum 3 verification documents');
      return;
    }

    setVerificationFiles(files);
    
    // Create preview URLs for images
    const urls = files.map(file => {
      if (file.type.startsWith('image/')) {
        return URL.createObjectURL(file);
      }
      return null;
    });
    setPreviewUrls(urls);
  };

  const removeFile = (index) => {
    const newFiles = verificationFiles.filter((_, i) => i !== index);
    const newUrls = previewUrls.filter((_, i) => i !== index);
    
    // Revoke URL to prevent memory leaks
    if (previewUrls[index]) {
      URL.revokeObjectURL(previewUrls[index]);
    }
    
    setVerificationFiles(newFiles);
    setPreviewUrls(newUrls);
  };

  const onSubmit = async (data) => {
    try {
      // Convert files to base64 for demo purposes
      const verificationDocuments = await Promise.all(
        verificationFiles.map(async (file) => {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve({
              name: file.name,
              type: file.type,
              data: reader.result
            });
            reader.readAsDataURL(file);
          });
        })
      );

      const claimData = {
        ...data,
        verificationDocuments,
      };

      submitClaimMutation.mutate(claimData);
    } catch (error) {
      toast.error('Failed to process verification documents');
      console.error('File processing error:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Claim Item</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Item Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Item Details</h3>
            <p className="text-gray-700 font-medium">{item.title}</p>
            <p className="text-gray-600 text-sm">{item.description}</p>
            <div className="mt-2 text-sm text-gray-600">
              <span>Location: {item.location}</span>
              <span className="ml-4">Date: {new Date(item.date).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Warning Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Important Notice</h4>
                <p className="mt-1 text-sm text-yellow-700">
                  By submitting this claim, you confirm that you are the rightful owner of this item. 
                  False claims may result in account suspension.
                </p>
              </div>
            </div>
          </div>

          {/* Claim Details */}
          <div>
            <label className="form-label">
              Why do you believe this item belongs to you? *
            </label>
            <textarea
              rows={4}
              placeholder="Please provide specific details about the item that prove your ownership. Include information about where you lost it, when, unique features, etc."
              {...register('notes', { 
                required: 'Please provide details about your ownership claim',
                minLength: { value: 20, message: 'Please provide more detailed information (at least 20 characters)' }
              })}
              className={`form-input ${errors.notes ? 'border-red-300' : ''}`}
            />
            {errors.notes && (
              <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
            )}
          </div>

          {/* Verification Documents */}
          <div>
            <label className="form-label">
              Verification Documents (Optional)
            </label>
            <p className="text-sm text-gray-600 mb-3">
              Upload documents that can help verify your ownership (e.g., purchase receipts, photos, serial numbers)
            </p>
            
            <div className="space-y-4">
              <label className="block w-full p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                <div className="text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">
                    Click to upload verification documents
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    PDF, PNG, JPG up to 3 files (5MB each)
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>

              {/* File Previews */}
              {verificationFiles.length > 0 && (
                <div className="space-y-2">
                  {verificationFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        {previewUrls[index] ? (
                          <img
                            src={previewUrls[index]}
                            alt={`Preview ${index + 1}`}
                            className="w-10 h-10 object-cover rounded mr-3"
                          />
                        ) : (
                          <FileText className="w-10 h-10 text-gray-400 mr-3" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-600">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Verification Requirements */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Verification Process</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Your claim will be reviewed by staff</li>
              <li>• You may be contacted for additional verification</li>
              {/* <li>• Approved claims will be notified via email</li> */}
              <li>• Meet the item owner in a safe public location</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitClaimMutation.isLoading}
              className="btn-primary"
            >
              {submitClaimMutation.isLoading ? (
                <LoadingSpinner size="small" />
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Claim
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ClaimForm;