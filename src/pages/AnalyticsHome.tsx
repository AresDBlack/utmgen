import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Chip, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getDepartmentStreaks, getDueDates } from '../services/googleSheets';
import AnalyticsNavbar from '../components/AnalyticsNavbar';

const DEPARTMENTS = [
  {
    name: 'Marketing',
    gradient: 'linear-gradient(45deg, #6366f1, #ec4899)',
  },
  {
    name: 'Sales',
    gradient: 'linear-gradient(45deg, #10b981, #3b82f6)',
  },
  {
    name: 'Social Media',
    gradient: 'linear-gradient(45deg, #f59e0b, #ef4444)',
  },
  {
    name: 'Lead Gen',
    gradient: 'linear-gradient(45deg, #8b5cf6, #10b981)',
  },
  {
    name: 'Graphic Design',
    gradient: 'linear-gradient(45deg, #8b5cf6, #10b981)',
  },
  {
    name: 'Video Editing',
    gradient: 'linear-gradient(45deg, #06b6d4, #a21caf)',
  },
];

const AnalyticsHome = () => {
  const [streaks, setStreaks] = useState<{ [key: string]: any }>({});
  const [nextDue, setNextDue] = useState('');
  const [countdown, setCountdown] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const streakArr = await getDepartmentStreaks();
      const streakMap: { [key: string]: any } = {};
      streakArr.forEach(s => { streakMap[s.department] = s; });
      setStreaks(streakMap);
      // Next due date (global, for all departments)
      const today = new Date();
      const dueDates = getDueDates(today.getFullYear());
      const next = dueDates.find(date => new Date(date) >= today);
      setNextDue(next || '');
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (nextDue) {
      const updateCountdown = () => {
        const now = new Date();
        const dueDate = new Date(nextDue);
        const diff = dueDate.getTime() - now.getTime();
        
        if (diff <= 0) {
          setCountdown('DUE NOW!');
        } else {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          setCountdown(`${days}d ${hours}h ${minutes}m`);
        }
      };
      
      updateCountdown();
      const interval = setInterval(updateCountdown, 60000); // Update every minute
      return () => clearInterval(interval);
    }
  }, [nextDue]);

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
    }}>
      <AnalyticsNavbar />
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, background: DEPARTMENTS[0]?.gradient || 'linear-gradient(45deg, #6366f1, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Analytics Submissions
          </Typography>
        </Box>

        {/* Due Date Section */}
        <Box sx={{ mb: 6 }}>
          <Card sx={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: '#f8fafc' }}>
                Next Submission Deadline
              </Typography>
              <Typography variant="h2" sx={{ 
                fontWeight: 900, 
                mb: 3, 
                background: 'linear-gradient(45deg, #ef4444, #f59e0b)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '3rem'
              }}>
                {countdown}
              </Typography>
              <Typography variant="h6" sx={{ mb: 2, color: '#94a3b8' }}>
                Due: {nextDue}
              </Typography>
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#f8fafc', fontWeight: 600 }}>
                  Required Submissions:
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Chip label="📅 Weekly (Mondays)" color="primary" sx={{ fontSize: 16, px: 2, py: 1 }} />
                  <Chip label="📊 Monthly (7th)" color="secondary" sx={{ fontSize: 16, px: 2, py: 1 }} />
                  <Chip label="📈 Quarterly Reviews" color="warning" sx={{ fontSize: 16, px: 2, py: 1 }} />
                  <Chip label="📋 Yearly (Jan 7th)" color="info" sx={{ fontSize: 16, px: 2, py: 1 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Department Cards */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '32px', justifyContent: 'center', '& > *': { flex: '1 1 300px', maxWidth: '400px' } }}>
          {DEPARTMENTS.map(dep => (
            <Box key={dep.name}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.2)',
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 4 }}>
                  <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, background: dep.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {dep.name}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 3 }}>
                    Submit and track analytics for {dep.name}
                  </Typography>
                  
                  {/* Streak inside card */}
                  <Box sx={{ mb: 3, textAlign: 'center' }}>
                    <Chip
                      label={`🔥 Current Streak: ${streaks[dep.name as string]?.currentStreak ?? 0} weeks`}
                      color={streaks[dep.name as string]?.currentStreak && streaks[dep.name as string]?.currentStreak >= 2 ? 'warning' : 'default'}
                      sx={{ 
                        fontSize: 14, 
                        px: 2, 
                        py: 1, 
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: '#f8fafc',
                        fontWeight: 500
                      }}
                    />
                  </Box>
                  
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => navigate(`/analytics-dashboard/${encodeURIComponent(dep.name)}`)}
                    sx={{ background: dep.gradient, '&:hover': { background: dep.gradient, opacity: 0.9 } }}
                  >
                    Submit Analytics
                  </Button>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default AnalyticsHome; 