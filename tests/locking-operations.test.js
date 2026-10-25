import test from 'node:test';
import assert from 'node:assert/strict';
import { runExportIfUnlocked } from '../src/core/security/export-guard.js';
import { PendingOperations } from '../src/core/security/pending-operations.js';

test('runExportIfUnlocked discards an encrypted export when the workspace locked while encryption ran', async () => {
  let finishEncryption;
  let status = 'unlocked';
  let downloaded = false;
  const operation = runExportIfUnlocked(
    () => new Promise((resolve) => { finishEncryption = resolve; }),
    () => status === 'unlocked',
    () => { downloaded = true; },
  );

  await new Promise((resolve) => setImmediate(resolve));
  status = 'locked';
  finishEncryption('ciphertext');
  assert.equal(await operation, false);
  assert.equal(downloaded, false);
});

test('PendingOperations.close atomically rejects new operations while waiting for existing ones', async () => {
  const pending = new PendingOperations();
  const finish = pending.begin();
  pending.close();
  assert.equal(pending.begin(), null);
  let finished = false;
  const waiting = pending.wait().then(() => { finished = true; });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(finished, false);
  finish();
  await waiting;
  assert.equal(finished, true);
  pending.open();
  assert.equal(typeof pending.begin(), 'function');
});

test('PendingOperations serializes admitted imports so rollbacks cannot overwrite a later import', async () => {
  const pending = new PendingOperations();
  const finishFirst = pending.begin();
  const finishSecond = pending.begin();
  const order = [];
  let releaseFirst;
  const first = pending.run(async () => {
    order.push('first-start');
    await new Promise((resolve) => { releaseFirst = resolve; });
    order.push('first-end');
    finishFirst();
  });
  const second = pending.run(async () => {
    order.push('second-start');
    finishSecond();
  });

  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(order, ['first-start']);
  releaseFirst();
  await Promise.all([first, second]);
  assert.deepEqual(order, ['first-start', 'first-end', 'second-start']);
});
