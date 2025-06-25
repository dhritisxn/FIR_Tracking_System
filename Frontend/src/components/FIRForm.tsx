import React, { useState } from 'react';
import { FIR } from '../App';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, User, Phone, Mail, MapPin, Calendar, FileText, AlertTriangle, Save, Upload, X, Image, File } from 'lucide-react';

interface FIRFormProps {
  onBack: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'https://fir-tracking-system.onrender.com/api';

const FIRForm: React.FC<FIRFormProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    complainantName: user?.name || '',
    phoneNumber: user?.phoneNumber || '',
    email: user?.email || '',
    incidentType: '',
    location: '',
    dateTime: '',
    description: '',
    evidenceFiles: [] as string[]
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [generatedFIRId, setGeneratedFIRId] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const incidentTypes = [
    'Theft',
    'Burglary',
    'Cyber Fraud',
    'Credit Card Fraud',
    'Online Scam',
    'Identity Theft',
    'Assault',
    'Domestic Violence',
    'Sexual Harassment',
    'Property Damage',
    'Vehicle Theft',
    'Missing Person',
    'Drug Related',
    'Public Disturbance',
    'Corruption',
    'Fraud',
    'Cheating',
    'Extortion',
    'Kidnapping',
    'Other'
  ];

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.complainantName.trim()) {
      newErrors.complainantName = 'Complainant name is required';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^[+]?[\d\s-()]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.incidentType) {
      newErrors.incidentType = 'Incident type is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.dateTime) {
      newErrors.dateTime = 'Date and time of incident is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Incident description is required';
    } else if (formData.description.trim().length < 20) {
      newErrors.description = 'Please provide a detailed description (minimum 20 characters)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type === 'application/pdf' || file.type.startsWith('video/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      alert('Some files were rejected. Please upload only images, PDFs, or videos under 10MB.');
    }

    setUploadedFiles(prev => [...prev, ...validFiles]);
    setFormData(prev => ({
      ...prev,
      evidenceFiles: [...prev.evidenceFiles, ...validFiles.map(file => file.name)]
    }));
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      evidenceFiles: prev.evidenceFiles.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_URL}/register_fir`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register FIR');
      }

      setGeneratedFIRId(data.fir.id);
      setShowSuccess(true);
      
      // After showing success message for 2 seconds, reload page
      setTimeout(() => {
        window.location.reload();
      }, 2000);

      // Reset form after successful submission
      setFormData({
        complainantName: user?.name || '',
        phoneNumber: user?.phoneNumber || '',
        email: user?.email || '',
        incidentType: '',
        location: '',
        dateTime: '',
        description: '',
        evidenceFiles: []
      });
      setUploadedFiles([]);
    } catch (error) {
      console.error('Error submitting FIR:', error);
      setErrors({ submit: 'Failed to submit FIR. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center border-2 border-green-200">
            <div className="bg-green-100 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center border-2 border-green-300">
              <Save className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">FIR Submitted Successfully!</h2>
            <p className="text-gray-600 mb-6">
              Your FIR has been registered with ID: <strong className="text-blue-600 text-xl">{generatedFIRId}</strong>
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Please save this ID for future reference. You can use it to track your FIR status.
            </p>
            
            <div className="bg-blue-50 p-6 rounded-xl mb-6 border-2 border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">What happens next?</h3>
              <ul className="text-sm text-blue-800 text-left space-y-2">
                <li>• Your FIR will be reviewed by our team within 24 hours</li>
                <li>• An investigating officer will be assigned automatically</li>
                <li>• You will receive updates via email and SMS</li>
                <li>• You can track progress using your FIR ID</li>
                <li>• You'll receive notifications for all status updates</li>
                {uploadedFiles.length > 0 && (
                  <li>• Your uploaded evidence files have been securely stored</li>
                )}
              </ul>
            </div>

            {(formData.incidentType.includes('Cyber') || formData.incidentType.includes('Fraud')) && (
              <div className="bg-red-50 p-6 rounded-xl mb-6 border-2 border-red-200">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div className="text-left">
                    <h4 className="text-sm font-semibold text-red-900 mb-2">Immediate Actions for Cyber Crime:</h4>
                    <ul className="text-sm text-red-800 space-y-1">
                      <li>• Block all affected cards/accounts immediately</li>
                      <li>• Report to cybercrime.gov.in</li>
                      <li>• Preserve all digital evidence (screenshots, emails)</li>
                      <li>• Do not share OTP/PIN with anyone</li>
                      <li>• Contact your bank's fraud helpline</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onBack}
                className="bg-gradient-to-r from-orange-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-orange-700 hover:to-blue-700 transition-colors font-medium"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => window.print()}
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors font-medium border-2 border-gray-300"
              >
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
            नई FIR दर्ज करें | File a New FIR
          </h1>
          <p className="text-gray-600 mt-2 text-lg">Please provide accurate information about the incident</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-orange-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
              <User className="h-5 w-5 text-orange-600" />
              <span>Complainant Information</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.complainantName}
                  onChange={(e) => handleInputChange('complainantName', e.target.value)}
                  className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${
                    errors.complainantName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.complainantName && (
                  <p className="text-red-600 text-sm mt-1">{errors.complainantName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${
                    errors.phoneNumber ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="+91-XXXXXXXXXX"
                />
                {errors.phoneNumber && (
                  <p className="text-red-600 text-sm mt-1">{errors.phoneNumber}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="your.email@example.com"
                />
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                )}
              </div>
            </div>
          </div>

          {/* Incident Information */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span>Incident Details</span>
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type of Incident *
                </label>
                <select
                  value={formData.incidentType}
                  onChange={(e) => handleInputChange('incidentType', e.target.value)}
                  className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.incidentType ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select incident type</option>
                  {incidentTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.incidentType && (
                  <p className="text-red-600 text-sm mt-1">{errors.incidentType}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location of Incident *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.location ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="City, State, Landmark or specific address"
                />
                {errors.location && (
                  <p className="text-red-600 text-sm mt-1">{errors.location}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date and Time of Incident *
                </label>
                <input
                  type="datetime-local"
                  value={formData.dateTime}
                  onChange={(e) => handleInputChange('dateTime', e.target.value)}
                  max={new Date().toISOString().slice(0, 16)}
                  className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.dateTime ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.dateTime && (
                  <p className="text-red-600 text-sm mt-1">{errors.dateTime}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detailed Description of Incident *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={6}
                  className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Please provide a detailed description of what happened, including any witnesses, evidence, or other relevant information..."
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.description && (
                    <p className="text-red-600 text-sm">{errors.description}</p>
                  )}
                  <p className="text-xs text-gray-500 ml-auto">
                    {formData.description.length} characters (minimum 20 required)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Evidence Upload Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
              <Upload className="h-5 w-5 text-green-600" />
              <span>Upload Evidence (Optional)</span>
            </h2>
            
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-green-400 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="evidence-upload"
                />
                <label htmlFor="evidence-upload" className="cursor-pointer">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">Upload Evidence Files</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Drag and drop files here, or click to select
                  </p>
                  <p className="text-xs text-gray-400">
                    Supported formats: Images (JPG, PNG, GIF), Videos (MP4, AVI), Documents (PDF)
                    <br />
                    Maximum file size: 10MB per file
                  </p>
                </label>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-700">Uploaded Files:</h3>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-3">
                        {file.type.startsWith('image/') ? (
                          <Image className="h-5 w-5 text-blue-600" />
                        ) : (
                          <File className="h-5 w-5 text-gray-600" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cyber Crime Notice */}
          {(formData.incidentType.includes('Cyber') || formData.incidentType.includes('Fraud')) && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-6 w-6 text-red-600 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-red-900 mb-2">Important: Cyber Crime Report</h3>
                  <p className="text-sm text-red-800 mb-3">
                    For cyber crimes, please also take these immediate steps:
                  </p>
                  <ul className="text-sm text-red-800 space-y-1">
                    <li>• Report on the National Cyber Crime Portal: <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="underline">cybercrime.gov.in</a></li>
                    <li>• Block your cards/accounts immediately if financial fraud</li>
                    <li>• Preserve all digital evidence (screenshots, emails, SMS)</li>
                    <li>• Contact your bank's fraud helpline</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <button
                type="button"
                onClick={onBack}
                className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium border-2 border-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-orange-600 to-blue-600 text-white rounded-xl hover:from-orange-700 hover:to-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-medium"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Submit FIR</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FIRForm;