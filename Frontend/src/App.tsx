import React, { useState, useEffect } from 'react';
import { Shield, Home, FileText, MessageCircle, Search, User, LogOut, Settings } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';
import AdminLoginForm from './components/auth/AdminLoginForm';
import OfficerLoginForm from './components/auth/OfficerLoginForm';
import LandingPage from './components/LandingPage';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import OfficerDashboard from './components/OfficerDashboard';
import FIRForm from './components/FIRForm';
import StatusTracker from './components/StatusTracker';
import ChatBot from './components/ChatBot';
import NotificationPanel from './components/NotificationPanel';
import VirtualAssistant from './components/VirtualAssistant';
import ChatWindow from './components/chat/ChatWindow';
import FeedbackForm from './components/feedback/FeedbackForm';
import AdminChatPanel from './components/admin/AdminChatPanel';

// Types
export interface FIR {
  _id: string;
  id?: string;  // For backward compatibility
  firNumber: string;
  complainantName: string;
  phoneNumber: string;
  email: string;
  incidentType: string;
  location: string;
  dateTime: string;
  description: string;
  status: 'submitted' | 'under-review' | 'investigating' | 'resolved' | 'closed';
  evidenceFiles?: string[];
  assignedOfficer?: string;
  assignedOfficerId?: string;
  updates: {
    timestamp: string;
    status: string;
    message: string;
    officer: string | null;
  }[];
  createdAt: string;
  updatedAt: string;
  userId?: string;
}

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

// Mock data for initial state
const API_URL = import.meta.env.VITE_API_URL || 'https://fir-tracking-system.onrender.com/api';

type ViewType = 
  | 'landing'
  | 'login'
  | 'signup'
  | 'admin-login'
  | 'officer-login'
  | 'user'
  | 'admin'
  | 'officer'
  | 'file-fir'
  | 'status'
  | 'chat'
  | 'virtual-assistant'
  | 'chatbot'
  | 'track-status'
  | 'ai-assistant'
  | 'dashboard';

