import { prisma } from '../config/prisma';

interface CreateReviewDto {
  userId: string;
  fieldId: string;
  rating: number;
  comment?: string;
  tags?: string[];
}

interface ReviewWithAggregations {
  reviews: any[];
  averageRating: number;
  totalCount: number;
  popularTags: string[];
}

export class ReviewService {
  /**
   * Create or update a review for a field
   * Validates that the user has at least one completed booking at this field
   */
  static async createReview(data: CreateReviewDto) {
    const { userId, fieldId, rating, comment, tags = [] } = data;

    // 1. VALIDATION: Check if user has a completed/confirmed booking at this field
    const hasBooking = await prisma.bookings.findFirst({
      where: {
        player_id: userId,
        field_id: fieldId,
        status: 'confirmed',
        end_time: { lt: new Date() }, // Booking must be in the past
      },
    });

    if (!hasBooking) {
      throw new Error('NO_BOOKING_HISTORY');
    }

    // 2. Check if user already has a review for this field (upsert logic)
    const existingReview = await prisma.reviews.findUnique({
      where: {
        field_id_player_id: {
          field_id: fieldId,
          player_id: userId,
        },
      },
    });

    if (existingReview) {
      // Update existing review
      const updatedReview = await prisma.reviews.update({
        where: {
          review_id: existingReview.review_id,
        },
        data: {
          rating,
          comment: comment || null,
          tags,
          updated_at: new Date(),
        },
        include: {
          users: {
            select: {
              first_name: true,
              last_name: true,
            },
          },
        },
      });

      return {
        ...updatedReview,
        isUpdate: true,
      };
    }

    // 3. Create new review
    const newReview = await prisma.reviews.create({
      data: {
        field_id: fieldId,
        player_id: userId,
        rating,
        comment: comment || null,
        tags,
      },
      include: {
        users: {
          select: {
            first_name: true,
            last_name: true,
          },
        },
      },
    });

    return {
      ...newReview,
      isUpdate: false,
    };
  }

  /**
   * Get all reviews for a field with aggregations
   */
  static async getFieldReviews(fieldId: string): Promise<ReviewWithAggregations> {
    // 1. Fetch reviews ordered by newest first
    const reviews = await prisma.reviews.findMany({
      where: { field_id: fieldId },
      include: {
        users: {
          select: {
            first_name: true,
            last_name: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    // 2. Calculate average rating
    const totalCount = reviews.length;
    const averageRating = totalCount > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalCount
      : 0;

    // 3. Calculate popular tags (top 3)
    const tagCounts: Record<string, number> = {};
    reviews.forEach((review) => {
      (review.tags || []).forEach((tag: string) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const popularTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([tag]) => tag);

    return {
      reviews,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalCount,
      popularTags,
    };
  }

  /**
   * Get field rating statistics (for use in field service)
   */
  static async getFieldRatingStats(fieldId: string) {
    const result = await prisma.reviews.aggregate({
      where: { field_id: fieldId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    // Get popular tags
    const reviews = await prisma.reviews.findMany({
      where: { field_id: fieldId },
      select: { tags: true },
    });

    const tagCounts: Record<string, number> = {};
    reviews.forEach((review) => {
      (review.tags || []).forEach((tag: string) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const popularTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([tag]) => tag);

    return {
      averageRating: result._avg.rating ? Math.round(result._avg.rating * 10) / 10 : 0,
      reviewCount: result._count.rating,
      popularTags,
    };
  }

  /**
   * Check if a user can review a field (has completed booking)
   */
  static async canUserReview(userId: string, fieldId: string): Promise<boolean> {
    const hasBooking = await prisma.bookings.findFirst({
      where: {
        player_id: userId,
        field_id: fieldId,
        status: 'confirmed',
        end_time: { lt: new Date() },
      },
    });

    return !!hasBooking;
  }

  /**
   * Get user's existing review for a field (if any)
   */
  static async getUserReview(userId: string, fieldId: string) {
    return prisma.reviews.findUnique({
      where: {
        field_id_player_id: {
          field_id: fieldId,
          player_id: userId,
        },
      },
    });
  }
}
