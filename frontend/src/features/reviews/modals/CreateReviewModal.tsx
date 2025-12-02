import { useState, useEffect } from 'react';
import { X, Star, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Textarea } from '../../../components/ui/textarea';
import { 
  createReview, 
  canReviewField, 
  REVIEW_TAGS,
  type CreateReviewData,
  type Review 
} from '../../../services/review.api';

interface CreateReviewModalProps {
  fieldId: string;
  fieldName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateReviewModal({
  fieldId,
  fieldName,
  isOpen,
  onClose,
  onSuccess,
}: CreateReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(true);
  const [canReview, setCanReview] = useState(false);
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check eligibility when modal opens
  useEffect(() => {
    if (isOpen) {
      checkEligibility();
    }
  }, [isOpen, fieldId]);

  const checkEligibility = async () => {
    setIsCheckingEligibility(true);
    setError(null);
    try {
      const response = await canReviewField(fieldId);
      setCanReview(response.canReview);
      if (response.existingReview) {
        setExistingReview(response.existingReview);
        // Pre-fill form with existing review
        setRating(response.existingReview.rating);
        setSelectedTags(response.existingReview.tags || []);
        setComment(response.existingReview.comment || '');
      }
    } catch (err) {
      console.error('Error checking eligibility:', err);
      setError('Error al verificar elegibilidad');
    } finally {
      setIsCheckingEligibility(false);
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else if (selectedTags.length < 5) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Por favor selecciona una calificación');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data: CreateReviewData = {
        rating,
        comment: comment.trim() || undefined,
        tags: selectedTags,
      };

      await createReview(fieldId, data);
      onSuccess();
      onClose();
      // Reset form
      setRating(0);
      setSelectedTags([]);
      setComment('');
    } catch (err: any) {
      console.error('Error submitting review:', err);
      setError(err.message || 'Error al enviar la reseña');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {existingReview ? 'Editar Reseña' : 'Calificar Cancha'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {isCheckingEligibility ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#047857]" />
            </div>
          ) : !canReview ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <Star className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">No puedes calificar esta cancha</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Debes haber jugado en esta cancha para poder dejar una reseña.
                </p>
              </div>
              <Button onClick={onClose} variant="outline">
                Entendido
              </Button>
            </div>
          ) : (
            <>
              {/* Field Name */}
              <div className="text-center">
                <p className="text-sm text-gray-500">Estás calificando</p>
                <p className="font-medium text-lg">{fieldName}</p>
              </div>

              {/* Star Rating */}
              <div className="flex flex-col items-center space-y-2">
                <p className="text-sm text-gray-500">¿Cómo calificarías esta cancha?</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        size={36}
                        className={`transition-colors ${
                          star <= (hoveredRating || rating)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-sm font-medium text-gray-700">
                    {rating === 1 && 'Muy mala'}
                    {rating === 2 && 'Mala'}
                    {rating === 3 && 'Regular'}
                    {rating === 4 && 'Buena'}
                    {rating === 5 && 'Excelente'}
                  </p>
                )}
              </div>

              {/* Tags Section (InDrive-style) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-700">
                    ¿Qué te gustó? (opcional)
                  </p>
                  <span className="text-xs text-gray-400">
                    {selectedTags.length}/5 seleccionados
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {REVIEW_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        disabled={!isSelected && selectedTags.length >= 5}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                          isSelected
                            ? 'bg-[#047857] text-white'
                            : 'bg-white border border-gray-300 text-gray-700 hover:border-[#047857] hover:text-[#047857]'
                        } ${
                          !isSelected && selectedTags.length >= 5
                            ? 'opacity-50 cursor-not-allowed'
                            : ''
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Comment */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Comentario (opcional)
                </label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Cuéntanos más sobre tu experiencia..."
                  maxLength={500}
                  rows={3}
                  className="resize-none"
                />
                <p className="text-xs text-gray-400 text-right">
                  {comment.length}/500 caracteres
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={isLoading || rating === 0}
                className="w-full bg-[#047857] hover:bg-[#065f46] text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : existingReview ? (
                  'Actualizar Reseña'
                ) : (
                  'Enviar Reseña'
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
