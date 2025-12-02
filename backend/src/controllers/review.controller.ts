import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { ReviewService } from '../services/review.service';
import { CreateReviewInput } from '../schemas/review.schema';

export class ReviewController {
  /**
   * Add or update a review for a field
   * POST /api/reviews/:fieldId
   */
  static async addReview(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.id;
      const { fieldId } = req.params;
      const { rating, comment, tags } = req.body as CreateReviewInput;

      const review = await ReviewService.createReview({
        userId,
        fieldId,
        rating,
        comment: comment ?? undefined,
        tags,
      });

      const statusCode = review.isUpdate ? 200 : 201;
      const message = review.isUpdate 
        ? 'Reseña actualizada exitosamente' 
        : 'Reseña creada exitosamente';

      res.status(statusCode).json({
        message,
        review,
      });
    } catch (error: any) {
      if (error.message === 'NO_BOOKING_HISTORY') {
        res.status(403).json({ 
          message: 'Debes haber jugado en esta cancha para poder calificarla' 
        });
      } else {
        console.error('Error creating review:', error);
        res.status(500).json({ message: 'Error al crear la reseña' });
      }
    }
  }

  /**
   * Get all reviews for a field
   * GET /api/reviews/:fieldId
   */
  static async getReviews(req: AuthRequest, res: Response) {
    try {
      const { fieldId } = req.params;

      const result = await ReviewService.getFieldReviews(fieldId);

      res.status(200).json(result);
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ message: 'Error al obtener las reseñas' });
    }
  }

  /**
   * Check if current user can review a field
   * GET /api/reviews/:fieldId/can-review
   */
  static async canReview(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.id;
      const { fieldId } = req.params;

      const canReview = await ReviewService.canUserReview(userId, fieldId);
      const existingReview = await ReviewService.getUserReview(userId, fieldId);

      res.status(200).json({
        canReview,
        hasExistingReview: !!existingReview,
        existingReview,
      });
    } catch (error: any) {
      console.error('Error checking review eligibility:', error);
      res.status(500).json({ message: 'Error al verificar elegibilidad' });
    }
  }
}
