import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  useTheme
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { BarChart, TableChart, Assessment } from '@mui/icons-material';

interface ClientAnalyticsNavbarProps {
  selectedClient: string;
  onClientChange: (client: string) => void;
}

const ClientAnalyticsNavbar: React.FC<ClientAnalyticsNavbarProps> = ({ 
  selectedClient, 
  onClientChange 
}) => {
  const location = useLocation();
  const theme = useTheme();

  const navItems = [
    { path: '/client-analytics/leaderboards', label: 'Leaderboards', icon: <BarChart /> },
    { path: '/client-analytics/table', label: 'Table View', icon: <TableChart /> },
    { path: '/client-analytics/summaries', label: 'Summaries', icon: <Assessment /> },
  ];

  const getGradient = () => {
    return 'linear-gradient(45deg, #06b6d4, #a21caf)';
  };

  return (
    <AppBar 
      position="static" 
      sx={{ 
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: 'none',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700,
              background: getGradient(),
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mr: 4
            }}
          >
            📊 Client Analytics
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {navItems.map((item) => (
              <Button
                key={item.path}
                component={Link}
                to={item.path}
                startIcon={item.icon}
                sx={{
                  color: location.pathname === item.path ? '#f8fafc' : '#94a3b8',
                  background: location.pathname === item.path 
                    ? 'rgba(255, 255, 255, 0.1)' 
                    : 'transparent',
                  borderRadius: '8px',
                  px: 2,
                  py: 1,
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#f8fafc',
                  },
                  textTransform: 'none',
                  fontWeight: 500,
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        </Box>

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel sx={{ color: '#94a3b8' }}>Client</InputLabel>
          <Select
            value={selectedClient}
            onChange={(e) => onClientChange(e.target.value)}
            sx={{
              color: '#f8fafc',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.2)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.3)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#06b6d4',
              },
              '& .MuiSvgIcon-root': {
                color: '#94a3b8',
              },
            }}
          >
            <MenuItem value="All">All Clients</MenuItem>
            <MenuItem value="Danny">Danny</MenuItem>
            <MenuItem value="Nadine">Nadine</MenuItem>
            <MenuItem value="Shaun">Shaun</MenuItem>
          </Select>
        </FormControl>
      </Toolbar>
    </AppBar>
  );
};

export default ClientAnalyticsNavbar; 