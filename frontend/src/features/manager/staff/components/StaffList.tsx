import { Shield, Plus, Loader2 } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { StaffMember } from "../../../../services/manager.api";
import { StaffCard } from "./StaffCard";

interface StaffListProps {
  staff: StaffMember[];
  loading: boolean;
  onAdd: () => void;
  onEdit: (member: StaffMember) => void;
  onDelete: (member: StaffMember) => void;
}

export function StaffList({ staff, loading, onAdd, onEdit, onDelete }: StaffListProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3>Equipo de Trabajo</h3>
        <Badge variant="outline">{staff.length} miembros</Badge>
      </div>

      {loading ? (
        <LoadingState />
      ) : staff.length === 0 ? (
        <EmptyState onAdd={onAdd} />
      ) : (
        <div className="space-y-3">
          {staff.map((member) => (
            <StaffCard
              key={member.id}
              member={member}
              onEdit={() => onEdit(member)}
              onDelete={() => onDelete(member)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-[#047857]" />
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
      <Shield size={48} className="mx-auto mb-3 text-muted-foreground" />
      <p className="text-muted-foreground mb-4">
        Aún no has agregado empleados a tu equipo
      </p>
      <Button
        onClick={onAdd}
        className="bg-[#047857] hover:bg-[#047857]/90"
      >
        <Plus size={18} className="mr-2" />
        Agregar Primer Empleado
      </Button>
    </div>
  );
}
