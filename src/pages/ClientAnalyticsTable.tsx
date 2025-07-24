import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Grid,
  Chip,
  CircularProgress,
  TablePagination
} from '@mui/material';
import { 
  getClientAnalytics, 
  getClientAnalyticsSummary,
  type ClientAnalyticsRecord,
  type ClientAnalyticsSummary
} from '../services/googleSheets';
import ClientAnalyticsNavbar from '../components/ClientAnalyticsNavbar';
import ClientAnalyticsFilter from '../components/ClientAnalyticsFilter';
import { useSearchParams } from 'react-router-dom';

const ClientAnalyticsTable = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [records, setRecords] = useState<ClientAnalyticsRecord[]>([]);
  const [summary, setSummary] = useState<ClientAnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  
  // Filter states
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
      const [recordsData, summaryData] = await Promise.all([
        getClientAnalytics(client, startDateStr, endDateStr),
        getClientAnalyticsSummary(client, startDateStr, endDateStr)
      ]);
      setRecords(recordsData);
      setSummary(summaryData);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Get unique values for filter options
  const availableProducts = Array.from(new Set(records.map(record => record.product))).filter(Boolean);
  const availableCampaigns = Array.from(new Set(records.map(record => record.campaign))).filter(Boolean);
  const availableSources = Array.from(new Set(records.map(record => record.source))).filter(Boolean);
  const availableMediums = Array.from(new Set(records.map(record => record.medium))).filter(Boolean);

  const filteredRecords = records.filter(record => {
    // Product filter
    if (productFilter && record.product !== productFilter) return false;
    
    // Campaign filter
    if (campaignFilter && record.campaign !== campaignFilter) return false;
    
    // Source filter
    if (sourceFilter && record.source !== sourceFilter) return false;
    
    // Medium filter
    if (mediumFilter && record.medium !== mediumFilter) return false;
    
    // Search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        record.name.toLowerCase().includes(searchLower) ||
        record.email.toLowerCase().includes(searchLower) ||
        record.product.toLowerCase().includes(searchLower) ||
        record.campaign.toLowerCase().includes(searchLower) ||
        record.medium.toLowerCase().includes(searchLower) ||
        record.source.toLowerCase().includes(searchLower) ||
        record.client.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  const paginatedRecords = filteredRecords.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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
      
      <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" sx={{ 
            fontWeight: 700, 
            mb: 2, 
            background: 'linear-gradient(45deg, #06b6d4, #a21caf)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            📊 Analytics Table View
          </Typography>
          <Typography variant="h6" sx={{ color: '#94a3b8', mb: 4 }}>
            Complete data for {selectedClient === 'All' ? 'all clients' : selectedClient}
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

        {/* Summary Cards */}
        {summary && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
              }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
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
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
              }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
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
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
              }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
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
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
              }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    mb: 1,
                    background: 'linear-gradient(45deg, #06b6d4, #a21caf)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    {filteredRecords.length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                    Filtered Records
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Data Table */}
        <Card sx={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
        }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ background: 'rgba(255, 255, 255, 0.02)' }}>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Product</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Price</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Paid</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Commission</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Campaign</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Medium</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Source</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Client</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRecords.map((record, index) => (
                  <TableRow key={index} sx={{ '&:hover': { background: 'rgba(255, 255, 255, 0.02)' } }}>
                    <TableCell sx={{ color: '#f8fafc', fontWeight: 500 }}>
                      {record.name}
                    </TableCell>
                    <TableCell sx={{ color: '#94a3b8' }}>
                      {record.email}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={record.product} 
                        size="small"
                        sx={{ 
                          background: 'rgba(255, 255, 255, 0.1)',
                          color: '#f8fafc',
                          fontWeight: 500,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#10b981', fontWeight: 600 }}>
                      {formatCurrency(record.price)}
                    </TableCell>
                    <TableCell sx={{ color: '#f59e0b', fontWeight: 600 }}>
                      {formatCurrency(record.paid)}
                    </TableCell>
                    <TableCell sx={{ color: '#8b5cf6', fontWeight: 600 }}>
                      {formatCurrency(record.commission)}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={record.campaign} 
                        size="small"
                        sx={{ 
                          background: 'rgba(255, 255, 255, 0.1)',
                          color: '#f8fafc',
                          fontWeight: 500,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={record.medium} 
                        size="small"
                        sx={{ 
                          background: 'rgba(255, 255, 255, 0.1)',
                          color: '#f8fafc',
                          fontWeight: 500,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={record.source} 
                        size="small"
                        sx={{ 
                          background: 'rgba(255, 255, 255, 0.1)',
                          color: '#f8fafc',
                          fontWeight: 500,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={record.client} 
                        size="small"
                        sx={{ 
                          background: 'linear-gradient(45deg, #06b6d4, #a21caf)',
                          color: 'white',
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#94a3b8' }}>
                      {formatDate(record.date)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            component="div"
            count={filteredRecords.length}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
            sx={{
              color: '#94a3b8',
              '& .MuiTablePagination-select': {
                color: '#f8fafc',
              },
              '& .MuiTablePagination-selectIcon': {
                color: '#94a3b8',
              },
            }}
          />
        </Card>
      </Box>
    </Box>
  );
};

export default ClientAnalyticsTable; 