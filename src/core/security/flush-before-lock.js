export async function flushBeforeLock(flush, lock) {
  const persisted = await flush();
  if (!persisted) return false;
  await lock();
  return true;
}

export function canMutateWorkspace(securityStatus) {
  return !['locking', 'locked', 'error'].includes(securityStatus);
}
