import React, { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import './ThemeEffects.css';

const ThemeEffects = () => {
  const { getEffectType, effectsEnabled } = useTheme();
  const [particles, setParticles] = useState([]);
  const effectType = getEffectType();

  useEffect(() => {
    if (!effectsEnabled || effectType === 'none') {
      setParticles([]);
      return;
    }

    // Generate particles based on effect type
    const particleCount = 30;
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDuration: 5 + Math.random() * 10,
      animationDelay: Math.random() * 5,
      size: getParticleSize(effectType)
    }));

    setParticles(newParticles);
  }, [effectType, effectsEnabled]);

  const getParticleSize = (type) => {
    switch (type) {
      case 'fireworks':
        return 8 + Math.random() * 4;
      case 'flowers':
      case 'leaves':
        return 20 + Math.random() * 15;
      case 'sun':
        return 15 + Math.random() * 10;
      case 'snow':
        return 10 + Math.random() * 10;
      default:
        return 10;
    }
  };

  const getParticleSymbol = (type) => {
    switch (type) {
      case 'fireworks':
        return ['✨', '🎆', '💥', '⭐', '🌟'];
      case 'flowers':
        return ['🌸', '🌺', '🌼', '🌻', '🌷'];
      case 'leaves':
        return ['🍂', '🍁', '🍃'];
      case 'sun':
        return ['☀️', '🌞'];
      case 'snow':
        return ['❄️', '⛄', '❅'];
      default:
        return ['•'];
    }
  };

  if (!effectsEnabled || effectType === 'none' || particles.length === 0) {
    return null;
  }

  const symbols = getParticleSymbol(effectType);

  return (
    <div className="theme-effects">
      {particles.map(particle => (
        <div
          key={particle.id}
          className={`particle particle-${effectType}`}
          style={{
            left: `${particle.left}%`,
            fontSize: `${particle.size}px`,
            animationDuration: `${particle.animationDuration}s`,
            animationDelay: `${particle.animationDelay}s`
          }}
        >
          {symbols[Math.floor(Math.random() * symbols.length)]}
        </div>
      ))}
    </div>
  );
};

export default ThemeEffects;
