import { useState } from "react";
import { ArrowLeft, Users, Trophy } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { useTeams, TeamMember } from "../../contexts/TeamsContext";
import { useUser } from "../../contexts/UserContext";
import { PhoneVerificationModal } from "./PhoneVerificationModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

interface CreateTeamScreenProps {
  onBack: () => void;
  onTeamCreated: () => void;
}

export function CreateTeamScreen({ onBack, onTeamCreated }: CreateTeamScreenProps) {
  const { createTeam } = useTeams();
  const { requiresPhoneVerification, updateUser } = useUser();
  const [teamName, setTeamName] = useState('');
  const [description, setDescription] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  const currentUser: TeamMember = {
    id: 'current',
    name: 'Juan Pérez',
    username: '@juanperez',
    email: 'juan@example.com',
    role: 'captain',
    joinedAt: new Date(),
    status: 'online'
  };

  const handleCreateTeam = () => {
    if (!teamName.trim()) {
      alert('Por favor ingresa un nombre para el equipo');
      return;
    }

    // Verificar teléfono antes de crear equipo
    if (requiresPhoneVerification()) {
      setShowPhoneModal(true);
      return;
    }

    proceedWithTeamCreation();
  };

  const proceedWithTeamCreation = () => {
    createTeam({
      name: teamName.trim(),
      description: description.trim() || undefined,
      captain: currentUser,
      members: [currentUser],
      stats: {
        matchesPlayed: 0,
        wins: 0,
        losses: 0,
        draws: 0
      }
    });

    setShowSuccess(true);
  };

  const handleSuccess = () => {
    setShowSuccess(false);
    onTeamCreated();
  };

  const handlePhoneVerified = (phone: string) => {
    updateUser({ phone, phoneVerified: true });
    setShowPhoneModal(false);
    // Continuar con la creación del equipo
    proceedWithTeamCreation();
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center gap-3 z-10">
        <button onClick={onBack} className="p-2 hover:bg-muted rounded-full">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2>Crear Equipo</h2>
          <p className="text-sm text-muted-foreground">Organiza tu equipo formal</p>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#047857] to-[#10b981] rounded-xl p-6 text-white text-center">
          <Trophy size={48} className="mx-auto mb-3 text-white" />
          <h3 className="text-white mb-2">Crea Tu Equipo</h3>
          <p className="text-sm text-white/90">
            Organiza un equipo permanente con tus amigos y compañeros de juego
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="teamName">Nombre del Equipo *</Label>
            <Input
              id="teamName"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Ej: Los Tigres FC"
              maxLength={30}
            />
            <p className="text-xs text-muted-foreground">
              {teamName.length}/30 caracteres
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción (Opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe tu equipo, estilo de juego, objetivos..."
              rows={4}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">
              {description.length}/200 caracteres
            </p>
          </div>
        </div>

        {/* Info Cards */}
        <div className="space-y-3">
          <div className="bg-secondary border-2 border-[#047857] rounded-xl p-4">
            <h4 className="flex items-center gap-2 mb-2">
              <Users size={18} className="text-[#047857]" />
              Serás el Capitán
            </h4>
            <p className="text-sm text-muted-foreground">
              Como capitán, podrás invitar miembros, gestionar el equipo y asignar el equipo completo a tus partidos.
            </p>
          </div>

          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              <strong>Chat Permanente:</strong> Tu equipo tendrá un chat permanente donde todos los miembros pueden coordinar partidos y entrenamientos.
            </p>
          </div>

          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              <strong>Asignación Rápida:</strong> Una vez creado el equipo, podrás asignar a todos los miembros de una sola vez a tus partidos reservados.
            </p>
          </div>
        </div>

        {/* Create Button */}
        <Button
          onClick={handleCreateTeam}
          disabled={!teamName.trim()}
          className="w-full h-12 bg-[#047857] hover:bg-[#047857]/90"
        >
          <Trophy size={20} className="mr-2" />
          Crear Equipo
        </Button>
      </div>

      {/* Success Dialog */}
      <AlertDialog open={showSuccess} onOpenChange={setShowSuccess}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-[#dcfce7] flex items-center justify-center">
              <Trophy size={32} className="text-[#047857]" />
            </div>
            <AlertDialogTitle className="text-center">¡Equipo Creado!</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              El equipo "{teamName}" ha sido creado exitosamente.
              <br /><br />
              Ya puedes invitar miembros y comenzar a organizar partidos con tu equipo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={handleSuccess}
              className="w-full bg-[#047857] hover:bg-[#047857]/90"
            >
              Ir a Mis Equipos
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Phone Verification Modal */}
      <PhoneVerificationModal
        open={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
        onVerified={handlePhoneVerified}
      />
    </div>
  );
}
