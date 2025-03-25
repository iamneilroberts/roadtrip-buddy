import React, { useEffect, useRef, useState } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import LoadingSpinner from '../LoadingSpinner';
import { useChat } from '../../hooks/useChat';
import { getPromptById, getSelectedPromptId } from '../../utils/promptManager';

interface ChatContainerProps {
  selectedPromptId?: string;
}

const ChatContainer: React.FC<ChatContainerProps> = ({ selectedPromptId: propSelectedPromptId }) => {
  const { messages, isLoading, error, sendMessage } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [effectivePromptId, setEffectivePromptId] = useState<string>('');
  
  // Use the prop if provided, otherwise get from localStorage
  useEffect(() => {
    const promptId = propSelectedPromptId || getSelectedPromptId();
    setEffectivePromptId(promptId);
  }, [propSelectedPromptId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Get the selected prompt name for display
  const selectedPrompt = effectivePromptId ? getPromptById(effectivePromptId) : null;
  
  // Get the prompt file name
  const getPromptFileName = (promptId: string) => {
    return `${promptId}.prompt.md`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages container */}
      <div className="flex-grow overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <h3 className="text-xl font-semibold mb-2">Welcome to Roadtrip Buddy!</h3>
              <p>Ask for recommendations for places to eat, attractions to visit, or services you need.</p>
              {selectedPrompt && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-sm font-medium text-blue-700">Using prompt: {selectedPrompt.name} ({getPromptFileName(selectedPrompt.id)})</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {selectedPrompt && messages.length > 0 && (
              <div className="mb-4 p-2 bg-gray-100 rounded text-xs text-gray-600">
                Using prompt: {selectedPrompt.name} ({getPromptFileName(selectedPrompt.id)})
              </div>
            )}
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
          </>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-2" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {isLoading && (
          <div className="flex justify-center my-4" data-testid="loading-container">
            <LoadingSpinner size="medium" color="gray" />
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input container */}
      <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
    </div>
  );
};

export default ChatContainer;
