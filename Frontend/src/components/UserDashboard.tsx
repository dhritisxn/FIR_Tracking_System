import React, { useState } from 'react';
import { FileText, MessageCircle, Search, Plus, Clock, CheckCircle, AlertTriangle, User, Calendar, MapPin, TrendingUp, Award, Bell, Download, Star, Phone, Camera, Zap } from 'lucide-react';
import { FIR } from '../App';

interface Notification {
  id: string;
  userId: string;
  firId?: string;
  title: string;
  message: string;
  type: 'fir_update' | 'assignment' | 'message' | 'system';
  isRead: boolean;
  timestamp: Date;
}

interface UserDashboardProps {
  firs: FIR[];
  onNavigate: (view: ViewType) => void;
  onChatWithOfficer: (fir: FIR) => void;
  onProvideFeedback: (fir: FIR) => void;
  notifications: Notification[];
}

const UserDashboard: React.FC<UserDashboardProps> = ({ 
  firs, 
  onNavigate, 
  onChatWithOfficer, 
  onProvideFeedback, 
  notifications 
}) => {
  const [selectedFIR, setSelectedFIR] = useState<FIR | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  
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
        return <Clock className="h-5 w-5 text-gray-600" />;
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

  const getProgressPercentage = (status: FIR['status']) => {
    switch (status) {
      case 'submitted':
        return 25;
      case 'under-review':
        return 50;
      case 'investigating':
        return 75;
      case 'resolved':
      case 'closed':
        return 100;
      default:
        return 0;
    }
  };

  // Calculate statistics
  const stats = {
    total: firs.length,
    inProgress: firs.filter(fir => ['submitted', 'under-review', 'investigating'].includes(fir.status)).length,
    resolved: firs.filter(fir => fir.status === 'resolved').length,
    unreadNotifications: notifications.filter(n => !n.isRead).length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
                नागरिक डैशबोर्ड
              </h1>
              <p className="text-gray-600 mt-2 text-lg">Citizen Dashboard - Manage your FIRs seamlessly</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 px-3 py-1 rounded-full border border-green-200">
                <span className="text-sm font-medium text-green-800">🇮🇳 सुरक्षित सेवा</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => onNavigate('file-fir')}
            className="group bg-gradient-to-r from-orange-600 to-red-600 text-white p-8 rounded-2xl shadow-xl hover:from-orange-700 hover:to-red-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border-2 border-orange-300"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-orange-500 p-3 rounded-xl group-hover:scale-110 transition-transform">
                <Plus className="h-8 w-8" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold">नई FIR दर्ज करें</h3>
                <p className="text-orange-100 text-sm mt-1">File New FIR with AI guidance</p>
                <div className="flex items-center mt-2 text-orange-200">
                  <span className="text-xs">Guided process</span>
                  <div className="w-1 h-1 bg-orange-300 rounded-full mx-2"></div>
                  <span className="text-xs">Evidence upload</span>
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('ai-assistant')}
            className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 rounded-2xl shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border-2 border-blue-300"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-blue-500 p-3 rounded-xl group-hover:scale-110 transition-transform">
                <MessageCircle className="h-8 w-8" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold">AI सहायक</h3>
                <p className="text-blue-100 text-sm mt-1">24/7 intelligent help & guidance</p>
                <div className="flex items-center mt-2 text-blue-200">
                  <span className="text-xs">Smart responses</span>
                  <div className="w-1 h-1 bg-blue-300 rounded-full mx-2"></div>
                  <span className="text-xs">Emergency protocols</span>
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('track-status')}
            className="group bg-gradient-to-r from-green-600 to-teal-600 text-white p-8 rounded-2xl shadow-xl hover:from-green-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border-2 border-green-300"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-green-500 p-3 rounded-xl group-hover:scale-110 transition-transform">
                <Search className="h-8 w-8" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold">स्थिति ट्रैक करें</h3>
                <p className="text-green-100 text-sm mt-1">Real-time FIR progress tracking</p>
                <div className="flex items-center mt-2 text-green-200">
                  <span className="text-xs">Live updates</span>
                  <div className="w-1 h-1 bg-green-300 rounded-full mx-2"></div>
                  <span className="text-xs">Officer contact</span>
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-orange-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-gray-600 text-sm font-medium">कुल FIRs</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-xl border border-orange-200">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">All time</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-yellow-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">{stats.inProgress}</p>
                <p className="text-gray-600 text-sm font-medium">प्रगति में</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-xl border border-yellow-200">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></div>
              <span className="text-sm text-yellow-600">Active cases</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-green-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">{stats.resolved}</p>
                <p className="text-gray-600 text-sm font-medium">हल हो गया</p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl border border-green-200">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <Award className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">Successfully closed</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-blue-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">{stats.unreadNotifications}</p>
                <p className="text-gray-600 text-sm font-medium">नई सूचनाएं</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl border border-blue-200">
                <Bell className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-sm text-blue-600">Unread updates</span>
            </div>
          </div>
        </div>

        {/* Enhanced Recent FIRs */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-blue-50">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">आपकी हाल की FIRs</h2>
              {firs.length > 0 && (
                <button className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 transition-colors">
                  <Download className="h-4 w-4" />
                  <span className="text-sm font-medium">Export Report</span>
                </button>
              )}
            </div>
          </div>
          
          {firs.length === 0 ? (
            <div className="p-12 text-center">
              <div className="bg-gradient-to-r from-orange-100 to-blue-100 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center border-2 border-orange-200">
                <FileText className="h-10 w-10 text-orange-600" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">अभी तक कोई FIR दर्ज नहीं</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Get started by filing your first FIR. Our AI assistant will guide you through the entire process step by step with evidence upload support.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => onNavigate('file-fir')}
                  className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-xl hover:from-orange-700 hover:to-red-700 transition-colors font-medium border-2 border-orange-300 flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>पहली FIR दर्ज करें</span>
                </button>
                <button
                  onClick={() => onNavigate('chatbot')}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-colors font-medium border-2 border-blue-300 flex items-center space-x-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>AI सहायक से बात करें</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {firs.map((fir) => (
                <div key={fir.id} className="p-6 hover:bg-gradient-to-r hover:from-orange-50 hover:to-blue-50 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-lg font-bold text-gray-900">FIR #{fir.firNumber}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border-2 ${getStatusColor(fir.status)}`}>
                          {fir.status.replace('-', ' ').toUpperCase()}
                        </span>
                        {fir.evidenceFiles && fir.evidenceFiles.length > 0 && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium flex items-center space-x-1">
                            <Camera className="h-3 w-3" />
                            <span>{fir.evidenceFiles.length} files</span>
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">{fir.incidentType}</h3>
                      
                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Case Progress</span>
                          <span className="text-sm text-gray-600">{getProgressPercentage(fir.status)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 border border-gray-300">
                          <div
                            className="bg-gradient-to-r from-orange-500 to-blue-500 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${getProgressPercentage(fir.status)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">
                            {new Date(fir.dateTime).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm">{fir.location}</span>
                        </div>
                        {fir.assignedOfficer && (
                          <div className="flex items-center space-x-2 text-gray-600">
                            <User className="h-4 w-4" />
                            <span className="text-sm">{fir.assignedOfficer}</span>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{fir.description}</p>
                      
                      {fir.updates.length > 0 && (
                        <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl border-2 border-gray-200">
                          <div className="flex items-center space-x-2 mb-2">
                            {getStatusIcon(fir.status)}
                            <span className="text-sm font-semibold text-gray-900">Latest Update</span>
                            <span className="text-xs text-gray-500">
                              {new Date(fir.updates[fir.updates.length - 1].timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{fir.updates[fir.updates.length - 1].message}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-6 flex flex-col space-y-2">
                      <button
                        onClick={() => {
                          setSelectedFIR(fir);
                          setShowViewModal(true);
                        }}
                        className="bg-gradient-to-r from-orange-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-orange-700 hover:to-blue-700 transition-colors text-sm font-medium border border-orange-300"
                      >
                        View Details
                      </button>
                      
                      {fir.assignedOfficer && (
                        <button
                          onClick={() => onChatWithOfficer(fir)}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors text-sm font-medium border border-blue-300 flex items-center space-x-1"
                        >
                          <MessageCircle className="h-3 w-3" />
                          <span>Chat</span>
                        </button>
                      )}
                      
                      {fir.status === 'resolved' && (
                        <button
                          onClick={() => onProvideFeedback(fir)}
                          className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-teal-700 transition-colors text-sm font-medium border border-green-300 flex items-center space-x-1"
                        >
                          <Star className="h-3 w-3" />
                          <span>Feedback</span>
                        </button>
                      )}
                      
                      <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium border border-gray-300">
                        Download Copy
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Enhanced Quick Help Section */}
        {firs.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-orange-50 to-green-50 rounded-2xl p-6 border-2 border-orange-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">सहायता चाहिए?</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button
                onClick={() => onNavigate('chatbot')}
                className="text-left p-4 bg-white rounded-xl hover:bg-gray-50 transition-colors border-2 border-blue-200"
              >
                <MessageCircle className="h-6 w-6 text-blue-600 mb-2" />
                <div className="font-medium text-gray-900">AI से चैट करें</div>
                <div className="text-sm text-gray-600">Get instant help and guidance</div>
              </button>
              
              <button className="text-left p-4 bg-white rounded-xl hover:bg-gray-50 transition-colors border-2 border-green-200">
                <Phone className="h-6 w-6 text-green-600 mb-2" />
                <div className="font-medium text-gray-900">अधिकारी से संपर्क</div>
                <div className="text-sm text-gray-600">Speak with investigating officer</div>
              </button>
              
              <button className="text-left p-4 bg-white rounded-xl hover:bg-gray-50 transition-colors border-2 border-purple-200">
                <Download className="h-6 w-6 text-purple-600 mb-2" />
                <div className="font-medium text-gray-900">दस्तावेज़ प्राप्त करें</div>
                <div className="text-sm text-gray-600">Download FIR copies and reports</div>
              </button>

              <button
                onClick={() => onNavigate('file-fir')}
                className="text-left p-4 bg-white rounded-xl hover:bg-gray-50 transition-colors border-2 border-orange-200"
              >
                <Zap className="h-6 w-6 text-orange-600 mb-2" />
                <div className="font-medium text-gray-900">नई FIR दर्ज करें</div>
                <div className="text-sm text-gray-600">File another FIR with evidence</div>
              </button>
            </div>
          </div>
        )}

        {/* View FIR Details Modal */}
        {showViewModal && selectedFIR && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-900">FIR Details #{selectedFIR._id}</h3>
                  <button
                    onClick={() => {
                      setSelectedFIR(null);
                      setShowViewModal(false);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <span className="text-2xl">&times;</span>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Status and Progress */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-xl border-2 border-blue-200">
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedFIR.status)}`}>
                      {selectedFIR.status.replace('-', ' ').toUpperCase()}
                    </span>
                    {selectedFIR.assignedOfficer && (
                      <span className="text-sm text-gray-600">
                        Assigned to: <span className="font-medium text-gray-900">{selectedFIR.assignedOfficer}</span>
                      </span>
                    )}
                  </div>

                  <div className="mb-2">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Case Progress</span>
                      <span className="text-sm text-gray-600">{getProgressPercentage(selectedFIR.status)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 border border-gray-300">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-blue-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${getProgressPercentage(selectedFIR.status)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Incident Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Incident Type</p>
                      <p className="font-medium text-gray-900">{selectedFIR.incidentType}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Date & Time</p>
                      <p className="font-medium text-gray-900">{new Date(selectedFIR.dateTime).toLocaleString()}</p>
                    </div>
                  </div>
                  <div>
                    <div className="p-4 bg-gray-50 rounded-lg h-full">
                      <p className="text-sm text-gray-600 mb-1">Location</p>
                      <p className="font-medium text-gray-900">{selectedFIR.location}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Description</p>
                  <p className="text-gray-900">{selectedFIR.description}</p>
                </div>

                {/* Status Updates */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Status History</h4>
                  <div className="space-y-4">
                    {selectedFIR.updates.map((update, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(update.status as FIR['status'])}`}>
                            {update.status.toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(update.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-900">{update.message}</p>
                        {update.officer && (
                          <p className="text-sm text-gray-600 mt-1">Updated by: {update.officer}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Evidence Files */}
                {selectedFIR.evidenceFiles && selectedFIR.evidenceFiles.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Evidence Files</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedFIR.evidenceFiles.map((file, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-gray-400" />
                          <span className="text-sm text-gray-900">{file}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
                {selectedFIR.assignedOfficer && (
                  <button
                    onClick={() => {
                      onChatWithOfficer(selectedFIR);
                      setShowViewModal(false);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-colors flex items-center space-x-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Chat with Officer</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelectedFIR(null);
                    setShowViewModal(false);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;