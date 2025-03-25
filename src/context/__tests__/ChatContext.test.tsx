import { render, screen, act, waitFor } from '@testing-library/react';
import { ChatProvider, useChat } from '../ChatContext';
import { getRecommendation } from '../../api/openai';

// Mock the OpenAI API
jest.mock('../../api/openai');

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Create a test component that uses the chat context
const TestComponent = () => {
  const { 
    messages, 
    isLoading, 
    error, 
    sendMessage, 
    clearMessages 
  } = useChat();

  return (
    <div>
      <div data-testid="loading-state">{isLoading ? 'Loading' : 'Not Loading'}</div>
      
      <div data-testid="message-count">{messages.length}</div>
      
      {messages.map((message, index) => (
        <div key={index} data-testid={`message-${index}`}>
          {message.content}
        </div>
      ))}
      
      {error && (
        <div data-testid="error">{error}</div>
      )}
      
      <button 
        data-testid="send-message-btn" 
        onClick={async () => {
          try {
            await sendMessage('Hello, world!', 'quick');
          } catch (error) {
            console.error('Error sending message:', error);
          }
        }}
      >
        Send Message
      </button>
      
      <button 
        data-testid="clear-messages-btn" 
        onClick={clearMessages}
      >
        Clear Messages
      </button>
    </div>
  );
};

describe('ChatContext', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Clear localStorage
    localStorageMock.clear();
    
    // Mock implementation for getRecommendation
    (getRecommendation as jest.Mock).mockImplementation(() => {
      return Promise.resolve({
        markdown: '# Test Recommendation',
        json: {
          places: [
            {
              name: 'Test Place',
              description: 'A test place',
              location: { lat: 37.7749, lng: -122.4194 }
            }
          ]
        }
      });
    });
  });
  
  it('should initialize with empty messages', async () => {
    await act(async () => {
      render(
        <ChatProvider apiKey="test-api-key">
          <TestComponent />
        </ChatProvider>
      );
    });
    
    // Check initial states
    expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
    expect(screen.getByTestId('message-count')).toHaveTextContent('0');
  });
  
  it('should send a message and receive a response', async () => {
    await act(async () => {
      render(
        <ChatProvider apiKey="test-api-key">
          <TestComponent />
        </ChatProvider>
      );
    });
    
    // Send a message
    await act(async () => {
      screen.getByTestId('send-message-btn').click();
    });
    
    // Check that loading state is updated
    expect(screen.getByTestId('loading-state')).toHaveTextContent('Loading');
    
    // Wait for the response
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
    }, { timeout: 3000 });
    
    // Check that messages are updated
    expect(screen.getByTestId('message-count')).toHaveTextContent('2');
    expect(screen.getByTestId('message-0')).toHaveTextContent('Hello, world!');
    expect(screen.getByTestId('message-1')).toHaveTextContent('# Test Recommendation');
    
    // Check that getRecommendation was called
    expect(getRecommendation).toHaveBeenCalledTimes(1);
    expect(getRecommendation).toHaveBeenCalledWith(
      'Hello, world!',
      expect.any(Object),
      'quick',
      'test-api-key'
    );
  });
  
  it('should handle API errors', async () => {
    // Mock getRecommendation to throw an error
    (getRecommendation as jest.Mock).mockImplementation(() => {
      throw new Error('API error');
    });
    
    await act(async () => {
      render(
        <ChatProvider apiKey="test-api-key">
          <TestComponent />
        </ChatProvider>
      );
    });
    
    // Send a message
    await act(async () => {
      screen.getByTestId('send-message-btn').click();
    });
    
    // Wait for the error
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
    }, { timeout: 3000 });
    
    // Check that error is displayed with the correct error message from ChatContext
    expect(screen.getByTestId('error')).toHaveTextContent('Failed to get a response. Please try again.');
    
    // Check that messages still contain the user message
    expect(screen.getByTestId('message-count')).toHaveTextContent('1');
    expect(screen.getByTestId('message-0')).toHaveTextContent('Hello, world!');
  });
  
  it('should handle missing API key', async () => {
    await act(async () => {
      render(
        <ChatProvider apiKey="">
          <TestComponent />
        </ChatProvider>
      );
    });
    
    // Send a message
    await act(async () => {
      screen.getByTestId('send-message-btn').click();
    });
    
    // Check that error is displayed
    expect(screen.getByTestId('error')).toHaveTextContent('API key is required');
    
    // Check that getRecommendation was not called
    expect(getRecommendation).not.toHaveBeenCalled();
  });
  
  it('should clear messages', async () => {
    await act(async () => {
      render(
        <ChatProvider apiKey="test-api-key">
          <TestComponent />
        </ChatProvider>
      );
    });
    
    // Send a message
    await act(async () => {
      screen.getByTestId('send-message-btn').click();
    });
    
    // Wait for the response
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
    });
    
    // Check that messages are updated
    expect(screen.getByTestId('message-count')).toHaveTextContent('2');
    
    // Clear messages
    await act(async () => {
      screen.getByTestId('clear-messages-btn').click();
    });
    
    // Check that messages are cleared
    expect(screen.getByTestId('message-count')).toHaveTextContent('0');
  });
  
  it('should load messages from localStorage on mount', async () => {
    // Set messages in localStorage
    localStorageMock.setItem('chatMessages', JSON.stringify([
      { 
        id: '1', 
        role: 'user', 
        content: 'Test message',
        timestamp: Date.now() - 1000
      },
      { 
        id: '2', 
        role: 'assistant', 
        content: 'Test response',
        timestamp: Date.now()
      }
    ]));
    
    await act(async () => {
      render(
        <ChatProvider apiKey="test-api-key">
          <TestComponent />
        </ChatProvider>
      );
    });
    
    // Check that messages are loaded
    expect(screen.getByTestId('message-count')).toHaveTextContent('2');
    expect(screen.getByTestId('message-0')).toHaveTextContent('Test message');
    expect(screen.getByTestId('message-1')).toHaveTextContent('Test response');
  });
});
