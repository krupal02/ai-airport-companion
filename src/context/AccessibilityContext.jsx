/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from 'react';
import { FONT_SIZES } from '../utils/constants';

 
export const AccessibilityContext = createContext();

export function AccessibilityProvider({ children }) {
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem('ac-fontSize');
    return saved ? Number(saved) : FONT_SIZES.medium;
  });

  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem('ac-highContrast') === 'true';
  });

  const [screenReaderMode, setScreenReaderMode] = useState(false);

  const updateFontSize = useCallback((size) => {
    setFontSize(size);
    localStorage.setItem('ac-fontSize', String(size));
    document.documentElement.style.setProperty('--base-font-size', `${size}px`);
  }, []);

  const toggleHighContrast = useCallback(() => {
    setHighContrast(prev => {
      const next = !prev;
      localStorage.setItem('ac-highContrast', String(next));
      if (next) {
        document.documentElement.classList.add('high-contrast');
      } else {
        document.documentElement.classList.remove('high-contrast');
      }
      return next;
    });
  }, []);

  const toggleScreenReader = useCallback(() => {
    setScreenReaderMode(prev => !prev);
  }, []);

  return (
    <AccessibilityContext.Provider
      value={{
        fontSize,
        highContrast,
        screenReaderMode,
        updateFontSize,
        toggleHighContrast,
        toggleScreenReader,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}
