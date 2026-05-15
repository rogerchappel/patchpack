import test from 'node:test';
import assert from 'node:assert/strict';
import { findSecrets } from '../secrets.js';

test('findSecrets flags added credential-looking lines only', () => {
  assert.equal(findSecrets('+token = "ghp_abcdefghijklmnopqrstuvwxyz"').length, 1);
  assert.equal(findSecrets('-token = "ghp_abcdefghijklmnopqrstuvwxyz"').length, 0);
});
