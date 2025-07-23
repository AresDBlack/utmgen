import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  SelectChangeEvent,
  IconButton,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import AddIcon from '@mui/icons-material/Add';
import { motion } from 'framer-motion';
import { googleSheetsService } from '../services/googleSheets';
import type { Campaign, SourceType, Client, Source } from '../services/googleSheets';
import UTMLinkList from '../components/UTMLinkList';

const Affiliates = () => {
  const [formData, setFormData] = useState({
    url: '',
    client: '',
    campaign: '',
    source: '',
  });
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const [generatedUrl, setGeneratedUrl] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [availableCampaigns, setAvailableCampaigns] = useState<Campaign[]>([]);
  const [availableClients, setAvailableClients] = useState<Client[]>([]);
  const [availableSources, setAvailableSources] = useState<Source[]>([]);

  // Dialog states
  const [isNewCampaignDialogOpen, setIsNewCampaignDialogOpen] = useState(false);
  const [isNewClientDialogOpen, setIsNewClientDialogOpen] = useState(false);
  const [isNewSourceDialogOpen, setIsNewSourceDialogOpen] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceAbbr, setNewSourceAbbr] = useState('');

  // Load data from Google Sheets
  useEffect(() => {
    const loadData = async () => {
      try {
        const [campaigns, clients, sources] = await Promise.all([
          googleSheetsService.getCampaigns(),
          googleSheetsService.getClients(),
          googleSheetsService.getSources(),
        ]);
        setAvailableCampaigns(campaigns);
        setAvailableClients(clients);
        // Only show sources with sourceId starting with 'Af-'
        setAvailableSources(sources.filter(s => s.sourceId && s.sourceId.startsWith('Af-')));
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load data from Google Sheets');
      }
    };
    loadData();
  }, []);

  // Update available campaigns when client changes
  useEffect(() => {
    const loadCampaigns = async () => {
      if (formData.client) {
        try {
          const campaigns = await googleSheetsService.getCampaigns();
          const filteredCampaigns = campaigns.filter(c => c.clientId === formData.client);
          setAvailableCampaigns(filteredCampaigns);
          setFormData(prev => ({ ...prev, campaign: '' }));
        } catch (error) {
          console.error('Error loading campaigns:', error);
          setError('Failed to load campaigns');
        }
      } else {
        setAvailableCampaigns([]);
        setFormData(prev => ({ ...prev, campaign: '' }));
      }
    };
    loadCampaigns();
  }, [formData.client]);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (name === 'client') {
      setFormData(prev => ({ ...prev, campaign: '' }));
      try {
        const campaigns = await googleSheetsService.getCampaigns();
        setAvailableCampaigns(campaigns.filter(c => c.clientId === value));
      } catch (error) {
        console.error('Error loading campaigns:', error);
      }
    }
  };

  const handleCreateNewCampaign = async () => {
    if (!newCampaignName || !formData.client) return;
    try {
      const newCampaign = await googleSheetsService.addCampaign({
        name: newCampaignName,
        clientId: formData.client,
      });
      setAvailableCampaigns(prev => [...prev, newCampaign]);
      setFormData(prev => ({ ...prev, campaign: newCampaign.campaignId }));
      setNewCampaignName('');
      setIsNewCampaignDialogOpen(false);
    } catch (error) {
      console.error('Error creating campaign:', error);
      setError('Failed to create new campaign');
    }
  };

  const handleCreateNewClient = async () => {
    if (!newClientName) return;
    try {
      const newClient = await googleSheetsService.addClient({
        name: newClientName,
      });
      setAvailableClients(prev => [...prev, newClient]);
      setFormData(prev => ({ ...prev, client: newClient.clientId }));
      setNewClientName('');
      setIsNewClientDialogOpen(false);
    } catch (error) {
      console.error('Error creating client:', error);
      setError('Failed to create new client');
    }
  };

  const handleCreateNewSource = async () => {
    if (!newSourceName || !newSourceAbbr) return;
    try {
      // Prefix sourceId with 'Af-' for Affiliates
      const newSource = await googleSheetsService.addSource({
        name: newSourceName,
        abbr: newSourceAbbr.toUpperCase(),
        // The backend/service should use this prefix for sourceId
        sourceIdPrefix: 'Af-',
      });
      // Only add to availableSources if sourceId starts with 'Af-'
      if (newSource.sourceId && newSource.sourceId.startsWith('Af-')) {
        setAvailableSources(prev => [...prev, newSource]);
        setFormData(prev => ({ ...prev, source: newSource.sourceId }));
      }
      setNewSourceName('');
      setNewSourceAbbr('');
      setIsNewSourceDialogOpen(false);
    } catch (error) {
      console.error('Error creating source:', error);
      setError('Failed to create new source');
    }
  };

  const generateUTM = async () => {
    if (!formData.url) {
      setError('Please enter a URL');
      return;
    }
    if (!formData.client || !formData.campaign || !formData.source) {
      setError('Please fill in all fields');
      return;
    }
    const campaign = availableCampaigns.find(c => c.campaignId === formData.campaign);
    if (!campaign) {
      setError('Invalid campaign');
      return;
    }
    // Find the selected source object
    const selectedSource = availableSources.find(s => s.sourceId === formData.source);
    const utmSource = selectedSource ? selectedSource.abbr.toUpperCase() : formData.source;
    const baseUrl = formData.url.includes('?') ? formData.url : `${formData.url}?`;
    const params = new URLSearchParams();
    params.append('utm_source', utmSource);
    params.append('utm_medium', 'affiliate');
    params.append('utm_campaign', campaign.name);
    params.append('utm_content', 'af');
    const utmUrl = `${baseUrl}${params.toString()}`;
    setGeneratedUrl(utmUrl);
    setError('');
    try {
      await googleSheetsService.addUTMRecord({
        url: formData.url,
        client: formData.client,
        campaign: formData.campaign,
        source: formData.source,
        sourceType: '',
        identifier: '',
        utmUrl,
        department: 'affiliates'
      });
      setReloadTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error saving UTM record:', error);
      if (error instanceof Error && error.message === 'UTM URL already exists') {
        setError('This UTM link already exists. Please modify your parameters to create a unique link.');
      } else {
        setError('Failed to save UTM record');
      }
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box sx={{ 
      maxWidth: 800, 
      mx: 'auto', 
      p: 3,
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography 
          variant="h4" 
          gutterBottom
          sx={{
            background: 'linear-gradient(45deg, #06b6d4, #a21caf)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700,
            mb: 2,
          }}
        >
          Affiliates UTM Generator
        </Typography>

        <Typography 
          variant="body1" 
          sx={{ 
            mb: 4,
            color: 'rgba(255, 255, 255, 0.7)',
            maxWidth: '600px',
            mx: 'auto',
          }}
        >
          Generate UTM links for affiliate partners. Fill in the URL and select the client, campaign, source, and source type. 
          The identifier will be automatically generated based on your selections. You can add new campaigns and source types as needed.
        </Typography>
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '8px',
            }}
          >
            {error}
          </Alert>
        )}
        <Paper 
          elevation={0}
          sx={{ 
            p: 4,
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            minWidth: '400px',
            maxWidth: '600px',
            mx: 'auto',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 2,
              width: '100%'
            }}
          >
            <Box>
              <TextField
                fullWidth
                name="url"
                label="URL"
                value={formData.url}
                onChange={handleChange}
                placeholder="https://example.com"
                size="small"
                sx={{
                  minWidth: '300px',
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#06b6d4',
                    },
                  },
                }}
              />
            </Box>

            <Box>
              <FormControl fullWidth>
                <InputLabel>Client</InputLabel>
                <Select
                  name="client"
                  value={formData.client}
                  onChange={handleChange}
                  label="Client"
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton 
                        onClick={() => setIsNewClientDialogOpen(true)} 
                        size="small"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          '&:hover': {
                            color: '#06b6d4',
                            backgroundColor: 'rgba(6, 182, 212, 0.1)',
                          },
                        }}
                      >
                        <AddIcon />
                      </IconButton>
                    </InputAdornment>
                  }
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#06b6d4',
                    },
                  }}
                >
                  {availableClients.map((client) => (
                    <MenuItem key={client.clientId} value={client.clientId}>
                      {client.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box>
              <FormControl fullWidth>
                <InputLabel>Campaign</InputLabel>
                <Select
                  name="campaign"
                  value={formData.campaign}
                  onChange={handleChange}
                  label="Campaign"
                  disabled={!formData.client}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton 
                        onClick={() => setIsNewCampaignDialogOpen(true)} 
                        disabled={!formData.client}
                      >
                        <AddIcon />
                      </IconButton>
                    </InputAdornment>
                  }
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#06b6d4',
                    },
                  }}
                >
                  {availableCampaigns.map((campaign) => (
                    <MenuItem key={campaign.campaignId} value={campaign.campaignId}>
                      {campaign.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box>
              <FormControl fullWidth>
                <InputLabel>Source</InputLabel>
                <Select
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  label="Source"
                  disabled={!formData.client}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton 
                        onClick={() => setIsNewSourceDialogOpen(true)} 
                        disabled={!formData.client}
                      >
                        <AddIcon />
                      </IconButton>
                    </InputAdornment>
                  }
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#06b6d4',
                    },
                  }}
                >
                  {availableSources.map((source) => (
                    <MenuItem key={source.sourceId} value={source.sourceId}>
                      {source.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' }, mt: 2 }}>
              <FormControl fullWidth>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={generateUTM}
                  fullWidth
                  size="small"
                  sx={{
                    background: 'linear-gradient(45deg, #06b6d4, #a21caf)',
                    borderRadius: '8px',
                    py: 1.5,
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 600,
                    '&:hover': {
                      background: 'linear-gradient(45deg, #06b6d4, #a21caf)',
                      opacity: 0.9,
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(6, 182, 212, 0.2)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  Generate UTM
                </Button>
              </FormControl>
            </Box>
          </Box>

          {generatedUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Generated UTM Link:
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    wordBreak: 'break-all',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography sx={{ mr: 2 }}>{generatedUrl}</Typography>
                  <IconButton
                    onClick={copyToClipboard}
                    sx={{
                      color: copied ? '#06b6d4' : 'text.secondary',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  >
                    {copied ? <CheckIcon /> : <ContentCopyIcon />}
                  </IconButton>
                </Paper>
              </Box>
            </motion.div>
          )}
        </Paper>
      </motion.div>
      <UTMLinkList department="affiliates" reloadTrigger={reloadTrigger} />

      {/* New Campaign Dialog */}
      <Dialog open={isNewCampaignDialogOpen} onClose={() => setIsNewCampaignDialogOpen(false)}>
        <DialogTitle>New Campaign</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Campaign Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newCampaignName}
            onChange={(e) => setNewCampaignName(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#06b6d4',
                },
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsNewCampaignDialogOpen(false)} color="primary">Cancel</Button>
          <Button onClick={handleCreateNewCampaign} color="primary">Create</Button>
        </DialogActions>
      </Dialog>

      {/* New Client Dialog */}
      <Dialog open={isNewClientDialogOpen} onClose={() => setIsNewClientDialogOpen(false)}>
        <DialogTitle>New Client</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Client Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newClientName}
            onChange={(e) => setNewClientName(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#06b6d4',
                },
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsNewClientDialogOpen(false)} color="primary">Cancel</Button>
          <Button onClick={handleCreateNewClient} color="primary">Create</Button>
        </DialogActions>
      </Dialog>

      {/* New Source Dialog */}
      <Dialog open={isNewSourceDialogOpen} onClose={() => setIsNewSourceDialogOpen(false)}>
        <DialogTitle>New Source</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Source Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newSourceName}
            onChange={(e) => setNewSourceName(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#06b6d4',
                },
              },
            }}
          />
          <TextField
            margin="dense"
            label="Source Abbreviation (e.g., 'email', 'sms', 'ad')"
            type="text"
            fullWidth
            variant="outlined"
            value={newSourceAbbr}
            onChange={(e) => setNewSourceAbbr(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#06b6d4',
                },
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsNewSourceDialogOpen(false)} color="primary">Cancel</Button>
          <Button onClick={handleCreateNewSource} color="primary">Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Affiliates; 