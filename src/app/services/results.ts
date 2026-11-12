export type Division = 'ALL' | 'Div1' | 'Div2' | 'Div3' | 'Div4';
export type ParticipantType =
  'CONTESTANT' | 'VIRTUAL' | 'OUT_OF_COMPETITION' | 'PRACTICE';

export interface ParticipantResult {
  handle: string;
  name: string;
  rating: number;
  solvedCount: number;
  ratedProblemCount: number;
  averageProblemRating: number;
}

export interface SummaryCell {
  participantType: ParticipantType;
  division: Division;
  solvedCount: number;
  participantCount: number;
}

export const divisions: { value: Division; label: string }[] = [
  { value: 'ALL', label: 'Всего' },
  { value: 'Div1', label: 'Div 1' },
  { value: 'Div2', label: 'Div 2' },
  { value: 'Div3', label: 'Div 3' },
  { value: 'Div4', label: 'Div 4' },
];

export const participantTypes: { value: ParticipantType; label: string }[] = [
  { value: 'CONTESTANT', label: 'По контестам' },
  { value: 'VIRTUAL', label: 'Виртуальные контесты' },
  { value: 'OUT_OF_COMPETITION', label: 'Вне конкурса' },
  { value: 'PRACTICE', label: 'Дорешивание' },
];

export async function loadResults<T>(
  endpoint: string,
  params: string,
  signal: AbortSignal,
): Promise<T[]> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/submissions/${endpoint}?${params}`, {
    signal,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const validation = body?.errors
      ? Object.values(body.errors).flat().join(' ')
      : null;
    throw new Error(
      body?.message ||
        validation ||
        `Не удалось загрузить результаты: HTTP ${response.status}`,
    );
  }
  const data: unknown = await response.json();
  if (!Array.isArray(data))
    throw new Error('Сервер вернул неверный формат результатов.');
  return data as T[];
}

export interface UserDivisionMatrix {
  handle: string; name: string; rating: number;
  all: number; div1: number; div2: number; div3: number; div4: number;
}
export interface UserTypeMatrix {
  handle: string; name: string; rating: number;
  contestant: number; virtual: number; outOfCompetition: number; practice: number; total: number;
}

export interface TaskDetail {
  handle: string;
  index: string;
  contestId: number;
  problemRating: number | null;
}
