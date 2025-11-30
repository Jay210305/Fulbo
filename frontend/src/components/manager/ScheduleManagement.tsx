import { useState, useEffect } from "react";
import { Edit, MessageCircle, Plus, Phone, Mail, User, MapPin, Ban, Trash2, AlertTriangle, Loader2 } from "lucide-react";
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
import { 
  ScheduleBlockApi, 
  ScheduleBlock, 
  ScheduleBlockReason,
  BookingConflict,
  ApiError 
} from "../../services/api";
import api from "../../services/api";

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

interface Field {
  id: string;
  name: string;
  type?: string;
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

const REASON_LABELS: Record<ScheduleBlockReason, string> = {
  maintenance: 'Mantenimiento',
  personal: 'Personal',
  event: 'Evento',
};

const REASON_COLORS: Record<ScheduleBlockReason, string> = {
  maintenance: 'bg-orange-500',
  personal: 'bg-purple-500',
  event: 'bg-blue-500',
};

export function ScheduleManagement() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [showEditModal, setShowEditModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  
  // Fields state
  const [fields, setFields] = useState<Field[]>([]);
  const [loadingFields, setLoadingFields] = useState(true);
  
  // Schedule blocks state
  const [scheduleBlocks, setScheduleBlocks] = useState<ScheduleBlock[]>([]);
  const [blockError, setBlockError] = useState<string | null>(null);
  const [savingBlock, setSavingBlock] = useState(false);
  const [deletingBlockId, setDeletingBlockId] = useState<string | null>(null);
  const [bookingConflicts, setBookingConflicts] = useState<BookingConflict[]>([]);

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

  // Create block state
  const [newBlock, setNewBlock] = useState({
    fieldId: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    reason: '' as ScheduleBlockReason | '',
    note: '',
  });

  // Fetch manager's fields
  useEffect(() => {
    const fetchFields = async () => {
      try {
        setLoadingFields(true);
        const response = await api.get<Array<{ id: string; name: string }>>('/manager/fields');
        setFields(response.map(f => ({ id: f.id, name: f.name })));
      } catch (error) {
        console.error('Error fetching fields:', error);
      } finally {
        setLoadingFields(false);
      }
    };
    fetchFields();
  }, []);

  // Fetch schedule blocks
  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        // Get blocks for the current month
        const startDate = new Date();
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 2);
        
