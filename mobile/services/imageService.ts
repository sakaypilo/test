import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

export interface ImageCompressionOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  format?: 'jpeg' | 'png';
}

class ImageService {
  /**
   * Compresser et optimiser une image
   */
  async compressImage(
    uri: string, 
    options: ImageCompressionOptions = {}
  ): Promise<string> {
    const {
      quality = 0.8,
      maxWidth = 1920,
      maxHeight = 1080,
      format = 'jpeg'
    } = options;

    try {
      // Obtenir les informations de l'image
      const imageInfo = await FileSystem.getInfoAsync(uri);
      if (!imageInfo.exists) {
        throw new Error('Image non trouvée');
      }

      // Compresser l'image
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [
          {
            resize: {
              width: maxWidth,
              height: maxHeight,
            },
          },
        ],
        {
          compress: quality,
          format: format === 'jpeg' ? ImageManipulator.SaveFormat.JPEG : ImageManipulator.SaveFormat.PNG,
        }
      );

      return manipulatedImage.uri;
    } catch (error) {
      console.error('Erreur lors de la compression:', error);
      throw error;
    }
  }

  /**
   * Créer une miniature
   */
  async createThumbnail(uri: string, size: number = 300): Promise<string> {
    try {
      const thumbnail = await ImageManipulator.manipulateAsync(
        uri,
        [
          {
            resize: {
              width: size,
              height: size,
            },
          },
        ],
        {
          compress: 0.7,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      return thumbnail.uri;
    } catch (error) {
      console.error('Erreur création miniature:', error);
      throw error;
    }
  }

  /**
   * Obtenir les informations d'une image
   */
  async getImageInfo(uri: string): Promise<{
    width: number;
    height: number;
    size: number;
  }> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      
      if (!fileInfo.exists) {
        throw new Error('Fichier non trouvé');
      }

      // Pour obtenir les dimensions, on utilise ImageManipulator
      const result = await ImageManipulator.manipulateAsync(uri, [], {});
      
      return {
        width: result.width || 0,
        height: result.height || 0,
        size: fileInfo.size || 0,
      };
    } catch (error) {
      console.error('Erreur obtention info image:', error);
      throw error;
    }
  }

  /**
   * Valider une image avant traitement
   */
  async validateImage(uri: string): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];

    try {
      const info = await this.getImageInfo(uri);

      // Vérifier la taille du fichier (max 10MB)
      if (info.size > 10 * 1024 * 1024) {
        errors.push('Fichier trop volumineux (max 10MB)');
      }

      // Vérifier les dimensions (max 4000x4000)
      if (info.width > 4000 || info.height > 4000) {
        errors.push('Image trop grande (max 4000x4000 pixels)');
      }

      // Vérifier les dimensions minimales
      if (info.width < 100 || info.height < 100) {
        errors.push('Image trop petite (min 100x100 pixels)');
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    } catch (error) {
      return {
        isValid: false,
        errors: ['Impossible de lire le fichier image'],
      };
    }
  }

  /**
   * Traitement complet d'une image (validation + compression)
   */
  async processImage(
    uri: string,
    options: ImageCompressionOptions = {}
  ): Promise<{
    success: boolean;
    processedUri?: string;
    thumbnailUri?: string;
    errors?: string[];
  }> {
    try {
      // Validation
      const validation = await this.validateImage(uri);
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors,
        };
      }

      // Compression
      const processedUri = await this.compressImage(uri, options);

      // Création de miniature
      const thumbnailUri = await this.createThumbnail(processedUri);

      return {
        success: true,
        processedUri,
        thumbnailUri,
      };
    } catch (error) {
      return {
        success: false,
        errors: [`Erreur de traitement: ${error.message}`],
      };
    }
  }
}

export const imageService = new ImageService();
