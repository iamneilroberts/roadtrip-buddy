import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getRecommendation, apiEvents } from '../api/openai';
import { useLocation } from './LocationContext';
import { useDebug } from './DebugContext';
import { getOpenAIApiKey, hasOpenAIApiKey } from '../utils/env';
import { 
  saveConversation, 
  loadConversation
} from '../utils/conversationCache';

// Define message types
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  jsonData?: any; 
}

export interface RecommendationResponse {
  markdown: string;
  json: any;
}

// Define the context state type
interface ChatContextState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string, mode: 'quick' | 'detailed') => Promise<void>;
  clearMessages: () => void;
  lastResponse: RecommendationResponse | null;
}

// Create the context with default values
const ChatContext = createContext<ChatContextState>({
  messages: [],
  isLoading: false,
  error: null,
  sendMessage: async () => {},
  clearMessages: () => {},
  lastResponse: null,
});

// Props for the ChatProvider component
interface ChatProviderProps {
  children: ReactNode;
  apiKey?: string;
}

// Helper to generate a unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Current conversation ID
const CURRENT_CONVERSATION_ID = 'current';

// Define the location context type with history
type LocationContextType = {
  currentLocation?: { lat: number; lng: number };
  destination?: { lat: number; lng: number };
  locationHistory?: { lat: number; lng: number; timestamp?: number; accuracy?: number }[];
  currentTime: string;
  mode?: 'quick' | 'detailed';
  conversationHistory?: string;
};

// ChatProvider component to wrap the app with chat context
export const ChatProvider: React.FC<ChatProviderProps> = ({ children, apiKey = '' }) => {
  // State for chat data
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<RecommendationResponse | null>(null);
  
  // Get location context
  const { currentLocation, destination, locationHistory } = useLocation();
  
  // Get debug context
  const { addLog } = useDebug();
  
  // Get API key from props or environment
  const getApiKey = () => {
    if (apiKey) return apiKey;
    return getOpenAIApiKey();
  };

  // Load messages from local storage on mount
  useEffect(() => {
    const cachedConversation = loadConversation(CURRENT_CONVERSATION_ID);
    if (cachedConversation) {
      setMessages(cachedConversation.messages);
    } else {
      const savedMessages = localStorage.getItem('chatMessages');
      if (savedMessages) {
        try {
          const parsedMessages = JSON.parse(savedMessages);
          setMessages(parsedMessages);
          // Migrate old format to new cache format
          saveConversation(CURRENT_CONVERSATION_ID, parsedMessages);
        } catch (e) {
          console.error('Error parsing saved messages:', e);
        }
      }
    }
  }, []);

  // Save messages to local storage when they change
  useEffect(() => {
    saveConversation(CURRENT_CONVERSATION_ID, messages);
  }, [messages]);
  
  // Set up API event listeners for debugging
  useEffect(() => {
    const requestHandler = (data: any) => {
      addLog({ type: 'request', data });
    };
    
    const responseHandler = (data: any) => {
      addLog({ type: 'response', data });
    };
    
    const errorHandler = (data: any) => {
      addLog({ type: 'error', data });
    };
    
    // Register event listeners
    apiEvents.on('request', requestHandler);
    apiEvents.on('response', responseHandler);
    apiEvents.on('error', errorHandler);
    
    // Clean up event listeners on unmount
    return () => {
      // No built-in way to remove listeners in our simple event emitter,
      // but in a real app, we would remove them here
    };
  }, [addLog]);

  // Function to send a message
  const sendMessage = async (content: string, mode: 'quick' | 'detailed') => {
    if (!content.trim()) return;
    
    // Check if API key is available
    if (!hasOpenAIApiKey() && !apiKey) {
      setError('OpenAI API key is required. Please set it in the settings.');
      return;
    }

    // Add user message to the chat
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };
    
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsLoading(true);
    setError(null);
    
    try {
      // Get the current time in the user's timezone
      const currentTime = new Date().toLocaleString();
      
      // Create the location context object
      const locationContextObj: LocationContextType = {
        currentLocation: currentLocation || undefined,
        destination: destination || undefined,
        locationHistory: locationHistory.length > 0 ? locationHistory : undefined,
        currentTime,
        mode, // Add mode to the location context
        // Add conversation history summary
        conversationHistory: messages.length > 0 
          ? messages
              .slice(-5) // Get the last 5 messages
              .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content.substring(0, 150)}${m.content.length > 150 ? '...' : ''}`)
              .join('\n\n')
          : undefined
      };
      
      // Log the request to the debug panel
      addLog({
        type: 'request',
        data: {
          prompt: content,
          locationContext: locationContextObj
        }
      });
      
      // Call the OpenAI API with the full message history
      const response = await getRecommendation(
        content,
        locationContextObj,
        mode,
        getApiKey(),
        messages // Pass the full message history
      );
      
      // Log the raw API response
      addLog({
        type: 'response',
        data: response
      });
      
      // Create a new assistant message with the response
      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: response.markdown,
        timestamp: Date.now(),
        jsonData: response.json, 
      };
      
      // Log the parsed response
      addLog({
        type: 'parsed',
        data: {
          markdown: response.markdown,
          json: response.json
        }
      });
      
      const updatedMessages = [...messages, assistantMessage];
      setMessages(updatedMessages);
      setLastResponse(response);
      setIsLoading(false);
      
      // Save the updated conversation to the cache
      saveConversation(CURRENT_CONVERSATION_ID, updatedMessages);
      
      // Save JSON data to localStorage for future reference
      try {
        const savedJsonData = localStorage.getItem('chatJsonData') || '{}';
        const jsonDataStore = JSON.parse(savedJsonData);
        jsonDataStore[assistantMessage.id] = response.json;
        localStorage.setItem('chatJsonData', JSON.stringify(jsonDataStore));
      } catch (e) {
        console.error('Error saving JSON data:', e);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to get a response. Please try again.');
      
      // Log the error
      addLog({
        type: 'error',
        data: error
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to clear all messages
  const clearMessages = () => {
    setMessages([]);
    setLastResponse(null);
    localStorage.removeItem('chatMessages');
    localStorage.removeItem('chatJsonData');
    // Clear the current conversation from the cache
    saveConversation(CURRENT_CONVERSATION_ID, []);
  };

  // Provide the context value
  const contextValue: ChatContextState = {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    lastResponse,
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

// Custom hook to use the chat context
export const useChat = () => useContext(ChatContext);

export default ChatContext;
