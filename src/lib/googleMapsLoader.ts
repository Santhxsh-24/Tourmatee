declare global {
   interface Window {
     google?: any;
   }

   // Minimal declaration so we can use `typeof google` in this module
   // without pulling in full @types/google.maps immediately.
   // eslint-disable-next-line @typescript-eslint/no-namespace
   namespace google {
     const maps: any;
   }
 }

let googleMapsPromise: Promise<typeof google> | null = null;

export function loadGoogleMaps(): Promise<typeof google> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Maps can only be loaded in the browser'));
  }

  if (window.google && (window.google as any).maps) {
    return Promise.resolve(window.google as typeof google);
  }

  if (!googleMapsPromise) {
    googleMapsPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector<HTMLScriptElement>('script[data-google-maps-loader="true"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => {
          if (window.google && (window.google as any).maps) {
            resolve(window.google as typeof google);
          } else {
            reject(new Error('Google Maps SDK loaded but google.maps is undefined'));
          }
        });
        existingScript.addEventListener('error', () => reject(new Error('Failed to load Google Maps SDK')));
        return;
      }

      const apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
      if (!apiKey) {
        reject(new Error('Missing VITE_GOOGLE_MAPS_API_KEY environment variable'));
        return;
      }

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.defer = true;
      script.dataset.googleMapsLoader = 'true';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places`;

      script.onload = () => {
        if (window.google && (window.google as any).maps) {
          resolve(window.google as typeof google);
        } else {
          reject(new Error('Google Maps SDK loaded but google.maps is undefined'));
        }
      };

      script.onerror = () => {
        reject(new Error('Failed to load Google Maps SDK'));
      };

      document.head.appendChild(script);
    });
  }

  return googleMapsPromise;
}
