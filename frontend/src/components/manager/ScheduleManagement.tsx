import { useState } from "react";
import { Calendar as CalendarIcon, Clock, Edit, MessageCircle, Plus, Phone, Mail, User, MapPin } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface Match {
  id: number;
  time: string;
  duration: string;
  team: string;
  field: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  players: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  paymentStatus: 'paid' | 'pending';
}

const matches: Match[] = [
  {
    id: 1,
    time: '08:00',
    duration: '1h',
    team: 'Los Tigres FC',
    field: 'Cancha Principal',
    status: 'confirmed',
    players: 22,
    customerName: 'Juan Pérez',
    customerPhone: '+51 987 654 321',
    customerEmail: 'juan@example.com',
    paymentStatus: 'paid'
  },
  {
    id: 2,
    time: '09:30',
    duration: '1h',
    team: 'Relámpagos',
    field: 'Cancha 2',
    status: 'confirmed',
    players: 14,
    customerName: 'Carlos Mendoza',
    customerPhone: '+51 912 345 678',
    customerEmail: 'carlos@example.com',
    paymentStatus: 'paid'
  },
  {
    id: 3,
    time: '11:00',
    duration: '2h',
    team: 'Águilas United',
    field: 'Cancha Principal',
    status: 'pending',
    players: 22,
    customerName: 'Luis García',
    customerPhone: '+51 923 456 789',
    customerEmail: 'luis@example.com',
    paymentStatus: 'pending'
  },
  {
    id: 4,
    time: '15:00',
    duration: '1h',
    team: 'Dynamo FC',
    field: 'Cancha Interior',
    status: 'confirmed',
    players: 10,
    customerName: 'Miguel Torres',
    customerPhone: '+51 934 567 890',
    customerEmail: 'miguel@example.com',
    paymentStatus: 'paid'
  },
  {
    id: 5,
    time: '16:30',
    duration: '1.5h',
    team: 'Juventud FC',
    field: 'Cancha 2',
    status: 'confirmed',
    players: 14,
    customerName: 'Pedro Sánchez',
    customerPhone: '+51 945 678 901',
    customerEmail: 'pedro@example.com',
    paymentStatus: 'paid'
  }
];

const fields = [
  { id: '1', name: 'Cancha Principal', type: '11v11' },
  { id: '2', name: 'Cancha 2', type: '7v7' },
  { id: '3', name: 'Cancha Interior', type: '5v5' }
];

