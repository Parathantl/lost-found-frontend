// src/pages/CreateItemPage.js
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { itemsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';
import { 
  Upload, 
  MapPin, 
  Calendar, 
  Package, 
  FileText, 
  User, 
  Phone, 
  Mail,
  AlertCircle,
  Save,
  Search,
  Bell
} from 'lucide-react';
import { sriLankanDistricts } from '../utils/districtsList';

function CreateItemPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [imageFiles, setImageFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState([]);
  const [showMatchNotice, setShowMatchNotice] = useState(false);
  const [uploadingImages, setUploadingImages] = useState([]);

  // Cloudinary configuration - replace with your actual values
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
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      contactInfo: {
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
      },
    },
  });

  const itemType = watch('type');
  const category = watch('category');
  const title = watch('title');

  // Show match notice when user fills in basic info
  React.useEffect(() => {
    if (itemType && category && title && title.length > 3) {
      setShowMatchNotice(true);
    } else {
      setShowMatchNotice(false);
    }
  }, [itemType, category, title]);

  const createItemMutation = useMutation({
    mutationFn: itemsAPI.createItem,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['userDashboardStats'] });
      
      // Enhanced success message with match detection info
      toast.success(
        <div>
          <div className="font-medium">Item reported successfully!</div>
          <div className="text-sm text-gray-600 mt-1">
            We're searching for potential matches and will notify you if any are found.
          </div>
        </div>,
        { duration: 5000 }
      );
      
      navigate(`/items/${data.data.data._id}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create item');
    },
  });

  // Function to upload single image to Cloudinary
  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('Cloudinary upload error:', data);
        throw new Error(data.error?.message || 'Failed to upload image');
      }

      return data.secure_url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    const currentImageCount = previewUrls.length;
    
    // Check if adding new files would exceed the limit
    if (currentImageCount + files.length > 5) {
      toast.error(`You can only upload ${5 - currentImageCount} more image(s). Maximum 5 images allowed.`);
      return;
    }

    // Validate file sizes (10MB each)
    const oversizedFiles = files.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error('Some files are too large. Maximum size is 10MB per image.');
      return;
    }

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      toast.error('Please upload only image files (JPEG, PNG, GIF, WebP)');
      return;
    }

    // Create preview URLs and add to existing arrays
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    setImageFiles(prev => [...prev, ...files]);

    // Initialize uploading state for new images
    const newUploadingStates = files.map(() => true);
    setUploadingImages(prev => [...prev, ...newUploadingStates]);

    // Upload each image immediately
    try {
      const uploadPromises = files.map(async (file, index) => {
        try {
          const uploadedUrl = await uploadImageToCloudinary(file);
          
          // Update uploading state for this specific image
          setUploadingImages(prev => {
            const newState = [...prev];
            newState[currentImageCount + index] = false;
            return newState;
          });

          return uploadedUrl;
        } catch (error) {
          console.error(`Error uploading image ${index + 1}:`, error);
          
          // Update uploading state for failed upload
          setUploadingImages(prev => {
            const newState = [...prev];
            newState[currentImageCount + index] = false;
            return newState;
          });

          throw error;
        }
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setUploadedImageUrls(prev => [...prev, ...uploadedUrls]);
      
      toast.success(`${files.length} image(s) uploaded successfully!`);
    } catch (error) {
      toast.error(`Failed to upload some images: ${error.message}`);
    }

    // Clear the file input to allow re-uploading the same files
    e.target.value = '';
  };

  const removeImage = (index) => {
    // Remove from all arrays
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newUrls = previewUrls.filter((_, i) => i !== index);
    const newUploadedUrls = uploadedImageUrls.filter((_, i) => i !== index);
    const newUploadingStates = uploadingImages.filter((_, i) => i !== index);
    
    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(previewUrls[index]);
    
    setImageFiles(newFiles);
    setPreviewUrls(newUrls);
    setUploadedImageUrls(newUploadedUrls);
    setUploadingImages(newUploadingStates);
  };

  const onSubmit = async (data) => {
    try {
      // Check if any images are still uploading
      const hasUploadingImages = uploadingImages.some(isUploading => isUploading);
      if (hasUploadingImages) {
        toast.error('Please wait for all images to finish uploading before submitting.');
        return;
      }

      // Show loading toast for item creation
      const creatingToast = toast.loading('Creating item and searching for matches...');

      const itemData = {
        ...data,
        images: uploadedImageUrls, // Use the already uploaded Cloudinary URLs
        date: new Date(data.date).toISOString(),
      };

      await createItemMutation.mutateAsync(itemData);
      toast.dismiss(creatingToast);
      
    } catch (error) {
      console.error('Error creating item:', error);
      toast.error('Failed to create item: ' + error.message);
    }
  };

  const categories = [
    { value: 'electronics', label: 'Electronics', icon: '📱' },
    { value: 'clothing', label: 'Clothing', icon: '👕' },
    { value: 'accessories', label: 'Accessories', icon: '👜' },
    { value: 'documents', label: 'Documents', icon: '📄' },
    { value: 'keys', label: 'Keys', icon: '🔑' },
    { value: 'bags', label: 'Bags', icon: '🎒' },
    { value: 'books', label: 'Books', icon: '📚' },
    { value: 'other', label: 'Other', icon: '📦' },
  ];

  const isSubmitDisabled = createItemMutation.isLoading || uploadingImages.some(isUploading => isUploading);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Report an Item</h1>
        <p className="text-gray-600 mt-2">
          Help us reunite lost items with their owners or help others find what they've lost
        </p>
      </div>

      {/* Match Detection Notice */}
      {showMatchNotice && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Search className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-blue-800">Smart Match Detection</h3>
              <p className="mt-1 text-sm text-blue-700">
                Once you submit this {itemType} item, our system will automatically search for potential matches 
                and notify you if we find any similar {itemType === 'lost' ? 'found' : 'lost'} items.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Item Type */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">What type of item?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="relative">
              <input
                type="radio"
                value="lost"
                {...register('type', { required: 'Please select item type' })}
                className="sr-only"
              />
              <div className={`p-6 border-2 rounded-lg cursor-pointer transition-colors ${
                itemType === 'lost'
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <div className="text-center">
                  <div className="text-4xl mb-2">🔍</div>
                  <h3 className="text-lg font-semibold text-gray-900">Lost Item</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    I lost something and need help finding it
                  </p>
                </div>
              </div>
            </label>
            
            <label className="relative">
              <input
                type="radio"
                value="found"
                {...register('type', { required: 'Please select item type' })}
                className="sr-only"
              />
              <div className={`p-6 border-2 rounded-lg cursor-pointer transition-colors ${
                itemType === 'found'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <div className="text-center">
                  <div className="text-4xl mb-2">📦</div>
                  <h3 className="text-lg font-semibold text-gray-900">Found Item</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    I found something and want to return it
                  </p>
                </div>
              </div>
            </label>
          </div>
          {errors.type && (
            <p className="mt-2 text-sm text-red-600">{errors.type.message}</p>
          )}
        </div>

        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Basic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">
                Item Title *
              </label>
              <input
                type="text"
                placeholder="e.g., Black iPhone 14 with blue case"
                {...register('title', { 
                  required: 'Title is required',
                  minLength: { value: 3, message: 'Title must be at least 3 characters' }
                })}
                className={`form-input ${errors.title ? 'border-red-300' : ''}`}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">
                Category *
              </label>
              <select
                {...register('category', { required: 'Category is required' })}
                className={`form-input ${errors.category ? 'border-red-300' : ''}`}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.icon} {category.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="form-label">
                Description *
              </label>
              <textarea
                rows={4}
                placeholder={`Please provide a detailed description including:\n- Color, size, brand\n- Distinctive features\n- Where and when you ${itemType === 'lost' ? 'lost' : 'found'} it\n- Any other identifying details`}
                {...register('description', { 
                  required: 'Description is required',
                  minLength: { value: 20, message: 'Description must be at least 20 characters' }
                })}
                className={`form-input ${errors.description ? 'border-red-300' : ''}`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                💡 Tip: More detailed descriptions help our system find better matches
              </p>
            </div>
          </div>
        </div>

        {/* Location and Date */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Location & Date
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">
                Location *
              </label>
              <input
                type="text"
                placeholder="e.g., University Library, Main Street, Central Park"
                {...register('location', { required: 'Location is required' })}
                className={`form-input ${errors.location ? 'border-red-300' : ''}`}
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                💡 Be specific about the location for better matches
              </p>
            </div>

            <div>
              <label className="form-label">
                Date {itemType === 'lost' ? 'Lost' : 'Found'} *
              </label>
              <input
                type="date"
                max={new Date().toISOString().split('T')[0]}
                {...register('date', { required: 'Date is required' })}
                className={`form-input ${errors.date ? 'border-red-300' : ''}`}
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">
                District *
              </label>
              <select
                {...register('district', { required: 'District is required' })}
                className={`form-input ${errors.district ? 'border-red-300' : ''}`}
              >
                <option value="">Select a district</option>
                {sriLankanDistricts.map((district) => (
                  <option key={district.value} value={district.value}>
                    {district.label}
                  </option>
                ))}
              </select>
              {errors.district && (
                <p className="mt-1 text-sm text-red-600">{errors.district.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                💡 Select the district where the item was {itemType === 'lost' ? 'lost' : 'found'}
              </p>
            </div>

          </div>
        </div>

        {/* Additional Details */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Details</h2>
          <p className="text-sm text-gray-600 mb-4">
            These details help improve match accuracy and verify ownership
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="form-label">Color</label>
              <input
                type="text"
                placeholder="e.g., Black, Red, Blue"
                {...register('additionalDetails.color')}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Brand</label>
              <input
                type="text"
                placeholder="e.g., Apple, Samsung, Nike"
                {...register('additionalDetails.brand')}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Size</label>
              <input
                type="text"
                placeholder="e.g., Large, 15 inch, Medium"
                {...register('additionalDetails.size')}
                className="form-input"
              />
            </div>

            <div className="md:col-span-3">
              <label className="form-label">Unique Identifiers</label>
              <textarea
                rows={2}
                placeholder="Any unique marks, serial numbers, or identifying features that can help verify ownership"
                {...register('additionalDetails.identifiers')}
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Upload className="w-5 h-5 mr-2" />
            Images (Recommended)
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Photos significantly improve match detection and help verify ownership
          </p>
          
          <div className="space-y-4">
            <div>
              <label className={`block w-full p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                previewUrls.length >= 5 
                  ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}>
                <div className="text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">
                    {previewUrls.length >= 5 
                      ? 'Maximum 5 images reached' 
                      : 'Click to upload images or drag and drop'
                    }
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    PNG, JPG, GIF, WebP ({5 - previewUrls.length} remaining, 10MB each)
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={previewUrls.length >= 5}
                  className="sr-only"
                />
              </label>
            </div>

            {/* Image Previews */}
            {previewUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                    
                    {/* Upload status overlay */}
                    {uploadingImages[index] && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <LoadingSpinner size="small" />
                          <p className="text-white text-xs mt-1">Uploading...</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Success indicator */}
                    {!uploadingImages[index] && uploadedImageUrls[index] && (
                      <div className="absolute top-1 left-1 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        ✓
                      </div>
                    )}
                    
                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      disabled={uploadingImages[index]}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 disabled:opacity-50"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Summary */}
            {previewUrls.length > 0 && (
              <div className="text-sm text-gray-600">
                <p>
                  {uploadedImageUrls.length} of {previewUrls.length} images uploaded successfully
                  {uploadingImages.some(isUploading => isUploading) && (
                    <span className="ml-2 text-blue-600">
                      ({uploadingImages.filter(isUploading => isUploading).length} still uploading...)
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Contact Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="form-label">
                <User className="w-4 h-4 inline mr-1" />
                Name *
              </label>
              <input
                type="text"
                {...register('contactInfo.name', { required: 'Name is required' })}
                className={`form-input ${errors.contactInfo?.name ? 'border-red-300' : ''}`}
              />
              {errors.contactInfo?.name && (
                <p className="mt-1 text-sm text-red-600">{errors.contactInfo.name.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">
                <Mail className="w-4 h-4 inline mr-1" />
                Email *
              </label>
              <input
                type="email"
                {...register('contactInfo.email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                className={`form-input ${errors.contactInfo?.email ? 'border-red-300' : ''}`}
              />
              {errors.contactInfo?.email && (
                <p className="mt-1 text-sm text-red-600">{errors.contactInfo.email.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">
                <Phone className="w-4 h-4 inline mr-1" />
                Phone *
              </label>
              <input
                type="tel"
                placeholder="e.g., 0771234567"
                {...register('contactInfo.phone', { 
                  required: 'Phone number is required',
                  pattern: {
                    value: /^0[7][0-9]{8}$/,
                    message: 'Enter a valid Sri Lankan mobile number starting with 07 (10 digits total)'
                  },
                  validate: {
                    isDigitsOnly: (value) => {
                      return /^[0-9]+$/.test(value) || 'Phone number must contain only digits';
                    },
                    isCorrectLength: (value) => {
                      return value.length === 10 || 'Phone number must be exactly 10 digits';
                    }
                  }
                })}
                onInput={(e) => {
                  // Remove any non-digit characters as user types
                  e.target.value = e.target.value.replace(/\D/g, '');
                  // Limit to 10 characters
                  if (e.target.value.length > 10) {
                    e.target.value = e.target.value.slice(0, 10);
                  }
                }}
                onKeyPress={(e) => {
                  // Prevent non-numeric characters from being entered
                  if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
                    e.preventDefault();
                  }
                }}
                className={`form-input ${errors.contactInfo?.phone ? 'border-red-300' : ''}`}
              />
              {errors.contactInfo?.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.contactInfo.phone.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Enter 10 digits starting with 07 (e.g., 0771234567)
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Important Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Important Notice</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Your contact information will only be shared with verified claimants.</li>
                  <li>Items will be automatically marked as expired after 30 days.</li>
                  <li>Please provide accurate information to help with successful recovery.</li>
                  <li className="flex items-center">
                    <Bell className="w-3 h-3 mr-1" />
                    You will receive notifications when potential matches are found.
                  </li>
                  <li>Our AI system will automatically search for matches based on your description.</li>
                  <li>Images are securely stored on Cloudinary for better performance.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
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
            {uploadingImages.some(isUploading => isUploading) ? (
              <>
                <LoadingSpinner size="small" />
                Uploading Images...
              </>
            ) : createItemMutation.isLoading ? (
              <>
                <LoadingSpinner size="small" />
                Creating Item...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Report Item & Find Matches
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateItemPage;