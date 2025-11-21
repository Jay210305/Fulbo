import { useState } from "react";
import { TrendingUp, TrendingDown, Calendar, Users, DollarSign, ChevronRight, Clock, Edit, MessageCircle, X, User, Phone, Mail } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Calendar as CalendarComponent } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const todayMatches = [
  {
    id: 1,
    time: '15:00',
    duration: '1h',
    teams: 'Los Tigres vs Águilas',
    field: 'Cancha Principal',
    status: 'confirmed',
    customerName: 'Juan Pérez',
    customerPhone: '+51 987 654 321',
    customerEmail: 'juan@example.com',
    paymentStatus: 'paid'
  },
  {
    id: 2,
    time: '16:30',
    duration: '1h',
    teams: 'Relámpagos vs Dynamo',
    field: 'Cancha 2',
    status: 'confirmed',
    customerName: 'Carlos Mendoza',
    customerPhone: '+51 912 345 678',
    customerEmail: 'carlos@example.com',
    paymentStatus: 'paid'
  },
  {
    id: 3,
    time: '18:00',
    duration: '2h',
    teams: 'Juventud FC',
    field: 'Cancha Principal',
    status: 'pending',
    customerName: 'Luis García',
    customerPhone: '+51 923 456 789',
    customerEmail: 'luis@example.com',
    paymentStatus: 'pending'
  }
];

const fields = [
  {
    id: 1,
    name: 'Cancha Principal',
    type: '11v11',
    status: 'active',
    price: 50,
    nextBooking: '15:00'
  },
  {
    id: 2,
    name: 'Cancha 2',
    type: '7v7',
    status: 'active',
    price: 35,
    nextBooking: '16:30'
  },
  {
    id: 3,
    name: 'Cancha Interior',
    type: '5v5',
    status: 'active',
    price: 40,
    nextBooking: '17:00'
  }
];

// Mock data for chart
const chartData = [
  { day: 'Lun', ingresos: 850 },
  { day: 'Mar', ingresos: 1100 },
  { day: 'Mié', ingresos: 950 },
  { day: 'Jue', ingresos: 1300 },
  { day: 'Vie', ingresos: 1450 },
  { day: 'Sáb', ingresos: 1800 },
  { day: 'Dom', ingresos: 1650 }
];

interface ManagerDashboardProps {
  onNavigateToSchedule?: () => void;
  onNavigateToFields?: () => void;
}

