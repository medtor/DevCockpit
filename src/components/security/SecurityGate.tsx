import React, { useState } from 'react';
import { LockKeyhole, ShieldCheck } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useDataStore } from '../../store/useDataStore';
import { Button } from '../../components/ui/Button';

export const SecurityGate: React.FC = () => {
  const securityStatus = useAppStore((state) => state.securityStatus);
  const { unlockStorage, initializeSecureStorage } = useDataStore();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const creating = securityStatus === 'setup' || securityStatus === 'migration';
  const migrating = securityStatus === 'migration';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (creating) await initializeSecureStorage(password, confirmation);
      else await unlockStorage(password);
      setPassword('');
      setConfirmation('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to unlock local data');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-4 dark:bg-zinc-950">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-5 rounded-2xl border border-zinc-200 bg-white p-7 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-600 dark:text-emerald-400">
            {creating ? <ShieldCheck className="h-6 w-6" /> : <LockKeyhole className="h-6 w-6" />}
          </div>
          <div>
            <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {securityStatus === 'loading' ? 'Preparing secure storage' : creating ? 'Protect your workspace' : 'Unlock your workspace'}
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Local data is encrypted on this device.</p>
          </div>
        </div>

        {securityStatus === 'loading' || securityStatus === 'locking' ? (
          <p className="text-sm text-zinc-500">{securityStatus === 'locking' ? 'Saving encrypted data and locking…' : 'Checking local storage…'}</p>
        ) : securityStatus === 'error' ? (
          <p role="alert" className="text-sm text-red-600">Local storage could not be inspected safely. Reload after checking browser storage permissions; existing data was not changed.</p>
        ) : (
          <>
            {migrating && (
              <p className="rounded-lg bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-300">
                Existing local data was found. It will be encrypted before the plaintext copy is removed.
              </p>
            )}
            <label className="block space-y-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              <span>Master password</span>
              <input
                autoFocus
                required
                minLength={creating ? 12 : undefined}
                type="password"
                autoComplete={creating ? 'new-password' : 'current-password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </label>
            {creating && (
              <label className="block space-y-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                <span>Confirm master password</span>
                <input
                  required
                  minLength={12}
                  type="password"
                  autoComplete="new-password"
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-950"
                />
              </label>
            )}
            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
            <p className="text-xs text-zinc-500">
              The master password is not recoverable. If it is lost, encrypted data cannot be restored without a separate backup.
            </p>
            <Button type="submit" disabled={busy} className="w-full">
              {busy ? 'Securing…' : creating ? 'Encrypt and continue' : 'Unlock'}
            </Button>
          </>
        )}
      </form>
    </main>
  );
};
