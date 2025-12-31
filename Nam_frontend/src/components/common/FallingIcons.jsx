import React, { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import './FallingIcons.css';

const FallingIcons = () => {
  const { currentTheme } = useTheme();
  const [icons, setIcons] = useState([]);

  useEffect(() => {
    if (!currentTheme || !currentTheme.falling_icon) {
      setIcons([]);
      return;
    }

    const iconChar = currentTheme.falling_icon;
    const newIcons = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100 + '%',
      animationDuration: Math.random() * 5 + 5 + 's',
      animationDelay: Math.random() * 5 + 's',
      fontSize: Math.random() * 20 + 10 + 'px',
      char: iconChar
    }));

    setIcons(newIcons);
  }, [currentTheme]);

  if (!icons.length) return null;

  return (
    <div className="falling-icons-container">
      {icons.map((icon) => (
        <div
          key={icon.id}
          className="falling-icon"
          style={{
            left: icon.left,
            animationDuration: icon.animationDuration,
            animationDelay: icon.animationDelay,
            fontSize: icon.fontSize
          }}
        >
          {icon.char}
        </div>
      ))}
    </div>
  );
};

export default FallingIcons;
