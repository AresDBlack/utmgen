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
  TextField,
  Grid,
  Chip,
  CircularProgress,
  TablePagination,
  InputAdornment
} from '@mui/material';
import { Search, FilterList } from '@mui/icons-material';
import { 
  getClientAnalytics, 
  getClientAnalyticsSummary,
  type ClientAnalyticsRecord,
  type ClientAnalyticsSummary
} from '../services/googleSheets';
import ClientAnalyticsNavbar from '../components/ClientAnalyticsNavbar';
import { useSearchParams } from 'react-router-dom';

const ClientAnalyticsTable = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [records, setRecords] = useState<ClientAnalyticsRecord[]>([]);
  const [summary, setSummary] = useState<ClientAnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  
  const selectedClient = searchParams.get('client') || 'All';

  const fetchData = async () => {
    setLoading(true);
    try {
      const client = selectedClient === 'All' ? undefined : selectedClient as 'Danny' | 'Nadine' | 'Shaun';
      const [recordsData, summaryData] = await Promise.all([
        getClientAnalytics(client),
        getClientAnalyticsSummary(client)
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const filteredRecords = records.filter(record => {
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
                  <Typography variant="h4" sx={{ color: '#10b981', fontWeight: 700, mb: 1 }}>
                    {formatCurrency(summary.totalRevenue)}
                  </Typography>
                  <Typography sx={{ color: '#94a3b8' }}>Total Revenue</Typography>
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
                  <Typography variant="h4" sx={{ color: '#f59e0b', fontWeight: 700, mb: 1 }}>
                    {formatCurrency(summary.totalCommission)}
                  </Typography>
                  <Typography sx={{ color: '#94a3b8' }}>Total Commission</Typography>
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
                  <Typography variant="h4" sx={{ color: '#f8fafc', fontWeight: 700, mb: 1 }}>
                    {summary.totalSales}
                  </Typography>
                  <Typography sx={{ color: '#94a3b8' }}>Total Sales</Typography>
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
                  <Typography variant="h4" sx={{ color: '#06b6d4', fontWeight: 700, mb: 1 }}>
                    {summary.uniqueCampaigns}
                  </Typography>
                  <Typography sx={{ color: '#94a3b8' }}>Unique Campaigns</Typography>
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
                  <Typography variant="h4" sx={{ color: '#8b5cf6', fontWeight: 700, mb: 1 }}>
                    {summary.uniqueProducts}
                  </Typography>
                  <Typography sx={{ color: '#94a3b8' }}>Unique Products</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Search and Filters */}
        <Card sx={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          mb: 3,
        }}>
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search by name, email, product, campaign, medium, source..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: '#94a3b8' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#f8fafc',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#06b6d4',
                      },
                    },
                    '& .MuiInputBase-input::placeholder': {
                      color: '#94a3b8',
                      opacity: 1,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <FilterList sx={{ color: '#94a3b8' }} />
                  <Typography sx={{ color: '#94a3b8' }}>
                    Showing {filteredRecords.length} of {records.length} records
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card sx={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
        }}>
          <TableContainer component={Paper} sx={{ 
            background: 'transparent',
            boxShadow: 'none',
          }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Product</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Revenue</TableCell>
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
                    <TableCell sx={{ color: '#f8fafc' }}>
                      {record.product}
                    </TableCell>
                    <TableCell sx={{ color: '#10b981', fontWeight: 600 }}>
                      {formatCurrency(record.afterStripeFees)}
                    </TableCell>
                    <TableCell sx={{ color: '#f59e0b', fontWeight: 600 }}>
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