import { useState } from "react";
import { X, Check } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

interface FieldTypeFilterProps {
  onClose: () => void;
  onApply: (filters: FilterState) => void;
}

interface FilterState {
  size: string[];
  surface: string[];
}

export function FieldTypeFilter({ onClose, onApply }: FieldTypeFilterProps) {
  const [filters, setFilters] = useState<FilterState>({
    size: [],
    surface: []
  });

  const sizeOptions = [
    { id: '5v5', label: 'Fútbol 5v5' },
    { id: '7v7', label: 'Fútbol 7v7' },
    { id: '11v11', label: 'Fútbol 11v11' }
  ];

  const surfaceOptions = [
    { id: 'synthetic', label: 'Cancha Sintética' },
    { id: 'concrete', label: 'Cancha de Loza/Cemento' }
  ];

  const toggleFilter = (type: 'size' | 'surface', value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter(v => v !== value)
        : [...prev[type], value]
    }));
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleClear = () => {
    setFilters({ size: [], surface: [] });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="bg-white w-full rounded-t-3xl max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
        <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center justify-between">
          <h2>Filtros de Cancha</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Tamaño */}
          <div>
            <h3 className="mb-3">Tamaño</h3>
            <div className="grid grid-cols-1 gap-2">
              {sizeOptions.map((option) => {
                const isSelected = filters.size.includes(option.id);
                return (
                  <button
                    key={option.id}
                    onClick={() => toggleFilter('size', option.id)}
                    className={`p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-[#047857] bg-secondary'
                        : 'border-border hover:border-[#047857]/50'
                    }`}
                  >
                    <span className={isSelected ? 'text-[#047857]' : ''}>
                      {option.label}
                    </span>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-[#047857] flex items-center justify-center">
                        <Check size={16} className="text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Superficie */}
          <div>
            <h3 className="mb-3">Superficie</h3>
            <div className="grid grid-cols-1 gap-2">
              {surfaceOptions.map((option) => {
                const isSelected = filters.surface.includes(option.id);
                return (
                  <button
                    key={option.id}
                    onClick={() => toggleFilter('surface', option.id)}
                    className={`p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-[#047857] bg-secondary'
                        : 'border-border hover:border-[#047857]/50'
                    }`}
                  >
                    <span className={isSelected ? 'text-[#047857]' : ''}>
                      {option.label}
                    </span>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-[#047857] flex items-center justify-center">
                        <Check size={16} className="text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="sticky bottom-0 bg-white border-t border-border p-4 flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleClear}
          >
            Limpiar
          </Button>
          <Button
            className="flex-1 bg-[#047857] hover:bg-[#047857]/90"
            onClick={handleApply}
          >
            Aplicar Filtros
          </Button>
        </div>
      </div>
    </div>
  );
}
