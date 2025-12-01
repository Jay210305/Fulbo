import { Mail, Phone, Edit, X } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Avatar, AvatarFallback } from "../../../../components/ui/avatar";
import { Badge } from "../../../../components/ui/badge";
import { StaffMember } from "../../../../services/manager.api";
import { ROLE_LABELS, PERMISSION_LABELS, StaffPermissions } from "../types";

interface StaffCardProps {
  member: StaffMember;
  onEdit: () => void;
  onDelete: () => void;
}

export function StaffCard({ member, onEdit, onDelete }: StaffCardProps) {
  const activePermissions = Object.entries(member.permissions)
    .filter(([_, value]) => value)
    .map(([key]) => key as keyof StaffPermissions);

  return (
    <div className="border border-border rounded-xl p-4">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar className="w-12 h-12">
          <AvatarFallback className="bg-[#047857] text-white">
            {member.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h4 className="mb-1">{member.name}</h4>
          <p className="text-sm text-muted-foreground mb-1">
            {ROLE_LABELS[member.role]}
          </p>
          <Badge 
            variant={member.isActive ? 'default' : 'secondary'} 
            className={member.isActive ? 'bg-[#34d399] hover:bg-[#34d399]/90 text-white text-xs' : 'text-xs'}
          >
            {member.isActive ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail size={14} />
          <span>{member.email}</span>
        </div>
        {member.phone && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone size={14} />
            <span>{member.phone}</span>
          </div>
        )}
      </div>

      {/* Permissions */}
      <div className="bg-secondary rounded-lg p-3 mb-3">
        <p className="text-xs text-muted-foreground mb-2">Permisos asignados:</p>
        <div className="flex flex-wrap gap-1">
          {activePermissions.length > 0 ? (
            activePermissions.map((key) => (
              <Badge key={key} variant="outline" className="text-xs">
                {PERMISSION_LABELS[key]}
              </Badge>
            ))
          ) : (
            <span className="text-xs text-muted-foreground">Sin permisos asignados</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={onEdit}
        >
          <Edit size={14} className="mr-2" />
          Editar
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-destructive hover:bg-destructive/10"
          onClick={onDelete}
        >
          <X size={14} className="mr-2" />
          Remover
        </Button>
      </div>
    </div>
  );
}
