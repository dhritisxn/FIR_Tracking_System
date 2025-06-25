import React, { useState } from 'react';
import { Bot, X, MessageCircle, FileText, Shield, AlertTriangle, Phone, HelpCircle } from 'lucide-react';

interface VirtualAssistantProps {
  onNavigate: (view: string) => void;
}

const VirtualAssistant: React.FC<VirtualAssistantProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<'main' | 'crime-types' | 'guidance'>('main');

  const crimeCategories = [
    {
      title: 'Cyber Crimes',
      icon: <Shield className="h-5 w-5" />,
      description: 'Online fraud, hacking, identity theft',
      color: 'bg-red-100 text-red-700 border-red-200',
      examples: ['Credit card fraud', 'UPI scams', 'Social media hacking', 'Email phishing']
    },
    {
      title: 'Property Crimes',
      icon: <FileText className="h-5 w-5" />,
      description: 'Theft, burglary, property damage',
      color: 'bg-blue-100 text-blue-700 border-blue-200',
      examples: ['House burglary', 'Vehicle theft', 'Mobile theft', 'Property damage']
    },
    {
      title: 'Personal Safety',
      icon: <AlertTriangle className="h-5 w-5" />,
      description: 'Assault, harassment, threats',
      color: 'bg-orange-100 text-orange-700 border-orange-200',
      examples: ['Physical assault', 'Sexual harassment', 'Domestic violence', 'Stalking']
    },
    {
      title: 'Missing Person',
      icon: <Phone className="h-5 w-5" />,
      description: 'Missing family members or friends',
      color: 'bg-purple-100 text-purple-700 border-purple-200',
      examples: ['Missing child', 'Missing adult', 'Kidnapping', 'Abduction']
    }
  ];

  const handleCategorySelect = (category: string) => {
    setIsOpen(false);
    setCurrentStep('main');
    onNavigate('file-fir');
  };

  const renderMainMenu = () => (
    <div className="space-y-4">
      <div className="text-center">
        <div className="bg-gradient-to-r from-orange-600 to-blue-600 p-2 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
          <Bot className="h-6 w-6 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Virtual Assistant</h3>
        <p className="text-sm text-gray-600">I'm here to help you navigate the FIR filing process</p>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => setCurrentStep('crime-types')}
          className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <FileText className="h-5 w-5 text-blue-600" />
            <div>
              <div className="font-medium text-gray-900">Select Crime Category</div>
              <div className="text-sm text-gray-600">Choose the right domain for your FIR</div>
            </div>
          </div>
        </button>

        <button
          onClick={() => onNavigate('chatbot')}
          className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <MessageCircle className="h-5 w-5 text-green-600" />
            <div>
              <div className="font-medium text-gray-900">Chat with AI Assistant</div>
              <div className="text-sm text-gray-600">Get detailed guidance and help</div>
            </div>
          </div>
        </button>

        <button
          onClick={() => setCurrentStep('guidance')}
          className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <HelpCircle className="h-5 w-5 text-purple-600" />
            <div>
              <div className="font-medium text-gray-900">General Guidance</div>
              <div className="text-sm text-gray-600">Learn about the FIR process</div>
            </div>
          </div>
        </button>

        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-red-900">Emergency?</span>
          </div>
          <p className="text-xs text-red-800 mb-2">For immediate help, call:</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white p-2 rounded border">
              <div className="font-medium">Police: 100</div>
            </div>
            <div className="bg-white p-2 rounded border">
              <div className="font-medium">Cyber: 1930</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCrimeTypes = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <button
          onClick={() => setCurrentStep('main')}
          className="text-gray-500 hover:text-gray-700"
        >
          ←
        </button>
        <h3 className="text-lg font-semibold text-gray-900">Select Crime Category</h3>
      </div>

      <div className="space-y-3">
        {crimeCategories.map((category, index) => (
          <button
            key={index}
            onClick={() => handleCategorySelect(category.title)}
            className={`w-full text-left p-4 rounded-lg border transition-all hover:shadow-md ${category.color}`}
          >
            <div className="flex items-start space-x-3">
              {category.icon}
              <div className="flex-1">
                <div className="font-medium mb-1">{category.title}</div>
                <div className="text-sm opacity-80 mb-2">{category.description}</div>
                <div className="text-xs opacity-70">
                  Examples: {category.examples.slice(0, 2).join(', ')}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <p className="text-xs text-gray-600">
          💡 <strong>Tip:</strong> Selecting the right category helps us provide more accurate guidance and ensures your FIR reaches the appropriate department.
        </p>
      </div>
    </div>
  );

  const renderGuidance = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <button
          onClick={() => setCurrentStep('main')}
          className="text-gray-500 hover:text-gray-700"
        >
          ←
        </button>
        <h3 className="text-lg font-semibold text-gray-900">FIR Filing Guidance</h3>
      </div>

      <div className="space-y-3">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 className="font-medium text-blue-900 mb-2">What is an FIR?</h4>
          <p className="text-sm text-blue-800">
            A First Information Report (FIR) is a written document prepared by police when they receive information about a cognizable offense.
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <h4 className="font-medium text-green-900 mb-2">When to File an FIR?</h4>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• When a cognizable offense has occurred</li>
            <li>• For crimes like theft, fraud, assault, etc.</li>
            <li>• As soon as possible after the incident</li>
          </ul>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <h4 className="font-medium text-orange-900 mb-2">Information Needed</h4>
          <ul className="text-sm text-orange-800 space-y-1">
            <li>• Date, time, and place of incident</li>
            <li>• Detailed description of what happened</li>
            <li>• Names of accused (if known)</li>
            <li>• Witness information</li>
          </ul>
        </div>

        <button
          onClick={() => onNavigate('file-fir')}
          className="w-full bg-gradient-to-r from-orange-600 to-blue-600 text-white py-3 px-4 rounded-lg hover:from-orange-700 hover:to-blue-700 transition-all font-medium"
        >
          Start Filing FIR
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Floating Assistant Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-gradient-to-r from-orange-600 to-blue-600 text-white p-4 rounded-full shadow-2xl hover:from-orange-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-110"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
        </button>
        
        {!isOpen && (
          <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-lg p-3 border border-gray-200 max-w-xs">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-orange-600 to-blue-600 p-1 rounded-full">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Need help?</div>
                <div className="text-xs text-gray-600">Click to get guidance</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Assistant Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-hidden">
          <div className="p-4 h-full overflow-y-auto">
            {currentStep === 'main' && renderMainMenu()}
            {currentStep === 'crime-types' && renderCrimeTypes()}
            {currentStep === 'guidance' && renderGuidance()}
          </div>
        </div>
      )}
    </>
  );
};

export default VirtualAssistant; 