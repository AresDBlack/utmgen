import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box 
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'UTM Generator', path: '/utm-generator' },
    { name: 'Analytics Submission', path: '/analytics-home' },
    { name: 'Client Analytics', path: '/client-analytics-leaderboards' },
  ];

  return (
    <AppBar 
      position="static" 
      sx={{ 
        background: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <Toolbar>
        <Typography 
          variant="h6" 
          component={Link} 
          to="/"
          sx={{ 
            flexGrow: 1, 
            textDecoration: 'none', 
            color: '#f8fafc',
            fontWeight: 700,
            background: 'linear-gradient(45deg, #06b6d4, #a21caf)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          justSimplyMarketing
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {navItems.map((item) => (
            <Button
              key={item.name}
              component={Link}
              to={item.path}
              sx={{
                color: location.pathname === item.path ? '#06b6d4' : '#94a3b8',
                textTransform: 'none',
                fontWeight: 500,
                fontSize: 16,
                '&:hover': {
                  color: '#06b6d4',
                  background: 'rgba(255, 255, 255, 0.05)',
                },
              }}
            >
              {item.name}
            </Button>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 