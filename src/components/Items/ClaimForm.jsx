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
  const [uploadedDocumentUrls, setUploadedDocumentUrls] = useState([]);
  const [uploadingDocuments, setUploadingDocuments] = useState([]);

  const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_REACT_APP_CLOUDINARY_CLOUD_NAME || 'your-cloud-name';
  const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_REACT_APP_CLOUDINARY_UPLOAD_PRESET || 'ml_default';

  // Validate Cloudinary configuration
  React.useEffect(() => {
    if (CLOUDINARY_CLOUD_NAME === 'your-cloud-name') {
      console.warn('Please set REACT_APP_CLOUDINARY_CLOUD_NAME in your .env file');
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const submitClaimMutation = useMutation({
    mutationFn: (data) => {
      return itemsAPI.submitClaim(item._id, data);
    },
    onSuccess: () => {      
      toast.success('Claim submitted successfully!');
      onSuccess();
    },
    onError: (error) => {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit claim');
    },
  });

  // Function to upload single document to Cloudinary
  const uploadDocumentToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);
    
    // Add resource type for non-image files
    if (!file.type.startsWith('image/')) {
      formData.append('resource_type', 'auto');
    }

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('Cloudinary upload error:', data);
        throw new Error(data.error?.message || 'Failed to upload document');
      }

      // Ensure we have a secure_url
      if (!data.secure_url) {
        throw new Error('Upload successful but no URL received from Cloudinary');
      }

      const uploadResult = {
        url: data.secure_url,
        name: file.name,
        type: file.type,
        size: file.size,
        publicId: data.public_id
      };

      return uploadResult;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    const currentFileCount = verificationFiles.length;
    
    // Check if adding new files would exceed the limit
    if (currentFileCount + files.length > 3) {
      toast.error(`You can only upload ${3 - currentFileCount} more document(s). Maximum 3 documents allowed.`);
      return;
    }

    // Validate file sizes (5MB each)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error('Some files are too large. Maximum size is 5MB per document.');
      return;
    }

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      toast.error('Please upload only image files (JPEG, PNG, GIF, WebP) or PDF documents');
      return;
    }

    // Add files to state
    setVerificationFiles(prev => [...prev, ...files]);

    // Create preview URLs for images
    const newPreviewUrls = files.map(file => {
      if (file.type.startsWith('image/')) {
        return URL.createObjectURL(file);
      }
      return null;
    });
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);

    // Initialize uploading state for new documents
    const newUploadingStates = files.map(() => true);
    setUploadingDocuments(prev => [...prev, ...newUploadingStates]);

    // Upload each document immediately
    try {
      const uploadPromises = files.map(async (file, index) => {
        try {
          const uploadResult = await uploadDocumentToCloudinary(file);
          
          // Update uploading state for this specific document
          setUploadingDocuments(prev => {
            const newState = [...prev];
            newState[currentFileCount + index] = false;
            return newState;
          });

          return uploadResult;
        } catch (error) {
          console.error(`Error uploading document ${index + 1}:`, error);
          
          // Update uploading state for failed upload
          setUploadingDocuments(prev => {
            const newState = [...prev];
            newState[currentFileCount + index] = false;
            return newState;
          });

          throw error;
        }
      });

      const uploadResults = await Promise.all(uploadPromises);
      
      setUploadedDocumentUrls(prev => [...prev, ...uploadResults]);
      
      toast.success(`${files.length} document(s) uploaded successfully!`);
    } catch (error) {
      toast.error(`Failed to upload some documents: ${error.message}`);
    }

    // Clear the file input to allow re-uploading the same files
    e.target.value = '';
  };

  const removeFile = (index) => {
    // Remove from all arrays
    const newFiles = verificationFiles.filter((_, i) => i !== index);
    const newUrls = previewUrls.filter((_, i) => i !== index);
    const newUploadedUrls = uploadedDocumentUrls.filter((_, i) => i !== index);
    const newUploadingStates = uploadingDocuments.filter((_, i) => i !== index);
    
    // Revoke URL to prevent memory leaks
    if (previewUrls[index]) {
      URL.revokeObjectURL(previewUrls[index]);
    }
    
    setVerificationFiles(newFiles);
    setPreviewUrls(newUrls);
    setUploadedDocumentUrls(newUploadedUrls);
    setUploadingDocuments(newUploadingStates);
  };

  const onSubmit = async (data) => {
    try {
      // Check if any documents are still uploading
      const hasUploadingDocuments = uploadingDocuments.some(isUploading => isUploading);
      if (hasUploadingDocuments) {
        toast.error('Please wait for all documents to finish uploading before submitting.');
        return;
      }

      // Validate that all uploaded documents have URLs
      const validDocuments = uploadedDocumentUrls.filter(doc => doc && doc.url);
      
      if (uploadedDocumentUrls.length > validDocuments.length) {
        toast.error('Some documents failed to upload properly. Please try uploading them again.');
        return;
      }

      // Create the exact structure we want to send
      const documentsToSend = validDocuments.map((doc) => {
        const result = {
          url: doc.url,
          name: doc.name,
          type: doc.type,
          size: doc.size,
          publicId: doc.publicId
        };
        return result;
      });

      const claimData = {
        ...data,
        verificationDocuments: documentsToSend
      };

      submitClaimMutation.mutate(claimData);
    } catch (error) {
      toast.error('Failed to submit claim: ' + error.message);
      console.error('Claim submission error:', error);
    }
  };

  const isSubmitDisabled = submitClaimMutation.isLoading || uploadingDocuments.some(isUploading => isUploading);

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
              <label className={`block w-full p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                verificationFiles.length >= 3 
                  ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}>
                <div className="text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">
                    {verificationFiles.length >= 3 
                      ? 'Maximum 3 documents reached' 
                      : 'Click to upload verification documents'
                    }
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    PDF, PNG, JPG, GIF, WebP ({3 - verificationFiles.length} remaining, 5MB each)
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  disabled={verificationFiles.length >= 3}
                  className="sr-only"
                />
              </label>

              {/* File Previews */}
              {verificationFiles.length > 0 && (
                <div className="space-y-2">
                  {verificationFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg relative">
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

                      {/* Upload status */}
                      <div className="flex items-center">
                        {uploadingDocuments[index] ? (
                          <div className="flex items-center mr-3">
                            <LoadingSpinner size="small" />
                            <span className="text-xs text-blue-600 ml-1">Uploading...</span>
                          </div>
                        ) : uploadedDocumentUrls[index] && uploadedDocumentUrls[index].url ? (
                          <div className="flex items-center mr-3">
                            <div className="bg-green-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                              ✓
                            </div>
                            <span className="text-xs text-green-600 ml-1">Uploaded</span>
                          </div>
                        ) : (
                          <div className="flex items-center mr-3">
                            <div className="bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                              ✗
                            </div>
                            <span className="text-xs text-red-600 ml-1">Failed</span>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          disabled={uploadingDocuments[index]}
                          className="text-red-500 hover:text-red-700 disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Summary */}
              {verificationFiles.length > 0 && (
                <div className="text-sm text-gray-600">
                  <p>
                    {uploadedDocumentUrls.length} of {verificationFiles.length} documents uploaded successfully
                    {uploadingDocuments.some(isUploading => isUploading) && (
                      <span className="ml-2 text-blue-600">
                        ({uploadingDocuments.filter(isUploading => isUploading).length} still uploading...)
                      </span>
                    )}
                  </p>
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
              <li>• Meet the item owner in a safe public location</li>
              <li>• Documents are securely stored on Cloudinary</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isSubmitDisabled}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="btn-primary"
            >
              {uploadingDocuments.some(isUploading => isUploading) ? (
                <>
                  <LoadingSpinner size="small" />
                  Uploading Documents...
                </>
              ) : submitClaimMutation.isLoading ? (
                <>
                  <LoadingSpinner size="small" />
                  Submitting Claim...
                </>
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