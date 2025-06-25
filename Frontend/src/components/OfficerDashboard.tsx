import React, { useState } from 'react';
import { FIR } from '../App';
import { Search, Filter, Eye, Edit, User, Calendar, MapPin, Phone, Mail, AlertTriangle, Clock, CheckCircle, FileText, MessageSquare, Badge, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ChatMessage {
  id: string;
  firId: string;
  senderId: string;
  senderName: string;
  senderType: 'citizen' | 'officer' | 'admin';
  message: string;
  timestamp: Date;
  isRead: boolean;
}

interface OfficerDashboardProps {
  firs: FIR[];
  onUpdateStatus: (id: string, status: FIR['status'], message: string, officer?: string) => Promise<void>;
  chatMessages: ChatMessage[];
  onSendMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
}

const OfficerDashboard: React.FC<OfficerDashboardProps> = ({ 
  firs, 
  onUpdateStatus, 
  chatMessages, 
  onSendMessage
}) => {
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewFIR, setViewFIR] = useState<FIR | null>(null);
  const [editFIR, setEditFIR] = useState<FIR | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<FIR['status']>('submitted');
  const [updateMessage, setUpdateMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'cases' | 'chat'>('cases');

  const filteredFIRs = firs.filter(fir => {
    const searchLower = searchTerm?.toLowerCase() || '';
    const matchesSearch = 
      String(fir?._id || '').toLowerCase().includes(searchLower) ||
      String(fir?.complainantName || '').toLowerCase().includes(searchLower) ||
      String(fir?.incidentType || '').toLowerCase().includes(searchLower);
    const matchesStatus = statusFilter === 'all' || fir?.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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
        return 'bg-blue-100 text-blue-800';
      case 'under-review':
        return 'bg-yellow-100 text-yellow-800';
      case 'investigating':
        return 'bg-orange-100 text-orange-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateStatus = async () => {
    if (!editFIR) {
      alert('Error: No FIR selected');
      return;
    }
    if (!updateMessage.trim()) {
      alert('Please enter an update message');
      return;
    }

    setIsUpdating(true);
    try {
      const firId = editFIR._id || editFIR.id;
      if (!firId) {
        throw new Error('Invalid FIR ID');
      }

      console.log('Updating FIR:', {
        id: firId,
        status: updateStatus,
        message: updateMessage,
        officer: user?.name
      });

      // Wait for the update to complete
      await onUpdateStatus(firId, updateStatus, updateMessage, user?.name);
      
      // Only clear state after successful update
      setShowUpdateModal(false);
      setEditFIR(null);
      setUpdateMessage('');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update FIR status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = () => {
    logout();
    // Navigation will happen automatically due to auth state change
  };

  const unreadMessages = chatMessages.filter(msg => 
    !msg.isRead && 
    msg.senderType === 'citizen' && 
    firs.some(fir => fir._id === msg.firId)
  ).length;

  const stats = {
    total: firs.length,
    investigating: firs.filter(f => f.status === 'investigating').length,
    resolved: firs.filter(f => f.status === 'resolved').length,
    pending: firs.filter(f => ['submitted', 'under-review'].includes(f.status)).length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with logout */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Officer Dashboard
              </h1>
              <p className="text-gray-600 mt-2 text-lg">Welcome, {user?.name}</p>
            </div>
            {/* <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-800 rounded-full border border-red-200 hover:bg-red-200 transition-colors"
            > */}
              {/* <LogOut className="h-4 w-4" /> */}
              {/* <span className="text-sm font-medium">Logout</span> */}
            {/* </button> */}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('cases')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'cases'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>My Cases</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`py-2 px-1 border-b-2 font-medium text-sm relative ${
                  activeTab === 'chat'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Messages</span>
                  {unreadMessages > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {unreadMessages}
                    </span>
                  )}
                </div>
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'cases' ? (
          <>
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-blue-200">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    <p className="text-gray-600 text-sm">Total Cases</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-orange-200">
                <div className="flex items-center">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <Search className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{stats.investigating}</p>
                    <p className="text-gray-600 text-sm">Investigating</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-green-200">
                <div className="flex items-center">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{stats.resolved}</p>
                    <p className="text-gray-600 text-sm">Resolved</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-yellow-200">
                <div className="flex items-center">
                  <div className="bg-yellow-100 p-2 rounded-lg">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                    <p className="text-gray-600 text-sm">Pending</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-2xl shadow-lg mb-8 border-2 border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search cases..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="submitted">Submitted</option>
                    <option value="under-review">Under Review</option>
                    <option value="investigating">Investigating</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-2 rounded-xl hover:from-green-700 hover:to-blue-700 transition-colors flex items-center space-x-2">
                    <Filter className="h-4 w-4" />
                    <span>Apply Filters</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Cases List */}
            <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
                <h2 className="text-2xl font-bold text-gray-900">Assigned Cases</h2>
              </div>
              
              {filteredFIRs.length === 0 ? (
                <div className="p-12 text-center">
                  <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No Cases Assigned</h3>
                  <p className="text-gray-600">You don't have any cases assigned yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FIR Details</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Complainant</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Update</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredFIRs.map((fir) => (
                        <tr key={fir._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">#{fir.firNumber}</div>
                              <div className="text-sm text-gray-600">{fir.incidentType}</div>
                              <div className="text-xs text-gray-500">{new Date(fir.dateTime).toLocaleDateString()}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{fir.complainantName}</div>
                              <div className="text-sm text-gray-600">{fir.phoneNumber}</div>
                              <div className="text-sm text-gray-600">{fir.location}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(fir.status)}`}>
                              {getStatusIcon(fir.status)}
                              <span className="ml-1">{fir.status.replace('-', ' ').toUpperCase()}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(fir.updatedAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => setViewFIR(fir)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                console.log('Opening update modal for FIR:', fir);
                                const firId = fir._id || fir.id;
                                if (!fir || !firId) {
                                  console.error('Invalid FIR data:', fir);
                                  return;
                                }
                                // Convert id to _id format if needed
                                const processedFir = {
                                  ...fir,
                                  _id: firId
                                };
                                setEditFIR(processedFir);
                                setUpdateStatus(fir.status || 'submitted');
                                setShowUpdateModal(true);
                              }}
                              className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                              title="Update Status"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Messages from Citizens</h2>
            <div className="space-y-6">
              {chatMessages
                .filter(msg => firs.some(fir => fir._id === msg.firId))
                .map((message) => (
                  <div
                    key={message.id}
                    className={`bg-gray-50 p-4 rounded-xl border-2 ${
                      message.senderType === 'citizen' ? 'border-blue-200' : 'border-green-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-gray-900">{message.senderName}</span>
                          <span className="text-sm text-gray-500">FIR #{message.firId}</span>
                          <span className="text-xs text-gray-400">
                            {new Date(message.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{message.message}</p>
                      </div>
                      {!message.isRead && message.senderType === 'citizen' && (
                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                          New
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex justify-end">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            onSendMessage({
                              firId: message.firId,
                              senderId: user?.id || '',
                              senderName: user?.name || 'Officer',
                              senderType: 'officer',
                              message: 'We are reviewing your message and will respond shortly.',
                              isRead: false
                            });
                          }}
                          className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors flex items-center space-x-1"
                        >
                          <MessageSquare className="h-4 w-4" />
                          <span>Reply</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

              {!chatMessages.some(msg => firs.some(fir => fir._id === msg.firId)) && (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">No messages yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* FIR Details Modal */}
        {/* View FIR Details Modal */}
        {viewFIR && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-screen overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">FIR #{viewFIR.firNumber} Details</h3>
                  <button
                    onClick={() => setViewFIR(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="text-2xl">&times;</span>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Complainant Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-900">{viewFIR.complainantName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-900">{viewFIR.phoneNumber}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-900">{viewFIR.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-900">{viewFIR.location}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Incident Information</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-xs text-gray-500">Type:</span>
                        <p className="text-sm text-gray-900">{viewFIR.incidentType}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Date & Time:</span>
                        <p className="text-sm text-gray-900">{new Date(viewFIR.dateTime).toLocaleString()}</p>
                      </div>
                      <div className="flex space-x-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(viewFIR.status)}`}>
                          {viewFIR.status.replace('-', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">{viewFIR.description}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Status Updates</h4>
                  <div className="space-y-4">
                    {viewFIR.updates.map((update, index) => (
                      <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                        {getStatusIcon(update.status as FIR['status'])}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium text-gray-900">
                              {update.status.replace('-', ' ').toUpperCase()}
                            </span>
                            {update.officer && (
                              <span className="text-xs text-gray-500">by {update.officer}</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-700">{update.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(update.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Update Status Modal */}
        {showUpdateModal && editFIR && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Update FIR Status</h3>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={updateStatus}
                    onChange={(e) => setUpdateStatus(e.target.value as FIR['status'])}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="submitted">Submitted</option>
                    <option value="under-review">Under Review</option>
                    <option value="investigating">Investigating</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Update Message</label>
                  <textarea
                    value={updateMessage}
                    onChange={(e) => setUpdateMessage(e.target.value)}
                    placeholder="Enter status update message..."
                    rows={4}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                <button                    onClick={() => {
                    setShowUpdateModal(false);
                    setEditFIR(null);
                    setUpdateMessage('');
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateStatus}
                  disabled={!updateMessage.trim() || isUpdating}
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isUpdating ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Updating...</span>
                    </>
                  ) : (
                    "Update Status"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfficerDashboard;