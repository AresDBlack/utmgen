import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme, ThemeOptions } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/Navbar';
import UTMGeneratorNavbar from './components/UTMGeneratorNavbar';
import Home from './pages/Home';
import UTMGeneratorHome from './pages/UTMGeneratorHome';
import Marketing from './pages/Marketing';
import Sales from './pages/Sales';
import Social from './pages/Social';
import Others from './pages/Others';
import Affiliates from './pages/Affiliates';
import AnalyticsHome from './pages/AnalyticsHome';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import AnalyticsLeaderboard from './pages/AnalyticsLeaderboard';
import AnalyticsSubmissionsTable from './pages/AnalyticsSubmissionsTable';
import ExecAnalyticsApproval from './pages/ExecAnalyticsApproval';
import ClientAnalyticsLeaderboards from './pages/ClientAnalyticsLeaderboards';
import ClientAnalyticsTable from './pages/ClientAnalyticsTable';
import ClientAnalyticsSummaries from './pages/ClientAnalyticsSummaries';
import ClientAnalyticsSubscriptions from './pages/ClientAnalyticsSubscriptions';
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
            textTransform: 'none',
            borderRadius: '8px',
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
    case '/others':
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
            main: '#10b981',
            light: '#34d399',
            dark: '#059669',
          },
        },
      });
    case '/affiliates':
      return createTheme({
        ...baseTheme,
        palette: {
          ...baseTheme.palette,
          primary: {
            main: '#06b6d4',
            light: '#67e8f9',
            dark: '#0e7490',
          },
          secondary: {
            main: '#a21caf',
            light: '#e879f9',
            dark: '#701a75',
          },
        },
      });
    case '/utm-generator':
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
    case '/':
      return createTheme(baseTheme);
    default:
      return createTheme(baseTheme);
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
      case '/others':
        return 'linear-gradient(45deg, #8b5cf6, #10b981)';
      case '/affiliates':
        return 'linear-gradient(45deg, #06b6d4, #a21caf)';
      case '/utm-generator':
        return 'linear-gradient(45deg, #6366f1, #ec4899)';
      case '/client-analytics-leaderboards':
      case '/client-analytics-table':
      case '/client-analytics-summaries':
        return 'linear-gradient(45deg, #8b5cf6, #7c3aed)';
      case '/':
        return 'linear-gradient(45deg, #06b6d4, #a21caf)';
      default:
        return 'linear-gradient(45deg, #06b6d4, #a21caf)';
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
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
        }}
      >
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
          }}
        >
          <Navbar />
        </Box>
        <Box sx={{ mt: '64px', flex: 1 }}>
          <Routes>
            {/* Main Home Page */}
            <Route path="/" element={<Home />} />

            {/* UTM Generator Section */}
            <Route path="/utm-generator" element={
              <>
                <UTMGeneratorNavbar />
                <UTMGeneratorHome />
              </>
            } />
            <Route path="/sales" element={
              <>
                <UTMGeneratorNavbar />
                <Sales />
              </>
            } />
            <Route path="/marketing" element={
              <>
                <UTMGeneratorNavbar />
                <Marketing />
              </>
            } />
            <Route path="/social" element={
              <>
                <UTMGeneratorNavbar />
                <Social />
              </>
            } />
            <Route path="/others" element={
              <>
                <UTMGeneratorNavbar />
                <Others />
              </>
            } />
            <Route path="/affiliates" element={
              <>
                <UTMGeneratorNavbar />
                <Affiliates />
              </>
            } />

            {/* Analytics Submission Section */}
            <Route path="/analytics-home" element={<AnalyticsHome />} />
            <Route path="/analytics-dashboard/:department" element={<AnalyticsDashboard />} />
            <Route path="/analytics-leaderboard" element={<AnalyticsLeaderboard />} />
            <Route path="/analytics-submissions-table" element={<AnalyticsSubmissionsTable />} />
            <Route path="/exec-analytics-approval" element={<ExecAnalyticsApproval />} />

            {/* Client Analytics Section */}
            <Route path="/client-analytics-leaderboards" element={<ClientAnalyticsLeaderboards />} />
            <Route path="/client-analytics-table" element={<ClientAnalyticsTable />} />
            <Route path="/client-analytics-summaries" element={<ClientAnalyticsSummaries />} />
            <Route path="/client-analytics-subscriptions" element={<ClientAnalyticsSubscriptions />} />
          </Routes>
        </Box>
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
