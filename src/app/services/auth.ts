import { getApiErrorMessage } from './api-errors';

export interface Session {
  authenticated: boolean;
  handle: string | null;
  isAdmin: boolean;
}
interface TokenSession extends Session {
  accessToken: string;
  expiresAt: string;
}
export interface Lookup {
  handle: string;
  hasPassword: boolean;
  firstName: string | null;
  lastName: string | null;
  grade: number | null;
  requiresActivationCode: boolean;
}

// Access tokens stay in this browser tab's memory. Only the server can read the refresh cookie.
let accessToken: string | null = null;
let expiresAt = 0;
let sessionVersion = 0;
let refreshing: Promise<Session | null> | null = null;
const guest: Session = { authenticated: false, handle: null, isAdmin: false };
const tokenRefreshBufferMilliseconds = 15 * 1000;
let currentSession: Session = guest;
const sessionListeners = new Set<(session: Session) => void>();

export function subscribeToSession(listener: (session: Session) => void) {
  sessionListeners.add(listener);
  return () => {
    sessionListeners.delete(listener);
  };
}

function publishSession(value: Session) {
  const accountChanged =
    currentSession.authenticated !== value.authenticated ||
    currentSession.handle?.toLowerCase() !== value.handle?.toLowerCase();
  if (accountChanged) sessionVersion++;
  const changed =
    accountChanged ||
    currentSession.isAdmin !== value.isAdmin ||
    currentSession.handle !== value.handle;
  currentSession = value;
  if (changed) sessionListeners.forEach((listener) => listener(value));
  return value;
}

async function withAuthLock<T>(operation: () => Promise<T>): Promise<T> {
  // Coordinate cookie rotation between tabs on the same frontend origin.
  if (typeof navigator !== 'undefined' && navigator.locks)
    return navigator.locks.request('etrx-auth', operation);
  return operation();
}

function rememberSession(value: TokenSession): Session {
  if (!value.accessToken || !Number.isFinite(Date.parse(value.expiresAt)))
    throw new Error('Сервер вернул некорректный токен входа.');
  accessToken = value.accessToken;
  expiresAt = Date.parse(value.expiresAt);
  return publishSession({
    authenticated: value.authenticated,
    handle: value.handle,
    isAdmin: value.isAdmin,
  });
}

function send(path: string, init: RequestInit = {}, token = accessToken) {
  const headers = new Headers(init.headers);
  headers.set('X-ETRX-Request', '1');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    ...init,
    headers,
    credentials: 'include',
    cache: 'no-store',
  });
}

async function refreshSession(): Promise<Session | null> {
  if (refreshing) return refreshing;
  const version = sessionVersion;
  const pending = withAuthLock(async () => {
    if (version !== sessionVersion) return null;
    const response = await send(
      '/api/auth/tokens/refresh',
      { method: 'POST' },
      null,
    );
    if (version !== sessionVersion) return null;
    if (response.status === 401) {
      accessToken = null;
      expiresAt = 0;
      publishSession(guest);
      return null;
    }
    if (!response.ok) throw await responseError(response);
    const value: TokenSession = await response.json();
    return version === sessionVersion ? rememberSession(value) : null;
  });
  refreshing = pending;
  try {
    return await pending;
  } finally {
    if (refreshing === pending) refreshing = null;
  }
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  const mayRefresh = !path.startsWith('/api/auth/');
  const version = sessionVersion;
  if (
    mayRefresh &&
    accessToken &&
    expiresAt <= Date.now() + tokenRefreshBufferMilliseconds
  )
    await refreshSession();
  if (version !== sessionVersion)
    throw new Error('Аккаунт изменился. Повторите запрос.');
  const usedToken = accessToken;
  const response = await send(path, init, usedToken);
  if (version !== sessionVersion)
    throw new Error('Аккаунт изменился. Повторите запрос.');
  if (response.status !== 401 || !mayRefresh) return response;
  // Another concurrent request may already have refreshed this tab's token.
  if (usedToken === accessToken && !(await refreshSession())) return response;
  if (version !== sessionVersion)
    throw new Error('Аккаунт изменился. Повторите запрос.');
  if (!accessToken) return response;
  const retry = await send(path, init);
  if (version !== sessionVersion)
    throw new Error('Аккаунт изменился. Повторите запрос.');
  return retry;
}

const authRoutes = {
  getSession: { path: 'session', method: 'GET' },
  logout: { path: 'session', method: 'DELETE' },
  lookup: { path: 'user-queries', method: 'POST' },
  setup: { path: 'credentials', method: 'POST' },
  login: { path: 'sessions', method: 'POST' },
} as const;

async function responseError(response: Response) {
  const data = await response.json().catch(() => null);
  return new Error(
    getApiErrorMessage(
      data,
      response.status === 429
        ? 'Слишком много попыток. Подождите и повторите вход.'
        : `Ошибка запроса: ${response.status}`,
    ),
  );
}

export async function authRequest<T>(
  action: keyof typeof authRoutes,
  payload?: unknown,
): Promise<T> {
  const route = authRoutes[action];
  if (!route) throw new Error(`Unknown authentication action: ${action}`);
  if (
    action === 'getSession' &&
    (!accessToken || expiresAt <= Date.now() + tokenRefreshBufferMilliseconds)
  )
    return ((await refreshSession()) ?? guest) as T;
  const changesSession =
    action === 'logout' || action === 'login' || action === 'setup';
  if (changesSession) {
    // Finish an already started cookie rotation before changing accounts.
    if (refreshing) await refreshing.catch(() => null);
    sessionVersion++;
  }
  const execute = async (): Promise<T> => {
    const response = await send(`/api/auth/${route.path}`, {
      method: route.method,
      ...(route.method === 'POST'
        ? {
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }
        : {}),
    });
    if (!response.ok) throw await responseError(response);
    if (action === 'logout') {
      accessToken = null;
      expiresAt = 0;
      publishSession(guest);
      return undefined as T;
    }
    const value = await response.json();
    if (action === 'login' || action === 'setup')
      return rememberSession(value) as T;
    if (action === 'getSession' && !value.authenticated)
      return ((await refreshSession()) ?? guest) as T;
    return action === 'getSession' ? (publishSession(value) as T) : value;
  };
  return changesSession ? withAuthLock(execute) : execute();
}
