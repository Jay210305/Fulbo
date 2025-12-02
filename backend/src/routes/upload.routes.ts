import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller';
import { protect } from '../middlewares/auth.middleware';
import upload from '../middlewares/upload.middleware';

const router = Router();

/**
 * Upload Routes
 * All routes require authentication
 * 
 * POST /api/upload - Upload single image
 * POST /api/upload/multi - Upload multiple images (max 5)
 * DELETE /api/upload - Delete an image
 */

// Single image upload
// Usage: POST /api/upload?folder=fields (optional folder query param)
router.post(
  '/',
  protect,
  upload.single('image'),
  UploadController.uploadImage
);

// Multiple images upload (max 5)
// Usage: POST /api/upload/multi?folder=fields
router.post(
  '/multi',
  protect,
  upload.array('images', 5),
  UploadController.uploadMultipleImages
);

// Delete image
// Usage: DELETE /api/upload with body { url: "https://..." }
router.delete(
  '/',
  protect,
  UploadController.deleteImage
);

export default router;
