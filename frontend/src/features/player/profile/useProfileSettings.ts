import { useState, useCallback } from "react";
import { useUser } from "../../../contexts/UserContext";
import { 
  ProfileData, 
  NotificationSettings, 
  ActiveSection, 
  INITIAL_NOTIFICATIONS 
} from "./types";

export function useProfileSettings() {
  const { user, updateUser } = useUser();

  const [activeSection, setActiveSection] = useState<ActiveSection>(null);
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  const [profile, setProfile] = useState<ProfileData>({
    name: user.name || '',
    position: user.position || 'Delantero',
    level: 'Intermedio',
    bio: user.bio || 'Amante del fútbol, juego desde hace 10 años'
  });

  const [notifications, setNotifications] = useState<NotificationSettings>(INITIAL_NOTIFICATIONS);

  // Navigation
  const navigateTo = useCallback((section: ActiveSection) => {
    setActiveSection(section);
  }, []);

  const goBack = useCallback(() => {
    setActiveSection(null);
  }, []);

  // Profile actions
  const updateProfile = useCallback((updates: Partial<ProfileData>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  }, []);

  const saveProfile = useCallback(() => {
    updateUser({
      name: profile.name,
      position: profile.position,
      bio: profile.bio
    });
  }, [profile, updateUser]);

  // Notification actions
  const updateNotification = useCallback((key: keyof NotificationSettings, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  }, []);

  // Phone verification
  const openPhoneModal = useCallback(() => {
    setShowPhoneModal(true);
  }, []);

  const closePhoneModal = useCallback(() => {
    setShowPhoneModal(false);
  }, []);

  const handlePhoneVerified = useCallback((phone: string) => {
    updateUser({ phone, phoneVerified: true });
    closePhoneModal();
  }, [updateUser, closePhoneModal]);

  return {
    // State
    activeSection,
    profile,
    notifications,
    showPhoneModal,
    user,

    // Navigation
    navigateTo,
    goBack,

    // Profile actions
    updateProfile,
    saveProfile,

    // Notification actions
    updateNotification,

    // Phone modal
    openPhoneModal,
    closePhoneModal,
    handlePhoneVerified,
  };
}
