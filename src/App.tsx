import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import Navbar from './components/Navbar';
import UTMGeneratorNavbar from './components/UTMGeneratorNavbar';
import Home from './pages/Home';
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

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#06b6d4',
    },
    secondary: {
      main: '#a21caf',
    },
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
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
        },
      },
    },
  },
});

const getGradient = (pathname: string) => {
  if (pathname.startsWith('/utm-generator') || pathname === '/sales' || pathname === '/marketing' || pathname === '/social' || pathname === '/others' || pathname === '/affiliates') {
    return 'linear-gradient(45deg, #06b6d4, #0891b2)';
  }
  if (pathname.startsWith('/analytics')) {
    return 'linear-gradient(45deg, #10b981, #059669)';
  }
  if (pathname.startsWith('/client-analytics')) {
    return 'linear-gradient(45deg, #8b5cf6, #7c3aed)';
  }
  return 'linear-gradient(45deg, #06b6d4, #a21caf)';
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div style={{ 
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        }}>
          <Routes>
            {/* Main Home Page */}
            <Route path="/" element={
              <>
                <Navbar />
                <Home />
              </>
            } />

            {/* UTM Generator Section */}
            <Route path="/utm-generator" element={
              <>
                <UTMGeneratorNavbar />
                <Marketing />
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
            <Route path="/analytics-home" element={
              <>
                <Navbar />
                <AnalyticsHome />
              </>
            } />
            <Route path="/analytics-dashboard/:department" element={
              <>
                <Navbar />
                <AnalyticsDashboard />
              </>
            } />
            <Route path="/analytics-leaderboard" element={
              <>
                <Navbar />
                <AnalyticsLeaderboard />
              </>
            } />
            <Route path="/analytics-submissions-table" element={
              <>
                <Navbar />
                <AnalyticsSubmissionsTable />
              </>
            } />
            <Route path="/exec-analytics-approval" element={
              <>
                <Navbar />
                <ExecAnalyticsApproval />
              </>
            } />

            {/* Client Analytics Section */}
            <Route path="/client-analytics-leaderboards" element={
              <>
                <Navbar />
                <ClientAnalyticsLeaderboards />
              </>
            } />
            <Route path="/client-analytics-table" element={
              <>
                <Navbar />
                <ClientAnalyticsTable />
              </>
            } />
            <Route path="/client-analytics-summaries" element={
              <>
                <Navbar />
                <ClientAnalyticsSummaries />
              </>
            } />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default App;
