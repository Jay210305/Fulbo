import { useState } from "react";
import { ArrowLeft, MapPin, Star, Droplets, Shirt, Car, Lightbulb, Wine, Plus, Minus, ChevronDown, Clock } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { mockFields } from "../../types/field";
import { useCart } from "../../contexts/CartContext";
import { useUser } from "../../contexts/UserContext";
import { PhoneVerificationModal } from "./PhoneVerificationModal";

interface FieldDetailScreenProps {
  fieldId: string;
  onBack: () => void;
  onContinueToCheckout: () => void;
}

export function FieldDetailScreen({ fieldId, onBack, onContinueToCheckout }: FieldDetailScreenProps) {
  const field = mockFields.find(f => f.id === fieldId) || mockFields[0];
  const { requiresPhoneVerification, updateUser } = useUser();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const { cart, addToCart, updateQuantity, setReservationDetails, setDuration } = useCart();

  const durationOptions = [
    { value: 1, label: '1 Hora' },
    { value: 1.5, label: '1.5 Horas' },
    { value: 2, label: '2 Horas' },
    { value: 3, label: '3 Horas' }
  ];

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const getProductQuantity = (productId: string) => {
    return cart.items.find(item => item.product.id === productId)?.quantity || 0;
  };

  const handleContinue = () => {
    if (selectedTime) {
      // Verificar si el usuario tiene teléfono
      if (requiresPhoneVerification()) {
        setShowPhoneModal(true);
        return;
      }
      setReservationDetails(field, selectedTime, 'Hoy');
      onContinueToCheckout();
    }
  };

  const handlePhoneVerified = (phone: string) => {
    updateUser({ phone, phoneVerified: true });
    setShowPhoneModal(false);
    // Continuar con la reserva después de verificar
    if (selectedTime) {
      setReservationDetails(field, selectedTime, 'Hoy');
      onContinueToCheckout();
    }
  };

  const promoProducts = field.products.filter(p => p.category === 'promocion');
  const otherProducts = field.products.filter(p => p.category !== 'promocion');

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
        <Badge className="absolute top-4 right-4 bg-[#34d399] hover:bg-[#34d399]/90 text-white border-none">
          Libre {field.available}/{field.total}
        </Badge>
        {field.hasFullVaso && (
          <Badge className="absolute bottom-4 left-4 bg-purple-600 hover:bg-purple-600/90 text-white border-none px-3 py-2">
            <Wine size={16} className="mr-2" />
            Full Vaso Disponible
          </Badge>
        )}
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
              <span className="text-sm">{field.rating}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Precio</p>
            <p className="text-xl text-[#047857]">S/ {field.price.toFixed(2)}/hora</p>
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
            <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
              <div className="w-10 h-10 rounded-full bg-[#047857] flex items-center justify-center">
                <Droplets size={20} className="text-white" />
              </div>
              <span>Duchas</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
              <div className="w-10 h-10 rounded-full bg-[#047857] flex items-center justify-center">
                <Shirt size={20} className="text-white" />
              </div>
              <span>Vestuarios</span>
            </div>
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
            {['14:00', '15:00', '16:00', '17:00', '18:00', '19:00'].map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`py-3 px-4 border-2 rounded-lg transition-colors ${
                  selectedTime === time
                    ? 'border-[#047857] bg-[#047857] text-white'
                    : 'border-[#047857] text-[#047857] hover:bg-secondary'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        {/* Duration Selector */}
        {selectedTime && (
          <div className="border-2 border-[#047857] rounded-xl p-4 bg-secondary">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={20} className="text-[#047857]" />
              <h3>Duración del partido</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {durationOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setDuration(option.value)}
                  className={`py-3 px-4 border-2 rounded-lg transition-colors ${
                    cart.duration === option.value
                      ? 'border-[#047857] bg-[#047857] text-white'
                      : 'border-border bg-white text-foreground hover:border-[#047857]'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            
            {/* Dynamic Price Display */}
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Precio total:</span>
                <div className="text-right">
                  <p className="text-2xl text-[#047857]">
                    S/ {(field.price * cart.duration).toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {cart.duration === 1 ? '1 hora' : `${cart.duration} horas`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTime && (
          <>
            {/* Promoción Full Vaso */}
            {promoProducts.length > 0 && (
              <div>
                <button
                  onClick={() => toggleSection('promo')}
                  className="w-full flex items-center justify-between mb-3"
                >
                  <h3>Full Vaso</h3>
                  <ChevronDown 
                    size={20} 
                    className={`transition-transform ${expandedSections['promo'] ? 'rotate-180' : ''}`}
                  />
                </button>
                {expandedSections['promo'] !== false && (
                  <div className="space-y-3">
                    {promoProducts.map(product => {
                      const quantity = getProductQuantity(product.id);
                      return (
                        <div key={product.id} className="border-2 border-purple-200 rounded-xl p-4">
                          <div className="flex gap-3">
                            <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                              <ImageWithFallback
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="mb-1">{product.name}</h4>
                              <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                              <p className="text-[#047857]">S/ {product.price.toFixed(2)}</p>
                            </div>
                            {quantity === 0 ? (
                              <button
                                onClick={() => addToCart(product)}
                                className="w-10 h-10 rounded-full bg-[#047857] text-white flex items-center justify-center hover:bg-[#047857]/90 flex-shrink-0"
                              >
                                <Plus size={20} />
                              </button>
                            ) : (
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                  onClick={() => updateQuantity(product.id, quantity - 1)}
                                  className="w-8 h-8 rounded-full border-2 border-[#047857] text-[#047857] flex items-center justify-center"
                                >
                                  <Minus size={16} />
                                </button>
                                <span className="w-8 text-center">{quantity}</span>
                                <button
                                  onClick={() => updateQuantity(product.id, quantity + 1)}
                                  className="w-8 h-8 rounded-full bg-[#047857] text-white flex items-center justify-center"
                                >
                                  <Plus size={16} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Otros Productos - Estilo Rappi */}
            <div>
              <h3 className="mb-3">Otras personas lo combinaron con</h3>
              <div className="space-y-3">
                {otherProducts.map(product => {
                  const quantity = getProductQuantity(product.id);
                  return (
                    <div 
                      key={product.id} 
                      className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <ImageWithFallback
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="mb-0.5">{product.name}</p>
                        <p className="text-sm">S/ {product.price.toFixed(2)}</p>
                      </div>
                      {quantity === 0 ? (
                        <button
                          onClick={() => addToCart(product)}
                          className="w-9 h-9 rounded-full bg-[#047857] text-white flex items-center justify-center hover:bg-[#047857]/90 flex-shrink-0"
                        >
                          <Plus size={18} />
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                            className="w-8 h-8 rounded-full border-2 border-[#047857] text-[#047857] flex items-center justify-center"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-6 text-center text-sm">{quantity}</span>
                          <button
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                            className="w-8 h-8 rounded-full bg-[#047857] text-white flex items-center justify-center"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
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

      {/* Phone Verification Modal */}
      <PhoneVerificationModal
        open={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
        onVerified={handlePhoneVerified}
      />
    </div>
  );
}
