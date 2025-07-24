import React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Button 
} from '@mui/material';
import { Link } from 'react-router-dom';
import { 
  Link as LinkIcon, 
  Analytics as AnalyticsIcon, 
  Assessment as AssessmentIcon 
} from '@mui/icons-material';

const Home = () => {
  const sections = [
    {
      title: 'UTM Generator',
      description: 'Create and manage UTM tracking links for different departments and campaigns.',
      icon: <LinkIcon sx={{ fontSize: 48, color: '#06b6d4' }} />,
      path: '/utm-generator',
      gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)',
      features: ['Sales', 'Marketing', 'Social Media', 'Others', 'Affiliates']
    },
    {
      title: 'Analytics Submission',
      description: 'Submit and track analytics reports with department-specific requirements and approval workflows.',
      icon: <AnalyticsIcon sx={{ fontSize: 48, color: '#10b981' }} />,
      path: '/analytics-home',
      gradient: 'linear-gradient(135deg, #10b981, #059669)',
      features: ['Weekly Reports', 'Monthly Reports', 'Quarterly Reports', 'Yearly Reports']
    },
    {
      title: 'Client Analytics',
      description: 'Analyze client performance data with detailed breakdowns and insights.',
      icon: <AssessmentIcon sx={{ fontSize: 48, color: '#8b5cf6' }} />,
      path: '/client-analytics-leaderboards',
      gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      features: ['Leaderboards', 'Table View', 'Summaries', 'Date Filtering']
    }
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
    }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h2" sx={{ 
            fontWeight: 700, 
            mb: 3, 
            background: 'linear-gradient(45deg, #06b6d4, #a21caf)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Welcome to justSimplyMarketing
          </Typography>
          <Typography variant="h5" sx={{ color: '#94a3b8', mb: 6 }}>
            Choose your analytics and tracking solution
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {sections.map((section, index) => (
            <Grid item xs={12} md={4} key={section.title}>
              <Card sx={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                },
              }}>
                <Box sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: section.gradient,
                }} />
                
                <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    {section.icon}
                    <Typography variant="h4" sx={{ 
                      fontWeight: 700, 
                      mt: 2, 
                      mb: 2,
                      background: section.gradient,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      {section.title}
                    </Typography>
                    <Typography sx={{ color: '#94a3b8', mb: 3 }}>
                      {section.description}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 3, flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ color: '#f8fafc', mb: 2, fontWeight: 600 }}>
                      Features:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {section.features.map((feature) => (
                        <Box
                          key={feature}
                          sx={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            color: '#f8fafc',
                            px: 2,
                            py: 0.5,
                            borderRadius: '12px',
                            fontSize: 14,
                            fontWeight: 500,
                          }}
                        >
                          {feature}
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  <Button
                    component={Link}
                    to={section.path}
                    variant="contained"
                    fullWidth
                    sx={{
                      background: section.gradient,
                      color: 'white',
                      fontWeight: 600,
                      py: 1.5,
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontSize: 16,
                      '&:hover': {
                        background: section.gradient,
                        opacity: 0.9,
                        transform: 'scale(1.02)',
                      },
                    }}
                  >
                    Open {section.title}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Typography variant="h6" sx={{ color: '#94a3b8', mb: 2 }}>
            🚀 Ready to get started?
          </Typography>
          <Typography sx={{ color: '#64748b' }}>
            Choose a section above to begin your analytics and tracking journey
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Home; 