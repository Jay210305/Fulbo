import { useUser } from "../../../../contexts/UserContext";

interface DashboardHeaderProps {
  className?: string;
}

export function DashboardHeader({ className }: DashboardHeaderProps) {
  const { user } = useUser();
  const firstName = user?.name?.split(' ')[0] || 'Manager';

  return (
    <div
      className={`h-48 bg-cover bg-center relative ${className || ''}`}
      style={{
        backgroundImage: 'linear-gradient(rgba(10, 92, 58, 0.7), rgba(10, 92, 58, 0.9)), url(https://images.unsplash.com/photo-1663380821666-aa8aa44fc445?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb290YmFsbCUyMGZpZWxkJTIwZ3Jhc3N8ZW58MXx8fHwxNzYwMDQ1OTIzfDA&ixlib=rb-4.1.0&q=80&w=1080)'
      }}
    >
      <div className="absolute bottom-6 left-6 text-white">
        <h1 className="text-2xl mb-1">¡Bienvenido, {firstName}!</h1>
        <p className="text-sm opacity-90">Gestiona tus canchas</p>
      </div>
    </div>
  );
}
