import { createContext, useContext, useState, ReactNode } from 'react';

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
    name: 'Carlos Mendoza',
    email: 'carlos@example.com',
    phone: '', // Inicialmente vacío
    phoneVerified: false,
    position: 'Delantero',
    bio: 'Apasionado por el fútbol, siempre buscando nuevos desafíos.'
  });

  const updateUser = (data: Partial<UserData>) => {
    setUser(prev => ({ ...prev, ...data }));
  };

  const hasPhone = () => {
    return user.phone !== '' && user.phone.length >= 9;
  };

  const isPhoneVerified = () => {
    return user.phoneVerified;
  };

  const requiresPhoneVerification = () => {
    return !hasPhone() || !isPhoneVerified();
  };

  return (
    <UserContext.Provider value={{ user, updateUser, hasPhone, isPhoneVerified, requiresPhoneVerification }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
