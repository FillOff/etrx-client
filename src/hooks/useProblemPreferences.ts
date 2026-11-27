'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { problemPreferencesStore } from '@/app/services/problem-preferences';
import {
  Preferences,
  PreferencesStore,
} from '@/app/services/preferences-store';

const preferencesRetryIntervalMs = 15_000;

type Hydration = { owner: string | null; target: string; ready: boolean };
type PendingSave = { owner: string; filters: Preferences };

export function useProblemPreferences(
  owner: string | null,
  authLoading: boolean,
  store: PreferencesStore = problemPreferencesStore,
) {
  const {
    cachePreferences,
    getPreferences,
    pickPreferences,
    readCachedPreferences,
    savePreferences,
    applyPreferences,
  } = store;
  const previousOwner = useRef<string | null | undefined>(undefined);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const latestQuery = useRef(searchParams.toString());
  const currentOwner = useRef(owner);
  const selectionVersion = useRef(0);
  const pendingSave = useRef<PendingSave | null>(null);
  const [hydration, setHydration] = useState<Hydration | null>(null);

  useEffect(() => {
    latestQuery.current = searchParams.toString();
    currentOwner.current = owner;
  }, [searchParams, owner]);

  const save = useCallback(
    async (snapshot: PendingSave) => {
      try {
        await savePreferences(snapshot.filters, snapshot.owner);
        if (pendingSave.current === snapshot) pendingSave.current = null;
      } catch (error) {
        console.warn('Could not save filters; retrying automatically.', error);
      }
    },
    [savePreferences],
  );

  useEffect(() => {
    if (authLoading) return;
    const controller = new AbortController();
    setHydration(null);
    selectionVersion.current = 0;
    pendingSave.current = null;
    const guestFilters =
      store.keepGuestFilters && previousOwner.current == null
        ? pickPreferences(new URLSearchParams(latestQuery.current))
        : {};
    previousOwner.current = owner;
    let loadPending = !!owner;
    let busy = false;
    let initial = true;

    const apply = (filters: Preferences) => {
      const params = new URLSearchParams(latestQuery.current);
      // A guest or another account must never inherit this account's filters.
      applyPreferences(params, filters);
      if (!store.keepGuestFilters) params.set('page', '1');
      const target = params.toString();
      setHydration({ owner, target, ready: target === latestQuery.current });
      if (target !== latestQuery.current) {
        latestQuery.current = target;
        router.replace(`${pathname}?${target}`);
      }
    };

    const restore = async () => {
      if (busy) return;
      busy = true;
      try {
        const filters = owner
          ? await getPreferences(controller.signal, owner)
          : guestFilters;
        if (controller.signal.aborted || currentOwner.current !== owner) return;
        loadPending = false;
        // Background responses must not replace filters changed by the user.
        if (selectionVersion.current === 0) {
          if (owner) cachePreferences(owner, filters);
          apply(filters);
        }
      } catch (error) {
        if (controller.signal.aborted || currentOwner.current !== owner) return;
        console.warn(
          'Could not restore filters; retrying automatically.',
          error,
        );
        if (initial) apply(owner ? readCachedPreferences(owner) : {});
      } finally {
        initial = false;
        busy = false;
      }
    };

    void restore();
    const retry = () => {
      if (controller.signal.aborted || document.visibilityState !== 'visible')
        return;
      const snapshot = pendingSave.current;
      if (snapshot?.owner === owner) void save(snapshot);
      else if (loadPending && selectionVersion.current === 0) void restore();
    };
    const timer = window.setInterval(retry, preferencesRetryIntervalMs);
    window.addEventListener('online', retry);
    window.addEventListener('focus', retry);
    return () => {
      controller.abort();
      window.clearInterval(timer);
      window.removeEventListener('online', retry);
      window.removeEventListener('focus', retry);
    };
  }, [
    owner,
    authLoading,
    pathname,
    router,
    save,
    store,
    applyPreferences,
    cachePreferences,
    getPreferences,
    pickPreferences,
    readCachedPreferences,
  ]);

  useEffect(() => {
    if (
      hydration &&
      !hydration.ready &&
      hydration.owner === owner &&
      hydration.target === searchParams.toString()
    )
      setHydration({ ...hydration, ready: true });
  }, [hydration, owner, searchParams]);

  const ready = !authLoading && hydration?.owner === owner && hydration.ready;
  const setQueryParams = useCallback(
    (changes: Record<string, unknown>) => {
      if (!ready) return;
      const params = new URLSearchParams(latestQuery.current);
      for (const [key, value] of Object.entries(changes)) {
        if (value === undefined || value === null || value === '')
          params.delete(key);
        else if (Array.isArray(value)) {
          params.delete(key);
          for (const item of value) params.append(key, String(item));
        } else params.set(key, String(value));
      }
      const previous = JSON.stringify(
        pickPreferences(new URLSearchParams(latestQuery.current)),
      );
      const selected = pickPreferences(params);
      latestQuery.current = params.toString();
      router.replace(`${pathname}?${params.toString()}`);
      if (owner && previous !== JSON.stringify(selected)) {
        selectionVersion.current++;
        cachePreferences(owner, selected);
        const snapshot = { owner, filters: selected };
        pendingSave.current = snapshot;
        void save(snapshot);
      }
    },
    [owner, pathname, ready, router, save, cachePreferences, pickPreferences],
  );

  return { searchParams, setQueryParams, ready };
}