export function ScheduleManagement() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [showEditModal, setShowEditModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  // Create manual reservation state
  const [newReservation, setNewReservation] = useState({
    field: '',
    time: '',
    duration: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    paymentStatus: 'pending' as 'paid' | 'pending'
  });

  const handleEditMatch = (match: Match) => {
    setSelectedMatch(match);
    setShowEditModal(true);
  };

  const handleContactMatch = (match: Match) => {
    setSelectedMatch(match);
    setShowContactModal(true);
  };

  const handleSaveEdit = () => {
    // Logic to save edits
    alert('Reserva actualizada exitosamente');
    setShowEditModal(false);
    setSelectedMatch(null);
  };

  const handleCreateReservation = () => {
    // Logic to create manual reservation
    alert(`Reserva manual creada: ${newReservation.field} a las ${newReservation.time}`);
    setShowCreateModal(false);
    setNewReservation({
      field: '',
      time: '',
      duration: '',
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      paymentStatus: 'pending'
    });
  };

  const handleCallCustomer = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleEmailCustomer = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const handleOpenChat = () => {
    alert('Abriendo chat del partido...');
    setShowContactModal(false);
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="p-4 space-y-6">
        {/* Header with Create Button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl mb-1">Gestión de Horarios</h1>
            <p className="text-sm text-muted-foreground">Administra tus reservas</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-12 h-12 bg-[#047857] hover:bg-[#047857]/90 rounded-full flex items-center justify-center text-white shadow-lg"
          >
            <Plus size={24} />
          </button>
        </div>

        {/* Quick Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          <Badge className="bg-[#047857] hover:bg-[#047857]/90 text-white border-none px-4 py-2">
            Hoy (8)
          </Badge>
          <Badge variant="outline" className="px-4 py-2">
            Mañana (6)
          </Badge>
          <Badge variant="outline" className="px-4 py-2">
            Esta Semana (42)
          </Badge>
          <Badge variant="outline" className="px-4 py-2">
            Este Mes (156)
          </Badge>
        </div>

        {/* Calendar */}
        <div className="border border-border rounded-lg p-4">
          <p className="text-sm mb-3">Seleccionar Fecha</p>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border-0"
          />
        </div>

        {/* Matches List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3>Partidos de Hoy</h3>
            <p className="text-sm text-muted-foreground">{matches.length} partidos</p>
          </div>

          <div className="space-y-3">
            {matches.map((match) => (
              <div key={match.id} className="border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="text-center pt-1">
                      <p className="text-lg">{match.time}</p>
                      <p className="text-xs text-muted-foreground">{match.duration}</p>
                    </div>
                    <div>
                      <h4 className="mb-1">{match.team}</h4>
                      <p className="text-sm text-muted-foreground mb-1">{match.field}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{match.players} jugadores</span>
                        <span>•</span>
                        <span>{match.customerName}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    {match.status === 'confirmed' ? (
                      <Badge className="bg-[#34d399] hover:bg-[#34d399]/90 text-white border-none">
                        Confirmado
                      </Badge>
                    ) : match.status === 'cancelled' ? (
                      <Badge className="bg-destructive hover:bg-destructive/90 text-white border-none">
                        Cancelado
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Pendiente</Badge>
                    )}
                    <Badge variant={match.paymentStatus === 'paid' ? 'default' : 'outline'} className={match.paymentStatus === 'paid' ? 'bg-[#047857] hover:bg-[#047857]/90' : ''}>
                      {match.paymentStatus === 'paid' ? 'Pagado' : 'Pago Pendiente'}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEditMatch(match)}
                  >
                    <Edit size={14} className="mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleContactMatch(match)}
                  >
                    <MessageCircle size={14} className="mr-2" />
                    Contactar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Match Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Reserva</DialogTitle>
            <DialogDescription>
              Modifica los detalles de la reserva
            </DialogDescription>
          </DialogHeader>
          {selectedMatch && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Cancha</Label>
                <Select defaultValue={selectedMatch.field}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fields.map((field) => (
                      <SelectItem key={field.id} value={field.name}>
                        {field.name} ({field.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Hora</Label>
                  <Input type="time" defaultValue={selectedMatch.time} />
                </div>
                <div className="space-y-2">
                  <Label>Duración</Label>
                  <Select defaultValue={selectedMatch.duration}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">1 hora</SelectItem>
                      <SelectItem value="1.5h">1.5 horas</SelectItem>
                      <SelectItem value="2h">2 horas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Estado</Label>
                <Select defaultValue={selectedMatch.status}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirmed">Confirmado</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Estado de Pago</Label>
                <Select defaultValue={selectedMatch.paymentStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Pagado</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} className="bg-[#047857] hover:bg-[#047857]/90">
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contact Modal */}
      <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Información de Contacto</DialogTitle>
            <DialogDescription>
              Detalles del cliente para esta reserva
            </DialogDescription>
          </DialogHeader>
          {selectedMatch && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                <div className="w-10 h-10 bg-[#047857] rounded-full flex items-center justify-center">
                  <User size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p>{selectedMatch.customerName}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Phone size={18} className="text-[#047857]" />
                    <div>
                      <p className="text-sm text-muted-foreground">Teléfono</p>
                      <p className="text-sm">{selectedMatch.customerPhone}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCallCustomer(selectedMatch.customerPhone)}
                  >
                    Llamar
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail size={18} className="text-[#047857]" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="text-sm">{selectedMatch.customerEmail}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEmailCustomer(selectedMatch.customerEmail)}
                  >
                    Enviar
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <MapPin size={18} className="text-[#047857]" />
                    <div>
                      <p className="text-sm text-muted-foreground">Partido</p>
                      <p className="text-sm">{selectedMatch.team}</p>
                      <p className="text-xs text-muted-foreground">{selectedMatch.field} • {selectedMatch.time}</p>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleOpenChat}
                className="w-full bg-[#047857] hover:bg-[#047857]/90"
              >
                <MessageCircle size={18} className="mr-2" />
                Abrir Chat de la App
              </Button>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowContactModal(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Manual Reservation Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Reserva Manual</DialogTitle>
            <DialogDescription>
              Registra una nueva reserva manualmente
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Cancha *</Label>
              <Select value={newReservation.field} onValueChange={(value: string) => setNewReservation({ ...newReservation, field: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cancha..." />
                </SelectTrigger>
                <SelectContent>
                  {fields.map((field) => (
                    <SelectItem key={field.id} value={field.name}>
                      {field.name} ({field.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Hora *</Label>
                <Input
                  type="time"
                  value={newReservation.time}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewReservation({ ...newReservation, time: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Duración *</Label>
                <Select value={newReservation.duration} onValueChange={(value: string) => setNewReservation({ ...newReservation, duration: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Duración" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">1 hora</SelectItem>
                    <SelectItem value="1.5h">1.5 horas</SelectItem>
                    <SelectItem value="2h">2 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Nombre del Cliente *</Label>
              <Input
                value={newReservation.customerName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewReservation({ ...newReservation, customerName: e.target.value })}
                placeholder="Nombre completo"
              />
            </div>

            <div className="space-y-2">
              <Label>Teléfono *</Label>
              <Input
                type="tel"
                value={newReservation.customerPhone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewReservation({ ...newReservation, customerPhone: e.target.value })}
                placeholder="+51 987 654 321"
              />
            </div>

            <div className="space-y-2">
              <Label>Email (Opcional)</Label>
              <Input
                type="email"
                value={newReservation.customerEmail}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewReservation({ ...newReservation, customerEmail: e.target.value })}
                placeholder="cliente@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label>Estado de Pago *</Label>
              <Select value={newReservation.paymentStatus} onValueChange={(value: string) => setNewReservation({ ...newReservation, paymentStatus: value as 'paid' | 'pending' })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Pagado</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreateReservation}
              className="bg-[#047857] hover:bg-[#047857]/90"
              disabled={!newReservation.field || !newReservation.time || !newReservation.duration || !newReservation.customerName || !newReservation.customerPhone}
            >
              Crear Reserva
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
