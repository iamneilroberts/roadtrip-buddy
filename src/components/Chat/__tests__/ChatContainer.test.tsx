import { render, screen, act } from '@testing-library/react';
import { ChatProvider } from '../../../context/ChatContext';
import ChatContainer from '../ChatContainer';

// Mock the useChat hook
jest.mock('../../../hooks/useChat', () => ({
  __esModule: true,
  useChat: jest.fn().mockImplementation(() => ({
    messages: [],
    isLoading: false,
    error: null,
    sendMessage: jest.fn(),
    clearMessages: jest.fn()
  }))
}));

// Mock the ChatMessage component to avoid react-markdown issues
jest.mock('../ChatMessage', () => {
  return {
    __esModule: true,
    default: ({ message }: { message: { id: string; role: string; content: string; timestamp: number } }) => <div>{message.content}</div>
  };
});

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

describe('ChatContainer', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });
  
  it('should render welcome messages when no messages exist', async () => {
    // Mock useChat to return empty messages
    const useChat = require('../../../hooks/useChat').useChat;
    useChat.mockImplementationOnce(() => ({
      messages: [],
      isLoading: false,
      error: null,
      sendMessage: jest.fn(),
      clearMessages: jest.fn()
    }));
    
    await act(async () => {
      render(
        <ChatProvider>
          <ChatContainer />
        </ChatProvider>
      );
    });
    
    // Check that welcome messages are displayed
    expect(screen.getByText(/Welcome to Roadtrip Buddy/i)).toBeInTheDocument();
    expect(screen.getByText(/Ask for recommendations/i)).toBeInTheDocument();
  });
  
  it('should render messages when they exist', async () => {
    // Mock useChat to return some messages
    const useChat = require('../../../hooks/useChat').useChat;
    useChat.mockImplementationOnce(() => ({
      messages: [
        { id: '1', role: 'user', content: 'Hello', timestamp: Date.now() - 1000 },
        { id: '2', role: 'assistant', content: 'Hi there!', timestamp: Date.now() }
      ],
      isLoading: false,
      error: null,
      sendMessage: jest.fn(),
      clearMessages: jest.fn()
    }));
    
    await act(async () => {
      render(
        <ChatProvider>
          <ChatContainer />
        </ChatProvider>
      );
    });
    
    // Check that messages are displayed
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Hi there!')).toBeInTheDocument();
  });
  
  it('should show loading spinner when loading', async () => {
    // Mock useChat to indicate loading
    const useChat = require('../../../hooks/useChat').useChat;
    useChat.mockImplementationOnce(() => ({
      messages: [],
      isLoading: true,
      error: null,
      sendMessage: jest.fn(),
      clearMessages: jest.fn()
    }));
    
    await act(async () => {
      render(
        <ChatProvider>
          <ChatContainer />
        </ChatProvider>
      );
    });
    
    // Check that loading spinner is displayed - look for the container div instead
    const loadingContainer = screen.getByTestId('loading-container');
    expect(loadingContainer).toBeInTheDocument();
  });
  
  it('should show error message when error exists', async () => {
    // Mock useChat to return an error
    const useChat = require('../../../hooks/useChat').useChat;
    useChat.mockImplementationOnce(() => ({
      messages: [],
      isLoading: false,
      error: 'Something went wrong',
      sendMessage: jest.fn(),
      clearMessages: jest.fn()
    }));
    
    await act(async () => {
      render(
        <ChatProvider>
          <ChatContainer />
        </ChatProvider>
      );
    });
    
    // Check that error message is displayed
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
});
