import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
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
import type { GridProps } from '@mui/material/Grid';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import AddIcon from '@mui/icons-material/Add';
import { motion } from 'framer-motion';
import { googleSheetsService } from '../services/googleSheets';
import type { Campaign, SourceType } from '../services/googleSheets';

// Predefined data
const CLIENTS = [
  { id: 'danny', name: 'Danny Singson' },
  { id: 'shaun', name: 'Shaun T' },
  { id: 'nadine', name: 'Nadine' },
];

const SOURCE_TYPES = {
  email: [
    { id: 'nurture', name: 'Nurture Email', abbr: 'NE' },
    { id: 'promo', name: 'Promotional Email', abbr: 'PE' },
    { id: 'newsletter', name: 'Newsletter', abbr: 'NL' },
    { id: 'welcome', name: 'Welcome Email', abbr: 'WE' },
  ],
  sms: [
    { id: 'promo', name: 'Promotional SMS', abbr: 'PS' },
    { id: 'alert', name: 'Alert SMS', abbr: 'AS' },
    { id: 'reminder', name: 'Reminder SMS', abbr: 'RS' },
    { id: 'welcome', name: 'Welcome SMS', abbr: 'WS' },
  ],
  ad: [
    { id: 'display', name: 'Display Ad', abbr: 'DA' },
    { id: 'social', name: 'Social Media Ad', abbr: 'SA' },
    { id: 'search', name: 'Search Ad', abbr: 'SEA' },
    { id: 'video', name: 'Video Ad', abbr: 'VA' },
  ],
};

const SOURCES = [
  { id: 'email', name: 'Email', abbr: 'E' },
  { id: 'sms', name: 'SMS', abbr: 'S' },
  { id: 'ad', name: 'Ad', abbr: 'A' },
];

// Mock campaigns - in a real app, this would come from a database
const MOCK_CAMPAIGNS: Campaign[] = [
  { campaignId: 'summer-sale', name: 'Summer Sale 2024', clientId: 'danny' },
  { campaignId: 'product-launch', name: 'Product Launch', clientId: 'shaun' },
  { campaignId: 'holiday-special', name: 'Holiday Special', clientId: 'nadine' },
];

const Marketing = () => {
  const [formData, setFormData] = useState({
    url: '',
    client: '',
    campaign: '',
    source: '',
    sourceType: '',
    identifier: '',
  });

  const [generatedUrl, setGeneratedUrl] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [availableCampaigns, setAvailableCampaigns] = useState<Campaign[]>([]);
  const [availableSourceTypes, setAvailableSourceTypes] = useState<SourceType[]>([]);
  const [lastIdentifier, setLastIdentifier] = useState<Record<string, number>>({});

  // Dialog states
  const [isNewCampaignDialogOpen, setIsNewCampaignDialogOpen] = useState(false);
  const [isNewSourceTypeDialogOpen, setIsNewSourceTypeDialogOpen] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newSourceTypeName, setNewSourceTypeName] = useState('');
  const [newSourceTypeAbbr, setNewSourceTypeAbbr] = useState('');

  // Load data from Google Sheets
  useEffect(() => {
    const loadData = async () => {
      try {
        const [campaigns, sourceTypes] = await Promise.all([
          googleSheetsService.getCampaigns(),
          googleSheetsService.getSourceTypes(),
        ]);

        setAvailableCampaigns(campaigns);
        setAvailableSourceTypes(sourceTypes);

        // Initialize lastIdentifier from source types
        const initialIdentifiers: Record<string, number> = {};
        sourceTypes.forEach(type => {
          const key = `${type.source}-${type.sourceTypeId}`;
          initialIdentifiers[key] = 0;
        });
        setLastIdentifier(initialIdentifiers);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load data from Google Sheets');
      }
    };

    loadData();
  }, []);

  // Update available campaigns when client changes
  useEffect(() => {
    if (formData.client) {
      const filteredCampaigns = availableCampaigns.filter(c => c.clientId === formData.client);
      setAvailableCampaigns(filteredCampaigns);
      setFormData(prev => ({ ...prev, campaign: '' }));
    } else {
      const loadAllCampaigns = async () => {
        try {
          const campaigns = await googleSheetsService.getCampaigns();
          setAvailableCampaigns(campaigns);
        } catch (error) {
          console.error('Error loading all campaigns:', error);
        }
      };
      loadAllCampaigns();
    }
  }, [formData.client]);

  // Update available source types when source changes
  useEffect(() => {
    if (formData.source) {
      const filteredTypes = availableSourceTypes.filter(t => t.source === formData.source);
      setAvailableSourceTypes(filteredTypes);
      setFormData(prev => ({ ...prev, sourceType: '' }));
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
    if (formData.sourceType && formData.source) {
      const sourceType = availableSourceTypes.find(t => t.sourceTypeId === formData.sourceType);
      if (sourceType) {
        // Get source count
        const sourceCount = availableSourceTypes.filter(t => t.source === formData.source).length + 1;
        
        // Get source type count for this specific source type
        const sourceTypeCount = availableSourceTypes.filter(t => 
          t.source === formData.source && t.sourceTypeId === formData.sourceType
        ).length + 1;

        // First letter of source
        const sourceFirstLetter = formData.source.charAt(0).toUpperCase();
        
        // Create identifier
        const identifier = `${sourceFirstLetter}${sourceCount}${sourceType.abbr}${sourceTypeCount}`;
        
        setFormData(prev => ({
          ...prev,
          identifier,
        }));
      }
    }
  }, [formData.sourceType, formData.source, availableSourceTypes]);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement> | SelectChangeEvent) => {
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
      setLastIdentifier(prev => ({
        ...prev,
        [`${formData.source}-${newSourceType.sourceTypeId}`]: 0,
      }));

      setFormData(prev => ({ ...prev, sourceType: newSourceType.sourceTypeId }));
      setNewSourceTypeName('');
      setNewSourceTypeAbbr('');
      setIsNewSourceTypeDialogOpen(false);
    } catch (error) {
      console.error('Error creating source type:', error);
      setError('Failed to create new source type');
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

    const baseUrl = formData.url.includes('?') ? formData.url : `${formData.url}?`;
    const params = new URLSearchParams();

    params.append('utm_source', formData.source);
    params.append('utm_medium', 'mt'); // Always mt for marketing team
    params.append('utm_campaign', `${formData.client}-${formData.campaign}`);
    params.append('utm_content', formData.identifier);

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
      });
    } catch (error) {
      console.error('Error saving UTM record:', error);
      setError('Failed to save UTM record');
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
            background: 'linear-gradient(45deg, #6366f1, #ec4899)',
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
          <Grid container direction="column" spacing={3} sx={{ flex: 1 }}>
            <Grid item>
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
            </Grid>

            <Grid item>
              <FormControl fullWidth size="small" sx={{ minWidth: '300px' }}>
                <InputLabel>Client</InputLabel>
                <Select
                  name="client"
                  value={formData.client}
                  onChange={handleChange}
                  label="Client"
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
                  {CLIENTS.map((client) => (
                    <MenuItem key={client.id} value={client.id}>
                      {client.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item>
              <FormControl fullWidth size="small" sx={{ minWidth: '300px' }}>
                <InputLabel>Campaign</InputLabel>
                <Select
                  name="campaign"
                  value={formData.campaign}
                  onChange={handleChange}
                  label="Campaign"
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton 
                        onClick={() => setIsNewCampaignDialogOpen(true)} 
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
                  {availableCampaigns.map((campaign) => (
                    <MenuItem key={campaign.campaignId} value={campaign.campaignId}>
                      {campaign.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item>
              <FormControl fullWidth size="small" sx={{ minWidth: '300px' }}>
                <InputLabel>Source</InputLabel>
                <Select
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  label="Source"
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
                  {SOURCES.map((source) => (
                    <MenuItem key={source.id} value={source.id}>
                      {source.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item>
              <FormControl fullWidth size="small" sx={{ minWidth: '300px' }}>
                <InputLabel>Source Type</InputLabel>
                <Select
                  name="sourceType"
                  value={formData.sourceType}
                  onChange={handleChange}
                  label="Source Type"
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton 
                        onClick={() => setIsNewSourceTypeDialogOpen(true)} 
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
                  {availableSourceTypes.map((type) => (
                    <MenuItem key={type.sourceTypeId} value={type.sourceTypeId}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item>
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
            </Grid>

            <Grid item sx={{ mt: 'auto' }}>
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
            </Grid>
          </Grid>

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
    </Box>
  );
};

const Sales = () => {
  const [formData, setFormData] = useState({
    url: '',
    client: '',
    campaign: '',
    sourceType: '',
  });

  const [generatedUrl, setGeneratedUrl] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [availableCampaigns, setAvailableCampaigns] = useState<Campaign[]>([]);
  const [availableSourceTypes, setAvailableSourceTypes] = useState<SourceType[]>([]);

  // Dialog states
  const [isNewSourceTypeDialogOpen, setIsNewSourceTypeDialogOpen] = useState(false);
  const [newSourceTypeName, setNewSourceTypeName] = useState('');
  const [newSourceTypeCode, setNewSourceTypeCode] = useState('');

  // Load data from Google Sheets
  useEffect(() => {
    const loadData = async () => {
      try {
        const [campaigns, sourceTypes] = await Promise.all([
          googleSheetsService.getCampaigns(),
          googleSheetsService.getSourceTypes(),
        ]);

        setAvailableCampaigns(campaigns);
        setAvailableSourceTypes(sourceTypes);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load data from Google Sheets');
      }
    };

    loadData();
  }, []);

  // Update available campaigns when client changes
  useEffect(() => {
    if (formData.client) {
      const filteredCampaigns = availableCampaigns.filter(c => c.clientId === formData.client);
      setAvailableCampaigns(filteredCampaigns);
      setFormData(prev => ({ ...prev, campaign: '' }));
    } else {
      const loadAllCampaigns = async () => {
        try {
          const campaigns = await googleSheetsService.getCampaigns();
          setAvailableCampaigns(campaigns);
        } catch (error) {
          console.error('Error loading all campaigns:', error);
        }
      };
      loadAllCampaigns();
    }
  }, [formData.client]);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement> | SelectChangeEvent) => {
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
    }
  };

  const handleCreateNewSourceType = async () => {
    if (!newSourceTypeName || !newSourceTypeCode) return;

    try {
      const newSourceType = await googleSheetsService.addSourceType({
        name: newSourceTypeName,
        abbr: newSourceTypeCode.toUpperCase(),
        source: 'direct',
      });

      setAvailableSourceTypes(prev => [...prev, newSourceType]);
      setFormData(prev => ({ ...prev, sourceType: newSourceType.sourceTypeId }));
      setNewSourceTypeName('');
      setNewSourceTypeCode('');
      setIsNewSourceTypeDialogOpen(false);
    } catch (error) {
      console.error('Error creating source type:', error);
      setError('Failed to create new source type');
    }
  };

  const generateUTM = async () => {
    if (!formData.url) {
      setError('Please enter a URL');
      return;
    }

    if (!formData.client || !formData.campaign || !formData.sourceType) {
      setError('Please fill in all fields');
      return;
    }

    const sourceType = availableSourceTypes.find(t => t.sourceTypeId === formData.sourceType);
    if (!sourceType) {
      setError('Invalid source type');
      return;
    }

    const baseUrl = formData.url.includes('?') ? formData.url : `${formData.url}?`;
    const params = new URLSearchParams();

    params.append('utm_source', 'direct');
    params.append('utm_medium', sourceType.abbr);
    params.append('utm_campaign', `${formData.client}-${formData.campaign}`);

    const utmUrl = `${baseUrl}${params.toString()}`;
    setGeneratedUrl(utmUrl);
    setError('');

    // Save to Google Sheets
    try {
      await googleSheetsService.addUTMRecord({
        url: formData.url,
        client: formData.client,
        campaign: formData.campaign,
        source: 'direct',
        sourceType: formData.sourceType,
        identifier: '',
        utmUrl,
      });
    } catch (error) {
      console.error('Error saving UTM record:', error);
      setError('Failed to save UTM record');
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
            background: 'linear-gradient(45deg, #6366f1, #ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700,
            mb: 4,
          }}
        >
          Sales UTM Generator
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
          }}
        >
          <Grid container direction="column" spacing={3} sx={{ flex: 1 }}>
            <Grid item>
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
            </Grid>

            <Grid item>
              <FormControl fullWidth size="small">
                <InputLabel>Client</InputLabel>
                <Select
                  name="client"
                  value={formData.client}
                  onChange={handleChange}
                  label="Client"
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
                  {CLIENTS.map((client) => (
                    <MenuItem key={client.id} value={client.id}>
                      {client.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item>
              <FormControl fullWidth size="small">
                <InputLabel>Campaign</InputLabel>
                <Select
                  name="campaign"
                  value={formData.campaign}
                  onChange={handleChange}
                  label="Campaign"
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
            </Grid>

            <Grid item>
              <FormControl fullWidth size="small">
                <InputLabel>Sales Agent</InputLabel>
                <Select
                  name="sourceType"
                  value={formData.sourceType}
                  onChange={handleChange}
                  label="Sales Agent"
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton 
                        onClick={() => setIsNewSourceTypeDialogOpen(true)} 
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
                  {availableSourceTypes.map((type) => (
                    <MenuItem key={type.sourceTypeId} value={type.sourceTypeId}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item>
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
            </Grid>
          </Grid>

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

      {/* New Sales Agent Dialog */}
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
        <DialogTitle>Add New Sales Agent</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Agent Name"
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
            label="Agent Code"
            fullWidth
            value={newSourceTypeCode}
            onChange={(e) => setNewSourceTypeCode(e.target.value)}
            helperText="2-3 letters, e.g., JD for John Doe"
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
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Marketing; 