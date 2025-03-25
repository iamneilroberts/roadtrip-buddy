import { Message } from '../context/ChatContext';

// Interface for the cached conversation
export interface CachedConversation {
  messages: Message[];
  timestamp: number;
}

// Interface for API message format
export interface ApiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Default token limits for different models
const MODEL_TOKEN_LIMITS: Record<string, number> = {
  'gpt-4o': 128000,
  'gpt-4': 8192,
  'gpt-3.5-turbo': 4096,
  'default': 4096
};

// Approximate token count for a string (rough estimate: 4 chars = 1 token)
export const estimateTokenCount = (text: string): number => {
  return Math.ceil(text.length / 4);
};

/**
 * Save conversation to local storage
 * @param conversationId Unique identifier for the conversation
 * @param messages Array of messages in the conversation
 */
export const saveConversation = (conversationId: string, messages: Message[]): void => {
  try {
    const conversation: CachedConversation = {
      messages,
      timestamp: Date.now()
    };
    
    localStorage.setItem(`conversation_${conversationId}`, JSON.stringify(conversation));
    
    // Update the conversation index
    const conversationIndex = getConversationIndex();
    if (!conversationIndex.includes(conversationId)) {
      conversationIndex.push(conversationId);
      localStorage.setItem('conversation_index', JSON.stringify(conversationIndex));
    }
  } catch (error) {
    console.error('Error saving conversation to cache:', error);
  }
};

/**
 * Load conversation from local storage
 * @param conversationId Unique identifier for the conversation
 * @returns The cached conversation or null if not found
 */
export const loadConversation = (conversationId: string): CachedConversation | null => {
  try {
    const cachedData = localStorage.getItem(`conversation_${conversationId}`);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    return null;
  } catch (error) {
    console.error('Error loading conversation from cache:', error);
    return null;
  }
};

/**
 * Get the index of all saved conversations
 * @returns Array of conversation IDs
 */
export const getConversationIndex = (): string[] => {
  try {
    const index = localStorage.getItem('conversation_index');
    return index ? JSON.parse(index) : [];
  } catch (error) {
    console.error('Error getting conversation index:', error);
    return [];
  }
};

/**
 * Delete a conversation from the cache
 * @param conversationId Unique identifier for the conversation
 */
export const deleteConversation = (conversationId: string): void => {
  try {
    localStorage.removeItem(`conversation_${conversationId}`);
    
    // Update the conversation index
    const conversationIndex = getConversationIndex().filter(id => id !== conversationId);
    localStorage.setItem('conversation_index', JSON.stringify(conversationIndex));
  } catch (error) {
    console.error('Error deleting conversation from cache:', error);
  }
};

/**
 * Clear all conversations from the cache
 */
export const clearAllConversations = (): void => {
  try {
    const conversationIndex = getConversationIndex();
    
    // Remove each conversation
    conversationIndex.forEach(id => {
      localStorage.removeItem(`conversation_${id}`);
    });
    
    // Clear the index
    localStorage.removeItem('conversation_index');
  } catch (error) {
    console.error('Error clearing all conversations from cache:', error);
  }
};

/**
 * Format messages for the API with token limit consideration
 * @param systemPrompt The system prompt to include
 * @param messages Array of conversation messages
 * @param model The AI model being used
 * @returns Array of formatted messages for the API
 */
export const formatMessagesForApi = (
  systemPrompt: string,
  messages: Message[],
  model: string = 'default'
): ApiMessage[] => {
  // Get the token limit for the specified model
  const tokenLimit = MODEL_TOKEN_LIMITS[model] || MODEL_TOKEN_LIMITS.default;
  
  // Calculate system prompt tokens
  const systemPromptTokens = estimateTokenCount(systemPrompt);
  
  // Reserve tokens for the system prompt and some buffer for the response
  const reservedTokens = systemPromptTokens + 1000; // 1000 tokens buffer for response
  const availableTokens = tokenLimit - reservedTokens;
  
  // Start with the system message
  const apiMessages: ApiMessage[] = [
    { role: 'system', content: systemPrompt }
  ];
  
  // Track used tokens
  let usedTokens = systemPromptTokens;
  
  // Add as many messages as possible within the token limit, starting from the most recent
  const reversedMessages = [...messages].reverse();
  
  for (const message of reversedMessages) {
    const messageContent = message.content;
    const messageTokens = estimateTokenCount(messageContent);
    
    // If adding this message would exceed the limit, stop
    if (usedTokens + messageTokens > availableTokens) {
      break;
    }
    
    // Add the message to the API messages array (at the beginning to maintain chronological order)
    apiMessages.push({
      role: message.role,
      content: messageContent
    });
    
    usedTokens += messageTokens;
  }
  
  // Sort messages to ensure chronological order (system first, then user/assistant in order)
  return [
    apiMessages[0], // System prompt always first
    ...apiMessages.slice(1).sort((a, b) => {
      // Find the original messages to compare timestamps
      const msgA = messages.find(m => m.content === a.content);
      const msgB = messages.find(m => m.content === b.content);
      
      if (msgA && msgB) {
        return msgA.timestamp - msgB.timestamp;
      }
      return 0;
    })
  ];
};
