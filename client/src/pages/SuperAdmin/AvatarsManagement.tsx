import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,
  Alert,
  CircularProgress,
  Divider,
  Link,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  CloudUpload as CloudUploadIcon,
  Refresh as RefreshIcon,
  Link as LinkIcon
} from '@mui/icons-material';

interface Avatar {
  id: string;
  name: string;
  url: string;
  type: string;
  createdBy: string;
  createdAt: string;
  modelUrl?: string;
  thumbnailUrl?: string;
  description?: string;
  status?: 'active' | 'inactive' | 'pending';
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`avatar-tabpanel-${index}`}
      aria-labelledby={`avatar-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AvatarsManagement: React.FC = () => {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    type: 'readyplayerme',
    description: '',
    thumbnailUrl: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchAvatars();
  }, []);

  const fetchAvatars = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/readyplayerme/avatars');
      if (response.data.success) {
        setAvatars(response.data.data);
      } else {
        showSnackbar('Failed to load avatars', 'error');
      }
    } catch (error) {
      console.error('Error fetching avatars:', error);
      showSnackbar('Error connecting to server', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name as string]: value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      name: '',
      url: '',
      type: 'readyplayerme',
      description: '',
      thumbnailUrl: ''
    });
    setSelectedAvatar(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFile(null);
  };

  const handleEditAvatar = (avatar: Avatar) => {
    setSelectedAvatar(avatar);
    setFormData({
      name: avatar.name,
      url: avatar.url,
      type: avatar.type,
      description: avatar.description || '',
      thumbnailUrl: avatar.thumbnailUrl || ''
    });
    setOpenDialog(true);
  };

  const handleOpenDeleteDialog = (avatar: Avatar) => {
    setSelectedAvatar(avatar);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let fileUrl = '';
      
      // Si hay un archivo seleccionado, subir primero
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        
        const uploadResponse = await axios.post('/api/readyplayerme/avatars/upload-image', formData);
        
        if (uploadResponse.data.success) {
          fileUrl = uploadResponse.data.data.url;
        } else {
          showSnackbar('Failed to upload image', 'error');
          return;
        }
      }
      
      // Preparar datos para enviar
      const avatarData = {
        ...formData,
        thumbnailUrl: fileUrl || formData.thumbnailUrl,
        createdBy: 'SuperAdmin' // En un sistema real, esto vendría del usuario autenticado
      };
      
      let response;
      
      if (selectedAvatar) {
        // Actualizar avatar existente
        response = await axios.put(`/api/readyplayerme/avatars/${selectedAvatar.id}`, avatarData);
        showSnackbar('Avatar updated successfully', 'success');
      } else {
        // Crear nuevo avatar
        response = await axios.post('/api/readyplayerme/avatars', avatarData);
        showSnackbar('Avatar created successfully', 'success');
      }
      
      if (response.data.success) {
        fetchAvatars();
        handleCloseDialog();
      } else {
        showSnackbar('Operation failed', 'error');
      }
    } catch (error) {
      console.error('Error submitting avatar:', error);
      showSnackbar('Error processing request', 'error');
    }
  };

  const handleDeleteAvatar = async () => {
    if (!selectedAvatar) return;
    
    try {
      const response = await axios.delete(`/api/readyplayerme/avatars/${selectedAvatar.id}`);
      
      if (response.data.success) {
        fetchAvatars();
        showSnackbar('Avatar deleted successfully', 'success');
      } else {
        showSnackbar('Failed to delete avatar', 'error');
      }
    } catch (error) {
      console.error('Error deleting avatar:', error);
      showSnackbar('Error processing request', 'error');
    } finally {
      handleCloseDeleteDialog();
    }
  };

  const handleSaveFromReadyPlayerMe = async () => {
    // Aquí implementaríamos la lógica para guardar desde Ready Player Me
    showSnackbar('This feature will connect to the Ready Player Me API', 'info');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Avatars Management
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Manage 3D avatars for your cryptocurrency platform
        </Typography>
        <Divider sx={{ my: 2 }} />
      </Box>
      
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="avatar management tabs"
            variant="fullWidth"
          >
            <Tab label="Avatar Gallery" />
            <Tab label="Ready Player Me Integration" />
            <Tab label="Settings" />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" component="h2">
              Avatar Gallery
            </Typography>
            <Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenDialog}
                sx={{ mr: 1 }}
              >
                Add Avatar
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchAvatars}
              >
                Refresh
              </Button>
            </Box>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : avatars.length > 0 ? (
            <Grid container spacing={3}>
              {avatars.map((avatar) => (
                <Grid item key={avatar.id} xs={12} sm={6} md={4}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={avatar.thumbnailUrl || '/avatars/default.png'}
                      alt={avatar.name}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="h3" gutterBottom>
                        {avatar.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom noWrap>
                        {avatar.description || 'No description'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Type: {avatar.type}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Created: {new Date(avatar.createdAt).toLocaleDateString()}
                      </Typography>
                      {avatar.status && (
                        <Typography 
                          variant="body2" 
                          sx={{
                            color: avatar.status === 'active' ? 'success.main' : 
                                  avatar.status === 'inactive' ? 'error.main' : 'warning.main'
                          }}
                        >
                          Status: {avatar.status}
                        </Typography>
                      )}
                    </CardContent>
                    <Box sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'space-between' }}>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleEditAvatar(avatar)}
                      >
                        Edit
                      </Button>
                      <IconButton 
                        color="error" 
                        size="small"
                        onClick={() => handleOpenDeleteDialog(avatar)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                No avatars found
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Add your first avatar to get started
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenDialog}
                sx={{ mt: 2 }}
              >
                Add Avatar
              </Button>
            </Paper>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Ready Player Me Integration
            </Typography>
            <Typography variant="body1" paragraph>
              Connect with Ready Player Me to create and import custom 3D avatars for your platform.
            </Typography>
            
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Quick Import
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'flex-end', mb: 3 }}>
                <TextField
                  label="Ready Player Me Avatar URL"
                  variant="outlined"
                  fullWidth
                  sx={{ mr: 2 }}
                  placeholder="https://models.readyplayer.me/avatar.glb"
                />
                <Button 
                  variant="contained" 
                  startIcon={<CloudUploadIcon />}
                  onClick={handleSaveFromReadyPlayerMe}
                >
                  Import
                </Button>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                Create New Avatar
              </Typography>
              <Button 
                variant="contained" 
                color="primary"
                fullWidth
                component={Link}
                href="https://demo.readyplayer.me/avatar"
                target="_blank"
                rel="noopener"
                startIcon={<LinkIcon />}
              >
                Open Ready Player Me Creator
              </Button>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Create your avatar and then copy the URL to import it into the platform.
              </Typography>
            </Paper>
            
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                API Integration Settings
              </Typography>
              <TextField
                label="Ready Player Me API Key"
                variant="outlined"
                fullWidth
                sx={{ mb: 2 }}
                type="password"
              />
              <TextField
                label="Subdomain"
                variant="outlined"
                fullWidth
                sx={{ mb: 2 }}
                placeholder="your-app"
                helperText="Your Ready Player Me subdomain (e.g., your-app.readyplayer.me)"
              />
              <Button variant="contained">
                Save Settings
              </Button>
            </Paper>
          </Box>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Avatar Settings
            </Typography>
            
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Default Avatar
              </Typography>
              <Typography variant="body2" paragraph color="text.secondary">
                Select the default avatar to use when a user doesn't have a custom avatar.
              </Typography>
              
              {!loading && avatars.length > 0 ? (
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="default-avatar-label">Default Avatar</InputLabel>
                  <Select
                    labelId="default-avatar-label"
                    label="Default Avatar"
                  >
                    {avatars.map((avatar) => (
                      <MenuItem key={avatar.id} value={avatar.id}>
                        {avatar.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <Typography variant="body2" color="error">
                  No avatars available to select as default.
                </Typography>
              )}
              
              <Button variant="contained" sx={{ mt: 2 }}>
                Save Settings
              </Button>
            </Paper>
            
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Avatar Storage
              </Typography>
              <Typography variant="body2" paragraph color="text.secondary">
                Configure where avatar files are stored.
              </Typography>
              
              <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                <InputLabel id="storage-type-label">Storage Type</InputLabel>
                <Select
                  labelId="storage-type-label"
                  label="Storage Type"
                  defaultValue="local"
                >
                  <MenuItem value="local">Local Storage</MenuItem>
                  <MenuItem value="cloud">Cloud Storage (Google Cloud)</MenuItem>
                  <MenuItem value="s3">Amazon S3</MenuItem>
                </Select>
              </FormControl>
              
              <Button variant="contained">
                Save Settings
              </Button>
            </Paper>
          </Box>
        </TabPanel>
      </Box>
      
      {/* Dialog para agregar/editar avatar */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{selectedAvatar ? 'Edit Avatar' : 'Add New Avatar'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Avatar Name"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.name}
              onChange={handleInputChange}
              required
              sx={{ mb: 2 }}
            />
            
            <TextField
              margin="dense"
              name="url"
              label="Avatar URL"
              type="url"
              fullWidth
              variant="outlined"
              value={formData.url}
              onChange={handleInputChange}
              required
              sx={{ mb: 2 }}
              helperText="URL to the 3D model (.glb or .gltf file)"
            />
            
            <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
              <InputLabel id="avatar-type-label">Avatar Type</InputLabel>
              <Select
                labelId="avatar-type-label"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                label="Avatar Type"
              >
                <MenuItem value="readyplayerme">Ready Player Me</MenuItem>
                <MenuItem value="custom">Custom</MenuItem>
                <MenuItem value="heygen">Heygen</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              margin="dense"
              name="description"
              label="Description"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.description}
              onChange={handleInputChange}
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Thumbnail Image
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                >
                  Upload Image
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </Button>
                <Typography variant="body2" sx={{ ml: 2 }}>
                  {file ? file.name : 'No file selected'}
                </Typography>
              </Box>
              {!file && formData.thumbnailUrl && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Current Thumbnail:
                  </Typography>
                  <img
                    src={formData.thumbnailUrl}
                    alt="Current thumbnail"
                    style={{ maxWidth: '100%', maxHeight: '100px' }}
                  />
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {selectedAvatar ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      
      {/* Dialog de confirmación para eliminar */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the avatar "{selectedAvatar?.name}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteAvatar} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AvatarsManagement;