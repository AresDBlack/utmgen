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

const Marketing = () => {
  const [formData, setFormData] = useState({
    url: '',
    client: '',
    campaign: '',
    source: '',
    sourceType: '',
    identifier: '',
  });
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const [generatedUrl, setGeneratedUrl] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [availableCampaigns, setAvailableCampaigns] = useState<Campaign[]>([]);
  const [availableSourceTypes, setAvailableSourceTypes] = useState<SourceType[]>([]);
  const [availableClients, setAvailableClients] = useState<Client[]>([]);
  const [availableSources, setAvailableSources] = useState<Source[]>([]);

  // Dialog states
  const [isNewCampaignDialogOpen, setIsNewCampaignDialogOpen] = useState(false);
  const [isNewSourceTypeDialogOpen, setIsNewSourceTypeDialogOpen] = useState(false);
  const [isNewClientDialogOpen, setIsNewClientDialogOpen] = useState(false);
  const [isNewSourceDialogOpen, setIsNewSourceDialogOpen] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newSourceTypeName, setNewSourceTypeName] = useState('');
  const [newSourceTypeAbbr, setNewSourceTypeAbbr] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceAbbr, setNewSourceAbbr] = useState('');

  // Load data from Google Sheets
  useEffect(() => {
    const loadData = async () => {
      try {
        const [campaigns, sourceTypes, clients, sources] = await Promise.all([
          googleSheetsService.getCampaigns(),
          googleSheetsService.getSourceTypes(),
          googleSheetsService.getClients(),
          googleSheetsService.getSources(),
        ]);

        setAvailableCampaigns(campaigns);
        setAvailableSourceTypes(sourceTypes);
        setAvailableClients(clients);
        setAvailableSources(sources);
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
          // Reset campaign selection when client changes
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

  // Update available source types when source changes
  useEffect(() => {
    if (formData.source) {
      const filteredTypes = availableSourceTypes.filter(t => t.source === formData.source);
      setAvailableSourceTypes(filteredTypes);
      setFormData(prev => ({ ...prev, sourceType: '', identifier: '' }));
    } else {
      const loadAllSourceTypes = async () => {
        try {
          const sourceTypes = await googleSheetsService.getSourceTypes();
          setAvailableSourceTypes(sourceTypes);
        } catch (error) {
          console.error('Error loading all source types:', error);
        }
      };
      loadAllSourceTypes();
    }
  }, [formData.source]);

  // Calculate identifier when source type changes
  useEffect(() => {
    const calculateIdentifier = async () => {
      if (formData.sourceType && formData.source) {
        try {
          // Get all UTM records to count occurrences
          const utmRecords = await googleSheetsService.getUTMRecords();
          
          // Get the selected source and source type
          const selectedSource = availableSources.find(s => s.sourceId === formData.source);
          const selectedSourceType = availableSourceTypes.find(t => t.sourceTypeId === formData.sourceType);
          
          if (selectedSource && selectedSourceType) {
            // Count occurrences of this source
            const sourceCount = utmRecords.filter(record => record.source === formData.source).length + 1;
            
            // Count occurrences of this source type for this source
            const sourceTypeCount = utmRecords.filter(record => 
              record.source === formData.source && record.sourceType === formData.sourceType
            ).length + 1;
            
            // Create identifier
            const identifier = `${selectedSource.abbr}${sourceCount}${selectedSourceType.abbr}${sourceTypeCount}`;
            
            setFormData(prev => ({
              ...prev,
              identifier,
            }));
          }
        } catch (error) {
          console.error('Error calculating identifier:', error);
          setError('Failed to calculate identifier');
        }
      }
    };

    calculateIdentifier();
  }, [formData.sourceType, formData.source, availableSources, availableSourceTypes]);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Reset dependent fields when their parent changes
    if (name === 'client') {
      setFormData(prev => ({ ...prev, campaign: '' }));
      try {
        const campaigns = await googleSheetsService.getCampaigns();
        setAvailableCampaigns(campaigns.filter(c => c.clientId === value));
      } catch (error) {
        console.error('Error loading campaigns:', error);
      }
    } else if (name === 'source') {
      setFormData(prev => ({ ...prev, sourceType: '', identifier: '' }));
      try {
        const sourceTypes = await googleSheetsService.getSourceTypes();
        setAvailableSourceTypes(sourceTypes.filter(t => t.source === value));
      } catch (error) {
        console.error('Error loading source types:', error);
      }
    } else if (name === 'sourceType') {
      setFormData(prev => ({ ...prev, identifier: '' }));
      // Recalculate identifier when source type changes
      const sourceType = availableSourceTypes.find(t => t.sourceTypeId === value);
      if (sourceType && formData.source) {
        const sourceCount = availableSourceTypes.filter(t => t.source === formData.source).length + 1;
        const sourceTypeCount = availableSourceTypes.filter(t => 
          t.source === formData.source && t.sourceTypeId === value
        ).length + 1;
        const sourceFirstLetter = formData.source.charAt(0).toUpperCase();
        const identifier = `${sourceFirstLetter}${sourceCount}${sourceType.abbr}${sourceTypeCount}`;
        setFormData(prev => ({ ...prev, identifier }));
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

  const handleCreateNewSourceType = async () => {
    if (!newSourceTypeName || !newSourceTypeAbbr || !formData.source) return;

    try {
      const newSourceType = await googleSheetsService.addSourceType({
        name: newSourceTypeName,
        abbr: newSourceTypeAbbr.toUpperCase(),
        source: formData.source as 'email' | 'sms' | 'ad',
      });

      setAvailableSourceTypes(prev => [...prev, newSourceType]);
      setFormData(prev => ({ ...prev, sourceType: newSourceType.sourceTypeId }));
      setNewSourceTypeName('');
      setNewSourceTypeAbbr('');
      setIsNewSourceTypeDialogOpen(false);
    } catch (error) {
      console.error('Error creating source type:', error);
      setError('Failed to create new source type');
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
      const newSource = await googleSheetsService.addSource({
        name: newSourceName,
        abbr: newSourceAbbr.toUpperCase(),
      });

      setAvailableSources(prev => [...prev, newSource]);
      setFormData(prev => ({ ...prev, source: newSource.sourceId }));
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

    if (!formData.client || !formData.campaign || !formData.source || !formData.sourceType || !formData.identifier) {
      setError('Please fill in all fields');
      return;
    }

    const campaign = availableCampaigns.find(c => c.campaignId === formData.campaign);
    if (!campaign) {
      setError('Invalid campaign');
      return;
    }

    const baseUrl = formData.url.includes('?') ? formData.url : `${formData.url}?`;
    const params = new URLSearchParams();

    params.append('utm_source', formData.source);
    params.append('utm_medium', formData.identifier);
    params.append('utm_campaign', campaign.name);
    params.append('utm_content', 'mt');

    const utmUrl = `${baseUrl}${params.toString()}`;
    setGeneratedUrl(utmUrl);
    setError('');

    // Save to Google Sheets
    try {
      await googleSheetsService.addUTMRecord({
        url: formData.url,
        client: formData.client,
        campaign: formData.campaign,
        source: formData.source,
        sourceType: formData.sourceType,
        identifier: formData.identifier,
        utmUrl,
        department: 'marketing'
      });
      setReloadTrigger(prev => prev + 1); // Trigger reload of links
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
            background: 'linear-gradient(45deg, #ec4899, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700,
            mb: 2,
          }}
        >
          Marketing UTM Generator
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
          Generate UTM links for marketing campaigns. Fill in the URL and select the client, campaign, source, and source type. 
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
                      borderColor: '#6366f1',
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
                            color: '#6366f1',
                            backgroundColor: 'rgba(99, 102, 241, 0.1)',
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
                      borderColor: '#6366f1',
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
                      borderColor: '#6366f1',
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
                      borderColor: '#6366f1',
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

            <Box>
              <FormControl fullWidth>
                <InputLabel>Source Type</InputLabel>
                <Select
                  name="sourceType"
                  value={formData.sourceType}
                  onChange={handleChange}
                  label="Source Type"
                  disabled={!formData.client || !formData.source}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton 
                        onClick={() => setIsNewSourceTypeDialogOpen(true)} 
                        disabled={!formData.client || !formData.source}
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
                      borderColor: '#6366f1',
                    },
                  }}
                >
                  {availableSourceTypes.map((type) => (
                    <MenuItem key={type.sourceTypeId} value={type.sourceTypeId}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
              <TextField
                fullWidth
                name="identifier"
                label="Identifier"
                value={formData.identifier}
                onChange={handleChange}
                placeholder="Enter identifier"
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
                      borderColor: '#6366f1',
                    },
                  },
                }}
              />
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
                    background: 'linear-gradient(45deg, #6366f1, #ec4899)',
                    borderRadius: '8px',
                    py: 1.5,
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 600,
                    '&:hover': {
                      background: 'linear-gradient(45deg, #6366f1, #ec4899)',
                      opacity: 0.9,
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
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
                      color: copied ? '#10b981' : 'text.secondary',
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

      {/* New Campaign Dialog */}
      <Dialog 
        open={isNewCampaignDialogOpen} 
        onClose={() => setIsNewCampaignDialogOpen(false)}
        PaperProps={{
          sx: {
            background: 'rgba(30, 41, 59, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <DialogTitle>Create New Campaign</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Campaign Name"
            fullWidth
            value={newCampaignName}
            onChange={(e) => setNewCampaignName(e.target.value)}
            sx={{
              mt: 2,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#6366f1',
                },
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsNewCampaignDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateNewCampaign}
            variant="contained"
            sx={{
              background: 'linear-gradient(45deg, #6366f1, #ec4899)',
              '&:hover': {
                background: 'linear-gradient(45deg, #6366f1, #ec4899)',
                opacity: 0.9,
              },
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* New Source Type Dialog */}
      <Dialog 
        open={isNewSourceTypeDialogOpen} 
        onClose={() => setIsNewSourceTypeDialogOpen(false)}
        PaperProps={{
          sx: {
            background: 'rgba(30, 41, 59, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <DialogTitle>Create New Source Type</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Type Name"
            fullWidth
            value={newSourceTypeName}
            onChange={(e) => setNewSourceTypeName(e.target.value)}
            sx={{
              mt: 2,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#6366f1',
                },
              },
            }}
          />
          <TextField
            margin="dense"
            label="Abbreviation"
            fullWidth
            value={newSourceTypeAbbr}
            onChange={(e) => setNewSourceTypeAbbr(e.target.value)}
            helperText="2-3 letters, e.g., NE for Nurture Email"
            sx={{
              mt: 2,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#6366f1',
                },
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsNewSourceTypeDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateNewSourceType}
            variant="contained"
            sx={{
              background: 'linear-gradient(45deg, #6366f1, #ec4899)',
              '&:hover': {
                background: 'linear-gradient(45deg, #6366f1, #ec4899)',
                opacity: 0.9,
              },
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* New Client Dialog */}
      <Dialog 
        open={isNewClientDialogOpen} 
        onClose={() => setIsNewClientDialogOpen(false)}
        PaperProps={{
          sx: {
            background: 'rgba(30, 41, 59, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <DialogTitle>Add New Client</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Client Name"
            fullWidth
            value={newClientName}
            onChange={(e) => setNewClientName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsNewClientDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateNewClient}
            variant="contained"
            sx={{
              background: 'linear-gradient(45deg, #6366f1, #ec4899)',
              '&:hover': {
                background: 'linear-gradient(45deg, #6366f1, #ec4899)',
                opacity: 0.9,
              },
            }}
          >
            Add Client
          </Button>
        </DialogActions>
      </Dialog>

      {/* New Source Dialog */}
      <Dialog 
        open={isNewSourceDialogOpen} 
        onClose={() => setIsNewSourceDialogOpen(false)}
        PaperProps={{
          sx: {
            background: 'rgba(30, 41, 59, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <DialogTitle>Add New Source</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Source Name"
            fullWidth
            value={newSourceName}
            onChange={(e) => setNewSourceName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Source Abbreviation"
            fullWidth
            value={newSourceAbbr}
            onChange={(e) => setNewSourceAbbr(e.target.value)}
            inputProps={{ maxLength: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsNewSourceDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateNewSource}
            variant="contained"
            sx={{
              background: 'linear-gradient(45deg, #6366f1, #ec4899)',
              '&:hover': {
                background: 'linear-gradient(45deg, #6366f1, #ec4899)',
                opacity: 0.9,
              },
            }}
          >
            Add Source
          </Button>
        </DialogActions>
      </Dialog>

      <UTMLinkList department="marketing" reloadTrigger={reloadTrigger} />
    </Box>
  );
};

export default Marketing; 