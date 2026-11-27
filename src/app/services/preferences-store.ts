'use client';

import { apiFetch } from './auth';

export type Preferences = Partial<Record<string, string>>;
const preferencesRequestTimeoutMs = 8_000;

export function createPreferencesStore(
  namespace: string,
  endpoint: string,
  preferenceKeys: readonly string[],
  multipleKeys: readonly string[] = [],
  keepGuestFilters = false,
) {
  function filterPreferences(data: unknown): Preferences {
    const filters: Preferences = {};
    if (!data || typeof data !== 'object' || Array.isArray(data))
      return filters;
    for (const key of preferenceKeys) {
      const value = (data as Record<string, unknown>)[key];
      if (typeof value === 'string' && value) filters[key] = value;
    }
    return filters;
  }
  function applyPreferences(params: URLSearchParams, filters: Preferences) {
    for (const key of preferenceKeys) params.delete(key);
    for (const [key, value] of Object.entries(filters)) {
      if (!value || !preferenceKeys.includes(key)) continue;
      if (multipleKeys.includes(key)) {
        try {
          const values: unknown = JSON.parse(value);
          if (Array.isArray(values))
            for (const item of values) {
              if (typeof item === 'string') params.append(key, item);
            }
        } catch {
          /* Ignore invalid saved multi-select values. */
        }
      } else params.set(key, value);
    }
  }
  function pickPreferences(params: URLSearchParams): Preferences {
    const filters: Preferences = {};
    for (const key of preferenceKeys) {
      const value = multipleKeys.includes(key)
        ? params.getAll(key).length
          ? JSON.stringify(params.getAll(key))
          : ''
        : params.get(key);
      if (value) {
        filters[key] = value;
      }
    }
    return filters;
  }

  async function getPreferences(
    signal: AbortSignal,
    expectedHandle: string,
  ): Promise<Preferences> {
    await flushPreferences(expectedHandle);
    const data = await preferencesFetch({ signal });
    return filterPreferences(data?.filters);
  }

  function cacheKey(owner: string) {
    return `etrx.${namespace}.v1:${process.env.NEXT_PUBLIC_API_URL}:${owner.toLowerCase()}`;
  }

  function pendingKey(owner: string) {
    return `${cacheKey(owner)}:pending`;
  }

  function readPendingPreferences(owner: string): Preferences | null {
    try {
      const value = localStorage.getItem(pendingKey(owner));
      if (value === null) {
        return null;
      }
      const data = JSON.parse(value);
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return null;
      }
      return filterPreferences(data);
    } catch {
      return null;
    }
  }

  function readCachedPreferences(owner: string): Preferences {
    try {
      const data = JSON.parse(localStorage.getItem(cacheKey(owner)) || '{}');
      return filterPreferences(data);
    } catch {
      return {};
    }
  }

  function cachePreferences(owner: string, filters: Preferences) {
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
    const timer = setTimeout(abort, preferencesRequestTimeoutMs);
    try {
      const response = await apiFetch(endpoint, {
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
  let latestSave: { filters: Preferences; expectedHandle: string } | null =
    null;
  function savePreferences(filters: Preferences, expectedHandle: string) {
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

  function flushPreferences(expectedHandle: string | null) {
    if (!expectedHandle) {
      return Promise.resolve();
    }

    if (
      !latestSave ||
      latestSave.expectedHandle.toLowerCase() !== expectedHandle.toLowerCase()
    ) {
      const pending = readPendingPreferences(expectedHandle);
      return pending
        ? savePreferences(pending, expectedHandle)
        : Promise.resolve();
    }

    return pendingWrite.catch((error) => {
      if (
        !latestSave ||
        latestSave.expectedHandle.toLowerCase() !== expectedHandle.toLowerCase()
      )
        throw error;
      return savePreferences(latestSave.filters, latestSave.expectedHandle);
    });
  }

  return {
    preferenceKeys,
    keepGuestFilters,
    pickPreferences,
    applyPreferences,
    getPreferences,
    cachePreferences,
    readCachedPreferences,
    savePreferences,
    flushPreferences,
  };
}
export type PreferencesStore = ReturnType<typeof createPreferencesStore>;
