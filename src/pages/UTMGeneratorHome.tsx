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
  Campaign as CampaignIcon, 
  TrendingUp as SalesIcon, 
  Share as SocialIcon, 
  MoreHoriz as OthersIcon, 
  Group as AffiliatesIcon 
} from '@mui/icons-material';

const UTMGeneratorHome = () => {
  const departments = [
    {
      name: 'Marketing',
      path: '/marketing',
      description: 'Generate UTM links for marketing campaigns',
      icon: <CampaignIcon sx={{ fontSize: 48, color: '#6366f1' }} />,
      gradient: 'linear-gradient(45deg, #6366f1, #ec4899)',
    },
    {
      name: 'Sales',
      path: '/sales',
      description: 'Create UTM links for sales initiatives',
      icon: <SalesIcon sx={{ fontSize: 48, color: '#10b981' }} />,
      gradient: 'linear-gradient(45deg, #10b981, #3b82f6)',
    },
    {
      name: 'Social Media',
      path: '/social',
      description: 'Generate UTM links for social media posts',
      icon: <SocialIcon sx={{ fontSize: 48, color: '#f59e0b' }} />,
      gradient: 'linear-gradient(45deg, #f59e0b, #ef4444)',
    },
    {
      name: 'Others',
      path: '/others',
      description: 'Generate UTM links for other purposes',
      icon: <OthersIcon sx={{ fontSize: 48, color: '#8b5cf6' }} />,
      gradient: 'linear-gradient(45deg, #8b5cf6, #10b981)',
    },
    {
      name: 'Affiliates',
      path: '/affiliates',
      description: 'Generate UTM links for affiliate partners',
      icon: <AffiliatesIcon sx={{ fontSize: 48, color: '#06b6d4' }} />,
      gradient: 'linear-gradient(45deg, #06b6d4, #a21caf)',
    },
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
    }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h3" sx={{ 
            fontWeight: 700, 
            mb: 3, 
            background: 'linear-gradient(45deg, #06b6d4, #a21caf)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            UTM Generator
          </Typography>
          <Typography variant="h5" sx={{ color: '#94a3b8', mb: 6 }}>
            Choose a department to generate UTM tracking links
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {departments.map((department, index) => (
            <Grid item xs={12} sm={6} md={4} key={department.name}>
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
                  background: department.gradient,
                }} />
                
                <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    {department.icon}
                    <Typography variant="h4" sx={{ 
                      fontWeight: 700, 
                      mt: 2, 
                      mb: 2,
                      background: department.gradient,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      {department.name}
                    </Typography>
                    <Typography sx={{ color: '#94a3b8', mb: 3 }}>
                      {department.description}
                    </Typography>
                  </Box>

                  <Button
                    component={Link}
                    to={department.path}
                    variant="contained"
                    fullWidth
                    sx={{
                      background: department.gradient,
                      color: 'white',
                      fontWeight: 600,
                      py: 1.5,
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontSize: 16,
                      '&:hover': {
                        background: department.gradient,
                        opacity: 0.9,
                        transform: 'scale(1.02)',
                      },
                    }}
                  >
                    Generate UTM Links
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Typography variant="h6" sx={{ color: '#94a3b8', mb: 2 }}>
            🚀 Ready to create tracking links?
          </Typography>
          <Typography sx={{ color: '#64748b' }}>
            Select a department above to start generating UTM links for your campaigns
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default UTMGeneratorHome; 