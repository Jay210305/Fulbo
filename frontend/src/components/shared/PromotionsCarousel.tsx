import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";

const promotions = [
  {
    id: 1,
    title: "2x1 en Canchas",
    description: "Reserva 2 horas y paga 1",
    image: "https://images.unsplash.com/photo-1645447662764-b621f2c04129?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBwcm9tb3Rpb24lMjBiYW5uZXJ8ZW58MXx8fHwxNzYwMDA1OTk3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    bgColor: "from-green-600 to-green-800"
  },
  {
    id: 2,
    title: "Descuento Especial",
    description: "20% OFF en reservas de fin de semana",
    image: "https://images.unsplash.com/photo-1758795679604-5f9ffcadc030?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGVjaWFsJTIwb2ZmZXIlMjBkaXNjb3VudHxlbnwxfHx8fDE3NTk5NDcwMjV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    bgColor: "from-blue-600 to-blue-800"
  },
  {
    id: 3,
    title: "Happy Hour",
    description: "Tarifa especial de 2pm a 4pm",
    image: "https://images.unsplash.com/photo-1641029185333-7ed62a19d5f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NjZXIlMjBmaWVsZCUyMGFlcmlhbHxlbnwxfHx8fDE3NTk5ODI2MDR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    bgColor: "from-orange-600 to-orange-800"
  }
];

export function PromotionsCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % promotions.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % promotions.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + promotions.length) % promotions.length);
  };

  return (
    <div className="relative w-full h-40 rounded-2xl overflow-hidden">
      <div
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {promotions.map((promo) => (
          <div
            key={promo.id}
            className="min-w-full h-full relative"
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${promo.bgColor} opacity-90`} />
            <ImageWithFallback
              src={promo.image}
              alt={promo.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-6">
              <h3 className="text-xl mb-2">{promo.title}</h3>
              <p className="text-sm opacity-90">{promo.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/30 hover:bg-white/50 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
      >
        <ChevronLeft size={20} className="text-white" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/30 hover:bg-white/50 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
      >
        <ChevronRight size={20} className="text-white" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {promotions.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentSlide
                ? 'bg-white w-6'
                : 'bg-white/50 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
