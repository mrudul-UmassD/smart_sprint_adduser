import React, { useState, useEffect } from 'react';
import { ThemeContext, getStoredTheme, storeTheme, generateThemeCSS } from '../utils/themeUtils';

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getStoredTheme());
  
  // Update CSS variables when theme changes
  useEffect(() => {
    // Create or get the style element for theme CSS
    let styleEl = document.getElementById('theme-style');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'theme-style';
      document.head.appendChild(styleEl);
    }
    
    // Generate and set the CSS for the current theme
    styleEl.innerHTML = generateThemeCSS(theme);
    
    // Update body class
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(`theme-${theme}`);
    
    // Store theme preference
    storeTheme(theme);
  }, [theme]);
  
  // Toggle between light and dark themes
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider; 