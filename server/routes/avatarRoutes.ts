import { Router } from 'express';
import { avatarService } from '../services/avatars/avatarService';

const router = Router();

/**
 * Endpoint para obtener todos los avatares disponibles
 * GET /api/avatars
 */
router.get('/', async (req, res) => {
  try {
    const avatars = await avatarService.getAvailableAvatars();
    res.json({ success: true, data: avatars });
  } catch (error) {
    console.error('Error fetching avatars:', error);
    res.status(500).json({ success: false, message: 'Error fetching avatars' });
  }
});

/**
 * Endpoint para verificar el estado de configuración de las APIs
 * GET /api/avatars/config-status
 */
router.get('/config-status', (req, res) => {
  try {
    const configStatus = avatarService.checkApisConfiguration();
    res.json({ success: true, data: configStatus });
  } catch (error) {
    console.error('Error checking API configuration:', error);
    res.status(500).json({ success: false, message: 'Error checking API configuration' });
  }
});

/**
 * Endpoint para generar una respuesta de avatar (texto + audio + video)
 * POST /api/avatars/generate-response
 * Body: { prompt: string, avatarId: string, voiceId: string }
 */
router.post('/generate-response', async (req, res) => {
  try {
    const { prompt, avatarId, voiceId } = req.body;
    
    if (!prompt || !avatarId || !voiceId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required parameters: prompt, avatarId, or voiceId' 
      });
    }
    
    const videoUrl = await avatarService.generateAvatarResponse(prompt, avatarId, voiceId);
    res.json({ success: true, data: { videoUrl } });
  } catch (error) {
    console.error('Error generating avatar response:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error generating avatar response',
      error: error.message
    });
  }
});

/**
 * Endpoint para obtener solo la respuesta de texto de la IA
 * POST /api/avatars/text-response
 * Body: { prompt: string }
 */
router.post('/text-response', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required parameter: prompt' 
      });
    }
    
    const response = await avatarService.getChatGptResponse(prompt);
    res.json({ success: true, data: { response } });
  } catch (error) {
    console.error('Error getting AI text response:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error getting AI text response',
      error: error.message
    });
  }
});

export default router;