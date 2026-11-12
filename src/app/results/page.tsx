'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import GizmoSpinner from '@/app/components/gizmo-spinner';
import { useQueryState } from '@/hooks/useQueryState';
import { divisions, loadResults, UserDivisionMatrix, UserTypeMatrix, TaskDetail } from '@/app/services/results';
import styles from './results.module.css';

type View = 'matrix' | 'types' | 'tasks';
type SortDirection = 'asc' | 'desc';

function dateDefaults() {
  const now = new Date(Date.now() + 3 * 60 * 60 * 1000);
  return {
    fyear: now.getUTCFullYear(), fmonth: now.getUTCMonth() + 1, fday: now.getUTCDate(),
    tyear: now.getUTCFullYear(), tmonth: now.getUTCMonth() + 1, tday: now.getUTCDate(),
    division: 'ALL',
  };
}
function inputDate(params: URLSearchParams, prefix: string) {
  return `${params.get(`${prefix}year`)}-${params.get(`${prefix}month`)?.padStart(2, '0')}-${params.get(`${prefix}day`)?.padStart(2, '0')}`;
}
function ResultsClientPage() {
  const defaults = useMemo(() => dateDefaults(), []);
  const { searchParams, setQueryParams } = useQueryState(defaults);
  const [matrix, setMatrix] = useState<UserDivisionMatrix[]>([]);
  const [typeRows, setTypeRows] = useState<UserTypeMatrix[]>([]);
  const [tasks, setTasks] = useState<TaskDetail[]>([]);
  const [view, setView] = useState<View>('matrix');
  const [selectedDivision, setSelectedDivision] = useState('ALL');
  const [selectedType, setSelectedType] = useState('CONTESTANT');
  const [selectedUser, setSelectedUser] = useState<{handle: string; name: string} | null>(null);
  const [sortKey, setSortKey] = useState('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [detailError, setDetailError] = useState<Error | null>(null);
  const [tasksError, setTasksError] = useState<Error | null>(null);
  const [revision, setRevision] = useState(0);

  const period = new URLSearchParams();
  for (const key of ['fyear','fmonth','fday','tyear','tmonth','tday'] as const)
    period.set(key, searchParams.get(key) ?? String(defaults[key]));
  const contestId = searchParams.get('contestid');
  if (contestId) period.set('contestId', contestId);
  const periodQuery = period.toString();
  const fromDate = inputDate(period, 'f');
  const toDate = inputDate(period, 't');
  const invalidPeriod = fromDate > toDate;
  const division = searchParams.get('division') || 'ALL';
  const divisionLabel = divisions.find((item) => item.value === selectedDivision)?.label ?? selectedDivision;

  useEffect(() => {
    const controller = new AbortController();
    setMatrix([]); setError(null);
    if (invalidPeriod) {
      setError(new Error('Начальная дата должна быть не позже конечной.'));
      setLoading(false);
      return () => controller.abort();
    }
    setLoading(true);
    void loadResults<UserDivisionMatrix>('results-matrix', periodQuery, controller.signal)
      .then((data) => { if (!controller.signal.aborted) setMatrix(data); })
      .catch((err: Error) => { if (!controller.signal.aborted) setError(err); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [periodQuery, invalidPeriod, revision]);

  useEffect(() => {
    if (view !== 'types') return;
    const controller = new AbortController();
    setTypeRows([]); setDetailError(null); setDetailLoading(true);
    void loadResults<UserTypeMatrix>('results-by-type',
      `${periodQuery}&${new URLSearchParams({ division: selectedDivision })}`, controller.signal)
      .then((data) => { if (!controller.signal.aborted) setTypeRows(data); })
      .catch((err: Error) => { if (!controller.signal.aborted) setDetailError(err); })
      .finally(() => { if (!controller.signal.aborted) setDetailLoading(false); });
    return () => controller.abort();
  }, [periodQuery, selectedDivision, view, revision]);

  useEffect(() => {
    if (view !== 'tasks' || !selectedUser) return;
    const controller = new AbortController();
    setTasks([]); setTasksError(null); setTasksLoading(true);
    const params = new URLSearchParams(periodQuery);
    params.set('division', selectedDivision);
    params.set('participantType', selectedType);
    void loadResults<TaskDetail>(`results-tasks/${encodeURIComponent(selectedUser.handle)}`,
      params.toString(), controller.signal)
      .then((data) => { if (!controller.signal.aborted) setTasks(data); })
      .catch((err: Error) => { if (!controller.signal.aborted) setTasksError(err); })
      .finally(() => { if (!controller.signal.aborted) setTasksLoading(false); });
    return () => controller.abort();
  }, [periodQuery, selectedDivision, selectedType, selectedUser, view, revision]);

  function changeDate(prefix: 'f' | 't', value: string) {
    if (!value) return;
    const [year, month, day] = value.split('-').map(Number);
    setQueryParams({ [`${prefix}year`]: year, [`${prefix}month`]: month, [`${prefix}day`]: day });
  }
  function toggleSort(key: string) {
    if (sortKey === key) setSortDirection((direction) => direction === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDirection(key === 'name' ? 'asc' : 'desc'); }
  }
  function sorted<T extends object>(rows: T[]) {
    return [...rows].sort((left, right) => {
      const a = left as Record<string, unknown>;
      const b = right as Record<string, unknown>;
      const av = a[sortKey]; const bv = b[sortKey];
      const compare = typeof av === 'number' && typeof bv === 'number'
        ? av - bv
        : String(av ?? '').localeCompare(String(bv ?? ''), 'ru', { sensitivity: 'base' });
      return sortDirection === 'asc' ? compare : -compare;
    });
  }
  const nameCell = (handle: string, name: string) => (
    <a href={`https://codeforces.com/profile/${encodeURIComponent(handle)}`}
      target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
      {name || handle}
    </a>
  );
  const matrixFields: { key: keyof UserDivisionMatrix; label: string; value: string }[] = [
    { key: 'div1', label: 'Div 1', value: 'Div1' },
    { key: 'div2', label: 'Div 2', value: 'Div2' },
    { key: 'div3', label: 'Div 3', value: 'Div3' },
    { key: 'div4', label: 'Div 4', value: 'Div4' },
    { key: 'all', label: 'Всего', value: 'ALL' },
  ];
  const typeFields: { key: keyof UserTypeMatrix; label: string; value: string }[] = [
    { key: 'contestant', label: 'По контестам', value: 'CONTESTANT' },
    { key: 'virtual', label: 'Виртуальные контесты', value: 'VIRTUAL' },
    { key: 'outOfCompetition', label: 'Вне конкурса', value: 'OUT_OF_COMPETITION' },
    { key: 'practice', label: 'Дорешивание', value: 'PRACTICE' },
    { key: 'total', label: 'Всего', value: 'ALL' },
  ];
  const sortButton = (key: string, label: string, onLabel?: () => void) => (
    <span className={styles.headerControls}>
      {onLabel ? <button type="button" onClick={onLabel}>{label}</button> : label}
      <button type="button" className={styles.sortButton} onClick={() => toggleSort(key)}
        aria-label={`Сортировать ${label}`} title="Изменить сортировку">
        {sortKey === key ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
      </button>
    </span>
  );

  return (
    <main className={styles.page}>
      <h1 className="my-5 text-center text-3xl font-bold">Таблицы результатов</h1>
      <div className={styles.filters}>
        <label>С даты <input type="date" value={fromDate} onChange={(e) => changeDate('f', e.target.value)} /></label>
        <label>По дату <input type="date" value={toDate} onChange={(e) => changeDate('t', e.target.value)} /></label>
        <label>Контест <input type="number" min="1" step="1" value={contestId ?? ''} placeholder="Все"
          onChange={(e) => setQueryParams({ contestid: e.target.value || null })} /></label>
        <button type="button" className={styles.refresh} onClick={() => setRevision((v) => v + 1)}>Обновить</button>
        <Link href={`/protocol?${periodQuery.toLowerCase()}`} className="underline">К протоколам</Link>
      </div>

      {view !== 'matrix' && <button type="button" className={styles.back}
        onClick={() => { setView(view === 'tasks' ? 'types' : 'matrix'); setSortKey('name'); setSortDirection('asc'); }}>
        ← {view === 'tasks' ? 'К таблице по типам участия' : 'К таблице дивизионов'}
      </button>}

      {view === 'matrix' && <>
        <h2 className="mb-2 mt-6 text-xl font-bold">Результаты по дивизионам</h2>
        <p className="mb-3 text-sm">Нажмите на название DIV, чтобы открыть разбивку по типу участия. Стрелками можно сортировать столбцы.</p>
        <div className={styles.scroll} aria-busy={loading}>
          {loading ? <GizmoSpinner /> : error ? <p role="alert" className="py-6 text-red-500">{error.message}</p> : (
            <table className={styles.summary}>
              <thead><tr>
                <th scope="col">{sortButton('name', 'Фамилия, имя')}</th>
                {matrixFields.map((field) => <th scope="col" key={field.value}>
                  {sortButton(field.key, field.label, () => {
                    setSelectedDivision(field.value); setView('types'); setSortKey('name'); setSortDirection('asc');
                  })}
                </th>)}
              </tr></thead>
              <tbody>
                {sorted(matrix).map((row) => <tr key={row.handle}>
                  <th scope="row">{nameCell(row.handle, row.name)}</th>
                  {matrixFields.map((field) => <td key={field.value}>{row[field.key]}</td>)}
                </tr>)}
                {matrix.length === 0 && <tr><td colSpan={6}>Нет данных для отображения</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </>}

      {view === 'types' && <>
        <h2 className="mb-2 mt-6 text-xl font-bold">Детализация: {divisionLabel}</h2>
        <p className="mb-3 text-sm">Нажмите на количество задач, чтобы увидеть конкретные задачи участника. Стрелками сортируется каждый столбец.</p>
        <div className={styles.scroll} aria-busy={detailLoading}>
          {detailLoading ? <GizmoSpinner /> : detailError ? <p role="alert" className="text-red-500">{detailError.message}</p> : (
            <table className={styles.summary}>
              <thead><tr>
                <th scope="col">{sortButton('name', 'Фамилия, имя')}</th>
                {typeFields.map((field) => <th scope="col" key={field.key}>{sortButton(field.key, field.label)}</th>)}
              </tr></thead>
              <tbody>
                {sorted(typeRows).map((row) => <tr key={row.handle}>
                  <th scope="row">{nameCell(row.handle, row.name)}</th>
                  {typeFields.map((field) => <td key={field.key}>
                    <button type="button" className={styles.cellLink}
                      disabled={row[field.key] === 0}
                      onClick={() => {
                        setSelectedUser({ handle: row.handle, name: row.name });
                        setSelectedType(field.value);
                        setView('tasks'); setSortKey('contestId'); setSortDirection('asc');
                      }}>{row[field.key]}</button>
                  </td>)}
                </tr>)}
                {typeRows.length === 0 && <tr><td colSpan={6}>Нет данных для отображения</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </>}

      {view === 'tasks' && selectedUser && <>
        <h2 className="mb-2 mt-6 text-xl font-bold">Задачи: {selectedUser.name || selectedUser.handle}</h2>
        <p className="mb-3 text-sm">Решённые задачи по выбранной категории. Нажмите на задачу, чтобы открыть её на Codeforces.</p>
        <div className={styles.scroll} aria-busy={tasksLoading}>
          {tasksLoading ? <GizmoSpinner /> : tasksError ? <p role="alert" className="text-red-500">{tasksError.message}</p> : (
            <table className={styles.summary}>
              <thead><tr>
                <th scope="col">{sortButton('index', 'Задача')}</th>
                <th scope="col">{sortButton('contestId', 'Контест')}</th>
                <th scope="col">{sortButton('problemRating', 'Рейтинг задачи')}</th>
              </tr></thead>
              <tbody>
                {sorted(tasks).map((task) => <tr key={`${task.contestId}-${task.index}`}>
                  <th scope="row"><a className="text-blue-600 underline" target="_blank" rel="noopener noreferrer"
                    href={`https://codeforces.com/contest/${task.contestId}/problem/${encodeURIComponent(task.index)}`}>
                    {task.index}
                  </a></th>
                  <td><a className="text-blue-600 underline" target="_blank" rel="noopener noreferrer"
                    href={`https://codeforces.com/contest/${task.contestId}`}>{task.contestId}</a></td>
                  <td>{task.problemRating ?? '—'}</td>
                </tr>)}
                {tasks.length === 0 && <tr><td colSpan={3}>Нет решённых задач в этой категории</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </>}
    </main>
  );
}
export default function ResultsPage() {
  return <Suspense fallback={<GizmoSpinner />}><ResultsClientPage /></Suspense>;
}
