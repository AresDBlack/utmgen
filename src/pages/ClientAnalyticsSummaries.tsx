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
import ClientAnalyticsComparisonFilter from '../components/ClientAnalyticsComparisonFilter';
import ClientAnalyticsComparisonChart from '../components/ClientAnalyticsComparisonChart';
import { useSearchParams } from 'react-router-dom';

interface FilterSet {
  name: string;
  startDate: Date | null;
  endDate: Date | null;
  selectedClient: string;
  productFilter: string;
  campaignFilter: string;
  sourceFilter: string;
  mediumFilter: string;
  searchTerm: string;
  isVisible: boolean;
}

const ClientAnalyticsSummaries = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [summaries, setSummaries] = useState<{ [key: string]: ClientAnalyticsSummary }>({});
  const [breakdowns, setBreakdowns] = useState<{ [key: string]: ClientAnalyticsBreakdown }>({});
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  
  // Filter states
  const [productFilter, setProductFilter] = useState('');
  const [campaignFilter, setCampaignFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [mediumFilter, setMediumFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  
  // Comparison mode states
  const [isComparisonMode, setIsComparisonMode] = useState(false);
  const [filterSetA, setFilterSetA] = useState<FilterSet>({
    name: 'Filter Set A',
    startDate: null,
    endDate: null,
    selectedClient: 'All',
    productFilter: '',
    campaignFilter: '',
    sourceFilter: '',
    mediumFilter: '',
    searchTerm: '',
    isVisible: true,
  });
  const [filterSetB, setFilterSetB] = useState<FilterSet>({
    name: 'Filter Set B',
    startDate: null,
    endDate: null,
    selectedClient: 'All',
    productFilter: '',
    campaignFilter: '',
    sourceFilter: '',
    mediumFilter: '',
    searchTerm: '',
    isVisible: true,
  });
  const [isComparisonExpanded, setIsComparisonExpanded] = useState(false);
  
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
  }, [selectedClient, startDate, endDate, productFilter, campaignFilter, sourceFilter, mediumFilter, searchTerm]);

  const handleClientChange = (client: string) => {
    setSearchParams({ client });
  };

  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date: Date | null) => {
    setEndDate(date);
  };

  const handleClearFilter = () => {
    setStartDate(null);
    setEndDate(null);
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

  // Filter breakdowns data based on current filters
  const getFilteredBreakdowns = () => {
    const filteredBreakdowns: { [key: string]: ClientAnalyticsBreakdown } = {};
    
    Object.entries(breakdowns).forEach(([client, breakdown]) => {
      if (!breakdown) return;
      
      // Create a filtered copy of the breakdown
      const filteredBreakdown: ClientAnalyticsBreakdown = {
        utm_source: {},
        utm_medium: {},
        utm_campaign: {},
        utm_content: {},
        product: {}
      };
      
      // Filter utm_source
      if (breakdown.utm_source) {
        Object.entries(breakdown.utm_source).forEach(([source, data]) => {
          if (!sourceFilter || source.toLowerCase().includes(sourceFilter.toLowerCase())) {
            filteredBreakdown.utm_source[source] = data;
          }
        });
      }
      
      // Filter utm_medium
      if (breakdown.utm_medium) {
        Object.entries(breakdown.utm_medium).forEach(([medium, data]) => {
          if (!mediumFilter || medium.toLowerCase().includes(mediumFilter.toLowerCase())) {
            filteredBreakdown.utm_medium[medium] = data;
          }
        });
      }
      
      // Filter utm_campaign
      if (breakdown.utm_campaign) {
        Object.entries(breakdown.utm_campaign).forEach(([campaign, data]) => {
          if (!campaignFilter || campaign.toLowerCase().includes(campaignFilter.toLowerCase())) {
            filteredBreakdown.utm_campaign[campaign] = data;
          }
        });
      }
      
      // Filter product
      if (breakdown.product) {
        Object.entries(breakdown.product).forEach(([product, data]) => {
          if (!productFilter || product.toLowerCase().includes(productFilter.toLowerCase())) {
            filteredBreakdown.product[product] = data;
          }
        });
      }
      
      // Only include if there's any data after filtering
      if (Object.keys(filteredBreakdown.utm_source).length > 0 || 
          Object.keys(filteredBreakdown.utm_medium).length > 0 || 
          Object.keys(filteredBreakdown.utm_campaign).length > 0 || 
          Object.keys(filteredBreakdown.product).length > 0) {
        filteredBreakdowns[client] = filteredBreakdown;
      }
    });
    
    return filteredBreakdowns;
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

  // Get unique values for filter options from breakdowns data
  const availableProducts = Array.from(new Set(
    Object.values(getFilteredBreakdowns()).flatMap(breakdown => 
      breakdown?.product ? Object.keys(breakdown.product) : []
    )
  )).filter(Boolean);
  
  const availableCampaigns = Array.from(new Set(
    Object.values(getFilteredBreakdowns()).flatMap(breakdown => 
      breakdown?.utm_campaign ? Object.keys(breakdown.utm_campaign) : []
    )
  )).filter(Boolean);
  
  const availableSources = Array.from(new Set(
    Object.values(getFilteredBreakdowns()).flatMap(breakdown => 
      breakdown?.utm_source ? Object.keys(breakdown.utm_source) : []
    )
  )).filter(Boolean);
  
  const availableMediums = Array.from(new Set(
    Object.values(getFilteredBreakdowns()).flatMap(breakdown => 
      breakdown?.utm_medium ? Object.keys(breakdown.utm_medium) : []
    )
  )).filter(Boolean);

  // Comparison data calculation (placeholder)
  const getComparisonData = () => {
    if (Object.keys(summaries).length === 0) return [];

    // Calculate totals from summaries data
    const totalSales = Object.values(summaries).reduce((sum, summary) => sum + summary.totalSales, 0);
    const totalRevenue = Object.values(summaries).reduce((sum, summary) => sum + summary.totalRevenue, 0);
    const totalCommission = Object.values(summaries).reduce((sum, summary) => sum + summary.totalCommission, 0);
    const uniqueCampaigns = Object.values(summaries).reduce((sum, summary) => sum + summary.uniqueCampaigns, 0);

    return [
      {
        label: 'Total Sales',
        valueA: totalSales,
        valueB: totalSales, // Placeholder - would be calculated from filter set B data
        format: 'number' as const,
      },
      {
        label: 'Total Revenue',
        valueA: totalRevenue,
        valueB: totalRevenue, // Placeholder - would be calculated from filter set B data
        format: 'currency' as const,
      },
      {
        label: 'Total Commission',
        valueA: totalCommission,
        valueB: totalCommission, // Placeholder - would be calculated from filter set B data
        format: 'currency' as const,
      },
      {
        label: 'Unique Campaigns',
        valueA: uniqueCampaigns,
        valueB: uniqueCampaigns, // Placeholder - would be calculated from filter set B data
        format: 'number' as const,
      },
    ];
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

        {/* Date Filter */}
        {!isComparisonMode && (
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
        )}

        {/* Comparison Filter Component */}
        <ClientAnalyticsComparisonFilter
          isComparisonMode={isComparisonMode}
          onComparisonModeChange={setIsComparisonMode}
          filterSetA={filterSetA}
          filterSetB={filterSetB}
          onFilterSetAChange={setFilterSetA}
          onFilterSetBChange={setFilterSetB}
          availableProducts={availableProducts}
          availableCampaigns={availableCampaigns}
          availableSources={availableSources}
          availableMediums={availableMediums}
          isExpanded={isComparisonExpanded}
          onToggleExpanded={() => setIsComparisonExpanded(!isComparisonExpanded)}
        />

        {/* Comparison Charts */}
        {isComparisonMode && (
          <ClientAnalyticsComparisonChart
            title="Performance Comparison"
            data={getComparisonData()}
            filterSetAName="Filter Set A"
            filterSetBName="Filter Set B"
            isExpanded={isComparisonExpanded}
            onToggleExpanded={() => setIsComparisonExpanded(!isComparisonExpanded)}
          />
        )}

        {/* Client Summary Cards (only when not in comparison mode) */}
        {!isComparisonMode && (
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
        )}

        {/* Breakdown Tables */}
        {!isComparisonMode && (
          <>
            {clients.map(client => {
              const breakdown = getFilteredBreakdowns()[client];
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
                      
                      <Grid item xs={12}>
                        <Typography variant="h6" sx={{ color: '#94a3b8', mb: 2 }}>
                          Top Products
                        </Typography>
                        <TableContainer component={Paper} sx={{ 
                          background: 'transparent',
                          boxShadow: 'none',
                        }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Product</TableCell>
                                <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Revenue</TableCell>
                                <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Sales</TableCell>
                                <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Commission</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {sortByRevenue(breakdown.product || {}).map(([product, data]) => (
                                <TableRow key={product}>
                                  <TableCell sx={{ color: '#f8fafc' }}>{product}</TableCell>
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
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              );
            })}
          </>
        )}
      </Box>
    </Box>
  );
};

export default ClientAnalyticsSummaries; 