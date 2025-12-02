import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserData {
  name: string;
  email: string;
  phone: string;
  phoneVerified: boolean;
  avatar?: string;
  position?: string;
  bio?: string;
  role?: string;
}

interface UserContextType {
  user: UserData;
  updateUser: (data: Partial<UserData>) => void;
  hasPhone: () => boolean;
  isPhoneVerified: () => boolean;
  requiresPhoneVerification: () => boolean;
  logout: () => void;
  isManager: () => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData>({
    name: '', email: '', phone: '', phoneVerified: false, position: '', bio: '', role: ''
  });

  // 1. Cargar perfil al iniciar
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      
      // Si no hay token, no hacemos nada (la App ya debería haber redirigido al login)
      if (!token) return;

      try {
        console.log("📡 Solicitando perfil al backend...");
        const response = await fetch('http://localhost:4000/api/users/profile', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log("✅ Datos recibidos:", data);

          const userData: UserData = {
            name: `${data.first_name} ${data.last_name}`,
            email: data.email,
            phone: data.phone_number || '',
            phoneVerified: !!data.phone_number,
            position: 'Jugador',
            bio: '',
            role: data.role || 'player'
          };
          
          setUser(userData);
        } else {
          console.error("❌ Error API:", response.status, response.statusText);
          
          // CORRECCIÓN IMPORTANTE:
          // 401 = Token inválido o expirado
          // 404 = Token válido, pero el usuario ya no existe en la BD (tu caso actual)
          if (response.status === 401 || response.status === 404) {
            console.log("⚠️ Sesión inválida, cerrando sesión...");
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Forzamos la recarga para que App.tsx detecte que no hay token y muestre Login
            window.location.reload();
          }
        }
      } catch (error) {
        console.error("🔥 Error de conexión:", error);
      }
    };

    fetchProfile();
  }, []);

  const updateUser = (data: Partial<UserData>) => {
    setUser(prev => ({ ...prev, ...data }));
  };

  // 2. Implementación de la función Logout
  const logout = () => {
    // Limpiar datos de sesión
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Opcional: Limpiar otros datos cacheados si tuvieras (ej. carrito)
    // localStorage.removeItem('cart');

    // Recargar la página para reiniciar el estado de la App y volver al Login
    window.location.reload();
  };

  const hasPhone = () => !!user.phone && user.phone.length >= 9;
  const isPhoneVerified = () => user.phoneVerified;
  const requiresPhoneVerification = () => !hasPhone() || !isPhoneVerified();
  const isManager = () => user.role === 'manager';

  return (
    <UserContext.Provider value={{ 
      user, 
      updateUser, 
      hasPhone, 
      isPhoneVerified, 
      requiresPhoneVerification,
      logout,
      isManager
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) throw new Error('useUser must be used within a UserProvider');
  return context;
}