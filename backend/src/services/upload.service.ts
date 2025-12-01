import cloudinary from '../config/cloudinary';

// Multer file type for TypeScript
interface MulterFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

/**
 * Upload Service
 * Handles file uploads to Cloudinary
 */
export class UploadService {
  /**
   * Upload a file buffer to Cloudinary
   * @param fileBuffer - The file buffer to upload
   * @param folder - The Cloudinary folder to upload to (e.g., 'fields', 'products', 'avatars')
   * @returns The secure URL of the uploaded image
   */
  static async uploadToCloudinary(fileBuffer: Buffer, folder: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `fulbo/${folder}`,
          resource_type: 'image',
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
          transformation: [
            { quality: 'auto:good' }, // Automatic quality optimization
            { fetch_format: 'auto' }, // Automatic format selection
          ],
        },
        (error: Error | undefined, result: { secure_url: string } | undefined) => {
          if (error) {
            reject(new Error(`Error al subir imagen: ${error.message}`));
          } else if (result) {
            resolve(result.secure_url);
          } else {
            reject(new Error('Error desconocido al subir imagen'));
          }
        }
      );

      // Write buffer to upload stream
      uploadStream.end(fileBuffer);
    });
  }

  /**
   * Upload multiple file buffers to Cloudinary in parallel
   * @param files - Array of file objects with buffer property
   * @param folder - The Cloudinary folder to upload to
   * @returns Array of secure URLs of the uploaded images
   */
  static async uploadMultipleToCloudinary(
    files: MulterFile[],
    folder: string
  ): Promise<string[]> {
    const uploadPromises = files.map((file) =>
      this.uploadToCloudinary(file.buffer, folder)
    );
    return Promise.all(uploadPromises);
  }

  /**
   * Delete an image from Cloudinary by URL
   * @param imageUrl - The Cloudinary URL of the image to delete
   * @returns True if deletion was successful
   */
  static async deleteFromCloudinary(imageUrl: string): Promise<boolean> {
    try {
      // Extract public_id from URL
      // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{folder}/{public_id}.{format}
      const urlParts = imageUrl.split('/');
      const uploadIndex = urlParts.indexOf('upload');
      
      if (uploadIndex === -1) {
        throw new Error('URL de imagen inválida');
      }

      // Get everything after 'upload/v{version}/' and remove file extension
      const publicIdWithExtension = urlParts.slice(uploadIndex + 2).join('/');
      const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, '');

      await cloudinary.uploader.destroy(publicId);
      return true;
    } catch (error) {
      console.error('Error al eliminar imagen de Cloudinary:', error);
      return false;
    }
  }
}
