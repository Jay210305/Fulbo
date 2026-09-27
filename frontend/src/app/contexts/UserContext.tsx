import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { AuthApi, AuthUser, RegisterData } from '../../services/auth.api';

const TOKEN_KEY = 'token';

interface UserData {
  name: string;
  email: string;
  phone: string;
  phoneVerified: boolean;
  role: 'player' | 'manager';
  avatar?: string;
  position?: string;
  bio?: string;
}

interface UserContextType {
  user: UserData;
  isAuthenticated: boolean;
  isRestoring: boolean;
  isManager: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<UserData>) => void;
  refreshProfile: () => Promise<void>;
  hasPhone: () => boolean;
  isPhoneVerified: () => boolean;
  requiresPhoneVerification: () => boolean;
}

const EMPTY_USER: UserData = {
  name: '',
  email: '',
  phone: '',
  phoneVerified: false,
  role: 'player',
};

function toUserData(authUser: AuthUser): UserData {
  return {
    name: `${authUser.first_name} ${authUser.last_name}`.trim() || authUser.email,
    email: authUser.email,
    phone: authUser.phone_number ?? '',
    phoneVerified: authUser.phone_verified,
    role: authUser.role,
  };
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData>(EMPTY_USER);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRestoring, setIsRestoring] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const applySession = (token: string, authUser: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, token);
    setUser(toUserData(authUser));
    setIsAuthenticated(true);
    setAuthError(null);
  };

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setIsRestoring(false);
      return;
    }
    AuthApi.getProfile()
      .then((profile) => {
        setUser(toUserData(profile));
        setIsAuthenticated(true);
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
      })
      .finally(() => setIsRestoring(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setAuthError(null);
    try {
      const res = await AuthApi.login(email, password);
      applySession(res.token, res.user);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al iniciar sesión';
      setAuthError(message);
      throw err;
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setAuthError(null);
    try {
      const res = await AuthApi.register(data);
      applySession(res.token, res.user);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al registrarse';
      setAuthError(message);
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(EMPTY_USER);
    setIsAuthenticated(false);
    setAuthError(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    const profile = await AuthApi.getProfile();
    setUser(toUserData(profile));
  }, []);

  const updateUser = (data: Partial<UserData>) => {
    setUser((prev) => ({ ...prev, ...data }));
  };

  const hasPhone = () => user.phone !== '' && user.phone.length >= 9;
  const isPhoneVerified = () => user.phoneVerified;
  const requiresPhoneVerification = () => !hasPhone() || !isPhoneVerified();

  return (
    <UserContext.Provider
      value={{
        user,
        isAuthenticated,
        isRestoring,
        isManager: user.role === 'manager',
        authError,
        login,
        register,
        logout,
        updateUser,
        refreshProfile,
        hasPhone,
        isPhoneVerified,
        requiresPhoneVerification,
      }}
    >
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
