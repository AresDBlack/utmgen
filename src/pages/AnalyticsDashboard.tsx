import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, TextField, Paper, List, ListItem, ListItemText, Chip, Card, CardContent } from '@mui/material';
import { useParams } from 'react-router-dom';
import { getDueDates, getAnalyticsSubmissions, createAnalyticsSubmission, getDepartmentStreaks } from '../services/googleSheets';
import type { AnalyticsSubmission } from '../services/googleSheets';
import AnalyticsNavbar from '../components/AnalyticsNavbar';

const DEPARTMENTS = [
  'Marketing',
  'Social Media',
  'Video Editing',
  'Lead Gen',
  'Graphic Design',
  'Sales',
];

const AnalyticsDashboard = () => {
  const { department: urlDepartment } = useParams<{ department: string }>();
  const [department, setDepartment] = useState('Marketing');
  const [submissions, setSubmissions] = useState<AnalyticsSubmission[]>([]);
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [nextDueDate, setNextDueDate] = useState('');
  const [links, setLinks] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Set department from URL parameter if available
    if (urlDepartment) {
      const decodedDepartment = decodeURIComponent(urlDepartment);
      setDepartment(decodedDepartment);
    }
  }, [urlDepartment]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const allSubmissions = await getAnalyticsSubmissions();
      const streaks = await getDepartmentStreaks();
      const deptStreak = streaks.find(s => s.department === department);
      setSubmissions(allSubmissions.filter(s => s.department === department));
      setStreak(deptStreak?.currentStreak || 0);
      setLongestStreak(deptStreak?.longestStreak || 0);
      // Calculate next due date
      const today = new Date();
      const dueDates = getDueDates(today.getFullYear());
      const nextDue = dueDates.find(date => new Date(date) >= today);
      setNextDueDate(nextDue || '');
      setLoading(false);
    };
    fetchData();
  }, [department]);

  const handleSubmit = async () => {
    setMessage('');
    if (!links || !description || !email) {
      setMessage('Please provide links, description, and your email address.');
      return;
    }
    const today = new Date();
    const dueDates = getDueDates(today.getFullYear());
    const nextDue = dueDates.find(date => new Date(date) >= today);
    await createAnalyticsSubmission({
      department,
      dueDate: nextDue || '',
      submittedAt: new Date().toISOString(),
      submittedBy: email,
      links,
      description,
    });
    setLinks('');
    setDescription('');
    setEmail('');
    setMessage('Submission sent for approval!');
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
            background: getDepartmentGradient(department),
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Analytics Dashboard
          </Typography>
          <Typography variant="h5" sx={{ color: '#94a3b8', mb: 4 }}>
            Department: {department}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4 }}>
            <Chip 
              label={`🔥 Current Streak: ${streak} weeks`} 
              color={streak >= 2 ? 'warning' : 'default'} 
              sx={{ 
                fontSize: 16, 
                px: 3, 
                py: 1.5,
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#f8fafc'
              }} 
            />
            <Chip 
              label={`🏆 Longest Streak: ${longestStreak} weeks`} 
              color="primary" 
              sx={{ 
                fontSize: 16, 
                px: 3, 
                py: 1.5,
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#f8fafc'
              }} 
            />
            <Chip 
              label={`📅 Next Due: ${nextDueDate}`} 
              color="info" 
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
        </Box>

        {/* Submit Analytics Section */}
        <Card sx={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          mb: 4,
        }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#f8fafc' }}>
              Submit Analytics
            </Typography>
            <TextField
              label="Links (comma or newline separated)"
              fullWidth
              multiline
              minRows={3}
              value={links}
              onChange={e => setLinks(e.target.value)}
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: getDepartmentGradient(department),
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
            <TextField
              label="Description"
              fullWidth
              multiline
              minRows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: getDepartmentGradient(department),
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
            <TextField
              label="Your Email Address"
              type="email"
              fullWidth
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: getDepartmentGradient(department),
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
            <Button 
              variant="contained" 
              onClick={handleSubmit}
              sx={{ 
                background: getDepartmentGradient(department),
                '&:hover': {
                  background: getDepartmentGradient(department),
                  opacity: 0.9,
                },
                px: 4,
                py: 1.5,
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              Submit Analytics
            </Button>
            {message && (
              <Typography sx={{ mt: 2, color: message.includes('sent') ? '#10b981' : '#ef4444' }}>
                {message}
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Past Submissions Section */}
        <Card sx={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#f8fafc' }}>
              Past Submissions
            </Typography>
            {submissions.length === 0 ? (
              <Typography sx={{ color: '#94a3b8', textAlign: 'center', py: 4 }}>
                No submissions yet. Start by submitting your first analytics report above.
              </Typography>
            ) : (
              <List sx={{ p: 0 }}>
                {submissions.map(sub => (
                  <ListItem 
                    key={sub.submissionId}
                    sx={{
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      mb: 2,
                      background: 'rgba(255, 255, 255, 0.02)',
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                          <Typography variant="h6" sx={{ color: '#f8fafc' }}>
                            Due: {sub.dueDate}
                          </Typography>
                          <Chip 
                            label={sub.status} 
                            color={
                              sub.status === 'approved' ? 'success' : 
                              sub.status === 'rejected' ? 'error' : 'warning'
                            }
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ color: '#94a3b8' }}>
                          <Typography sx={{ mb: 1 }}>
                            <strong>Links:</strong> {sub.links}
                          </Typography>
                          <Typography sx={{ mb: 1 }}>
                            <strong>Description:</strong> {sub.description}
                          </Typography>
                          <Typography sx={{ mb: 1 }}>
                            <strong>Submitted:</strong> {new Date(sub.submittedAt).toLocaleDateString()}
                          </Typography>
                          {sub.status === 'approved' && (
                            <Typography sx={{ color: '#10b981' }}>
                              <strong>Approved:</strong> {new Date(sub.approvedAt).toLocaleDateString()}
                            </Typography>
                          )}
                          {sub.status === 'rejected' && (
                            <Typography sx={{ color: '#ef4444' }}>
                              <strong>Rejected:</strong> {sub.rejectionReason}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default AnalyticsDashboard; 