import { Router } from 'express';
import { getAgentConfig, updateAgentConfig, UIConfig } from '../services/config/firestoreConfig';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'static', 'uploads');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed') as any);
    }
  }
});

// Middleware to check if user is authenticated as admin
const isAdmin = (req: any, res: any, next: any) => {
  // Check if user is authenticated
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Check if user has admin role
  if (req.session.user.role !== 'admin' && req.session.user.role !== 'superadmin') {
    return res.status(403).json({ error: 'Forbidden - Admin access required' });
  }
  
  next();
};

// Get configuration for a specific agent
router.get('/:agentName', async (req, res) => {
  try {
    const { agentName } = req.params;
    
    if (!agentName || !['cryptobot', 'jetai', 'fitnessai', 'sportsai'].includes(agentName)) {
      return res.status(400).json({ error: 'Invalid agent name' });
    }
    
    const config = await getAgentConfig(agentName as any);
    res.json(config);
  } catch (error) {
    console.error('Error fetching agent config:', error);
    res.status(500).json({ error: 'Failed to fetch configuration' });
  }
});

// Update configuration for a specific agent (admin only)
router.put('/:agentName', isAdmin, async (req, res) => {
  try {
    const { agentName } = req.params;
    const config = req.body;
    
    if (!agentName || !['cryptobot', 'jetai', 'fitnessai', 'sportsai'].includes(agentName)) {
      return res.status(400).json({ error: 'Invalid agent name' });
    }
    
    // Validate the config structure
    const validKeys = [
      'primary_color', 'font_family', 'layout', 'button_shape', 
      'homepage_title', 'homepage_subtitle', 'cta_text', 
      'header_menu', 'visible_sections', 'logo_url', 
      'background_image_url', 'header_image_url'
    ];
    
    // Remove any invalid keys
    const sanitizedConfig: Partial<UIConfig> = {};
    Object.keys(config).forEach(key => {
      if (validKeys.includes(key)) {
        sanitizedConfig[key as keyof UIConfig] = config[key];
      }
    });
    
    const success = await updateAgentConfig(agentName as any, sanitizedConfig);
    
    if (success) {
      res.json({ success: true, message: 'Configuration updated successfully' });
    } else {
      res.status(500).json({ error: 'Failed to update configuration' });
    }
  } catch (error) {
    console.error('Error updating agent config:', error);
    res.status(500).json({ error: 'Failed to update configuration' });
  }
});

// Upload image (logo, background, header) (admin only)
router.post('/upload/:agentName/:imageType', isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { agentName, imageType } = req.params;
    
    if (!agentName || !['cryptobot', 'jetai', 'fitnessai', 'sportsai'].includes(agentName)) {
      return res.status(400).json({ error: 'Invalid agent name' });
    }
    
    if (!imageType || !['logo', 'background', 'header'].includes(imageType)) {
      return res.status(400).json({ error: 'Invalid image type' });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Create URL path for the image
    const imagePath = `/uploads/${req.file.filename}`;
    
    // Update the agent config with the new image URL
    const updateKey = `${imageType}_url` as keyof UIConfig;
    const updateData = { [updateKey]: imagePath } as Partial<UIConfig>;
    
    const success = await updateAgentConfig(agentName as any, updateData);
    
    if (success) {
      res.json({ 
        success: true, 
        message: 'Image uploaded successfully',
        url: imagePath
      });
    } else {
      res.status(500).json({ error: 'Failed to update configuration with new image' });
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

export default router;