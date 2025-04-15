import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import axios from 'axios';
import { 
  CircularProgress, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Button, 
  Container, 
  TextField, 
  Box,
  Paper 
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { SmartToy, Warning, Info } from '@mui/icons-material';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
  },
  background: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  borderRadius: '12px',
  overflow: 'hidden',
}));

const StyledCardMedia = styled(CardMedia)(({ theme }) => ({
  paddingTop: '100%', // 1:1 aspect ratio
  position: 'relative',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
}));

const AvatarOverlay = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  opacity: 0,
  transition: 'opacity 0.3s ease',
  '&:hover': {
    opacity: 1,
  },
}));

const VideoSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(3),
  borderRadius: '12px',
  background: theme.palette.mode === 'dark' ? '#1A2027' : '#f9f9f9',
}));

const StatusBadge = styled('div')(({ theme, status }: { theme: any, status: string }) => ({
  position: 'absolute',
  top: '10px',
  right: '10px',
  padding: '5px 10px',
  borderRadius: '20px',
  fontSize: '12px',
  fontWeight: 'bold',
  color: '#fff',
  background: status === 'online' 
    ? theme.palette.success.main 
    : status === 'offline' 
      ? theme.palette.error.main 
      : theme.palette.warning.main,
  zIndex: 1,
}));

interface Avatar {
  id: string;
  name: string;
  thumbnail: string;
  status?: 'online' | 'offline' | 'maintenance';
}

interface Voice {
  id: string;
  name: string;
  gender: string;
  accent?: string;
}

