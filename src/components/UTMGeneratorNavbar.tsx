import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box 
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

const UTMGeneratorNavbar = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/utm-generator' },
    { name: 'Sales', path: '/sales' },
    { name: 'Marketing', path: '/marketing' },
    { name: 'Social Media', path: '/social' },
    { name: 'Others', path: '/others' },
    { name: 'Affiliates', path: '/affiliates' },
  ];

  return (
    <AppBar 
      position="static" 
      sx={{ 
        background: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        mt: '64px',
      }}
    >
      <Toolbar>
        <Typography 
          variant="h6" 
          component={Link} 
          to="/utm-generator"
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
          UTM Generator
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

export default UTMGeneratorNavbar; 