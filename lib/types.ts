export type Theme = 'court' | 'neon' | 'clay';

export type MatchResult = 'win' | 'loss' | 'lesson';

export interface PlayerShotStats {
  smash:          number;
  coupDroit:      number;
  revers:         number;
  fauteDirecte:   number;
  fauteProvoquee: number;
  winner:         number;
}

export interface MatchShotStats {
  total:       PlayerShotStats;
  leftPlayer:  PlayerShotStats;
  rightPlayer: PlayerShotStats;
}

export interface User {
  name: string;
  initials: string;
  level: number;
  // Extended profile (set during onboarding)
  firstName?: string;
  lastName?: string;
  nickname?: string;
  dominantHand?: 'left' | 'right';
  preferredSide?: 'left' | 'right';
  phone?: string;
}

export interface Match {
  id: string;
  date: string;
  duration: number;
  partners: string;
  opponents: string;
  score: string;
  result: MatchResult;
  venue: string;
  court: string;
  racket: string;
  shoes: string;
  stats?: MatchShotStats;
}

export interface UpcomingMatch {
  id: string;
  date: string;
  time: string;
  partners: string;
  venue: string;
  court: string;
  weather: string;
}

export interface Equipment {
  id: string;
  type: 'Raquette' | 'Chaussures';
  brand: string;
  name: string;
  weight?: number;
  shape?: 'Larme' | 'Ronde' | 'Boucle';
  size?: string;
  purchased: string;
  price: number;
  hours: number;
  hoursMax: number;
  primary: boolean;
}

export interface AppState {
  theme: Theme;
  user: User;
  matches: Match[];
  upcoming: UpcomingMatch[];
  equipment: Equipment[];
}

export type MatchInput = Omit<Match, 'id'>;
export type EquipmentInput = Omit<Equipment, 'id' | 'hours'>;
