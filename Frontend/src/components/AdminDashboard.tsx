import React, { useState } from 'react';
import { FIR } from '../App';
import { Search, Filter, Eye, Edit, User, Calendar, MapPin, Phone, Mail, AlertTriangle, Clock, CheckCircle, FileText, Download, MessageSquare, Users, UserPlus, LogOut } from 'lucide-react';
import AdminChatPanel from './admin/AdminChatPanel';
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

interface Officer {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  profile: {
    designation: string;
    badgeNumber: string;
    jurisdiction: string;
    department: string;
    joiningDate: string;
  };
}

interface AdminDashboardProps {
  firs: FIR[];
  officers: Officer[];
  onUpdateStatus: (id: string, status: FIR['status'], message: string, officer?: string) => void;
  onAssignOfficer: (firId: string, officerId: string) => void;
  chatMessages: ChatMessage[];
  onSendMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  firs, 
  officers, 
  onUpdateStatus, 
  onAssignOfficer, 
  chatMessages, 
  onSendMessage 
}) => {
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedFIR, setSelectedFIR] = useState<FIR | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);  // Add this line
  const [updateStatus, setUpdateStatus] = useState<FIR['status']>('submitted');
  const [updateMessage, setUpdateMessage] = useState('');
  const [selectedOfficer, setSelectedOfficer] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat'>('dashboard');

  const filteredFIRs = firs.filter(fir => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (fir._id?.toString() || '').toLowerCase().includes(searchLower) ||
      (fir.firNumber || '').toLowerCase().includes(searchLower) ||
      (fir.complainantName || '').toLowerCase().includes(searchLower) ||
      (fir.incidentType || '').toLowerCase().includes(searchLower);
    const matchesStatus = statusFilter === 'all' || fir.status === statusFilter;
    
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
    if (!selectedFIR) {
      alert('Error: No FIR selected');
      return;
    }
    if (!updateMessage.trim()) {
      alert('Please enter an update message');
      return;
    }

    setIsUpdating(true);
    try {
      const firId = selectedFIR._id || selectedFIR.id;
      if (!firId) {
        throw new Error('Invalid FIR ID');
      }
      await onUpdateStatus(firId, updateStatus, updateMessage, 'Admin');
      setShowUpdateModal(false);
      setSelectedFIR(null);
      setUpdateMessage('');
    } catch (error) {
      console.error('Error updating FIR status:', error);
      alert('Failed to update FIR status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAssignOfficer = () => {
    if (selectedFIR && selectedOfficer) {
      onAssignOfficer(selectedFIR.id, selectedOfficer);
      setShowAssignModal(false);
      setSelectedFIR(null);
      setSelectedOfficer('');
    }
  };

  const handleLogout = () => {
    logout();
    // Navigate to landing page happens automatically due to auth state change
  };

  const stats = {
    total: firs.length,
    submitted: firs.filter(f => f.status === 'submitted').length,
    investigating: firs.filter(f => f.status === 'investigating').length,
    resolved: firs.filter(f => f.status === 'resolved').length,
    unassigned: firs.filter(f => !f.assignedOfficer).length
  };

  const unreadMessages = chatMessages.filter(msg => !msg.isRead && msg.senderType === 'citizen').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with logout */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                Admin Dashboard
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
                onClick={() => setActiveTab('dashboard')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'dashboard'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>FIR Management</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`py-2 px-1 border-b-2 font-medium text-sm relative ${
                  activeTab === 'chat'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Chat Management</span>
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

        {activeTab === 'dashboard' ? (
          <>
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-blue-200">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    <p className="text-gray-600 text-sm">Total FIRs</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-yellow-200">
                <div className="flex items-center">
                  <div className="bg-yellow-100 p-2 rounded-lg">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{stats.submitted}</p>
                    <p className="text-gray-600 text-sm">New Submissions</p>
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

              <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-red-200">
                <div className="flex items-center">
                  <div className="bg-red-100 p-2 rounded-lg">
                    <UserPlus className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{stats.unassigned}</p>
                    <p className="text-gray-600 text-sm">Unassigned</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-2xl shadow-lg mb-8 border-2 border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search FIRs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="submitted">Submitted</option>
                    <option value="under-review">Under Review</option>
                    <option value="investigating">Investigating</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assignment</label>
                  <select
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="all">All Cases</option>
                    <option value="assigned">Assigned</option>
                    <option value="unassigned">Unassigned</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 py-2 rounded-xl hover:from-red-700 hover:to-orange-700 transition-colors flex items-center space-x-2">
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </button>
                </div>
              </div>
            </div>

            {/* FIR List */}
            <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-orange-50">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">FIR Management</h2>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FIR Details</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Complainant</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Officer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredFIRs.map((fir) => (
                      <tr key={fir.id} className="hover:bg-gray-50">
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
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(fir.status || 'submitted')}`}>
                            {getStatusIcon(fir.status || 'submitted')}
                            <span className="ml-1">{(fir.status || 'submitted').replace('-', ' ').toUpperCase()}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {fir.assignedOfficer ? (
                            <span className="text-green-600 font-medium">{fir.assignedOfficer}</span>
                          ) : (
                            <span className="text-red-600 font-medium">Unassigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => {
                              setSelectedFIR(fir);
                              setShowViewModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedFIR(fir);
                              setShowUpdateModal(true);
                              setUpdateStatus(fir.status);
                            }}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                            title="Update Status"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          {!fir.assignedOfficer && (
                            <button
                              onClick={() => {
                                setSelectedFIR(fir);
                                setShowAssignModal(true);
                              }}
                              className="text-orange-600 hover:text-orange-900 p-1 rounded hover:bg-orange-50"
                              title="Assign Officer"
                            >
                              <UserPlus className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <AdminChatPanel messages={chatMessages} onSendMessage={onSendMessage} />
        )}

        {/* Assign Officer Modal */}
        {showAssignModal && selectedFIR && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Assign Officer to FIR #{selectedFIR.firNumber}</h3>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Officer</label>
                  <select
                    value={selectedOfficer}
                    onChange={(e) => setSelectedOfficer(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Choose an officer</option>
                    {officers.map(officer => (
                      <option key={officer._id} value={officer._id}>
                        {officer.name} - {officer.profile.designation} ({officer.profile.jurisdiction})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">Available Officers</h4>
                  <div className="space-y-2">
                    {officers.map(officer => (
                      <div key={officer._id} className="text-sm text-blue-800">
                        <span className="font-medium">{officer.name}</span> - {officer.profile.designation} ({officer.profile.jurisdiction})
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignOfficer}
                  disabled={!selectedOfficer}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl hover:from-red-700 hover:to-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Assign Officer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Update Status Modal */}
        {showUpdateModal && selectedFIR && (
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
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
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
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateStatus}
                  disabled={!updateMessage.trim() || isUpdating}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl hover:from-red-700 hover:to-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isUpdating ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Updating...</span>
                    </>
                  ) : "Update Status"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View FIR Details Modal */}
        {showViewModal && selectedFIR && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-900">FIR Details #{selectedFIR.firNumber}</h3>
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
                {/* Complainant Information */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Complainant Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Name</p>
                      <p className="font-medium text-gray-900">{selectedFIR.complainantName}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                      <p className="font-medium text-gray-900">{selectedFIR.phoneNumber}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg col-span-2">
                      <p className="text-sm text-gray-600 mb-1">Email</p>
                      <p className="font-medium text-gray-900">{selectedFIR.email}</p>
                    </div>
                  </div>
                </div>

                {/* Incident Information */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Incident Information</h4>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Type</p>
                      <p className="font-medium text-gray-900">{selectedFIR.incidentType}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Location</p>
                      <p className="font-medium text-gray-900">{selectedFIR.location}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Date & Time</p>
                      <p className="font-medium text-gray-900">{new Date(selectedFIR.dateTime).toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Description</p>
                      <p className="font-medium text-gray-900">{selectedFIR.description}</p>
                    </div>
                  </div>
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

              <div className="p-6 border-t border-gray-200 flex justify-end">
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

export default AdminDashboard;