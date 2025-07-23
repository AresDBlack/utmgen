import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Card,
  CardContent,
  Chip,
  Tooltip,
  InputAdornment,
} from '@mui/material';

import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import SearchIcon from '@mui/icons-material/Search';
import { motion, AnimatePresence } from 'framer-motion';
import { googleSheetsService } from '../services/googleSheets';
import type { UTMRecord, Client, Campaign, SourceType } from "../services/googleSheets";


interface UTMLinkListProps {
  department: 'marketing' | 'sales' | 'social' | 'others' | 'affiliates';
  reloadTrigger?: number;
}

interface FilterState {
  department: string;
  client: string;
  campaign: string;
  source: string;
  sourceType: string;
  search: string;
}

const UTMLinkList = ({ department, reloadTrigger = 0 }: UTMLinkListProps) => {
  const [links, setLinks] = useState<UTMRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<Record<string, boolean>>({});
  const [clientsData, setClientsData] = useState<Client[]>([]);
  const [campaignsData, setCampaignsData] = useState<Campaign[]>([]);
  const [sourceTypesData, setSourceTypesData] = useState<SourceType[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    department: department,
    client: '',
    campaign: '',
    source: '',
    sourceType: '',
    search: '',
  });

  // Get unique values for filters
  const departments = Array.from(new Set(links.map(link => link.department).filter(Boolean))) as ('marketing' | 'sales' | 'social' | 'others')[];
  const uniqueClients = Array.from(new Set(links.map(link => link.client)));
  const uniqueCampaigns = Array.from(new Set(links.map(link => link.campaign)));
  const uniqueSources = Array.from(new Set(links.map(link => link.source)));
  const uniqueSourceTypes = Array.from(new Set(links.map(link => link.sourceType)));

  // Load all necessary data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [clients, campaigns, sourceTypes] = await Promise.all([
          googleSheetsService.getClients(),
          googleSheetsService.getCampaigns(),
          googleSheetsService.getSourceTypes(),
        ]);
        setClientsData(clients);
        setCampaignsData(campaigns);
        setSourceTypesData(sourceTypes);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  const loadLinks = async () => {
    try {
      setLoading(true);
      const records = await googleSheetsService.getUTMRecords();
      setLinks(records);
      setError('');
    } catch (error) {
      console.error('Error loading UTM records:', error);
      setError('Failed to load UTM records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLinks();
  }, [reloadTrigger]);

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(prev => ({ ...prev, [url]: true }));
    setTimeout(() => {
      setCopied(prev => ({ ...prev, [url]: false }));
    }, 2000);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Filter links based on selected filters
  const filteredLinks = links.filter((link: UTMRecord) => {
    if (filters.department && link.department !== filters.department) return false;
    if (filters.client && link.client !== filters.client) return false;
    if (filters.campaign && link.campaign !== filters.campaign) return false;
    if (filters.source && link.source !== filters.source) return false;
    if (filters.sourceType && link.sourceType !== filters.sourceType) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        link.url.toLowerCase().includes(searchLower) ||
        link.client.toLowerCase().includes(searchLower) ||
        link.campaign.toLowerCase().includes(searchLower) ||
        link.source.toLowerCase().includes(searchLower) ||
        link.sourceType.toLowerCase().includes(searchLower) ||
        link.utmUrl.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  // Helper function to get name from ID
  const getNameFromId = (id: string, type: 'client' | 'campaign' | 'sourceType'): string => {
    switch (type) {
      case 'client':
        return clientsData.find(c => c.clientId === id)?.name || id;
      case 'campaign':
        return campaignsData.find(c => c.campaignId === id)?.name || id;
      case 'sourceType':
        return sourceTypesData.find(s => s.sourceTypeId === id)?.name || id;
      default:
        return id;
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
          Generated UTM Links
        </Typography>

        {/* Filter Controls */}
        <Paper 
          sx={{ 
            p: 3, 
            mb: 3,
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
          }}
        >
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
            gap: 2
          }}>
            <Box>
              <FormControl fullWidth size="small">
                <InputLabel>Department</InputLabel>
                <Select
                  name="department"
                  value={filters.department}
                  onChange={handleFilterChange}
                  label="Department"
                >
                  <MenuItem value="">All</MenuItem>
                  {departments.map(dept => (
                    <MenuItem key={dept} value={dept}>
                      {dept.charAt(0).toUpperCase() + dept.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box>
              <FormControl fullWidth size="small">
                <InputLabel>Client</InputLabel>
                <Select
                  name="client"
                  value={filters.client}
                  onChange={handleFilterChange}
                  label="Client"
                >
                  <MenuItem value="">All</MenuItem>
                  {uniqueClients.map(clientId => {
                    const client = clientsData.find(c => c.clientId === clientId);
                    return (
                      <MenuItem key={clientId} value={clientId}>
                        {client?.name || clientId}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Box>
            <Box>
              <FormControl fullWidth size="small">
                <InputLabel>Campaign</InputLabel>
                <Select
                  name="campaign"
                  value={filters.campaign}
                  onChange={handleFilterChange}
                  label="Campaign"
                >
                  <MenuItem value="">All</MenuItem>
                  {uniqueCampaigns.map(campaignId => {
                    const campaign = campaignsData.find(c => c.campaignId === campaignId);
                    return (
                      <MenuItem key={campaignId} value={campaignId}>
                        {campaign?.name || campaignId}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Box>
            <Box>
              <FormControl fullWidth size="small">
                <InputLabel>Source Name</InputLabel>
                <Select
                  name="source"
                  value={filters.source}
                  onChange={handleFilterChange}
                  label="Source Name"
                >
                  <MenuItem value="">All</MenuItem>
                  {uniqueSources.map(source => (
                    <MenuItem key={source} value={source}>
                      {source}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box>
              <FormControl fullWidth size="small">
                <InputLabel>Source Type</InputLabel>
                <Select
                  name="sourceType"
                  value={filters.sourceType}
                  onChange={handleFilterChange}
                  label="Source Type"
                >
                  <MenuItem value="">All</MenuItem>
                  {uniqueSourceTypes.map(sourceTypeId => {
                    const sourceType = sourceTypesData.find(s => s.sourceTypeId === sourceTypeId);
                    return (
                      <MenuItem key={sourceTypeId} value={sourceTypeId}>
                        {sourceType?.name || sourceTypeId}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ gridColumn: { xs: '1 / -1', sm: '1 / -1', md: '1 / -1' } }}>
              <TextField
                fullWidth
                size="small"
                name="search"
                label="Search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search by URL, client, campaign, source, or source type"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Box>
        </Paper>

        {/* Links List */}
        <AnimatePresence>
          {filteredLinks.map((link) => (
            <motion.div
              key={link.utmId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                sx={{
                  mb: 2,
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                        {link.url}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip 
                          label={getNameFromId(link.client, 'client')} 
                          size="small" 
                          sx={{ 
                            background: 'rgba(99, 102, 241, 0.1)',
                            color: '#6366f1',
                          }} 
                        />
                        <Chip 
                          label={getNameFromId(link.campaign, 'campaign')} 
                          size="small" 
                          sx={{ 
                            background: 'rgba(16, 185, 129, 0.1)',
                            color: '#10b981',
                          }} 
                        />
                        <Chip 
                          label={getNameFromId(link.sourceType, 'sourceType')} 
                          size="small" 
                          sx={{ 
                            background: 'rgba(245, 158, 11, 0.1)',
                            color: '#f59e0b',
                          }} 
                        />
                        <Chip 
                          label={link.department} 
                          size="small" 
                          sx={{ 
                            background: 'rgba(236, 72, 153, 0.1)',
                            color: '#ec4899',
                          }} 
                        />
                      </Box>
                    </Box>
                    <Tooltip title={copied[link.utmUrl] ? "Copied!" : "Copy to clipboard"}>
                      <IconButton
                        onClick={() => copyToClipboard(link.utmUrl)}
                        sx={{
                          color: copied[link.utmUrl] ? '#10b981' : 'inherit',
                          transition: 'all 0.2s ease-in-out',
                        }}
                      >
                        {copied[link.utmUrl] ? <CheckIcon /> : <ContentCopyIcon />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      wordBreak: 'break-all',
                      fontFamily: 'monospace',
                      p: 1,
                      borderRadius: '8px',
                      background: 'rgba(0, 0, 0, 0.05)',
                    }}
                  >
                    {link.utmUrl}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredLinks.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              No links found matching the selected filters
            </Typography>
          </Box>
        )}
      </motion.div>
    </Box>
  );
};

export default UTMLinkList; 