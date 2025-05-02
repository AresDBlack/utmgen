import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,

  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';

import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { motion } from 'framer-motion';
import { googleSheetsService } from '../services/googleSheets';
import type { UTMRecord } from "../services/googleSheets";


interface UTMLinkListProps {
  department: 'marketing' | 'sales' | 'social';
  reloadTrigger?: number;
}

interface FilterState {
  department: string;
  client: string;
  campaign: string;
  sourceType: string;
  search: string;
}

const UTMLinkList = ({ department, reloadTrigger = 0 }: UTMLinkListProps) => {
  const [links, setLinks] = useState<UTMRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<Record<string, boolean>>({});
  const [filters, setFilters] = useState<FilterState>({
    department: department,
    client: '',
    campaign: '',
    sourceType: '',
    search: '',
  });

  // Get unique values for filters
  const departments = Array.from(new Set(links.map(link => link.department).filter(Boolean))) as ('marketing' | 'sales' | 'social')[];
  const clients = Array.from(new Set(links.map(link => link.client).filter(Boolean)));
  const campaigns = Array.from(new Set(links.map(link => link.campaign).filter(Boolean)));
  const sourceTypes = Array.from(new Set(links.map(link => link.sourceType).filter(Boolean)));

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
    if (filters.sourceType && link.sourceType !== filters.sourceType) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        link.url.toLowerCase().includes(searchLower) ||
        link.client.toLowerCase().includes(searchLower) ||
        link.campaign.toLowerCase().includes(searchLower) ||
        link.sourceType.toLowerCase().includes(searchLower) ||
        link.utmUrl.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

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
        <Typography variant="h6" gutterBottom>
          Generated UTM Links
        </Typography>

        {/* Filter Controls */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
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
                  {clients.map(client => (
                    <MenuItem key={client} value={client}>
                      {client}
                    </MenuItem>
                  ))}
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
                  {campaigns.map(campaign => (
                    <MenuItem key={campaign} value={campaign}>
                      {campaign}
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
                  {sourceTypes.map(type => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
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
                placeholder="Search by URL, client, campaign, or source type"
              />
            </Box>
          </Box>
        </Paper>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>URL</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Campaign</TableCell>
                <TableCell>Source Type</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>UTM Link</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLinks.map((link) => (
                <TableRow key={link.utmId}>
                  <TableCell>{link.url}</TableCell>
                  <TableCell>{link.client}</TableCell>
                  <TableCell>{link.campaign}</TableCell>
                  <TableCell>{link.sourceType}</TableCell>
                  <TableCell>{link.department}</TableCell>
                  <TableCell sx={{ maxWidth: 300, wordBreak: 'break-all' }}>
                    {link.utmUrl}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => copyToClipboard(link.utmUrl)}
                      size="small"
                    >
                      {copied[link.utmUrl] ? <CheckIcon /> : <ContentCopyIcon />}
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {filteredLinks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No links found matching the selected filters
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </motion.div>
    </Box>
  );
};

export default UTMLinkList; 