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

function CreateItemPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [imageFiles, setImageFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [showMatchNotice, setShowMatchNotice] = useState(false);

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

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      toast.error('You can upload maximum 5 images');
      return;
    }

    // Validate file sizes (10MB each)
    const oversizedFiles = files.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error('Some files are too large. Maximum size is 10MB per image.');
      return;
    }

    setImageFiles(files);
    
    // Create preview URLs
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const removeImage = (index) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newUrls = previewUrls.filter((_, i) => i !== index);
    
    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(previewUrls[index]);
    
    setImageFiles(newFiles);
    setPreviewUrls(newUrls);
  };

  const onSubmit = async (data) => {
    try {
      // Show loading toast
      const loadingToast = toast.loading('Creating item and searching for matches...');

      // Convert images to base64 (in production, upload to cloud storage)
      const imageUrls = await Promise.all(
        imageFiles.map(async (file) => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        })
      );

      const itemData = {
        ...data,
        images: imageUrls,
        date: new Date(data.date).toISOString(),
      };

      await createItemMutation.mutateAsync(itemData);
      toast.dismiss(loadingToast);
    } catch (error) {
      toast.error('Failed to process images: ' + error.message);
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
              <label className="block w-full p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                <div className="text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">
                    Click to upload images or drag and drop
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    PNG, JPG up to 5 images (10MB each)
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
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
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
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
                {...register('contactInfo.phone', { required: 'Phone is required' })}
                className={`form-input ${errors.contactInfo?.phone ? 'border-red-300' : ''}`}
              />
              {errors.contactInfo?.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.contactInfo.phone.message}</p>
              )}
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
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createItemMutation.isLoading}
            className="btn-primary"
          >
            {createItemMutation.isLoading ? (
              <LoadingSpinner size="small" />
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