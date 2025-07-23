import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Chip, Card, CardContent } from '@mui/material';
import { getDepartmentStreaks } from '../services/googleSheets';
import type { DepartmentStreak } from '../services/googleSheets';
import AnalyticsNavbar from '../components/AnalyticsNavbar';

const AnalyticsLeaderboard = () => {
  const [streaks, setStreaks] = useState<DepartmentStreak[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStreaks = async () => {
      setLoading(true);
      try {
        const data = await getDepartmentStreaks();
        setStreaks(data.sort((a, b) => b.currentStreak - a.currentStreak));
      } catch (error) {
        console.error('Error fetching streaks:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStreaks();
  }, []);

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

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
    }}>
      <AnalyticsNavbar />
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" sx={{ 
            fontWeight: 700, 
            mb: 2, 
            background: 'linear-gradient(45deg, #f59e0b, #ef4444)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Department Leaderboard
          </Typography>
          <Typography variant="h5" sx={{ color: '#94a3b8', mb: 4 }}>
            Track submission streaks across all departments
          </Typography>
          <Chip 
            label={`🏆 ${streaks.length} Departments Competing`} 
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
        </Box>

        {loading ? (
          <Card sx={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          }}>
            <CardContent sx={{ p: 6, textAlign: 'center' }}>
              <Typography sx={{ color: '#94a3b8', fontSize: 18 }}>
                Loading leaderboard...
              </Typography>
            </CardContent>
          </Card>
        ) : streaks.length === 0 ? (
          <Card sx={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          }}>
            <CardContent sx={{ p: 6, textAlign: 'center' }}>
              <Typography variant="h5" sx={{ color: '#94a3b8', mb: 2 }}>
                📊 No Streaks Yet
              </Typography>
              <Typography sx={{ color: '#94a3b8' }}>
                Start submitting analytics to see department rankings!
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
                Current Rankings
              </Typography>
              <List sx={{ p: 0 }}>
                {streaks.map((streak, index) => (
                  <ListItem 
                    key={streak.department}
                    sx={{
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      mb: 2,
                      background: index < 3 ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                      p: 3,
                      position: 'relative',
                      '&:hover': {
                        background: index < 3 ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.05)',
                      },
                    }}
                  >
                    <Box sx={{ 
                      position: 'absolute', 
                      left: -10, 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      fontSize: '2rem',
                      fontWeight: 700,
                      color: index < 3 ? '#f59e0b' : '#94a3b8',
                    }}>
                      {getRankIcon(index + 1)}
                    </Box>
                    
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                          <Chip 
                            label={streak.department} 
                            sx={{ 
                              background: getDepartmentGradient(streak.department),
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '1rem',
                              px: 2,
                              py: 1,
                            }}
                          />
                          {streak.currentStreak >= 2 && (
                            <Typography sx={{ fontSize: '1.5rem' }}>
                              🔥
                            </Typography>
                          )}
                        </Box>
                      }
                      secondary={
                        <Box sx={{ color: '#94a3b8', mt: 1 }}>
                          <Typography sx={{ mb: 0.5 }}>
                            <strong>Current Streak:</strong> {streak.currentStreak} weeks
                          </Typography>
                          <Typography>
                            <strong>Longest Streak:</strong> {streak.longestStreak} weeks
                          </Typography>
                          {streak.lastApprovedSubmissionDate && (
                            <Typography sx={{ mt: 0.5, fontSize: '0.9rem', opacity: 0.8 }}>
                              Last submission: {new Date(streak.lastApprovedSubmissionDate).toLocaleDateString()}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end' }}>
                      <Chip 
                        label={`🔥 ${streak.currentStreak} weeks`} 
                        color={streak.currentStreak >= 2 ? 'warning' : 'default'} 
                        sx={{ 
                          fontSize: 14,
                          fontWeight: 600,
                          background: streak.currentStreak >= 2 ? 'rgba(255, 193, 7, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          color: streak.currentStreak >= 2 ? '#f59e0b' : '#f8fafc'
                        }} 
                      />
                      <Chip 
                        label={`🏆 ${streak.longestStreak} weeks`} 
                        color="primary" 
                        sx={{ 
                          fontSize: 14,
                          fontWeight: 600,
                          background: 'rgba(139, 92, 246, 0.2)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          color: '#8b5cf6'
                        }} 
                      />
                    </Box>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default AnalyticsLeaderboard; 