import { createContext, useContext } from 'react';

// Create theme context
export const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
});

// Custom hook to use theme context
export const useTheme = () => useContext(ThemeContext);

// Theme configuration object
export const themeConfig = {
  light: {
    name: 'light',
    backgroundColor: '#f8f9fa',
    textColor: '#212529',
    cardBackground: '#ffffff',
    borderColor: '#dee2e6',
    chartColors: {
      primary: 'rgba(13, 110, 253, 0.7)',
      secondary: 'rgba(108, 117, 125, 0.7)',
      success: 'rgba(25, 135, 84, 0.7)',
      danger: 'rgba(220, 53, 69, 0.7)',
      warning: 'rgba(255, 193, 7, 0.7)',
      info: 'rgba(13, 202, 240, 0.7)',
    },
    chartGrid: {
      color: 'rgba(0, 0, 0, 0.1)',
    }
  },
  dark: {
    name: 'dark',
    backgroundColor: '#212529',
    textColor: '#f8f9fa',
    cardBackground: '#343a40',
    borderColor: '#495057',
    chartColors: {
      primary: 'rgba(13, 110, 253, 0.9)',
      secondary: 'rgba(173, 181, 189, 0.9)',
      success: 'rgba(25, 135, 84, 0.9)',
      danger: 'rgba(220, 53, 69, 0.9)',
      warning: 'rgba(255, 193, 7, 0.9)',
      info: 'rgba(13, 202, 240, 0.9)',
    },
    chartGrid: {
      color: 'rgba(255, 255, 255, 0.1)',
    }
  }
};

// Function to apply theme to chart options
export const applyThemeToChart = (chartOptions, themeName = 'light') => {
  const theme = themeConfig[themeName] || themeConfig.light;
  
  return {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      legend: {
        ...chartOptions.plugins?.legend,
        labels: {
          ...chartOptions.plugins?.legend?.labels,
          color: theme.textColor,
        }
      },
      title: {
        ...chartOptions.plugins?.title,
        color: theme.textColor,
      }
    },
    scales: {
      ...chartOptions.scales,
      x: {
        ...chartOptions.scales?.x,
        grid: {
          ...chartOptions.scales?.x?.grid,
          color: theme.chartGrid.color,
        },
        ticks: {
          ...chartOptions.scales?.x?.ticks,
          color: theme.textColor,
        },
        title: {
          ...chartOptions.scales?.x?.title,
          color: theme.textColor,
        }
      },
      y: {
        ...chartOptions.scales?.y,
        grid: {
          ...chartOptions.scales?.y?.grid,
          color: theme.chartGrid.color,
        },
        ticks: {
          ...chartOptions.scales?.y?.ticks,
          color: theme.textColor,
        },
        title: {
          ...chartOptions.scales?.y?.title,
          color: theme.textColor,
        }
      }
    }
  };
};

// Generate CSS variables for the selected theme
export const generateThemeCSS = (themeName = 'light') => {
  const theme = themeConfig[themeName] || themeConfig.light;
  
  return `
    :root {
      --dashboard-bg-color: ${theme.backgroundColor};
      --dashboard-text-color: ${theme.textColor};
      --dashboard-card-bg: ${theme.cardBackground};
      --dashboard-border-color: ${theme.borderColor};
      --dashboard-primary-color: ${theme.chartColors.primary};
      --dashboard-secondary-color: ${theme.chartColors.secondary};
      --dashboard-success-color: ${theme.chartColors.success};
      --dashboard-danger-color: ${theme.chartColors.danger};
      --dashboard-warning-color: ${theme.chartColors.warning};
      --dashboard-info-color: ${theme.chartColors.info};
    }
  `;
};

// Function to get theme from local storage or use default
export const getStoredTheme = () => {
  const storedTheme = localStorage.getItem('dashboardTheme');
  return storedTheme && (storedTheme === 'light' || storedTheme === 'dark') 
    ? storedTheme 
    : 'light';
};

// Function to store theme in local storage
export const storeTheme = (themeName) => {
  localStorage.setItem('dashboardTheme', themeName);
}; 