import { useState } from 'react';
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
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { motion } from 'framer-motion';

interface UTMGeneratorProps {
  department: string;
}

const UTMGenerator = ({ department }: UTMGeneratorProps) => {
  const [formData, setFormData] = useState({
    url: '',
    source: '',
    medium: '',
    campaign: '',
    term: '',
    content: '',
  });

  const [generatedUrl, setGeneratedUrl] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name as string]: value,
    }));
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

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
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
          }}
        >
          {department} UTM Generator
        </Typography>
        
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2,
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
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
            borderRadius: '12px',
          }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Destination URL"
                name="url"
                value={formData.url}
                onChange={handleChange}
                required
                sx={{
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
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Source (utm_source)"
                name="source"
                value={formData.source}
                onChange={handleChange}
                placeholder="e.g., google, facebook, newsletter"
                sx={{
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
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Medium (utm_medium)</InputLabel>
                <Select
                  name="medium"
                  value={formData.medium}
                  label="Medium (utm_medium)"
                  onChange={handleChange}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#6366f1',
                    },
                  }}
                >
                  <MenuItem value="cpc">CPC</MenuItem>
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="social">Social</MenuItem>
                  <MenuItem value="display">Display</MenuItem>
                  <MenuItem value="referral">Referral</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Campaign (utm_campaign)"
                name="campaign"
                value={formData.campaign}
                onChange={handleChange}
                placeholder="e.g., summer_sale, product_launch"
                sx={{
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
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Term (utm_term)"
                name="term"
                value={formData.term}
                onChange={handleChange}
                placeholder="e.g., keyword, ad_group"
                sx={{
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
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Content (utm_content)"
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="e.g., banner_ad, text_link"
                sx={{
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
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={generateUTM}
              fullWidth
              sx={{
                background: 'linear-gradient(45deg, #6366f1, #ec4899)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #6366f1, #ec4899)',
                  opacity: 0.9,
                },
              }}
            >
              Generate UTM Link
            </Button>
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
    </Box>
  );
};

export default UTMGenerator; 