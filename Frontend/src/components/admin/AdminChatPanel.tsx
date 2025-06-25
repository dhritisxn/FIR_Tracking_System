import React, { useState } from 'react';
import { MessageCircle, Send, User, Clock, Search, Filter } from 'lucide-react';

interface ChatMessage {
  id: string;
  firId: string;
  senderId: string;
  senderName: string;
  senderType: 'citizen' | 'officer';
  message: string;
  timestamp: Date;
  isRead: boolean;
}

interface AdminChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
}

const AdminChatPanel: React.FC<AdminChatPanelProps> = ({ messages, onSendMessage }) => {
  const [selectedFIR, setSelectedFIR] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Group messages by FIR ID
  const messagesByFIR = messages.reduce((acc, message) => {
    if (!acc[message.firId]) {
      acc[message.firId] = [];
    }
    acc[message.firId].push(message);
    return acc;
  }, {} as Record<string, ChatMessage[]>);

  // Get unique FIR conversations
  const firConversations = Object.keys(messagesByFIR).map(firId => {
    const firMessages = messagesByFIR[firId];
    const lastMessage = firMessages[firMessages.length - 1];
    const unreadCount = firMessages.filter(msg => !msg.isRead && msg.senderType === 'citizen').length;
    
    return {
      firId,
      lastMessage,
      unreadCount,
      messageCount: firMessages.length
    };
  });

  const filteredConversations = firConversations.filter(conv =>
    conv.firId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.lastMessage.senderName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedFIR) return;

    onSendMessage({
      firId: selectedFIR,
      senderId: 'admin@police.gov.in',
      senderName: 'Admin Officer',
      senderType: 'officer',
      message: newMessage,
      isRead: false
    });

    setNewMessage('');
  };

  const selectedMessages = selectedFIR ? messagesByFIR[selectedFIR] || [] : [];

  return (
    <div className="bg-white rounded-lg shadow-md h-[600px] flex">
      {/* Conversations List */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Chat Conversations</h3>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No conversations found</p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <button
                key={conv.firId}
                onClick={() => setSelectedFIR(conv.firId)}
                className={`w-full p-4 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  selectedFIR === conv.firId ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">FIR #{conv.firId}</span>
                  {conv.unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2 mb-1">
                  <User className="h-3 w-3 text-gray-400" />
                  <span className="text-sm text-gray-600">{conv.lastMessage.senderName}</span>
                </div>
                <p className="text-sm text-gray-500 truncate">{conv.lastMessage.message}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-400">
                    {conv.lastMessage.timestamp.toLocaleTimeString()}
                  </span>
                  <span className="text-xs text-gray-400">
                    {conv.messageCount} messages
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {selectedFIR ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h4 className="font-semibold text-gray-900">FIR #{selectedFIR}</h4>
              <p className="text-sm text-gray-600">
                {selectedMessages.length > 0 && `Conversation with ${selectedMessages[0].senderName}`}
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderType === 'officer' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.senderType === 'officer'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-medium">
                        {message.senderName}
                      </span>
                      <span className={`text-xs ${
                        message.senderType === 'officer' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm">{message.message}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your response..."
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChatPanel;