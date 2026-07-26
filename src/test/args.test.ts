import test from 'node:test';
import assert from 'node:assert/strict';
import { booleanFlag, parseArgs, rejectUnknownFlags, requirePositionals } from '../args.js';

test('booleanFlag accepts only a bare switch', () => {
  assert.equal(booleanFlag(parseArgs(['--write']).flags, 'write'), true);
  assert.equal(booleanFlag(parseArgs([]).flags, 'write'), false);
  assert.throws(
    () => booleanFlag(parseArgs(['--write=false']).flags, 'write'),
    { message: '--write does not take a value', code: 'USAGE' }
  );
  assert.throws(
    () => booleanFlag(parseArgs(['--write', 'false']).flags, 'write'),
    { message: '--write does not take a value', code: 'USAGE' }
  );
});

test('command validation rejects unknown flags and misplaced values', () => {
  assert.throws(
    () => rejectUnknownFlags(parseArgs(['--wirte']).flags, ['write']),
    { message: 'unknown flag: --wirte', code: 'USAGE' }
  );
  assert.throws(
    () => requirePositionals(['apply', 'bundle.ppack', 'extra'], 2, 'patchpack apply <bundle>'),
    { message: 'usage: patchpack apply <bundle>', code: 'USAGE' }
  );
});
