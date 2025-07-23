import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Card, CardContent, Chip } from '@mui/material';
import { getAnalyticsSubmissions, approveAnalyticsSubmission, rejectAnalyticsSubmission } from '../services/googleSheets';
import type { AnalyticsSubmission } from '../services/googleSheets';
import AnalyticsNavbar from '../components/AnalyticsNavbar';
import { useSearchParams } from 'react-router-dom';

const ExecAnalyticsApproval = () => {
  const [searchParams] = useSearchParams();
  const [pending, setPending] = useState<AnalyticsSubmission[]>([]);
  const [selected, setSelected] = useState<AnalyticsSubmission | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [message, setMessage] = useState('');

  // Check access
  const hasAccess = searchParams.get('key') === 'aubtinisgay';

  const fetchPending = async () => {
    const all = await getAnalyticsSubmissions();
    setPending(all.filter(s => s.status === 'pending'));
  };

  useEffect(() => { 
    if (hasAccess) {
      fetchPending(); 
    }
  }, [hasAccess]);

  const handleApprove = async (submission: AnalyticsSubmission) => {
    await approveAnalyticsSubmission(submission.submissionId, 'exec@example.com');
    setMessage('Submission approved!');
    fetchPending();
    setDialogOpen(false);
  };

  const handleReject = async (submission: AnalyticsSubmission) => {
    await rejectAnalyticsSubmission(submission.submissionId, 'exec@example.com', rejectionReason);
    setMessage('Submission rejected.');
    fetchPending();
    setDialogOpen(false);
    setRejectionReason('');
  };

  const getDepartmentGradient = (dept: string) => {
    switch (dept) {
      case 'Marketing':
        return 'linear-gradient(45deg, #6366f1, #ec4899)';
      case 'Sales':
        return 'linear-gradient(45deg, #10b981, #3b82f6)';
      case 'Social Media':
        return 'linear-gradient(45deg, #f59e0b, #ef4444)';
      case 'Lead Gen':
      case 'Graphic Design':
        return 'linear-gradient(45deg, #8b5cf6, #10b981)';
      case 'Video Editing':
        return 'linear-gradient(45deg, #06b6d4, #a21caf)';
      default:
        return 'linear-gradient(45deg, #6366f1, #ec4899)';
    }
  };

  if (!hasAccess) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
      }}>
        <AnalyticsNavbar />
        <Box sx={{ maxWidth: 600, mx: 'auto', p: 3, mt: 8 }}>
          <Card sx={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          }}>
            <CardContent sx={{ p: 6, textAlign: 'center' }}>
              <Typography variant="h3" sx={{ 
                fontWeight: 700, 
                mb: 3, 
                background: 'linear-gradient(45deg, #ef4444, #f59e0b)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                🔒 Access Restricted
              </Typography>
              <Typography variant="h6" sx={{ color: '#94a3b8', mb: 4 }}>
                This page requires executive authorization.
              </Typography>
              <Typography sx={{ color: '#94a3b8', fontSize: 18 }}>
                Please contact your administrator for access credentials.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
    }}>
      <AnalyticsNavbar />
      <Box sx={{ maxWidth: 1000, mx: 'auto', p: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" sx={{ 
            fontWeight: 700, 
            mb: 2, 
            background: 'linear-gradient(45deg, #ef4444, #f59e0b)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Executive Approval
          </Typography>
          <Typography variant="h5" sx={{ color: '#94a3b8', mb: 4 }}>
            Review and approve pending analytics submissions
          </Typography>
          <Chip 
            label={`📋 Pending Submissions: ${pending.length}`} 
            color="warning" 
            sx={{ 
              fontSize: 16, 
              px: 3, 
              py: 1.5,
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#f8fafc'
            }} 
          />
        </Box>

        {pending.length === 0 ? (
          <Card sx={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          }}>
            <CardContent sx={{ p: 6, textAlign: 'center' }}>
              <Typography variant="h5" sx={{ color: '#94a3b8', mb: 2 }}>
                🎉 No Pending Submissions
              </Typography>
              <Typography sx={{ color: '#94a3b8' }}>
                All analytics submissions have been reviewed and processed.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Card sx={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" sx={{ mb: 4, fontWeight: 600, color: '#f8fafc' }}>
                Pending Submissions
              </Typography>
              <List sx={{ p: 0 }}>
                {pending.map(sub => (
                  <ListItem 
                    key={sub.submissionId}
                    sx={{
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      mb: 3,
                      background: 'rgba(255, 255, 255, 0.02)',
                      p: 3,
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Chip 
                            label={sub.department} 
                            sx={{ 
                              background: getDepartmentGradient(sub.department),
                              color: 'white',
                              fontWeight: 600
                            }}
                          />
                          <Typography variant="h6" sx={{ color: '#f8fafc' }}>
                            Due: {sub.dueDate}
                          </Typography>
                          <Chip 
                            label="Pending Review" 
                            color="warning" 
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ color: '#94a3b8', mb: 3 }}>
                          <Typography sx={{ mb: 1 }}>
                            <strong>Links:</strong> {sub.links}
                          </Typography>
                          <Typography sx={{ mb: 1 }}>
                            <strong>Description:</strong> {sub.description}
                          </Typography>
                          <Typography sx={{ mb: 1 }}>
                            <strong>Submitted:</strong> {new Date(sub.submittedAt).toLocaleDateString()} by {sub.submittedBy}
                          </Typography>
                        </Box>
                      }
                    />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button 
                        variant="contained" 
                        color="success" 
                        onClick={() => handleApprove(sub)}
                        sx={{ 
                          background: 'linear-gradient(45deg, #10b981, #059669)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #10b981, #059669)',
                            opacity: 0.9,
                          },
                          px: 3,
                          py: 1,
                          fontWeight: 600,
                        }}
                      >
                        ✅ Approve
                      </Button>
                      <Button 
                        variant="contained" 
                        color="error" 
                        onClick={() => { setSelected(sub); setDialogOpen(true); }}
                        sx={{ 
                          background: 'linear-gradient(45deg, #ef4444, #dc2626)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #ef4444, #dc2626)',
                            opacity: 0.9,
                          },
                          px: 3,
                          py: 1,
                          fontWeight: 600,
                        }}
                      >
                        ❌ Reject
                      </Button>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        )}

        <Dialog 
          open={dialogOpen} 
          onClose={() => setDialogOpen(false)}
          PaperProps={{
            sx: {
              background: 'rgba(30, 41, 59, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              minWidth: '500px',
            }
          }}
        >
          <DialogTitle sx={{ color: '#f8fafc', fontWeight: 600 }}>
            Reject Submission
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ color: '#94a3b8', mb: 2 }}>
              Please provide a reason for rejecting this submission:
            </Typography>
            <TextField
              label="Rejection Reason"
              fullWidth
              multiline
              minRows={3}
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#ef4444',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#94a3b8',
                },
                '& .MuiInputBase-input': {
                  color: '#f8fafc',
                },
              }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button 
              onClick={() => setDialogOpen(false)}
              sx={{ 
                color: '#94a3b8',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              color="error" 
              onClick={() => selected && handleReject(selected)}
              sx={{ 
                background: 'linear-gradient(45deg, #ef4444, #dc2626)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #ef4444, #dc2626)',
                  opacity: 0.9,
                },
                px: 3,
                py: 1,
                fontWeight: 600,
              }}
            >
              Reject
            </Button>
          </DialogActions>
        </Dialog>

        {message && (
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography sx={{ 
              color: message.includes('approved') ? '#10b981' : '#ef4444',
              fontSize: 18,
              fontWeight: 600,
            }}>
              {message}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ExecAnalyticsApproval; 