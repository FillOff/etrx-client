'use client';

import { createPreferencesStore } from './preferences-store';

export const ladderPreferencesStore = createPreferencesStore(
  'ladderPreferences',
  '/api/ladder/preferences',
  ['division', 'difficulty', 'rating', 'tags'],
  ['tags'],
  true,
);
export const { flushPreferences: flushLadderPreferences } =
  ladderPreferencesStore;
