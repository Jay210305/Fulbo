import { useState } from "react";
import { ArrowLeft, Plus, Mail, Phone, Shield, X, Edit } from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

interface StaffMember {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  permissions: {
    viewRevenue: boolean;
    editPrices: boolean;
    createManualBookings: boolean;
    manageFields: boolean;
    viewReports: boolean;
    managePromotions: boolean;
  };
  status: 'active' | 'inactive';
  joinedDate: string;
}

interface StaffManagementScreenProps {
  onBack: () => void;
}

const mockStaff: StaffMember[] = [
  {
    id: 1,
    name: 'María González',
    email: 'maria@example.com',
    phone: '+51 987 654 321',
    role: 'Administrador',
    permissions: {
      viewRevenue: true,
      editPrices: true,
      createManualBookings: true,
      manageFields: true,
      viewReports: true,
      managePromotions: true
    },
    status: 'active',
    joinedDate: '2024-01-15'
  },
  {
    id: 2,
    name: 'Pedro Sánchez',
    email: 'pedro@example.com',
    phone: '+51 912 345 678',
    role: 'Recepcionista',
    permissions: {
      viewRevenue: false,
      editPrices: false,
      createManualBookings: true,
      manageFields: false,
      viewReports: false,
      managePromotions: false
    },
    status: 'active',
    joinedDate: '2024-03-20'
  }
];

