import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserData {
  name: string;
  email: string;
  phone: string;
  phoneVerified: boolean;
  avatar?: string;
  position?: string;
  bio?: string;
}

interface UserContextType {
  user: UserData;
  updateUser: (data: Partial<UserData>) => void;
  hasPhone: () => boolean;
  isPhoneVerified: () => boolean;
  requiresPhoneVerification: () => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData>({
    name: '', email: '', phone: '', phoneVerified: false, position: '', bio: ''
  });

  // 1. Cargar perfil al iniciar
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      console.log("🔍 Token encontrado:", token ? "SÍ" : "NO"); // DEBUG

      if (!token) return;

      try {
        console.log("📡 Solicitando perfil al backend..."); // DEBUG
        const response = await fetch('http://localhost:4000/api/users/profile', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log("✅ Datos recibidos:", data); // DEBUG: Aquí verás si llega first_name

          // Mapeo de Snake_Case (BD) a CamelCase (Frontend)
          const userData: UserData = {
            name: `${data.first_name} ${data.last_name}`,
            email: data.email,
            phone: data.phone_number || '',
            phoneVerified: !!data.phone_number,
            position: 'Jugador', // Valor por defecto o de BD si lo agregas
            bio: ''
          };
          
          setUser(userData);
        } else {
          console.error("❌ Error API:", response.status, response.statusText);
          if (response.status === 401) localStorage.removeItem('token'); // Token inválido
        }
      } catch (error) {
        console.error("🔥 Error de conexión:", error);
      }
    };

    fetchProfile();
  }, []);

  const updateUser = (data: Partial<UserData>) => {
    setUser(prev => ({ ...prev, ...data }));
    // Aquí podrías agregar un fetch PUT para guardar cambios en el backend también
  };

  const hasPhone = () => !!user.phone && user.phone.length >= 9;
  const isPhoneVerified = () => user.phoneVerified;
  const requiresPhoneVerification = () => !hasPhone() || !isPhoneVerified();

  return (
    <UserContext.Provider value={{ user, updateUser, hasPhone, isPhoneVerified, requiresPhoneVerification }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) throw new Error('useUser must be used within a UserProvider');
  return context;
}