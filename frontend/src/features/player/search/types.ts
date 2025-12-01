import { TeamLevel } from "../../../types/field";

// ==================== Props Types ====================

export interface CreateSearchScreenProps {
  matchName: string;
  fieldName: string;
  date: string;
  time: string;
  preSelectedType?: 'rival' | 'players';
  onBack: () => void;
  onPublish: (type: 'rival' | 'players', data: SearchData) => void;
}

// ==================== Search Data Types ====================

export interface RivalSearchData {
  teamLevel: TeamLevel;
  teamName?: string;
  message: string;
}

export interface PlayersSearchData {
  teamLevel: TeamLevel;
  teamName?: string;
  playersNeeded: number;
  position: string;
  message: string;
}

export type SearchData = RivalSearchData | PlayersSearchData;

export type SearchType = 'rival' | 'players' | null;

// ==================== Component Props ====================

export interface MatchInfoCardProps {
  matchName: string;
  fieldName: string;
  date: string;
  time: string;
}

export interface TeamLevelSelectorProps {
  value: TeamLevel;
  onChange: (value: TeamLevel) => void;
  idSuffix?: string;
}

export interface SearchTypeOptionProps {
  type: 'rival' | 'players';
  onClick: () => void;
}

export interface RivalSearchFormProps {
  teamLevel: TeamLevel;
  setTeamLevel: (value: TeamLevel) => void;
  teamName: string;
  setTeamName: (value: string) => void;
  rivalMessage: string;
  setRivalMessage: (value: string) => void;
}

export interface PlayersSearchFormProps {
  teamLevel: TeamLevel;
  setTeamLevel: (value: TeamLevel) => void;
  teamName: string;
  setTeamName: (value: string) => void;
  playersNeeded: string;
  setPlayersNeeded: (value: string) => void;
  positionNeeded: string;
  setPositionNeeded: (value: string) => void;
  playersMessage: string;
  setPlayersMessage: (value: string) => void;
}

// ==================== Level Descriptions ====================

export const LEVEL_DESCRIPTIONS: Record<TeamLevel, { label: string; description: string }> = {
  principiante: { label: 'Principiante', description: 'Fútbol social, sin presión' },
  intermedio: { label: 'Intermedio', description: 'Juego organizado, competitivo' },
  avanzado: { label: 'Avanzado', description: 'Alta intensidad, ligas locales' }
};

// Re-export for convenience
export type { TeamLevel };
