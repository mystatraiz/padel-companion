import type { AppState } from './types';

export const DEFAULT_STATE: AppState = {
  theme:           'neon',
  user:            { name: '', initials: '', level: 5 },
  matches:         [],
  upcoming:        [],
  equipment:       [],
  fastingSessions: [],
  weightEntries:   [],
};
