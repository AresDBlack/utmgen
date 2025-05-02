import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import SaveIcon from '@mui/icons-material/Save';
import { googleSheetsService } from '../services/googleSheets';

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

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const handleSave = async () => {
    if (!generatedUrl) {
      setError('Please generate a UTM URL first');
      return;
    }

    setLoading(true);
    try {
      await googleSheetsService.addUTMRecord({
        url: formData.url,
        client: formData.source,
        campaign: formData.campaign,
        source: formData.source,
        sourceType: formData.medium,
        identifier: formData.content,
        utmUrl: generatedUrl,
        department: department
      });
      setSnackbar({ open: true, message: 'UTM URL saved successfully', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to save UTM URL', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          Generate UTM Parameters
        </Typography>
        <Box sx={{ display: 'grid', gap: 2 }}>
          <TextField
            fullWidth
            label="URL"
            name="url"
            value={formData.url}
            onChange={handleTextChange}
            error={!!error}
            helperText={error}
          />
          <TextField
            fullWidth
            label="Source"
            name="source"
            value={formData.source}
            onChange={handleTextChange}
          />
          <TextField
            fullWidth
            label="Medium"
            name="medium"
            value={formData.medium}
            onChange={handleTextChange}
          />
          <TextField
            fullWidth
            label="Campaign"
            name="campaign"
            value={formData.campaign}
            onChange={handleTextChange}
          />
          <TextField
            fullWidth
            label="Term"
            name="term"
            value={formData.term}
            onChange={handleTextChange}
          />
          <TextField
            fullWidth
            label="Content"
            name="content"
            value={formData.content}
            onChange={handleTextChange}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={generateUTM}
              startIcon={<RefreshIcon />}
            >
              Generate
            </Button>
            <Button
              variant="outlined"
              onClick={copyToClipboard}
              startIcon={<ContentCopyIcon />}
              disabled={!generatedUrl}
            >
              {copied ? 'Copied!' : 'Copy'}
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              startIcon={<SaveIcon />}
              disabled={!generatedUrl || loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Save'}
            </Button>
          </Box>
          {generatedUrl && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1">Generated URL:</Typography>
              <Typography
                variant="body1"
                sx={{
                  wordBreak: 'break-all',
                  bgcolor: 'grey.100',
                  p: 1,
                  borderRadius: 1,
                }}
              >
                {generatedUrl}
              </Typography>
            </Box>
          )}
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