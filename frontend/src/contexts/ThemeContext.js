import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  // Check if user has a saved theme preference in localStorage
  const getSavedTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light'; // Default to light mode
  };

  const [theme, setTheme] = useState(getSavedTheme);

  // Apply theme to body element
  useEffect(() => {
    const body = document.body;
    
    // Remove existing theme classes
    body.classList.remove('theme-light', 'theme-dark');
    
    // Add current theme class
    body.classList.add(`theme-${theme}`);
    
    // Set data-bs-theme attribute for Bootstrap 5
    body.setAttribute('data-bs-theme', theme);
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Toggle between light and dark mode
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Set theme explicitly
  const setThemeExplicitly = (newTheme) => {
    if (newTheme === 'light' || newTheme === 'dark') {
      setTheme(newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme: setThemeExplicitly }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider; 