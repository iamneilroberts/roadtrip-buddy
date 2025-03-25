import axios from 'axios';
import { getPromptById, getSelectedPromptId, formatPrompt } from '../utils/promptManager';
import { formatMessagesForApi } from '../utils/conversationCache';
import { Message } from '../context/ChatContext';

// Define the OpenAI API response types
interface OpenAIChoice {
  index: number;
  message: {
    role: string;
    content: string;
  };
  finish_reason: string;
}

interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: OpenAIChoice[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface ResponseSections {
  markdown: string;
  json: any;
}

// Event emitter for API debugging
export const apiEvents = {
  listeners: new Map<string, Function[]>(),
  
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  },
  
  emit(event: string, data: any) {
    if (this.listeners.has(event)) {
      this.listeners.get(event)?.forEach(callback => callback(data));
    }
  }
};

// Configuration for the OpenAI API
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o';

/**
 * Sends a request to the OpenAI API
 * @param prompt The user's message
 * @param locationContext The user's location context
 * @param mode The response mode (quick or detailed)
 * @param apiKey The OpenAI API key
 * @param previousMessages Previous messages in the conversation
 * @returns The parsed response with markdown and JSON sections
 */
export const getRecommendation = async (
  prompt: string,
  locationContext: {
    currentLocation?: { lat: number; lng: number };
    destination?: { lat: number; lng: number };
    locationHistory?: { lat: number; lng: number; timestamp?: number }[];
    currentTime: string;
    conversationHistory?: string;
  },
  mode: 'quick' | 'detailed',
  apiKey: string,
  previousMessages: Message[] = []
): Promise<ResponseSections> => {
  try {
    // Get the selected prompt
    const selectedPromptId = getSelectedPromptId();
    const selectedPrompt = getPromptById(selectedPromptId);
    
    if (!selectedPrompt) {
      throw new Error(`System prompt with ID "${selectedPromptId}" not found`);
    }
    
    // Format the system message with the user's context
    const systemMessage = formatPrompt(selectedPrompt.content, {
      ...locationContext,
      mode
    });

    // Format messages for the API with token limit consideration
    const messages = formatMessagesForApi(
      systemMessage,
      previousMessages,
      MODEL
    );
    
    // Add the current user message if not already included
    if (!messages.some(m => m.role === 'user' && m.content === prompt)) {
      messages.push({ role: 'user', content: prompt });
    }

    // Create the request payload
    const requestPayload = {
      model: MODEL,
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000
    };
    
    // Emit request event for debugging
    apiEvents.emit('request', {
      url: OPENAI_API_URL,
      method: 'POST',
      prompt,
      mode,
      systemMessage,
      payload: requestPayload
    });

    // Make the API request
    const response = await axios.post<OpenAIResponse>(
      OPENAI_API_URL,
      requestPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );
    
    // Emit response event for debugging
    apiEvents.emit('response', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers
    });

    // Parse the response to extract markdown and JSON sections
    const result = parseResponse(response.data.choices[0].message.content);
    
    // Emit parsed result for debugging
    apiEvents.emit('parsed', result);
    
    return result;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    
    // Emit error event for debugging
    apiEvents.emit('error', {
      message: error instanceof Error ? error.message : 'Unknown error',
      error
    });
    
    throw error;
  }
};

/**
 * Parses the OpenAI response to extract markdown and JSON sections
 * @param content The response content
 * @returns The parsed markdown and JSON sections
 */
const parseResponse = (content: string): ResponseSections => {
  // Extract the markdown section
  const markdownMatch = content.match(/## MARKDOWN_CONTENT\s+([\s\S]*?)(?=## JSON_DATA|$)/);
  const markdown = markdownMatch ? markdownMatch[1].trim() : content;

  // Extract the JSON section
  const jsonMatch = content.match(/## JSON_DATA\s+({[\s\S]*})/);
  let json = null;
  
  if (jsonMatch) {
    try {
      json = JSON.parse(jsonMatch[1].trim());
    } catch (error) {
      console.error('Error parsing JSON from OpenAI response:', error);
    }
  }

  return { markdown, json };
};
