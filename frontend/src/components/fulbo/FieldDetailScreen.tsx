import { useState, useEffect } from "react";
import {
  ArrowLeft,
  MapPin,
  Star,
  Car,
  Lightbulb,
  Clock,
  Loader2,
  MessageSquarePlus,
} from "lucide-react";
import { Button } from "../ui/button";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { useCart } from "../../contexts/CartContext";
import { useUser } from "../../contexts/UserContext";
import { PhoneVerificationModal } from "./PhoneVerificationModal";
import { Field } from "../../types/field";
import { ReviewsList } from "../../features/reviews/components/ReviewsList";
import { CreateReviewModal } from "../../features/reviews/modals/CreateReviewModal";

interface FieldDetailScreenProps {
  fieldId: string; // Este será el UUID
  onBack: () => void;
  onContinueToCheckout: () => void;
}

export function FieldDetailScreen({
  fieldId,
  onBack,
  onContinueToCheckout,
}: FieldDetailScreenProps) {
  const { requiresPhoneVerification, updateUser } = useUser();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewsKey, setReviewsKey] = useState(0); // To force refresh reviews
  const {
    cart,
    setReservationDetails,
    setDuration,
  } = useCart();

  // ESTADOS PARA DATOS REALES
  const [field, setField] = useState<Field | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar detalle de la cancha
  useEffect(() => {
    if (!fieldId) return;

    fetch(`http://localhost:4000/api/fields/${fieldId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Error cargando detalle");
        return res.json();
      })
      .then((data) => {
        // Mapeo de datos
        setField({
          id: data.field_id,
          name: data.name,
          location: data.address,
          price: Number(data.base_price_per_hour),
          image:
            data.field_photos?.[0]?.image_url ||
            "https://via.placeholder.com/400",
          // Dynamic rating from reviews
          type: "7v7",
          rating: data.rating || 0,
          reviewCount: data.reviewCount || 0,
          popularTags: data.popularTags || [],
          available: 5,
          total: 10,
          hasFullVaso: false,
          amenities: ["Duchas", "Estacionamiento"],
          products: [],
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [fieldId]);

  const handleReviewSuccess = () => {
    // Refresh reviews list
    setReviewsKey((prev) => prev + 1);
    // Refetch field to update rating
    fetch(`http://localhost:4000/api/fields/${fieldId}`)
      .then((res) => res.json())
      .then((data) => {
        if (field) {
          setField({
            ...field,
            rating: data.rating || 0,
            reviewCount: data.reviewCount || 0,
          });
        }
      });
  };

  const durationOptions = [
    { value: 1, label: "1 Hora" },
    { value: 1.5, label: "1.5 Horas" },
    { value: 2, label: "2 Horas" },
  ];

  const handleContinue = () => {
    if (selectedTime && field) {
      if (requiresPhoneVerification()) {
        setShowPhoneModal(true);
        return;
      }
      // Al guardar en el contexto, pasamos el objeto field que tiene el UUID correcto
      setReservationDetails(field, selectedTime, "Hoy");
      onContinueToCheckout();
    }
  };

  const handlePhoneVerified = (phone: string) => {
    updateUser({ phone, phoneVerified: true });
    setShowPhoneModal(false);
    if (selectedTime && field) {
      setReservationDetails(field, selectedTime, "Hoy");
      onContinueToCheckout();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#047857]" />
      </div>
    );
  }

  if (!field) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <p className="text-muted-foreground mb-4">Cancha no encontrada</p>
        <Button onClick={onBack}>Volver</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Header Image */}
      <div className="relative h-64">
        <ImageWithFallback
          src={field.image}
          alt={field.name}
          className="w-full h-full object-cover"
        />
        <button
          onClick={onBack}
          className="absolute top-4 left-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Field Info */}
        <div>
          <h1 className="text-2xl mb-2">{field.name}</h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin size={16} />
              <span className="text-sm">{field.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star size={16} fill="#facc15" className="text-[#facc15]" />
              <span className="text-sm font-medium">
                {field.rating > 0 ? field.rating.toFixed(1) : 'Sin calificaciones'}
              </span>
              {field.reviewCount > 0 && (
                <span className="text-sm text-gray-400">
                  ({field.reviewCount})
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Precio</p>
            <p className="text-xl text-[#047857]">
              S/ {field.price.toFixed(2)}/hora
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Tipo</p>
            <p>{field.type}</p>
          </div>
        </div>

        {/* Amenidades */}
        <div>
          <h3 className="mb-3">Amenidades</h3>
          <div className="grid grid-cols-2 gap-3">
            {/* Mostrar amenidades estáticas por ahora o mapear field.amenities */}
            <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
              <div className="w-10 h-10 rounded-full bg-[#047857] flex items-center justify-center">
                <Car size={20} className="text-white" />
              </div>
              <span>Estacionamiento</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
              <div className="w-10 h-10 rounded-full bg-[#047857] flex items-center justify-center">
                <Lightbulb size={20} className="text-white" />
              </div>
              <span>Iluminación</span>
            </div>
          </div>
        </div>

        {/* Horarios */}
        <div>
          <h3 className="mb-3">Selecciona tu horario</h3>
          <div className="grid grid-cols-3 gap-2">
            {["14:00", "15:00", "16:00", "17:00", "18:00", "19:00"].map(
              (time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`py-3 px-4 border-2 rounded-lg transition-colors ${
                    selectedTime === time
                      ? "border-[#047857] bg-[#047857] text-white"
                      : "border-[#047857] text-[#047857] hover:bg-secondary"
                  }`}
                >
                  {time}
                </button>
              )
            )}
          </div>
        </div>

        {/* Duration Selector */}
        {selectedTime && (
          <div className="border-2 border-[#047857] rounded-xl p-4 bg-secondary">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={20} className="text-[#047857]" />
              <h3>Duración del partido</h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {durationOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setDuration(option.value)}
                  className={`py-2 px-2 border-2 rounded-lg text-sm transition-colors ${
                    cart.duration === option.value
                      ? "border-[#047857] bg-[#047857] text-white"
                      : "border-border bg-white text-foreground hover:border-[#047857]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Precio total:</span>
                <div className="text-right">
                  <p className="text-2xl text-[#047857]">
                    S/ {(field.price * cart.duration).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Reseñas</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowReviewModal(true)}
              className="text-[#047857] border-[#047857] hover:bg-[#047857]/10"
            >
              <MessageSquarePlus size={16} className="mr-2" />
              Calificar
            </Button>
          </div>
          <ReviewsList 
            key={reviewsKey}
            fieldId={fieldId} 
            onWriteReview={() => setShowReviewModal(true)}
          />
        </div>
      </div>

      {/* Footer Sticky */}
      {selectedTime && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border p-4 shadow-lg">
          <Button
            onClick={handleContinue}
            className="w-full h-12 bg-[#047857] hover:bg-[#047857]/90"
          >
            Continuar con la reserva
          </Button>
        </div>
      )}

      <PhoneVerificationModal
        open={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
        onVerified={handlePhoneVerified}
      />

      {/* Review Modal */}
      <CreateReviewModal
        fieldId={fieldId}
        fieldName={field.name}
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSuccess={handleReviewSuccess}
      />
    </div>
  );
}
