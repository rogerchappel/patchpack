import test from 'node:test';
import assert from 'node:assert/strict';
import { stableJson } from '../hash.js';

test('stableJson sorts object keys deterministically', () => {
  assert.equal(stableJson({ z: 1, a: { y: 2, b: 3 } }), '{\n  "a": {\n    "b": 3,\n    "y": 2\n  },\n  "z": 1\n}\n');
});
