import { useState, useRef } from "react";
import { Camera, Phone, ShieldCheck, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../../../components/ui/avatar";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { Separator } from "../../../../components/ui/separator";
import { Textarea } from "../../../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { toast } from "sonner";
import { uploadImage } from "../../../../services/upload.api";
import { SectionHeader } from "../components/SectionHeader";
import { ProfileData, POSITION_OPTIONS, LEVEL_OPTIONS } from "../types";

interface ProfileViewProps {
  onBack: () => void;
  profile: ProfileData;
  onUpdateProfile: (updates: Partial<ProfileData>) => void;
  onSaveProfile: () => void;
  userPhone?: string;
  phoneVerified?: boolean;
  onOpenPhoneModal: () => void;
}

export function ProfileView({
  onBack,
  profile,
  onUpdateProfile,
  onSaveProfile,
  userPhone,
  phoneVerified,
  onOpenPhoneModal
}: ProfileViewProps) {
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    onSaveProfile();
    alert('Cambios guardados');
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Solo se permiten imágenes (JPEG, PNG, WebP)');
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('La imagen debe ser menor a 5MB');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const url = await uploadImage(file, 'avatars');
      onUpdateProfile({ avatar: url });
      toast.success('Foto de perfil actualizada');
    } catch (error) {
      toast.error('Error al subir la imagen');
    } finally {
      setIsUploadingAvatar(false);
      // Reset input
      e.target.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <SectionHeader title="Mi Perfil" onBack={onBack} />

      <div className="p-4 space-y-6">
        {/* Foto de Perfil */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Avatar className="w-24 h-24">
              {profile.avatar ? (
                <AvatarImage src={profile.avatar} alt={profile.name} className="object-cover" />
              ) : null}
              <AvatarFallback className="bg-[#047857] text-white text-3xl">
                {profile.name.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <button 
              onClick={handleAvatarClick}
              disabled={isUploadingAvatar}
              className="absolute bottom-0 right-0 w-8 h-8 bg-[#047857] text-white rounded-full flex items-center justify-center hover:bg-[#047857]/90 disabled:opacity-50"
            >
              {isUploadingAvatar ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Camera size={16} />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {isUploadingAvatar ? 'Subiendo...' : 'Toca para cambiar foto'}
          </p>
        </div>

        {/* Nombre */}
        <div>
          <Label htmlFor="name">Nombre Completo</Label>
          <Input
            id="name"
            value={profile.name}
            onChange={(e) => onUpdateProfile({ name: e.target.value })}
            className="mt-2"
          />
        </div>

        {/* Posición */}
        <div>
          <Label htmlFor="position">Posición Preferida</Label>
          <Select 
            value={profile.position} 
            onValueChange={(value: string) => onUpdateProfile({ position: value })}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Selecciona tu posición" />
            </SelectTrigger>
            <SelectContent>
              {POSITION_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Nivel de Juego */}
        <div>
          <Label htmlFor="level">Nivel de Juego</Label>
          <Select 
            value={profile.level} 
            onValueChange={(value: string) => onUpdateProfile({ level: value })}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Selecciona tu nivel" />
            </SelectTrigger>
            <SelectContent>
              {LEVEL_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Biografía */}
        <div>
          <Label htmlFor="bio">Biografía (Opcional)</Label>
          <Textarea
            id="bio"
            value={profile.bio}
            onChange={(e) => onUpdateProfile({ bio: e.target.value })}
            placeholder="Cuéntanos un poco sobre ti..."
            className="mt-2 min-h-[100px]"
          />
        </div>

        <Separator />

        {/* Teléfono de Contacto */}
        <div>
          <Label>Teléfono de Contacto (Obligatorio)</Label>
          <div className="mt-2 border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Phone size={20} className="text-[#047857]" />
                <span>{userPhone || 'No configurado'}</span>
              </div>
              {phoneVerified && (
                <Badge className="bg-[#34d399] hover:bg-[#34d399]/90 text-white border-none">
                  <ShieldCheck size={12} className="mr-1" />
                  Verificado
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Solo visible para administradores de canchas donde reserves
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={onOpenPhoneModal}
            >
              {userPhone ? 'Cambiar Número' : 'Agregar Número'}
            </Button>
          </div>
        </div>

        <Button 
          className="w-full h-12 bg-[#047857] hover:bg-[#047857]/90"
          onClick={handleSave}
        >
          Guardar Cambios
        </Button>
      </div>
    </div>
  );
}
