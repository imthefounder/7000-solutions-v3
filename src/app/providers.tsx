'use client';

import { SessionProvider } from 'next-auth/react';
import { useEffect } from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
  // Register the service worker for offline (PWA) support
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Service worker registration is optional; never block the app
      });
    }
  }, []);

  return <SessionProvider>{children}</SessionProvider>;
}
