import React, { useState, useEffect } from 'react';
import { Shield, Users, MessageCircle, FileText, Search, CheckCircle, Clock, AlertTriangle, Phone, Mail, MapPin, Star, Award, TrendingUp, ChevronLeft, ChevronRight, Camera, Zap, Globe, Heart, UserCheck, Settings } from 'lucide-react';

interface LandingPageProps {
  onLogin: (type: 'citizen' | 'admin' | 'officer') => void;
  onShowLoginOptions: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onShowLoginOptions }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const crimeAwarenessSlides = [
    {
      title: "साइबर सुरक्षा | Cyber Security",
      subtitle: "Protect yourself from online fraud",
      content: "Never share OTP, PIN, or passwords with anyone. Banks never ask for these details over phone or email.",
      tips: ["Verify before clicking links", "Use secure payment methods", "Report suspicious activities"],
      color: "from-red-500 to-orange-500",
      icon: "🔒",
      image: "https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    {
      title: "महिला सुरक्षा | Women Safety",
      subtitle: "Emergency helpline and safety tips",
      content: "Women Helpline 1091 is available 24/7. Share your location with trusted contacts when traveling.",
      tips: ["Trust your instincts", "Stay in well-lit areas", "Keep emergency contacts ready"],
      color: "from-pink-500 to-purple-500",
      icon: "👩‍🦰",
      image: "https://images.pexels.com/photos/5699456/pexels-photo-5699456.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    {
      title: "चोरी से बचाव | Theft Prevention",
      subtitle: "Secure your valuables",
      content: "Keep your belongings secure and be aware of your surroundings in crowded places.",
      tips: ["Lock your vehicles", "Avoid displaying valuables", "Use hotel safes when traveling"],
      color: "from-blue-500 to-indigo-500",
      icon: "🔐",
      image: "https://images.pexels.com/photos/4386321/pexels-photo-4386321.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    {
      title: "यातायात सुरक्षा | Traffic Safety",
      subtitle: "Road safety awareness",
      content: "Follow traffic rules, wear helmets and seatbelts. Don't drink and drive.",
      tips: ["Obey speed limits", "Use indicators properly", "Maintain safe distance"],
      color: "from-green-500 to-teal-500",
      icon: "🚦",
      image: "https://images.pexels.com/photos/544966/pexels-photo-544966.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    {
      title: "बाल सुरक्षा | Child Safety",
      subtitle: "Protecting our children",
      content: "Teach children about stranger danger and create a safe environment for them.",
      tips: ["Monitor online activities", "Teach emergency numbers", "Create safe spaces"],
      color: "from-yellow-500 to-orange-500",
      icon: "👶",
      image: "https://images.pexels.com/photos/1720186/pexels-photo-1720186.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    {
      title: "घरेलू हिंसा रोकथाम | Domestic Violence Prevention",
      subtitle: "Breaking the cycle of abuse",
      content: "Domestic violence is a crime. Help is available 24/7. You are not alone.",
      tips: ["Know your rights", "Document incidents", "Seek help immediately"],
      color: "from-purple-500 to-pink-500",
      icon: "🏠",
      image: "https://images.pexels.com/photos/6003832/pexels-photo-6003832.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    {
      title: "नशा मुक्ति | Drug Abuse Prevention",
      subtitle: "Say no to drugs",
      content: "Drug abuse destroys lives and families. Seek help and support for recovery.",
      tips: ["Avoid peer pressure", "Seek counseling", "Report drug dealers"],
      color: "from-indigo-500 to-blue-500",
      icon: "💊",
      image: "https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    {
      title: "भ्रष्टाचार विरोधी | Anti-Corruption",
      subtitle: "Fight against corruption",
      content: "Report corruption and bribery. Every citizen has the right to honest governance.",
      tips: ["Don't pay bribes", "Use RTI effectively", "Report corrupt officials"],
      color: "from-orange-500 to-red-500",
      icon: "⚖️",
      image: "https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=800"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % crimeAwarenessSlides.length);
    }, 5000); // 5 seconds as requested
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % crimeAwarenessSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + crimeAwarenessSlides.length) % crimeAwarenessSlides.length);
  };

  const LoginOptionsModal = () => {
    if (!showLoginModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
          <h2 className="text-2xl font-bold text-center mb-4">Select Login Type</h2>
          <p className="text-gray-600 text-center mb-6">Choose your role to access the appropriate portal</p>
          
          <div className="space-y-3">
            <button
              onClick={() => { onLogin('citizen'); setShowLoginModal(false); }}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Citizen Login
            </button>
            
            <button
              onClick={() => { onLogin('officer'); setShowLoginModal(false); }}
              className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Officer Login
            </button>
            
            <button
              onClick={() => { onLogin('admin'); setShowLoginModal(false); }}
              className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Admin Login
            </button>
            
            <button
              onClick={() => setShowLoginModal(false)}
              className="w-full py-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Login Options in Corner */}
      <div className="fixed top-4 right-4 z-40">
        <button
          onClick={() => setShowLoginModal(true)}
          className="bg-white shadow-lg rounded-full p-3 hover:shadow-xl transition-all border-2 border-orange-200"
        >
          <Settings className="h-5 w-5 text-orange-600" />
        </button>
      </div>

      {/* Login Options Modal */}
      <LoginOptionsModal />

      {/* Enhanced Hero Section with Police Images */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 to-blue-600/10"></div>
        {/* Background Police Images */}
        <div className="absolute inset-0 opacity-5">
          <div className="grid grid-cols-3 h-full">
            <div className="bg-cover bg-center" style={{backgroundImage: "url('https://images.pexels.com/photos/8112199/pexels-photo-8112199.jpeg?auto=compress&cs=tinysrgb&w=400')"}}></div>
            <div className="bg-cover bg-center" style={{backgroundImage: "url('https://images.pexels.com/photos/8112180/pexels-photo-8112180.jpeg?auto=compress&cs=tinysrgb&w=400')"}}></div>
            <div className="bg-cover bg-center" style={{backgroundImage: "url('https://images.pexels.com/photos/8112201/pexels-photo-8112201.jpeg?auto=compress&cs=tinysrgb&w=400')"}}></div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="bg-gradient-to-r from-orange-600 to-blue-600 p-6 rounded-full shadow-2xl border-4 border-white animate-pulse">
                <Shield className="h-20 w-20 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
                भारतीय पुलिस सेवा
              </span>
              <br />
              <span className="text-gray-800 text-3xl md:text-4xl">
                Intelligent FIR Filing & Tracking System
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              सत्यमेव जयते - Truth Alone Triumphs. Revolutionizing crime reporting with AI-powered assistance, 
              real-time tracking, and comprehensive guidance for citizens and law enforcement. 
              Experience transparency, accountability, and seamless digital governance.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={() => onLogin('citizen')}
                className="group bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-orange-700 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl border-2 border-orange-300"
              >
                <div className="flex items-center space-x-2">
                  <Users className="h-6 w-6 group-hover:scale-110 transition-transform" />
                  <span>नागरिक पोर्टल | Citizen Portal</span>
                </div>
              </button>
              <button
                onClick={() => onLogin('citizen')}
                className="group bg-gradient-to-r from-green-600 to-teal-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-green-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl border-2 border-green-300"
              >
                <div className="flex items-center space-x-2">
                  <FileText className="h-6 w-6 group-hover:scale-110 transition-transform" />
                  <span>नया खाता बनाएं | Create Account</span>
                </div>
              </button>
            </div>

            {/* Enhanced Trust Indicators */}
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Award className="h-4 w-4 text-orange-600" />
                <span>Government Certified</span>
              </div>
              <div className="flex items-center space-x-1">
                <Shield className="h-4 w-4 text-green-600" />
                <span>Secure & Encrypted</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-600" />
                <span>4.9/5 User Rating</span>
              </div>
              <div className="flex items-center space-x-1">
                <Globe className="h-4 w-4 text-blue-600" />
                <span>24/7 Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Police Gallery Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">भारतीय पुलिस बल | Indian Police Force</h2>
            <p className="text-xl text-gray-600">Serving the nation with dedication and honor</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="relative group overflow-hidden rounded-2xl shadow-xl">
              <img 
                src="https://images.pexels.com/photos/8112199/pexels-photo-8112199.jpeg?auto=compress&cs=tinysrgb&w=600" 
                alt="Indian Police Officer"
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-lg font-bold">Community Policing</h3>
                <p className="text-sm">Building trust with citizens</p>
              </div>
            </div>
            
            <div className="relative group overflow-hidden rounded-2xl shadow-xl">
              <img 
                src="https://images.pexels.com/photos/8112180/pexels-photo-8112180.jpeg?auto=compress&cs=tinysrgb&w=600" 
                alt="Police Technology"
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-lg font-bold">Modern Technology</h3>
                <p className="text-sm">Digital policing solutions</p>
              </div>
            </div>
            
            <div className="relative group overflow-hidden rounded-2xl shadow-xl">
              <img 
                src="https://images.pexels.com/photos/8112201/pexels-photo-8112201.jpeg?auto=compress&cs=tinysrgb&w=600" 
                alt="Police Training"
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-lg font-bold">Professional Training</h3>
                <p className="text-sm">Excellence in service</p>
              </div>
            </div>

            <div className="relative group overflow-hidden rounded-2xl shadow-xl">
              <img 
                src="https://images.pexels.com/photos/6003832/pexels-photo-6003832.jpeg?auto=compress&cs=tinysrgb&w=600" 
                alt="Women Safety"
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-lg font-bold">Women Safety</h3>
                <p className="text-sm">Protecting and empowering</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Crime Awareness Slider with Images */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">अपराध जागरूकता | Crime Awareness</h2>
            <p className="text-xl text-gray-600">Stay informed and stay safe with our awareness campaigns</p>
          </div>
          
          <div className="relative">
            <div className="overflow-hidden rounded-2xl shadow-2xl">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {crimeAwarenessSlides.map((slide, index) => (
                  <div key={index} className="w-full flex-shrink-0">
                    <div className={`bg-gradient-to-r ${slide.color} text-white min-h-[500px] flex items-center relative overflow-hidden`}>
                      {/* Background Image */}
                      <div 
                        className="absolute inset-0 bg-cover bg-center opacity-20"
                        style={{ backgroundImage: `url(${slide.image})` }}
                      ></div>
                      <div className="absolute inset-0 bg-black/30"></div>
                      
                      <div className="max-w-4xl mx-auto text-center relative z-10 p-12">
                        <div className="text-6xl mb-6">{slide.icon}</div>
                        <h3 className="text-4xl font-bold mb-4">{slide.title}</h3>
                        <p className="text-xl mb-6 opacity-90">{slide.subtitle}</p>
                        <p className="text-lg mb-8 max-w-3xl mx-auto leading-relaxed">{slide.content}</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {slide.tips.map((tip, tipIndex) => (
                            <div key={tipIndex} className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                              <p className="text-sm font-medium">💡 {tip}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Navigation Buttons */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
            
            {/* Slide Indicators */}
            <div className="flex justify-center mt-6 space-x-2">
              {crimeAwarenessSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentSlide ? 'bg-orange-600 scale-125' : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Public Safety Information Section */}
      <div className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">सार्वजनिक सुरक्षा सूचना | Public Safety Information</h2>
            <p className="text-xl text-gray-600">Essential safety guidelines and emergency procedures</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-red-200 hover:shadow-xl transition-shadow">
              <div className="bg-red-100 p-3 rounded-xl w-fit mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Emergency Response</h3>
              <p className="text-gray-600 mb-4">Know what to do in emergency situations. Quick response can save lives.</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Call 100 for police emergency</li>
                <li>• Call 108 for medical emergency</li>
                <li>• Stay calm and provide clear information</li>
                <li>• Follow officer instructions</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-blue-200 hover:shadow-xl transition-shadow">
              <div className="bg-blue-100 p-3 rounded-xl w-fit mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Personal Safety</h3>
              <p className="text-gray-600 mb-4">Protect yourself and your family with these safety measures.</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Be aware of your surroundings</li>
                <li>• Trust your instincts</li>
                <li>• Keep emergency contacts handy</li>
                <li>• Avoid isolated areas at night</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-green-200 hover:shadow-xl transition-shadow">
              <div className="bg-green-100 p-3 rounded-xl w-fit mb-4">
                <Globe className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Digital Safety</h3>
              <p className="text-gray-600 mb-4">Stay safe online and protect your digital identity.</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Use strong, unique passwords</li>
                <li>• Don't share personal information</li>
                <li>• Verify before clicking links</li>
                <li>• Report cyber crimes immediately</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-purple-200 hover:shadow-xl transition-shadow">
              <div className="bg-purple-100 p-3 rounded-xl w-fit mb-4">
                <Heart className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Community Support</h3>
              <p className="text-gray-600 mb-4">Building stronger, safer communities together.</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Know your neighbors</li>
                <li>• Report suspicious activities</li>
                <li>• Participate in community programs</li>
                <li>• Support local safety initiatives</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-yellow-200 hover:shadow-xl transition-shadow">
              <div className="bg-yellow-100 p-3 rounded-xl w-fit mb-4">
                <Camera className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Evidence Collection</h3>
              <p className="text-gray-600 mb-4">Properly document incidents for effective investigation.</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Take clear photos/videos</li>
                <li>• Preserve digital evidence</li>
                <li>• Note time and location</li>
                <li>• Collect witness information</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-indigo-200 hover:shadow-xl transition-shadow">
              <div className="bg-indigo-100 p-3 rounded-xl w-fit mb-4">
                <UserCheck className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Legal Rights</h3>
              <p className="text-gray-600 mb-4">Know your rights and responsibilities as a citizen.</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Right to file FIR</li>
                <li>• Right to legal representation</li>
                <li>• Right to fair investigation</li>
                <li>• Right to privacy and dignity</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Indian Police Theme Section */}
      <div className="py-16 bg-gradient-to-r from-orange-600 via-white to-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-orange-300">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              🇮🇳 राष्ट्रीय प्रतीक | National Emblem 🇮🇳
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              "सत्यमेव जयते" - Truth Alone Triumphs
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-orange-50 p-6 rounded-xl border-2 border-orange-200 hover:shadow-lg transition-shadow">
                <div className="text-orange-600 text-2xl mb-2">🧡</div>
                <h3 className="font-bold text-orange-900">साहस | Courage</h3>
                <p className="text-sm text-orange-800">Bravery in service</p>
              </div>
              <div className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:shadow-lg transition-shadow">
                <div className="text-blue-600 text-2xl mb-2">🤍</div>
                <h3 className="font-bold text-gray-900">शांति | Peace</h3>
                <p className="text-sm text-gray-800">Harmony and justice</p>
              </div>
              <div className="bg-green-50 p-6 rounded-xl border-2 border-green-200 hover:shadow-lg transition-shadow">
                <div className="text-green-600 text-2xl mb-2">💚</div>
                <h3 className="font-bold text-green-900">समृद्धि | Prosperity</h3>
                <p className="text-sm text-green-800">Growth and progress</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Features Section with Icons */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">व्यापक FIR प्रबंधन</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Comprehensive FIR Management powered by cutting-edge technology</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group bg-white p-8 rounded-2xl shadow-lg border-2 border-orange-200 hover:shadow-2xl hover:border-orange-400 transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-gradient-to-r from-orange-100 to-red-100 p-4 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform border border-orange-300">
                <MessageCircle className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">AI-Powered Chatbot</h3>
              <p className="text-gray-600 leading-relaxed">
                Get step-by-step guidance for filing FIRs with our intelligent chatbot that understands different crime types and provides specialized assistance, including emergency protocols.
              </p>
            </div>

            <div className="group bg-white p-8 rounded-2xl shadow-lg border-2 border-blue-200 hover:shadow-2xl hover:border-blue-400 transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-4 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform border border-blue-300">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart FIR Filing</h3>
              <p className="text-gray-600 leading-relaxed">
                Streamlined forms with intelligent validation, auto-suggestions, evidence upload, and automatic officer assignment to make filing FIRs quick, accurate, and comprehensive for all citizens.
              </p>
            </div>

            <div className="group bg-white p-8 rounded-2xl shadow-lg border-2 border-green-200 hover:shadow-2xl hover:border-green-400 transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-gradient-to-r from-green-100 to-teal-100 p-4 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform border border-green-300">
                <Search className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Real-time Tracking</h3>
              <p className="text-gray-600 leading-relaxed">
                Track your FIR status with unique ID numbers and receive instant notifications on investigation progress with detailed timeline and direct officer communications.
              </p>
            </div>

            <div className="group bg-white p-8 rounded-2xl shadow-lg border-2 border-purple-200 hover:shadow-2xl hover:border-purple-400 transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform border border-purple-300">
                <Camera className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Evidence Upload</h3>
              <p className="text-gray-600 leading-relaxed">
                Upload photos, documents, and other evidence directly with your FIR. Secure cloud storage ensures your evidence is preserved and accessible to investigating officers.
              </p>
            </div>

            <div className="group bg-white p-8 rounded-2xl shadow-lg border-2 border-red-200 hover:shadow-2xl hover:border-red-400 transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-gradient-to-r from-red-100 to-orange-100 p-4 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform border border-red-300">
                <Zap className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Emergency Response</h3>
              <p className="text-gray-600 leading-relaxed">
                Immediate emergency protocols for urgent cases with direct hotline integration, GPS location sharing, and priority routing to nearest police stations.
              </p>
            </div>

            <div className="group bg-white p-8 rounded-2xl shadow-lg border-2 border-indigo-200 hover:shadow-2xl hover:border-indigo-400 transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-gradient-to-r from-indigo-100 to-blue-100 p-4 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform border border-indigo-300">
                <Heart className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Citizen Feedback</h3>
              <p className="text-gray-600 leading-relaxed">
                Rate your experience and provide feedback after case resolution. Help us improve our services and ensure accountability in the justice system.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Section */}
      <div className="py-20 bg-gradient-to-r from-orange-600 via-red-600 to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">राष्ट्रव्यापी विश्वसनीयता</h2>
            <p className="text-orange-100 text-lg">Trusted by Citizens Nationwide with measurable results</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="text-white">
              <div className="text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent">24/7</div>
              <div className="text-orange-200 font-medium">Available Support</div>
            </div>
            <div className="text-white">
              <div className="text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent">95%</div>
              <div className="text-orange-200 font-medium">User Satisfaction</div>
            </div>
            <div className="text-white">
              <div className="text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent">50+</div>
              <div className="text-orange-200 font-medium">Crime Categories</div>
            </div>
            <div className="text-white">
              <div className="text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent">48hrs</div>
              <div className="text-orange-200 font-medium">Avg Response Time</div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">यह कैसे काम करता है</h2>
            <p className="text-xl text-gray-600">Simple, secure, and efficient process</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg border-4 border-orange-200">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Chat & Guidance</h3>
              <p className="text-gray-600">Interact with our AI chatbot to understand the process and gather necessary information for your specific case type.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg border-4 border-blue-200">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">File FIR</h3>
              <p className="text-gray-600">Complete the smart form with validation, upload evidence, and submit your FIR. Receive instant confirmation with unique tracking ID.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg border-4 border-green-200">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Track Progress</h3>
              <p className="text-gray-600">Monitor your case progress in real-time with detailed updates and direct communication with investigating officers.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contact Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">आपातकालीन संपर्क | Emergency Contacts</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border-2 border-red-200">
              <Phone className="h-10 w-10 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Police Emergency</h3>
              <p className="text-3xl font-bold text-red-600 mb-2">100</p>
              <p className="text-sm text-gray-600">24/7 emergency response</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border-2 border-blue-200">
              <Phone className="h-10 w-10 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cyber Crime</h3>
              <p className="text-3xl font-bold text-blue-600 mb-2">1930</p>
              <p className="text-sm text-gray-600">Cyber fraud & online crimes</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border-2 border-green-200">
              <Phone className="h-10 w-10 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Women Helpline</h3>
              <p className="text-3xl font-bold text-green-600 mb-2">1091</p>
              <p className="text-sm text-gray-600">Women safety & assistance</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border-2 border-purple-200">
              <Phone className="h-10 w-10 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Child Helpline</h3>
              <p className="text-3xl font-bold text-purple-600 mb-2">1098</p>
              <p className="text-sm text-gray-600">Child protection services</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-gradient-to-r from-orange-600 to-blue-600 p-2 rounded-lg border-2 border-orange-300">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold">भारतीय पुलिस सेवा</span>
                  <div className="text-sm text-gray-300">Indian Police Service</div>
                </div>
              </div>
              <p className="text-gray-300 mb-6 max-w-md">
                Making law enforcement accessible, transparent, and efficient for all citizens through innovative digital solutions and AI-powered assistance.
              </p>
              <div className="flex space-x-4">
                <div className="bg-gray-800 p-2 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer border border-orange-300">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div className="bg-gray-800 p-2 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer border border-blue-300">
                  <Star className="h-5 w-5" />
                </div>
                <div className="bg-gray-800 p-2 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer border border-green-300">
                  <Award className="h-5 w-5" />
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="hover:text-white transition-colors cursor-pointer">How to File FIR</li>
                <li className="hover:text-white transition-colors cursor-pointer">Track Your FIR</li>
                <li className="hover:text-white transition-colors cursor-pointer">Cyber Crime Guide</li>
                <li className="hover:text-white transition-colors cursor-pointer">Emergency Contacts</li>
                <li className="hover:text-white transition-colors cursor-pointer">User Manual</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
              <div className="space-y-3 text-gray-300">
                <div className="flex items-center space-x-2 hover:text-white transition-colors">
                  <Mail className="h-4 w-4" />
                  <span>support@firsystem.gov.in</span>
                </div>
                <div className="flex items-center space-x-2 hover:text-white transition-colors">
                  <Phone className="h-4 w-4" />
                  <span>1800-FIR-HELP</span>
                </div>
                <div className="flex items-center space-x-2 hover:text-white transition-colors">
                  <MapPin className="h-4 w-4" />
                  <span>Government of India</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 भारतीय पुलिस सेवा | Indian Police Service. All rights reserved. Government of India Digital Initiative.</p>
            <p className="mt-2 text-sm">सत्यमेव जयते | Truth Alone Triumphs</p>
          </div>
        </div>
      </footer>

      {/* Login Options Modal */}
      <LoginOptionsModal />
    </div>
  );
};

export default LandingPage;