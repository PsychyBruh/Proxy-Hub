import BackendCard from '../components/BackendCard';
import Head from 'next/head';
import { useEffect, useState } from 'react';

export async function getServerSideProps() {
  const fs = require('fs');
  const path = require('path');
  const file = path.join(process.cwd(), 'backends.json');

  let data;
  if (!fs.existsSync(file)) {
    data = [
      {
        name: 'Google',
        url: 'https://www.google.com',
        logo: '/logos/default.png',
        clicks: 0,
      },
      {
        name: 'YouTube',
        url: 'https://www.youtube.com',
        logo: '/logos/default.png',
        clicks: 0,
      },
    ];
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  } else {
    data = JSON.parse(fs.readFileSync(file, 'utf-8'));
  }

  return { props: { backends: data } };
}

export default function Home({ backends }) {
  const [showWelcome, setShowWelcome] = useState(true);
  const [overlayFade, setOverlayFade] = useState(false);
  const [showCards, setShowCards] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setOverlayFade(true); // start fade animation
    }, 3000); // wait 3s before fading

    const hideTimer = setTimeout(() => {
      setShowWelcome(false); // remove overlay
      setShowCards(true); // reveal cards
    }, 3500); // 0.5s after fade starts (matches fade-out-slow duration)

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  const handleThemeToggle = () => {
    const root = document.documentElement;
    const isDark = root.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  };

  return (
    <>
      <Head>
        <title>Proxy Hub</title>
      </Head>
      <header className="flex items-center justify-between px-6 py-4 bg-indigo-600 text-white dark:bg-indigo-700">
        <h1 className="text-xl font-semibold">Proxy Hub</h1>
        <div className="space-x-3">
          <a
            href="/admin"
            className="bg-white text-indigo-600 font-medium px-3 py-1 rounded hover:bg-gray-200"
          >
            Admin
          </a>
          <button
            onClick={handleThemeToggle}
            className="bg-white text-indigo-600 font-medium px-3 py-1 rounded"
          >
            Toggle Theme
          </button>
        </div>
      </header>

      {/* Welcome Screen */}
      {showWelcome && (
        <div
          className={
            'fixed inset-0 flex flex-col items-center justify-center bg-indigo-600 text-white z-50 ' +
            (overlayFade ? 'animate-fade-out-slow' : '')
          }
        >
          <h2 className="text-3xl font-bold mb-2">Proxy Hub</h2>
          <p className="mb-2">Loading...</p>
        </div>
      )}

      <main className="max-w-6xl mx-auto p-6 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {backends.map((b, idx) => (
          <BackendCard key={b.name} backend={b} delay={idx * 100} show={showCards} />
        ))}
      </main>
    </>
  );
} 