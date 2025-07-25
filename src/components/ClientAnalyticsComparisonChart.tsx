import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  IconButton,
  Collapse,
  Grid,
  Chip,
  Tooltip
} from '@mui/material';
import { 
  ExpandMore, 
  ExpandLess,
  TrendingUp,
  TrendingDown,
  Remove
} from '@mui/icons-material';

interface ComparisonData {
  label: string;
  valueA: number;
  valueB: number;
  unit?: string;
  format?: 'currency' | 'number' | 'percentage';
}

interface ClientAnalyticsComparisonChartProps {
  title: string;
  data: ComparisonData[];
  filterSetAName?: string;
  filterSetBName?: string;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
}

const ClientAnalyticsComparisonChart: React.FC<ClientAnalyticsComparisonChartProps> = ({
  title,
  data,
  filterSetAName = "Filter Set A",
  filterSetBName = "Filter Set B",
  isExpanded = false,
  onToggleExpanded
}) => {
  const formatValue = (value: number, format?: string, unit?: string) => {
    if (format === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(value);
    } else if (format === 'percentage') {
      return `${value.toFixed(1)}%`;
    } else {
      return `${value.toLocaleString()}${unit ? ` ${unit}` : ''}`;
    }
  };

  const getChangeIndicator = (valueA: number, valueB: number) => {
    if (valueA === valueB) {
      return <Remove sx={{ color: '#94a3b8', fontSize: 16 }} />;
    } else if (valueB > valueA) {
      return <TrendingUp sx={{ color: '#10b981', fontSize: 16 }} />;
    } else {
      return <TrendingDown sx={{ color: '#ef4444', fontSize: 16 }} />;
    }
  };

  const getChangePercentage = (valueA: number, valueB: number) => {
    if (valueA === 0) return valueB > 0 ? 100 : 0;
    return ((valueB - valueA) / valueA) * 100;
  };

  const getChangeColor = (valueA: number, valueB: number) => {
    if (valueA === valueB) return '#94a3b8';
    return valueB > valueA ? '#10b981' : '#ef4444';
  };

  return (
    <Card sx={{
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      mb: 3,
    }}>
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 2 
        }}>
          <Typography variant="h6" sx={{ 
            color: '#f8fafc', 
            fontWeight: 600,
          }}>
            {title}
          </Typography>
          
          {onToggleExpanded && (
            <Tooltip title={isExpanded ? "Collapse chart" : "Expand chart"}>
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
        </Box>

        {/* Legend */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', background: '#06b6d4' }} />
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              {filterSetAName}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', background: '#ec4899' }} />
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              {filterSetBName}
            </Typography>
          </Box>
        </Box>

        {/* Data Comparison */}
        <Collapse in={isExpanded}>
          <Grid container spacing={2}>
            {data.map((item, index) => {
              const changePercentage = getChangePercentage(item.valueA, item.valueB);
              const changeColor = getChangeColor(item.valueA, item.valueB);
              
              return (
                <Grid item xs={12} key={index}>
                  <Card sx={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                  }}>
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ color: '#f8fafc', fontWeight: 500 }}>
                          {item.label}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getChangeIndicator(item.valueA, item.valueB)}
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: changeColor,
                              fontWeight: 600,
                            }}
                          >
                            {changePercentage > 0 ? '+' : ''}{changePercentage.toFixed(1)}%
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Box sx={{ 
                            p: 2, 
                            borderRadius: '8px',
                            background: 'rgba(6, 182, 212, 0.1)',
                            border: '1px solid rgba(6, 182, 212, 0.2)',
                          }}>
                            <Typography variant="h6" sx={{ 
                              color: '#06b6d4', 
                              fontWeight: 700,
                              mb: 0.5
                            }}>
                              {formatValue(item.valueA, item.format, item.unit)}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                              {filterSetAName}
                            </Typography>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={6}>
                          <Box sx={{ 
                            p: 2, 
                            borderRadius: '8px',
                            background: 'rgba(236, 72, 153, 0.1)',
                            border: '1px solid rgba(236, 72, 153, 0.2)',
                          }}>
                            <Typography variant="h6" sx={{ 
                              color: '#ec4899', 
                              fontWeight: 700,
                              mb: 0.5
                            }}>
                              {formatValue(item.valueB, item.format, item.unit)}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                              {filterSetBName}
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
        </Collapse>

        {/* Summary when collapsed */}
        {!isExpanded && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              {data.length} metrics available
            </Typography>
            <Chip 
              label="Click to expand" 
              size="small" 
              sx={{ 
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#94a3b8',
              }} 
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientAnalyticsComparisonChart; 