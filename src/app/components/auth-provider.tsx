'use client';

import { createContext, useCallback, useContext, useEffect, useState, FormEvent, useRef } from 'react';
import { authRequest, Lookup, Session } from '../services/auth';
import { flushProblemPreferences } from '../services/problem-preferences';
import styles from './auth.module.css';

const guest: Session = { authenticated: false, handle: null, isAdmin: false };
interface AuthContextValue extends Session {
  loading: boolean;
  openLogin: () => void;
  logout: () => Promise<void>;
}
const AuthContext = createContext<AuthContextValue>({ ...guest, loading: true,
  openLogin: () => {}, logout: async () => {} });
export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session>(guest);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'handle' | 'confirm' | 'password'>('handle');
  const [handle, setHandle] = useState('');
  const [profile, setProfile] = useState<Lookup | null>(null);
  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  const [activationCode, setActivationCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setStep('handle'); setProfile(null); setPassword(''); setRepeat('');
    setActivationCode(''); setError('');
  }, []);
  const openLogin = useCallback(() => { reset(); setOpen(true); }, [reset]);
  useEffect(() => {
    let active = true;
    authRequest<Session>('me').then(value => {
      if (active) { setSession(value); if (!value.authenticated) setOpen(true); }
    }).catch(() => {
      if (active) { setOpen(true); setError('Не удалось проверить вход. Проверьте соединение с сервером.'); }
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    const refresh = () => authRequest<Session>('me').then(setSession).catch(() => setSession(guest));
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);
  useEffect(() => { if (open) inputRef.current?.focus(); }, [open, step]);

  const logout = async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      await flushProblemPreferences().catch(() => {});
      await authRequest('logout', {}); setSession(guest); reset();
    }
    catch (err) { setError((err as Error).message); setOpen(true); }
    finally { inFlight.current = false; }
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (inFlight.current) return;
    inFlight.current = true; setBusy(true); setError('');
    try {
      if (step === 'handle') {
        const value = await authRequest<Lookup>('lookup', { handle: handle.trim() });
        setProfile(value); setHandle(value.handle);
        setStep(value.hasPassword ? 'password' : 'confirm');
      } else if (step === 'password' && profile) {
        if (!profile.hasPassword && password !== repeat) throw new Error('Пароли не совпадают.');
        const value = await authRequest<Session>(profile.hasPassword ? 'login' : 'setup', {
          handle: profile.handle, password, confirmed: !profile.hasPassword, activationCode,
        });
        setSession(value); reset(); setOpen(false);
      }
    } catch (err) { setError((err as Error).message); }
    finally { inFlight.current = false; setBusy(false); }
  };

  return <AuthContext.Provider value={{ ...session, loading, openLogin, logout }}>
    {children}
    {open && <div className={styles.overlay}>
      <section role="dialog" aria-modal="true" aria-labelledby="auth-title" className={styles.dialog}>
        <h2 id="auth-title">{step === 'confirm' ? 'Это вы?' : step === 'password'
          ? profile?.hasPassword ? 'Введите пароль' : 'Создайте пароль' : 'Вход в ETRX'}</h2>
        <form onSubmit={submit}>
          {step === 'handle' && <label>Хэндл Codeforces
            <input ref={inputRef} value={handle} onChange={e => setHandle(e.target.value)}
              required maxLength={100} autoComplete="username" disabled={busy || loading} />
          </label>}
          {step === 'confirm' && <>
            <p><strong>{profile?.lastName} {profile?.firstName}</strong></p>
            <p>Хэндл: {profile?.handle}</p><p>Класс: {profile?.grade}</p>
            <button type="button" onClick={() => setStep('password')}>Да, это я</button>
            <button type="button" onClick={reset}>Нет, другой хэндл</button>
          </>}
          {step === 'password' && <>
            <p>Хэндл: <strong>{profile?.handle}</strong></p>
            <input type="text" value={profile?.handle || ''} autoComplete="username" readOnly hidden />
            <label>Пароль
              <input ref={inputRef} type="password" required minLength={10} maxLength={128}
                autoComplete={profile?.hasPassword ? 'current-password' : 'new-password'}
                value={password} onChange={e => setPassword(e.target.value)} disabled={busy} />
            </label>
            {!profile?.hasPassword && <label>Повторите пароль
              <input type="password" required minLength={10} maxLength={128} autoComplete="new-password"
                value={repeat} onChange={e => setRepeat(e.target.value)} disabled={busy} />
            </label>}
            {profile?.requiresActivationCode && <label>Код активации администратора
              <input type="password" required autoComplete="off" maxLength={512}
                value={activationCode} onChange={e => setActivationCode(e.target.value)} disabled={busy} />
            </label>}
            {!profile?.hasPassword && <p>От 10 до 128 символов. Сохраните пароль для следующих входов.</p>}
          </>}
          {error && <p role="alert" className={styles.error}>{error}</p>}
          {step !== 'confirm' && <button type="submit" disabled={busy || loading}>
            {busy ? 'Подождите…' : step === 'handle' ? 'Продолжить' : profile?.hasPassword ? 'Войти' : 'Создать пароль и войти'}
          </button>}
          {step === 'password' && <button type="button" disabled={busy} onClick={reset}>Другой хэндл</button>}
          <button type="button" disabled={busy} onClick={() => { reset(); setOpen(false); }}>Продолжить без входа</button>
        </form>
      </section>
    </div>}
  </AuthContext.Provider>;
}
