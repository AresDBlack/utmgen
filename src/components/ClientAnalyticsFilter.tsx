import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  TextField, 
  Chip, 
  Collapse, 
  IconButton,
  Divider,
  Tooltip,
  InputAdornment
} from '@mui/material';
import { 
  DatePicker 
} from '@mui/x-date-pickers/DatePicker';
import { 
  LocalizationProvider 
} from '@mui/x-date-pickers/LocalizationProvider';
import { 
  AdapterDateFns 
} from '@mui/x-date-pickers/AdapterDateFns';
import { 
  FilterList, 
  Clear, 
  ExpandMore, 
  ExpandLess,
  Search,
  CalendarToday,
  Person,
  ShoppingCart,
  Campaign,
  TrendingUp
} from '@mui/icons-material';

interface ClientAnalyticsFilterProps {
  // Date filters
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  
  // Client filter
  selectedClient: string;
  onClientChange: (client: string) => void;
  
  // Additional filters
  productFilter: string;
  onProductFilterChange: (product: string) => void;
  campaignFilter: string;
  onCampaignFilterChange: (campaign: string) => void;
  sourceFilter: string;
  onSourceFilterChange: (source: string) => void;
  mediumFilter: string;
  onMediumFilterChange: (medium: string) => void;
  
  // Search
  searchTerm: string;
  onSearchChange: (term: string) => void;
  
  // Clear all
  onClearAll: () => void;
  
  // Available options for filters
  availableProducts: string[];
  availableCampaigns: string[];
  availableSources: string[];
  availableMediums: string[];
  
  // UI state
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
}

