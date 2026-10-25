import test from 'node:test';
import assert from 'node:assert/strict';
import { flushBeforeLock, canMutateWorkspace } from '../src/core/security/flush-before-lock.js';

test('flushBeforeLock waits for queued persistence before clearing workspace memory', async () => {
  let finishSave;
  let locked = false;
  const operation = flushBeforeLock(
    () => new Promise((resolve) => { finishSave = resolve; }),
    () => { locked = true; },
  );

  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(locked, false);
  finishSave(true);
  assert.equal(await operation, true);
  assert.equal(locked, true);
});

test('flushBeforeLock leaves the workspace unlocked when persistence fails', async () => {
  let locked = false;
  const result = await flushBeforeLock(async () => false, () => { locked = true; });

  assert.equal(result, false);
  assert.equal(locked, false);
});

test('workspace mutations are blocked while locking or locked', () => {
  assert.equal(canMutateWorkspace('unlocked'), true);
  assert.equal(canMutateWorkspace('locking'), false);
  assert.equal(canMutateWorkspace('locked'), false);
  assert.equal(canMutateWorkspace('error'), false);
});