export function StaffManagementScreen({ onBack }: StaffManagementScreenProps) {
  const [staff, setStaff] = useState<StaffMember[]>(mockStaff);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    permissions: {
      viewRevenue: false,
      editPrices: false,
      createManualBookings: false,
      manageFields: false,
      viewReports: false,
      managePromotions: false
    }
  });

  const handleAddStaff = () => {
    const member: StaffMember = {
      id: Date.now(),
      ...newStaff,
      status: 'active',
      joinedDate: new Date().toISOString()
    };

    setStaff([...staff, member]);
    alert(`${newStaff.name} ha sido agregado al equipo. Se ha enviado un email de invitación.`);
    setShowAddDialog(false);
    setNewStaff({
      name: '',
      email: '',
      phone: '',
      role: '',
      permissions: {
        viewRevenue: false,
        editPrices: false,
        createManualBookings: false,
        manageFields: false,
        viewReports: false,
        managePromotions: false
      }
    });
  };

  const handleEditStaff = () => {
    if (selectedStaff) {
      setStaff(staff.map(s => s.id === selectedStaff.id ? selectedStaff : s));
      alert('Permisos actualizados exitosamente');
      setShowEditDialog(false);
      setSelectedStaff(null);
    }
  };

  const handleDeleteStaff = () => {
    if (selectedStaff) {
      setStaff(staff.filter(s => s.id !== selectedStaff.id));
      alert(`${selectedStaff.name} ha sido removido del equipo`);
      setShowDeleteDialog(false);
      setSelectedStaff(null);
    }
  };

  const permissionLabels = {
    viewRevenue: 'Ver Ingresos y Estadísticas',
    editPrices: 'Editar Precios de Canchas',
    createManualBookings: 'Crear Reservas Manuales',
    manageFields: 'Gestionar Canchas',
    viewReports: 'Ver Reportes Avanzados',
    managePromotions: 'Gestionar Promociones'
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center gap-3 z-10">
        <button onClick={onBack} className="p-2 hover:bg-muted rounded-full">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h2>Gestión de Empleados</h2>
          <p className="text-sm text-muted-foreground">Administra tu equipo de trabajo</p>
        </div>
        <button
          onClick={() => setShowAddDialog(true)}
          className="w-10 h-10 bg-[#047857] hover:bg-[#047857]/90 rounded-full flex items-center justify-center text-white"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Info Card */}
        <div className="bg-secondary border-2 border-[#047857] rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-[#047857] rounded-full flex items-center justify-center flex-shrink-0">
              <Shield size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <h4 className="mb-1">Control de Acceso</h4>
              <p className="text-sm text-muted-foreground">
                Asigna permisos específicos a cada miembro de tu equipo para mantener la seguridad de tu negocio.
              </p>
            </div>
          </div>
        </div>

        {/* Staff List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3>Equipo de Trabajo</h3>
            <Badge variant="outline">{staff.length} miembros</Badge>
          </div>

          {staff.length === 0 ? (
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
              <Shield size={48} className="mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                Aún no has agregado empleados a tu equipo
              </p>
              <Button
                onClick={() => setShowAddDialog(true)}
                className="bg-[#047857] hover:bg-[#047857]/90"
              >
                <Plus size={18} className="mr-2" />
                Agregar Primer Empleado
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {staff.map((member) => (
                <div key={member.id} className="border border-border rounded-xl p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-[#047857] text-white">
                        {member.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="mb-1">{member.name}</h4>
                      <p className="text-sm text-muted-foreground mb-1">{member.role}</p>
                      <Badge variant={member.status === 'active' ? 'default' : 'secondary'} className={member.status === 'active' ? 'bg-[#34d399] hover:bg-[#34d399]/90 text-white text-xs' : 'text-xs'}>
                        {member.status === 'active' ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail size={14} />
                      <span>{member.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone size={14} />
                      <span>{member.phone}</span>
                    </div>
                  </div>

                  <div className="bg-secondary rounded-lg p-3 mb-3">
                    <p className="text-xs text-muted-foreground mb-2">Permisos asignados:</p>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(member.permissions)
                        .filter(([_, value]) => value)
                        .map(([key]) => (
                          <Badge key={key} variant="outline" className="text-xs">
                            {permissionLabels[key as keyof typeof permissionLabels]}
                          </Badge>
                        ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setSelectedStaff(member);
                        setShowEditDialog(true);
                      }}
                    >
                      <Edit size={14} className="mr-2" />
                      Editar Permisos
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        setSelectedStaff(member);
                        setShowDeleteDialog(true);
                      }}
                    >
                      <X size={14} className="mr-2" />
                      Remover
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Staff Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Empleado</DialogTitle>
            <DialogDescription>
              Completa la información y asigna permisos
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nombre Completo *</Label>
              <Input
                value={newStaff.name}
                onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                placeholder="Juan Pérez"
              />
            </div>

            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={newStaff.email}
                onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                placeholder="juan@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label>Teléfono *</Label>
              <Input
                type="tel"
                value={newStaff.phone}
                onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                placeholder="+51 987 654 321"
              />
            </div>

            <div className="space-y-2">
              <Label>Rol/Cargo *</Label>
              <Input
                value={newStaff.role}
                onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                placeholder="Ej: Recepcionista, Administrador"
              />
            </div>

            <div className="space-y-3 border-t border-border pt-4">
              <Label>Permisos Específicos</Label>
              
              {Object.entries(permissionLabels).map(([key, label]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={`new-${key}`}
                    checked={newStaff.permissions[key as keyof typeof newStaff.permissions]}
                    onCheckedChange={(checked) => 
                      setNewStaff({
                        ...newStaff,
                        permissions: {
                          ...newStaff.permissions,
                          [key]: checked
                        }
                      })
                    }
                  />
                  <label
                    htmlFor={`new-${key}`}
                    className="text-sm cursor-pointer"
                  >
                    {label}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAddStaff}
              className="bg-[#047857] hover:bg-[#047857]/90"
              disabled={!newStaff.name || !newStaff.email || !newStaff.phone || !newStaff.role}
            >
              Agregar Empleado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Staff Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Permisos</DialogTitle>
            <DialogDescription>
              {selectedStaff?.name} - {selectedStaff?.role}
            </DialogDescription>
          </DialogHeader>
          {selectedStaff && (
            <div className="space-y-3 py-4">
              {Object.entries(permissionLabels).map(([key, label]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={`edit-${key}`}
                    checked={selectedStaff.permissions[key as keyof typeof selectedStaff.permissions]}
                    onCheckedChange={(checked) => 
                      setSelectedStaff({
                        ...selectedStaff,
                        permissions: {
                          ...selectedStaff.permissions,
                          [key]: checked
                        }
                      })
                    }
                  />
                  <label
                    htmlFor={`edit-${key}`}
                    className="text-sm cursor-pointer"
                  >
                    {label}
                  </label>
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleEditStaff}
              className="bg-[#047857] hover:bg-[#047857]/90"
            >
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Empleado</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas remover a {selectedStaff?.name} del equipo?
              Esta acción no se puede deshacer y el empleado perderá acceso inmediatamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedStaff(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteStaff}
              className="bg-destructive hover:bg-destructive/90"
            >
              Remover Empleado
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
