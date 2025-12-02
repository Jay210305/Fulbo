import { Router, Request, Response, NextFunction } from 'express';
import { ReviewController } from '../controllers/review.controller';
import { protect, AuthRequest } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createReviewSchema, fieldIdParamSchema } from '../schemas/review.schema';

const router = Router();

/**
 * @route   POST /api/reviews/:fieldId
 * @desc    Create or update a review for a field
 * @access  Protected (requires authentication)
 */
router.post(
  '/:fieldId',
  protect,
  validate({ body: createReviewSchema, params: fieldIdParamSchema }),
  (req: Request, res: Response, next: NextFunction) => {
    ReviewController.addReview(req as AuthRequest, res).catch(next);
  }
);

/**
 * @route   GET /api/reviews/:fieldId
 * @desc    Get all reviews for a field (public)
 * @access  Public
 */
router.get(
  '/:fieldId',
  validate({ params: fieldIdParamSchema }),
  (req: Request, res: Response, next: NextFunction) => {
    ReviewController.getReviews(req as AuthRequest, res).catch(next);
  }
);

/**
 * @route   GET /api/reviews/:fieldId/can-review
 * @desc    Check if current user can review a field
 * @access  Protected
 */
router.get(
  '/:fieldId/can-review',
  protect,
  validate({ params: fieldIdParamSchema }),
  (req: Request, res: Response, next: NextFunction) => {
    ReviewController.canReview(req as AuthRequest, res).catch(next);
  }
);

export default router;
