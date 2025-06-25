import React, { useState } from 'react';
import { Star, Send, CheckCircle, X, ThumbsUp, MessageSquare, Award } from 'lucide-react';
import { FIR } from '../../App';

interface FeedbackFormProps {
  fir: FIR;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: FeedbackData) => void;
}

interface FeedbackData {
  firId: string;
  rating: number;
  experience: string;
  improvements: string;
  wouldRecommend: boolean;
  categories: {
    processEase: number;
    communication: number;
    responseTime: number;
    resolution: number;
  };
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ fir, isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<FeedbackData>({
    firId: fir._id,
    rating: 0,
    experience: '',
    improvements: '',
    wouldRecommend: false,
    categories: {
      processEase: 0,
      communication: 0,
      responseTime: 0,
      resolution: 0,
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleStarClick = (rating: number, category?: keyof typeof formData.categories) => {
    if (category) {
      setFormData(prev => ({
        ...prev,
        categories: {
          ...prev.categories,
          [category]: rating
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, rating }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onSubmit(formData);
    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  const renderStars = (rating: number, onStarClick: (rating: number) => void, size: 'sm' | 'lg' = 'sm') => {
    const starSize = size === 'lg' ? 'h-8 w-8' : 'h-5 w-5';
    
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onStarClick(star)}
            className={`${starSize} transition-colors ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            } hover:text-yellow-400`}
          >
            <Star className={`${starSize} fill-current`} />
          </button>
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="bg-green-100 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Thank You!</h3>
          <p className="text-gray-600 mb-6">
            Your feedback has been submitted successfully. Your input helps us improve our services for all citizens.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <Award className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">Feedback Reward</span>
            </div>
            <p className="text-sm text-blue-800">
              You've earned 50 citizen points for providing valuable feedback. These points can be used for priority services.
            </p>
          </div>
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-orange-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-orange-700 hover:to-blue-700 transition-all font-medium"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-blue-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">Share Your Experience</h3>
              <p className="text-orange-100 mt-1">FIR #{fir.id} - {fir.incidentType}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Overall Rating */}
          <div className="text-center">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Overall Experience Rating</h4>
            <div className="flex justify-center mb-4">
              {renderStars(formData.rating, (rating) => handleStarClick(rating), 'lg')}
            </div>
            <p className="text-sm text-gray-600">
              {formData.rating === 0 && 'Please rate your experience'}
              {formData.rating === 1 && 'Very Poor'}
              {formData.rating === 2 && 'Poor'}
              {formData.rating === 3 && 'Average'}
              {formData.rating === 4 && 'Good'}
              {formData.rating === 5 && 'Excellent'}
            </p>
          </div>

          {/* Category Ratings */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Rate Specific Aspects</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Process Ease
                </label>
                {renderStars(formData.categories.processEase, (rating) => handleStarClick(rating, 'processEase'))}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Communication
                </label>
                {renderStars(formData.categories.communication, (rating) => handleStarClick(rating, 'communication'))}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Response Time
                </label>
                {renderStars(formData.categories.responseTime, (rating) => handleStarClick(rating, 'responseTime'))}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resolution Quality
                </label>
                {renderStars(formData.categories.resolution, (rating) => handleStarClick(rating, 'resolution'))}
              </div>
            </div>
          </div>

          {/* Experience Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe Your Experience
            </label>
            <textarea
              value={formData.experience}
              onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
              rows={4}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Please share details about your experience with the FIR process, officer interaction, and case resolution..."
            />
          </div>

          {/* Improvements */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Suggestions for Improvement
            </label>
            <textarea
              value={formData.improvements}
              onChange={(e) => setFormData(prev => ({ ...prev, improvements: e.target.value }))}
              rows={3}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="How can we improve our services? Any specific suggestions..."
            />
          </div>

          {/* Recommendation */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <ThumbsUp className="h-6 w-6 text-blue-600" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Would you recommend our FIR system to others?
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="recommend"
                      checked={formData.wouldRecommend === true}
                      onChange={() => setFormData(prev => ({ ...prev, wouldRecommend: true }))}
                      className="mr-2 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">Yes</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="recommend"
                      checked={formData.wouldRecommend === false}
                      onChange={() => setFormData(prev => ({ ...prev, wouldRecommend: false }))}
                      className="mr-2 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">No</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || formData.rating === 0}
              className="flex-1 bg-gradient-to-r from-orange-600 to-blue-600 text-white py-3 px-4 rounded-xl hover:from-orange-700 hover:to-blue-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Submitting...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Send className="h-5 w-5 mr-2" />
                  Submit Feedback
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackForm;