'use client';

import { createPreferencesStore } from './preferences-store';

export const preferenceKeys = [
  'tags',
  'indexes',
  'divisions',
  'ranks',
  'minRating',
  'maxRating',
  'minPoints',
  'maxPoints',
  'minSolved',
  'maxSolved',
  'minDifficulty',
  'maxDifficulty',
  'problemName',
  'isOnly',
  'sortField',
  'sortOrder',
  'statuses',
  'hideSolved',
] as const;

export type ProblemPreferences = Partial<
  Record<(typeof preferenceKeys)[number], string>
>;
export const problemPreferencesStore = createPreferencesStore(
  'problemPreferences',
  '/api/problems/preferences',
  preferenceKeys,
);
export const {
  pickPreferences,
  getPreferences: getProblemPreferences,
  readCachedPreferences,
  cachePreferences,
  savePreferences: saveProblemPreferences,
  flushPreferences: flushProblemPreferences,
} = problemPreferencesStore;
