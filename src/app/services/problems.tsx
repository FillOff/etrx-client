'use client';

import { GetProblemsArgs } from '../models/GetProblemsArgs';
import { apiFetch } from './auth';

function buildParams(args: Partial<GetProblemsArgs>): URLSearchParams {
  const params = new URLSearchParams();

  if (args['Pagination.Page'])
    params.append('Pagination.Page', args['Pagination.Page'].toString());
  if (args['Pagination.PageSize'])
    params.append(
      'Pagination.PageSize',
      args['Pagination.PageSize'].toString(),
    );

  args['Filters.AvailableTags']?.forEach((tag) =>
    params.append('Filters.AvailableTags', tag),
  );
  args['Filters.AvailableIndexes']?.forEach((idx) =>
    params.append('Filters.AvailableIndexes', idx),
  );
  args['Filters.AvailableDivisions']?.forEach((div) =>
    params.append('Filters.AvailableDivisions', div),
  );
  args['Filters.AvailableRanks']?.forEach((rank) =>
    params.append('Filters.AvailableRanks', rank),
  );

  const numFilters: (keyof GetProblemsArgs)[] = [
    'Filters.MinRating',
    'Filters.MaxRating',
    'Filters.MinPoints',
    'Filters.MaxPoints',
    'Filters.MinSolved',
    'Filters.MaxSolved',
    'Filters.MinDifficulty',
    'Filters.MaxDifficulty',
  ];

  numFilters.forEach((key) => {
    if (args[key] !== undefined && args[key] !== null) {
      params.append(key, args[key]!.toString());
    }
  });

  if (args['Sorting.SortField'])
    params.append('Sorting.SortField', args['Sorting.SortField']);
  if (args['Sorting.SortOrder'])
    params.append('Sorting.SortOrder', args['Sorting.SortOrder']);

  if (args.ProblemName) params.append('ProblemName', args.ProblemName);
  if (args.IsOnly !== undefined)
    params.append('IsOnly', args.IsOnly.toString());
  params.append('Lang', args.Lang || 'ru');
  args.Statuses?.forEach((status) => params.append('Statuses', status));
  if (args.HideSolved) params.append('HideSolved', 'true');

  return params;
}

export async function getProblems(args: GetProblemsArgs, signal?: AbortSignal) {
  const params = buildParams(args);
  return apiFetch(`/api/problems?${params.toString()}`, {
    signal,
    redirect: 'error',
  });
}

export async function getFilters(
  args: Partial<GetProblemsArgs> = {},
  signal?: AbortSignal,
) {
  const params = buildParams(args);
  return apiFetch(`/api/problems/filters?${params.toString()}`, {
    signal,
    redirect: 'error',
  });
}

export interface ProgressSyncResult {
  success: boolean;
  lastSuccessAt: string | null;
  message: string | null;
  skipped: boolean;
}

export async function syncProgress(
  signal?: AbortSignal,
): Promise<ProgressSyncResult> {
  const response = await apiFetch('/api/problems/progress/sync', {
    method: 'POST',
    signal,
  });
  if (!response.ok) throw new Error(`Ошибка синхронизации: ${response.status}`);
  return response.json();
}

export async function setProblemDeferred(
  contestId: number,
  index: string,
  deferred: boolean,
) {
  const response = await apiFetch(
    `/api/problems/progress/${contestId}/${encodeURIComponent(index)}/deferred`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deferred }),
    },
  );
  if (!response.ok)
    throw new Error(`Не удалось сохранить отметку: ${response.status}`);
}
