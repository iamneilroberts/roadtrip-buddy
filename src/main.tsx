import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'
import { registerServiceWorker } from './utils/serviceWorker'

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// Clear browser cache before registering service worker
const clearBrowserCache = async () => {
  // Add a version parameter to force cache refresh
  const version = new Date().getTime();
  
  // Add version to localStorage to detect changes
  const lastVersion = localStorage.getItem('app-version');
  if (lastVersion !== version.toString()) {
    console.log('New version detected, clearing cache...');
    localStorage.setItem('app-version', version.toString());
    
    // Clear application cache
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('Application cache cleared');
      } catch (error) {
        console.error('Failed to clear cache:', error);
      }
    }
    
    // Force reload if this isn't the first load
    if (lastVersion) {
      window.location.reload();
    }
  }
};

// Clear cache and register service worker
clearBrowserCache().then(() => {
  registerServiceWorker();
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
