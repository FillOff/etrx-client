export interface LadderLevel {
  division: string;
  difficulty: number;
}

export interface LadderProblem {
  contestId: number;
  index: string;
  name: string;
  rating: number;
  solvedCount: number;
  gym: boolean;
  source: string;
  isSolved: boolean;
  status: 'none' | 'solved' | 'failed' | 'deferred';
}

export interface Ladder {
  availableTags: { name: string; priority: number }[];
  groups: {
    tags: string[];
    problems: LadderProblem[];
    problemCount: number;
    solvedCount: number;
    failedCount: number;
  }[];
  totalGroups: number;
}

export const ladderApi = `${process.env.NEXT_PUBLIC_API_URL}/api/ladder`;

export function participantReportUrl(selection: string, branchTags?: string[]) {
  const query = new URLSearchParams(selection);
  for (const key of [
    'groupOffset',
    'groupLimit',
    'includeProblems',
    'exactTags',
  ])
    query.delete(key);
  if (branchTags !== undefined) {
    query.delete('tags');
    for (const tag of branchTags) query.append('tags', tag);
    query.set('exactTags', 'true');
  }
  return `${ladderApi}/participants?${query}`;
}

export async function fetchLadderData<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export function problemUrl(problem: LadderProblem) {
  const index = encodeURIComponent(problem.index);
  if (problem.source === 'IOI')
    return `https://ioi.contest.codeforces.com/group/32KGsXgiKA/contest/${problem.contestId}/problem/${index}`;
  if (problem.gym)
    return `https://codeforces.com/gym/${problem.contestId}/problem/${index}`;
  return `https://codeforces.com/problemset/problem/${problem.contestId}/${index}`;
}
