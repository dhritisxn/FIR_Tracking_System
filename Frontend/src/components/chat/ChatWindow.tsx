import React, { useState, useRef, useEffect } from 'react';
import { Send, X, User, Shield, Phone, Mail, Clock, CheckCircle } from 'lucide-react';
import { FIR } from '../../App';

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

interface ChatWindowProps {
  fir: FIR;
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'officer';
  timestamp: Date;
  senderName: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ fir, isOpen, onClose, onSendMessage }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Initialize with welcome message
      const welcomeMessage: Message = {
        id: '1',
        text: `Hello! I'm ${fir.assignedOfficer || 'Officer Singh'}, the investigating officer for your case ${fir._id}. I'm here to assist you with any questions or updates regarding your FIR. How can I help you today?`,
        sender: 'officer',
        timestamp: new Date(),
        senderName: fir.assignedOfficer || 'Officer Singh'
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, fir, messages.length]);

  const addMessage = (text: string, sender: 'user' | 'officer', senderName: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date(),
      senderName
    };
    setMessages(prev => [...prev, newMessage]);

    // Also send to parent component for admin chat
    onSendMessage({
      firId: fir._id,
      senderId: sender === 'user' ? fir.email : 'officer@police.gov.in',
      senderName,
      senderType: sender === 'user' ? 'citizen' : 'officer',
      message: text,
      isRead: false
    });
  };

  const handleOfficerResponse = (userMessage: string) => {
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      
      const lowerMessage = userMessage.toLowerCase();
      let response = '';

      if (lowerMessage.includes('status') || lowerMessage.includes('update')) {
        response = `Your case is currently in "${fir.status}" status. The last update was: "${fir.updates[fir.updates.length - 1]?.message}". We are actively working on your case and will provide updates as soon as there are new developments.`;
      } else if (lowerMessage.includes('evidence') || lowerMessage.includes('document')) {
        response = 'If you have additional evidence or documents to submit, please email them to evidence@police.gov.in with your FIR ID in the subject line, or visit the nearest police station. Make sure to preserve all digital evidence in its original form.';
      } else if (lowerMessage.includes('time') || lowerMessage.includes('how long')) {
        response = 'Investigation timelines vary depending on the complexity of the case. For cyber crimes, initial investigation typically takes 15-30 days. We will keep you informed of any significant developments and expected timelines.';
      } else if (lowerMessage.includes('court') || lowerMessage.includes('legal')) {
        response = 'Once our investigation is complete, if charges are filed, you will be notified about court proceedings. You may need to appear as a witness. We will provide you with all necessary documentation and guidance for court appearances.';
      } else if (lowerMessage.includes('compensation') || lowerMessage.includes('money back')) {
        response = 'For financial crimes, recovery depends on various factors. We are working with banks and financial institutions to trace and recover funds. You may also be eligible for victim compensation schemes. I will share the relevant forms and procedures with you.';
      } else {
        response = 'Thank you for your message. I understand your concern regarding this matter. Let me look into this and get back to you with specific information. In the meantime, if you have any urgent concerns, please don\'t hesitate to call our helpline at 100.';
      }

      addMessage(response, 'officer', fir.assignedOfficer || 'Officer Singh');
    }, 1000 + Math.random() * 2000);
  };

  const handleSendMessage = () => {
    if (inputText.trim()) {
      addMessage(inputText, 'user', 'You');
      handleOfficerResponse(inputText);
      setInputText('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed bottom-4 right-4 w-96 bg-white rounded-2xl shadow-2xl transition-all transform duration-200 ease-in-out ${
      isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
    }`}>
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-orange-600 to-blue-600 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-white font-medium">{fir.assignedOfficer}</h3>
              <p className="text-blue-100 text-sm">Investigating Officer</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:text-blue-100 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl p-3 ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-gray-100 text-gray-900 rounded-bl-none'
              }`}
            >
              <p className="text-sm mb-1">{message.text}</p>
              <p className={`text-xs ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl p-3 rounded-bl-none">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <form onSubmit={(e) => {
          e.preventDefault();
          if (!inputText.trim()) return;
          
          addMessage(inputText, 'user', 'You');
          setInputText('');

          // Trigger officer response
          handleOfficerResponse(inputText);
        }}>
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;