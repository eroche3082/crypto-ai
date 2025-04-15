import { useEffect, useState } from 'react';

const ServiceWorkerManager = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Register service worker only if the browser supports it
    if ('serviceWorker' in navigator) {
      // When a new service worker is available, show update notification
      const handleServiceWorkerUpdate = (reg: ServiceWorkerRegistration) => {
        if (reg.waiting) {
          setUpdateAvailable(true);
          setRegistration(reg);
        }
      };

      // Create channel for service worker updates
      const channel = new BroadcastChannel('service-worker-updates');
      channel.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
          setUpdateAvailable(true);
        }
      });

      // Check for service worker updates every 60 minutes
      const interval = setInterval(() => {
        navigator.serviceWorker.getRegistration().then((reg) => {
          if (reg) {
            reg.update().catch(console.error);
          }
        });
      }, 60 * 60 * 1000);

      return () => {
        channel.close();
        clearInterval(interval);
      };
    }
  }, []);

  const handleUpdate = () => {
    if (registration && registration.waiting) {
      // Send message to service worker to skip waiting
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Reload page to get the new version
      window.location.reload();
    }
  };

  if (!updateAvailable) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-primary text-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
      <h3 className="font-semibold text-lg mb-2">Update Available</h3>
      <p className="mb-3">A new version of CryptoPulse is available. Update now for the latest features and improvements.</p>
      <button 
        onClick={handleUpdate}
        className="bg-white text-primary font-medium px-4 py-2 rounded hover:bg-opacity-90 transition-all"
      >
        Update Now
      </button>
    </div>
  );
};

export default ServiceWorkerManager;