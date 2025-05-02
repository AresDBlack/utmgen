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
import type { Campaign, SourceType } from '../services/googleSheets';
import UTMLinkList from '../components/UTMLinkList';

// Predefined data
const CLIENTS = [
  { id: 'danny', name: 'Danny Singson' },
  { id: 'shaun', name: 'Shaun T' },
  { id: 'nadine', name: 'Nadine' },
];

const SOCIAL_MEDIA_SOURCES = [
  { id: 'instagram', name: 'Instagram' },
  { id: 'facebook', name: 'Facebook' },
  { id: 'linkedin', name: 'LinkedIn' },
  { id: 'tiktok', name: 'TikTok' },
  { id: 'twitter', name: 'Twitter' },
  { id: 'youtube', name: 'YouTube' },
];

const Social = () => {
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
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Dialog states
  const [isNewSourceTypeDialogOpen, setIsNewSourceTypeDialogOpen] = useState(false);
  const [isNewCampaignDialogOpen, setIsNewCampaignDialogOpen] = useState(false);
  const [newSourceTypeName, setNewSourceTypeName] = useState('');
  const [newSourceTypeCode, setNewSourceTypeCode] = useState('');
  const [newCampaignName, setNewCampaignName] = useState('');


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

  // Filter source types based on selected source
  const filteredSourceTypes = availableSourceTypes.filter(
    type => type.source === formData.source
  );

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
      setFormData(prev => ({ ...prev, sourceType: '' }));
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

  const handleCreateNewSourceType = async () => {
    if (!newSourceTypeName || !newSourceTypeCode) return;

    try {
      const newSourceType = await googleSheetsService.addSourceType({
        name: newSourceTypeName,
        abbr: newSourceTypeCode.toUpperCase(),
        source: formData.source,
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

    const sourceType = availableSourceTypes.find(t => t.sourceTypeId === formData.sourceType);
    if (!sourceType) {
      setError('Invalid source type');
      return;
    }

    // Get count of existing records with same source type
    const records = await googleSheetsService.getUTMRecords();
    const sourceTypeCount = records.filter(r => r.sourceType === formData.sourceType).length + 1;
    const utmMedium = `${sourceType.abbr}${sourceTypeCount}`;

    const baseUrl = formData.url.includes('?') ? formData.url : `${formData.url}?`;
    const params = new URLSearchParams();

    params.append('utm_source', formData.source);
    params.append('utm_medium', utmMedium);
    params.append('utm_campaign', campaign.name);
    params.append('utm_content', 'SM');

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
        department: 'social'
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
            background: 'linear-gradient(45deg, #f59e0b, #ef4444)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700,
            mb: 2,
          }}
        >
          Social Media UTM Generator
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
          Generate UTM links for social media campaigns. Enter the URL and select the client, campaign, social media platform, 
          and content type. You can add new campaigns and content types as needed. The UTM parameters will be automatically 
          generated to track performance across different social platforms and content types.
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
                      borderColor: '#ec4899',
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
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#ec4899',
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
            </Box>

            <Box>
              <FormControl fullWidth>
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
                            color: '#ec4899',
                            backgroundColor: 'rgba(236, 72, 153, 0.1)',
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
                      borderColor: '#ec4899',
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
                <InputLabel>Social Media</InputLabel>
                <Select
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  label="Social Media"
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#ec4899',
                    },
                  }}
                >
                  {SOCIAL_MEDIA_SOURCES.map((source) => (
                    <MenuItem key={source.id} value={source.id}>
                      {source.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box>
              <FormControl fullWidth>
                <InputLabel>Content Type</InputLabel>
                <Select
                  name="sourceType"
                  value={formData.sourceType}
                  onChange={handleChange}
                  label="Content Type"
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton 
                        onClick={() => setIsNewSourceTypeDialogOpen(true)} 
                        size="small"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          '&:hover': {
                            color: '#ec4899',
                            backgroundColor: 'rgba(236, 72, 153, 0.1)',
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
                      borderColor: '#ec4899',
                    },
                  }}
                >
                  {filteredSourceTypes.map((type) => (
                    <MenuItem key={type.sourceTypeId} value={type.sourceTypeId}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box>
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
                      borderColor: '#ec4899',
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
                    background: 'linear-gradient(45deg, #ec4899, #8b5cf6)',
                    borderRadius: '8px',
                    py: 1.5,
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 600,
                    '&:hover': {
                      background: 'linear-gradient(45deg, #ec4899, #8b5cf6)',
                      opacity: 0.9,
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(236, 72, 153, 0.2)',
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

      {/* New Content Type Dialog */}
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
        <DialogTitle>Add New Content Type</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Content Type Name"
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
            label="Content Type Code"
            fullWidth
            value={newSourceTypeCode}
            onChange={(e) => setNewSourceTypeCode(e.target.value)}
            helperText="2-3 letters, e.g., POST for regular post, STORY for story"
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
              background: 'linear-gradient(45deg, #f59e0b, #ef4444)',
              '&:hover': {
                background: 'linear-gradient(45deg, #f59e0b, #ef4444)',
                opacity: 0.9,
              },
            }}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

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
        <DialogTitle>Add New Campaign</DialogTitle>
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
            disabled={!newCampaignName || !formData.client}
            sx={{
              background: 'linear-gradient(45deg, #f59e0b, #ef4444)',
              '&:hover': {
                background: 'linear-gradient(45deg, #f59e0b, #ef4444)',
                opacity: 0.9,
              },
            }}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <UTMLinkList department="social" reloadTrigger={reloadTrigger} />
    </Box>
  );
};

export default Social; 