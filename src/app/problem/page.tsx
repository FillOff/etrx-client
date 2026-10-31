'use client';

import {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
  Suspense,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useIsClient } from '@/hooks/useIsClient';
import { useProblemPreferences } from '@/hooks/useProblemPreferences';
import GizmoSpinner from '@/app/components/gizmo-spinner';
import { Table } from '@/app/components/Table';
import { GetDivTagsList } from '@/app/components/problem-tags';
import { Column, SortOrder } from '@/app/models/TableTypes';
import { Problem, ProblemForTable } from '@/app/models/Problem';
import { unixToFormattedDate } from '@/libs/date';
import { FilterBounds } from '../models/FilterBounds';
import FilterSidebar from '../components/filter-sidebar';
import {
  getFilters,
  getProblems,
  setProblemDeferred,
  syncProgress,
} from '../services/problems';
import { useAuth } from '../components/auth-provider';
import styles from './progress.module.css';

type ProgressStatus = 'solved' | 'failed' | 'deferred';
const progressStatuses: ProgressStatus[] = ['failed', 'solved', 'deferred'];

function ProblemClientPage() {
  const { t, i18n } = useTranslation(['problem', 'common', 'contest']);
  const isClient = useIsClient();
  const { authenticated, handle, loading: authLoading, openLogin } = useAuth();
  const owner = authenticated ? handle : null;
  const currentOwner = useRef(owner);
  useEffect(() => {
    currentOwner.current = owner;
  }, [owner]);
  const [revision, setRevision] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [progressError, setProgressError] = useState('');
  const [saving, setSaving] = useState<string | null>(null);
  const syncBusy = useRef<string | null>(null);
  const markBusy = useRef(false);
  const boundsInitialized = useRef(false);

  const [totalBounds, setTotalBounds] = useState<FilterBounds | null>(null);
  const [currentBounds, setCurrentBounds] = useState<FilterBounds | null>(null);

  const [problems, setProblems] = useState<Problem[]>([]);
  const [loadedOwner, setLoadedOwner] = useState<string | null | undefined>(
    undefined,
  );
  const [maxPage, setMaxPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false);

  const {
    searchParams,
    setQueryParams,
    ready: preferencesReady,
  } = useProblemPreferences(owner, authLoading);

  const filters = useMemo(() => {
    const getNum = (key: string) => {
      const val = searchParams.get(key);
      return val !== null && val !== '' ? Number(val) : undefined;
    };
    const getArray = (key: string) => {
      const val = searchParams.get(key);
      return val ? val.split(',').filter(Boolean) : [];
    };

    return {
      page: Number(searchParams.get('page')) || 1,
      sortField: (searchParams.get('sortField') ||
        'contestId') as keyof Problem,
      sortOrder: (searchParams.get('sortOrder') || 'desc') as SortOrder,
      problemName: searchParams.get('problemName') || '',
      isOnly: searchParams.get('isOnly') !== 'false',
      minRating: getNum('minRating'),
      maxRating: getNum('maxRating'),
      minPoints: getNum('minPoints'),
      maxPoints: getNum('maxPoints'),
      minSolved: getNum('minSolved'),
      maxSolved: getNum('maxSolved'),
      minDifficulty: getNum('minDifficulty'),
      maxDifficulty: getNum('maxDifficulty'),
      tags: getArray('tags'),
      indexes: getArray('indexes'),
      ranks: getArray('ranks'),
      divisions: getArray('divisions'),
      hideSolved: authenticated && searchParams.get('hideSolved') === 'true',
      statuses: authenticated
        ? getArray('statuses').filter((s): s is ProgressStatus =>
            progressStatuses.includes(s as ProgressStatus),
          )
        : [],
    };
  }, [searchParams, authenticated]);

  useEffect(() => {
    const initBounds = async () => {
      try {
        const response = await getFilters({});
        if (response.ok) {
          const data = await response.json();
          const bounds = data.totalBounds;

          setTotalBounds(bounds);
          setCurrentBounds(data.currentFilters);
        }
      } catch (err) {
        console.error('Failed to load metadata:', err);
      }
    };
    if (isClient && !boundsInitialized.current) {
      boundsInitialized.current = true;
      initBounds();
    }
  }, [isClient]);

  const refreshProgress = useCallback(
    async (signal?: AbortSignal) => {
      if (!owner || syncBusy.current === owner) return;
      const requestedOwner = owner;
      syncBusy.current = owner;
      setSyncing(true);
      try {
        const result = await syncProgress(signal);
        if (signal?.aborted || currentOwner.current !== requestedOwner) return;
        setLastSync(result.lastSuccessAt);
        setProgressError(
          result.success || !result.message
            ? ''
            : t('problem:progress.syncFailed'),
        );
        setRevision((v) => v + 1);
      } catch {
        if (!signal?.aborted && currentOwner.current === requestedOwner)
          setProgressError(t('problem:progress.syncFailed'));
      } finally {
        if (syncBusy.current === requestedOwner) syncBusy.current = null;
        if (currentOwner.current === requestedOwner) setSyncing(false);
      }
    },
    [owner, t],
  );

  useEffect(() => {
    const controller = new AbortController();
    setProblems([]);
    setProgressError('');
    setLastSync(null);
    setSaving(null);
    setSyncing(false);
    if (!owner || authLoading) return;
    // Read the database immediately; sync in the background without blocking the table.
    const refresh = () => {
      if (!controller.signal.aborted && document.visibilityState === 'visible')
        refreshProgress(controller.signal);
    };
    queueMicrotask(refresh);
    window.addEventListener('focus', refresh);
    const timer = window.setInterval(refresh, 60000);
    return () => {
      controller.abort();
      window.clearInterval(timer);
      window.removeEventListener('focus', refresh);
    };
  }, [owner, authLoading, refreshProgress]);

  useEffect(() => {
    if (!isClient || !totalBounds || authLoading || !preferencesReady) return;
    const controller = new AbortController();
    const load = async () => {
      setIsLoading(true);
      setError(null);
      const queryArgs = {
        'Pagination.Page': filters.page,
        'Pagination.PageSize': 100,
        'Filters.AvailableTags': filters.tags,
        'Filters.AvailableIndexes': filters.indexes,
        'Filters.AvailableDivisions': filters.divisions,
        'Filters.AvailableRanks': filters.ranks,
        'Filters.MinRating': filters.minRating,
        'Filters.MaxRating': filters.maxRating,
        'Filters.MinPoints': filters.minPoints,
        'Filters.MaxPoints': filters.maxPoints,
        'Filters.MinSolved': filters.minSolved,
        'Filters.MaxSolved': filters.maxSolved,
        'Filters.MinDifficulty': filters.minDifficulty,
        'Filters.MaxDifficulty': filters.maxDifficulty,
        'Sorting.SortField': filters.sortField,
        'Sorting.SortOrder': filters.sortOrder,
        ProblemName: filters.problemName || undefined,
        IsOnly: filters.isOnly,
        Lang: i18n.language,
        Statuses: filters.statuses,
        HideSolved: filters.hideSolved,
      };
      try {
        const [resProblems, resFilters] = await Promise.all([
          getProblems(queryArgs, controller.signal),
          getFilters(queryArgs, controller.signal),
        ]);
        if (!resProblems.ok || !resFilters.ok)
          throw new Error(
            t('common:error', {
              statusCode: !resProblems.ok
                ? resProblems.status
                : resFilters.status,
            }),
          );
        const [dataP, dataF] = await Promise.all([
          resProblems.json(),
          resFilters.json(),
        ]);
        if (controller.signal.aborted) return;
        const pages = dataP.totalPagesCount || dataP.pageCount || 1;
        if (filters.page > pages) {
          setQueryParams({ page: 1 });
          return;
        }
        setProblems(dataP.items || dataP.problems || []);
        setLoadedOwner(owner);
        setMaxPage(pages);
        if (dataF.currentFilters) setCurrentBounds(dataF.currentFilters);
      } catch (err) {
        if (!controller.signal.aborted) setError(err as Error);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, [
    isClient,
    totalBounds,
    authLoading,
    preferencesReady,
    owner,
    filters,
    i18n.language,
    t,
    revision,
    setQueryParams,
  ]);

  const toggleDeferred = useCallback(
    async (p: Problem) => {
      if (!owner || markBusy.current) return;
      const requestedOwner = owner;
      markBusy.current = true;
      setSaving(`${p.contestId}-${p.index}`);
      setProgressError('');
      try {
        await setProblemDeferred(p.contestId, p.index, !p.isDeferred);
        if (currentOwner.current === requestedOwner) setRevision((v) => v + 1);
      } catch {
        if (currentOwner.current === requestedOwner)
          setProgressError(t('problem:progress.saveFailed'));
      } finally {
        markBusy.current = false;
        if (currentOwner.current === requestedOwner) setSaving(null);
      }
    },
    [owner, t],
  );

  const handleSortChange = (newSortField: keyof ProblemForTable) => {
    const isAsc =
      filters.sortField === newSortField && filters.sortOrder === 'asc';
    setQueryParams({
      sortField: newSortField as string,
      sortOrder: isAsc ? 'desc' : 'asc',
      page: 1,
    });
  };

  const columns: Column<ProblemForTable>[] = useMemo(
    () => [
      ...(authenticated
        ? [
            {
              key: 'status',
              header: t('problem:progress.status'),
              accessor: 'status' as const,
              isSortable: false,
              render: (p: ProblemForTable) => (
                <div className="flex items-center gap-2">
                  <span>{t(`problem:progress.${p.status || 'none'}`)}</span>
                  {p.status !== 'solved' && (
                    <button
                      type="button"
                      className={styles.mark}
                      disabled={saving !== null}
                      aria-pressed={!!p.isDeferred}
                      title={t('problem:progress.deferHint')}
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleDeferred(p);
                      }}
                    >
                      {saving === p.id
                        ? '…'
                        : t(
                            `problem:progress.${p.isDeferred ? 'removeDeferred' : 'defer'}`,
                          )}
                    </button>
                  )}
                </div>
              ),
            },
          ]
        : []),
      {
        key: 'contestId',
        header: t('problem:tableHeaders.contest'),
        accessor: 'contestId',
      },
      {
        key: 'index',
        header: t('problem:tableHeaders.index'),
        accessor: 'index',
      },
      { key: 'name', header: t('problem:tableHeaders.name'), accessor: 'name' },
      {
        key: 'points',
        header: t('problem:tableHeaders.points'),
        accessor: 'points',
      },
      {
        key: 'rating',
        header: t('problem:tableHeaders.rating'),
        accessor: 'rating',
      },
      {
        key: 'difficulty',
        header: t('problem:tableHeaders.difficulty'),
        accessor: 'difficulty',
      },
      {
        key: 'solvedCount',
        header: t('problem:tableHeaders.solvedCount'),
        accessor: 'solvedCount',
      },
      {
        key: 'startTime',
        header: t('contest:tableHeaders.startTime'),
        accessor: 'startTime',
        render: (item) => unixToFormattedDate(item.startTime, t),
      },
      {
        key: 'rank',
        header: t('problem:tableHeaders.rank'),
        accessor: 'rank',
        isSortable: false,
      },
      {
        key: 'division',
        header: t('problem:tableHeaders.division'),
        accessor: 'division',
        isSortable: false,
      },
      {
        key: 'tags',
        header: t('problem:tableHeaders.tags'),
        accessor: 'tags',
        render: (p) => GetDivTagsList(p.tags),
        isSortable: false,
      },
    ],
    [t, authenticated, saving, toggleDeferred],
  );

  if (!isClient || !totalBounds || !currentBounds || !preferencesReady) {
    return <GizmoSpinner />;
  }

  return (
    <>
      <div className="flex flex-col md:flex-row gap-8 items-start mt-6">
        <div
          className={`filterSidebarShell ${isFiltersCollapsed ? 'filterSidebarShellCollapsed' : ''}`}
        >
          <FilterSidebar
            totalBounds={totalBounds}
            currentBounds={currentBounds}
            initialFilters={filters}
            onApply={(res) => {
              setQueryParams({
                ...res,
                tags: res.tags.length > 0 ? res.tags.join(',') : undefined,
                indexes:
                  res.indexes.length > 0 ? res.indexes.join(',') : undefined,
                divisions:
                  res.divisions.length > 0
                    ? res.divisions.join(',')
                    : undefined,
                ranks: res.ranks.length > 0 ? res.ranks.join(',') : undefined,
                page: 1,
              });
            }}
          />
          <button
            type="button"
            className="filterSidebarToggle"
            aria-label={
              isFiltersCollapsed ? 'Показать фильтры' : 'Скрыть фильтры'
            }
            aria-expanded={!isFiltersCollapsed}
            onClick={() => setIsFiltersCollapsed((collapsed) => !collapsed)}
          >
            <span aria-hidden="true">{isFiltersCollapsed ? '›' : '‹'}</span>
          </button>
        </div>

        <div className="flex-1 w-full">
          <h1 className="text-3xl w-full text-center font-bold mb-6">
            {t('problem:problemsTableTitle')}
          </h1>
          {authenticated ? (
            <>
              <div
                className={styles.toolbar}
                role="group"
                aria-label={t('problem:progress.filterLabel')}
              >
                {progressStatuses.map((status) => (
                  <button
                    type="button"
                    key={status}
                    className={`${styles.button} ${styles[status]}`}
                    aria-pressed={filters.statuses.includes(status)}
                    onClick={() => {
                      const selected = filters.statuses.includes(status)
                        ? filters.statuses.filter((s) => s !== status)
                        : [...filters.statuses, status];
                      setQueryParams({
                        statuses: selected.join(',') || undefined,
                        hideSolved: selected.includes('solved')
                          ? undefined
                          : filters.hideSolved || undefined,
                        page: 1,
                      });
                    }}
                  >
                    {t(`problem:progress.only${status}`)}
                  </button>
                ))}
                <button
                  type="button"
                  className={styles.button}
                  aria-pressed={filters.hideSolved}
                  onClick={() =>
                    setQueryParams({
                      hideSolved: !filters.hideSolved || undefined,
                      statuses:
                        filters.statuses
                          .filter((s) => s !== 'solved')
                          .join(',') || undefined,
                      page: 1,
                    })
                  }
                >
                  {t('problem:progress.hideSolved')}
                </button>
                {(filters.statuses.length > 0 || filters.hideSolved) && (
                  <button
                    type="button"
                    className={styles.button}
                    onClick={() =>
                      setQueryParams({
                        statuses: undefined,
                        hideSolved: undefined,
                        page: 1,
                      })
                    }
                  >
                    {t('problem:progress.showAll')}
                  </button>
                )}
                <button
                  type="button"
                  className={styles.button}
                  disabled={syncing}
                  onClick={() => refreshProgress()}
                >
                  {t(`problem:progress.${syncing ? 'syncing' : 'refresh'}`)}
                </button>
                {lastSync && (
                  <span className={styles.caption}>
                    {t('problem:progress.updated')}:{' '}
                    {new Date(lastSync).toLocaleString(i18n.language)}
                  </span>
                )}
              </div>
              {progressError && (
                <p role="alert" className={`${styles.message} ${styles.error}`}>
                  {progressError}
                </p>
              )}
            </>
          ) : (
            <p className={styles.message}>
              <button
                type="button"
                className={styles.button}
                onClick={openLogin}
              >
                {t('problem:progress.login')}
              </button>
            </p>
          )}
          <Table
            columns={columns}
            rowClassName={(p) =>
              authenticated ? styles[p.status as ProgressStatus] || '' : ''
            }
            data={(loadedOwner === owner ? problems : []).map((p) => ({
              ...p,
              id: `${p.contestId}-${p.index}`,
            }))}
            isLoading={isLoading || (loadedOwner !== owner && !error)}
            error={error}
            page={filters.page}
            maxPage={maxPage}
            onPageChange={(p) => setQueryParams({ page: p })}
            sortField={filters.sortField as keyof ProblemForTable}
            sortOrder={filters.sortOrder as SortOrder}
            onSortChange={handleSortChange}
            onRowClick={(p) =>
              window.open(
                `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`,
              )
            }
          />
        </div>
      </div>
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<GizmoSpinner />}>
      <ProblemClientPage />
    </Suspense>
  );
}
