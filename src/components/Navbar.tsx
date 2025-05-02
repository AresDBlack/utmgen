import { AppBar, Toolbar, Typography, Box, Button } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Marketing', path: '/marketing' },
    { name: 'Sales', path: '/sales' },
    { name: 'Social Media', path: '/social' },
    { name: 'Others', path: '/others' },
  ];

  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{ 
        background: 'transparent',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <Toolbar sx={{ maxWidth: '1200px', width: '100%', mx: 'auto' }}>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1,
            fontWeight: 700,
            background: 'linear-gradient(45deg, #6366f1, #ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
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
                color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
                fontWeight: location.pathname === item.path ? 600 : 400,
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  backgroundColor: 'primary.main',
                  opacity: location.pathname === item.path ? 1 : 0,
                  transition: 'opacity 0.3s ease',
                },
                '&:hover': {
                  color: 'primary.main',
                  '&::after': {
                    opacity: 1,
                  },
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