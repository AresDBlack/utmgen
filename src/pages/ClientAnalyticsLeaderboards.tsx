import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Chip, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material';
import { 
  getClientAnalyticsBreakdown, 
  type ClientAnalyticsBreakdown 
} from '../services/googleSheets';
import ClientAnalyticsNavbar from '../components/ClientAnalyticsNavbar';
import { useSearchParams } from 'react-router-dom';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`leaderboard-tabpanel-${index}`}
      aria-labelledby={`leaderboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ClientAnalyticsLeaderboards = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [breakdown, setBreakdown] = useState<ClientAnalyticsBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  
  const selectedClient = searchParams.get('client') || 'All';

  const fetchData = async () => {
    setLoading(true);
    try {
      const client = selectedClient === 'All' ? undefined : selectedClient as 'Danny' | 'Nadine' | 'Shaun';
      const data = await getClientAnalyticsBreakdown(client);
      setBreakdown(data);
    } catch (error) {
      console.error('Error fetching client analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedClient]);

  const handleClientChange = (client: string) => {
    setSearchParams({ client });
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const sortByRevenue = (data: { [key: string]: { revenue: number; sales: number; commission: number } }) => {
    return Object.entries(data)
      .sort(([, a], [, b]) => b.revenue - a.revenue)
      .slice(0, 10); // Top 10
  };

  const getGradient = (index: number) => {
    const gradients = [
      'linear-gradient(45deg, #fbbf24, #f59e0b)', // Gold
      'linear-gradient(45deg, #94a3b8, #64748b)', // Silver
      'linear-gradient(45deg, #d97706, #b45309)', // Bronze
    ];
    return gradients[index] || 'linear-gradient(45deg, #06b6d4, #a21caf)';
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
      }}>
        <ClientAnalyticsNavbar 
          selectedClient={selectedClient} 
          onClientChange={handleClientChange} 
        />
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: 'calc(100vh - 64px)' 
        }}>
          <CircularProgress sx={{ color: '#06b6d4' }} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
    }}>
      <ClientAnalyticsNavbar 
        selectedClient={selectedClient} 
        onClientChange={handleClientChange} 
      />
      
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" sx={{ 
            fontWeight: 700, 
            mb: 2, 
            background: 'linear-gradient(45deg, #06b6d4, #a21caf)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            🏆 Performance Leaderboards
          </Typography>
          <Typography variant="h6" sx={{ color: '#94a3b8', mb: 4 }}>
            Top-performing UTM parameters for {selectedClient === 'All' ? 'all clients' : selectedClient}
          </Typography>
        </Box>

        <Card sx={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        }}>
          <Box sx={{ borderBottom: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              sx={{
                '& .MuiTab-root': {
                  color: '#94a3b8',
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: 16,
                },
                '& .Mui-selected': {
                  color: '#f8fafc',
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#06b6d4',
                },
              }}
            >
              <Tab label="UTM Source" />
              <Tab label="UTM Medium" />
              <Tab label="UTM Campaign" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <TableContainer component={Paper} sx={{ 
              background: 'transparent',
              boxShadow: 'none',
            }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Rank</TableCell>
                    <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>UTM Source</TableCell>
                    <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Revenue</TableCell>
                    <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Sales</TableCell>
                    <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Commission</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortByRevenue(breakdown?.utm_source || {}).map(([source, data], index) => (
                    <TableRow key={source} sx={{ '&:hover': { background: 'rgba(255, 255, 255, 0.02)' } }}>
                      <TableCell>
                        <Chip 
                          label={`#${index + 1}`}
                          sx={{ 
                            background: getGradient(index),
                            color: 'white',
                            fontWeight: 600,
                            minWidth: 40,
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#f8fafc', fontWeight: 500 }}>{source}</TableCell>
                      <TableCell sx={{ color: '#10b981', fontWeight: 600 }}>
                        {formatCurrency(data.revenue)}
                      </TableCell>
                      <TableCell sx={{ color: '#f8fafc' }}>{data.sales}</TableCell>
                      <TableCell sx={{ color: '#f59e0b', fontWeight: 600 }}>
                        {formatCurrency(data.commission)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <TableContainer component={Paper} sx={{ 
              background: 'transparent',
              boxShadow: 'none',
            }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Rank</TableCell>
                    <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>UTM Medium</TableCell>
                    <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Revenue</TableCell>
                    <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Sales</TableCell>
                    <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Commission</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortByRevenue(breakdown?.utm_medium || {}).map(([medium, data], index) => (
                    <TableRow key={medium} sx={{ '&:hover': { background: 'rgba(255, 255, 255, 0.02)' } }}>
                      <TableCell>
                        <Chip 
                          label={`#${index + 1}`}
                          sx={{ 
                            background: getGradient(index),
                            color: 'white',
                            fontWeight: 600,
                            minWidth: 40,
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#f8fafc', fontWeight: 500 }}>{medium}</TableCell>
                      <TableCell sx={{ color: '#10b981', fontWeight: 600 }}>
                        {formatCurrency(data.revenue)}
                      </TableCell>
                      <TableCell sx={{ color: '#f8fafc' }}>{data.sales}</TableCell>
                      <TableCell sx={{ color: '#f59e0b', fontWeight: 600 }}>
                        {formatCurrency(data.commission)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <TableContainer component={Paper} sx={{ 
              background: 'transparent',
              boxShadow: 'none',
            }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Rank</TableCell>
                    <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>UTM Campaign</TableCell>
                    <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Revenue</TableCell>
                    <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Sales</TableCell>
                    <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Commission</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortByRevenue(breakdown?.utm_campaign || {}).map(([campaign, data], index) => (
                    <TableRow key={campaign} sx={{ '&:hover': { background: 'rgba(255, 255, 255, 0.02)' } }}>
                      <TableCell>
                        <Chip 
                          label={`#${index + 1}`}
                          sx={{ 
                            background: getGradient(index),
                            color: 'white',
                            fontWeight: 600,
                            minWidth: 40,
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#f8fafc', fontWeight: 500 }}>{campaign}</TableCell>
                      <TableCell sx={{ color: '#10b981', fontWeight: 600 }}>
                        {formatCurrency(data.revenue)}
                      </TableCell>
                      <TableCell sx={{ color: '#f8fafc' }}>{data.sales}</TableCell>
                      <TableCell sx={{ color: '#f59e0b', fontWeight: 600 }}>
                        {formatCurrency(data.commission)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </Card>
      </Box>
    </Box>
  );
};

export default ClientAnalyticsLeaderboards; 