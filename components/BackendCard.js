import { useState, useRef } from 'react';

export default function BackendCard({ backend, delay, show }) {
  const [transform, setTransform] = useState('');
  const ref = useRef(null);

  const handleMouseMove = (e) => {
    const card = ref.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within card
    const y = e.clientY - rect.top; // y position within card
    const rotateY = ((x / rect.width) - 0.5) * 15; // degrees
    const rotateX = ((y / rect.height) - 0.5) * -15;
    setTransform(`perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
  };

  const reset = () => setTransform('');

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={reset}
      className={
        'card-tilt bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 transform transition ' +
        'duration-200 ease-out fly-in' + (show ? ' fly-in-visible' : '')
      }
      style={{
        transform: transform || undefined,
        transitionDelay: show ? undefined : `${delay}ms`,
      }}
    >
      <img
        src={backend.logo}
        alt={backend.name + ' logo'}
        className="h-24 mx-auto object-contain mb-4"
      />
      <h3 className="text-center text-lg font-semibold mb-2 dark:text-white">
        {backend.name}
      </h3>
      <a
        href={`/api/open?name=${encodeURIComponent(backend.name)}`}
        target="_blank"
        className="block text-center bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        rel="noreferrer"
      >
        Open
      </a>
    </div>
  );
} 