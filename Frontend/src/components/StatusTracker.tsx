import React, { useState } from 'react';
import { ArrowLeft, Search, FileText, Clock, CheckCircle, AlertTriangle, User, Calendar, MapPin, Phone, Mail } from 'lucide-react';
import { FIR } from '../App';

interface StatusTrackerProps {
  firs: FIR[];
  onBack: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'https://fir-tracking-system.onrender.com/api';

const StatusTracker: React.FC<StatusTrackerProps> = ({ firs, onBack }) => {
  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState<FIR | null>(null);
  const [searchError, setSearchError] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchId.trim()) {
      setSearchError('Please enter a valid FIR ID');
      return;
    }

    setIsSearching(true);
    setSearchError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setSearchError('Please login to search FIRs');
        return;
      }

      const searchQuery = searchId.trim();
      console.log('Searching for FIR:', searchQuery);
      
      // Try searching by ID/FIR number
      const response = await fetch(`${API_URL}/firs/${searchQuery}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch FIR');
      }

      const fir = await response.json();
      console.log('FIR found:', fir);
      setSearchResult(fir);
      setSearchError('');
    } catch (error) {
      console.error('Error searching FIR:', error);
      setSearchResult(null);
      setSearchError(error instanceof Error ? error.message : 'Failed to fetch FIR. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusIcon = (status: FIR['status']) => {
    switch (status) {
      case 'submitted':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'under-review':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'investigating':
        return <Search className="h-5 w-5 text-orange-600" />;
      case 'resolved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'closed':
        return <CheckCircle className="h-5 w-5 text-gray-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: FIR['status']) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'under-review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'investigating':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Status progress tracker

  const getStatusProgress = (status: FIR['status']) => {
    switch (status) {
      case 'submitted':
        return 20;
      case 'under-review':
        return 40;
      case 'investigating':
        return 70;
      case 'resolved':
        return 100;
      case 'closed':
        return 100;
      default:
        return 0;
    }
  };

  const statusSteps = [
    { key: 'submitted', label: 'Submitted', description: 'FIR has been filed successfully' },
    { key: 'under-review', label: 'Under Review', description: 'Case is being reviewed by authorities' },
    { key: 'investigating', label: 'Investigating', description: 'Active investigation in progress' },
    { key: 'resolved', label: 'Resolved', description: 'Case has been resolved' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Track FIR Status</h1>
          <p className="text-gray-600 mt-2">Enter your FIR ID to check the current status and progress</p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Search by FIR ID</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Enter FIR ID (e.g., FIR2024001)"
                className={`w-full border rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  searchError ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {searchError && (
                <p className="text-red-600 text-sm mt-2">{searchError}</p>
              )}
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching || !searchId.trim()}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSearching ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span>Search</span>
                </>
              )}
            </button>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            <p>💡 <strong>Tip:</strong> Your FIR ID was provided when you submitted your FIR. Check your email or SMS for the ID.</p>
          </div>
        </div>

        {/* Sample FIR IDs for Demo */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Demo FIR IDs (for testing)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            {firs.map(fir => (
              <button
                key={fir._id}
                onClick={() => setSearchId(fir.firNumber || fir._id)}
                className="text-left p-2 bg-white rounded border hover:bg-blue-50 transition-colors"
              >
                <span className="font-medium text-blue-600">{fir.firNumber || fir._id}</span>
                <span className="text-gray-600 ml-2">- {fir.incidentType}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search Results */}
        {searchResult && (
          <div className="space-y-6">
            {/* FIR Overview */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    FIR #{searchResult.firNumber || searchResult._id}
                  </h2>
                  <p className="text-gray-600">{searchResult.incidentType}</p>
                </div>
                <div className="flex space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(searchResult.status)}`}>
                    {searchResult.status ? searchResult.status.replace('-', ' ').toUpperCase() : 'UNKNOWN'}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Case Progress</span>
                  <span className="text-sm text-gray-600">{getStatusProgress(searchResult.status)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getStatusProgress(searchResult.status)}%` }}
                  ></div>
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Complainant Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-900">{searchResult.complainantName}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-900">{searchResult.phoneNumber}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-900">{searchResult.email}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Incident Details</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-900">{new Date(searchResult.dateTime).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-900">{searchResult.location}</span>
                    </div>
                    {searchResult.assignedOfficer && (
                      <div className="flex items-center space-x-2 text-sm">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-900">Assigned to: {searchResult.assignedOfficer}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{searchResult.description}</p>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Status Timeline</h2>
              
              {/* Status Steps */}
              <div className="mb-8">
                <div className="flex justify-between items-center">
                  {statusSteps.map((step, index) => {
                    const isCompleted = statusSteps.findIndex(s => s.key === searchResult.status) >= index;
                    const isCurrent = step.key === searchResult.status;
                    
                    return (
                      <div key={step.key} className="flex flex-col items-center text-center flex-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                          isCompleted 
                            ? 'bg-blue-600 border-blue-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-400'
                        } ${isCurrent ? 'ring-4 ring-blue-100' : ''}`}>
                          {isCompleted ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <span className="text-xs font-medium">{index + 1}</span>
                          )}
                        </div>
                        <div className="mt-2">
                          <p className={`text-xs font-medium ${isCompleted ? 'text-blue-600' : 'text-gray-500'}`}>
                            {step.label}
                          </p>
                          <p className="text-xs text-gray-400 mt-1 max-w-20">
                            {step.description}
                          </p>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Detailed Updates */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Detailed Updates</h3>
                {searchResult.updates.map((update, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 mt-1">
                      {getStatusIcon(update.status as FIR['status'])}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-semibold text-gray-900">
                          {update.status.replace('-', ' ').toUpperCase()}
                        </span>
                        {update.officer && (
                          <span className="text-xs text-gray-500">by {update.officer}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{update.message}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(update.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Need Help?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">Contact Investigating Officer</h3>
                  <p className="text-sm text-blue-800 mb-3">
                    {searchResult.assignedOfficer 
                      ? `Reach out to ${searchResult.assignedOfficer} for case updates`
                      : 'An officer will be assigned soon'
                    }
                  </p>
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Contact Officer →
                  </button>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-green-900 mb-2">Download FIR Copy</h3>
                  <p className="text-sm text-green-800 mb-3">
                    Get an official copy of your FIR for your records
                  </p>
                  <button className="text-sm text-green-600 hover:text-green-700 font-medium">
                    Download PDF →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No Results State */}
        {!searchResult && searchId && !isSearching && searchError && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">FIR Not Found</h3>
            <p className="text-gray-600 mb-6">
              We couldn't find an FIR with the ID "{searchId}". Please check the ID and try again.
            </p>
            <div className="text-sm text-gray-500">
              <p className="mb-2">Make sure you're using the correct FIR ID format:</p>
              <p className="font-mono bg-gray-100 px-2 py-1 rounded">FIR2024XXX</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusTracker;