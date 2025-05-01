import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Paper,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import SaveIcon from '@mui/icons-material/Save';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { generateCampaignCode } from '../utils/campaignCodeGenerator';

interface UTMGeneratorProps {
  department: 'marketing' | 'sales' | 'social';
}

interface FormData {
  campaign: string;
  term: string;
  source: string;
  medium: string;
  content: string;
  url: string;
}

const UTMGenerator: React.FC<UTMGeneratorProps> = ({ department }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    campaign: '',
    term: '',
    source: '',
    medium: '',
    content: '',
    url: '',
  });
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateUTM = () => {
    if (!formData.url) {
      setError('Please enter a URL');
      return;
    }

    const baseUrl = formData.url.includes('?') ? formData.url : `${formData.url}?`;
    const params = new URLSearchParams();

    if (formData.source) params.append('utm_source', formData.source);
    if (formData.medium) params.append('utm_medium', formData.medium);
    if (formData.campaign) params.append('utm_campaign', formData.campaign);
    if (formData.term) params.append('utm_term', formData.term);
    if (formData.content) params.append('utm_content', formData.content);

    const utmUrl = `${baseUrl}${params.toString()}`;
    setGeneratedUrl(utmUrl);
    setError('');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    // Implementation of handleSave function
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          Generate UTM Parameters
        </Typography>
        <Box sx={{ display: 'grid', gap: 2 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField
              fullWidth
              label="Campaign Name"
              value={formData.campaign}
              onChange={handleChange}
              name="campaign"
              required
            />
            <TextField
              fullWidth
              label="Campaign Code"
              value={formData.term}
              onChange={handleChange}
              name="term"
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => {}} size="small">
                      <RefreshIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Source</InputLabel>
              <Select
                value={formData.source}
                onChange={handleChange}
                name="source"
                required
                label="Source"
              >
                <MenuItem value="google">Google</MenuItem>
                <MenuItem value="facebook">Facebook</MenuItem>
                <MenuItem value="newsletter">Newsletter</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Medium"
              value={formData.medium}
              onChange={handleChange}
              name="medium"
              required
            />
          </Box>
          <TextField
            fullWidth
            label="Content"
            value={formData.content}
            onChange={handleChange}
            name="content"
          />
          <TextField
            fullWidth
            label="Base URL"
            value={formData.url}
            onChange={handleChange}
            name="url"
            required
          />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </Box>
      </Paper>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UTMGenerator; 