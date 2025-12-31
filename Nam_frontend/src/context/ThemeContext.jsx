import React, { createContext, useContext, useState, useEffect } from 'react';
import themeService from '../services/themeService';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [activeTheme, setActiveTheme] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [effectsEnabled, setEffectsEnabled] = useState(true);

  useEffect(() => {
    loadActiveTheme();
    
    // Load effects preference from localStorage
    const savedEffectsPreference = localStorage.getItem('sieuthiabc_effects_enabled');
    if (savedEffectsPreference !== null) {
      setEffectsEnabled(JSON.parse(savedEffectsPreference));
    }
  }, []);

  const loadActiveTheme = async () => {
    try {
      setIsLoading(true);
      
      // Try to load from server
      const response = await themeService.getActiveTheme();
      if (response.theme) {
        setActiveTheme(response.theme);
        themeService.saveLocalTheme(response.theme);
        applyThemeStyles(response.theme);
      } else {
        // Load from localStorage
        const localTheme = themeService.getLocalTheme();
        if (localTheme) {
          setActiveTheme(localTheme);
          applyThemeStyles(localTheme);
        }
      }
    } catch (error) {
      console.error('Error loading theme:', error);
      
      // Fallback to local theme
      const localTheme = themeService.getLocalTheme();
      if (localTheme) {
        setActiveTheme(localTheme);
        applyThemeStyles(localTheme);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const applyThemeStyles = (theme) => {
    if (!theme) return;

    const root = document.documentElement;
    // Handle both structure formats (config object or direct properties)
    const primaryColor = theme.primary_color || theme.config?.primaryColor;
    const secondaryColor = theme.secondary_color || theme.config?.secondaryColor;
    const backgroundColor = theme.background_color || theme.config?.backgroundColor;
    const textColor = theme.text_color || theme.config?.textColor;

    // Apply CSS variables
    if (primaryColor) {
      root.style.setProperty('--primary-color', primaryColor);
    }
    if (secondaryColor) {
      root.style.setProperty('--secondary-color', secondaryColor);
    }
    if (backgroundColor) {
      root.style.setProperty('--background-color', backgroundColor);
    }
    if (textColor) {
      root.style.setProperty('--text-color', textColor);
    }

    // Apply body background
    if (backgroundColor) {
      document.body.style.backgroundColor = backgroundColor;
    }
  };

  const changeTheme = (theme) => {
    setActiveTheme(theme);
    themeService.saveLocalTheme(theme);
    applyThemeStyles(theme);
  };

  const toggleEffects = () => {
    const newValue = !effectsEnabled;
    setEffectsEnabled(newValue);
    localStorage.setItem('sieuthiabc_effects_enabled', JSON.stringify(newValue));
  };

  const getEffectType = () => {
    return activeTheme?.config?.effectType || 'none';
  };

  const getThemeIcon = () => {
    return activeTheme?.config?.iconUrl || '';
  };

  const getThemeName = () => {
    return activeTheme?.name || 'Mặc định';
  };

  const value = {
    currentTheme: activeTheme,
    activeTheme,
    isLoading,
    effectsEnabled,
    loadActiveTheme,
    changeTheme,
    toggleEffects,
    getEffectType,
    getThemeIcon,
    getThemeName
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export default ThemeContext;
