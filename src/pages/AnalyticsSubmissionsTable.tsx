import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Chip, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  FilterList, 
  Search, 
  Visibility,
  Download
} from '@mui/icons-material';
import { getAnalyticsSubmissions } from '../services/googleSheets';
import type { AnalyticsSubmission } from '../services/googleSheets';
import AnalyticsNavbar from '../components/AnalyticsNavbar';

const DEPARTMENTS = [
  'Marketing',
  'Sales',
  'Social Media',
  'Lead Gen',
  'Graphic Design',
  'Video Editing',
];

const STATUSES = ['pending', 'approved', 'rejected'];

const AnalyticsSubmissionsTable = () => {
  const [submissions, setSubmissions] = useState<AnalyticsSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<AnalyticsSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<AnalyticsSubmission | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Filters
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      try {
        const data = await getAnalyticsSubmissions();
        setSubmissions(data);
        setFilteredSubmissions(data);
      } catch (error) {
        console.error('Error fetching submissions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  useEffect(() => {
    let filtered = submissions;

    // Apply department filter
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(sub => sub.department === departmentFilter);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(sub => sub.status === statusFilter);
    }

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(sub => 
        sub.department.toLowerCase().includes(term) ||
        sub.description.toLowerCase().includes(term) ||
        sub.links.toLowerCase().includes(term) ||
        sub.submittedBy.toLowerCase().includes(term)
      );
    }

    // Apply date range filter
    if (dateFrom) {
      filtered = filtered.filter(sub => new Date(sub.submittedAt) >= new Date(dateFrom));
    }
    if (dateTo) {
      filtered = filtered.filter(sub => new Date(sub.submittedAt) <= new Date(dateTo));
    }

    setFilteredSubmissions(filtered);
  }, [submissions, departmentFilter, statusFilter, searchTerm, dateFrom, dateTo]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
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

  const handleViewDetails = (submission: AnalyticsSubmission) => {
    setSelectedSubmission(submission);
    setDialogOpen(true);
  };

  const exportToCSV = () => {
    const headers = ['Submission ID', 'Department', 'Due Date', 'Submitted At', 'Submitted By', 'Status', 'Links', 'Description'];
    const csvContent = [
      headers.join(','),
      ...filteredSubmissions.map(sub => [
        sub.submissionId,
        sub.department,
        sub.dueDate,
        sub.submittedAt,
        sub.submittedBy,
        sub.status,
        `"${sub.links.replace(/"/g, '""')}"`,
        `"${sub.description.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-submissions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
    }}>
      <AnalyticsNavbar />
      <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" sx={{ 
            fontWeight: 700, 
            mb: 2, 
            background: 'linear-gradient(45deg, #8b5cf6, #10b981)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Analytics Submissions
          </Typography>
          <Typography variant="h5" sx={{ color: '#94a3b8', mb: 4 }}>
            View and manage all analytics submissions
          </Typography>
          <Chip 
            label={`📊 Total Submissions: ${submissions.length}`} 
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

        {/* Filters */}
        <Card sx={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          mb: 4,
        }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <FilterList sx={{ color: '#94a3b8' }} />
              <Typography variant="h6" sx={{ color: '#f8fafc', fontWeight: 600 }}>
                Filters
              </Typography>
            </Box>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(auto-fit, minmax(200px, 1fr))' }, gap: 3 }}>
              <TextField
                label="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ color: '#94a3b8', mr: 1 }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                    '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
                  },
                  '& .MuiInputLabel-root': { color: '#94a3b8' },
                  '& .MuiInputBase-input': { color: '#f8fafc' },
                }}
              />
              
              <FormControl>
                <InputLabel sx={{ color: '#94a3b8' }}>Department</InputLabel>
                <Select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  label="Department"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                      '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                      '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
                    },
                    '& .MuiInputLabel-root': { color: '#94a3b8' },
                    '& .MuiSelect-select': { color: '#f8fafc' },
                  }}
                >
                  <MenuItem value="all">All Departments</MenuItem>
                  {DEPARTMENTS.map(dept => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <InputLabel sx={{ color: '#94a3b8' }}>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                      '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                      '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
                    },
                    '& .MuiInputLabel-root': { color: '#94a3b8' },
                    '& .MuiSelect-select': { color: '#f8fafc' },
                  }}
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  {STATUSES.map(status => (
                    <MenuItem key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="From Date"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                    '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
                  },
                  '& .MuiInputLabel-root': { color: '#94a3b8' },
                  '& .MuiInputBase-input': { color: '#f8fafc' },
                }}
              />

              <TextField
                label="To Date"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                    '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
                  },
                  '& .MuiInputLabel-root': { color: '#94a3b8' },
                  '& .MuiInputBase-input': { color: '#f8fafc' },
                }}
              />

              <Button
                variant="contained"
                onClick={exportToCSV}
                startIcon={<Download />}
                sx={{
                  background: 'linear-gradient(45deg, #10b981, #059669)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #10b981, #059669)',
                    opacity: 0.9,
                  },
                  px: 3,
                  py: 1.5,
                  fontWeight: 600,
                }}
              >
                Export CSV
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Results Count */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ color: '#94a3b8' }}>
            Showing {filteredSubmissions.length} of {submissions.length} submissions
          </Typography>
        </Box>

        {/* Table */}
        <Card sx={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        }}>
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                    <TableCell sx={{ color: '#f8fafc', fontWeight: 600 }}>Department</TableCell>
                    <TableCell sx={{ color: '#f8fafc', fontWeight: 600 }}>Due Date</TableCell>
                    <TableCell sx={{ color: '#f8fafc', fontWeight: 600 }}>Submitted</TableCell>
                    <TableCell sx={{ color: '#f8fafc', fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ color: '#f8fafc', fontWeight: 600 }}>Submitted By</TableCell>
                    <TableCell sx={{ color: '#f8fafc', fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSubmissions.map((submission) => (
                    <TableRow 
                      key={submission.submissionId}
                      sx={{ 
                        '&:hover': { background: 'rgba(255, 255, 255, 0.05)' },
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <TableCell>
                        <Chip 
                          label={submission.department} 
                          sx={{ 
                            background: getDepartmentGradient(submission.department),
                            color: 'white',
                            fontWeight: 600
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#f8fafc' }}>
                        {new Date(submission.dueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell sx={{ color: '#f8fafc' }}>
                        {new Date(submission.submittedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={submission.status} 
                          color={getStatusColor(submission.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#94a3b8' }}>
                        {submission.submittedBy}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton
                            onClick={() => handleViewDetails(submission)}
                            sx={{ color: '#8b5cf6' }}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Details Dialog */}
        <Dialog 
          open={dialogOpen} 
          onClose={() => setDialogOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              background: 'rgba(30, 41, 59, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
            }
          }}
        >
          <DialogTitle sx={{ color: '#f8fafc', fontWeight: 600 }}>
            Submission Details
          </DialogTitle>
          <DialogContent>
            {selectedSubmission && (
              <Box sx={{ color: '#94a3b8' }}>
                <Typography sx={{ mb: 2 }}>
                  <strong>Department:</strong> {selectedSubmission.department}
                </Typography>
                <Typography sx={{ mb: 2 }}>
                  <strong>Due Date:</strong> {selectedSubmission.dueDate}
                </Typography>
                <Typography sx={{ mb: 2 }}>
                  <strong>Submitted:</strong> {new Date(selectedSubmission.submittedAt).toLocaleString()}
                </Typography>
                <Typography sx={{ mb: 2 }}>
                  <strong>Submitted By:</strong> {selectedSubmission.submittedBy}
                </Typography>
                <Typography sx={{ mb: 2 }}>
                  <strong>Status:</strong> 
                  <Chip 
                    label={selectedSubmission.status} 
                    color={getStatusColor(selectedSubmission.status) as any}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>
                <Typography sx={{ mb: 2 }}>
                  <strong>Links:</strong>
                </Typography>
                <Box sx={{ 
                  background: 'rgba(255, 255, 255, 0.05)', 
                  p: 2, 
                  borderRadius: '8px',
                  mb: 2,
                  color: '#f8fafc'
                }}>
                  {selectedSubmission.links.split(/[,\n]/).map((link, index) => {
                    const trimmedLink = link.trim();
                    if (trimmedLink) {
                      return (
                        <Box key={index} sx={{ mb: 1 }}>
                          <a 
                            href={trimmedLink.startsWith('http') ? trimmedLink : `https://${trimmedLink}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: '#8b5cf6',
                              textDecoration: 'none',
                              wordBreak: 'break-all',
                            }}
                            onMouseEnter={(e) => {
                              (e.target as HTMLAnchorElement).style.textDecoration = 'underline';
                            }}
                            onMouseLeave={(e) => {
                              (e.target as HTMLAnchorElement).style.textDecoration = 'none';
                            }}
                          >
                            {trimmedLink}
                          </a>
                        </Box>
                      );
                    }
                    return null;
                  })}
                </Box>
                <Typography sx={{ mb: 2 }}>
                  <strong>Description:</strong>
                </Typography>
                <Box sx={{ 
                  background: 'rgba(255, 255, 255, 0.05)', 
                  p: 2, 
                  borderRadius: '8px',
                  color: '#f8fafc'
                }}>
                  {selectedSubmission.description}
                </Box>
                {selectedSubmission.status === 'approved' && (
                  <Typography sx={{ mt: 2, color: '#10b981' }}>
                    <strong>Approved:</strong> {new Date(selectedSubmission.approvedAt).toLocaleString()} by {selectedSubmission.approvedBy}
                  </Typography>
                )}
                {selectedSubmission.status === 'rejected' && (
                  <Typography sx={{ mt: 2, color: '#ef4444' }}>
                    <strong>Rejected:</strong> {selectedSubmission.rejectionReason}
                  </Typography>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button 
              onClick={() => setDialogOpen(false)}
              sx={{ 
                color: '#94a3b8',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default AnalyticsSubmissionsTable; 