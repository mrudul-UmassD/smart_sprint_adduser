import { createTheme } from '@mui/material/styles';

// Smart Sprint theme colors based on logo
const theme = createTheme({
  palette: {
    primary: {
      // Blue color from logo
      main: '#0062cc', // Primary blue
      light: '#4d8fda',
      dark: '#00459b',
      contrastText: '#ffffff',
    },
    secondary: {
      // Secondary color from logo 
      main: '#ff5722', // Orange accent
      light: '#ff8a50',
      dark: '#c41c00',
      contrastText: '#ffffff',
    },
    accent: {
      // Third color used for accents
      main: '#4caf50', // Green
      light: '#80e27e',
      dark: '#087f23',
    },
    error: {
      main: '#f44336',
    },
    warning: {
      main: '#ff9800',
    },
    info: {
      main: '#2196f3',
    },
    success: {
      main: '#4caf50',
    },
    background: {
      default: '#f7f9fc',
      paper: '#ffffff',
    },
    text: {
      primary: '#263238', // Dark text
      secondary: '#546e7a',
      disabled: '#90a4ae',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 500,
      fontSize: '2.25rem',
    },
    h2: {
      fontWeight: 500,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 500,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontSize: '0.875rem',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          },
        },
        containedPrimary: {
          backgroundColor: '#0062cc',
          '&:hover': {
            backgroundColor: '#00459b',
          },
        },
        containedSecondary: {
          backgroundColor: '#ff5722',
          '&:hover': {
            backgroundColor: '#c41c00',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        },
        elevation1: {
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        },
        elevation2: {
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
        },
        elevation3: {
          boxShadow: '0 6px 12px rgba(0, 0, 0, 0.05)',
        },
        elevation4: {
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          overflow: 'hidden',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
});

export default theme; 