export default function AvatarsPage() {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [userPrompt, setUserPrompt] = useState('');
  const [generatingResponse, setGeneratingResponse] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [configStatus, setConfigStatus] = useState<{[key: string]: boolean}>({});

  // Fetch avatars on component mount
  useEffect(() => {
    const fetchAvatars = async () => {
      try {
        const { data } = await axios.get('/api/avatars');
        if (data.success) {
          setAvatars(data.data || []);
        } else {
          setError('Failed to load avatars');
        }
      } catch (err) {
        console.error('Error fetching avatars:', err);
        setError('Error connecting to avatar service');
      } finally {
        setLoading(false);
      }
    };

    const fetchConfigStatus = async () => {
      try {
        const { data } = await axios.get('/api/avatars/config-status');
        if (data.success) {
          setConfigStatus(data.data || {});
        }
      } catch (err) {
        console.error('Error fetching API configuration status:', err);
      }
    };

    // Example voice data - In a real implementation, this would come from the server
    setVoices([
      { id: 'voice1', name: 'Michael', gender: 'male', accent: 'American' },
      { id: 'voice2', name: 'Sophia', gender: 'female', accent: 'British' },
      { id: 'voice3', name: 'David', gender: 'male', accent: 'Australian' },
      { id: 'voice4', name: 'Emma', gender: 'female', accent: 'American' },
    ]);

    fetchAvatars();
    fetchConfigStatus();
  }, []);

  const handleAvatarSelect = (avatar: Avatar) => {
    setSelectedAvatar(avatar);
    // Reset previous responses
    setAiResponse('');
    setVideoUrl('');
  };

  const handleVoiceSelect = (voiceId: string) => {
    setSelectedVoice(voiceId);
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserPrompt(e.target.value);
  };

  const handleSubmit = async () => {
    if (!selectedAvatar || !selectedVoice || !userPrompt.trim()) {
      return;
    }

    setGeneratingResponse(true);
    setAiResponse('');
    setVideoUrl('');

    try {
      // First, get just the text response for instant feedback
      const textResponse = await axios.post('/api/avatars/text-response', {
        prompt: userPrompt
      });
      
      if (textResponse.data.success) {
        setAiResponse(textResponse.data.data.response || 'No response generated');
        
        // Then, get the full video response (which takes longer)
        const videoResponse = await axios.post('/api/avatars/generate-response', {
          prompt: userPrompt,
          avatarId: selectedAvatar.id,
          voiceId: selectedVoice
        });
        
        if (videoResponse.data.success) {
          setVideoUrl(videoResponse.data.data.videoUrl);
        } else {
          console.error('Error generating video:', videoResponse.data.message);
        }
      } else {
        setAiResponse('Failed to generate AI response');
      }
    } catch (err) {
      console.error('Error generating avatar response:', err);
      setAiResponse('Error: Failed to communicate with the AI service');
    } finally {
      setGeneratingResponse(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" mt={2}>
          Loading AI Avatars...
        </Typography>
      </Container>
    );
  }

  // Check if APIs are properly configured
  const isFullyConfigured = configStatus.openai && configStatus.heygen && configStatus.elevenlabs;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          AI Video Avatars
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Interact with our AI-powered video avatars for cryptocurrency insights and advice
        </Typography>
        
        {!isFullyConfigured && (
          <Paper 
            sx={{ 
              p: 2, 
              mt: 2, 
              display: 'flex', 
              alignItems: 'center',
              bgcolor: 'warning.light',
              color: 'warning.contrastText'
            }}
          >
            <Warning sx={{ mr: 1 }} />
            <Typography variant="body2">
              Some avatar features may be limited due to API configuration. 
              {!configStatus.openai && ' OpenAI API not configured.'}
              {!configStatus.heygen && ' Heygen API not configured.'}
              {!configStatus.elevenlabs && ' ElevenLabs API not configured.'}
            </Typography>
          </Paper>
        )}
      </Box>

      <Typography variant="h5" component="h2" gutterBottom>
        Select an Avatar
      </Typography>
      
      <Grid container spacing={3}>
        {avatars.length > 0 ? (
          avatars.map((avatar) => (
            <Grid item key={avatar.id} xs={12} sm={6} md={4} lg={3}>
              <StyledCard 
                onClick={() => handleAvatarSelect(avatar)}
                sx={{
                  border: selectedAvatar?.id === avatar.id ? '2px solid #1976d2' : 'none',
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  {avatar.status && (
                    <StatusBadge status={avatar.status}>
                      {avatar.status.charAt(0).toUpperCase() + avatar.status.slice(1)}
                    </StatusBadge>
                  )}
                  <StyledCardMedia
                    image={avatar.thumbnail}
                    title={avatar.name}
                  >
                    <AvatarOverlay>
                      <Button 
                        variant="contained" 
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAvatarSelect(avatar);
                        }}
                      >
                        Select
                      </Button>
                    </AvatarOverlay>
                  </StyledCardMedia>
                </Box>
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {avatar.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    AI-powered financial advisor avatar
                  </Typography>
                </CardContent>
              </StyledCard>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <SmartToy sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6">
                No avatars available
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {error || 'Check your connection or try again later'}
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      {selectedAvatar && (
        <VideoSection elevation={3}>
          <Typography variant="h5" component="h2" gutterBottom>
            Chat with {selectedAvatar.name}
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" gutterBottom>
                Select a Voice
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {voices.map((voice) => (
                  <Button 
                    key={voice.id}
                    variant={selectedVoice === voice.id ? "contained" : "outlined"}
                    color="primary"
                    size="small"
                    onClick={() => handleVoiceSelect(voice.id)}
                    sx={{ mb: 1, mr: 1 }}
                  >
                    {voice.name} ({voice.gender}, {voice.accent})
                  </Button>
                ))}
              </Box>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Ask a Question
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  placeholder="Ask about crypto prices, investment strategies, market trends..."
                  value={userPrompt}
                  onChange={handlePromptChange}
                  disabled={generatingResponse}
                />
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={handleSubmit}
                  disabled={!selectedVoice || !userPrompt.trim() || generatingResponse}
                >
                  {generatingResponse ? 'Generating Response...' : 'Get AI Response'}
                </Button>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={8}>
              {generatingResponse ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CircularProgress />
                  <Typography variant="body1" sx={{ mt: 2 }}>
                    Generating AI response...
                  </Typography>
                </Box>
              ) : aiResponse ? (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    AI Response:
                  </Typography>
                  <Paper 
                    elevation={1} 
                    sx={{ 
                      p: 2, 
                      mb: 3,
                      bgcolor: 'background.paper',
                      borderLeft: '4px solid #1976d2'
                    }}
                  >
                    <Typography variant="body1">
                      {aiResponse}
                    </Typography>
                  </Paper>
                  
                  {videoUrl ? (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Video Response:
                      </Typography>
                      <video 
                        controls 
                        width="100%" 
                        src={videoUrl}
                        style={{ borderRadius: '8px' }}
                        poster={selectedAvatar.thumbnail}
                      >
                        Your browser does not support the video tag.
                      </video>
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                      <CircularProgress size={24} sx={{ mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Generating video... This may take a minute.
                      </Typography>
                    </Box>
                  )}
                </Box>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  height: '100%', 
                  minHeight: '200px',
                  p: 3,
                  textAlign: 'center',
                  bgcolor: 'background.paper',
                  borderRadius: '8px'
                }}>
                  <Info sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6">
                    Ask a question to get started
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Select a voice and type your question to get an AI-powered response from {selectedAvatar.name}
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </VideoSection>
      )}
    </Container>
  );
}