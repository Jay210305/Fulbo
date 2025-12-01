import { useProfileSettings } from "./useProfileSettings";
import { MainSettingsView } from "./components";
import { 
  ProfileView, 
  TeamsView, 
  NotificationsView, 
  HistoryView, 
  PaymentsView 
} from "./views";
import { PhoneVerificationModal } from "../../../components/fulbo/PhoneVerificationModal";
import { ProfileSettingsScreenProps } from "./types";

export function ProfileSettingsScreen({ onBack }: ProfileSettingsScreenProps) {
  const {
    activeSection,
    profile,
    notifications,
    showPhoneModal,
    user,
    navigateTo,
    goBack,
    updateProfile,
    saveProfile,
    updateNotification,
    openPhoneModal,
    closePhoneModal,
    handlePhoneVerified,
  } = useProfileSettings();

  // Render section views based on active section
  if (activeSection === 'profile') {
    return (
      <>
        <ProfileView
          onBack={goBack}
          profile={profile}
          onUpdateProfile={updateProfile}
          onSaveProfile={saveProfile}
          userPhone={user.phone}
          phoneVerified={user.phoneVerified}
          onOpenPhoneModal={openPhoneModal}
        />
        <PhoneVerificationModal
          open={showPhoneModal}
          onClose={closePhoneModal}
          onVerified={handlePhoneVerified}
          isEditing={!!user.phone}
        />
      </>
    );
  }

  if (activeSection === 'teams') {
    return <TeamsView onBack={goBack} />;
  }

  if (activeSection === 'notifications') {
    return (
      <NotificationsView
        onBack={goBack}
        notifications={notifications}
        onUpdateNotification={updateNotification}
      />
    );
  }

  if (activeSection === 'history') {
    return <HistoryView onBack={goBack} />;
  }

  if (activeSection === 'payments') {
    return <PaymentsView onBack={goBack} />;
  }

  // Main settings view
  return <MainSettingsView onBack={onBack} onNavigate={navigateTo} />;
}
