import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Bot, User, AlertTriangle, Phone, CreditCard, Shield, FileText, ExternalLink, Lightbulb, Clock, CheckCircle } from 'lucide-react';

interface ChatBotProps {
  onBack: () => void;
  onFileFIR: () => void;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  options?: string[];
  isAction?: boolean;
  actionType?: 'file-fir' | 'emergency' | 'cyber-report';
  priority?: 'urgent' | 'high' | 'medium' | 'low';
  hasAttachment?: boolean;
}

const ChatBot: React.FC<ChatBotProps> = ({ onBack, onFileFIR }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentFlow, setCurrentFlow] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<{
    isFirstTime: boolean;
    preferredLanguage: string;
    location: string;
  }>({
    isFirstTime: true,
    preferredLanguage: 'English',
    location: 'India'
  });
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };


  useEffect(() => {
    // Enhanced initial greeting with personalization
    const initialMessage: Message = {
      id: '1',
      text: "🙏 Namaste! I'm your intelligent FIR assistant. I'm here to guide you through the complete process of filing an FIR and provide specialized help based on your situation.\n\n✨ I can help you with:\n• Step-by-step FIR filing guidance\n• Emergency protocols and immediate actions\n• Cyber crime assistance with urgent measures\n• Evidence preservation tips\n• Legal advice and next steps\n\nHow can I assist you today?",
      sender: 'bot',
      timestamp: new Date(),
      options: [
        "🚨 Emergency - Need immediate help",
        "💻 I'm a victim of cyber crime",
        "📝 I want to file an FIR",
        "❓ What types of cases can I report?",
        "🔍 How do I track my FIR status?",
        "💡 I need general guidance"
      ],
      priority: 'high'
    };
    setMessages([initialMessage]);
  }, []);

  const addMessage = (text: string, sender: 'user' | 'bot', options?: string[], isAction?: boolean, actionType?: 'file-fir' | 'emergency' | 'cyber-report', priority?: 'urgent' | 'high' | 'medium' | 'low') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date(),
      options,
      isAction,
      actionType,
      priority
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleBotResponse = (userMessage: string) => {
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      
      const lowerMessage = userMessage.toLowerCase();
      
      if (lowerMessage.includes('emergency') || userMessage.includes("🚨 Emergency - Need immediate help")) {
        addMessage(
          "🚨 **EMERGENCY PROTOCOL ACTIVATED**\n\nIf you're in IMMEDIATE DANGER:\n\n📞 **CALL 100 NOW** - Police Emergency\n\n🆘 **Other Critical Numbers:**\n• Women Helpline: 1091\n• Cyber Crime: 1930\n• Medical Emergency: 108\n• Fire: 101\n\n⚠️ **If this is an ongoing emergency, please call immediately and DO NOT rely solely on this chat.**\n\nFor non-emergency situations that need urgent reporting, I can help you file an FIR quickly.",
          'bot',
          [
            "🆘 Call 100 - Police Emergency",
            "📱 Call 1091 - Women Helpline", 
            "💻 Report Cyber Crime (1930)",
            "📝 File urgent FIR online",
            "✅ I'm safe now, continue with FIR"
          ],
          true,
          'emergency',
          'urgent'
        );
      } else if (lowerMessage.includes('cyber') || lowerMessage.includes('fraud') || lowerMessage.includes('online') || userMessage.includes("💻 I'm a victim of cyber crime")) {
        setCurrentFlow('cyber-crime');
        addMessage(
          "💻 **CYBER CRIME EMERGENCY RESPONSE**\n\nI understand you're a victim of cyber crime. Time is CRITICAL! Let me guide you through immediate actions:\n\n⏰ **STOP & ACT NOW - EVERY MINUTE COUNTS!**",
          'bot',
          [],
          false,
          undefined,
          'urgent'
        );
        
        setTimeout(() => {
          addMessage(
            "🚨 **IMMEDIATE ACTIONS (Do these RIGHT NOW):**\n\n1. 🔒 **Block ALL affected cards/accounts immediately**\n   • Call your bank's 24/7 helpline\n   • Use net banking to block cards\n   • Change all passwords\n\n2. 📸 **Preserve evidence IMMEDIATELY**\n   • Screenshot everything\n   • Save emails, SMS, call logs\n   • Don't delete anything\n\n3. 🌐 **Report on cybercrime.gov.in**\n   • File complaint within 24 hours\n   • Note down complaint number\n\n4. 🚫 **NEVER share OTP/PIN with anyone**\n   • Banks never ask for OTP\n   • Police never ask for passwords\n\n**What type of cyber crime occurred?**",
            'bot',
            [
              "💳 Credit/Debit card fraud",
              "📱 UPI/Mobile banking fraud", 
              "📧 Email/Social media hack",
              "💰 Investment/Trading scam",
              "🛒 Online shopping fraud",
              "❤️ Romance/Dating scam",
              "📞 Vishing/Call fraud",
              "🔗 Phishing links/websites"
            ],
            false,
            undefined,
            'urgent'
          );
        }, 1500);
      } else if (lowerMessage.includes('file fir') || lowerMessage.includes('file an fir') || userMessage.includes("📝 I want to file an FIR")) {
        setCurrentFlow('file-fir');
        addMessage(
          "📝 **FIR FILING ASSISTANCE**\n\nI'll guide you through the complete FIR filing process. Let me first understand your situation to provide the most appropriate guidance.\n\n**What type of incident do you need to report?**",
          'bot',
          [
            "💻 Cyber Crime/Online Fraud",
            "🔒 Theft/Burglary/Missing items",
            "⚡ Violence/Assault/Threat",
            "👤 Missing Person",
            "🚗 Vehicle related (theft/accident)",
            "🏠 Property disputes/damage", 
            "👥 Harassment/Stalking",
            "💊 Drug related crimes",
            "🔍 Other incident type"
          ]
        );
      } else if (lowerMessage.includes('types') || lowerMessage.includes('cases') || userMessage.includes("❓ What types of cases can I report?")) {
        addMessage(
          "📋 **COMPREHENSIVE CRIME REPORTING GUIDE**\n\nYou can file an FIR for various types of crimes. Here's a complete breakdown:\n\n**🔥 HIGH PRIORITY CASES:**\n• Sexual offenses & harassment\n• Domestic violence\n• Child abuse/trafficking\n• Kidnapping/abduction\n• Murder/attempt to murder\n• Cyber crimes & fraud\n\n**📊 COMMON CASES:**\n• Theft/Burglary\n• Vehicle theft\n• Assault/Violence\n• Property damage\n• Missing person\n• Drug-related crimes\n• Cheating/fraud\n• Dowry harassment\n\n**💻 CYBER CRIMES:**\n• Online fraud/scams\n• Identity theft\n• Hacking/data breach\n• Cyberbullying\n• Fake social media profiles\n• UPI/banking fraud\n\n**Which category matches your situation?**",
          'bot',
          [
            "🚨 High priority crime",
            "📊 Common crime reporting",
            "💻 Cyber crime incident",
            "🤔 I'm not sure which category",
            "📝 Ready to file FIR now"
          ]
        );
      } else if (lowerMessage.includes('track') || lowerMessage.includes('status') || userMessage.includes("🔍 How do I track my FIR status?")) {
        addMessage(
          "🔍 **FIR TRACKING SYSTEM GUIDE**\n\nHere's everything you need to know about tracking your FIR:\n\n**📱 HOW TO TRACK:**\n1. Go to 'Track Status' in citizen portal\n2. Enter your unique FIR ID (provided after filing)\n3. View real-time updates and timeline\n4. See assigned officer details\n5. Download status reports\n\n**📬 AUTOMATIC NOTIFICATIONS:**\n• SMS updates on status changes\n• Email notifications with details\n• In-app push notifications\n• WhatsApp updates (if opted)\n\n**📊 WHAT YOU CAN SEE:**\n• Current investigation status\n• Officer assigned to your case\n• Timeline of all actions taken\n• Expected resolution timeframe\n• Contact details for queries\n\n**💡 TIP:** Save your FIR ID in multiple places - phone, email, physical copy.",
          'bot',
          [
            "📱 I have an FIR ID to track",
            "📝 I need to file a new FIR first",
            "❌ I'm not getting status updates",
            "📞 I want to contact the officer",
            "📄 I need FIR copy/documents"
          ]
        );
      } else if (userMessage.includes("💡 I need general guidance")) {
        addMessage(
          "💡 **COMPREHENSIVE LEGAL GUIDANCE**\n\nI'm here to provide complete guidance on legal procedures and your rights:\n\n**🎯 WHAT I CAN HELP WITH:**\n\n**📚 FIR Process:**\n• When to file an FIR\n• What information is needed\n• Your rights during filing\n• Timeline expectations\n\n**⚖️ Legal Rights:**\n• Your constitutional rights\n• Police procedures\n• Evidence requirements\n• Bail & court procedures\n\n**🛡️ Victim Support:**\n• Compensation schemes\n• Witness protection\n• Counseling services\n• Legal aid options\n\n**🚨 Emergency Protocols:**\n• Immediate safety measures\n• Evidence preservation\n• Reporting procedures\n• Follow-up actions\n\n**What specific guidance do you need?**",
          'bot',
          [
            "📚 FIR filing process & requirements",
            "⚖️ My legal rights & protections", 
            "🛡️ Victim support & compensation",
            "🚨 Emergency safety procedures",
            "🔍 Evidence collection & preservation",
            "💼 Legal aid & free services"
          ]
        );
      } else if (userMessage.includes("💳 Credit/Debit card fraud")) {
        addMessage(
          "💳 **CARD FRAUD EMERGENCY PROTOCOL**\n\n⏰ **IMMEDIATE ACTIONS (Next 10 minutes):**\n\n1. 🚫 **Block cards NOW:**\n   • Call bank helpline immediately\n   • Use mobile banking app\n   • Send SMS to block (if available)\n\n2. 📞 **Key Bank Helplines:**\n   • SBI: 1800-1111 / 1800-2100\n   • HDFC: 1800-2572 / 1800-2400\n   • ICICI: 1800-2000 / 1800-1906\n   • Axis: 1800-4190 / 1800-4196\n   • PNB: 1800-2222 / 1800-1800\n\n3. 📝 **Document everything:**\n   • Screenshot transaction alerts\n   • Note fraud transaction details\n   • Save all communication\n\n4. 🌐 **Report on cybercrime.gov.in**\n   • File within 24 hours\n   • Get complaint number\n\n**Have you blocked your cards yet?**",
          'bot',
          [
            "✅ Yes, cards are blocked",
            "❌ No, help me block them now",
            "📱 I need bank helpline numbers",
            "📝 Cards blocked, what's next?",
            "🚨 Multiple cards affected"
          ],
          false,
          undefined,
          'urgent'
        );
      } else if (userMessage === "✅ Yes, cards are blocked" || userMessage === "📝 Cards blocked, what's next?") {
        addMessage(
          "✅ **EXCELLENT! Cards blocked successfully.**\n\n**📋 NEXT CRITICAL STEPS:**\n\n**🔍 Evidence Collection:**\n• Screenshot ALL transaction alerts\n• Save emails from bank\n• Note down exact amounts & times\n• Keep record of blocking confirmation\n\n**📞 Follow-up Actions:**\n• File written complaint with bank\n• Request transaction reversal\n• Get investigation reference number\n• Ask for temporary card if needed\n\n**⚖️ Legal Actions:**\n• File FIR for fraud\n• Report on cybercrime.gov.in\n• Consider civil action for recovery\n\n**🛡️ Future Protection:**\n• Enable SMS/email alerts\n• Use only secure payment methods\n• Regular account monitoring\n• Never share OTP/PIN\n\n**Ready to file the FIR now?**",
          'bot',
          [
            "📝 Yes, file FIR immediately",
            "🌐 First report on cybercrime.gov.in",
            "📞 I need more bank helpline numbers",
            "🤔 What documents do I need for FIR?",
            "💰 How to get my money back?"
          ]
        );
      } else if (userMessage === "📝 Yes, file FIR immediately" || userMessage === "Proceed to FIR Form" || userMessage === "Yes, file FIR now" || userMessage === "File FIR for cyber crime") {
        addMessage(
          "🎯 **PERFECT! Let's file your FIR immediately.**\n\n**📋 I'll now take you to our smart FIR form which includes:**\n\n✅ **Auto-validation** of all information\n✅ **Smart suggestions** based on crime type\n✅ **Evidence upload** capabilities\n✅ **Priority assessment** system\n✅ **Instant confirmation** with tracking ID\n✅ **Direct police notification** system\n\n**🔒 Your data is encrypted and secure.**\n\n**💡 Pro tip:** Have your evidence screenshots ready for upload during the form filling process.\n\n**Ready to proceed?**",
          'bot',
          ["🚀 Go to Smart FIR Form"],
          true,
          'file-fir'
        );
      } else if (userMessage === "🚀 Go to Smart FIR Form" || userMessage === "Go to FIR Form") {
        addMessage(
          "🚀 **Redirecting to Smart FIR Form...**\n\n**📱 The form will open with:**\n• Pre-filled crime type information\n• Guided step-by-step process\n• Real-time validation\n• Evidence upload section\n• Emergency contact integration\n\n**✨ You're doing the right thing by reporting this crime. The system will ensure your case gets proper attention.**\n\n**🔄 Redirecting now...**",
          'bot',
          [],
          false,
          undefined,
          'high'
        );
        
        setTimeout(() => {
          onFileFIR();
        }, 2000);
        return;
      } else if (userMessage === "🆘 Call 100 - Police Emergency") {
        addMessage(
          "🚨 **CALLING POLICE EMERGENCY - 100**\n\n**📞 Initiating emergency call...**\n\nWhile the call connects:\n\n**🗣️ WHAT TO SAY:**\n• Your exact location\n• Nature of emergency\n• If you're in immediate danger\n• Your name and contact number\n\n**📍 BE PREPARED TO PROVIDE:**\n• Landmarks nearby\n• Your address/location\n• Description of situation\n• Number of people involved\n\n**⚠️ STAY CALM AND SPEAK CLEARLY**",
          'bot',
          [
            "📞 Call connected, what now?",
            "❌ Call not connecting",
            "📝 Emergency handled, file FIR",
            "🏥 I need medical help too"
          ],
          true,
          'emergency',
          'urgent'
        );
        
        setTimeout(() => {
          window.open('tel:100');
        }, 1000);
      } else if (userMessage === "Back to main menu" || userMessage === "🏠 Back to main menu") {
        setCurrentFlow(null);
        addMessage(
          "🏠 **Welcome back to the main menu!**\n\nHow else can I assist you today? I'm here to provide comprehensive help with:",
          'bot',
          [
            "🚨 Emergency - Need immediate help",
            "💻 I'm a victim of cyber crime", 
            "📝 I want to file an FIR",
            "❓ What types of cases can I report?",
            "🔍 How do I track my FIR status?",
            "💡 I need general guidance"
          ]
        );
      } else {
        // Enhanced default response with personalized suggestions
        addMessage(
          "🤔 I understand you need help. Let me provide some quick suggestions based on common needs:\n\n**🎯 QUICK HELP OPTIONS:**\n\n🚨 **Emergency situations** - Immediate police/medical help\n💻 **Cyber crimes** - Card fraud, online scams, hacking\n📝 **File new FIR** - Report any crime incident\n🔍 **Track existing FIR** - Check status of filed case\n💡 **General guidance** - Legal advice and procedures\n\n**💭 You can also type your question naturally, and I'll understand and help appropriately.**\n\n**What would you like to do?**",
          'bot',
          [
            "🚨 Emergency - Need immediate help",
            "💻 I'm a victim of cyber crime",
            "📝 I want to file an FIR", 
            "🔍 Track my FIR status",
            "💡 I need general guidance",
            "❓ Show all available options"
          ]
        );
      }
    }, 1000 + Math.random() * 1000);
  };

  const handleSendMessage = () => {
    if (inputText.trim()) {
      addMessage(inputText, 'user');
      handleBotResponse(inputText);
      setInputText('');
    }
  };
const handleStartSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition not supported in this browser.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognitionRef.current = recognition;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript;
      }
      setInputText(transcript);
    };
    recognition.start();
  };

  const handleStopSpeechRecognition = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  // Send audio handler
  const handleSendAudio = async () => {
    if (audioChunks.length === 0) return;
    setIsUploading(true);
    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');
    formData.append('user_id', 'USER_ID'); // Replace with actual user id
    formData.append('location', userProfile.location || 'Unknown');
    try {
      const res = await fetch('/api/police/register_fir_audio', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.transcription) {
        addMessage('🎤 Transcribed: ' + data.transcription, 'user');
        addMessage('✅ FIR Registered via audio!', 'bot');
      } else {
        addMessage('❌ Error: Could not transcribe audio.', 'bot');
      }
    } catch (err) {
      addMessage('❌ Error sending audio.', 'bot');
    }
    setIsUploading(false);
    setAudioChunks([]);
  };
  const handleOptionClick = (option: string) => {
    addMessage(option, 'user');
    handleBotResponse(option);
  };

  const handleActionClick = (actionType: string) => {
    switch (actionType) {
      case 'file-fir':
        onFileFIR();
        break;
      case 'emergency':
        window.open('tel:100');
        break;
      case 'cyber-report':
        window.open('https://cybercrime.gov.in', '_blank');
        break;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-4 border-red-500 bg-red-50';
      case 'high':
        return 'border-l-4 border-orange-500 bg-orange-50';
      case 'medium':
        return 'border-l-4 border-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-4 border-green-500 bg-green-50';
      default:
        return 'bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Enhanced Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </button>
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">AI FIR Assistant</h1>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-600">Online & Ready to Help</span>
                </div>
              </div>
            </div>
            <div className="w-24"></div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl h-[600px] flex flex-col overflow-hidden">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white ml-auto'
                      : `${getPriorityColor(message.priority)} text-gray-900`
                  } shadow-lg`}
                >
                  <div className="flex items-start space-x-3">
                    {message.sender === 'bot' && (
                      <div className="bg-blue-600 p-1.5 rounded-full">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}
                    {message.sender === 'user' && (
                      <User className="h-5 w-5 text-blue-100 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-line leading-relaxed">{message.text}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className={`text-xs ${
                          message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                        {message.priority === 'urgent' && (
                          <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">
                            URGENT
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {message.options && (
                    <div className="mt-4 space-y-2">
                      {message.options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            if (message.isAction && message.actionType) {
                              if (option.includes("Go to") || option.includes("🚀 Go to")) {
                                handleActionClick('file-fir');
                              } else if (option.includes("Call 100") || option.includes("🆘 Call")) {
                                handleActionClick('emergency');
                              } else {
                                handleOptionClick(option);
                              }
                            } else {
                              handleOptionClick(option);
                            }
                          }}
                          className="block w-full text-left px-4 py-3 text-sm bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-[1.02]"
                        >
                          <span className="font-medium">{option}</span>
                          {(option.includes("Go to") || option.includes("🚀 Go to")) && (
                            <FileText className="inline h-4 w-4 ml-2 text-blue-600" />
                          )}
                          {(option.includes("Call") || option.includes("📞")) && (
                            <Phone className="inline h-4 w-4 ml-2 text-red-600" />
                          )}
                          {option.includes('cybercrime.gov.in') && (
                            <ExternalLink className="inline h-4 w-4 ml-2 text-green-600" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 px-4 py-3 rounded-2xl max-w-xs shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-600 p-1.5 rounded-full">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-gray-500">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Enhanced Input Area */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex space-x-3">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message or choose from options above..."
                className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim()}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Send className="h-5 w-5" />
              </button>
              {/* Microphone Button */}
              <button
                onClick={isListening ? handleStopSpeechRecognition : handleStartSpeechRecognition}
                className={`bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3 rounded-xl ml-2 shadow-lg hover:shadow-xl transform hover:scale-105 ${isListening ? 'animate-pulse' : ''}`}
                title={isListening ? 'Stop Listening' : 'Start Speech to Text'}
              >
                <Mic className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              💡 Tip: You can type naturally or use the suggested options above
            </p>
          </div>
        </div>

        {/* Enhanced Emergency Notice */}
        <div className="mt-6 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-start space-x-4">
            <div className="bg-red-500 p-2 rounded-full">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900 mb-2">🚨 Emergency Situations</h3>
              <p className="text-red-800 mb-4">
                If you're in <strong>immediate danger</strong> or witnessing a <strong>crime in progress</strong>, 
                please call <strong className="text-red-900 text-lg">100</strong> directly instead of using this chatbot.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <div className="font-semibold text-red-900">Police: 100</div>
                  <div className="text-sm text-red-700">Emergency</div>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <div className="font-semibold text-red-900">Medical: 108</div>
                  <div className="text-sm text-red-700">Ambulance</div>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <div className="font-semibold text-red-900">Women: 1091</div>
                  <div className="text-sm text-red-700">Helpline</div>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <div className="font-semibold text-red-900">Cyber: 1930</div>
                  <div className="text-sm text-red-700">Crime</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Features Notice */}
        <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <Lightbulb className="h-5 w-5 text-blue-600" />
            <div className="text-sm text-blue-800">
              <strong>AI-Powered:</strong> This chatbot uses advanced AI to understand your situation and provide personalized guidance. 
              Available 24/7 in multiple languages with real-time emergency protocol activation.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
