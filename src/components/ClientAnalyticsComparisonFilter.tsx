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
  InputAdornment,
  Switch,
  FormControlLabel
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
  TrendingUp,
  CompareArrows,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';

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

interface ClientAnalyticsComparisonFilterProps {
  // Comparison mode state
  isComparisonMode: boolean;
  onComparisonModeChange: (enabled: boolean) => void;
  
  // Filter sets
  filterSetA: FilterSet;
  filterSetB: FilterSet;
  onFilterSetAChange: (filterSet: FilterSet) => void;
  onFilterSetBChange: (filterSet: FilterSet) => void;
  
  // Available options for filters
  availableProducts: string[];
  availableCampaigns: string[];
  availableSources: string[];
  availableMediums: string[];
  
  // UI state
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
}

const ClientAnalyticsComparisonFilter: React.FC<ClientAnalyticsComparisonFilterProps> = ({
  isComparisonMode,
  onComparisonModeChange,
  filterSetA,
  filterSetB,
  onFilterSetAChange,
  onFilterSetBChange,
  availableProducts,
  availableCampaigns,
  availableSources,
  availableMediums,
  isExpanded = false,
  onToggleExpanded
}) => {
  const [localSearchTermA, setLocalSearchTermA] = useState(filterSetA.searchTerm);
  const [localSearchTermB, setLocalSearchTermB] = useState(filterSetB.searchTerm);

  const handleSearchChangeA = (value: string) => {
    setLocalSearchTermA(value);
    onFilterSetAChange({ ...filterSetA, searchTerm: value });
  };

  const handleSearchChangeB = (value: string) => {
    setLocalSearchTermB(value);
    onFilterSetBChange({ ...filterSetB, searchTerm: value });
  };

  const handleClearAllFilters = () => {
    const emptyFilterSet: FilterSet = {
      name: '',
      startDate: null,
      endDate: null,
      selectedClient: 'All',
      productFilter: '',
      campaignFilter: '',
      sourceFilter: '',
      mediumFilter: '',
      searchTerm: '',
      isVisible: true,
    };
    onFilterSetAChange(emptyFilterSet);
    onFilterSetBChange(emptyFilterSet);
  };

  const hasActiveFiltersA = filterSetA.startDate || filterSetA.endDate || filterSetA.productFilter || filterSetA.campaignFilter || filterSetA.sourceFilter || filterSetA.mediumFilter || filterSetA.searchTerm;
  const hasActiveFiltersB = filterSetB.startDate || filterSetB.endDate || filterSetB.productFilter || filterSetB.campaignFilter || filterSetB.sourceFilter || filterSetB.mediumFilter || filterSetB.searchTerm;

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
              <CompareArrows sx={{ color: '#06b6d4', fontSize: 24 }} />
              <Typography variant="h6" sx={{ 
                color: '#f8fafc', 
                fontWeight: 600,
                background: 'linear-gradient(45deg, #06b6d4, #a21caf)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Comparison Mode
              </Typography>
              {(hasActiveFiltersA || hasActiveFiltersB) && (
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
            
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isComparisonMode}
                    onChange={(e) => onComparisonModeChange(e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#06b6d4',
                        '&:hover': {
                          backgroundColor: 'rgba(6, 182, 212, 0.08)',
                        },
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#06b6d4',
                      },
                    }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                    Comparison Mode
                  </Typography>
                }
              />
              
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
                  onClick={handleClearAllFilters}
                  disabled={!hasActiveFiltersA && !hasActiveFiltersB}
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

          {/* Comparison Mode Toggle */}
          {!isComparisonMode && (
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#94a3b8', mb: 2 }}>
                Enable comparison mode to compare data with two different filter sets
              </Typography>
            </Box>
          )}

          {/* Filter Sets */}
          {isComparisonMode && (
            <Collapse in={isExpanded}>
              <Grid container spacing={3}>
                {/* Filter Set A */}
                <Grid item xs={12} md={6}>
                  <Card sx={{
                    background: 'rgba(6, 182, 212, 0.05)',
                    border: '1px solid rgba(6, 182, 212, 0.2)',
                    borderRadius: '12px',
                  }}>
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6" sx={{ 
                          color: '#06b6d4', 
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}>
                          <Box sx={{ width: 12, height: 12, borderRadius: '50%', background: '#06b6d4' }} />
                          Filter Set A
                        </Typography>
                        <Tooltip title={filterSetA.isVisible ? "Hide data" : "Show data"}>
                          <IconButton
                            size="small"
                            onClick={() => onFilterSetAChange({ ...filterSetA, isVisible: !filterSetA.isVisible })}
                            sx={{ color: filterSetA.isVisible ? '#06b6d4' : '#94a3b8' }}
                          >
                            {filterSetA.isVisible ? <Visibility /> : <VisibilityOff />}
                          </IconButton>
                        </Tooltip>
                      </Box>

                      <Grid container spacing={2}>
                        {/* Client Filter */}
                        <Grid item xs={12}>
                          <FormControl fullWidth size="small">
                            <InputLabel sx={{ color: '#94a3b8' }}>Client</InputLabel>
                            <Select
                              value={filterSetA.selectedClient}
                              onChange={(e) => onFilterSetAChange({ ...filterSetA, selectedClient: e.target.value })}
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
                                    borderColor: 'rgba(6, 182, 212, 0.3)',
                                  },
                                  '&:hover fieldset': {
                                    borderColor: 'rgba(6, 182, 212, 0.5)',
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
                        <Grid item xs={12}>
                          <FormControl fullWidth size="small">
                            <InputLabel sx={{ color: '#94a3b8' }}>Product</InputLabel>
                            <Select
                              value={filterSetA.productFilter}
                              onChange={(e) => onFilterSetAChange({ ...filterSetA, productFilter: e.target.value })}
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
                                    borderColor: 'rgba(6, 182, 212, 0.3)',
                                  },
                                  '&:hover fieldset': {
                                    borderColor: 'rgba(6, 182, 212, 0.5)',
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
                        <Grid item xs={12}>
                          <FormControl fullWidth size="small">
                            <InputLabel sx={{ color: '#94a3b8' }}>Campaign</InputLabel>
                            <Select
                              value={filterSetA.campaignFilter}
                              onChange={(e) => onFilterSetAChange({ ...filterSetA, campaignFilter: e.target.value })}
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
                                    borderColor: 'rgba(6, 182, 212, 0.3)',
                                  },
                                  '&:hover fieldset': {
                                    borderColor: 'rgba(6, 182, 212, 0.5)',
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

                        {/* Date Filters */}
                        <Grid item xs={6}>
                          <DatePicker
                            label="Start Date"
                            value={filterSetA.startDate}
                            onChange={(date) => onFilterSetAChange({ ...filterSetA, startDate: date })}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                size: "small",
                                sx: {
                                  '& .MuiOutlinedInput-root': {
                                    color: '#f8fafc',
                                    '& fieldset': {
                                      borderColor: 'rgba(6, 182, 212, 0.3)',
                                    },
                                    '&:hover fieldset': {
                                      borderColor: 'rgba(6, 182, 212, 0.5)',
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
                        
                        <Grid item xs={6}>
                          <DatePicker
                            label="End Date"
                            value={filterSetA.endDate}
                            onChange={(date) => onFilterSetAChange({ ...filterSetA, endDate: date })}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                size: "small",
                                sx: {
                                  '& .MuiOutlinedInput-root': {
                                    color: '#f8fafc',
                                    '& fieldset': {
                                      borderColor: 'rgba(6, 182, 212, 0.3)',
                                    },
                                    '&:hover fieldset': {
                                      borderColor: 'rgba(6, 182, 212, 0.5)',
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

                        {/* Search */}
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            size="small"
                            placeholder="Search records..."
                            value={localSearchTermA}
                            onChange={(e) => handleSearchChangeA(e.target.value)}
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
                                  borderColor: 'rgba(6, 182, 212, 0.3)',
                                },
                                '&:hover fieldset': {
                                  borderColor: 'rgba(6, 182, 212, 0.5)',
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
                    </CardContent>
                  </Card>
                </Grid>

                {/* Filter Set B */}
                <Grid item xs={12} md={6}>
                  <Card sx={{
                    background: 'rgba(236, 72, 153, 0.05)',
                    border: '1px solid rgba(236, 72, 153, 0.2)',
                    borderRadius: '12px',
                  }}>
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6" sx={{ 
                          color: '#ec4899', 
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}>
                          <Box sx={{ width: 12, height: 12, borderRadius: '50%', background: '#ec4899' }} />
                          Filter Set B
                        </Typography>
                        <Tooltip title={filterSetB.isVisible ? "Hide data" : "Show data"}>
                          <IconButton
                            size="small"
                            onClick={() => onFilterSetBChange({ ...filterSetB, isVisible: !filterSetB.isVisible })}
                            sx={{ color: filterSetB.isVisible ? '#ec4899' : '#94a3b8' }}
                          >
                            {filterSetB.isVisible ? <Visibility /> : <VisibilityOff />}
                          </IconButton>
                        </Tooltip>
                      </Box>

                      <Grid container spacing={2}>
                        {/* Client Filter */}
                        <Grid item xs={12}>
                          <FormControl fullWidth size="small">
                            <InputLabel sx={{ color: '#94a3b8' }}>Client</InputLabel>
                            <Select
                              value={filterSetB.selectedClient}
                              onChange={(e) => onFilterSetBChange({ ...filterSetB, selectedClient: e.target.value })}
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
                                    borderColor: 'rgba(236, 72, 153, 0.3)',
                                  },
                                  '&:hover fieldset': {
                                    borderColor: 'rgba(236, 72, 153, 0.5)',
                                  },
                                  '&.Mui-focused fieldset': {
                                    borderColor: '#ec4899',
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
                        <Grid item xs={12}>
                          <FormControl fullWidth size="small">
                            <InputLabel sx={{ color: '#94a3b8' }}>Product</InputLabel>
                            <Select
                              value={filterSetB.productFilter}
                              onChange={(e) => onFilterSetBChange({ ...filterSetB, productFilter: e.target.value })}
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
                                    borderColor: 'rgba(236, 72, 153, 0.3)',
                                  },
                                  '&:hover fieldset': {
                                    borderColor: 'rgba(236, 72, 153, 0.5)',
                                  },
                                  '&.Mui-focused fieldset': {
                                    borderColor: '#ec4899',
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
                        <Grid item xs={12}>
                          <FormControl fullWidth size="small">
                            <InputLabel sx={{ color: '#94a3b8' }}>Campaign</InputLabel>
                            <Select
                              value={filterSetB.campaignFilter}
                              onChange={(e) => onFilterSetBChange({ ...filterSetB, campaignFilter: e.target.value })}
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
                                    borderColor: 'rgba(236, 72, 153, 0.3)',
                                  },
                                  '&:hover fieldset': {
                                    borderColor: 'rgba(236, 72, 153, 0.5)',
                                  },
                                  '&.Mui-focused fieldset': {
                                    borderColor: '#ec4899',
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

                        {/* Date Filters */}
                        <Grid item xs={6}>
                          <DatePicker
                            label="Start Date"
                            value={filterSetB.startDate}
                            onChange={(date) => onFilterSetBChange({ ...filterSetB, startDate: date })}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                size: "small",
                                sx: {
                                  '& .MuiOutlinedInput-root': {
                                    color: '#f8fafc',
                                    '& fieldset': {
                                      borderColor: 'rgba(236, 72, 153, 0.3)',
                                    },
                                    '&:hover fieldset': {
                                      borderColor: 'rgba(236, 72, 153, 0.5)',
                                    },
                                    '&.Mui-focused fieldset': {
                                      borderColor: '#ec4899',
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
                        
                        <Grid item xs={6}>
                          <DatePicker
                            label="End Date"
                            value={filterSetB.endDate}
                            onChange={(date) => onFilterSetBChange({ ...filterSetB, endDate: date })}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                size: "small",
                                sx: {
                                  '& .MuiOutlinedInput-root': {
                                    color: '#f8fafc',
                                    '& fieldset': {
                                      borderColor: 'rgba(236, 72, 153, 0.3)',
                                    },
                                    '&:hover fieldset': {
                                      borderColor: 'rgba(236, 72, 153, 0.5)',
                                    },
                                    '&.Mui-focused fieldset': {
                                      borderColor: '#ec4899',
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

                        {/* Search */}
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            size="small"
                            placeholder="Search records..."
                            value={localSearchTermB}
                            onChange={(e) => handleSearchChangeB(e.target.value)}
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
                                  borderColor: 'rgba(236, 72, 153, 0.3)',
                                },
                                '&:hover fieldset': {
                                  borderColor: 'rgba(236, 72, 153, 0.5)',
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: '#ec4899',
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
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Active Filters Display */}
              {(hasActiveFiltersA || hasActiveFiltersB) && (
                <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="body2" sx={{ color: '#94a3b8', mr: 1 }}>
                    Active filters:
                  </Typography>
                  
                  {/* Filter Set A Active Filters */}
                  {hasActiveFiltersA && (
                    <>
                      <Chip 
                        label="Set A" 
                        size="small" 
                        sx={{ 
                          background: 'rgba(6, 182, 212, 0.1)',
                          color: '#06b6d4',
                          fontWeight: 600,
                        }} 
                      />
                      {filterSetA.startDate && (
                        <Chip 
                          label={`A From: ${filterSetA.startDate.toLocaleDateString()}`} 
                          size="small" 
                          onDelete={() => onFilterSetAChange({ ...filterSetA, startDate: null })}
                          sx={{ 
                            background: 'rgba(6, 182, 212, 0.1)',
                            color: '#06b6d4',
                          }} 
                        />
                      )}
                      {filterSetA.endDate && (
                        <Chip 
                          label={`A To: ${filterSetA.endDate.toLocaleDateString()}`} 
                          size="small" 
                          onDelete={() => onFilterSetAChange({ ...filterSetA, endDate: null })}
                          sx={{ 
                            background: 'rgba(6, 182, 212, 0.1)',
                            color: '#06b6d4',
                          }} 
                        />
                      )}
                      {filterSetA.productFilter && (
                        <Chip 
                          label={`A Product: ${filterSetA.productFilter}`} 
                          size="small" 
                          onDelete={() => onFilterSetAChange({ ...filterSetA, productFilter: '' })}
                          sx={{ 
                            background: 'rgba(6, 182, 212, 0.1)',
                            color: '#06b6d4',
                          }} 
                        />
                      )}
                      {filterSetA.campaignFilter && (
                        <Chip 
                          label={`A Campaign: ${filterSetA.campaignFilter}`} 
                          size="small" 
                          onDelete={() => onFilterSetAChange({ ...filterSetA, campaignFilter: '' })}
                          sx={{ 
                            background: 'rgba(6, 182, 212, 0.1)',
                            color: '#06b6d4',
                          }} 
                        />
                      )}
                      {filterSetA.searchTerm && (
                        <Chip 
                          label={`A Search: "${filterSetA.searchTerm}"`} 
                          size="small" 
                          onDelete={() => onFilterSetAChange({ ...filterSetA, searchTerm: '' })}
                          sx={{ 
                            background: 'rgba(6, 182, 212, 0.1)',
                            color: '#06b6d4',
                          }} 
                        />
                      )}
                    </>
                  )}

                  {/* Filter Set B Active Filters */}
                  {hasActiveFiltersB && (
                    <>
                      <Chip 
                        label="Set B" 
                        size="small" 
                        sx={{ 
                          background: 'rgba(236, 72, 153, 0.1)',
                          color: '#ec4899',
                          fontWeight: 600,
                        }} 
                      />
                      {filterSetB.startDate && (
                        <Chip 
                          label={`B From: ${filterSetB.startDate.toLocaleDateString()}`} 
                          size="small" 
                          onDelete={() => onFilterSetBChange({ ...filterSetB, startDate: null })}
                          sx={{ 
                            background: 'rgba(236, 72, 153, 0.1)',
                            color: '#ec4899',
                          }} 
                        />
                      )}
                      {filterSetB.endDate && (
                        <Chip 
                          label={`B To: ${filterSetB.endDate.toLocaleDateString()}`} 
                          size="small" 
                          onDelete={() => onFilterSetBChange({ ...filterSetB, endDate: null })}
                          sx={{ 
                            background: 'rgba(236, 72, 153, 0.1)',
                            color: '#ec4899',
                          }} 
                        />
                      )}
                      {filterSetB.productFilter && (
                        <Chip 
                          label={`B Product: ${filterSetB.productFilter}`} 
                          size="small" 
                          onDelete={() => onFilterSetBChange({ ...filterSetB, productFilter: '' })}
                          sx={{ 
                            background: 'rgba(236, 72, 153, 0.1)',
                            color: '#ec4899',
                          }} 
                        />
                      )}
                      {filterSetB.campaignFilter && (
                        <Chip 
                          label={`B Campaign: ${filterSetB.campaignFilter}`} 
                          size="small" 
                          onDelete={() => onFilterSetBChange({ ...filterSetB, campaignFilter: '' })}
                          sx={{ 
                            background: 'rgba(236, 72, 153, 0.1)',
                            color: '#ec4899',
                          }} 
                        />
                      )}
                      {filterSetB.searchTerm && (
                        <Chip 
                          label={`B Search: "${filterSetB.searchTerm}"`} 
                          size="small" 
                          onDelete={() => onFilterSetBChange({ ...filterSetB, searchTerm: '' })}
                          sx={{ 
                            background: 'rgba(236, 72, 153, 0.1)',
                            color: '#ec4899',
                          }} 
                        />
                      )}
                    </>
                  )}
                </Box>
              )}
            </Collapse>
          )}
        </CardContent>
      </Card>
    </LocalizationProvider>
  );
};

export default ClientAnalyticsComparisonFilter; 