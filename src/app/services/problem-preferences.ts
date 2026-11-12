'use client';

import { apiFetch } from './auth';

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

export function pickPreferences(params: URLSearchParams): ProblemPreferences {
  const filters: ProblemPreferences = {};
  for (const key of preferenceKeys) {
    const value = params.get(key);
    if (value) {
      filters[key] = value;
    }
  }
  return filters;
}

export async function getProblemPreferences(
  signal: AbortSignal,
  expectedHandle: string,
): Promise<ProblemPreferences> {
  await flushProblemPreferences(expectedHandle);
  const data = await preferencesFetch({ signal });
  const params = new URLSearchParams();
  for (const key of preferenceKeys) {
    if (typeof data?.filters?.[key] === 'string') {
      params.set(key, data.filters[key]);
    }
  }
  return pickPreferences(params);
}

function cacheKey(owner: string) {
  return `etrx.problemPreferences.v1:${process.env.NEXT_PUBLIC_API_URL}:${owner.toLowerCase()}`;
}

function pendingKey(owner: string) {
  return `${cacheKey(owner)}:pending`;
}

function readPendingPreferences(owner: string): ProblemPreferences | null {
  try {
    const value = localStorage.getItem(pendingKey(owner));
    if (value === null) {
      return null;
    }
    const data = JSON.parse(value);
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return null;
    }
    const params = new URLSearchParams();
    for (const key of preferenceKeys) {
      if (typeof data[key] === 'string') {
        params.set(key, data[key]);
      }
    }
    return pickPreferences(params);
  } catch {
    return null;
  }
}

export function readCachedPreferences(owner: string): ProblemPreferences {
  try {
    const data = JSON.parse(localStorage.getItem(cacheKey(owner)) || '{}');
    const params = new URLSearchParams();
    for (const key of preferenceKeys) {
      if (typeof data?.[key] === 'string') {
        params.set(key, data[key]);
      }
    }
    return pickPreferences(params);
  } catch {
    return {};
  }
}

export function cachePreferences(owner: string, filters: ProblemPreferences) {
  try {
    localStorage.setItem(cacheKey(owner), JSON.stringify(filters));
  } catch {
    // Account settings also work when browser storage is disabled.
  }
}

async function preferencesFetch(init: RequestInit = {}) {
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (init.signal?.aborted) {
    controller.abort();
  }
  init.signal?.addEventListener('abort', abort, { once: true });
  const timer = setTimeout(abort, 8000);
  try {
    const response = await apiFetch('/api/problems/preferences', {
      ...init,
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`Preferences: ${response.status}`);
    }
    return response.status === 204 ? null : await response.json();
  } finally {
    clearTimeout(timer);
    init.signal?.removeEventListener('abort', abort);
  }
}

// Keep writes in action order; later responses cannot overwrite newer selections.
let pendingWrite: Promise<void> = Promise.resolve();
let latestSave: { filters: ProblemPreferences; expectedHandle: string } | null =
  null;
export function saveProblemPreferences(
  filters: ProblemPreferences,
  expectedHandle: string,
) {
  const snapshot = { filters, expectedHandle };
  latestSave = snapshot;
  try {
    localStorage.setItem(pendingKey(expectedHandle), JSON.stringify(filters));
  } catch {
    // The in-memory queue remains available when storage is disabled.
  }
  pendingWrite = pendingWrite
    .catch(() => {})
    .then(async () => {
      await preferencesFetch({
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters, expectedHandle }),
      });
      try {
        if (
          localStorage.getItem(pendingKey(expectedHandle)) ===
          JSON.stringify(filters)
        ) {
          localStorage.removeItem(pendingKey(expectedHandle));
        }
      } catch {
        // A failed cache cleanup must not turn a successful save into an error.
      }
      if (latestSave === snapshot) {
        latestSave = null;
      }
    });
  return pendingWrite;
}

export function flushProblemPreferences(expectedHandle: string | null) {
  if (!expectedHandle) {
    return Promise.resolve();
  }

  if (
    !latestSave ||
    latestSave.expectedHandle.toLowerCase() !== expectedHandle.toLowerCase()
  ) {
    const pending = readPendingPreferences(expectedHandle);
    return pending
      ? saveProblemPreferences(pending, expectedHandle)
      : Promise.resolve();
  }

  return pendingWrite.catch((error) => {
    if (
      !latestSave ||
      latestSave.expectedHandle.toLowerCase() !== expectedHandle.toLowerCase()
    )
      throw error;
    return saveProblemPreferences(
      latestSave.filters,
      latestSave.expectedHandle,
    );
  });
}
