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
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  Badge,
  Tabs,
  Tab
} from '@mui/material';
import { 
  getClientSubscriptions, 
  getClientSubscriptionSummary,
  type SubscriptionRecord,
  type SubscriptionSummary
} from '../services/googleSheets';
import ClientAnalyticsNavbar from '../components/ClientAnalyticsNavbar';
import ClientAnalyticsFilter from '../components/ClientAnalyticsFilter';
import { useSearchParams } from 'react-router-dom';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pause as PauseIcon
} from '@mui/icons-material';

const ClientAnalyticsSubscriptions = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [subscriptions, setSubscriptions] = useState<SubscriptionRecord[]>([]);
  const [summary, setSummary] = useState<SubscriptionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  
  // Filter states
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [productFilter, setProductFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [billingCycleFilter, setBillingCycleFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<SubscriptionRecord | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  
  const selectedClient = searchParams.get('client') || 'All';

  const fetchData = async () => {
    setLoading(true);
    try {
      const client = selectedClient === 'All' ? undefined : selectedClient as 'Danny' | 'Nadine' | 'Shaun';
      const startDateStr = startDate ? startDate.toISOString().split('T')[0] : undefined;
      const endDateStr = endDate ? endDate.toISOString().split('T')[0] : undefined;
      const [subscriptionsData, summaryData] = await Promise.all([
        getClientSubscriptions(client, startDateStr, endDateStr),
        getClientSubscriptionSummary(client, startDateStr, endDateStr)
      ]);
      setSubscriptions(subscriptionsData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error fetching subscription data:', error);
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
    setStatusFilter('');
    setBillingCycleFilter('');
    setSearchTerm('');
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'paused':
        return 'warning';
      case 'expired':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon />;
      case 'cancelled':
        return <CancelIcon />;
      case 'paused':
        return <PauseIcon />;
      case 'expired':
        return <WarningIcon />;
      default:
        return <CheckCircleIcon />; // Default icon
    }
  };

  // Get unique values for filter options
  const availableProducts = Array.from(new Set(subscriptions.map(sub => sub.product))).filter(Boolean);
  const availableStatuses = ['active', 'cancelled', 'paused', 'expired'];
  const availableBillingCycles = ['monthly', 'quarterly', 'yearly'];

  const filteredSubscriptions = subscriptions.filter(subscription => {
    // Product filter
    if (productFilter && subscription.product !== productFilter) return false;
    
    // Status filter
    if (statusFilter && subscription.status !== statusFilter) return false;
    
    // Billing cycle filter
    if (billingCycleFilter && subscription.billingCycle !== billingCycleFilter) return false;
    
    // Search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        subscription.customerName.toLowerCase().includes(searchLower) ||
        subscription.email.toLowerCase().includes(searchLower) ||
        subscription.product.toLowerCase().includes(searchLower) ||
        subscription.subscriptionId.toLowerCase().includes(searchLower) ||
        subscription.paymentMethod.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  const handleAddSubscription = () => {
    setEditingSubscription(null);
    setDialogOpen(true);
  };

  const handleEditSubscription = (subscription: SubscriptionRecord) => {
    setEditingSubscription(subscription);
    setDialogOpen(true);
  };

  const handleDeleteSubscription = (subscription: SubscriptionRecord) => {
    // TODO: Implement delete functionality
    setSnackbarMessage('Delete functionality coming soon!');
    setSnackbarSeverity('error');
    setSnackbarOpen(true);
  };

  const handleSaveSubscription = () => {
    // TODO: Implement save functionality
    setSnackbarMessage('Save functionality coming soon!');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    setDialogOpen(false);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingSubscription(null);
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
      
      <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" sx={{ 
            fontWeight: 700, 
            mb: 2, 
            background: 'linear-gradient(45deg, #06b6d4, #a21caf)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            💳 Subscription Management
          </Typography>
          <Typography variant="h6" sx={{ color: '#94a3b8', mb: 4 }}>
            Manage and analyze subscription data for {selectedClient === 'All' ? 'all clients' : selectedClient}
          </Typography>
        </Box>

        {/* Filter Component */}
        <ClientAnalyticsFilter
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={handleStartDateChange}
          onEndDateChange={handleEndDateChange}
          selectedClient={selectedClient}
          onClientChange={handleClientChange}
          productFilter={productFilter}
          onProductFilterChange={setProductFilter}
          campaignFilter={statusFilter}
          onCampaignFilterChange={setStatusFilter}
          sourceFilter={billingCycleFilter}
          onSourceFilterChange={setBillingCycleFilter}
          mediumFilter=""
          onMediumFilterChange={() => {}}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onClearAll={handleClearAllFilters}
          availableProducts={availableProducts}
          availableCampaigns={availableStatuses}
          availableSources={availableBillingCycles}
          availableMediums={[]}
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
                    {summary.totalSubscriptions}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                    Total Subscriptions
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
                    {summary.activeSubscriptions}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                    Active Subscriptions
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
                    {formatCurrency(summary.totalRevenue)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                    Monthly Recurring Revenue
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
                    {formatPercentage(summary.renewalRate)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                    Renewal Rate
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Action Button */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddSubscription}
            sx={{
              background: 'linear-gradient(45deg, #06b6d4, #a21caf)',
              color: 'white',
              borderRadius: '12px',
              px: 3,
              py: 1.5,
              '&:hover': {
                background: 'linear-gradient(45deg, #0891b2, #be185d)',
              }
            }}
          >
            Add Subscription
          </Button>
        </Box>

        {/* Tabs */}
        <Card sx={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
        }}>
          <Box sx={{ borderBottom: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              sx={{
                '& .MuiTab-root': {
                  color: '#94a3b8',
                  '&.Mui-selected': {
                    color: '#06b6d4',
                  },
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#06b6d4',
                },
              }}
            >
              <Tab label="All Subscriptions" />
              <Tab label="Active" />
              <Tab label="Cancelled" />
              <Tab label="Paused" />
              <Tab label="Expired" />
            </Tabs>
          </Box>

          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: 'rgba(255, 255, 255, 0.02)' }}>
                    <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Customer</TableCell>
                    <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Product</TableCell>
                    <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Amount</TableCell>
                    <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Billing Cycle</TableCell>
                    <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Next Billing</TableCell>
                    <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSubscriptions
                    .filter(subscription => {
                      if (tabValue === 0) return true; // All
                      if (tabValue === 1) return subscription.status === 'active';
                      if (tabValue === 2) return subscription.status === 'cancelled';
                      if (tabValue === 3) return subscription.status === 'paused';
                      if (tabValue === 4) return subscription.status === 'expired';
                      return true;
                    })
                    .map((subscription) => (
                    <TableRow key={subscription.subscriptionId} sx={{ '&:hover': { background: 'rgba(255, 255, 255, 0.02)' } }}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ color: '#f8fafc', fontWeight: 500 }}>
                            {subscription.customerName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                            {subscription.email}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: '#f8fafc' }}>
                        {subscription.product}
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(subscription.status)}
                          label={subscription.status}
                          color={getStatusColor(subscription.status) as any}
                          size="small"
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#10b981', fontWeight: 600 }}>
                        {formatCurrency(subscription.amount)}
                      </TableCell>
                      <TableCell sx={{ color: '#f8fafc', textTransform: 'capitalize' }}>
                        {subscription.billingCycle}
                      </TableCell>
                      <TableCell sx={{ color: '#f8fafc' }}>
                        {formatDate(subscription.nextBillingDate)}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton size="small" sx={{ color: '#06b6d4' }}>
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Subscription">
                            <IconButton 
                              size="small" 
                              sx={{ color: '#f59e0b' }}
                              onClick={() => handleEditSubscription(subscription)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Subscription">
                            <IconButton 
                              size="small" 
                              sx={{ color: '#ef4444' }}
                              onClick={() => handleDeleteSubscription(subscription)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>

      {/* Add/Edit Subscription Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
          }
        }}
      >
        <DialogTitle sx={{ color: '#f8fafc' }}>
          {editingSubscription ? 'Edit Subscription' : 'Add New Subscription'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Customer Name"
                defaultValue={editingSubscription?.customerName || ''}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#f8fafc',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                    '&.Mui-focused fieldset': { borderColor: '#06b6d4' },
                  },
                  '& .MuiInputLabel-root': { color: '#94a3b8' },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                defaultValue={editingSubscription?.email || ''}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#f8fafc',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                    '&.Mui-focused fieldset': { borderColor: '#06b6d4' },
                  },
                  '& .MuiInputLabel-root': { color: '#94a3b8' },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Product"
                defaultValue={editingSubscription?.product || ''}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#f8fafc',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                    '&.Mui-focused fieldset': { borderColor: '#06b6d4' },
                  },
                  '& .MuiInputLabel-root': { color: '#94a3b8' },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#94a3b8' }}>Status</InputLabel>
                <Select
                  defaultValue={editingSubscription?.status || 'active'}
                  sx={{
                    color: '#f8fafc',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#06b6d4',
                    },
                  }}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                  <MenuItem value="paused">Paused</MenuItem>
                  <MenuItem value="expired">Expired</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                defaultValue={editingSubscription?.amount || ''}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#f8fafc',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                    '&.Mui-focused fieldset': { borderColor: '#06b6d4' },
                  },
                  '& .MuiInputLabel-root': { color: '#94a3b8' },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#94a3b8' }}>Billing Cycle</InputLabel>
                <Select
                  defaultValue={editingSubscription?.billingCycle || 'monthly'}
                  sx={{
                    color: '#f8fafc',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#06b6d4',
                    },
                  }}
                >
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="quarterly">Quarterly</MenuItem>
                  <MenuItem value="yearly">Yearly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                defaultValue={editingSubscription?.notes || ''}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#f8fafc',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                    '&.Mui-focused fieldset': { borderColor: '#06b6d4' },
                  },
                  '& .MuiInputLabel-root': { color: '#94a3b8' },
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDialog} sx={{ color: '#94a3b8' }}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveSubscription}
            variant="contained"
            sx={{
              background: 'linear-gradient(45deg, #06b6d4, #a21caf)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(45deg, #0891b2, #be185d)',
              }
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ClientAnalyticsSubscriptions; 