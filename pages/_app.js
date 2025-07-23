import '../styles/globals.css';
import { useEffect } from 'react';

export default function App({ Component, pageProps }) {
  // Hydrate theme from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('theme');
    if (stored === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <Component {...pageProps} />
    </div>
  );
} 