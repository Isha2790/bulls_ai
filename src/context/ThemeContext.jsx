import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';

const ThemeContext = createContext(null);

/**
 * Global Platform Theme Design State Provider
 * Coordinates hardware-accelerated theme layout switching toggles and
 * synchronizes style token class distributions down the document document root tree.
 */
export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('sp_theme') || 'dark';
  });

  // DOM Token Synchronization Layer
  useEffect(() => {
    const documentRootNode = document.documentElement;
    
    if (currentTheme === 'dark') {
      documentRootNode.classList.add('dark');
    } else {
      documentRootNode.classList.remove('dark');
    }
    
    localStorage.setItem('sp_theme', currentTheme);
  }, [currentTheme]);
  // Theme Mutation Action Operations API
  
  /**
   * Smoothly alters the active layout styling mode across configurations.
   */
  const handleToggleTheme = useCallback(() => {
    setCurrentTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  }, []);
  // Memoized Theme Core Value Matrix Definition

  const themeProviderValueMatrix = useMemo(() => ({
    theme: currentTheme,
    isDark: currentTheme === 'dark',
    toggle: handleToggleTheme
  }), [currentTheme, handleToggleTheme]);

  return (
    <ThemeContext.Provider value={themeProviderValueMatrix}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Scoped hook tracking core stylesheet variants safely.
 */
export function useTheme() {
  const contextInstanceNode = useContext(ThemeContext);
  
  if (!contextInstanceNode) {
    throw new Error(
      '[Context Resolution Error]: useTheme UI structural hook must be executed strictly within an active ThemeProvider validation context.'
    );
  }
  
  return contextInstanceNode;
}