// Main App component that wraps everything
const AppContent: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('landing');
  const [showLoginOptions, setShowLoginOptions] = useState(false);
  const [firs, setFirs] = useState<FIR[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [selectedFIRForChat, setSelectedFIRForChat] = useState<FIR | null>(null);
  const [selectedFIRForFeedback, setSelectedFIRForFeedback] = useState<FIR | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Add a function to handle new messages
  const handleNewMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, newMessage]);

    // Create a notification for the new message
    if (message.senderType === 'officer' && user?.role !== 'officer') {
      const notification: Notification = {
        id: Date.now().toString(),
        userId: message.senderId,
        firId: message.firId,
        title: 'New Message',
        message: `New message from ${message.senderName} regarding FIR #${message.firId}`,
        type: 'message',
        isRead: false,
        timestamp: new Date()
      };
      setNotifications(prev => [...prev, notification]);
    }
  };

  // Watch for authentication state changes
  useEffect(() => {
    console.log('Auth state changed:', { isAuthenticated, user });
    if (isAuthenticated && user) {
      // Redirect based on user role
      switch (user.role) {
        case 'citizen':
          setCurrentView('user');
          break;
        case 'admin':
          setCurrentView('admin');
          break;
        case 'officer':
          setCurrentView('officer');
          break;
      }
      // Close login options if open
      setShowLoginOptions(false);
    } else {
      // If not authenticated, show landing page
      setCurrentView('landing');
    }
  }, [isAuthenticated, user]);

  // Fetch FIRs when authenticated
  useEffect(() => {
    const fetchFIRs = async () => {
      if (!isAuthenticated || !user) {
        console.log('Not fetching FIRs - user not authenticated', { isAuthenticated, user });
        return;
      }

      try {
        console.log('Fetching FIRs...');
        const token = localStorage.getItem('token');
        console.log('Using token:', token);

        const response = await fetch(`${API_URL}/firs`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('FIR response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`Failed to fetch FIRs: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        console.log('Raw FIRs data:', data);
        
        // Ensure all FIRs have the required fields
        const processedFirs = data.map((fir: any) => ({
          ...fir,
          _id: fir._id || fir.id, // Ensure _id is always set
          firNumber: fir.firNumber || fir._id?.toString() || fir.id?.toString() || 'Unknown',
          status: fir.status || 'submitted',
          updates: fir.updates || []
        }));
        
        console.log('Processed FIRs:', processedFirs);
        setFirs(processedFirs);
      } catch (error) {
        console.error('Error fetching FIRs:', error);
      }
    };

    fetchFIRs();
  }, [isAuthenticated, user]);

  // Fetch Officers when admin is authenticated
  useEffect(() => {
    const fetchOfficers = async () => {
      if (!isAuthenticated || user?.role !== 'admin') {
        console.log('Not fetching officers - not admin', { isAuthenticated, userRole: user?.role });
        return;
      }

      try {
        console.log('Fetching officers...');
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/police/officers`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch officers: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        console.log('Fetched officers:', data);
        setOfficers(data);
      } catch (error) {
        console.error('Error fetching officers:', error);
      }
    };

    fetchOfficers();
  }, [isAuthenticated, user?.role]);

  // Fetch notifications when authenticated
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!isAuthenticated || !user) {
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/notifications`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }

        const data = await response.json();
        setNotifications(data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
    // Fetch notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  // Function to mark notification as read
  const handleMarkNotificationAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/notifications/mark-read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notificationIds: [notificationId]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Handle login type selection
  const handleLogin = (type: 'citizen' | 'admin' | 'officer') => {
    switch (type) {
      case 'citizen':
        setCurrentView('login');
        break;
      case 'admin':
        setCurrentView('admin-login');
        break;
      case 'officer':
        setCurrentView('officer-login');
        break;
    }
    setShowLoginOptions(false);
  };

  // Handle showing login options
  const handleShowLoginOptions = () => {
    setShowLoginOptions(true);
  };

  // Handle login type selection
  const handleLoginTypeSelect = (type: 'citizen' | 'officer' | 'admin') => {
    setShowLoginOptions(false);
    switch(type) {
      case 'citizen':
        setCurrentView('login');
        break;
      case 'officer':
        setCurrentView('officer-login');
        break;
      case 'admin':
        setCurrentView('admin-login');
        break;
    }
  };

  // Handle view changes
  const handleNavigate = (view: ViewType) => {
    setCurrentView(view);
  };

  // Handle back navigation to dashboard
  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  // Handle file FIR action
  const handleFileFIR = () => {
    setCurrentView('file-fir');
  };

  // Handle FIR status updates
  const handleUpdateStatus = async (firId: string, status: FIR['status'], message: string, officer?: string) => {
    try {
      if (!firId) {
        throw new Error('Invalid FIR ID');
      }

      console.log('Updating FIR status:', { firId, status, message, officer });
      const response = await fetch(`${API_URL}/firs/${firId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status, 
          message,
          officer: officer || user?.name || 'Unknown Officer'
        })
      });

      if (!response.ok) {
        let errorMessage = 'Failed to update FIR status';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
        throw new Error(errorMessage);
      }

      const updatedFir = await response.json();
      setFirs(prev => prev.map(fir => fir._id === firId ? updatedFir : fir));

      // Create notification through API
      const notificationResponse = await fetch(`${API_URL}/notifications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: updatedFir.email,
          firId: firId,
          title: 'FIR Status Updated',
          message: `Your FIR status has been updated to ${status}`,
          type: 'fir_update'
        })
      });

      if (!notificationResponse.ok) {
        console.error('Failed to create notification');
      } else {
        const newNotification = await notificationResponse.json();
        setNotifications(prev => [...prev, newNotification]);
      }

      // Fetch updated FIR list instead of reloading
      const updatedFirsResponse = await fetch(`${API_URL}/firs`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (updatedFirsResponse.ok) {
        const updatedFirs = await updatedFirsResponse.json();
        setFirs(updatedFirs);
      }
    } catch (error) {
      console.error('Error updating FIR status:', error);
      throw error;
    }
  };

  // Handle officer assignment
  const handleAssignOfficer = async (firId: string, officerId: string) => {
    try {
      const assignedOfficer = officers.find(o => o._id === officerId);
      if (!assignedOfficer) {
        throw new Error('Officer not found');
      }

      const response = await fetch(`${API_URL}/firs/${firId}/assign`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          officerId,
          officerName: assignedOfficer.name
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to assign officer');
      }

      // Fetch updated FIR list
      const updatedFirsResponse = await fetch(`${API_URL}/firs`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (updatedFirsResponse.ok) {
        const updatedFirs = await updatedFirsResponse.json();
        setFirs(updatedFirs);
      }
      
    } catch (error) {
      console.error('Error assigning officer:', error);
      throw error;
    }
  };

  // Render navigation bar
  const renderNavigation = () => {
    if (!isAuthenticated || !user) return null;

    const unreadNotifications = notifications.filter(
      n => !n.isRead && n.userId === user.email
    ).length;

    return (
      <nav className="w-full" style={{ background: 'linear-gradient(90deg, rgb(255, 107, 53) 10%, rgb(255, 255, 255) 50%, rgb(76, 175, 80) 90%)', borderBottom: '4px solid rgb(255, 107, 53)', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-orange-600 to-sky-600 p-2 rounded-lg">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold text-gray-900">भारतीय पुलिस सेवा</span>
                  <div className="text-sm text-gray-600">Indian Police Service</div>
                </div>
              </div>
              
              {/* Navigation Links */}
              {user.role === 'citizen' && (
                <div className="flex space-x-6">
                  <button
                    onClick={() => setCurrentView('user')}
                    className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                      currentView === 'user' ? 'bg-white text-orange-600' : 'text-gray-800 hover:text-gray-600'
                    }`}
                  >
                    <Home size={20} />
                    <span>Dashboard</span>
                  </button>
                  <button
                    onClick={() => setCurrentView('file-fir')}
                    className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                      currentView === 'file-fir' ? 'bg-white text-orange-600' : 'text-gray-800 hover:text-gray-600'
                    }`}
                  >
                    <FileText size={20} />
                    <span>File FIR</span>
                  </button>
                  <button
                    onClick={() => setCurrentView('ai-assistant')}
                    className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                      currentView === 'ai-assistant' ? 'bg-white text-orange-600' : 'text-gray-800 hover:text-gray-600'
                    }`}
                  >
                    <MessageCircle size={20} />
                    <span>AI Assistant</span>
                  </button>
                  <button
                    onClick={() => setCurrentView('track-status')}
                    className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                      currentView === 'track-status' ? 'bg-white text-orange-600' : 'text-gray-800 hover:text-gray-600'
                    }`}
                  >
                    <Search size={20} />
                    <span>Track Status</span>
                  </button>
                </div>
              )}
            </div>

            {/* User Profile and Logout */}
            <div className="flex items-center space-x-4">
              <NotificationPanel
                notifications={notifications.filter(n => n.userId === user.email)}
                onMarkAsRead={async (notificationId: string) => {
                  try {
                    const token = localStorage.getItem('token');
                    const response = await fetch(`${API_URL}/notifications/mark-read`, {
                      method: 'PATCH',
                      headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({
                        notificationIds: [notificationId]
                      })
                    });

                    if (!response.ok) {
                      throw new Error('Failed to mark notification as read');
                    }

                    setNotifications(prev =>
                      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
                    );
                  } catch (error) {
                    console.error('Error marking notification as read:', error);
                  }
                }}
              />

              <div className="flex items-center gap-3">
                <div>
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-600">
                    {user.role === 'admin' ? 'Admin Portal' : user.role === 'officer' ? 'Officer Portal' : 'Citizen Portal'}
                  </p>
                </div>
                <div className="bg-white rounded-full p-1.5">
                  <User size={20} className="text-gray-800" />
                </div>
              </div>

              <button
                onClick={logout}
                className="flex items-center gap-2 bg-white text-red-500 px-4 py-1.5 rounded hover:bg-gray-50"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    );
  };

  // Render the main content based on current view
  const renderMainContent = () => {
    console.log('Rendering view:', currentView);

    if (!isAuthenticated) {
      switch (currentView) {
        case 'login':
          return <LoginForm 
                   onSwitchToSignup={() => handleNavigate('signup')}
                   onSwitchToAdmin={() => handleNavigate('admin-login')}
                   onBack={() => handleNavigate('landing')} />;
        case 'signup':
          return <SignupForm 
                   onSwitchToLogin={() => handleNavigate('login')}
                   onBack={() => handleNavigate('landing')} />;
        case 'admin-login':
          return <AdminLoginForm 
                   onBack={() => handleNavigate('landing')}
                   onSwitchToCitizen={() => handleNavigate('login')} />;
        case 'officer-login':
          return <OfficerLoginForm 
                   onBack={() => handleNavigate('landing')}
                   onSwitchToCitizen={() => handleNavigate('login')} />;
        default:
          return <LandingPage 
                   onLogin={handleLogin}
                   onShowLoginOptions={handleShowLoginOptions} />;
      }
    }

    // Authenticated user views
    switch (currentView) {
      case 'user':
        console.log('All FIRs:', firs);
        console.log('Current user:', user);
        // Use email instead of id for matching as that's what we store in FIR
        const userFirs = firs.filter(fir => fir.email === user?.email);
        console.log('Filtered FIRs for user:', userFirs);
        return (
          <UserDashboard
            firs={userFirs}
            onNavigate={handleNavigate}
            onChatWithOfficer={setSelectedFIRForChat}
            onProvideFeedback={setSelectedFIRForFeedback}
            notifications={notifications}
          />
        );

      case 'admin':
        return (
          <AdminDashboard
            firs={firs}
            officers={officers}
            onUpdateStatus={handleUpdateStatus}
            onAssignOfficer={handleAssignOfficer}
            chatMessages={chatMessages}
            onSendMessage={(message) => {
              setChatMessages(prev => [...prev, { ...message, id: Date.now().toString(), timestamp: new Date() }]);
            }}
          />
        );

      case 'officer':
        console.log('Rendering OfficerDashboard with firs:', firs);
        // Filter FIRs assigned to current officer
        const assignedFirs = firs.filter(fir => {
          const isAssigned = fir.assignedOfficer === user?.name;
          if (isAssigned) {
            console.log('FIR assigned to current officer:', fir);
          }
          return isAssigned;
        });
        console.log('Filtered FIRs:', assignedFirs);
        
        return (
          <OfficerDashboard
            firs={assignedFirs}
            onUpdateStatus={handleUpdateStatus}
            chatMessages={chatMessages}
            onSendMessage={handleNewMessage}
          />
        );

      case 'file-fir':
        return <FIRForm onBack={handleBackToDashboard} />;

      case 'track-status':
        return <StatusTracker firs={firs} onBack={handleBackToDashboard} />;

      case 'ai-assistant':
        return <ChatBot onBack={handleBackToDashboard} onFileFIR={handleFileFIR} />;

      default:
        return (
          <UserDashboard
            firs={firs.filter(fir => fir.email === user?.email)}
            onNavigate={handleNavigate}
            onChatWithOfficer={setSelectedFIRForChat}
            onProvideFeedback={setSelectedFIRForFeedback}
            notifications={notifications.filter(n => n.userId === user?.email)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderNavigation()}
      <div className={`${isAuthenticated ? 'pt-16' : ''}`}>
        {renderMainContent()}

        {/* Chat Window */}
        {selectedFIRForChat && (
          <ChatWindow
            fir={selectedFIRForChat}
            isOpen={true}
            onClose={() => setSelectedFIRForChat(null)}
            onSendMessage={(message) => {
              setChatMessages(prev => [...prev, { ...message, id: Date.now().toString(), timestamp: new Date() }]);
            }}
          />
        )}

        {/* Feedback Form Modal */}
        {selectedFIRForFeedback && selectedFIRForFeedback._id && (
          <FeedbackForm
            fir={selectedFIRForFeedback}
            isOpen={true}
            onClose={() => setSelectedFIRForFeedback(null)}
            onSubmit={(feedback) => {
              // Handle feedback submission
              console.log('Feedback submitted:', feedback);
              setSelectedFIRForFeedback(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

// Wrapper component that provides auth context
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;