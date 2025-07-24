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
import ClientAnalyticsFilter from '../components/ClientAnalyticsFilter';
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
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ClientAnalyticsLeaderboards = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [breakdown, setBreakdown] = useState<ClientAnalyticsBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
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
      const client = selectedClient === 'All' ? undefined : selectedClient as 'Danny' | 'Nadine' | 'Shaun';
      const startDateStr = startDate ? startDate.toISOString().split('T')[0] : undefined;
      const endDateStr = endDate ? endDate.toISOString().split('T')[0] : undefined;
      const data = await getClientAnalyticsBreakdown(client, startDateStr, endDateStr);
      setBreakdown(data);
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
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
              <Tab label="Product" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            {breakdown?.utm_source && (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ background: 'rgba(255, 255, 255, 0.02)' }}>
                      <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Rank</TableCell>
                      <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>UTM Source</TableCell>
                      <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Sales</TableCell>
                      <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Revenue</TableCell>
                      <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Commission</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(breakdown.utm_source).map(([source, data], index) => (
                      <TableRow key={source} sx={{ '&:hover': { background: 'rgba(255, 255, 255, 0.02)' } }}>
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
                        <TableCell sx={{ color: '#10b981', fontWeight: 600 }}>
                          {data.sales}
                        </TableCell>
                        <TableCell sx={{ color: '#f59e0b', fontWeight: 600 }}>
                          {formatCurrency(data.revenue)}
                        </TableCell>
                        <TableCell sx={{ color: '#8b5cf6', fontWeight: 600 }}>
                          {formatCurrency(data.commission)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {breakdown?.utm_medium && (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ background: 'rgba(255, 255, 255, 0.02)' }}>
                      <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Rank</TableCell>
                      <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>UTM Medium</TableCell>
                      <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Sales</TableCell>
                      <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Revenue</TableCell>
                      <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Commission</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(breakdown.utm_medium).map(([medium, data], index) => (
                      <TableRow key={medium} sx={{ '&:hover': { background: 'rgba(255, 255, 255, 0.02)' } }}>
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
                          {medium}
                        </TableCell>
                        <TableCell sx={{ color: '#10b981', fontWeight: 600 }}>
                          {data.sales}
                        </TableCell>
                        <TableCell sx={{ color: '#f59e0b', fontWeight: 600 }}>
                          {formatCurrency(data.revenue)}
                        </TableCell>
                        <TableCell sx={{ color: '#8b5cf6', fontWeight: 600 }}>
                          {formatCurrency(data.commission)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            {breakdown?.utm_campaign && (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ background: 'rgba(255, 255, 255, 0.02)' }}>
                      <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Rank</TableCell>
                      <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>UTM Campaign</TableCell>
                      <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Sales</TableCell>
                      <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Revenue</TableCell>
                      <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Commission</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(breakdown.utm_campaign).map(([campaign, data], index) => (
                      <TableRow key={campaign} sx={{ '&:hover': { background: 'rgba(255, 255, 255, 0.02)' } }}>
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
                        <TableCell sx={{ color: '#10b981', fontWeight: 600 }}>
                          {data.sales}
                        </TableCell>
                        <TableCell sx={{ color: '#f59e0b', fontWeight: 600 }}>
                          {formatCurrency(data.revenue)}
                        </TableCell>
                        <TableCell sx={{ color: '#8b5cf6', fontWeight: 600 }}>
                          {formatCurrency(data.commission)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            {breakdown?.product && (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ background: 'rgba(255, 255, 255, 0.02)' }}>
                      <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Rank</TableCell>
                      <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Product</TableCell>
                      <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Sales</TableCell>
                      <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Revenue</TableCell>
                      <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Commission</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(breakdown.product).map(([product, data], index) => (
                      <TableRow key={product} sx={{ '&:hover': { background: 'rgba(255, 255, 255, 0.02)' } }}>
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
                          {product}
                        </TableCell>
                        <TableCell sx={{ color: '#10b981', fontWeight: 600 }}>
                          {data.sales}
                        </TableCell>
                        <TableCell sx={{ color: '#f59e0b', fontWeight: 600 }}>
                          {formatCurrency(data.revenue)}
                        </TableCell>
                        <TableCell sx={{ color: '#8b5cf6', fontWeight: 600 }}>
                          {formatCurrency(data.commission)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>
        </Card>
      </Box>
    </Box>
  );
};

export default ClientAnalyticsLeaderboards; 