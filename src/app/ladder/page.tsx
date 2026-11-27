'use client';

import { useEffect, useState } from 'react';
import useSWRInfinite from 'swr/infinite';
import { useProblemPreferences } from '@/hooks/useProblemPreferences';
import { ladderPreferencesStore } from '../services/ladder-preferences';
import { useAuth } from '../components/auth-provider';
import { apiFetch } from '../services/auth';
import { syncProgress } from '../services/problems';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import {
  fetchLadderData,
  Ladder,
  ladderApi,
  LadderLevel,
  problemUrl,
  participantReportUrl,
} from '../services/ladder';
import styles from './page.module.css';
import progressStyles from '../problem/progress.module.css';

async function fetchAccountLadder([url]: readonly [
  string,
  string | null,
  string | null,
]): Promise<Ladder> {
  const response = await apiFetch('/api/ladder' + url.slice(ladderApi.length));
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export default function LadderPage() {
  const { t, i18n } = useTranslation();
  const { authenticated, handle, loading: authLoading } = useAuth();
  const owner = authenticated ? handle : null;
  const progress = useSWR(
    !authLoading && owner ? ['ladder-progress-sync', owner] : null,
    () => syncProgress(),
    { refreshInterval: 60_000 },
  );
  const progressRevision = progress.data?.lastSuccessAt ?? null;
  const {
    searchParams: params,
    setQueryParams,
    ready: preferencesReady,
  } = useProblemPreferences(
    authenticated ? handle : null,
    authLoading,
    ladderPreferencesStore,
  );
  const division = params.get('division') || '';
  const difficulty = params.get('difficulty') || '';
  const selectedTags = params.getAll('tags');
  const rating = params.get('rating') || '';
  const ratingQuery = new URLSearchParams({ division });
  const ratings = useSWR(
    preferencesReady && division ? ladderApi + '/ratings?' + ratingQuery : null,
    fetchLadderData<number[]>,
  );
  useEffect(() => {
    if (
      preferencesReady &&
      ratings.data &&
      rating &&
      !ratings.data.includes(Number(rating))
    ) {
      setQueryParams({ rating: null });
    }
  }, [preferencesReady, ratings.data, rating, setQueryParams]);
  const levels = useSWR(ladderApi + '/levels', fetchLadderData<LadderLevel[]>);
  const difficultyQuery = new URLSearchParams({ division });
  if (rating) difficultyQuery.set('rating', rating);
  const difficulties = useSWR(
    preferencesReady && division
      ? ladderApi + '/difficulties?' + difficultyQuery
      : null,
    fetchLadderData<number[]>,
  );
  useEffect(() => {
    if (
      preferencesReady &&
      difficulties.data &&
      difficulty &&
      !difficulties.data.includes(Number(difficulty))
    ) {
      setQueryParams({ difficulty: null });
    }
  }, [preferencesReady, difficulties.data, difficulty, setQueryParams]);
  const query = new URLSearchParams(params.toString());
  query.set('lang', i18n.language || 'ru');
  const selection = query.toString();
  const ladder = useSWRInfinite(
    (page, previous: Ladder | null) => {
      if (
        authLoading ||
        !preferencesReady ||
        !division ||
        (previous && previous.groups.length < 8)
      )
        return null;
      const pageQuery = new URLSearchParams(selection);
      pageQuery.set('groupOffset', String(page * 8));
      pageQuery.set('groupLimit', '8');
      pageQuery.set('includeProblems', 'false');
      return [ladderApi + '?' + pageQuery, owner, progressRevision] as const;
    },
    fetchAccountLadder,
    { revalidateFirstPage: false, persistSize: false },
  );
  const firstPage = ladder.data?.[0];
  const groups = ladder.data?.flatMap((page) => page.groups) || [];
  const loadingMore =
    ladder.isValidating ||
    Boolean(ladder.data && !ladder.data[ladder.size - 1]);
  const divisions = [...new Set(levels.data?.map((level) => level.division))];

  function changeFilter(key: string, value: string) {
    if (key === 'tags') {
      const tags = params.getAll('tags');
      setQueryParams({
        tags: tags.includes(value)
          ? tags.filter((tag) => tag !== value)
          : [...tags, value],
      });
    } else {
      setQueryParams({
        [key]: value,
        tags: null,
        ...(key === 'division' ? { rating: null } : {}),
        ...(key === 'division' ? { difficulty: null } : {}),
      });
    }
  }

  return (
    <main className={styles.page}>
      <h1>{t('header:ladder')}</h1>
      {owner && (progress.error || progress.data?.success === false) && (
        <p role="alert">
          {t('problem:progress.syncFailed')}{' '}
          <button className="underline" onClick={() => void progress.mutate()}>
            {t('problem:progress.retry')}
          </button>
        </p>
      )}
      <fieldset className={styles.filters} disabled={!preferencesReady}>
        <label>
          {t('problem:tableHeaders.division')}
          <select
            value={division}
            onChange={(e) => changeFilter('division', e.target.value)}
          >
            <option value="">{t('ladder:choose')}</option>
            {divisions.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label>
          {t('problem:tableHeaders.rating')}
          <select
            disabled={!division || ratings.isLoading || Boolean(ratings.error)}
            value={rating}
            onChange={(e) => changeFilter('rating', e.target.value)}
          >
            <option value="">{t('ladder:anyRating')}</option>
            {ratings.data?.map((value) => (
              <option key={value} value={value}>
                {value || t('ladder:noRating')}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t('problem:tableHeaders.difficulty')}
          <select
            disabled={
              !division || difficulties.isLoading || Boolean(difficulties.error)
            }
            value={difficulty}
            onChange={(e) => changeFilter('difficulty', e.target.value)}
          >
            <option value="">{t('ladder:anyDifficulty')}</option>
            {difficulties.data?.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
      </fieldset>
      {(levels.error ||
        ratings.error ||
        difficulties.error ||
        ladder.error) && (
        <p role="alert">
          {t('ladder:error')}{' '}
          <button
            className="underline"
            onClick={() =>
              void (levels.error
                ? levels.mutate()
                : ratings.error
                  ? ratings.mutate()
                  : difficulties.error
                    ? difficulties.mutate()
                    : ladder.mutate())
            }
          >
            {t('problem:progress.retry')}
          </button>
        </p>
      )}
      {(!preferencesReady ||
        levels.isLoading ||
        ratings.isLoading ||
        difficulties.isLoading ||
        ladder.isLoading) && <p role="status">{t('ladder:loading')}</p>}
      {levels.data?.length === 0 && <p>{t('ladder:noLevels')}</p>}
      {Boolean(levels.data?.length) && !division && (
        <p>{t('ladder:selectLevel')}</p>
      )}
      {preferencesReady && firstPage && (
        <>
          <fieldset className={styles.tags}>
            <legend>{t('problem:filters.tags')}</legend>
            {firstPage.availableTags.map((tag) => (
              <label key={tag.name}>
                <input
                  type="checkbox"
                  checked={selectedTags.includes(tag.name)}
                  onChange={() => changeFilter('tags', tag.name)}
                />{' '}
                {tag.name} ({tag.priority})
              </label>
            ))}
          </fieldset>
          <p className={styles.stats}>
            <a
              href={participantReportUrl(selection)}
              target="_blank"
              rel="noreferrer"
            >
              {t('ladder:statistics')}
            </a>
          </p>
          {groups.length === 0 && <p>{t('ladder:empty')}</p>}
          {groups.map((group, index) => (
            <ProblemGroup
              key={owner + ':' + selection + JSON.stringify(group.tags)}
              group={group}
              selection={selection}
              index={index}
              owner={owner}
              progressRevision={progressRevision}
            />
          ))}
          {groups.length < (firstPage.totalGroups || 0) && (
            <button
              className={styles.loadMore}
              type="button"
              disabled={loadingMore}
              onClick={() => void ladder.setSize(ladder.size + 1)}
            >
              {loadingMore ? t('ladder:loading') : t('ladder:loadMore')}
            </button>
          )}
        </>
      )}
    </main>
  );
}

function ProblemGroup({
  group,
  selection,
  index,
  owner,
  progressRevision,
}: {
  group: Ladder['groups'][number];
  selection: string;
  index: number;
  owner: string | null;
  progressRevision: string | null;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const query = new URLSearchParams(selection);
  query.set('groupOffset', String(index));
  query.set('groupLimit', '1');
  query.set('includeProblems', 'true');
  const { data, error, isLoading, mutate } = useSWR(
    open ? ([ladderApi + '?' + query, owner, progressRevision] as const) : null,
    fetchAccountLadder,
  );
  const branch = data?.groups[0] ?? group;
  const solvedCount = owner ? branch.solvedCount : 0;
  const failedCount = owner ? branch.failedCount : 0;
  const completed =
    branch.problemCount > 0 && solvedCount === branch.problemCount;
  return (
    <details
      className={styles.group}
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary
        className={
          completed
            ? progressStyles.solved
            : failedCount > 0
              ? progressStyles.failed
              : undefined
        }
      >
        {group.tags.join(' + ') || t('ladder:noTags')} ({group.problemCount})
        {owner && (
          <span className={styles.completion}>
            {' · '}
            {t('ladder:completed', {
              count: solvedCount,
              total: branch.problemCount,
            })}
            {completed && ' ✓'}
            {failedCount > 0 && (
              <> · {t('ladder:failedCount', { count: failedCount })}</>
            )}
          </span>
        )}
      </summary>
      {open && (
        <>
          <p className={styles.stats}>
            <a
              href={participantReportUrl(selection, group.tags)}
              target="_blank"
              rel="noreferrer"
            >
              {t('ladder:branchStatistics')}
            </a>
          </p>
          {isLoading && <p role="status">{t('ladder:loading')}</p>}
          {error && (
            <p role="alert">
              {t('ladder:error')}{' '}
              <button className="underline" onClick={() => void mutate()}>
                {t('problem:progress.retry')}
              </button>
            </p>
          )}
          {data && (
            <table>
              <thead>
                <tr>
                  <th>{t('problem:tableHeaders.name')}</th>
                  <th>{t('problem:tableHeaders.rating')}</th>
                  <th>{t('problem:tableHeaders.solvedCount')}</th>
                </tr>
              </thead>
              <tbody>
                {(data?.groups[0]?.problems || []).map((problem) => (
                  <tr
                    key={problem.contestId + '/' + problem.index}
                    className={
                      owner && problem.isSolved
                        ? progressStyles.solved
                        : owner && problem.status === 'failed'
                          ? progressStyles.failed
                          : undefined
                    }
                  >
                    <td>
                      <a
                        href={problemUrl(problem)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {problem.contestId}
                        {problem.index} · {problem.name}
                        {owner && problem.isSolved && (
                          <span
                            title={t('problem:progress.solved')}
                            aria-label={t('problem:progress.solved')}
                          >
                            {' '}
                            ✓
                          </span>
                        )}
                        {owner &&
                          !problem.isSolved &&
                          problem.status === 'failed' && (
                            <span
                              title={t('problem:progress.failed')}
                              aria-label={t('problem:progress.failed')}
                            >
                              {' '}
                              ✗
                            </span>
                          )}
                      </a>
                    </td>
                    <td>{problem.rating || '—'}</td>
                    <td>{problem.solvedCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </details>
  );
}
