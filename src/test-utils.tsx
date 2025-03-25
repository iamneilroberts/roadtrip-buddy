import React from 'react';
import { render as rtlRender, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LocationProvider } from './context/LocationContext';
import { ChatProvider } from './context/ChatContext';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: 0,
      staleTime: 0,
      refetchOnWindowFocus: false,
    },
  },
});

// Create a custom render function that includes our providers
function render(
  ui: React.ReactElement,
  { 
    queryClient: queryClientProp = queryClient,
    locationProviderProps = {},
    chatProviderProps = {},
    ...renderOptions 
  } = {}
) {
  const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <QueryClientProvider client={queryClientProp}>
      <LocationProvider {...locationProviderProps}>
        <ChatProvider {...chatProviderProps}>
          {children}
        </ChatProvider>
      </LocationProvider>
    </QueryClientProvider>
  );

  return rtlRender(ui, { wrapper: AllTheProviders, ...renderOptions });
}

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { render, screen, waitFor };

// Export providers
export { LocationProvider, ChatProvider };

// Export query client
export { queryClient };

// Export mock data types
export interface MockLocationContext {
  currentLocation?: {
    lat: number;
    lng: number;
    accuracy?: number;
    timestamp?: number;
  };
  destination?: {
    lat: number;
    lng: number;
  };
  error?: Error;
  isLoading?: boolean;
  isWatching?: boolean;
  isSimulating?: boolean;
  simulationSpeed?: number;
  startWatching?: () => void;
  stopWatching?: () => void;
  startSimulation?: (route?: string) => void;
  stopSimulation?: () => void;
}

export interface MockChatContext {
  messages?: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
  }>;
  isLoading?: boolean;
  error?: string;
  apiKey?: string;
}
