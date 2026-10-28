export interface Session {
  authenticated: boolean;
  handle: string | null;
  isAdmin: boolean;
}
export interface Lookup {
  handle: string;
  hasPassword: boolean;
  firstName: string | null;
  lastName: string | null;
  grade: number | null;
  requiresActivationCode: boolean;
}
export function apiFetch(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set('X-ETRX-Request', '1');
  return fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    ...init, headers, credentials: 'include', cache: 'no-store',
  });
}
export async function authRequest<T>(path: string, payload?: unknown): Promise<T> {
  const response = await apiFetch(`/api/auth/${path}`, payload === undefined ? {} : {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || (response.status === 429
      ? 'Слишком много попыток. Подождите и повторите вход.'
      : `Ошибка запроса: ${response.status}`));
  }
  return response.status === 204 ? undefined as T : response.json();
}
