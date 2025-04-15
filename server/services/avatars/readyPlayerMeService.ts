import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * Servicio para interactuar con Ready Player Me y gestionar avatares 3D
 */
export class ReadyPlayerMeService {
  private readonly AVATARS_DIRECTORY = path.join(process.cwd(), 'client', 'public', 'avatars');
  private readonly AVATARS_DB_PATH = path.join(process.cwd(), 'server', 'data', 'avatars.json');
  
  constructor() {
    this.ensureDirectoriesExist();
  }

  /**
   * Asegura que existan los directorios necesarios
   */
  private ensureDirectoriesExist() {
    // Crear directorio de avatares si no existe
    if (!fs.existsSync(this.AVATARS_DIRECTORY)) {
      fs.mkdirSync(this.AVATARS_DIRECTORY, { recursive: true });
    }
    
    // Crear directorio de datos si no existe
    const dataDir = path.dirname(this.AVATARS_DB_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Crear archivo JSON de avatares si no existe
    if (!fs.existsSync(this.AVATARS_DB_PATH)) {
      fs.writeFileSync(this.AVATARS_DB_PATH, JSON.stringify([], null, 2));
    }
  }

  /**
   * Obtiene todos los avatares guardados
   */
  async getAllAvatars() {
    try {
      const data = fs.readFileSync(this.AVATARS_DB_PATH, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading avatars database:', error);
      return [];
    }
  }

  /**
   * Agrega un nuevo avatar a la base de datos
   */
  async addAvatar(avatarData: {
    name: string;
    url: string;
    type: string;
    createdBy: string;
    modelUrl?: string;
    thumbnailUrl?: string;
    description?: string;
  }) {
    try {
      const avatars = await this.getAllAvatars();
      
      const newAvatar = {
        id: uuidv4(),
        name: avatarData.name,
        url: avatarData.url,
        type: avatarData.type,
        createdBy: avatarData.createdBy,
        modelUrl: avatarData.modelUrl || '',
        thumbnailUrl: avatarData.thumbnailUrl || '',
        description: avatarData.description || '',
        createdAt: new Date().toISOString(),
        status: 'active'
      };
      
      avatars.push(newAvatar);
      
      fs.writeFileSync(this.AVATARS_DB_PATH, JSON.stringify(avatars, null, 2));
      
      return newAvatar;
    } catch (error) {
      console.error('Error adding avatar:', error);
      throw new Error('Failed to add avatar');
    }
  }

  /**
   * Actualiza un avatar existente
   */
  async updateAvatar(avatarId: string, updateData: any) {
    try {
      const avatars = await this.getAllAvatars();
      const avatarIndex = avatars.findIndex((a: any) => a.id === avatarId);
      
      if (avatarIndex === -1) {
        throw new Error('Avatar not found');
      }
      
      // Actualizar los campos proporcionados
      avatars[avatarIndex] = {
        ...avatars[avatarIndex],
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      
      fs.writeFileSync(this.AVATARS_DB_PATH, JSON.stringify(avatars, null, 2));
      
      return avatars[avatarIndex];
    } catch (error) {
      console.error('Error updating avatar:', error);
      throw new Error('Failed to update avatar');
    }
  }

  /**
   * Elimina un avatar
   */
  async deleteAvatar(avatarId: string) {
    try {
      const avatars = await this.getAllAvatars();
      const filteredAvatars = avatars.filter((a: any) => a.id !== avatarId);
      
      if (filteredAvatars.length === avatars.length) {
        throw new Error('Avatar not found');
      }
      
      fs.writeFileSync(this.AVATARS_DB_PATH, JSON.stringify(filteredAvatars, null, 2));
      
      return { success: true, message: 'Avatar deleted successfully' };
    } catch (error) {
      console.error('Error deleting avatar:', error);
      throw new Error('Failed to delete avatar');
    }
  }

  /**
   * Guarda una imagen de avatar desde una URL
   */
  async saveAvatarImage(imageUrl: string, fileName: string): Promise<string> {
    try {
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const imagePath = path.join(this.AVATARS_DIRECTORY, fileName);
      
      fs.writeFileSync(imagePath, Buffer.from(response.data));
      
      // Devolver la ruta relativa para acceso desde el frontend
      return `/avatars/${fileName}`;
    } catch (error) {
      console.error('Error saving avatar image:', error);
      throw new Error('Failed to save avatar image');
    }
  }

  /**
   * Guarda un archivo de modelo 3D desde una URL
   */
  async saveModelFile(modelUrl: string, fileName: string): Promise<string> {
    try {
      const response = await axios.get(modelUrl, { responseType: 'arraybuffer' });
      const modelPath = path.join(this.AVATARS_DIRECTORY, 'models', fileName);
      
      // Crear directorio de modelos si no existe
      const modelsDir = path.dirname(modelPath);
      if (!fs.existsSync(modelsDir)) {
        fs.mkdirSync(modelsDir, { recursive: true });
      }
      
      fs.writeFileSync(modelPath, Buffer.from(response.data));
      
      // Devolver la ruta relativa para acceso desde el frontend
      return `/avatars/models/${fileName}`;
    } catch (error) {
      console.error('Error saving model file:', error);
      throw new Error('Failed to save model file');
    }
  }
}

// Exportar una instancia del servicio
export const readyPlayerMeService = new ReadyPlayerMeService();