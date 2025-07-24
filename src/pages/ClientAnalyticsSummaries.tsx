import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { 
  getClientAnalyticsSummary, 
  getClientAnalyticsBreakdown,
  type ClientAnalyticsSummary,
  type ClientAnalyticsBreakdown
} from '../services/googleSheets';
import ClientAnalyticsNavbar from '../components/ClientAnalyticsNavbar';
import { useSearchParams } from 'react-router-dom';

const ClientAnalyticsSummaries = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [summaries, setSummaries] = useState<{ [key: string]: ClientAnalyticsSummary }>({});
  const [breakdowns, setBreakdowns] = useState<{ [key: string]: ClientAnalyticsBreakdown }>({});
  const [loading, setLoading] = useState(true);
  
  const selectedClient = searchParams.get('client') || 'All';

  const fetchData = async () => {
    setLoading(true);
    try {
      const clients = selectedClient === 'All' ? ['Danny', 'Nadine', 'Shaun'] : [selectedClient];
      const summaryPromises = clients.map(client => 
        getClientAnalyticsSummary(client as 'Danny' | 'Nadine' | 'Shaun')
      );
      const breakdownPromises = clients.map(client => 
        getClientAnalyticsBreakdown(client as 'Danny' | 'Nadine' | 'Shaun')
      );

      const [summaryResults, breakdownResults] = await Promise.all([
        Promise.all(summaryPromises),
        Promise.all(breakdownPromises)
      ]);

      const summaryMap: { [key: string]: ClientAnalyticsSummary } = {};
      const breakdownMap: { [key: string]: ClientAnalyticsBreakdown } = {};

      clients.forEach((client, index) => {
        if (summaryResults[index]) {
          summaryMap[client] = summaryResults[index];
        }
        if (breakdownResults[index]) {
          breakdownMap[client] = breakdownResults[index];
        }
      });

      setSummaries(summaryMap);
      setBreakdowns(breakdownMap);
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getClientGradient = (client: string) => {
    switch (client) {
      case 'Danny':
        return 'linear-gradient(45deg, #10b981, #3b82f6)';
      case 'Nadine':
        return 'linear-gradient(45deg, #f59e0b, #ef4444)';
      case 'Shaun':
        return 'linear-gradient(45deg, #8b5cf6, #ec4899)';
      default:
        return 'linear-gradient(45deg, #06b6d4, #a21caf)';
    }
  };

  const sortByRevenue = (data: { [key: string]: { revenue: number; sales: number; commission: number } }) => {
    return Object.entries(data)
      .sort(([, a], [, b]) => b.revenue - a.revenue)
      .slice(0, 5); // Top 5
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

  const clients = selectedClient === 'All' ? ['Danny', 'Nadine', 'Shaun'] : [selectedClient];

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
      
      <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" sx={{ 
            fontWeight: 700, 
            mb: 2, 
            background: 'linear-gradient(45deg, #06b6d4, #a21caf)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            📈 Analytics Summaries
          </Typography>
          <Typography variant="h6" sx={{ color: '#94a3b8', mb: 4 }}>
            Performance overview for {selectedClient === 'All' ? 'all clients' : selectedClient}
          </Typography>
        </Box>

        {/* Client Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {clients.map(client => {
            const summary = summaries[client];
            if (!summary) return null;

            return (
              <Grid item xs={12} md={4} key={client}>
                <Card sx={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: getClientGradient(client),
                  }} />
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                      <Typography variant="h4" sx={{ 
                        fontWeight: 700, 
                        mb: 1,
                        background: getClientGradient(client),
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}>
                        {client}
                      </Typography>
                    </Box>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h5" sx={{ color: '#10b981', fontWeight: 700 }}>
                            {formatCurrency(summary.totalRevenue)}
                          </Typography>
                          <Typography sx={{ color: '#94a3b8', fontSize: 14 }}>
                            Revenue
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h5" sx={{ color: '#f59e0b', fontWeight: 700 }}>
                            {formatCurrency(summary.totalCommission)}
                          </Typography>
                          <Typography sx={{ color: '#94a3b8', fontSize: 14 }}>
                            Commission
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h5" sx={{ color: '#f8fafc', fontWeight: 700 }}>
                            {summary.totalSales}
                          </Typography>
                          <Typography sx={{ color: '#94a3b8', fontSize: 14 }}>
                            Sales
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h5" sx={{ color: '#06b6d4', fontWeight: 700 }}>
                            {summary.uniqueCampaigns}
                          </Typography>
                          <Typography sx={{ color: '#94a3b8', fontSize: 14 }}>
                            Campaigns
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Breakdown Tables */}
        {clients.map(client => {
          const breakdown = breakdowns[client];
          if (!breakdown) return null;

          return (
            <Card key={client} sx={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              mb: 4,
            }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ 
                  fontWeight: 700, 
                  mb: 3,
                  background: getClientGradient(client),
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  {client} - Top Campaigns
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" sx={{ color: '#94a3b8', mb: 2 }}>
                      Top Sources
                    </Typography>
                    <TableContainer component={Paper} sx={{ 
                      background: 'transparent',
                      boxShadow: 'none',
                    }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Source</TableCell>
                            <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Revenue</TableCell>
                            <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Sales</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {sortByRevenue(breakdown.utm_source).map(([source, data]) => (
                            <TableRow key={source}>
                              <TableCell sx={{ color: '#f8fafc' }}>{source}</TableCell>
                              <TableCell sx={{ color: '#10b981', fontWeight: 600 }}>
                                {formatCurrency(data.revenue)}
                              </TableCell>
                              <TableCell sx={{ color: '#f8fafc' }}>{data.sales}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" sx={{ color: '#94a3b8', mb: 2 }}>
                      Top Mediums
                    </Typography>
                    <TableContainer component={Paper} sx={{ 
                      background: 'transparent',
                      boxShadow: 'none',
                    }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Medium</TableCell>
                            <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Revenue</TableCell>
                            <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Sales</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {sortByRevenue(breakdown.utm_medium).map(([medium, data]) => (
                            <TableRow key={medium}>
                              <TableCell sx={{ color: '#f8fafc' }}>{medium}</TableCell>
                              <TableCell sx={{ color: '#10b981', fontWeight: 600 }}>
                                {formatCurrency(data.revenue)}
                              </TableCell>
                              <TableCell sx={{ color: '#f8fafc' }}>{data.sales}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
};

export default ClientAnalyticsSummaries; 