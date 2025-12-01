import { useCreateSearch } from "./useCreateSearch";
import { PhoneVerificationModal } from "../../../components/fulbo/PhoneVerificationModal";
import { RivalSearchView, PlayersSearchView, SelectionView } from "./views";
import type { CreateSearchScreenProps } from "./types";

export function CreateSearchScreen({
  matchName,
  fieldName,
  date,
  time,
  preSelectedType,
  onBack,
  onPublish
}: CreateSearchScreenProps) {
  const {
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
    handlePublishRival,
    handlePublishPlayers,
    handlePhoneVerified,
    closePhoneModal,
    goBackToSelection,
  } = useCreateSearch(preSelectedType, onPublish);

  if (searchType === 'rival') {
    return (
      <>
        <RivalSearchView
          matchName={matchName}
          fieldName={fieldName}
          date={date}
          time={time}
          teamLevel={teamLevel}
          setTeamLevel={setTeamLevel}
          teamName={teamName}
          setTeamName={setTeamName}
          rivalMessage={rivalMessage}
          setRivalMessage={setRivalMessage}
          onBack={goBackToSelection}
          onPublish={handlePublishRival}
        />
        <PhoneVerificationModal
          open={showPhoneModal}
          onClose={closePhoneModal}
          onVerified={handlePhoneVerified}
        />
      </>
    );
  }

  if (searchType === 'players') {
    return (
      <>
        <PlayersSearchView
          matchName={matchName}
          fieldName={fieldName}
          date={date}
          time={time}
          teamLevel={teamLevel}
          setTeamLevel={setTeamLevel}
          teamName={teamName}
          setTeamName={setTeamName}
          playersNeeded={playersNeeded}
          setPlayersNeeded={setPlayersNeeded}
          positionNeeded={positionNeeded}
          setPositionNeeded={setPositionNeeded}
          playersMessage={playersMessage}
          setPlayersMessage={setPlayersMessage}
          onBack={goBackToSelection}
          onPublish={handlePublishPlayers}
        />
        <PhoneVerificationModal
          open={showPhoneModal}
          onClose={closePhoneModal}
          onVerified={handlePhoneVerified}
        />
      </>
    );
  }

  return (
    <>
      <SelectionView
        matchName={matchName}
        fieldName={fieldName}
        date={date}
        time={time}
        onBack={onBack}
        onSelectType={setSearchType}
      />
      <PhoneVerificationModal
        open={showPhoneModal}
        onClose={closePhoneModal}
        onVerified={handlePhoneVerified}
      />
    </>
  );
}
