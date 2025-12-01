import { useState } from "react";
import { useUser } from "../../../contexts/UserContext";
import type { TeamLevel } from "../../../types/field";
import type { SearchData, SearchType, RivalSearchData, PlayersSearchData } from "./types";

export function useCreateSearch(
  preSelectedType: SearchType | undefined,
  onPublish: (type: 'rival' | 'players', data: SearchData) => void
) {
  const { requiresPhoneVerification, updateUser } = useUser();
  const [searchType, setSearchType] = useState<SearchType>(preSelectedType || null);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [pendingPublishType, setPendingPublishType] = useState<'rival' | 'players' | null>(null);

  // Common state
  const [teamLevel, setTeamLevel] = useState<TeamLevel>('intermedio');
  const [teamName, setTeamName] = useState('');

  // Rival search state
  const [rivalMessage, setRivalMessage] = useState('');

  // Players search state
  const [playersNeeded, setPlayersNeeded] = useState('');
  const [positionNeeded, setPositionNeeded] = useState('cualquier');
  const [playersMessage, setPlayersMessage] = useState('');

  const proceedWithRivalPublish = () => {
    const data: RivalSearchData = {
      teamLevel,
      teamName: teamName.trim() || undefined,
      message: rivalMessage
    };
    onPublish('rival', data);
  };

  const proceedWithPlayersPublish = () => {
    const data: PlayersSearchData = {
      teamLevel,
      teamName: teamName.trim() || undefined,
      playersNeeded: parseInt(playersNeeded),
      position: positionNeeded,
      message: playersMessage
    };
    onPublish('players', data);
  };

  const handlePublishRival = () => {
    if (!teamLevel || !rivalMessage.trim()) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    if (requiresPhoneVerification()) {
      setPendingPublishType('rival');
      setShowPhoneModal(true);
      return;
    }

    proceedWithRivalPublish();
  };

  const handlePublishPlayers = () => {
    if (!playersNeeded || !playersMessage.trim()) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    if (requiresPhoneVerification()) {
      setPendingPublishType('players');
      setShowPhoneModal(true);
      return;
    }

    proceedWithPlayersPublish();
  };

  const handlePhoneVerified = (phone: string) => {
    updateUser({ phone, phoneVerified: true });
    setShowPhoneModal(false);

    if (pendingPublishType === 'rival') {
      proceedWithRivalPublish();
    } else if (pendingPublishType === 'players') {
      proceedWithPlayersPublish();
    }
    setPendingPublishType(null);
  };

  const closePhoneModal = () => {
    setShowPhoneModal(false);
    setPendingPublishType(null);
  };

  const goBackToSelection = () => {
    setSearchType(null);
  };

  return {
    // State
    searchType,
    setSearchType,
    showPhoneModal,
    teamLevel,
    setTeamLevel,
    teamName,
    setTeamName,
    rivalMessage,
    setRivalMessage,
    playersNeeded,
    setPlayersNeeded,
    positionNeeded,
    setPositionNeeded,
    playersMessage,
    setPlayersMessage,

    // Actions
    handlePublishRival,
    handlePublishPlayers,
    handlePhoneVerified,
    closePhoneModal,
    goBackToSelection,
  };
}
