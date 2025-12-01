import { Lightbulb, Car, Shirt, Wifi, LucideIcon } from "lucide-react";
import { AmenityConfig } from "../types";

// Amenity configuration
export const AMENITY_ICONS: Record<string, LucideIcon> = {
  floodlights: Lightbulb,
  parking: Car,
  changing: Shirt,
  wifi: Wifi
};

export const AMENITY_NAMES: Record<string, string> = {
  floodlights: 'Iluminación',
  parking: 'Estacionamiento',
  changing: 'Vestuarios',
  wifi: 'WiFi'
};

export const AMENITY_LIST: AmenityConfig[] = [
  { id: 'floodlights', name: 'Iluminación', icon: Lightbulb },
  { id: 'changing', name: 'Vestuarios', icon: Shirt },
  { id: 'parking', name: 'Estacionamiento', icon: Car },
  { id: 'wifi', name: 'WiFi', icon: Wifi }
];

interface AmenitiesListProps {
  amenities: string[];
  size?: 'sm' | 'md';
}

export function AmenitiesList({ amenities, size = 'sm' }: AmenitiesListProps) {
  const iconSize = size === 'sm' ? 12 : 14;
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';
  const padding = size === 'sm' ? 'px-2 py-1' : 'px-3 py-2';

  return (
    <div className="flex flex-wrap gap-2">
      {amenities.map((amenity) => {
        const Icon = AMENITY_ICONS[amenity];
        if (!Icon) return null;
        
        return (
          <div
            key={amenity}
            className={`flex items-center gap-1 ${padding} bg-muted rounded ${textSize}`}
          >
            <Icon size={iconSize} />
            <span>{AMENITY_NAMES[amenity]}</span>
          </div>
        );
      })}
    </div>
  );
}
