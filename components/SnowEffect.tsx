import React, { useMemo } from 'react';

const SnowEffect: React.FC = () => {
  // Generate random snowflakes only once on mount
  const snowflakes = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      // Random duration between 15s and 25s for a slow, floating effect
      animationDuration: `${Math.random() * 10 + 15}s`,
      // Random negative delay so they start at different positions
      animationDelay: `-${Math.random() * 25}s`,
      // Vary opacity for depth
      opacity: Math.random() * 0.3 + 0.1,
      // Vary size
      size: `${Math.random() * 4 + 2}px`,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute top-[-10px] bg-white rounded-full animate-snowfall"
          style={{
            left: flake.left,
            width: flake.size,
            height: flake.size,
            opacity: flake.opacity,
            animationDuration: flake.animationDuration,
            animationDelay: flake.animationDelay,
          }}
        />
      ))}
    </div>
  );
};

export default SnowEffect;