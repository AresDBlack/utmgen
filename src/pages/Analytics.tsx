import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  IconButton,
  Tooltip as MuiTooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Chip,
  CircularProgress,
  TextField,
  Popover,
  Button,
} from '@mui/material';
import {
  TrendingUp,
  People,
  Link,
  CalendarToday,
  Refresh,
  Devices,
  Language,
  LocationOn,
  AccessTime,
  Campaign,
  DateRange,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { googleSheetsService } from '../services/googleSheets';
import type { UTMRecord, Campaign as CampaignType } from '../services/googleSheets';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface ChartData {
  name: string;
  value: number;
}

interface TimeData {
  hour: string;
  clicks: number;
}

interface CampaignData {
  name: string;
  clicks: number;
  conversion: number;
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [records, setRecords] = useState<UTMRecord[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignType[]>([]);
  const [timeRange, setTimeRange] = useState('7d');
  const [department, setDepartment] = useState('all');
  const [selectedCampaign, setSelectedCampaign] = useState('all');
  const [isClient, setIsClient] = useState(false);
  const [dateRangeAnchor, setDateRangeAnchor] = useState<null | HTMLElement>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    setIsClient(true);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [utmRecords, campaignData] = await Promise.all([
        googleSheetsService.getUTMRecords(),
        googleSheetsService.getCampaigns()
      ]);
      setRecords(utmRecords);
      setCampaigns(campaignData);
      setError('');
    } catch (error) {
      console.error('Error loading analytics:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTimeRangeChange = (event: SelectChangeEvent) => {
    setTimeRange(event.target.value);
    if (event.target.value !== 'custom') {
      setStartDate('');
      setEndDate('');
    }
  };

  const handleDepartmentChange = (event: SelectChangeEvent) => {
    setDepartment(event.target.value);
  };

  const handleCampaignChange = (event: SelectChangeEvent) => {
    setSelectedCampaign(event.target.value);
  };

  const handleDateRangeClick = (event: React.MouseEvent<HTMLElement>) => {
    setDateRangeAnchor(event.currentTarget);
  };

  const handleDateRangeClose = () => {
    setDateRangeAnchor(null);
  };

  const handleCustomDateRange = () => {
    if (startDate && endDate) {
      setTimeRange('custom');
      handleDateRangeClose();
    }
  };

  const filteredRecords = records.filter(record => {
    if (department !== 'all' && record.department !== department) return false;
    if (selectedCampaign !== 'all' && record.campaign !== selectedCampaign) return false;
    
    if (timeRange === 'custom' && startDate && endDate) {
      const recordDate = new Date(record.createdAt);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return recordDate >= start && recordDate <= end;
    }
    
    // Predefined time range filtering
    const recordDate = new Date(record.createdAt);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24));
    
    switch (timeRange) {
      case '24h':
        return diffInDays <= 1;
      case '7d':
        return diffInDays <= 7;
      case '30d':
        return diffInDays <= 30;
      case '90d':
        return diffInDays <= 90;
      default:
        return true;
    }
  });

  // Basic Metrics
  const totalClicks = filteredRecords.length;
  const uniqueVisitors = new Set(filteredRecords.map(r => r.client)).size;
  const uniqueCampaigns = new Set(filteredRecords.map(r => r.campaign)).size;

  // Device Distribution
  const deviceData: ChartData[] = [
    { name: 'Desktop', value: 65 },
    { name: 'Mobile', value: 25 },
    { name: 'Tablet', value: 10 },
  ];

  // Browser Distribution
  const browserData: ChartData[] = [
    { name: 'Chrome', value: 60 },
    { name: 'Safari', value: 20 },
    { name: 'Firefox', value: 10 },
    { name: 'Edge', value: 8 },
    { name: 'Other', value: 2 },
  ];

  // Geographic Distribution
  const locationData: ChartData[] = [
    { name: 'United States', value: 40 },
    { name: 'United Kingdom', value: 20 },
    { name: 'Canada', value: 15 },
    { name: 'Australia', value: 10 },
    { name: 'Other', value: 15 },
  ];

  // Time Distribution
  const timeData: TimeData[] = [
    { hour: '00:00', clicks: 10 },
    { hour: '04:00', clicks: 5 },
    { hour: '08:00', clicks: 20 },
    { hour: '12:00', clicks: 35 },
    { hour: '16:00', clicks: 30 },
    { hour: '20:00', clicks: 15 },
  ];

  // Top Campaigns
  const topCampaigns: CampaignData[] = [
    { name: 'Summer Sale', clicks: 1200, conversion: 4.5 },
    { name: 'New Product Launch', clicks: 950, conversion: 3.8 },
    { name: 'Holiday Special', clicks: 800, conversion: 3.2 },
    { name: 'Email Newsletter', clicks: 600, conversion: 2.9 },
    { name: 'Social Media', clicks: 450, conversion: 2.5 },
  ];

  // Update the Pie chart label renderer
  const renderCustomizedLabel = ({ name, percent }: { name: string; percent: number }) => {
    return `${name} ${(percent * 100).toFixed(0)}%`;
  };

  const renderPieChart = (data: ChartData[], title: string) => (
    <Card sx={{ 
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      p: 2,
    }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>{title}</Typography>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                background: 'rgba(0, 0, 0, 0.8)',
                border: 'none',
                borderRadius: '8px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const renderLineChart = (data: TimeData[]) => (
    <Card sx={{ 
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      p: 2,
    }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>Clicks Over Time</Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis dataKey="hour" stroke="#fff" />
            <YAxis stroke="#fff" />
            <Tooltip 
              contentStyle={{ 
                background: 'rgba(0, 0, 0, 0.8)',
                border: 'none',
                borderRadius: '8px',
              }}
            />
            <Line 
              type="monotone" 
              dataKey="clicks" 
              stroke="#6366f1" 
              strokeWidth={2}
              dot={{ fill: '#6366f1' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  // Get unique campaigns for the filter
  const uniqueCampaignsForFilter = Array.from(new Set(records.map(r => r.campaign)));

  if (!isClient) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      maxWidth: 1200, 
      mx: 'auto', 
      p: 3,
      minHeight: '100vh',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography 
            variant="h4" 
            sx={{
              background: 'linear-gradient(45deg, #8b5cf6, #10b981)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
            }}
          >
            Analytics Dashboard
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                onChange={handleTimeRangeChange}
                label="Time Range"
              >
                <MenuItem value="24h">Last 24 hours</MenuItem>
                <MenuItem value="7d">Last 7 days</MenuItem>
                <MenuItem value="30d">Last 30 days</MenuItem>
                <MenuItem value="90d">Last 90 days</MenuItem>
                <MenuItem value="custom">Custom Range</MenuItem>
              </Select>
            </FormControl>
            {timeRange === 'custom' && (
              <IconButton onClick={handleDateRangeClick} sx={{ color: 'primary.main' }}>
                <DateRange />
              </IconButton>
            )}
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Department</InputLabel>
              <Select
                value={department}
                onChange={handleDepartmentChange}
                label="Department"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="marketing">Marketing</MenuItem>
                <MenuItem value="sales">Sales</MenuItem>
                <MenuItem value="social">Social</MenuItem>
                <MenuItem value="others">Others</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Campaign</InputLabel>
              <Select
                value={selectedCampaign}
                onChange={handleCampaignChange}
                label="Campaign"
              >
                <MenuItem value="all">All Campaigns</MenuItem>
                {campaigns.map(campaign => (
                  <MenuItem key={campaign.campaignId} value={campaign.campaignId}>
                    {campaign.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <MuiTooltip title="Refresh data">
              <IconButton onClick={loadData} sx={{ color: 'primary.main' }}>
                <Refresh />
              </IconButton>
            </MuiTooltip>
          </Box>
        </Box>

        <Popover
          open={Boolean(dateRangeAnchor)}
          anchorEl={dateRangeAnchor}
          onClose={handleDateRangeClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        >
          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <Button
              variant="contained"
              onClick={handleCustomDateRange}
              disabled={!startDate || !endDate}
            >
              Apply Date Range
            </Button>
          </Box>
        </Popover>

        {error && (
          <Paper 
            sx={{ 
              p: 2, 
              mb: 3, 
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '8px',
            }}
          >
            <Typography color="error">{error}</Typography>
          </Paper>
        )}

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Card 
              sx={{ 
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                height: '100%',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TrendingUp sx={{ color: '#6366f1', mr: 1 }} />
                  <Typography variant="h6">Total Clicks</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {loading ? '...' : totalClicks.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Total number of clicks across all UTM links
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card 
              sx={{ 
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                height: '100%',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <People sx={{ color: '#10b981', mr: 1 }} />
                  <Typography variant="h6">Unique Visitors</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {loading ? '...' : uniqueVisitors.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Number of unique clients who clicked the links
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card 
              sx={{ 
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                height: '100%',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Link sx={{ color: '#f59e0b', mr: 1 }} />
                  <Typography variant="h6">Active Campaigns</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {loading ? '...' : uniqueCampaigns.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Number of unique campaigns with active links
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            {renderPieChart(deviceData, 'Device Distribution')}
          </Grid>

          <Grid item xs={12} md={6}>
            {renderPieChart(browserData, 'Browser Distribution')}
          </Grid>

          <Grid item xs={12}>
            {renderLineChart(timeData)}
          </Grid>
        </Grid>

        <Card sx={{ 
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          p: 2,
        }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Top Performing Campaigns</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Campaign</TableCell>
                    <TableCell align="right">Clicks</TableCell>
                    <TableCell align="right">Conversion Rate</TableCell>
                    <TableCell align="right">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topCampaigns.map((campaign) => (
                    <TableRow key={campaign.name}>
                      <TableCell component="th" scope="row">
                        {campaign.name}
                      </TableCell>
                      <TableCell align="right">{campaign.clicks.toLocaleString()}</TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={campaign.conversion * 20} 
                              sx={{ 
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 4,
                                  backgroundColor: '#10b981',
                                },
                              }}
                            />
                          </Box>
                          <Box sx={{ minWidth: 35 }}>
                            <Typography variant="body2" color="text.secondary">
                              {campaign.conversion}%
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={campaign.conversion > 3 ? "High Performing" : "Normal"} 
                          color={campaign.conversion > 3 ? "success" : "default"}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default Analytics; 