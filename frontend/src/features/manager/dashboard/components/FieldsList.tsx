import { ChevronRight, Loader2 } from "lucide-react";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { FieldsListProps } from "../types";

export function FieldsList({ fields, loading, onViewAll, onViewSchedule }: FieldsListProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3>Mis Canchas</h3>
        <Button 
          variant="link" 
          className="text-[#047857] p-0 h-auto"
          onClick={onViewAll}
        >
          Ver Todas
          <ChevronRight size={16} className="ml-1" />
        </Button>
      </div>
      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#047857]" />
          </div>
        ) : fields.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No tienes canchas registradas</p>
            <Button 
              variant="link" 
              className="text-[#047857]"
              onClick={onViewAll}
            >
              Agregar primera cancha
            </Button>
          </div>
        ) : (
          fields.map((field) => (
            <div key={field.id} className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="mb-1">{field.name}</h4>
                  <p className="text-sm text-muted-foreground">{field.address}</p>
                </div>
                <Badge className="bg-[#34d399] hover:bg-[#34d399]/90 text-white border-none">
                  Activa
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[#047857]">S/ {field.basePricePerHour}/hora</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onViewSchedule(field)}
                >
                  Ver Horario
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
