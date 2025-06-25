import React, { useState } from 'react';
import { Menu } from '@headlessui/react';
import { Home, FileText, MessageCircle, Search, Bell, LogOut, User, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import defaultAvatar from '../assets/default-avatar.png';

interface NavbarProps {
  onNavigate: (view: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    onNavigate(view);
  };

  if (!isAuthenticated || !user) return null;

  return (    <nav className="fixed w-full top-0 z-50" 
         style={{ 
           background: 'linear-gradient(90deg, rgb(239, 86, 47) 10%, rgb(255, 255, 255) 50%, rgb(56, 142, 60) 90%)',
           borderBottom: '4px solid rgb(239, 86, 47)',
           boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
         }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-orange-600 to-sky-600 p-2 rounded-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">भारतीय पुलिस सेवा</span>
              <div className="text-sm text-gray-700">Indian Police Service</div>
            </div>
          </div>

        {/* Center - Navigation Links */}
        {user.role === 'citizen' && (
          <div className="flex items-center gap-6">            <button 
              onClick={() => handleNavigate('dashboard')}
              className={`flex items-center gap-2 text-gray-800 px-3 py-2 rounded-md transition-colors ${
                currentView === 'dashboard' ? 'bg-white text-gray-900 shadow-sm' : 'hover:text-gray-600'
              }`}
            >
              <Home size={20} />
              <span>Dashboard</span>
            </button>
            
            <button 
              onClick={() => handleNavigate('file-fir')}
              className={`flex items-center gap-2 text-gray-800 px-3 py-2 rounded-md transition-colors ${
                currentView === 'file-fir' ? 'bg-white text-gray-900 shadow-sm' : 'hover:text-gray-600'
              }`}
            >
              <FileText size={20} />
              <span>File FIR</span>
            </button>
            
            <button 
              onClick={() => handleNavigate('ai-assistant')}
              className={`flex items-center gap-2 text-gray-800 px-3 py-2 rounded-md transition-colors ${
                currentView === 'ai-assistant' ? 'bg-white text-gray-900 shadow-sm' : 'hover:text-gray-600'
              }`}
            >
              <MessageCircle size={20} />
              <span>AI Assistant</span>
            </button>
            
            <button 
              onClick={() => handleNavigate('track-status')}
              className={`flex items-center gap-2 text-gray-800 px-3 py-2 rounded-md transition-colors ${
                currentView === 'track-status' ? 'bg-white text-gray-900 shadow-sm' : 'hover:text-gray-600'
              }`}
            >
              <Search size={20} />
              <span>Track Status</span>
            </button>
          </div>
        )}

        {/* Right side - User Info and Actions */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative"
          >
            <Bell size={20} className="text-white hover:opacity-80" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-xs text-white rounded-full h-4 w-4 flex items-center justify-center">
              0
            </span>
          </button>
          
          <Menu as="div" className="relative">
            <Menu.Button className="bg-green-50/10 px-3 py-1 rounded-md border border-white/10 flex items-center gap-3">
              <div className="text-right text-white">
                <p className="font-medium">{user?.name || 'User'}</p>
                <p className="text-sm opacity-90">Citizen Portal</p>
              </div>
              <User size={20} className="text-white" />
            </Menu.Button>
            
            <Menu.Items className="absolute right-0 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => handleNavigate('profile')}
                    className={`${
                      active ? 'bg-gray-100' : ''
                    } block w-full px-4 py-2 text-left text-sm text-gray-700`}
                  >
                    Your Profile
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={logout}
                    className={`${
                      active ? 'bg-gray-100' : ''
                    } block w-full px-4 py-2 text-left text-sm text-gray-700`}
                  >
                    Sign out
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Menu>

          <button
            onClick={logout}
            className="flex items-center gap-2 bg-white text-red-500 px-4 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
