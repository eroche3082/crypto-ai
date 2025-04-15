import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { readyPlayerMeService } from '../services/avatars/readyPlayerMeService';

const router = Router();

// Configurar multer para el almacenamiento de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'client', 'public', 'avatars');
    // Crear el directorio si no existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generar un nombre de archivo único
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'avatar-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage: storage });

/**
 * Obtener todos los avatares
 * GET /api/readyplayerme/avatars
 */
router.get('/avatars', async (req, res) => {
  try {
    const avatars = await readyPlayerMeService.getAllAvatars();
    res.json({ success: true, data: avatars });
  } catch (error) {
    console.error('Error fetching avatars:', error);
    res.status(500).json({ success: false, message: 'Error fetching avatars' });
  }
});

/**
 * Agregar un nuevo avatar con URL
 * POST /api/readyplayerme/avatars
 * Body: { name, url, type, createdBy, modelUrl, thumbnailUrl, description }
 */
router.post('/avatars', async (req, res) => {
  try {
    const { name, url, type, createdBy, modelUrl, thumbnailUrl, description } = req.body;
    
    if (!name || !url || !type || !createdBy) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: name, url, type, or createdBy' 
      });
    }
    
    const newAvatar = await readyPlayerMeService.addAvatar({
      name,
      url,
      type,
      createdBy,
      modelUrl,
      thumbnailUrl,
      description
    });
    
    res.status(201).json({ success: true, data: newAvatar });
  } catch (error) {
    console.error('Error adding avatar:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error adding avatar',
      error: error.message
    });
  }
});

/**
 * Subir archivo de imagen de avatar
 * POST /api/readyplayerme/avatars/upload-image
 * Body: form-data con file
 */
router.post('/avatars/upload-image', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    // Crear URL para el archivo
    const fileName = req.file.filename;
    const fileUrl = `/avatars/${fileName}`;
    
    res.json({ 
      success: true, 
      data: { 
        fileName,
        url: fileUrl
      }
    });
  } catch (error) {
    console.error('Error uploading avatar image:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error uploading avatar image',
      error: error.message
    });
  }
});

/**
 * Actualizar un avatar existente
 * PUT /api/readyplayerme/avatars/:id
 * Body: { name?, url?, type?, etc... }
 */
router.put('/avatars/:id', async (req, res) => {
  try {
    const avatarId = req.params.id;
    const updateData = req.body;
    
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, message: 'No update data provided' });
    }
    
    const updatedAvatar = await readyPlayerMeService.updateAvatar(avatarId, updateData);
    
    res.json({ success: true, data: updatedAvatar });
  } catch (error) {
    console.error('Error updating avatar:', error);
    res.status(error.message.includes('not found') ? 404 : 500).json({ 
      success: false, 
      message: 'Error updating avatar',
      error: error.message
    });
  }
});

/**
 * Eliminar un avatar
 * DELETE /api/readyplayerme/avatars/:id
 */
router.delete('/avatars/:id', async (req, res) => {
  try {
    const avatarId = req.params.id;
    
    const result = await readyPlayerMeService.deleteAvatar(avatarId);
    
    res.json({ success: true, message: 'Avatar deleted successfully' });
  } catch (error) {
    console.error('Error deleting avatar:', error);
    res.status(error.message.includes('not found') ? 404 : 500).json({ 
      success: false, 
      message: 'Error deleting avatar',
      error: error.message
    });
  }
});

/**
 * Guardar avatar desde Ready Player Me
 * POST /api/readyplayerme/avatars/save-from-url
 * Body: { name, modelUrl, imageUrl, createdBy, description }
 */
router.post('/avatars/save-from-url', async (req, res) => {
  try {
    const { name, modelUrl, imageUrl, createdBy, description } = req.body;
    
    if (!name || !modelUrl || !imageUrl || !createdBy) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: name, modelUrl, imageUrl, or createdBy' 
      });
    }
    
    // Generar nombres de archivo únicos
    const modelFileName = `model-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(modelUrl) || '.glb'}`;
    const imageFileName = `image-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(imageUrl) || '.png'}`;
    
    // Guardar los archivos
    const savedModelUrl = await readyPlayerMeService.saveModelFile(modelUrl, modelFileName);
    const savedImageUrl = await readyPlayerMeService.saveAvatarImage(imageUrl, imageFileName);
    
    // Crear el avatar en la base de datos
    const newAvatar = await readyPlayerMeService.addAvatar({
      name,
      url: modelUrl, // URL original
      type: 'readyplayerme',
      createdBy,
      modelUrl: savedModelUrl, // Ruta local
      thumbnailUrl: savedImageUrl, // Ruta local
      description
    });
    
    res.status(201).json({ success: true, data: newAvatar });
  } catch (error) {
    console.error('Error saving avatar from URL:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error saving avatar from URL',
      error: error.message
    });
  }
});

export default router;