const ClientAnalyticsFilter: React.FC<ClientAnalyticsFilterProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  selectedClient,
  onClientChange,
  productFilter,
  onProductFilterChange,
  campaignFilter,
  onCampaignFilterChange,
  sourceFilter,
  onSourceFilterChange,
  mediumFilter,
  onMediumFilterChange,
  searchTerm,
  onSearchChange,
  onClearAll,
  availableProducts,
  availableCampaigns,
  availableSources,
  availableMediums,
  isExpanded = false,
  onToggleExpanded
}) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  const handleSearchChange = (value: string) => {
    setLocalSearchTerm(value);
    onSearchChange(value);
  };

  const hasActiveFilters = startDate || endDate || productFilter || campaignFilter || sourceFilter || mediumFilter || searchTerm;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Card sx={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        mb: 3,
        overflow: 'visible',
      }}>
        <CardContent sx={{ p: 3 }}>
          {/* Header */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 2 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterList sx={{ color: '#06b6d4', fontSize: 24 }} />
              <Typography variant="h6" sx={{ 
                color: '#f8fafc', 
                fontWeight: 600,
                background: 'linear-gradient(45deg, #06b6d4, #a21caf)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Advanced Filters
              </Typography>
              {hasActiveFilters && (
                <Chip 
                  label="Active" 
                  size="small" 
                  sx={{ 
                    background: 'linear-gradient(45deg, #10b981, #3b82f6)',
                    color: 'white',
                    fontWeight: 600,
                  }} 
                />
              )}
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              {onToggleExpanded && (
                <Tooltip title={isExpanded ? "Collapse filters" : "Expand filters"}>
                  <IconButton 
                    onClick={onToggleExpanded}
                    sx={{ 
                      color: '#94a3b8',
                      '&:hover': { color: '#06b6d4' }
                    }}
                  >
                    {isExpanded ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </Tooltip>
              )}
              
              <Tooltip title="Clear all filters">
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Clear />}
                  onClick={onClearAll}
                  disabled={!hasActiveFilters}
                  sx={{
                    color: '#94a3b8',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    '&:hover': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      background: 'rgba(255, 255, 255, 0.05)',
                    },
                    '&:disabled': {
                      color: 'rgba(255, 255, 255, 0.3)',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                    }
                  }}
                >
                  Clear All
                </Button>
              </Tooltip>
            </Box>
          </Box>

          {/* Quick Filters Row */}
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2}>
              {/* Client Filter */}
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ color: '#94a3b8' }}>Client</InputLabel>
                  <Select
                    value={selectedClient}
                    onChange={(e) => onClientChange(e.target.value)}
                    label="Client"
                    startAdornment={
                      <InputAdornment position="start">
                        <Person sx={{ color: '#94a3b8', fontSize: 20 }} />
                      </InputAdornment>
                    }
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
                      '& .MuiInputLabel-root': { color: '#94a3b8' },
                      '& .MuiSelect-select': { color: '#f8fafc' },
                    }}
                  >
                    <MenuItem value="All">All Clients</MenuItem>
                    <MenuItem value="Danny">Danny</MenuItem>
                    <MenuItem value="Nadine">Nadine</MenuItem>
                    <MenuItem value="Shaun">Shaun</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Product Filter */}
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ color: '#94a3b8' }}>Product</InputLabel>
                  <Select
                    value={productFilter}
                    onChange={(e) => onProductFilterChange(e.target.value)}
                    label="Product"
                    startAdornment={
                      <InputAdornment position="start">
                        <ShoppingCart sx={{ color: '#94a3b8', fontSize: 20 }} />
                      </InputAdornment>
                    }
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
                      '& .MuiInputLabel-root': { color: '#94a3b8' },
                      '& .MuiSelect-select': { color: '#f8fafc' },
                    }}
                  >
                    <MenuItem value="">All Products</MenuItem>
                    {availableProducts.map((product) => (
                      <MenuItem key={product} value={product}>{product}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Campaign Filter */}
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ color: '#94a3b8' }}>Campaign</InputLabel>
                  <Select
                    value={campaignFilter}
                    onChange={(e) => onCampaignFilterChange(e.target.value)}
                    label="Campaign"
                    startAdornment={
                      <InputAdornment position="start">
                        <Campaign sx={{ color: '#94a3b8', fontSize: 20 }} />
                      </InputAdornment>
                    }
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
                      '& .MuiInputLabel-root': { color: '#94a3b8' },
                      '& .MuiSelect-select': { color: '#f8fafc' },
                    }}
                  >
                    <MenuItem value="">All Campaigns</MenuItem>
                    {availableCampaigns.map((campaign) => (
                      <MenuItem key={campaign} value={campaign}>{campaign}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Search */}
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search records..."
                  value={localSearchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
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
            </Grid>
          </Box>

          {/* Advanced Filters (Collapsible) */}
          <Collapse in={isExpanded}>
            <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
            
            <Typography variant="subtitle2" sx={{ color: '#94a3b8', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarToday sx={{ fontSize: 18 }} />
              Date Range & Advanced Filters
            </Typography>

            <Grid container spacing={2}>
              {/* Date Filters */}
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={onStartDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                      sx: {
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
                        '& .MuiInputLabel-root': {
                          color: '#94a3b8',
                        },
                        '& .MuiInputBase-input': {
                          color: '#f8fafc',
                        },
                      },
                    },
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={onEndDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                      sx: {
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
                        '& .MuiInputLabel-root': {
                          color: '#94a3b8',
                        },
                        '& .MuiInputBase-input': {
                          color: '#f8fafc',
                        },
                      },
                    },
                  }}
                />
              </Grid>

              {/* Source Filter */}
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ color: '#94a3b8' }}>Source</InputLabel>
                  <Select
                    value={sourceFilter}
                    onChange={(e) => onSourceFilterChange(e.target.value)}
                    label="Source"
                    startAdornment={
                      <InputAdornment position="start">
                        <TrendingUp sx={{ color: '#94a3b8', fontSize: 20 }} />
                      </InputAdornment>
                    }
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
                      '& .MuiInputLabel-root': { color: '#94a3b8' },
                      '& .MuiSelect-select': { color: '#f8fafc' },
                    }}
                  >
                    <MenuItem value="">All Sources</MenuItem>
                    {availableSources.map((source) => (
                      <MenuItem key={source} value={source}>{source}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Medium Filter */}
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ color: '#94a3b8' }}>Medium</InputLabel>
                  <Select
                    value={mediumFilter}
                    onChange={(e) => onMediumFilterChange(e.target.value)}
                    label="Medium"
                    startAdornment={
                      <InputAdornment position="start">
                        <TrendingUp sx={{ color: '#94a3b8', fontSize: 20 }} />
                      </InputAdornment>
                    }
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
                      '& .MuiInputLabel-root': { color: '#94a3b8' },
                      '& .MuiSelect-select': { color: '#f8fafc' },
                    }}
                  >
                    <MenuItem value="">All Mediums</MenuItem>
                    {availableMediums.map((medium) => (
                      <MenuItem key={medium} value={medium}>{medium}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Collapse>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="body2" sx={{ color: '#94a3b8', mr: 1 }}>
                Active filters:
              </Typography>
              {startDate && (
                <Chip 
                  label={`From: ${startDate.toLocaleDateString()}`} 
                  size="small" 
                  onDelete={() => onStartDateChange(null)}
                  sx={{ 
                    background: 'rgba(6, 182, 212, 0.1)',
                    color: '#06b6d4',
                  }} 
                />
              )}
              {endDate && (
                <Chip 
                  label={`To: ${endDate.toLocaleDateString()}`} 
                  size="small" 
                  onDelete={() => onEndDateChange(null)}
                  sx={{ 
                    background: 'rgba(6, 182, 212, 0.1)',
                    color: '#06b6d4',
                  }} 
                />
              )}
              {productFilter && (
                <Chip 
                  label={`Product: ${productFilter}`} 
                  size="small" 
                  onDelete={() => onProductFilterChange('')}
                  sx={{ 
                    background: 'rgba(16, 185, 129, 0.1)',
                    color: '#10b981',
                  }} 
                />
              )}
              {campaignFilter && (
                <Chip 
                  label={`Campaign: ${campaignFilter}`} 
                  size="small" 
                  onDelete={() => onCampaignFilterChange('')}
                  sx={{ 
                    background: 'rgba(245, 158, 11, 0.1)',
                    color: '#f59e0b',
                  }} 
                />
              )}
              {sourceFilter && (
                <Chip 
                  label={`Source: ${sourceFilter}`} 
                  size="small" 
                  onDelete={() => onSourceFilterChange('')}
                  sx={{ 
                    background: 'rgba(236, 72, 153, 0.1)',
                    color: '#ec4899',
                  }} 
                />
              )}
              {mediumFilter && (
                <Chip 
                  label={`Medium: ${mediumFilter}`} 
                  size="small" 
                  onDelete={() => onMediumFilterChange('')}
                  sx={{ 
                    background: 'rgba(139, 92, 246, 0.1)',
                    color: '#8b5cf6',
                  }} 
                />
              )}
              {searchTerm && (
                <Chip 
                  label={`Search: "${searchTerm}"`} 
                  size="small" 
                  onDelete={() => onSearchChange('')}
                  sx={{ 
                    background: 'rgba(59, 130, 246, 0.1)',
                    color: '#3b82f6',
                  }} 
                />
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </LocalizationProvider>
  );
};

export default ClientAnalyticsFilter; 