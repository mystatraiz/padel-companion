export type Theme = 'court' | 'neon' | 'clay';

export type MatchResult = 'win' | 'loss' | 'lesson';

export interface User {
  name: string;
  initials: string;
  level: number;
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
