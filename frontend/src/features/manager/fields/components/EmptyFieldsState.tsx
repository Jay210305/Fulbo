import { MapPin, Plus } from "lucide-react";
import { Button } from "../../../../components/ui/button";

interface EmptyFieldsStateProps {
  onAddField: () => void;
}

export function EmptyFieldsState({ onAddField }: EmptyFieldsStateProps) {
  return (
    <div className="text-center py-12 border border-dashed border-border rounded-lg">
      <MapPin size={48} className="mx-auto mb-4 text-muted-foreground" />
      <h3 className="text-lg mb-2">No tienes canchas registradas</h3>
      <p className="text-muted-foreground text-sm mb-4">
        Agrega tu primera cancha para comenzar a recibir reservas
      </p>
      <Button 
        className="bg-[#047857] hover:bg-[#047857]/90"
        onClick={onAddField}
      >
        <Plus size={16} className="mr-2" />
        Agregar Cancha
      </Button>
    </div>
  );
}
