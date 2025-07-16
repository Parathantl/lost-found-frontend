// src/components/Items/PotentialMatchesModal.js
import React from 'react';
import { X, ExternalLink, MapPin, Calendar, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

function PotentialMatchesModal({ item, matches = [], onClose }) {
  // Add safety checks
  if (!item) {
    return null;
  }

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            Potential Matches for "{item.title || 'Unknown Item'}"
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 p-1"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {matches.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Matches Found</h3>
              <p className="text-gray-600">
                No potential matches were found for this item at the moment.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Found {matches.length} potential match{matches.length > 1 ? 'es' : ''} based on similarity analysis.
              </p>
              
              <div className="grid gap-4">
                {matches.map((match, index) => (
                  <div key={match.item?._id || index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-lg">
                            {match.item?.title || 'Unknown Item'}
                          </h3>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                            {match.similarity || 0}% match
                          </span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            match.item?.type === 'lost' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {match.item?.type || 'unknown'}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-3">
                          {match.item?.description || 'No description available'}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {match.item?.location || 'Unknown location'}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {match.item?.date 
                              ? new Date(match.item.date).toLocaleDateString()
                              : 'Unknown date'
                            }
                          </div>
                          <div className="flex items-center">
                            <Package className="w-4 h-4 mr-1" />
                            {getCategoryIcon(match.item?.category)} {match.item?.category || 'other'}
                          </div>
                        </div>
                        
                        {match.reasons && match.reasons.length > 0 && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm font-medium text-blue-900 mb-1">
                              Why this might be a match:
                            </p>
                            <ul className="text-sm text-blue-800 space-y-1">
                              {match.reasons.map((reason, reasonIndex) => (
                                <li key={reasonIndex} className="flex items-start">
                                  <span className="text-blue-600 mr-2">•</span>
                                  {reason}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* Contact info if available */}
                        {match.item?.reportedBy?.name && (
                          <div className="mt-2 text-sm text-gray-600">
                            Reported by: <span className="font-medium">{match.item.reportedBy.name}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="ml-4 flex flex-col space-y-2">
                        {match.item?._id && (
                          <Link
                            to={`/items/${match.item._id}`}
                            className="btn-primary btn-sm flex items-center"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            View Item
                          </Link>
                        )}
                        
                        {/* Quick contact button if contact info available */}
                        {match.item?.contactInfo?.email && (
                          <a
                            href={`mailto:${match.item.contactInfo.email}?subject=Regarding ${match.item.title}&body=Hi, I saw your ${match.item.type} item listing and think it might match what I'm looking for.`}
                            className="btn-secondary btn-sm text-center"
                          >
                            Contact
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="border-t p-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Matches are found using AI-powered similarity detection
            </p>
            <button
              onClick={onClose}
              className="btn-secondary btn-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PotentialMatchesModal;