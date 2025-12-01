import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { UploadService } from '../services/upload.service';

/**
 * Upload Controller
 * Handles image upload endpoints
 */
export class UploadController {
  /**
   * Upload a single image
   * POST /api/upload
   */
  static async uploadImage(req: AuthRequest, res: Response) {
    try {
      // Check if file exists (added by multer middleware)
      const file = req.file as Express.Multer.File | undefined;
      
      if (!file) {
        return res.status(400).json({ message: 'No se proporcionó ninguna imagen' });
      }

      // Get folder from query param or default to 'general'
      const folder = (req.query.folder as string) || 'general';

      // Upload to Cloudinary
      const url = await UploadService.uploadToCloudinary(file.buffer, folder);

      res.status(200).json({ url });
    } catch (error) {
      console.error('Error en uploadImage:', error);
      res.status(500).json({
        message: error instanceof Error ? error.message : 'Error al subir imagen',
      });
    }
  }

  /**
   * Upload multiple images
   * POST /api/upload/multi
   */
  static async uploadMultipleImages(req: AuthRequest, res: Response) {
    try {
      // Check if files exist (added by multer middleware)
      const files = req.files as Express.Multer.File[] | undefined;
      
      if (!files || files.length === 0) {
        return res.status(400).json({ message: 'No se proporcionaron imágenes' });
      }

      // Get folder from query param or default to 'general'
      const folder = (req.query.folder as string) || 'general';

      // Upload all files to Cloudinary in parallel
      const urls = await UploadService.uploadMultipleToCloudinary(files, folder);

      res.status(200).json({ urls });
    } catch (error) {
      console.error('Error en uploadMultipleImages:', error);
      res.status(500).json({
        message: error instanceof Error ? error.message : 'Error al subir imágenes',
      });
    }
  }

  /**
   * Delete an image from Cloudinary
   * DELETE /api/upload
   */
  static async deleteImage(req: AuthRequest, res: Response) {
    try {
      const { url } = req.body;

      if (!url) {
        return res.status(400).json({ message: 'No se proporcionó URL de imagen' });
      }

      const success = await UploadService.deleteFromCloudinary(url);

      if (success) {
        res.status(200).json({ message: 'Imagen eliminada correctamente' });
      } else {
        res.status(500).json({ message: 'Error al eliminar imagen' });
      }
    } catch (error) {
      console.error('Error en deleteImage:', error);
      res.status(500).json({
        message: error instanceof Error ? error.message : 'Error al eliminar imagen',
      });
    }
  }
}
