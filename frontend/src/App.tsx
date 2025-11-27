import { useState, useEffect } from "react";
import { BottomNav } from "./components/shared/BottomNav";
import { SplashScreen } from "./components/fulbo/SplashScreen";
import { LoginScreen } from "./components/fulbo/LoginScreen";
import { RegisterScreen } from "./components/fulbo/RegisterScreen";
import { OwnerRegistration } from "./components/fulbo/OwnerRegistration";
import { HomeScreen } from "./components/fulbo/HomeScreen";
import { SearchScreen } from "./components/fulbo/SearchScreen";
import { FieldDetailScreen } from "./components/fulbo/FieldDetailScreen";
import { CheckoutScreen } from "./components/fulbo/CheckoutScreen";
import { PaymentMethodsScreen } from "./components/fulbo/PaymentMethodsScreen";
import { PendingReservationCart } from "./components/fulbo/PendingReservationCart";
import { ReservationToast } from "./components/shared/ReservationToast";
import { ChatScreen } from "./components/fulbo/ChatScreen";
import { useCart } from "./contexts/CartContext";
import { PlayerProfile } from "./components/fulbo/PlayerProfile";
import { ManagerDashboard } from "./components/manager/ManagerDashboard";
import { FieldManagement } from "./components/manager/FieldManagement";
import { ScheduleManagement } from "./components/manager/ScheduleManagement";
import { AdvertisingScreen } from "./components/manager/AdvertisingScreen";
import { ManagerProfile } from "./components/manager/ManagerProfile";
import { CartProvider } from "./contexts/CartContext";
import { MatchesProvider } from "./contexts/MatchesContext";
import { TeamsProvider } from "./contexts/TeamsContext";
import { UserProvider } from "./contexts/UserContext";

type AppMode = 'player' | 'manager';
type AuthState = 'splash' | 'login' | 'register' | 'ownerRegistration' | 'authenticated';
type ReservationFlow = 'browse' | 'detail' | 'checkout' | 'payment';

interface PlayerAppProps {
  isOwner: boolean;
  currentMode: AppMode;
  onRegisterAsOwner: () => void;
  onSwitchMode: () => void;
}

function PlayerApp({ isOwner, currentMode, onRegisterAsOwner, onSwitchMode }: PlayerAppProps) {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [reservationFlow, setReservationFlow] = useState<ReservationFlow>('browse');
  const [matchName, setMatchName] = useState('');
  const [teamChatName, setTeamChatName] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [showPendingCart, setShowPendingCart] = useState(false);
  const { cart, setPendingReservation, setMatchName: setCartMatchName } = useCart();

  const handlePayLater = (name: string) => {
    setPendingReservation(name);
    setMatchName(name);
    setReservationFlow('browse');
    setActiveTab('home');
    setShowToast(true);
  };

  const handleCartClick = () => {
    if (cart.isPending) {
      setShowPendingCart(true);
    } else {
      setReservationFlow('checkout');
    }
  };

  const handleContinueFromPending = () => {
    setShowPendingCart(false);
    setReservationFlow('payment');
  };

  const handleJoinTeam = (chatName: string) => {
    setTeamChatName(chatName);
    setActiveTab('chat');
  };

  return (
    <>
      <ReservationToast
        show={showToast}
        onClose={() => setShowToast(false)}
        onCartClick={() => {
          setShowToast(false);
          setShowPendingCart(true);
        }}
      />

      {showPendingCart ? (
        <PendingReservationCart
          onBack={() => setShowPendingCart(false)}
          onContinueToPayment={handleContinueFromPending}
        />
      ) : reservationFlow === 'detail' ? (
        <FieldDetailScreen
          fieldId={selectedField || '1'}
          onBack={() => {
            setReservationFlow('browse');
            setSelectedField(null);
          }}
          onContinueToCheckout={() => {
            setReservationFlow('checkout');
          }}
        />
      ) : reservationFlow === 'checkout' ? (
        <CheckoutScreen
          onBack={() => setReservationFlow('detail')}
          onContinueToPayment={(name) => {
            setMatchName(name);
            setCartMatchName(name);
            setReservationFlow('payment');
          }}
          onPayLater={handlePayLater}
          onCancel={() => {
            setReservationFlow('browse');
            setSelectedField(null);
            setActiveTab('home');
          }}
        />
      ) : reservationFlow === 'payment' ? (
        <PaymentMethodsScreen
          matchName={matchName}
          onBack={() => setReservationFlow('checkout')}
          onPaymentComplete={(name) => {
            setReservationFlow('browse');
            setActiveTab('chat');
          }}
        />
      ) : (
        <>
          {activeTab === 'home' && (
            <HomeScreen
              onFieldClick={(fieldId) => {
                setSelectedField(fieldId);
                setReservationFlow('detail');
              }}
              onCartClick={handleCartClick}
            />
          )}
          {activeTab === 'search' && (
            <SearchScreen
              onFieldClick={(fieldId) => {
                setSelectedField(fieldId);
                setReservationFlow('detail');
              }}
              onCartClick={handleCartClick}
              onJoinTeam={handleJoinTeam}
            />
          )}
          {activeTab === 'chat' && <ChatScreen matchName={matchName || teamChatName} />}
          {activeTab === 'profile' && (
            <PlayerProfile
              isOwner={isOwner}
              currentMode={currentMode}
              onRegisterAsOwner={onRegisterAsOwner}
              onSwitchMode={onSwitchMode}
              onOpenChat={(matchId) => {
                setActiveTab('chat');
              }}
            />
          )}
          <BottomNav
            activeTab={activeTab}
            onTabChange={setActiveTab}
            type="player"
          />
        </>
      )}
    </>
  );
}

