import { Container, Typography, Grid, Card, CardContent, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Home = () => {
  const navigate = useNavigate();

  const departments = [
    { 
      name: 'Marketing', 
      path: '/marketing', 
      description: 'Generate UTM links for marketing campaigns',
      gradient: 'linear-gradient(45deg, #6366f1, #ec4899)', // Indigo to Pink
    },
    { 
      name: 'Sales', 
      path: '/sales', 
      description: 'Create UTM links for sales initiatives',
      gradient: 'linear-gradient(45deg, #10b981, #3b82f6)', // Emerald to Blue
    },
    { 
      name: 'Social Media', 
      path: '/social', 
      description: 'Generate UTM links for social media posts',
      gradient: 'linear-gradient(45deg, #f59e0b, #ef4444)', // Amber to Red
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 8 }}>
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{ textAlign: 'center', mb: 6 }}
      >
        <Typography 
          variant="h1" 
          component="h1" 
          gutterBottom
          sx={{
            background: 'linear-gradient(45deg, #8b5cf6, #ec4899)', // Purple to Pink for Home
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700,
          }}
        >
          UTM Generator
        </Typography>
        <Typography 
          variant="h5" 
          component="h2" 
          color="text.secondary"
          sx={{ maxWidth: '600px', mx: 'auto' }}
        >
          Create trackable links for your marketing campaigns with our powerful UTM generator
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {departments.map((department, index) => (
          <Grid  component="div" key={department.name} sx={{ xs: 12, md: 4 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
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
                  <Box
                    sx={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: department.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" sx={{ color: 'white' }}>
                      {department.name[0]}
                    </Typography>
                  </Box>
                  <Typography 
                    variant="h5" 
                    component="h2" 
                    gutterBottom
                    sx={{ 
                      fontWeight: 600,
                      background: department.gradient,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {department.name}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 3 }}>
                    {department.description}
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => navigate(department.path)}
                    sx={{
                      background: department.gradient,
                      '&:hover': {
                        background: department.gradient,
                        opacity: 0.9,
                      },
                    }}
                  >
                    Generate UTM Links
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Home; 