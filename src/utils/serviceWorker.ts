/**
 * Service worker registration utility
 */

export const registerServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    try {
      // First, unregister any existing service worker to force refresh
      await unregisterAllServiceWorkers();
      
      // Then register the service worker again
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none' // Prevent the browser from using cached service worker
      });
      
      // Force update check
      registration.update();
      
      if (registration.installing) {
        console.log('Service worker installing');
      } else if (registration.waiting) {
        console.log('Service worker installed');
        // Force the waiting service worker to become active
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      } else if (registration.active) {
        console.log('Service worker active');
        // Force reload to ensure we're using the latest version
        registration.update();
      }
      
      // Listen for updates and reload the page
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('New service worker activated, reloading page');
        window.location.reload();
      });
    } catch (error) {
      console.error(`Service worker registration failed: ${error}`);
    }
  } else {
    console.log('Service workers are not supported by this browser');
  }
};

// Helper function to unregister all service workers
const unregisterAllServiceWorkers = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
        console.log('Service worker unregistered');
      }
      
      // Clear all caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => {
            console.log(`Deleting cache: ${cacheName}`);
            return caches.delete(cacheName);
          })
        );
        console.log('All caches cleared');
      }
    } catch (error) {
      console.error(`Failed to unregister service workers: ${error}`);
    }
  }
};

export const unregisterServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const unregistered = await registration.unregister();
        if (unregistered) {
          console.log('Service worker unregistered successfully');
        }
      }
    } catch (error) {
      console.error(`Service worker unregistration failed: ${error}`);
    }
  }
};