        const blocks = await ScheduleBlockApi.getAll({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        });
        setScheduleBlocks(blocks);
      } catch (error) {
        console.error('Error fetching schedule blocks:', error);
      }
    };
    fetchBlocks();
  }, []);

  // Check if a date has blocks
  const dateHasBlocks = (checkDate: Date): boolean => {
    return scheduleBlocks.some(block => {
      const start = new Date(block.startTime);
      const end = new Date(block.endTime);
      const check = new Date(checkDate);
      check.setHours(12, 0, 0, 0);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return check >= start && check <= end;
    });
  };

  // Get blocks for selected date
  const getBlocksForDate = (checkDate: Date | undefined): ScheduleBlock[] => {
    if (!checkDate) return [];
    return scheduleBlocks.filter(block => {
      const start = new Date(block.startTime);
      const end = new Date(block.endTime);
      const check = new Date(checkDate);
      check.setHours(12, 0, 0, 0);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return check >= start && check <= end;
    });
  };

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

  const handleOpenBlockModal = () => {
    setBlockError(null);
    setBookingConflicts([]);
    setNewBlock({
      fieldId: fields.length === 1 ? fields[0].id : '',
      startDate: date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      startTime: '08:00',
      endDate: date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      endTime: '18:00',
      reason: '',
      note: '',
    });
    setShowBlockModal(true);
  };

  const handleCreateBlock = async () => {
    if (!newBlock.fieldId || !newBlock.startDate || !newBlock.startTime || 
        !newBlock.endDate || !newBlock.endTime || !newBlock.reason) {
      setBlockError('Por favor completa todos los campos obligatorios');
      return;
    }

    setSavingBlock(true);
    setBlockError(null);
    setBookingConflicts([]);

    try {
      const startTime = new Date(`${newBlock.startDate}T${newBlock.startTime}:00`);
      const endTime = new Date(`${newBlock.endDate}T${newBlock.endTime}:00`);

      if (startTime >= endTime) {
        setBlockError('La hora de inicio debe ser anterior a la hora de fin');
        setSavingBlock(false);
        return;
      }

      const response = await ScheduleBlockApi.create({
        fieldId: newBlock.fieldId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        reason: newBlock.reason as ScheduleBlockReason,
        note: newBlock.note || undefined,
      });

      // Add the new block to the list
      setScheduleBlocks(prev => [...prev, response.block]);
      setShowBlockModal(false);
      setNewBlock({
        fieldId: '',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        reason: '',
        note: '',
      });
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 409) {
          // Parse the error response to get conflicts
          try {
            const errorData = JSON.parse(error.message);
            if (errorData.conflicts) {
              setBookingConflicts(errorData.conflicts);
              setBlockError('Existen reservas confirmadas en este rango de tiempo. Debes cancelarlas antes de crear el bloqueo.');
            } else {
              setBlockError(error.message);
            }
          } catch {
            setBlockError('Ya existe un bloqueo que se superpone con este rango de tiempo');
          }
        } else {
          setBlockError(error.message);
        }
      } else {
        setBlockError('Error al crear el bloqueo. Intenta nuevamente.');
      }
    } finally {
      setSavingBlock(false);
    }
  };

  const handleDeleteBlock = async (blockId: string) => {
    if (!confirm('¿Estás seguro de eliminar este bloqueo?')) return;

    setDeletingBlockId(blockId);
    try {
      await ScheduleBlockApi.delete(blockId);
      setScheduleBlocks(prev => prev.filter(b => b.id !== blockId));
    } catch (error) {
      console.error('Error deleting block:', error);
      alert('Error al eliminar el bloqueo');
    } finally {
      setDeletingBlockId(null);
    }
  };

  const blocksForSelectedDate = getBlocksForDate(date);

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="p-4 space-y-6">
        {/* Header with Create Buttons */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl mb-1">Gestión de Horarios</h1>
            <p className="text-sm text-muted-foreground">Administra tus reservas y bloqueos</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleOpenBlockModal}
              className="w-12 h-12 bg-orange-500 hover:bg-orange-600 rounded-full flex items-center justify-center text-white shadow-lg"
              title="Bloquear horario"
            >
              <Ban size={24} />
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-12 h-12 bg-[#047857] hover:bg-[#047857]/90 rounded-full flex items-center justify-center text-white shadow-lg"
              title="Crear reserva"
            >
              <Plus size={24} />
            </button>
          </div>
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
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm">Seleccionar Fecha</p>
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-orange-500"></div>
                <span>Bloqueado</span>
              </div>
            </div>
          </div>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border-0"
            modifiers={{
              blocked: (d: Date) => dateHasBlocks(d),
            }}
            modifiersStyles={{
              blocked: {
                backgroundColor: 'rgb(249 115 22 / 0.2)',
                borderRadius: '0.375rem',
              },
            }}
          />
        </div>

        {/* Schedule Blocks for Selected Date */}
        {blocksForSelectedDate.length > 0 && (
          <div className="border border-orange-200 bg-orange-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Ban size={18} className="text-orange-600" />
              <h3 className="font-medium text-orange-800">
                Bloqueos para {date?.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h3>
            </div>
            <div className="space-y-2">
              {blocksForSelectedDate.map((block) => (
                <div key={block.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-10 rounded ${REASON_COLORS[block.reason]}`}></div>
                    <div>
                      <p className="font-medium">{block.fieldName}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(block.startTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - {new Date(block.endTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {REASON_LABELS[block.reason]}
                        </Badge>
                        {block.note && (
                          <span className="text-xs text-muted-foreground">{block.note}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteBlock(block.id)}
                    disabled={deletingBlockId === block.id}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    {deletingBlockId === block.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

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

      {/* Block Schedule Modal */}
      <Dialog open={showBlockModal} onOpenChange={setShowBlockModal}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ban size={20} className="text-orange-500" />
              Bloquear Horario
            </DialogTitle>
            <DialogDescription>
              Bloquea un rango de tiempo para mantenimiento, eventos o cierre personal.
              Los jugadores no podrán reservar durante este período.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {blockError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={18} className="text-red-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-red-700">{blockError}</p>
                    {bookingConflicts.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <p className="text-xs font-medium text-red-600">Reservas en conflicto:</p>
                        {bookingConflicts.map((conflict) => (
                          <div key={conflict.bookingId} className="text-xs text-red-600">
                            • {conflict.customerName} - {new Date(conflict.startTime).toLocaleString('es-ES')}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Cancha *</Label>
              {loadingFields ? (
                <div className="flex items-center gap-2 p-2 text-muted-foreground">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-sm">Cargando canchas...</span>
                </div>
              ) : (
                <Select 
                  value={newBlock.fieldId} 
                  onValueChange={(value: string) => setNewBlock({ ...newBlock, fieldId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cancha..." />
                  </SelectTrigger>
                  <SelectContent>
                    {fields.map((field) => (
                      <SelectItem key={field.id} value={field.id}>
                        {field.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Fecha Inicio *</Label>
                <Input
                  type="date"
                  value={newBlock.startDate}
                  onChange={(e) => setNewBlock({ ...newBlock, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Hora Inicio *</Label>
                <Input
                  type="time"
                  value={newBlock.startTime}
                  onChange={(e) => setNewBlock({ ...newBlock, startTime: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Fecha Fin *</Label>
                <Input
                  type="date"
                  value={newBlock.endDate}
                  onChange={(e) => setNewBlock({ ...newBlock, endDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Hora Fin *</Label>
                <Input
                  type="time"
                  value={newBlock.endTime}
                  onChange={(e) => setNewBlock({ ...newBlock, endTime: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Razón *</Label>
              <Select 
                value={newBlock.reason} 
                onValueChange={(value: string) => setNewBlock({ ...newBlock, reason: value as ScheduleBlockReason })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar razón..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maintenance">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded bg-orange-500"></div>
                      Mantenimiento
                    </div>
                  </SelectItem>
                  <SelectItem value="personal">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded bg-purple-500"></div>
                      Personal / Cierre
                    </div>
                  </SelectItem>
                  <SelectItem value="event">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded bg-blue-500"></div>
                      Evento Privado
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Nota (Opcional)</Label>
              <Textarea
                value={newBlock.note}
                onChange={(e) => setNewBlock({ ...newBlock, note: e.target.value })}
                placeholder="Ej: Reparación de césped, Torneo corporativo..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBlockModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreateBlock}
              className="bg-orange-500 hover:bg-orange-600"
              disabled={savingBlock || !newBlock.fieldId || !newBlock.startDate || !newBlock.startTime || !newBlock.endDate || !newBlock.endTime || !newBlock.reason}
            >
              {savingBlock ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Ban size={16} className="mr-2" />
                  Crear Bloqueo
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                        {field.name}
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
                      {field.name}
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
