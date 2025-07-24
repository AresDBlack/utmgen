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
import ClientAnalyticsFilter from '../components/ClientAnalyticsFilter';
import { useSearchParams } from 'react-router-dom';

const ClientAnalyticsSummaries = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [summaries, setSummaries] = useState<{ [key: string]: ClientAnalyticsSummary }>({});
  const [breakdowns, setBreakdowns] = useState<{ [key: string]: ClientAnalyticsBreakdown }>({});
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [productFilter, setProductFilter] = useState('');
  const [campaignFilter, setCampaignFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [mediumFilter, setMediumFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  
  const selectedClient = searchParams.get('client') || 'All';

  const fetchData = async () => {
    setLoading(true);
    try {
      const clients = selectedClient === 'All' ? ['Danny', 'Nadine', 'Shaun'] : [selectedClient];
      const startDateStr = startDate ? startDate.toISOString().split('T')[0] : undefined;
      const endDateStr = endDate ? endDate.toISOString().split('T')[0] : undefined;
      
      const summaryPromises = clients.map(client => 
        getClientAnalyticsSummary(client as 'Danny' | 'Nadine' | 'Shaun', startDateStr, endDateStr)
      );
      const breakdownPromises = clients.map(client => 
        getClientAnalyticsBreakdown(client as 'Danny' | 'Nadine' | 'Shaun', startDateStr, endDateStr)
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
  }, [selectedClient, startDate, endDate]);

  const handleClientChange = (client: string) => {
    setSearchParams({ client });
  };

  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date: Date | null) => {
    setEndDate(date);
  };

  const handleClearAllFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setProductFilter('');
    setCampaignFilter('');
    setSourceFilter('');
    setMediumFilter('');
    setSearchTerm('');
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

  // Get unique values for filter options (placeholder for now)
  const availableProducts: string[] = [];
  const availableCampaigns: string[] = [];
  const availableSources: string[] = [];
  const availableMediums: string[] = [];

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

        {/* Advanced Filter Component */}
        <ClientAnalyticsFilter
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={handleStartDateChange}
          onEndDateChange={handleEndDateChange}
          selectedClient={selectedClient}
          onClientChange={handleClientChange}
          productFilter={productFilter}
          onProductFilterChange={setProductFilter}
          campaignFilter={campaignFilter}
          onCampaignFilterChange={setCampaignFilter}
          sourceFilter={sourceFilter}
          onSourceFilterChange={setSourceFilter}
          mediumFilter={mediumFilter}
          onMediumFilterChange={setMediumFilter}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onClearAll={handleClearAllFilters}
          availableProducts={availableProducts}
          availableCampaigns={availableCampaigns}
          availableSources={availableSources}
          availableMediums={availableMediums}
          isExpanded={isFilterExpanded}
          onToggleExpanded={() => setIsFilterExpanded(!isFilterExpanded)}
        />

        {/* Client Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {clients.map((client) => {
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
                  
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h5" sx={{ 
                      fontWeight: 700, 
                      mb: 3,
                      background: getClientGradient(client),
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      {client}
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" sx={{ 
                            fontWeight: 700, 
                            mb: 1,
                            background: 'linear-gradient(45deg, #10b981, #3b82f6)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                          }}>
                            {summary.totalSales}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                            Total Sales
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" sx={{ 
                            fontWeight: 700, 
                            mb: 1,
                            background: 'linear-gradient(45deg, #f59e0b, #ef4444)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                          }}>
                            {formatCurrency(summary.totalRevenue)}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                            Total Revenue
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" sx={{ 
                            fontWeight: 700, 
                            mb: 1,
                            background: 'linear-gradient(45deg, #8b5cf6, #ec4899)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                          }}>
                            {formatCurrency(summary.totalCommission)}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                            Total Commission
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" sx={{ 
                            fontWeight: 700, 
                            mb: 1,
                            background: 'linear-gradient(45deg, #06b6d4, #a21caf)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                          }}>
                            {summary.uniqueCampaigns}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                            Unique Campaigns
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

        {/* Top Performers Section */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
            }}>
              <CardContent>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  mb: 3,
                  color: '#f8fafc'
                }}>
                  🏆 Top Revenue Sources
                </Typography>
                
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ background: 'rgba(255, 255, 255, 0.02)' }}>
                        <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Rank</TableCell>
                        <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Source</TableCell>
                        <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Revenue</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {clients.map((client) => {
                        const breakdown = breakdowns[client];
                        if (!breakdown?.utm_source) return null;
                        
                        return sortByRevenue(breakdown.utm_source).map(([source, data], index) => (
                          <TableRow key={`${client}-${source}`} sx={{ '&:hover': { background: 'rgba(255, 255, 255, 0.02)' } }}>
                            <TableCell>
                              <Chip 
                                label={`#${index + 1}`} 
                                size="small"
                                sx={{ 
                                  background: index === 0 ? 'linear-gradient(45deg, #fbbf24, #f59e0b)' : 
                                         index === 1 ? 'linear-gradient(45deg, #9ca3af, #6b7280)' :
                                         index === 2 ? 'linear-gradient(45deg, #cd7f32, #b8860b)' :
                                         'rgba(255, 255, 255, 0.1)',
                                  color: 'white',
                                  fontWeight: 600,
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ color: '#f8fafc', fontWeight: 500 }}>
                              {source}
                            </TableCell>
                            <TableCell sx={{ color: '#f59e0b', fontWeight: 600 }}>
                              {formatCurrency(data.revenue)}
                            </TableCell>
                          </TableRow>
                        ));
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
            }}>
              <CardContent>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  mb: 3,
                  color: '#f8fafc'
                }}>
                  💰 Top Commission Earners
                </Typography>
                
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ background: 'rgba(255, 255, 255, 0.02)' }}>
                        <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Rank</TableCell>
                        <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Campaign</TableCell>
                        <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Commission</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {clients.map((client) => {
                        const breakdown = breakdowns[client];
                        if (!breakdown?.utm_campaign) return null;
                        
                        return sortByRevenue(breakdown.utm_campaign).map(([campaign, data], index) => (
                          <TableRow key={`${client}-${campaign}`} sx={{ '&:hover': { background: 'rgba(255, 255, 255, 0.02)' } }}>
                            <TableCell>
                              <Chip 
                                label={`#${index + 1}`} 
                                size="small"
                                sx={{ 
                                  background: index === 0 ? 'linear-gradient(45deg, #fbbf24, #f59e0b)' : 
                                         index === 1 ? 'linear-gradient(45deg, #9ca3af, #6b7280)' :
                                         index === 2 ? 'linear-gradient(45deg, #cd7f32, #b8860b)' :
                                         'rgba(255, 255, 255, 0.1)',
                                  color: 'white',
                                  fontWeight: 600,
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ color: '#f8fafc', fontWeight: 500 }}>
                              {campaign}
                            </TableCell>
                            <TableCell sx={{ color: '#8b5cf6', fontWeight: 600 }}>
                              {formatCurrency(data.commission)}
                            </TableCell>
                          </TableRow>
                        ));
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default ClientAnalyticsSummaries; 