export function ManagerDashboard({ onNavigateToSchedule, onNavigateToFields }: ManagerDashboardProps) {
  const [timePeriod, setTimePeriod] = useState<'today' | 'week' | 'month' | 'custom'>('today');
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  
  // Field schedule modal states
  const [showFieldSchedule, setShowFieldSchedule] = useState(false);
  const [selectedFieldForSchedule, setSelectedFieldForSchedule] = useState<typeof fields[0] | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<typeof todayMatches[0] | null>(null);

  const handleTimePeriodChange = (value: string) => {
    if (value === 'custom') {
      setShowCustomDatePicker(true);
    } else {
      setTimePeriod(value as 'today' | 'week' | 'month');
    }
  };

  const handleViewFieldSchedule = (field: typeof fields[0]) => {
    setSelectedFieldForSchedule(field);
    setShowFieldSchedule(true);
  };

  const handleEditMatch = (match: typeof todayMatches[0]) => {
    setSelectedMatch(match);
    setShowEditModal(true);
  };

  const handleContactMatch = (match: typeof todayMatches[0]) => {
    setSelectedMatch(match);
    setShowContactModal(true);
  };

  // Filter matches for the selected field
  const getFieldMatches = () => {
    if (!selectedFieldForSchedule) return [];
    return todayMatches.filter(match => match.field === selectedFieldForSchedule.name);
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <div
        className="h-48 bg-cover bg-center relative"
        style={{
          backgroundImage: 'linear-gradient(rgba(10, 92, 58, 0.7), rgba(10, 92, 58, 0.9)), url(https://images.unsplash.com/photo-1663380821666-aa8aa44fc445?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb290YmFsbCUyMGZpZWxkJTIwZ3Jhc3N8ZW58MXx8fHwxNzYwMDQ1OTIzfDA&ixlib=rb-4.1.0&q=80&w=1080)'
        }}
      >
        <div className="absolute bottom-6 left-6 text-white">
          <h1 className="text-2xl mb-1">¡Bienvenido, Carlos!</h1>
          <p className="text-sm opacity-90">Gestiona tus canchas</p>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Filter Period */}
        <div>
          <p className="text-sm text-muted-foreground mb-3">Filtrar por periodo</p>
          <div className="flex gap-2">
            <Button
              variant={timePeriod === 'today' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimePeriod('today')}
              className={timePeriod === 'today' ? 'bg-[#047857] hover:bg-[#047857]/90' : ''}
            >
              Hoy
            </Button>
            <Button
              variant={timePeriod === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimePeriod('week')}
              className={timePeriod === 'week' ? 'bg-[#047857] hover:bg-[#047857]/90' : ''}
            >
              Esta Semana
            </Button>
            <Button
              variant={timePeriod === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimePeriod('month')}
              className={timePeriod === 'month' ? 'bg-[#047857] hover:bg-[#047857]/90' : ''}
            >
              Este Mes
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCustomDatePicker(true)}
            >
              Personalizar
            </Button>
          </div>
          {dateRange.from && dateRange.to && (
            <p className="text-xs text-muted-foreground mt-2">
              {format(dateRange.from, "d 'de' MMMM", { locale: es })} - {format(dateRange.to, "d 'de' MMMM, yyyy", { locale: es })}
            </p>
          )}
        </div>

        {/* Summary Cards */}
        <div>
          <h2 className="mb-4">Resumen de {timePeriod === 'today' ? 'Hoy' : timePeriod === 'week' ? 'Esta Semana' : 'Este Mes'}</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 bg-[#047857] rounded-lg flex items-center justify-center">
                  <DollarSign size={18} className="text-white" />
                </div>
                <div className="flex items-center gap-1 text-[#34d399] text-sm">
                  <TrendingUp size={14} />
                  <span>12%</span>
                </div>
              </div>
              <p className="text-2xl mb-1">S/ 1,240</p>
              <p className="text-xs text-muted-foreground">Ingresos de Hoy</p>
            </div>

            <div className="bg-white border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 bg-[#047857] rounded-lg flex items-center justify-center">
                  <Calendar size={18} className="text-white" />
                </div>
                <div className="flex items-center gap-1 text-[#34d399] text-sm">
                  <TrendingUp size={14} />
                  <span>8%</span>
                </div>
              </div>
              <p className="text-2xl mb-1">24</p>
              <p className="text-xs text-muted-foreground">Reservas Totales</p>
            </div>

            <div className="bg-white border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 bg-[#047857] rounded-lg flex items-center justify-center">
                  <Users size={18} className="text-white" />
                </div>
                <div className="flex items-center gap-1 text-red-500 text-sm">
                  <TrendingDown size={14} />
                  <span>3%</span>
                </div>
              </div>
              <p className="text-2xl mb-1">156</p>
              <p className="text-xs text-muted-foreground">Clientes</p>
            </div>

            <div className="bg-white border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 bg-[#047857] rounded-lg flex items-center justify-center">
                  <Calendar size={18} className="text-white" />
                </div>
                <div className="flex items-center gap-1 text-[#34d399] text-sm">
                  <TrendingUp size={14} />
                  <span>5%</span>
                </div>
              </div>
              <p className="text-2xl mb-1">85%</p>
              <p className="text-xs text-muted-foreground">Ocupación</p>
            </div>
          </div>
        </div>

        {/* Trends Chart */}
        <Card className="p-4">
          <h3 className="mb-4">Tendencia de Ingresos</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                  tickFormatter={(value) => `S/ ${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`S/ ${value}`, 'Ingresos']}
                />
                <Line
                  type="monotone"
                  dataKey="ingresos"
                  stroke="#047857"
                  strokeWidth={3}
                  dot={{ fill: '#047857', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Today's Matches */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3>Partidos de Hoy</h3>
            <Button
              variant="link"
              className="text-[#047857] p-0 h-auto"
              onClick={onNavigateToSchedule}
            >
              Ver Todo
              <ChevronRight size={16} className="ml-1" />
            </Button>
          </div>
          <div className="space-y-3">
            {todayMatches.map((match) => (
              <div key={match.id} className="border border-border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <p className="text-lg">{match.time}</p>
                      <p className="text-xs text-muted-foreground">{match.duration}</p>
                    </div>
                    <div>
                      <p>{match.teams}</p>
                      <p className="text-sm text-muted-foreground">{match.field}</p>
                    </div>
                  </div>
                  {match.status === 'confirmed' ? (
                    <Badge className="bg-[#34d399] hover:bg-[#34d399]/90 text-white border-none">
                      Confirmado
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Pendiente</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* My Fields */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3>Mis Canchas</h3>
            <Button 
              variant="link" 
              className="text-[#047857] p-0 h-auto"
              onClick={onNavigateToFields}
            >
              Ver Todas
              <ChevronRight size={16} className="ml-1" />
            </Button>
          </div>
          <div className="space-y-3">
            {fields.map((field) => (
              <div key={field.id} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="mb-1">{field.name}</h4>
                    <p className="text-sm text-muted-foreground">{field.type}</p>
                  </div>
                  <Badge className="bg-[#34d399] hover:bg-[#34d399]/90 text-white border-none">
                    Activa
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[#047857]">S/ {field.price}/hora</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewFieldSchedule(field)}
                  >
                    Ver Horario
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Date Range Picker Dialog */}
      <Dialog open={showCustomDatePicker} onOpenChange={setShowCustomDatePicker}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Seleccionar Rango de Fechas</DialogTitle>
            <DialogDescription>
              Elige un periodo personalizado para ver las estadísticas
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <CalendarComponent
              mode="range"
              selected={dateRange}
              onSelect={setDateRange as any}
              numberOfMonths={1}
              locale={es}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCustomDatePicker(false)}
            >
              Cancelar
            </Button>
            <Button
              className="bg-[#047857] hover:bg-[#047857]/90"
              onClick={() => {
                setTimePeriod('custom');
                setShowCustomDatePicker(false);
              }}
            >
              Aplicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Field Schedule Modal */}
      {showFieldSchedule && selectedFieldForSchedule && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center justify-between z-10">
              <div>
                <h2>Horario - {selectedFieldForSchedule.name}</h2>
                <p className="text-sm text-muted-foreground">Reservas de hoy</p>
              </div>
              <button 
                onClick={() => {
                  setShowFieldSchedule(false);
                  setSelectedFieldForSchedule(null);
                }}
                className="p-2 hover:bg-muted rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            {/* Calendar Info */}
            <div className="p-4 bg-secondary border-b border-border">
              <div className="flex items-center gap-2 text-sm">
                <Calendar size={16} className="text-[#047857]" />
                <span>{format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}</span>
              </div>
            </div>

            {/* Schedule Content */}
            <div className="p-4 space-y-4">
              {getFieldMatches().length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-secondary rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Calendar size={32} className="text-muted-foreground" />
                  </div>
                  <h4 className="mb-2">No hay reservas para hoy</h4>
                  <p className="text-sm text-muted-foreground">
                    Esta cancha no tiene reservas programadas para el día de hoy
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-secondary rounded-lg p-3">
                    <p className="text-sm">
                      <strong>{getFieldMatches().length}</strong> reserva{getFieldMatches().length !== 1 ? 's' : ''} programada{getFieldMatches().length !== 1 ? 's' : ''}
                    </p>
                  </div>

                  {getFieldMatches().map((match) => (
                    <div key={match.id} className="border border-border rounded-lg p-4 space-y-3">
                      {/* Match Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-[#047857] rounded-lg flex items-center justify-center flex-shrink-0">
                            <Clock size={20} className="text-white" />
                          </div>
                          <div>
                            <h4 className="mb-1">{match.teams}</h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{match.time}</span>
                              <span>•</span>
                              <span>{match.duration}</span>
                            </div>
                          </div>
                        </div>
                        {match.status === 'confirmed' ? (
                          <Badge className="bg-[#34d399] hover:bg-[#34d399]/90 text-white border-none">
                            Confirmado
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Pendiente</Badge>
                        )}
                      </div>

                      {/* Customer Info */}
                      <div className="bg-muted rounded-lg p-3 space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-muted-foreground" />
                          <span>{match.customerName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={14} className="text-muted-foreground" />
                          <span>{match.customerPhone}</span>
                        </div>
                      </div>

                      {/* Actions */}
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
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Match Modal */}
      {showEditModal && selectedMatch && (
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Reserva</DialogTitle>
              <DialogDescription>
                Modifica los detalles de la reserva de {selectedMatch.teams}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Hora de Inicio</Label>
                <Input type="time" defaultValue={selectedMatch.time} />
              </div>
              <div>
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
              <div>
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
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditModal(false)}>
                Cancelar
              </Button>
              <Button 
                className="bg-[#047857] hover:bg-[#047857]/90"
                onClick={() => {
                  alert('Reserva actualizada');
                  setShowEditModal(false);
                }}
              >
                Guardar Cambios
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Contact Modal */}
      {showContactModal && selectedMatch && (
        <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Contactar Cliente</DialogTitle>
              <DialogDescription>
                Información de contacto de {selectedMatch.customerName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                <User size={20} className="text-[#047857]" />
                <div>
                  <p className="text-sm text-muted-foreground">Nombre</p>
                  <p>{selectedMatch.customerName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                <Phone size={20} className="text-[#047857]" />
                <div>
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <p>{selectedMatch.customerPhone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                <Mail size={20} className="text-[#047857]" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p>{selectedMatch.customerEmail}</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowContactModal(false)}>
                Cerrar
              </Button>
              <Button 
                className="bg-[#047857] hover:bg-[#047857]/90"
                onClick={() => {
                  if (selectedMatch) {
                    window.location.href = `tel:${selectedMatch.customerPhone}`;
                  }
                }}
              >
                <Phone size={16} className="mr-2" />
                Llamar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
