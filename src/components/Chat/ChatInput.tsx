import React, { useState } from 'react';
import LoadingSpinner from '../LoadingSpinner';

interface ChatInputProps {
  onSendMessage: (message: string, mode: 'quick' | 'detailed') => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState('');
  const [mode, setMode] = useState<'quick' | 'detailed'>('detailed');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message, mode);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-full p-4 border-t border-gray-200">
      <div className="flex justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Mode:</span>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                mode === 'quick' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-transparent text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setMode('quick')}
            >
              Quick
            </button>
            <button
              type="button"
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                mode === 'detailed' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-transparent text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setMode('detailed')}
            >
              Detailed
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex items-center">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
          disabled={isLoading || !message.trim()}
        >
          {isLoading ? (
            <span className="flex items-center">
              <LoadingSpinner size="small" color="white" className="mr-2" />
              Sending...
            </span>
          ) : (
            'Send'
          )}
        </button>
      </div>
    </form>
  );
};

export default ChatInput;
