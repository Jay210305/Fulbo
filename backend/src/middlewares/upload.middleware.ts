import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';

/**
 * Multer configuration for image uploads
 * - Uses memory storage (buffer) for direct Cloudinary upload
 * - Filters for image types only (jpeg, png, webp)
 * - Limits file size to 5MB
 */

// Allowed MIME types for image uploads
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Maximum file size in bytes (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// File filter function
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  callback: FileFilterCallback
) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new Error('Solo se permiten imágenes (JPEG, PNG, WebP)'));
  }
};

// Multer configuration with memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

export default upload;
