import { useState, useEffect } from 'react';
import { Star, User, MessageCircle, Loader2 } from 'lucide-react';
import { getReviews, type Review, type ReviewsResponse } from '../../../services/review.api';

interface ReviewsListProps {
  fieldId: string;
  onWriteReview?: () => void;
}

export function ReviewsList({ fieldId, onWriteReview }: ReviewsListProps) {
  const [reviewsData, setReviewsData] = useState<ReviewsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [fieldId]);

  const fetchReviews = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getReviews(fieldId);
      setReviewsData(data);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Error al cargar las reseñas');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-[#047857]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-red-500">{error}</p>
        <button
          onClick={fetchReviews}
          className="mt-2 text-sm text-[#047857] hover:underline"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!reviewsData || reviewsData.reviews.length === 0) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
          <MessageCircle className="h-8 w-8 text-gray-400" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">Sin reseñas aún</h3>
          <p className="text-sm text-gray-500 mt-1">
            ¡Sé el primero en calificar esta cancha!
          </p>
        </div>
        {onWriteReview && (
          <button
            onClick={onWriteReview}
            className="text-sm font-medium text-[#047857] hover:underline"
          >
            Escribir una reseña
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            <span className="text-lg font-semibold">
              {reviewsData.averageRating.toFixed(1)}
            </span>
          </div>
          <span className="text-sm text-gray-500">
            ({reviewsData.totalCount} reseñas)
          </span>
        </div>
        {onWriteReview && (
          <button
            onClick={onWriteReview}
            className="text-sm font-medium text-[#047857] hover:underline"
          >
            Escribir reseña
          </button>
        )}
      </div>

      {/* Popular Tags */}
      {reviewsData.popularTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {reviewsData.popularTags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 bg-[#047857]/10 text-[#047857] text-xs font-medium rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviewsData.reviews.map((review) => (
          <ReviewItem key={review.review_id} review={review} />
        ))}
      </div>
    </div>
  );
}

// Individual Review Item Component
function ReviewItem({ review }: { review: Review }) {
  const userName = review.users
    ? `${review.users.first_name} ${review.users.last_name}`
    : 'Usuario anónimo';

  const formattedDate = review.created_at
    ? new Date(review.created_at).toLocaleDateString('es-PE', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '';

  return (
    <div className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
      {/* Header */}
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="h-5 w-5 text-gray-500" />
        </div>

        <div className="flex-1 min-w-0">
          {/* Name and Date */}
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-gray-900 truncate">{userName}</span>
            <span className="text-xs text-gray-400 flex-shrink-0">{formattedDate}</span>
          </div>

          {/* Stars */}
          <div className="flex items-center gap-0.5 mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={14}
                className={
                  star <= review.rating
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                }
              />
            ))}
          </div>

          {/* Tags */}
          {review.tags && review.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {review.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-[#047857] text-white text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Comment */}
          {review.comment && (
            <p className="text-sm text-gray-600 mt-2">{review.comment}</p>
          )}
        </div>
      </div>
    </div>
  );
}
