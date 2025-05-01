import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme, ThemeOptions } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Home from './pages/Home';
import Marketing from './pages/Marketing';
import Sales from './pages/Sales';
import Social from './pages/Social';
import Navbar from './components/Navbar';
import { Box } from '@mui/material';

const getTheme = (pathname: string) => {
  const baseTheme: ThemeOptions = {
    palette: {
      mode: 'dark' as const,
      background: {
        default: '#0f172a',
        paper: '#1e293b',
      },
      text: {
        primary: '#f8fafc',
        secondary: '#94a3b8',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 500,
            padding: '8px 16px',
            variants: [],
          },
          contained: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
          },
        },
      },
    },
  };

  switch (pathname) {
    case '/marketing':
      return createTheme({
        ...baseTheme,
        palette: {
          ...baseTheme.palette,
          primary: {
            main: '#6366f1',
            light: '#818cf8',
            dark: '#4f46e5',
          },
          secondary: {
            main: '#ec4899',
            light: '#f472b6',
            dark: '#db2777',
          },
        },
      });
    case '/sales':
      return createTheme({
        ...baseTheme,
        palette: {
          ...baseTheme.palette,
          primary: {
            main: '#10b981',
            light: '#34d399',
            dark: '#059669',
          },
          secondary: {
            main: '#3b82f6',
            light: '#60a5fa',
            dark: '#2563eb',
          },
        },
      });
    case '/social':
      return createTheme({
        ...baseTheme,
        palette: {
          ...baseTheme.palette,
          primary: {
            main: '#f59e0b',
            light: '#fbbf24',
            dark: '#d97706',
          },
          secondary: {
            main: '#ef4444',
            light: '#f87171',
            dark: '#dc2626',
          },
        },
      });
    default:
      return createTheme({
        ...baseTheme,
        palette: {
          ...baseTheme.palette,
          primary: {
            main: '#8b5cf6',
            light: '#a78bfa',
            dark: '#7c3aed',
          },
          secondary: {
            main: '#ec4899',
            light: '#f472b6',
            dark: '#db2777',
          },
        },
      });
  }
};

const GradientLine = () => {
  const location = useLocation();
  
  const getGradient = () => {
    switch (location.pathname) {
      case '/marketing':
        return 'linear-gradient(45deg, #6366f1, #ec4899)';
      case '/sales':
        return 'linear-gradient(45deg, #10b981, #3b82f6)';
      case '/social':
        return 'linear-gradient(45deg, #f59e0b, #ef4444)';
      default:
        return 'linear-gradient(45deg, #8b5cf6, #ec4899)';
    }
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        right: 0,
        left: 0,
        height: '0.125rem',
        backgroundImage: getGradient(),
        zIndex: 999990,
      }}
    />
  );
};

const AppContent = () => {
  const location = useLocation();
  const theme = getTheme(location.pathname);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GradientLine />
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          height: '100vh',
        }}
      >
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/marketing" element={<Marketing />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/social" element={<Social />} />
        </Routes>
      </Box>
    </ThemeProvider>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