export default function App() {
  const [currentMode, setCurrentMode] = useState<AppMode>('player');
  const [isOwner, setIsOwner] = useState(false);
  const [authState, setAuthState] = useState<AuthState>('splash');
  const [managerTab, setManagerTab] = useState('dashboard');

  // 1. EFECTO DE CARGA INICIAL (SPLASH Y VERIFICACIÓN DE SESIÓN)
  useEffect(() => {
    const checkSession = () => {
      const token = localStorage.getItem('token');
      if (token) {
        // Si hay token, saltamos directo a autenticado
        setAuthState('authenticated');
      } else {
        // Si no, mostramos login después del splash
        setAuthState('login');
      }
    };

    // Simulamos tiempo de splash (2 segundos)
    const timer = setTimeout(() => {
      if (authState === 'splash') {
        checkSession();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [authState]);

  const handleSwitchMode = () => {
    if (isOwner) {
      setCurrentMode(currentMode === 'player' ? 'manager' : 'player');
    }
  }
  
  // Función para manejar el cierre de sesión (pásasela a PlayerProfile si la necesita)
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthState('login');
  };

  // Authentication flow
  if (authState === 'splash') {
    return <SplashScreen />;
  }

  if (authState === 'login') {
    return (
      <LoginScreen
        onLogin={() => setAuthState('authenticated')}
        onRegister={() => setAuthState('register')}
      />
    );
  }

  if (authState === 'register') {
    return (
      <RegisterScreen
        onRegister={() => setAuthState('authenticated')}
        onBack={() => setAuthState('login')}
      />
    );
  }

  if (authState === 'ownerRegistration') {
    return (
      <OwnerRegistration
        onComplete={() => {
          setIsOwner(true);
          setAuthState('authenticated');
        }}
        onCancel={() => {
          setAuthState('authenticated');
        }}
      />
    );
  }

  // Main App - Player Mode
  if (currentMode === 'player') {
    return (
      <UserProvider>
        <CartProvider>
          <MatchesProvider>
            <TeamsProvider>
              <div className="min-h-screen bg-white">
                <PlayerApp
                  isOwner={isOwner}
                  currentMode={currentMode}
                  onRegisterAsOwner={() => setAuthState('ownerRegistration')}
                  onSwitchMode={handleSwitchMode}
                />
              </div>
            </TeamsProvider>
          </MatchesProvider>
        </CartProvider>
      </UserProvider>
    );
  }

  // Main App - Manager Mode
  return (
    <div className="min-h-screen bg-white">
      {managerTab === 'dashboard' && (
        <ManagerDashboard
          onNavigateToSchedule={() => setManagerTab('schedule')}
          onNavigateToFields={() => setManagerTab('fields')}
        />
      )}
      {managerTab === 'fields' && <FieldManagement />}
      {managerTab === 'schedule' && <ScheduleManagement />}
      {managerTab === 'advertising' && <AdvertisingScreen />}
      {managerTab === 'profile' && (
        <ManagerProfile
          isOwner={isOwner}
          currentMode={currentMode}
          onSwitchMode={handleSwitchMode}
        />
      )}
      <BottomNav
        activeTab={managerTab}
        onTabChange={setManagerTab}
        type="manager"
      />
    </div>
  );
}